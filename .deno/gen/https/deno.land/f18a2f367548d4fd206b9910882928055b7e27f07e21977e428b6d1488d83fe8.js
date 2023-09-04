/* eslint-disable @typescript-eslint/method-signature-style */ import { GatewayIntents } from '../types/gateway.ts';
import { RESTManager, TokenType } from '../rest/mod.ts';
import { DefaultCacheAdapter } from '../cache/mod.ts';
import { UsersManager } from '../managers/users.ts';
import { GuildManager } from '../managers/guilds.ts';
import { ChannelsManager } from '../managers/channels.ts';
import { ClientPresence } from '../structures/presence.ts';
import { EmojisManager } from '../managers/emojis.ts';
import { InteractionsClient } from '../interactions/client.ts';
import { ShardManager } from './shard.ts';
import { Application } from '../structures/application.ts';
import { Invite } from '../structures/invite.ts';
import { INVITE } from '../types/endpoint.ts';
import { HarmonyEventEmitter } from '../utils/events.ts';
import { fetchAuto } from '../../deps.ts';
import { Template } from '../structures/template.ts';
import { VoiceManager } from './voice.ts';
import { StickersManager } from '../managers/stickers.ts';
import { createOAuthURL } from '../utils/oauthURL.ts';
/**
 * Harmony Client. Provides high-level interface over the REST and WebSocket API.
 */ export class Client extends HarmonyEventEmitter {
    /** REST Manager - used to make all requests */ rest;
    /** User which Client logs in to, undefined until logs in */ user;
    #token;
    /** Token of the Bot/User */ get token() {
        return this.#token;
    }
    set token(val) {
        this.#token = val;
    }
    /** Cache Adapter */ get cache() {
        return this.#cache;
    }
    set cache(val) {
        this.#cache = val;
    }
    #cache = new DefaultCacheAdapter();
    /** Gateway Intents */ intents;
    /** Whether to force new session or not */ forceNewSession;
    /** Time till messages to stay cached, in MS. */ messageCacheLifetime = 3600000;
    /** Max number of messages to cache per channel. Default 100 */ messageCacheMax = 100;
    /** Time till messages to stay cached, in MS. */ reactionCacheLifetime = 3600000;
    /** Whether to fetch Uncached Message of Reaction or not? */ fetchUncachedReactions = false;
    /** Client Properties */ clientProperties;
    /** Default mention settings */ defaultAllowedMentions = {};
    /** Interactions Client */ interactions;
    /** @deprecated Alias to Interactions client in `client.interactions`, use original property instead */ slash;
    /** Whether to fetch Gateway info or not */ fetchGatewayInfo = true;
    /** Voice Connections Manager */ voice = new VoiceManager(this);
    /** Users Manager, containing all Users cached */ users = new UsersManager(this);
    /** Guilds Manager, providing cache & API interface to Guilds */ guilds = new GuildManager(this);
    /** Channels Manager, providing cache interface to Channels */ channels = new ChannelsManager(this);
    /** Channels Manager, providing cache interface to Channels */ emojis = new EmojisManager(this);
    /** Stickers Manager, providing cache interface to (Guild) Stickers and API interfacing */ stickers = new StickersManager(this);
    /** Last READY timestamp */ upSince;
    /** Client's presence. Startup one if set before connecting */ presence = new ClientPresence();
    _id;
    /** Shard on which this Client is */ shard;
    /** Shard Count */ shardCount = 'auto';
    /** Shard Manager of this Client if Sharded */ shards;
    /** Collectors set */ collectors = new Set();
    /** Whether Zlib compression (for Gateway) is enabled or not */ compress = true;
    /** Since when is Client online (ready). */ get uptime() {
        if (this.upSince === undefined) return 0;
        else {
            const dif = Date.now() - this.upSince.getTime();
            if (dif < 0) return 0;
            else return dif;
        }
    }
    /** Get Shard 0's Gateway */ get gateway() {
        return this.shards.list.get('0');
    }
    applicationID;
    applicationFlags;
    constructor(options = {}){
        super();
        this._id = options.id;
        this.token = options.token;
        this.intents = options.intents?.map((e)=>typeof e === 'string' ? GatewayIntents[e] : e);
        this.shards = new ShardManager(this);
        this.forceNewSession = options.forceNewSession;
        if (options.cache !== undefined) this.cache = options.cache;
        if (options.presence !== undefined) {
            this.presence = options.presence instanceof ClientPresence ? options.presence : new ClientPresence(options.presence);
        }
        if (options.messageCacheLifetime !== undefined) {
            this.messageCacheLifetime = options.messageCacheLifetime;
        }
        if (options.reactionCacheLifetime !== undefined) {
            this.reactionCacheLifetime = options.reactionCacheLifetime;
        }
        if (options.fetchUncachedReactions === true) {
            this.fetchUncachedReactions = true;
        }
        if (options.messageCacheMax !== undefined) {
            this.messageCacheMax = options.messageCacheMax;
        }
        if (options.compress !== undefined) this.compress = options.compress;
        if (this._decoratedEvents !== undefined && Object.keys(this._decoratedEvents).length !== 0) {
            Object.entries(this._decoratedEvents).forEach((entry)=>{
                this.on(entry[0], entry[1].bind(this));
            });
            this._decoratedEvents = undefined;
        }
        Object.defineProperty(this, 'clientProperties', {
            value: options.clientProperties === undefined ? {
                os: Deno.build.os,
                browser: 'harmony',
                device: 'harmony'
            } : options.clientProperties,
            enumerable: false
        });
        if (options.shard !== undefined) this.shard = options.shard;
        if (options.shardCount !== undefined) this.shardCount = options.shardCount;
        this.fetchGatewayInfo = options.fetchGatewayInfo ?? true;
        if (this.token === undefined) {
            try {
                const token = Deno.env.get('DISCORD_TOKEN');
                if (token !== undefined) {
                    this.token = token;
                    this.debug('Info', 'Found token in ENV');
                }
            } catch (e) {}
        }
        const restOptions = {
            token: ()=>this.token,
            tokenType: TokenType.Bot,
            canary: options.canary,
            client: this
        };
        if (options.restOptions !== undefined) {
            Object.assign(restOptions, options.restOptions);
        }
        this.rest = new RESTManager(restOptions);
        this.slash = this.interactions = new InteractionsClient({
            id: ()=>this.getEstimatedID(),
            client: this,
            enabled: options.enableSlash
        });
        this.defaultAllowedMentions = options.defaultAllowedMentions ?? {};
    }
    /**
   * Sets Cache Adapter
   *
   * Should NOT be set after bot is already logged in or using current cache.
   * Please look into using `cache` option.
   */ setAdapter(adapter) {
        this.cache = adapter;
        return this;
    }
    /** Changes Presence of Client */ setPresence(presence, onlyInShards = []) {
        if (presence instanceof ClientPresence) {
            this.presence = presence;
        } else this.presence = new ClientPresence(presence);
        this.shards.list.forEach((shard)=>{
            if (onlyInShards.length !== 0 && onlyInShards.includes(shard.shardID)) {
                return;
            }
            shard.sendPresence(this.presence.create());
        });
    }
    /** Emits debug event */ debug(tag, msg) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.emit('debug', `[${tag}] ${msg}`);
    }
    getEstimatedID() {
        if (this.user !== undefined) return this.user.id;
        else if (this.token !== undefined) {
            try {
                return atob(this.token.split('.')[0]);
            } catch (e) {
                return this._id ?? 'unknown';
            }
        } else {
            return this._id ?? 'unknown';
        }
    }
    /** Fetch Application of the Client */ async fetchApplication() {
        const app = await this.rest.api.oauth2.applications['@me'].get();
        return new Application(this, app);
    }
    /** Fetch an Invite */ async fetchInvite(id) {
        return await new Promise((resolve, reject)=>{
            this.rest.get(INVITE(id)).then((data)=>{
                resolve(new Invite(this, data));
            }).catch((e)=>reject(e));
        });
    }
    /**
   * This function is used for connecting to discord.
   * @param token Your token. This is required if not given in ClientOptions.
   * @param intents Gateway intents in array. This is required if not given in ClientOptions.
   */ async connect(token, intents) {
        const readyPromise = this.waitFor('ready', ()=>true);
        await this.guilds.flush();
        token ??= this.token;
        if (token === undefined) throw new Error('No Token Provided');
        this.token = token;
        if (intents !== undefined && this.intents !== undefined) {
            this.debug('client', 'Intents were set in both client and connect function. Using the one in the connect function...');
        } else if (intents === undefined && this.intents !== undefined) {
            intents = this.intents;
        } else if (intents !== undefined && this.intents === undefined) {
            this.intents = intents.map((e)=>typeof e === 'string' ? GatewayIntents[e] : e);
        } else throw new Error('No Gateway Intents were provided');
        this.rest.token = token;
        if (this.shard !== undefined) {
            if (typeof this.shardCount === 'number') {
                this.shards.cachedShardCount = this.shardCount;
            }
            await this.shards.launch(this.shard);
        } else await this.shards.connect();
        await readyPromise;
        return this;
    }
    /** Destroy the Gateway connection */ async destroy() {
        this.gateway.initialized = false;
        this.gateway.sequenceID = undefined;
        this.gateway.sessionID = undefined;
        await this.gateway.cache.delete('seq');
        await this.gateway.cache.delete('session_id');
        this.shards.destroy();
        this.user = undefined;
        this.upSince = undefined;
        return this;
    }
    /** Attempt to Close current Gateway connection and Resume */ async reconnect() {
        this.gateway.closeGateway();
        this.gateway.initWebsocket();
        return this.waitFor('ready', ()=>true).then(()=>this);
    }
    /** Add a new Collector */ addCollector(collector) {
        if (this.collectors.has(collector)) return false;
        else {
            this.collectors.add(collector);
            return true;
        }
    }
    /** Remove a Collector */ removeCollector(collector) {
        if (!this.collectors.has(collector)) return false;
        else {
            this.collectors.delete(collector);
            return true;
        }
    }
    async emit(event, ...args) {
        const collectors = [];
        for (const collector of this.collectors.values()){
            if (collector.event === event) collectors.push(collector);
        }
        if (collectors.length !== 0) {
            collectors.forEach((collector)=>collector._fire(...args));
        }
        // TODO(DjDeveloperr): Fix this ts-ignore
        // eslint-disable-next-line @typescript-eslint/prefer-ts-expect-error
        // @ts-ignore
        return super.emit(event, ...args);
    }
    /** Returns an array of voice region objects that can be used when creating servers. */ async fetchVoiceRegions() {
        return this.rest.api.voice.regions.get();
    }
    /** Modify current (Client) User. */ async editUser(data) {
        if (data.username === undefined && data.avatar === undefined) {
            throw new Error('Either username or avatar or both must be specified to edit');
        }
        if (data.avatar?.startsWith('http') === true) {
            data.avatar = await fetchAuto(data.avatar);
        }
        await this.rest.api.users['@me'].patch({
            username: data.username,
            avatar: data.avatar
        });
        return this;
    }
    /** Change Username of the Client User */ async setUsername(username) {
        return await this.editUser({
            username
        });
    }
    /** Change Avatar of the Client User */ async setAvatar(avatar) {
        return await this.editUser({
            avatar
        });
    }
    /** Create a DM Channel with a User */ async createDM(user) {
        const id = typeof user === 'object' ? user.id : user;
        const dmPayload = await this.rest.api.users['@me'].channels.post({
            recipient_id: id
        });
        await this.channels.set(dmPayload.id, dmPayload);
        return this.channels.get(dmPayload.id);
    }
    /** Returns a template object for the given code. */ async fetchTemplate(code) {
        const payload = await this.rest.api.guilds.templates[code].get();
        return new Template(this, payload);
    }
    /** Creates an OAuth2 URL */ createOAuthURL(options) {
        return createOAuthURL(Object.assign({
            clientID: this.getEstimatedID()
        }, options));
    }
}
/** Event decorator to create an Event handler from function */ // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function event(name1) {
    return function(client, prop) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        const c = client;
        const listener = client[prop];
        if (typeof listener !== 'function') {
            throw new Error('@event decorator requires a function');
        }
        if (c._decoratedEvents === undefined) c._decoratedEvents = {};
        const key = name === undefined ? prop : name;
        c._decoratedEvents[key] = listener;
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2NsaWVudC9jbGllbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L21ldGhvZC1zaWduYXR1cmUtc3R5bGUgKi9cbmltcG9ydCB0eXBlIHsgVXNlciB9IGZyb20gJy4uL3N0cnVjdHVyZXMvdXNlci50cydcbmltcG9ydCB7IEdhdGV3YXlJbnRlbnRzIH0gZnJvbSAnLi4vdHlwZXMvZ2F0ZXdheS50cydcbmltcG9ydCB7IEdhdGV3YXkgfSBmcm9tICcuLi9nYXRld2F5L21vZC50cydcbmltcG9ydCB7IFJFU1RNYW5hZ2VyLCBSRVNUT3B0aW9ucywgVG9rZW5UeXBlIH0gZnJvbSAnLi4vcmVzdC9tb2QudHMnXG5pbXBvcnQgeyBEZWZhdWx0Q2FjaGVBZGFwdGVyLCBJQ2FjaGVBZGFwdGVyIH0gZnJvbSAnLi4vY2FjaGUvbW9kLnRzJ1xuaW1wb3J0IHsgVXNlcnNNYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlcnMvdXNlcnMudHMnXG5pbXBvcnQgeyBHdWlsZE1hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2Vycy9ndWlsZHMudHMnXG5pbXBvcnQgeyBDaGFubmVsc01hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2Vycy9jaGFubmVscy50cydcbmltcG9ydCB7IENsaWVudFByZXNlbmNlIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9wcmVzZW5jZS50cydcbmltcG9ydCB7IEVtb2ppc01hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2Vycy9lbW9qaXMudHMnXG5pbXBvcnQgeyBBY3Rpdml0eUdhbWUsIENsaWVudEFjdGl2aXR5IH0gZnJvbSAnLi4vdHlwZXMvcHJlc2VuY2UudHMnXG5pbXBvcnQgdHlwZSB7IEV4dGVuc2lvbiB9IGZyb20gJy4uL2NvbW1hbmRzL2V4dGVuc2lvbi50cydcbmltcG9ydCB7IEludGVyYWN0aW9uc0NsaWVudCB9IGZyb20gJy4uL2ludGVyYWN0aW9ucy9jbGllbnQudHMnXG5pbXBvcnQgeyBTaGFyZE1hbmFnZXIgfSBmcm9tICcuL3NoYXJkLnRzJ1xuaW1wb3J0IHsgQXBwbGljYXRpb24gfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2FwcGxpY2F0aW9uLnRzJ1xuaW1wb3J0IHsgSW52aXRlIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9pbnZpdGUudHMnXG5pbXBvcnQgeyBJTlZJVEUgfSBmcm9tICcuLi90eXBlcy9lbmRwb2ludC50cydcbmltcG9ydCB0eXBlIHsgQ2xpZW50RXZlbnRzIH0gZnJvbSAnLi4vZ2F0ZXdheS9oYW5kbGVycy9tb2QudHMnXG5pbXBvcnQgdHlwZSB7IENvbGxlY3RvciB9IGZyb20gJy4vY29sbGVjdG9ycy50cydcbmltcG9ydCB7IEhhcm1vbnlFdmVudEVtaXR0ZXIgfSBmcm9tICcuLi91dGlscy9ldmVudHMudHMnXG5pbXBvcnQgdHlwZSB7IFZvaWNlUmVnaW9uIH0gZnJvbSAnLi4vdHlwZXMvdm9pY2UudHMnXG5pbXBvcnQgeyBmZXRjaEF1dG8gfSBmcm9tICcuLi8uLi9kZXBzLnRzJ1xuaW1wb3J0IHR5cGUgeyBETUNoYW5uZWwgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2RtQ2hhbm5lbC50cydcbmltcG9ydCB7IFRlbXBsYXRlIH0gZnJvbSAnLi4vc3RydWN0dXJlcy90ZW1wbGF0ZS50cydcbmltcG9ydCB7IFZvaWNlTWFuYWdlciB9IGZyb20gJy4vdm9pY2UudHMnXG5pbXBvcnQgeyBTdGlja2Vyc01hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2Vycy9zdGlja2Vycy50cydcbmltcG9ydCB7IGNyZWF0ZU9BdXRoVVJMLCBPQXV0aFVSTE9wdGlvbnMgfSBmcm9tICcuLi91dGlscy9vYXV0aFVSTC50cydcbmltcG9ydCB0eXBlIHsgQWxsb3dlZE1lbnRpb25zUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzL2NoYW5uZWwudHMnXG5cbi8qKiBPUyByZWxhdGVkIHByb3BlcnRpZXMgc2VudCB3aXRoIEdhdGV3YXkgSWRlbnRpZnkgKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ2xpZW50UHJvcGVydGllcyB7XG4gIG9zPzogJ2RhcndpbicgfCAnd2luZG93cycgfCAnbGludXgnIHwgJ2N1c3RvbV9vcycgfCBzdHJpbmdcbiAgYnJvd3Nlcj86ICdoYXJtb255JyB8IHN0cmluZ1xuICBkZXZpY2U/OiAnaGFybW9ueScgfCBzdHJpbmdcbn1cblxuLyoqIFNvbWUgQ2xpZW50IE9wdGlvbnMgdG8gbW9kaWZ5IGJlaGF2aW91ciAqL1xuZXhwb3J0IGludGVyZmFjZSBDbGllbnRPcHRpb25zIHtcbiAgLyoqIElEIG9mIHRoZSBDbGllbnQvQXBwbGljYXRpb24gdG8gaW5pdGlhbGl6ZSBTbGFzaCBDbGllbnQgUkVTVCAqL1xuICBpZD86IHN0cmluZ1xuICAvKiogVG9rZW4gb2YgdGhlIEJvdC9Vc2VyICovXG4gIHRva2VuPzogc3RyaW5nXG4gIC8qKiBHYXRld2F5IEludGVudHMgKi9cbiAgaW50ZW50cz86IEFycmF5PEdhdGV3YXlJbnRlbnRzIHwga2V5b2YgdHlwZW9mIEdhdGV3YXlJbnRlbnRzPlxuICAvKiogQ2FjaGUgQWRhcHRlciB0byB1c2UsIGRlZmF1bHRzIHRvIENvbGxlY3Rpb25zIG9uZSAqL1xuICBjYWNoZT86IElDYWNoZUFkYXB0ZXJcbiAgLyoqIEZvcmNlIE5ldyBTZXNzaW9uIGFuZCBkb24ndCB1c2UgY2FjaGVkIFNlc3Npb24gKGJ5IHBlcnNpc3RlbnQgY2FjaGluZykgKi9cbiAgZm9yY2VOZXdTZXNzaW9uPzogYm9vbGVhblxuICAvKiogU3RhcnR1cCBwcmVzZW5jZSBvZiBjbGllbnQgKi9cbiAgcHJlc2VuY2U/OiBDbGllbnRQcmVzZW5jZSB8IENsaWVudEFjdGl2aXR5IHwgQWN0aXZpdHlHYW1lXG4gIC8qKiBGb3JjZSBhbGwgcmVxdWVzdHMgdG8gQ2FuYXJ5IEFQSSAqL1xuICBjYW5hcnk/OiBib29sZWFuXG4gIC8qKiBUaW1lIHRpbGwgd2hpY2ggTWVzc2FnZXMgYXJlIHRvIGJlIGNhY2hlZCwgaW4gTVMuIERlZmF1bHQgaXMgMzYwMDAwMCAqL1xuICBtZXNzYWdlQ2FjaGVMaWZldGltZT86IG51bWJlclxuICAvKiogVGltZSB0aWxsIHdoaWNoIE1lc3NhZ2UgUmVhY3Rpb25zIGFyZSB0byBiZSBjYWNoZWQsIGluIE1TLiBEZWZhdWx0IGlzIDM2MDAwMDAgKi9cbiAgcmVhY3Rpb25DYWNoZUxpZmV0aW1lPzogbnVtYmVyXG4gIC8qKiBXaGV0aGVyIHRvIGZldGNoIFVuY2FjaGVkIE1lc3NhZ2Ugb2YgUmVhY3Rpb24gb3Igbm90PyAqL1xuICBmZXRjaFVuY2FjaGVkUmVhY3Rpb25zPzogYm9vbGVhblxuICAvKiogQ2xpZW50IFByb3BlcnRpZXMgKi9cbiAgY2xpZW50UHJvcGVydGllcz86IENsaWVudFByb3BlcnRpZXNcbiAgLyoqIEVuYWJsZS9EaXNhYmxlIFNsYXNoIENvbW1hbmRzIEludGVncmF0aW9uIChlbmFibGVkIGJ5IGRlZmF1bHQpICovXG4gIGVuYWJsZVNsYXNoPzogYm9vbGVhblxuICAvKiogRGlzYWJsZSB0YWtpbmcgdG9rZW4gZnJvbSBlbnYgaWYgbm90IHByb3ZpZGVkICh0b2tlbiBpcyB0YWtlbiBmcm9tIGVudiBpZiBwcmVzZW50IGJ5IGRlZmF1bHQpICovXG4gIGRpc2FibGVFbnZUb2tlbj86IGJvb2xlYW5cbiAgLyoqIE92ZXJyaWRlIFJFU1QgT3B0aW9ucyAqL1xuICByZXN0T3B0aW9ucz86IFJFU1RPcHRpb25zXG4gIC8qKiBXaGV0aGVyIHRvIGZldGNoIEdhdGV3YXkgaW5mbyBvciBub3QgKi9cbiAgZmV0Y2hHYXRld2F5SW5mbz86IGJvb2xlYW5cbiAgLyoqIEFEVkFOQ0VEOiBTaGFyZCBJRCB0byBsYXVuY2ggb24gKi9cbiAgc2hhcmQ/OiBudW1iZXJcbiAgLyoqIEFEVkFOQ0VEOiBTaGFyZCBjb3VudC4gKi9cbiAgc2hhcmRDb3VudD86IG51bWJlciB8ICdhdXRvJ1xuICAvKiogV2hldGhlciB0byBlbmFibGUgWmxpYiBDb21wcmVzc2lvbiAoZm9yIEdhdGV3YXkpIG9yIG5vdCAoZW5hYmxlZCBieSBkZWZhdWx0KSAqL1xuICBjb21wcmVzcz86IGJvb2xlYW5cbiAgLyoqIE1heCBudW1iZXIgb2YgbWVzc2FnZXMgdG8gY2FjaGUgcGVyIGNoYW5uZWwuIERlZmF1bHQgMTAwICovXG4gIG1lc3NhZ2VDYWNoZU1heD86IG51bWJlclxuICAvKiogRGVmYXVsdCBBbGxvd2VkIE1lbnRpb25zICovXG4gIGRlZmF1bHRBbGxvd2VkTWVudGlvbnM/OiBBbGxvd2VkTWVudGlvbnNQYXlsb2FkXG59XG5cbi8qKlxuICogSGFybW9ueSBDbGllbnQuIFByb3ZpZGVzIGhpZ2gtbGV2ZWwgaW50ZXJmYWNlIG92ZXIgdGhlIFJFU1QgYW5kIFdlYlNvY2tldCBBUEkuXG4gKi9cbmV4cG9ydCBjbGFzcyBDbGllbnQgZXh0ZW5kcyBIYXJtb255RXZlbnRFbWl0dGVyPENsaWVudEV2ZW50cz4ge1xuICAvKiogUkVTVCBNYW5hZ2VyIC0gdXNlZCB0byBtYWtlIGFsbCByZXF1ZXN0cyAqL1xuICByZXN0OiBSRVNUTWFuYWdlclxuICAvKiogVXNlciB3aGljaCBDbGllbnQgbG9ncyBpbiB0bywgdW5kZWZpbmVkIHVudGlsIGxvZ3MgaW4gKi9cbiAgdXNlcj86IFVzZXJcblxuICAjdG9rZW4/OiBzdHJpbmdcblxuICAvKiogVG9rZW4gb2YgdGhlIEJvdC9Vc2VyICovXG4gIGdldCB0b2tlbigpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLiN0b2tlblxuICB9XG5cbiAgc2V0IHRva2VuKHZhbDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG4gICAgdGhpcy4jdG9rZW4gPSB2YWxcbiAgfVxuXG4gIC8qKiBDYWNoZSBBZGFwdGVyICovXG4gIGdldCBjYWNoZSgpOiBJQ2FjaGVBZGFwdGVyIHtcbiAgICByZXR1cm4gdGhpcy4jY2FjaGVcbiAgfVxuXG4gIHNldCBjYWNoZSh2YWw6IElDYWNoZUFkYXB0ZXIpIHtcbiAgICB0aGlzLiNjYWNoZSA9IHZhbFxuICB9XG5cbiAgI2NhY2hlOiBJQ2FjaGVBZGFwdGVyID0gbmV3IERlZmF1bHRDYWNoZUFkYXB0ZXIoKVxuXG4gIC8qKiBHYXRld2F5IEludGVudHMgKi9cbiAgaW50ZW50cz86IEdhdGV3YXlJbnRlbnRzW11cbiAgLyoqIFdoZXRoZXIgdG8gZm9yY2UgbmV3IHNlc3Npb24gb3Igbm90ICovXG4gIGZvcmNlTmV3U2Vzc2lvbj86IGJvb2xlYW5cbiAgLyoqIFRpbWUgdGlsbCBtZXNzYWdlcyB0byBzdGF5IGNhY2hlZCwgaW4gTVMuICovXG4gIG1lc3NhZ2VDYWNoZUxpZmV0aW1lOiBudW1iZXIgPSAzNjAwMDAwXG4gIC8qKiBNYXggbnVtYmVyIG9mIG1lc3NhZ2VzIHRvIGNhY2hlIHBlciBjaGFubmVsLiBEZWZhdWx0IDEwMCAqL1xuICBtZXNzYWdlQ2FjaGVNYXg6IG51bWJlciA9IDEwMFxuICAvKiogVGltZSB0aWxsIG1lc3NhZ2VzIHRvIHN0YXkgY2FjaGVkLCBpbiBNUy4gKi9cbiAgcmVhY3Rpb25DYWNoZUxpZmV0aW1lOiBudW1iZXIgPSAzNjAwMDAwXG4gIC8qKiBXaGV0aGVyIHRvIGZldGNoIFVuY2FjaGVkIE1lc3NhZ2Ugb2YgUmVhY3Rpb24gb3Igbm90PyAqL1xuICBmZXRjaFVuY2FjaGVkUmVhY3Rpb25zOiBib29sZWFuID0gZmFsc2VcblxuICAvKiogQ2xpZW50IFByb3BlcnRpZXMgKi9cbiAgcmVhZG9ubHkgY2xpZW50UHJvcGVydGllcyE6IENsaWVudFByb3BlcnRpZXNcbiAgLyoqIERlZmF1bHQgbWVudGlvbiBzZXR0aW5ncyAqL1xuICBkZWZhdWx0QWxsb3dlZE1lbnRpb25zOiBBbGxvd2VkTWVudGlvbnNQYXlsb2FkID0ge31cblxuICAvKiogSW50ZXJhY3Rpb25zIENsaWVudCAqL1xuICBpbnRlcmFjdGlvbnM6IEludGVyYWN0aW9uc0NsaWVudFxuICAvKiogQGRlcHJlY2F0ZWQgQWxpYXMgdG8gSW50ZXJhY3Rpb25zIGNsaWVudCBpbiBgY2xpZW50LmludGVyYWN0aW9uc2AsIHVzZSBvcmlnaW5hbCBwcm9wZXJ0eSBpbnN0ZWFkICovXG4gIHNsYXNoOiBJbnRlcmFjdGlvbnNDbGllbnRcbiAgLyoqIFdoZXRoZXIgdG8gZmV0Y2ggR2F0ZXdheSBpbmZvIG9yIG5vdCAqL1xuICBmZXRjaEdhdGV3YXlJbmZvOiBib29sZWFuID0gdHJ1ZVxuXG4gIC8qKiBWb2ljZSBDb25uZWN0aW9ucyBNYW5hZ2VyICovXG4gIHJlYWRvbmx5IHZvaWNlID0gbmV3IFZvaWNlTWFuYWdlcih0aGlzKVxuXG4gIC8qKiBVc2VycyBNYW5hZ2VyLCBjb250YWluaW5nIGFsbCBVc2VycyBjYWNoZWQgKi9cbiAgcmVhZG9ubHkgdXNlcnM6IFVzZXJzTWFuYWdlciA9IG5ldyBVc2Vyc01hbmFnZXIodGhpcylcbiAgLyoqIEd1aWxkcyBNYW5hZ2VyLCBwcm92aWRpbmcgY2FjaGUgJiBBUEkgaW50ZXJmYWNlIHRvIEd1aWxkcyAqL1xuICByZWFkb25seSBndWlsZHM6IEd1aWxkTWFuYWdlciA9IG5ldyBHdWlsZE1hbmFnZXIodGhpcylcbiAgLyoqIENoYW5uZWxzIE1hbmFnZXIsIHByb3ZpZGluZyBjYWNoZSBpbnRlcmZhY2UgdG8gQ2hhbm5lbHMgKi9cbiAgcmVhZG9ubHkgY2hhbm5lbHM6IENoYW5uZWxzTWFuYWdlciA9IG5ldyBDaGFubmVsc01hbmFnZXIodGhpcylcbiAgLyoqIENoYW5uZWxzIE1hbmFnZXIsIHByb3ZpZGluZyBjYWNoZSBpbnRlcmZhY2UgdG8gQ2hhbm5lbHMgKi9cbiAgcmVhZG9ubHkgZW1vamlzOiBFbW9qaXNNYW5hZ2VyID0gbmV3IEVtb2ppc01hbmFnZXIodGhpcylcbiAgLyoqIFN0aWNrZXJzIE1hbmFnZXIsIHByb3ZpZGluZyBjYWNoZSBpbnRlcmZhY2UgdG8gKEd1aWxkKSBTdGlja2VycyBhbmQgQVBJIGludGVyZmFjaW5nICovXG4gIHJlYWRvbmx5IHN0aWNrZXJzOiBTdGlja2Vyc01hbmFnZXIgPSBuZXcgU3RpY2tlcnNNYW5hZ2VyKHRoaXMpXG5cbiAgLyoqIExhc3QgUkVBRFkgdGltZXN0YW1wICovXG4gIHVwU2luY2U/OiBEYXRlXG5cbiAgLyoqIENsaWVudCdzIHByZXNlbmNlLiBTdGFydHVwIG9uZSBpZiBzZXQgYmVmb3JlIGNvbm5lY3RpbmcgKi9cbiAgcHJlc2VuY2U6IENsaWVudFByZXNlbmNlID0gbmV3IENsaWVudFByZXNlbmNlKClcblxuICBfaWQ/OiBzdHJpbmdcblxuICAvKiogU2hhcmQgb24gd2hpY2ggdGhpcyBDbGllbnQgaXMgKi9cbiAgc2hhcmQ/OiBudW1iZXJcbiAgLyoqIFNoYXJkIENvdW50ICovXG4gIHNoYXJkQ291bnQ6IG51bWJlciB8ICdhdXRvJyA9ICdhdXRvJ1xuICAvKiogU2hhcmQgTWFuYWdlciBvZiB0aGlzIENsaWVudCBpZiBTaGFyZGVkICovXG4gIHNoYXJkczogU2hhcmRNYW5hZ2VyXG4gIC8qKiBDb2xsZWN0b3JzIHNldCAqL1xuICBjb2xsZWN0b3JzOiBTZXQ8Q29sbGVjdG9yPiA9IG5ldyBTZXQoKVxuXG4gIC8qKiBXaGV0aGVyIFpsaWIgY29tcHJlc3Npb24gKGZvciBHYXRld2F5KSBpcyBlbmFibGVkIG9yIG5vdCAqL1xuICBjb21wcmVzcyA9IHRydWVcblxuICAvKiogU2luY2Ugd2hlbiBpcyBDbGllbnQgb25saW5lIChyZWFkeSkuICovXG4gIGdldCB1cHRpbWUoKTogbnVtYmVyIHtcbiAgICBpZiAodGhpcy51cFNpbmNlID09PSB1bmRlZmluZWQpIHJldHVybiAwXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBkaWYgPSBEYXRlLm5vdygpIC0gdGhpcy51cFNpbmNlLmdldFRpbWUoKVxuICAgICAgaWYgKGRpZiA8IDApIHJldHVybiAwXG4gICAgICBlbHNlIHJldHVybiBkaWZcbiAgICB9XG4gIH1cblxuICAvKiogR2V0IFNoYXJkIDAncyBHYXRld2F5ICovXG4gIGdldCBnYXRld2F5KCk6IEdhdGV3YXkge1xuICAgIHJldHVybiB0aGlzLnNoYXJkcy5saXN0LmdldCgnMCcpIVxuICB9XG5cbiAgYXBwbGljYXRpb25JRD86IHN0cmluZ1xuICBhcHBsaWNhdGlvbkZsYWdzPzogbnVtYmVyXG5cbiAgY29uc3RydWN0b3Iob3B0aW9uczogQ2xpZW50T3B0aW9ucyA9IHt9KSB7XG4gICAgc3VwZXIoKVxuICAgIHRoaXMuX2lkID0gb3B0aW9ucy5pZFxuICAgIHRoaXMudG9rZW4gPSBvcHRpb25zLnRva2VuXG4gICAgdGhpcy5pbnRlbnRzID0gb3B0aW9ucy5pbnRlbnRzPy5tYXAoKGUpID0+XG4gICAgICB0eXBlb2YgZSA9PT0gJ3N0cmluZycgPyBHYXRld2F5SW50ZW50c1tlXSA6IGVcbiAgICApXG4gICAgdGhpcy5zaGFyZHMgPSBuZXcgU2hhcmRNYW5hZ2VyKHRoaXMpXG4gICAgdGhpcy5mb3JjZU5ld1Nlc3Npb24gPSBvcHRpb25zLmZvcmNlTmV3U2Vzc2lvblxuICAgIGlmIChvcHRpb25zLmNhY2hlICE9PSB1bmRlZmluZWQpIHRoaXMuY2FjaGUgPSBvcHRpb25zLmNhY2hlXG4gICAgaWYgKG9wdGlvbnMucHJlc2VuY2UgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5wcmVzZW5jZSA9XG4gICAgICAgIG9wdGlvbnMucHJlc2VuY2UgaW5zdGFuY2VvZiBDbGllbnRQcmVzZW5jZVxuICAgICAgICAgID8gb3B0aW9ucy5wcmVzZW5jZVxuICAgICAgICAgIDogbmV3IENsaWVudFByZXNlbmNlKG9wdGlvbnMucHJlc2VuY2UpXG4gICAgfVxuICAgIGlmIChvcHRpb25zLm1lc3NhZ2VDYWNoZUxpZmV0aW1lICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMubWVzc2FnZUNhY2hlTGlmZXRpbWUgPSBvcHRpb25zLm1lc3NhZ2VDYWNoZUxpZmV0aW1lXG4gICAgfVxuICAgIGlmIChvcHRpb25zLnJlYWN0aW9uQ2FjaGVMaWZldGltZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnJlYWN0aW9uQ2FjaGVMaWZldGltZSA9IG9wdGlvbnMucmVhY3Rpb25DYWNoZUxpZmV0aW1lXG4gICAgfVxuICAgIGlmIChvcHRpb25zLmZldGNoVW5jYWNoZWRSZWFjdGlvbnMgPT09IHRydWUpIHtcbiAgICAgIHRoaXMuZmV0Y2hVbmNhY2hlZFJlYWN0aW9ucyA9IHRydWVcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMubWVzc2FnZUNhY2hlTWF4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMubWVzc2FnZUNhY2hlTWF4ID0gb3B0aW9ucy5tZXNzYWdlQ2FjaGVNYXhcbiAgICB9XG4gICAgaWYgKG9wdGlvbnMuY29tcHJlc3MgIT09IHVuZGVmaW5lZCkgdGhpcy5jb21wcmVzcyA9IG9wdGlvbnMuY29tcHJlc3NcblxuICAgIGlmIChcbiAgICAgICh0aGlzIGFzIGFueSkuX2RlY29yYXRlZEV2ZW50cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBPYmplY3Qua2V5cygodGhpcyBhcyBhbnkpLl9kZWNvcmF0ZWRFdmVudHMpLmxlbmd0aCAhPT0gMFxuICAgICkge1xuICAgICAgT2JqZWN0LmVudHJpZXMoKHRoaXMgYXMgYW55KS5fZGVjb3JhdGVkRXZlbnRzKS5mb3JFYWNoKChlbnRyeSkgPT4ge1xuICAgICAgICB0aGlzLm9uKGVudHJ5WzBdIGFzIGtleW9mIENsaWVudEV2ZW50cywgKGVudHJ5IGFzIGFueSlbMV0uYmluZCh0aGlzKSlcbiAgICAgIH0pXG4gICAgICA7KHRoaXMgYXMgYW55KS5fZGVjb3JhdGVkRXZlbnRzID0gdW5kZWZpbmVkXG4gICAgfVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjbGllbnRQcm9wZXJ0aWVzJywge1xuICAgICAgdmFsdWU6XG4gICAgICAgIG9wdGlvbnMuY2xpZW50UHJvcGVydGllcyA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyB7XG4gICAgICAgICAgICAgIG9zOiBEZW5vLmJ1aWxkLm9zLFxuICAgICAgICAgICAgICBicm93c2VyOiAnaGFybW9ueScsXG4gICAgICAgICAgICAgIGRldmljZTogJ2hhcm1vbnknXG4gICAgICAgICAgICB9XG4gICAgICAgICAgOiBvcHRpb25zLmNsaWVudFByb3BlcnRpZXMsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pXG5cbiAgICBpZiAob3B0aW9ucy5zaGFyZCAhPT0gdW5kZWZpbmVkKSB0aGlzLnNoYXJkID0gb3B0aW9ucy5zaGFyZFxuICAgIGlmIChvcHRpb25zLnNoYXJkQ291bnQgIT09IHVuZGVmaW5lZCkgdGhpcy5zaGFyZENvdW50ID0gb3B0aW9ucy5zaGFyZENvdW50XG5cbiAgICB0aGlzLmZldGNoR2F0ZXdheUluZm8gPSBvcHRpb25zLmZldGNoR2F0ZXdheUluZm8gPz8gdHJ1ZVxuXG4gICAgaWYgKHRoaXMudG9rZW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgdG9rZW4gPSBEZW5vLmVudi5nZXQoJ0RJU0NPUkRfVE9LRU4nKVxuICAgICAgICBpZiAodG9rZW4gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMudG9rZW4gPSB0b2tlblxuICAgICAgICAgIHRoaXMuZGVidWcoJ0luZm8nLCAnRm91bmQgdG9rZW4gaW4gRU5WJylcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge31cbiAgICB9XG5cbiAgICBjb25zdCByZXN0T3B0aW9uczogUkVTVE9wdGlvbnMgPSB7XG4gICAgICB0b2tlbjogKCkgPT4gdGhpcy50b2tlbixcbiAgICAgIHRva2VuVHlwZTogVG9rZW5UeXBlLkJvdCxcbiAgICAgIGNhbmFyeTogb3B0aW9ucy5jYW5hcnksXG4gICAgICBjbGllbnQ6IHRoaXNcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5yZXN0T3B0aW9ucyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBPYmplY3QuYXNzaWduKHJlc3RPcHRpb25zLCBvcHRpb25zLnJlc3RPcHRpb25zKVxuICAgIH1cbiAgICB0aGlzLnJlc3QgPSBuZXcgUkVTVE1hbmFnZXIocmVzdE9wdGlvbnMpXG5cbiAgICB0aGlzLnNsYXNoID0gdGhpcy5pbnRlcmFjdGlvbnMgPSBuZXcgSW50ZXJhY3Rpb25zQ2xpZW50KHtcbiAgICAgIGlkOiAoKSA9PiB0aGlzLmdldEVzdGltYXRlZElEKCksXG4gICAgICBjbGllbnQ6IHRoaXMsXG4gICAgICBlbmFibGVkOiBvcHRpb25zLmVuYWJsZVNsYXNoXG4gICAgfSlcblxuICAgIHRoaXMuZGVmYXVsdEFsbG93ZWRNZW50aW9ucyA9IG9wdGlvbnMuZGVmYXVsdEFsbG93ZWRNZW50aW9ucyA/PyB7fVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgQ2FjaGUgQWRhcHRlclxuICAgKlxuICAgKiBTaG91bGQgTk9UIGJlIHNldCBhZnRlciBib3QgaXMgYWxyZWFkeSBsb2dnZWQgaW4gb3IgdXNpbmcgY3VycmVudCBjYWNoZS5cbiAgICogUGxlYXNlIGxvb2sgaW50byB1c2luZyBgY2FjaGVgIG9wdGlvbi5cbiAgICovXG4gIHNldEFkYXB0ZXIoYWRhcHRlcjogSUNhY2hlQWRhcHRlcik6IENsaWVudCB7XG4gICAgdGhpcy5jYWNoZSA9IGFkYXB0ZXJcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIENoYW5nZXMgUHJlc2VuY2Ugb2YgQ2xpZW50ICovXG4gIHNldFByZXNlbmNlKFxuICAgIHByZXNlbmNlOiBDbGllbnRQcmVzZW5jZSB8IENsaWVudEFjdGl2aXR5IHwgQWN0aXZpdHlHYW1lLFxuICAgIG9ubHlJblNoYXJkczogbnVtYmVyW10gPSBbXVxuICApOiB2b2lkIHtcbiAgICBpZiAocHJlc2VuY2UgaW5zdGFuY2VvZiBDbGllbnRQcmVzZW5jZSkge1xuICAgICAgdGhpcy5wcmVzZW5jZSA9IHByZXNlbmNlXG4gICAgfSBlbHNlIHRoaXMucHJlc2VuY2UgPSBuZXcgQ2xpZW50UHJlc2VuY2UocHJlc2VuY2UpXG4gICAgdGhpcy5zaGFyZHMubGlzdC5mb3JFYWNoKChzaGFyZCkgPT4ge1xuICAgICAgaWYgKG9ubHlJblNoYXJkcy5sZW5ndGggIT09IDAgJiYgb25seUluU2hhcmRzLmluY2x1ZGVzKHNoYXJkLnNoYXJkSUQpKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgc2hhcmQuc2VuZFByZXNlbmNlKHRoaXMucHJlc2VuY2UuY3JlYXRlKCkpXG4gICAgfSlcbiAgfVxuXG4gIC8qKiBFbWl0cyBkZWJ1ZyBldmVudCAqL1xuICBkZWJ1Zyh0YWc6IHN0cmluZywgbXNnOiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWZsb2F0aW5nLXByb21pc2VzXG4gICAgdGhpcy5lbWl0KCdkZWJ1ZycsIGBbJHt0YWd9XSAke21zZ31gKVxuICB9XG5cbiAgZ2V0RXN0aW1hdGVkSUQoKTogc3RyaW5nIHtcbiAgICBpZiAodGhpcy51c2VyICE9PSB1bmRlZmluZWQpIHJldHVybiB0aGlzLnVzZXIuaWRcbiAgICBlbHNlIGlmICh0aGlzLnRva2VuICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBhdG9iKHRoaXMudG9rZW4uc3BsaXQoJy4nKVswXSlcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lkID8/ICd1bmtub3duJ1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5faWQgPz8gJ3Vua25vd24nXG4gICAgfVxuICB9XG5cbiAgLyoqIEZldGNoIEFwcGxpY2F0aW9uIG9mIHRoZSBDbGllbnQgKi9cbiAgYXN5bmMgZmV0Y2hBcHBsaWNhdGlvbigpOiBQcm9taXNlPEFwcGxpY2F0aW9uPiB7XG4gICAgY29uc3QgYXBwID0gYXdhaXQgdGhpcy5yZXN0LmFwaS5vYXV0aDIuYXBwbGljYXRpb25zWydAbWUnXS5nZXQoKVxuICAgIHJldHVybiBuZXcgQXBwbGljYXRpb24odGhpcywgYXBwKVxuICB9XG5cbiAgLyoqIEZldGNoIGFuIEludml0ZSAqL1xuICBhc3luYyBmZXRjaEludml0ZShpZDogc3RyaW5nKTogUHJvbWlzZTxJbnZpdGU+IHtcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5yZXN0XG4gICAgICAgIC5nZXQoSU5WSVRFKGlkKSlcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICByZXNvbHZlKG5ldyBJbnZpdGUodGhpcywgZGF0YSkpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZSkgPT4gcmVqZWN0KGUpKVxuICAgIH0pXG4gIH1cblxuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIGZvciBjb25uZWN0aW5nIHRvIGRpc2NvcmQuXG4gICAqIEBwYXJhbSB0b2tlbiBZb3VyIHRva2VuLiBUaGlzIGlzIHJlcXVpcmVkIGlmIG5vdCBnaXZlbiBpbiBDbGllbnRPcHRpb25zLlxuICAgKiBAcGFyYW0gaW50ZW50cyBHYXRld2F5IGludGVudHMgaW4gYXJyYXkuIFRoaXMgaXMgcmVxdWlyZWQgaWYgbm90IGdpdmVuIGluIENsaWVudE9wdGlvbnMuXG4gICAqL1xuICBhc3luYyBjb25uZWN0KFxuICAgIHRva2VuPzogc3RyaW5nLFxuICAgIGludGVudHM/OiBBcnJheTxHYXRld2F5SW50ZW50cyB8IGtleW9mIHR5cGVvZiBHYXRld2F5SW50ZW50cz5cbiAgKTogUHJvbWlzZTxDbGllbnQ+IHtcbiAgICBjb25zdCByZWFkeVByb21pc2UgPSB0aGlzLndhaXRGb3IoJ3JlYWR5JywgKCkgPT4gdHJ1ZSlcbiAgICBhd2FpdCB0aGlzLmd1aWxkcy5mbHVzaCgpXG4gICAgdG9rZW4gPz89IHRoaXMudG9rZW5cbiAgICBpZiAodG9rZW4gPT09IHVuZGVmaW5lZCkgdGhyb3cgbmV3IEVycm9yKCdObyBUb2tlbiBQcm92aWRlZCcpXG4gICAgdGhpcy50b2tlbiA9IHRva2VuXG4gICAgaWYgKGludGVudHMgIT09IHVuZGVmaW5lZCAmJiB0aGlzLmludGVudHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5kZWJ1ZyhcbiAgICAgICAgJ2NsaWVudCcsXG4gICAgICAgICdJbnRlbnRzIHdlcmUgc2V0IGluIGJvdGggY2xpZW50IGFuZCBjb25uZWN0IGZ1bmN0aW9uLiBVc2luZyB0aGUgb25lIGluIHRoZSBjb25uZWN0IGZ1bmN0aW9uLi4uJ1xuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoaW50ZW50cyA9PT0gdW5kZWZpbmVkICYmIHRoaXMuaW50ZW50cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpbnRlbnRzID0gdGhpcy5pbnRlbnRzXG4gICAgfSBlbHNlIGlmIChpbnRlbnRzICE9PSB1bmRlZmluZWQgJiYgdGhpcy5pbnRlbnRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuaW50ZW50cyA9IGludGVudHMubWFwKChlKSA9PlxuICAgICAgICB0eXBlb2YgZSA9PT0gJ3N0cmluZycgPyBHYXRld2F5SW50ZW50c1tlXSA6IGVcbiAgICAgIClcbiAgICB9IGVsc2UgdGhyb3cgbmV3IEVycm9yKCdObyBHYXRld2F5IEludGVudHMgd2VyZSBwcm92aWRlZCcpXG5cbiAgICB0aGlzLnJlc3QudG9rZW4gPSB0b2tlblxuICAgIGlmICh0aGlzLnNoYXJkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGlmICh0eXBlb2YgdGhpcy5zaGFyZENvdW50ID09PSAnbnVtYmVyJykge1xuICAgICAgICB0aGlzLnNoYXJkcy5jYWNoZWRTaGFyZENvdW50ID0gdGhpcy5zaGFyZENvdW50XG4gICAgICB9XG4gICAgICBhd2FpdCB0aGlzLnNoYXJkcy5sYXVuY2godGhpcy5zaGFyZClcbiAgICB9IGVsc2UgYXdhaXQgdGhpcy5zaGFyZHMuY29ubmVjdCgpXG4gICAgYXdhaXQgcmVhZHlQcm9taXNlXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBEZXN0cm95IHRoZSBHYXRld2F5IGNvbm5lY3Rpb24gKi9cbiAgYXN5bmMgZGVzdHJveSgpOiBQcm9taXNlPENsaWVudD4ge1xuICAgIHRoaXMuZ2F0ZXdheS5pbml0aWFsaXplZCA9IGZhbHNlXG4gICAgdGhpcy5nYXRld2F5LnNlcXVlbmNlSUQgPSB1bmRlZmluZWRcbiAgICB0aGlzLmdhdGV3YXkuc2Vzc2lvbklEID0gdW5kZWZpbmVkXG4gICAgYXdhaXQgdGhpcy5nYXRld2F5LmNhY2hlLmRlbGV0ZSgnc2VxJylcbiAgICBhd2FpdCB0aGlzLmdhdGV3YXkuY2FjaGUuZGVsZXRlKCdzZXNzaW9uX2lkJylcbiAgICB0aGlzLnNoYXJkcy5kZXN0cm95KClcbiAgICB0aGlzLnVzZXIgPSB1bmRlZmluZWRcbiAgICB0aGlzLnVwU2luY2UgPSB1bmRlZmluZWRcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIEF0dGVtcHQgdG8gQ2xvc2UgY3VycmVudCBHYXRld2F5IGNvbm5lY3Rpb24gYW5kIFJlc3VtZSAqL1xuICBhc3luYyByZWNvbm5lY3QoKTogUHJvbWlzZTxDbGllbnQ+IHtcbiAgICB0aGlzLmdhdGV3YXkuY2xvc2VHYXRld2F5KClcbiAgICB0aGlzLmdhdGV3YXkuaW5pdFdlYnNvY2tldCgpXG4gICAgcmV0dXJuIHRoaXMud2FpdEZvcigncmVhZHknLCAoKSA9PiB0cnVlKS50aGVuKCgpID0+IHRoaXMpXG4gIH1cblxuICAvKiogQWRkIGEgbmV3IENvbGxlY3RvciAqL1xuICBhZGRDb2xsZWN0b3IoY29sbGVjdG9yOiBDb2xsZWN0b3IpOiBib29sZWFuIHtcbiAgICBpZiAodGhpcy5jb2xsZWN0b3JzLmhhcyhjb2xsZWN0b3IpKSByZXR1cm4gZmFsc2VcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuY29sbGVjdG9ycy5hZGQoY29sbGVjdG9yKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICAvKiogUmVtb3ZlIGEgQ29sbGVjdG9yICovXG4gIHJlbW92ZUNvbGxlY3Rvcihjb2xsZWN0b3I6IENvbGxlY3Rvcik6IGJvb2xlYW4ge1xuICAgIGlmICghdGhpcy5jb2xsZWN0b3JzLmhhcyhjb2xsZWN0b3IpKSByZXR1cm4gZmFsc2VcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuY29sbGVjdG9ycy5kZWxldGUoY29sbGVjdG9yKVxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICBhc3luYyBlbWl0KGV2ZW50OiBrZXlvZiBDbGllbnRFdmVudHMsIC4uLmFyZ3M6IGFueVtdKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgY29sbGVjdG9yczogQXJyYXk8Q29sbGVjdG9yPHVua25vd25bXT4+ID0gW11cbiAgICBmb3IgKGNvbnN0IGNvbGxlY3RvciBvZiB0aGlzLmNvbGxlY3RvcnMudmFsdWVzKCkpIHtcbiAgICAgIGlmIChjb2xsZWN0b3IuZXZlbnQgPT09IGV2ZW50KSBjb2xsZWN0b3JzLnB1c2goY29sbGVjdG9yKVxuICAgIH1cbiAgICBpZiAoY29sbGVjdG9ycy5sZW5ndGggIT09IDApIHtcbiAgICAgIGNvbGxlY3RvcnMuZm9yRWFjaCgoY29sbGVjdG9yKSA9PiBjb2xsZWN0b3IuX2ZpcmUoLi4uYXJncykpXG4gICAgfVxuICAgIC8vIFRPRE8oRGpEZXZlbG9wZXJyKTogRml4IHRoaXMgdHMtaWdub3JlXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9wcmVmZXItdHMtZXhwZWN0LWVycm9yXG4gICAgLy8gQHRzLWlnbm9yZVxuICAgIHJldHVybiBzdXBlci5lbWl0KGV2ZW50LCAuLi5hcmdzKVxuICB9XG5cbiAgLyoqIFJldHVybnMgYW4gYXJyYXkgb2Ygdm9pY2UgcmVnaW9uIG9iamVjdHMgdGhhdCBjYW4gYmUgdXNlZCB3aGVuIGNyZWF0aW5nIHNlcnZlcnMuICovXG4gIGFzeW5jIGZldGNoVm9pY2VSZWdpb25zKCk6IFByb21pc2U8Vm9pY2VSZWdpb25bXT4ge1xuICAgIHJldHVybiB0aGlzLnJlc3QuYXBpLnZvaWNlLnJlZ2lvbnMuZ2V0KClcbiAgfVxuXG4gIC8qKiBNb2RpZnkgY3VycmVudCAoQ2xpZW50KSBVc2VyLiAqL1xuICBhc3luYyBlZGl0VXNlcihkYXRhOiB7XG4gICAgdXNlcm5hbWU/OiBzdHJpbmdcbiAgICBhdmF0YXI/OiBzdHJpbmdcbiAgfSk6IFByb21pc2U8Q2xpZW50PiB7XG4gICAgaWYgKGRhdGEudXNlcm5hbWUgPT09IHVuZGVmaW5lZCAmJiBkYXRhLmF2YXRhciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdFaXRoZXIgdXNlcm5hbWUgb3IgYXZhdGFyIG9yIGJvdGggbXVzdCBiZSBzcGVjaWZpZWQgdG8gZWRpdCdcbiAgICAgIClcbiAgICB9XG5cbiAgICBpZiAoZGF0YS5hdmF0YXI/LnN0YXJ0c1dpdGgoJ2h0dHAnKSA9PT0gdHJ1ZSkge1xuICAgICAgZGF0YS5hdmF0YXIgPSBhd2FpdCBmZXRjaEF1dG8oZGF0YS5hdmF0YXIpXG4gICAgfVxuXG4gICAgYXdhaXQgdGhpcy5yZXN0LmFwaS51c2Vyc1snQG1lJ10ucGF0Y2goe1xuICAgICAgdXNlcm5hbWU6IGRhdGEudXNlcm5hbWUsXG4gICAgICBhdmF0YXI6IGRhdGEuYXZhdGFyXG4gICAgfSlcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIENoYW5nZSBVc2VybmFtZSBvZiB0aGUgQ2xpZW50IFVzZXIgKi9cbiAgYXN5bmMgc2V0VXNlcm5hbWUodXNlcm5hbWU6IHN0cmluZyk6IFByb21pc2U8Q2xpZW50PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZWRpdFVzZXIoeyB1c2VybmFtZSB9KVxuICB9XG5cbiAgLyoqIENoYW5nZSBBdmF0YXIgb2YgdGhlIENsaWVudCBVc2VyICovXG4gIGFzeW5jIHNldEF2YXRhcihhdmF0YXI6IHN0cmluZyk6IFByb21pc2U8Q2xpZW50PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZWRpdFVzZXIoeyBhdmF0YXIgfSlcbiAgfVxuXG4gIC8qKiBDcmVhdGUgYSBETSBDaGFubmVsIHdpdGggYSBVc2VyICovXG4gIGFzeW5jIGNyZWF0ZURNKHVzZXI6IFVzZXIgfCBzdHJpbmcpOiBQcm9taXNlPERNQ2hhbm5lbD4ge1xuICAgIGNvbnN0IGlkID0gdHlwZW9mIHVzZXIgPT09ICdvYmplY3QnID8gdXNlci5pZCA6IHVzZXJcbiAgICBjb25zdCBkbVBheWxvYWQgPSBhd2FpdCB0aGlzLnJlc3QuYXBpLnVzZXJzWydAbWUnXS5jaGFubmVscy5wb3N0KHtcbiAgICAgIHJlY2lwaWVudF9pZDogaWRcbiAgICB9KVxuICAgIGF3YWl0IHRoaXMuY2hhbm5lbHMuc2V0KGRtUGF5bG9hZC5pZCwgZG1QYXlsb2FkKVxuICAgIHJldHVybiB0aGlzLmNoYW5uZWxzLmdldDxETUNoYW5uZWw+KGRtUGF5bG9hZC5pZCkgYXMgdW5rbm93biBhcyBETUNoYW5uZWxcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgdGVtcGxhdGUgb2JqZWN0IGZvciB0aGUgZ2l2ZW4gY29kZS4gKi9cbiAgYXN5bmMgZmV0Y2hUZW1wbGF0ZShjb2RlOiBzdHJpbmcpOiBQcm9taXNlPFRlbXBsYXRlPiB7XG4gICAgY29uc3QgcGF5bG9hZCA9IGF3YWl0IHRoaXMucmVzdC5hcGkuZ3VpbGRzLnRlbXBsYXRlc1tjb2RlXS5nZXQoKVxuICAgIHJldHVybiBuZXcgVGVtcGxhdGUodGhpcywgcGF5bG9hZClcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGFuIE9BdXRoMiBVUkwgKi9cbiAgY3JlYXRlT0F1dGhVUkwob3B0aW9uczogT21pdDxPQXV0aFVSTE9wdGlvbnMsICdjbGllbnRJRCc+KTogc3RyaW5nIHtcbiAgICByZXR1cm4gY3JlYXRlT0F1dGhVUkwoXG4gICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICB7XG4gICAgICAgICAgY2xpZW50SUQ6IHRoaXMuZ2V0RXN0aW1hdGVkSUQoKVxuICAgICAgICB9LFxuICAgICAgICBvcHRpb25zXG4gICAgICApXG4gICAgKVxuICB9XG59XG5cbi8qKiBFdmVudCBkZWNvcmF0b3IgdG8gY3JlYXRlIGFuIEV2ZW50IGhhbmRsZXIgZnJvbSBmdW5jdGlvbiAqL1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9leHBsaWNpdC1mdW5jdGlvbi1yZXR1cm4tdHlwZVxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50KG5hbWU/OiBrZXlvZiBDbGllbnRFdmVudHMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChcbiAgICBjbGllbnQ6IENsaWVudCB8IEV4dGVuc2lvbixcbiAgICBwcm9wOiBrZXlvZiBDbGllbnRFdmVudHMgfCBzdHJpbmdcbiAgKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS10eXBlLWFzc2VydGlvblxuICAgIGNvbnN0IGMgPSBjbGllbnQgYXMgYW55XG4gICAgY29uc3QgbGlzdGVuZXIgPSAoXG4gICAgICBjbGllbnQgYXMgdW5rbm93biBhcyB7XG4gICAgICAgIFtuYW1lIGluIGtleW9mIENsaWVudEV2ZW50c106ICguLi5hcmdzOiBDbGllbnRFdmVudHNbbmFtZV0pID0+IGFueVxuICAgICAgfVxuICAgIClbcHJvcCBhcyB1bmtub3duIGFzIGtleW9mIENsaWVudEV2ZW50c11cbiAgICBpZiAodHlwZW9mIGxpc3RlbmVyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0BldmVudCBkZWNvcmF0b3IgcmVxdWlyZXMgYSBmdW5jdGlvbicpXG4gICAgfVxuXG4gICAgaWYgKGMuX2RlY29yYXRlZEV2ZW50cyA9PT0gdW5kZWZpbmVkKSBjLl9kZWNvcmF0ZWRFdmVudHMgPSB7fVxuICAgIGNvbnN0IGtleSA9IG5hbWUgPT09IHVuZGVmaW5lZCA/IHByb3AgOiBuYW1lXG5cbiAgICBjLl9kZWNvcmF0ZWRFdmVudHNba2V5XSA9IGxpc3RlbmVyXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSw0REFBNEQsR0FDNUQsQUFDQSxTQUFTLGNBQWMsUUFBUSxzQkFBcUI7QUFFcEQsU0FBUyxXQUFXLEVBQWUsU0FBUyxRQUFRLGlCQUFnQjtBQUNwRSxTQUFTLG1CQUFtQixRQUF1QixrQkFBaUI7QUFDcEUsU0FBUyxZQUFZLFFBQVEsdUJBQXNCO0FBQ25ELFNBQVMsWUFB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