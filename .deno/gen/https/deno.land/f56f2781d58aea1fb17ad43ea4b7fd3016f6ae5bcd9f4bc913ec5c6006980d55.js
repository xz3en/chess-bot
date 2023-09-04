import { CHANNEL } from '../types/endpoint.ts';
import { transformComponent } from '../utils/components.ts';
import { Embed } from './embed.ts';
import { Emoji } from './emoji.ts';
import { GuildThreadAvailableChannel } from './guildThreadAvailableChannel.ts';
import { Message } from './message.ts';
import { ThreadChannel } from './threadChannel.ts';
export class GuildForumTag {
    id;
    name;
    moderated;
    emojiID;
    emojiName;
    constructor(data){
        this.readFromData(data);
    }
    readFromData(data) {
        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
        this.moderated = data.moderated ?? this.moderated;
        this.emojiID = data.emoji_id ?? this.emojiID;
        this.emojiName = data.emoji_name ?? this.emojiName;
    }
}
export class GuildForumChannel extends GuildThreadAvailableChannel {
    availableTags;
    defaultReactionEmoji;
    defaultSortOrder;
    constructor(client, data, guild){
        super(client, data, guild);
        this.readFromData(data);
    }
    readFromData(data) {
        super.readFromData(data);
        this.availableTags = data.available_tags?.map((tag)=>new GuildForumTag(tag)) ?? this.availableTags;
        this.defaultReactionEmoji = data.default_reaction_emoji !== null ? new Emoji(this.client, {
            id: data.default_reaction_emoji.emoji_id,
            name: data.default_reaction_emoji.emoji_name
        }) : this.defaultReactionEmoji;
        this.defaultSortOrder = data.default_sort_order ?? this.defaultSortOrder;
    }
    async edit(options) {
        if (options?.defaultReactionEmoji !== undefined) {
            if (options.defaultReactionEmoji instanceof Emoji) {
                options.defaultReactionEmoji = {
                    emoji_id: options.defaultReactionEmoji.id,
                    emoji_name: options.defaultReactionEmoji.name
                };
            }
        }
        if (options?.availableTags !== undefined) {
            options.availableTags = options.availableTags?.map((tag)=>{
                if (tag instanceof GuildForumTag) {
                    return {
                        id: tag.id,
                        name: tag.name,
                        moderated: tag.moderated,
                        emoji_id: tag.emojiID,
                        emoji_name: tag.emojiName
                    };
                }
                return tag;
            });
        }
        const body = {
            name: options?.name,
            position: options?.position,
            permission_overwrites: options?.permissionOverwrites,
            parent_id: options?.parentID,
            nsfw: options?.nsfw,
            topic: options?.topic,
            rate_limit_per_user: options?.slowmode,
            default_auto_archive_duration: options?.defaultAutoArchiveDuration,
            default_thread_rate_limit_per_user: options?.defaultThreadSlowmode,
            default_sort_order: options?.defaultSortOrder,
            default_reaction_emoji: options?.defaultReactionEmoji,
            available_tags: options?.availableTags
        };
        const resp = await this.client.rest.patch(CHANNEL(this.id), body);
        return new GuildForumChannel(this.client, resp, this.guild);
    }
    async startThread(options, message) {
        if (options.message !== undefined) {
            message = options.message;
        }
        if (message instanceof Message) {
            message = {
                content: message.content,
                embeds: message.embeds.map((embed)=>new Embed(embed)),
                components: message.components
            };
        } else if (message instanceof Embed) {
            message = {
                embed: message
            };
        } else if (Array.isArray(message)) {
            message = {
                embeds: message
            };
        } else if (typeof message === 'string') {
            message = {
                content: message
            };
        }
        const messageObject = {
            content: message?.content,
            embed: message?.embed,
            embeds: message?.embeds,
            file: message?.file,
            files: message?.files,
            allowed_mentions: message?.allowedMentions,
            components: message?.components !== undefined ? typeof message.components === 'function' ? message.components() : transformComponent(message.components) : undefined
        };
        if (messageObject.content === undefined && messageObject.embed === undefined) {
            messageObject.content = '';
        }
        const body = {
            name: options.name,
            auto_archive_duration: options.autoArchiveDuration,
            rate_limit_per_user: options.slowmode,
            message: messageObject,
            applied_tags: options.appliedTags?.map((tag)=>{
                if (tag instanceof GuildForumTag) {
                    return tag.id;
                }
                return tag;
            })
        };
        const resp = await this.client.rest.api.channels[this.id].threads.post(body);
        const thread = new ThreadChannel(this.client, resp, this.guild);
        this.threads.set(thread.id, resp);
        return thread;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvZ3VpbGRGb3J1bUNoYW5uZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ2xpZW50IH0gZnJvbSAnLi4vY2xpZW50L2NsaWVudC50cydcbmltcG9ydCB0eXBlIHsgQWxsTWVzc2FnZU9wdGlvbnMgfSBmcm9tICcuLi9tYW5hZ2Vycy9jaGFubmVscy50cydcbmltcG9ydCB7XG4gIENyZWF0ZVRocmVhZEluRm9ydW1QYXlsb2FkLFxuICBHdWlsZEZvcnVtQ2hhbm5lbFBheWxvYWQsXG4gIEd1aWxkRm9ydW1Tb3J0T3JkZXJUeXBlcyxcbiAgR3VpbGRGb3J1bVRhZ1BheWxvYWQsXG4gIE1vZGlmeUd1aWxkRm9ydW1DaGFubmVsT3B0aW9uLFxuICBNb2RpZnlHdWlsZEZvcnVtQ2hhbm5lbFBheWxvYWQsXG4gIFRocmVhZENoYW5uZWxQYXlsb2FkXG59IGZyb20gJy4uL3R5cGVzL2NoYW5uZWwudHMnXG5pbXBvcnQgeyBDSEFOTkVMIH0gZnJvbSAnLi4vdHlwZXMvZW5kcG9pbnQudHMnXG5pbXBvcnQgeyB0cmFuc2Zvcm1Db21wb25lbnQgfSBmcm9tICcuLi91dGlscy9jb21wb25lbnRzLnRzJ1xuaW1wb3J0IHsgRW1iZWQgfSBmcm9tICcuL2VtYmVkLnRzJ1xuaW1wb3J0IHsgRW1vamkgfSBmcm9tICcuL2Vtb2ppLnRzJ1xuaW1wb3J0IHsgR3VpbGQgfSBmcm9tICcuL2d1aWxkLnRzJ1xuaW1wb3J0IHsgR3VpbGRUaHJlYWRBdmFpbGFibGVDaGFubmVsIH0gZnJvbSAnLi9ndWlsZFRocmVhZEF2YWlsYWJsZUNoYW5uZWwudHMnXG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSAnLi9tZXNzYWdlLnRzJ1xuaW1wb3J0IHsgVGhyZWFkQ2hhbm5lbCB9IGZyb20gJy4vdGhyZWFkQ2hhbm5lbC50cydcblxuZXhwb3J0IGludGVyZmFjZSBDcmVhdGVUaHJlYWRJbkZvcnVtT3B0aW9ucyB7XG4gIC8qKiAyLTEwMCBjaGFyYWN0ZXIgY2hhbm5lbCBuYW1lICovXG4gIG5hbWU6IHN0cmluZ1xuICAvKiogZHVyYXRpb24gaW4gbWludXRlcyB0byBhdXRvbWF0aWNhbGx5IGFyY2hpdmUgdGhlIHRocmVhZCBhZnRlciByZWNlbnQgYWN0aXZpdHksIGNhbiBiZSBzZXQgdG86IDYwLCAxNDQwLCA0MzIwLCAxMDA4MCAqL1xuICBhdXRvQXJjaGl2ZUR1cmF0aW9uPzogbnVtYmVyXG4gIHNsb3dtb2RlPzogbnVtYmVyIHwgbnVsbFxuICBtZXNzYWdlOiBzdHJpbmcgfCBBbGxNZXNzYWdlT3B0aW9uc1xuICBhcHBsaWVkVGFncz86IHN0cmluZ1tdIHwgR3VpbGRGb3J1bVRhZ1tdXG59XG5cbmV4cG9ydCBjbGFzcyBHdWlsZEZvcnVtVGFnIHtcbiAgaWQhOiBzdHJpbmdcbiAgbmFtZSE6IHN0cmluZ1xuICBtb2RlcmF0ZWQhOiBib29sZWFuXG4gIGVtb2ppSUQhOiBzdHJpbmdcbiAgZW1vamlOYW1lITogc3RyaW5nIHwgbnVsbFxuXG4gIGNvbnN0cnVjdG9yKGRhdGE6IEd1aWxkRm9ydW1UYWdQYXlsb2FkKSB7XG4gICAgdGhpcy5yZWFkRnJvbURhdGEoZGF0YSlcbiAgfVxuXG4gIHJlYWRGcm9tRGF0YShkYXRhOiBHdWlsZEZvcnVtVGFnUGF5bG9hZCk6IHZvaWQge1xuICAgIHRoaXMuaWQgPSBkYXRhLmlkID8/IHRoaXMuaWRcbiAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWUgPz8gdGhpcy5uYW1lXG4gICAgdGhpcy5tb2RlcmF0ZWQgPSBkYXRhLm1vZGVyYXRlZCA/PyB0aGlzLm1vZGVyYXRlZFxuICAgIHRoaXMuZW1vamlJRCA9IGRhdGEuZW1vamlfaWQgPz8gdGhpcy5lbW9qaUlEXG4gICAgdGhpcy5lbW9qaU5hbWUgPSBkYXRhLmVtb2ppX25hbWUgPz8gdGhpcy5lbW9qaU5hbWVcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgR3VpbGRGb3J1bUNoYW5uZWwgZXh0ZW5kcyBHdWlsZFRocmVhZEF2YWlsYWJsZUNoYW5uZWwge1xuICBhdmFpbGFibGVUYWdzITogR3VpbGRGb3J1bVRhZ1tdXG4gIGRlZmF1bHRSZWFjdGlvbkVtb2ppITogRW1vamlcbiAgZGVmYXVsdFNvcnRPcmRlciE6IEd1aWxkRm9ydW1Tb3J0T3JkZXJUeXBlc1xuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50LCBkYXRhOiBHdWlsZEZvcnVtQ2hhbm5lbFBheWxvYWQsIGd1aWxkOiBHdWlsZCkge1xuICAgIHN1cGVyKGNsaWVudCwgZGF0YSwgZ3VpbGQpXG4gICAgdGhpcy5yZWFkRnJvbURhdGEoZGF0YSlcbiAgfVxuXG4gIHJlYWRGcm9tRGF0YShkYXRhOiBHdWlsZEZvcnVtQ2hhbm5lbFBheWxvYWQpOiB2b2lkIHtcbiAgICBzdXBlci5yZWFkRnJvbURhdGEoZGF0YSlcbiAgICB0aGlzLmF2YWlsYWJsZVRhZ3MgPVxuICAgICAgZGF0YS5hdmFpbGFibGVfdGFncz8ubWFwKCh0YWcpID0+IG5ldyBHdWlsZEZvcnVtVGFnKHRhZykpID8/XG4gICAgICB0aGlzLmF2YWlsYWJsZVRhZ3NcbiAgICB0aGlzLmRlZmF1bHRSZWFjdGlvbkVtb2ppID1cbiAgICAgIGRhdGEuZGVmYXVsdF9yZWFjdGlvbl9lbW9qaSAhPT0gbnVsbFxuICAgICAgICA/IG5ldyBFbW9qaSh0aGlzLmNsaWVudCwge1xuICAgICAgICAgICAgaWQ6IGRhdGEuZGVmYXVsdF9yZWFjdGlvbl9lbW9qaS5lbW9qaV9pZCxcbiAgICAgICAgICAgIG5hbWU6IGRhdGEuZGVmYXVsdF9yZWFjdGlvbl9lbW9qaS5lbW9qaV9uYW1lXG4gICAgICAgICAgfSlcbiAgICAgICAgOiB0aGlzLmRlZmF1bHRSZWFjdGlvbkVtb2ppXG4gICAgdGhpcy5kZWZhdWx0U29ydE9yZGVyID0gZGF0YS5kZWZhdWx0X3NvcnRfb3JkZXIgPz8gdGhpcy5kZWZhdWx0U29ydE9yZGVyXG4gIH1cblxuICBhc3luYyBlZGl0KFxuICAgIG9wdGlvbnM/OiBNb2RpZnlHdWlsZEZvcnVtQ2hhbm5lbE9wdGlvblxuICApOiBQcm9taXNlPEd1aWxkRm9ydW1DaGFubmVsPiB7XG4gICAgaWYgKG9wdGlvbnM/LmRlZmF1bHRSZWFjdGlvbkVtb2ppICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmIChvcHRpb25zLmRlZmF1bHRSZWFjdGlvbkVtb2ppIGluc3RhbmNlb2YgRW1vamkpIHtcbiAgICAgICAgb3B0aW9ucy5kZWZhdWx0UmVhY3Rpb25FbW9qaSA9IHtcbiAgICAgICAgICBlbW9qaV9pZDogb3B0aW9ucy5kZWZhdWx0UmVhY3Rpb25FbW9qaS5pZCxcbiAgICAgICAgICBlbW9qaV9uYW1lOiBvcHRpb25zLmRlZmF1bHRSZWFjdGlvbkVtb2ppLm5hbWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAob3B0aW9ucz8uYXZhaWxhYmxlVGFncyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBvcHRpb25zLmF2YWlsYWJsZVRhZ3MgPSBvcHRpb25zLmF2YWlsYWJsZVRhZ3M/Lm1hcCgodGFnKSA9PiB7XG4gICAgICAgIGlmICh0YWcgaW5zdGFuY2VvZiBHdWlsZEZvcnVtVGFnKSB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiB0YWcuaWQsXG4gICAgICAgICAgICBuYW1lOiB0YWcubmFtZSxcbiAgICAgICAgICAgIG1vZGVyYXRlZDogdGFnLm1vZGVyYXRlZCxcbiAgICAgICAgICAgIGVtb2ppX2lkOiB0YWcuZW1vamlJRCxcbiAgICAgICAgICAgIGVtb2ppX25hbWU6IHRhZy5lbW9qaU5hbWVcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhZ1xuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBib2R5OiBNb2RpZnlHdWlsZEZvcnVtQ2hhbm5lbFBheWxvYWQgPSB7XG4gICAgICBuYW1lOiBvcHRpb25zPy5uYW1lLFxuICAgICAgcG9zaXRpb246IG9wdGlvbnM/LnBvc2l0aW9uLFxuICAgICAgcGVybWlzc2lvbl9vdmVyd3JpdGVzOiBvcHRpb25zPy5wZXJtaXNzaW9uT3ZlcndyaXRlcyxcbiAgICAgIHBhcmVudF9pZDogb3B0aW9ucz8ucGFyZW50SUQsXG4gICAgICBuc2Z3OiBvcHRpb25zPy5uc2Z3LFxuICAgICAgdG9waWM6IG9wdGlvbnM/LnRvcGljLFxuICAgICAgcmF0ZV9saW1pdF9wZXJfdXNlcjogb3B0aW9ucz8uc2xvd21vZGUsXG4gICAgICBkZWZhdWx0X2F1dG9fYXJjaGl2ZV9kdXJhdGlvbjogb3B0aW9ucz8uZGVmYXVsdEF1dG9BcmNoaXZlRHVyYXRpb24sXG4gICAgICBkZWZhdWx0X3RocmVhZF9yYXRlX2xpbWl0X3Blcl91c2VyOiBvcHRpb25zPy5kZWZhdWx0VGhyZWFkU2xvd21vZGUsXG4gICAgICBkZWZhdWx0X3NvcnRfb3JkZXI6IG9wdGlvbnM/LmRlZmF1bHRTb3J0T3JkZXIsXG4gICAgICBkZWZhdWx0X3JlYWN0aW9uX2Vtb2ppOiBvcHRpb25zPy5kZWZhdWx0UmVhY3Rpb25FbW9qaSxcbiAgICAgIGF2YWlsYWJsZV90YWdzOiBvcHRpb25zPy5hdmFpbGFibGVUYWdzXG4gICAgfVxuXG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMuY2xpZW50LnJlc3QucGF0Y2goQ0hBTk5FTCh0aGlzLmlkKSwgYm9keSlcblxuICAgIHJldHVybiBuZXcgR3VpbGRGb3J1bUNoYW5uZWwodGhpcy5jbGllbnQsIHJlc3AsIHRoaXMuZ3VpbGQpXG4gIH1cblxuICBvdmVycmlkZSBhc3luYyBzdGFydFRocmVhZChcbiAgICBvcHRpb25zOiBDcmVhdGVUaHJlYWRJbkZvcnVtT3B0aW9ucyxcbiAgICBtZXNzYWdlPzogc3RyaW5nIHwgQWxsTWVzc2FnZU9wdGlvbnMgfCBNZXNzYWdlXG4gICk6IFByb21pc2U8VGhyZWFkQ2hhbm5lbD4ge1xuICAgIGlmIChvcHRpb25zLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbWVzc2FnZSA9IG9wdGlvbnMubWVzc2FnZVxuICAgIH1cbiAgICBpZiAobWVzc2FnZSBpbnN0YW5jZW9mIE1lc3NhZ2UpIHtcbiAgICAgIG1lc3NhZ2UgPSB7XG4gICAgICAgIGNvbnRlbnQ6IG1lc3NhZ2UuY29udGVudCxcbiAgICAgICAgZW1iZWRzOiBtZXNzYWdlLmVtYmVkcy5tYXAoKGVtYmVkKSA9PiBuZXcgRW1iZWQoZW1iZWQpKSxcbiAgICAgICAgY29tcG9uZW50czogbWVzc2FnZS5jb21wb25lbnRzXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChtZXNzYWdlIGluc3RhbmNlb2YgRW1iZWQpIHtcbiAgICAgIG1lc3NhZ2UgPSB7XG4gICAgICAgIGVtYmVkOiBtZXNzYWdlXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChBcnJheS5pc0FycmF5KG1lc3NhZ2UpKSB7XG4gICAgICBtZXNzYWdlID0ge1xuICAgICAgICBlbWJlZHM6IG1lc3NhZ2VcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBtZXNzYWdlID09PSAnc3RyaW5nJykge1xuICAgICAgbWVzc2FnZSA9IHtcbiAgICAgICAgY29udGVudDogbWVzc2FnZVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IG1lc3NhZ2VPYmplY3QgPSB7XG4gICAgICBjb250ZW50OiBtZXNzYWdlPy5jb250ZW50LFxuICAgICAgZW1iZWQ6IG1lc3NhZ2U/LmVtYmVkLFxuICAgICAgZW1iZWRzOiBtZXNzYWdlPy5lbWJlZHMsXG4gICAgICBmaWxlOiBtZXNzYWdlPy5maWxlLFxuICAgICAgZmlsZXM6IG1lc3NhZ2U/LmZpbGVzLFxuICAgICAgYWxsb3dlZF9tZW50aW9uczogbWVzc2FnZT8uYWxsb3dlZE1lbnRpb25zLFxuICAgICAgY29tcG9uZW50czpcbiAgICAgICAgbWVzc2FnZT8uY29tcG9uZW50cyAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyB0eXBlb2YgbWVzc2FnZS5jb21wb25lbnRzID09PSAnZnVuY3Rpb24nXG4gICAgICAgICAgICA/IG1lc3NhZ2UuY29tcG9uZW50cygpXG4gICAgICAgICAgICA6IHRyYW5zZm9ybUNvbXBvbmVudChtZXNzYWdlLmNvbXBvbmVudHMpXG4gICAgICAgICAgOiB1bmRlZmluZWRcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBtZXNzYWdlT2JqZWN0LmNvbnRlbnQgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgbWVzc2FnZU9iamVjdC5lbWJlZCA9PT0gdW5kZWZpbmVkXG4gICAgKSB7XG4gICAgICBtZXNzYWdlT2JqZWN0LmNvbnRlbnQgPSAnJ1xuICAgIH1cblxuICAgIGNvbnN0IGJvZHk6IENyZWF0ZVRocmVhZEluRm9ydW1QYXlsb2FkID0ge1xuICAgICAgbmFtZTogb3B0aW9ucy5uYW1lLFxuICAgICAgYXV0b19hcmNoaXZlX2R1cmF0aW9uOiBvcHRpb25zLmF1dG9BcmNoaXZlRHVyYXRpb24sXG4gICAgICByYXRlX2xpbWl0X3Blcl91c2VyOiBvcHRpb25zLnNsb3dtb2RlLFxuICAgICAgbWVzc2FnZTogbWVzc2FnZU9iamVjdCxcbiAgICAgIGFwcGxpZWRfdGFnczogb3B0aW9ucy5hcHBsaWVkVGFncz8ubWFwKCh0YWcpID0+IHtcbiAgICAgICAgaWYgKHRhZyBpbnN0YW5jZW9mIEd1aWxkRm9ydW1UYWcpIHtcbiAgICAgICAgICByZXR1cm4gdGFnLmlkXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRhZ1xuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCByZXNwOiBUaHJlYWRDaGFubmVsUGF5bG9hZCA9IGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuYXBpLmNoYW5uZWxzW1xuICAgICAgdGhpcy5pZFxuICAgIF0udGhyZWFkcy5wb3N0KGJvZHkpXG4gICAgY29uc3QgdGhyZWFkID0gbmV3IFRocmVhZENoYW5uZWwodGhpcy5jbGllbnQsIHJlc3AsIHRoaXMuZ3VpbGQpXG4gICAgdGhpcy50aHJlYWRzLnNldCh0aHJlYWQuaWQsIHJlc3ApXG4gICAgcmV0dXJuIHRocmVhZFxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBV0EsU0FBUyxPQUFPLFFBQVEsdUJBQXNCO0FBQzlDLFNBQVMsa0JBQWtCLFFBQVEseUJBQXdCO0FBQzNELFNBQVMsS0FBSyxRQUFRLGFBQVk7QUFDbEMsU0FBUyxLQUFLLFFBQVEsYUFBWTtBQUVsQyxTQUFTLDJCQUEyQixRQUFRLG1DQUFrQztBQUM5RSxTQUFTLE9BQU8sUUFBUSxlQUFjO0FBQ3RDLFNBQVMsYUFBYSxRQUFRLHFCQUFvQjtBQVlsRCxPQUFPLE1BQU07SUFDWCxHQUFXO0lBQ1gsS0FBYTtJQUNiLFVBQW1CO0lBQ25CLFFBQWdCO0lBQ2hCLFVBQXlCO0lBRXpCLFlBQVksSUFBMEIsQ0FBRTtRQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ3BCO0lBRUEsYUFBYSxJQUEwQixFQUFRO1FBQzdDLElBQUksQ0FBQyxFQUFFLEdBQUcsS0FBSyxFQUFFLElBQUksSUFBSSxDQUFDLEVBQUU7UUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSTtRQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssU0FBUyxJQUFJLElBQUksQ0FBQyxTQUFTO1FBQ2pELElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxRQUFRLElBQUksSUFBSSxDQUFDLE9BQU87UUFDNUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLFVBQVUsSUFBSSxJQUFJLENBQUMsU0FBUztJQUNwRDtBQUNGLENBQUM7QUFFRCxPQUFPLE1BQU0sMEJBQTBCO0lBQ3JDLGNBQStCO0lBQy9CLHFCQUE0QjtJQUM1QixpQkFBMkM7SUFFM0MsWUFBWSxNQUFjLEVBQUUsSUFBOEIsRUFBRSxLQUFZLENBQUU7UUFDeEUsS0FBSyxDQUFDLFFBQVEsTUFBTTtRQUNwQixJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ3BCO0lBRUEsYUFBYSxJQUE4QixFQUFRO1FBQ2pELEtBQUssQ0FBQyxZQUFZLENBQUM7UUFDbkIsSUFBSSxDQUFDLGFBQWEsR0FDaEIsS0FBSyxjQUFjLEVBQUUsSUFBSSxDQUFDLE1BQVEsSUFBSSxjQUFjLFNBQ3BELElBQUksQ0FBQyxhQUFhO1FBQ3BCLElBQUksQ0FBQyxvQkFBb0IsR0FDdkIsS0FBSyxzQkFBc0IsS0FBSyxJQUFJLEdBQ2hDLElBQUksTUFBTSxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3JCLElBQUksS0FBSyxzQkFBc0IsQ0FBQyxRQUFRO1lBQ3hDLE1BQU0sS0FBSyxzQkFBc0IsQ0FBQyxVQUFVO1FBQzlDLEtBQ0EsSUFBSSxDQUFDLG9CQUFvQjtRQUMvQixJQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSyxrQkFBa0IsSUFBSSxJQUFJLENBQUMsZ0JBQWdCO0lBQzFFO0lBRUEsTUFBTSxLQUNKLE9BQXVDLEVBQ1g7UUFDNUIsSUFBSSxTQUFTLHlCQUF5QixXQUFXO1lBQy9DLElBQUksUUFBUSxvQkFBb0IsWUFBWSxPQUFPO2dCQUNqRCxRQUFRLG9CQUFvQixHQUFHO29CQUM3QixVQUFVLFFBQVEsb0JBQW9CLENBQUMsRUFBRTtvQkFDekMsWUFBWSxRQUFRLG9CQUFvQixDQUFDLElBQUk7Z0JBQy9DO1lBQ0YsQ0FBQztRQUNILENBQUM7UUFDRCxJQUFJLFNBQVMsa0JBQWtCLFdBQVc7WUFDeEMsUUFBUSxhQUFhLEdBQUcsUUFBUSxhQUFhLEVBQUUsSUFBSSxDQUFDLE1BQVE7Z0JBQzFELElBQUksZUFBZSxlQUFlO29CQUNoQyxPQUFPO3dCQUNMLElBQUksSUFBSSxFQUFFO3dCQUNWLE1BQU0sSUFBSSxJQUFJO3dCQUNkLFdBQVcsSUFBSSxTQUFTO3dCQUN4QixVQUFVLElBQUksT0FBTzt3QkFDckIsWUFBWSxJQUFJLFNBQVM7b0JBQzNCO2dCQUNGLENBQUM7Z0JBQ0QsT0FBTztZQUNUO1FBQ0YsQ0FBQztRQUVELE1BQU0sT0FBdUM7WUFDM0MsTUFBTSxTQUFTO1lBQ2YsVUFBVSxTQUFTO1lBQ25CLHVCQUF1QixTQUFTO1lBQ2hDLFdBQVcsU0FBUztZQUNwQixNQUFNLFNBQVM7WUFDZixPQUFPLFNBQVM7WUFDaEIscUJBQXFCLFNBQVM7WUFDOUIsK0JBQStCLFNBQVM7WUFDeEMsb0NBQW9DLFNBQVM7WUFDN0Msb0JBQW9CLFNBQVM7WUFDN0Isd0JBQXdCLFNBQVM7WUFDakMsZ0JBQWdCLFNBQVM7UUFDM0I7UUFFQSxNQUFNLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHO1FBRTVELE9BQU8sSUFBSSxrQkFBa0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQyxLQUFLO0lBQzVEO0lBRUEsTUFBZSxZQUNiLE9BQW1DLEVBQ25DLE9BQThDLEVBQ3RCO1FBQ3hCLElBQUksUUFBUSxPQUFPLEtBQUssV0FBVztZQUNqQyxVQUFVLFFBQVEsT0FBTztRQUMzQixDQUFDO1FBQ0QsSUFBSSxtQkFBbUIsU0FBUztZQUM5QixVQUFVO2dCQUNSLFNBQVMsUUFBUSxPQUFPO2dCQUN4QixRQUFRLFFBQVEsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVUsSUFBSSxNQUFNO2dCQUNoRCxZQUFZLFFBQVEsVUFBVTtZQUNoQztRQUNGLE9BQU8sSUFBSSxtQkFBbUIsT0FBTztZQUNuQyxVQUFVO2dCQUNSLE9BQU87WUFDVDtRQUNGLE9BQU8sSUFBSSxNQUFNLE9BQU8sQ0FBQyxVQUFVO1lBQ2pDLFVBQVU7Z0JBQ1IsUUFBUTtZQUNWO1FBQ0YsT0FBTyxJQUFJLE9BQU8sWUFBWSxVQUFVO1lBQ3RDLFVBQVU7Z0JBQ1IsU0FBUztZQUNYO1FBQ0YsQ0FBQztRQUVELE1BQU0sZ0JBQWdCO1lBQ3BCLFNBQVMsU0FBUztZQUNsQixPQUFPLFNBQVM7WUFDaEIsUUFBUSxTQUFTO1lBQ2pCLE1BQU0sU0FBUztZQUNmLE9BQU8sU0FBUztZQUNoQixrQkFBa0IsU0FBUztZQUMzQixZQUNFLFNBQVMsZUFBZSxZQUNwQixPQUFPLFFBQVEsVUFBVSxLQUFLLGFBQzVCLFFBQVEsVUFBVSxLQUNsQixtQkFBbUIsUUFBUSxVQUFVLENBQUMsR0FDeEMsU0FBUztRQUNqQjtRQUVBLElBQ0UsY0FBYyxPQUFPLEtBQUssYUFDMUIsY0FBYyxLQUFLLEtBQUssV0FDeEI7WUFDQSxjQUFjLE9BQU8sR0FBRztRQUMxQixDQUFDO1FBRUQsTUFBTSxPQUFtQztZQUN2QyxNQUFNLFFBQVEsSUFBSTtZQUNsQix1QkFBdUIsUUFBUSxtQkFBbUI7WUFDbEQscUJBQXFCLFFBQVEsUUFBUTtZQUNyQyxTQUFTO1lBQ1QsY0FBYyxRQUFRLFdBQVcsRUFBRSxJQUFJLENBQUMsTUFBUTtnQkFDOUMsSUFBSSxlQUFlLGVBQWU7b0JBQ2hDLE9BQU8sSUFBSSxFQUFFO2dCQUNmLENBQUM7Z0JBQ0QsT0FBTztZQUNUO1FBQ0Y7UUFFQSxNQUFNLE9BQTZCLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FDcEUsSUFBSSxDQUFDLEVBQUUsQ0FDUixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDZixNQUFNLFNBQVMsSUFBSSxjQUFjLElBQUksQ0FBQyxNQUFNLEVBQUUsTUFBTSxJQUFJLENBQUMsS0FBSztRQUM5RCxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUM1QixPQUFPO0lBQ1Q7QUFDRixDQUFDIn0=