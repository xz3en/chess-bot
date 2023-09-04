import { SnowflakeBase } from './base.ts';
import { User } from './user.ts';
import { Embed } from './embed.ts';
import { CHANNEL_MESSAGE } from '../types/endpoint.ts';
import { MessageMentions } from './messageMentions.ts';
import { MessageReactionsManager } from '../managers/messageReactions.ts';
import { MessageStickerItem } from './messageSticker.ts';
import { encodeText } from '../utils/encoding.ts';
import { transformComponentPayload } from '../utils/components.ts';
export class MessageInteraction extends SnowflakeBase {
    id;
    name;
    type;
    user;
    constructor(client, data){
        super(client);
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.user = new User(this.client, data.user);
    }
}
export class Message extends SnowflakeBase {
    id;
    channelID;
    channel;
    guildID;
    guild;
    author;
    member;
    content;
    editedTimestamp;
    tts;
    mentions;
    attachments;
    embeds;
    reactions;
    nonce;
    pinned;
    webhookID;
    type;
    activity;
    application;
    messageReference;
    flags;
    stickerItems;
    interaction;
    createdTimestamp;
    components = [];
    get createdAt() {
        return this.createdTimestamp // new Date(this.timestamp)
        ;
    }
    get url() {
        return CHANNEL_MESSAGE(this.channelID, this.id);
    }
    constructor(client, data, channel, author){
        super(client);
        this.id = data.id;
        this.author = author;
        this.channel = channel;
        this.mentions = new MessageMentions(this.client, this);
        this.reactions = new MessageReactionsManager(this.client, this);
        this.createdTimestamp = new Date(data.timestamp);
        this.readFromData(data);
    }
    readFromData(data) {
        this.channelID = data.channel_id ?? this.channelID;
        this.guildID = data.guild_id ?? this.guildID;
        this.content = data.content ?? this.content;
        this.editedTimestamp = data.edited_timestamp === undefined ? this.editedTimestamp : new Date(data.edited_timestamp);
        this.tts = data.tts ?? this.tts;
        this.attachments = data.attachments ?? this.attachments;
        this.embeds = data.embeds.map((v)=>new Embed(v)) ?? this.embeds;
        this.nonce = data.nonce ?? this.nonce;
        this.pinned = data.pinned ?? this.pinned;
        this.webhookID = data.webhook_id ?? this.webhookID;
        this.type = data.type ?? this.type;
        this.activity = data.activity ?? this.activity;
        this.application = data.application ?? this.application;
        this.messageReference = data.message_reference ?? this.messageReference;
        this.flags = data.flags ?? this.flags;
        this.stickerItems = data.sticker_items !== undefined ? data.sticker_items.map((payload)=>new MessageStickerItem(this.client, payload)) : this.stickerItems;
        this.interaction = data.interaction === undefined ? this.interaction : new MessageInteraction(this.client, data.interaction);
        this.components = data.components === undefined ? [] : transformComponentPayload(data.components);
    }
    async updateRefs() {
        if (this.guildID !== undefined) {
            this.guild = await this.client.guilds.get(this.guildID);
        }
        const newVal = await this.client.channels.get(this.channelID);
        if (newVal !== undefined) this.channel = newVal;
        const newUser = await this.client.users.get(this.author.id);
        if (newUser !== undefined) this.author = newUser;
        if (this.member !== undefined) {
            const newMember = await this.guild?.members.get(this.member?.id);
            if (newMember !== undefined) this.member = newMember;
        }
        if (this.channel.guild !== undefined) {
            this.guild = this.channel.guild;
        }
        if (this.guild !== undefined && this.guildID === undefined) {
            this.guildID = this.guild.id;
        }
    }
    /** Edits this message. */ async edit(content, option) {
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
        if (this.client.user !== undefined && this.author.id !== this.client.user?.id) {
            throw new Error("Cannot edit other users' messages");
        }
        return this.channel.editMessage(this.id, content, option);
    }
    /** Creates a Reply to this Message. */ async reply(content, option) {
        return this.channel.send(content, option, this);
    }
    /** Deletes the Message. */ async delete() {
        return this.client.rest.delete(CHANNEL_MESSAGE(this.channelID, this.id));
    }
    /**
   * Adds a reaction to the message.
   * @param emoji Emoji in string or object
   */ async addReaction(emoji) {
        return this.channel.addReaction(this, emoji);
    }
    /**
   * Removes a reaction to the message.
   * @param emoji Emoji in string or object
   * @param user User or Member or user id
   */ async removeReaction(emoji, user) {
        return this.channel.removeReaction(this, emoji, user);
    }
    async startThread(options) {
        if (this.channel.isGuildText() === true) {
            const chan = this.channel;
            return chan.startThread(options, this);
        } else throw new Error('Threads can only be made in Guild Text Channels');
    }
    async pinMessage() {
        return this.client.channels.pinMessage(this.channel, this);
    }
    async unpinMessage() {
        return this.client.channels.unpinMessage(this.channel, this);
    }
}
/** Message Attachment that can be sent while Creating Message */ export class MessageAttachment {
    name;
    blob;
    description;
    constructor(name, blob, description){
        this.name = name;
        this.blob = typeof blob === 'string' ? new Blob([
            encodeText(blob)
        ]) : blob instanceof Uint8Array ? new Blob([
            blob
        ]) : blob;
        this.description = description;
    }
    /** Load an Message Attachment from local file or URL */ static async load(path, filename, description) {
        const blob = path.startsWith('http') ? await fetch(path).then((res)=>res.blob()) : await Deno.readFile(path);
        if (filename === undefined) {
            const split = path.replaceAll('\\', '/').split('/').pop();
            if (split !== undefined) filename = split.split('?')[0].split('#')[0];
            else filename = 'unnamed_attachment';
        }
        return new MessageAttachment(filename, blob, description);
    }
    // So that it's not present in actual payload we send to Discord.
    // It is only attached in the FormData and some metadata is put
    // in attachments array.
    toJSON() {
        return undefined;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvbWVzc2FnZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBTbm93Zmxha2VCYXNlIH0gZnJvbSAnLi9iYXNlLnRzJ1xuaW1wb3J0IHtcbiAgQXR0YWNobWVudCxcbiAgTWVzc2FnZUFjdGl2aXR5LFxuICBNZXNzYWdlQXBwbGljYXRpb24sXG4gIE1lc3NhZ2VJbnRlcmFjdGlvblBheWxvYWQsXG4gIE1lc3NhZ2VPcHRpb25zLFxuICBNZXNzYWdlUGF5bG9hZCxcbiAgTWVzc2FnZVJlZmVyZW5jZVxufSBmcm9tICcuLi90eXBlcy9jaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdXNlci50cydcbmltcG9ydCB0eXBlIHsgTWVtYmVyIH0gZnJvbSAnLi9tZW1iZXIudHMnXG5pbXBvcnQgeyBFbWJlZCB9IGZyb20gJy4vZW1iZWQudHMnXG5pbXBvcnQgeyBDSEFOTkVMX01FU1NBR0UgfSBmcm9tICcuLi90eXBlcy9lbmRwb2ludC50cydcbmltcG9ydCB7IE1lc3NhZ2VNZW50aW9ucyB9IGZyb20gJy4vbWVzc2FnZU1lbnRpb25zLnRzJ1xuaW1wb3J0IHR5cGUgeyBUZXh0Q2hhbm5lbCB9IGZyb20gJy4vdGV4dENoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7XG4gIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbCxcbiAgR3VpbGRUZXh0Q2hhbm5lbFxufSBmcm9tICcuL2d1aWxkVGV4dENoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IEd1aWxkIH0gZnJvbSAnLi9ndWlsZC50cydcbmltcG9ydCB7IE1lc3NhZ2VSZWFjdGlvbnNNYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlcnMvbWVzc2FnZVJlYWN0aW9ucy50cydcbmltcG9ydCB7IE1lc3NhZ2VTdGlja2VySXRlbSB9IGZyb20gJy4vbWVzc2FnZVN0aWNrZXIudHMnXG5pbXBvcnQgdHlwZSB7IEVtb2ppIH0gZnJvbSAnLi9lbW9qaS50cydcbmltcG9ydCB0eXBlIHsgSW50ZXJhY3Rpb25UeXBlIH0gZnJvbSAnLi4vdHlwZXMvaW50ZXJhY3Rpb25zLnRzJ1xuaW1wb3J0IHsgZW5jb2RlVGV4dCB9IGZyb20gJy4uL3V0aWxzL2VuY29kaW5nLnRzJ1xuaW1wb3J0IHsgTWVzc2FnZUNvbXBvbmVudERhdGEgfSBmcm9tICcuLi90eXBlcy9tZXNzYWdlQ29tcG9uZW50cy50cydcbmltcG9ydCB7IHRyYW5zZm9ybUNvbXBvbmVudFBheWxvYWQgfSBmcm9tICcuLi91dGlscy9jb21wb25lbnRzLnRzJ1xuaW1wb3J0IHR5cGUgeyBUaHJlYWRDaGFubmVsIH0gZnJvbSAnLi90aHJlYWRDaGFubmVsLnRzJ1xuaW1wb3J0IHsgQ3JlYXRlVGhyZWFkT3B0aW9ucyB9IGZyb20gJy4vZ3VpbGRUaHJlYWRBdmFpbGFibGVDaGFubmVsLnRzJ1xuXG50eXBlIEFsbE1lc3NhZ2VPcHRpb25zID0gTWVzc2FnZU9wdGlvbnMgfCBFbWJlZFxuXG5leHBvcnQgY2xhc3MgTWVzc2FnZUludGVyYWN0aW9uIGV4dGVuZHMgU25vd2ZsYWtlQmFzZSB7XG4gIGlkOiBzdHJpbmdcbiAgbmFtZTogc3RyaW5nXG4gIHR5cGU6IEludGVyYWN0aW9uVHlwZVxuICB1c2VyOiBVc2VyXG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQsIGRhdGE6IE1lc3NhZ2VJbnRlcmFjdGlvblBheWxvYWQpIHtcbiAgICBzdXBlcihjbGllbnQpXG4gICAgdGhpcy5pZCA9IGRhdGEuaWRcbiAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWVcbiAgICB0aGlzLnR5cGUgPSBkYXRhLnR5cGVcbiAgICB0aGlzLnVzZXIgPSBuZXcgVXNlcih0aGlzLmNsaWVudCwgZGF0YS51c2VyKVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNZXNzYWdlIGV4dGVuZHMgU25vd2ZsYWtlQmFzZSB7XG4gIGlkOiBzdHJpbmdcbiAgY2hhbm5lbElEITogc3RyaW5nXG4gIGNoYW5uZWwhOiBUZXh0Q2hhbm5lbFxuICBndWlsZElEPzogc3RyaW5nXG4gIGd1aWxkPzogR3VpbGRcbiAgYXV0aG9yOiBVc2VyXG4gIG1lbWJlcj86IE1lbWJlclxuICBjb250ZW50ITogc3RyaW5nXG4gIGVkaXRlZFRpbWVzdGFtcD86IERhdGVcbiAgdHRzITogYm9vbGVhblxuICBtZW50aW9uczogTWVzc2FnZU1lbnRpb25zXG4gIGF0dGFjaG1lbnRzITogQXR0YWNobWVudFtdXG4gIGVtYmVkcyE6IEVtYmVkW11cbiAgcmVhY3Rpb25zOiBNZXNzYWdlUmVhY3Rpb25zTWFuYWdlclxuICBub25jZT86IHN0cmluZyB8IG51bWJlclxuICBwaW5uZWQhOiBib29sZWFuXG4gIHdlYmhvb2tJRD86IHN0cmluZ1xuICB0eXBlITogbnVtYmVyXG4gIGFjdGl2aXR5PzogTWVzc2FnZUFjdGl2aXR5XG4gIGFwcGxpY2F0aW9uPzogTWVzc2FnZUFwcGxpY2F0aW9uXG4gIG1lc3NhZ2VSZWZlcmVuY2U/OiBNZXNzYWdlUmVmZXJlbmNlXG4gIGZsYWdzPzogbnVtYmVyXG4gIHN0aWNrZXJJdGVtcz86IE1lc3NhZ2VTdGlja2VySXRlbVtdXG4gIGludGVyYWN0aW9uPzogTWVzc2FnZUludGVyYWN0aW9uXG4gIGNyZWF0ZWRUaW1lc3RhbXA6IERhdGVcbiAgY29tcG9uZW50czogTWVzc2FnZUNvbXBvbmVudERhdGFbXSA9IFtdXG5cbiAgZ2V0IGNyZWF0ZWRBdCgpOiBEYXRlIHtcbiAgICByZXR1cm4gdGhpcy5jcmVhdGVkVGltZXN0YW1wIC8vIG5ldyBEYXRlKHRoaXMudGltZXN0YW1wKVxuICB9XG5cbiAgZ2V0IHVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBDSEFOTkVMX01FU1NBR0UodGhpcy5jaGFubmVsSUQsIHRoaXMuaWQpXG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBjbGllbnQ6IENsaWVudCxcbiAgICBkYXRhOiBNZXNzYWdlUGF5bG9hZCxcbiAgICBjaGFubmVsOiBUZXh0Q2hhbm5lbCxcbiAgICBhdXRob3I6IFVzZXJcbiAgKSB7XG4gICAgc3VwZXIoY2xpZW50KVxuICAgIHRoaXMuaWQgPSBkYXRhLmlkXG4gICAgdGhpcy5hdXRob3IgPSBhdXRob3JcbiAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsXG4gICAgdGhpcy5tZW50aW9ucyA9IG5ldyBNZXNzYWdlTWVudGlvbnModGhpcy5jbGllbnQsIHRoaXMpXG4gICAgdGhpcy5yZWFjdGlvbnMgPSBuZXcgTWVzc2FnZVJlYWN0aW9uc01hbmFnZXIodGhpcy5jbGllbnQsIHRoaXMpXG4gICAgdGhpcy5jcmVhdGVkVGltZXN0YW1wID0gbmV3IERhdGUoZGF0YS50aW1lc3RhbXApXG5cbiAgICB0aGlzLnJlYWRGcm9tRGF0YShkYXRhKVxuICB9XG5cbiAgcmVhZEZyb21EYXRhKGRhdGE6IE1lc3NhZ2VQYXlsb2FkKTogdm9pZCB7XG4gICAgdGhpcy5jaGFubmVsSUQgPSBkYXRhLmNoYW5uZWxfaWQgPz8gdGhpcy5jaGFubmVsSURcbiAgICB0aGlzLmd1aWxkSUQgPSBkYXRhLmd1aWxkX2lkID8/IHRoaXMuZ3VpbGRJRFxuICAgIHRoaXMuY29udGVudCA9IGRhdGEuY29udGVudCA/PyB0aGlzLmNvbnRlbnRcbiAgICB0aGlzLmVkaXRlZFRpbWVzdGFtcCA9XG4gICAgICBkYXRhLmVkaXRlZF90aW1lc3RhbXAgPT09IHVuZGVmaW5lZFxuICAgICAgICA/IHRoaXMuZWRpdGVkVGltZXN0YW1wXG4gICAgICAgIDogbmV3IERhdGUoZGF0YS5lZGl0ZWRfdGltZXN0YW1wKVxuICAgIHRoaXMudHRzID0gZGF0YS50dHMgPz8gdGhpcy50dHNcbiAgICB0aGlzLmF0dGFjaG1lbnRzID0gZGF0YS5hdHRhY2htZW50cyA/PyB0aGlzLmF0dGFjaG1lbnRzXG4gICAgdGhpcy5lbWJlZHMgPSBkYXRhLmVtYmVkcy5tYXAoKHYpID0+IG5ldyBFbWJlZCh2KSkgPz8gdGhpcy5lbWJlZHNcbiAgICB0aGlzLm5vbmNlID0gZGF0YS5ub25jZSA/PyB0aGlzLm5vbmNlXG4gICAgdGhpcy5waW5uZWQgPSBkYXRhLnBpbm5lZCA/PyB0aGlzLnBpbm5lZFxuICAgIHRoaXMud2ViaG9va0lEID0gZGF0YS53ZWJob29rX2lkID8/IHRoaXMud2ViaG9va0lEXG4gICAgdGhpcy50eXBlID0gZGF0YS50eXBlID8/IHRoaXMudHlwZVxuICAgIHRoaXMuYWN0aXZpdHkgPSBkYXRhLmFjdGl2aXR5ID8/IHRoaXMuYWN0aXZpdHlcbiAgICB0aGlzLmFwcGxpY2F0aW9uID0gZGF0YS5hcHBsaWNhdGlvbiA/PyB0aGlzLmFwcGxpY2F0aW9uXG4gICAgdGhpcy5tZXNzYWdlUmVmZXJlbmNlID0gZGF0YS5tZXNzYWdlX3JlZmVyZW5jZSA/PyB0aGlzLm1lc3NhZ2VSZWZlcmVuY2VcbiAgICB0aGlzLmZsYWdzID0gZGF0YS5mbGFncyA/PyB0aGlzLmZsYWdzXG4gICAgdGhpcy5zdGlja2VySXRlbXMgPVxuICAgICAgZGF0YS5zdGlja2VyX2l0ZW1zICE9PSB1bmRlZmluZWRcbiAgICAgICAgPyBkYXRhLnN0aWNrZXJfaXRlbXMubWFwKFxuICAgICAgICAgICAgKHBheWxvYWQpID0+IG5ldyBNZXNzYWdlU3RpY2tlckl0ZW0odGhpcy5jbGllbnQsIHBheWxvYWQpXG4gICAgICAgICAgKVxuICAgICAgICA6IHRoaXMuc3RpY2tlckl0ZW1zXG4gICAgdGhpcy5pbnRlcmFjdGlvbiA9XG4gICAgICBkYXRhLmludGVyYWN0aW9uID09PSB1bmRlZmluZWRcbiAgICAgICAgPyB0aGlzLmludGVyYWN0aW9uXG4gICAgICAgIDogbmV3IE1lc3NhZ2VJbnRlcmFjdGlvbih0aGlzLmNsaWVudCwgZGF0YS5pbnRlcmFjdGlvbilcbiAgICB0aGlzLmNvbXBvbmVudHMgPVxuICAgICAgZGF0YS5jb21wb25lbnRzID09PSB1bmRlZmluZWRcbiAgICAgICAgPyBbXVxuICAgICAgICA6IHRyYW5zZm9ybUNvbXBvbmVudFBheWxvYWQoZGF0YS5jb21wb25lbnRzKVxuICB9XG5cbiAgYXN5bmMgdXBkYXRlUmVmcygpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAodGhpcy5ndWlsZElEICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuZ3VpbGQgPSBhd2FpdCB0aGlzLmNsaWVudC5ndWlsZHMuZ2V0KHRoaXMuZ3VpbGRJRClcbiAgICB9XG4gICAgY29uc3QgbmV3VmFsID0gYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbHMuZ2V0PFRleHRDaGFubmVsPih0aGlzLmNoYW5uZWxJRClcbiAgICBpZiAobmV3VmFsICE9PSB1bmRlZmluZWQpIHRoaXMuY2hhbm5lbCA9IG5ld1ZhbFxuICAgIGNvbnN0IG5ld1VzZXIgPSBhd2FpdCB0aGlzLmNsaWVudC51c2Vycy5nZXQodGhpcy5hdXRob3IuaWQpXG4gICAgaWYgKG5ld1VzZXIgIT09IHVuZGVmaW5lZCkgdGhpcy5hdXRob3IgPSBuZXdVc2VyXG4gICAgaWYgKHRoaXMubWVtYmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IG5ld01lbWJlciA9IGF3YWl0IHRoaXMuZ3VpbGQ/Lm1lbWJlcnMuZ2V0KHRoaXMubWVtYmVyPy5pZClcbiAgICAgIGlmIChuZXdNZW1iZXIgIT09IHVuZGVmaW5lZCkgdGhpcy5tZW1iZXIgPSBuZXdNZW1iZXJcbiAgICB9XG4gICAgaWYgKFxuICAgICAgKHRoaXMuY2hhbm5lbCBhcyB1bmtub3duIGFzIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbCkuZ3VpbGQgIT09IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgdGhpcy5ndWlsZCA9ICh0aGlzLmNoYW5uZWwgYXMgdW5rbm93biBhcyBHdWlsZFRleHRCYXNlZENoYW5uZWwpLmd1aWxkXG4gICAgfVxuICAgIGlmICh0aGlzLmd1aWxkICE9PSB1bmRlZmluZWQgJiYgdGhpcy5ndWlsZElEID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuZ3VpbGRJRCA9IHRoaXMuZ3VpbGQuaWRcbiAgICB9XG4gIH1cblxuICAvKiogRWRpdHMgdGhpcyBtZXNzYWdlLiAqL1xuICBhc3luYyBlZGl0KFxuICAgIGNvbnRlbnQ/OiBzdHJpbmcgfCBBbGxNZXNzYWdlT3B0aW9ucyxcbiAgICBvcHRpb24/OiBBbGxNZXNzYWdlT3B0aW9uc1xuICApOiBQcm9taXNlPE1lc3NhZ2U+IHtcbiAgICBpZiAodHlwZW9mIGNvbnRlbnQgPT09ICdvYmplY3QnKSB7XG4gICAgICBvcHRpb24gPSBjb250ZW50XG4gICAgICBjb250ZW50ID0gdW5kZWZpbmVkXG4gICAgfVxuICAgIGlmIChjb250ZW50ID09PSB1bmRlZmluZWQgJiYgb3B0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRWl0aGVyIHRleHQgb3Igb3B0aW9uIGlzIG5lY2Vzc2FyeS4nKVxuICAgIH1cbiAgICBpZiAob3B0aW9uIGluc3RhbmNlb2YgRW1iZWQpIHtcbiAgICAgIG9wdGlvbiA9IHtcbiAgICAgICAgZW1iZWRzOiBbb3B0aW9uXVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoXG4gICAgICB0aGlzLmNsaWVudC51c2VyICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHRoaXMuYXV0aG9yLmlkICE9PSB0aGlzLmNsaWVudC51c2VyPy5pZFxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGVkaXQgb3RoZXIgdXNlcnMnIG1lc3NhZ2VzXCIpXG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNoYW5uZWwuZWRpdE1lc3NhZ2UodGhpcy5pZCwgY29udGVudCwgb3B0aW9uKVxuICB9XG5cbiAgLyoqIENyZWF0ZXMgYSBSZXBseSB0byB0aGlzIE1lc3NhZ2UuICovXG4gIGFzeW5jIHJlcGx5KFxuICAgIGNvbnRlbnQ/OiBzdHJpbmcgfCBBbGxNZXNzYWdlT3B0aW9ucyxcbiAgICBvcHRpb24/OiBBbGxNZXNzYWdlT3B0aW9uc1xuICApOiBQcm9taXNlPE1lc3NhZ2U+IHtcbiAgICByZXR1cm4gdGhpcy5jaGFubmVsLnNlbmQoY29udGVudCwgb3B0aW9uLCB0aGlzKVxuICB9XG5cbiAgLyoqIERlbGV0ZXMgdGhlIE1lc3NhZ2UuICovXG4gIGFzeW5jIGRlbGV0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQucmVzdC5kZWxldGUoQ0hBTk5FTF9NRVNTQUdFKHRoaXMuY2hhbm5lbElELCB0aGlzLmlkKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgcmVhY3Rpb24gdG8gdGhlIG1lc3NhZ2UuXG4gICAqIEBwYXJhbSBlbW9qaSBFbW9qaSBpbiBzdHJpbmcgb3Igb2JqZWN0XG4gICAqL1xuICBhc3luYyBhZGRSZWFjdGlvbihlbW9qaTogc3RyaW5nIHwgRW1vamkpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5jaGFubmVsLmFkZFJlYWN0aW9uKHRoaXMsIGVtb2ppKVxuICB9XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSByZWFjdGlvbiB0byB0aGUgbWVzc2FnZS5cbiAgICogQHBhcmFtIGVtb2ppIEVtb2ppIGluIHN0cmluZyBvciBvYmplY3RcbiAgICogQHBhcmFtIHVzZXIgVXNlciBvciBNZW1iZXIgb3IgdXNlciBpZFxuICAgKi9cbiAgYXN5bmMgcmVtb3ZlUmVhY3Rpb24oXG4gICAgZW1vamk6IHN0cmluZyB8IEVtb2ppLFxuICAgIHVzZXI/OiBVc2VyIHwgTWVtYmVyIHwgc3RyaW5nXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmNoYW5uZWwucmVtb3ZlUmVhY3Rpb24odGhpcywgZW1vamksIHVzZXIpXG4gIH1cblxuICBhc3luYyBzdGFydFRocmVhZChvcHRpb25zOiBDcmVhdGVUaHJlYWRPcHRpb25zKTogUHJvbWlzZTxUaHJlYWRDaGFubmVsPiB7XG4gICAgaWYgKHRoaXMuY2hhbm5lbC5pc0d1aWxkVGV4dCgpID09PSB0cnVlKSB7XG4gICAgICBjb25zdCBjaGFuID0gdGhpcy5jaGFubmVsIGFzIHVua25vd24gYXMgR3VpbGRUZXh0Q2hhbm5lbFxuICAgICAgcmV0dXJuIGNoYW4uc3RhcnRUaHJlYWQob3B0aW9ucywgdGhpcylcbiAgICB9IGVsc2UgdGhyb3cgbmV3IEVycm9yKCdUaHJlYWRzIGNhbiBvbmx5IGJlIG1hZGUgaW4gR3VpbGQgVGV4dCBDaGFubmVscycpXG4gIH1cblxuICBhc3luYyBwaW5NZXNzYWdlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5jaGFubmVscy5waW5NZXNzYWdlKHRoaXMuY2hhbm5lbCwgdGhpcylcbiAgfVxuXG4gIGFzeW5jIHVucGluTWVzc2FnZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuY2hhbm5lbHMudW5waW5NZXNzYWdlKHRoaXMuY2hhbm5lbCwgdGhpcylcbiAgfVxufVxuXG4vKiogTWVzc2FnZSBBdHRhY2htZW50IHRoYXQgY2FuIGJlIHNlbnQgd2hpbGUgQ3JlYXRpbmcgTWVzc2FnZSAqL1xuZXhwb3J0IGNsYXNzIE1lc3NhZ2VBdHRhY2htZW50IHtcbiAgbmFtZTogc3RyaW5nXG4gIGJsb2I6IEJsb2JcbiAgZGVzY3JpcHRpb24/OiBzdHJpbmdcblxuICBjb25zdHJ1Y3RvcihcbiAgICBuYW1lOiBzdHJpbmcsXG4gICAgYmxvYjogQmxvYiB8IFVpbnQ4QXJyYXkgfCBzdHJpbmcsXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmdcbiAgKSB7XG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMuYmxvYiA9XG4gICAgICB0eXBlb2YgYmxvYiA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBuZXcgQmxvYihbZW5jb2RlVGV4dChibG9iKV0pXG4gICAgICAgIDogYmxvYiBpbnN0YW5jZW9mIFVpbnQ4QXJyYXlcbiAgICAgICAgPyBuZXcgQmxvYihbYmxvYl0pXG4gICAgICAgIDogYmxvYlxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvblxuICB9XG5cbiAgLyoqIExvYWQgYW4gTWVzc2FnZSBBdHRhY2htZW50IGZyb20gbG9jYWwgZmlsZSBvciBVUkwgKi9cbiAgc3RhdGljIGFzeW5jIGxvYWQoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIGZpbGVuYW1lPzogc3RyaW5nLFxuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nXG4gICk6IFByb21pc2U8TWVzc2FnZUF0dGFjaG1lbnQ+IHtcbiAgICBjb25zdCBibG9iID0gcGF0aC5zdGFydHNXaXRoKCdodHRwJylcbiAgICAgID8gYXdhaXQgZmV0Y2gocGF0aCkudGhlbigocmVzKSA9PiByZXMuYmxvYigpKVxuICAgICAgOiBhd2FpdCBEZW5vLnJlYWRGaWxlKHBhdGgpXG5cbiAgICBpZiAoZmlsZW5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3Qgc3BsaXQgPSBwYXRoLnJlcGxhY2VBbGwoJ1xcXFwnLCAnLycpLnNwbGl0KCcvJykucG9wKClcbiAgICAgIGlmIChzcGxpdCAhPT0gdW5kZWZpbmVkKSBmaWxlbmFtZSA9IHNwbGl0LnNwbGl0KCc/JylbMF0uc3BsaXQoJyMnKVswXVxuICAgICAgZWxzZSBmaWxlbmFtZSA9ICd1bm5hbWVkX2F0dGFjaG1lbnQnXG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBNZXNzYWdlQXR0YWNobWVudChmaWxlbmFtZSwgYmxvYiwgZGVzY3JpcHRpb24pXG4gIH1cblxuICAvLyBTbyB0aGF0IGl0J3Mgbm90IHByZXNlbnQgaW4gYWN0dWFsIHBheWxvYWQgd2Ugc2VuZCB0byBEaXNjb3JkLlxuICAvLyBJdCBpcyBvbmx5IGF0dGFjaGVkIGluIHRoZSBGb3JtRGF0YSBhbmQgc29tZSBtZXRhZGF0YSBpcyBwdXRcbiAgLy8gaW4gYXR0YWNobWVudHMgYXJyYXkuXG4gIHRvSlNPTigpOiB1bmRlZmluZWQge1xuICAgIHJldHVybiB1bmRlZmluZWRcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsYUFBYSxRQUFRLFlBQVc7QUFXekMsU0FBUyxJQUFJLFFBQVEsWUFBVztBQUVoQyxTQUFTLEtBQUssUUFBUSxhQUFZ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