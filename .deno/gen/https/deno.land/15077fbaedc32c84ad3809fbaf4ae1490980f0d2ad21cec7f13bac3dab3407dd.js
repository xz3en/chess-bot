import { Base, SnowflakeBase } from './base.ts';
import { RolesManager } from '../managers/roles.ts';
import { InviteManager } from '../managers/invites.ts';
import { GuildChannelsManager } from '../managers/guildChannels.ts';
import { MembersManager } from '../managers/members.ts';
import { Role } from './role.ts';
import { GuildEmojisManager } from '../managers/guildEmojis.ts';
import { User } from './user.ts';
import { Application } from './application.ts';
import { GUILD_BAN, GUILD_BANNER, GUILD_BANS, GUILD_DISCOVERY_SPLASH, GUILD_ICON, GUILD_INTEGRATIONS, GUILD_PRUNE, GUILD_SPLASH } from '../types/endpoint.ts';
import { GuildVoiceStatesManager } from '../managers/guildVoiceStates.ts';
import { GuildPresencesManager } from '../managers/presences.ts';
import { Template } from './template.ts';
import { DiscordAPIError } from '../rest/mod.ts';
import { ImageURL } from './cdn.ts';
import { toCamelCase } from '../utils/snakeCase.ts';
import { ThreadsManager } from '../managers/threads.ts';
import { GuildStickersManager } from '../managers/guildStickers.ts';
export class GuildBan extends Base {
    guild;
    reason;
    user;
    constructor(client, data, guild){
        super(client, data);
        this.guild = guild;
        this.reason = data.reason === null ? undefined : data.reason;
        this.user = new User(client, data.user);
    }
}
export class GuildBans extends Base {
    guild;
    constructor(client, guild){
        super(client);
        this.guild = guild;
    }
    /**
   * Gets all bans in the Guild.
   */ async all() {
        const res = await this.client.rest.get(GUILD_BANS(this.guild.id));
        if (typeof res !== 'object' || !Array.isArray(res)) throw new Error('Failed to fetch Guild Bans');
        const bans = res.map((ban)=>new GuildBan(this.client, ban, this.guild));
        return bans;
    }
    /**
   * Gets ban details of a User if any.
   * @param user User to get ban of, ID or User object.
   */ async get(user) {
        const res = await this.client.rest.get(GUILD_BAN(this.guild.id, typeof user === 'string' ? user : user.id));
        if (typeof res !== 'object') throw new Error('Failed to fetch Guild Ban');
        return new GuildBan(this.client, res, this.guild);
    }
    /**
   * Bans a User.
   * @param user User to ban, ID or User object.
   * @param reason Reason for the Ban.
   * @param deleteMessagesDays Delete Old Messages? If yes, how much days.
   */ async add(user, reason, deleteMessagesDays) {
        const res = await this.client.rest.put(GUILD_BAN(this.guild.id, typeof user === 'string' ? user : user.id), {
            delete_message_days: deleteMessagesDays
        }, undefined, null, true, {
            reason
        });
        if (res.response.status !== 204) throw new Error('Failed to Add Guild Ban');
    }
    /**
   * Unbans (removes ban from) a User.
   * @param user User to unban, ID or User object.
   * @param reason Reason for the Unban.
   */ async remove(user, reason) {
        await this.client.rest.delete(GUILD_BAN(this.guild.id, typeof user === 'string' ? user : user.id), undefined, undefined, undefined, undefined, {
            reason
        });
        return true;
    }
}
export class Guild extends SnowflakeBase {
    name;
    icon;
    splash;
    discoverySplash;
    owner;
    ownerID;
    permissions;
    region;
    afkChannelID;
    afkTimeout;
    widgetEnabled;
    widgetChannelID;
    verificationLevel;
    defaultMessageNotifications;
    explicitContentFilter;
    roles;
    emojis;
    invites;
    features;
    mfaLevel;
    applicationID;
    systemChannelID;
    systemChannelFlags;
    rulesChannelID;
    joinedAt;
    large;
    unavailable = false;
    memberCount;
    voiceStates;
    members;
    channels;
    presences;
    maxPresences;
    maxMembers;
    vanityURLCode;
    description;
    banner;
    premiumTier;
    premiumSubscriptionCount;
    preferredLocale;
    publicUpdatesChannelID;
    maxVideoChannelUsers;
    approximateNumberCount;
    approximatePresenceCount;
    bans;
    nsfw;
    commands;
    threads;
    stickers;
    /** Get Shard ID of Guild on which it is */ get shardID() {
        return Number((BigInt(this.id) << 22n) % BigInt(this.client.shardCount));
    }
    constructor(client, data){
        super(client, data);
        this.readFromData(data);
        this.bans = new GuildBans(client, this);
        this.members = new MembersManager(this.client, this);
        this.voiceStates = new GuildVoiceStatesManager(client, this);
        this.presences = new GuildPresencesManager(client, this);
        this.channels = new GuildChannelsManager(this.client, this.client.channels, this);
        this.threads = new ThreadsManager(client, this.channels);
        this.roles = new RolesManager(this.client, this);
        this.emojis = new GuildEmojisManager(this.client, this.client.emojis, this);
        this.invites = new InviteManager(this.client, this);
        this.stickers = new GuildStickersManager(this.client, this);
        this.commands = typeof this.client.interactions === 'object' ? this.client.interactions.commands.for(this) : this.client.commands.for(this);
    }
    readFromData(data) {
        this.id = data.id ?? this.id;
        this.unavailable = data.unavailable ?? this.unavailable;
        if (!this.unavailable) {
            this.name = data.name ?? this.name;
            this.icon = data.icon ?? this.icon;
            this.splash = data.splash ?? this.splash;
            this.discoverySplash = data.discovery_splash ?? this.discoverySplash;
            this.owner = data.owner ?? this.owner;
            this.ownerID = data.owner_id ?? this.ownerID;
            this.permissions = data.permissions ?? this.permissions;
            this.region = data.region ?? this.region;
            this.afkTimeout = data.afk_timeout ?? this.afkTimeout;
            this.afkChannelID = data.afk_channel_id ?? this.afkChannelID;
            this.widgetEnabled = data.widget_enabled ?? this.widgetEnabled;
            this.widgetChannelID = data.widget_channel_id ?? this.widgetChannelID;
            this.verificationLevel = data.verification_level ?? this.verificationLevel;
            this.defaultMessageNotifications = data.default_message_notifications ?? this.defaultMessageNotifications;
            this.explicitContentFilter = data.explicit_content_filter ?? this.explicitContentFilter;
            this.features = data.features ?? this.features;
            this.mfaLevel = data.mfa_level ?? this.mfaLevel;
            this.systemChannelID = data.system_channel_id ?? this.systemChannelID;
            this.systemChannelFlags = data.system_channel_flags ?? this.systemChannelFlags;
            this.rulesChannelID = data.rules_channel_id ?? this.rulesChannelID;
            this.joinedAt = data.joined_at ?? this.joinedAt;
            this.large = data.large ?? this.large;
            this.memberCount = data.member_count ?? this.memberCount;
            this.maxPresences = data.max_presences ?? this.maxPresences;
            this.maxMembers = data.max_members ?? this.maxMembers;
            this.vanityURLCode = data.vanity_url_code ?? this.vanityURLCode;
            this.description = data.description ?? this.description;
            this.banner = data.banner ?? this.banner;
            this.premiumTier = data.premium_tier ?? this.premiumTier;
            this.premiumSubscriptionCount = data.premium_subscription_count ?? this.premiumSubscriptionCount;
            this.preferredLocale = data.preferred_locale ?? this.preferredLocale;
            this.publicUpdatesChannelID = data.public_updates_channel_id ?? this.publicUpdatesChannelID;
            this.maxVideoChannelUsers = data.max_video_channel_users ?? this.maxVideoChannelUsers;
            this.approximateNumberCount = data.approximate_number_count ?? this.approximateNumberCount;
            this.approximatePresenceCount = data.approximate_presence_count ?? this.approximatePresenceCount;
            this.nsfw = data.nsfw ?? this.nsfw ?? false;
        }
    }
    /**
   * Gets guild icon URL
   */ iconURL(format = 'png', size = 512) {
        return this.icon != null ? `${ImageURL(GUILD_ICON(this.id, this.icon), format, size)}` : undefined;
    }
    /**
   * Gets guild splash URL
   */ splashURL(format = 'png', size = 512) {
        return this.splash != null ? `${ImageURL(GUILD_SPLASH(this.id, this.splash), format, size)}` : undefined;
    }
    /**
   * Gets guild discover splash URL
   */ discoverSplashURL(format = 'png', size = 512) {
        return this.discoverySplash != null ? `${ImageURL(GUILD_DISCOVERY_SPLASH(this.id, this.discoverySplash), format, size)}` : undefined;
    }
    /**
   * Gets guild banner URL
   */ bannerURL(format = 'png', size = 512) {
        return this.banner != null ? `${ImageURL(GUILD_BANNER(this.id, this.banner), format, size)}` : undefined;
    }
    /**
   * Gets Everyone role of the Guild
   */ async getEveryoneRole() {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return await this.roles.get(this.id);
    }
    /**
   * Gets current client's member in the Guild
   */ async me() {
        const get = await this.members.get(this.client.user?.id);
        if (get === undefined) throw new Error('Guild#me is not cached');
        return get;
    }
    /**
   * Fetches Guild's Integrations (Webhooks, Bots, etc.)
   */ async fetchIntegrations() {
        const raw = await this.client.rest.get(GUILD_INTEGRATIONS(this.id));
        return raw.map((e)=>new GuildIntegration(this.client, e));
    }
    /** Create a new Guild Channel */ async createChannel(options) {
        return this.channels.create(options);
    }
    /** Create a new Guild Role */ async createRole(options) {
        return this.roles.create(options);
    }
    /**
   * Chunks the Guild Members, i.e. cache them.
   * @param options Options regarding the Members Request
   * @param wait Whether to wait for all Members to come before resolving Promise or not.
   * @param timeout Configurable timeout to cancel the wait to safely remove listener.
   */ async chunk(options, wait = false, timeout = 60000) {
        return await new Promise((resolve, reject)=>{
            this.client.shards.get(this.shardID)?.requestMembers(this.id, options);
            if (!wait) return resolve(this);
            else {
                let chunked = false;
                const listener = (guild)=>{
                    if (guild.id === this.id) {
                        chunked = true;
                        this.client.off('guildMembersChunked', listener);
                        resolve(this);
                    }
                };
                this.client.on('guildMembersChunked', listener);
                setTimeout(()=>{
                    if (!chunked) {
                        this.client.off('guildMembersChunked', listener);
                    }
                }, timeout);
            }
        });
    }
    /**
   * Fulfills promise when guild becomes available
   * @param timeout Configurable timeout to cancel the wait to safely remove listener.
   */ async awaitAvailability(timeout = 1000) {
        return await new Promise((resolve, reject)=>{
            if (!this.unavailable) resolve(this);
            const listener = (guild)=>{
                if (guild.id === this.id) {
                    this.client.off('guildLoaded', listener);
                    resolve(this);
                }
            };
            this.client.on('guildLoaded', listener);
            setTimeout(()=>{
                this.client.off('guildLoaded', listener);
                reject(Error("Timeout. Guild didn't arrive in time."));
            }, timeout);
        });
    }
    /** Attach an integration object from the current user to the guild. */ async createIntegration(id, type) {
        await this.client.rest.api.guilds[this.id].integrations.post({
            id,
            type
        });
        return this;
    }
    /** Modify the behavior and settings of an integration object for the guild. */ async editIntegration(id, data) {
        await this.client.rest.api.guilds[this.id].integrations[id].patch({
            expire_behaviour: data.expireBehavior,
            expire_grace_period: data.expireGracePeriod,
            enable_emoticons: data.enableEmoticons
        });
        return this;
    }
    /** Delete the attached integration object for the guild. Deletes any associated webhooks and kicks the associated bot if there is one. */ async deleteIntegration(id) {
        await this.client.rest.api.guilds[this.id].integrations[id].delete();
        return this;
    }
    /** Sync an integration. */ async syncIntegration(id) {
        await this.client.rest.api.guilds[this.id].integrations[id].sync.post();
        return this;
    }
    /** Returns the widget for the guild. */ async getWidget() {
        return this.client.rest.api.guilds[this.id]['widget.json'].get();
    }
    /** Modify a guild widget object for the guild. */ async editWidget(data) {
        await this.client.rest.api.guilds[this.id].widget.patch({
            enabled: data.enabled,
            channel_id: typeof data.channel === 'object' ? data.channel.id : data.channel
        });
        return this;
    }
    /** Returns a partial invite object for guilds with that feature enabled. */ async getVanity() {
        try {
            const value = await this.client.rest.api.guilds[this.id]['vanity-url'].get();
            return value;
        } catch (error) {
            if (error instanceof DiscordAPIError) {
                if (error.error?.code === 50020) {
                    return {
                        code: null,
                        uses: 0
                    };
                }
            }
            throw error;
        }
    }
    /** Returns a PNG (URL) image widget for the guild. */ getWidgetImageURL(style) {
        return `https://discord.com/api/v${this.client.rest.version ?? 8}/guilds/${this.id}/widget.png${style !== undefined ? `?style=${style}` : ''}`;
    }
    /** Leave a Guild. */ async leave() {
        await this.client.rest.api.users['@me'].guilds[this.id].delete();
        return this.client;
    }
    /** Returns an array of template objects. */ async getTemplates() {
        return this.client.rest.api.guilds[this.id].templates.get().then((temps)=>temps.map((temp)=>new Template(this.client, temp)));
    }
    /** Creates a template for the guild. */ async createTemplate(name, description) {
        const payload = await this.client.rest.api.guilds[this.id].templates.post({
            name,
            description
        });
        return new Template(this.client, payload);
    }
    /** Syncs the template to the guild's current state. */ async syncTemplate(code) {
        const payload = await this.client.rest.api.guilds[this.id].templates[code].put();
        return new Template(this.client, payload);
    }
    /** Modifies the template's metadata. */ async editTemplate(code, data) {
        const payload = await this.client.rest.api.guilds[this.id].templates[code].patch({
            name: data.name,
            description: data.description
        });
        return new Template(this.client, payload);
    }
    /** Deletes the template. Requires the MANAGE_GUILD permission. */ async deleteTemplate(code) {
        await this.client.rest.api.guilds[this.id].templates[code].delete();
        return this;
    }
    /** Gets a preview of the guild. Returns GuildPreview. */ async preview() {
        return this.client.guilds.preview(this.id);
    }
    /**
   * Edits the guild.
   * @param options Guild edit options
   */ async edit(options) {
        const result = await this.client.guilds.edit(this.id, options, true);
        this.readFromData(result);
        return new Guild(this.client, result);
    }
    /** Deletes the guild. */ async delete() {
        const result = await this.client.guilds.delete(this.id);
        return result === undefined ? this : result;
    }
    async getPruneCount(options) {
        const query = {
            days: options?.days,
            include_roles: options?.includeRoles?.map((role)=>role instanceof Role ? role.id : role).join(',')
        };
        const result = await this.client.rest.get(// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        GUILD_PRUNE(this.id) + '?' + Object.entries(query).map(([key, value])=>`${key}=${value}`).join('&'));
        return result.pruned;
    }
    async prune(options) {
        const body = {
            days: options?.days,
            compute_prune_count: options?.computePruneCount,
            include_roles: options?.includeRoles?.map((role)=>role instanceof Role ? role.id : role)
        };
        const result = await this.client.rest.post(GUILD_PRUNE(this.id), body);
        return result.pruned;
    }
    async fetchAuditLog(options = {}) {
        if (typeof options.limit === 'number' && (options.limit < 1 || options.limit > 100)) throw new Error('Invalid limit, must be between 1-100');
        const data = await this.client.rest.endpoints.getGuildAuditLog(this.id, {
            userId: typeof options.user === 'object' ? options.user.id : options.user,
            actionType: options.actionType,
            before: options.before,
            limit: options.limit ?? 50
        });
        const ret = {
            webhooks: [],
            users: [],
            entries: [],
            integrations: []
        };
        if ('audit_log_entries' in data) {
            ret.entries = data.audit_log_entries.map(transformAuditLogEntryPayload);
        }
        if ('users' in data) {
            const users = [];
            for (const d of data.users){
                await this.client.users.set(d.id, d);
                users.push(await this.client.users.get(d.id));
            }
            ret.users = users;
        }
        if ('integrations' in data) {
            ret.integrations = data.integrations.map((e)=>new GuildIntegration(this.client, e));
        }
        if ('webhooks' in data) {
            ret.webhooks = data.webhooks;
        }
        return ret;
    }
}
export class GuildIntegration extends Base {
    id;
    name;
    type;
    enabled;
    syncing;
    roleID;
    enableEmoticons;
    expireBehaviour;
    expireGracePeriod;
    user;
    account;
    syncedAt;
    subscriberCount;
    revoked;
    application;
    constructor(client, data){
        super(client, data);
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.enabled = data.enabled;
        this.syncing = data.syncing;
        this.roleID = data.role_id;
        this.enableEmoticons = data.enable_emoticons;
        this.expireBehaviour = data.expire_behaviour;
        this.expireGracePeriod = data.expire_grace_period;
        this.user = data.user !== undefined ? new User(client, data.user) : undefined;
        this.account = data.account;
        this.syncedAt = data.synced_at;
        this.subscriberCount = data.subscriber_count;
        this.revoked = data.revoked;
        this.application = data.application !== undefined ? new Application(client, data.application) : undefined;
    }
}
export function transformAuditLogEntryPayload(d) {
    return toCamelCase(d);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvZ3VpbGQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuaW1wb3J0IHtcbiAgR3VpbGRCYW5QYXlsb2FkLFxuICBHdWlsZEZlYXR1cmVzLFxuICBHdWlsZEludGVncmF0aW9uUGF5bG9hZCxcbiAgR3VpbGRQYXlsb2FkLFxuICBHdWlsZFdpZGdldFBheWxvYWQsXG4gIEludGVncmF0aW9uQWNjb3VudFBheWxvYWQsXG4gIEludGVncmF0aW9uRXhwaXJlQmVoYXZpb3IsXG4gIFZlcmlmaWNhdGlvbixcbiAgR3VpbGRDaGFubmVscyxcbiAgR3VpbGRQcmV2aWV3LFxuICBNZXNzYWdlTm90aWZpY2F0aW9uLFxuICBDb250ZW50RmlsdGVyLFxuICBHdWlsZE1vZGlmeU9wdGlvbnMsXG4gIEd1aWxkR2V0UHJ1bmVDb3VudFBheWxvYWQsXG4gIEd1aWxkUHJ1bmVDb3VudFBheWxvYWQsXG4gIEd1aWxkQmVnaW5QcnVuZVBheWxvYWQsXG4gIEF1ZGl0TG9nLFxuICBBdWRpdExvZ0V2ZW50cyxcbiAgQXVkaXRMb2dFbnRyeVBheWxvYWQsXG4gIEF1ZGl0TG9nRW50cnlcbn0gZnJvbSAnLi4vdHlwZXMvZ3VpbGQudHMnXG5pbXBvcnQgeyBCYXNlLCBTbm93Zmxha2VCYXNlIH0gZnJvbSAnLi9iYXNlLnRzJ1xuaW1wb3J0IHsgQ3JlYXRlR3VpbGRSb2xlT3B0aW9ucywgUm9sZXNNYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlcnMvcm9sZXMudHMnXG5pbXBvcnQgeyBJbnZpdGVNYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlcnMvaW52aXRlcy50cydcbmltcG9ydCB7XG4gIENyZWF0ZUNoYW5uZWxPcHRpb25zLFxuICBHdWlsZENoYW5uZWxzTWFuYWdlclxufSBmcm9tICcuLi9tYW5hZ2Vycy9ndWlsZENoYW5uZWxzLnRzJ1xuaW1wb3J0IHsgTWVtYmVyc01hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2Vycy9tZW1iZXJzLnRzJ1xuaW1wb3J0IHsgUm9sZSB9IGZyb20gJy4vcm9sZS50cydcbmltcG9ydCB7IEd1aWxkRW1vamlzTWFuYWdlciB9IGZyb20gJy4uL21hbmFnZXJzL2d1aWxkRW1vamlzLnRzJ1xuaW1wb3J0IHsgTWVtYmVyIH0gZnJvbSAnLi9tZW1iZXIudHMnXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi91c2VyLnRzJ1xuaW1wb3J0IHsgQXBwbGljYXRpb24gfSBmcm9tICcuL2FwcGxpY2F0aW9uLnRzJ1xuaW1wb3J0IHtcbiAgR1VJTERfQkFOLFxuICBHVUlMRF9CQU5ORVIsXG4gIEdVSUxEX0JBTlMsXG4gIEdVSUxEX0RJU0NPVkVSWV9TUExBU0gsXG4gIEdVSUxEX0lDT04sXG4gIEdVSUxEX0lOVEVHUkFUSU9OUyxcbiAgR1VJTERfUFJVTkUsXG4gIEdVSUxEX1NQTEFTSFxufSBmcm9tICcuLi90eXBlcy9lbmRwb2ludC50cydcbmltcG9ydCB7IEd1aWxkVm9pY2VTdGF0ZXNNYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlcnMvZ3VpbGRWb2ljZVN0YXRlcy50cydcbmltcG9ydCB0eXBlIHsgUmVxdWVzdE1lbWJlcnNPcHRpb25zIH0gZnJvbSAnLi4vZ2F0ZXdheS9tb2QudHMnXG5pbXBvcnQgeyBHdWlsZFByZXNlbmNlc01hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2Vycy9wcmVzZW5jZXMudHMnXG5pbXBvcnQgdHlwZSB7IFRlbXBsYXRlUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzL3RlbXBsYXRlLnRzJ1xuaW1wb3J0IHsgVGVtcGxhdGUgfSBmcm9tICcuL3RlbXBsYXRlLnRzJ1xuaW1wb3J0IHsgRGlzY29yZEFQSUVycm9yIH0gZnJvbSAnLi4vcmVzdC9tb2QudHMnXG5pbXBvcnQgdHlwZSB7IEltYWdlRm9ybWF0cywgSW1hZ2VTaXplIH0gZnJvbSAnLi4vdHlwZXMvY2RuLnRzJ1xuaW1wb3J0IHsgSW1hZ2VVUkwgfSBmcm9tICcuL2Nkbi50cydcbmltcG9ydCB0eXBlIHsgR3VpbGRBcHBsaWNhdGlvbkNvbW1hbmRzTWFuYWdlciB9IGZyb20gJy4uL2ludGVyYWN0aW9ucy9hcHBsaWNhdGlvbkNvbW1hbmQudHMnXG5pbXBvcnQgeyB0b0NhbWVsQ2FzZSB9IGZyb20gJy4uL3V0aWxzL3NuYWtlQ2FzZS50cydcbmltcG9ydCB7IFRocmVhZHNNYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlcnMvdGhyZWFkcy50cydcbmltcG9ydCB7IEd1aWxkU3RpY2tlcnNNYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlcnMvZ3VpbGRTdGlja2Vycy50cydcbmltcG9ydCB0eXBlIHsgSW50ZXJhY3Rpb25zQ2xpZW50IH0gZnJvbSAnLi4vaW50ZXJhY3Rpb25zL2NsaWVudC50cydcblxuZXhwb3J0IGNsYXNzIEd1aWxkQmFuIGV4dGVuZHMgQmFzZSB7XG4gIGd1aWxkOiBHdWlsZFxuICByZWFzb24/OiBzdHJpbmdcbiAgdXNlcjogVXNlclxuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50LCBkYXRhOiBHdWlsZEJhblBheWxvYWQsIGd1aWxkOiBHdWlsZCkge1xuICAgIHN1cGVyKGNsaWVudCwgZGF0YSlcbiAgICB0aGlzLmd1aWxkID0gZ3VpbGRcbiAgICB0aGlzLnJlYXNvbiA9IGRhdGEucmVhc29uID09PSBudWxsID8gdW5kZWZpbmVkIDogZGF0YS5yZWFzb25cbiAgICB0aGlzLnVzZXIgPSBuZXcgVXNlcihjbGllbnQsIGRhdGEudXNlcilcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgR3VpbGRCYW5zIGV4dGVuZHMgQmFzZSB7XG4gIGd1aWxkOiBHdWlsZFxuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50LCBndWlsZDogR3VpbGQpIHtcbiAgICBzdXBlcihjbGllbnQpXG4gICAgdGhpcy5ndWlsZCA9IGd1aWxkXG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhbGwgYmFucyBpbiB0aGUgR3VpbGQuXG4gICAqL1xuICBhc3luYyBhbGwoKTogUHJvbWlzZTxHdWlsZEJhbltdPiB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5jbGllbnQucmVzdC5nZXQoR1VJTERfQkFOUyh0aGlzLmd1aWxkLmlkKSlcbiAgICBpZiAodHlwZW9mIHJlcyAhPT0gJ29iamVjdCcgfHwgIUFycmF5LmlzQXJyYXkocmVzKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGZldGNoIEd1aWxkIEJhbnMnKVxuXG4gICAgY29uc3QgYmFucyA9IChyZXMgYXMgR3VpbGRCYW5QYXlsb2FkW10pLm1hcChcbiAgICAgIChiYW4pID0+IG5ldyBHdWlsZEJhbih0aGlzLmNsaWVudCwgYmFuLCB0aGlzLmd1aWxkKVxuICAgIClcbiAgICByZXR1cm4gYmFuc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYmFuIGRldGFpbHMgb2YgYSBVc2VyIGlmIGFueS5cbiAgICogQHBhcmFtIHVzZXIgVXNlciB0byBnZXQgYmFuIG9mLCBJRCBvciBVc2VyIG9iamVjdC5cbiAgICovXG4gIGFzeW5jIGdldCh1c2VyOiBzdHJpbmcgfCBVc2VyKTogUHJvbWlzZTxHdWlsZEJhbj4ge1xuICAgIGNvbnN0IHJlcyA9IGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuZ2V0KFxuICAgICAgR1VJTERfQkFOKHRoaXMuZ3VpbGQuaWQsIHR5cGVvZiB1c2VyID09PSAnc3RyaW5nJyA/IHVzZXIgOiB1c2VyLmlkKVxuICAgIClcbiAgICBpZiAodHlwZW9mIHJlcyAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGZldGNoIEd1aWxkIEJhbicpXG4gICAgcmV0dXJuIG5ldyBHdWlsZEJhbih0aGlzLmNsaWVudCwgcmVzLCB0aGlzLmd1aWxkKVxuICB9XG5cbiAgLyoqXG4gICAqIEJhbnMgYSBVc2VyLlxuICAgKiBAcGFyYW0gdXNlciBVc2VyIHRvIGJhbiwgSUQgb3IgVXNlciBvYmplY3QuXG4gICAqIEBwYXJhbSByZWFzb24gUmVhc29uIGZvciB0aGUgQmFuLlxuICAgKiBAcGFyYW0gZGVsZXRlTWVzc2FnZXNEYXlzIERlbGV0ZSBPbGQgTWVzc2FnZXM/IElmIHllcywgaG93IG11Y2ggZGF5cy5cbiAgICovXG4gIGFzeW5jIGFkZChcbiAgICB1c2VyOiBzdHJpbmcgfCBVc2VyLFxuICAgIHJlYXNvbj86IHN0cmluZyxcbiAgICBkZWxldGVNZXNzYWdlc0RheXM/OiBudW1iZXJcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgcmVzID0gYXdhaXQgdGhpcy5jbGllbnQucmVzdC5wdXQoXG4gICAgICBHVUlMRF9CQU4odGhpcy5ndWlsZC5pZCwgdHlwZW9mIHVzZXIgPT09ICdzdHJpbmcnID8gdXNlciA6IHVzZXIuaWQpLFxuICAgICAge1xuICAgICAgICBkZWxldGVfbWVzc2FnZV9kYXlzOiBkZWxldGVNZXNzYWdlc0RheXNcbiAgICAgIH0sXG4gICAgICB1bmRlZmluZWQsXG4gICAgICBudWxsLFxuICAgICAgdHJ1ZSxcbiAgICAgIHsgcmVhc29uIH1cbiAgICApXG4gICAgaWYgKHJlcy5yZXNwb25zZS5zdGF0dXMgIT09IDIwNCkgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gQWRkIEd1aWxkIEJhbicpXG4gIH1cblxuICAvKipcbiAgICogVW5iYW5zIChyZW1vdmVzIGJhbiBmcm9tKSBhIFVzZXIuXG4gICAqIEBwYXJhbSB1c2VyIFVzZXIgdG8gdW5iYW4sIElEIG9yIFVzZXIgb2JqZWN0LlxuICAgKiBAcGFyYW0gcmVhc29uIFJlYXNvbiBmb3IgdGhlIFVuYmFuLlxuICAgKi9cbiAgYXN5bmMgcmVtb3ZlKHVzZXI6IHN0cmluZyB8IFVzZXIsIHJlYXNvbj86IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuZGVsZXRlKFxuICAgICAgR1VJTERfQkFOKHRoaXMuZ3VpbGQuaWQsIHR5cGVvZiB1c2VyID09PSAnc3RyaW5nJyA/IHVzZXIgOiB1c2VyLmlkKSxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHsgcmVhc29uIH1cbiAgICApXG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBHdWlsZCBleHRlbmRzIFNub3dmbGFrZUJhc2Uge1xuICBuYW1lPzogc3RyaW5nXG4gIGljb24/OiBzdHJpbmdcbiAgc3BsYXNoPzogc3RyaW5nXG4gIGRpc2NvdmVyeVNwbGFzaD86IHN0cmluZ1xuICBvd25lcj86IGJvb2xlYW5cbiAgb3duZXJJRD86IHN0cmluZ1xuICBwZXJtaXNzaW9ucz86IHN0cmluZ1xuICByZWdpb24/OiBzdHJpbmdcbiAgYWZrQ2hhbm5lbElEPzogc3RyaW5nXG4gIGFma1RpbWVvdXQ/OiBudW1iZXJcbiAgd2lkZ2V0RW5hYmxlZD86IGJvb2xlYW5cbiAgd2lkZ2V0Q2hhbm5lbElEPzogc3RyaW5nXG4gIHZlcmlmaWNhdGlvbkxldmVsPzogVmVyaWZpY2F0aW9uXG4gIGRlZmF1bHRNZXNzYWdlTm90aWZpY2F0aW9ucz86IE1lc3NhZ2VOb3RpZmljYXRpb25cbiAgZXhwbGljaXRDb250ZW50RmlsdGVyPzogQ29udGVudEZpbHRlclxuICByb2xlczogUm9sZXNNYW5hZ2VyXG4gIGVtb2ppczogR3VpbGRFbW9qaXNNYW5hZ2VyXG4gIGludml0ZXM6IEludml0ZU1hbmFnZXJcbiAgZmVhdHVyZXM/OiBHdWlsZEZlYXR1cmVzW11cbiAgbWZhTGV2ZWw/OiBzdHJpbmdcbiAgYXBwbGljYXRpb25JRD86IHN0cmluZ1xuICBzeXN0ZW1DaGFubmVsSUQ/OiBzdHJpbmdcbiAgc3lzdGVtQ2hhbm5lbEZsYWdzPzogc3RyaW5nXG4gIHJ1bGVzQ2hhbm5lbElEPzogc3RyaW5nXG4gIGpvaW5lZEF0Pzogc3RyaW5nXG4gIGxhcmdlPzogYm9vbGVhblxuICB1bmF2YWlsYWJsZSA9IGZhbHNlXG4gIG1lbWJlckNvdW50PzogbnVtYmVyXG4gIHZvaWNlU3RhdGVzOiBHdWlsZFZvaWNlU3RhdGVzTWFuYWdlclxuICBtZW1iZXJzOiBNZW1iZXJzTWFuYWdlclxuICBjaGFubmVsczogR3VpbGRDaGFubmVsc01hbmFnZXJcbiAgcHJlc2VuY2VzOiBHdWlsZFByZXNlbmNlc01hbmFnZXJcbiAgbWF4UHJlc2VuY2VzPzogbnVtYmVyXG4gIG1heE1lbWJlcnM/OiBudW1iZXJcbiAgdmFuaXR5VVJMQ29kZT86IHN0cmluZ1xuICBkZXNjcmlwdGlvbj86IHN0cmluZ1xuICBiYW5uZXI/OiBzdHJpbmdcbiAgcHJlbWl1bVRpZXI/OiBudW1iZXJcbiAgcHJlbWl1bVN1YnNjcmlwdGlvbkNvdW50PzogbnVtYmVyXG4gIHByZWZlcnJlZExvY2FsZT86IHN0cmluZ1xuICBwdWJsaWNVcGRhdGVzQ2hhbm5lbElEPzogc3RyaW5nXG4gIG1heFZpZGVvQ2hhbm5lbFVzZXJzPzogbnVtYmVyXG4gIGFwcHJveGltYXRlTnVtYmVyQ291bnQ/OiBudW1iZXJcbiAgYXBwcm94aW1hdGVQcmVzZW5jZUNvdW50PzogbnVtYmVyXG4gIGJhbnM6IEd1aWxkQmFuc1xuICBuc2Z3PzogYm9vbGVhblxuICBjb21tYW5kczogR3VpbGRBcHBsaWNhdGlvbkNvbW1hbmRzTWFuYWdlclxuICB0aHJlYWRzOiBUaHJlYWRzTWFuYWdlclxuICBzdGlja2VyczogR3VpbGRTdGlja2Vyc01hbmFnZXJcblxuICAvKiogR2V0IFNoYXJkIElEIG9mIEd1aWxkIG9uIHdoaWNoIGl0IGlzICovXG4gIGdldCBzaGFyZElEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIE51bWJlcigoQmlnSW50KHRoaXMuaWQpIDw8IDIybikgJSBCaWdJbnQodGhpcy5jbGllbnQuc2hhcmRDb3VudCkpXG4gIH1cblxuICBjb25zdHJ1Y3RvcihjbGllbnQ6IENsaWVudCwgZGF0YTogR3VpbGRQYXlsb2FkKSB7XG4gICAgc3VwZXIoY2xpZW50LCBkYXRhKVxuXG4gICAgdGhpcy5yZWFkRnJvbURhdGEoZGF0YSlcblxuICAgIHRoaXMuYmFucyA9IG5ldyBHdWlsZEJhbnMoY2xpZW50LCB0aGlzKVxuICAgIHRoaXMubWVtYmVycyA9IG5ldyBNZW1iZXJzTWFuYWdlcih0aGlzLmNsaWVudCwgdGhpcylcbiAgICB0aGlzLnZvaWNlU3RhdGVzID0gbmV3IEd1aWxkVm9pY2VTdGF0ZXNNYW5hZ2VyKGNsaWVudCwgdGhpcylcbiAgICB0aGlzLnByZXNlbmNlcyA9IG5ldyBHdWlsZFByZXNlbmNlc01hbmFnZXIoY2xpZW50LCB0aGlzKVxuICAgIHRoaXMuY2hhbm5lbHMgPSBuZXcgR3VpbGRDaGFubmVsc01hbmFnZXIoXG4gICAgICB0aGlzLmNsaWVudCxcbiAgICAgIHRoaXMuY2xpZW50LmNoYW5uZWxzLFxuICAgICAgdGhpc1xuICAgIClcbiAgICB0aGlzLnRocmVhZHMgPSBuZXcgVGhyZWFkc01hbmFnZXIoY2xpZW50LCB0aGlzLmNoYW5uZWxzKVxuICAgIHRoaXMucm9sZXMgPSBuZXcgUm9sZXNNYW5hZ2VyKHRoaXMuY2xpZW50LCB0aGlzKVxuICAgIHRoaXMuZW1vamlzID0gbmV3IEd1aWxkRW1vamlzTWFuYWdlcih0aGlzLmNsaWVudCwgdGhpcy5jbGllbnQuZW1vamlzLCB0aGlzKVxuICAgIHRoaXMuaW52aXRlcyA9IG5ldyBJbnZpdGVNYW5hZ2VyKHRoaXMuY2xpZW50LCB0aGlzKVxuICAgIHRoaXMuc3RpY2tlcnMgPSBuZXcgR3VpbGRTdGlja2Vyc01hbmFnZXIodGhpcy5jbGllbnQsIHRoaXMpXG4gICAgdGhpcy5jb21tYW5kcyA9XG4gICAgICB0eXBlb2YgdGhpcy5jbGllbnQuaW50ZXJhY3Rpb25zID09PSAnb2JqZWN0J1xuICAgICAgICA/IHRoaXMuY2xpZW50LmludGVyYWN0aW9ucy5jb21tYW5kcy5mb3IodGhpcylcbiAgICAgICAgOiAodGhpcy5jbGllbnQgYXMgdW5rbm93biBhcyBJbnRlcmFjdGlvbnNDbGllbnQpLmNvbW1hbmRzLmZvcih0aGlzKVxuICB9XG5cbiAgcmVhZEZyb21EYXRhKGRhdGE6IEd1aWxkUGF5bG9hZCk6IHZvaWQge1xuICAgIHRoaXMuaWQgPSBkYXRhLmlkID8/IHRoaXMuaWRcbiAgICB0aGlzLnVuYXZhaWxhYmxlID0gZGF0YS51bmF2YWlsYWJsZSA/PyB0aGlzLnVuYXZhaWxhYmxlXG5cbiAgICBpZiAoIXRoaXMudW5hdmFpbGFibGUpIHtcbiAgICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZSA/PyB0aGlzLm5hbWVcbiAgICAgIHRoaXMuaWNvbiA9IGRhdGEuaWNvbiA/PyB0aGlzLmljb25cbiAgICAgIHRoaXMuc3BsYXNoID0gZGF0YS5zcGxhc2ggPz8gdGhpcy5zcGxhc2hcbiAgICAgIHRoaXMuZGlzY292ZXJ5U3BsYXNoID0gZGF0YS5kaXNjb3Zlcnlfc3BsYXNoID8/IHRoaXMuZGlzY292ZXJ5U3BsYXNoXG4gICAgICB0aGlzLm93bmVyID0gZGF0YS5vd25lciA/PyB0aGlzLm93bmVyXG4gICAgICB0aGlzLm93bmVySUQgPSBkYXRhLm93bmVyX2lkID8/IHRoaXMub3duZXJJRFxuICAgICAgdGhpcy5wZXJtaXNzaW9ucyA9IGRhdGEucGVybWlzc2lvbnMgPz8gdGhpcy5wZXJtaXNzaW9uc1xuICAgICAgdGhpcy5yZWdpb24gPSBkYXRhLnJlZ2lvbiA/PyB0aGlzLnJlZ2lvblxuICAgICAgdGhpcy5hZmtUaW1lb3V0ID0gZGF0YS5hZmtfdGltZW91dCA/PyB0aGlzLmFma1RpbWVvdXRcbiAgICAgIHRoaXMuYWZrQ2hhbm5lbElEID0gZGF0YS5hZmtfY2hhbm5lbF9pZCA/PyB0aGlzLmFma0NoYW5uZWxJRFxuICAgICAgdGhpcy53aWRnZXRFbmFibGVkID0gZGF0YS53aWRnZXRfZW5hYmxlZCA/PyB0aGlzLndpZGdldEVuYWJsZWRcbiAgICAgIHRoaXMud2lkZ2V0Q2hhbm5lbElEID0gZGF0YS53aWRnZXRfY2hhbm5lbF9pZCA/PyB0aGlzLndpZGdldENoYW5uZWxJRFxuICAgICAgdGhpcy52ZXJpZmljYXRpb25MZXZlbCA9IGRhdGEudmVyaWZpY2F0aW9uX2xldmVsID8/IHRoaXMudmVyaWZpY2F0aW9uTGV2ZWxcbiAgICAgIHRoaXMuZGVmYXVsdE1lc3NhZ2VOb3RpZmljYXRpb25zID1cbiAgICAgICAgZGF0YS5kZWZhdWx0X21lc3NhZ2Vfbm90aWZpY2F0aW9ucyA/PyB0aGlzLmRlZmF1bHRNZXNzYWdlTm90aWZpY2F0aW9uc1xuICAgICAgdGhpcy5leHBsaWNpdENvbnRlbnRGaWx0ZXIgPVxuICAgICAgICBkYXRhLmV4cGxpY2l0X2NvbnRlbnRfZmlsdGVyID8/IHRoaXMuZXhwbGljaXRDb250ZW50RmlsdGVyXG4gICAgICB0aGlzLmZlYXR1cmVzID0gZGF0YS5mZWF0dXJlcyA/PyB0aGlzLmZlYXR1cmVzXG4gICAgICB0aGlzLm1mYUxldmVsID0gZGF0YS5tZmFfbGV2ZWwgPz8gdGhpcy5tZmFMZXZlbFxuICAgICAgdGhpcy5zeXN0ZW1DaGFubmVsSUQgPSBkYXRhLnN5c3RlbV9jaGFubmVsX2lkID8/IHRoaXMuc3lzdGVtQ2hhbm5lbElEXG4gICAgICB0aGlzLnN5c3RlbUNoYW5uZWxGbGFncyA9XG4gICAgICAgIGRhdGEuc3lzdGVtX2NoYW5uZWxfZmxhZ3MgPz8gdGhpcy5zeXN0ZW1DaGFubmVsRmxhZ3NcbiAgICAgIHRoaXMucnVsZXNDaGFubmVsSUQgPSBkYXRhLnJ1bGVzX2NoYW5uZWxfaWQgPz8gdGhpcy5ydWxlc0NoYW5uZWxJRFxuICAgICAgdGhpcy5qb2luZWRBdCA9IGRhdGEuam9pbmVkX2F0ID8/IHRoaXMuam9pbmVkQXRcbiAgICAgIHRoaXMubGFyZ2UgPSBkYXRhLmxhcmdlID8/IHRoaXMubGFyZ2VcbiAgICAgIHRoaXMubWVtYmVyQ291bnQgPSBkYXRhLm1lbWJlcl9jb3VudCA/PyB0aGlzLm1lbWJlckNvdW50XG4gICAgICB0aGlzLm1heFByZXNlbmNlcyA9IGRhdGEubWF4X3ByZXNlbmNlcyA/PyB0aGlzLm1heFByZXNlbmNlc1xuICAgICAgdGhpcy5tYXhNZW1iZXJzID0gZGF0YS5tYXhfbWVtYmVycyA/PyB0aGlzLm1heE1lbWJlcnNcbiAgICAgIHRoaXMudmFuaXR5VVJMQ29kZSA9IGRhdGEudmFuaXR5X3VybF9jb2RlID8/IHRoaXMudmFuaXR5VVJMQ29kZVxuICAgICAgdGhpcy5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb24gPz8gdGhpcy5kZXNjcmlwdGlvblxuICAgICAgdGhpcy5iYW5uZXIgPSBkYXRhLmJhbm5lciA/PyB0aGlzLmJhbm5lclxuICAgICAgdGhpcy5wcmVtaXVtVGllciA9IGRhdGEucHJlbWl1bV90aWVyID8/IHRoaXMucHJlbWl1bVRpZXJcbiAgICAgIHRoaXMucHJlbWl1bVN1YnNjcmlwdGlvbkNvdW50ID1cbiAgICAgICAgZGF0YS5wcmVtaXVtX3N1YnNjcmlwdGlvbl9jb3VudCA/PyB0aGlzLnByZW1pdW1TdWJzY3JpcHRpb25Db3VudFxuICAgICAgdGhpcy5wcmVmZXJyZWRMb2NhbGUgPSBkYXRhLnByZWZlcnJlZF9sb2NhbGUgPz8gdGhpcy5wcmVmZXJyZWRMb2NhbGVcbiAgICAgIHRoaXMucHVibGljVXBkYXRlc0NoYW5uZWxJRCA9XG4gICAgICAgIGRhdGEucHVibGljX3VwZGF0ZXNfY2hhbm5lbF9pZCA/PyB0aGlzLnB1YmxpY1VwZGF0ZXNDaGFubmVsSURcbiAgICAgIHRoaXMubWF4VmlkZW9DaGFubmVsVXNlcnMgPVxuICAgICAgICBkYXRhLm1heF92aWRlb19jaGFubmVsX3VzZXJzID8/IHRoaXMubWF4VmlkZW9DaGFubmVsVXNlcnNcbiAgICAgIHRoaXMuYXBwcm94aW1hdGVOdW1iZXJDb3VudCA9XG4gICAgICAgIGRhdGEuYXBwcm94aW1hdGVfbnVtYmVyX2NvdW50ID8/IHRoaXMuYXBwcm94aW1hdGVOdW1iZXJDb3VudFxuICAgICAgdGhpcy5hcHByb3hpbWF0ZVByZXNlbmNlQ291bnQgPVxuICAgICAgICBkYXRhLmFwcHJveGltYXRlX3ByZXNlbmNlX2NvdW50ID8/IHRoaXMuYXBwcm94aW1hdGVQcmVzZW5jZUNvdW50XG4gICAgICB0aGlzLm5zZncgPSBkYXRhLm5zZncgPz8gdGhpcy5uc2Z3ID8/IGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgZ3VpbGQgaWNvbiBVUkxcbiAgICovXG4gIGljb25VUkwoXG4gICAgZm9ybWF0OiBJbWFnZUZvcm1hdHMgPSAncG5nJyxcbiAgICBzaXplOiBJbWFnZVNpemUgPSA1MTJcbiAgKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5pY29uICE9IG51bGxcbiAgICAgID8gYCR7SW1hZ2VVUkwoR1VJTERfSUNPTih0aGlzLmlkLCB0aGlzLmljb24pLCBmb3JtYXQsIHNpemUpfWBcbiAgICAgIDogdW5kZWZpbmVkXG4gIH1cblxuICAvKipcbiAgICogR2V0cyBndWlsZCBzcGxhc2ggVVJMXG4gICAqL1xuICBzcGxhc2hVUkwoXG4gICAgZm9ybWF0OiBJbWFnZUZvcm1hdHMgPSAncG5nJyxcbiAgICBzaXplOiBJbWFnZVNpemUgPSA1MTJcbiAgKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5zcGxhc2ggIT0gbnVsbFxuICAgICAgPyBgJHtJbWFnZVVSTChHVUlMRF9TUExBU0godGhpcy5pZCwgdGhpcy5zcGxhc2gpLCBmb3JtYXQsIHNpemUpfWBcbiAgICAgIDogdW5kZWZpbmVkXG4gIH1cblxuICAvKipcbiAgICogR2V0cyBndWlsZCBkaXNjb3ZlciBzcGxhc2ggVVJMXG4gICAqL1xuICBkaXNjb3ZlclNwbGFzaFVSTChcbiAgICBmb3JtYXQ6IEltYWdlRm9ybWF0cyA9ICdwbmcnLFxuICAgIHNpemU6IEltYWdlU2l6ZSA9IDUxMlxuICApOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmRpc2NvdmVyeVNwbGFzaCAhPSBudWxsXG4gICAgICA/IGAke0ltYWdlVVJMKFxuICAgICAgICAgIEdVSUxEX0RJU0NPVkVSWV9TUExBU0godGhpcy5pZCwgdGhpcy5kaXNjb3ZlcnlTcGxhc2gpLFxuICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICBzaXplXG4gICAgICAgICl9YFxuICAgICAgOiB1bmRlZmluZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGd1aWxkIGJhbm5lciBVUkxcbiAgICovXG4gIGJhbm5lclVSTChcbiAgICBmb3JtYXQ6IEltYWdlRm9ybWF0cyA9ICdwbmcnLFxuICAgIHNpemU6IEltYWdlU2l6ZSA9IDUxMlxuICApOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmJhbm5lciAhPSBudWxsXG4gICAgICA/IGAke0ltYWdlVVJMKEdVSUxEX0JBTk5FUih0aGlzLmlkLCB0aGlzLmJhbm5lciksIGZvcm1hdCwgc2l6ZSl9YFxuICAgICAgOiB1bmRlZmluZWRcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIEV2ZXJ5b25lIHJvbGUgb2YgdGhlIEd1aWxkXG4gICAqL1xuICBhc3luYyBnZXRFdmVyeW9uZVJvbGUoKTogUHJvbWlzZTxSb2xlPiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS10eXBlLWFzc2VydGlvblxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5yb2xlcy5nZXQodGhpcy5pZCkpIGFzIFJvbGVcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGN1cnJlbnQgY2xpZW50J3MgbWVtYmVyIGluIHRoZSBHdWlsZFxuICAgKi9cbiAgYXN5bmMgbWUoKTogUHJvbWlzZTxNZW1iZXI+IHtcbiAgICBjb25zdCBnZXQgPSBhd2FpdCB0aGlzLm1lbWJlcnMuZ2V0KHRoaXMuY2xpZW50LnVzZXI/LmlkIGFzIHN0cmluZylcbiAgICBpZiAoZ2V0ID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignR3VpbGQjbWUgaXMgbm90IGNhY2hlZCcpXG4gICAgcmV0dXJuIGdldFxuICB9XG5cbiAgLyoqXG4gICAqIEZldGNoZXMgR3VpbGQncyBJbnRlZ3JhdGlvbnMgKFdlYmhvb2tzLCBCb3RzLCBldGMuKVxuICAgKi9cbiAgYXN5bmMgZmV0Y2hJbnRlZ3JhdGlvbnMoKTogUHJvbWlzZTxHdWlsZEludGVncmF0aW9uW10+IHtcbiAgICBjb25zdCByYXcgPSAoYXdhaXQgdGhpcy5jbGllbnQucmVzdC5nZXQoXG4gICAgICBHVUlMRF9JTlRFR1JBVElPTlModGhpcy5pZClcbiAgICApKSBhcyBHdWlsZEludGVncmF0aW9uUGF5bG9hZFtdXG4gICAgcmV0dXJuIHJhdy5tYXAoKGUpID0+IG5ldyBHdWlsZEludGVncmF0aW9uKHRoaXMuY2xpZW50LCBlKSlcbiAgfVxuXG4gIC8qKiBDcmVhdGUgYSBuZXcgR3VpbGQgQ2hhbm5lbCAqL1xuICBhc3luYyBjcmVhdGVDaGFubmVsKG9wdGlvbnM6IENyZWF0ZUNoYW5uZWxPcHRpb25zKTogUHJvbWlzZTxHdWlsZENoYW5uZWxzPiB7XG4gICAgcmV0dXJuIHRoaXMuY2hhbm5lbHMuY3JlYXRlKG9wdGlvbnMpXG4gIH1cblxuICAvKiogQ3JlYXRlIGEgbmV3IEd1aWxkIFJvbGUgKi9cbiAgYXN5bmMgY3JlYXRlUm9sZShvcHRpb25zPzogQ3JlYXRlR3VpbGRSb2xlT3B0aW9ucyk6IFByb21pc2U8Um9sZT4ge1xuICAgIHJldHVybiB0aGlzLnJvbGVzLmNyZWF0ZShvcHRpb25zKVxuICB9XG5cbiAgLyoqXG4gICAqIENodW5rcyB0aGUgR3VpbGQgTWVtYmVycywgaS5lLiBjYWNoZSB0aGVtLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHJlZ2FyZGluZyB0aGUgTWVtYmVycyBSZXF1ZXN0XG4gICAqIEBwYXJhbSB3YWl0IFdoZXRoZXIgdG8gd2FpdCBmb3IgYWxsIE1lbWJlcnMgdG8gY29tZSBiZWZvcmUgcmVzb2x2aW5nIFByb21pc2Ugb3Igbm90LlxuICAgKiBAcGFyYW0gdGltZW91dCBDb25maWd1cmFibGUgdGltZW91dCB0byBjYW5jZWwgdGhlIHdhaXQgdG8gc2FmZWx5IHJlbW92ZSBsaXN0ZW5lci5cbiAgICovXG4gIGFzeW5jIGNodW5rKFxuICAgIG9wdGlvbnM6IFJlcXVlc3RNZW1iZXJzT3B0aW9ucyxcbiAgICB3YWl0OiBib29sZWFuID0gZmFsc2UsXG4gICAgdGltZW91dDogbnVtYmVyID0gNjAwMDBcbiAgKTogUHJvbWlzZTxHdWlsZD4ge1xuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmNsaWVudC5zaGFyZHMuZ2V0KHRoaXMuc2hhcmRJRCk/LnJlcXVlc3RNZW1iZXJzKHRoaXMuaWQsIG9wdGlvbnMpXG4gICAgICBpZiAoIXdhaXQpIHJldHVybiByZXNvbHZlKHRoaXMpXG4gICAgICBlbHNlIHtcbiAgICAgICAgbGV0IGNodW5rZWQgPSBmYWxzZVxuICAgICAgICBjb25zdCBsaXN0ZW5lciA9IChndWlsZDogR3VpbGQpOiB2b2lkID0+IHtcbiAgICAgICAgICBpZiAoZ3VpbGQuaWQgPT09IHRoaXMuaWQpIHtcbiAgICAgICAgICAgIGNodW5rZWQgPSB0cnVlXG4gICAgICAgICAgICB0aGlzLmNsaWVudC5vZmYoJ2d1aWxkTWVtYmVyc0NodW5rZWQnLCBsaXN0ZW5lcilcbiAgICAgICAgICAgIHJlc29sdmUodGhpcylcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jbGllbnQub24oJ2d1aWxkTWVtYmVyc0NodW5rZWQnLCBsaXN0ZW5lcilcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaWYgKCFjaHVua2VkKSB7XG4gICAgICAgICAgICB0aGlzLmNsaWVudC5vZmYoJ2d1aWxkTWVtYmVyc0NodW5rZWQnLCBsaXN0ZW5lcilcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRpbWVvdXQpXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKlxuICAgKiBGdWxmaWxscyBwcm9taXNlIHdoZW4gZ3VpbGQgYmVjb21lcyBhdmFpbGFibGVcbiAgICogQHBhcmFtIHRpbWVvdXQgQ29uZmlndXJhYmxlIHRpbWVvdXQgdG8gY2FuY2VsIHRoZSB3YWl0IHRvIHNhZmVseSByZW1vdmUgbGlzdGVuZXIuXG4gICAqL1xuICBhc3luYyBhd2FpdEF2YWlsYWJpbGl0eSh0aW1lb3V0OiBudW1iZXIgPSAxMDAwKTogUHJvbWlzZTxHdWlsZD4ge1xuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBpZiAoIXRoaXMudW5hdmFpbGFibGUpIHJlc29sdmUodGhpcylcbiAgICAgIGNvbnN0IGxpc3RlbmVyID0gKGd1aWxkOiBHdWlsZCk6IHZvaWQgPT4ge1xuICAgICAgICBpZiAoZ3VpbGQuaWQgPT09IHRoaXMuaWQpIHtcbiAgICAgICAgICB0aGlzLmNsaWVudC5vZmYoJ2d1aWxkTG9hZGVkJywgbGlzdGVuZXIpXG4gICAgICAgICAgcmVzb2x2ZSh0aGlzKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLmNsaWVudC5vbignZ3VpbGRMb2FkZWQnLCBsaXN0ZW5lcilcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLmNsaWVudC5vZmYoJ2d1aWxkTG9hZGVkJywgbGlzdGVuZXIpXG4gICAgICAgIHJlamVjdChFcnJvcihcIlRpbWVvdXQuIEd1aWxkIGRpZG4ndCBhcnJpdmUgaW4gdGltZS5cIikpXG4gICAgICB9LCB0aW1lb3V0KVxuICAgIH0pXG4gIH1cblxuICAvKiogQXR0YWNoIGFuIGludGVncmF0aW9uIG9iamVjdCBmcm9tIHRoZSBjdXJyZW50IHVzZXIgdG8gdGhlIGd1aWxkLiAqL1xuICBhc3luYyBjcmVhdGVJbnRlZ3JhdGlvbihpZDogc3RyaW5nLCB0eXBlOiBzdHJpbmcpOiBQcm9taXNlPEd1aWxkPiB7XG4gICAgYXdhaXQgdGhpcy5jbGllbnQucmVzdC5hcGkuZ3VpbGRzW3RoaXMuaWRdLmludGVncmF0aW9ucy5wb3N0KHsgaWQsIHR5cGUgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIE1vZGlmeSB0aGUgYmVoYXZpb3IgYW5kIHNldHRpbmdzIG9mIGFuIGludGVncmF0aW9uIG9iamVjdCBmb3IgdGhlIGd1aWxkLiAqL1xuICBhc3luYyBlZGl0SW50ZWdyYXRpb24oXG4gICAgaWQ6IHN0cmluZyxcbiAgICBkYXRhOiB7XG4gICAgICBleHBpcmVCZWhhdmlvcj86IG51bWJlciB8IG51bGxcbiAgICAgIGV4cGlyZUdyYWNlUGVyaW9kPzogbnVtYmVyIHwgbnVsbFxuICAgICAgZW5hYmxlRW1vdGljb25zPzogYm9vbGVhbiB8IG51bGxcbiAgICB9XG4gICk6IFByb21pc2U8R3VpbGQ+IHtcbiAgICBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmFwaS5ndWlsZHNbdGhpcy5pZF0uaW50ZWdyYXRpb25zW2lkXS5wYXRjaCh7XG4gICAgICBleHBpcmVfYmVoYXZpb3VyOiBkYXRhLmV4cGlyZUJlaGF2aW9yLFxuICAgICAgZXhwaXJlX2dyYWNlX3BlcmlvZDogZGF0YS5leHBpcmVHcmFjZVBlcmlvZCxcbiAgICAgIGVuYWJsZV9lbW90aWNvbnM6IGRhdGEuZW5hYmxlRW1vdGljb25zXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIERlbGV0ZSB0aGUgYXR0YWNoZWQgaW50ZWdyYXRpb24gb2JqZWN0IGZvciB0aGUgZ3VpbGQuIERlbGV0ZXMgYW55IGFzc29jaWF0ZWQgd2ViaG9va3MgYW5kIGtpY2tzIHRoZSBhc3NvY2lhdGVkIGJvdCBpZiB0aGVyZSBpcyBvbmUuICovXG4gIGFzeW5jIGRlbGV0ZUludGVncmF0aW9uKGlkOiBzdHJpbmcpOiBQcm9taXNlPEd1aWxkPiB7XG4gICAgYXdhaXQgdGhpcy5jbGllbnQucmVzdC5hcGkuZ3VpbGRzW3RoaXMuaWRdLmludGVncmF0aW9uc1tpZF0uZGVsZXRlKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIFN5bmMgYW4gaW50ZWdyYXRpb24uICovXG4gIGFzeW5jIHN5bmNJbnRlZ3JhdGlvbihpZDogc3RyaW5nKTogUHJvbWlzZTxHdWlsZD4ge1xuICAgIGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuYXBpLmd1aWxkc1t0aGlzLmlkXS5pbnRlZ3JhdGlvbnNbaWRdLnN5bmMucG9zdCgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIHRoZSB3aWRnZXQgZm9yIHRoZSBndWlsZC4gKi9cbiAgYXN5bmMgZ2V0V2lkZ2V0KCk6IFByb21pc2U8R3VpbGRXaWRnZXRQYXlsb2FkPiB7XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50LnJlc3QuYXBpLmd1aWxkc1t0aGlzLmlkXVsnd2lkZ2V0Lmpzb24nXS5nZXQoKVxuICB9XG5cbiAgLyoqIE1vZGlmeSBhIGd1aWxkIHdpZGdldCBvYmplY3QgZm9yIHRoZSBndWlsZC4gKi9cbiAgYXN5bmMgZWRpdFdpZGdldChkYXRhOiB7XG4gICAgZW5hYmxlZD86IGJvb2xlYW5cbiAgICBjaGFubmVsPzogc3RyaW5nIHwgR3VpbGRDaGFubmVsc1xuICB9KTogUHJvbWlzZTxHdWlsZD4ge1xuICAgIGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuYXBpLmd1aWxkc1t0aGlzLmlkXS53aWRnZXQucGF0Y2goe1xuICAgICAgZW5hYmxlZDogZGF0YS5lbmFibGVkLFxuICAgICAgY2hhbm5lbF9pZDpcbiAgICAgICAgdHlwZW9mIGRhdGEuY2hhbm5lbCA9PT0gJ29iamVjdCcgPyBkYXRhLmNoYW5uZWwuaWQgOiBkYXRhLmNoYW5uZWxcbiAgICB9KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogUmV0dXJucyBhIHBhcnRpYWwgaW52aXRlIG9iamVjdCBmb3IgZ3VpbGRzIHdpdGggdGhhdCBmZWF0dXJlIGVuYWJsZWQuICovXG4gIGFzeW5jIGdldFZhbml0eSgpOiBQcm9taXNlPHsgY29kZTogc3RyaW5nIHwgbnVsbDsgdXNlczogbnVtYmVyIH0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdmFsdWUgPSBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmFwaS5ndWlsZHNbdGhpcy5pZF1bXG4gICAgICAgICd2YW5pdHktdXJsJ1xuICAgICAgXS5nZXQoKVxuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIERpc2NvcmRBUElFcnJvcikge1xuICAgICAgICBpZiAoZXJyb3IuZXJyb3I/LmNvZGUgPT09IDUwMDIwKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGNvZGU6IG51bGwsXG4gICAgICAgICAgICB1c2VzOiAwXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aHJvdyBlcnJvclxuICAgIH1cbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgUE5HIChVUkwpIGltYWdlIHdpZGdldCBmb3IgdGhlIGd1aWxkLiAqL1xuICBnZXRXaWRnZXRJbWFnZVVSTChcbiAgICBzdHlsZT86ICdzaGllbGQnIHwgJ2Jhbm5lcjEnIHwgJ2Jhbm5lcjInIHwgJ2Jhbm5lcjMnIHwgJ2Jhbm5lcjQnXG4gICk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBodHRwczovL2Rpc2NvcmQuY29tL2FwaS92JHt0aGlzLmNsaWVudC5yZXN0LnZlcnNpb24gPz8gOH0vZ3VpbGRzLyR7XG4gICAgICB0aGlzLmlkXG4gICAgfS93aWRnZXQucG5nJHtzdHlsZSAhPT0gdW5kZWZpbmVkID8gYD9zdHlsZT0ke3N0eWxlfWAgOiAnJ31gXG4gIH1cblxuICAvKiogTGVhdmUgYSBHdWlsZC4gKi9cbiAgYXN5bmMgbGVhdmUoKTogUHJvbWlzZTxDbGllbnQ+IHtcbiAgICBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmFwaS51c2Vyc1snQG1lJ10uZ3VpbGRzW3RoaXMuaWRdLmRlbGV0ZSgpXG4gICAgcmV0dXJuIHRoaXMuY2xpZW50XG4gIH1cblxuICAvKiogUmV0dXJucyBhbiBhcnJheSBvZiB0ZW1wbGF0ZSBvYmplY3RzLiAqL1xuICBhc3luYyBnZXRUZW1wbGF0ZXMoKTogUHJvbWlzZTxUZW1wbGF0ZVtdPiB7XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50LnJlc3QuYXBpLmd1aWxkc1t0aGlzLmlkXS50ZW1wbGF0ZXNcbiAgICAgIC5nZXQoKVxuICAgICAgLnRoZW4oKHRlbXBzOiBUZW1wbGF0ZVBheWxvYWRbXSkgPT5cbiAgICAgICAgdGVtcHMubWFwKCh0ZW1wKSA9PiBuZXcgVGVtcGxhdGUodGhpcy5jbGllbnQsIHRlbXApKVxuICAgICAgKVxuICB9XG5cbiAgLyoqIENyZWF0ZXMgYSB0ZW1wbGF0ZSBmb3IgdGhlIGd1aWxkLiAqL1xuICBhc3luYyBjcmVhdGVUZW1wbGF0ZShcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmcgfCBudWxsXG4gICk6IFByb21pc2U8VGVtcGxhdGU+IHtcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdGhpcy5jbGllbnQucmVzdC5hcGkuZ3VpbGRzW3RoaXMuaWRdLnRlbXBsYXRlcy5wb3N0KHtcbiAgICAgIG5hbWUsXG4gICAgICBkZXNjcmlwdGlvblxuICAgIH0pXG4gICAgcmV0dXJuIG5ldyBUZW1wbGF0ZSh0aGlzLmNsaWVudCwgcGF5bG9hZClcbiAgfVxuXG4gIC8qKiBTeW5jcyB0aGUgdGVtcGxhdGUgdG8gdGhlIGd1aWxkJ3MgY3VycmVudCBzdGF0ZS4gKi9cbiAgYXN5bmMgc3luY1RlbXBsYXRlKGNvZGU6IHN0cmluZyk6IFByb21pc2U8VGVtcGxhdGU+IHtcbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgdGhpcy5jbGllbnQucmVzdC5hcGkuZ3VpbGRzW3RoaXMuaWRdLnRlbXBsYXRlc1tcbiAgICAgIGNvZGVcbiAgICBdLnB1dCgpXG4gICAgcmV0dXJuIG5ldyBUZW1wbGF0ZSh0aGlzLmNsaWVudCwgcGF5bG9hZClcbiAgfVxuXG4gIC8qKiBNb2RpZmllcyB0aGUgdGVtcGxhdGUncyBtZXRhZGF0YS4gKi9cbiAgYXN5bmMgZWRpdFRlbXBsYXRlKFxuICAgIGNvZGU6IHN0cmluZyxcbiAgICBkYXRhOiB7IG5hbWU/OiBzdHJpbmc7IGRlc2NyaXB0aW9uPzogc3RyaW5nIH1cbiAgKTogUHJvbWlzZTxUZW1wbGF0ZT4ge1xuICAgIGNvbnN0IHBheWxvYWQgPSBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmFwaS5ndWlsZHNbdGhpcy5pZF0udGVtcGxhdGVzW1xuICAgICAgY29kZVxuICAgIF0ucGF0Y2goeyBuYW1lOiBkYXRhLm5hbWUsIGRlc2NyaXB0aW9uOiBkYXRhLmRlc2NyaXB0aW9uIH0pXG4gICAgcmV0dXJuIG5ldyBUZW1wbGF0ZSh0aGlzLmNsaWVudCwgcGF5bG9hZClcbiAgfVxuXG4gIC8qKiBEZWxldGVzIHRoZSB0ZW1wbGF0ZS4gUmVxdWlyZXMgdGhlIE1BTkFHRV9HVUlMRCBwZXJtaXNzaW9uLiAqL1xuICBhc3luYyBkZWxldGVUZW1wbGF0ZShjb2RlOiBzdHJpbmcpOiBQcm9taXNlPEd1aWxkPiB7XG4gICAgYXdhaXQgdGhpcy5jbGllbnQucmVzdC5hcGkuZ3VpbGRzW3RoaXMuaWRdLnRlbXBsYXRlc1tjb2RlXS5kZWxldGUoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogR2V0cyBhIHByZXZpZXcgb2YgdGhlIGd1aWxkLiBSZXR1cm5zIEd1aWxkUHJldmlldy4gKi9cbiAgYXN5bmMgcHJldmlldygpOiBQcm9taXNlPEd1aWxkUHJldmlldz4ge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5ndWlsZHMucHJldmlldyh0aGlzLmlkKVxuICB9XG5cbiAgLyoqXG4gICAqIEVkaXRzIHRoZSBndWlsZC5cbiAgICogQHBhcmFtIG9wdGlvbnMgR3VpbGQgZWRpdCBvcHRpb25zXG4gICAqL1xuICBhc3luYyBlZGl0KG9wdGlvbnM6IEd1aWxkTW9kaWZ5T3B0aW9ucyk6IFByb21pc2U8R3VpbGQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmNsaWVudC5ndWlsZHMuZWRpdCh0aGlzLmlkLCBvcHRpb25zLCB0cnVlKVxuICAgIHRoaXMucmVhZEZyb21EYXRhKHJlc3VsdClcblxuICAgIHJldHVybiBuZXcgR3VpbGQodGhpcy5jbGllbnQsIHJlc3VsdClcbiAgfVxuXG4gIC8qKiBEZWxldGVzIHRoZSBndWlsZC4gKi9cbiAgYXN5bmMgZGVsZXRlKCk6IFByb21pc2U8R3VpbGQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLmNsaWVudC5ndWlsZHMuZGVsZXRlKHRoaXMuaWQpXG5cbiAgICByZXR1cm4gcmVzdWx0ID09PSB1bmRlZmluZWQgPyB0aGlzIDogcmVzdWx0XG4gIH1cblxuICBhc3luYyBnZXRQcnVuZUNvdW50KG9wdGlvbnM/OiB7XG4gICAgZGF5cz86IG51bWJlclxuICAgIGluY2x1ZGVSb2xlcz86IEFycmF5PFJvbGUgfCBzdHJpbmc+XG4gIH0pOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGNvbnN0IHF1ZXJ5OiBHdWlsZEdldFBydW5lQ291bnRQYXlsb2FkID0ge1xuICAgICAgZGF5czogb3B0aW9ucz8uZGF5cyxcbiAgICAgIGluY2x1ZGVfcm9sZXM6IG9wdGlvbnM/LmluY2x1ZGVSb2xlc1xuICAgICAgICA/Lm1hcCgocm9sZSkgPT4gKHJvbGUgaW5zdGFuY2VvZiBSb2xlID8gcm9sZS5pZCA6IHJvbGUpKVxuICAgICAgICAuam9pbignLCcpXG4gICAgfVxuXG4gICAgY29uc3QgcmVzdWx0OiBHdWlsZFBydW5lQ291bnRQYXlsb2FkID0gYXdhaXQgdGhpcy5jbGllbnQucmVzdC5nZXQoXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXBsdXMtb3BlcmFuZHNcbiAgICAgIEdVSUxEX1BSVU5FKHRoaXMuaWQpICtcbiAgICAgICAgJz8nICtcbiAgICAgICAgT2JqZWN0LmVudHJpZXMocXVlcnkpXG4gICAgICAgICAgLm1hcCgoW2tleSwgdmFsdWVdKSA9PiBgJHtrZXl9PSR7dmFsdWV9YClcbiAgICAgICAgICAuam9pbignJicpXG4gICAgKVxuXG4gICAgcmV0dXJuIHJlc3VsdC5wcnVuZWQgYXMgbnVtYmVyXG4gIH1cblxuICBhc3luYyBwcnVuZShvcHRpb25zPzoge1xuICAgIGRheXM/OiBudW1iZXJcbiAgICBjb21wdXRlUHJ1bmVDb3VudD86IHRydWVcbiAgICBpbmNsdWRlUm9sZXM/OiBBcnJheTxSb2xlIHwgc3RyaW5nPlxuICB9KTogUHJvbWlzZTxudW1iZXI+XG4gIGFzeW5jIHBydW5lKG9wdGlvbnM/OiB7XG4gICAgZGF5cz86IG51bWJlclxuICAgIGNvbXB1dGVQcnVuZUNvdW50OiBmYWxzZVxuICAgIGluY2x1ZGVSb2xlcz86IEFycmF5PFJvbGUgfCBzdHJpbmc+XG4gIH0pOiBQcm9taXNlPG51bGw+XG4gIGFzeW5jIHBydW5lKG9wdGlvbnM/OiB7XG4gICAgZGF5cz86IG51bWJlclxuICAgIGNvbXB1dGVQcnVuZUNvdW50PzogYm9vbGVhblxuICAgIGluY2x1ZGVSb2xlcz86IEFycmF5PFJvbGUgfCBzdHJpbmc+XG4gIH0pOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgICBjb25zdCBib2R5OiBHdWlsZEJlZ2luUHJ1bmVQYXlsb2FkID0ge1xuICAgICAgZGF5czogb3B0aW9ucz8uZGF5cyxcbiAgICAgIGNvbXB1dGVfcHJ1bmVfY291bnQ6IG9wdGlvbnM/LmNvbXB1dGVQcnVuZUNvdW50LFxuICAgICAgaW5jbHVkZV9yb2xlczogb3B0aW9ucz8uaW5jbHVkZVJvbGVzPy5tYXAoKHJvbGUpID0+XG4gICAgICAgIHJvbGUgaW5zdGFuY2VvZiBSb2xlID8gcm9sZS5pZCA6IHJvbGVcbiAgICAgIClcbiAgICB9XG5cbiAgICBjb25zdCByZXN1bHQ6IEd1aWxkUHJ1bmVDb3VudFBheWxvYWQgPSBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LnBvc3QoXG4gICAgICBHVUlMRF9QUlVORSh0aGlzLmlkKSxcbiAgICAgIGJvZHlcbiAgICApXG5cbiAgICByZXR1cm4gcmVzdWx0LnBydW5lZFxuICB9XG5cbiAgYXN5bmMgZmV0Y2hBdWRpdExvZyhcbiAgICBvcHRpb25zOiB7XG4gICAgICB1c2VyPzogc3RyaW5nIHwgVXNlclxuICAgICAgYWN0aW9uVHlwZT86IEF1ZGl0TG9nRXZlbnRzXG4gICAgICBiZWZvcmU/OiBzdHJpbmdcbiAgICAgIGxpbWl0PzogbnVtYmVyXG4gICAgfSA9IHt9XG4gICk6IFByb21pc2U8QXVkaXRMb2c+IHtcbiAgICBpZiAoXG4gICAgICB0eXBlb2Ygb3B0aW9ucy5saW1pdCA9PT0gJ251bWJlcicgJiZcbiAgICAgIChvcHRpb25zLmxpbWl0IDwgMSB8fCBvcHRpb25zLmxpbWl0ID4gMTAwKVxuICAgIClcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBsaW1pdCwgbXVzdCBiZSBiZXR3ZWVuIDEtMTAwJylcblxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmVuZHBvaW50cy5nZXRHdWlsZEF1ZGl0TG9nKHRoaXMuaWQsIHtcbiAgICAgIHVzZXJJZDogdHlwZW9mIG9wdGlvbnMudXNlciA9PT0gJ29iamVjdCcgPyBvcHRpb25zLnVzZXIuaWQgOiBvcHRpb25zLnVzZXIsXG4gICAgICBhY3Rpb25UeXBlOiBvcHRpb25zLmFjdGlvblR5cGUsXG4gICAgICBiZWZvcmU6IG9wdGlvbnMuYmVmb3JlLFxuICAgICAgbGltaXQ6IG9wdGlvbnMubGltaXQgPz8gNTBcbiAgICB9KVxuXG4gICAgY29uc3QgcmV0OiBBdWRpdExvZyA9IHtcbiAgICAgIHdlYmhvb2tzOiBbXSxcbiAgICAgIHVzZXJzOiBbXSxcbiAgICAgIGVudHJpZXM6IFtdLFxuICAgICAgaW50ZWdyYXRpb25zOiBbXVxuICAgIH1cblxuICAgIGlmICgnYXVkaXRfbG9nX2VudHJpZXMnIGluIGRhdGEpIHtcbiAgICAgIHJldC5lbnRyaWVzID0gZGF0YS5hdWRpdF9sb2dfZW50cmllcy5tYXAodHJhbnNmb3JtQXVkaXRMb2dFbnRyeVBheWxvYWQpXG4gICAgfVxuXG4gICAgaWYgKCd1c2VycycgaW4gZGF0YSkge1xuICAgICAgY29uc3QgdXNlcnM6IFVzZXJbXSA9IFtdXG4gICAgICBmb3IgKGNvbnN0IGQgb2YgZGF0YS51c2Vycykge1xuICAgICAgICBhd2FpdCB0aGlzLmNsaWVudC51c2Vycy5zZXQoZC5pZCwgZClcbiAgICAgICAgdXNlcnMucHVzaCgoYXdhaXQgdGhpcy5jbGllbnQudXNlcnMuZ2V0KGQuaWQpKSEpXG4gICAgICB9XG4gICAgICByZXQudXNlcnMgPSB1c2Vyc1xuICAgIH1cblxuICAgIGlmICgnaW50ZWdyYXRpb25zJyBpbiBkYXRhKSB7XG4gICAgICByZXQuaW50ZWdyYXRpb25zID0gZGF0YS5pbnRlZ3JhdGlvbnMubWFwKFxuICAgICAgICAoZSkgPT4gbmV3IEd1aWxkSW50ZWdyYXRpb24odGhpcy5jbGllbnQsIGUpXG4gICAgICApXG4gICAgfVxuXG4gICAgaWYgKCd3ZWJob29rcycgaW4gZGF0YSkge1xuICAgICAgcmV0LndlYmhvb2tzID0gZGF0YS53ZWJob29rc1xuICAgIH1cblxuICAgIHJldHVybiByZXRcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgR3VpbGRJbnRlZ3JhdGlvbiBleHRlbmRzIEJhc2Uge1xuICBpZDogc3RyaW5nXG4gIG5hbWU6IHN0cmluZ1xuICB0eXBlOiBzdHJpbmdcbiAgZW5hYmxlZDogYm9vbGVhblxuICBzeW5jaW5nPzogYm9vbGVhblxuICByb2xlSUQ/OiBzdHJpbmdcbiAgZW5hYmxlRW1vdGljb25zPzogYm9vbGVhblxuICBleHBpcmVCZWhhdmlvdXI/OiBJbnRlZ3JhdGlvbkV4cGlyZUJlaGF2aW9yXG4gIGV4cGlyZUdyYWNlUGVyaW9kPzogbnVtYmVyXG4gIHVzZXI/OiBVc2VyXG4gIGFjY291bnQ6IEludGVncmF0aW9uQWNjb3VudFBheWxvYWRcbiAgc3luY2VkQXQ/OiBzdHJpbmcgLy8gQWN0dWFsbHkgYSBJU08gVGltZXN0YW1wLCBidXQgd2UgcGFyc2UgaW4gY29uc3RydWN0b3JcbiAgc3Vic2NyaWJlckNvdW50PzogbnVtYmVyXG4gIHJldm9rZWQ/OiBib29sZWFuXG4gIGFwcGxpY2F0aW9uPzogQXBwbGljYXRpb25cblxuICBjb25zdHJ1Y3RvcihjbGllbnQ6IENsaWVudCwgZGF0YTogR3VpbGRJbnRlZ3JhdGlvblBheWxvYWQpIHtcbiAgICBzdXBlcihjbGllbnQsIGRhdGEpXG5cbiAgICB0aGlzLmlkID0gZGF0YS5pZFxuICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZVxuICAgIHRoaXMudHlwZSA9IGRhdGEudHlwZVxuICAgIHRoaXMuZW5hYmxlZCA9IGRhdGEuZW5hYmxlZFxuICAgIHRoaXMuc3luY2luZyA9IGRhdGEuc3luY2luZ1xuICAgIHRoaXMucm9sZUlEID0gZGF0YS5yb2xlX2lkXG4gICAgdGhpcy5lbmFibGVFbW90aWNvbnMgPSBkYXRhLmVuYWJsZV9lbW90aWNvbnNcbiAgICB0aGlzLmV4cGlyZUJlaGF2aW91ciA9IGRhdGEuZXhwaXJlX2JlaGF2aW91clxuICAgIHRoaXMuZXhwaXJlR3JhY2VQZXJpb2QgPSBkYXRhLmV4cGlyZV9ncmFjZV9wZXJpb2RcbiAgICB0aGlzLnVzZXIgPVxuICAgICAgZGF0YS51c2VyICE9PSB1bmRlZmluZWQgPyBuZXcgVXNlcihjbGllbnQsIGRhdGEudXNlcikgOiB1bmRlZmluZWRcbiAgICB0aGlzLmFjY291bnQgPSBkYXRhLmFjY291bnRcbiAgICB0aGlzLnN5bmNlZEF0ID0gZGF0YS5zeW5jZWRfYXRcbiAgICB0aGlzLnN1YnNjcmliZXJDb3VudCA9IGRhdGEuc3Vic2NyaWJlcl9jb3VudFxuICAgIHRoaXMucmV2b2tlZCA9IGRhdGEucmV2b2tlZFxuICAgIHRoaXMuYXBwbGljYXRpb24gPVxuICAgICAgZGF0YS5hcHBsaWNhdGlvbiAhPT0gdW5kZWZpbmVkXG4gICAgICAgID8gbmV3IEFwcGxpY2F0aW9uKGNsaWVudCwgZGF0YS5hcHBsaWNhdGlvbilcbiAgICAgICAgOiB1bmRlZmluZWRcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtQXVkaXRMb2dFbnRyeVBheWxvYWQoXG4gIGQ6IEF1ZGl0TG9nRW50cnlQYXlsb2FkXG4pOiBBdWRpdExvZ0VudHJ5IHtcbiAgcmV0dXJuIHRvQ2FtZWxDYXNlKGQpXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBdUJBLFNBQVMsSUFBSSxFQUFF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