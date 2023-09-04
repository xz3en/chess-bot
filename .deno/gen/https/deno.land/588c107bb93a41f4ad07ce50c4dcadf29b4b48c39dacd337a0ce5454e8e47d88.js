import { GatewayIntents } from '../types/gateway.ts';
import { ApplicationCommandType } from '../types/applicationCommand.ts';
/**
 * Wraps the command handler with a validation function.
 * @param desc property descriptor
 * @param validation validation function and action to show or call if validation fails
 * @returns wrapped function
 */ function wrapConditionApplicationCommandHandler(desc, validation) {
    if (typeof desc.value !== 'function') {
        throw new Error('The decorator requires a function');
    }
    const { condition , action  } = validation;
    const original = desc.value;
    return async function(i) {
        if (!await condition(i)) {
            // condition not met
            if (typeof action === 'string') {
                i.reply(action);
            } else if (typeof action === 'function') {
                action(i);
            }
            return;
        } // condition met
        return original.call(this, i);
    };
}
/**
 * Decorator to add a autocomplete interaction handler.
 *
 * Example:
 * ```ts
 * class MyClient extends Client {
 *   // ...
 *
 *   @autocomplete("search", "query")
 *   searchCompletions(i: AutocompleteInteraction) {
 *     // ...
 *   }
 * }
 * ```
 *
 * @param command Command name of which options' to provide autocompletions for. Can be `*` (all).
 * @param option Option name to handle autocompletions for. Can be `*` (all).
 */ export function autocomplete(command, option) {
    return function(client, _prop, desc) {
        if (client._decoratedAutocomplete === undefined) client._decoratedAutocomplete = [];
        if (typeof desc.value !== 'function') {
            throw new Error('@autocomplete decorator requires a function');
        } else client._decoratedAutocomplete.push({
            cmd: command,
            option,
            handler: desc.value
        });
    };
}
/**
 * Decorator to create a Slash Command handler.
 *
 * Example:
 * ```ts
 * class MyClient extends Client {
 *   // ...
 *
 *   @slash("my-command")
 *   myCommand(i: ApplicationCommandInteraction) {
 *     return i.reply("Hello, World!");
 *   }
 * }
 * ```
 *
 * Note that the name parameter is optional in this decorator,
 * it can also be inferred from the method name you define and
 * use decorator on.
 *
 * If you want to split these decorators into different
 * files, you can use these in classes extending
 * `ApplicationCommandsModule` and then use
 * `client.interactions.loadModule`.
 *
 * For handling sub-commands or grouped sub-commands, look
 * into docs for `subslash` and `groupslash`.
 */ export function slash(name, guild) {
    return function(client, prop, desc) {
        if (client._decoratedAppCmd === undefined) client._decoratedAppCmd = [];
        if (typeof desc.value !== 'function') {
            throw new Error('@slash decorator requires a function');
        } else client._decoratedAppCmd.push({
            name: name ?? prop,
            guild,
            handler: desc.value
        });
    };
}
/**
 * Decorator to create a Sub-Command Command handler for a
 * Slash Command.
 *
 * Example:
 * ```ts
 * class MyClient extends Client {
 *   // ...
 *
 *   @subslash("config", "reset")
 *   configReset(i: ApplicationCommandInteraction) {
 *     // ...
 *   }
 * }
 * ```
 *
 * Note that only first argument that is `parent` is required,
 * second can be inferred from the method name you define
 * and use decorator on.
 *
 * For more info on Slash Command handler decorators, look
 * into docs for `slash` decorator.
 */ export function subslash(parent, name, guild) {
    return function(client, prop, desc) {
        if (client._decoratedAppCmd === undefined) client._decoratedAppCmd = [];
        if (typeof desc.value !== 'function') {
            throw new Error('@subslash decorator requires a function');
        } else client._decoratedAppCmd.push({
            parent,
            name: name ?? prop,
            guild,
            handler: desc.value
        });
    };
}
/**
 * Decorator to create a Grouped Sub-Command Command handler
 * for a Slash Command.
 *
 * Example:
 * ```ts
 * class MyClient extends Client {
 *   // ...
 *
 *   @groupslash("config", "options", "set")
 *   configOptionsSet(i: ApplicationCommandInteraction) {
 *     // ...
 *   }
 * }
 * ```
 *
 * Note that only first two arguments i.e. `group` & `parent` are
 * required, name can be inferred from the method name you define
 * and use decorator on.
 *
 * For more info on Slash Command handler decorators, look
 * into docs for `slash` decorator.
 */ export function groupslash(parent, group, name, guild) {
    return function(client, prop, desc) {
        if (client._decoratedAppCmd === undefined) client._decoratedAppCmd = [];
        if (typeof desc.value !== 'function') {
            throw new Error('@groupslash decorator requires a function');
        } else client._decoratedAppCmd.push({
            group,
            parent,
            name: name ?? prop,
            guild,
            handler: desc.value
        });
    };
}
/**
 * Decorator to create a Message Context Menu Command handler.
 *
 * Example:
 * ```ts
 * class MyClient extends Client {
 *   // ...
 *
 *   @messageContextMenu("Content Length")
 *   contentLength(i: ApplicationCommandInteraction) {
 *     return i.reply({
 *       content: `Length: ${i.targetMessage!.content.length}`,
 *       ephemeral: true,
 *     });
 *   }
 * }
 * ```
 *
 * If you want to split these decorators into different
 * files, you can use these in classes extending
 * `ApplicationCommandsModule` and then use
 * `client.interactions.loadModule`.
 *
 * For handling user context menu commands, look into docs for
 * `userContextMenu` decorator.
 */ export function messageContextMenu(name) {
    return function(client, prop, desc) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        if (client._decoratedAppCmd === undefined) client._decoratedAppCmd = [];
        if (typeof desc.value !== 'function') {
            throw new Error('@messageContextMenu decorator requires a function');
        } else client._decoratedAppCmd.push({
            name: name ?? prop,
            type: ApplicationCommandType.MESSAGE,
            handler: desc.value
        });
    };
}
/**
 * Decorator to create a User Context Menu Command handler.
 *
 * Example:
 * ```ts
 * class MyClient extends Client {
 *   // ...
 *
 *   @userContextMenu("Command Name")
 *   commandName(i: ApplicationCommandInteraction) {
 *     // ...
 *   }
 * }
 * ```
 *
 * First argument that is `name` is optional and can be
 * inferred from method name.
 *
 * For handling more docs regarding how context menu command
 * decorators work, look into `messageContextMenu`'s docs.
 */ export function userContextMenu(name) {
    return function(client, prop, desc) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        if (client._decoratedAppCmd === undefined) client._decoratedAppCmd = [];
        if (typeof desc.value !== 'function') {
            throw new Error('@userContextMenu decorator requires a function');
        } else client._decoratedAppCmd.push({
            name: name ?? prop,
            type: ApplicationCommandType.USER,
            handler: desc.value
        });
    };
}
export function isInGuild(action) {
    return function(_client, _prop, desc) {
        const validation = {
            condition: (i)=>{
                return Boolean(i.guild);
            },
            action
        };
        desc.value = wrapConditionApplicationCommandHandler(desc, validation);
    };
}
export function isBotInVoiceChannel(action) {
    return function(_client, _prop, desc) {
        const validation = {
            condition: async (i)=>{
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (!i.client.intents?.includes(GatewayIntents.GUILD_VOICE_STATES)) {
                    const err = '@isBotInVoiceChannel: GatewayIntents.GUILD_VOICE_STATES needs to be set.';
                    console.error(err);
                    throw new Error(err);
                }
                return Boolean(await i.guild?.voiceStates.get(i.client.user.id));
            },
            action
        };
        desc.value = wrapConditionApplicationCommandHandler(desc, validation);
    };
}
export function isUserInVoiceChannel(action) {
    return function(_client, _prop, desc) {
        const validation = {
            condition: async (i)=>{
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (!i.client.intents?.includes(GatewayIntents.GUILD_VOICE_STATES)) {
                    const err = '@isUserInVoiceChannel: GatewayIntents.GUILD_VOICE_STATES needs to be set.';
                    console.error(err);
                    throw new Error(err);
                }
                return Boolean(await i.guild?.voiceStates.get(i.user.id));
            },
            action
        };
        desc.value = wrapConditionApplicationCommandHandler(desc, validation);
    };
}
export function customValidation(condition, action) {
    return function(_client, _prop, desc) {
        desc.value = wrapConditionApplicationCommandHandler(desc, {
            condition,
            action
        });
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2ludGVyYWN0aW9ucy9kZWNvcmF0b3JzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXIsXG4gIEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFjayxcbiAgQXV0b2NvbXBsZXRlSGFuZGxlcixcbiAgQXV0b2NvbXBsZXRlSGFuZGxlckNhbGxiYWNrLFxuICBJbnRlcmFjdGlvbnNDbGllbnRcbn0gZnJvbSAnLi9jbGllbnQudHMnXG5pbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgeyBBcHBsaWNhdGlvbkNvbW1hbmRzTW9kdWxlIH0gZnJvbSAnLi9jb21tYW5kTW9kdWxlLnRzJ1xuaW1wb3J0IHsgQXBwbGljYXRpb25Db21tYW5kSW50ZXJhY3Rpb24gfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2FwcGxpY2F0aW9uQ29tbWFuZC50cydcbmltcG9ydCB7IEdhdGV3YXlJbnRlbnRzIH0gZnJvbSAnLi4vdHlwZXMvZ2F0ZXdheS50cydcbmltcG9ydCB7IEFwcGxpY2F0aW9uQ29tbWFuZFR5cGUgfSBmcm9tICcuLi90eXBlcy9hcHBsaWNhdGlvbkNvbW1hbmQudHMnXG5cbi8qKiAgVHlwZSBleHRlbnNpb24gdGhhdCBhZGRzIHRoZSBgX2RlY29yYXRlZEFwcENtZGAgbGlzdC4gKi9cbmludGVyZmFjZSBEZWNvcmF0ZWRBcHBFeHQge1xuICBfZGVjb3JhdGVkQXBwQ21kPzogQXBwbGljYXRpb25Db21tYW5kSGFuZGxlcltdXG4gIF9kZWNvcmF0ZWRBdXRvY29tcGxldGU/OiBBdXRvY29tcGxldGVIYW5kbGVyW11cbn1cblxuLy8gTWF5YmUgYSBiZXR0ZXIgbmFtZSBmb3IgdGhpcyB3b3VsZCBiZSBgQXBwbGljYXRpb25Db21tYW5kQmFzZWAgb3IgYEFwcGxpY2F0aW9uQ29tbWFuZE9iamVjdGAgb3Igc29tZXRoaW5nIGVsc2VcbnR5cGUgQXBwbGljYXRpb25Db21tYW5kQ2xpZW50ID1cbiAgfCBDbGllbnRcbiAgfCBJbnRlcmFjdGlvbnNDbGllbnRcbiAgfCBBcHBsaWNhdGlvbkNvbW1hbmRzTW9kdWxlXG5cbi8vIFNlZSBhYm92ZVxudHlwZSBBcHBsaWNhdGlvbkNvbW1hbmRDbGllbnRFeHQgPSBBcHBsaWNhdGlvbkNvbW1hbmRDbGllbnQgJiBEZWNvcmF0ZWRBcHBFeHRcblxudHlwZSBDb21tYW5kVmFsaWRhdGlvbkNvbmRpdGlvbiA9IChcbiAgaTogQXBwbGljYXRpb25Db21tYW5kSW50ZXJhY3Rpb25cbikgPT4gYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj5cblxuaW50ZXJmYWNlIENvbW1hbmRWYWxpZGF0aW9uIHtcbiAgY29uZGl0aW9uOiBDb21tYW5kVmFsaWRhdGlvbkNvbmRpdGlvblxuICBhY3Rpb24/OiBzdHJpbmcgfCBBcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyQ2FsbGJhY2tcbn1cblxudHlwZSBBcHBsaWNhdGlvbkNvbW1hbmREZWNvcmF0b3IgPSAoXG4gIGNsaWVudDogQXBwbGljYXRpb25Db21tYW5kQ2xpZW50RXh0LFxuICBwcm9wOiBzdHJpbmcsXG4gIGRlc2M6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFjaz5cbikgPT4gdm9pZFxuXG50eXBlIEF1dG9jb21wbGV0ZURlY29yYXRvciA9IChcbiAgY2xpZW50OiBBcHBsaWNhdGlvbkNvbW1hbmRDbGllbnRFeHQsXG4gIHByb3A6IHN0cmluZyxcbiAgZGVzYzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8QXV0b2NvbXBsZXRlSGFuZGxlckNhbGxiYWNrPlxuKSA9PiB2b2lkXG5cbi8qKlxuICogV3JhcHMgdGhlIGNvbW1hbmQgaGFuZGxlciB3aXRoIGEgdmFsaWRhdGlvbiBmdW5jdGlvbi5cbiAqIEBwYXJhbSBkZXNjIHByb3BlcnR5IGRlc2NyaXB0b3JcbiAqIEBwYXJhbSB2YWxpZGF0aW9uIHZhbGlkYXRpb24gZnVuY3Rpb24gYW5kIGFjdGlvbiB0byBzaG93IG9yIGNhbGwgaWYgdmFsaWRhdGlvbiBmYWlsc1xuICogQHJldHVybnMgd3JhcHBlZCBmdW5jdGlvblxuICovXG5mdW5jdGlvbiB3cmFwQ29uZGl0aW9uQXBwbGljYXRpb25Db21tYW5kSGFuZGxlcihcbiAgZGVzYzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8QXBwbGljYXRpb25Db21tYW5kSGFuZGxlckNhbGxiYWNrPixcbiAgdmFsaWRhdGlvbjogQ29tbWFuZFZhbGlkYXRpb25cbik6IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFjayB7XG4gIGlmICh0eXBlb2YgZGVzYy52YWx1ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhlIGRlY29yYXRvciByZXF1aXJlcyBhIGZ1bmN0aW9uJylcbiAgfVxuICBjb25zdCB7IGNvbmRpdGlvbiwgYWN0aW9uIH0gPSB2YWxpZGF0aW9uXG5cbiAgY29uc3Qgb3JpZ2luYWwgPSBkZXNjLnZhbHVlXG4gIHJldHVybiBhc3luYyBmdW5jdGlvbiAoXG4gICAgdGhpczogQXBwbGljYXRpb25Db21tYW5kQ2xpZW50LFxuICAgIGk6IEFwcGxpY2F0aW9uQ29tbWFuZEludGVyYWN0aW9uXG4gICkge1xuICAgIGlmICghKGF3YWl0IGNvbmRpdGlvbihpKSkpIHtcbiAgICAgIC8vIGNvbmRpdGlvbiBub3QgbWV0XG4gICAgICBpZiAodHlwZW9mIGFjdGlvbiA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaS5yZXBseShhY3Rpb24pXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhY3Rpb24gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgYWN0aW9uKGkpXG4gICAgICB9XG4gICAgICByZXR1cm5cbiAgICB9IC8vIGNvbmRpdGlvbiBtZXRcbiAgICByZXR1cm4gb3JpZ2luYWwuY2FsbCh0aGlzLCBpKVxuICB9XG59XG5cbi8qKlxuICogRGVjb3JhdG9yIHRvIGFkZCBhIGF1dG9jb21wbGV0ZSBpbnRlcmFjdGlvbiBoYW5kbGVyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBgYGB0c1xuICogY2xhc3MgTXlDbGllbnQgZXh0ZW5kcyBDbGllbnQge1xuICogICAvLyAuLi5cbiAqXG4gKiAgIEBhdXRvY29tcGxldGUoXCJzZWFyY2hcIiwgXCJxdWVyeVwiKVxuICogICBzZWFyY2hDb21wbGV0aW9ucyhpOiBBdXRvY29tcGxldGVJbnRlcmFjdGlvbikge1xuICogICAgIC8vIC4uLlxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBAcGFyYW0gY29tbWFuZCBDb21tYW5kIG5hbWUgb2Ygd2hpY2ggb3B0aW9ucycgdG8gcHJvdmlkZSBhdXRvY29tcGxldGlvbnMgZm9yLiBDYW4gYmUgYCpgIChhbGwpLlxuICogQHBhcmFtIG9wdGlvbiBPcHRpb24gbmFtZSB0byBoYW5kbGUgYXV0b2NvbXBsZXRpb25zIGZvci4gQ2FuIGJlIGAqYCAoYWxsKS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGF1dG9jb21wbGV0ZShcbiAgY29tbWFuZDogc3RyaW5nLFxuICBvcHRpb246IHN0cmluZ1xuKTogQXV0b2NvbXBsZXRlRGVjb3JhdG9yIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICBjbGllbnQ6IEFwcGxpY2F0aW9uQ29tbWFuZENsaWVudEV4dCxcbiAgICBfcHJvcDogc3RyaW5nLFxuICAgIGRlc2M6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEF1dG9jb21wbGV0ZUhhbmRsZXJDYWxsYmFjaz5cbiAgKSB7XG4gICAgaWYgKGNsaWVudC5fZGVjb3JhdGVkQXV0b2NvbXBsZXRlID09PSB1bmRlZmluZWQpXG4gICAgICBjbGllbnQuX2RlY29yYXRlZEF1dG9jb21wbGV0ZSA9IFtdXG4gICAgaWYgKHR5cGVvZiBkZXNjLnZhbHVlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0BhdXRvY29tcGxldGUgZGVjb3JhdG9yIHJlcXVpcmVzIGEgZnVuY3Rpb24nKVxuICAgIH0gZWxzZVxuICAgICAgY2xpZW50Ll9kZWNvcmF0ZWRBdXRvY29tcGxldGUucHVzaCh7XG4gICAgICAgIGNtZDogY29tbWFuZCxcbiAgICAgICAgb3B0aW9uLFxuICAgICAgICBoYW5kbGVyOiBkZXNjLnZhbHVlXG4gICAgICB9KVxuICB9XG59XG5cbi8qKlxuICogRGVjb3JhdG9yIHRvIGNyZWF0ZSBhIFNsYXNoIENvbW1hbmQgaGFuZGxlci5cbiAqXG4gKiBFeGFtcGxlOlxuICogYGBgdHNcbiAqIGNsYXNzIE15Q2xpZW50IGV4dGVuZHMgQ2xpZW50IHtcbiAqICAgLy8gLi4uXG4gKlxuICogICBAc2xhc2goXCJteS1jb21tYW5kXCIpXG4gKiAgIG15Q29tbWFuZChpOiBBcHBsaWNhdGlvbkNvbW1hbmRJbnRlcmFjdGlvbikge1xuICogICAgIHJldHVybiBpLnJlcGx5KFwiSGVsbG8sIFdvcmxkIVwiKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogTm90ZSB0aGF0IHRoZSBuYW1lIHBhcmFtZXRlciBpcyBvcHRpb25hbCBpbiB0aGlzIGRlY29yYXRvcixcbiAqIGl0IGNhbiBhbHNvIGJlIGluZmVycmVkIGZyb20gdGhlIG1ldGhvZCBuYW1lIHlvdSBkZWZpbmUgYW5kXG4gKiB1c2UgZGVjb3JhdG9yIG9uLlxuICpcbiAqIElmIHlvdSB3YW50IHRvIHNwbGl0IHRoZXNlIGRlY29yYXRvcnMgaW50byBkaWZmZXJlbnRcbiAqIGZpbGVzLCB5b3UgY2FuIHVzZSB0aGVzZSBpbiBjbGFzc2VzIGV4dGVuZGluZ1xuICogYEFwcGxpY2F0aW9uQ29tbWFuZHNNb2R1bGVgIGFuZCB0aGVuIHVzZVxuICogYGNsaWVudC5pbnRlcmFjdGlvbnMubG9hZE1vZHVsZWAuXG4gKlxuICogRm9yIGhhbmRsaW5nIHN1Yi1jb21tYW5kcyBvciBncm91cGVkIHN1Yi1jb21tYW5kcywgbG9va1xuICogaW50byBkb2NzIGZvciBgc3Vic2xhc2hgIGFuZCBgZ3JvdXBzbGFzaGAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbGFzaChcbiAgbmFtZT86IHN0cmluZyxcbiAgZ3VpbGQ/OiBzdHJpbmdcbik6IEFwcGxpY2F0aW9uQ29tbWFuZERlY29yYXRvciB7XG4gIHJldHVybiBmdW5jdGlvbiAoXG4gICAgY2xpZW50OiBBcHBsaWNhdGlvbkNvbW1hbmRDbGllbnRFeHQsXG4gICAgcHJvcDogc3RyaW5nLFxuICAgIGRlc2M6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFjaz5cbiAgKSB7XG4gICAgaWYgKGNsaWVudC5fZGVjb3JhdGVkQXBwQ21kID09PSB1bmRlZmluZWQpIGNsaWVudC5fZGVjb3JhdGVkQXBwQ21kID0gW11cbiAgICBpZiAodHlwZW9mIGRlc2MudmFsdWUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQHNsYXNoIGRlY29yYXRvciByZXF1aXJlcyBhIGZ1bmN0aW9uJylcbiAgICB9IGVsc2VcbiAgICAgIGNsaWVudC5fZGVjb3JhdGVkQXBwQ21kLnB1c2goe1xuICAgICAgICBuYW1lOiBuYW1lID8/IHByb3AsXG4gICAgICAgIGd1aWxkLFxuICAgICAgICBoYW5kbGVyOiBkZXNjLnZhbHVlXG4gICAgICB9KVxuICB9XG59XG5cbi8qKlxuICogRGVjb3JhdG9yIHRvIGNyZWF0ZSBhIFN1Yi1Db21tYW5kIENvbW1hbmQgaGFuZGxlciBmb3IgYVxuICogU2xhc2ggQ29tbWFuZC5cbiAqXG4gKiBFeGFtcGxlOlxuICogYGBgdHNcbiAqIGNsYXNzIE15Q2xpZW50IGV4dGVuZHMgQ2xpZW50IHtcbiAqICAgLy8gLi4uXG4gKlxuICogICBAc3Vic2xhc2goXCJjb25maWdcIiwgXCJyZXNldFwiKVxuICogICBjb25maWdSZXNldChpOiBBcHBsaWNhdGlvbkNvbW1hbmRJbnRlcmFjdGlvbikge1xuICogICAgIC8vIC4uLlxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBOb3RlIHRoYXQgb25seSBmaXJzdCBhcmd1bWVudCB0aGF0IGlzIGBwYXJlbnRgIGlzIHJlcXVpcmVkLFxuICogc2Vjb25kIGNhbiBiZSBpbmZlcnJlZCBmcm9tIHRoZSBtZXRob2QgbmFtZSB5b3UgZGVmaW5lXG4gKiBhbmQgdXNlIGRlY29yYXRvciBvbi5cbiAqXG4gKiBGb3IgbW9yZSBpbmZvIG9uIFNsYXNoIENvbW1hbmQgaGFuZGxlciBkZWNvcmF0b3JzLCBsb29rXG4gKiBpbnRvIGRvY3MgZm9yIGBzbGFzaGAgZGVjb3JhdG9yLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3Vic2xhc2goXG4gIHBhcmVudDogc3RyaW5nLFxuICBuYW1lPzogc3RyaW5nLFxuICBndWlsZD86IHN0cmluZ1xuKTogQXBwbGljYXRpb25Db21tYW5kRGVjb3JhdG9yIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICBjbGllbnQ6IEFwcGxpY2F0aW9uQ29tbWFuZENsaWVudEV4dCxcbiAgICBwcm9wOiBzdHJpbmcsXG4gICAgZGVzYzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8QXBwbGljYXRpb25Db21tYW5kSGFuZGxlckNhbGxiYWNrPlxuICApIHtcbiAgICBpZiAoY2xpZW50Ll9kZWNvcmF0ZWRBcHBDbWQgPT09IHVuZGVmaW5lZCkgY2xpZW50Ll9kZWNvcmF0ZWRBcHBDbWQgPSBbXVxuICAgIGlmICh0eXBlb2YgZGVzYy52YWx1ZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdAc3Vic2xhc2ggZGVjb3JhdG9yIHJlcXVpcmVzIGEgZnVuY3Rpb24nKVxuICAgIH0gZWxzZVxuICAgICAgY2xpZW50Ll9kZWNvcmF0ZWRBcHBDbWQucHVzaCh7XG4gICAgICAgIHBhcmVudCxcbiAgICAgICAgbmFtZTogbmFtZSA/PyBwcm9wLFxuICAgICAgICBndWlsZCxcbiAgICAgICAgaGFuZGxlcjogZGVzYy52YWx1ZVxuICAgICAgfSlcbiAgfVxufVxuXG4vKipcbiAqIERlY29yYXRvciB0byBjcmVhdGUgYSBHcm91cGVkIFN1Yi1Db21tYW5kIENvbW1hbmQgaGFuZGxlclxuICogZm9yIGEgU2xhc2ggQ29tbWFuZC5cbiAqXG4gKiBFeGFtcGxlOlxuICogYGBgdHNcbiAqIGNsYXNzIE15Q2xpZW50IGV4dGVuZHMgQ2xpZW50IHtcbiAqICAgLy8gLi4uXG4gKlxuICogICBAZ3JvdXBzbGFzaChcImNvbmZpZ1wiLCBcIm9wdGlvbnNcIiwgXCJzZXRcIilcbiAqICAgY29uZmlnT3B0aW9uc1NldChpOiBBcHBsaWNhdGlvbkNvbW1hbmRJbnRlcmFjdGlvbikge1xuICogICAgIC8vIC4uLlxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBOb3RlIHRoYXQgb25seSBmaXJzdCB0d28gYXJndW1lbnRzIGkuZS4gYGdyb3VwYCAmIGBwYXJlbnRgIGFyZVxuICogcmVxdWlyZWQsIG5hbWUgY2FuIGJlIGluZmVycmVkIGZyb20gdGhlIG1ldGhvZCBuYW1lIHlvdSBkZWZpbmVcbiAqIGFuZCB1c2UgZGVjb3JhdG9yIG9uLlxuICpcbiAqIEZvciBtb3JlIGluZm8gb24gU2xhc2ggQ29tbWFuZCBoYW5kbGVyIGRlY29yYXRvcnMsIGxvb2tcbiAqIGludG8gZG9jcyBmb3IgYHNsYXNoYCBkZWNvcmF0b3IuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBncm91cHNsYXNoKFxuICBwYXJlbnQ6IHN0cmluZyxcbiAgZ3JvdXA6IHN0cmluZyxcbiAgbmFtZT86IHN0cmluZyxcbiAgZ3VpbGQ/OiBzdHJpbmdcbik6IEFwcGxpY2F0aW9uQ29tbWFuZERlY29yYXRvciB7XG4gIHJldHVybiBmdW5jdGlvbiAoXG4gICAgY2xpZW50OiBBcHBsaWNhdGlvbkNvbW1hbmRDbGllbnRFeHQsXG4gICAgcHJvcDogc3RyaW5nLFxuICAgIGRlc2M6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFjaz5cbiAgKSB7XG4gICAgaWYgKGNsaWVudC5fZGVjb3JhdGVkQXBwQ21kID09PSB1bmRlZmluZWQpIGNsaWVudC5fZGVjb3JhdGVkQXBwQ21kID0gW11cbiAgICBpZiAodHlwZW9mIGRlc2MudmFsdWUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQGdyb3Vwc2xhc2ggZGVjb3JhdG9yIHJlcXVpcmVzIGEgZnVuY3Rpb24nKVxuICAgIH0gZWxzZVxuICAgICAgY2xpZW50Ll9kZWNvcmF0ZWRBcHBDbWQucHVzaCh7XG4gICAgICAgIGdyb3VwLFxuICAgICAgICBwYXJlbnQsXG4gICAgICAgIG5hbWU6IG5hbWUgPz8gcHJvcCxcbiAgICAgICAgZ3VpbGQsXG4gICAgICAgIGhhbmRsZXI6IGRlc2MudmFsdWVcbiAgICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBEZWNvcmF0b3IgdG8gY3JlYXRlIGEgTWVzc2FnZSBDb250ZXh0IE1lbnUgQ29tbWFuZCBoYW5kbGVyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBgYGB0c1xuICogY2xhc3MgTXlDbGllbnQgZXh0ZW5kcyBDbGllbnQge1xuICogICAvLyAuLi5cbiAqXG4gKiAgIEBtZXNzYWdlQ29udGV4dE1lbnUoXCJDb250ZW50IExlbmd0aFwiKVxuICogICBjb250ZW50TGVuZ3RoKGk6IEFwcGxpY2F0aW9uQ29tbWFuZEludGVyYWN0aW9uKSB7XG4gKiAgICAgcmV0dXJuIGkucmVwbHkoe1xuICogICAgICAgY29udGVudDogYExlbmd0aDogJHtpLnRhcmdldE1lc3NhZ2UhLmNvbnRlbnQubGVuZ3RofWAsXG4gKiAgICAgICBlcGhlbWVyYWw6IHRydWUsXG4gKiAgICAgfSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIElmIHlvdSB3YW50IHRvIHNwbGl0IHRoZXNlIGRlY29yYXRvcnMgaW50byBkaWZmZXJlbnRcbiAqIGZpbGVzLCB5b3UgY2FuIHVzZSB0aGVzZSBpbiBjbGFzc2VzIGV4dGVuZGluZ1xuICogYEFwcGxpY2F0aW9uQ29tbWFuZHNNb2R1bGVgIGFuZCB0aGVuIHVzZVxuICogYGNsaWVudC5pbnRlcmFjdGlvbnMubG9hZE1vZHVsZWAuXG4gKlxuICogRm9yIGhhbmRsaW5nIHVzZXIgY29udGV4dCBtZW51IGNvbW1hbmRzLCBsb29rIGludG8gZG9jcyBmb3JcbiAqIGB1c2VyQ29udGV4dE1lbnVgIGRlY29yYXRvci5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1lc3NhZ2VDb250ZXh0TWVudShuYW1lPzogc3RyaW5nKTogQXBwbGljYXRpb25Db21tYW5kRGVjb3JhdG9yIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICBjbGllbnQ6IEFwcGxpY2F0aW9uQ29tbWFuZENsaWVudEV4dCxcbiAgICBwcm9wOiBzdHJpbmcsXG4gICAgZGVzYzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8QXBwbGljYXRpb25Db21tYW5kSGFuZGxlckNhbGxiYWNrPlxuICApIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgaWYgKGNsaWVudC5fZGVjb3JhdGVkQXBwQ21kID09PSB1bmRlZmluZWQpIGNsaWVudC5fZGVjb3JhdGVkQXBwQ21kID0gW11cbiAgICBpZiAodHlwZW9mIGRlc2MudmFsdWUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQG1lc3NhZ2VDb250ZXh0TWVudSBkZWNvcmF0b3IgcmVxdWlyZXMgYSBmdW5jdGlvbicpXG4gICAgfSBlbHNlXG4gICAgICBjbGllbnQuX2RlY29yYXRlZEFwcENtZC5wdXNoKHtcbiAgICAgICAgbmFtZTogbmFtZSA/PyBwcm9wLFxuICAgICAgICB0eXBlOiBBcHBsaWNhdGlvbkNvbW1hbmRUeXBlLk1FU1NBR0UsXG4gICAgICAgIGhhbmRsZXI6IGRlc2MudmFsdWVcbiAgICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBEZWNvcmF0b3IgdG8gY3JlYXRlIGEgVXNlciBDb250ZXh0IE1lbnUgQ29tbWFuZCBoYW5kbGVyLlxuICpcbiAqIEV4YW1wbGU6XG4gKiBgYGB0c1xuICogY2xhc3MgTXlDbGllbnQgZXh0ZW5kcyBDbGllbnQge1xuICogICAvLyAuLi5cbiAqXG4gKiAgIEB1c2VyQ29udGV4dE1lbnUoXCJDb21tYW5kIE5hbWVcIilcbiAqICAgY29tbWFuZE5hbWUoaTogQXBwbGljYXRpb25Db21tYW5kSW50ZXJhY3Rpb24pIHtcbiAqICAgICAvLyAuLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogRmlyc3QgYXJndW1lbnQgdGhhdCBpcyBgbmFtZWAgaXMgb3B0aW9uYWwgYW5kIGNhbiBiZVxuICogaW5mZXJyZWQgZnJvbSBtZXRob2QgbmFtZS5cbiAqXG4gKiBGb3IgaGFuZGxpbmcgbW9yZSBkb2NzIHJlZ2FyZGluZyBob3cgY29udGV4dCBtZW51IGNvbW1hbmRcbiAqIGRlY29yYXRvcnMgd29yaywgbG9vayBpbnRvIGBtZXNzYWdlQ29udGV4dE1lbnVgJ3MgZG9jcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZXJDb250ZXh0TWVudShuYW1lPzogc3RyaW5nKTogQXBwbGljYXRpb25Db21tYW5kRGVjb3JhdG9yIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICBjbGllbnQ6IEFwcGxpY2F0aW9uQ29tbWFuZENsaWVudEV4dCxcbiAgICBwcm9wOiBzdHJpbmcsXG4gICAgZGVzYzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8QXBwbGljYXRpb25Db21tYW5kSGFuZGxlckNhbGxiYWNrPlxuICApIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgaWYgKGNsaWVudC5fZGVjb3JhdGVkQXBwQ21kID09PSB1bmRlZmluZWQpIGNsaWVudC5fZGVjb3JhdGVkQXBwQ21kID0gW11cbiAgICBpZiAodHlwZW9mIGRlc2MudmFsdWUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQHVzZXJDb250ZXh0TWVudSBkZWNvcmF0b3IgcmVxdWlyZXMgYSBmdW5jdGlvbicpXG4gICAgfSBlbHNlXG4gICAgICBjbGllbnQuX2RlY29yYXRlZEFwcENtZC5wdXNoKHtcbiAgICAgICAgbmFtZTogbmFtZSA/PyBwcm9wLFxuICAgICAgICB0eXBlOiBBcHBsaWNhdGlvbkNvbW1hbmRUeXBlLlVTRVIsXG4gICAgICAgIGhhbmRsZXI6IGRlc2MudmFsdWVcbiAgICAgIH0pXG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgY29tbWFuZCBjYW4gb25seSBiZSBjYWxsZWQgZnJvbSBhIGd1aWxkLlxuICogQHBhcmFtIGFjdGlvbiBtZXNzYWdlIG9yIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBjb25kaXRpb24gaXMgbm90IG1ldFxuICogQHJldHVybnMgd3JhcHBlZCBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNJbkd1aWxkKG1lc3NhZ2U6IHN0cmluZyk6IEFwcGxpY2F0aW9uQ29tbWFuZERlY29yYXRvclxuZXhwb3J0IGZ1bmN0aW9uIGlzSW5HdWlsZChcbiAgY2FsbGJhY2s6IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFja1xuKTogQXBwbGljYXRpb25Db21tYW5kRGVjb3JhdG9yXG5leHBvcnQgZnVuY3Rpb24gaXNJbkd1aWxkKFxuICBhY3Rpb246IHN0cmluZyB8IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFja1xuKTogQXBwbGljYXRpb25Db21tYW5kRGVjb3JhdG9yIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICBfY2xpZW50OiBBcHBsaWNhdGlvbkNvbW1hbmRDbGllbnQsXG4gICAgX3Byb3A6IHN0cmluZyxcbiAgICBkZXNjOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxBcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyQ2FsbGJhY2s+XG4gICkge1xuICAgIGNvbnN0IHZhbGlkYXRpb246IENvbW1hbmRWYWxpZGF0aW9uID0ge1xuICAgICAgY29uZGl0aW9uOiAoaTogQXBwbGljYXRpb25Db21tYW5kSW50ZXJhY3Rpb24pID0+IHtcbiAgICAgICAgcmV0dXJuIEJvb2xlYW4oaS5ndWlsZClcbiAgICAgIH0sXG4gICAgICBhY3Rpb25cbiAgICB9XG4gICAgZGVzYy52YWx1ZSA9IHdyYXBDb25kaXRpb25BcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyKGRlc2MsIHZhbGlkYXRpb24pXG4gIH1cbn1cblxuLyoqXG4gKiBUaGUgY29tbWFuZCBjYW4gb25seSBiZSBjYWxsZWQgaWYgdGhlIGJvdCBpcyBjdXJyZW50bHkgaW4gYSB2b2ljZSBjaGFubmVsLlxuICogYEdhdGV3YXlJbnRlbnRzLkdVSUxEX1ZPSUNFX1NUQVRFU2AgbmVlZHMgdG8gYmUgc2V0LlxuICogQHBhcmFtIGFjdGlvbiBtZXNzYWdlIG9yIGZ1bmN0aW9uIGNhbGxlZCB3aGVuIHRoZSBjb25kaXRpb24gaXMgbm90IG1ldFxuICogQHJldHVybnMgd3JhcHBlZCBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNCb3RJblZvaWNlQ2hhbm5lbChcbiAgbWVzc2FnZTogc3RyaW5nXG4pOiBBcHBsaWNhdGlvbkNvbW1hbmREZWNvcmF0b3JcbmV4cG9ydCBmdW5jdGlvbiBpc0JvdEluVm9pY2VDaGFubmVsKFxuICBjYWxsYmFjazogQXBwbGljYXRpb25Db21tYW5kSGFuZGxlckNhbGxiYWNrXG4pOiBBcHBsaWNhdGlvbkNvbW1hbmREZWNvcmF0b3JcbmV4cG9ydCBmdW5jdGlvbiBpc0JvdEluVm9pY2VDaGFubmVsKFxuICBhY3Rpb246IHN0cmluZyB8IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFja1xuKTogQXBwbGljYXRpb25Db21tYW5kRGVjb3JhdG9yIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICBfY2xpZW50OiBBcHBsaWNhdGlvbkNvbW1hbmRDbGllbnQsXG4gICAgX3Byb3A6IHN0cmluZyxcbiAgICBkZXNjOiBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxBcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyQ2FsbGJhY2s+XG4gICkge1xuICAgIGNvbnN0IHZhbGlkYXRpb246IENvbW1hbmRWYWxpZGF0aW9uID0ge1xuICAgICAgY29uZGl0aW9uOiBhc3luYyAoaTogQXBwbGljYXRpb25Db21tYW5kSW50ZXJhY3Rpb24pID0+IHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9zdHJpY3QtYm9vbGVhbi1leHByZXNzaW9uc1xuICAgICAgICBpZiAoIWkuY2xpZW50LmludGVudHM/LmluY2x1ZGVzKEdhdGV3YXlJbnRlbnRzLkdVSUxEX1ZPSUNFX1NUQVRFUykpIHtcbiAgICAgICAgICBjb25zdCBlcnIgPVxuICAgICAgICAgICAgJ0Bpc0JvdEluVm9pY2VDaGFubmVsOiBHYXRld2F5SW50ZW50cy5HVUlMRF9WT0lDRV9TVEFURVMgbmVlZHMgdG8gYmUgc2V0LidcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBCb29sZWFuKGF3YWl0IGkuZ3VpbGQ/LnZvaWNlU3RhdGVzLmdldChpLmNsaWVudC51c2VyIS5pZCkpXG4gICAgICB9LFxuICAgICAgYWN0aW9uXG4gICAgfVxuICAgIGRlc2MudmFsdWUgPSB3cmFwQ29uZGl0aW9uQXBwbGljYXRpb25Db21tYW5kSGFuZGxlcihkZXNjLCB2YWxpZGF0aW9uKVxuICB9XG59XG5cbi8qKlxuICogVGhlIGNvbW1hbmQgY2FuIG9ubHkgYmUgY2FsbGVkIGlmIHRoZSB1c2VyIGlzIGN1cnJlbnRseSBpbiBhIHZvaWNlIGNoYW5uZWwuXG4gKiBgR2F0ZXdheUludGVudHMuR1VJTERfVk9JQ0VfU1RBVEVTYCBuZWVkcyB0byBiZSBzZXQuXG4gKiBAcGFyYW0gYWN0aW9uIG1lc3NhZ2Ugb3IgZnVuY3Rpb24gY2FsbGVkIHdoZW4gdGhlIGNvbmRpdGlvbiBpcyBub3QgbWV0XG4gKiBAcmV0dXJucyB3cmFwcGVkIGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpc1VzZXJJblZvaWNlQ2hhbm5lbChcbiAgbWVzc2FnZTogc3RyaW5nXG4pOiBBcHBsaWNhdGlvbkNvbW1hbmREZWNvcmF0b3JcbmV4cG9ydCBmdW5jdGlvbiBpc1VzZXJJblZvaWNlQ2hhbm5lbChcbiAgY2FsbGJhY2s6IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFja1xuKTogQXBwbGljYXRpb25Db21tYW5kRGVjb3JhdG9yXG5leHBvcnQgZnVuY3Rpb24gaXNVc2VySW5Wb2ljZUNoYW5uZWwoXG4gIGFjdGlvbjogc3RyaW5nIHwgQXBwbGljYXRpb25Db21tYW5kSGFuZGxlckNhbGxiYWNrXG4pOiBBcHBsaWNhdGlvbkNvbW1hbmREZWNvcmF0b3Ige1xuICByZXR1cm4gZnVuY3Rpb24gKFxuICAgIF9jbGllbnQ6IEFwcGxpY2F0aW9uQ29tbWFuZENsaWVudCxcbiAgICBfcHJvcDogc3RyaW5nLFxuICAgIGRlc2M6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFjaz5cbiAgKSB7XG4gICAgY29uc3QgdmFsaWRhdGlvbjogQ29tbWFuZFZhbGlkYXRpb24gPSB7XG4gICAgICBjb25kaXRpb246IGFzeW5jIChpOiBBcHBsaWNhdGlvbkNvbW1hbmRJbnRlcmFjdGlvbik6IFByb21pc2U8Ym9vbGVhbj4gPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3N0cmljdC1ib29sZWFuLWV4cHJlc3Npb25zXG4gICAgICAgIGlmICghaS5jbGllbnQuaW50ZW50cz8uaW5jbHVkZXMoR2F0ZXdheUludGVudHMuR1VJTERfVk9JQ0VfU1RBVEVTKSkge1xuICAgICAgICAgIGNvbnN0IGVyciA9XG4gICAgICAgICAgICAnQGlzVXNlckluVm9pY2VDaGFubmVsOiBHYXRld2F5SW50ZW50cy5HVUlMRF9WT0lDRV9TVEFURVMgbmVlZHMgdG8gYmUgc2V0LidcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVycilcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoZXJyKVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBCb29sZWFuKGF3YWl0IGkuZ3VpbGQ/LnZvaWNlU3RhdGVzLmdldChpLnVzZXIuaWQpKVxuICAgICAgfSxcbiAgICAgIGFjdGlvblxuICAgIH1cbiAgICBkZXNjLnZhbHVlID0gd3JhcENvbmRpdGlvbkFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXIoZGVzYywgdmFsaWRhdGlvbilcbiAgfVxufVxuXG4vKipcbiAqIEN1c29taXphYmxlIGNvbW1hbmQgdmFsaWRhdGlvbi5cbiAqIEBwYXJhbSBjb25kaXRpb24gY29uZGl0aW9uIHRoYXQgbmVlZCB0byBzdWNjZWRlIGZvciB0aGUgY29tbWFuZCB0byBiZSBjYWxsZWRcbiAqIEBwYXJhbSBhY3Rpb24gbWVzc2FnZSBvciBmdW5jdGlvbiBjYWxsZWQgd2hlbiB0aGUgY29uZGl0aW9uIGlzIG5vdCBtZXRcbiAqIEByZXR1cm5zIHdyYXBwZWQgZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGN1c3RvbVZhbGlkYXRpb24oXG4gIGNvbmRpdGlvbjogQ29tbWFuZFZhbGlkYXRpb25Db25kaXRpb24sXG4gIG1lc3NhZ2U6IHN0cmluZ1xuKTogQXBwbGljYXRpb25Db21tYW5kRGVjb3JhdG9yXG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tVmFsaWRhdGlvbihcbiAgY29uZGl0aW9uOiBDb21tYW5kVmFsaWRhdGlvbkNvbmRpdGlvbixcbiAgY2FsbGJhY2s6IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFja1xuKTogQXBwbGljYXRpb25Db21tYW5kRGVjb3JhdG9yXG5leHBvcnQgZnVuY3Rpb24gY3VzdG9tVmFsaWRhdGlvbihcbiAgY29uZGl0aW9uOiBDb21tYW5kVmFsaWRhdGlvbkNvbmRpdGlvbixcbiAgYWN0aW9uOiBzdHJpbmcgfCBBcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyQ2FsbGJhY2tcbik6IEFwcGxpY2F0aW9uQ29tbWFuZERlY29yYXRvciB7XG4gIHJldHVybiBmdW5jdGlvbiAoXG4gICAgX2NsaWVudDogQXBwbGljYXRpb25Db21tYW5kQ2xpZW50LFxuICAgIF9wcm9wOiBzdHJpbmcsXG4gICAgZGVzYzogVHlwZWRQcm9wZXJ0eURlc2NyaXB0b3I8QXBwbGljYXRpb25Db21tYW5kSGFuZGxlckNhbGxiYWNrPlxuICApIHtcbiAgICBkZXNjLnZhbHVlID0gd3JhcENvbmRpdGlvbkFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXIoZGVzYywge1xuICAgICAgY29uZGl0aW9uLFxuICAgICAgYWN0aW9uXG4gICAgfSlcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVVBLFNBQVMsY0FBYyxRQUFRLHNCQUFxQjtBQUNwRCxTQUFTLHNCQUFzQixRQUFRLGlDQUFnQztBQXNDdkU7Ozs7O0NBS0MsR0FDRCxTQUFTLHVDQUNQLElBQWdFLEVBQ2hFLFVBQTZCLEVBQ007SUFDbkMsSUFBSSxPQUFPLEtBQUssS0FBSyxLQUFLLFlBQVk7UUFDcEMsTUFBTSxJQUFJLE1BQU0scUNBQW9DO0lBQ3RELENBQUM7SUFDRCxNQUFNLEVBQUUsVUFBUyxFQUFFLE9BQU0sRUFBRSxHQUFHO0lBRTlCLE1BQU0sV0FBVyxLQUFLLEtBQUs7SUFDM0IsT0FBTyxlQUVMLENBQWdDLEVBQ2hDO1FBQ0EsSUFBSSxDQUFFLE1BQU0sVUFBVSxJQUFLO1lBQ3pCLG9CQUFvQjtZQUNwQixJQUFJLE9BQU8sV0FBVyxVQUFVO2dCQUM5QixFQUFFLEtBQUssQ0FBQztZQUNWLE9BQU8sSUFBSSxPQUFPLFdBQVcsWUFBWTtnQkFDdkMsT0FBTztZQUNULENBQUM7WUFDRDtRQUNGLENBQUMsQ0FBQyxnQkFBZ0I7UUFDbEIsT0FBTyxTQUFTLElBQUksQ0FBQyxJQUFJLEVBQUU7SUFDN0I7QUFDRjtBQUVBOzs7Ozs7Ozs7Ozs7Ozs7OztDQWlCQyxHQUNELE9BQU8sU0FBUyxhQUNkLE9BQWUs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