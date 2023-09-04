import { transformComponent } from '../utils/components.ts';
import { Constants } from '../types/constants.ts';
import { INTERACTION_CALLBACK, WEBHOOK_MESSAGE } from '../types/endpoint.ts';
import { InteractionResponseFlags, InteractionResponseType, InteractionType } from '../types/interactions.ts';
import { Permissions } from '../utils/permissions.ts';
import { SnowflakeBase } from './base.ts';
import { Embed } from './embed.ts';
import { Message } from './message.ts';
import { User } from './user.ts';
function isResponseMessage(response) {
    return response.type === undefined || response.type === InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE || response.type === InteractionResponseType.UPDATE_MESSAGE || response.type === InteractionResponseType.DEFERRED_CHANNEL_MESSAGE || response.type === InteractionResponseType.DEFERRED_MESSAGE_UPDATE;
}
function isResponseModal(response) {
    return response.type === InteractionResponseType.MODAL;
}
/** Represents a Channel Object for an Option in Slash Command */ export class InteractionChannel extends SnowflakeBase {
    /** Name of the Channel */ name;
    /** Channel Type */ type;
    permissions;
    constructor(client, data){
        super(client);
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.permissions = new Permissions(data.permissions);
    }
    /** Resolve to actual Channel object if present in Cache */ async resolve() {
        return this.client.channels.get(this.id);
    }
}
export class InteractionUser extends User {
    member;
}
/**
 * Represents a base Interaction.
 *
 * There are different types of interactions which have different actions you
 * can perform ("respond") based on. Because of that, Interaction class is extended
 * by those subclasses to structure the code properly.
 *
 * You will be (most of the time if not all) provided with an Interaction object that
 * is actually one of those subclasses, but just TS-type is Interaction - in that case
 * you use type-guards such as `isApplicationCommand`, `isMessageComponent`, etc.
 */ export class Interaction extends SnowflakeBase {
    /** Type of Interaction */ type;
    /** Interaction Token */ token;
    /** Interaction ID */ id;
    /** Channel in which Interaction was initiated */ channel;
    /** Guild in which Interaction was initiated */ guild;
    /** Member object of who initiated the Interaction */ member;
    /** User object of who invoked Interaction */ user;
    /** Whether we have responded to Interaction or not */ responded = false;
    /** Whether response was deferred or not */ deferred = false;
    _httpRespond;
    _httpResponded;
    applicationID;
    /** Data sent with Interaction. Only applies to Application Command */ data;
    message;
    /** User locale (not present on PING type) */ locale;
    /** Guild locale (not present on PING type) */ guildLocale;
    constructor(client, data, others){
        super(client);
        this.type = data.type;
        this.token = data.token;
        this.member = others.member;
        this.id = data.id;
        this.applicationID = data.application_id;
        this.user = others.user;
        this.data = data.data;
        this.guild = others.guild;
        this.channel = others.channel;
        this.message = others.message;
        this.locale = data.locale;
        this.guildLocale = data.guild_locale;
    }
    /**
   * @deprecated Use isApplicationCommand instead
   */ isSlashCommand() {
        return this.type === InteractionType.APPLICATION_COMMAND;
    }
    /** Checks whether the Interaction is Ping (HTTP only) */ isPing() {
        return this.type === InteractionType.PING;
    }
    /** Checks whether the Interaction is Application Command */ isApplicationCommand() {
        return this.type === InteractionType.APPLICATION_COMMAND;
    }
    /** Checks whether the Interaction is Message Component */ isMessageComponent() {
        return this.type === InteractionType.MESSAGE_COMPONENT;
    }
    /** Checks whether the Interaction is for Application Command Option autocompletions */ isAutocomplete() {
        return this.type === InteractionType.AUTOCOMPLETE;
    }
    /** Checks whether the Interaction is for the modal/form submitted by the user */ isModalSubmit() {
        return this.type === InteractionType.MODAL_SUBMIT;
    }
    /** Respond to an Interaction */ async respond(data) {
        if (this.responded) throw new Error('Already responded to Interaction');
        let flags = 0;
        if (isResponseMessage(data) && data.ephemeral === true) flags |= InteractionResponseFlags.EPHEMERAL;
        if (isResponseMessage(data) && data.flags !== undefined) {
            if (Array.isArray(data.flags)) {
                flags = data.flags.reduce((p, a)=>p | a, flags);
            } else if (typeof data.flags === 'number') flags |= data.flags;
        }
        const payload = {
            type: data.type === undefined ? InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE : typeof data.type === 'string' ? InteractionResponseType[data.type] : data.type,
            data: isResponseModal(data) ? {
                title: data.title,
                components: transformComponent(data.components),
                custom_id: data.customID
            } : data.type === InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT ? {
                choices: 'choices' in data ? data.choices : []
            } : isResponseMessage(data) ? {
                content: data.content ?? '',
                embeds: data.embeds,
                tts: data.tts ?? false,
                flags,
                allowed_mentions: data.allowedMentions,
                components: data.components === undefined ? undefined : transformComponent(data.components),
                files: data.files ?? []
            } : undefined
        };
        if (this._httpRespond !== undefined && this._httpResponded !== true) {
            this._httpResponded = true;
            await this._httpRespond(payload);
        } else {
            await this.client.rest.post(INTERACTION_CALLBACK(this.id, this.token), payload);
        }
        this.responded = true;
        return this;
    }
    /** Defer the Interaction i.e. let the user know bot is processing and will respond later. You only have 15 minutes to edit the response! */ async defer(ephemeral = false) {
        await this.respond({
            type: InteractionResponseType.DEFERRED_CHANNEL_MESSAGE,
            flags: ephemeral ? 1 << 6 : 0
        });
        this.deferred = true;
        return this;
    }
    async reply(content, messageOptions) {
        let options = typeof content === 'object' ? content : messageOptions;
        if (typeof content === 'object' && messageOptions !== undefined && options !== undefined) {
            Object.assign(options, messageOptions);
        }
        if (options === undefined) options = {};
        if (typeof content === 'string') Object.assign(options, {
            content
        });
        if (this.deferred && this.responded) {
            await this.editResponse({
                content: options.content,
                embeds: options.embeds,
                flags: options.flags,
                allowedMentions: options.allowedMentions,
                components: options.components,
                files: options.files
            });
        } else {
            await this.respond(Object.assign(options, {
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE
            }));
        }
        return this;
    }
    /** Edit the original Interaction response */ async editResponse(data) {
        if (typeof data === 'string') data = {
            content: data
        };
        const url = WEBHOOK_MESSAGE(this.applicationID, this.token, '@original');
        await this.client.rest.patch(url, {
            content: data.content ?? '',
            embeds: data.embeds ?? [],
            flags: typeof data.flags === 'object' ? data.flags.reduce((p, a)=>p | a, 0) : data.flags,
            allowed_mentions: data.allowedMentions,
            files: data.files,
            components: data.components === undefined ? undefined : transformComponent(data.components)
        });
        return this;
    }
    /** Fetch the Message object of the Interaction Response */ async fetchResponse() {
        const url = WEBHOOK_MESSAGE(this.applicationID, this.token, '@original');
        const message = await this.client.rest.get(url);
        return new Message(this.client, message, // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        this.channel, new User(this.client, message.author));
    }
    /** Respond with a Modal */ async showModal(modal) {
        return await this.respond({
            type: InteractionResponseType.MODAL,
            ...modal
        });
    }
    /** Delete the original Interaction Response */ async deleteResponse() {
        const url = WEBHOOK_MESSAGE(this.applicationID, this.token, '@original');
        await this.client.rest.delete(url);
        return this;
    }
    get url() {
        return `https://discord.com/api/v${this.client?.rest?.version ?? Constants.DISCORD_API_VERSION}/webhooks/${this.applicationID}/${this.token}`;
    }
    /** Send a followup message */ async send(text, option) {
        if (typeof text === 'object') {
            option = text;
            text = undefined;
        }
        if (text === undefined && option === undefined) {
            throw new Error('Either text or option is necessary.');
        }
        if (option instanceof Embed) {
            option = {
                embeds: [
                    option
                ]
            };
        }
        const payload = {
            content: text,
            embeds: option?.embed !== undefined ? [
                option.embed
            ] : option?.embeds !== undefined ? option.embeds : undefined,
            file: option?.file,
            files: option?.files,
            tts: option?.tts,
            allowed_mentions: option?.allowedMentions,
            flags: (option?.flags ?? 0) | (option?.ephemeral === true ? 64 : 0),
            components: option?.components === undefined ? undefined : typeof option.components === 'function' ? option.components() : transformComponent(option.components),
            username: undefined,
            avatar: undefined
        };
        if (option?.name !== undefined) {
            payload.username = option?.name;
        }
        if (option?.avatar !== undefined) {
            payload.avatar = option?.avatar;
        }
        if (payload.embeds !== undefined && payload.embeds instanceof Array && payload.embeds.length > 10) {
            throw new Error(`Cannot send more than 10 embeds through Interaction Webhook`);
        }
        const resp = await this.client.rest.post(`${this.url}?wait=true`, payload);
        const res = new Message(this.client, resp, this, this);
        await res.mentions.fromPayload(resp);
        return res;
    }
    /** Edit a Followup message */ async editMessage(msg, data) {
        const payload = {
            ...data
        };
        if (data.components !== undefined) {
            payload.components = transformComponent(data.components);
        }
        await this.client.rest.patch(WEBHOOK_MESSAGE(this.applicationID, this.token ?? this.client.token, typeof msg === 'string' ? msg : msg.id), data);
        return this;
    }
    /** Delete a follow-up Message */ async deleteMessage(msg) {
        await this.client.rest.delete(WEBHOOK_MESSAGE(this.applicationID, this.token ?? this.client.token, typeof msg === 'string' ? msg : msg.id));
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvaW50ZXJhY3Rpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ2xpZW50IH0gZnJvbSAnLi4vY2xpZW50L2NsaWVudC50cydcbmltcG9ydCB7IHRyYW5zZm9ybUNvbXBvbmVudCB9IGZyb20gJy4uL3V0aWxzL2NvbXBvbmVudHMudHMnXG5pbXBvcnQge1xuICBBbGxvd2VkTWVudGlvbnNQYXlsb2FkLFxuICBDaGFubmVsVHlwZXMsXG4gIEVtYmVkUGF5bG9hZCxcbiAgTWVzc2FnZU9wdGlvbnNcbn0gZnJvbSAnLi4vdHlwZXMvY2hhbm5lbC50cydcbmltcG9ydCB7IENvbnN0YW50cyB9IGZyb20gJy4uL3R5cGVzL2NvbnN0YW50cy50cydcbmltcG9ydCB7IElOVEVSQUNUSU9OX0NBTExCQUNLLCBXRUJIT09LX01FU1NBR0UgfSBmcm9tICcuLi90eXBlcy9lbmRwb2ludC50cydcbmltcG9ydCB7XG4gIEludGVyYWN0aW9uUGF5bG9hZCxcbiAgSW50ZXJhY3Rpb25SZXNwb25zZUZsYWdzLFxuICBJbnRlcmFjdGlvblJlc3BvbnNlUGF5bG9hZCxcbiAgSW50ZXJhY3Rpb25SZXNwb25zZVR5cGUsXG4gIEludGVyYWN0aW9uVHlwZVxufSBmcm9tICcuLi90eXBlcy9pbnRlcmFjdGlvbnMudHMnXG5pbXBvcnQge1xuICBJbnRlcmFjdGlvbk1lc3NhZ2VDb21wb25lbnREYXRhLFxuICBJbnRlcmFjdGlvbk1vZGFsU3VibWl0RGF0YSxcbiAgTWVzc2FnZUNvbXBvbmVudERhdGFcbn0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZUNvbXBvbmVudHMudHMnXG5pbXBvcnQge1xuICBBcHBsaWNhdGlvbkNvbW1hbmRDaG9pY2UsXG4gIEludGVyYWN0aW9uQXBwbGljYXRpb25Db21tYW5kRGF0YSxcbiAgSW50ZXJhY3Rpb25DaGFubmVsUGF5bG9hZFxufSBmcm9tICcuLi90eXBlcy9hcHBsaWNhdGlvbkNvbW1hbmQudHMnXG5pbXBvcnQgeyBQZXJtaXNzaW9ucyB9IGZyb20gJy4uL3V0aWxzL3Blcm1pc3Npb25zLnRzJ1xuaW1wb3J0IHsgU25vd2ZsYWtlQmFzZSB9IGZyb20gJy4vYmFzZS50cydcbmltcG9ydCB7IENoYW5uZWwgfSBmcm9tICcuL2NoYW5uZWwudHMnXG5pbXBvcnQgeyBFbWJlZCB9IGZyb20gJy4vZW1iZWQudHMnXG5pbXBvcnQgeyBHdWlsZCB9IGZyb20gJy4vZ3VpbGQudHMnXG5pbXBvcnQgeyBHdWlsZFRleHRDaGFubmVsIH0gZnJvbSAnLi9ndWlsZFRleHRDaGFubmVsLnRzJ1xuaW1wb3J0IHsgTWVtYmVyIH0gZnJvbSAnLi9tZW1iZXIudHMnXG5pbXBvcnQgeyBNZXNzYWdlLCBNZXNzYWdlQXR0YWNobWVudCB9IGZyb20gJy4vbWVzc2FnZS50cydcbmltcG9ydCB7IFRleHRDaGFubmVsIH0gZnJvbSAnLi90ZXh0Q2hhbm5lbC50cydcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3VzZXIudHMnXG5pbXBvcnQgdHlwZSB7IEFwcGxpY2F0aW9uQ29tbWFuZEludGVyYWN0aW9uIH0gZnJvbSAnLi9hcHBsaWNhdGlvbkNvbW1hbmQudHMnXG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2VDb21wb25lbnRJbnRlcmFjdGlvbiB9IGZyb20gJy4vbWVzc2FnZUNvbXBvbmVudHMudHMnXG5pbXBvcnQgdHlwZSB7IEF1dG9jb21wbGV0ZUludGVyYWN0aW9uIH0gZnJvbSAnLi9hdXRvY29tcGxldGVJbnRlcmFjdGlvbi50cydcbmltcG9ydCB0eXBlIHsgTW9kYWxTdWJtaXRJbnRlcmFjdGlvbiB9IGZyb20gJy4vbW9kYWxTdWJtaXRJbnRlcmFjdGlvbi50cydcblxuaW50ZXJmYWNlIFdlYmhvb2tNZXNzYWdlT3B0aW9ucyBleHRlbmRzIE1lc3NhZ2VPcHRpb25zIHtcbiAgbmFtZT86IHN0cmluZ1xuICBhdmF0YXI/OiBzdHJpbmdcbiAgZmxhZ3M/OiBudW1iZXJcbiAgZXBoZW1lcmFsPzogYm9vbGVhblxufVxuXG50eXBlIEFsbFdlYmhvb2tNZXNzYWdlT3B0aW9ucyA9IHN0cmluZyB8IFdlYmhvb2tNZXNzYWdlT3B0aW9uc1xuXG5leHBvcnQgaW50ZXJmYWNlIEJhc2VJbnRlcmFjdGlvblJlc3BvbnNlIHtcbiAgdHlwZT86IEludGVyYWN0aW9uUmVzcG9uc2VUeXBlIHwga2V5b2YgdHlwZW9mIEludGVyYWN0aW9uUmVzcG9uc2VUeXBlXG59XG5cbi8qKiBJbnRlcmFjdGlvbiBNZXNzYWdlIHJlbGF0ZWQgT3B0aW9ucyAqL1xuZXhwb3J0IGludGVyZmFjZSBJbnRlcmFjdGlvbk1lc3NhZ2VPcHRpb25zIHtcbiAgY29udGVudD86IHN0cmluZ1xuICBlbWJlZHM/OiBBcnJheTxFbWJlZCB8IEVtYmVkUGF5bG9hZD5cbiAgdHRzPzogYm9vbGVhblxuICBmbGFncz86IG51bWJlciB8IEludGVyYWN0aW9uUmVzcG9uc2VGbGFnc1tdXG4gIGFsbG93ZWRNZW50aW9ucz86IEFsbG93ZWRNZW50aW9uc1BheWxvYWRcbiAgLyoqIFdoZXRoZXIgdGhlIE1lc3NhZ2UgUmVzcG9uc2Ugc2hvdWxkIGJlIEVwaGVtZXJhbCAob25seSB2aXNpYmxlIHRvIFVzZXIpIG9yIG5vdCAqL1xuICBlcGhlbWVyYWw/OiBib29sZWFuXG4gIGNvbXBvbmVudHM/OiBNZXNzYWdlQ29tcG9uZW50RGF0YVtdXG4gIGZpbGVzPzogTWVzc2FnZUF0dGFjaG1lbnRbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEludGVyYWN0aW9uUmVzcG9uc2VBdXRvY29tcGxldGVDaG9pY2VzIHtcbiAgY2hvaWNlcz86IEFwcGxpY2F0aW9uQ29tbWFuZENob2ljZVtdXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJhY3Rpb25SZXNwb25zZU1vZGFsIHtcbiAgdGl0bGU6IHN0cmluZ1xuICBjdXN0b21JRDogc3RyaW5nXG4gIGNvbXBvbmVudHM6IE1lc3NhZ2VDb21wb25lbnREYXRhW11cbn1cblxuZXhwb3J0IHR5cGUgSW50ZXJhY3Rpb25SZXNwb25zZSA9IEJhc2VJbnRlcmFjdGlvblJlc3BvbnNlICZcbiAgKFxuICAgIHwgSW50ZXJhY3Rpb25NZXNzYWdlT3B0aW9uc1xuICAgIHwgSW50ZXJhY3Rpb25SZXNwb25zZUF1dG9jb21wbGV0ZUNob2ljZXNcbiAgICB8IEludGVyYWN0aW9uUmVzcG9uc2VNb2RhbFxuICApXG5cbmZ1bmN0aW9uIGlzUmVzcG9uc2VNZXNzYWdlKFxuICByZXNwb25zZTogSW50ZXJhY3Rpb25SZXNwb25zZVxuKTogcmVzcG9uc2UgaXMgSW50ZXJhY3Rpb25NZXNzYWdlT3B0aW9ucyAmIEJhc2VJbnRlcmFjdGlvblJlc3BvbnNlIHtcbiAgcmV0dXJuIChcbiAgICByZXNwb25zZS50eXBlID09PSB1bmRlZmluZWQgfHxcbiAgICByZXNwb25zZS50eXBlID09PSBJbnRlcmFjdGlvblJlc3BvbnNlVHlwZS5DSEFOTkVMX01FU1NBR0VfV0lUSF9TT1VSQ0UgfHxcbiAgICByZXNwb25zZS50eXBlID09PSBJbnRlcmFjdGlvblJlc3BvbnNlVHlwZS5VUERBVEVfTUVTU0FHRSB8fFxuICAgIHJlc3BvbnNlLnR5cGUgPT09IEludGVyYWN0aW9uUmVzcG9uc2VUeXBlLkRFRkVSUkVEX0NIQU5ORUxfTUVTU0FHRSB8fFxuICAgIHJlc3BvbnNlLnR5cGUgPT09IEludGVyYWN0aW9uUmVzcG9uc2VUeXBlLkRFRkVSUkVEX01FU1NBR0VfVVBEQVRFXG4gIClcbn1cblxuZnVuY3Rpb24gaXNSZXNwb25zZU1vZGFsKFxuICByZXNwb25zZTogSW50ZXJhY3Rpb25SZXNwb25zZVxuKTogcmVzcG9uc2UgaXMgSW50ZXJhY3Rpb25SZXNwb25zZU1vZGFsICYgQmFzZUludGVyYWN0aW9uUmVzcG9uc2Uge1xuICByZXR1cm4gcmVzcG9uc2UudHlwZSA9PT0gSW50ZXJhY3Rpb25SZXNwb25zZVR5cGUuTU9EQUxcbn1cblxuLyoqIFJlcHJlc2VudHMgYSBDaGFubmVsIE9iamVjdCBmb3IgYW4gT3B0aW9uIGluIFNsYXNoIENvbW1hbmQgKi9cbmV4cG9ydCBjbGFzcyBJbnRlcmFjdGlvbkNoYW5uZWwgZXh0ZW5kcyBTbm93Zmxha2VCYXNlIHtcbiAgLyoqIE5hbWUgb2YgdGhlIENoYW5uZWwgKi9cbiAgbmFtZTogc3RyaW5nXG4gIC8qKiBDaGFubmVsIFR5cGUgKi9cbiAgdHlwZTogQ2hhbm5lbFR5cGVzXG4gIHBlcm1pc3Npb25zOiBQZXJtaXNzaW9uc1xuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50LCBkYXRhOiBJbnRlcmFjdGlvbkNoYW5uZWxQYXlsb2FkKSB7XG4gICAgc3VwZXIoY2xpZW50KVxuICAgIHRoaXMuaWQgPSBkYXRhLmlkXG4gICAgdGhpcy5uYW1lID0gZGF0YS5uYW1lXG4gICAgdGhpcy50eXBlID0gZGF0YS50eXBlXG4gICAgdGhpcy5wZXJtaXNzaW9ucyA9IG5ldyBQZXJtaXNzaW9ucyhkYXRhLnBlcm1pc3Npb25zKVxuICB9XG5cbiAgLyoqIFJlc29sdmUgdG8gYWN0dWFsIENoYW5uZWwgb2JqZWN0IGlmIHByZXNlbnQgaW4gQ2FjaGUgKi9cbiAgYXN5bmMgcmVzb2x2ZTxUIGV4dGVuZHMgQ2hhbm5lbCA9IENoYW5uZWw+KCk6IFByb21pc2U8VCB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5jaGFubmVscy5nZXQ8VD4odGhpcy5pZClcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgSW50ZXJhY3Rpb25Vc2VyIGV4dGVuZHMgVXNlciB7XG4gIG1lbWJlcj86IE1lbWJlclxufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBiYXNlIEludGVyYWN0aW9uLlxuICpcbiAqIFRoZXJlIGFyZSBkaWZmZXJlbnQgdHlwZXMgb2YgaW50ZXJhY3Rpb25zIHdoaWNoIGhhdmUgZGlmZmVyZW50IGFjdGlvbnMgeW91XG4gKiBjYW4gcGVyZm9ybSAoXCJyZXNwb25kXCIpIGJhc2VkIG9uLiBCZWNhdXNlIG9mIHRoYXQsIEludGVyYWN0aW9uIGNsYXNzIGlzIGV4dGVuZGVkXG4gKiBieSB0aG9zZSBzdWJjbGFzc2VzIHRvIHN0cnVjdHVyZSB0aGUgY29kZSBwcm9wZXJseS5cbiAqXG4gKiBZb3Ugd2lsbCBiZSAobW9zdCBvZiB0aGUgdGltZSBpZiBub3QgYWxsKSBwcm92aWRlZCB3aXRoIGFuIEludGVyYWN0aW9uIG9iamVjdCB0aGF0XG4gKiBpcyBhY3R1YWxseSBvbmUgb2YgdGhvc2Ugc3ViY2xhc3NlcywgYnV0IGp1c3QgVFMtdHlwZSBpcyBJbnRlcmFjdGlvbiAtIGluIHRoYXQgY2FzZVxuICogeW91IHVzZSB0eXBlLWd1YXJkcyBzdWNoIGFzIGBpc0FwcGxpY2F0aW9uQ29tbWFuZGAsIGBpc01lc3NhZ2VDb21wb25lbnRgLCBldGMuXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnRlcmFjdGlvbiBleHRlbmRzIFNub3dmbGFrZUJhc2Uge1xuICAvKiogVHlwZSBvZiBJbnRlcmFjdGlvbiAqL1xuICB0eXBlOiBJbnRlcmFjdGlvblR5cGVcbiAgLyoqIEludGVyYWN0aW9uIFRva2VuICovXG4gIHRva2VuOiBzdHJpbmdcbiAgLyoqIEludGVyYWN0aW9uIElEICovXG4gIGlkOiBzdHJpbmdcbiAgLyoqIENoYW5uZWwgaW4gd2hpY2ggSW50ZXJhY3Rpb24gd2FzIGluaXRpYXRlZCAqL1xuICBjaGFubmVsPzogVGV4dENoYW5uZWwgfCBHdWlsZFRleHRDaGFubmVsXG4gIC8qKiBHdWlsZCBpbiB3aGljaCBJbnRlcmFjdGlvbiB3YXMgaW5pdGlhdGVkICovXG4gIGd1aWxkPzogR3VpbGRcbiAgLyoqIE1lbWJlciBvYmplY3Qgb2Ygd2hvIGluaXRpYXRlZCB0aGUgSW50ZXJhY3Rpb24gKi9cbiAgbWVtYmVyPzogTWVtYmVyXG4gIC8qKiBVc2VyIG9iamVjdCBvZiB3aG8gaW52b2tlZCBJbnRlcmFjdGlvbiAqL1xuICB1c2VyOiBVc2VyXG4gIC8qKiBXaGV0aGVyIHdlIGhhdmUgcmVzcG9uZGVkIHRvIEludGVyYWN0aW9uIG9yIG5vdCAqL1xuICByZXNwb25kZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICAvKiogV2hldGhlciByZXNwb25zZSB3YXMgZGVmZXJyZWQgb3Igbm90ICovXG4gIGRlZmVycmVkOiBib29sZWFuID0gZmFsc2VcbiAgX2h0dHBSZXNwb25kPzogKGQ6IEludGVyYWN0aW9uUmVzcG9uc2VQYXlsb2FkKSA9PiB1bmtub3duXG4gIF9odHRwUmVzcG9uZGVkPzogYm9vbGVhblxuICBhcHBsaWNhdGlvbklEOiBzdHJpbmdcbiAgLyoqIERhdGEgc2VudCB3aXRoIEludGVyYWN0aW9uLiBPbmx5IGFwcGxpZXMgdG8gQXBwbGljYXRpb24gQ29tbWFuZCAqL1xuICBkYXRhPzpcbiAgICB8IEludGVyYWN0aW9uQXBwbGljYXRpb25Db21tYW5kRGF0YVxuICAgIHwgSW50ZXJhY3Rpb25NZXNzYWdlQ29tcG9uZW50RGF0YVxuICAgIHwgSW50ZXJhY3Rpb25Nb2RhbFN1Ym1pdERhdGFcblxuICBtZXNzYWdlPzogTWVzc2FnZVxuXG4gIC8qKiBVc2VyIGxvY2FsZSAobm90IHByZXNlbnQgb24gUElORyB0eXBlKSAqL1xuICBsb2NhbGU/OiBzdHJpbmdcblxuICAvKiogR3VpbGQgbG9jYWxlIChub3QgcHJlc2VudCBvbiBQSU5HIHR5cGUpICovXG4gIGd1aWxkTG9jYWxlPzogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoXG4gICAgY2xpZW50OiBDbGllbnQsXG4gICAgZGF0YTogSW50ZXJhY3Rpb25QYXlsb2FkLFxuICAgIG90aGVyczoge1xuICAgICAgY2hhbm5lbD86IFRleHRDaGFubmVsIHwgR3VpbGRUZXh0Q2hhbm5lbFxuICAgICAgZ3VpbGQ/OiBHdWlsZFxuICAgICAgbWVtYmVyPzogTWVtYmVyXG4gICAgICB1c2VyOiBVc2VyXG4gICAgICBtZXNzYWdlPzogTWVzc2FnZVxuICAgIH1cbiAgKSB7XG4gICAgc3VwZXIoY2xpZW50KVxuICAgIHRoaXMudHlwZSA9IGRhdGEudHlwZVxuICAgIHRoaXMudG9rZW4gPSBkYXRhLnRva2VuXG4gICAgdGhpcy5tZW1iZXIgPSBvdGhlcnMubWVtYmVyXG4gICAgdGhpcy5pZCA9IGRhdGEuaWRcbiAgICB0aGlzLmFwcGxpY2F0aW9uSUQgPSBkYXRhLmFwcGxpY2F0aW9uX2lkXG4gICAgdGhpcy51c2VyID0gb3RoZXJzLnVzZXJcbiAgICB0aGlzLmRhdGEgPSBkYXRhLmRhdGFcbiAgICB0aGlzLmd1aWxkID0gb3RoZXJzLmd1aWxkXG4gICAgdGhpcy5jaGFubmVsID0gb3RoZXJzLmNoYW5uZWxcbiAgICB0aGlzLm1lc3NhZ2UgPSBvdGhlcnMubWVzc2FnZVxuICAgIHRoaXMubG9jYWxlID0gZGF0YS5sb2NhbGVcbiAgICB0aGlzLmd1aWxkTG9jYWxlID0gZGF0YS5ndWlsZF9sb2NhbGVcbiAgfVxuXG4gIC8qKlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgaXNBcHBsaWNhdGlvbkNvbW1hbmQgaW5zdGVhZFxuICAgKi9cbiAgaXNTbGFzaENvbW1hbmQoKTogdGhpcyBpcyBBcHBsaWNhdGlvbkNvbW1hbmRJbnRlcmFjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gSW50ZXJhY3Rpb25UeXBlLkFQUExJQ0FUSU9OX0NPTU1BTkRcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgSW50ZXJhY3Rpb24gaXMgUGluZyAoSFRUUCBvbmx5KSAqL1xuICBpc1BpbmcoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gSW50ZXJhY3Rpb25UeXBlLlBJTkdcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgSW50ZXJhY3Rpb24gaXMgQXBwbGljYXRpb24gQ29tbWFuZCAqL1xuICBpc0FwcGxpY2F0aW9uQ29tbWFuZCgpOiB0aGlzIGlzIEFwcGxpY2F0aW9uQ29tbWFuZEludGVyYWN0aW9uIHtcbiAgICByZXR1cm4gdGhpcy50eXBlID09PSBJbnRlcmFjdGlvblR5cGUuQVBQTElDQVRJT05fQ09NTUFORFxuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBJbnRlcmFjdGlvbiBpcyBNZXNzYWdlIENvbXBvbmVudCAqL1xuICBpc01lc3NhZ2VDb21wb25lbnQoKTogdGhpcyBpcyBNZXNzYWdlQ29tcG9uZW50SW50ZXJhY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLnR5cGUgPT09IEludGVyYWN0aW9uVHlwZS5NRVNTQUdFX0NPTVBPTkVOVFxuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBJbnRlcmFjdGlvbiBpcyBmb3IgQXBwbGljYXRpb24gQ29tbWFuZCBPcHRpb24gYXV0b2NvbXBsZXRpb25zICovXG4gIGlzQXV0b2NvbXBsZXRlKCk6IHRoaXMgaXMgQXV0b2NvbXBsZXRlSW50ZXJhY3Rpb24ge1xuICAgIHJldHVybiB0aGlzLnR5cGUgPT09IEludGVyYWN0aW9uVHlwZS5BVVRPQ09NUExFVEVcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgSW50ZXJhY3Rpb24gaXMgZm9yIHRoZSBtb2RhbC9mb3JtIHN1Ym1pdHRlZCBieSB0aGUgdXNlciAqL1xuICBpc01vZGFsU3VibWl0KCk6IHRoaXMgaXMgTW9kYWxTdWJtaXRJbnRlcmFjdGlvbiB7XG4gICAgcmV0dXJuIHRoaXMudHlwZSA9PT0gSW50ZXJhY3Rpb25UeXBlLk1PREFMX1NVQk1JVFxuICB9XG5cbiAgLyoqIFJlc3BvbmQgdG8gYW4gSW50ZXJhY3Rpb24gKi9cbiAgYXN5bmMgcmVzcG9uZChkYXRhOiBJbnRlcmFjdGlvblJlc3BvbnNlKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgaWYgKHRoaXMucmVzcG9uZGVkKSB0aHJvdyBuZXcgRXJyb3IoJ0FscmVhZHkgcmVzcG9uZGVkIHRvIEludGVyYWN0aW9uJylcblxuICAgIGxldCBmbGFncyA9IDBcbiAgICBpZiAoaXNSZXNwb25zZU1lc3NhZ2UoZGF0YSkgJiYgZGF0YS5lcGhlbWVyYWwgPT09IHRydWUpXG4gICAgICBmbGFncyB8PSBJbnRlcmFjdGlvblJlc3BvbnNlRmxhZ3MuRVBIRU1FUkFMXG4gICAgaWYgKGlzUmVzcG9uc2VNZXNzYWdlKGRhdGEpICYmIGRhdGEuZmxhZ3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YS5mbGFncykpIHtcbiAgICAgICAgZmxhZ3MgPSBkYXRhLmZsYWdzLnJlZHVjZSgocCwgYSkgPT4gcCB8IGEsIGZsYWdzKVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZGF0YS5mbGFncyA9PT0gJ251bWJlcicpIGZsYWdzIHw9IGRhdGEuZmxhZ3NcbiAgICB9XG5cbiAgICBjb25zdCBwYXlsb2FkOiBJbnRlcmFjdGlvblJlc3BvbnNlUGF5bG9hZCA9IHtcbiAgICAgIHR5cGU6XG4gICAgICAgIGRhdGEudHlwZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyBJbnRlcmFjdGlvblJlc3BvbnNlVHlwZS5DSEFOTkVMX01FU1NBR0VfV0lUSF9TT1VSQ0VcbiAgICAgICAgICA6IHR5cGVvZiBkYXRhLnR5cGUgPT09ICdzdHJpbmcnXG4gICAgICAgICAgPyBJbnRlcmFjdGlvblJlc3BvbnNlVHlwZVtkYXRhLnR5cGVdXG4gICAgICAgICAgOiBkYXRhLnR5cGUsXG4gICAgICBkYXRhOiBpc1Jlc3BvbnNlTW9kYWwoZGF0YSlcbiAgICAgICAgPyB7XG4gICAgICAgICAgICB0aXRsZTogZGF0YS50aXRsZSxcbiAgICAgICAgICAgIGNvbXBvbmVudHM6IHRyYW5zZm9ybUNvbXBvbmVudChkYXRhLmNvbXBvbmVudHMpLFxuICAgICAgICAgICAgY3VzdG9tX2lkOiBkYXRhLmN1c3RvbUlEXG4gICAgICAgICAgfVxuICAgICAgICA6IGRhdGEudHlwZSA9PT1cbiAgICAgICAgICBJbnRlcmFjdGlvblJlc3BvbnNlVHlwZS5BUFBMSUNBVElPTl9DT01NQU5EX0FVVE9DT01QTEVURV9SRVNVTFRcbiAgICAgICAgPyB7IGNob2ljZXM6ICdjaG9pY2VzJyBpbiBkYXRhID8gZGF0YS5jaG9pY2VzIDogW10gfVxuICAgICAgICA6IGlzUmVzcG9uc2VNZXNzYWdlKGRhdGEpXG4gICAgICAgID8ge1xuICAgICAgICAgICAgY29udGVudDogZGF0YS5jb250ZW50ID8/ICcnLFxuICAgICAgICAgICAgZW1iZWRzOiBkYXRhLmVtYmVkcyxcbiAgICAgICAgICAgIHR0czogZGF0YS50dHMgPz8gZmFsc2UsXG4gICAgICAgICAgICBmbGFncyxcbiAgICAgICAgICAgIGFsbG93ZWRfbWVudGlvbnM6IGRhdGEuYWxsb3dlZE1lbnRpb25zLFxuICAgICAgICAgICAgY29tcG9uZW50czpcbiAgICAgICAgICAgICAgZGF0YS5jb21wb25lbnRzID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICAgICAgICAgIDogdHJhbnNmb3JtQ29tcG9uZW50KGRhdGEuY29tcG9uZW50cyksXG4gICAgICAgICAgICBmaWxlczogZGF0YS5maWxlcyA/PyBbXVxuICAgICAgICAgIH1cbiAgICAgICAgOiB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBpZiAodGhpcy5faHR0cFJlc3BvbmQgIT09IHVuZGVmaW5lZCAmJiB0aGlzLl9odHRwUmVzcG9uZGVkICE9PSB0cnVlKSB7XG4gICAgICB0aGlzLl9odHRwUmVzcG9uZGVkID0gdHJ1ZVxuICAgICAgYXdhaXQgdGhpcy5faHR0cFJlc3BvbmQocGF5bG9hZClcbiAgICB9IGVsc2Uge1xuICAgICAgYXdhaXQgdGhpcy5jbGllbnQucmVzdC5wb3N0KFxuICAgICAgICBJTlRFUkFDVElPTl9DQUxMQkFDSyh0aGlzLmlkLCB0aGlzLnRva2VuKSxcbiAgICAgICAgcGF5bG9hZFxuICAgICAgKVxuICAgIH1cbiAgICB0aGlzLnJlc3BvbmRlZCA9IHRydWVcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogRGVmZXIgdGhlIEludGVyYWN0aW9uIGkuZS4gbGV0IHRoZSB1c2VyIGtub3cgYm90IGlzIHByb2Nlc3NpbmcgYW5kIHdpbGwgcmVzcG9uZCBsYXRlci4gWW91IG9ubHkgaGF2ZSAxNSBtaW51dGVzIHRvIGVkaXQgdGhlIHJlc3BvbnNlISAqL1xuICBhc3luYyBkZWZlcihlcGhlbWVyYWwgPSBmYWxzZSk6IFByb21pc2U8dGhpcz4ge1xuICAgIGF3YWl0IHRoaXMucmVzcG9uZCh7XG4gICAgICB0eXBlOiBJbnRlcmFjdGlvblJlc3BvbnNlVHlwZS5ERUZFUlJFRF9DSEFOTkVMX01FU1NBR0UsXG4gICAgICBmbGFnczogZXBoZW1lcmFsID8gMSA8PCA2IDogMFxuICAgIH0pXG4gICAgdGhpcy5kZWZlcnJlZCA9IHRydWVcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIFJlcGx5IHdpdGggYSBNZXNzYWdlIHRvIHRoZSBJbnRlcmFjdGlvbiAqL1xuICBhc3luYyByZXBseShjb250ZW50OiBzdHJpbmcpOiBQcm9taXNlPHRoaXM+XG4gIGFzeW5jIHJlcGx5KG9wdGlvbnM6IEludGVyYWN0aW9uTWVzc2FnZU9wdGlvbnMpOiBQcm9taXNlPHRoaXM+XG4gIGFzeW5jIHJlcGx5KFxuICAgIGNvbnRlbnQ6IHN0cmluZyxcbiAgICBvcHRpb25zOiBJbnRlcmFjdGlvbk1lc3NhZ2VPcHRpb25zXG4gICk6IFByb21pc2U8dGhpcz5cbiAgYXN5bmMgcmVwbHkoXG4gICAgY29udGVudDogc3RyaW5nIHwgSW50ZXJhY3Rpb25NZXNzYWdlT3B0aW9ucyxcbiAgICBtZXNzYWdlT3B0aW9ucz86IEludGVyYWN0aW9uTWVzc2FnZU9wdGlvbnNcbiAgKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgbGV0IG9wdGlvbnM6IEludGVyYWN0aW9uTWVzc2FnZU9wdGlvbnMgfCB1bmRlZmluZWQgPVxuICAgICAgdHlwZW9mIGNvbnRlbnQgPT09ICdvYmplY3QnID8gY29udGVudCA6IG1lc3NhZ2VPcHRpb25zXG4gICAgaWYgKFxuICAgICAgdHlwZW9mIGNvbnRlbnQgPT09ICdvYmplY3QnICYmXG4gICAgICBtZXNzYWdlT3B0aW9ucyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBvcHRpb25zICE9PSB1bmRlZmluZWRcbiAgICApIHtcbiAgICAgIE9iamVjdC5hc3NpZ24ob3B0aW9ucywgbWVzc2FnZU9wdGlvbnMpXG4gICAgfVxuICAgIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIG9wdGlvbnMgPSB7fVxuICAgIGlmICh0eXBlb2YgY29udGVudCA9PT0gJ3N0cmluZycpIE9iamVjdC5hc3NpZ24ob3B0aW9ucywgeyBjb250ZW50IH0pXG5cbiAgICBpZiAodGhpcy5kZWZlcnJlZCAmJiB0aGlzLnJlc3BvbmRlZCkge1xuICAgICAgYXdhaXQgdGhpcy5lZGl0UmVzcG9uc2Uoe1xuICAgICAgICBjb250ZW50OiBvcHRpb25zLmNvbnRlbnQsXG4gICAgICAgIGVtYmVkczogb3B0aW9ucy5lbWJlZHMsXG4gICAgICAgIGZsYWdzOiBvcHRpb25zLmZsYWdzLFxuICAgICAgICBhbGxvd2VkTWVudGlvbnM6IG9wdGlvbnMuYWxsb3dlZE1lbnRpb25zLFxuICAgICAgICBjb21wb25lbnRzOiBvcHRpb25zLmNvbXBvbmVudHMsXG4gICAgICAgIGZpbGVzOiBvcHRpb25zLmZpbGVzXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLnJlc3BvbmQoXG4gICAgICAgIE9iamVjdC5hc3NpZ24ob3B0aW9ucywge1xuICAgICAgICAgIHR5cGU6IEludGVyYWN0aW9uUmVzcG9uc2VUeXBlLkNIQU5ORUxfTUVTU0FHRV9XSVRIX1NPVVJDRVxuICAgICAgICB9KVxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogRWRpdCB0aGUgb3JpZ2luYWwgSW50ZXJhY3Rpb24gcmVzcG9uc2UgKi9cbiAgYXN5bmMgZWRpdFJlc3BvbnNlKFxuICAgIGRhdGE6IEludGVyYWN0aW9uTWVzc2FnZU9wdGlvbnMgfCBzdHJpbmdcbiAgKTogUHJvbWlzZTxJbnRlcmFjdGlvbj4ge1xuICAgIGlmICh0eXBlb2YgZGF0YSA9PT0gJ3N0cmluZycpIGRhdGEgPSB7IGNvbnRlbnQ6IGRhdGEgfVxuICAgIGNvbnN0IHVybCA9IFdFQkhPT0tfTUVTU0FHRSh0aGlzLmFwcGxpY2F0aW9uSUQsIHRoaXMudG9rZW4sICdAb3JpZ2luYWwnKVxuICAgIGF3YWl0IHRoaXMuY2xpZW50LnJlc3QucGF0Y2godXJsLCB7XG4gICAgICBjb250ZW50OiBkYXRhLmNvbnRlbnQgPz8gJycsXG4gICAgICBlbWJlZHM6IGRhdGEuZW1iZWRzID8/IFtdLFxuICAgICAgZmxhZ3M6XG4gICAgICAgIHR5cGVvZiBkYXRhLmZsYWdzID09PSAnb2JqZWN0J1xuICAgICAgICAgID8gZGF0YS5mbGFncy5yZWR1Y2UoKHAsIGEpID0+IHAgfCBhLCAwKVxuICAgICAgICAgIDogZGF0YS5mbGFncyxcbiAgICAgIGFsbG93ZWRfbWVudGlvbnM6IGRhdGEuYWxsb3dlZE1lbnRpb25zLFxuICAgICAgZmlsZXM6IGRhdGEuZmlsZXMsXG4gICAgICBjb21wb25lbnRzOlxuICAgICAgICBkYXRhLmNvbXBvbmVudHMgPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgOiB0cmFuc2Zvcm1Db21wb25lbnQoZGF0YS5jb21wb25lbnRzKVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBGZXRjaCB0aGUgTWVzc2FnZSBvYmplY3Qgb2YgdGhlIEludGVyYWN0aW9uIFJlc3BvbnNlICovXG4gIGFzeW5jIGZldGNoUmVzcG9uc2UoKTogUHJvbWlzZTxNZXNzYWdlPiB7XG4gICAgY29uc3QgdXJsID0gV0VCSE9PS19NRVNTQUdFKHRoaXMuYXBwbGljYXRpb25JRCwgdGhpcy50b2tlbiwgJ0BvcmlnaW5hbCcpXG4gICAgY29uc3QgbWVzc2FnZSA9IGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuZ2V0KHVybClcbiAgICByZXR1cm4gbmV3IE1lc3NhZ2UoXG4gICAgICB0aGlzLmNsaWVudCxcbiAgICAgIG1lc3NhZ2UsXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgICB0aGlzLmNoYW5uZWwhLFxuICAgICAgbmV3IFVzZXIodGhpcy5jbGllbnQsIG1lc3NhZ2UuYXV0aG9yKVxuICAgIClcbiAgfVxuXG4gIC8qKiBSZXNwb25kIHdpdGggYSBNb2RhbCAqL1xuICBhc3luYyBzaG93TW9kYWwobW9kYWw6IEludGVyYWN0aW9uUmVzcG9uc2VNb2RhbCk6IFByb21pc2U8dGhpcz4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnJlc3BvbmQoe1xuICAgICAgdHlwZTogSW50ZXJhY3Rpb25SZXNwb25zZVR5cGUuTU9EQUwsXG4gICAgICAuLi5tb2RhbFxuICAgIH0pXG4gIH1cblxuICAvKiogRGVsZXRlIHRoZSBvcmlnaW5hbCBJbnRlcmFjdGlvbiBSZXNwb25zZSAqL1xuICBhc3luYyBkZWxldGVSZXNwb25zZSgpOiBQcm9taXNlPHRoaXM+IHtcbiAgICBjb25zdCB1cmwgPSBXRUJIT09LX01FU1NBR0UodGhpcy5hcHBsaWNhdGlvbklELCB0aGlzLnRva2VuLCAnQG9yaWdpbmFsJylcbiAgICBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmRlbGV0ZSh1cmwpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGdldCB1cmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYGh0dHBzOi8vZGlzY29yZC5jb20vYXBpL3Yke1xuICAgICAgdGhpcy5jbGllbnQ/LnJlc3Q/LnZlcnNpb24gPz8gQ29uc3RhbnRzLkRJU0NPUkRfQVBJX1ZFUlNJT05cbiAgICB9L3dlYmhvb2tzLyR7dGhpcy5hcHBsaWNhdGlvbklEfS8ke3RoaXMudG9rZW59YFxuICB9XG5cbiAgLyoqIFNlbmQgYSBmb2xsb3d1cCBtZXNzYWdlICovXG4gIGFzeW5jIHNlbmQoXG4gICAgdGV4dD86IHN0cmluZyB8IEFsbFdlYmhvb2tNZXNzYWdlT3B0aW9ucyxcbiAgICBvcHRpb24/OiBBbGxXZWJob29rTWVzc2FnZU9wdGlvbnNcbiAgKTogUHJvbWlzZTxNZXNzYWdlPiB7XG4gICAgaWYgKHR5cGVvZiB0ZXh0ID09PSAnb2JqZWN0Jykge1xuICAgICAgb3B0aW9uID0gdGV4dFxuICAgICAgdGV4dCA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIGlmICh0ZXh0ID09PSB1bmRlZmluZWQgJiYgb3B0aW9uID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignRWl0aGVyIHRleHQgb3Igb3B0aW9uIGlzIG5lY2Vzc2FyeS4nKVxuICAgIH1cblxuICAgIGlmIChvcHRpb24gaW5zdGFuY2VvZiBFbWJlZCkge1xuICAgICAgb3B0aW9uID0ge1xuICAgICAgICBlbWJlZHM6IFtvcHRpb25dXG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgIGNvbnRlbnQ6IHRleHQsXG4gICAgICBlbWJlZHM6XG4gICAgICAgIChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKT8uZW1iZWQgIT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gWyhvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKS5lbWJlZF1cbiAgICAgICAgICA6IChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKT8uZW1iZWRzICE9PSB1bmRlZmluZWRcbiAgICAgICAgICA/IChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKS5lbWJlZHNcbiAgICAgICAgICA6IHVuZGVmaW5lZCxcbiAgICAgIGZpbGU6IChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKT8uZmlsZSxcbiAgICAgIGZpbGVzOiAob3B0aW9uIGFzIFdlYmhvb2tNZXNzYWdlT3B0aW9ucyk/LmZpbGVzLFxuICAgICAgdHRzOiAob3B0aW9uIGFzIFdlYmhvb2tNZXNzYWdlT3B0aW9ucyk/LnR0cyxcbiAgICAgIGFsbG93ZWRfbWVudGlvbnM6IChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKT8uYWxsb3dlZE1lbnRpb25zLFxuICAgICAgZmxhZ3M6XG4gICAgICAgICgob3B0aW9uIGFzIFdlYmhvb2tNZXNzYWdlT3B0aW9ucyk/LmZsYWdzID8/IDApIHxcbiAgICAgICAgKChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKT8uZXBoZW1lcmFsID09PSB0cnVlID8gNjQgOiAwKSxcbiAgICAgIGNvbXBvbmVudHM6XG4gICAgICAgIChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKT8uY29tcG9uZW50cyA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICA6IHR5cGVvZiAob3B0aW9uIGFzIFdlYmhvb2tNZXNzYWdlT3B0aW9ucykuY29tcG9uZW50cyA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgICAgID8gKG9wdGlvbiBhcyB7IGNvbXBvbmVudHM6IENhbGxhYmxlRnVuY3Rpb24gfSkuY29tcG9uZW50cygpXG4gICAgICAgICAgOiB0cmFuc2Zvcm1Db21wb25lbnQoXG4gICAgICAgICAgICAgIChvcHRpb24gYXMgeyBjb21wb25lbnRzOiBNZXNzYWdlQ29tcG9uZW50RGF0YVtdIH0pLmNvbXBvbmVudHNcbiAgICAgICAgICAgICksXG4gICAgICB1c2VybmFtZTogdW5kZWZpbmVkIGFzIHVuZGVmaW5lZCB8IHN0cmluZyxcbiAgICAgIGF2YXRhcjogdW5kZWZpbmVkIGFzIHVuZGVmaW5lZCB8IHN0cmluZ1xuICAgIH1cblxuICAgIGlmICgob3B0aW9uIGFzIFdlYmhvb2tNZXNzYWdlT3B0aW9ucyk/Lm5hbWUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcGF5bG9hZC51c2VybmFtZSA9IChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKT8ubmFtZVxuICAgIH1cblxuICAgIGlmICgob3B0aW9uIGFzIFdlYmhvb2tNZXNzYWdlT3B0aW9ucyk/LmF2YXRhciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBwYXlsb2FkLmF2YXRhciA9IChvcHRpb24gYXMgV2ViaG9va01lc3NhZ2VPcHRpb25zKT8uYXZhdGFyXG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgcGF5bG9hZC5lbWJlZHMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgcGF5bG9hZC5lbWJlZHMgaW5zdGFuY2VvZiBBcnJheSAmJlxuICAgICAgcGF5bG9hZC5lbWJlZHMubGVuZ3RoID4gMTBcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgYENhbm5vdCBzZW5kIG1vcmUgdGhhbiAxMCBlbWJlZHMgdGhyb3VnaCBJbnRlcmFjdGlvbiBXZWJob29rYFxuICAgICAgKVxuICAgIH1cblxuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LnBvc3QoYCR7dGhpcy51cmx9P3dhaXQ9dHJ1ZWAsIHBheWxvYWQpXG5cbiAgICBjb25zdCByZXMgPSBuZXcgTWVzc2FnZShcbiAgICAgIHRoaXMuY2xpZW50LFxuICAgICAgcmVzcCxcbiAgICAgIHRoaXMgYXMgdW5rbm93biBhcyBUZXh0Q2hhbm5lbCxcbiAgICAgIHRoaXMgYXMgdW5rbm93biBhcyBVc2VyXG4gICAgKVxuICAgIGF3YWl0IHJlcy5tZW50aW9ucy5mcm9tUGF5bG9hZChyZXNwKVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIC8qKiBFZGl0IGEgRm9sbG93dXAgbWVzc2FnZSAqL1xuICBhc3luYyBlZGl0TWVzc2FnZShcbiAgICBtc2c6IE1lc3NhZ2UgfCBzdHJpbmcsXG4gICAgZGF0YToge1xuICAgICAgY29udGVudD86IHN0cmluZ1xuICAgICAgY29tcG9uZW50cz86IE1lc3NhZ2VDb21wb25lbnREYXRhW11cbiAgICAgIGVtYmVkcz86IEFycmF5PEVtYmVkIHwgRW1iZWRQYXlsb2FkPlxuICAgICAgZmlsZT86IE1lc3NhZ2VBdHRhY2htZW50XG4gICAgICBhbGxvd2VkX21lbnRpb25zPzoge1xuICAgICAgICBwYXJzZT86IHN0cmluZ1xuICAgICAgICByb2xlcz86IHN0cmluZ1tdXG4gICAgICAgIHVzZXJzPzogc3RyaW5nW11cbiAgICAgICAgZXZlcnlvbmU/OiBib29sZWFuXG4gICAgICB9XG4gICAgfVxuICApOiBQcm9taXNlPHRoaXM+IHtcbiAgICBjb25zdCBwYXlsb2FkOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHsgLi4uZGF0YSB9XG5cbiAgICBpZiAoZGF0YS5jb21wb25lbnRzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHBheWxvYWQuY29tcG9uZW50cyA9IHRyYW5zZm9ybUNvbXBvbmVudChkYXRhLmNvbXBvbmVudHMpXG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5jbGllbnQucmVzdC5wYXRjaChcbiAgICAgIFdFQkhPT0tfTUVTU0FHRShcbiAgICAgICAgdGhpcy5hcHBsaWNhdGlvbklELFxuICAgICAgICB0aGlzLnRva2VuID8/IHRoaXMuY2xpZW50LnRva2VuLFxuICAgICAgICB0eXBlb2YgbXNnID09PSAnc3RyaW5nJyA/IG1zZyA6IG1zZy5pZFxuICAgICAgKSxcbiAgICAgIGRhdGFcbiAgICApXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBEZWxldGUgYSBmb2xsb3ctdXAgTWVzc2FnZSAqL1xuICBhc3luYyBkZWxldGVNZXNzYWdlKG1zZzogTWVzc2FnZSB8IHN0cmluZyk6IFByb21pc2U8dGhpcz4ge1xuICAgIGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuZGVsZXRlKFxuICAgICAgV0VCSE9PS19NRVNTQUdFKFxuICAgICAgICB0aGlzLmFwcGxpY2F0aW9uSUQsXG4gICAgICAgIHRoaXMudG9rZW4gPz8gdGhpcy5jbGllbnQudG9rZW4sXG4gICAgICAgIHR5cGVvZiBtc2cgPT09ICdzdHJpbmcnID8gbXNnIDogbXNnLmlkXG4gICAgICApXG4gICAgKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLGtCQUFrQixRQUFRLHlCQUF3QjtBQU8zRCxTQUFTLFNBQVMsUUFBUSx3QkFBdUI7QUFDakQsU0FBUyxvQkFBb0IsRUFBRSxlQUFlLFFBQVEsdUJBQXNCO0FBQzVFLFNBRUUsd0JBQXdCLEVBRXhCLHVCQUF1QixFQUN2QixlQUFlLFFBQ1YsMkJBQTBCO0FB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