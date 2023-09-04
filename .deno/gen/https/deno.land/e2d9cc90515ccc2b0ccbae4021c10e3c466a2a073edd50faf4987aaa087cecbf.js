import { RESTManager } from '../rest/mod.ts';
import { Embed } from './embed.ts';
import { Message } from './message.ts';
import { User } from './user.ts';
import { fetchAuto } from '../../deps.ts';
import { WEBHOOK_MESSAGE, CHANNEL_WEBHOOKS } from '../types/endpoint.ts';
import { Constants } from '../types/constants.ts';
/** Webhook follows different way of instantiation */ export class Webhook {
    client;
    id;
    type;
    guildID;
    channelID;
    user;
    userRaw;
    name;
    avatar;
    token;
    applicationID;
    rest;
    get url() {
        return `${Constants.DISCORD_API_URL}/v${this.rest.version ?? Constants.DISCORD_API_VERSION}/webhooks/${this.id}/${this.token}`;
    }
    constructor(data, client, rest){
        if (rest !== undefined) this.rest = rest;
        else if (client !== undefined) {
            this.client = client;
            this.rest = client.rest;
        } else this.rest = new RESTManager();
        this.fromPayload(data);
    }
    fromPayload(data) {
        this.id = data.id;
        this.type = data.type;
        this.channelID = data.channel_id;
        this.guildID = data.guild_id;
        this.user = data.user === undefined || this.client === undefined ? undefined : new User(this.client, data.user);
        if (data.user !== undefined && this.client === undefined) this.userRaw = data.user;
        this.name = data.name;
        this.avatar = data.avatar;
        this.token = data.token;
        this.applicationID = data.application_id;
        return this;
    }
    /** Sends a Message through Webhook. */ async send(text, option) {
        if (typeof text === 'object') {
            option = text;
            text = undefined;
        }
        if (text === undefined && option === undefined) {
            throw new Error('Either text or option is necessary.');
        }
        if (option instanceof Embed) option = {
            embeds: [
                option
            ]
        };
        const payload = {
            content: text,
            embeds: option?.embed !== undefined ? [
                option.embed
            ] : option?.embeds !== undefined ? option.embeds : undefined,
            file: option?.file,
            files: option?.files,
            tts: option?.tts,
            allowed_mentions: option?.allowedMentions,
            username: undefined,
            avatar_url: undefined
        };
        if (option?.name !== undefined) {
            payload.username = option?.name;
        }
        if (option?.avatar !== undefined) {
            payload.avatar_url = option?.avatar;
        }
        if (payload.embeds !== undefined && payload.embeds instanceof Array && payload.embeds.length > 10) throw new Error(`Cannot send more than 10 embeds through Webhook`);
        const resp = await this.rest.post(this.url + '?wait=true', payload);
        const res = new Message(this.client, resp, this, this);
        await res.mentions.fromPayload(resp);
        return res;
    }
    /**
   * Creates a Webhook object from URL
   * @param url URL of the Webhook
   * @param client Client (bot) object, if any.
   */ static async fromURL(url, client) {
        const rest = client !== undefined ? client.rest : new RESTManager();
        const raw = await rest.get(typeof url === 'string' ? url : url.toString());
        if (typeof raw !== 'object') throw new Error(`Failed to load Webhook from URL: ${url}`);
        const webhook = new Webhook(raw, client, rest);
        return webhook;
    }
    /**
   * Edits the Webhook name, avatar, or channel (requires authentication).
   * @param options Options to edit the Webhook.
   */ async edit(options) {
        if (options.channelID !== undefined && this.client === undefined) throw new Error('Authentication is required for editing Webhook Channel');
        if (options.avatar !== undefined && (options.avatar.startsWith('http:') || options.avatar.startsWith('https:'))) {
            options.avatar = await fetchAuto(options.avatar);
        }
        const data = await this.rest.patch(this.url, options);
        this.fromPayload(data);
        return this;
    }
    /** Deletes the Webhook. */ async delete() {
        await this.rest.delete(this.url);
        return true;
    }
    async editMessage(message, data) {
        await this.client?.rest.patch(WEBHOOK_MESSAGE(this.id, this.token ?? this.client.token, typeof message === 'string' ? message : message.id), data);
        return this;
    }
    async deleteMessage(message) {
        await this.client?.rest.delete(WEBHOOK_MESSAGE(this.id, this.token ?? this.client.token, typeof message === 'string' ? message : message.id));
        return this;
    }
    static async create(channel, client, body) {
        if (typeof channel === 'object') channel = channel.id;
        const webhook = await client.rest.post(CHANNEL_WEBHOOKS(channel), body);
        return new Webhook(webhook);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvd2ViaG9vay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgeyBSRVNUTWFuYWdlciB9IGZyb20gJy4uL3Jlc3QvbW9kLnRzJ1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlT3B0aW9ucyB9IGZyb20gJy4uL3R5cGVzL2NoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IFVzZXJQYXlsb2FkIH0gZnJvbSAnLi4vdHlwZXMvdXNlci50cydcbmltcG9ydCB0eXBlIHsgV2ViaG9va1BheWxvYWQgfSBmcm9tICcuLi90eXBlcy93ZWJob29rLnRzJ1xuaW1wb3J0IHsgRW1iZWQgfSBmcm9tICcuL2VtYmVkLnRzJ1xuaW1wb3J0IHsgTWVzc2FnZSwgTWVzc2FnZUF0dGFjaG1lbnQgfSBmcm9tICcuL21lc3NhZ2UudHMnXG5pbXBvcnQgdHlwZSB7IFRleHRDaGFubmVsIH0gZnJvbSAnLi90ZXh0Q2hhbm5lbC50cydcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3VzZXIudHMnXG5pbXBvcnQgeyBmZXRjaEF1dG8gfSBmcm9tICcuLi8uLi9kZXBzLnRzJ1xuaW1wb3J0IHsgV0VCSE9PS19NRVNTQUdFLCBDSEFOTkVMX1dFQkhPT0tTIH0gZnJvbSAnLi4vdHlwZXMvZW5kcG9pbnQudHMnXG5pbXBvcnQgeyBDb25zdGFudHMgfSBmcm9tICcuLi90eXBlcy9jb25zdGFudHMudHMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgV2ViaG9va01lc3NhZ2VPcHRpb25zIGV4dGVuZHMgTWVzc2FnZU9wdGlvbnMge1xuICBlbWJlZHM/OiBFbWJlZFtdXG4gIG5hbWU/OiBzdHJpbmdcbiAgYXZhdGFyPzogc3RyaW5nXG59XG5cbmV4cG9ydCB0eXBlIEFsbFdlYmhvb2tNZXNzYWdlT3B0aW9ucyA9IHN0cmluZyB8IFdlYmhvb2tNZXNzYWdlT3B0aW9uc1xuXG5leHBvcnQgaW50ZXJmYWNlIFdlYmhvb2tFZGl0T3B0aW9ucyB7XG4gIC8qKiBOZXcgbmFtZSB0byBzZXQgZm9yIFdlYmhvb2suICovXG4gIG5hbWU/OiBzdHJpbmdcbiAgLyoqIE5ldyBhdmF0YXIgdG8gc2V0IGZvciBXZWJob29rLiBVUkwgb2YgaW1hZ2Ugb3IgYmFzZTY0IGVuY29kZWQgZGF0YS4gKi9cbiAgYXZhdGFyPzogc3RyaW5nXG4gIC8qKiBOZXcgY2hhbm5lbCBmb3IgV2ViaG9vay4gUmVxdWlyZXMgYXV0aGVudGljYXRpb24uICovXG4gIGNoYW5uZWxJRD86IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFdlYmhvb2tDcmVhdGVPcHRpb25zIHtcbiAgLyoqIE5hbWUgb2YgdGhlIFdlYmhvb2suICovXG4gIG5hbWU6IHN0cmluZ1xuICAvKiogQmFzZTY0IGltYWdlICovXG4gIGF2YXRhcj86IHN0cmluZ1xufVxuXG4vKiogV2ViaG9vayBmb2xsb3dzIGRpZmZlcmVudCB3YXkgb2YgaW5zdGFudGlhdGlvbiAqL1xuZXhwb3J0IGNsYXNzIFdlYmhvb2sge1xuICBjbGllbnQ/OiBDbGllbnRcbiAgaWQhOiBzdHJpbmdcbiAgdHlwZSE6IDEgfCAyXG4gIGd1aWxkSUQ/OiBzdHJpbmdcbiAgY2hhbm5lbElEITogc3RyaW5nXG4gIHVzZXI/OiBVc2VyXG4gIHVzZXJSYXc/OiBVc2VyUGF5bG9hZFxuICBuYW1lPzogc3RyaW5nXG4gIGF2YXRhcj86IHN0cmluZ1xuICB0b2tlbj86IHN0cmluZ1xuICBhcHBsaWNhdGlvbklEPzogc3RyaW5nXG4gIHJlc3Q6IFJFU1RNYW5hZ2VyXG5cbiAgZ2V0IHVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHtDb25zdGFudHMuRElTQ09SRF9BUElfVVJMfS92JHtcbiAgICAgIHRoaXMucmVzdC52ZXJzaW9uID8/IENvbnN0YW50cy5ESVNDT1JEX0FQSV9WRVJTSU9OXG4gICAgfS93ZWJob29rcy8ke3RoaXMuaWR9LyR7dGhpcy50b2tlbn1gXG4gIH1cblxuICBjb25zdHJ1Y3RvcihkYXRhOiBXZWJob29rUGF5bG9hZCwgY2xpZW50PzogQ2xpZW50LCByZXN0PzogUkVTVE1hbmFnZXIpIHtcbiAgICBpZiAocmVzdCAhPT0gdW5kZWZpbmVkKSB0aGlzLnJlc3QgPSByZXN0XG4gICAgZWxzZSBpZiAoY2xpZW50ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuY2xpZW50ID0gY2xpZW50XG4gICAgICB0aGlzLnJlc3QgPSBjbGllbnQucmVzdFxuICAgIH0gZWxzZSB0aGlzLnJlc3QgPSBuZXcgUkVTVE1hbmFnZXIoKVxuICAgIHRoaXMuZnJvbVBheWxvYWQoZGF0YSlcbiAgfVxuXG4gIHByaXZhdGUgZnJvbVBheWxvYWQoZGF0YTogV2ViaG9va1BheWxvYWQpOiB0aGlzIHtcbiAgICB0aGlzLmlkID0gZGF0YS5pZFxuICAgIHRoaXMudHlwZSA9IGRhdGEudHlwZVxuICAgIHRoaXMuY2hhbm5lbElEID0gZGF0YS5jaGFubmVsX2lkXG4gICAgdGhpcy5ndWlsZElEID0gZGF0YS5ndWlsZF9pZFxuICAgIHRoaXMudXNlciA9XG4gICAgICBkYXRhLnVzZXIgPT09IHVuZGVmaW5lZCB8fCB0aGlzLmNsaWVudCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgIDogbmV3IFVzZXIodGhpcy5jbGllbnQsIGRhdGEudXNlcilcbiAgICBpZiAoZGF0YS51c2VyICE9PSB1bmRlZmluZWQgJiYgdGhpcy5jbGllbnQgPT09IHVuZGVmaW5lZClcbiAgICAgIHRoaXMudXNlclJhdyA9IGRhdGEudXNlclxuICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZVxuICAgIHRoaXMuYXZhdGFyID0gZGF0YS5hdmF0YXJcbiAgICB0aGlzLnRva2VuID0gZGF0YS50b2tlblxuICAgIHRoaXMuYXBwbGljYXRpb25JRCA9IGRhdGEuYXBwbGljYXRpb25faWRcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogU2VuZHMgYSBNZXNzYWdlIHRocm91Z2ggV2ViaG9vay4gKi9cbiAgYXN5bmMgc2VuZChcbiAgICB0ZXh0Pzogc3RyaW5nIHwgQWxsV2ViaG9va01lc3NhZ2VPcHRpb25zLFxuICAgIG9wdGlvbj86IEFsbFdlYmhvb2tNZXNzYWdlT3B0aW9uc1xuICApOiBQcm9taXNlPE1lc3NhZ2U+IHtcbiAgICBpZiAodHlwZW9mIHRleHQgPT09ICdvYmplY3QnKSB7XG4gICAgICBvcHRpb24gPSB0ZXh0XG4gICAgICB0ZXh0ID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgaWYgKHRleHQgPT09IHVuZGVmaW5lZCAmJiBvcHRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdFaXRoZXIgdGV4dCBvciBvcHRpb24gaXMgbmVjZXNzYXJ5LicpXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIEVtYmVkKVxuICAgICAgb3B0aW9uID0ge1xuICAgICAgICBlbWJlZHM6IFtvcHRpb25dXG4gICAgICB9XG5cbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgY29udGVudDogdGV4dCxcbiAgICAgIGVtYmVkczpcbiAgICAgICAgKG9wdGlvbiBhcyBXZWJob29rTWVzc2FnZU9wdGlvbnMpPy5lbWJlZCAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyBbKG9wdGlvbiBhcyBXZWJob29rTWVzc2FnZU9wdGlvbnMpLmVtYmVkXVxuICAgICAgICAgIDogKG9wdGlvbiBhcyBXZWJob29rTWVzc2FnZU9wdGlvbnMpPy5lbWJlZHMgIT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gKG9wdGlvbiBhcyBXZWJob29rTWVzc2FnZU9wdGlvbnMpLmVtYmVkc1xuICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgZmlsZTogKG9wdGlvbiBhcyBXZWJob29rTWVzc2FnZU9wdGlvbnMpPy5maWxlLFxuICAgICAgZmlsZXM6IChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKT8uZmlsZXMsXG4gICAgICB0dHM6IChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKT8udHRzLFxuICAgICAgYWxsb3dlZF9tZW50aW9uczogKG9wdGlvbiBhcyBXZWJob29rTWVzc2FnZU9wdGlvbnMpPy5hbGxvd2VkTWVudGlvbnMsXG4gICAgICB1c2VybmFtZTogdW5kZWZpbmVkIGFzIHVuZGVmaW5lZCB8IHN0cmluZyxcbiAgICAgIGF2YXRhcl91cmw6IHVuZGVmaW5lZCBhcyB1bmRlZmluZWQgfCBzdHJpbmdcbiAgICB9XG5cbiAgICBpZiAoKG9wdGlvbiBhcyBXZWJob29rTWVzc2FnZU9wdGlvbnMpPy5uYW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHBheWxvYWQudXNlcm5hbWUgPSAob3B0aW9uIGFzIFdlYmhvb2tNZXNzYWdlT3B0aW9ucyk/Lm5hbWVcbiAgICB9XG5cbiAgICBpZiAoKG9wdGlvbiBhcyBXZWJob29rTWVzc2FnZU9wdGlvbnMpPy5hdmF0YXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcGF5bG9hZC5hdmF0YXJfdXJsID0gKG9wdGlvbiBhcyBXZWJob29rTWVzc2FnZU9wdGlvbnMpPy5hdmF0YXJcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBwYXlsb2FkLmVtYmVkcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBwYXlsb2FkLmVtYmVkcyBpbnN0YW5jZW9mIEFycmF5ICYmXG4gICAgICBwYXlsb2FkLmVtYmVkcy5sZW5ndGggPiAxMFxuICAgIClcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2Fubm90IHNlbmQgbW9yZSB0aGFuIDEwIGVtYmVkcyB0aHJvdWdoIFdlYmhvb2tgKVxuXG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMucmVzdC5wb3N0KHRoaXMudXJsICsgJz93YWl0PXRydWUnLCBwYXlsb2FkKVxuXG4gICAgY29uc3QgcmVzID0gbmV3IE1lc3NhZ2UoXG4gICAgICB0aGlzLmNsaWVudCBhcyBDbGllbnQsXG4gICAgICByZXNwLFxuICAgICAgdGhpcyBhcyB1bmtub3duIGFzIFRleHRDaGFubmVsLFxuICAgICAgdGhpcyBhcyB1bmtub3duIGFzIFVzZXJcbiAgICApXG4gICAgYXdhaXQgcmVzLm1lbnRpb25zLmZyb21QYXlsb2FkKHJlc3ApXG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBXZWJob29rIG9iamVjdCBmcm9tIFVSTFxuICAgKiBAcGFyYW0gdXJsIFVSTCBvZiB0aGUgV2ViaG9va1xuICAgKiBAcGFyYW0gY2xpZW50IENsaWVudCAoYm90KSBvYmplY3QsIGlmIGFueS5cbiAgICovXG4gIHN0YXRpYyBhc3luYyBmcm9tVVJMKHVybDogc3RyaW5nIHwgVVJMLCBjbGllbnQ/OiBDbGllbnQpOiBQcm9taXNlPFdlYmhvb2s+IHtcbiAgICBjb25zdCByZXN0ID0gY2xpZW50ICE9PSB1bmRlZmluZWQgPyBjbGllbnQucmVzdCA6IG5ldyBSRVNUTWFuYWdlcigpXG5cbiAgICBjb25zdCByYXcgPSBhd2FpdCByZXN0LmdldCh0eXBlb2YgdXJsID09PSAnc3RyaW5nJyA/IHVybCA6IHVybC50b1N0cmluZygpKVxuICAgIGlmICh0eXBlb2YgcmF3ICE9PSAnb2JqZWN0JylcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgV2ViaG9vayBmcm9tIFVSTDogJHt1cmx9YClcblxuICAgIGNvbnN0IHdlYmhvb2sgPSBuZXcgV2ViaG9vayhyYXcsIGNsaWVudCwgcmVzdClcbiAgICByZXR1cm4gd2ViaG9va1xuICB9XG5cbiAgLyoqXG4gICAqIEVkaXRzIHRoZSBXZWJob29rIG5hbWUsIGF2YXRhciwgb3IgY2hhbm5lbCAocmVxdWlyZXMgYXV0aGVudGljYXRpb24pLlxuICAgKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIHRvIGVkaXQgdGhlIFdlYmhvb2suXG4gICAqL1xuICBhc3luYyBlZGl0KG9wdGlvbnM6IFdlYmhvb2tFZGl0T3B0aW9ucyk6IFByb21pc2U8V2ViaG9vaz4ge1xuICAgIGlmIChvcHRpb25zLmNoYW5uZWxJRCAhPT0gdW5kZWZpbmVkICYmIHRoaXMuY2xpZW50ID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0F1dGhlbnRpY2F0aW9uIGlzIHJlcXVpcmVkIGZvciBlZGl0aW5nIFdlYmhvb2sgQ2hhbm5lbCcpXG4gICAgaWYgKFxuICAgICAgb3B0aW9ucy5hdmF0YXIgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgKG9wdGlvbnMuYXZhdGFyLnN0YXJ0c1dpdGgoJ2h0dHA6JykgfHxcbiAgICAgICAgb3B0aW9ucy5hdmF0YXIuc3RhcnRzV2l0aCgnaHR0cHM6JykpXG4gICAgKSB7XG4gICAgICBvcHRpb25zLmF2YXRhciA9IGF3YWl0IGZldGNoQXV0byhvcHRpb25zLmF2YXRhcilcbiAgICB9XG5cbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5yZXN0LnBhdGNoKHRoaXMudXJsLCBvcHRpb25zKVxuICAgIHRoaXMuZnJvbVBheWxvYWQoZGF0YSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogRGVsZXRlcyB0aGUgV2ViaG9vay4gKi9cbiAgYXN5bmMgZGVsZXRlKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGF3YWl0IHRoaXMucmVzdC5kZWxldGUodGhpcy51cmwpXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIGFzeW5jIGVkaXRNZXNzYWdlKFxuICAgIG1lc3NhZ2U6IHN0cmluZyB8IE1lc3NhZ2UsXG4gICAgZGF0YToge1xuICAgICAgY29udGVudD86IHN0cmluZ1xuICAgICAgZW1iZWRzPzogRW1iZWRbXVxuICAgICAgZmlsZT86IE1lc3NhZ2VBdHRhY2htZW50XG4gICAgICBhbGxvd2VkX21lbnRpb25zPzoge1xuICAgICAgICBwYXJzZT86IHN0cmluZ1xuICAgICAgICByb2xlcz86IHN0cmluZ1tdXG4gICAgICAgIHVzZXJzPzogc3RyaW5nW11cbiAgICAgICAgZXZlcnlvbmU/OiBib29sZWFuXG4gICAgICB9XG4gICAgfVxuICApOiBQcm9taXNlPFdlYmhvb2s+IHtcbiAgICBhd2FpdCB0aGlzLmNsaWVudD8ucmVzdC5wYXRjaChcbiAgICAgIFdFQkhPT0tfTUVTU0FHRShcbiAgICAgICAgdGhpcy5pZCxcbiAgICAgICAgKHRoaXMudG9rZW4gPz8gdGhpcy5jbGllbnQudG9rZW4pIGFzIHN0cmluZyxcbiAgICAgICAgdHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnID8gbWVzc2FnZSA6IG1lc3NhZ2UuaWRcbiAgICAgICksXG4gICAgICBkYXRhXG4gICAgKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBhc3luYyBkZWxldGVNZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyB8IE1lc3NhZ2UpOiBQcm9taXNlPFdlYmhvb2s+IHtcbiAgICBhd2FpdCB0aGlzLmNsaWVudD8ucmVzdC5kZWxldGUoXG4gICAgICBXRUJIT09LX01FU1NBR0UoXG4gICAgICAgIHRoaXMuaWQsXG4gICAgICAgICh0aGlzLnRva2VuID8/IHRoaXMuY2xpZW50LnRva2VuKSBhcyBzdHJpbmcsXG4gICAgICAgIHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJyA/IG1lc3NhZ2UgOiBtZXNzYWdlLmlkXG4gICAgICApXG4gICAgKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGF0aWMgYXN5bmMgY3JlYXRlKFxuICAgIGNoYW5uZWw6IHN0cmluZyB8IFRleHRDaGFubmVsLFxuICAgIGNsaWVudDogQ2xpZW50LFxuICAgIGJvZHk6IFdlYmhvb2tDcmVhdGVPcHRpb25zXG4gICk6IFByb21pc2U8V2ViaG9vaz4ge1xuICAgIGlmICh0eXBlb2YgY2hhbm5lbCA9PT0gJ29iamVjdCcpIGNoYW5uZWwgPSBjaGFubmVsLmlkXG4gICAgY29uc3Qgd2ViaG9vayA9IGF3YWl0IGNsaWVudC5yZXN0LnBvc3QoQ0hBTk5FTF9XRUJIT09LUyhjaGFubmVsKSwgYm9keSlcbiAgICByZXR1cm4gbmV3IFdlYmhvb2sod2ViaG9vaylcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFw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