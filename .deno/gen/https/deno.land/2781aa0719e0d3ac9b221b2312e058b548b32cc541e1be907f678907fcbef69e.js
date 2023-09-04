import { Channel } from '../structures/channel.ts';
import { Embed } from '../structures/embed.ts';
import { Message } from '../structures/message.ts';
import { CHANNEL } from '../types/endpoint.ts';
import getChannelByType from '../utils/channel.ts';
import { BaseManager } from './base.ts';
import { transformComponent } from '../utils/components.ts';
import { Collection } from '../utils/collection.ts';
export class ChannelsManager extends BaseManager {
    constructor(client){
        super(client, 'channels', Channel);
    }
    async getUserDM(user) {
        return this.client.cache.get('user_dms', typeof user === 'string' ? user : user.id);
    }
    async setUserDM(user, id) {
        await this.client.cache.set('user_dms', typeof user === 'string' ? user : user.id, id);
    }
    // Override get method as Generic
    async get(key) {
        const data = await this._get(key);
        if (data === undefined) return;
        let guild;
        if ('guild_id' in data) {
            guild = await this.client.guilds.get(// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            data.guild_id);
        }
        const res = getChannelByType(this.client, data, guild);
        return res;
    }
    async array() {
        const arr = await this.client.cache.array(this.cacheName);
        if (arr === undefined) return [];
        const result = [];
        for (const elem of arr){
            let guild;
            if ('guild_id' in elem) {
                guild = await this.client.guilds.get(elem.guild_id);
            }
            result.push(getChannelByType(this.client, elem, guild));
        }
        return result;
    }
    /** Fetches a Channel by ID, cache it, resolve it */ async fetch(id) {
        return await new Promise((resolve, reject)=>{
            this.client.rest.get(CHANNEL(id)).then(async (data)=>{
                this.set(id, data);
                let guild;
                if (data.guild_id !== undefined) {
                    guild = await this.client.guilds.get(data.guild_id);
                }
                resolve(getChannelByType(this.client, data, guild));
            }).catch((e)=>reject(e));
        });
    }
    async sendMessage(channel, content, option) {
        const channelID = typeof channel === 'string' ? channel : channel.id;
        if (typeof content === 'object') {
            option = content;
            content = undefined;
        }
        if (content === undefined && option === undefined) {
            throw new Error('Either text or option is necessary.');
        }
        if (option instanceof Embed) {
            option = {
                embeds: [
                    option
                ]
            };
        }
        if (Array.isArray(option)) {
            option = {
                embeds: option
            };
        }
        const payload = {
            content: content ?? option?.content,
            embed: option?.embed,
            embeds: option?.embeds,
            file: option?.file,
            files: option?.files,
            tts: option?.tts,
            allowed_mentions: option?.allowedMentions,
            components: option?.components !== undefined ? typeof option.components === 'function' ? option.components : transformComponent(option.components) : undefined,
            message_reference: option?.reply === undefined ? undefined : typeof option.reply === 'string' ? {
                message_id: option.reply
            } : typeof option.reply === 'object' ? option.reply instanceof Message ? {
                message_id: option.reply.id,
                channel_id: option.reply.channel.id,
                guild_id: option.reply.guild?.id
            } : option.reply : undefined
        };
        if (payload.content === undefined && payload.embed === undefined) {
            payload.content = '';
        }
        const resp = await this.client.rest.api.channels[channelID].messages.post(payload);
        const chan = typeof channel === 'string' ? await this.get(channel) : channel;
        const res = new Message(this.client, resp, chan, this.client.user);
        await res.mentions.fromPayload(resp);
        return res;
    }
    async editMessage(channel, message, text, option) {
        const channelID = typeof channel === 'string' ? channel : channel.id;
        if (text === undefined && option === undefined) {
            throw new Error('Either text or option is necessary.');
        }
        if (this.client.user === undefined) {
            throw new Error('Client user has not initialized.');
        }
        if (typeof text === 'object') {
            if (typeof option === 'object') Object.assign(option, text);
            else option = text;
            text = undefined;
        }
        if (option?.embed !== undefined) {
            option.embeds = [
                option.embed
            ];
            delete option.embed;
        }
        const newMsg = await this.client.rest.api.channels[channelID].messages[typeof message === 'string' ? message : message.id].patch({
            content: text ?? option?.content,
            embeds: option?.embeds,
            // Cannot upload new files with Message
            // file: option?.file,
            tts: option?.tts,
            allowed_mentions: option?.allowedMentions,
            components: option?.components !== undefined ? typeof option.components === 'function' ? option.components : transformComponent(option.components) : undefined
        });
        const chan = typeof channel === 'string' ? await this.get(channel) : channel;
        const res = new Message(this.client, newMsg, chan, this.client.user);
        await res.mentions.fromPayload(newMsg);
        return res;
    }
    async getPinnedMessages(channel) {
        const res = new Collection();
        const channelID = typeof channel === 'string' ? channel : channel.id;
        const channelStruct = typeof channel === 'string' ? await this.get(channelID) : channel;
        if (channelStruct === undefined) {
            throw new Error(`Channel ${channelID} not found.`);
        }
        const pins = await this.client.rest.api.channels[channelID].pins.get();
        for (const pin of pins){
            await channelStruct.messages.set(pin.id, pin);
            const msg = await channelStruct.messages.get(pin.id);
            res.set(msg.id, msg);
        }
        return res;
    }
    async pinMessage(channel, message) {
        const channelID = typeof channel === 'string' ? channel : channel.id;
        const messageID = typeof message === 'string' ? message : message.id;
        await this.client.rest.api.channels[channelID].pins[messageID].put();
    }
    async unpinMessage(channel, message) {
        const channelID = typeof channel === 'string' ? channel : channel.id;
        const messageID = typeof message === 'string' ? message : message.id;
        await this.client.rest.api.channels[channelID].pins[messageID].delete();
    }
    /** Get cache size for messages. Returns total messages cache size if channel param is not given */ async messageCacheSize(channel) {
        if (channel === undefined) {
            const channels = await this.client.cache.keys('channels') ?? [];
            if (channels.length === 0) return 0;
            let size = 0;
            for (const id of channels){
                size += await this.messageCacheSize(id);
            }
            return size;
        }
        const id1 = typeof channel === 'object' ? channel.id : channel;
        return await this.client.cache.size(`messages:${id1}`) ?? 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL2NoYW5uZWxzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgeyBDaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9jaGFubmVsLnRzJ1xuaW1wb3J0IHsgRW1iZWQgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2VtYmVkLnRzJ1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gJy4uL3N0cnVjdHVyZXMvbWVzc2FnZS50cydcbmltcG9ydCB0eXBlIHsgVGV4dENoYW5uZWwgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL3RleHRDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBVc2VyIH0gZnJvbSAnLi4vc3RydWN0dXJlcy91c2VyLnRzJ1xuaW1wb3J0IHR5cGUge1xuICBDaGFubmVsUGF5bG9hZCxcbiAgR3VpbGRDaGFubmVsUGF5bG9hZCxcbiAgTWVzc2FnZU9wdGlvbnMsXG4gIE1lc3NhZ2VQYXlsb2FkXG59IGZyb20gJy4uL3R5cGVzL2NoYW5uZWwudHMnXG5pbXBvcnQgeyBDSEFOTkVMIH0gZnJvbSAnLi4vdHlwZXMvZW5kcG9pbnQudHMnXG5pbXBvcnQgZ2V0Q2hhbm5lbEJ5VHlwZSBmcm9tICcuLi91dGlscy9jaGFubmVsLnRzJ1xuaW1wb3J0IHsgQmFzZU1hbmFnZXIgfSBmcm9tICcuL2Jhc2UudHMnXG5pbXBvcnQgeyB0cmFuc2Zvcm1Db21wb25lbnQgfSBmcm9tICcuLi91dGlscy9jb21wb25lbnRzLnRzJ1xuaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gJy4uL3V0aWxzL2NvbGxlY3Rpb24udHMnXG5cbmV4cG9ydCB0eXBlIEFsbE1lc3NhZ2VPcHRpb25zID0gTWVzc2FnZU9wdGlvbnMgfCBFbWJlZCB8IEVtYmVkW11cblxuZXhwb3J0IGNsYXNzIENoYW5uZWxzTWFuYWdlciBleHRlbmRzIEJhc2VNYW5hZ2VyPENoYW5uZWxQYXlsb2FkLCBDaGFubmVsPiB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50KSB7XG4gICAgc3VwZXIoY2xpZW50LCAnY2hhbm5lbHMnLCBDaGFubmVsKVxuICB9XG5cbiAgYXN5bmMgZ2V0VXNlckRNKHVzZXI6IFVzZXIgfCBzdHJpbmcpOiBQcm9taXNlPHN0cmluZyB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5jYWNoZS5nZXQoXG4gICAgICAndXNlcl9kbXMnLFxuICAgICAgdHlwZW9mIHVzZXIgPT09ICdzdHJpbmcnID8gdXNlciA6IHVzZXIuaWRcbiAgICApXG4gIH1cblxuICBhc3luYyBzZXRVc2VyRE0odXNlcjogVXNlciB8IHN0cmluZywgaWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuY2xpZW50LmNhY2hlLnNldChcbiAgICAgICd1c2VyX2RtcycsXG4gICAgICB0eXBlb2YgdXNlciA9PT0gJ3N0cmluZycgPyB1c2VyIDogdXNlci5pZCxcbiAgICAgIGlkXG4gICAgKVxuICB9XG5cbiAgLy8gT3ZlcnJpZGUgZ2V0IG1ldGhvZCBhcyBHZW5lcmljXG4gIGFzeW5jIGdldDxUIGV4dGVuZHMgQ2hhbm5lbCA9IENoYW5uZWw+KGtleTogc3RyaW5nKTogUHJvbWlzZTxUIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuX2dldChrZXkpXG4gICAgaWYgKGRhdGEgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgbGV0IGd1aWxkXG4gICAgaWYgKCdndWlsZF9pZCcgaW4gZGF0YSkge1xuICAgICAgZ3VpbGQgPSBhd2FpdCB0aGlzLmNsaWVudC5ndWlsZHMuZ2V0KFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgICAgIChkYXRhIGFzIEd1aWxkQ2hhbm5lbFBheWxvYWQpLmd1aWxkX2lkXG4gICAgICApXG4gICAgfVxuICAgIGNvbnN0IHJlcyA9IGdldENoYW5uZWxCeVR5cGUodGhpcy5jbGllbnQsIGRhdGEsIGd1aWxkKVxuICAgIHJldHVybiByZXMgYXMgVFxuICB9XG5cbiAgYXN5bmMgYXJyYXkoKTogUHJvbWlzZTxDaGFubmVsW10+IHtcbiAgICBjb25zdCBhcnIgPSBhd2FpdCAodGhpcy5jbGllbnQuY2FjaGUuYXJyYXkoXG4gICAgICB0aGlzLmNhY2hlTmFtZVxuICAgICkgYXMgQ2hhbm5lbFBheWxvYWRbXSlcbiAgICBpZiAoYXJyID09PSB1bmRlZmluZWQpIHJldHVybiBbXVxuICAgIGNvbnN0IHJlc3VsdCA9IFtdXG4gICAgZm9yIChjb25zdCBlbGVtIG9mIGFycikge1xuICAgICAgbGV0IGd1aWxkXG4gICAgICBpZiAoJ2d1aWxkX2lkJyBpbiBlbGVtKSB7XG4gICAgICAgIGd1aWxkID0gYXdhaXQgdGhpcy5jbGllbnQuZ3VpbGRzLmdldChcbiAgICAgICAgICAoZWxlbSBhcyB1bmtub3duIGFzIEd1aWxkQ2hhbm5lbFBheWxvYWQpLmd1aWxkX2lkXG4gICAgICAgIClcbiAgICAgIH1cbiAgICAgIHJlc3VsdC5wdXNoKGdldENoYW5uZWxCeVR5cGUodGhpcy5jbGllbnQsIGVsZW0sIGd1aWxkKSEpXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKiBGZXRjaGVzIGEgQ2hhbm5lbCBieSBJRCwgY2FjaGUgaXQsIHJlc29sdmUgaXQgKi9cbiAgYXN5bmMgZmV0Y2g8VCA9IENoYW5uZWw+KGlkOiBzdHJpbmcpOiBQcm9taXNlPFQ+IHtcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5jbGllbnQucmVzdFxuICAgICAgICAuZ2V0KENIQU5ORUwoaWQpKVxuICAgICAgICAudGhlbihhc3luYyAoZGF0YSkgPT4ge1xuICAgICAgICAgIHRoaXMuc2V0KGlkLCBkYXRhIGFzIENoYW5uZWxQYXlsb2FkKVxuICAgICAgICAgIGxldCBndWlsZFxuICAgICAgICAgIGlmIChkYXRhLmd1aWxkX2lkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGd1aWxkID0gYXdhaXQgdGhpcy5jbGllbnQuZ3VpbGRzLmdldChkYXRhLmd1aWxkX2lkKVxuICAgICAgICAgIH1cbiAgICAgICAgICByZXNvbHZlKFxuICAgICAgICAgICAgZ2V0Q2hhbm5lbEJ5VHlwZShcbiAgICAgICAgICAgICAgdGhpcy5jbGllbnQsXG4gICAgICAgICAgICAgIGRhdGEgYXMgQ2hhbm5lbFBheWxvYWQsXG4gICAgICAgICAgICAgIGd1aWxkXG4gICAgICAgICAgICApIGFzIHVua25vd24gYXMgVFxuICAgICAgICAgIClcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlKSA9PiByZWplY3QoZSkpXG4gICAgfSlcbiAgfVxuXG4gIGFzeW5jIHNlbmRNZXNzYWdlKFxuICAgIGNoYW5uZWw6IHN0cmluZyB8IFRleHRDaGFubmVsLFxuICAgIGNvbnRlbnQ/OiBzdHJpbmcgfCBBbGxNZXNzYWdlT3B0aW9ucyxcbiAgICBvcHRpb24/OiBBbGxNZXNzYWdlT3B0aW9uc1xuICApOiBQcm9taXNlPE1lc3NhZ2U+IHtcbiAgICBjb25zdCBjaGFubmVsSUQgPSB0eXBlb2YgY2hhbm5lbCA9PT0gJ3N0cmluZycgPyBjaGFubmVsIDogY2hhbm5lbC5pZFxuXG4gICAgaWYgKHR5cGVvZiBjb250ZW50ID09PSAnb2JqZWN0Jykge1xuICAgICAgb3B0aW9uID0gY29udGVudFxuICAgICAgY29udGVudCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgICBpZiAoY29udGVudCA9PT0gdW5kZWZpbmVkICYmIG9wdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VpdGhlciB0ZXh0IG9yIG9wdGlvbiBpcyBuZWNlc3NhcnkuJylcbiAgICB9XG4gICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIEVtYmVkKSB7XG4gICAgICBvcHRpb24gPSB7XG4gICAgICAgIGVtYmVkczogW29wdGlvbl1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKEFycmF5LmlzQXJyYXkob3B0aW9uKSkge1xuICAgICAgb3B0aW9uID0ge1xuICAgICAgICBlbWJlZHM6IG9wdGlvblxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICBjb250ZW50OiBjb250ZW50ID8/IG9wdGlvbj8uY29udGVudCxcbiAgICAgIGVtYmVkOiBvcHRpb24/LmVtYmVkLFxuICAgICAgZW1iZWRzOiBvcHRpb24/LmVtYmVkcyxcbiAgICAgIGZpbGU6IG9wdGlvbj8uZmlsZSxcbiAgICAgIGZpbGVzOiBvcHRpb24/LmZpbGVzLFxuICAgICAgdHRzOiBvcHRpb24/LnR0cyxcbiAgICAgIGFsbG93ZWRfbWVudGlvbnM6IG9wdGlvbj8uYWxsb3dlZE1lbnRpb25zLFxuICAgICAgY29tcG9uZW50czpcbiAgICAgICAgb3B0aW9uPy5jb21wb25lbnRzICE9PSB1bmRlZmluZWRcbiAgICAgICAgICA/IHR5cGVvZiBvcHRpb24uY29tcG9uZW50cyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBvcHRpb24uY29tcG9uZW50c1xuICAgICAgICAgICAgOiB0cmFuc2Zvcm1Db21wb25lbnQob3B0aW9uLmNvbXBvbmVudHMpXG4gICAgICAgICAgOiB1bmRlZmluZWQsXG4gICAgICBtZXNzYWdlX3JlZmVyZW5jZTpcbiAgICAgICAgb3B0aW9uPy5yZXBseSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICA6IHR5cGVvZiBvcHRpb24ucmVwbHkgPT09ICdzdHJpbmcnXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIG1lc3NhZ2VfaWQ6IG9wdGlvbi5yZXBseVxuICAgICAgICAgICAgfVxuICAgICAgICAgIDogdHlwZW9mIG9wdGlvbi5yZXBseSA9PT0gJ29iamVjdCdcbiAgICAgICAgICA/IG9wdGlvbi5yZXBseSBpbnN0YW5jZW9mIE1lc3NhZ2VcbiAgICAgICAgICAgID8ge1xuICAgICAgICAgICAgICAgIG1lc3NhZ2VfaWQ6IG9wdGlvbi5yZXBseS5pZCxcbiAgICAgICAgICAgICAgICBjaGFubmVsX2lkOiBvcHRpb24ucmVwbHkuY2hhbm5lbC5pZCxcbiAgICAgICAgICAgICAgICBndWlsZF9pZDogb3B0aW9uLnJlcGx5Lmd1aWxkPy5pZFxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICA6IG9wdGlvbi5yZXBseVxuICAgICAgICAgIDogdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgaWYgKHBheWxvYWQuY29udGVudCA9PT0gdW5kZWZpbmVkICYmIHBheWxvYWQuZW1iZWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcGF5bG9hZC5jb250ZW50ID0gJydcbiAgICB9XG5cbiAgICBjb25zdCByZXNwID0gYXdhaXQgdGhpcy5jbGllbnQucmVzdC5hcGkuY2hhbm5lbHNbY2hhbm5lbElEXS5tZXNzYWdlcy5wb3N0KFxuICAgICAgcGF5bG9hZFxuICAgIClcbiAgICBjb25zdCBjaGFuID1cbiAgICAgIHR5cGVvZiBjaGFubmVsID09PSAnc3RyaW5nJ1xuICAgICAgICA/IChhd2FpdCB0aGlzLmdldDxUZXh0Q2hhbm5lbD4oY2hhbm5lbCkpIVxuICAgICAgICA6IGNoYW5uZWxcbiAgICBjb25zdCByZXMgPSBuZXcgTWVzc2FnZSh0aGlzLmNsaWVudCwgcmVzcCwgY2hhbiwgdGhpcy5jbGllbnQudXNlciEpXG4gICAgYXdhaXQgcmVzLm1lbnRpb25zLmZyb21QYXlsb2FkKHJlc3ApXG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgYXN5bmMgZWRpdE1lc3NhZ2UoXG4gICAgY2hhbm5lbDogc3RyaW5nIHwgVGV4dENoYW5uZWwsXG4gICAgbWVzc2FnZTogTWVzc2FnZSB8IHN0cmluZyxcbiAgICB0ZXh0Pzogc3RyaW5nIHwgTWVzc2FnZU9wdGlvbnMsXG4gICAgb3B0aW9uPzogTWVzc2FnZU9wdGlvbnNcbiAgKTogUHJvbWlzZTxNZXNzYWdlPiB7XG4gICAgY29uc3QgY2hhbm5lbElEID0gdHlwZW9mIGNoYW5uZWwgPT09ICdzdHJpbmcnID8gY2hhbm5lbCA6IGNoYW5uZWwuaWRcblxuICAgIGlmICh0ZXh0ID09PSB1bmRlZmluZWQgJiYgb3B0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRWl0aGVyIHRleHQgb3Igb3B0aW9uIGlzIG5lY2Vzc2FyeS4nKVxuICAgIH1cblxuICAgIGlmICh0aGlzLmNsaWVudC51c2VyID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2xpZW50IHVzZXIgaGFzIG5vdCBpbml0aWFsaXplZC4nKVxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdGV4dCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnb2JqZWN0JykgT2JqZWN0LmFzc2lnbihvcHRpb24sIHRleHQpXG4gICAgICBlbHNlIG9wdGlvbiA9IHRleHRcbiAgICAgIHRleHQgPSB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBpZiAob3B0aW9uPy5lbWJlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRpb24uZW1iZWRzID0gW29wdGlvbi5lbWJlZF1cbiAgICAgIGRlbGV0ZSBvcHRpb24uZW1iZWRcbiAgICB9XG5cbiAgICBjb25zdCBuZXdNc2cgPSBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmFwaS5jaGFubmVsc1tjaGFubmVsSURdLm1lc3NhZ2VzW1xuICAgICAgdHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnID8gbWVzc2FnZSA6IG1lc3NhZ2UuaWRcbiAgICBdLnBhdGNoKHtcbiAgICAgIGNvbnRlbnQ6IHRleHQgPz8gb3B0aW9uPy5jb250ZW50LFxuICAgICAgZW1iZWRzOiBvcHRpb24/LmVtYmVkcyxcbiAgICAgIC8vIENhbm5vdCB1cGxvYWQgbmV3IGZpbGVzIHdpdGggTWVzc2FnZVxuICAgICAgLy8gZmlsZTogb3B0aW9uPy5maWxlLFxuICAgICAgdHRzOiBvcHRpb24/LnR0cyxcbiAgICAgIGFsbG93ZWRfbWVudGlvbnM6IG9wdGlvbj8uYWxsb3dlZE1lbnRpb25zLFxuICAgICAgY29tcG9uZW50czpcbiAgICAgICAgb3B0aW9uPy5jb21wb25lbnRzICE9PSB1bmRlZmluZWRcbiAgICAgICAgICA/IHR5cGVvZiBvcHRpb24uY29tcG9uZW50cyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgICAgPyBvcHRpb24uY29tcG9uZW50c1xuICAgICAgICAgICAgOiB0cmFuc2Zvcm1Db21wb25lbnQob3B0aW9uLmNvbXBvbmVudHMpXG4gICAgICAgICAgOiB1bmRlZmluZWRcbiAgICB9KVxuXG4gICAgY29uc3QgY2hhbiA9XG4gICAgICB0eXBlb2YgY2hhbm5lbCA9PT0gJ3N0cmluZydcbiAgICAgICAgPyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLW5vbi1udWxsLWFzc2VydGlvblxuICAgICAgICAgIChhd2FpdCB0aGlzLmdldDxUZXh0Q2hhbm5lbD4oY2hhbm5lbCkpIVxuICAgICAgICA6IGNoYW5uZWxcbiAgICBjb25zdCByZXMgPSBuZXcgTWVzc2FnZSh0aGlzLmNsaWVudCwgbmV3TXNnLCBjaGFuLCB0aGlzLmNsaWVudC51c2VyKVxuICAgIGF3YWl0IHJlcy5tZW50aW9ucy5mcm9tUGF5bG9hZChuZXdNc2cpXG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgYXN5bmMgZ2V0UGlubmVkTWVzc2FnZXMoXG4gICAgY2hhbm5lbDogc3RyaW5nIHwgVGV4dENoYW5uZWxcbiAgKTogUHJvbWlzZTxDb2xsZWN0aW9uPHN0cmluZywgTWVzc2FnZT4+IHtcbiAgICBjb25zdCByZXMgPSBuZXcgQ29sbGVjdGlvbjxzdHJpbmcsIE1lc3NhZ2U+KClcbiAgICBjb25zdCBjaGFubmVsSUQgPSB0eXBlb2YgY2hhbm5lbCA9PT0gJ3N0cmluZycgPyBjaGFubmVsIDogY2hhbm5lbC5pZFxuICAgIGNvbnN0IGNoYW5uZWxTdHJ1Y3QgPVxuICAgICAgdHlwZW9mIGNoYW5uZWwgPT09ICdzdHJpbmcnXG4gICAgICAgID8gYXdhaXQgdGhpcy5nZXQ8VGV4dENoYW5uZWw+KGNoYW5uZWxJRClcbiAgICAgICAgOiBjaGFubmVsXG5cbiAgICBpZiAoY2hhbm5lbFN0cnVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENoYW5uZWwgJHtjaGFubmVsSUR9IG5vdCBmb3VuZC5gKVxuICAgIH1cblxuICAgIGNvbnN0IHBpbnM6IE1lc3NhZ2VQYXlsb2FkW10gPSBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmFwaS5jaGFubmVsc1tcbiAgICAgIGNoYW5uZWxJRFxuICAgIF0ucGlucy5nZXQoKVxuXG4gICAgZm9yIChjb25zdCBwaW4gb2YgcGlucykge1xuICAgICAgYXdhaXQgY2hhbm5lbFN0cnVjdC5tZXNzYWdlcy5zZXQocGluLmlkLCBwaW4pXG4gICAgICBjb25zdCBtc2cgPSAoYXdhaXQgY2hhbm5lbFN0cnVjdC5tZXNzYWdlcy5nZXQoXG4gICAgICAgIHBpbi5pZFxuICAgICAgKSkgYXMgdW5rbm93biBhcyBNZXNzYWdlXG4gICAgICByZXMuc2V0KG1zZy5pZCwgbXNnKVxuICAgIH1cblxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIGFzeW5jIHBpbk1lc3NhZ2UoXG4gICAgY2hhbm5lbDogc3RyaW5nIHwgVGV4dENoYW5uZWwsXG4gICAgbWVzc2FnZTogc3RyaW5nIHwgTWVzc2FnZVxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBjaGFubmVsSUQgPSB0eXBlb2YgY2hhbm5lbCA9PT0gJ3N0cmluZycgPyBjaGFubmVsIDogY2hhbm5lbC5pZFxuICAgIGNvbnN0IG1lc3NhZ2VJRCA9IHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/IG1lc3NhZ2UgOiBtZXNzYWdlLmlkXG5cbiAgICBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmFwaS5jaGFubmVsc1tjaGFubmVsSURdLnBpbnNbbWVzc2FnZUlEXS5wdXQoKVxuICB9XG5cbiAgYXN5bmMgdW5waW5NZXNzYWdlKFxuICAgIGNoYW5uZWw6IHN0cmluZyB8IFRleHRDaGFubmVsLFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IE1lc3NhZ2VcbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY2hhbm5lbElEID0gdHlwZW9mIGNoYW5uZWwgPT09ICdzdHJpbmcnID8gY2hhbm5lbCA6IGNoYW5uZWwuaWRcbiAgICBjb25zdCBtZXNzYWdlSUQgPSB0eXBlb2YgbWVzc2FnZSA9PT0gJ3N0cmluZycgPyBtZXNzYWdlIDogbWVzc2FnZS5pZFxuXG4gICAgYXdhaXQgdGhpcy5jbGllbnQucmVzdC5hcGkuY2hhbm5lbHNbY2hhbm5lbElEXS5waW5zW21lc3NhZ2VJRF0uZGVsZXRlKClcbiAgfVxuXG4gIC8qKiBHZXQgY2FjaGUgc2l6ZSBmb3IgbWVzc2FnZXMuIFJldHVybnMgdG90YWwgbWVzc2FnZXMgY2FjaGUgc2l6ZSBpZiBjaGFubmVsIHBhcmFtIGlzIG5vdCBnaXZlbiAqL1xuICBhc3luYyBtZXNzYWdlQ2FjaGVTaXplKGNoYW5uZWw/OiBzdHJpbmcgfCBUZXh0Q2hhbm5lbCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgaWYgKGNoYW5uZWwgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgY2hhbm5lbHMgPSAoYXdhaXQgdGhpcy5jbGllbnQuY2FjaGUua2V5cygnY2hhbm5lbHMnKSkgPz8gW11cbiAgICAgIGlmIChjaGFubmVscy5sZW5ndGggPT09IDApIHJldHVybiAwXG4gICAgICBsZXQgc2l6ZSA9IDBcbiAgICAgIGZvciAoY29uc3QgaWQgb2YgY2hhbm5lbHMpIHtcbiAgICAgICAgc2l6ZSArPSBhd2FpdCB0aGlzLm1lc3NhZ2VDYWNoZVNpemUoaWQpXG4gICAgICB9XG4gICAgICByZXR1cm4gc2l6ZVxuICAgIH1cblxuICAgIGNvbnN0IGlkID0gdHlwZW9mIGNoYW5uZWwgPT09ICdvYmplY3QnID8gY2hhbm5lbC5pZCA6IGNoYW5uZWxcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMuY2xpZW50LmNhY2hlLnNpemUoYG1lc3NhZ2VzOiR7aWR9YCkpID8/IDBcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsT0FBTyxRQUFRLDJCQUEwQjtBQUNsRCxTQUFTLEtBQUssUUFBUSx5QkFBd0I7QUFDOUMsU0FBUyxPQUFPLFFBQVEsMkJBQTBCO0FBU2xELFNBQVMsT0FBTyxRQUFRLHVCQUFzQjtBQUM5QyxPQUFPLHNCQUFzQixzQkFBcUI7QUFDbEQsU0FBUyxXQUFXLFFBQVEsWUFBVztBQUN2QyxTQUFTLGtCQUFrQixRQUFRLHlCQUF3QjtBQUMzRCxTQUFTLFVBQVUsUUFBUSx5QkFBd0I7QUFJbkQsT0FBTyxNQUFNLHdCQUF3QjtJQUNuQyxZQUFZLE1BQWMsQ0FBRTtRQUMxQixLQUFLLENBQUMsUUFBUSxZQUFZO0lBQzVCO0lBRUEsTUFBTSxVQUFVLElBQW1CLEVBQStCO1FBQ2hFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUMxQixZQUNBLE9BQU8sU0FBUyxXQUFXLE9BQU8sS0FBSyxFQUFFO0lBRTdDO0lBRUEsTUFBTSxVQUFVLElBQW1CLEVBQUUsRUFBVSxFQUFpQjtRQUM5RCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FDekIsWUFDQSxPQUFPLFNBQVMsV0FBVyxPQUFPLEtBQUssRUFBRSxFQUN6QztJQUVKO0lBRUEsaUNBQWlDO0lBQ2pDLE1BQU0sSUFBaUMsR0FBVyxFQUEwQjtRQUMxRSxNQUFNLE9BQU8sTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDO1FBQzdCLElBQUksU0FBUyxXQUFXO1FBQ3hCLElBQUk7UUFDSixJQUFJLGNBQWMsTUFBTTtZQUN0QixRQUFRLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUVsQyxBQURBLDRFQUE0RTtZQUMzRSxLQUE2QixRQUFRO1FBRTFDLENBQUM7UUFDRCxNQUFNLE1BQU0saUJBQWlCLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTTtRQUNoRCxPQUFPO0lBQ1Q7SUFFQSxNQUFNLFFBQTRCO1FBQ2hDLE1BQU0sTUFBTSxNQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FDeEMsSUFBSSxDQUFDLFNBQVM7UUFFaEIsSUFBSSxRQUFRLFdBQVcsT0FBTyxFQUFFO1FBQ2hDLE1BQU0sU0FBUyxFQUFFO1FBQ2pCLEtBQUssTUFBTSxRQUFRLElBQUs7WUFDdEIsSUFBSTtZQUNKLElBQUksY0FBYyxNQUFNO2dCQUN0QixRQUFRLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUNsQyxBQUFDLEtBQXdDLFFBQVE7WUFFckQsQ0FBQztZQUNELE9BQU8sSUFBSSxDQUFDLGlCQUFpQixJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU07UUFDbEQ7UUFDQSxPQUFPO0lBQ1Q7SUFFQSxrREFBa0QsR0FDbEQsTUFBTSxNQUFtQixFQUFVLEVBQWM7UUFDL0MsT0FBTyxNQUFNLElBQUksUUFBUSxDQUFDLFNBQVMsU0FBVztZQUM1QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FDYixHQUFHLENBQUMsUUFBUSxLQUNaLElBQUksQ0FBQyxPQUFPLE9BQVM7Z0JBQ3BCLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSTtnQkFDYixJQUFJO2dCQUNKLElBQUksS0FBSyxRQUFRLEtBQUssV0FBVztvQkFDL0IsUUFBUSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFFBQVE7Z0JBQ3BELENBQUM7Z0JBQ0QsUUFDRSxpQkFDRSxJQUFJLENBQUMsTUFBTSxFQUNYLE1BQ0E7WUFHTixHQUNDLEtBQUssQ0FBQyxDQUFDLElBQU0sT0FBTztRQUN6QjtJQUNGO0lBRUEsTUFBTSxZQUNKLE9BQTZCLEVBQzdCLE9BQW9DLEVBQ3BDLE1BQTBCLEVBQ1I7UUFDbEIsTUFBTSxZQUFZLE9BQU8sWUFBWSxXQUFXLFVBQVUsUUFBUSxFQUFFO1FBRXBFLElBQUksT0FBTyxZQUFZLFVBQVU7WUFDL0IsU0FBUztZQUNULFVBQVU7UUFDWixDQUFDO1FBQ0QsSUFBSSxZQUFZLGFBQWEsV0FBVyxXQUFXO1lBQ2pELE1BQU0sSUFBSSxNQUFNLHVDQUFzQztRQUN4RCxDQUFDO1FBQ0QsSUFBSSxrQkFBa0IsT0FBTztZQUMzQixTQUFTO2dCQUNQLFFBQVE7b0JBQUM7aUJBQU87WUFDbEI7UUFDRixDQUFDO1FBQ0QsSUFBSSxNQUFNLE9BQU8sQ0FBQyxTQUFTO1lBQ3pCLFNBQVM7Z0JBQ1AsUUFBUTtZQUNWO1FBQ0YsQ0FBQztRQUVELE1BQU0sVUFBVTtZQUNkLFNBQVMsV0FBVyxRQUFRO1lBQzVCLE9BQU8sUUFBUTtZQUNmLFFBQVEsUUFBUTtZQUNoQixNQUFNLFFBQVE7WUFDZCxPQUFPLFFBQVE7WUFDZixLQUFLLFFBQVE7WUFDYixrQkFBa0IsUUFBUTtZQUMxQixZQUNFLFFBQVEsZUFBZSxZQUNuQixPQUFPLE9BQU8sVUFBVSxLQUFLLGFBQzNCLE9BQU8sVUFBVSxHQUNqQixtQkFBbUIsT0FBTyxVQUFVLENBQUMsR0FDdkMsU0FBUztZQUNmLG1CQUNFLFFBQVEsVUFBVSxZQUNkLFlBQ0EsT0FBTyxPQUFPLEtBQUssS0FBSyxXQUN4QjtnQkFDRSxZQUFZLE9BQU8sS0FBSztZQUMxQixJQUNBLE9BQU8sT0FBTyxLQUFLLEtBQUssV0FDeEIsT0FBTyxLQUFLLFlBQVksVUFDdEI7Z0JBQ0UsWUFBWSxPQUFPLEtBQUssQ0FBQyxFQUFFO2dCQUMzQixZQUFZLE9BQU8sS0FBSyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNuQyxVQUFVLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRTtZQUNoQyxJQUNBLE9BQU8sS0FBSyxHQUNkLFNBQVM7UUFDakI7UUFFQSxJQUFJLFFBQVEsT0FBTyxLQUFLLGFBQWEsUUFBUSxLQUFLLEtBQUssV0FBVztZQUNoRSxRQUFRLE9BQU8sR0FBRztRQUNwQixDQUFDO1FBRUQsTUFBTSxPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDdkU7UUFFRixNQUFNLE9BQ0osT0FBTyxZQUFZLFdBQ2QsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFjLFdBQzdCLE9BQU87UUFDYixNQUFNLE1BQU0sSUFBSSxRQUFRLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUNqRSxNQUFNLElBQUksUUFBUSxDQUFDLFdBQVcsQ0FBQztRQUMvQixPQUFPO0lBQ1Q7SUFFQSxNQUFNLFlBQ0osT0FBNkIsRUFDN0IsT0FBeUIsRUFDekIsSUFBOEIsRUFDOUIsTUFBdUIsRUFDTDtRQUNsQixNQUFNLFlBQVksT0FBTyxZQUFZLFdBQVcsVUFBVSxRQUFRLEVBQUU7UUFFcEUsSUFBSSxTQUFTLGFBQWEsV0FBVyxXQUFXO1lBQzlDLE1BQU0sSUFBSSxNQUFNLHVDQUFzQztRQUN4RCxDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxXQUFXO1lBQ2xDLE1BQU0sSUFBSSxNQUFNLG9DQUFtQztRQUNyRCxDQUFDO1FBRUQsSUFBSSxPQUFPLFNBQVMsVUFBVTtZQUM1QixJQUFJLE9BQU8sV0FBVyxVQUFVLE9BQU8sTUFBTSxDQUFDLFFBQVE7aUJBQ2pELFNBQVM7WUFDZCxPQUFPO1FBQ1QsQ0FBQztRQUVELElBQUksUUFBUSxVQUFVLFdBQVc7WUFDL0IsT0FBTyxNQUFNLEdBQUc7Z0JBQUMsT0FBTyxLQUFLO2FBQUM7WUFDOUIsT0FBTyxPQUFPLEtBQUs7UUFDckIsQ0FBQztRQUVELE1BQU0sU0FBUyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FDcEUsT0FBTyxZQUFZLFdBQVcsVUFBVSxRQUFRLEVBQUUsQ0FDbkQsQ0FBQyxLQUFLLENBQUM7WUFDTixTQUFTLFFBQVEsUUFBUTtZQUN6QixRQUFRLFFBQVE7WUFDaEIsdUNBQXVDO1lBQ3ZDLHNCQUFzQjtZQUN0QixLQUFLLFFBQVE7WUFDYixrQkFBa0IsUUFBUTtZQUMxQixZQUNFLFFBQVEsZUFBZSxZQUNuQixPQUFPLE9BQU8sVUFBVSxLQUFLLGFBQzNCLE9BQU8sVUFBVSxHQUNqQixtQkFBbUIsT0FBTyxVQUFVLENBQUMsR0FDdkMsU0FBUztRQUNqQjtRQUVBLE1BQU0sT0FDSixPQUFPLFlBQVksV0FFZCxNQUFNLElBQUksQ0FBQyxHQUFHLENBQWMsV0FDN0IsT0FBTztRQUNiLE1BQU0sTUFBTSxJQUFJLFFBQVEsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO1FBQ25FLE1BQU0sSUFBSSxRQUFRLENBQUMsV0FBVyxDQUFDO1FBQy9CLE9BQU87SUFDVDtJQUVBLE1BQU0sa0JBQ0osT0FBNkIsRUFDUztRQUN0QyxNQUFNLE1BQU0sSUFBSTtRQUNoQixNQUFNLFlBQVksT0FBTyxZQUFZLFdBQVcsVUFBVSxRQUFRLEVBQUU7UUFDcEUsTUFBTSxnQkFDSixPQUFPLFlBQVksV0FDZixNQUFNLElBQUksQ0FBQyxHQUFHLENBQWMsYUFDNUIsT0FBTztRQUViLElBQUksa0JBQWtCLFdBQVc7WUFDL0IsTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLEVBQUUsVUFBVSxXQUFXLENBQUMsRUFBQztRQUNwRCxDQUFDO1FBRUQsTUFBTSxPQUF5QixNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQ2hFLFVBQ0QsQ0FBQyxJQUFJLENBQUMsR0FBRztRQUVWLEtBQUssTUFBTSxPQUFPLEtBQU07WUFDdEIsTUFBTSxjQUFjLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDekMsTUFBTSxNQUFPLE1BQU0sY0FBYyxRQUFRLENBQUMsR0FBRyxDQUMzQyxJQUFJLEVBQUU7WUFFUixJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNsQjtRQUVBLE9BQU87SUFDVDtJQUVBLE1BQU0sV0FDSixPQUE2QixFQUM3QixPQUF5QixFQUNWO1FBQ2YsTUFBTSxZQUFZLE9BQU8sWUFBWSxXQUFXLFVBQVUsUUFBUSxFQUFFO1FBQ3BFLE1BQU0sWUFBWSxPQUFPLFlBQVksV0FBVyxVQUFVLFFBQVEsRUFBRTtRQUVwRSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRztJQUNwRTtJQUVBLE1BQU0sYUFDSixPQUE2QixFQUM3QixPQUF5QixFQUNWO1FBQ2YsTUFBTSxZQUFZLE9BQU8sWUFBWSxXQUFXLFVBQVUsUUFBUSxFQUFFO1FBQ3BFLE1BQU0sWUFBWSxPQUFPLFlBQVksV0FBVyxVQUFVLFFBQVEsRUFBRTtRQUVwRSxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTTtJQUN2RTtJQUVBLGlHQUFpRyxHQUNqRyxNQUFNLGlCQUFpQixPQUE4QixFQUFtQjtRQUN0RSxJQUFJLFlBQVksV0FBVztZQUN6QixNQUFNLFdBQVcsQUFBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxlQUFnQixFQUFFO1lBQ2pFLElBQUksU0FBUyxNQUFNLEtBQUssR0FBRyxPQUFPO1lBQ2xDLElBQUksT0FBTztZQUNYLEtBQUssTUFBTSxNQUFNLFNBQVU7Z0JBQ3pCLFFBQVEsTUFBTSxJQUFJLENBQUMsZ0JBQWdCLENBQUM7WUFDdEM7WUFDQSxPQUFPO1FBQ1QsQ0FBQztRQUVELE1BQU0sTUFBSyxPQUFPLFlBQVksV0FBVyxRQUFRLEVBQUUsR0FBRyxPQUFPO1FBQzdELE9BQU8sQUFBQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFNBQVMsRUFBRSxJQUFHLENBQUMsS0FBTTtJQUM3RDtBQUNGLENBQUMifQ==