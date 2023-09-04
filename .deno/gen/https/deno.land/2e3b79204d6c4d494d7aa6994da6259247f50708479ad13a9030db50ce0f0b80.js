import { ApplicationCommandInteraction } from '../structures/applicationCommand.ts';
import { Interaction, InteractionChannel } from '../structures/interactions.ts';
import { InteractionType } from '../types/interactions.ts';
import { ApplicationCommandOptionType, ApplicationCommandType } from '../types/applicationCommand.ts';
import { RESTManager } from '../rest/mod.ts';
import { edverify, decodeHex, readAll } from '../../deps.ts';
import { User } from '../structures/user.ts';
import { HarmonyEventEmitter } from '../utils/events.ts';
import { decodeText, encodeText } from '../utils/encoding.ts';
import { ApplicationCommandsManager } from './applicationCommand.ts';
import { Application } from '../structures/application.ts';
import { Member } from '../structures/member.ts';
import { Guild } from '../structures/guild.ts';
import { Channel } from '../structures/channel.ts';
import { Role } from '../structures/role.ts';
import { Message } from '../structures/message.ts';
import { MessageComponentInteraction } from '../structures/messageComponents.ts';
import { AutocompleteInteraction } from '../structures/autocompleteInteraction.ts';
import { ModalSubmitInteraction } from '../structures/modalSubmitInteraction.ts';
/** Slash Client represents an Interactions Client which can be used without Harmony Client. */ export class InteractionsClient extends HarmonyEventEmitter {
    id;
    client;
    #token;
    get token() {
        return this.#token;
    }
    set token(val) {
        this.#token = val;
    }
    enabled = true;
    commands;
    handlers = [];
    autocompleteHandlers = [];
    rest;
    modules = [];
    publicKey;
    constructor(options){
        super();
        let id = options.id;
        if (options.token !== undefined) id = atob(options.token?.split('.')[0]);
        if (id === undefined) {
            throw new Error('ID could not be found. Pass at least client or token');
        }
        this.id = id;
        if (options.client !== undefined) {
            Object.defineProperty(this, 'client', {
                value: options.client,
                enumerable: false
            });
        }
        this.token = options.token;
        this.publicKey = options.publicKey;
        this.enabled = options.enabled ?? true;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const client = this.client;
        if (client?._decoratedAppCmd !== undefined) {
            client._decoratedAppCmd.forEach((e)=>{
                e.handler = e.handler.bind(this.client);
                this.handlers.push(e);
            });
        }
        if (client?._decoratedAutocomplete !== undefined) {
            client._decoratedAutocomplete.forEach((e)=>{
                e.handler = e.handler.bind(this.client);
                this.autocompleteHandlers.push(e);
            });
        }
        const self = this;
        if (self._decoratedAppCmd !== undefined) {
            self._decoratedAppCmd.forEach((e)=>{
                e.handler = e.handler.bind(this.client);
                self.handlers.push(e);
            });
        }
        if (self._decoratedAutocomplete !== undefined) {
            self._decoratedAutocomplete.forEach((e)=>{
                e.handler = e.handler.bind(this.client);
                self.autocompleteHandlers.push(e);
            });
        }
        Object.defineProperty(this, 'rest', {
            value: options.client === undefined ? options.rest === undefined ? new RESTManager({
                token: this.token
            }) : options.rest : options.client.rest,
            enumerable: false
        });
        this.client?.on('interactionCreate', async (interaction)=>await this._process(interaction));
        this.commands = new ApplicationCommandsManager(this);
    }
    getID() {
        return typeof this.id === 'string' ? this.id : this.id();
    }
    handle(cmd, handler, type) {
        const handle = {
            name: typeof cmd === 'string' ? cmd : cmd.name,
            ...handler !== undefined ? {
                handler
            } : {},
            ...typeof cmd === 'string' ? {} : cmd
        };
        if (type !== undefined) {
            handle.type = typeof type === 'string' ? ApplicationCommandType[type] : type;
        }
        if (handle.handler === undefined) {
            throw new Error('Invalid usage. Handler function not provided');
        }
        if ((handle.type === undefined || handle.type === ApplicationCommandType.CHAT_INPUT) && typeof handle.name === 'string' && handle.name.includes(' ') && handle.parent === undefined && handle.group === undefined) {
            const parts = handle.name.split(/ +/).filter((e)=>e !== '');
            if (parts.length > 3 || parts.length < 1) {
                throw new Error('Invalid command name');
            }
            const root = parts.shift();
            const group = parts.length === 2 ? parts.shift() : undefined;
            const sub = parts.shift();
            handle.name = sub ?? root;
            handle.group = group;
            handle.parent = sub === undefined ? undefined : root;
        }
        this.handlers.push(handle);
        return this;
    }
    /**
   * Add a handler for autocompletions (for application command options).
   *
   * @param cmd Command name. Can be `*`
   * @param option Option name. Can be `*`
   * @param handler Handler callback that is fired when a matching Autocomplete Interaction comes in.
   */ autocomplete(cmd, option, handler) {
        const handle = {
            cmd,
            option,
            handler
        };
        if (typeof handle.cmd === 'string' && handle.cmd.includes(' ') && handle.parent === undefined && handle.group === undefined) {
            const parts = handle.cmd.split(/ +/).filter((e)=>e !== '');
            if (parts.length > 3 || parts.length < 1) {
                throw new Error('Invalid command name');
            }
            const root = parts.shift();
            const group = parts.length === 2 ? parts.shift() : undefined;
            const sub = parts.shift();
            handle.cmd = sub ?? root;
            handle.group = group;
            handle.parent = sub === undefined ? undefined : root;
        }
        this.autocompleteHandlers.push(handle);
        return this;
    }
    /** Load a Slash Module */ loadModule(module) {
        this.modules.push(module);
        return this;
    }
    /** Get all Handlers. Including Slash Modules */ getHandlers() {
        let res = this.handlers;
        for (const mod of this.modules){
            if (mod === undefined) continue;
            res = [
                ...res,
                ...mod.commands.map((cmd)=>{
                    cmd.handler = cmd.handler.bind(mod);
                    return cmd;
                })
            ];
        }
        return res;
    }
    /** Get Handler for an Interaction. Supports nested sub commands and sub command groups. */ _getCommand(i) {
        return this.getHandlers().find((e)=>{
            if ((e.type === ApplicationCommandType.MESSAGE || e.type === ApplicationCommandType.USER) && i.targetID !== undefined && i.name === e.name) {
                return true;
            }
            const hasGroupOrParent = e.group !== undefined || e.parent !== undefined;
            const groupMatched = e.group !== undefined && e.parent !== undefined ? i.data.options?.find((o)=>o.name === e.group && o.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP)?.options?.find((o)=>o.name === e.name) !== undefined : true;
            const subMatched = e.group === undefined && e.parent !== undefined ? i.data.options?.find((o)=>o.name === e.name && o.type === ApplicationCommandOptionType.SUB_COMMAND) !== undefined : true;
            const nameMatched1 = e.name === i.name;
            const parentMatched = hasGroupOrParent ? e.parent === i.name : true;
            const nameMatched = hasGroupOrParent ? parentMatched : nameMatched1;
            const matched = groupMatched && subMatched && nameMatched;
            return matched;
        });
    }
    /** Get Handler for an autocomplete Interaction. Supports nested sub commands and sub command groups. */ _getAutocompleteHandler(i) {
        return [
            ...this.autocompleteHandlers,
            ...this.modules.map((e)=>e.autocomplete).flat()
        ].find((e)=>{
            if (i.targetID !== undefined && i.name === e.cmd) {
                return true;
            }
            const hasGroupOrParent = e.group !== undefined || e.parent !== undefined;
            const groupMatched = e.group !== undefined && e.parent !== undefined ? i.data.options?.find((o)=>o.name === e.group && o.type === ApplicationCommandOptionType.SUB_COMMAND_GROUP)?.options?.find((o)=>o.name === e.cmd) !== undefined : true;
            const subMatched = e.group === undefined && e.parent !== undefined ? i.data.options?.find((o)=>o.name === e.cmd && o.type === ApplicationCommandOptionType.SUB_COMMAND) !== undefined : true;
            const nameMatched1 = e.cmd === i.name;
            const parentMatched = hasGroupOrParent ? e.parent === i.name : true;
            const nameMatched = hasGroupOrParent ? parentMatched : nameMatched1;
            const optionMatched = // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            i.options.some((o)=>o.name === e.option && o.focused) || e.option === '*';
            const matched = groupMatched && subMatched && nameMatched && optionMatched;
            return matched;
        });
    }
    /** Process an incoming Interaction */ async _process(interaction) {
        if (!this.enabled) return;
        await this.emit('interaction', interaction);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (interaction.isAutocomplete()) {
            const handle = this._getAutocompleteHandler(interaction) ?? [
                ...this.autocompleteHandlers,
                ...this.modules.map((e)=>e.autocomplete).flat()
            ].find((e)=>e.cmd === '*');
            try {
                await handle?.handler(interaction);
            } catch (e) {
                await this.emit('interactionError', e);
            }
            return;
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!interaction.isApplicationCommand()) return;
        const cmd = this._getCommand(interaction) ?? this.getHandlers().find((e)=>e.name === '*');
        if (cmd === undefined) return;
        try {
            await cmd.handler(interaction);
        } catch (e1) {
            await this.emit('interactionError', e1);
        }
    }
    /** Verify HTTP based Interaction */ verifyKey(rawBody, signature, timestamp) {
        if (this.publicKey === undefined) {
            throw new Error('Public Key is not present');
        }
        const fullBody = new Uint8Array([
            ...typeof timestamp === 'string' ? encodeText(timestamp) : timestamp,
            ...typeof rawBody === 'string' ? encodeText(rawBody) : rawBody
        ]);
        return edverify(decodeHex(encodeText(this.publicKey)), decodeHex(signature instanceof Uint8Array ? signature : encodeText(signature)), fullBody);
    }
    /**
   * Verify [Deno Std HTTP Server Request](https://deno.land/std/http/server.ts) and return Interaction.
   *
   * **Data present in Interaction returned by this method is very different from actual typings
   * as there is no real `Client` behind the scenes to cache things.**
   */ async verifyServerRequest(req) {
        if (req.method.toLowerCase() !== 'post') return false;
        const signature = req.headers.get('x-signature-ed25519');
        const timestamp = req.headers.get('x-signature-timestamp');
        if (signature === null || timestamp === null) return false;
        const rawbody = req.body instanceof Uint8Array ? req.body : await readAll(req.body);
        const verify = this.verifyKey(rawbody, signature, timestamp);
        if (!verify) return false;
        try {
            const payload = JSON.parse(decodeText(rawbody));
            // Note: there's a lot of hacks going on here.
            const client = this;
            let res;
            const channel = payload.channel_id !== undefined ? new Channel(client, {
                id: payload.channel_id,
                type: 0,
                flags: 0
            }) : undefined;
            const user = new User(client, payload.member?.user ?? payload.user);
            const guild = payload.guild_id !== undefined ? new Guild(client, {
                id: payload.guild_id,
                unavailable: true
            }) : undefined;
            const member = payload.member !== undefined ? new Member(client, payload.member, user, guild) : undefined;
            if (payload.type === InteractionType.APPLICATION_COMMAND || payload.type === InteractionType.AUTOCOMPLETE) {
                const resolved = {
                    users: {},
                    members: {},
                    roles: {},
                    channels: {},
                    messages: {}
                };
                for (const [id, data] of Object.entries(// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                payload.data.resolved?.users ?? {})){
                    resolved.users[id] = new User(client, data);
                }
                for (const [id1, data1] of Object.entries(// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                payload.data.resolved?.members ?? {})){
                    resolved.members[id1] = new Member(client, data1, resolved.users[id1], undefined);
                }
                for (const [id2, data2] of Object.entries(// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                payload.data.resolved?.roles ?? {})){
                    resolved.roles[id2] = new Role(client, data2, undefined);
                }
                for (const [id3, data3] of Object.entries(// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                payload.data.resolved?.channels ?? {})){
                    resolved.channels[id3] = new InteractionChannel(client, data3);
                }
                for (const [id4, data4] of Object.entries(// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
                payload.data.resolved?.messages ?? {})){
                    resolved.messages[id4] = new Message(client, data4, data4.channel_id, new User(client, data4.author));
                }
                res = payload.type === InteractionType.APPLICATION_COMMAND ? new ApplicationCommandInteraction(client, payload, {
                    user,
                    member,
                    guild,
                    channel,
                    resolved
                }) : new AutocompleteInteraction(client, payload, {
                    user,
                    member,
                    guild,
                    channel,
                    resolved
                });
            } else if (payload.type === InteractionType.MODAL_SUBMIT) {
                res = new ModalSubmitInteraction(client, payload, {
                    channel,
                    guild,
                    member,
                    user
                });
            } else if (payload.type === InteractionType.MESSAGE_COMPONENT) {
                res = new MessageComponentInteraction(client, payload, {
                    channel,
                    guild,
                    member,
                    user,
                    message: new Message(client, payload.message, payload.message.channel_id, new User(client, payload.message.author))
                });
            } else {
                res = new Interaction(client, payload, {
                    user,
                    member,
                    guild,
                    channel
                });
            }
            res._httpRespond = async (d)=>await req.respond({
                    status: 200,
                    headers: new Headers({
                        'content-type': d instanceof FormData ? 'multipart/form-data' : 'application/json'
                    }),
                    body: d instanceof FormData ? d : JSON.stringify(d)
                });
            await this.emit('interaction', res);
            return res;
        } catch (e) {
            return false;
        }
    }
    /** Verify FetchEvent (for Service Worker usage) and return Interaction if valid */ async verifyFetchEvent({ request: req , respondWith  }) {
        if (req.bodyUsed === true) throw new Error('Request Body already used');
        if (req.body === null) return false;
        const body = new Uint8Array(await req.arrayBuffer());
        return await this.verifyServerRequest({
            headers: req.headers,
            body,
            method: req.method,
            respond: async (options)=>{
                await respondWith(new Response(options.body, {
                    headers: options.headers,
                    status: options.status
                }));
            }
        });
    }
    async verifyOpineRequest(req) {
        const signature = req.headers.get('x-signature-ed25519');
        const timestamp = req.headers.get('x-signature-timestamp');
        const contentLength = req.headers.get('content-length');
        if (signature === null || timestamp === null || contentLength === null) {
            return false;
        }
        const body = new Uint8Array(parseInt(contentLength));
        await req.body.read(body);
        const verified = await this.verifyKey(body, signature, timestamp);
        if (!verified) return false;
        return true;
    }
    /** Middleware to verify request in Opine framework. */ async verifyOpineMiddleware(req, res, next) {
        const verified = await this.verifyOpineRequest(req);
        if (!verified) {
            res.setStatus(401).end();
            return false;
        }
        await next();
        return true;
    }
    // TODO: create verifyOakMiddleware too
    /** Method to verify Request from Oak server "Context". */ async verifyOakRequest(ctx) {
        const signature = ctx.request.headers.get('x-signature-ed25519');
        const timestamp = ctx.request.headers.get('x-signature-timestamp');
        const contentLength = ctx.request.headers.get('content-length');
        if (signature === null || timestamp === null || contentLength === null || !ctx.request.hasBody) {
            return false;
        }
        const body = await ctx.request.body().value;
        const verified = await this.verifyKey(body, signature, timestamp);
        if (!verified) return false;
        return true;
    }
    /** Fetch Application of the Client (if Token is present) */ async fetchApplication() {
        const app = await this.rest.api.oauth2.applications['@me'].get();
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        return new Application(this.client, app);
    }
}
export { InteractionsClient as SlashClient };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2ludGVyYWN0aW9ucy9jbGllbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQXBwbGljYXRpb25Db21tYW5kSW50ZXJhY3Rpb24sXG4gIEludGVyYWN0aW9uQXBwbGljYXRpb25Db21tYW5kUmVzb2x2ZWRcbn0gZnJvbSAnLi4vc3RydWN0dXJlcy9hcHBsaWNhdGlvbkNvbW1hbmQudHMnXG5pbXBvcnQgeyBJbnRlcmFjdGlvbiwgSW50ZXJhY3Rpb25DaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9pbnRlcmFjdGlvbnMudHMnXG5pbXBvcnQge1xuICBJbnRlcmFjdGlvblBheWxvYWQsXG4gIEludGVyYWN0aW9uUmVzcG9uc2VQYXlsb2FkLFxuICBJbnRlcmFjdGlvblR5cGVcbn0gZnJvbSAnLi4vdHlwZXMvaW50ZXJhY3Rpb25zLnRzJ1xuaW1wb3J0IHtcbiAgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZSxcbiAgQXBwbGljYXRpb25Db21tYW5kVHlwZSxcbiAgSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmREYXRhXG59IGZyb20gJy4uL3R5cGVzL2FwcGxpY2F0aW9uQ29tbWFuZC50cydcbmltcG9ydCB0eXBlIHsgQ2xpZW50IH0gZnJvbSAnLi4vY2xpZW50L21vZC50cydcbmltcG9ydCB7IFJFU1RNYW5hZ2VyIH0gZnJvbSAnLi4vcmVzdC9tb2QudHMnXG5pbXBvcnQgeyBBcHBsaWNhdGlvbkNvbW1hbmRzTW9kdWxlIH0gZnJvbSAnLi9jb21tYW5kTW9kdWxlLnRzJ1xuaW1wb3J0IHsgZWR2ZXJpZnksIGRlY29kZUhleCwgcmVhZEFsbCB9IGZyb20gJy4uLy4uL2RlcHMudHMnXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vc3RydWN0dXJlcy91c2VyLnRzJ1xuaW1wb3J0IHsgSGFybW9ueUV2ZW50RW1pdHRlciB9IGZyb20gJy4uL3V0aWxzL2V2ZW50cy50cydcbmltcG9ydCB7IGRlY29kZVRleHQsIGVuY29kZVRleHQgfSBmcm9tICcuLi91dGlscy9lbmNvZGluZy50cydcbmltcG9ydCB7IEFwcGxpY2F0aW9uQ29tbWFuZHNNYW5hZ2VyIH0gZnJvbSAnLi9hcHBsaWNhdGlvbkNvbW1hbmQudHMnXG5pbXBvcnQgeyBBcHBsaWNhdGlvbiB9IGZyb20gJy4uL3N0cnVjdHVyZXMvYXBwbGljYXRpb24udHMnXG5pbXBvcnQgeyBNZW1iZXIgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL21lbWJlci50cydcbmltcG9ydCB7IEd1aWxkIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9ndWlsZC50cydcbmltcG9ydCB7IEd1aWxkUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzL2d1aWxkLnRzJ1xuaW1wb3J0IHsgQ2hhbm5lbCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvY2hhbm5lbC50cydcbmltcG9ydCB7IFRleHRDaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy90ZXh0Q2hhbm5lbC50cydcbmltcG9ydCB7IFJvbGUgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL3JvbGUudHMnXG5pbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9tZXNzYWdlLnRzJ1xuaW1wb3J0IHsgTWVzc2FnZUNvbXBvbmVudEludGVyYWN0aW9uIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9tZXNzYWdlQ29tcG9uZW50cy50cydcbmltcG9ydCB7IEF1dG9jb21wbGV0ZUludGVyYWN0aW9uIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9hdXRvY29tcGxldGVJbnRlcmFjdGlvbi50cydcbmltcG9ydCB7IE1vZGFsU3VibWl0SW50ZXJhY3Rpb24gfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL21vZGFsU3VibWl0SW50ZXJhY3Rpb24udHMnXG5cbmV4cG9ydCB0eXBlIEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFjayA9IChcbiAgaW50ZXJhY3Rpb246IEFwcGxpY2F0aW9uQ29tbWFuZEludGVyYWN0aW9uXG4pID0+IGFueSAvLyBBbnkgdG8gaW5jbHVkZSBib3RoIHN5bmMgYW5kIGFzeW5jIHJldHVybiB0eXBlc1xuXG5leHBvcnQgaW50ZXJmYWNlIEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXIge1xuICBuYW1lOiBzdHJpbmdcbiAgdHlwZT86IEFwcGxpY2F0aW9uQ29tbWFuZFR5cGVcbiAgZ3VpbGQ/OiBzdHJpbmdcbiAgcGFyZW50Pzogc3RyaW5nXG4gIGdyb3VwPzogc3RyaW5nXG4gIGhhbmRsZXI6IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFja1xufVxuXG4vLyBEZXByZWNhdGVkXG5leHBvcnQgdHlwZSB7IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFjayBhcyBTbGFzaENvbW1hbmRIYW5kbGVyQ2FsbGJhY2sgfVxuZXhwb3J0IHR5cGUgeyBBcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyIGFzIFNsYXNoQ29tbWFuZEhhbmRsZXIgfVxuXG5leHBvcnQgdHlwZSBBdXRvY29tcGxldGVIYW5kbGVyQ2FsbGJhY2sgPSAoZDogQXV0b2NvbXBsZXRlSW50ZXJhY3Rpb24pID0+IGFueVxuXG5leHBvcnQgaW50ZXJmYWNlIEF1dG9jb21wbGV0ZUhhbmRsZXIge1xuICBjbWQ6IHN0cmluZ1xuICBvcHRpb246IHN0cmluZ1xuICBwYXJlbnQ/OiBzdHJpbmdcbiAgZ3JvdXA/OiBzdHJpbmdcbiAgaGFuZGxlcjogQXV0b2NvbXBsZXRlSGFuZGxlckNhbGxiYWNrXG59XG5cbi8qKiBPcHRpb25zIGZvciBJbnRlcmFjdGlvbnNDbGllbnQgKi9cbmV4cG9ydCBpbnRlcmZhY2UgU2xhc2hPcHRpb25zIHtcbiAgaWQ/OiBzdHJpbmcgfCAoKCkgPT4gc3RyaW5nKVxuICBjbGllbnQ/OiBDbGllbnRcbiAgZW5hYmxlZD86IGJvb2xlYW5cbiAgdG9rZW4/OiBzdHJpbmdcbiAgcmVzdD86IFJFU1RNYW5hZ2VyXG4gIHB1YmxpY0tleT86IHN0cmluZ1xufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2NvbnNpc3RlbnQtdHlwZS1kZWZpbml0aW9uc1xuZXhwb3J0IHR5cGUgSW50ZXJhY3Rpb25zQ2xpZW50RXZlbnRzID0ge1xuICBpbnRlcmFjdGlvbjogW0ludGVyYWN0aW9uXVxuICBpbnRlcmFjdGlvbkVycm9yOiBbRXJyb3JdXG4gIHBpbmc6IFtdXG59XG5cbi8qKiBTbGFzaCBDbGllbnQgcmVwcmVzZW50cyBhbiBJbnRlcmFjdGlvbnMgQ2xpZW50IHdoaWNoIGNhbiBiZSB1c2VkIHdpdGhvdXQgSGFybW9ueSBDbGllbnQuICovXG5leHBvcnQgY2xhc3MgSW50ZXJhY3Rpb25zQ2xpZW50IGV4dGVuZHMgSGFybW9ueUV2ZW50RW1pdHRlcjxJbnRlcmFjdGlvbnNDbGllbnRFdmVudHM+IHtcbiAgaWQ6IHN0cmluZyB8ICgoKSA9PiBzdHJpbmcpXG4gIGNsaWVudD86IENsaWVudFxuXG4gICN0b2tlbj86IHN0cmluZ1xuXG4gIGdldCB0b2tlbigpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLiN0b2tlblxuICB9XG5cbiAgc2V0IHRva2VuKHZhbDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy4jdG9rZW4gPSB2YWxcbiAgfVxuXG4gIGVuYWJsZWQ6IGJvb2xlYW4gPSB0cnVlXG4gIGNvbW1hbmRzOiBBcHBsaWNhdGlvbkNvbW1hbmRzTWFuYWdlclxuICBoYW5kbGVyczogQXBwbGljYXRpb25Db21tYW5kSGFuZGxlcltdID0gW11cbiAgYXV0b2NvbXBsZXRlSGFuZGxlcnM6IEF1dG9jb21wbGV0ZUhhbmRsZXJbXSA9IFtdXG4gIHJlYWRvbmx5IHJlc3QhOiBSRVNUTWFuYWdlclxuICBtb2R1bGVzOiBBcHBsaWNhdGlvbkNvbW1hbmRzTW9kdWxlW10gPSBbXVxuICBwdWJsaWNLZXk/OiBzdHJpbmdcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBTbGFzaE9wdGlvbnMpIHtcbiAgICBzdXBlcigpXG4gICAgbGV0IGlkID0gb3B0aW9ucy5pZFxuICAgIGlmIChvcHRpb25zLnRva2VuICE9PSB1bmRlZmluZWQpIGlkID0gYXRvYihvcHRpb25zLnRva2VuPy5zcGxpdCgnLicpWzBdKVxuICAgIGlmIChpZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0lEIGNvdWxkIG5vdCBiZSBmb3VuZC4gUGFzcyBhdCBsZWFzdCBjbGllbnQgb3IgdG9rZW4nKVxuICAgIH1cbiAgICB0aGlzLmlkID0gaWRcblxuICAgIGlmIChvcHRpb25zLmNsaWVudCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NsaWVudCcsIHtcbiAgICAgICAgdmFsdWU6IG9wdGlvbnMuY2xpZW50LFxuICAgICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgICAgfSlcbiAgICB9XG5cbiAgICB0aGlzLnRva2VuID0gb3B0aW9ucy50b2tlblxuICAgIHRoaXMucHVibGljS2V5ID0gb3B0aW9ucy5wdWJsaWNLZXlcblxuICAgIHRoaXMuZW5hYmxlZCA9IG9wdGlvbnMuZW5hYmxlZCA/PyB0cnVlXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgY29uc3QgY2xpZW50ID0gdGhpcy5jbGllbnQgYXMgdW5rbm93biBhcyB7XG4gICAgICBfZGVjb3JhdGVkQXBwQ21kOiBBcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyW11cbiAgICAgIF9kZWNvcmF0ZWRBdXRvY29tcGxldGU6IEF1dG9jb21wbGV0ZUhhbmRsZXJbXVxuICAgIH1cbiAgICBpZiAoY2xpZW50Py5fZGVjb3JhdGVkQXBwQ21kICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsaWVudC5fZGVjb3JhdGVkQXBwQ21kLmZvckVhY2goKGUpID0+IHtcbiAgICAgICAgZS5oYW5kbGVyID0gZS5oYW5kbGVyLmJpbmQodGhpcy5jbGllbnQpXG4gICAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBpZiAoY2xpZW50Py5fZGVjb3JhdGVkQXV0b2NvbXBsZXRlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsaWVudC5fZGVjb3JhdGVkQXV0b2NvbXBsZXRlLmZvckVhY2goKGUpID0+IHtcbiAgICAgICAgZS5oYW5kbGVyID0gZS5oYW5kbGVyLmJpbmQodGhpcy5jbGllbnQpXG4gICAgICAgIHRoaXMuYXV0b2NvbXBsZXRlSGFuZGxlcnMucHVzaChlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBjb25zdCBzZWxmID0gdGhpcyBhcyB1bmtub3duIGFzIEludGVyYWN0aW9uc0NsaWVudCAmIHtcbiAgICAgIF9kZWNvcmF0ZWRBcHBDbWQ6IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJbXVxuICAgICAgX2RlY29yYXRlZEF1dG9jb21wbGV0ZTogQXV0b2NvbXBsZXRlSGFuZGxlcltdXG4gICAgfVxuXG4gICAgaWYgKHNlbGYuX2RlY29yYXRlZEFwcENtZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBzZWxmLl9kZWNvcmF0ZWRBcHBDbWQuZm9yRWFjaCgoZSkgPT4ge1xuICAgICAgICBlLmhhbmRsZXIgPSBlLmhhbmRsZXIuYmluZCh0aGlzLmNsaWVudClcbiAgICAgICAgc2VsZi5oYW5kbGVycy5wdXNoKGUpXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChzZWxmLl9kZWNvcmF0ZWRBdXRvY29tcGxldGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgc2VsZi5fZGVjb3JhdGVkQXV0b2NvbXBsZXRlLmZvckVhY2goKGUpID0+IHtcbiAgICAgICAgZS5oYW5kbGVyID0gZS5oYW5kbGVyLmJpbmQodGhpcy5jbGllbnQpXG4gICAgICAgIHNlbGYuYXV0b2NvbXBsZXRlSGFuZGxlcnMucHVzaChlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ3Jlc3QnLCB7XG4gICAgICB2YWx1ZTpcbiAgICAgICAgb3B0aW9ucy5jbGllbnQgPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gb3B0aW9ucy5yZXN0ID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gbmV3IFJFU1RNYW5hZ2VyKHtcbiAgICAgICAgICAgICAgICB0b2tlbjogdGhpcy50b2tlblxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgOiBvcHRpb25zLnJlc3RcbiAgICAgICAgICA6IG9wdGlvbnMuY2xpZW50LnJlc3QsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pXG5cbiAgICB0aGlzLmNsaWVudD8ub24oXG4gICAgICAnaW50ZXJhY3Rpb25DcmVhdGUnLFxuICAgICAgYXN5bmMgKGludGVyYWN0aW9uKSA9PiBhd2FpdCB0aGlzLl9wcm9jZXNzKGludGVyYWN0aW9uKVxuICAgIClcblxuICAgIHRoaXMuY29tbWFuZHMgPSBuZXcgQXBwbGljYXRpb25Db21tYW5kc01hbmFnZXIodGhpcylcbiAgfVxuXG4gIGdldElEKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHR5cGVvZiB0aGlzLmlkID09PSAnc3RyaW5nJyA/IHRoaXMuaWQgOiB0aGlzLmlkKClcbiAgfVxuXG4gIC8qKiBBZGRzIGEgbmV3IEFwcGxpY2F0aW9uIENvbW1hbmQgSGFuZGxlciAqL1xuICBoYW5kbGUoY21kOiBBcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyKTogdGhpc1xuICBoYW5kbGUoY21kOiBzdHJpbmcsIGhhbmRsZXI6IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFjayk6IHRoaXNcbiAgaGFuZGxlKFxuICAgIGNtZDogc3RyaW5nLFxuICAgIGhhbmRsZXI6IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJDYWxsYmFjayxcbiAgICB0eXBlOiBBcHBsaWNhdGlvbkNvbW1hbmRUeXBlIHwga2V5b2YgdHlwZW9mIEFwcGxpY2F0aW9uQ29tbWFuZFR5cGVcbiAgKTogdGhpc1xuICBoYW5kbGUoXG4gICAgY21kOiBzdHJpbmcgfCBBcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyLFxuICAgIGhhbmRsZXI/OiBBcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyQ2FsbGJhY2ssXG4gICAgdHlwZT86IEFwcGxpY2F0aW9uQ29tbWFuZFR5cGUgfCBrZXlvZiB0eXBlb2YgQXBwbGljYXRpb25Db21tYW5kVHlwZVxuICApOiB0aGlzIHtcbiAgICBjb25zdCBoYW5kbGUgPSB7XG4gICAgICBuYW1lOiB0eXBlb2YgY21kID09PSAnc3RyaW5nJyA/IGNtZCA6IGNtZC5uYW1lLFxuICAgICAgLi4uKGhhbmRsZXIgIT09IHVuZGVmaW5lZCA/IHsgaGFuZGxlciB9IDoge30pLFxuICAgICAgLi4uKHR5cGVvZiBjbWQgPT09ICdzdHJpbmcnID8ge30gOiBjbWQpXG4gICAgfVxuXG4gICAgaWYgKHR5cGUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaGFuZGxlLnR5cGUgPVxuICAgICAgICB0eXBlb2YgdHlwZSA9PT0gJ3N0cmluZycgPyBBcHBsaWNhdGlvbkNvbW1hbmRUeXBlW3R5cGVdIDogdHlwZVxuICAgIH1cblxuICAgIGlmIChoYW5kbGUuaGFuZGxlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdXNhZ2UuIEhhbmRsZXIgZnVuY3Rpb24gbm90IHByb3ZpZGVkJylcbiAgICB9XG5cbiAgICBpZiAoXG4gICAgICAoaGFuZGxlLnR5cGUgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgICBoYW5kbGUudHlwZSA9PT0gQXBwbGljYXRpb25Db21tYW5kVHlwZS5DSEFUX0lOUFVUKSAmJlxuICAgICAgdHlwZW9mIGhhbmRsZS5uYW1lID09PSAnc3RyaW5nJyAmJlxuICAgICAgaGFuZGxlLm5hbWUuaW5jbHVkZXMoJyAnKSAmJlxuICAgICAgaGFuZGxlLnBhcmVudCA9PT0gdW5kZWZpbmVkICYmXG4gICAgICBoYW5kbGUuZ3JvdXAgPT09IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgY29uc3QgcGFydHMgPSBoYW5kbGUubmFtZS5zcGxpdCgvICsvKS5maWx0ZXIoKGUpID0+IGUgIT09ICcnKVxuICAgICAgaWYgKHBhcnRzLmxlbmd0aCA+IDMgfHwgcGFydHMubGVuZ3RoIDwgMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29tbWFuZCBuYW1lJylcbiAgICAgIH1cbiAgICAgIGNvbnN0IHJvb3QgPSBwYXJ0cy5zaGlmdCgpIGFzIHN0cmluZ1xuICAgICAgY29uc3QgZ3JvdXAgPSBwYXJ0cy5sZW5ndGggPT09IDIgPyBwYXJ0cy5zaGlmdCgpIDogdW5kZWZpbmVkXG4gICAgICBjb25zdCBzdWIgPSBwYXJ0cy5zaGlmdCgpXG5cbiAgICAgIGhhbmRsZS5uYW1lID0gc3ViID8/IHJvb3RcbiAgICAgIGhhbmRsZS5ncm91cCA9IGdyb3VwXG4gICAgICBoYW5kbGUucGFyZW50ID0gc3ViID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiByb290XG4gICAgfVxuXG4gICAgdGhpcy5oYW5kbGVycy5wdXNoKGhhbmRsZSBhcyBBcHBsaWNhdGlvbkNvbW1hbmRIYW5kbGVyKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogQWRkIGEgaGFuZGxlciBmb3IgYXV0b2NvbXBsZXRpb25zIChmb3IgYXBwbGljYXRpb24gY29tbWFuZCBvcHRpb25zKS5cbiAgICpcbiAgICogQHBhcmFtIGNtZCBDb21tYW5kIG5hbWUuIENhbiBiZSBgKmBcbiAgICogQHBhcmFtIG9wdGlvbiBPcHRpb24gbmFtZS4gQ2FuIGJlIGAqYFxuICAgKiBAcGFyYW0gaGFuZGxlciBIYW5kbGVyIGNhbGxiYWNrIHRoYXQgaXMgZmlyZWQgd2hlbiBhIG1hdGNoaW5nIEF1dG9jb21wbGV0ZSBJbnRlcmFjdGlvbiBjb21lcyBpbi5cbiAgICovXG4gIGF1dG9jb21wbGV0ZShcbiAgICBjbWQ6IHN0cmluZyxcbiAgICBvcHRpb246IHN0cmluZyxcbiAgICBoYW5kbGVyOiBBdXRvY29tcGxldGVIYW5kbGVyQ2FsbGJhY2tcbiAgKTogdGhpcyB7XG4gICAgY29uc3QgaGFuZGxlOiBBdXRvY29tcGxldGVIYW5kbGVyID0ge1xuICAgICAgY21kLFxuICAgICAgb3B0aW9uLFxuICAgICAgaGFuZGxlclxuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHR5cGVvZiBoYW5kbGUuY21kID09PSAnc3RyaW5nJyAmJlxuICAgICAgaGFuZGxlLmNtZC5pbmNsdWRlcygnICcpICYmXG4gICAgICBoYW5kbGUucGFyZW50ID09PSB1bmRlZmluZWQgJiZcbiAgICAgIGhhbmRsZS5ncm91cCA9PT0gdW5kZWZpbmVkXG4gICAgKSB7XG4gICAgICBjb25zdCBwYXJ0cyA9IGhhbmRsZS5jbWQuc3BsaXQoLyArLykuZmlsdGVyKChlKSA9PiBlICE9PSAnJylcbiAgICAgIGlmIChwYXJ0cy5sZW5ndGggPiAzIHx8IHBhcnRzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvbW1hbmQgbmFtZScpXG4gICAgICB9XG4gICAgICBjb25zdCByb290ID0gcGFydHMuc2hpZnQoKSBhcyBzdHJpbmdcbiAgICAgIGNvbnN0IGdyb3VwID0gcGFydHMubGVuZ3RoID09PSAyID8gcGFydHMuc2hpZnQoKSA6IHVuZGVmaW5lZFxuICAgICAgY29uc3Qgc3ViID0gcGFydHMuc2hpZnQoKVxuXG4gICAgICBoYW5kbGUuY21kID0gc3ViID8/IHJvb3RcbiAgICAgIGhhbmRsZS5ncm91cCA9IGdyb3VwXG4gICAgICBoYW5kbGUucGFyZW50ID0gc3ViID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiByb290XG4gICAgfVxuXG4gICAgdGhpcy5hdXRvY29tcGxldGVIYW5kbGVycy5wdXNoKGhhbmRsZSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIExvYWQgYSBTbGFzaCBNb2R1bGUgKi9cbiAgbG9hZE1vZHVsZShtb2R1bGU6IEFwcGxpY2F0aW9uQ29tbWFuZHNNb2R1bGUpOiBJbnRlcmFjdGlvbnNDbGllbnQge1xuICAgIHRoaXMubW9kdWxlcy5wdXNoKG1vZHVsZSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIEdldCBhbGwgSGFuZGxlcnMuIEluY2x1ZGluZyBTbGFzaCBNb2R1bGVzICovXG4gIGdldEhhbmRsZXJzKCk6IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXJbXSB7XG4gICAgbGV0IHJlcyA9IHRoaXMuaGFuZGxlcnNcbiAgICBmb3IgKGNvbnN0IG1vZCBvZiB0aGlzLm1vZHVsZXMpIHtcbiAgICAgIGlmIChtb2QgPT09IHVuZGVmaW5lZCkgY29udGludWVcbiAgICAgIHJlcyA9IFtcbiAgICAgICAgLi4ucmVzLFxuICAgICAgICAuLi5tb2QuY29tbWFuZHMubWFwKChjbWQpID0+IHtcbiAgICAgICAgICBjbWQuaGFuZGxlciA9IGNtZC5oYW5kbGVyLmJpbmQobW9kKVxuICAgICAgICAgIHJldHVybiBjbWRcbiAgICAgICAgfSlcbiAgICAgIF1cbiAgICB9XG4gICAgcmV0dXJuIHJlc1xuICB9XG5cbiAgLyoqIEdldCBIYW5kbGVyIGZvciBhbiBJbnRlcmFjdGlvbi4gU3VwcG9ydHMgbmVzdGVkIHN1YiBjb21tYW5kcyBhbmQgc3ViIGNvbW1hbmQgZ3JvdXBzLiAqL1xuICBwcml2YXRlIF9nZXRDb21tYW5kKFxuICAgIGk6IEFwcGxpY2F0aW9uQ29tbWFuZEludGVyYWN0aW9uXG4gICk6IEFwcGxpY2F0aW9uQ29tbWFuZEhhbmRsZXIgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmdldEhhbmRsZXJzKCkuZmluZCgoZSkgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICAoZS50eXBlID09PSBBcHBsaWNhdGlvbkNvbW1hbmRUeXBlLk1FU1NBR0UgfHxcbiAgICAgICAgICBlLnR5cGUgPT09IEFwcGxpY2F0aW9uQ29tbWFuZFR5cGUuVVNFUikgJiZcbiAgICAgICAgaS50YXJnZXRJRCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgIGkubmFtZSA9PT0gZS5uYW1lXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cblxuICAgICAgY29uc3QgaGFzR3JvdXBPclBhcmVudCA9IGUuZ3JvdXAgIT09IHVuZGVmaW5lZCB8fCBlLnBhcmVudCAhPT0gdW5kZWZpbmVkXG4gICAgICBjb25zdCBncm91cE1hdGNoZWQgPVxuICAgICAgICBlLmdyb3VwICE9PSB1bmRlZmluZWQgJiYgZS5wYXJlbnQgIT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gaS5kYXRhLm9wdGlvbnNcbiAgICAgICAgICAgICAgPy5maW5kKFxuICAgICAgICAgICAgICAgIChvKSA9PlxuICAgICAgICAgICAgICAgICAgby5uYW1lID09PSBlLmdyb3VwICYmXG4gICAgICAgICAgICAgICAgICBvLnR5cGUgPT09IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGUuU1VCX0NPTU1BTkRfR1JPVVBcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICA/Lm9wdGlvbnM/LmZpbmQoKG8pID0+IG8ubmFtZSA9PT0gZS5uYW1lKSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgOiB0cnVlXG4gICAgICBjb25zdCBzdWJNYXRjaGVkID1cbiAgICAgICAgZS5ncm91cCA9PT0gdW5kZWZpbmVkICYmIGUucGFyZW50ICE9PSB1bmRlZmluZWRcbiAgICAgICAgICA/IGkuZGF0YS5vcHRpb25zPy5maW5kKFxuICAgICAgICAgICAgICAobykgPT5cbiAgICAgICAgICAgICAgICBvLm5hbWUgPT09IGUubmFtZSAmJlxuICAgICAgICAgICAgICAgIG8udHlwZSA9PT0gQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZS5TVUJfQ09NTUFORFxuICAgICAgICAgICAgKSAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgOiB0cnVlXG4gICAgICBjb25zdCBuYW1lTWF0Y2hlZDEgPSBlLm5hbWUgPT09IGkubmFtZVxuICAgICAgY29uc3QgcGFyZW50TWF0Y2hlZCA9IGhhc0dyb3VwT3JQYXJlbnQgPyBlLnBhcmVudCA9PT0gaS5uYW1lIDogdHJ1ZVxuICAgICAgY29uc3QgbmFtZU1hdGNoZWQgPSBoYXNHcm91cE9yUGFyZW50ID8gcGFyZW50TWF0Y2hlZCA6IG5hbWVNYXRjaGVkMVxuXG4gICAgICBjb25zdCBtYXRjaGVkID0gZ3JvdXBNYXRjaGVkICYmIHN1Yk1hdGNoZWQgJiYgbmFtZU1hdGNoZWRcbiAgICAgIHJldHVybiBtYXRjaGVkXG4gICAgfSlcbiAgfVxuXG4gIC8qKiBHZXQgSGFuZGxlciBmb3IgYW4gYXV0b2NvbXBsZXRlIEludGVyYWN0aW9uLiBTdXBwb3J0cyBuZXN0ZWQgc3ViIGNvbW1hbmRzIGFuZCBzdWIgY29tbWFuZCBncm91cHMuICovXG4gIHByaXZhdGUgX2dldEF1dG9jb21wbGV0ZUhhbmRsZXIoXG4gICAgaTogQXV0b2NvbXBsZXRlSW50ZXJhY3Rpb25cbiAgKTogQXV0b2NvbXBsZXRlSGFuZGxlciB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIFtcbiAgICAgIC4uLnRoaXMuYXV0b2NvbXBsZXRlSGFuZGxlcnMsXG4gICAgICAuLi50aGlzLm1vZHVsZXMubWFwKChlKSA9PiBlLmF1dG9jb21wbGV0ZSkuZmxhdCgpXG4gICAgXS5maW5kKChlKSA9PiB7XG4gICAgICBpZiAoaS50YXJnZXRJRCAhPT0gdW5kZWZpbmVkICYmIGkubmFtZSA9PT0gZS5jbWQpIHtcbiAgICAgICAgcmV0dXJuIHRydWVcbiAgICAgIH1cblxuICAgICAgY29uc3QgaGFzR3JvdXBPclBhcmVudCA9IGUuZ3JvdXAgIT09IHVuZGVmaW5lZCB8fCBlLnBhcmVudCAhPT0gdW5kZWZpbmVkXG4gICAgICBjb25zdCBncm91cE1hdGNoZWQgPVxuICAgICAgICBlLmdyb3VwICE9PSB1bmRlZmluZWQgJiYgZS5wYXJlbnQgIT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gaS5kYXRhLm9wdGlvbnNcbiAgICAgICAgICAgICAgPy5maW5kKFxuICAgICAgICAgICAgICAgIChvKSA9PlxuICAgICAgICAgICAgICAgICAgby5uYW1lID09PSBlLmdyb3VwICYmXG4gICAgICAgICAgICAgICAgICBvLnR5cGUgPT09IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGUuU1VCX0NPTU1BTkRfR1JPVVBcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICA/Lm9wdGlvbnM/LmZpbmQoKG8pID0+IG8ubmFtZSA9PT0gZS5jbWQpICE9PSB1bmRlZmluZWRcbiAgICAgICAgICA6IHRydWVcbiAgICAgIGNvbnN0IHN1Yk1hdGNoZWQgPVxuICAgICAgICBlLmdyb3VwID09PSB1bmRlZmluZWQgJiYgZS5wYXJlbnQgIT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gaS5kYXRhLm9wdGlvbnM/LmZpbmQoXG4gICAgICAgICAgICAgIChvKSA9PlxuICAgICAgICAgICAgICAgIG8ubmFtZSA9PT0gZS5jbWQgJiZcbiAgICAgICAgICAgICAgICBvLnR5cGUgPT09IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblR5cGUuU1VCX0NPTU1BTkRcbiAgICAgICAgICAgICkgIT09IHVuZGVmaW5lZFxuICAgICAgICAgIDogdHJ1ZVxuICAgICAgY29uc3QgbmFtZU1hdGNoZWQxID0gZS5jbWQgPT09IGkubmFtZVxuICAgICAgY29uc3QgcGFyZW50TWF0Y2hlZCA9IGhhc0dyb3VwT3JQYXJlbnQgPyBlLnBhcmVudCA9PT0gaS5uYW1lIDogdHJ1ZVxuICAgICAgY29uc3QgbmFtZU1hdGNoZWQgPSBoYXNHcm91cE9yUGFyZW50ID8gcGFyZW50TWF0Y2hlZCA6IG5hbWVNYXRjaGVkMVxuICAgICAgY29uc3Qgb3B0aW9uTWF0Y2hlZCA9XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvc3RyaWN0LWJvb2xlYW4tZXhwcmVzc2lvbnNcbiAgICAgICAgaS5vcHRpb25zLnNvbWUoKG8pID0+IG8ubmFtZSA9PT0gZS5vcHRpb24gJiYgby5mb2N1c2VkKSB8fFxuICAgICAgICBlLm9wdGlvbiA9PT0gJyonXG5cbiAgICAgIGNvbnN0IG1hdGNoZWQgPSBncm91cE1hdGNoZWQgJiYgc3ViTWF0Y2hlZCAmJiBuYW1lTWF0Y2hlZCAmJiBvcHRpb25NYXRjaGVkXG4gICAgICByZXR1cm4gbWF0Y2hlZFxuICAgIH0pXG4gIH1cblxuICAvKiogUHJvY2VzcyBhbiBpbmNvbWluZyBJbnRlcmFjdGlvbiAqL1xuICBhc3luYyBfcHJvY2VzcyhcbiAgICBpbnRlcmFjdGlvbjogSW50ZXJhY3Rpb24gfCBBcHBsaWNhdGlvbkNvbW1hbmRJbnRlcmFjdGlvblxuICApOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBpZiAoIXRoaXMuZW5hYmxlZCkgcmV0dXJuXG5cbiAgICBhd2FpdCB0aGlzLmVtaXQoJ2ludGVyYWN0aW9uJywgaW50ZXJhY3Rpb24pXG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3N0cmljdC1ib29sZWFuLWV4cHJlc3Npb25zXG4gICAgaWYgKGludGVyYWN0aW9uLmlzQXV0b2NvbXBsZXRlKCkpIHtcbiAgICAgIGNvbnN0IGhhbmRsZSA9XG4gICAgICAgIHRoaXMuX2dldEF1dG9jb21wbGV0ZUhhbmRsZXIoaW50ZXJhY3Rpb24pID8/XG4gICAgICAgIFtcbiAgICAgICAgICAuLi50aGlzLmF1dG9jb21wbGV0ZUhhbmRsZXJzLFxuICAgICAgICAgIC4uLnRoaXMubW9kdWxlcy5tYXAoKGUpID0+IGUuYXV0b2NvbXBsZXRlKS5mbGF0KClcbiAgICAgICAgXS5maW5kKChlKSA9PiBlLmNtZCA9PT0gJyonKVxuICAgICAgdHJ5IHtcbiAgICAgICAgYXdhaXQgaGFuZGxlPy5oYW5kbGVyKGludGVyYWN0aW9uKVxuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhd2FpdCB0aGlzLmVtaXQoJ2ludGVyYWN0aW9uRXJyb3InLCBlIGFzIEVycm9yKVxuICAgICAgfVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9zdHJpY3QtYm9vbGVhbi1leHByZXNzaW9uc1xuICAgIGlmICghaW50ZXJhY3Rpb24uaXNBcHBsaWNhdGlvbkNvbW1hbmQoKSkgcmV0dXJuXG5cbiAgICBjb25zdCBjbWQgPVxuICAgICAgdGhpcy5fZ2V0Q29tbWFuZChpbnRlcmFjdGlvbikgPz9cbiAgICAgIHRoaXMuZ2V0SGFuZGxlcnMoKS5maW5kKChlKSA9PiBlLm5hbWUgPT09ICcqJylcblxuICAgIGlmIChjbWQgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG5cbiAgICB0cnkge1xuICAgICAgYXdhaXQgY21kLmhhbmRsZXIoaW50ZXJhY3Rpb24pXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYXdhaXQgdGhpcy5lbWl0KCdpbnRlcmFjdGlvbkVycm9yJywgZSBhcyBFcnJvcilcbiAgICB9XG4gIH1cblxuICAvKiogVmVyaWZ5IEhUVFAgYmFzZWQgSW50ZXJhY3Rpb24gKi9cbiAgdmVyaWZ5S2V5KFxuICAgIHJhd0JvZHk6IHN0cmluZyB8IFVpbnQ4QXJyYXksXG4gICAgc2lnbmF0dXJlOiBzdHJpbmcgfCBVaW50OEFycmF5LFxuICAgIHRpbWVzdGFtcDogc3RyaW5nIHwgVWludDhBcnJheVxuICApOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5wdWJsaWNLZXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdQdWJsaWMgS2V5IGlzIG5vdCBwcmVzZW50JylcbiAgICB9XG5cbiAgICBjb25zdCBmdWxsQm9keSA9IG5ldyBVaW50OEFycmF5KFtcbiAgICAgIC4uLih0eXBlb2YgdGltZXN0YW1wID09PSAnc3RyaW5nJyA/IGVuY29kZVRleHQodGltZXN0YW1wKSA6IHRpbWVzdGFtcCksXG4gICAgICAuLi4odHlwZW9mIHJhd0JvZHkgPT09ICdzdHJpbmcnID8gZW5jb2RlVGV4dChyYXdCb2R5KSA6IHJhd0JvZHkpXG4gICAgXSlcblxuICAgIHJldHVybiBlZHZlcmlmeShcbiAgICAgIGRlY29kZUhleChlbmNvZGVUZXh0KHRoaXMucHVibGljS2V5KSksXG4gICAgICBkZWNvZGVIZXgoXG4gICAgICAgIHNpZ25hdHVyZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBzaWduYXR1cmUgOiBlbmNvZGVUZXh0KHNpZ25hdHVyZSlcbiAgICAgICksXG4gICAgICBmdWxsQm9keVxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBWZXJpZnkgW0Rlbm8gU3RkIEhUVFAgU2VydmVyIFJlcXVlc3RdKGh0dHBzOi8vZGVuby5sYW5kL3N0ZC9odHRwL3NlcnZlci50cykgYW5kIHJldHVybiBJbnRlcmFjdGlvbi5cbiAgICpcbiAgICogKipEYXRhIHByZXNlbnQgaW4gSW50ZXJhY3Rpb24gcmV0dXJuZWQgYnkgdGhpcyBtZXRob2QgaXMgdmVyeSBkaWZmZXJlbnQgZnJvbSBhY3R1YWwgdHlwaW5nc1xuICAgKiBhcyB0aGVyZSBpcyBubyByZWFsIGBDbGllbnRgIGJlaGluZCB0aGUgc2NlbmVzIHRvIGNhY2hlIHRoaW5ncy4qKlxuICAgKi9cbiAgYXN5bmMgdmVyaWZ5U2VydmVyUmVxdWVzdChyZXE6IHtcbiAgICBoZWFkZXJzOiBIZWFkZXJzXG4gICAgbWV0aG9kOiBzdHJpbmdcbiAgICBib2R5OiBEZW5vLlJlYWRlciB8IFVpbnQ4QXJyYXlcbiAgICByZXNwb25kOiAob3B0aW9uczoge1xuICAgICAgc3RhdHVzPzogbnVtYmVyXG4gICAgICBoZWFkZXJzPzogSGVhZGVyc1xuICAgICAgYm9keT86IEJvZHlJbml0XG4gICAgfSkgPT4gUHJvbWlzZTx2b2lkPlxuICB9KTogUHJvbWlzZTxmYWxzZSB8IEludGVyYWN0aW9uPiB7XG4gICAgaWYgKHJlcS5tZXRob2QudG9Mb3dlckNhc2UoKSAhPT0gJ3Bvc3QnKSByZXR1cm4gZmFsc2VcblxuICAgIGNvbnN0IHNpZ25hdHVyZSA9IHJlcS5oZWFkZXJzLmdldCgneC1zaWduYXR1cmUtZWQyNTUxOScpXG4gICAgY29uc3QgdGltZXN0YW1wID0gcmVxLmhlYWRlcnMuZ2V0KCd4LXNpZ25hdHVyZS10aW1lc3RhbXAnKVxuICAgIGlmIChzaWduYXR1cmUgPT09IG51bGwgfHwgdGltZXN0YW1wID09PSBudWxsKSByZXR1cm4gZmFsc2VcblxuICAgIGNvbnN0IHJhd2JvZHkgPVxuICAgICAgcmVxLmJvZHkgaW5zdGFuY2VvZiBVaW50OEFycmF5ID8gcmVxLmJvZHkgOiBhd2FpdCByZWFkQWxsKHJlcS5ib2R5KVxuICAgIGNvbnN0IHZlcmlmeSA9IHRoaXMudmVyaWZ5S2V5KHJhd2JvZHksIHNpZ25hdHVyZSwgdGltZXN0YW1wKVxuICAgIGlmICghdmVyaWZ5KSByZXR1cm4gZmFsc2VcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBwYXlsb2FkOiBJbnRlcmFjdGlvblBheWxvYWQgPSBKU09OLnBhcnNlKGRlY29kZVRleHQocmF3Ym9keSkpXG5cbiAgICAgIC8vIE5vdGU6IHRoZXJlJ3MgYSBsb3Qgb2YgaGFja3MgZ29pbmcgb24gaGVyZS5cblxuICAgICAgY29uc3QgY2xpZW50ID0gdGhpcyBhcyB1bmtub3duIGFzIENsaWVudFxuXG4gICAgICBsZXQgcmVzXG5cbiAgICAgIGNvbnN0IGNoYW5uZWwgPVxuICAgICAgICBwYXlsb2FkLmNoYW5uZWxfaWQgIT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gKG5ldyBDaGFubmVsKGNsaWVudCwge1xuICAgICAgICAgICAgICBpZDogcGF5bG9hZC5jaGFubmVsX2lkISxcbiAgICAgICAgICAgICAgdHlwZTogMCxcbiAgICAgICAgICAgICAgZmxhZ3M6IDBcbiAgICAgICAgICAgIH0pIGFzIHVua25vd24gYXMgVGV4dENoYW5uZWwpXG4gICAgICAgICAgOiB1bmRlZmluZWRcblxuICAgICAgY29uc3QgdXNlciA9IG5ldyBVc2VyKGNsaWVudCwgKHBheWxvYWQubWVtYmVyPy51c2VyID8/IHBheWxvYWQudXNlcikhKVxuXG4gICAgICBjb25zdCBndWlsZCA9XG4gICAgICAgIHBheWxvYWQuZ3VpbGRfaWQgIT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9jb25zaXN0ZW50LXR5cGUtYXNzZXJ0aW9uc1xuICAgICAgICAgICAgbmV3IEd1aWxkKGNsaWVudCwge1xuICAgICAgICAgICAgICBpZDogcGF5bG9hZC5ndWlsZF9pZCEsXG4gICAgICAgICAgICAgIHVuYXZhaWxhYmxlOiB0cnVlXG4gICAgICAgICAgICB9IGFzIEd1aWxkUGF5bG9hZClcbiAgICAgICAgICA6IHVuZGVmaW5lZFxuXG4gICAgICBjb25zdCBtZW1iZXIgPVxuICAgICAgICBwYXlsb2FkLm1lbWJlciAhPT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgICAgICAgICBuZXcgTWVtYmVyKGNsaWVudCwgcGF5bG9hZC5tZW1iZXIsIHVzZXIsIGd1aWxkISlcbiAgICAgICAgICA6IHVuZGVmaW5lZFxuXG4gICAgICBpZiAoXG4gICAgICAgIHBheWxvYWQudHlwZSA9PT0gSW50ZXJhY3Rpb25UeXBlLkFQUExJQ0FUSU9OX0NPTU1BTkQgfHxcbiAgICAgICAgcGF5bG9hZC50eXBlID09PSBJbnRlcmFjdGlvblR5cGUuQVVUT0NPTVBMRVRFXG4gICAgICApIHtcbiAgICAgICAgY29uc3QgcmVzb2x2ZWQ6IEludGVyYWN0aW9uQXBwbGljYXRpb25Db21tYW5kUmVzb2x2ZWQgPSB7XG4gICAgICAgICAgdXNlcnM6IHt9LFxuICAgICAgICAgIG1lbWJlcnM6IHt9LFxuICAgICAgICAgIHJvbGVzOiB7fSxcbiAgICAgICAgICBjaGFubmVsczoge30sXG4gICAgICAgICAgbWVzc2FnZXM6IHt9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgZGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS10eXBlLWFzc2VydGlvblxuICAgICAgICAgIChwYXlsb2FkLmRhdGEgYXMgSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmREYXRhKS5yZXNvbHZlZD8udXNlcnMgPz9cbiAgICAgICAgICAgIHt9XG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXNvbHZlZC51c2Vyc1tpZF0gPSBuZXcgVXNlcihjbGllbnQsIGRhdGEpXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgZGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS10eXBlLWFzc2VydGlvblxuICAgICAgICAgIChwYXlsb2FkLmRhdGEgYXMgSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmREYXRhKS5yZXNvbHZlZFxuICAgICAgICAgICAgPy5tZW1iZXJzID8/IHt9XG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXNvbHZlZC5tZW1iZXJzW2lkXSA9IG5ldyBNZW1iZXIoXG4gICAgICAgICAgICBjbGllbnQsXG4gICAgICAgICAgICBkYXRhLFxuICAgICAgICAgICAgcmVzb2x2ZWQudXNlcnNbaWRdLFxuICAgICAgICAgICAgdW5kZWZpbmVkIGFzIHVua25vd24gYXMgR3VpbGRcbiAgICAgICAgICApXG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGNvbnN0IFtpZCwgZGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoXG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS10eXBlLWFzc2VydGlvblxuICAgICAgICAgIChwYXlsb2FkLmRhdGEgYXMgSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmREYXRhKS5yZXNvbHZlZD8ucm9sZXMgPz9cbiAgICAgICAgICAgIHt9XG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXNvbHZlZC5yb2xlc1tpZF0gPSBuZXcgUm9sZShcbiAgICAgICAgICAgIGNsaWVudCxcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICB1bmRlZmluZWQgYXMgdW5rbm93biBhcyBHdWlsZFxuICAgICAgICAgIClcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgW2lkLCBkYXRhXSBvZiBPYmplY3QuZW50cmllcyhcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgICAgICAgKHBheWxvYWQuZGF0YSBhcyBJbnRlcmFjdGlvbkFwcGxpY2F0aW9uQ29tbWFuZERhdGEpLnJlc29sdmVkXG4gICAgICAgICAgICA/LmNoYW5uZWxzID8/IHt9XG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXNvbHZlZC5jaGFubmVsc1tpZF0gPSBuZXcgSW50ZXJhY3Rpb25DaGFubmVsKGNsaWVudCwgZGF0YSlcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoY29uc3QgW2lkLCBkYXRhXSBvZiBPYmplY3QuZW50cmllcyhcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgICAgICAgKHBheWxvYWQuZGF0YSBhcyBJbnRlcmFjdGlvbkFwcGxpY2F0aW9uQ29tbWFuZERhdGEpLnJlc29sdmVkXG4gICAgICAgICAgICA/Lm1lc3NhZ2VzID8/IHt9XG4gICAgICAgICkpIHtcbiAgICAgICAgICByZXNvbHZlZC5tZXNzYWdlc1tpZF0gPSBuZXcgTWVzc2FnZShcbiAgICAgICAgICAgIGNsaWVudCxcbiAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICBkYXRhLmNoYW5uZWxfaWQgYXMgdW5rbm93biBhcyBUZXh0Q2hhbm5lbCxcbiAgICAgICAgICAgIG5ldyBVc2VyKGNsaWVudCwgZGF0YS5hdXRob3IpXG4gICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgcmVzID1cbiAgICAgICAgICBwYXlsb2FkLnR5cGUgPT09IEludGVyYWN0aW9uVHlwZS5BUFBMSUNBVElPTl9DT01NQU5EXG4gICAgICAgICAgICA/IG5ldyBBcHBsaWNhdGlvbkNvbW1hbmRJbnRlcmFjdGlvbihjbGllbnQsIHBheWxvYWQsIHtcbiAgICAgICAgICAgICAgICB1c2VyLFxuICAgICAgICAgICAgICAgIG1lbWJlcixcbiAgICAgICAgICAgICAgICBndWlsZCxcbiAgICAgICAgICAgICAgICBjaGFubmVsLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICA6IG5ldyBBdXRvY29tcGxldGVJbnRlcmFjdGlvbihjbGllbnQsIHBheWxvYWQsIHtcbiAgICAgICAgICAgICAgICB1c2VyLFxuICAgICAgICAgICAgICAgIG1lbWJlcixcbiAgICAgICAgICAgICAgICBndWlsZCxcbiAgICAgICAgICAgICAgICBjaGFubmVsLFxuICAgICAgICAgICAgICAgIHJlc29sdmVkXG4gICAgICAgICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKHBheWxvYWQudHlwZSA9PT0gSW50ZXJhY3Rpb25UeXBlLk1PREFMX1NVQk1JVCkge1xuICAgICAgICByZXMgPSBuZXcgTW9kYWxTdWJtaXRJbnRlcmFjdGlvbihjbGllbnQsIHBheWxvYWQsIHtcbiAgICAgICAgICBjaGFubmVsLFxuICAgICAgICAgIGd1aWxkLFxuICAgICAgICAgIG1lbWJlcixcbiAgICAgICAgICB1c2VyXG4gICAgICAgIH0pXG4gICAgICB9IGVsc2UgaWYgKHBheWxvYWQudHlwZSA9PT0gSW50ZXJhY3Rpb25UeXBlLk1FU1NBR0VfQ09NUE9ORU5UKSB7XG4gICAgICAgIHJlcyA9IG5ldyBNZXNzYWdlQ29tcG9uZW50SW50ZXJhY3Rpb24oY2xpZW50LCBwYXlsb2FkLCB7XG4gICAgICAgICAgY2hhbm5lbCxcbiAgICAgICAgICBndWlsZCxcbiAgICAgICAgICBtZW1iZXIsXG4gICAgICAgICAgdXNlcixcbiAgICAgICAgICBtZXNzYWdlOiBuZXcgTWVzc2FnZShcbiAgICAgICAgICAgIGNsaWVudCxcbiAgICAgICAgICAgIHBheWxvYWQubWVzc2FnZSEsXG4gICAgICAgICAgICBwYXlsb2FkLm1lc3NhZ2UhLmNoYW5uZWxfaWQgYXMgdW5rbm93biBhcyBUZXh0Q2hhbm5lbCxcbiAgICAgICAgICAgIG5ldyBVc2VyKGNsaWVudCwgcGF5bG9hZC5tZXNzYWdlIS5hdXRob3IpXG4gICAgICAgICAgKVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzID0gbmV3IEludGVyYWN0aW9uKGNsaWVudCwgcGF5bG9hZCwge1xuICAgICAgICAgIHVzZXIsXG4gICAgICAgICAgbWVtYmVyLFxuICAgICAgICAgIGd1aWxkLFxuICAgICAgICAgIGNoYW5uZWxcbiAgICAgICAgfSlcbiAgICAgIH1cblxuICAgICAgcmVzLl9odHRwUmVzcG9uZCA9IGFzeW5jIChkOiBJbnRlcmFjdGlvblJlc3BvbnNlUGF5bG9hZCB8IEZvcm1EYXRhKSA9PlxuICAgICAgICBhd2FpdCByZXEucmVzcG9uZCh7XG4gICAgICAgICAgc3RhdHVzOiAyMDAsXG4gICAgICAgICAgaGVhZGVyczogbmV3IEhlYWRlcnMoe1xuICAgICAgICAgICAgJ2NvbnRlbnQtdHlwZSc6XG4gICAgICAgICAgICAgIGQgaW5zdGFuY2VvZiBGb3JtRGF0YSA/ICdtdWx0aXBhcnQvZm9ybS1kYXRhJyA6ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICAgIH0pLFxuICAgICAgICAgIGJvZHk6IGQgaW5zdGFuY2VvZiBGb3JtRGF0YSA/IGQgOiBKU09OLnN0cmluZ2lmeShkKVxuICAgICAgICB9KVxuXG4gICAgICBhd2FpdCB0aGlzLmVtaXQoJ2ludGVyYWN0aW9uJywgcmVzKVxuXG4gICAgICByZXR1cm4gcmVzXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuICB9XG5cbiAgLyoqIFZlcmlmeSBGZXRjaEV2ZW50IChmb3IgU2VydmljZSBXb3JrZXIgdXNhZ2UpIGFuZCByZXR1cm4gSW50ZXJhY3Rpb24gaWYgdmFsaWQgKi9cbiAgYXN5bmMgdmVyaWZ5RmV0Y2hFdmVudCh7XG4gICAgcmVxdWVzdDogcmVxLFxuICAgIHJlc3BvbmRXaXRoXG4gIH06IHtcbiAgICByZXNwb25kV2l0aDogQ2FsbGFibGVGdW5jdGlvblxuICAgIHJlcXVlc3Q6IFJlcXVlc3RcbiAgfSk6IFByb21pc2U8ZmFsc2UgfCBJbnRlcmFjdGlvbj4ge1xuICAgIGlmIChyZXEuYm9keVVzZWQgPT09IHRydWUpIHRocm93IG5ldyBFcnJvcignUmVxdWVzdCBCb2R5IGFscmVhZHkgdXNlZCcpXG4gICAgaWYgKHJlcS5ib2R5ID09PSBudWxsKSByZXR1cm4gZmFsc2VcbiAgICBjb25zdCBib2R5ID0gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVxLmFycmF5QnVmZmVyKCkpXG5cbiAgICByZXR1cm4gYXdhaXQgdGhpcy52ZXJpZnlTZXJ2ZXJSZXF1ZXN0KHtcbiAgICAgIGhlYWRlcnM6IHJlcS5oZWFkZXJzLFxuICAgICAgYm9keSxcbiAgICAgIG1ldGhvZDogcmVxLm1ldGhvZCxcbiAgICAgIHJlc3BvbmQ6IGFzeW5jIChvcHRpb25zKSA9PiB7XG4gICAgICAgIGF3YWl0IHJlc3BvbmRXaXRoKFxuICAgICAgICAgIG5ldyBSZXNwb25zZShvcHRpb25zLmJvZHksIHtcbiAgICAgICAgICAgIGhlYWRlcnM6IG9wdGlvbnMuaGVhZGVycyxcbiAgICAgICAgICAgIHN0YXR1czogb3B0aW9ucy5zdGF0dXNcbiAgICAgICAgICB9KVxuICAgICAgICApXG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGFzeW5jIHZlcmlmeU9waW5lUmVxdWVzdDxcbiAgICBUIGV4dGVuZHMge1xuICAgICAgaGVhZGVyczogSGVhZGVyc1xuICAgICAgYm9keTogRGVuby5SZWFkZXJcbiAgICB9XG4gID4ocmVxOiBUKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgY29uc3Qgc2lnbmF0dXJlID0gcmVxLmhlYWRlcnMuZ2V0KCd4LXNpZ25hdHVyZS1lZDI1NTE5JylcbiAgICBjb25zdCB0aW1lc3RhbXAgPSByZXEuaGVhZGVycy5nZXQoJ3gtc2lnbmF0dXJlLXRpbWVzdGFtcCcpXG4gICAgY29uc3QgY29udGVudExlbmd0aCA9IHJlcS5oZWFkZXJzLmdldCgnY29udGVudC1sZW5ndGgnKVxuXG4gICAgaWYgKHNpZ25hdHVyZSA9PT0gbnVsbCB8fCB0aW1lc3RhbXAgPT09IG51bGwgfHwgY29udGVudExlbmd0aCA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgY29uc3QgYm9keSA9IG5ldyBVaW50OEFycmF5KHBhcnNlSW50KGNvbnRlbnRMZW5ndGgpKVxuICAgIGF3YWl0IHJlcS5ib2R5LnJlYWQoYm9keSlcblxuICAgIGNvbnN0IHZlcmlmaWVkID0gYXdhaXQgdGhpcy52ZXJpZnlLZXkoYm9keSwgc2lnbmF0dXJlLCB0aW1lc3RhbXApXG4gICAgaWYgKCF2ZXJpZmllZCkgcmV0dXJuIGZhbHNlXG5cbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyoqIE1pZGRsZXdhcmUgdG8gdmVyaWZ5IHJlcXVlc3QgaW4gT3BpbmUgZnJhbWV3b3JrLiAqL1xuICBhc3luYyB2ZXJpZnlPcGluZU1pZGRsZXdhcmU8XG4gICAgUmVxIGV4dGVuZHMge1xuICAgICAgaGVhZGVyczogSGVhZGVyc1xuICAgICAgYm9keTogRGVuby5SZWFkZXJcbiAgICB9LFxuICAgIFJlcyBleHRlbmRzIHtcbiAgICAgIHNldFN0YXR1czogKGNvZGU6IG51bWJlcikgPT4gUmVzXG4gICAgICBlbmQ6ICgpID0+IFJlc1xuICAgIH1cbiAgPihyZXE6IFJlcSwgcmVzOiBSZXMsIG5leHQ6IENhbGxhYmxlRnVuY3Rpb24pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCB2ZXJpZmllZCA9IGF3YWl0IHRoaXMudmVyaWZ5T3BpbmVSZXF1ZXN0KHJlcSlcbiAgICBpZiAoIXZlcmlmaWVkKSB7XG4gICAgICByZXMuc2V0U3RhdHVzKDQwMSkuZW5kKClcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGF3YWl0IG5leHQoKVxuICAgIHJldHVybiB0cnVlXG4gIH1cblxuICAvLyBUT0RPOiBjcmVhdGUgdmVyaWZ5T2FrTWlkZGxld2FyZSB0b29cbiAgLyoqIE1ldGhvZCB0byB2ZXJpZnkgUmVxdWVzdCBmcm9tIE9hayBzZXJ2ZXIgXCJDb250ZXh0XCIuICovXG4gIGFzeW5jIHZlcmlmeU9ha1JlcXVlc3Q8XG4gICAgVCBleHRlbmRzIHtcbiAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgaGVhZGVyczogSGVhZGVyc1xuICAgICAgICBoYXNCb2R5OiBib29sZWFuXG4gICAgICAgIGJvZHk6ICgpID0+IHsgdmFsdWU6IFByb21pc2U8VWludDhBcnJheT4gfVxuICAgICAgfVxuICAgIH1cbiAgPihjdHg6IFQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBzaWduYXR1cmUgPSBjdHgucmVxdWVzdC5oZWFkZXJzLmdldCgneC1zaWduYXR1cmUtZWQyNTUxOScpXG4gICAgY29uc3QgdGltZXN0YW1wID0gY3R4LnJlcXVlc3QuaGVhZGVycy5nZXQoJ3gtc2lnbmF0dXJlLXRpbWVzdGFtcCcpXG4gICAgY29uc3QgY29udGVudExlbmd0aCA9IGN0eC5yZXF1ZXN0LmhlYWRlcnMuZ2V0KCdjb250ZW50LWxlbmd0aCcpXG5cbiAgICBpZiAoXG4gICAgICBzaWduYXR1cmUgPT09IG51bGwgfHxcbiAgICAgIHRpbWVzdGFtcCA9PT0gbnVsbCB8fFxuICAgICAgY29udGVudExlbmd0aCA9PT0gbnVsbCB8fFxuICAgICAgIWN0eC5yZXF1ZXN0Lmhhc0JvZHlcbiAgICApIHtcbiAgICAgIHJldHVybiBmYWxzZVxuICAgIH1cblxuICAgIGNvbnN0IGJvZHkgPSBhd2FpdCBjdHgucmVxdWVzdC5ib2R5KCkudmFsdWVcblxuICAgIGNvbnN0IHZlcmlmaWVkID0gYXdhaXQgdGhpcy52ZXJpZnlLZXkoYm9keSwgc2lnbmF0dXJlLCB0aW1lc3RhbXApXG4gICAgaWYgKCF2ZXJpZmllZCkgcmV0dXJuIGZhbHNlXG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKiBGZXRjaCBBcHBsaWNhdGlvbiBvZiB0aGUgQ2xpZW50IChpZiBUb2tlbiBpcyBwcmVzZW50KSAqL1xuICBhc3luYyBmZXRjaEFwcGxpY2F0aW9uKCk6IFByb21pc2U8QXBwbGljYXRpb24+IHtcbiAgICBjb25zdCBhcHAgPSBhd2FpdCB0aGlzLnJlc3QuYXBpLm9hdXRoMi5hcHBsaWNhdGlvbnNbJ0BtZSddLmdldCgpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS10eXBlLWFzc2VydGlvblxuICAgIHJldHVybiBuZXcgQXBwbGljYXRpb24odGhpcy5jbGllbnQhLCBhcHApXG4gIH1cbn1cblxuZXhwb3J0IHsgSW50ZXJhY3Rpb25zQ2xpZW50IGFzIFNsYXNoQ2xpZW50IH1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUNFLDZCQUE2QixRQUV4QixzQ0FBcUM7QUFDNUMsU0FBUyxXQUFXLEVBQUUsa0JBQWtCLFFBQVEsZ0NBQStCO0FBQy9FLFNBR0UsZUFBZSxRQUNWLDJCQUEwQjtBQUNqQyxTQUNFLDRCQUE0QixFQUM1QixzQkFBc0IsUUFFakIsaUNBQWdDO0FBRXZDLFNBQVMsV0FBVyxRQUFRLGlCQUFnQjtBQUU1QyxTQUFTLFFBQVEsRUFBRSxTQUFTLEVBQUUsT0FBTyxRQUFRLGdCQUFlO0FBQzVELFNBQVMsSUFBSSxRQUFRLHdCQUF1QjtBQUM1QyxTQUFTLG1CQUFtQixRQUFRLHFCQUFvQjtBQUN4RCxTQUFTLFVBQVUsRUFBRSxVQUFVLFFBQVEsdUJBQXNC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