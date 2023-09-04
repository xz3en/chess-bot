import { Client } from '../client/mod.ts';
import { CategoriesManager, Command, CommandsManager, parseCommand } from './command.ts';
import { parseArgs } from '../utils/command.ts';
import { Extension, ExtensionsManager } from './extension.ts';
export var CommandCooldownType;
(function(CommandCooldownType) {
    CommandCooldownType[CommandCooldownType[/** Cooldown for command for user */ "USER_COMMAND"] = 0] = "USER_COMMAND";
    CommandCooldownType[CommandCooldownType[/** Cooldown for any command for bot */ "USER_GLOBAL"] = 1] = "USER_GLOBAL";
    CommandCooldownType[CommandCooldownType[/** Cooldown for command for bot */ "BOT_COMMAND"] = 2] = "BOT_COMMAND";
    CommandCooldownType[CommandCooldownType[/** Cooldown for any command for bot */ "BOT_GLOBAL"] = 3] = "BOT_GLOBAL";
})(CommandCooldownType || (CommandCooldownType = {}));
/**
 * Harmony Client with extended functionality for Message based Commands parsing and handling.
 *
 * See InteractionsClient (`Client#slash`) for more info about Slash Commands.
 */ export class CommandClient extends Client {
    prefix;
    mentionPrefix;
    getGuildPrefix;
    getUserPrefix;
    getChannelPrefix;
    isGuildBlacklisted;
    isUserBlacklisted;
    isChannelBlacklisted;
    spacesAfterPrefix;
    owners;
    allowBots;
    allowDMs;
    caseSensitive;
    extensions = new ExtensionsManager(this);
    commands = new CommandsManager(this);
    categories = new CategoriesManager(this);
    middlewares = new Array();
    globalCommandCooldown = 0;
    globalCooldown = 0;
    lastUsed = new Map();
    constructor(options){
        super(options);
        this.prefix = options.prefix;
        this.mentionPrefix = options.mentionPrefix === undefined ? false : options.mentionPrefix;
        this.getGuildPrefix = options.getGuildPrefix === undefined ? (id)=>this.prefix : options.getGuildPrefix;
        this.getUserPrefix = options.getUserPrefix === undefined ? (id)=>this.prefix : options.getUserPrefix;
        this.getChannelPrefix = options.getChannelPrefix === undefined ? (id)=>this.prefix : options.getChannelPrefix;
        this.isUserBlacklisted = options.isUserBlacklisted === undefined ? (id)=>false : options.isUserBlacklisted;
        this.isGuildBlacklisted = options.isGuildBlacklisted === undefined ? (id)=>false : options.isGuildBlacklisted;
        this.isChannelBlacklisted = options.isChannelBlacklisted === undefined ? (id)=>false : options.isChannelBlacklisted;
        this.spacesAfterPrefix = options.spacesAfterPrefix === undefined ? false : options.spacesAfterPrefix;
        this.owners = options.owners === undefined ? [] : options.owners;
        this.allowBots = options.allowBots === undefined ? false : options.allowBots;
        this.allowDMs = options.allowDMs === undefined ? true : options.allowDMs;
        this.caseSensitive = options.caseSensitive === undefined ? false : options.caseSensitive;
        this.globalCommandCooldown = options.globalCommandCooldown ?? 0;
        this.globalCooldown = options.globalCooldown ?? 0;
        const self = this;
        if (self._decoratedCommands !== undefined) {
            Object.values(self._decoratedCommands).forEach((entry)=>{
                this.commands.add(entry);
            });
            self._decoratedCommands = undefined;
        }
        this.on('messageCreate', async (msg)=>await this.processMessage(msg));
    }
    /**
   * Adds a Middleware Function to Command Client to pre-process all Commands,
   * and can even modify the Context to include additional properties, methods, etc.
   *
   * @param middleware Middleware function
   * @returns Command Client
   */ use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }
    /** Processes a Message to Execute Command. */ async processMessage(msg) {
        if (!this.allowBots && msg.author.bot === true) return;
        let prefix = [];
        if (typeof this.prefix === 'string' || this.prefix instanceof RegExp) prefix = [
            ...prefix,
            this.prefix
        ];
        else prefix = [
            ...prefix,
            ...this.prefix
        ];
        const userPrefix = await this.getUserPrefix(msg.author.id);
        if (userPrefix !== undefined) {
            if (typeof userPrefix === 'string' || userPrefix instanceof RegExp) prefix = [
                ...prefix,
                userPrefix
            ];
            else prefix = [
                ...prefix,
                ...userPrefix
            ];
        }
        if (msg.guild !== undefined) {
            const guildPrefix = await this.getGuildPrefix(msg.guild.id);
            if (guildPrefix !== undefined) {
                if (typeof guildPrefix === 'string' || guildPrefix instanceof RegExp) prefix = [
                    ...prefix,
                    guildPrefix
                ];
                else prefix = [
                    ...prefix,
                    ...guildPrefix
                ];
            }
        }
        prefix = [
            ...new Set(prefix)
        ];
        let mentionPrefix = false;
        const usedPrefixes = [];
        for (const p of prefix){
            if (typeof p === 'string') {
                if (msg.content.startsWith(p)) {
                    usedPrefixes.push(p);
                }
            } else {
                const match = msg.content.match(p);
                // The regex matches and is at the start of the message
                if (match !== null && match.index === 0) {
                    usedPrefixes.push(match[0]);
                }
            }
        }
        let usedPrefix = usedPrefixes.sort((b, a)=>a.length - b.length)[0];
        if (usedPrefix === undefined && this.mentionPrefix) mentionPrefix = true;
        if (mentionPrefix) {
            if (msg.content.startsWith(this.user?.mention) === true) usedPrefix = this.user?.mention;
            else if (msg.content.startsWith(this.user?.nickMention) === true) usedPrefix = this.user?.nickMention;
            else return;
        }
        if (typeof usedPrefix !== 'string') return;
        prefix = usedPrefix;
        const parsed = parseCommand(this, msg, prefix);
        if (parsed === undefined) return;
        const command = this.commands.fetch(parsed);
        if (command === undefined) return this.emit('commandNotFound', msg, parsed);
        const category = command.category !== undefined ? this.categories.get(command.category) : undefined;
        // Guild whitelist exists, and if does and Command used in a Guild, is this Guild allowed?
        // This is a bit confusing here, if these settings on a Command exist, and also do on Category, Command overrides them
        if (command.whitelistedGuilds === undefined && category?.whitelistedGuilds !== undefined && msg.guild !== undefined && category.whitelistedGuilds.includes(msg.guild.id) === false) return;
        if (command.whitelistedGuilds !== undefined && msg.guild !== undefined && command.whitelistedGuilds.includes(msg.guild.id) === false) return;
        // Checks for Channel Whitelist
        if (command.whitelistedChannels === undefined && category?.whitelistedChannels !== undefined && category.whitelistedChannels.includes(msg.channel.id) === false) return;
        if (command.whitelistedChannels !== undefined && command.whitelistedChannels.includes(msg.channel.id) === false) return;
        // Checks for Users Whitelist
        if (command.whitelistedUsers === undefined && category?.whitelistedUsers !== undefined && category.whitelistedUsers.includes(msg.author.id) === false) return;
        if (command.whitelistedUsers !== undefined && command.whitelistedUsers.includes(msg.author.id) === false) return;
        const ctx = {
            client: this,
            name: parsed.name,
            prefix,
            rawArgs: parsed.args,
            args: await parseArgs(command.args, parsed.args, msg),
            argString: parsed.argString,
            message: msg,
            author: msg.author,
            member: msg.member,
            command,
            channel: msg.channel,
            guild: msg.guild
        };
        const isUserBlacklisted = await this.isUserBlacklisted(msg.author.id);
        if (isUserBlacklisted) return this.emit('commandBlockedUser', ctx);
        const isChannelBlacklisted = await this.isChannelBlacklisted(msg.channel.id);
        if (isChannelBlacklisted) return this.emit('commandBlockedChannel', ctx);
        if (msg.guild !== undefined) {
            const isGuildBlacklisted = await this.isGuildBlacklisted(msg.guild.id);
            if (isGuildBlacklisted) return this.emit('commandBlockedGuild', ctx);
        }
        // In these checks too, Command overrides Category if present
        // Checks if Command is only for Owners
        if ((command.ownerOnly !== undefined || category === undefined ? command.ownerOnly : category.ownerOnly) === true && !this.owners.includes(msg.author.id)) return this.emit('commandOwnerOnly', ctx);
        // Checks if Command is only for Guild
        if ((command.guildOnly !== undefined || category === undefined ? command.guildOnly : category.guildOnly) === true && msg.guild === undefined) return this.emit('commandGuildOnly', ctx);
        // Checks if Command is only for DMs
        if ((command.dmOnly !== undefined || category === undefined ? command.dmOnly : category.dmOnly) === true && msg.guild !== undefined) return this.emit('commandDmOnly', ctx);
        if (command.nsfw === true && (msg.guild === undefined || msg.channel.nsfw !== true)) return this.emit('commandNSFW', ctx);
        const allPermissions = command.permissions !== undefined ? command.permissions : category?.permissions;
        if ((command.botPermissions !== undefined || category?.botPermissions !== undefined || allPermissions !== undefined) && msg.guild !== undefined) {
            // TODO: Check Overwrites too
            const me = await msg.guild.me();
            const missing = [];
            let permissions = command.botPermissions === undefined ? category?.permissions : command.botPermissions;
            if (permissions !== undefined) {
                if (typeof permissions === 'string') permissions = [
                    permissions
                ];
                if (allPermissions !== undefined) permissions = [
                    ...new Set(...permissions, ...allPermissions)
                ];
                for (const perm of permissions){
                    if (me.permissions.has(perm) === false) missing.push(perm);
                }
                if (missing.length !== 0) return this.emit('commandBotMissingPermissions', ctx, missing);
            }
        }
        if ((command.userPermissions !== undefined || category?.userPermissions !== undefined || allPermissions !== undefined) && msg.guild !== undefined) {
            let permissions1 = command.userPermissions !== undefined ? command.userPermissions : category?.userPermissions;
            if (permissions1 !== undefined) {
                if (typeof permissions1 === 'string') permissions1 = [
                    permissions1
                ];
                if (allPermissions !== undefined) permissions1 = [
                    ...new Set(...permissions1, ...allPermissions)
                ];
                const missing1 = [];
                for (const perm1 of permissions1){
                    const has = msg.guild.ownerID === msg.author.id || msg.member?.permissions.has(perm1);
                    if (has !== true) missing1.push(perm1);
                }
                if (missing1.length !== 0) return this.emit('commandUserMissingPermissions', ctx, missing1);
            }
        }
        if (command.args !== undefined && parsed.args.length === 0 && command.optionalArgs !== true) {
            try {
                return command.onMissingArgs(ctx);
            } catch (e) {
                return this.emit('commandMissingArgs', ctx);
            }
        }
        const userCooldowns = this.lastUsed.get(msg.author.id) ?? {
            global: 0,
            commands: {}
        };
        const botCooldowns = this.lastUsed.get('bot') ?? {
            global: 0,
            commands: {}
        };
        const userCanUseCommandAt = (userCooldowns.commands[command.name] ?? 0) + (command.cooldown ?? 0);
        const userCanUseAnyCommandAt = userCooldowns.global + this.globalCommandCooldown;
        const anyoneCanUseCommandAt = (botCooldowns.commands[command.name] ?? 0) + (command.globalCooldown ?? 0);
        const anyoneCanUseAnyCommandAt = botCooldowns.global + this.globalCooldown;
        if (Date.now() < anyoneCanUseCommandAt || Date.now() < anyoneCanUseAnyCommandAt) {
            const forCommand = anyoneCanUseCommandAt > anyoneCanUseAnyCommandAt;
            return this.emit('commandOnCooldown', ctx, (forCommand ? anyoneCanUseCommandAt : anyoneCanUseAnyCommandAt) - Date.now(), forCommand ? CommandCooldownType.BOT_COMMAND : CommandCooldownType.BOT_GLOBAL);
        }
        if (Date.now() < userCanUseCommandAt || Date.now() < userCanUseAnyCommandAt) {
            const forCommand1 = userCanUseCommandAt > userCanUseAnyCommandAt;
            return this.emit('commandOnCooldown', ctx, (forCommand1 ? userCanUseCommandAt : userCanUseAnyCommandAt) - Date.now(), forCommand1 ? CommandCooldownType.USER_COMMAND : CommandCooldownType.USER_GLOBAL);
        }
        const lastNext = async ()=>{
            try {
                this.emit('commandUsed', ctx);
                const beforeExecute = await command.beforeExecute(ctx);
                if (beforeExecute === false) return;
                const result = await command.execute(ctx);
                await command.afterExecute(ctx, result);
                userCooldowns.commands[command.name] = Date.now();
                userCooldowns.global = Date.now();
                botCooldowns.commands[command.name] = Date.now();
                botCooldowns.global = Date.now();
                this.lastUsed.set(msg.author.id, userCooldowns);
                this.lastUsed.set('bot', botCooldowns);
            } catch (e1) {
                try {
                    await command.onError(ctx, e1);
                } catch (e) {
                    this.emit('commandError', ctx, e);
                }
                this.emit('commandError', ctx, e1);
            }
        };
        if (this.middlewares.length === 0) await lastNext();
        else {
            const createNext = (index)=>{
                const fn = this.middlewares[index + 1] ?? lastNext;
                return ()=>fn(ctx, createNext(index + 1));
            };
            const middleware = this.middlewares[0];
            const next = createNext(0);
            await middleware(ctx, next);
        }
    }
}
/**
 * Command decorator. Decorates the function with optional metadata as a Command registered upon constructing class.
 */ export function command(options) {
    return function(target, name) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const c = target;
        if (c._decoratedCommands === undefined) c._decoratedCommands = {};
        const prop = c[name];
        if (typeof prop !== 'function') throw new Error('@command decorator can only be used on class methods');
        const command = new Command();
        command.name = name;
        command.execute = prop;
        if (options !== undefined) Object.assign(command, options);
        if (target instanceof Extension) command.extension = target;
        c._decoratedCommands[command.name] = command;
    };
}
/**
 * Sub Command decorator. Decorates the function with optional metadata as a Sub Command registered upon constructing class.
 */ export function subcommand(options) {
    return function(target, name) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const c = target;
        if (c._decoratedSubCommands === undefined) c._decoratedSubCommands = [];
        const prop = c[name];
        if (typeof prop !== 'function') throw new Error('@command decorator can only be used on class methods');
        const command = new Command();
        command.name = name;
        command.execute = prop;
        if (options !== undefined) Object.assign(command, options);
        c._decoratedSubCommands.push(command);
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2NvbW1hbmRzL2NsaWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IE1lc3NhZ2UgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL21lc3NhZ2UudHMnXG5pbXBvcnQgdHlwZSB7IEd1aWxkVGV4dEJhc2VkQ2hhbm5lbCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvZ3VpbGRUZXh0Q2hhbm5lbC50cydcbmltcG9ydCB7IENsaWVudCwgQ2xpZW50T3B0aW9ucyB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQge1xuICBDYXRlZ29yaWVzTWFuYWdlcixcbiAgQ29tbWFuZCxcbiAgQ29tbWFuZENvbnRleHQsXG4gIENvbW1hbmRPcHRpb25zLFxuICBDb21tYW5kc01hbmFnZXIsXG4gIHBhcnNlQ29tbWFuZFxufSBmcm9tICcuL2NvbW1hbmQudHMnXG5pbXBvcnQgeyBwYXJzZUFyZ3MgfSBmcm9tICcuLi91dGlscy9jb21tYW5kLnRzJ1xuaW1wb3J0IHsgRXh0ZW5zaW9uLCBFeHRlbnNpb25zTWFuYWdlciB9IGZyb20gJy4vZXh0ZW5zaW9uLnRzJ1xuXG50eXBlIFByZWZpeFR5cGUgPSBzdHJpbmcgfCBSZWdFeHAgfCBBcnJheTxzdHJpbmcgfCBSZWdFeHA+XG50eXBlIFByZWZpeFJldHVyblR5cGUgPSBQcmVmaXhUeXBlIHwgUHJvbWlzZTxQcmVmaXhUeXBlPlxuXG4vKiogQ29tbWFuZCBDbGllbnQgb3B0aW9ucyBleHRlbmRpbmcgQ2xpZW50IE9wdGlvbnMgdG8gcHJvdmlkZSBhIGxvdCBvZiBDb21tYW5kcy1yZWxhdGVkIGN1c3RvbWl6YXRpb25zICovXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRDbGllbnRPcHRpb25zIGV4dGVuZHMgQ2xpZW50T3B0aW9ucyB7XG4gIC8qKiBHbG9iYWwgcHJlZml4KHMpIG9mIHRoZSBib3QuIENhbiBiZSBhIHN0cmluZywgYSByZWd1bGFyIGV4cHJlc3Npb24sIG9yIGFuIGFycmF5IGluY2x1ZGluZyBlaXRoZXIuICovXG4gIHByZWZpeDogUHJlZml4VHlwZVxuICAvKiogV2hldGhlciB0byBlbmFibGUgbWVudGlvbiBwcmVmaXggb3Igbm90LiAqL1xuICBtZW50aW9uUHJlZml4PzogYm9vbGVhblxuICAvKiogTWV0aG9kIHRvIGdldCBhIEd1aWxkJ3MgY3VzdG9tIHByZWZpeChzKS4gKi9cbiAgZ2V0R3VpbGRQcmVmaXg/OiAoZ3VpbGRJRDogc3RyaW5nKSA9PiBQcmVmaXhSZXR1cm5UeXBlXG4gIC8qKiBNZXRob2QgdG8gZ2V0IGEgVXNlcidzIGN1c3RvbSBwcmVmaXgocykuICovXG4gIGdldFVzZXJQcmVmaXg/OiAodXNlcklEOiBzdHJpbmcpID0+IFByZWZpeFJldHVyblR5cGVcbiAgLyoqIE1ldGhvZCB0byBnZXQgYSBDaGFubmVsJ3MgY3VzdG9tIHByZWZpeChzKS4gKi9cbiAgZ2V0Q2hhbm5lbFByZWZpeD86IChjaGFubmVsSUQ6IHN0cmluZykgPT4gUHJlZml4UmV0dXJuVHlwZVxuICAvKiogTWV0aG9kIHRvIGNoZWNrIGlmIGNlcnRhaW4gR3VpbGQgaXMgYmxhY2tsaXN0ZWQgZnJvbSB1c2luZyBDb21tYW5kcy4gKi9cbiAgaXNHdWlsZEJsYWNrbGlzdGVkPzogKGd1aWxkSUQ6IHN0cmluZykgPT4gYm9vbGVhbiB8IFByb21pc2U8Ym9vbGVhbj5cbiAgLyoqIE1ldGhvZCB0byBjaGVjayBpZiBjZXJ0YWluIFVzZXIgaXMgYmxhY2tsaXN0ZWQgZnJvbSB1c2luZyBDb21tYW5kcy4gKi9cbiAgaXNVc2VyQmxhY2tsaXN0ZWQ/OiAodXNlcklEOiBzdHJpbmcpID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+XG4gIC8qKiBNZXRob2QgdG8gY2hlY2sgaWYgY2VydGFpbiBDaGFubmVsIGlzIGJsYWNrbGlzdGVkIGZyb20gdXNpbmcgQ29tbWFuZHMuICovXG4gIGlzQ2hhbm5lbEJsYWNrbGlzdGVkPzogKGNoYW5uZWxJRDogc3RyaW5nKSA9PiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPlxuICAvKiogQWxsb3cgc3BhY2VzIGFmdGVyIHByZWZpeD8gUmVjb21tZW5kZWQgd2l0aCBNZW50aW9uIFByZWZpeCBPTi4gKi9cbiAgc3BhY2VzQWZ0ZXJQcmVmaXg/OiBib29sZWFuXG4gIC8qKiBMaXN0IG9mIEJvdCdzIE93bmVyIElEcyB3aG9tIGNhbiBhY2Nlc3MgYG93bmVyT25seWAgY29tbWFuZHMuICovXG4gIG93bmVycz86IHN0cmluZ1tdXG4gIC8qKiBXaGV0aGVyIHRvIGFsbG93IEJvdHMgdG8gdXNlIENvbW1hbmRzIG9yIG5vdCwgbm90IGFsbG93ZWQgYnkgZGVmYXVsdC4gKi9cbiAgYWxsb3dCb3RzPzogYm9vbGVhblxuICAvKiogV2hldGhlciB0byBhbGxvdyBDb21tYW5kcyBpbiBETXMgb3Igbm90LCBhbGxvd2VkIGJ5IGRlZmF1bHQuICovXG4gIGFsbG93RE1zPzogYm9vbGVhblxuICAvKiogV2hldGhlciBDb21tYW5kcyBzaG91bGQgYmUgY2FzZS1zZW5zaXRpdmUgb3Igbm90LCBub3QgYnkgZGVmYXVsdC4gKi9cbiAgY2FzZVNlbnNpdGl2ZT86IGJvb2xlYW5cbiAgLyoqIEdsb2JhbCBjb21tYW5kIGNvb2xkb3duIGluIE1TICovXG4gIGdsb2JhbENvbW1hbmRDb29sZG93bj86IG51bWJlclxuICAvKiogR2xvYmFsIGNvb2xkb3duIGluIE1TICovXG4gIGdsb2JhbENvb2xkb3duPzogbnVtYmVyXG59XG5cbmV4cG9ydCBlbnVtIENvbW1hbmRDb29sZG93blR5cGUge1xuICAvKiogQ29vbGRvd24gZm9yIGNvbW1hbmQgZm9yIHVzZXIgKi9cbiAgVVNFUl9DT01NQU5ELFxuICAvKiogQ29vbGRvd24gZm9yIGFueSBjb21tYW5kIGZvciBib3QgKi9cbiAgVVNFUl9HTE9CQUwsXG4gIC8qKiBDb29sZG93biBmb3IgY29tbWFuZCBmb3IgYm90ICovXG4gIEJPVF9DT01NQU5ELFxuICAvKiogQ29vbGRvd24gZm9yIGFueSBjb21tYW5kIGZvciBib3QgKi9cbiAgQk9UX0dMT0JBTFxufVxuXG5leHBvcnQgdHlwZSBDb21tYW5kQ29udGV4dE1pZGRsZXdhcmU8VCBleHRlbmRzIENvbW1hbmRDb250ZXh0PiA9IChcbiAgY3R4OiBULFxuICBuZXh0OiAoKSA9PiB1bmtub3duIHwgUHJvbWlzZTx1bmtub3duPlxuKSA9PiB1bmtub3duIHwgUHJvbWlzZTx1bmtub3duPlxuXG5leHBvcnQgdHlwZSBDb21tYW5kQ29udGV4dE1pZGRsZXdhcmVOZXh0ID0gKCkgPT4gdW5rbm93biB8IFByb21pc2U8dW5rbm93bj5cblxuLyoqXG4gKiBIYXJtb255IENsaWVudCB3aXRoIGV4dGVuZGVkIGZ1bmN0aW9uYWxpdHkgZm9yIE1lc3NhZ2UgYmFzZWQgQ29tbWFuZHMgcGFyc2luZyBhbmQgaGFuZGxpbmcuXG4gKlxuICogU2VlIEludGVyYWN0aW9uc0NsaWVudCAoYENsaWVudCNzbGFzaGApIGZvciBtb3JlIGluZm8gYWJvdXQgU2xhc2ggQ29tbWFuZHMuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21tYW5kQ2xpZW50IGV4dGVuZHMgQ2xpZW50IGltcGxlbWVudHMgQ29tbWFuZENsaWVudE9wdGlvbnMge1xuICBwcmVmaXg6IFByZWZpeFR5cGVcbiAgbWVudGlvblByZWZpeDogYm9vbGVhblxuXG4gIGdldEd1aWxkUHJlZml4OiAoZ3VpbGRJRDogc3RyaW5nKSA9PiBQcmVmaXhSZXR1cm5UeXBlXG4gIGdldFVzZXJQcmVmaXg6ICh1c2VySUQ6IHN0cmluZykgPT4gUHJlZml4UmV0dXJuVHlwZVxuICBnZXRDaGFubmVsUHJlZml4OiAoY2hhbm5lbElEOiBzdHJpbmcpID0+IFByZWZpeFJldHVyblR5cGVcblxuICBpc0d1aWxkQmxhY2tsaXN0ZWQ6IChndWlsZElEOiBzdHJpbmcpID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+XG4gIGlzVXNlckJsYWNrbGlzdGVkOiAodXNlcklEOiBzdHJpbmcpID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+XG4gIGlzQ2hhbm5lbEJsYWNrbGlzdGVkOiAoY2hhbm5lbElEOiBzdHJpbmcpID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+XG5cbiAgc3BhY2VzQWZ0ZXJQcmVmaXg6IGJvb2xlYW5cbiAgb3duZXJzOiBzdHJpbmdbXVxuICBhbGxvd0JvdHM6IGJvb2xlYW5cbiAgYWxsb3dETXM6IGJvb2xlYW5cbiAgY2FzZVNlbnNpdGl2ZTogYm9vbGVhblxuXG4gIGV4dGVuc2lvbnM6IEV4dGVuc2lvbnNNYW5hZ2VyID0gbmV3IEV4dGVuc2lvbnNNYW5hZ2VyKHRoaXMpXG4gIGNvbW1hbmRzOiBDb21tYW5kc01hbmFnZXIgPSBuZXcgQ29tbWFuZHNNYW5hZ2VyKHRoaXMpXG4gIGNhdGVnb3JpZXM6IENhdGVnb3JpZXNNYW5hZ2VyID0gbmV3IENhdGVnb3JpZXNNYW5hZ2VyKHRoaXMpXG5cbiAgbWlkZGxld2FyZXMgPSBuZXcgQXJyYXk8Q29tbWFuZENvbnRleHRNaWRkbGV3YXJlPENvbW1hbmRDb250ZXh0Pj4oKVxuXG4gIGdsb2JhbENvbW1hbmRDb29sZG93biA9IDBcbiAgZ2xvYmFsQ29vbGRvd24gPSAwXG5cbiAgcHJpdmF0ZSByZWFkb25seSBsYXN0VXNlZCA9IG5ldyBNYXA8XG4gICAgc3RyaW5nLFxuICAgIHsgZ2xvYmFsOiBudW1iZXI7IGNvbW1hbmRzOiB7IFtrZXk6IHN0cmluZ106IG51bWJlciB9IH1cbiAgPigpXG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogQ29tbWFuZENsaWVudE9wdGlvbnMpIHtcbiAgICBzdXBlcihvcHRpb25zKVxuICAgIHRoaXMucHJlZml4ID0gb3B0aW9ucy5wcmVmaXhcbiAgICB0aGlzLm1lbnRpb25QcmVmaXggPVxuICAgICAgb3B0aW9ucy5tZW50aW9uUHJlZml4ID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IG9wdGlvbnMubWVudGlvblByZWZpeFxuXG4gICAgdGhpcy5nZXRHdWlsZFByZWZpeCA9XG4gICAgICBvcHRpb25zLmdldEd1aWxkUHJlZml4ID09PSB1bmRlZmluZWRcbiAgICAgICAgPyAoaWQ6IHN0cmluZykgPT4gdGhpcy5wcmVmaXhcbiAgICAgICAgOiBvcHRpb25zLmdldEd1aWxkUHJlZml4XG4gICAgdGhpcy5nZXRVc2VyUHJlZml4ID1cbiAgICAgIG9wdGlvbnMuZ2V0VXNlclByZWZpeCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gKGlkOiBzdHJpbmcpID0+IHRoaXMucHJlZml4XG4gICAgICAgIDogb3B0aW9ucy5nZXRVc2VyUHJlZml4XG5cbiAgICB0aGlzLmdldENoYW5uZWxQcmVmaXggPVxuICAgICAgb3B0aW9ucy5nZXRDaGFubmVsUHJlZml4ID09PSB1bmRlZmluZWRcbiAgICAgICAgPyAoaWQ6IHN0cmluZykgPT4gdGhpcy5wcmVmaXhcbiAgICAgICAgOiBvcHRpb25zLmdldENoYW5uZWxQcmVmaXhcblxuICAgIHRoaXMuaXNVc2VyQmxhY2tsaXN0ZWQgPVxuICAgICAgb3B0aW9ucy5pc1VzZXJCbGFja2xpc3RlZCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gKGlkOiBzdHJpbmcpID0+IGZhbHNlXG4gICAgICAgIDogb3B0aW9ucy5pc1VzZXJCbGFja2xpc3RlZFxuICAgIHRoaXMuaXNHdWlsZEJsYWNrbGlzdGVkID1cbiAgICAgIG9wdGlvbnMuaXNHdWlsZEJsYWNrbGlzdGVkID09PSB1bmRlZmluZWRcbiAgICAgICAgPyAoaWQ6IHN0cmluZykgPT4gZmFsc2VcbiAgICAgICAgOiBvcHRpb25zLmlzR3VpbGRCbGFja2xpc3RlZFxuICAgIHRoaXMuaXNDaGFubmVsQmxhY2tsaXN0ZWQgPVxuICAgICAgb3B0aW9ucy5pc0NoYW5uZWxCbGFja2xpc3RlZCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gKGlkOiBzdHJpbmcpID0+IGZhbHNlXG4gICAgICAgIDogb3B0aW9ucy5pc0NoYW5uZWxCbGFja2xpc3RlZFxuXG4gICAgdGhpcy5zcGFjZXNBZnRlclByZWZpeCA9XG4gICAgICBvcHRpb25zLnNwYWNlc0FmdGVyUHJlZml4ID09PSB1bmRlZmluZWRcbiAgICAgICAgPyBmYWxzZVxuICAgICAgICA6IG9wdGlvbnMuc3BhY2VzQWZ0ZXJQcmVmaXhcblxuICAgIHRoaXMub3duZXJzID0gb3B0aW9ucy5vd25lcnMgPT09IHVuZGVmaW5lZCA/IFtdIDogb3B0aW9ucy5vd25lcnNcbiAgICB0aGlzLmFsbG93Qm90cyA9IG9wdGlvbnMuYWxsb3dCb3RzID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IG9wdGlvbnMuYWxsb3dCb3RzXG4gICAgdGhpcy5hbGxvd0RNcyA9IG9wdGlvbnMuYWxsb3dETXMgPT09IHVuZGVmaW5lZCA/IHRydWUgOiBvcHRpb25zLmFsbG93RE1zXG4gICAgdGhpcy5jYXNlU2Vuc2l0aXZlID1cbiAgICAgIG9wdGlvbnMuY2FzZVNlbnNpdGl2ZSA9PT0gdW5kZWZpbmVkID8gZmFsc2UgOiBvcHRpb25zLmNhc2VTZW5zaXRpdmVcblxuICAgIHRoaXMuZ2xvYmFsQ29tbWFuZENvb2xkb3duID0gb3B0aW9ucy5nbG9iYWxDb21tYW5kQ29vbGRvd24gPz8gMFxuICAgIHRoaXMuZ2xvYmFsQ29vbGRvd24gPSBvcHRpb25zLmdsb2JhbENvb2xkb3duID8/IDBcblxuICAgIGNvbnN0IHNlbGYgPSB0aGlzIGFzIGFueVxuICAgIGlmIChzZWxmLl9kZWNvcmF0ZWRDb21tYW5kcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBPYmplY3QudmFsdWVzKHNlbGYuX2RlY29yYXRlZENvbW1hbmRzKS5mb3JFYWNoKChlbnRyeTogYW55KSA9PiB7XG4gICAgICAgIHRoaXMuY29tbWFuZHMuYWRkKGVudHJ5KVxuICAgICAgfSlcbiAgICAgIHNlbGYuX2RlY29yYXRlZENvbW1hbmRzID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgdGhpcy5vbihcbiAgICAgICdtZXNzYWdlQ3JlYXRlJyxcbiAgICAgIGFzeW5jIChtc2c6IE1lc3NhZ2UpID0+IGF3YWl0IHRoaXMucHJvY2Vzc01lc3NhZ2UobXNnKVxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgTWlkZGxld2FyZSBGdW5jdGlvbiB0byBDb21tYW5kIENsaWVudCB0byBwcmUtcHJvY2VzcyBhbGwgQ29tbWFuZHMsXG4gICAqIGFuZCBjYW4gZXZlbiBtb2RpZnkgdGhlIENvbnRleHQgdG8gaW5jbHVkZSBhZGRpdGlvbmFsIHByb3BlcnRpZXMsIG1ldGhvZHMsIGV0Yy5cbiAgICpcbiAgICogQHBhcmFtIG1pZGRsZXdhcmUgTWlkZGxld2FyZSBmdW5jdGlvblxuICAgKiBAcmV0dXJucyBDb21tYW5kIENsaWVudFxuICAgKi9cbiAgdXNlPFQgZXh0ZW5kcyBDb21tYW5kQ29udGV4dD4obWlkZGxld2FyZTogQ29tbWFuZENvbnRleHRNaWRkbGV3YXJlPFQ+KTogdGhpcyB7XG4gICAgdGhpcy5taWRkbGV3YXJlcy5wdXNoKFxuICAgICAgbWlkZGxld2FyZSBhcyBDb21tYW5kQ29udGV4dE1pZGRsZXdhcmU8Q29tbWFuZENvbnRleHQ+XG4gICAgKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogUHJvY2Vzc2VzIGEgTWVzc2FnZSB0byBFeGVjdXRlIENvbW1hbmQuICovXG4gIGFzeW5jIHByb2Nlc3NNZXNzYWdlKG1zZzogTWVzc2FnZSk6IFByb21pc2U8YW55PiB7XG4gICAgaWYgKCF0aGlzLmFsbG93Qm90cyAmJiBtc2cuYXV0aG9yLmJvdCA9PT0gdHJ1ZSkgcmV0dXJuXG5cbiAgICBsZXQgcHJlZml4OiBQcmVmaXhUeXBlID0gW11cbiAgICBpZiAodHlwZW9mIHRoaXMucHJlZml4ID09PSAnc3RyaW5nJyB8fCB0aGlzLnByZWZpeCBpbnN0YW5jZW9mIFJlZ0V4cClcbiAgICAgIHByZWZpeCA9IFsuLi5wcmVmaXgsIHRoaXMucHJlZml4XVxuICAgIGVsc2UgcHJlZml4ID0gWy4uLnByZWZpeCwgLi4udGhpcy5wcmVmaXhdXG5cbiAgICBjb25zdCB1c2VyUHJlZml4ID0gYXdhaXQgdGhpcy5nZXRVc2VyUHJlZml4KG1zZy5hdXRob3IuaWQpXG4gICAgaWYgKHVzZXJQcmVmaXggIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiB1c2VyUHJlZml4ID09PSAnc3RyaW5nJyB8fCB1c2VyUHJlZml4IGluc3RhbmNlb2YgUmVnRXhwKVxuICAgICAgICBwcmVmaXggPSBbLi4ucHJlZml4LCB1c2VyUHJlZml4XVxuICAgICAgZWxzZSBwcmVmaXggPSBbLi4ucHJlZml4LCAuLi51c2VyUHJlZml4XVxuICAgIH1cblxuICAgIGlmIChtc2cuZ3VpbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgZ3VpbGRQcmVmaXggPSBhd2FpdCB0aGlzLmdldEd1aWxkUHJlZml4KG1zZy5ndWlsZC5pZClcbiAgICAgIGlmIChndWlsZFByZWZpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZ3VpbGRQcmVmaXggPT09ICdzdHJpbmcnIHx8IGd1aWxkUHJlZml4IGluc3RhbmNlb2YgUmVnRXhwKVxuICAgICAgICAgIHByZWZpeCA9IFsuLi5wcmVmaXgsIGd1aWxkUHJlZml4XVxuICAgICAgICBlbHNlIHByZWZpeCA9IFsuLi5wcmVmaXgsIC4uLmd1aWxkUHJlZml4XVxuICAgICAgfVxuICAgIH1cblxuICAgIHByZWZpeCA9IFsuLi5uZXcgU2V0KHByZWZpeCldXG5cbiAgICBsZXQgbWVudGlvblByZWZpeCA9IGZhbHNlXG5cbiAgICBjb25zdCB1c2VkUHJlZml4ZXMgPSBbXVxuICAgIGZvciAoY29uc3QgcCBvZiBwcmVmaXgpIHtcbiAgICAgIGlmICh0eXBlb2YgcCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgaWYgKG1zZy5jb250ZW50LnN0YXJ0c1dpdGgocCkgYXMgYm9vbGVhbikge1xuICAgICAgICAgIHVzZWRQcmVmaXhlcy5wdXNoKHApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gbXNnLmNvbnRlbnQubWF0Y2gocClcbiAgICAgICAgLy8gVGhlIHJlZ2V4IG1hdGNoZXMgYW5kIGlzIGF0IHRoZSBzdGFydCBvZiB0aGUgbWVzc2FnZVxuICAgICAgICBpZiAobWF0Y2ggIT09IG51bGwgJiYgbWF0Y2guaW5kZXggPT09IDApIHtcbiAgICAgICAgICB1c2VkUHJlZml4ZXMucHVzaChtYXRjaFswXSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGxldCB1c2VkUHJlZml4ID0gdXNlZFByZWZpeGVzLnNvcnQoKGIsIGEpID0+IGEubGVuZ3RoIC0gYi5sZW5ndGgpWzBdXG4gICAgaWYgKHVzZWRQcmVmaXggPT09IHVuZGVmaW5lZCAmJiB0aGlzLm1lbnRpb25QcmVmaXgpIG1lbnRpb25QcmVmaXggPSB0cnVlXG5cbiAgICBpZiAobWVudGlvblByZWZpeCkge1xuICAgICAgaWYgKG1zZy5jb250ZW50LnN0YXJ0c1dpdGgodGhpcy51c2VyPy5tZW50aW9uIGFzIHN0cmluZykgPT09IHRydWUpXG4gICAgICAgIHVzZWRQcmVmaXggPSB0aGlzLnVzZXI/Lm1lbnRpb24gYXMgc3RyaW5nXG4gICAgICBlbHNlIGlmIChcbiAgICAgICAgbXNnLmNvbnRlbnQuc3RhcnRzV2l0aCh0aGlzLnVzZXI/Lm5pY2tNZW50aW9uIGFzIHN0cmluZykgPT09IHRydWVcbiAgICAgIClcbiAgICAgICAgdXNlZFByZWZpeCA9IHRoaXMudXNlcj8ubmlja01lbnRpb24gYXMgc3RyaW5nXG4gICAgICBlbHNlIHJldHVyblxuICAgIH1cblxuICAgIGlmICh0eXBlb2YgdXNlZFByZWZpeCAhPT0gJ3N0cmluZycpIHJldHVyblxuICAgIHByZWZpeCA9IHVzZWRQcmVmaXhcblxuICAgIGNvbnN0IHBhcnNlZCA9IHBhcnNlQ29tbWFuZCh0aGlzLCBtc2csIHByZWZpeClcbiAgICBpZiAocGFyc2VkID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLmNvbW1hbmRzLmZldGNoKHBhcnNlZClcblxuICAgIGlmIChjb21tYW5kID09PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLmVtaXQoJ2NvbW1hbmROb3RGb3VuZCcsIG1zZywgcGFyc2VkKVxuICAgIGNvbnN0IGNhdGVnb3J5ID1cbiAgICAgIGNvbW1hbmQuY2F0ZWdvcnkgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IHRoaXMuY2F0ZWdvcmllcy5nZXQoY29tbWFuZC5jYXRlZ29yeSlcbiAgICAgICAgOiB1bmRlZmluZWRcblxuICAgIC8vIEd1aWxkIHdoaXRlbGlzdCBleGlzdHMsIGFuZCBpZiBkb2VzIGFuZCBDb21tYW5kIHVzZWQgaW4gYSBHdWlsZCwgaXMgdGhpcyBHdWlsZCBhbGxvd2VkP1xuICAgIC8vIFRoaXMgaXMgYSBiaXQgY29uZnVzaW5nIGhlcmUsIGlmIHRoZXNlIHNldHRpbmdzIG9uIGEgQ29tbWFuZCBleGlzdCwgYW5kIGFsc28gZG8gb24gQ2F0ZWdvcnksIENvbW1hbmQgb3ZlcnJpZGVzIHRoZW1cbiAgICBpZiAoXG4gICAgICBjb21tYW5kLndoaXRlbGlzdGVkR3VpbGRzID09PSB1bmRlZmluZWQgJiZcbiAgICAgIGNhdGVnb3J5Py53aGl0ZWxpc3RlZEd1aWxkcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBtc2cuZ3VpbGQgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgY2F0ZWdvcnkud2hpdGVsaXN0ZWRHdWlsZHMuaW5jbHVkZXMobXNnLmd1aWxkLmlkKSA9PT0gZmFsc2VcbiAgICApXG4gICAgICByZXR1cm5cbiAgICBpZiAoXG4gICAgICBjb21tYW5kLndoaXRlbGlzdGVkR3VpbGRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIG1zZy5ndWlsZCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBjb21tYW5kLndoaXRlbGlzdGVkR3VpbGRzLmluY2x1ZGVzKG1zZy5ndWlsZC5pZCkgPT09IGZhbHNlXG4gICAgKVxuICAgICAgcmV0dXJuXG5cbiAgICAvLyBDaGVja3MgZm9yIENoYW5uZWwgV2hpdGVsaXN0XG4gICAgaWYgKFxuICAgICAgY29tbWFuZC53aGl0ZWxpc3RlZENoYW5uZWxzID09PSB1bmRlZmluZWQgJiZcbiAgICAgIGNhdGVnb3J5Py53aGl0ZWxpc3RlZENoYW5uZWxzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIGNhdGVnb3J5LndoaXRlbGlzdGVkQ2hhbm5lbHMuaW5jbHVkZXMobXNnLmNoYW5uZWwuaWQpID09PSBmYWxzZVxuICAgIClcbiAgICAgIHJldHVyblxuICAgIGlmIChcbiAgICAgIGNvbW1hbmQud2hpdGVsaXN0ZWRDaGFubmVscyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBjb21tYW5kLndoaXRlbGlzdGVkQ2hhbm5lbHMuaW5jbHVkZXMobXNnLmNoYW5uZWwuaWQpID09PSBmYWxzZVxuICAgIClcbiAgICAgIHJldHVyblxuXG4gICAgLy8gQ2hlY2tzIGZvciBVc2VycyBXaGl0ZWxpc3RcbiAgICBpZiAoXG4gICAgICBjb21tYW5kLndoaXRlbGlzdGVkVXNlcnMgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgY2F0ZWdvcnk/LndoaXRlbGlzdGVkVXNlcnMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgY2F0ZWdvcnkud2hpdGVsaXN0ZWRVc2Vycy5pbmNsdWRlcyhtc2cuYXV0aG9yLmlkKSA9PT0gZmFsc2VcbiAgICApXG4gICAgICByZXR1cm5cbiAgICBpZiAoXG4gICAgICBjb21tYW5kLndoaXRlbGlzdGVkVXNlcnMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgY29tbWFuZC53aGl0ZWxpc3RlZFVzZXJzLmluY2x1ZGVzKG1zZy5hdXRob3IuaWQpID09PSBmYWxzZVxuICAgIClcbiAgICAgIHJldHVyblxuXG4gICAgY29uc3QgY3R4OiBDb21tYW5kQ29udGV4dCA9IHtcbiAgICAgIGNsaWVudDogdGhpcyxcbiAgICAgIG5hbWU6IHBhcnNlZC5uYW1lLFxuICAgICAgcHJlZml4LFxuICAgICAgcmF3QXJnczogcGFyc2VkLmFyZ3MsXG4gICAgICBhcmdzOiBhd2FpdCBwYXJzZUFyZ3MoY29tbWFuZC5hcmdzLCBwYXJzZWQuYXJncywgbXNnKSxcbiAgICAgIGFyZ1N0cmluZzogcGFyc2VkLmFyZ1N0cmluZyxcbiAgICAgIG1lc3NhZ2U6IG1zZyxcbiAgICAgIGF1dGhvcjogbXNnLmF1dGhvcixcbiAgICAgIG1lbWJlcjogbXNnLm1lbWJlcixcbiAgICAgIGNvbW1hbmQsXG4gICAgICBjaGFubmVsOiBtc2cuY2hhbm5lbCxcbiAgICAgIGd1aWxkOiBtc2cuZ3VpbGRcbiAgICB9XG5cbiAgICBjb25zdCBpc1VzZXJCbGFja2xpc3RlZCA9IGF3YWl0IHRoaXMuaXNVc2VyQmxhY2tsaXN0ZWQobXNnLmF1dGhvci5pZClcbiAgICBpZiAoaXNVc2VyQmxhY2tsaXN0ZWQpIHJldHVybiB0aGlzLmVtaXQoJ2NvbW1hbmRCbG9ja2VkVXNlcicsIGN0eClcblxuICAgIGNvbnN0IGlzQ2hhbm5lbEJsYWNrbGlzdGVkID0gYXdhaXQgdGhpcy5pc0NoYW5uZWxCbGFja2xpc3RlZChtc2cuY2hhbm5lbC5pZClcbiAgICBpZiAoaXNDaGFubmVsQmxhY2tsaXN0ZWQpIHJldHVybiB0aGlzLmVtaXQoJ2NvbW1hbmRCbG9ja2VkQ2hhbm5lbCcsIGN0eClcblxuICAgIGlmIChtc2cuZ3VpbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgaXNHdWlsZEJsYWNrbGlzdGVkID0gYXdhaXQgdGhpcy5pc0d1aWxkQmxhY2tsaXN0ZWQobXNnLmd1aWxkLmlkKVxuICAgICAgaWYgKGlzR3VpbGRCbGFja2xpc3RlZCkgcmV0dXJuIHRoaXMuZW1pdCgnY29tbWFuZEJsb2NrZWRHdWlsZCcsIGN0eClcbiAgICB9XG5cbiAgICAvLyBJbiB0aGVzZSBjaGVja3MgdG9vLCBDb21tYW5kIG92ZXJyaWRlcyBDYXRlZ29yeSBpZiBwcmVzZW50XG4gICAgLy8gQ2hlY2tzIGlmIENvbW1hbmQgaXMgb25seSBmb3IgT3duZXJzXG4gICAgaWYgKFxuICAgICAgKGNvbW1hbmQub3duZXJPbmx5ICE9PSB1bmRlZmluZWQgfHwgY2F0ZWdvcnkgPT09IHVuZGVmaW5lZFxuICAgICAgICA/IGNvbW1hbmQub3duZXJPbmx5XG4gICAgICAgIDogY2F0ZWdvcnkub3duZXJPbmx5KSA9PT0gdHJ1ZSAmJlxuICAgICAgIXRoaXMub3duZXJzLmluY2x1ZGVzKG1zZy5hdXRob3IuaWQpXG4gICAgKVxuICAgICAgcmV0dXJuIHRoaXMuZW1pdCgnY29tbWFuZE93bmVyT25seScsIGN0eClcblxuICAgIC8vIENoZWNrcyBpZiBDb21tYW5kIGlzIG9ubHkgZm9yIEd1aWxkXG4gICAgaWYgKFxuICAgICAgKGNvbW1hbmQuZ3VpbGRPbmx5ICE9PSB1bmRlZmluZWQgfHwgY2F0ZWdvcnkgPT09IHVuZGVmaW5lZFxuICAgICAgICA/IGNvbW1hbmQuZ3VpbGRPbmx5XG4gICAgICAgIDogY2F0ZWdvcnkuZ3VpbGRPbmx5KSA9PT0gdHJ1ZSAmJlxuICAgICAgbXNnLmd1aWxkID09PSB1bmRlZmluZWRcbiAgICApXG4gICAgICByZXR1cm4gdGhpcy5lbWl0KCdjb21tYW5kR3VpbGRPbmx5JywgY3R4KVxuXG4gICAgLy8gQ2hlY2tzIGlmIENvbW1hbmQgaXMgb25seSBmb3IgRE1zXG4gICAgaWYgKFxuICAgICAgKGNvbW1hbmQuZG1Pbmx5ICE9PSB1bmRlZmluZWQgfHwgY2F0ZWdvcnkgPT09IHVuZGVmaW5lZFxuICAgICAgICA/IGNvbW1hbmQuZG1Pbmx5XG4gICAgICAgIDogY2F0ZWdvcnkuZG1Pbmx5KSA9PT0gdHJ1ZSAmJlxuICAgICAgbXNnLmd1aWxkICE9PSB1bmRlZmluZWRcbiAgICApXG4gICAgICByZXR1cm4gdGhpcy5lbWl0KCdjb21tYW5kRG1Pbmx5JywgY3R4KVxuXG4gICAgaWYgKFxuICAgICAgY29tbWFuZC5uc2Z3ID09PSB0cnVlICYmXG4gICAgICAobXNnLmd1aWxkID09PSB1bmRlZmluZWQgfHxcbiAgICAgICAgKG1zZy5jaGFubmVsIGFzIHVua25vd24gYXMgR3VpbGRUZXh0QmFzZWRDaGFubmVsKS5uc2Z3ICE9PSB0cnVlKVxuICAgIClcbiAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2NvbW1hbmROU0ZXJywgY3R4KVxuXG4gICAgY29uc3QgYWxsUGVybWlzc2lvbnMgPVxuICAgICAgY29tbWFuZC5wZXJtaXNzaW9ucyAhPT0gdW5kZWZpbmVkXG4gICAgICAgID8gY29tbWFuZC5wZXJtaXNzaW9uc1xuICAgICAgICA6IGNhdGVnb3J5Py5wZXJtaXNzaW9uc1xuXG4gICAgaWYgKFxuICAgICAgKGNvbW1hbmQuYm90UGVybWlzc2lvbnMgIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICBjYXRlZ29yeT8uYm90UGVybWlzc2lvbnMgIT09IHVuZGVmaW5lZCB8fFxuICAgICAgICBhbGxQZXJtaXNzaW9ucyAhPT0gdW5kZWZpbmVkKSAmJlxuICAgICAgbXNnLmd1aWxkICE9PSB1bmRlZmluZWRcbiAgICApIHtcbiAgICAgIC8vIFRPRE86IENoZWNrIE92ZXJ3cml0ZXMgdG9vXG4gICAgICBjb25zdCBtZSA9IGF3YWl0IG1zZy5ndWlsZC5tZSgpXG4gICAgICBjb25zdCBtaXNzaW5nOiBzdHJpbmdbXSA9IFtdXG5cbiAgICAgIGxldCBwZXJtaXNzaW9ucyA9XG4gICAgICAgIGNvbW1hbmQuYm90UGVybWlzc2lvbnMgPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gY2F0ZWdvcnk/LnBlcm1pc3Npb25zXG4gICAgICAgICAgOiBjb21tYW5kLmJvdFBlcm1pc3Npb25zXG5cbiAgICAgIGlmIChwZXJtaXNzaW9ucyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcGVybWlzc2lvbnMgPT09ICdzdHJpbmcnKSBwZXJtaXNzaW9ucyA9IFtwZXJtaXNzaW9uc11cblxuICAgICAgICBpZiAoYWxsUGVybWlzc2lvbnMgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICBwZXJtaXNzaW9ucyA9IFsuLi5uZXcgU2V0KC4uLnBlcm1pc3Npb25zLCAuLi5hbGxQZXJtaXNzaW9ucyldXG5cbiAgICAgICAgZm9yIChjb25zdCBwZXJtIG9mIHBlcm1pc3Npb25zKSB7XG4gICAgICAgICAgaWYgKG1lLnBlcm1pc3Npb25zLmhhcyhwZXJtKSA9PT0gZmFsc2UpIG1pc3NpbmcucHVzaChwZXJtKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1pc3NpbmcubGVuZ3RoICE9PSAwKVxuICAgICAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2NvbW1hbmRCb3RNaXNzaW5nUGVybWlzc2lvbnMnLCBjdHgsIG1pc3NpbmcpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgKGNvbW1hbmQudXNlclBlcm1pc3Npb25zICE9PSB1bmRlZmluZWQgfHxcbiAgICAgICAgY2F0ZWdvcnk/LnVzZXJQZXJtaXNzaW9ucyAhPT0gdW5kZWZpbmVkIHx8XG4gICAgICAgIGFsbFBlcm1pc3Npb25zICE9PSB1bmRlZmluZWQpICYmXG4gICAgICBtc2cuZ3VpbGQgIT09IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgbGV0IHBlcm1pc3Npb25zID1cbiAgICAgICAgY29tbWFuZC51c2VyUGVybWlzc2lvbnMgIT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gY29tbWFuZC51c2VyUGVybWlzc2lvbnNcbiAgICAgICAgICA6IGNhdGVnb3J5Py51c2VyUGVybWlzc2lvbnNcblxuICAgICAgaWYgKHBlcm1pc3Npb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwZXJtaXNzaW9ucyA9PT0gJ3N0cmluZycpIHBlcm1pc3Npb25zID0gW3Blcm1pc3Npb25zXVxuXG4gICAgICAgIGlmIChhbGxQZXJtaXNzaW9ucyAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgIHBlcm1pc3Npb25zID0gWy4uLm5ldyBTZXQoLi4ucGVybWlzc2lvbnMsIC4uLmFsbFBlcm1pc3Npb25zKV1cblxuICAgICAgICBjb25zdCBtaXNzaW5nOiBzdHJpbmdbXSA9IFtdXG5cbiAgICAgICAgZm9yIChjb25zdCBwZXJtIG9mIHBlcm1pc3Npb25zKSB7XG4gICAgICAgICAgY29uc3QgaGFzID1cbiAgICAgICAgICAgIG1zZy5ndWlsZC5vd25lcklEID09PSBtc2cuYXV0aG9yLmlkIHx8XG4gICAgICAgICAgICBtc2cubWVtYmVyPy5wZXJtaXNzaW9ucy5oYXMocGVybSlcbiAgICAgICAgICBpZiAoaGFzICE9PSB0cnVlKSBtaXNzaW5nLnB1c2gocGVybSlcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChtaXNzaW5nLmxlbmd0aCAhPT0gMClcbiAgICAgICAgICByZXR1cm4gdGhpcy5lbWl0KCdjb21tYW5kVXNlck1pc3NpbmdQZXJtaXNzaW9ucycsIGN0eCwgbWlzc2luZylcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICBjb21tYW5kLmFyZ3MgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgcGFyc2VkLmFyZ3MubGVuZ3RoID09PSAwICYmXG4gICAgICBjb21tYW5kLm9wdGlvbmFsQXJncyAhPT0gdHJ1ZVxuICAgICkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgcmV0dXJuIGNvbW1hbmQub25NaXNzaW5nQXJncyhjdHgpXG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmVtaXQoJ2NvbW1hbmRNaXNzaW5nQXJncycsIGN0eClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCB1c2VyQ29vbGRvd25zID0gdGhpcy5sYXN0VXNlZC5nZXQobXNnLmF1dGhvci5pZCkgPz8ge1xuICAgICAgZ2xvYmFsOiAwLFxuICAgICAgY29tbWFuZHM6IHt9XG4gICAgfVxuICAgIGNvbnN0IGJvdENvb2xkb3ducyA9IHRoaXMubGFzdFVzZWQuZ2V0KCdib3QnKSA/PyB7XG4gICAgICBnbG9iYWw6IDAsXG4gICAgICBjb21tYW5kczoge31cbiAgICB9XG5cbiAgICBjb25zdCB1c2VyQ2FuVXNlQ29tbWFuZEF0ID1cbiAgICAgICh1c2VyQ29vbGRvd25zLmNvbW1hbmRzW2NvbW1hbmQubmFtZV0gPz8gMCkgK1xuICAgICAgKChjb21tYW5kLmNvb2xkb3duID8/IDApIGFzIG51bWJlcilcbiAgICBjb25zdCB1c2VyQ2FuVXNlQW55Q29tbWFuZEF0ID1cbiAgICAgIHVzZXJDb29sZG93bnMuZ2xvYmFsICsgdGhpcy5nbG9iYWxDb21tYW5kQ29vbGRvd25cblxuICAgIGNvbnN0IGFueW9uZUNhblVzZUNvbW1hbmRBdCA9XG4gICAgICAoYm90Q29vbGRvd25zLmNvbW1hbmRzW2NvbW1hbmQubmFtZV0gPz8gMCkgK1xuICAgICAgKChjb21tYW5kLmdsb2JhbENvb2xkb3duID8/IDApIGFzIG51bWJlcilcbiAgICBjb25zdCBhbnlvbmVDYW5Vc2VBbnlDb21tYW5kQXQgPSBib3RDb29sZG93bnMuZ2xvYmFsICsgdGhpcy5nbG9iYWxDb29sZG93blxuXG4gICAgaWYgKFxuICAgICAgRGF0ZS5ub3coKSA8IGFueW9uZUNhblVzZUNvbW1hbmRBdCB8fFxuICAgICAgRGF0ZS5ub3coKSA8IGFueW9uZUNhblVzZUFueUNvbW1hbmRBdFxuICAgICkge1xuICAgICAgY29uc3QgZm9yQ29tbWFuZCA9IGFueW9uZUNhblVzZUNvbW1hbmRBdCA+IGFueW9uZUNhblVzZUFueUNvbW1hbmRBdFxuICAgICAgcmV0dXJuIHRoaXMuZW1pdChcbiAgICAgICAgJ2NvbW1hbmRPbkNvb2xkb3duJyxcbiAgICAgICAgY3R4LFxuICAgICAgICAoZm9yQ29tbWFuZCA/IGFueW9uZUNhblVzZUNvbW1hbmRBdCA6IGFueW9uZUNhblVzZUFueUNvbW1hbmRBdCkgLVxuICAgICAgICAgIERhdGUubm93KCksXG4gICAgICAgIGZvckNvbW1hbmRcbiAgICAgICAgICA/IENvbW1hbmRDb29sZG93blR5cGUuQk9UX0NPTU1BTkRcbiAgICAgICAgICA6IENvbW1hbmRDb29sZG93blR5cGUuQk9UX0dMT0JBTFxuICAgICAgKVxuICAgIH1cblxuICAgIGlmIChcbiAgICAgIERhdGUubm93KCkgPCB1c2VyQ2FuVXNlQ29tbWFuZEF0IHx8XG4gICAgICBEYXRlLm5vdygpIDwgdXNlckNhblVzZUFueUNvbW1hbmRBdFxuICAgICkge1xuICAgICAgY29uc3QgZm9yQ29tbWFuZCA9IHVzZXJDYW5Vc2VDb21tYW5kQXQgPiB1c2VyQ2FuVXNlQW55Q29tbWFuZEF0XG4gICAgICByZXR1cm4gdGhpcy5lbWl0KFxuICAgICAgICAnY29tbWFuZE9uQ29vbGRvd24nLFxuICAgICAgICBjdHgsXG4gICAgICAgIChmb3JDb21tYW5kID8gdXNlckNhblVzZUNvbW1hbmRBdCA6IHVzZXJDYW5Vc2VBbnlDb21tYW5kQXQpIC1cbiAgICAgICAgICBEYXRlLm5vdygpLFxuICAgICAgICBmb3JDb21tYW5kXG4gICAgICAgICAgPyBDb21tYW5kQ29vbGRvd25UeXBlLlVTRVJfQ09NTUFORFxuICAgICAgICAgIDogQ29tbWFuZENvb2xkb3duVHlwZS5VU0VSX0dMT0JBTFxuICAgICAgKVxuICAgIH1cblxuICAgIGNvbnN0IGxhc3ROZXh0ID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgdGhpcy5lbWl0KCdjb21tYW5kVXNlZCcsIGN0eClcbiAgICAgICAgY29uc3QgYmVmb3JlRXhlY3V0ZSA9IGF3YWl0IGNvbW1hbmQuYmVmb3JlRXhlY3V0ZShjdHgpXG4gICAgICAgIGlmIChiZWZvcmVFeGVjdXRlID09PSBmYWxzZSkgcmV0dXJuXG5cbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY29tbWFuZC5leGVjdXRlKGN0eClcbiAgICAgICAgYXdhaXQgY29tbWFuZC5hZnRlckV4ZWN1dGUoY3R4LCByZXN1bHQpXG5cbiAgICAgICAgdXNlckNvb2xkb3ducy5jb21tYW5kc1tjb21tYW5kLm5hbWVdID0gRGF0ZS5ub3coKVxuICAgICAgICB1c2VyQ29vbGRvd25zLmdsb2JhbCA9IERhdGUubm93KClcbiAgICAgICAgYm90Q29vbGRvd25zLmNvbW1hbmRzW2NvbW1hbmQubmFtZV0gPSBEYXRlLm5vdygpXG4gICAgICAgIGJvdENvb2xkb3ducy5nbG9iYWwgPSBEYXRlLm5vdygpXG5cbiAgICAgICAgdGhpcy5sYXN0VXNlZC5zZXQobXNnLmF1dGhvci5pZCwgdXNlckNvb2xkb3ducylcbiAgICAgICAgdGhpcy5sYXN0VXNlZC5zZXQoJ2JvdCcsIGJvdENvb2xkb3ducylcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhd2FpdCBjb21tYW5kLm9uRXJyb3IoY3R4LCBlIGFzIEVycm9yKVxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KCdjb21tYW5kRXJyb3InLCBjdHgsIGUgYXMgRXJyb3IpXG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbWl0KCdjb21tYW5kRXJyb3InLCBjdHgsIGUgYXMgRXJyb3IpXG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMubWlkZGxld2FyZXMubGVuZ3RoID09PSAwKSBhd2FpdCBsYXN0TmV4dCgpXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBjcmVhdGVOZXh0ID0gKGluZGV4OiBudW1iZXIpOiBDb21tYW5kQ29udGV4dE1pZGRsZXdhcmVOZXh0ID0+IHtcbiAgICAgICAgY29uc3QgZm4gPSB0aGlzLm1pZGRsZXdhcmVzW2luZGV4ICsgMV0gPz8gbGFzdE5leHRcbiAgICAgICAgcmV0dXJuICgpID0+IGZuKGN0eCwgY3JlYXRlTmV4dChpbmRleCArIDEpKVxuICAgICAgfVxuXG4gICAgICBjb25zdCBtaWRkbGV3YXJlID0gdGhpcy5taWRkbGV3YXJlc1swXVxuICAgICAgY29uc3QgbmV4dCA9IGNyZWF0ZU5leHQoMClcblxuICAgICAgYXdhaXQgbWlkZGxld2FyZShjdHgsIG5leHQpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ29tbWFuZCBkZWNvcmF0b3IuIERlY29yYXRlcyB0aGUgZnVuY3Rpb24gd2l0aCBvcHRpb25hbCBtZXRhZGF0YSBhcyBhIENvbW1hbmQgcmVnaXN0ZXJlZCB1cG9uIGNvbnN0cnVjdGluZyBjbGFzcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbW1hbmQob3B0aW9ucz86IENvbW1hbmRPcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBDb21tYW5kQ2xpZW50IHwgRXh0ZW5zaW9uLCBuYW1lOiBzdHJpbmcpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgY29uc3QgYyA9IHRhcmdldCBhcyBhbnlcbiAgICBpZiAoYy5fZGVjb3JhdGVkQ29tbWFuZHMgPT09IHVuZGVmaW5lZCkgYy5fZGVjb3JhdGVkQ29tbWFuZHMgPSB7fVxuXG4gICAgY29uc3QgcHJvcCA9IGNbbmFtZV1cblxuICAgIGlmICh0eXBlb2YgcHJvcCAhPT0gJ2Z1bmN0aW9uJylcbiAgICAgIHRocm93IG5ldyBFcnJvcignQGNvbW1hbmQgZGVjb3JhdG9yIGNhbiBvbmx5IGJlIHVzZWQgb24gY2xhc3MgbWV0aG9kcycpXG5cbiAgICBjb25zdCBjb21tYW5kID0gbmV3IENvbW1hbmQoKVxuXG4gICAgY29tbWFuZC5uYW1lID0gbmFtZVxuICAgIGNvbW1hbmQuZXhlY3V0ZSA9IHByb3BcblxuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQpIE9iamVjdC5hc3NpZ24oY29tbWFuZCwgb3B0aW9ucylcblxuICAgIGlmICh0YXJnZXQgaW5zdGFuY2VvZiBFeHRlbnNpb24pIGNvbW1hbmQuZXh0ZW5zaW9uID0gdGFyZ2V0XG5cbiAgICBjLl9kZWNvcmF0ZWRDb21tYW5kc1tjb21tYW5kLm5hbWVdID0gY29tbWFuZFxuICB9XG59XG5cbi8qKlxuICogU3ViIENvbW1hbmQgZGVjb3JhdG9yLiBEZWNvcmF0ZXMgdGhlIGZ1bmN0aW9uIHdpdGggb3B0aW9uYWwgbWV0YWRhdGEgYXMgYSBTdWIgQ29tbWFuZCByZWdpc3RlcmVkIHVwb24gY29uc3RydWN0aW5nIGNsYXNzLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3ViY29tbWFuZChvcHRpb25zPzogQ29tbWFuZE9wdGlvbnMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IENvbW1hbmQsIG5hbWU6IHN0cmluZykge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5uZWNlc3NhcnktdHlwZS1hc3NlcnRpb25cbiAgICBjb25zdCBjID0gdGFyZ2V0IGFzIGFueVxuICAgIGlmIChjLl9kZWNvcmF0ZWRTdWJDb21tYW5kcyA9PT0gdW5kZWZpbmVkKSBjLl9kZWNvcmF0ZWRTdWJDb21tYW5kcyA9IFtdXG5cbiAgICBjb25zdCBwcm9wID0gY1tuYW1lXVxuXG4gICAgaWYgKHR5cGVvZiBwcm9wICE9PSAnZnVuY3Rpb24nKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdAY29tbWFuZCBkZWNvcmF0b3IgY2FuIG9ubHkgYmUgdXNlZCBvbiBjbGFzcyBtZXRob2RzJylcblxuICAgIGNvbnN0IGNvbW1hbmQgPSBuZXcgQ29tbWFuZCgpXG5cbiAgICBjb21tYW5kLm5hbWUgPSBuYW1lXG4gICAgY29tbWFuZC5leGVjdXRlID0gcHJvcFxuXG4gICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCkgT2JqZWN0LmFzc2lnbihjb21tYW5kLCBvcHRpb25zKVxuICAgIGMuX2RlY29yYXRlZFN1YkNvbW1hbmRzLnB1c2goY29tbWFuZClcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLFNBQVMsTUFBTSxRQUF1QixtQkFBa0I7QUFDeEQsU0FDRSxpQkFBaUIsRUFDakIsT0FBTyxFQUdQLGVBQWUsRUFDZixZQUFZLFFBQ1AsZUFBYztBQUNyQixTQUFTLFNBQVMsUUFBUSxzQkFBcUI7QUFDL0MsU0FBUyxTQUFTLEVBQUUsaUJBQWlCLFFBQVEsaUJBQWdCO1dBdUN0RDtVQUFLLG1CQUFtQjtJQUFuQixvQkFBQSxvQkFDVixrQ0FBa0MsR0FDbEMsa0JBQUEsS0FBQTtJQUZVLG9CQUFBLG9CQUdWLHFDQUFxQyxHQUNyQyxpQkFBQSxLQUFBO0lBSlUsb0JBQUEsb0JBS1YsaUNBQWlDLEdBQ2pDLGlCQUFBLEtBQUE7SUFOVSxvQkFBQSxvQkFPVixxQ0FBcUMsR0FDckMsZ0JBQUEsS0FBQTtHQVJVLHdCQUFB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