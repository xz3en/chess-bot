import { ApplicationCommandType, ApplicationCommandOptionType, ApplicationCommandPermissionType } from '../types/applicationCommand.ts';
import { ChannelTypes } from '../types/channel.ts';
import { Collection } from '../utils/collection.ts';
export class ApplicationCommand {
    slash;
    id;
    applicationID;
    name;
    type;
    description;
    defaultPermission = true;
    options;
    guild;
    guildID;
    constructor(manager, data, guild){
        this.slash = manager;
        this.id = data.id;
        this.applicationID = data.application_id;
        this.name = data.name;
        this.type = data.type ?? ApplicationCommandType.CHAT_INPUT;
        this.description = data.description;
        this.options = data.options ?? [];
        this.guild = guild;
        this.defaultPermission = data.default_permission;
    }
    async delete() {
        await this.slash.delete(this.id, this.guildID);
    }
    async edit(data) {
        await this.slash.edit(this.id, data, this.guildID);
    }
    async setPermissions(data, guild) {
        const guildID = this.guildID ?? (typeof guild === 'string' ? guild : typeof guild === 'object' ? guild.id : undefined);
        if (guildID === undefined) throw new Error('Expected Slash Command to be a Guild one');
        return await this.slash.permissions.set(this.id, data, guildID);
    }
    async getPermissions(guild) {
        const guildID = this.guildID ?? (typeof guild === 'string' ? guild : typeof guild === 'object' ? guild.id : undefined);
        if (guildID === undefined) throw new Error('Expected Slash Command to be a Guild one');
        return await this.slash.permissions.get(this.id, guildID);
    }
    /** Create a handler for this Slash Command */ handle(func, options) {
        this.slash.slash.handle({
            name: this.name,
            parent: options?.parent,
            group: options?.group,
            guild: this.guildID,
            handler: func
        });
        return this;
    }
}
function createSlashOption(type, data) {
    return {
        name: data.name,
        type,
        description: data.description ?? 'No description.',
        options: data.options?.map((e)=>typeof e === 'function' ? e(SlashOption) : e),
        choices: data.choices === undefined ? undefined : data.choices.map((e)=>typeof e === 'string' ? {
                name: e,
                value: e
            } : e)
    };
}
export { ApplicationCommand as SlashCommand };
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class SlashOption {
    static string(data) {
        return createSlashOption(ApplicationCommandOptionType.STRING, data);
    }
    static bool(data) {
        return createSlashOption(ApplicationCommandOptionType.BOOLEAN, data);
    }
    static subCommand(data) {
        return createSlashOption(ApplicationCommandOptionType.SUB_COMMAND, data);
    }
    static subCommandGroup(data) {
        return createSlashOption(ApplicationCommandOptionType.SUB_COMMAND_GROUP, data);
    }
    static role(data) {
        return createSlashOption(ApplicationCommandOptionType.ROLE, data);
    }
    static channel(data) {
        return createSlashOption(ApplicationCommandOptionType.CHANNEL, data);
    }
    static user(data) {
        return createSlashOption(ApplicationCommandOptionType.USER, data);
    }
    static number(data) {
        return createSlashOption(ApplicationCommandOptionType.INTEGER, data);
    }
    static mentionable(data) {
        return createSlashOption(ApplicationCommandOptionType.MENTIONABLE, data);
    }
}
function buildOptionsArray(options) {
    return Array.isArray(options) ? options.map((op)=>typeof op === 'function' ? op(SlashOption) : op) : Object.entries(options).map((entry)=>typeof entry[1] === 'function' ? entry[1](SlashOption) : Object.assign(entry[1], {
            name: entry[0]
        }));
}
/** Slash Command Builder */ export class SlashBuilder {
    data;
    constructor(name, description, options){
        this.data = {
            name: name ?? '',
            description: description ?? 'No description.',
            options: options === undefined ? [] : buildOptionsArray(options)
        };
    }
    name(name) {
        this.data.name = name;
        return this;
    }
    description(desc) {
        this.data.description = desc;
        return this;
    }
    option(option) {
        if (this.data.options === undefined) this.data.options = [];
        this.data.options.push(typeof option === 'function' ? option(SlashOption) : option);
        return this;
    }
    options(options) {
        this.data.options = buildOptionsArray(options);
        return this;
    }
    export() {
        if (this.data.name === '') {
            throw new Error('Name was not provided in Slash Builder');
        }
        return this.data;
    }
}
export function transformApplicationCommandOption(_data) {
    const data = {
        ..._data
    };
    if (typeof data.type === 'string') {
        data.type = ApplicationCommandOptionType[data.type.toUpperCase()];
    }
    if (Array.isArray(data.options)) {
        data.options = data.options.map(transformApplicationCommandOption);
    }
    if (Array.isArray(data.channelTypes)) {
        data.channel_types = data.channelTypes.map((e)=>typeof e === 'string' ? ChannelTypes[e] : e);
        delete data.channel_types;
    }
    if (data.minValue !== undefined) {
        data.min_value = data.minValue;
        delete data.minValue;
    }
    if (data.maxValue !== undefined) {
        data.max_value = data.maxValue;
        delete data.maxValue;
    }
    return data;
}
export function transformApplicationCommand(_cmd) {
    const cmd = {
        ..._cmd
    };
    if (cmd.defaultPermission !== undefined) {
        cmd.default_permission = cmd.defaultPermission;
        delete cmd.defaultPermission;
    }
    if (typeof cmd.type === 'string') {
        cmd.type = ApplicationCommandType[cmd.type];
    }
    if (typeof cmd.options === 'object' && Array.isArray(cmd.options)) {
        cmd.options = cmd.options.map(transformApplicationCommandOption);
    }
    return cmd;
}
export function transformApplicationCommandPermission(data) {
    data = {
        ...data
    };
    if (typeof data.type === 'string') {
        data.type = ApplicationCommandPermissionType[data.type.toUpperCase()];
    }
    return data;
}
export function transformApplicationCommandPermissions(_data) {
    const data = {
        ..._data
    };
    if (typeof data.permissions === 'object' && Array.isArray(data.permissions)) {
        data.permissions = data.permissions.map(transformApplicationCommandPermission);
    }
    return data;
}
export function transformApplicationCommandPermissionsPayload(_data) {
    const data = {
        ..._data
    };
    data.applicationID = data.application_id;
    data.guildID = data.guild_id;
    delete data.application_id;
    delete data.guild_id;
    return data;
}
export class ApplicationCommandPermissionsManager {
    slash;
    rest;
    constructor(client, guildID){
        this.guildID = guildID;
        Object.defineProperty(this, 'slash', {
            value: client,
            enumerable: false
        });
        Object.defineProperty(this, 'rest', {
            enumerable: false,
            value: client.rest
        });
    }
    /** Get an array of all Slash Commands (of current Client) Permissions in a Guild */ async all(guild) {
        guild = guild ?? this.guildID;
        if (guild === undefined) throw new Error('Guild argument not provided');
        const data = await this.rest.api.applications[this.slash.getID()].guilds[typeof guild === 'string' ? guild : guild.id].commands.permissions.get();
        return data.map(transformApplicationCommandPermissionsPayload);
    }
    /** Get slash command permissions for a specific command */ async get(cmd, guild) {
        guild = guild ?? this.guildID;
        if (guild === undefined) throw new Error('Guild argument not provided');
        const data = await this.rest.api.applications[this.slash.getID()].guilds[typeof guild === 'string' ? guild : guild.id].commands[typeof cmd === 'object' ? cmd.id : cmd].permissions.get();
        return transformApplicationCommandPermissionsPayload(data);
    }
    /** Sets permissions of a Slash Command in a Guild */ async set(cmd, permissions, guild) {
        guild = guild ?? this.guildID;
        if (guild === undefined) throw new Error('Guild argument not provided');
        const data = await this.rest.api.applications[this.slash.getID()].guilds[typeof guild === 'string' ? guild : guild.id].commands[typeof cmd === 'object' ? cmd.id : cmd].permissions.put({
            permissions: permissions.map(transformApplicationCommandPermission)
        });
        return transformApplicationCommandPermissionsPayload(data);
    }
    /** Sets permissions of multiple Slash Commands in a Guild with just one call */ async bulkEdit(permissions, guild) {
        guild = guild ?? this.guildID;
        if (guild === undefined) throw new Error('Guild argument not provided');
        const data = await this.rest.api.applications[this.slash.getID()].guilds[typeof guild === 'string' ? guild : guild.id].commands.permissions.put(permissions.map(transformApplicationCommandPermissions));
        return data.map(transformApplicationCommandPermissionsPayload);
    }
    async *[Symbol.asyncIterator]() {
        for (const perm of (await this.all())){
            yield perm;
        }
    }
    guildID;
}
export { ApplicationCommandPermissionsManager as SlashCommandPermissionsManager };
/** Manages Slash Commands, allows fetching/modifying/deleting/creating Slash Commands. */ export class ApplicationCommandsManager {
    slash;
    rest;
    permissions;
    constructor(client){
        Object.defineProperty(this, 'slash', {
            value: client,
            enumerable: false
        });
        Object.defineProperty(this, 'rest', {
            enumerable: false,
            value: client.rest
        });
        Object.defineProperty(this, 'permissions', {
            enumerable: false,
            value: new ApplicationCommandPermissionsManager(this.slash)
        });
    }
    /** Get all Global Slash Commands */ async all() {
        const col = new Collection();
        const res = await this.rest.api.applications[this.slash.getID()].commands.get();
        if (!Array.isArray(res)) return col;
        for (const raw of res){
            const cmd = new ApplicationCommand(this, raw);
            col.set(raw.id, cmd);
        }
        return col;
    }
    /** Get a Guild's Slash Commands */ async guild(guild) {
        const col = new Collection();
        const res = await this.rest.api.applications[this.slash.getID()].guilds[typeof guild === 'string' ? guild : guild.id].commands.get();
        if (!Array.isArray(res)) return col;
        const _guild = typeof guild === 'object' ? guild : await this.slash.client?.guilds.get(guild);
        for (const raw of res){
            const cmd = new ApplicationCommand(this, raw, _guild);
            cmd.guildID = typeof guild === 'string' ? guild : guild.id;
            col.set(raw.id, cmd);
        }
        return col;
    }
    for(guild) {
        return new GuildApplicationCommandsManager(this.slash, guild);
    }
    /** Create a Slash Command (global or Guild) */ async create(data, guild) {
        const route = guild === undefined ? this.rest.api.applications[this.slash.getID()].commands : this.rest.api.applications[this.slash.getID()].guilds[typeof guild === 'string' ? guild : guild.id].commands;
        const payload = await route.post(transformApplicationCommand(data));
        const _guild = typeof guild === 'object' ? guild : guild === undefined ? undefined : await this.slash.client?.guilds.get(guild);
        const cmd = new ApplicationCommand(this, payload, _guild);
        cmd.guildID = typeof guild === 'string' || guild === undefined ? guild : guild.id;
        return cmd;
    }
    /** Edit a Slash Command (global or Guild) */ async edit(id, data, guild) {
        const route = guild === undefined ? this.rest.api.applications[this.slash.getID()].commands[id] : this.rest.api.applications[this.slash.getID()].guilds[typeof guild === 'string' ? guild : guild.id].commands[id];
        const d = await route.patch(transformApplicationCommand(data));
        const _guild = await this.slash.client?.guilds.get(d.guild_id) ?? (typeof guild === 'object' ? guild : undefined);
        const cmd = new ApplicationCommand(this, d, _guild);
        if ('guild_id' in d) cmd.guildID = d.guildID;
        return cmd;
    }
    /** Delete a Slash Command (global or Guild) */ async delete(id, guild) {
        const route = guild === undefined ? this.rest.api.applications[this.slash.getID()].commands[id] : this.rest.api.applications[this.slash.getID()].guilds[typeof guild === 'string' ? guild : guild.id].commands[id];
        await route.delete();
        return this;
    }
    /** Get a Slash Command (global or Guild) */ async get(id, guild) {
        const route = guild === undefined ? this.rest.api.applications[this.slash.getID()].commands[id] : this.rest.api.applications[this.slash.getID()].guilds[typeof guild === 'string' ? guild : guild.id].commands[id];
        const data = await route.get();
        const _guild = typeof guild === 'object' ? guild : guild === undefined ? undefined : await this.slash.client?.guilds.get(guild);
        return new ApplicationCommand(this, data, _guild);
    }
    /** Bulk Edit Global or Guild Slash Commands */ async bulkEdit(cmds, guild) {
        const route = guild === undefined ? this.rest.api.applications[this.slash.getID()].commands : this.rest.api.applications[this.slash.getID()].guilds[typeof guild === 'string' ? guild : guild.id].commands;
        const d = await route.put(cmds.map(transformApplicationCommand));
        const col = new Collection();
        const _guild = typeof guild === 'object' ? guild : typeof guild === 'string' ? await this.slash.client?.guilds.get(guild) : undefined;
        for (const raw of d){
            const cmd = new ApplicationCommand(this, raw, _guild);
            cmd.guildID = _guild?.id;
            cmd.guild = _guild;
            col.set(raw.id, cmd);
        }
        return col;
    }
    async *[Symbol.asyncIterator]() {
        for (const [, cmd] of (await this.all())){
            yield cmd;
        }
    }
}
export { ApplicationCommandsManager as SlashCommandsManager };
export class GuildApplicationCommandsManager {
    slash;
    guild;
    permissions;
    get commands() {
        return this.slash.commands;
    }
    constructor(slash, guild){
        Object.defineProperty(this, 'slash', {
            enumerable: false,
            value: slash
        });
        Object.defineProperty(this, 'guild', {
            enumerable: false,
            value: guild
        });
        this.permissions = new ApplicationCommandPermissionsManager(this.slash, typeof guild === 'object' ? guild.id : guild);
    }
    async get(id) {
        return await this.commands.get(id, this.guild);
    }
    async delete(id) {
        await this.commands.delete(id, this.guild);
        return this;
    }
    async all() {
        return await this.commands.guild(this.guild);
    }
    async bulkEdit(commands) {
        return await this.commands.bulkEdit(commands, this.guild);
    }
    async create(cmd) {
        return await this.commands.create(cmd, this.guild);
    }
    async edit(id, cmd) {
        return await this.commands.edit(id, cmd, this.guild);
    }
    async *[Symbol.asyncIterator]() {
        for (const [, cmd] of (await this.all())){
            yield cmd;
        }
    }
}
export { GuildApplicationCommandsManager as GuildSlashCommandsManager };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2ludGVyYWN0aW9ucy9hcHBsaWNhdGlvbkNvbW1hbmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUkVTVE1hbmFnZXIgfSBmcm9tICcuLi9yZXN0L21hbmFnZXIudHMnXG5pbXBvcnQgdHlwZSB7IEd1aWxkIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9ndWlsZC50cydcbmltcG9ydCB7XG4gIEFwcGxpY2F0aW9uQ29tbWFuZFR5cGUsXG4gIEd1aWxkQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbnMsXG4gIEd1aWxkU2xhc2hDb21tbWFuZFBlcm1pc3Npb25zUGFydGlhbCxcbiAgR3VpbGRTbGFzaENvbW1tYW5kUGVybWlzc2lvbnNQYXlsb2FkLFxuICBBcHBsaWNhdGlvbkNvbW1hbmRDaG9pY2UsXG4gIEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbixcbiAgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uUGF5bG9hZCxcbiAgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZSxcbiAgQXBwbGljYXRpb25Db21tYW5kUGFydGlhbCxcbiAgQXBwbGljYXRpb25Db21tYW5kUGFydGlhbFBheWxvYWQsXG4gIEFwcGxpY2F0aW9uQ29tbWFuZFBheWxvYWQsXG4gIEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb24sXG4gIEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25QYXlsb2FkLFxuICBBcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uVHlwZVxufSBmcm9tICcuLi90eXBlcy9hcHBsaWNhdGlvbkNvbW1hbmQudHMnXG5pbXBvcnQgeyBDaGFubmVsVHlwZXMgfSBmcm9tICcuLi90eXBlcy9jaGFubmVsLnRzJ1xuaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gJy4uL3V0aWxzL2NvbGxlY3Rpb24udHMnXG5pbXBvcnQgdHlwZSB7XG4gIEludGVyYWN0aW9uc0NsaWVudCxcbiAgQXBwbGljYXRpb25Db21tYW5kSGFuZGxlckNhbGxiYWNrXG59IGZyb20gJy4vY2xpZW50LnRzJ1xuXG5leHBvcnQgY2xhc3MgQXBwbGljYXRpb25Db21tYW5kIHtcbiAgc2xhc2g6IEFwcGxpY2F0aW9uQ29tbWFuZHNNYW5hZ2VyXG4gIGlkOiBzdHJpbmdcbiAgYXBwbGljYXRpb25JRDogc3RyaW5nXG4gIG5hbWU6IHN0cmluZ1xuICB0eXBlOiBBcHBsaWNhdGlvbkNvbW1hbmRUeXBlXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nXG4gIGRlZmF1bHRQZXJtaXNzaW9uID0gdHJ1ZVxuICBvcHRpb25zOiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25bXVxuICBndWlsZD86IEd1aWxkXG4gIGd1aWxkSUQ/OiBzdHJpbmdcblxuICBjb25zdHJ1Y3RvcihcbiAgICBtYW5hZ2VyOiBBcHBsaWNhdGlvbkNvbW1hbmRzTWFuYWdlcixcbiAgICBkYXRhOiBBcHBsaWNhdGlvbkNvbW1hbmRQYXlsb2FkLFxuICAgIGd1aWxkPzogR3VpbGRcbiAgKSB7XG4gICAgdGhpcy5zbGFzaCA9IG1hbmFnZXJcbiAgICB0aGlzLmlkID0gZGF0YS5pZFxuICAgIHRoaXMuYXBwbGljYXRpb25JRCA9IGRhdGEuYXBwbGljYXRpb25faWRcbiAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWVcbiAgICB0aGlzLnR5cGUgPSBkYXRhLnR5cGUgPz8gQXBwbGljYXRpb25Db21tYW5kVHlwZS5DSEFUX0lOUFVUXG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IGRhdGEuZGVzY3JpcHRpb25cbiAgICB0aGlzLm9wdGlvbnMgPSBkYXRhLm9wdGlvbnMgPz8gW11cbiAgICB0aGlzLmd1aWxkID0gZ3VpbGRcbiAgICB0aGlzLmRlZmF1bHRQZXJtaXNzaW9uID0gZGF0YS5kZWZhdWx0X3Blcm1pc3Npb25cbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnNsYXNoLmRlbGV0ZSh0aGlzLmlkLCB0aGlzLmd1aWxkSUQpXG4gIH1cblxuICBhc3luYyBlZGl0KGRhdGE6IEFwcGxpY2F0aW9uQ29tbWFuZFBhcnRpYWwpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnNsYXNoLmVkaXQodGhpcy5pZCwgZGF0YSwgdGhpcy5ndWlsZElEKVxuICB9XG5cbiAgYXN5bmMgc2V0UGVybWlzc2lvbnMoXG4gICAgZGF0YTogQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbltdLFxuICAgIGd1aWxkPzogR3VpbGQgfCBzdHJpbmdcbiAgKTogUHJvbWlzZTxHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25zPiB7XG4gICAgY29uc3QgZ3VpbGRJRCA9XG4gICAgICB0aGlzLmd1aWxkSUQgPz9cbiAgICAgICh0eXBlb2YgZ3VpbGQgPT09ICdzdHJpbmcnXG4gICAgICAgID8gZ3VpbGRcbiAgICAgICAgOiB0eXBlb2YgZ3VpbGQgPT09ICdvYmplY3QnXG4gICAgICAgID8gZ3VpbGQuaWRcbiAgICAgICAgOiB1bmRlZmluZWQpXG4gICAgaWYgKGd1aWxkSUQgPT09IHVuZGVmaW5lZClcbiAgICAgIHRocm93IG5ldyBFcnJvcignRXhwZWN0ZWQgU2xhc2ggQ29tbWFuZCB0byBiZSBhIEd1aWxkIG9uZScpXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc2xhc2gucGVybWlzc2lvbnMuc2V0KHRoaXMuaWQsIGRhdGEsIGd1aWxkSUQpXG4gIH1cblxuICBhc3luYyBnZXRQZXJtaXNzaW9ucyhcbiAgICBndWlsZD86IEd1aWxkIHwgc3RyaW5nXG4gICk6IFByb21pc2U8R3VpbGRBcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9ucz4ge1xuICAgIGNvbnN0IGd1aWxkSUQgPVxuICAgICAgdGhpcy5ndWlsZElEID8/XG4gICAgICAodHlwZW9mIGd1aWxkID09PSAnc3RyaW5nJ1xuICAgICAgICA/IGd1aWxkXG4gICAgICAgIDogdHlwZW9mIGd1aWxkID09PSAnb2JqZWN0J1xuICAgICAgICA/IGd1aWxkLmlkXG4gICAgICAgIDogdW5kZWZpbmVkKVxuICAgIGlmIChndWlsZElEID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGVjdGVkIFNsYXNoIENvbW1hbmQgdG8gYmUgYSBHdWlsZCBvbmUnKVxuICAgIHJldHVybiBhd2FpdCB0aGlzLnNsYXNoLnBlcm1pc3Npb25zLmdldCh0aGlzLmlkLCBndWlsZElEKVxuICB9XG5cbiAgLyoqIENyZWF0ZSBhIGhhbmRsZXIgZm9yIHRoaXMgU2xhc2ggQ29tbWFuZCAqL1xuICBoYW5kbGUoXG4gICAgZnVuYzogQXBwbGljYXRpb25Db21tYW5kSGFuZGxlckNhbGxiYWNrLFxuICAgIG9wdGlvbnM/OiB7IHBhcmVudD86IHN0cmluZzsgZ3JvdXA/OiBzdHJpbmcgfVxuICApOiB0aGlzIHtcbiAgICB0aGlzLnNsYXNoLnNsYXNoLmhhbmRsZSh7XG4gICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICBwYXJlbnQ6IG9wdGlvbnM/LnBhcmVudCxcbiAgICAgIGdyb3VwOiBvcHRpb25zPy5ncm91cCxcbiAgICAgIGd1aWxkOiB0aGlzLmd1aWxkSUQsXG4gICAgICBoYW5kbGVyOiBmdW5jXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ3JlYXRlT3B0aW9ucyB7XG4gIG5hbWU6IHN0cmluZ1xuICBkZXNjcmlwdGlvbj86IHN0cmluZ1xuICBvcHRpb25zPzogQXJyYXk8QXBwbGljYXRpb25Db21tYW5kT3B0aW9uIHwgU2xhc2hPcHRpb25DYWxsYWJsZT5cbiAgY2hvaWNlcz86IEFycmF5PEFwcGxpY2F0aW9uQ29tbWFuZENob2ljZSB8IHN0cmluZz5cbn1cblxuZnVuY3Rpb24gY3JlYXRlU2xhc2hPcHRpb24oXG4gIHR5cGU6IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGUsXG4gIGRhdGE6IENyZWF0ZU9wdGlvbnNcbik6IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbiB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogZGF0YS5uYW1lLFxuICAgIHR5cGUsXG4gICAgZGVzY3JpcHRpb246IGRhdGEuZGVzY3JpcHRpb24gPz8gJ05vIGRlc2NyaXB0aW9uLicsXG4gICAgb3B0aW9uczogZGF0YS5vcHRpb25zPy5tYXAoKGUpID0+XG4gICAgICB0eXBlb2YgZSA9PT0gJ2Z1bmN0aW9uJyA/IGUoU2xhc2hPcHRpb24pIDogZVxuICAgICksXG4gICAgY2hvaWNlczpcbiAgICAgIGRhdGEuY2hvaWNlcyA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgIDogZGF0YS5jaG9pY2VzLm1hcCgoZSkgPT5cbiAgICAgICAgICAgIHR5cGVvZiBlID09PSAnc3RyaW5nJyA/IHsgbmFtZTogZSwgdmFsdWU6IGUgfSA6IGVcbiAgICAgICAgICApXG4gIH1cbn1cblxuZXhwb3J0IHsgQXBwbGljYXRpb25Db21tYW5kIGFzIFNsYXNoQ29tbWFuZCB9XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXh0cmFuZW91cy1jbGFzc1xuZXhwb3J0IGNsYXNzIFNsYXNoT3B0aW9uIHtcbiAgc3RhdGljIHN0cmluZyhkYXRhOiBDcmVhdGVPcHRpb25zKTogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uIHtcbiAgICByZXR1cm4gY3JlYXRlU2xhc2hPcHRpb24oQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZS5TVFJJTkcsIGRhdGEpXG4gIH1cblxuICBzdGF0aWMgYm9vbChkYXRhOiBDcmVhdGVPcHRpb25zKTogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uIHtcbiAgICByZXR1cm4gY3JlYXRlU2xhc2hPcHRpb24oQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZS5CT09MRUFOLCBkYXRhKVxuICB9XG5cbiAgc3RhdGljIHN1YkNvbW1hbmQoZGF0YTogQ3JlYXRlT3B0aW9ucyk6IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbiB7XG4gICAgcmV0dXJuIGNyZWF0ZVNsYXNoT3B0aW9uKEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGUuU1VCX0NPTU1BTkQsIGRhdGEpXG4gIH1cblxuICBzdGF0aWMgc3ViQ29tbWFuZEdyb3VwKGRhdGE6IENyZWF0ZU9wdGlvbnMpOiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb24ge1xuICAgIHJldHVybiBjcmVhdGVTbGFzaE9wdGlvbihcbiAgICAgIEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGUuU1VCX0NPTU1BTkRfR1JPVVAsXG4gICAgICBkYXRhXG4gICAgKVxuICB9XG5cbiAgc3RhdGljIHJvbGUoZGF0YTogQ3JlYXRlT3B0aW9ucyk6IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbiB7XG4gICAgcmV0dXJuIGNyZWF0ZVNsYXNoT3B0aW9uKEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGUuUk9MRSwgZGF0YSlcbiAgfVxuXG4gIHN0YXRpYyBjaGFubmVsKGRhdGE6IENyZWF0ZU9wdGlvbnMpOiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb24ge1xuICAgIHJldHVybiBjcmVhdGVTbGFzaE9wdGlvbihBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlLkNIQU5ORUwsIGRhdGEpXG4gIH1cblxuICBzdGF0aWMgdXNlcihkYXRhOiBDcmVhdGVPcHRpb25zKTogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uIHtcbiAgICByZXR1cm4gY3JlYXRlU2xhc2hPcHRpb24oQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZS5VU0VSLCBkYXRhKVxuICB9XG5cbiAgc3RhdGljIG51bWJlcihkYXRhOiBDcmVhdGVPcHRpb25zKTogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uIHtcbiAgICByZXR1cm4gY3JlYXRlU2xhc2hPcHRpb24oQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZS5JTlRFR0VSLCBkYXRhKVxuICB9XG5cbiAgc3RhdGljIG1lbnRpb25hYmxlKGRhdGE6IENyZWF0ZU9wdGlvbnMpOiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb24ge1xuICAgIHJldHVybiBjcmVhdGVTbGFzaE9wdGlvbihBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlLk1FTlRJT05BQkxFLCBkYXRhKVxuICB9XG59XG5cbmV4cG9ydCB0eXBlIFNsYXNoT3B0aW9uQ2FsbGFibGUgPSAoXG4gIG86IHR5cGVvZiBTbGFzaE9wdGlvblxuKSA9PiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25cblxuZXhwb3J0IHR5cGUgU2xhc2hCdWlsZGVyT3B0aW9uc0RhdGEgPVxuICB8IEFycmF5PEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbiB8IFNsYXNoT3B0aW9uQ2FsbGFibGU+XG4gIHwge1xuICAgICAgW25hbWU6IHN0cmluZ106XG4gICAgICAgIHwge1xuICAgICAgICAgICAgZGVzY3JpcHRpb246IHN0cmluZ1xuICAgICAgICAgICAgdHlwZTogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZVxuICAgICAgICAgICAgb3B0aW9ucz86IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbltdXG4gICAgICAgICAgICBjaG9pY2VzPzogQXBwbGljYXRpb25Db21tYW5kQ2hvaWNlW11cbiAgICAgICAgICB9XG4gICAgICAgIHwgU2xhc2hPcHRpb25DYWxsYWJsZVxuICAgIH1cblxuZnVuY3Rpb24gYnVpbGRPcHRpb25zQXJyYXkoXG4gIG9wdGlvbnM6IFNsYXNoQnVpbGRlck9wdGlvbnNEYXRhXG4pOiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25bXSB7XG4gIHJldHVybiBBcnJheS5pc0FycmF5KG9wdGlvbnMpXG4gICAgPyBvcHRpb25zLm1hcCgob3ApID0+ICh0eXBlb2Ygb3AgPT09ICdmdW5jdGlvbicgPyBvcChTbGFzaE9wdGlvbikgOiBvcCkpXG4gICAgOiBPYmplY3QuZW50cmllcyhvcHRpb25zKS5tYXAoKGVudHJ5KSA9PlxuICAgICAgICB0eXBlb2YgZW50cnlbMV0gPT09ICdmdW5jdGlvbidcbiAgICAgICAgICA/IGVudHJ5WzFdKFNsYXNoT3B0aW9uKVxuICAgICAgICAgIDogT2JqZWN0LmFzc2lnbihlbnRyeVsxXSwgeyBuYW1lOiBlbnRyeVswXSB9KVxuICAgICAgKVxufVxuXG4vKiogU2xhc2ggQ29tbWFuZCBCdWlsZGVyICovXG5leHBvcnQgY2xhc3MgU2xhc2hCdWlsZGVyIHtcbiAgZGF0YTogQXBwbGljYXRpb25Db21tYW5kUGFydGlhbFxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIG5hbWU/OiBzdHJpbmcsXG4gICAgZGVzY3JpcHRpb24/OiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IFNsYXNoQnVpbGRlck9wdGlvbnNEYXRhXG4gICkge1xuICAgIHRoaXMuZGF0YSA9IHtcbiAgICAgIG5hbWU6IG5hbWUgPz8gJycsXG4gICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24gPz8gJ05vIGRlc2NyaXB0aW9uLicsXG4gICAgICBvcHRpb25zOiBvcHRpb25zID09PSB1bmRlZmluZWQgPyBbXSA6IGJ1aWxkT3B0aW9uc0FycmF5KG9wdGlvbnMpXG4gICAgfVxuICB9XG5cbiAgbmFtZShuYW1lOiBzdHJpbmcpOiBTbGFzaEJ1aWxkZXIge1xuICAgIHRoaXMuZGF0YS5uYW1lID0gbmFtZVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkZXNjcmlwdGlvbihkZXNjOiBzdHJpbmcpOiBTbGFzaEJ1aWxkZXIge1xuICAgIHRoaXMuZGF0YS5kZXNjcmlwdGlvbiA9IGRlc2NcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgb3B0aW9uKG9wdGlvbjogU2xhc2hPcHRpb25DYWxsYWJsZSB8IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbik6IFNsYXNoQnVpbGRlciB7XG4gICAgaWYgKHRoaXMuZGF0YS5vcHRpb25zID09PSB1bmRlZmluZWQpIHRoaXMuZGF0YS5vcHRpb25zID0gW11cbiAgICB0aGlzLmRhdGEub3B0aW9ucy5wdXNoKFxuICAgICAgdHlwZW9mIG9wdGlvbiA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbihTbGFzaE9wdGlvbikgOiBvcHRpb25cbiAgICApXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIG9wdGlvbnMob3B0aW9uczogU2xhc2hCdWlsZGVyT3B0aW9uc0RhdGEpOiBTbGFzaEJ1aWxkZXIge1xuICAgIHRoaXMuZGF0YS5vcHRpb25zID0gYnVpbGRPcHRpb25zQXJyYXkob3B0aW9ucylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgZXhwb3J0KCk6IEFwcGxpY2F0aW9uQ29tbWFuZFBhcnRpYWwge1xuICAgIGlmICh0aGlzLmRhdGEubmFtZSA9PT0gJycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTmFtZSB3YXMgbm90IHByb3ZpZGVkIGluIFNsYXNoIEJ1aWxkZXInKVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5kYXRhXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybUFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbihcbiAgX2RhdGE6IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblxuKTogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uUGF5bG9hZCB7XG4gIGNvbnN0IGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+ID0geyAuLi5fZGF0YSB9XG4gIGlmICh0eXBlb2YgZGF0YS50eXBlID09PSAnc3RyaW5nJykge1xuICAgIGRhdGEudHlwZSA9XG4gICAgICBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlW1xuICAgICAgICBkYXRhLnR5cGUudG9VcHBlckNhc2UoKSBhcyBrZXlvZiB0eXBlb2YgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZVxuICAgICAgXVxuICB9XG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEub3B0aW9ucykpIHtcbiAgICBkYXRhLm9wdGlvbnMgPSBkYXRhLm9wdGlvbnMubWFwKHRyYW5zZm9ybUFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbilcbiAgfVxuICBpZiAoQXJyYXkuaXNBcnJheShkYXRhLmNoYW5uZWxUeXBlcykpIHtcbiAgICBkYXRhLmNoYW5uZWxfdHlwZXMgPSBkYXRhLmNoYW5uZWxUeXBlcy5tYXAoXG4gICAgICAoZTogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uWydjaGFubmVsVHlwZXMnXSkgPT5cbiAgICAgICAgdHlwZW9mIGUgPT09ICdzdHJpbmcnID8gQ2hhbm5lbFR5cGVzW2VdIDogZVxuICAgIClcbiAgICBkZWxldGUgZGF0YS5jaGFubmVsX3R5cGVzXG4gIH1cbiAgaWYgKGRhdGEubWluVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIGRhdGEubWluX3ZhbHVlID0gZGF0YS5taW5WYWx1ZVxuICAgIGRlbGV0ZSBkYXRhLm1pblZhbHVlXG4gIH1cbiAgaWYgKGRhdGEubWF4VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuICAgIGRhdGEubWF4X3ZhbHVlID0gZGF0YS5tYXhWYWx1ZVxuICAgIGRlbGV0ZSBkYXRhLm1heFZhbHVlXG4gIH1cbiAgcmV0dXJuIGRhdGEgYXMgdW5rbm93biBhcyBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25QYXlsb2FkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1BcHBsaWNhdGlvbkNvbW1hbmQoXG4gIF9jbWQ6IEFwcGxpY2F0aW9uQ29tbWFuZFBhcnRpYWxcbik6IEFwcGxpY2F0aW9uQ29tbWFuZFBhcnRpYWxQYXlsb2FkIHtcbiAgY29uc3QgY21kOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHsgLi4uX2NtZCB9XG4gIGlmIChjbWQuZGVmYXVsdFBlcm1pc3Npb24gIT09IHVuZGVmaW5lZCkge1xuICAgIGNtZC5kZWZhdWx0X3Blcm1pc3Npb24gPSBjbWQuZGVmYXVsdFBlcm1pc3Npb25cbiAgICBkZWxldGUgY21kLmRlZmF1bHRQZXJtaXNzaW9uXG4gIH1cbiAgaWYgKHR5cGVvZiBjbWQudHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICBjbWQudHlwZSA9XG4gICAgICBBcHBsaWNhdGlvbkNvbW1hbmRUeXBlW2NtZC50eXBlIGFzIGtleW9mIHR5cGVvZiBBcHBsaWNhdGlvbkNvbW1hbmRUeXBlXVxuICB9XG4gIGlmICh0eXBlb2YgY21kLm9wdGlvbnMgPT09ICdvYmplY3QnICYmIEFycmF5LmlzQXJyYXkoY21kLm9wdGlvbnMpKSB7XG4gICAgY21kLm9wdGlvbnMgPSBjbWQub3B0aW9ucy5tYXAodHJhbnNmb3JtQXBwbGljYXRpb25Db21tYW5kT3B0aW9uKVxuICB9XG4gIHJldHVybiBjbWQgYXMgdW5rbm93biBhcyBBcHBsaWNhdGlvbkNvbW1hbmRQYXJ0aWFsUGF5bG9hZFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbihcbiAgZGF0YTogQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvblxuKTogQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvblBheWxvYWQge1xuICBkYXRhID0geyAuLi5kYXRhIH1cbiAgaWYgKHR5cGVvZiBkYXRhLnR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgZGF0YS50eXBlID1cbiAgICAgIEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25UeXBlW1xuICAgICAgICBkYXRhLnR5cGUudG9VcHBlckNhc2UoKSBhcyBrZXlvZiB0eXBlb2YgQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvblR5cGVcbiAgICAgIF1cbiAgfVxuICByZXR1cm4gZGF0YSBhcyB1bmtub3duIGFzIEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25QYXlsb2FkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1BcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9ucyhcbiAgX2RhdGE6IEd1aWxkU2xhc2hDb21tbWFuZFBlcm1pc3Npb25zUGFydGlhbFxuKTogR3VpbGRTbGFzaENvbW1tYW5kUGVybWlzc2lvbnNQYXlsb2FkIHtcbiAgY29uc3QgZGF0YSA9IHsgLi4uX2RhdGEgfVxuICBpZiAodHlwZW9mIGRhdGEucGVybWlzc2lvbnMgPT09ICdvYmplY3QnICYmIEFycmF5LmlzQXJyYXkoZGF0YS5wZXJtaXNzaW9ucykpIHtcbiAgICBkYXRhLnBlcm1pc3Npb25zID0gZGF0YS5wZXJtaXNzaW9ucy5tYXAoXG4gICAgICB0cmFuc2Zvcm1BcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uXG4gICAgKVxuICB9XG4gIHJldHVybiBkYXRhIGFzIHVua25vd24gYXMgR3VpbGRTbGFzaENvbW1tYW5kUGVybWlzc2lvbnNQYXlsb2FkXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1BcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uc1BheWxvYWQoXG4gIF9kYXRhOiBHdWlsZFNsYXNoQ29tbW1hbmRQZXJtaXNzaW9uc1BheWxvYWRcbik6IEd1aWxkQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbnMge1xuICBjb25zdCBkYXRhOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiA9IHsgLi4uX2RhdGEgfVxuICBkYXRhLmFwcGxpY2F0aW9uSUQgPSBkYXRhLmFwcGxpY2F0aW9uX2lkXG4gIGRhdGEuZ3VpbGRJRCA9IGRhdGEuZ3VpbGRfaWRcbiAgZGVsZXRlIGRhdGEuYXBwbGljYXRpb25faWRcbiAgZGVsZXRlIGRhdGEuZ3VpbGRfaWRcbiAgcmV0dXJuIGRhdGEgYXMgdW5rbm93biBhcyBHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25zXG59XG5cbmV4cG9ydCBjbGFzcyBBcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uc01hbmFnZXIge1xuICByZWFkb25seSBzbGFzaCE6IEludGVyYWN0aW9uc0NsaWVudFxuICByZWFkb25seSByZXN0ITogUkVTVE1hbmFnZXJcblxuICBjb25zdHJ1Y3RvcihjbGllbnQ6IEludGVyYWN0aW9uc0NsaWVudCwgcHVibGljIGd1aWxkSUQ/OiBzdHJpbmcpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3NsYXNoJywgeyB2YWx1ZTogY2xpZW50LCBlbnVtZXJhYmxlOiBmYWxzZSB9KVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncmVzdCcsIHtcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgdmFsdWU6IGNsaWVudC5yZXN0XG4gICAgfSlcbiAgfVxuXG4gIC8qKiBHZXQgYW4gYXJyYXkgb2YgYWxsIFNsYXNoIENvbW1hbmRzIChvZiBjdXJyZW50IENsaWVudCkgUGVybWlzc2lvbnMgaW4gYSBHdWlsZCAqL1xuICBhc3luYyBhbGwoXG4gICAgZ3VpbGQ/OiBHdWlsZCB8IHN0cmluZ1xuICApOiBQcm9taXNlPEd1aWxkQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbnNbXT4ge1xuICAgIGd1aWxkID0gZ3VpbGQgPz8gdGhpcy5ndWlsZElEXG4gICAgaWYgKGd1aWxkID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignR3VpbGQgYXJndW1lbnQgbm90IHByb3ZpZGVkJylcbiAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5yZXN0LmFwaS5hcHBsaWNhdGlvbnNbdGhpcy5zbGFzaC5nZXRJRCgpXS5ndWlsZHNbXG4gICAgICB0eXBlb2YgZ3VpbGQgPT09ICdzdHJpbmcnID8gZ3VpbGQgOiBndWlsZC5pZFxuICAgIF0uY29tbWFuZHMucGVybWlzc2lvbnMuZ2V0KClcbiAgICByZXR1cm4gZGF0YS5tYXAodHJhbnNmb3JtQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbnNQYXlsb2FkKVxuICB9XG5cbiAgLyoqIEdldCBzbGFzaCBjb21tYW5kIHBlcm1pc3Npb25zIGZvciBhIHNwZWNpZmljIGNvbW1hbmQgKi9cbiAgYXN5bmMgZ2V0KFxuICAgIGNtZDogc3RyaW5nIHwgQXBwbGljYXRpb25Db21tYW5kLFxuICAgIGd1aWxkOiBHdWlsZCB8IHN0cmluZ1xuICApOiBQcm9taXNlPEd1aWxkQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbnM+IHtcbiAgICBndWlsZCA9IGd1aWxkID8/IHRoaXMuZ3VpbGRJRFxuICAgIGlmIChndWlsZCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ0d1aWxkIGFyZ3VtZW50IG5vdCBwcm92aWRlZCcpXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMucmVzdC5hcGkuYXBwbGljYXRpb25zW3RoaXMuc2xhc2guZ2V0SUQoKV0uZ3VpbGRzW1xuICAgICAgdHlwZW9mIGd1aWxkID09PSAnc3RyaW5nJyA/IGd1aWxkIDogZ3VpbGQuaWRcbiAgICBdLmNvbW1hbmRzW3R5cGVvZiBjbWQgPT09ICdvYmplY3QnID8gY21kLmlkIDogY21kXS5wZXJtaXNzaW9ucy5nZXQoKVxuICAgIHJldHVybiB0cmFuc2Zvcm1BcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uc1BheWxvYWQoZGF0YSlcbiAgfVxuXG4gIC8qKiBTZXRzIHBlcm1pc3Npb25zIG9mIGEgU2xhc2ggQ29tbWFuZCBpbiBhIEd1aWxkICovXG4gIGFzeW5jIHNldChcbiAgICBjbWQ6IHN0cmluZyB8IEFwcGxpY2F0aW9uQ29tbWFuZCxcbiAgICBwZXJtaXNzaW9uczogQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbltdLFxuICAgIGd1aWxkOiBHdWlsZCB8IHN0cmluZ1xuICApOiBQcm9taXNlPEd1aWxkQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbnM+IHtcbiAgICBndWlsZCA9IGd1aWxkID8/IHRoaXMuZ3VpbGRJRFxuICAgIGlmIChndWlsZCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ0d1aWxkIGFyZ3VtZW50IG5vdCBwcm92aWRlZCcpXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMucmVzdC5hcGkuYXBwbGljYXRpb25zW3RoaXMuc2xhc2guZ2V0SUQoKV0uZ3VpbGRzW1xuICAgICAgdHlwZW9mIGd1aWxkID09PSAnc3RyaW5nJyA/IGd1aWxkIDogZ3VpbGQuaWRcbiAgICBdLmNvbW1hbmRzW3R5cGVvZiBjbWQgPT09ICdvYmplY3QnID8gY21kLmlkIDogY21kXS5wZXJtaXNzaW9ucy5wdXQoe1xuICAgICAgcGVybWlzc2lvbnM6IHBlcm1pc3Npb25zLm1hcCh0cmFuc2Zvcm1BcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uKVxuICAgIH0pXG4gICAgcmV0dXJuIHRyYW5zZm9ybUFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25zUGF5bG9hZChkYXRhKVxuICB9XG5cbiAgLyoqIFNldHMgcGVybWlzc2lvbnMgb2YgbXVsdGlwbGUgU2xhc2ggQ29tbWFuZHMgaW4gYSBHdWlsZCB3aXRoIGp1c3Qgb25lIGNhbGwgKi9cbiAgYXN5bmMgYnVsa0VkaXQoXG4gICAgcGVybWlzc2lvbnM6IEd1aWxkU2xhc2hDb21tbWFuZFBlcm1pc3Npb25zUGFydGlhbFtdLFxuICAgIGd1aWxkPzogR3VpbGQgfCBzdHJpbmdcbiAgKTogUHJvbWlzZTxHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25zW10+IHtcbiAgICBndWlsZCA9IGd1aWxkID8/IHRoaXMuZ3VpbGRJRFxuICAgIGlmIChndWlsZCA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ0d1aWxkIGFyZ3VtZW50IG5vdCBwcm92aWRlZCcpXG4gICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMucmVzdC5hcGkuYXBwbGljYXRpb25zW3RoaXMuc2xhc2guZ2V0SUQoKV0uZ3VpbGRzW1xuICAgICAgdHlwZW9mIGd1aWxkID09PSAnc3RyaW5nJyA/IGd1aWxkIDogZ3VpbGQuaWRcbiAgICBdLmNvbW1hbmRzLnBlcm1pc3Npb25zLnB1dChcbiAgICAgIHBlcm1pc3Npb25zLm1hcCh0cmFuc2Zvcm1BcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9ucylcbiAgICApXG4gICAgcmV0dXJuIGRhdGEubWFwKHRyYW5zZm9ybUFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25zUGF5bG9hZClcbiAgfVxuXG4gIGFzeW5jICpbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25zPiB7XG4gICAgZm9yIChjb25zdCBwZXJtIG9mIGF3YWl0IHRoaXMuYWxsKCkpIHtcbiAgICAgIHlpZWxkIHBlcm1cbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbnNNYW5hZ2VyIGFzIFNsYXNoQ29tbWFuZFBlcm1pc3Npb25zTWFuYWdlciB9XG5cbi8qKiBNYW5hZ2VzIFNsYXNoIENvbW1hbmRzLCBhbGxvd3MgZmV0Y2hpbmcvbW9kaWZ5aW5nL2RlbGV0aW5nL2NyZWF0aW5nIFNsYXNoIENvbW1hbmRzLiAqL1xuZXhwb3J0IGNsYXNzIEFwcGxpY2F0aW9uQ29tbWFuZHNNYW5hZ2VyIHtcbiAgcmVhZG9ubHkgc2xhc2ghOiBJbnRlcmFjdGlvbnNDbGllbnRcbiAgcmVhZG9ubHkgcmVzdCE6IFJFU1RNYW5hZ2VyXG4gIHJlYWRvbmx5IHBlcm1pc3Npb25zITogQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbnNNYW5hZ2VyXG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBJbnRlcmFjdGlvbnNDbGllbnQpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3NsYXNoJywgeyB2YWx1ZTogY2xpZW50LCBlbnVtZXJhYmxlOiBmYWxzZSB9KVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAncmVzdCcsIHtcbiAgICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgICAgdmFsdWU6IGNsaWVudC5yZXN0XG4gICAgfSlcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Blcm1pc3Npb25zJywge1xuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogbmV3IEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25zTWFuYWdlcih0aGlzLnNsYXNoKVxuICAgIH0pXG4gIH1cblxuICAvKiogR2V0IGFsbCBHbG9iYWwgU2xhc2ggQ29tbWFuZHMgKi9cbiAgYXN5bmMgYWxsKCk6IFByb21pc2U8Q29sbGVjdGlvbjxzdHJpbmcsIEFwcGxpY2F0aW9uQ29tbWFuZD4+IHtcbiAgICBjb25zdCBjb2wgPSBuZXcgQ29sbGVjdGlvbjxzdHJpbmcsIEFwcGxpY2F0aW9uQ29tbWFuZD4oKVxuXG4gICAgY29uc3QgcmVzID0gKGF3YWl0IHRoaXMucmVzdC5hcGkuYXBwbGljYXRpb25zW1xuICAgICAgdGhpcy5zbGFzaC5nZXRJRCgpXG4gICAgXS5jb21tYW5kcy5nZXQoKSkgYXMgQXBwbGljYXRpb25Db21tYW5kUGF5bG9hZFtdXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJlcykpIHJldHVybiBjb2xcblxuICAgIGZvciAoY29uc3QgcmF3IG9mIHJlcykge1xuICAgICAgY29uc3QgY21kID0gbmV3IEFwcGxpY2F0aW9uQ29tbWFuZCh0aGlzLCByYXcpXG4gICAgICBjb2wuc2V0KHJhdy5pZCwgY21kKVxuICAgIH1cblxuICAgIHJldHVybiBjb2xcbiAgfVxuXG4gIC8qKiBHZXQgYSBHdWlsZCdzIFNsYXNoIENvbW1hbmRzICovXG4gIGFzeW5jIGd1aWxkKFxuICAgIGd1aWxkOiBHdWlsZCB8IHN0cmluZ1xuICApOiBQcm9taXNlPENvbGxlY3Rpb248c3RyaW5nLCBBcHBsaWNhdGlvbkNvbW1hbmQ+PiB7XG4gICAgY29uc3QgY29sID0gbmV3IENvbGxlY3Rpb248c3RyaW5nLCBBcHBsaWNhdGlvbkNvbW1hbmQ+KClcblxuICAgIGNvbnN0IHJlcyA9IChhd2FpdCB0aGlzLnJlc3QuYXBpLmFwcGxpY2F0aW9uc1t0aGlzLnNsYXNoLmdldElEKCldLmd1aWxkc1tcbiAgICAgIHR5cGVvZiBndWlsZCA9PT0gJ3N0cmluZycgPyBndWlsZCA6IGd1aWxkLmlkXG4gICAgXS5jb21tYW5kcy5nZXQoKSkgYXMgQXBwbGljYXRpb25Db21tYW5kUGF5bG9hZFtdXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHJlcykpIHJldHVybiBjb2xcblxuICAgIGNvbnN0IF9ndWlsZCA9XG4gICAgICB0eXBlb2YgZ3VpbGQgPT09ICdvYmplY3QnXG4gICAgICAgID8gZ3VpbGRcbiAgICAgICAgOiBhd2FpdCB0aGlzLnNsYXNoLmNsaWVudD8uZ3VpbGRzLmdldChndWlsZClcblxuICAgIGZvciAoY29uc3QgcmF3IG9mIHJlcykge1xuICAgICAgY29uc3QgY21kID0gbmV3IEFwcGxpY2F0aW9uQ29tbWFuZCh0aGlzLCByYXcsIF9ndWlsZClcbiAgICAgIGNtZC5ndWlsZElEID0gdHlwZW9mIGd1aWxkID09PSAnc3RyaW5nJyA/IGd1aWxkIDogZ3VpbGQuaWRcbiAgICAgIGNvbC5zZXQocmF3LmlkLCBjbWQpXG4gICAgfVxuXG4gICAgcmV0dXJuIGNvbFxuICB9XG5cbiAgZm9yKGd1aWxkOiBHdWlsZCB8IHN0cmluZyk6IEd1aWxkQXBwbGljYXRpb25Db21tYW5kc01hbmFnZXIge1xuICAgIHJldHVybiBuZXcgR3VpbGRBcHBsaWNhdGlvbkNvbW1hbmRzTWFuYWdlcih0aGlzLnNsYXNoLCBndWlsZClcbiAgfVxuXG4gIC8qKiBDcmVhdGUgYSBTbGFzaCBDb21tYW5kIChnbG9iYWwgb3IgR3VpbGQpICovXG4gIGFzeW5jIGNyZWF0ZShcbiAgICBkYXRhOiBBcHBsaWNhdGlvbkNvbW1hbmRQYXJ0aWFsLFxuICAgIGd1aWxkPzogR3VpbGQgfCBzdHJpbmdcbiAgKTogUHJvbWlzZTxBcHBsaWNhdGlvbkNvbW1hbmQ+IHtcbiAgICBjb25zdCByb3V0ZSA9XG4gICAgICBndWlsZCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gdGhpcy5yZXN0LmFwaS5hcHBsaWNhdGlvbnNbdGhpcy5zbGFzaC5nZXRJRCgpXS5jb21tYW5kc1xuICAgICAgICA6IHRoaXMucmVzdC5hcGkuYXBwbGljYXRpb25zW3RoaXMuc2xhc2guZ2V0SUQoKV0uZ3VpbGRzW1xuICAgICAgICAgICAgdHlwZW9mIGd1aWxkID09PSAnc3RyaW5nJyA/IGd1aWxkIDogZ3VpbGQuaWRcbiAgICAgICAgICBdLmNvbW1hbmRzXG5cbiAgICBjb25zdCBwYXlsb2FkID0gYXdhaXQgcm91dGUucG9zdCh0cmFuc2Zvcm1BcHBsaWNhdGlvbkNvbW1hbmQoZGF0YSkpXG5cbiAgICBjb25zdCBfZ3VpbGQgPVxuICAgICAgdHlwZW9mIGd1aWxkID09PSAnb2JqZWN0J1xuICAgICAgICA/IGd1aWxkXG4gICAgICAgIDogZ3VpbGQgPT09IHVuZGVmaW5lZFxuICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICA6IGF3YWl0IHRoaXMuc2xhc2guY2xpZW50Py5ndWlsZHMuZ2V0KGd1aWxkKVxuXG4gICAgY29uc3QgY21kID0gbmV3IEFwcGxpY2F0aW9uQ29tbWFuZCh0aGlzLCBwYXlsb2FkLCBfZ3VpbGQpXG4gICAgY21kLmd1aWxkSUQgPVxuICAgICAgdHlwZW9mIGd1aWxkID09PSAnc3RyaW5nJyB8fCBndWlsZCA9PT0gdW5kZWZpbmVkID8gZ3VpbGQgOiBndWlsZC5pZFxuXG4gICAgcmV0dXJuIGNtZFxuICB9XG5cbiAgLyoqIEVkaXQgYSBTbGFzaCBDb21tYW5kIChnbG9iYWwgb3IgR3VpbGQpICovXG4gIGFzeW5jIGVkaXQoXG4gICAgaWQ6IHN0cmluZyxcbiAgICBkYXRhOiBBcHBsaWNhdGlvbkNvbW1hbmRQYXJ0aWFsLFxuICAgIGd1aWxkPzogR3VpbGQgfCBzdHJpbmdcbiAgKTogUHJvbWlzZTxBcHBsaWNhdGlvbkNvbW1hbmQ+IHtcbiAgICBjb25zdCByb3V0ZSA9XG4gICAgICBndWlsZCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gdGhpcy5yZXN0LmFwaS5hcHBsaWNhdGlvbnNbdGhpcy5zbGFzaC5nZXRJRCgpXS5jb21tYW5kc1tpZF1cbiAgICAgICAgOiB0aGlzLnJlc3QuYXBpLmFwcGxpY2F0aW9uc1t0aGlzLnNsYXNoLmdldElEKCldLmd1aWxkc1tcbiAgICAgICAgICAgIHR5cGVvZiBndWlsZCA9PT0gJ3N0cmluZycgPyBndWlsZCA6IGd1aWxkLmlkXG4gICAgICAgICAgXS5jb21tYW5kc1tpZF1cblxuICAgIGNvbnN0IGQgPSBhd2FpdCByb3V0ZS5wYXRjaCh0cmFuc2Zvcm1BcHBsaWNhdGlvbkNvbW1hbmQoZGF0YSkpXG4gICAgY29uc3QgX2d1aWxkID1cbiAgICAgIChhd2FpdCB0aGlzLnNsYXNoLmNsaWVudD8uZ3VpbGRzLmdldChkLmd1aWxkX2lkKSkgPz9cbiAgICAgICh0eXBlb2YgZ3VpbGQgPT09ICdvYmplY3QnID8gZ3VpbGQgOiB1bmRlZmluZWQpXG4gICAgY29uc3QgY21kID0gbmV3IEFwcGxpY2F0aW9uQ29tbWFuZCh0aGlzLCBkLCBfZ3VpbGQpXG4gICAgaWYgKCdndWlsZF9pZCcgaW4gZCkgY21kLmd1aWxkSUQgPSBkLmd1aWxkSURcbiAgICByZXR1cm4gY21kXG4gIH1cblxuICAvKiogRGVsZXRlIGEgU2xhc2ggQ29tbWFuZCAoZ2xvYmFsIG9yIEd1aWxkKSAqL1xuICBhc3luYyBkZWxldGUoXG4gICAgaWQ6IHN0cmluZyxcbiAgICBndWlsZD86IEd1aWxkIHwgc3RyaW5nXG4gICk6IFByb21pc2U8QXBwbGljYXRpb25Db21tYW5kc01hbmFnZXI+IHtcbiAgICBjb25zdCByb3V0ZSA9XG4gICAgICBndWlsZCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gdGhpcy5yZXN0LmFwaS5hcHBsaWNhdGlvbnNbdGhpcy5zbGFzaC5nZXRJRCgpXS5jb21tYW5kc1tpZF1cbiAgICAgICAgOiB0aGlzLnJlc3QuYXBpLmFwcGxpY2F0aW9uc1t0aGlzLnNsYXNoLmdldElEKCldLmd1aWxkc1tcbiAgICAgICAgICAgIHR5cGVvZiBndWlsZCA9PT0gJ3N0cmluZycgPyBndWlsZCA6IGd1aWxkLmlkXG4gICAgICAgICAgXS5jb21tYW5kc1tpZF1cblxuICAgIGF3YWl0IHJvdXRlLmRlbGV0ZSgpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBHZXQgYSBTbGFzaCBDb21tYW5kIChnbG9iYWwgb3IgR3VpbGQpICovXG4gIGFzeW5jIGdldChpZDogc3RyaW5nLCBndWlsZD86IEd1aWxkIHwgc3RyaW5nKTogUHJvbWlzZTxBcHBsaWNhdGlvbkNvbW1hbmQ+IHtcbiAgICBjb25zdCByb3V0ZSA9XG4gICAgICBndWlsZCA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gdGhpcy5yZXN0LmFwaS5hcHBsaWNhdGlvbnNbdGhpcy5zbGFzaC5nZXRJRCgpXS5jb21tYW5kc1tpZF1cbiAgICAgICAgOiB0aGlzLnJlc3QuYXBpLmFwcGxpY2F0aW9uc1t0aGlzLnNsYXNoLmdldElEKCldLmd1aWxkc1tcbiAgICAgICAgICAgIHR5cGVvZiBndWlsZCA9PT0gJ3N0cmluZycgPyBndWlsZCA6IGd1aWxkLmlkXG4gICAgICAgICAgXS5jb21tYW5kc1tpZF1cblxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByb3V0ZS5nZXQoKVxuXG4gICAgY29uc3QgX2d1aWxkID1cbiAgICAgIHR5cGVvZiBndWlsZCA9PT0gJ29iamVjdCdcbiAgICAgICAgPyBndWlsZFxuICAgICAgICA6IGd1aWxkID09PSB1bmRlZmluZWRcbiAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgOiBhd2FpdCB0aGlzLnNsYXNoLmNsaWVudD8uZ3VpbGRzLmdldChndWlsZClcblxuICAgIHJldHVybiBuZXcgQXBwbGljYXRpb25Db21tYW5kKHRoaXMsIGRhdGEsIF9ndWlsZClcbiAgfVxuXG4gIC8qKiBCdWxrIEVkaXQgR2xvYmFsIG9yIEd1aWxkIFNsYXNoIENvbW1hbmRzICovXG4gIGFzeW5jIGJ1bGtFZGl0KFxuICAgIGNtZHM6IEFycmF5PEFwcGxpY2F0aW9uQ29tbWFuZFBhcnRpYWwgJiB7IGlkPzogc3RyaW5nIH0+LFxuICAgIGd1aWxkPzogR3VpbGQgfCBzdHJpbmdcbiAgKTogUHJvbWlzZTxDb2xsZWN0aW9uPHN0cmluZywgQXBwbGljYXRpb25Db21tYW5kPj4ge1xuICAgIGNvbnN0IHJvdXRlID1cbiAgICAgIGd1aWxkID09PSB1bmRlZmluZWRcbiAgICAgICAgPyB0aGlzLnJlc3QuYXBpLmFwcGxpY2F0aW9uc1t0aGlzLnNsYXNoLmdldElEKCldLmNvbW1hbmRzXG4gICAgICAgIDogdGhpcy5yZXN0LmFwaS5hcHBsaWNhdGlvbnNbdGhpcy5zbGFzaC5nZXRJRCgpXS5ndWlsZHNbXG4gICAgICAgICAgICB0eXBlb2YgZ3VpbGQgPT09ICdzdHJpbmcnID8gZ3VpbGQgOiBndWlsZC5pZFxuICAgICAgICAgIF0uY29tbWFuZHNcblxuICAgIGNvbnN0IGQgPSBhd2FpdCByb3V0ZS5wdXQoY21kcy5tYXAodHJhbnNmb3JtQXBwbGljYXRpb25Db21tYW5kKSlcbiAgICBjb25zdCBjb2wgPSBuZXcgQ29sbGVjdGlvbjxzdHJpbmcsIEFwcGxpY2F0aW9uQ29tbWFuZD4oKVxuXG4gICAgY29uc3QgX2d1aWxkID1cbiAgICAgIHR5cGVvZiBndWlsZCA9PT0gJ29iamVjdCdcbiAgICAgICAgPyBndWlsZFxuICAgICAgICA6IHR5cGVvZiBndWlsZCA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBhd2FpdCB0aGlzLnNsYXNoLmNsaWVudD8uZ3VpbGRzLmdldChndWlsZClcbiAgICAgICAgOiB1bmRlZmluZWRcblxuICAgIGZvciAoY29uc3QgcmF3IG9mIGQpIHtcbiAgICAgIGNvbnN0IGNtZCA9IG5ldyBBcHBsaWNhdGlvbkNvbW1hbmQodGhpcywgcmF3LCBfZ3VpbGQpXG4gICAgICBjbWQuZ3VpbGRJRCA9IF9ndWlsZD8uaWRcbiAgICAgIGNtZC5ndWlsZCA9IF9ndWlsZFxuICAgICAgY29sLnNldChyYXcuaWQsIGNtZClcbiAgICB9XG5cbiAgICByZXR1cm4gY29sXG4gIH1cblxuICBhc3luYyAqW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8QXBwbGljYXRpb25Db21tYW5kPiB7XG4gICAgZm9yIChjb25zdCBbLCBjbWRdIG9mIGF3YWl0IHRoaXMuYWxsKCkpIHtcbiAgICAgIHlpZWxkIGNtZFxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgeyBBcHBsaWNhdGlvbkNvbW1hbmRzTWFuYWdlciBhcyBTbGFzaENvbW1hbmRzTWFuYWdlciB9XG5cbmV4cG9ydCBjbGFzcyBHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZHNNYW5hZ2VyIHtcbiAgcmVhZG9ubHkgc2xhc2ghOiBJbnRlcmFjdGlvbnNDbGllbnRcbiAgcmVhZG9ubHkgZ3VpbGQhOiBHdWlsZCB8IHN0cmluZ1xuICByZWFkb25seSBwZXJtaXNzaW9uczogQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbnNNYW5hZ2VyXG5cbiAgcHJpdmF0ZSBnZXQgY29tbWFuZHMoKTogQXBwbGljYXRpb25Db21tYW5kc01hbmFnZXIge1xuICAgIHJldHVybiB0aGlzLnNsYXNoLmNvbW1hbmRzXG4gIH1cblxuICBjb25zdHJ1Y3RvcihzbGFzaDogSW50ZXJhY3Rpb25zQ2xpZW50LCBndWlsZDogR3VpbGQgfCBzdHJpbmcpIHtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3NsYXNoJywge1xuICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICB2YWx1ZTogc2xhc2hcbiAgICB9KVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnZ3VpbGQnLCB7XG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICAgIHZhbHVlOiBndWlsZFxuICAgIH0pXG4gICAgdGhpcy5wZXJtaXNzaW9ucyA9IG5ldyBBcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uc01hbmFnZXIoXG4gICAgICB0aGlzLnNsYXNoLFxuICAgICAgdHlwZW9mIGd1aWxkID09PSAnb2JqZWN0JyA/IGd1aWxkLmlkIDogZ3VpbGRcbiAgICApXG4gIH1cblxuICBhc3luYyBnZXQoaWQ6IHN0cmluZyk6IFByb21pc2U8QXBwbGljYXRpb25Db21tYW5kPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29tbWFuZHMuZ2V0KGlkLCB0aGlzLmd1aWxkKVxuICB9XG5cbiAgYXN5bmMgZGVsZXRlKGlkOiBzdHJpbmcpOiBQcm9taXNlPEd1aWxkQXBwbGljYXRpb25Db21tYW5kc01hbmFnZXI+IHtcbiAgICBhd2FpdCB0aGlzLmNvbW1hbmRzLmRlbGV0ZShpZCwgdGhpcy5ndWlsZClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgYXN5bmMgYWxsKCk6IFByb21pc2U8Q29sbGVjdGlvbjxzdHJpbmcsIEFwcGxpY2F0aW9uQ29tbWFuZD4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb21tYW5kcy5ndWlsZCh0aGlzLmd1aWxkKVxuICB9XG5cbiAgYXN5bmMgYnVsa0VkaXQoXG4gICAgY29tbWFuZHM6IEFycmF5PEFwcGxpY2F0aW9uQ29tbWFuZFBhcnRpYWwgJiB7IGlkPzogc3RyaW5nIH0+XG4gICk6IFByb21pc2U8Q29sbGVjdGlvbjxzdHJpbmcsIEFwcGxpY2F0aW9uQ29tbWFuZD4+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5jb21tYW5kcy5idWxrRWRpdChjb21tYW5kcywgdGhpcy5ndWlsZClcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZShjbWQ6IEFwcGxpY2F0aW9uQ29tbWFuZFBhcnRpYWwpOiBQcm9taXNlPEFwcGxpY2F0aW9uQ29tbWFuZD4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmNvbW1hbmRzLmNyZWF0ZShjbWQsIHRoaXMuZ3VpbGQpXG4gIH1cblxuICBhc3luYyBlZGl0KFxuICAgIGlkOiBzdHJpbmcsXG4gICAgY21kOiBBcHBsaWNhdGlvbkNvbW1hbmRQYXJ0aWFsXG4gICk6IFByb21pc2U8QXBwbGljYXRpb25Db21tYW5kPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuY29tbWFuZHMuZWRpdChpZCwgY21kLCB0aGlzLmd1aWxkKVxuICB9XG5cbiAgYXN5bmMgKltTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPEFwcGxpY2F0aW9uQ29tbWFuZD4ge1xuICAgIGZvciAoY29uc3QgWywgY21kXSBvZiBhd2FpdCB0aGlzLmFsbCgpKSB7XG4gICAgICB5aWVsZCBjbWRcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IHsgR3VpbGRBcHBsaWNhdGlvbkNvbW1hbmRzTWFuYWdlciBhcyBHdWlsZFNsYXNoQ29tbWFuZHNNYW5hZ2VyIH1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxTQUNFLHNCQUFzQixFQU90Qiw0QkFBNEIsRUFNNUIsZ0NBQWdDLFFBQzNCLGlDQUFnQztBQUN2QyxTQUFT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