import { fetchAuto } from '../../deps.ts';
import { Guild } from '../structures/guild.ts';
import { Role } from '../structures/role.ts';
import { GUILD, GUILDS, GUILD_PREVIEW } from '../types/endpoint.ts';
import { BaseManager } from './base.ts';
import { MembersManager } from './members.ts';
import { Emoji } from '../structures/emoji.ts';
export class GuildManager extends BaseManager {
    constructor(client){
        super(client, 'guilds', Guild);
    }
    async fetch(id) {
        return await new Promise((resolve, reject)=>{
            this.client.rest.get(GUILD(id)).then(async (data)=>{
                await this.set(id, data);
                const guild = new Guild(this.client, data);
                if (data.members !== undefined) {
                    const members = new MembersManager(this.client, guild);
                    await members.fromPayload(data.members);
                    guild.members = members;
                }
                resolve(guild);
            }).catch((e)=>reject(e));
        });
    }
    /** Create a new guild based on a template. */ async createFromTemplate(template, name, icon) {
        if (icon?.startsWith('http') === true) icon = await fetchAuto(icon);
        const guild = await this.client.rest.api.guilds.templates[typeof template === 'object' ? template.code : template].post({
            name,
            icon
        });
        return new Guild(this.client, guild);
    }
    /**
   * Creates a guild. Returns Guild. Fires guildCreate event.
   * @param options Options for creating a guild
   */ async create(options) {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (options.icon !== undefined && !options.icon.startsWith('data:')) {
            options.icon = await fetchAuto(options.icon);
        }
        if (options.roles !== undefined && options.roles[0].name !== '@everyone') {
            options.roles.unshift({
                id: Math.floor(Math.random() * 18392375458).toString(),
                name: '@everyone'
            });
        }
        const body = {
            name: options.name,
            region: options.region,
            icon: options.icon,
            verification_level: options.verificationLevel,
            roles: options.roles?.map((obj)=>{
                let result;
                if (obj instanceof Role) {
                    result = {
                        id: obj.id,
                        name: obj.name,
                        color: obj.color,
                        hoist: obj.hoist,
                        position: obj.position,
                        permissions: obj.permissions.bitfield.toString(),
                        managed: obj.managed,
                        mentionable: obj.mentionable
                    };
                } else {
                    result = obj;
                }
                return result;
            }),
            channels: options.channels?.map((obj)=>({
                    id: obj.id,
                    name: obj.name,
                    type: obj.type,
                    parent_id: obj.parentID
                })),
            afk_channel_id: options.afkChannelID,
            afk_timeout: options.afkTimeout,
            system_channel_id: options.systemChannelID
        };
        const result = await this.client.rest.post(GUILDS(), body);
        const guild = new Guild(this.client, result);
        return guild;
    }
    /**
   * Gets a preview of a guild. Returns GuildPreview.
   * @param guildID Guild id
   */ async preview(guildID) {
        const resp = await this.client.rest.get(GUILD_PREVIEW(guildID));
        const result = {
            id: resp.id,
            name: resp.name,
            icon: resp.icon,
            splash: resp.splash,
            discoverySplash: resp.discovery_splash,
            emojis: resp.emojis.map((emoji)=>new Emoji(this.client, emoji)),
            features: resp.features,
            approximateMemberCount: resp.approximate_member_count,
            approximatePresenceCount: resp.approximate_presence_count,
            description: resp.description
        };
        return result;
    }
    /** Sets a value to Cache */ async set(key, value) {
        value = {
            ...value
        };
        // Don't duplicate these in Guild cache as they have separate
        // caches already.
        if ('roles' in value) value.roles = [];
        if ('emojis' in value) value.emojis = [];
        if ('members' in value) value.members = [];
        if ('presences' in value) value.presences = [];
        if ('voice_states' in value) value.voice_states = [];
        if ('threads' in value) value.threads = [];
        if ('channels' in value) value.channels = [];
        if ('stickers' in value) value.stickers = [];
        await this.client.cache.set(this.cacheName, key, value);
    }
    async edit(guild, options, asRaw = false) {
        if (options.icon !== undefined && options.icon !== null && // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        !options.icon.startsWith('data:')) {
            options.icon = await fetchAuto(options.icon);
        }
        if (options.splash !== undefined && options.splash !== null && // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        !options.splash.startsWith('data:')) {
            options.splash = await fetchAuto(options.splash);
        }
        if (options.banner !== undefined && options.banner !== null && // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        !options.banner.startsWith('data:')) {
            options.banner = await fetchAuto(options.banner);
        }
        if (guild instanceof Guild) {
            guild = guild.id;
        }
        const body = {
            name: options.name,
            region: options.region,
            verification_level: options.verificationLevel,
            default_message_notifications: options.defaultMessageNotifications,
            explicit_content_filter: options.explicitContentFilter,
            afk_channel_id: options.afkChannelID,
            afk_timeout: options.afkTimeout,
            owner_id: options.ownerID,
            icon: options.icon,
            splash: options.splash,
            banner: options.banner,
            system_channel_id: options.systemChannelID,
            rules_channel_id: options.rulesChannelID,
            public_updates_channel_id: options.publicUpdatesChannelID,
            preferred_locale: options.preferredLocale
        };
        const result = await this.client.rest.patch(GUILD(guild), body);
        if (asRaw) {
            const guild1 = new Guild(this.client, result);
            return guild1;
        } else {
            return result;
        }
    }
    /**
   * Deletes a guild. Returns deleted guild.
   * @param guild Guild or guild id
   */ async delete(guild) {
        if (guild instanceof Guild) {
            guild = guild.id;
        }
        const oldGuild = await this.get(guild);
        await this.client.rest.delete(GUILD(guild));
        return oldGuild;
    }
    /** Returns number of entries in Members Cache. Returns total of all guilds if guild param is not given */ async memberCacheSize(guild) {
        if (guild === undefined) {
            const guilds = await this.client.cache.keys('guilds') ?? [];
            if (guilds.length === 0) return 0;
            let size = 0;
            for (const id of guilds){
                size += await this.memberCacheSize(id);
            }
            return size;
        }
        const id1 = typeof guild === 'object' ? guild.id : guild;
        return await this.client.cache.size(`members:${id1}`) ?? 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL2d1aWxkcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmZXRjaEF1dG8gfSBmcm9tICcuLi8uLi9kZXBzLnRzJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuaW1wb3J0IHsgR3VpbGQgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2d1aWxkLnRzJ1xuaW1wb3J0IHR5cGUgeyBUZW1wbGF0ZSB9IGZyb20gJy4uL3N0cnVjdHVyZXMvdGVtcGxhdGUudHMnXG5pbXBvcnQgeyBSb2xlIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9yb2xlLnRzJ1xuaW1wb3J0IHsgR1VJTEQsIEdVSUxEUywgR1VJTERfUFJFVklFVyB9IGZyb20gJy4uL3R5cGVzL2VuZHBvaW50LnRzJ1xuaW1wb3J0IHR5cGUge1xuICBHdWlsZFBheWxvYWQsXG4gIE1lbWJlclBheWxvYWQsXG4gIEd1aWxkQ3JlYXRlUm9sZVBheWxvYWQsXG4gIEd1aWxkQ3JlYXRlUGF5bG9hZCxcbiAgR3VpbGRDcmVhdGVDaGFubmVsUGF5bG9hZCxcbiAgR3VpbGRQcmV2aWV3LFxuICBHdWlsZFByZXZpZXdQYXlsb2FkLFxuICBHdWlsZE1vZGlmeU9wdGlvbnMsXG4gIEd1aWxkTW9kaWZ5UGF5bG9hZCxcbiAgR3VpbGRDcmVhdGVPcHRpb25zXG59IGZyb20gJy4uL3R5cGVzL2d1aWxkLnRzJ1xuaW1wb3J0IHsgQmFzZU1hbmFnZXIgfSBmcm9tICcuL2Jhc2UudHMnXG5pbXBvcnQgeyBNZW1iZXJzTWFuYWdlciB9IGZyb20gJy4vbWVtYmVycy50cydcbmltcG9ydCB7IEVtb2ppIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9lbW9qaS50cydcblxuZXhwb3J0IGNsYXNzIEd1aWxkTWFuYWdlciBleHRlbmRzIEJhc2VNYW5hZ2VyPEd1aWxkUGF5bG9hZCwgR3VpbGQ+IHtcbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQpIHtcbiAgICBzdXBlcihjbGllbnQsICdndWlsZHMnLCBHdWlsZClcbiAgfVxuXG4gIGFzeW5jIGZldGNoKGlkOiBzdHJpbmcpOiBQcm9taXNlPEd1aWxkPiB7XG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY2xpZW50LnJlc3RcbiAgICAgICAgLmdldChHVUlMRChpZCkpXG4gICAgICAgIC50aGVuKGFzeW5jIChkYXRhKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zZXQoaWQsIGRhdGEpXG5cbiAgICAgICAgICBjb25zdCBndWlsZCA9IG5ldyBHdWlsZCh0aGlzLmNsaWVudCwgZGF0YSlcblxuICAgICAgICAgIGlmICgoZGF0YSBhcyBHdWlsZFBheWxvYWQpLm1lbWJlcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgY29uc3QgbWVtYmVycyA9IG5ldyBNZW1iZXJzTWFuYWdlcih0aGlzLmNsaWVudCwgZ3VpbGQpXG4gICAgICAgICAgICBhd2FpdCBtZW1iZXJzLmZyb21QYXlsb2FkKFxuICAgICAgICAgICAgICAoZGF0YSBhcyBHdWlsZFBheWxvYWQpLm1lbWJlcnMgYXMgTWVtYmVyUGF5bG9hZFtdXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBndWlsZC5tZW1iZXJzID0gbWVtYmVyc1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc29sdmUoZ3VpbGQpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZSkgPT4gcmVqZWN0KGUpKVxuICAgIH0pXG4gIH1cblxuICAvKiogQ3JlYXRlIGEgbmV3IGd1aWxkIGJhc2VkIG9uIGEgdGVtcGxhdGUuICovXG4gIGFzeW5jIGNyZWF0ZUZyb21UZW1wbGF0ZShcbiAgICB0ZW1wbGF0ZTogVGVtcGxhdGUgfCBzdHJpbmcsXG4gICAgbmFtZTogc3RyaW5nLFxuICAgIGljb24/OiBzdHJpbmdcbiAgKTogUHJvbWlzZTxHdWlsZD4ge1xuICAgIGlmIChpY29uPy5zdGFydHNXaXRoKCdodHRwJykgPT09IHRydWUpIGljb24gPSBhd2FpdCBmZXRjaEF1dG8oaWNvbilcbiAgICBjb25zdCBndWlsZCA9IGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuYXBpLmd1aWxkcy50ZW1wbGF0ZXNbXG4gICAgICB0eXBlb2YgdGVtcGxhdGUgPT09ICdvYmplY3QnID8gdGVtcGxhdGUuY29kZSA6IHRlbXBsYXRlXG4gICAgXS5wb3N0KHsgbmFtZSwgaWNvbiB9KVxuICAgIHJldHVybiBuZXcgR3VpbGQodGhpcy5jbGllbnQsIGd1aWxkKVxuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBndWlsZC4gUmV0dXJucyBHdWlsZC4gRmlyZXMgZ3VpbGRDcmVhdGUgZXZlbnQuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgZm9yIGNyZWF0aW5nIGEgZ3VpbGRcbiAgICovXG4gIGFzeW5jIGNyZWF0ZShvcHRpb25zOiBHdWlsZENyZWF0ZU9wdGlvbnMpOiBQcm9taXNlPEd1aWxkPiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9zdHJpY3QtYm9vbGVhbi1leHByZXNzaW9uc1xuICAgIGlmIChvcHRpb25zLmljb24gIT09IHVuZGVmaW5lZCAmJiAhb3B0aW9ucy5pY29uLnN0YXJ0c1dpdGgoJ2RhdGE6JykpIHtcbiAgICAgIG9wdGlvbnMuaWNvbiA9IGF3YWl0IGZldGNoQXV0byhvcHRpb25zLmljb24pXG4gICAgfVxuICAgIGlmIChvcHRpb25zLnJvbGVzICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5yb2xlc1swXS5uYW1lICE9PSAnQGV2ZXJ5b25lJykge1xuICAgICAgb3B0aW9ucy5yb2xlcy51bnNoaWZ0KHtcbiAgICAgICAgaWQ6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE4MzkyMzc1NDU4KS50b1N0cmluZygpLFxuICAgICAgICBuYW1lOiAnQGV2ZXJ5b25lJ1xuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBib2R5OiBHdWlsZENyZWF0ZVBheWxvYWQgPSB7XG4gICAgICBuYW1lOiBvcHRpb25zLm5hbWUsXG4gICAgICByZWdpb246IG9wdGlvbnMucmVnaW9uLFxuICAgICAgaWNvbjogb3B0aW9ucy5pY29uLFxuICAgICAgdmVyaWZpY2F0aW9uX2xldmVsOiBvcHRpb25zLnZlcmlmaWNhdGlvbkxldmVsLFxuICAgICAgcm9sZXM6IG9wdGlvbnMucm9sZXM/Lm1hcCgob2JqKSA9PiB7XG4gICAgICAgIGxldCByZXN1bHQ6IEd1aWxkQ3JlYXRlUm9sZVBheWxvYWRcbiAgICAgICAgaWYgKG9iaiBpbnN0YW5jZW9mIFJvbGUpIHtcbiAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICBpZDogb2JqLmlkLFxuICAgICAgICAgICAgbmFtZTogb2JqLm5hbWUsXG4gICAgICAgICAgICBjb2xvcjogb2JqLmNvbG9yLFxuICAgICAgICAgICAgaG9pc3Q6IG9iai5ob2lzdCxcbiAgICAgICAgICAgIHBvc2l0aW9uOiBvYmoucG9zaXRpb24sXG4gICAgICAgICAgICBwZXJtaXNzaW9uczogb2JqLnBlcm1pc3Npb25zLmJpdGZpZWxkLnRvU3RyaW5nKCksXG4gICAgICAgICAgICBtYW5hZ2VkOiBvYmoubWFuYWdlZCxcbiAgICAgICAgICAgIG1lbnRpb25hYmxlOiBvYmoubWVudGlvbmFibGVcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmVzdWx0ID0gb2JqXG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVzdWx0XG4gICAgICB9KSxcbiAgICAgIGNoYW5uZWxzOiBvcHRpb25zLmNoYW5uZWxzPy5tYXAoXG4gICAgICAgIChvYmopOiBHdWlsZENyZWF0ZUNoYW5uZWxQYXlsb2FkID0+ICh7XG4gICAgICAgICAgaWQ6IG9iai5pZCxcbiAgICAgICAgICBuYW1lOiBvYmoubmFtZSxcbiAgICAgICAgICB0eXBlOiBvYmoudHlwZSxcbiAgICAgICAgICBwYXJlbnRfaWQ6IG9iai5wYXJlbnRJRFxuICAgICAgICB9KVxuICAgICAgKSxcbiAgICAgIGFma19jaGFubmVsX2lkOiBvcHRpb25zLmFma0NoYW5uZWxJRCxcbiAgICAgIGFma190aW1lb3V0OiBvcHRpb25zLmFma1RpbWVvdXQsXG4gICAgICBzeXN0ZW1fY2hhbm5lbF9pZDogb3B0aW9ucy5zeXN0ZW1DaGFubmVsSURcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQ6IEd1aWxkUGF5bG9hZCA9IGF3YWl0IHRoaXMuY2xpZW50LnJlc3QucG9zdChHVUlMRFMoKSwgYm9keSlcbiAgICBjb25zdCBndWlsZCA9IG5ldyBHdWlsZCh0aGlzLmNsaWVudCwgcmVzdWx0KVxuXG4gICAgcmV0dXJuIGd1aWxkXG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHByZXZpZXcgb2YgYSBndWlsZC4gUmV0dXJucyBHdWlsZFByZXZpZXcuXG4gICAqIEBwYXJhbSBndWlsZElEIEd1aWxkIGlkXG4gICAqL1xuICBhc3luYyBwcmV2aWV3KGd1aWxkSUQ6IHN0cmluZyk6IFByb21pc2U8R3VpbGRQcmV2aWV3PiB7XG4gICAgY29uc3QgcmVzcDogR3VpbGRQcmV2aWV3UGF5bG9hZCA9IGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuZ2V0KFxuICAgICAgR1VJTERfUFJFVklFVyhndWlsZElEKVxuICAgIClcblxuICAgIGNvbnN0IHJlc3VsdDogR3VpbGRQcmV2aWV3ID0ge1xuICAgICAgaWQ6IHJlc3AuaWQsXG4gICAgICBuYW1lOiByZXNwLm5hbWUsXG4gICAgICBpY29uOiByZXNwLmljb24sXG4gICAgICBzcGxhc2g6IHJlc3Auc3BsYXNoLFxuICAgICAgZGlzY292ZXJ5U3BsYXNoOiByZXNwLmRpc2NvdmVyeV9zcGxhc2gsXG4gICAgICBlbW9qaXM6IHJlc3AuZW1vamlzLm1hcCgoZW1vamkpID0+IG5ldyBFbW9qaSh0aGlzLmNsaWVudCwgZW1vamkpKSxcbiAgICAgIGZlYXR1cmVzOiByZXNwLmZlYXR1cmVzLFxuICAgICAgYXBwcm94aW1hdGVNZW1iZXJDb3VudDogcmVzcC5hcHByb3hpbWF0ZV9tZW1iZXJfY291bnQsXG4gICAgICBhcHByb3hpbWF0ZVByZXNlbmNlQ291bnQ6IHJlc3AuYXBwcm94aW1hdGVfcHJlc2VuY2VfY291bnQsXG4gICAgICBkZXNjcmlwdGlvbjogcmVzcC5kZXNjcmlwdGlvblxuICAgIH1cblxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKiBTZXRzIGEgdmFsdWUgdG8gQ2FjaGUgKi9cbiAgYXN5bmMgc2V0KGtleTogc3RyaW5nLCB2YWx1ZTogR3VpbGRQYXlsb2FkKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgdmFsdWUgPSB7IC4uLnZhbHVlIH1cbiAgICAvLyBEb24ndCBkdXBsaWNhdGUgdGhlc2UgaW4gR3VpbGQgY2FjaGUgYXMgdGhleSBoYXZlIHNlcGFyYXRlXG4gICAgLy8gY2FjaGVzIGFscmVhZHkuXG4gICAgaWYgKCdyb2xlcycgaW4gdmFsdWUpIHZhbHVlLnJvbGVzID0gW11cbiAgICBpZiAoJ2Vtb2ppcycgaW4gdmFsdWUpIHZhbHVlLmVtb2ppcyA9IFtdXG4gICAgaWYgKCdtZW1iZXJzJyBpbiB2YWx1ZSkgdmFsdWUubWVtYmVycyA9IFtdXG4gICAgaWYgKCdwcmVzZW5jZXMnIGluIHZhbHVlKSB2YWx1ZS5wcmVzZW5jZXMgPSBbXVxuICAgIGlmICgndm9pY2Vfc3RhdGVzJyBpbiB2YWx1ZSkgdmFsdWUudm9pY2Vfc3RhdGVzID0gW11cbiAgICBpZiAoJ3RocmVhZHMnIGluIHZhbHVlKSB2YWx1ZS50aHJlYWRzID0gW11cbiAgICBpZiAoJ2NoYW5uZWxzJyBpbiB2YWx1ZSkgdmFsdWUuY2hhbm5lbHMgPSBbXVxuICAgIGlmICgnc3RpY2tlcnMnIGluIHZhbHVlKSB2YWx1ZS5zdGlja2VycyA9IFtdXG4gICAgYXdhaXQgdGhpcy5jbGllbnQuY2FjaGUuc2V0KHRoaXMuY2FjaGVOYW1lLCBrZXksIHZhbHVlKVxuICB9XG5cbiAgLyoqXG4gICAqIEVkaXRzIGEgZ3VpbGQuIFJldHVybnMgZWRpdGVkIGd1aWxkLlxuICAgKiBAcGFyYW0gZ3VpbGQgR3VpbGQgb3IgZ3VpbGQgaWRcbiAgICogQHBhcmFtIG9wdGlvbnMgR3VpbGQgZWRpdCBvcHRpb25zXG4gICAqIEBwYXJhbSBhc1JhdyB0cnVlIGZvciBnZXQgcmF3IGRhdGEsIGZhbHNlIGZvciBnZXQgZ3VpbGQoZGVmYXVsdHMgdG8gZmFsc2UpXG4gICAqL1xuICBhc3luYyBlZGl0KFxuICAgIGd1aWxkOiBHdWlsZCB8IHN0cmluZyxcbiAgICBvcHRpb25zOiBHdWlsZE1vZGlmeU9wdGlvbnMsXG4gICAgYXNSYXc6IGZhbHNlXG4gICk6IFByb21pc2U8R3VpbGQ+XG4gIGFzeW5jIGVkaXQoXG4gICAgZ3VpbGQ6IEd1aWxkIHwgc3RyaW5nLFxuICAgIG9wdGlvbnM6IEd1aWxkTW9kaWZ5T3B0aW9ucyxcbiAgICBhc1JhdzogdHJ1ZVxuICApOiBQcm9taXNlPEd1aWxkUGF5bG9hZD5cbiAgYXN5bmMgZWRpdChcbiAgICBndWlsZDogR3VpbGQgfCBzdHJpbmcsXG4gICAgb3B0aW9uczogR3VpbGRNb2RpZnlPcHRpb25zLFxuICAgIGFzUmF3OiBib29sZWFuID0gZmFsc2VcbiAgKTogUHJvbWlzZTxHdWlsZCB8IEd1aWxkUGF5bG9hZD4ge1xuICAgIGlmIChcbiAgICAgIG9wdGlvbnMuaWNvbiAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBvcHRpb25zLmljb24gIT09IG51bGwgJiZcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvc3RyaWN0LWJvb2xlYW4tZXhwcmVzc2lvbnNcbiAgICAgICFvcHRpb25zLmljb24uc3RhcnRzV2l0aCgnZGF0YTonKVxuICAgICkge1xuICAgICAgb3B0aW9ucy5pY29uID0gYXdhaXQgZmV0Y2hBdXRvKG9wdGlvbnMuaWNvbilcbiAgICB9XG4gICAgaWYgKFxuICAgICAgb3B0aW9ucy5zcGxhc2ggIT09IHVuZGVmaW5lZCAmJlxuICAgICAgb3B0aW9ucy5zcGxhc2ggIT09IG51bGwgJiZcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvc3RyaWN0LWJvb2xlYW4tZXhwcmVzc2lvbnNcbiAgICAgICFvcHRpb25zLnNwbGFzaC5zdGFydHNXaXRoKCdkYXRhOicpXG4gICAgKSB7XG4gICAgICBvcHRpb25zLnNwbGFzaCA9IGF3YWl0IGZldGNoQXV0byhvcHRpb25zLnNwbGFzaClcbiAgICB9XG4gICAgaWYgKFxuICAgICAgb3B0aW9ucy5iYW5uZXIgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgb3B0aW9ucy5iYW5uZXIgIT09IG51bGwgJiZcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvc3RyaWN0LWJvb2xlYW4tZXhwcmVzc2lvbnNcbiAgICAgICFvcHRpb25zLmJhbm5lci5zdGFydHNXaXRoKCdkYXRhOicpXG4gICAgKSB7XG4gICAgICBvcHRpb25zLmJhbm5lciA9IGF3YWl0IGZldGNoQXV0byhvcHRpb25zLmJhbm5lcilcbiAgICB9XG4gICAgaWYgKGd1aWxkIGluc3RhbmNlb2YgR3VpbGQpIHtcbiAgICAgIGd1aWxkID0gZ3VpbGQuaWRcbiAgICB9XG5cbiAgICBjb25zdCBib2R5OiBHdWlsZE1vZGlmeVBheWxvYWQgPSB7XG4gICAgICBuYW1lOiBvcHRpb25zLm5hbWUsXG4gICAgICByZWdpb246IG9wdGlvbnMucmVnaW9uLFxuICAgICAgdmVyaWZpY2F0aW9uX2xldmVsOiBvcHRpb25zLnZlcmlmaWNhdGlvbkxldmVsLFxuICAgICAgZGVmYXVsdF9tZXNzYWdlX25vdGlmaWNhdGlvbnM6IG9wdGlvbnMuZGVmYXVsdE1lc3NhZ2VOb3RpZmljYXRpb25zLFxuICAgICAgZXhwbGljaXRfY29udGVudF9maWx0ZXI6IG9wdGlvbnMuZXhwbGljaXRDb250ZW50RmlsdGVyLFxuICAgICAgYWZrX2NoYW5uZWxfaWQ6IG9wdGlvbnMuYWZrQ2hhbm5lbElELFxuICAgICAgYWZrX3RpbWVvdXQ6IG9wdGlvbnMuYWZrVGltZW91dCxcbiAgICAgIG93bmVyX2lkOiBvcHRpb25zLm93bmVySUQsXG4gICAgICBpY29uOiBvcHRpb25zLmljb24sXG4gICAgICBzcGxhc2g6IG9wdGlvbnMuc3BsYXNoLFxuICAgICAgYmFubmVyOiBvcHRpb25zLmJhbm5lcixcbiAgICAgIHN5c3RlbV9jaGFubmVsX2lkOiBvcHRpb25zLnN5c3RlbUNoYW5uZWxJRCxcbiAgICAgIHJ1bGVzX2NoYW5uZWxfaWQ6IG9wdGlvbnMucnVsZXNDaGFubmVsSUQsXG4gICAgICBwdWJsaWNfdXBkYXRlc19jaGFubmVsX2lkOiBvcHRpb25zLnB1YmxpY1VwZGF0ZXNDaGFubmVsSUQsXG4gICAgICBwcmVmZXJyZWRfbG9jYWxlOiBvcHRpb25zLnByZWZlcnJlZExvY2FsZVxuICAgIH1cblxuICAgIGNvbnN0IHJlc3VsdDogR3VpbGRQYXlsb2FkID0gYXdhaXQgdGhpcy5jbGllbnQucmVzdC5wYXRjaChcbiAgICAgIEdVSUxEKGd1aWxkKSxcbiAgICAgIGJvZHlcbiAgICApXG5cbiAgICBpZiAoYXNSYXcpIHtcbiAgICAgIGNvbnN0IGd1aWxkID0gbmV3IEd1aWxkKHRoaXMuY2xpZW50LCByZXN1bHQpXG4gICAgICByZXR1cm4gZ3VpbGRcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHJlc3VsdFxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBEZWxldGVzIGEgZ3VpbGQuIFJldHVybnMgZGVsZXRlZCBndWlsZC5cbiAgICogQHBhcmFtIGd1aWxkIEd1aWxkIG9yIGd1aWxkIGlkXG4gICAqL1xuICBhc3luYyBkZWxldGUoZ3VpbGQ6IEd1aWxkIHwgc3RyaW5nKTogUHJvbWlzZTxHdWlsZCB8IHVuZGVmaW5lZD4ge1xuICAgIGlmIChndWlsZCBpbnN0YW5jZW9mIEd1aWxkKSB7XG4gICAgICBndWlsZCA9IGd1aWxkLmlkXG4gICAgfVxuXG4gICAgY29uc3Qgb2xkR3VpbGQgPSBhd2FpdCB0aGlzLmdldChndWlsZClcblxuICAgIGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuZGVsZXRlKEdVSUxEKGd1aWxkKSlcbiAgICByZXR1cm4gb2xkR3VpbGRcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIG51bWJlciBvZiBlbnRyaWVzIGluIE1lbWJlcnMgQ2FjaGUuIFJldHVybnMgdG90YWwgb2YgYWxsIGd1aWxkcyBpZiBndWlsZCBwYXJhbSBpcyBub3QgZ2l2ZW4gKi9cbiAgYXN5bmMgbWVtYmVyQ2FjaGVTaXplKGd1aWxkPzogc3RyaW5nIHwgR3VpbGQpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGlmIChndWlsZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCBndWlsZHMgPSAoYXdhaXQgdGhpcy5jbGllbnQuY2FjaGUua2V5cygnZ3VpbGRzJykpID8/IFtdXG4gICAgICBpZiAoZ3VpbGRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDBcbiAgICAgIGxldCBzaXplID0gMFxuICAgICAgZm9yIChjb25zdCBpZCBvZiBndWlsZHMpIHtcbiAgICAgICAgc2l6ZSArPSBhd2FpdCB0aGlzLm1lbWJlckNhY2hlU2l6ZShpZClcbiAgICAgIH1cbiAgICAgIHJldHVybiBzaXplXG4gICAgfVxuXG4gICAgY29uc3QgaWQgPSB0eXBlb2YgZ3VpbGQgPT09ICdvYmplY3QnID8gZ3VpbGQuaWQgOiBndWlsZFxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5jbGllbnQuY2FjaGUuc2l6ZShgbWVtYmVyczoke2lkfWApKSA/PyAwXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFNBQVMsUUFBUSxnQkFBZTtBQUV6QyxTQUFTLEtBQUssUUFBUSx5QkFBd0I7QUFFOUMsU0FBUyxJQUFJLFFBQVEsd0JBQXVCO0FBQzVDLFNBQVMsS0FBSyxFQUFFLE1BQU0sRUFBRSxhQUFhLFFBQVEsdUJBQXNCO0FBYW5FLFNBQVMsV0FBVyxRQUFRLFlBQVc7QUFDdkMsU0FBUyxjQUFjLFFBQVEsZUFBYztBQUM3QyxT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