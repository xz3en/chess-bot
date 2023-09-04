/* eslint-disable no-useless-return */ import { Collection } from '../utils/collection.ts';
import { join, walk } from '../../deps.ts';
export class Command {
    static meta;
    name = '';
    description;
    category;
    aliases;
    extension;
    usage;
    examples;
    optionalArgs;
    args;
    permissions;
    userPermissions;
    botPermissions;
    roles;
    whitelistedGuilds;
    whitelistedChannels;
    whitelistedUsers;
    nsfw;
    guildOnly;
    dmOnly;
    ownerOnly;
    subCommands;
    /** Cooldown in MS */ cooldown;
    /** Global command cooldown in MS */ globalCooldown;
    /** Method called when the command errors */ onError(ctx, error) {
        return;
    }
    /** Method called when there are missing arguments */ onMissingArgs(ctx) {
        return;
    }
    /** Method executed before executing actual command. Returns bool value - whether to continue or not (optional) */ beforeExecute(ctx) {
        return true;
    }
    /** Actual command code, which is executed when all checks have passed. */ execute(ctx) {
        return;
    }
    /** Method executed after executing command, passes on CommandContext and the value returned by execute too. (optional) */ afterExecute(ctx, executeResult) {
        return;
    }
    toString() {
        return `Command: ${this.name}${this.extension !== undefined && this.extension.name !== '' ? ` [${this.extension.name}]` : this.category !== undefined ? ` [${this.category}]` : ''}`;
    }
    constructor(){
        if (this._decoratedSubCommands !== undefined && this._decoratedSubCommands.length > 0) {
            if (this.subCommands === undefined) this.subCommands = [];
            const commands = this._decoratedSubCommands;
            delete this._decoratedSubCommands;
            Object.defineProperty(this, '_decoratedSubCommands', {
                value: commands,
                enumerable: false
            });
        }
    }
    /** Get an Array of Sub Commands, including decorated ones */ getSubCommands() {
        return [
            ...this._decoratedSubCommands ?? [],
            ...this.subCommands ?? []
        ];
    }
}
export class CommandCategory {
    /** Name of the Category. */ name = '';
    /** Description of the Category. */ description = '';
    /** Permissions(s) required by both User and Bot in order to use Category Commands */ permissions;
    /** Permission(s) required for using Category Commands */ userPermissions;
    /** Permission(s) bot will need in order to execute Category Commands */ botPermissions;
    /** Role(s) user will require in order to use Category Commands. List or one of ID or name */ roles;
    /** Whitelisted Guilds. Only these Guild(s) can execute Category Commands. (List or one of IDs) */ whitelistedGuilds;
    /** Whitelisted Channels. Category Commands can be executed only in these channels. (List or one of IDs) */ whitelistedChannels;
    /** Whitelisted Users. Category Commands can be executed only by these Users (List or one of IDs) */ whitelistedUsers;
    /** Whether the Category Commands can only be used in Guild (if allowed in DMs) */ guildOnly;
    /** Whether the Category Commands can only be used in Bot's DMs (if allowed) */ dmOnly;
    /** Whether the Category Commands can only be used by Bot Owners */ ownerOnly;
}
export class CommandBuilder extends Command {
    setName(name) {
        this.name = name;
        return this;
    }
    setDescription(description) {
        this.description = description;
        return this;
    }
    setCategory(category) {
        this.category = category;
        return this;
    }
    setAlias(alias) {
        this.aliases = alias;
        return this;
    }
    addAlias(alias) {
        if (this.aliases === undefined) this.aliases = [];
        if (typeof this.aliases === 'string') this.aliases = [
            this.aliases
        ];
        this.aliases = [
            ...new Set(...this.aliases, ...typeof alias === 'string' ? [
                alias
            ] : alias)
        ];
        return this;
    }
    setExtension(extension) {
        this.extension = extension;
        return this;
    }
    setUsage(usage) {
        this.usage = usage;
        return this;
    }
    addUsage(usage) {
        if (this.usage === undefined) this.usage = [];
        if (typeof this.usage === 'string') this.usage = [
            this.usage
        ];
        this.aliases = [
            ...new Set(...this.usage, ...typeof usage === 'string' ? [
                usage
            ] : usage)
        ];
        return this;
    }
    setExample(examples) {
        this.examples = examples;
        return this;
    }
    addExample(examples) {
        if (this.examples === undefined) this.examples = [];
        if (typeof this.examples === 'string') this.examples = [
            this.examples
        ];
        this.examples = [
            ...new Set(...this.examples, ...typeof examples === 'string' ? [
                examples
            ] : examples)
        ];
        return this;
    }
    setPermissions(perms) {
        this.permissions = perms;
        return this;
    }
    setUserPermissions(perms) {
        this.userPermissions = perms;
        return this;
    }
    setBotPermissions(perms) {
        this.botPermissions = perms;
        return this;
    }
    setRoles(roles) {
        this.roles = roles;
        return this;
    }
    setWhitelistedGuilds(list) {
        this.whitelistedGuilds = list;
        return this;
    }
    setWhitelistedUsers(list) {
        this.whitelistedUsers = list;
        return this;
    }
    setWhitelistedChannels(list) {
        this.whitelistedChannels = list;
        return this;
    }
    setGuildOnly(value = true) {
        this.guildOnly = value;
        return this;
    }
    setNSFW(value = true) {
        this.nsfw = value;
        return this;
    }
    setOwnerOnly(value = true) {
        this.ownerOnly = value;
        return this;
    }
    onBeforeExecute(fn) {
        this.beforeExecute = fn;
        return this;
    }
    onExecute(fn) {
        this.execute = fn;
        return this;
    }
    onAfterExecute(fn) {
        this.afterExecute = fn;
        return this;
    }
    setSubCommands(subCommands) {
        this.subCommands = subCommands;
        return this;
    }
    subCommand(command) {
        if (this.subCommands === undefined) this.subCommands = [];
        this.subCommands.push(command);
        return this;
    }
}
export class CommandsLoader {
    client;
    #importSeq = {};
    constructor(client){
        this.client = client;
    }
    /**
   * Load a Command from file.
   *
   * NOTE: Relative paths resolve from cwd
   *
   * @param filePath Path of Command file.
   * @param exportName Export name. Default is the "default" export.
   */ async load(filePath, exportName = 'default', onlyRead) {
        const stat = await Deno.stat(filePath).catch(()=>undefined);
        if (stat === undefined || stat.isFile !== true) throw new Error(`File not found on path ${filePath}`);
        let seq;
        if (this.#importSeq[filePath] !== undefined) seq = this.#importSeq[filePath];
        const mod = await import(// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        'file:///' + join(Deno.cwd(), filePath) + (seq === undefined ? '' : `#${seq}`));
        if (this.#importSeq[filePath] === undefined) this.#importSeq[filePath] = 0;
        else this.#importSeq[filePath]++;
        const Cmd = mod[exportName];
        if (Cmd === undefined) throw new Error(`Command not exported as ${exportName} from ${filePath}`);
        let cmd;
        try {
            if (Cmd instanceof Command) cmd = Cmd;
            else cmd = new Cmd();
            if (!(cmd instanceof Command)) throw new Error('failed');
        } catch (e) {
            throw new Error(`Failed to load Command from ${filePath}`);
        }
        if (onlyRead !== true) this.client.commands.add(cmd);
        return cmd;
    }
    /**
   * Load commands from a Directory.
   *
   * NOTE: Relative paths resolve from cwd
   *
   * @param path Path of the directory.
   * @param options Options to configure loading.
   */ async loadDirectory(path, options) {
        const commands = [];
        for await (const entry of walk(path, {
            maxDepth: options?.maxDepth,
            exts: options?.exts,
            includeDirs: false
        })){
            if (entry.isFile !== true) continue;
            const cmd = await this.load(entry.path, options?.exportName, options?.onlyRead);
            commands.push(cmd);
        }
        return commands;
    }
}
export class CommandsManager {
    client;
    list = new Collection();
    disabled = new Set();
    loader;
    constructor(client){
        this.client = client;
        this.loader = new CommandsLoader(client);
    }
    /** Number of loaded Commands */ get count() {
        return this.list.size;
    }
    /** Filter out Commands by name/alias */ filter(search, subPrefix) {
        if (this.client.caseSensitive === false) search = search.toLowerCase();
        return this.list.filter((cmd)=>{
            if (subPrefix !== undefined) {
                if (this.client.caseSensitive === true ? subPrefix !== cmd.extension?.subPrefix : subPrefix.toLowerCase() !== cmd.extension?.subPrefix?.toLowerCase()) {
                    return false;
                }
            } else if (subPrefix === undefined && cmd.extension?.subPrefix !== undefined) {
                return false;
            }
            const name = this.client.caseSensitive === true ? cmd.name : cmd.name.toLowerCase();
            if (name === search) {
                return true;
            } else if (cmd.aliases !== undefined) {
                let aliases;
                if (typeof cmd.aliases === 'string') aliases = [
                    cmd.aliases
                ];
                else aliases = cmd.aliases;
                if (this.client.caseSensitive === false) aliases = aliases.map((e)=>e.toLowerCase());
                return aliases.includes(search);
            } else {
                return false;
            }
        });
    }
    /** Find a Command by name/alias */ find(search, subPrefix) {
        const filtered = this.filter(search, subPrefix);
        return filtered.first();
    }
    /** Fetch a Command including disable checks, sub commands and subPrefix implementation */ fetch(parsed, bypassDisable) {
        let cmd = this.find(parsed.name);
        if (cmd?.extension?.subPrefix !== undefined) cmd = undefined;
        if (cmd === undefined && parsed.args.length > 0) {
            cmd = this.find(parsed.args[0], parsed.name);
            if (cmd === undefined || cmd.extension?.subPrefix === undefined) return;
            if (this.client.caseSensitive === true ? cmd.extension.subPrefix !== parsed.name : cmd.extension.subPrefix.toLowerCase() !== parsed.name.toLowerCase()) return;
            const shifted = parsed.args.shift();
            if (shifted !== undefined) parsed.argString = parsed.argString.slice(shifted.length).trim();
        }
        if (cmd === undefined) return;
        if (this.isDisabled(cmd) && bypassDisable !== true) return;
        if (parsed.args.length !== 0 && cmd.subCommands !== undefined) {
            const resolveSubCommand = (command = cmd)=>{
                let name = parsed.args[0];
                if (name === undefined) return command;
                if (this.client.caseSensitive !== true) name = name.toLowerCase();
                const sub = command?.getSubCommands().find((e)=>(this.client.caseSensitive === true ? e.name : e.name.toLowerCase()) === name || (typeof e.aliases === 'string' ? [
                        e.aliases
                    ] : e.aliases ?? []).some((e)=>(this.client.caseSensitive === true ? e : e.toLowerCase()) === name));
                if (sub !== undefined) {
                    const shifted = parsed.args.shift();
                    if (shifted !== undefined) parsed.argString = parsed.argString.slice(shifted.length).trim();
                    return resolveSubCommand(sub);
                } else return command;
            };
            cmd = resolveSubCommand();
        }
        return cmd;
    }
    /** Check whether a Command exists or not */ exists(search, subPrefix) {
        let exists = false;
        if (typeof search === 'string') return this.find(search, subPrefix) !== undefined;
        else {
            exists = this.find(search.name, subPrefix === undefined ? search.extension?.subPrefix : subPrefix) !== undefined;
            if (search.aliases !== undefined) {
                const aliases = typeof search.aliases === 'string' ? [
                    search.aliases
                ] : search.aliases;
                exists = aliases.map((alias)=>this.find(alias) !== undefined).find((e)=>e) ?? false;
            }
            return exists;
        }
    }
    /** Add a Command */ add(cmd) {
        let CmdClass;
        if (!(cmd instanceof Command)) {
            CmdClass = cmd;
            cmd = new CmdClass();
            Object.assign(cmd, CmdClass.meta ?? {});
        }
        if (this.exists(cmd, cmd.extension?.subPrefix)) throw new Error(`Failed to add Command '${cmd.toString()}' with name/alias already exists.`);
        if (cmd.name === '' && CmdClass !== undefined) {
            let name = CmdClass.name;
            if (name.toLowerCase().endsWith('command') && name.toLowerCase() !== 'command') name = name.substr(0, name.length - 'command'.length).trim();
            cmd.name = name;
        }
        if (cmd.name === '') throw new Error('Command has no name');
        this.list.set(`${cmd.name}-${this.list.filter((e)=>this.client.caseSensitive === true ? e.name === cmd.name : e.name.toLowerCase() === cmd.name.toLowerCase()).size}`, cmd);
        return true;
    }
    /** Delete a Command */ delete(cmd) {
        const search = this.filter(typeof cmd === 'string' ? cmd : cmd.name);
        if (search.size === 0) return false;
        else return this.list.delete([
            ...search.keys()
        ][0]);
    }
    /** Check whether a Command is disabled or not */ isDisabled(name) {
        const cmd = typeof name === 'string' ? this.find(name) : name;
        if (cmd === undefined) return false;
        const exists = this.exists(name);
        if (!exists) return false;
        return this.disabled.has(cmd.name);
    }
    /** Disable a Command */ disable(name) {
        const cmd = typeof name === 'string' ? this.find(name) : name;
        if (cmd === undefined) return false;
        if (this.isDisabled(cmd)) return false;
        this.disabled.add(cmd.name);
        return true;
    }
    /** Get all commands of a Category */ category(category) {
        return this.list.filter((cmd)=>cmd.category !== undefined && cmd.category === category);
    }
}
export class CategoriesManager {
    client;
    list = new Collection();
    constructor(client){
        this.client = client;
    }
    /** Get a Collection of Categories */ all() {
        return this.list;
    }
    /** Get a list of names of Categories added */ names() {
        return [
            ...this.list.keys()
        ];
    }
    /** Check if a Category exists or not */ has(category) {
        return this.list.has(typeof category === 'string' ? category : category.name);
    }
    /** Get a Category by name */ get(name) {
        return this.list.get(name);
    }
    /** Add a Category to the Manager */ add(category) {
        if (this.has(category)) throw new Error(`Category ${category.name} already exists`);
        this.list.set(category.name, category);
        return this;
    }
    /** Remove a Category from the Manager */ remove(category) {
        if (!this.has(category)) return false;
        this.list.delete(typeof category === 'string' ? category : category.name);
        return true;
    }
}
/** Parses a Command to later look for. */ export const parseCommand = (client, msg, prefix)=>{
    let content = msg.content.slice(prefix.length);
    if (client.spacesAfterPrefix === true) content = content.trim();
    const args = content.split(/\s/);
    const name = args.shift();
    if (name === undefined) return;
    const argString = content.slice(name.length).trim();
    return {
        name,
        args,
        argString
    };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2NvbW1hbmRzL2NvbW1hbmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tdXNlbGVzcy1yZXR1cm4gKi9cbmltcG9ydCB0eXBlIHsgR3VpbGQgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2d1aWxkLnRzJ1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9tZXNzYWdlLnRzJ1xuaW1wb3J0IHR5cGUgeyBUZXh0Q2hhbm5lbCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvdGV4dENoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IFVzZXIgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL3VzZXIudHMnXG5pbXBvcnQgeyBDb2xsZWN0aW9uIH0gZnJvbSAnLi4vdXRpbHMvY29sbGVjdGlvbi50cydcbmltcG9ydCB0eXBlIHsgQ29tbWFuZENsaWVudCB9IGZyb20gJy4vY2xpZW50LnRzJ1xuaW1wb3J0IHR5cGUgeyBFeHRlbnNpb24gfSBmcm9tICcuL2V4dGVuc2lvbi50cydcbmltcG9ydCB7IGpvaW4sIHdhbGsgfSBmcm9tICcuLi8uLi9kZXBzLnRzJ1xuaW1wb3J0IHR5cGUgeyBBcmdzIH0gZnJvbSAnLi4vdXRpbHMvY29tbWFuZC50cydcbmltcG9ydCB7IE1lbWJlciB9IGZyb20gJy4uL3N0cnVjdHVyZXMvbWVtYmVyLnRzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRDb250ZXh0IHtcbiAgLyoqIFRoZSBDbGllbnQgb2JqZWN0ICovXG4gIGNsaWVudDogQ29tbWFuZENsaWVudFxuICAvKiogTWVzc2FnZSB3aGljaCB3YXMgcGFyc2VkIGZvciBDb21tYW5kICovXG4gIG1lc3NhZ2U6IE1lc3NhZ2VcbiAgLyoqIFRoZSBBdXRob3Igb2YgdGhlIE1lc3NhZ2UgKi9cbiAgYXV0aG9yOiBVc2VyXG4gIC8qKiBUaGUgQXV0aG9yIG9mIHRoZSBtZXNzYWdlIGFzIGEgTWVtYmVyIG9iamVjdCAqL1xuICBtZW1iZXI/OiBNZW1iZXJcbiAgLyoqIFRoZSBDaGFubmVsIGluIHdoaWNoIENvbW1hbmQgd2FzIHVzZWQgKi9cbiAgY2hhbm5lbDogVGV4dENoYW5uZWxcbiAgLyoqIFByZWZpeCB3aGljaCB3YXMgdXNlZCAqL1xuICBwcmVmaXg6IHN0cmluZ1xuICAvKiogT2JqZWN0IG9mIENvbW1hbmQgd2hpY2ggd2FzIHVzZWQgKi9cbiAgY29tbWFuZDogQ29tbWFuZFxuICAvKiogTmFtZSBvZiBDb21tYW5kIHdoaWNoIHdhcyB1c2VkICovXG4gIG5hbWU6IHN0cmluZ1xuICAvKiogQXJyYXkgb2YgUmF3IEFyZ3VtZW50cyB1c2VkIHdpdGggQ29tbWFuZCAqL1xuICByYXdBcmdzOiBzdHJpbmdbXVxuICAvKiogQXJyYXkgb2YgQXJndW1lbnRzIHVzZWQgd2l0aCBDb21tYW5kICovXG4gIGFyZ3M6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IHwgbnVsbFxuICAvKiogQ29tcGxldGUgUmF3IFN0cmluZyBvZiBBcmd1bWVudHMgKi9cbiAgYXJnU3RyaW5nOiBzdHJpbmdcbiAgLyoqIEd1aWxkIHdoaWNoIHRoZSBjb21tYW5kIGhhcyBjYWxsZWQgKi9cbiAgZ3VpbGQ/OiBHdWlsZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRPcHRpb25zIHtcbiAgLyoqIE5hbWUgb2YgdGhlIENvbW1hbmQgKi9cbiAgbmFtZT86IHN0cmluZ1xuICAvKiogRGVzY3JpcHRpb24gb2YgdGhlIENvbW1hbmQgKi9cbiAgZGVzY3JpcHRpb24/OiBzdHJpbmdcbiAgLyoqIENhdGVnb3J5IG9mIHRoZSBDb21tYW5kICovXG4gIGNhdGVnb3J5Pzogc3RyaW5nXG4gIC8qKiBBcnJheSBvZiBBbGlhc2VzIG9mIENvbW1hbmQsIG9yIG9ubHkgc3RyaW5nICovXG4gIGFsaWFzZXM/OiBzdHJpbmcgfCBzdHJpbmdbXVxuICAvKiogRXh0ZW5zaW9uIChQYXJlbnQpIG9mIHRoZSBDb21tYW5kICovXG4gIGV4dGVuc2lvbj86IEV4dGVuc2lvblxuICAvKiogVXNhZ2Ugb2YgQ29tbWFuZCwgb25seSBBcmd1bWVudCBOYW1lcyAqL1xuICB1c2FnZT86IHN0cmluZyB8IHN0cmluZ1tdXG4gIC8qKiBVc2FnZSBFeGFtcGxlIG9mIENvbW1hbmQsIG9ubHkgQXJndW1lbnRzICh3aXRob3V0IFByZWZpeCBhbmQgTmFtZSkgKi9cbiAgZXhhbXBsZXM/OiBzdHJpbmcgfCBzdHJpbmdbXVxuICAvKiogTWFrZSBhcmd1bWVudHMgb3B0aW9uYWwuIEVnOiBEb24ndCByZXF1aXJlIGFueSBhcmdzIHRvIGJlIHByZXNlbnQgdG8gZXhlY3V0ZSB0aGUgY29tbWFuZC4gZGVmYXVsdDogZmFsc2UgKi9cbiAgb3B0aW9uYWxBcmdzPzogYm9vbGVhblxuICAvKiogRG9lcyB0aGUgQ29tbWFuZCB0YWtlIEFyZ3VtZW50cz8gTWF5YmUgbnVtYmVyIG9mIHJlcXVpcmVkIGFyZ3VtZW50cz8gT3IgbGlzdCBvZiBhcmd1bWVudHM/ICovXG4gIGFyZ3M/OiBBcmdzW11cbiAgLyoqIFBlcm1pc3Npb25zKHMpIHJlcXVpcmVkIGJ5IGJvdGggVXNlciBhbmQgQm90IGluIG9yZGVyIHRvIHVzZSBDb21tYW5kICovXG4gIHBlcm1pc3Npb25zPzogc3RyaW5nIHwgc3RyaW5nW11cbiAgLyoqIFBlcm1pc3Npb24ocykgcmVxdWlyZWQgZm9yIHVzaW5nIENvbW1hbmQgKi9cbiAgdXNlclBlcm1pc3Npb25zPzogc3RyaW5nIHwgc3RyaW5nW11cbiAgLyoqIFBlcm1pc3Npb24ocykgYm90IHdpbGwgbmVlZCBpbiBvcmRlciB0byBleGVjdXRlIENvbW1hbmQgKi9cbiAgYm90UGVybWlzc2lvbnM/OiBzdHJpbmcgfCBzdHJpbmdbXVxuICAvKiogUm9sZShzKSB1c2VyIHdpbGwgcmVxdWlyZSBpbiBvcmRlciB0byB1c2UgQ29tbWFuZC4gTGlzdCBvciBvbmUgb2YgSUQgb3IgbmFtZSAqL1xuICByb2xlcz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIC8qKiBXaGl0ZWxpc3RlZCBHdWlsZHMuIE9ubHkgdGhlc2UgR3VpbGQocykgY2FuIGV4ZWN1dGUgQ29tbWFuZC4gKExpc3Qgb3Igb25lIG9mIElEcykgKi9cbiAgd2hpdGVsaXN0ZWRHdWlsZHM/OiBzdHJpbmcgfCBzdHJpbmdbXVxuICAvKiogV2hpdGVsaXN0ZWQgQ2hhbm5lbHMuIENvbW1hbmQgY2FuIGJlIGV4ZWN1dGVkIG9ubHkgaW4gdGhlc2UgY2hhbm5lbHMuIChMaXN0IG9yIG9uZSBvZiBJRHMpICovXG4gIHdoaXRlbGlzdGVkQ2hhbm5lbHM/OiBzdHJpbmcgfCBzdHJpbmdbXVxuICAvKiogV2hpdGVsaXN0ZWQgVXNlcnMuIENvbW1hbmQgY2FuIGJlIGV4ZWN1dGVkIG9ubHkgYnkgdGhlc2UgVXNlcnMgKExpc3Qgb3Igb25lIG9mIElEcykgKi9cbiAgd2hpdGVsaXN0ZWRVc2Vycz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIC8qKiBXaGV0aGVyIHRoZSBDb21tYW5kIGNhbiBvbmx5IGJlIHVzZWQgaW4gTlNGVyBjaGFubmVsIG9yIG5vdCAqL1xuICBuc2Z3PzogYm9vbGVhblxuICAvKiogV2hldGhlciB0aGUgQ29tbWFuZCBjYW4gb25seSBiZSB1c2VkIGluIEd1aWxkIChpZiBhbGxvd2VkIGluIERNcykgKi9cbiAgZ3VpbGRPbmx5PzogYm9vbGVhblxuICAvKiogV2hldGhlciB0aGUgQ29tbWFuZCBjYW4gb25seSBiZSB1c2VkIGluIEJvdCdzIERNcyAoaWYgYWxsb3dlZCkgKi9cbiAgZG1Pbmx5PzogYm9vbGVhblxuICAvKiogV2hldGhlciB0aGUgQ29tbWFuZCBjYW4gb25seSBiZSB1c2VkIGJ5IEJvdCBPd25lcnMgKi9cbiAgb3duZXJPbmx5PzogYm9vbGVhblxuICAvKiogU3ViIENvbW1hbmRzICovXG4gIHN1YkNvbW1hbmRzPzogQ29tbWFuZE9wdGlvbnNbXVxufVxuXG5leHBvcnQgY2xhc3MgQ29tbWFuZCBpbXBsZW1lbnRzIENvbW1hbmRPcHRpb25zIHtcbiAgc3RhdGljIG1ldGE/OiBDb21tYW5kT3B0aW9uc1xuXG4gIG5hbWU6IHN0cmluZyA9ICcnXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nXG4gIGNhdGVnb3J5Pzogc3RyaW5nXG4gIGFsaWFzZXM/OiBzdHJpbmcgfCBzdHJpbmdbXVxuICBleHRlbnNpb24/OiBFeHRlbnNpb25cbiAgdXNhZ2U/OiBzdHJpbmcgfCBzdHJpbmdbXVxuICBleGFtcGxlcz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIG9wdGlvbmFsQXJncz86IGJvb2xlYW5cbiAgYXJncz86IEFyZ3NbXVxuICBwZXJtaXNzaW9ucz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIHVzZXJQZXJtaXNzaW9ucz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIGJvdFBlcm1pc3Npb25zPzogc3RyaW5nIHwgc3RyaW5nW11cbiAgcm9sZXM/OiBzdHJpbmcgfCBzdHJpbmdbXVxuICB3aGl0ZWxpc3RlZEd1aWxkcz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIHdoaXRlbGlzdGVkQ2hhbm5lbHM/OiBzdHJpbmcgfCBzdHJpbmdbXVxuICB3aGl0ZWxpc3RlZFVzZXJzPzogc3RyaW5nIHwgc3RyaW5nW11cbiAgbnNmdz86IGJvb2xlYW5cbiAgZ3VpbGRPbmx5PzogYm9vbGVhblxuICBkbU9ubHk/OiBib29sZWFuXG4gIG93bmVyT25seT86IGJvb2xlYW5cbiAgc3ViQ29tbWFuZHM/OiBDb21tYW5kW11cbiAgLyoqIENvb2xkb3duIGluIE1TICovXG4gIGNvb2xkb3duPzogbnVtYmVyXG4gIC8qKiBHbG9iYWwgY29tbWFuZCBjb29sZG93biBpbiBNUyAqL1xuICBnbG9iYWxDb29sZG93bj86IG51bWJlclxuXG4gIGRlY2xhcmUgcmVhZG9ubHkgX2RlY29yYXRlZFN1YkNvbW1hbmRzPzogQ29tbWFuZFtdXG5cbiAgLyoqIE1ldGhvZCBjYWxsZWQgd2hlbiB0aGUgY29tbWFuZCBlcnJvcnMgKi9cbiAgb25FcnJvcihjdHg6IENvbW1hbmRDb250ZXh0LCBlcnJvcjogRXJyb3IpOiB1bmtub3duIHwgUHJvbWlzZTx1bmtub3duPiB7XG4gICAgcmV0dXJuXG4gIH1cblxuICAvKiogTWV0aG9kIGNhbGxlZCB3aGVuIHRoZXJlIGFyZSBtaXNzaW5nIGFyZ3VtZW50cyAqL1xuICBvbk1pc3NpbmdBcmdzKGN0eDogQ29tbWFuZENvbnRleHQpOiB1bmtub3duIHwgUHJvbWlzZTx1bmtub3duPiB7XG4gICAgcmV0dXJuXG4gIH1cblxuICAvKiogTWV0aG9kIGV4ZWN1dGVkIGJlZm9yZSBleGVjdXRpbmcgYWN0dWFsIGNvbW1hbmQuIFJldHVybnMgYm9vbCB2YWx1ZSAtIHdoZXRoZXIgdG8gY29udGludWUgb3Igbm90IChvcHRpb25hbCkgKi9cbiAgYmVmb3JlRXhlY3V0ZShcbiAgICBjdHg6IENvbW1hbmRDb250ZXh0XG4gICk6IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+IHwgdW5rbm93biB8IFByb21pc2U8dW5rbm93bj4ge1xuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvKiogQWN0dWFsIGNvbW1hbmQgY29kZSwgd2hpY2ggaXMgZXhlY3V0ZWQgd2hlbiBhbGwgY2hlY2tzIGhhdmUgcGFzc2VkLiAqL1xuICBleGVjdXRlKGN0eDogQ29tbWFuZENvbnRleHQpOiB1bmtub3duIHwgUHJvbWlzZTx1bmtub3duPiB7XG4gICAgcmV0dXJuXG4gIH1cblxuICAvKiogTWV0aG9kIGV4ZWN1dGVkIGFmdGVyIGV4ZWN1dGluZyBjb21tYW5kLCBwYXNzZXMgb24gQ29tbWFuZENvbnRleHQgYW5kIHRoZSB2YWx1ZSByZXR1cm5lZCBieSBleGVjdXRlIHRvby4gKG9wdGlvbmFsKSAqL1xuICBhZnRlckV4ZWN1dGU8VD4oXG4gICAgY3R4OiBDb21tYW5kQ29udGV4dCxcbiAgICBleGVjdXRlUmVzdWx0OiBUXG4gICk6IHVua25vd24gfCBQcm9taXNlPHVua25vd24+IHtcbiAgICByZXR1cm5cbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBDb21tYW5kOiAke3RoaXMubmFtZX0ke1xuICAgICAgdGhpcy5leHRlbnNpb24gIT09IHVuZGVmaW5lZCAmJiB0aGlzLmV4dGVuc2lvbi5uYW1lICE9PSAnJ1xuICAgICAgICA/IGAgWyR7dGhpcy5leHRlbnNpb24ubmFtZX1dYFxuICAgICAgICA6IHRoaXMuY2F0ZWdvcnkgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IGAgWyR7dGhpcy5jYXRlZ29yeX1dYFxuICAgICAgICA6ICcnXG4gICAgfWBcbiAgfVxuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIGlmIChcbiAgICAgIHRoaXMuX2RlY29yYXRlZFN1YkNvbW1hbmRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHRoaXMuX2RlY29yYXRlZFN1YkNvbW1hbmRzLmxlbmd0aCA+IDBcbiAgICApIHtcbiAgICAgIGlmICh0aGlzLnN1YkNvbW1hbmRzID09PSB1bmRlZmluZWQpIHRoaXMuc3ViQ29tbWFuZHMgPSBbXVxuICAgICAgY29uc3QgY29tbWFuZHMgPSB0aGlzLl9kZWNvcmF0ZWRTdWJDb21tYW5kc1xuICAgICAgZGVsZXRlICh0aGlzIGFzIHVua25vd24gYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pLl9kZWNvcmF0ZWRTdWJDb21tYW5kc1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdfZGVjb3JhdGVkU3ViQ29tbWFuZHMnLCB7XG4gICAgICAgIHZhbHVlOiBjb21tYW5kcyxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgLyoqIEdldCBhbiBBcnJheSBvZiBTdWIgQ29tbWFuZHMsIGluY2x1ZGluZyBkZWNvcmF0ZWQgb25lcyAqL1xuICBnZXRTdWJDb21tYW5kcygpOiBDb21tYW5kW10ge1xuICAgIHJldHVybiBbLi4uKHRoaXMuX2RlY29yYXRlZFN1YkNvbW1hbmRzID8/IFtdKSwgLi4uKHRoaXMuc3ViQ29tbWFuZHMgPz8gW10pXVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21tYW5kQ2F0ZWdvcnkge1xuICAvKiogTmFtZSBvZiB0aGUgQ2F0ZWdvcnkuICovXG4gIG5hbWU6IHN0cmluZyA9ICcnXG4gIC8qKiBEZXNjcmlwdGlvbiBvZiB0aGUgQ2F0ZWdvcnkuICovXG4gIGRlc2NyaXB0aW9uOiBzdHJpbmcgPSAnJ1xuICAvKiogUGVybWlzc2lvbnMocykgcmVxdWlyZWQgYnkgYm90aCBVc2VyIGFuZCBCb3QgaW4gb3JkZXIgdG8gdXNlIENhdGVnb3J5IENvbW1hbmRzICovXG4gIHBlcm1pc3Npb25zPzogc3RyaW5nIHwgc3RyaW5nW11cbiAgLyoqIFBlcm1pc3Npb24ocykgcmVxdWlyZWQgZm9yIHVzaW5nIENhdGVnb3J5IENvbW1hbmRzICovXG4gIHVzZXJQZXJtaXNzaW9ucz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIC8qKiBQZXJtaXNzaW9uKHMpIGJvdCB3aWxsIG5lZWQgaW4gb3JkZXIgdG8gZXhlY3V0ZSBDYXRlZ29yeSBDb21tYW5kcyAqL1xuICBib3RQZXJtaXNzaW9ucz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIC8qKiBSb2xlKHMpIHVzZXIgd2lsbCByZXF1aXJlIGluIG9yZGVyIHRvIHVzZSBDYXRlZ29yeSBDb21tYW5kcy4gTGlzdCBvciBvbmUgb2YgSUQgb3IgbmFtZSAqL1xuICByb2xlcz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIC8qKiBXaGl0ZWxpc3RlZCBHdWlsZHMuIE9ubHkgdGhlc2UgR3VpbGQocykgY2FuIGV4ZWN1dGUgQ2F0ZWdvcnkgQ29tbWFuZHMuIChMaXN0IG9yIG9uZSBvZiBJRHMpICovXG4gIHdoaXRlbGlzdGVkR3VpbGRzPzogc3RyaW5nIHwgc3RyaW5nW11cbiAgLyoqIFdoaXRlbGlzdGVkIENoYW5uZWxzLiBDYXRlZ29yeSBDb21tYW5kcyBjYW4gYmUgZXhlY3V0ZWQgb25seSBpbiB0aGVzZSBjaGFubmVscy4gKExpc3Qgb3Igb25lIG9mIElEcykgKi9cbiAgd2hpdGVsaXN0ZWRDaGFubmVscz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIC8qKiBXaGl0ZWxpc3RlZCBVc2Vycy4gQ2F0ZWdvcnkgQ29tbWFuZHMgY2FuIGJlIGV4ZWN1dGVkIG9ubHkgYnkgdGhlc2UgVXNlcnMgKExpc3Qgb3Igb25lIG9mIElEcykgKi9cbiAgd2hpdGVsaXN0ZWRVc2Vycz86IHN0cmluZyB8IHN0cmluZ1tdXG4gIC8qKiBXaGV0aGVyIHRoZSBDYXRlZ29yeSBDb21tYW5kcyBjYW4gb25seSBiZSB1c2VkIGluIEd1aWxkIChpZiBhbGxvd2VkIGluIERNcykgKi9cbiAgZ3VpbGRPbmx5PzogYm9vbGVhblxuICAvKiogV2hldGhlciB0aGUgQ2F0ZWdvcnkgQ29tbWFuZHMgY2FuIG9ubHkgYmUgdXNlZCBpbiBCb3QncyBETXMgKGlmIGFsbG93ZWQpICovXG4gIGRtT25seT86IGJvb2xlYW5cbiAgLyoqIFdoZXRoZXIgdGhlIENhdGVnb3J5IENvbW1hbmRzIGNhbiBvbmx5IGJlIHVzZWQgYnkgQm90IE93bmVycyAqL1xuICBvd25lck9ubHk/OiBib29sZWFuXG59XG5cbmV4cG9ydCBjbGFzcyBDb21tYW5kQnVpbGRlciBleHRlbmRzIENvbW1hbmQge1xuICBzZXROYW1lKG5hbWU6IHN0cmluZyk6IENvbW1hbmRCdWlsZGVyIHtcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldERlc2NyaXB0aW9uKGRlc2NyaXB0aW9uPzogc3RyaW5nKTogQ29tbWFuZEJ1aWxkZXIge1xuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRDYXRlZ29yeShjYXRlZ29yeT86IHN0cmluZyk6IENvbW1hbmRCdWlsZGVyIHtcbiAgICB0aGlzLmNhdGVnb3J5ID0gY2F0ZWdvcnlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0QWxpYXMoYWxpYXM6IHN0cmluZyB8IHN0cmluZ1tdKTogQ29tbWFuZEJ1aWxkZXIge1xuICAgIHRoaXMuYWxpYXNlcyA9IGFsaWFzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFkZEFsaWFzKGFsaWFzOiBzdHJpbmcgfCBzdHJpbmdbXSk6IENvbW1hbmRCdWlsZGVyIHtcbiAgICBpZiAodGhpcy5hbGlhc2VzID09PSB1bmRlZmluZWQpIHRoaXMuYWxpYXNlcyA9IFtdXG4gICAgaWYgKHR5cGVvZiB0aGlzLmFsaWFzZXMgPT09ICdzdHJpbmcnKSB0aGlzLmFsaWFzZXMgPSBbdGhpcy5hbGlhc2VzXVxuXG4gICAgdGhpcy5hbGlhc2VzID0gW1xuICAgICAgLi4ubmV3IFNldChcbiAgICAgICAgLi4udGhpcy5hbGlhc2VzLFxuICAgICAgICAuLi4odHlwZW9mIGFsaWFzID09PSAnc3RyaW5nJyA/IFthbGlhc10gOiBhbGlhcylcbiAgICAgIClcbiAgICBdXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0RXh0ZW5zaW9uKGV4dGVuc2lvbj86IEV4dGVuc2lvbik6IENvbW1hbmRCdWlsZGVyIHtcbiAgICB0aGlzLmV4dGVuc2lvbiA9IGV4dGVuc2lvblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRVc2FnZSh1c2FnZTogc3RyaW5nIHwgc3RyaW5nW10pOiBDb21tYW5kQnVpbGRlciB7XG4gICAgdGhpcy51c2FnZSA9IHVzYWdlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFkZFVzYWdlKHVzYWdlOiBzdHJpbmcgfCBzdHJpbmdbXSk6IENvbW1hbmRCdWlsZGVyIHtcbiAgICBpZiAodGhpcy51c2FnZSA9PT0gdW5kZWZpbmVkKSB0aGlzLnVzYWdlID0gW11cbiAgICBpZiAodHlwZW9mIHRoaXMudXNhZ2UgPT09ICdzdHJpbmcnKSB0aGlzLnVzYWdlID0gW3RoaXMudXNhZ2VdXG5cbiAgICB0aGlzLmFsaWFzZXMgPSBbXG4gICAgICAuLi5uZXcgU2V0KFxuICAgICAgICAuLi50aGlzLnVzYWdlLFxuICAgICAgICAuLi4odHlwZW9mIHVzYWdlID09PSAnc3RyaW5nJyA/IFt1c2FnZV0gOiB1c2FnZSlcbiAgICAgIClcbiAgICBdXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0RXhhbXBsZShleGFtcGxlczogc3RyaW5nIHwgc3RyaW5nW10pOiBDb21tYW5kQnVpbGRlciB7XG4gICAgdGhpcy5leGFtcGxlcyA9IGV4YW1wbGVzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGFkZEV4YW1wbGUoZXhhbXBsZXM6IHN0cmluZyB8IHN0cmluZ1tdKTogQ29tbWFuZEJ1aWxkZXIge1xuICAgIGlmICh0aGlzLmV4YW1wbGVzID09PSB1bmRlZmluZWQpIHRoaXMuZXhhbXBsZXMgPSBbXVxuICAgIGlmICh0eXBlb2YgdGhpcy5leGFtcGxlcyA9PT0gJ3N0cmluZycpIHRoaXMuZXhhbXBsZXMgPSBbdGhpcy5leGFtcGxlc11cblxuICAgIHRoaXMuZXhhbXBsZXMgPSBbXG4gICAgICAuLi5uZXcgU2V0KFxuICAgICAgICAuLi50aGlzLmV4YW1wbGVzLFxuICAgICAgICAuLi4odHlwZW9mIGV4YW1wbGVzID09PSAnc3RyaW5nJyA/IFtleGFtcGxlc10gOiBleGFtcGxlcylcbiAgICAgIClcbiAgICBdXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0UGVybWlzc2lvbnMocGVybXM/OiBzdHJpbmcgfCBzdHJpbmdbXSk6IENvbW1hbmRCdWlsZGVyIHtcbiAgICB0aGlzLnBlcm1pc3Npb25zID0gcGVybXNcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0VXNlclBlcm1pc3Npb25zKHBlcm1zPzogc3RyaW5nIHwgc3RyaW5nW10pOiBDb21tYW5kQnVpbGRlciB7XG4gICAgdGhpcy51c2VyUGVybWlzc2lvbnMgPSBwZXJtc1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRCb3RQZXJtaXNzaW9ucyhwZXJtcz86IHN0cmluZyB8IHN0cmluZ1tdKTogQ29tbWFuZEJ1aWxkZXIge1xuICAgIHRoaXMuYm90UGVybWlzc2lvbnMgPSBwZXJtc1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRSb2xlcyhyb2xlczogc3RyaW5nIHwgc3RyaW5nW10pOiBDb21tYW5kQnVpbGRlciB7XG4gICAgdGhpcy5yb2xlcyA9IHJvbGVzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFdoaXRlbGlzdGVkR3VpbGRzKGxpc3Q6IHN0cmluZyB8IHN0cmluZ1tdKTogQ29tbWFuZEJ1aWxkZXIge1xuICAgIHRoaXMud2hpdGVsaXN0ZWRHdWlsZHMgPSBsaXN0XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldFdoaXRlbGlzdGVkVXNlcnMobGlzdDogc3RyaW5nIHwgc3RyaW5nW10pOiBDb21tYW5kQnVpbGRlciB7XG4gICAgdGhpcy53aGl0ZWxpc3RlZFVzZXJzID0gbGlzdFxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRXaGl0ZWxpc3RlZENoYW5uZWxzKGxpc3Q6IHN0cmluZyB8IHN0cmluZ1tdKTogQ29tbWFuZEJ1aWxkZXIge1xuICAgIHRoaXMud2hpdGVsaXN0ZWRDaGFubmVscyA9IGxpc3RcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc2V0R3VpbGRPbmx5KHZhbHVlOiBib29sZWFuID0gdHJ1ZSk6IENvbW1hbmRCdWlsZGVyIHtcbiAgICB0aGlzLmd1aWxkT25seSA9IHZhbHVlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldE5TRlcodmFsdWU6IGJvb2xlYW4gPSB0cnVlKTogQ29tbWFuZEJ1aWxkZXIge1xuICAgIHRoaXMubnNmdyA9IHZhbHVlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHNldE93bmVyT25seSh2YWx1ZTogYm9vbGVhbiA9IHRydWUpOiBDb21tYW5kQnVpbGRlciB7XG4gICAgdGhpcy5vd25lck9ubHkgPSB2YWx1ZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBvbkJlZm9yZUV4ZWN1dGU8VCBleHRlbmRzIENvbW1hbmRDb250ZXh0ID0gQ29tbWFuZENvbnRleHQ+KFxuICAgIGZuOiAoY3R4OiBUKSA9PiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPiB8IHVua25vd24gfCBQcm9taXNlPHVua25vd24+XG4gICk6IENvbW1hbmRCdWlsZGVyIHtcbiAgICB0aGlzLmJlZm9yZUV4ZWN1dGUgPSBmblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBvbkV4ZWN1dGU8VCBleHRlbmRzIENvbW1hbmRDb250ZXh0ID0gQ29tbWFuZENvbnRleHQ+KFxuICAgIGZuOiAoY3R4OiBUKSA9PiB1bmtub3duIHwgUHJvbWlzZTx1bmtub3duPlxuICApOiBDb21tYW5kQnVpbGRlciB7XG4gICAgdGhpcy5leGVjdXRlID0gZm5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgb25BZnRlckV4ZWN1dGU8VCBleHRlbmRzIENvbW1hbmRDb250ZXh0ID0gQ29tbWFuZENvbnRleHQ+KFxuICAgIGZuOiA8VDI+KGN0eDogVCwgZXhlY3V0ZVJlc3VsdD86IFQyKSA9PiB1bmtub3duIHwgUHJvbWlzZTx1bmtub3duPlxuICApOiBDb21tYW5kQnVpbGRlciB7XG4gICAgdGhpcy5hZnRlckV4ZWN1dGUgPSBmblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZXRTdWJDb21tYW5kcyhzdWJDb21tYW5kczogQ29tbWFuZFtdKTogdGhpcyB7XG4gICAgdGhpcy5zdWJDb21tYW5kcyA9IHN1YkNvbW1hbmRzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN1YkNvbW1hbmQoY29tbWFuZDogQ29tbWFuZCk6IHRoaXMge1xuICAgIGlmICh0aGlzLnN1YkNvbW1hbmRzID09PSB1bmRlZmluZWQpIHRoaXMuc3ViQ29tbWFuZHMgPSBbXVxuICAgIHRoaXMuc3ViQ29tbWFuZHMucHVzaChjb21tYW5kKVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbW1hbmRzTG9hZGVyIHtcbiAgY2xpZW50OiBDb21tYW5kQ2xpZW50XG4gICNpbXBvcnRTZXE6IHsgW25hbWU6IHN0cmluZ106IG51bWJlciB9ID0ge31cblxuICBjb25zdHJ1Y3RvcihjbGllbnQ6IENvbW1hbmRDbGllbnQpIHtcbiAgICB0aGlzLmNsaWVudCA9IGNsaWVudFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgYSBDb21tYW5kIGZyb20gZmlsZS5cbiAgICpcbiAgICogTk9URTogUmVsYXRpdmUgcGF0aHMgcmVzb2x2ZSBmcm9tIGN3ZFxuICAgKlxuICAgKiBAcGFyYW0gZmlsZVBhdGggUGF0aCBvZiBDb21tYW5kIGZpbGUuXG4gICAqIEBwYXJhbSBleHBvcnROYW1lIEV4cG9ydCBuYW1lLiBEZWZhdWx0IGlzIHRoZSBcImRlZmF1bHRcIiBleHBvcnQuXG4gICAqL1xuICBhc3luYyBsb2FkKFxuICAgIGZpbGVQYXRoOiBzdHJpbmcsXG4gICAgZXhwb3J0TmFtZTogc3RyaW5nID0gJ2RlZmF1bHQnLFxuICAgIG9ubHlSZWFkPzogYm9vbGVhblxuICApOiBQcm9taXNlPENvbW1hbmQ+IHtcbiAgICBjb25zdCBzdGF0ID0gYXdhaXQgRGVuby5zdGF0KGZpbGVQYXRoKS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpXG4gICAgaWYgKHN0YXQgPT09IHVuZGVmaW5lZCB8fCBzdGF0LmlzRmlsZSAhPT0gdHJ1ZSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmlsZSBub3QgZm91bmQgb24gcGF0aCAke2ZpbGVQYXRofWApXG5cbiAgICBsZXQgc2VxOiBudW1iZXIgfCB1bmRlZmluZWRcblxuICAgIGlmICh0aGlzLiNpbXBvcnRTZXFbZmlsZVBhdGhdICE9PSB1bmRlZmluZWQpIHNlcSA9IHRoaXMuI2ltcG9ydFNlcVtmaWxlUGF0aF1cbiAgICBjb25zdCBtb2QgPSBhd2FpdCBpbXBvcnQoXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXBsdXMtb3BlcmFuZHNcbiAgICAgICdmaWxlOi8vLycgK1xuICAgICAgICBqb2luKERlbm8uY3dkKCksIGZpbGVQYXRoKSArXG4gICAgICAgIChzZXEgPT09IHVuZGVmaW5lZCA/ICcnIDogYCMke3NlcX1gKVxuICAgIClcbiAgICBpZiAodGhpcy4jaW1wb3J0U2VxW2ZpbGVQYXRoXSA9PT0gdW5kZWZpbmVkKSB0aGlzLiNpbXBvcnRTZXFbZmlsZVBhdGhdID0gMFxuICAgIGVsc2UgdGhpcy4jaW1wb3J0U2VxW2ZpbGVQYXRoXSsrXG5cbiAgICBjb25zdCBDbWQgPSBtb2RbZXhwb3J0TmFtZV1cbiAgICBpZiAoQ21kID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENvbW1hbmQgbm90IGV4cG9ydGVkIGFzICR7ZXhwb3J0TmFtZX0gZnJvbSAke2ZpbGVQYXRofWApXG5cbiAgICBsZXQgY21kOiBDb21tYW5kXG4gICAgdHJ5IHtcbiAgICAgIGlmIChDbWQgaW5zdGFuY2VvZiBDb21tYW5kKSBjbWQgPSBDbWRcbiAgICAgIGVsc2UgY21kID0gbmV3IENtZCgpXG4gICAgICBpZiAoIShjbWQgaW5zdGFuY2VvZiBDb21tYW5kKSkgdGhyb3cgbmV3IEVycm9yKCdmYWlsZWQnKVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGxvYWQgQ29tbWFuZCBmcm9tICR7ZmlsZVBhdGh9YClcbiAgICB9XG5cbiAgICBpZiAob25seVJlYWQgIT09IHRydWUpIHRoaXMuY2xpZW50LmNvbW1hbmRzLmFkZChjbWQpXG4gICAgcmV0dXJuIGNtZFxuICB9XG5cbiAgLyoqXG4gICAqIExvYWQgY29tbWFuZHMgZnJvbSBhIERpcmVjdG9yeS5cbiAgICpcbiAgICogTk9URTogUmVsYXRpdmUgcGF0aHMgcmVzb2x2ZSBmcm9tIGN3ZFxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBQYXRoIG9mIHRoZSBkaXJlY3RvcnkuXG4gICAqIEBwYXJhbSBvcHRpb25zIE9wdGlvbnMgdG8gY29uZmlndXJlIGxvYWRpbmcuXG4gICAqL1xuICBhc3luYyBsb2FkRGlyZWN0b3J5KFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBvcHRpb25zPzoge1xuICAgICAgcmVjdXJzaXZlPzogYm9vbGVhblxuICAgICAgZXhwb3J0TmFtZT86IHN0cmluZ1xuICAgICAgbWF4RGVwdGg/OiBudW1iZXJcbiAgICAgIGV4dHM/OiBzdHJpbmdbXVxuICAgICAgb25seVJlYWQ/OiBib29sZWFuXG4gICAgfVxuICApOiBQcm9taXNlPENvbW1hbmRbXT4ge1xuICAgIGNvbnN0IGNvbW1hbmRzOiBDb21tYW5kW10gPSBbXVxuXG4gICAgZm9yIGF3YWl0IChjb25zdCBlbnRyeSBvZiB3YWxrKHBhdGgsIHtcbiAgICAgIG1heERlcHRoOiBvcHRpb25zPy5tYXhEZXB0aCxcbiAgICAgIGV4dHM6IG9wdGlvbnM/LmV4dHMsXG4gICAgICBpbmNsdWRlRGlyczogZmFsc2VcbiAgICB9KSkge1xuICAgICAgaWYgKGVudHJ5LmlzRmlsZSAhPT0gdHJ1ZSkgY29udGludWVcbiAgICAgIGNvbnN0IGNtZCA9IGF3YWl0IHRoaXMubG9hZChcbiAgICAgICAgZW50cnkucGF0aCxcbiAgICAgICAgb3B0aW9ucz8uZXhwb3J0TmFtZSxcbiAgICAgICAgb3B0aW9ucz8ub25seVJlYWRcbiAgICAgIClcbiAgICAgIGNvbW1hbmRzLnB1c2goY21kKVxuICAgIH1cblxuICAgIHJldHVybiBjb21tYW5kc1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBDb21tYW5kc01hbmFnZXIge1xuICBjbGllbnQ6IENvbW1hbmRDbGllbnRcbiAgbGlzdDogQ29sbGVjdGlvbjxzdHJpbmcsIENvbW1hbmQ+ID0gbmV3IENvbGxlY3Rpb24oKVxuICBkaXNhYmxlZDogU2V0PHN0cmluZz4gPSBuZXcgU2V0KClcbiAgbG9hZGVyOiBDb21tYW5kc0xvYWRlclxuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ29tbWFuZENsaWVudCkge1xuICAgIHRoaXMuY2xpZW50ID0gY2xpZW50XG4gICAgdGhpcy5sb2FkZXIgPSBuZXcgQ29tbWFuZHNMb2FkZXIoY2xpZW50KVxuICB9XG5cbiAgLyoqIE51bWJlciBvZiBsb2FkZWQgQ29tbWFuZHMgKi9cbiAgZ2V0IGNvdW50KCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMubGlzdC5zaXplXG4gIH1cblxuICAvKiogRmlsdGVyIG91dCBDb21tYW5kcyBieSBuYW1lL2FsaWFzICovXG4gIGZpbHRlcihzZWFyY2g6IHN0cmluZywgc3ViUHJlZml4Pzogc3RyaW5nKTogQ29sbGVjdGlvbjxzdHJpbmcsIENvbW1hbmQ+IHtcbiAgICBpZiAodGhpcy5jbGllbnQuY2FzZVNlbnNpdGl2ZSA9PT0gZmFsc2UpIHNlYXJjaCA9IHNlYXJjaC50b0xvd2VyQ2FzZSgpXG4gICAgcmV0dXJuIHRoaXMubGlzdC5maWx0ZXIoKGNtZDogQ29tbWFuZCk6IGJvb2xlYW4gPT4ge1xuICAgICAgaWYgKHN1YlByZWZpeCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLmNsaWVudC5jYXNlU2Vuc2l0aXZlID09PSB0cnVlXG4gICAgICAgICAgICA/IHN1YlByZWZpeCAhPT0gY21kLmV4dGVuc2lvbj8uc3ViUHJlZml4XG4gICAgICAgICAgICA6IHN1YlByZWZpeC50b0xvd2VyQ2FzZSgpICE9PVxuICAgICAgICAgICAgICBjbWQuZXh0ZW5zaW9uPy5zdWJQcmVmaXg/LnRvTG93ZXJDYXNlKClcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgIHN1YlByZWZpeCA9PT0gdW5kZWZpbmVkICYmXG4gICAgICAgIGNtZC5leHRlbnNpb24/LnN1YlByZWZpeCAhPT0gdW5kZWZpbmVkXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG5hbWUgPVxuICAgICAgICB0aGlzLmNsaWVudC5jYXNlU2Vuc2l0aXZlID09PSB0cnVlID8gY21kLm5hbWUgOiBjbWQubmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICBpZiAobmFtZSA9PT0gc2VhcmNoKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9IGVsc2UgaWYgKGNtZC5hbGlhc2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgbGV0IGFsaWFzZXM6IHN0cmluZ1tdXG4gICAgICAgIGlmICh0eXBlb2YgY21kLmFsaWFzZXMgPT09ICdzdHJpbmcnKSBhbGlhc2VzID0gW2NtZC5hbGlhc2VzXVxuICAgICAgICBlbHNlIGFsaWFzZXMgPSBjbWQuYWxpYXNlc1xuICAgICAgICBpZiAodGhpcy5jbGllbnQuY2FzZVNlbnNpdGl2ZSA9PT0gZmFsc2UpXG4gICAgICAgICAgYWxpYXNlcyA9IGFsaWFzZXMubWFwKChlKSA9PiBlLnRvTG93ZXJDYXNlKCkpXG5cbiAgICAgICAgcmV0dXJuIGFsaWFzZXMuaW5jbHVkZXMoc2VhcmNoKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIC8qKiBGaW5kIGEgQ29tbWFuZCBieSBuYW1lL2FsaWFzICovXG4gIGZpbmQoc2VhcmNoOiBzdHJpbmcsIHN1YlByZWZpeD86IHN0cmluZyk6IENvbW1hbmQgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGZpbHRlcmVkID0gdGhpcy5maWx0ZXIoc2VhcmNoLCBzdWJQcmVmaXgpXG4gICAgcmV0dXJuIGZpbHRlcmVkLmZpcnN0KClcbiAgfVxuXG4gIC8qKiBGZXRjaCBhIENvbW1hbmQgaW5jbHVkaW5nIGRpc2FibGUgY2hlY2tzLCBzdWIgY29tbWFuZHMgYW5kIHN1YlByZWZpeCBpbXBsZW1lbnRhdGlvbiAqL1xuICBmZXRjaChwYXJzZWQ6IFBhcnNlZENvbW1hbmQsIGJ5cGFzc0Rpc2FibGU/OiBib29sZWFuKTogQ29tbWFuZCB8IHVuZGVmaW5lZCB7XG4gICAgbGV0IGNtZCA9IHRoaXMuZmluZChwYXJzZWQubmFtZSlcbiAgICBpZiAoY21kPy5leHRlbnNpb24/LnN1YlByZWZpeCAhPT0gdW5kZWZpbmVkKSBjbWQgPSB1bmRlZmluZWRcblxuICAgIGlmIChjbWQgPT09IHVuZGVmaW5lZCAmJiBwYXJzZWQuYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICBjbWQgPSB0aGlzLmZpbmQocGFyc2VkLmFyZ3NbMF0sIHBhcnNlZC5uYW1lKVxuICAgICAgaWYgKGNtZCA9PT0gdW5kZWZpbmVkIHx8IGNtZC5leHRlbnNpb24/LnN1YlByZWZpeCA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5jbGllbnQuY2FzZVNlbnNpdGl2ZSA9PT0gdHJ1ZVxuICAgICAgICAgID8gY21kLmV4dGVuc2lvbi5zdWJQcmVmaXggIT09IHBhcnNlZC5uYW1lXG4gICAgICAgICAgOiBjbWQuZXh0ZW5zaW9uLnN1YlByZWZpeC50b0xvd2VyQ2FzZSgpICE9PSBwYXJzZWQubmFtZS50b0xvd2VyQ2FzZSgpXG4gICAgICApXG4gICAgICAgIHJldHVyblxuXG4gICAgICBjb25zdCBzaGlmdGVkID0gcGFyc2VkLmFyZ3Muc2hpZnQoKVxuICAgICAgaWYgKHNoaWZ0ZWQgIT09IHVuZGVmaW5lZClcbiAgICAgICAgcGFyc2VkLmFyZ1N0cmluZyA9IHBhcnNlZC5hcmdTdHJpbmcuc2xpY2Uoc2hpZnRlZC5sZW5ndGgpLnRyaW0oKVxuICAgIH1cblxuICAgIGlmIChjbWQgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgaWYgKHRoaXMuaXNEaXNhYmxlZChjbWQpICYmIGJ5cGFzc0Rpc2FibGUgIT09IHRydWUpIHJldHVyblxuXG4gICAgaWYgKHBhcnNlZC5hcmdzLmxlbmd0aCAhPT0gMCAmJiBjbWQuc3ViQ29tbWFuZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgcmVzb2x2ZVN1YkNvbW1hbmQgPSAoY29tbWFuZDogQ29tbWFuZCA9IGNtZCEpOiBDb21tYW5kID0+IHtcbiAgICAgICAgbGV0IG5hbWUgPSBwYXJzZWQuYXJnc1swXVxuICAgICAgICBpZiAobmFtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gY29tbWFuZFxuICAgICAgICBpZiAodGhpcy5jbGllbnQuY2FzZVNlbnNpdGl2ZSAhPT0gdHJ1ZSkgbmFtZSA9IG5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICBjb25zdCBzdWIgPSBjb21tYW5kXG4gICAgICAgICAgPy5nZXRTdWJDb21tYW5kcygpXG4gICAgICAgICAgLmZpbmQoXG4gICAgICAgICAgICAoZSkgPT5cbiAgICAgICAgICAgICAgKHRoaXMuY2xpZW50LmNhc2VTZW5zaXRpdmUgPT09IHRydWVcbiAgICAgICAgICAgICAgICA/IGUubmFtZVxuICAgICAgICAgICAgICAgIDogZS5uYW1lLnRvTG93ZXJDYXNlKCkpID09PSBuYW1lIHx8XG4gICAgICAgICAgICAgICh0eXBlb2YgZS5hbGlhc2VzID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgID8gW2UuYWxpYXNlc11cbiAgICAgICAgICAgICAgICA6IGUuYWxpYXNlcyA/PyBbXVxuICAgICAgICAgICAgICApLnNvbWUoXG4gICAgICAgICAgICAgICAgKGUpID0+XG4gICAgICAgICAgICAgICAgICAodGhpcy5jbGllbnQuY2FzZVNlbnNpdGl2ZSA9PT0gdHJ1ZSA/IGUgOiBlLnRvTG93ZXJDYXNlKCkpID09PVxuICAgICAgICAgICAgICAgICAgbmFtZVxuICAgICAgICAgICAgICApXG4gICAgICAgICAgKVxuICAgICAgICBpZiAoc3ViICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBjb25zdCBzaGlmdGVkID0gcGFyc2VkLmFyZ3Muc2hpZnQoKVxuICAgICAgICAgIGlmIChzaGlmdGVkICE9PSB1bmRlZmluZWQpXG4gICAgICAgICAgICBwYXJzZWQuYXJnU3RyaW5nID0gcGFyc2VkLmFyZ1N0cmluZy5zbGljZShzaGlmdGVkLmxlbmd0aCkudHJpbSgpXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmVTdWJDb21tYW5kKHN1YilcbiAgICAgICAgfSBlbHNlIHJldHVybiBjb21tYW5kXG4gICAgICB9XG5cbiAgICAgIGNtZCA9IHJlc29sdmVTdWJDb21tYW5kKClcbiAgICB9XG5cbiAgICByZXR1cm4gY21kXG4gIH1cblxuICAvKiogQ2hlY2sgd2hldGhlciBhIENvbW1hbmQgZXhpc3RzIG9yIG5vdCAqL1xuICBleGlzdHMoc2VhcmNoOiBDb21tYW5kIHwgc3RyaW5nLCBzdWJQcmVmaXg/OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBsZXQgZXhpc3RzID0gZmFsc2VcblxuICAgIGlmICh0eXBlb2Ygc2VhcmNoID09PSAnc3RyaW5nJylcbiAgICAgIHJldHVybiB0aGlzLmZpbmQoc2VhcmNoLCBzdWJQcmVmaXgpICE9PSB1bmRlZmluZWRcbiAgICBlbHNlIHtcbiAgICAgIGV4aXN0cyA9XG4gICAgICAgIHRoaXMuZmluZChcbiAgICAgICAgICBzZWFyY2gubmFtZSxcbiAgICAgICAgICBzdWJQcmVmaXggPT09IHVuZGVmaW5lZCA/IHNlYXJjaC5leHRlbnNpb24/LnN1YlByZWZpeCA6IHN1YlByZWZpeFxuICAgICAgICApICE9PSB1bmRlZmluZWRcblxuICAgICAgaWYgKHNlYXJjaC5hbGlhc2VzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgY29uc3QgYWxpYXNlczogc3RyaW5nW10gPVxuICAgICAgICAgIHR5cGVvZiBzZWFyY2guYWxpYXNlcyA9PT0gJ3N0cmluZycgPyBbc2VhcmNoLmFsaWFzZXNdIDogc2VhcmNoLmFsaWFzZXNcbiAgICAgICAgZXhpc3RzID1cbiAgICAgICAgICBhbGlhc2VzXG4gICAgICAgICAgICAubWFwKChhbGlhcykgPT4gdGhpcy5maW5kKGFsaWFzKSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgLmZpbmQoKGUpID0+IGUpID8/IGZhbHNlXG4gICAgICB9XG5cbiAgICAgIHJldHVybiBleGlzdHNcbiAgICB9XG4gIH1cblxuICAvKiogQWRkIGEgQ29tbWFuZCAqL1xuICBhZGQoY21kOiBDb21tYW5kIHwgdHlwZW9mIENvbW1hbmQpOiBib29sZWFuIHtcbiAgICBsZXQgQ21kQ2xhc3M6IHR5cGVvZiBDb21tYW5kIHwgdW5kZWZpbmVkXG4gICAgaWYgKCEoY21kIGluc3RhbmNlb2YgQ29tbWFuZCkpIHtcbiAgICAgIENtZENsYXNzID0gY21kXG4gICAgICBjbWQgPSBuZXcgQ21kQ2xhc3MoKVxuICAgICAgT2JqZWN0LmFzc2lnbihjbWQsIENtZENsYXNzLm1ldGEgPz8ge30pXG4gICAgfVxuICAgIGlmICh0aGlzLmV4aXN0cyhjbWQsIGNtZC5leHRlbnNpb24/LnN1YlByZWZpeCkpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgIGBGYWlsZWQgdG8gYWRkIENvbW1hbmQgJyR7Y21kLnRvU3RyaW5nKCl9JyB3aXRoIG5hbWUvYWxpYXMgYWxyZWFkeSBleGlzdHMuYFxuICAgICAgKVxuICAgIGlmIChjbWQubmFtZSA9PT0gJycgJiYgQ21kQ2xhc3MgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbGV0IG5hbWUgPSBDbWRDbGFzcy5uYW1lXG4gICAgICBpZiAoXG4gICAgICAgIG5hbWUudG9Mb3dlckNhc2UoKS5lbmRzV2l0aCgnY29tbWFuZCcpICYmXG4gICAgICAgIG5hbWUudG9Mb3dlckNhc2UoKSAhPT0gJ2NvbW1hbmQnXG4gICAgICApXG4gICAgICAgIG5hbWUgPSBuYW1lLnN1YnN0cigwLCBuYW1lLmxlbmd0aCAtICdjb21tYW5kJy5sZW5ndGgpLnRyaW0oKVxuICAgICAgY21kLm5hbWUgPSBuYW1lXG4gICAgfVxuICAgIGlmIChjbWQubmFtZSA9PT0gJycpIHRocm93IG5ldyBFcnJvcignQ29tbWFuZCBoYXMgbm8gbmFtZScpXG4gICAgdGhpcy5saXN0LnNldChcbiAgICAgIGAke2NtZC5uYW1lfS0ke1xuICAgICAgICB0aGlzLmxpc3QuZmlsdGVyKChlKSA9PlxuICAgICAgICAgIHRoaXMuY2xpZW50LmNhc2VTZW5zaXRpdmUgPT09IHRydWVcbiAgICAgICAgICAgID8gZS5uYW1lID09PSBjbWQubmFtZVxuICAgICAgICAgICAgOiBlLm5hbWUudG9Mb3dlckNhc2UoKSA9PT0gY21kLm5hbWUudG9Mb3dlckNhc2UoKVxuICAgICAgICApLnNpemVcbiAgICAgIH1gLFxuICAgICAgY21kXG4gICAgKVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvKiogRGVsZXRlIGEgQ29tbWFuZCAqL1xuICBkZWxldGUoY21kOiBzdHJpbmcgfCBDb21tYW5kKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgc2VhcmNoID0gdGhpcy5maWx0ZXIodHlwZW9mIGNtZCA9PT0gJ3N0cmluZycgPyBjbWQgOiBjbWQubmFtZSlcbiAgICBpZiAoc2VhcmNoLnNpemUgPT09IDApIHJldHVybiBmYWxzZVxuICAgIGVsc2UgcmV0dXJuIHRoaXMubGlzdC5kZWxldGUoWy4uLnNlYXJjaC5rZXlzKCldWzBdKVxuICB9XG5cbiAgLyoqIENoZWNrIHdoZXRoZXIgYSBDb21tYW5kIGlzIGRpc2FibGVkIG9yIG5vdCAqL1xuICBpc0Rpc2FibGVkKG5hbWU6IHN0cmluZyB8IENvbW1hbmQpOiBib29sZWFuIHtcbiAgICBjb25zdCBjbWQgPSB0eXBlb2YgbmFtZSA9PT0gJ3N0cmluZycgPyB0aGlzLmZpbmQobmFtZSkgOiBuYW1lXG4gICAgaWYgKGNtZCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2VcbiAgICBjb25zdCBleGlzdHMgPSB0aGlzLmV4aXN0cyhuYW1lKVxuICAgIGlmICghZXhpc3RzKSByZXR1cm4gZmFsc2VcbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZC5oYXMoY21kLm5hbWUpXG4gIH1cblxuICAvKiogRGlzYWJsZSBhIENvbW1hbmQgKi9cbiAgZGlzYWJsZShuYW1lOiBzdHJpbmcgfCBDb21tYW5kKTogYm9vbGVhbiB7XG4gICAgY29uc3QgY21kID0gdHlwZW9mIG5hbWUgPT09ICdzdHJpbmcnID8gdGhpcy5maW5kKG5hbWUpIDogbmFtZVxuICAgIGlmIChjbWQgPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlXG4gICAgaWYgKHRoaXMuaXNEaXNhYmxlZChjbWQpKSByZXR1cm4gZmFsc2VcbiAgICB0aGlzLmRpc2FibGVkLmFkZChjbWQubmFtZSlcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyoqIEdldCBhbGwgY29tbWFuZHMgb2YgYSBDYXRlZ29yeSAqL1xuICBjYXRlZ29yeShjYXRlZ29yeTogc3RyaW5nKTogQ29sbGVjdGlvbjxzdHJpbmcsIENvbW1hbmQ+IHtcbiAgICByZXR1cm4gdGhpcy5saXN0LmZpbHRlcihcbiAgICAgIChjbWQpID0+IGNtZC5jYXRlZ29yeSAhPT0gdW5kZWZpbmVkICYmIGNtZC5jYXRlZ29yeSA9PT0gY2F0ZWdvcnlcbiAgICApXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIENhdGVnb3JpZXNNYW5hZ2VyIHtcbiAgY2xpZW50OiBDb21tYW5kQ2xpZW50XG4gIGxpc3Q6IENvbGxlY3Rpb248c3RyaW5nLCBDb21tYW5kQ2F0ZWdvcnk+ID0gbmV3IENvbGxlY3Rpb24oKVxuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ29tbWFuZENsaWVudCkge1xuICAgIHRoaXMuY2xpZW50ID0gY2xpZW50XG4gIH1cblxuICAvKiogR2V0IGEgQ29sbGVjdGlvbiBvZiBDYXRlZ29yaWVzICovXG4gIGFsbCgpOiBDb2xsZWN0aW9uPHN0cmluZywgQ29tbWFuZENhdGVnb3J5PiB7XG4gICAgcmV0dXJuIHRoaXMubGlzdFxuICB9XG5cbiAgLyoqIEdldCBhIGxpc3Qgb2YgbmFtZXMgb2YgQ2F0ZWdvcmllcyBhZGRlZCAqL1xuICBuYW1lcygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIFsuLi50aGlzLmxpc3Qua2V5cygpXVxuICB9XG5cbiAgLyoqIENoZWNrIGlmIGEgQ2F0ZWdvcnkgZXhpc3RzIG9yIG5vdCAqL1xuICBoYXMoY2F0ZWdvcnk6IHN0cmluZyB8IENvbW1hbmRDYXRlZ29yeSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmxpc3QuaGFzKFxuICAgICAgdHlwZW9mIGNhdGVnb3J5ID09PSAnc3RyaW5nJyA/IGNhdGVnb3J5IDogY2F0ZWdvcnkubmFtZVxuICAgIClcbiAgfVxuXG4gIC8qKiBHZXQgYSBDYXRlZ29yeSBieSBuYW1lICovXG4gIGdldChuYW1lOiBzdHJpbmcpOiBDb21tYW5kQ2F0ZWdvcnkgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmxpc3QuZ2V0KG5hbWUpXG4gIH1cblxuICAvKiogQWRkIGEgQ2F0ZWdvcnkgdG8gdGhlIE1hbmFnZXIgKi9cbiAgYWRkKGNhdGVnb3J5OiBDb21tYW5kQ2F0ZWdvcnkpOiBDYXRlZ29yaWVzTWFuYWdlciB7XG4gICAgaWYgKHRoaXMuaGFzKGNhdGVnb3J5KSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2F0ZWdvcnkgJHtjYXRlZ29yeS5uYW1lfSBhbHJlYWR5IGV4aXN0c2ApXG4gICAgdGhpcy5saXN0LnNldChjYXRlZ29yeS5uYW1lLCBjYXRlZ29yeSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIFJlbW92ZSBhIENhdGVnb3J5IGZyb20gdGhlIE1hbmFnZXIgKi9cbiAgcmVtb3ZlKGNhdGVnb3J5OiBzdHJpbmcgfCBDb21tYW5kQ2F0ZWdvcnkpOiBib29sZWFuIHtcbiAgICBpZiAoIXRoaXMuaGFzKGNhdGVnb3J5KSkgcmV0dXJuIGZhbHNlXG4gICAgdGhpcy5saXN0LmRlbGV0ZSh0eXBlb2YgY2F0ZWdvcnkgPT09ICdzdHJpbmcnID8gY2F0ZWdvcnkgOiBjYXRlZ29yeS5uYW1lKVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn1cblxuLyoqIFBhcnNlZCBDb21tYW5kIG9iamVjdCAqL1xuZXhwb3J0IGludGVyZmFjZSBQYXJzZWRDb21tYW5kIHtcbiAgbmFtZTogc3RyaW5nXG4gIGFyZ3M6IHN0cmluZ1tdXG4gIGFyZ1N0cmluZzogc3RyaW5nXG59XG5cbi8qKiBQYXJzZXMgYSBDb21tYW5kIHRvIGxhdGVyIGxvb2sgZm9yLiAqL1xuZXhwb3J0IGNvbnN0IHBhcnNlQ29tbWFuZCA9IChcbiAgY2xpZW50OiBDb21tYW5kQ2xpZW50LFxuICBtc2c6IE1lc3NhZ2UsXG4gIHByZWZpeDogc3RyaW5nXG4pOiBQYXJzZWRDb21tYW5kIHwgdW5kZWZpbmVkID0+IHtcbiAgbGV0IGNvbnRlbnQgPSBtc2cuY29udGVudC5zbGljZShwcmVmaXgubGVuZ3RoKVxuICBpZiAoY2xpZW50LnNwYWNlc0FmdGVyUHJlZml4ID09PSB0cnVlKSBjb250ZW50ID0gY29udGVudC50cmltKClcbiAgY29uc3QgYXJncyA9IGNvbnRlbnQuc3BsaXQoL1xccy8pXG5cbiAgY29uc3QgbmFtZSA9IGFyZ3Muc2hpZnQoKVxuICBpZiAobmFtZSA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgY29uc3QgYXJnU3RyaW5nID0gY29udGVudC5zbGljZShuYW1lLmxlbmd0aCkudHJpbSgpXG5cbiAgcmV0dXJuIHtcbiAgICBuYW1lLFxuICAgIGFyZ3MsXG4gICAgYXJnU3RyaW5nXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxvQ0FBb0MsR0FDcEMsQUFJQSxTQUFTLFVBQVUsUUFBUSx5QkFBd0I7QUFHbkQsU0FBUyxJQUFJLEVBQUUsSUFBSSxRQUFRLGdCQUFlO0FBNEUxQyxPQUFPLE1BQU07SUFDWCxPQUFPLEtBQXFCO0lBRTVCLE9BQWUsR0FBRTtJQUNqQixZQUFvQjtJQUNwQixTQUFpQjtJQUNqQixRQUEyQjtJQUMzQixVQUFxQjtJQUNyQixNQUF5QjtJQUN6QixTQUE0QjtJQUM1QixhQUFzQjtJQUN0QixLQUFhO0lBQ2IsWUFBK0I7SUFDL0IsZ0JBQW1DO0lBQ25DLGVBQWtDO0lBQ2xDLE1BQXlCO0lBQ3pCLGtCQUFxQztJQUNyQyxvQkFBdUM7SUFDdkMsaUJBQW9DO0lBQ3BDLEtBQWM7SUFDZCxVQUFtQjtJQUNuQixPQUFnQjtJQUNoQixVQUFtQjtJQUNuQixZQUF1QjtJQUN2QixtQkFBbUIsR0FDbkIsU0FBaUI7SUFDakIsa0NBQWtDLEdBQ2xDLGVBQXVCO0lBSXZCLDBDQUEwQyxHQUMxQyxRQUFRLEdBQW1CLEVBQUUsS0FBWSxFQUE4QjtRQUNyRTtJQUNGO0lBRUEsbURBQW1ELEdBQ25ELGNBQWMsR0FBbUIsRUFBOEI7UUFDN0Q7SUFDRjtJQUVBLGdIQUFnSCxHQUNoSCxjQUNFLEdBQW1CLEVBQ3NDO1FBQ3pELE9BQU8sSUFBSTtJQUNiO0lBRUEsd0VB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