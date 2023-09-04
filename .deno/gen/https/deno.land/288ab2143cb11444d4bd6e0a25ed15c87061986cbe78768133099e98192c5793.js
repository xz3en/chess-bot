import { MessagesManager } from '../managers/messages.ts';
import { MESSAGE_REACTION_ME, MESSAGE_REACTION_USER, CHANNEL_WEBHOOKS } from '../types/endpoint.ts';
import { Collection } from '../utils/collection.ts';
import { Channel } from './channel.ts';
import { Embed } from './embed.ts';
import { Emoji } from './emoji.ts';
import { Message } from './message.ts';
import { Webhook } from './webhook.ts';
/** Channel object for Text Channel type */ export class TextChannel extends Channel {
    lastMessageID;
    lastPinTimestamp;
    messages;
    constructor(client, data){
        super(client, data);
        this.messages = new MessagesManager(this.client, this);
        this.readFromData(data);
    }
    readFromData(data) {
        super.readFromData(data);
        this.lastMessageID = data.last_message_id ?? this.lastMessageID;
        this.lastPinTimestamp = data.last_pin_timestamp ?? this.lastPinTimestamp;
    }
    /**
   * @param content Text content of the Message to send.
   * @param option Various other Message options.
   * @param reply Reference to a Message object to reply-to.
   */ async send(content, option, reply) {
        if (typeof content === 'object') {
            option = content;
            content = undefined;
        }
        if (option instanceof Array) {
            option = {
                embeds: option
            };
        }
        if (option instanceof Embed) {
            option = {
                embeds: [
                    option
                ]
            };
        }
        return this.client.channels.sendMessage(this, content, {
            allowedMentions: this.client.defaultAllowedMentions,
            ...option,
            reply
        });
    }
    /**
   *
   * @param message Message to edit. ID or the Message object itself.
   * @param text New text contents of the Message.
   * @param option Other options to edit the message.
   */ async editMessage(message, text, option) {
        return this.client.channels.editMessage(this, message, text, option);
    }
    /** Add a reaction to a Message in this Channel */ async addReaction(message, emoji) {
        if (emoji instanceof Emoji) {
            emoji = `${emoji.name}:${emoji.id}`;
        } else if (emoji.length > 4) {
            if (!isNaN(Number(emoji))) {
                const findEmoji = await this.client.emojis.get(emoji);
                if (findEmoji !== undefined) emoji = `${findEmoji.name}:${findEmoji.id}`;
                else throw new Error(`Emoji not found: ${emoji}`);
            } else {
                // strip out the <>
                emoji = emoji[0] === '<' ? emoji.substring(1) : emoji;
                emoji = emoji[emoji.length - 1] === '>' ? emoji.substring(0, emoji.length - 2) : emoji;
            }
        }
        if (message instanceof Message) message = message.id;
        const encodedEmoji = encodeURI(emoji);
        await this.client.rest.put(MESSAGE_REACTION_ME(this.id, message, encodedEmoji));
    }
    /** Remove Reaction from a Message in this Channel */ async removeReaction(message, emoji, user) {
        if (emoji instanceof Emoji) {
            emoji = `${emoji.name}:${emoji.id}`;
        } else if (emoji.length > 4) {
            if (!isNaN(Number(emoji))) {
                const findEmoji = await this.client.emojis.get(emoji);
                if (findEmoji !== undefined) emoji = `${findEmoji.name}:${findEmoji.id}`;
                else throw new Error(`Emoji not found: ${emoji}`);
            } else {
                // strip out the <>
                emoji = emoji[0] === '<' ? emoji.substring(1) : emoji;
                emoji = emoji[emoji.length - 1] === '>' ? emoji.substring(0, emoji.length - 2) : emoji;
            }
        }
        if (message instanceof Message) message = message.id;
        if (user !== undefined) {
            if (typeof user !== 'string') {
                user = user.id;
            }
        }
        const encodedEmoji = encodeURI(emoji);
        if (user === undefined) {
            await this.client.rest.delete(MESSAGE_REACTION_ME(this.id, message, encodedEmoji));
        } else {
            await this.client.rest.delete(MESSAGE_REACTION_USER(this.id, message, encodedEmoji, user));
        }
    }
    /**
   * Fetch Messages of a Channel
   * @param options Options to configure fetching Messages
   */ async fetchMessages(options) {
        const res = new Collection();
        const raws = await this.client.rest.api.channels[this.id].messages.get({
            limit: options?.limit ?? 50,
            around: options?.around === undefined ? undefined : typeof options.around === 'string' ? options.around : options.around.id,
            before: options?.before === undefined ? undefined : typeof options.before === 'string' ? options.before : options.before.id,
            after: options?.after === undefined ? undefined : typeof options.after === 'string' ? options.after : options.after.id
        });
        for (const raw of raws){
            await this.messages.set(raw.id, raw);
            const msg = await this.messages.get(raw.id);
            res.set(msg.id, msg);
        }
        return res;
    }
    async getPinnedMessages() {
        return this.client.channels.getPinnedMessages(this);
    }
    async pinMessage(message) {
        return this.client.channels.pinMessage(this, message);
    }
    async unpinMessage(message) {
        return this.client.channels.unpinMessage(this, message);
    }
    /** Trigger the typing indicator. NOT recommended to be used by bots unless you really want to. */ async triggerTyping() {
        await this.client.rest.api.channels[this.id].typing.post();
        return this;
    }
    /** Fetches the webhooks associated with a channel */ async fetchWebhooks() {
        const webhooks = await this.client.rest.get(CHANNEL_WEBHOOKS(this.id));
        return webhooks.map((e)=>new Webhook(e, this.client, this.client.rest));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvdGV4dENoYW5uZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTWVzc2FnZXNNYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlcnMvbWVzc2FnZXMudHMnXG5pbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgdHlwZSB7XG4gIE1lc3NhZ2VPcHRpb25zLFxuICBNZXNzYWdlUGF5bG9hZCxcbiAgVGV4dENoYW5uZWxQYXlsb2FkXG59IGZyb20gJy4uL3R5cGVzL2NoYW5uZWwudHMnXG5pbXBvcnQge1xuICBNRVNTQUdFX1JFQUNUSU9OX01FLFxuICBNRVNTQUdFX1JFQUNUSU9OX1VTRVIsXG4gIENIQU5ORUxfV0VCSE9PS1Ncbn0gZnJvbSAnLi4vdHlwZXMvZW5kcG9pbnQudHMnXG5pbXBvcnQgeyBDb2xsZWN0aW9uIH0gZnJvbSAnLi4vdXRpbHMvY29sbGVjdGlvbi50cydcbmltcG9ydCB7IENoYW5uZWwgfSBmcm9tICcuL2NoYW5uZWwudHMnXG5pbXBvcnQgeyBFbWJlZCB9IGZyb20gJy4vZW1iZWQudHMnXG5pbXBvcnQgeyBFbW9qaSB9IGZyb20gJy4vZW1vamkudHMnXG5pbXBvcnQgdHlwZSB7IE1lbWJlciB9IGZyb20gJy4vbWVtYmVyLnRzJ1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gJy4vbWVzc2FnZS50cydcbmltcG9ydCB0eXBlIHsgVXNlciB9IGZyb20gJy4vdXNlci50cydcbmltcG9ydCB7IFdlYmhvb2sgfSBmcm9tICcuL3dlYmhvb2sudHMnXG5pbXBvcnQgdHlwZSB7IFdlYmhvb2tQYXlsb2FkIH0gZnJvbSAnLi4vdHlwZXMvd2ViaG9vay50cydcblxuZXhwb3J0IHR5cGUgQWxsTWVzc2FnZU9wdGlvbnMgPSBNZXNzYWdlT3B0aW9ucyB8IEVtYmVkXG5cbi8qKiBDaGFubmVsIG9iamVjdCBmb3IgVGV4dCBDaGFubmVsIHR5cGUgKi9cbmV4cG9ydCBjbGFzcyBUZXh0Q2hhbm5lbCBleHRlbmRzIENoYW5uZWwge1xuICBsYXN0TWVzc2FnZUlEPzogc3RyaW5nXG4gIGxhc3RQaW5UaW1lc3RhbXA/OiBzdHJpbmdcbiAgbWVzc2FnZXM6IE1lc3NhZ2VzTWFuYWdlclxuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50LCBkYXRhOiBUZXh0Q2hhbm5lbFBheWxvYWQpIHtcbiAgICBzdXBlcihjbGllbnQsIGRhdGEpXG4gICAgdGhpcy5tZXNzYWdlcyA9IG5ldyBNZXNzYWdlc01hbmFnZXIodGhpcy5jbGllbnQsIHRoaXMpXG4gICAgdGhpcy5yZWFkRnJvbURhdGEoZGF0YSlcbiAgfVxuXG4gIHJlYWRGcm9tRGF0YShkYXRhOiBUZXh0Q2hhbm5lbFBheWxvYWQpOiB2b2lkIHtcbiAgICBzdXBlci5yZWFkRnJvbURhdGEoZGF0YSlcbiAgICB0aGlzLmxhc3RNZXNzYWdlSUQgPSBkYXRhLmxhc3RfbWVzc2FnZV9pZCA/PyB0aGlzLmxhc3RNZXNzYWdlSURcbiAgICB0aGlzLmxhc3RQaW5UaW1lc3RhbXAgPSBkYXRhLmxhc3RfcGluX3RpbWVzdGFtcCA/PyB0aGlzLmxhc3RQaW5UaW1lc3RhbXBcbiAgfVxuXG4gIC8qKlxuICAgKiBAcGFyYW0gY29udGVudCBUZXh0IGNvbnRlbnQgb2YgdGhlIE1lc3NhZ2UgdG8gc2VuZC5cbiAgICogQHBhcmFtIG9wdGlvbiBWYXJpb3VzIG90aGVyIE1lc3NhZ2Ugb3B0aW9ucy5cbiAgICogQHBhcmFtIHJlcGx5IFJlZmVyZW5jZSB0byBhIE1lc3NhZ2Ugb2JqZWN0IHRvIHJlcGx5LXRvLlxuICAgKi9cbiAgYXN5bmMgc2VuZChcbiAgICBjb250ZW50Pzogc3RyaW5nIHwgQWxsTWVzc2FnZU9wdGlvbnMsXG4gICAgb3B0aW9uPzogQWxsTWVzc2FnZU9wdGlvbnMsXG4gICAgcmVwbHk/OiBNZXNzYWdlXG4gICk6IFByb21pc2U8TWVzc2FnZT4ge1xuICAgIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ29iamVjdCcpIHtcbiAgICAgIG9wdGlvbiA9IGNvbnRlbnRcbiAgICAgIGNvbnRlbnQgPSB1bmRlZmluZWRcbiAgICB9XG4gICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICBvcHRpb24gPSB7IGVtYmVkczogb3B0aW9uIH1cbiAgICB9XG4gICAgaWYgKG9wdGlvbiBpbnN0YW5jZW9mIEVtYmVkKSB7XG4gICAgICBvcHRpb24gPSB7IGVtYmVkczogW29wdGlvbl0gfVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5jbGllbnQuY2hhbm5lbHMuc2VuZE1lc3NhZ2UodGhpcywgY29udGVudCwge1xuICAgICAgYWxsb3dlZE1lbnRpb25zOiB0aGlzLmNsaWVudC5kZWZhdWx0QWxsb3dlZE1lbnRpb25zLFxuICAgICAgLi4ub3B0aW9uLFxuICAgICAgcmVwbHlcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqXG4gICAqIEBwYXJhbSBtZXNzYWdlIE1lc3NhZ2UgdG8gZWRpdC4gSUQgb3IgdGhlIE1lc3NhZ2Ugb2JqZWN0IGl0c2VsZi5cbiAgICogQHBhcmFtIHRleHQgTmV3IHRleHQgY29udGVudHMgb2YgdGhlIE1lc3NhZ2UuXG4gICAqIEBwYXJhbSBvcHRpb24gT3RoZXIgb3B0aW9ucyB0byBlZGl0IHRoZSBtZXNzYWdlLlxuICAgKi9cbiAgYXN5bmMgZWRpdE1lc3NhZ2UoXG4gICAgbWVzc2FnZTogTWVzc2FnZSB8IHN0cmluZyxcbiAgICB0ZXh0Pzogc3RyaW5nLFxuICAgIG9wdGlvbj86IE1lc3NhZ2VPcHRpb25zXG4gICk6IFByb21pc2U8TWVzc2FnZT4ge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5jaGFubmVscy5lZGl0TWVzc2FnZSh0aGlzLCBtZXNzYWdlLCB0ZXh0LCBvcHRpb24pXG4gIH1cblxuICAvKiogQWRkIGEgcmVhY3Rpb24gdG8gYSBNZXNzYWdlIGluIHRoaXMgQ2hhbm5lbCAqL1xuICBhc3luYyBhZGRSZWFjdGlvbihcbiAgICBtZXNzYWdlOiBNZXNzYWdlIHwgc3RyaW5nLFxuICAgIGVtb2ppOiBFbW9qaSB8IHN0cmluZ1xuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoZW1vamkgaW5zdGFuY2VvZiBFbW9qaSkge1xuICAgICAgZW1vamkgPSBgJHtlbW9qaS5uYW1lfToke2Vtb2ppLmlkfWBcbiAgICB9IGVsc2UgaWYgKGVtb2ppLmxlbmd0aCA+IDQpIHtcbiAgICAgIGlmICghaXNOYU4oTnVtYmVyKGVtb2ppKSkpIHtcbiAgICAgICAgY29uc3QgZmluZEVtb2ppID0gYXdhaXQgdGhpcy5jbGllbnQuZW1vamlzLmdldChlbW9qaSlcbiAgICAgICAgaWYgKGZpbmRFbW9qaSAhPT0gdW5kZWZpbmVkKSBlbW9qaSA9IGAke2ZpbmRFbW9qaS5uYW1lfToke2ZpbmRFbW9qaS5pZH1gXG4gICAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yKGBFbW9qaSBub3QgZm91bmQ6ICR7ZW1vaml9YClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHN0cmlwIG91dCB0aGUgPD5cbiAgICAgICAgZW1vamkgPSBlbW9qaVswXSA9PT0gJzwnID8gZW1vamkuc3Vic3RyaW5nKDEpIDogZW1vamlcbiAgICAgICAgZW1vamkgPVxuICAgICAgICAgIGVtb2ppW2Vtb2ppLmxlbmd0aCAtIDFdID09PSAnPidcbiAgICAgICAgICAgID8gZW1vamkuc3Vic3RyaW5nKDAsIGVtb2ppLmxlbmd0aCAtIDIpXG4gICAgICAgICAgICA6IGVtb2ppXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChtZXNzYWdlIGluc3RhbmNlb2YgTWVzc2FnZSkgbWVzc2FnZSA9IG1lc3NhZ2UuaWRcbiAgICBjb25zdCBlbmNvZGVkRW1vamkgPSBlbmNvZGVVUkkoZW1vamkpXG5cbiAgICBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LnB1dChcbiAgICAgIE1FU1NBR0VfUkVBQ1RJT05fTUUodGhpcy5pZCwgbWVzc2FnZSwgZW5jb2RlZEVtb2ppKVxuICAgIClcbiAgfVxuXG4gIC8qKiBSZW1vdmUgUmVhY3Rpb24gZnJvbSBhIE1lc3NhZ2UgaW4gdGhpcyBDaGFubmVsICovXG4gIGFzeW5jIHJlbW92ZVJlYWN0aW9uKFxuICAgIG1lc3NhZ2U6IE1lc3NhZ2UgfCBzdHJpbmcsXG4gICAgZW1vamk6IEVtb2ppIHwgc3RyaW5nLFxuICAgIHVzZXI/OiBVc2VyIHwgTWVtYmVyIHwgc3RyaW5nXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmIChlbW9qaSBpbnN0YW5jZW9mIEVtb2ppKSB7XG4gICAgICBlbW9qaSA9IGAke2Vtb2ppLm5hbWV9OiR7ZW1vamkuaWR9YFxuICAgIH0gZWxzZSBpZiAoZW1vamkubGVuZ3RoID4gNCkge1xuICAgICAgaWYgKCFpc05hTihOdW1iZXIoZW1vamkpKSkge1xuICAgICAgICBjb25zdCBmaW5kRW1vamkgPSBhd2FpdCB0aGlzLmNsaWVudC5lbW9qaXMuZ2V0KGVtb2ppKVxuICAgICAgICBpZiAoZmluZEVtb2ppICE9PSB1bmRlZmluZWQpIGVtb2ppID0gYCR7ZmluZEVtb2ppLm5hbWV9OiR7ZmluZEVtb2ppLmlkfWBcbiAgICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IoYEVtb2ppIG5vdCBmb3VuZDogJHtlbW9qaX1gKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gc3RyaXAgb3V0IHRoZSA8PlxuICAgICAgICBlbW9qaSA9IGVtb2ppWzBdID09PSAnPCcgPyBlbW9qaS5zdWJzdHJpbmcoMSkgOiBlbW9qaVxuICAgICAgICBlbW9qaSA9XG4gICAgICAgICAgZW1vamlbZW1vamkubGVuZ3RoIC0gMV0gPT09ICc+J1xuICAgICAgICAgICAgPyBlbW9qaS5zdWJzdHJpbmcoMCwgZW1vamkubGVuZ3RoIC0gMilcbiAgICAgICAgICAgIDogZW1vamlcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1lc3NhZ2UgaW5zdGFuY2VvZiBNZXNzYWdlKSBtZXNzYWdlID0gbWVzc2FnZS5pZFxuICAgIGlmICh1c2VyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgdXNlciAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdXNlciA9IHVzZXIuaWRcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBlbmNvZGVkRW1vamkgPSBlbmNvZGVVUkkoZW1vamkpXG5cbiAgICBpZiAodXNlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmRlbGV0ZShcbiAgICAgICAgTUVTU0FHRV9SRUFDVElPTl9NRSh0aGlzLmlkLCBtZXNzYWdlLCBlbmNvZGVkRW1vamkpXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuZGVsZXRlKFxuICAgICAgICBNRVNTQUdFX1JFQUNUSU9OX1VTRVIodGhpcy5pZCwgbWVzc2FnZSwgZW5jb2RlZEVtb2ppLCB1c2VyKVxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBGZXRjaCBNZXNzYWdlcyBvZiBhIENoYW5uZWxcbiAgICogQHBhcmFtIG9wdGlvbnMgT3B0aW9ucyB0byBjb25maWd1cmUgZmV0Y2hpbmcgTWVzc2FnZXNcbiAgICovXG4gIGFzeW5jIGZldGNoTWVzc2FnZXMob3B0aW9ucz86IHtcbiAgICBsaW1pdD86IG51bWJlclxuICAgIGFyb3VuZD86IE1lc3NhZ2UgfCBzdHJpbmdcbiAgICBiZWZvcmU/OiBNZXNzYWdlIHwgc3RyaW5nXG4gICAgYWZ0ZXI/OiBNZXNzYWdlIHwgc3RyaW5nXG4gIH0pOiBQcm9taXNlPENvbGxlY3Rpb248c3RyaW5nLCBNZXNzYWdlPj4ge1xuICAgIGNvbnN0IHJlcyA9IG5ldyBDb2xsZWN0aW9uPHN0cmluZywgTWVzc2FnZT4oKVxuICAgIGNvbnN0IHJhd3MgPSAoYXdhaXQgdGhpcy5jbGllbnQucmVzdC5hcGkuY2hhbm5lbHNbdGhpcy5pZF0ubWVzc2FnZXMuZ2V0KHtcbiAgICAgIGxpbWl0OiBvcHRpb25zPy5saW1pdCA/PyA1MCxcbiAgICAgIGFyb3VuZDpcbiAgICAgICAgb3B0aW9ucz8uYXJvdW5kID09PSB1bmRlZmluZWRcbiAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgIDogdHlwZW9mIG9wdGlvbnMuYXJvdW5kID09PSAnc3RyaW5nJ1xuICAgICAgICAgID8gb3B0aW9ucy5hcm91bmRcbiAgICAgICAgICA6IG9wdGlvbnMuYXJvdW5kLmlkLFxuICAgICAgYmVmb3JlOlxuICAgICAgICBvcHRpb25zPy5iZWZvcmUgPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgOiB0eXBlb2Ygb3B0aW9ucy5iZWZvcmUgPT09ICdzdHJpbmcnXG4gICAgICAgICAgPyBvcHRpb25zLmJlZm9yZVxuICAgICAgICAgIDogb3B0aW9ucy5iZWZvcmUuaWQsXG4gICAgICBhZnRlcjpcbiAgICAgICAgb3B0aW9ucz8uYWZ0ZXIgPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgOiB0eXBlb2Ygb3B0aW9ucy5hZnRlciA9PT0gJ3N0cmluZydcbiAgICAgICAgICA/IG9wdGlvbnMuYWZ0ZXJcbiAgICAgICAgICA6IG9wdGlvbnMuYWZ0ZXIuaWRcbiAgICB9KSkgYXMgTWVzc2FnZVBheWxvYWRbXVxuXG4gICAgZm9yIChjb25zdCByYXcgb2YgcmF3cykge1xuICAgICAgYXdhaXQgdGhpcy5tZXNzYWdlcy5zZXQocmF3LmlkLCByYXcpXG4gICAgICBjb25zdCBtc2cgPSAoYXdhaXQgdGhpcy5tZXNzYWdlcy5nZXQocmF3LmlkKSkgYXMgdW5rbm93biBhcyBNZXNzYWdlXG4gICAgICByZXMuc2V0KG1zZy5pZCwgbXNnKVxuICAgIH1cblxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIGFzeW5jIGdldFBpbm5lZE1lc3NhZ2VzKCk6IFByb21pc2U8Q29sbGVjdGlvbjxzdHJpbmcsIE1lc3NhZ2U+PiB7XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50LmNoYW5uZWxzLmdldFBpbm5lZE1lc3NhZ2VzKHRoaXMpXG4gIH1cblxuICBhc3luYyBwaW5NZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyB8IE1lc3NhZ2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuY2hhbm5lbHMucGluTWVzc2FnZSh0aGlzLCBtZXNzYWdlKVxuICB9XG5cbiAgYXN5bmMgdW5waW5NZXNzYWdlKG1lc3NhZ2U6IHN0cmluZyB8IE1lc3NhZ2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuY2hhbm5lbHMudW5waW5NZXNzYWdlKHRoaXMsIG1lc3NhZ2UpXG4gIH1cblxuICAvKiogVHJpZ2dlciB0aGUgdHlwaW5nIGluZGljYXRvci4gTk9UIHJlY29tbWVuZGVkIHRvIGJlIHVzZWQgYnkgYm90cyB1bmxlc3MgeW91IHJlYWxseSB3YW50IHRvLiAqL1xuICBhc3luYyB0cmlnZ2VyVHlwaW5nKCk6IFByb21pc2U8VGV4dENoYW5uZWw+IHtcbiAgICBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmFwaS5jaGFubmVsc1t0aGlzLmlkXS50eXBpbmcucG9zdCgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBGZXRjaGVzIHRoZSB3ZWJob29rcyBhc3NvY2lhdGVkIHdpdGggYSBjaGFubmVsICovXG4gIGFzeW5jIGZldGNoV2ViaG9va3MoKTogUHJvbWlzZTxXZWJob29rW10+IHtcbiAgICBjb25zdCB3ZWJob29rcyA9IChhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmdldChcbiAgICAgIENIQU5ORUxfV0VCSE9PS1ModGhpcy5pZClcbiAgICApKSBhcyBXZWJob29rUGF5bG9hZFtdXG4gICAgcmV0dXJuIHdlYmhvb2tzLm1hcCgoZSkgPT4gbmV3IFdlYmhvb2soZSwgdGhpcy5jbGllbnQsIHRoaXMuY2xpZW50LnJlc3QpKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxlQUFlLFFBQVEsMEJBQXlCO0FBT3pELFNBQ0UsbUJBQW1CLEVBQ25CLHFCQUFxQixFQUNyQixnQkFBZ0Is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