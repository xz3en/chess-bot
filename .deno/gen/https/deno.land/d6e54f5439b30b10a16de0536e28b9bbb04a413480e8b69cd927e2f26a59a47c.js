import { unzlib } from '../../deps.ts';
import { GatewayOpcodes, GatewayCloseCodes, GatewayEvents } from '../types/gateway.ts';
import { gatewayHandlers } from './handlers/mod.ts';
import { GatewayCache } from '../managers/gatewayCache.ts';
import { delay } from '../utils/delay.ts';
import { HarmonyEventEmitter } from '../utils/events.ts';
import { decodeText } from '../utils/encoding.ts';
import { Constants } from '../types/constants.ts';
export const RECONNECT_CODE = 3999;
export const DESTROY_REASON = 'harmony-destroy';
/**
 * Handles Discord Gateway connection.
 *
 * You should not use this and rather use Client class.
 */ export class Gateway extends HarmonyEventEmitter {
    websocket;
    connected = false;
    initialized = false;
    heartbeatInterval = 0;
    heartbeatIntervalID;
    sequenceID;
    lastPingTimestamp = 0;
    sessionID;
    heartbeatServerResponded = false;
    client;
    cache;
    shards;
    ping = 0;
    _readyReceived;
    _resolveReadyReceived;
    _guildsToBeLoaded;
    _guildsLoaded;
    _guildLoadTimeout;
    get shardID() {
        return this.shards?.[0] ?? 0;
    }
    constructor(client, shards){
        super();
        Object.defineProperty(this, 'client', {
            value: client,
            enumerable: false
        });
        this.cache = new GatewayCache(client);
        this.shards = shards;
        this._readyReceived = new Promise((resolve)=>{
            this._resolveReadyReceived = ()=>{
                this.debug('Resolving READY');
                this._resolveReadyReceived = undefined;
                resolve();
            };
        });
    }
    onopen() {
        this.connected = true;
        this.debug('Connected to Gateway!');
        this.emit('connect');
    }
    async onmessage(event) {
        let data = event.data;
        if (data instanceof ArrayBuffer) {
            data = new Uint8Array(data);
        }
        if (data instanceof Uint8Array) {
            data = unzlib(data, 0, (e)=>decodeText(e));
        }
        const { op , d , s , t  } = JSON.parse(data);
        switch(op){
            case GatewayOpcodes.HELLO:
                this.heartbeatInterval = d.heartbeat_interval;
                this.debug(`Received HELLO. Heartbeat Interval: ${this.heartbeatInterval}`);
                this.sendHeartbeat();
                this.heartbeatIntervalID = setInterval(()=>{
                    this.heartbeat();
                }, this.heartbeatInterval);
                this.emit('hello');
                if (!this.initialized) {
                    this.initialized = true;
                    this.enqueueIdentify(this.client.forceNewSession);
                } else {
                    // eslint-disable-next-line @typescript-eslint/no-floating-promises
                    this.sendResume();
                }
                break;
            case GatewayOpcodes.HEARTBEAT_ACK:
                this.heartbeatServerResponded = true;
                this.ping = Date.now() - this.lastPingTimestamp;
                this.emit('ping', this.ping);
                this.debug(`Received Heartbeat Ack. Ping Recognized: ${this.ping}ms`);
                break;
            case GatewayOpcodes.INVALID_SESSION:
                // Because we know this gonna be bool
                this.debug(`Invalid Session received! Resumeable? ${d === true ? 'Yes' : 'No'}`);
                if (d !== true) {
                    this.debug(`Session was invalidated, deleting from cache`);
                    await this.cache.delete(`session_id_${this.shards?.join('-') ?? '0'}`);
                    await this.cache.delete(`seq_${this.shards?.join('-') ?? '0'}`);
                    this.sessionID = undefined;
                    this.sequenceID = undefined;
                }
                this.enqueueIdentify(!d);
                break;
            case GatewayOpcodes.DISPATCH:
                {
                    this.heartbeatServerResponded = true;
                    if (s !== null) {
                        this.sequenceID = s;
                        await this.cache.set(`seq_${this.shards?.join('-') ?? '0'}`, s);
                    }
                    if (t !== null && t !== undefined) {
                        this.emit(t, d);
                        this.client.emit('raw', t, d, this.shardID);
                        const handler = gatewayHandlers[t];
                        if (handler !== undefined && d !== null) {
                            try {
                                await handler(this, d);
                            } catch (e) {
                                this.client.emit('error', e);
                            }
                        }
                    }
                    break;
                }
            case GatewayOpcodes.RESUME:
                {
                    // this.token = d.token
                    this.sessionID = d.session_id;
                    this.sequenceID = d.seq;
                    await this.cache.set(`seq_${this.shards?.join('-') ?? '0'}`, d.seq);
                    await this.cache.set(`session_id_${this.shards?.join('-') ?? '0'}`, this.sessionID);
                    this.emit('resume');
                    break;
                }
            case GatewayOpcodes.RECONNECT:
                {
                    this.emit('reconnectRequired');
                    this.debug(`Received OpCode RECONNECT`);
                    await this.reconnect(true);
                    break;
                }
            default:
                break;
        }
    }
    _checkGuildsLoaded(timeout = true) {
        if (this._guildsLoaded !== undefined && this._guildsToBeLoaded !== undefined) {
            if (this._guildLoadTimeout !== undefined) {
                clearTimeout(this._guildLoadTimeout);
                this._guildLoadTimeout = undefined;
            }
            if (this._guildsLoaded >= this._guildsToBeLoaded) {
                this.debug('Guilds arrived!');
                this.emit('guildsLoaded');
                this._guildsLoaded = undefined;
                this._guildsToBeLoaded = undefined;
            } else if (timeout) {
                this._guildLoadTimeout = setTimeout(()=>{
                    this._guildLoadTimeout = undefined;
                    this.debug(`Guild Load Timout, ${this._guildsToBeLoaded - this._guildsLoaded} guilds unavailable`);
                    this.emit('guildsLoaded');
                    this._guildsLoaded = undefined;
                    this._guildsToBeLoaded = undefined;
                }, 15000);
            }
        }
    }
    async onclose({ reason , code  }) {
        // Likely an async close event from previous websocket object
        // after we reconnect.
        if (!this.connected) return;
        this.connected = false;
        if (this.destroyed) return;
        if (this.#destroyCalled) {
            this.#destroyComplete = true;
            this.debug(`Shard destroyed`);
            return;
        }
        this.emit('close', code, reason);
        this.debug(`Connection Closed with code: ${code} ${reason}`);
        switch(code){
            case RECONNECT_CODE:
                return;
            case GatewayCloseCodes.UNKNOWN_ERROR:
                this.debug('API has encountered Unknown Error. Reconnecting...');
                await this.reconnect();
                break;
            case GatewayCloseCodes.UNKNOWN_OPCODE:
                throw new Error("Invalid OP Code or Payload was sent. This shouldn't happen!");
            case GatewayCloseCodes.DECODE_ERROR:
                throw new Error("Invalid Payload was sent. This shouldn't happen!");
            case GatewayCloseCodes.NOT_AUTHENTICATED:
                throw new Error('Not Authorized: Payload was sent before Identifying.');
            case GatewayCloseCodes.AUTHENTICATION_FAILED:
                throw new Error('Invalid Token provided!');
            case GatewayCloseCodes.INVALID_SEQ:
                this.debug('Invalid Seq was sent. Reconnecting.');
                await this.reconnect();
                break;
            case GatewayCloseCodes.RATE_LIMITED:
                throw new Error("You're ratelimited. Calm down.");
            case GatewayCloseCodes.SESSION_TIMED_OUT:
                this.debug('Session Timeout. Reconnecting.');
                await this.reconnect(true);
                break;
            case GatewayCloseCodes.INVALID_SHARD:
                this.debug('Invalid Shard was sent. Reconnecting.');
                await this.reconnect();
                break;
            case GatewayCloseCodes.SHARDING_REQUIRED:
                throw new Error("Couldn't connect. Sharding is required!");
            case GatewayCloseCodes.INVALID_API_VERSION:
                throw new Error("Invalid API Version was used. This shouldn't happen!");
            case GatewayCloseCodes.INVALID_INTENTS:
                throw new Error('Invalid Intents');
            case GatewayCloseCodes.DISALLOWED_INTENTS:
                throw new Error("Given Intents aren't allowed");
            default:
                this.debug('Unknown Close code, probably connection error. Reconnecting in 5s.');
                await delay(5000);
                await this.reconnect(true);
                break;
        }
    }
    async onerror(event) {
        const error = new Error(Deno.inspect({
            message: event.message,
            error: event.error,
            type: event.type,
            target: event.target
        }));
        error.name = 'ErrorEvent';
        // Do not log errors by default
        // console.error(error)
        this.emit('error', error, event);
        this.client.emit('gatewayError', event, this.shards);
    }
    enqueueIdentify(forceNew) {
        this.client.shards.enqueueIdentify(async ()=>await this.sendIdentify(forceNew).then(()=>this.waitFor(GatewayEvents.Ready)));
    }
    async sendIdentify(forceNewSession) {
        if (typeof this.client.token !== 'string') throw new Error('Token not specified');
        if (typeof this.client.intents !== 'object') throw new Error('Intents not specified');
        if (forceNewSession === undefined || !forceNewSession) {
            const sessionIDCached = await this.cache.get(`session_id_${this.shards?.join('-') ?? '0'}`);
            if (typeof sessionIDCached === 'string') {
                this.debug(`Found Cached SessionID: ${sessionIDCached}`);
                this.sessionID = sessionIDCached;
                return await this.sendResume();
            }
        }
        const payload = {
            token: this.client.token,
            properties: {
                $os: this.client.clientProperties.os ?? Deno.build.os,
                $browser: this.client.clientProperties.browser ?? 'harmony',
                $device: this.client.clientProperties.device ?? 'harmony'
            },
            compress: this.client.compress,
            shard: this.shards === undefined ? [
                0,
                1
            ] : [
                this.shards[0] ?? 0,
                this.shards[1] ?? 1
            ],
            intents: this.client.intents.reduce((previous, current)=>previous | current, 0),
            presence: this.client.presence.create()
        };
        this.debug('Sending Identify payload...');
        this.emit('sentIdentify');
        this.send({
            op: GatewayOpcodes.IDENTIFY,
            d: payload
        });
    }
    async sendResume() {
        if (typeof this.client.token !== 'string') throw new Error('Token not specified');
        if (this.sessionID === undefined) {
            this.sessionID = await this.cache.get(`session_id_${this.shards?.join('-') ?? '0'}`);
            if (this.sessionID === undefined) return this.enqueueIdentify();
        }
        this.debug(`Preparing to resume with Session: ${this.sessionID}`);
        if (this.sequenceID === undefined) {
            const cached = await this.cache.get(`seq_${this.shards?.join('-') ?? '0'}`);
            if (cached !== undefined) this.sequenceID = typeof cached === 'string' ? parseInt(cached) : cached;
        }
        const resumePayload = {
            op: GatewayOpcodes.RESUME,
            d: {
                token: this.client.token,
                session_id: this.sessionID,
                seq: this.sequenceID ?? null
            }
        };
        this.emit('sentResume');
        this.debug('Sending Resume payload...');
        this.send(resumePayload);
    }
    requestMembers(guild, options = {}) {
        if (options.query !== undefined && options.limit === undefined) throw new Error('Missing limit property when specifying query for Requesting Members!');
        const nonce = crypto.randomUUID();
        this.send({
            op: GatewayOpcodes.REQUEST_GUILD_MEMBERS,
            d: {
                guild_id: guild,
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                query: options.users?.length ? undefined : options.query ?? '',
                limit: options.limit ?? 0,
                presences: options.presences,
                user_ids: options.users,
                nonce
            }
        });
        return nonce;
    }
    updateVoiceState(guild, channel, voiceOptions = {}) {
        this.send({
            op: GatewayOpcodes.VOICE_STATE_UPDATE,
            d: {
                guild_id: typeof guild === 'string' ? guild : guild.id,
                channel_id: channel === undefined ? null : typeof channel === 'string' ? channel : channel?.id,
                self_mute: channel === undefined ? false : voiceOptions.mute === undefined ? false : voiceOptions.mute,
                self_deaf: channel === undefined ? false : voiceOptions.deaf === undefined ? false : voiceOptions.deaf
            }
        });
    }
    debug(msg) {
        this.client.debug(`Shard ${this.shardID}`, msg);
    }
    async reconnect(forceNew) {
        if (this.#destroyCalled) return;
        this.emit('reconnecting');
        this.debug('Reconnecting... (force new: ' + String(forceNew) + ')');
        clearInterval(this.heartbeatIntervalID);
        if (forceNew === true) {
            await this.cache.delete(`session_id_${this.shards?.join('-') ?? '0'}`);
            await this.cache.delete(`seq_${this.shards?.join('-') ?? '0'}`);
        }
        this.closeGateway(3999);
        this.initWebsocket();
    }
    initWebsocket() {
        if (this.#destroyCalled) return;
        this.emit('init');
        this.debug('Initializing WebSocket...');
        this.websocket = new WebSocket(// eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        `${Constants.DISCORD_GATEWAY_URL}/?v=${Constants.DISCORD_API_VERSION}&encoding=json`, []);
        this.websocket.binaryType = 'arraybuffer';
        this.websocket.onopen = this.onopen.bind(this);
        this.websocket.onmessage = this.onmessage.bind(this);
        this.websocket.onclose = this.onclose.bind(this);
        this.websocket.onerror = this.onerror.bind(this);
    }
    closeGateway(code = 1000, reason) {
        this.debug(`Closing with code ${code}${reason !== undefined && reason !== '' ? ` and reason ${reason}` : ''}`);
        return this.websocket?.close(code, reason);
    }
    // Alias for backward compat, since event@2.0.0 removed close again...
    close(code, reason) {
        this.closeGateway(code, reason);
    }
    #destroyCalled = false;
    #destroyComplete = false;
    get destroyed() {
        return this.#destroyCalled && this.#destroyComplete;
    }
    destroy() {
        this.debug('Destroying Shard');
        this.#destroyCalled = true;
        if (this.heartbeatIntervalID !== undefined) {
            clearInterval(this.heartbeatIntervalID);
            this.heartbeatIntervalID = undefined;
        }
        this.closeGateway(1000, DESTROY_REASON);
    }
    send(data) {
        if (this.websocket?.readyState !== this.websocket?.OPEN) return false;
        const packet = JSON.stringify({
            op: data.op,
            d: data.d,
            s: typeof data.s === 'number' ? data.s : null,
            t: data.t === undefined ? null : data.t
        });
        this.websocket?.send(packet);
        return true;
    }
    sendPresence(data) {
        this.send({
            op: GatewayOpcodes.PRESENCE_UPDATE,
            d: data
        });
    }
    sendHeartbeat() {
        const payload = {
            op: GatewayOpcodes.HEARTBEAT,
            d: this.sequenceID ?? null
        };
        this.send(payload);
        this.lastPingTimestamp = Date.now();
    }
    heartbeat() {
        if (this.destroyed) return;
        if (this.heartbeatServerResponded) {
            this.heartbeatServerResponded = false;
        } else {
            this.debug('Found dead connection, reconnecting...');
            clearInterval(this.heartbeatIntervalID);
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.reconnect(false);
            return;
        }
        this.sendHeartbeat();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2dhdGV3YXkvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IHVuemxpYiB9IGZyb20gJy4uLy4uL2RlcHMudHMnXG5pbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgeyBHYXRld2F5UmVzcG9uc2UgfSBmcm9tICcuLi90eXBlcy9nYXRld2F5UmVzcG9uc2UudHMnXG5pbXBvcnQge1xuICBHYXRld2F5T3Bjb2RlcyxcbiAgR2F0ZXdheUNsb3NlQ29kZXMsXG4gIElkZW50aXR5UGF5bG9hZCxcbiAgU3RhdHVzVXBkYXRlUGF5bG9hZCxcbiAgR2F0ZXdheUV2ZW50c1xufSBmcm9tICcuLi90eXBlcy9nYXRld2F5LnRzJ1xuaW1wb3J0IHsgZ2F0ZXdheUhhbmRsZXJzIH0gZnJvbSAnLi9oYW5kbGVycy9tb2QudHMnXG5pbXBvcnQgeyBHYXRld2F5Q2FjaGUgfSBmcm9tICcuLi9tYW5hZ2Vycy9nYXRld2F5Q2FjaGUudHMnXG5pbXBvcnQgeyBkZWxheSB9IGZyb20gJy4uL3V0aWxzL2RlbGF5LnRzJ1xuaW1wb3J0IHR5cGUgeyBWb2ljZUNoYW5uZWwgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2d1aWxkVm9pY2VDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBHdWlsZCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvZ3VpbGQudHMnXG5pbXBvcnQgeyBIYXJtb255RXZlbnRFbWl0dGVyIH0gZnJvbSAnLi4vdXRpbHMvZXZlbnRzLnRzJ1xuaW1wb3J0IHsgZGVjb2RlVGV4dCB9IGZyb20gJy4uL3V0aWxzL2VuY29kaW5nLnRzJ1xuaW1wb3J0IHsgQ29uc3RhbnRzIH0gZnJvbSAnLi4vdHlwZXMvY29uc3RhbnRzLnRzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFJlcXVlc3RNZW1iZXJzT3B0aW9ucyB7XG4gIGxpbWl0PzogbnVtYmVyXG4gIHByZXNlbmNlcz86IGJvb2xlYW5cbiAgcXVlcnk/OiBzdHJpbmdcbiAgdXNlcnM/OiBzdHJpbmdbXVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZvaWNlU3RhdGVPcHRpb25zIHtcbiAgbXV0ZT86IGJvb2xlYW5cbiAgZGVhZj86IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNvbnN0IFJFQ09OTkVDVF9DT0RFID0gMzk5OVxuZXhwb3J0IGNvbnN0IERFU1RST1lfUkVBU09OID0gJ2hhcm1vbnktZGVzdHJveSdcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9jb25zaXN0ZW50LXR5cGUtZGVmaW5pdGlvbnNcbmV4cG9ydCB0eXBlIEdhdGV3YXlUeXBlZEV2ZW50cyA9IHtcbiAgW25hbWUgaW4gR2F0ZXdheUV2ZW50c106IFt1bmtub3duXVxufSAmIHtcbiAgY29ubmVjdDogW11cbiAgcGluZzogW251bWJlcl1cbiAgcmVzdW1lOiBbXVxuICByZWNvbm5lY3RSZXF1aXJlZDogW11cbiAgY2xvc2U6IFtudW1iZXIsIHN0cmluZ11cbiAgZXJyb3I6IFtFcnJvciwgRXJyb3JFdmVudF1cbiAgc2VudElkZW50aWZ5OiBbXVxuICBzZW50UmVzdW1lOiBbXVxuICByZWNvbm5lY3Rpbmc6IFtdXG4gIGd1aWxkc0xvYWRlZDogW11cbiAgaW5pdDogW11cbiAgaGVsbG86IFtdXG59XG5cbi8qKlxuICogSGFuZGxlcyBEaXNjb3JkIEdhdGV3YXkgY29ubmVjdGlvbi5cbiAqXG4gKiBZb3Ugc2hvdWxkIG5vdCB1c2UgdGhpcyBhbmQgcmF0aGVyIHVzZSBDbGllbnQgY2xhc3MuXG4gKi9cbmV4cG9ydCBjbGFzcyBHYXRld2F5IGV4dGVuZHMgSGFybW9ueUV2ZW50RW1pdHRlcjxHYXRld2F5VHlwZWRFdmVudHM+IHtcbiAgd2Vic29ja2V0PzogV2ViU29ja2V0XG4gIGNvbm5lY3RlZCA9IGZhbHNlXG4gIGluaXRpYWxpemVkID0gZmFsc2VcbiAgaGVhcnRiZWF0SW50ZXJ2YWwgPSAwXG4gIGhlYXJ0YmVhdEludGVydmFsSUQ/OiBudW1iZXJcbiAgc2VxdWVuY2VJRD86IG51bWJlclxuICBsYXN0UGluZ1RpbWVzdGFtcCA9IDBcbiAgc2Vzc2lvbklEPzogc3RyaW5nXG4gIHByaXZhdGUgaGVhcnRiZWF0U2VydmVyUmVzcG9uZGVkID0gZmFsc2VcbiAgY2xpZW50ITogQ2xpZW50XG4gIGNhY2hlOiBHYXRld2F5Q2FjaGVcbiAgc2hhcmRzPzogbnVtYmVyW11cbiAgcGluZzogbnVtYmVyID0gMFxuXG4gIF9yZWFkeVJlY2VpdmVkOiBQcm9taXNlPHZvaWQ+XG4gIF9yZXNvbHZlUmVhZHlSZWNlaXZlZD86ICgpID0+IHZvaWRcbiAgX2d1aWxkc1RvQmVMb2FkZWQ/OiBudW1iZXJcbiAgX2d1aWxkc0xvYWRlZD86IG51bWJlclxuICBfZ3VpbGRMb2FkVGltZW91dD86IG51bWJlclxuXG4gIGdldCBzaGFyZElEKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMuc2hhcmRzPy5bMF0gPz8gMFxuICB9XG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQsIHNoYXJkcz86IG51bWJlcltdKSB7XG4gICAgc3VwZXIoKVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnY2xpZW50JywgeyB2YWx1ZTogY2xpZW50LCBlbnVtZXJhYmxlOiBmYWxzZSB9KVxuICAgIHRoaXMuY2FjaGUgPSBuZXcgR2F0ZXdheUNhY2hlKGNsaWVudClcbiAgICB0aGlzLnNoYXJkcyA9IHNoYXJkc1xuICAgIHRoaXMuX3JlYWR5UmVjZWl2ZWQgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5fcmVzb2x2ZVJlYWR5UmVjZWl2ZWQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuZGVidWcoJ1Jlc29sdmluZyBSRUFEWScpXG4gICAgICAgIHRoaXMuX3Jlc29sdmVSZWFkeVJlY2VpdmVkID0gdW5kZWZpbmVkXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBwcml2YXRlIG9ub3BlbigpOiB2b2lkIHtcbiAgICB0aGlzLmNvbm5lY3RlZCA9IHRydWVcbiAgICB0aGlzLmRlYnVnKCdDb25uZWN0ZWQgdG8gR2F0ZXdheSEnKVxuICAgIHRoaXMuZW1pdCgnY29ubmVjdCcpXG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG9ubWVzc2FnZShldmVudDogTWVzc2FnZUV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgbGV0IGRhdGEgPSBldmVudC5kYXRhXG4gICAgaWYgKGRhdGEgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgICAgZGF0YSA9IG5ldyBVaW50OEFycmF5KGRhdGEpXG4gICAgfVxuICAgIGlmIChkYXRhIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgZGF0YSA9IHVuemxpYihkYXRhLCAwLCAoZTogVWludDhBcnJheSkgPT4gZGVjb2RlVGV4dChlKSlcbiAgICB9XG5cbiAgICBjb25zdCB7IG9wLCBkLCBzLCB0IH06IEdhdGV3YXlSZXNwb25zZSA9IEpTT04ucGFyc2UoZGF0YSlcblxuICAgIHN3aXRjaCAob3ApIHtcbiAgICAgIGNhc2UgR2F0ZXdheU9wY29kZXMuSEVMTE86XG4gICAgICAgIHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWwgPSBkLmhlYXJ0YmVhdF9pbnRlcnZhbFxuICAgICAgICB0aGlzLmRlYnVnKFxuICAgICAgICAgIGBSZWNlaXZlZCBIRUxMTy4gSGVhcnRiZWF0IEludGVydmFsOiAke3RoaXMuaGVhcnRiZWF0SW50ZXJ2YWx9YFxuICAgICAgICApXG5cbiAgICAgICAgdGhpcy5zZW5kSGVhcnRiZWF0KClcbiAgICAgICAgdGhpcy5oZWFydGJlYXRJbnRlcnZhbElEID0gc2V0SW50ZXJ2YWwoKCkgPT4ge1xuICAgICAgICAgIHRoaXMuaGVhcnRiZWF0KClcbiAgICAgICAgfSwgdGhpcy5oZWFydGJlYXRJbnRlcnZhbClcblxuICAgICAgICB0aGlzLmVtaXQoJ2hlbGxvJylcbiAgICAgICAgaWYgKCF0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgdGhpcy5pbml0aWFsaXplZCA9IHRydWVcbiAgICAgICAgICB0aGlzLmVucXVldWVJZGVudGlmeSh0aGlzLmNsaWVudC5mb3JjZU5ld1Nlc3Npb24pXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1mbG9hdGluZy1wcm9taXNlc1xuICAgICAgICAgIHRoaXMuc2VuZFJlc3VtZSgpXG4gICAgICAgIH1cbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBHYXRld2F5T3Bjb2Rlcy5IRUFSVEJFQVRfQUNLOlxuICAgICAgICB0aGlzLmhlYXJ0YmVhdFNlcnZlclJlc3BvbmRlZCA9IHRydWVcbiAgICAgICAgdGhpcy5waW5nID0gRGF0ZS5ub3coKSAtIHRoaXMubGFzdFBpbmdUaW1lc3RhbXBcbiAgICAgICAgdGhpcy5lbWl0KCdwaW5nJywgdGhpcy5waW5nKVxuICAgICAgICB0aGlzLmRlYnVnKGBSZWNlaXZlZCBIZWFydGJlYXQgQWNrLiBQaW5nIFJlY29nbml6ZWQ6ICR7dGhpcy5waW5nfW1zYClcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBHYXRld2F5T3Bjb2Rlcy5JTlZBTElEX1NFU1NJT046XG4gICAgICAgIC8vIEJlY2F1c2Ugd2Uga25vdyB0aGlzIGdvbm5hIGJlIGJvb2xcbiAgICAgICAgdGhpcy5kZWJ1ZyhcbiAgICAgICAgICBgSW52YWxpZCBTZXNzaW9uIHJlY2VpdmVkISBSZXN1bWVhYmxlPyAke2QgPT09IHRydWUgPyAnWWVzJyA6ICdObyd9YFxuICAgICAgICApXG4gICAgICAgIGlmIChkICE9PSB0cnVlKSB7XG4gICAgICAgICAgdGhpcy5kZWJ1ZyhgU2Vzc2lvbiB3YXMgaW52YWxpZGF0ZWQsIGRlbGV0aW5nIGZyb20gY2FjaGVgKVxuICAgICAgICAgIGF3YWl0IHRoaXMuY2FjaGUuZGVsZXRlKGBzZXNzaW9uX2lkXyR7dGhpcy5zaGFyZHM/LmpvaW4oJy0nKSA/PyAnMCd9YClcbiAgICAgICAgICBhd2FpdCB0aGlzLmNhY2hlLmRlbGV0ZShgc2VxXyR7dGhpcy5zaGFyZHM/LmpvaW4oJy0nKSA/PyAnMCd9YClcbiAgICAgICAgICB0aGlzLnNlc3Npb25JRCA9IHVuZGVmaW5lZFxuICAgICAgICAgIHRoaXMuc2VxdWVuY2VJRCA9IHVuZGVmaW5lZFxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW5xdWV1ZUlkZW50aWZ5KCEoZCBhcyBib29sZWFuKSlcbiAgICAgICAgYnJlYWtcblxuICAgICAgY2FzZSBHYXRld2F5T3Bjb2Rlcy5ESVNQQVRDSDoge1xuICAgICAgICB0aGlzLmhlYXJ0YmVhdFNlcnZlclJlc3BvbmRlZCA9IHRydWVcbiAgICAgICAgaWYgKHMgIT09IG51bGwpIHtcbiAgICAgICAgICB0aGlzLnNlcXVlbmNlSUQgPSBzXG4gICAgICAgICAgYXdhaXQgdGhpcy5jYWNoZS5zZXQoYHNlcV8ke3RoaXMuc2hhcmRzPy5qb2luKCctJykgPz8gJzAnfWAsIHMpXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHQgIT09IG51bGwgJiYgdCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgdGhpcy5lbWl0KHQgYXMga2V5b2YgR2F0ZXdheVR5cGVkRXZlbnRzLCBkKVxuICAgICAgICAgIHRoaXMuY2xpZW50LmVtaXQoJ3JhdycsIHQsIGQsIHRoaXMuc2hhcmRJRClcblxuICAgICAgICAgIGNvbnN0IGhhbmRsZXIgPSBnYXRld2F5SGFuZGxlcnNbdF1cblxuICAgICAgICAgIGlmIChoYW5kbGVyICE9PSB1bmRlZmluZWQgJiYgZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgYXdhaXQgaGFuZGxlcih0aGlzLCBkKVxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICB0aGlzLmNsaWVudC5lbWl0KCdlcnJvcicsIGUgYXMgRXJyb3IpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrXG4gICAgICB9XG4gICAgICBjYXNlIEdhdGV3YXlPcGNvZGVzLlJFU1VNRToge1xuICAgICAgICAvLyB0aGlzLnRva2VuID0gZC50b2tlblxuICAgICAgICB0aGlzLnNlc3Npb25JRCA9IGQuc2Vzc2lvbl9pZFxuICAgICAgICB0aGlzLnNlcXVlbmNlSUQgPSBkLnNlcVxuICAgICAgICBhd2FpdCB0aGlzLmNhY2hlLnNldChgc2VxXyR7dGhpcy5zaGFyZHM/LmpvaW4oJy0nKSA/PyAnMCd9YCwgZC5zZXEpXG4gICAgICAgIGF3YWl0IHRoaXMuY2FjaGUuc2V0KFxuICAgICAgICAgIGBzZXNzaW9uX2lkXyR7dGhpcy5zaGFyZHM/LmpvaW4oJy0nKSA/PyAnMCd9YCxcbiAgICAgICAgICB0aGlzLnNlc3Npb25JRFxuICAgICAgICApXG4gICAgICAgIHRoaXMuZW1pdCgncmVzdW1lJylcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGNhc2UgR2F0ZXdheU9wY29kZXMuUkVDT05ORUNUOiB7XG4gICAgICAgIHRoaXMuZW1pdCgncmVjb25uZWN0UmVxdWlyZWQnKVxuICAgICAgICB0aGlzLmRlYnVnKGBSZWNlaXZlZCBPcENvZGUgUkVDT05ORUNUYClcbiAgICAgICAgYXdhaXQgdGhpcy5yZWNvbm5lY3QodHJ1ZSlcbiAgICAgICAgYnJlYWtcbiAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgX2NoZWNrR3VpbGRzTG9hZGVkKHRpbWVvdXQgPSB0cnVlKTogdm9pZCB7XG4gICAgaWYgKFxuICAgICAgdGhpcy5fZ3VpbGRzTG9hZGVkICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIHRoaXMuX2d1aWxkc1RvQmVMb2FkZWQgIT09IHVuZGVmaW5lZFxuICAgICkge1xuICAgICAgaWYgKHRoaXMuX2d1aWxkTG9hZFRpbWVvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fZ3VpbGRMb2FkVGltZW91dClcbiAgICAgICAgdGhpcy5fZ3VpbGRMb2FkVGltZW91dCA9IHVuZGVmaW5lZFxuICAgICAgfVxuICAgICAgaWYgKHRoaXMuX2d1aWxkc0xvYWRlZCA+PSB0aGlzLl9ndWlsZHNUb0JlTG9hZGVkKSB7XG4gICAgICAgIHRoaXMuZGVidWcoJ0d1aWxkcyBhcnJpdmVkIScpXG4gICAgICAgIHRoaXMuZW1pdCgnZ3VpbGRzTG9hZGVkJylcbiAgICAgICAgdGhpcy5fZ3VpbGRzTG9hZGVkID0gdW5kZWZpbmVkXG4gICAgICAgIHRoaXMuX2d1aWxkc1RvQmVMb2FkZWQgPSB1bmRlZmluZWRcbiAgICAgIH0gZWxzZSBpZiAodGltZW91dCkge1xuICAgICAgICB0aGlzLl9ndWlsZExvYWRUaW1lb3V0ID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5fZ3VpbGRMb2FkVGltZW91dCA9IHVuZGVmaW5lZFxuICAgICAgICAgIHRoaXMuZGVidWcoXG4gICAgICAgICAgICBgR3VpbGQgTG9hZCBUaW1vdXQsICR7XG4gICAgICAgICAgICAgIHRoaXMuX2d1aWxkc1RvQmVMb2FkZWQhIC0gdGhpcy5fZ3VpbGRzTG9hZGVkIVxuICAgICAgICAgICAgfSBndWlsZHMgdW5hdmFpbGFibGVgXG4gICAgICAgICAgKVxuICAgICAgICAgIHRoaXMuZW1pdCgnZ3VpbGRzTG9hZGVkJylcbiAgICAgICAgICB0aGlzLl9ndWlsZHNMb2FkZWQgPSB1bmRlZmluZWRcbiAgICAgICAgICB0aGlzLl9ndWlsZHNUb0JlTG9hZGVkID0gdW5kZWZpbmVkXG4gICAgICAgIH0sIDE1MDAwKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgYXN5bmMgb25jbG9zZSh7IHJlYXNvbiwgY29kZSB9OiBDbG9zZUV2ZW50KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gTGlrZWx5IGFuIGFzeW5jIGNsb3NlIGV2ZW50IGZyb20gcHJldmlvdXMgd2Vic29ja2V0IG9iamVjdFxuICAgIC8vIGFmdGVyIHdlIHJlY29ubmVjdC5cbiAgICBpZiAoIXRoaXMuY29ubmVjdGVkKSByZXR1cm5cblxuICAgIHRoaXMuY29ubmVjdGVkID0gZmFsc2VcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuICAgIGlmICh0aGlzLiNkZXN0cm95Q2FsbGVkKSB7XG4gICAgICB0aGlzLiNkZXN0cm95Q29tcGxldGUgPSB0cnVlXG4gICAgICB0aGlzLmRlYnVnKGBTaGFyZCBkZXN0cm95ZWRgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgdGhpcy5lbWl0KCdjbG9zZScsIGNvZGUsIHJlYXNvbilcbiAgICB0aGlzLmRlYnVnKGBDb25uZWN0aW9uIENsb3NlZCB3aXRoIGNvZGU6ICR7Y29kZX0gJHtyZWFzb259YClcblxuICAgIHN3aXRjaCAoY29kZSkge1xuICAgICAgY2FzZSBSRUNPTk5FQ1RfQ09ERTpcbiAgICAgICAgcmV0dXJuXG4gICAgICBjYXNlIEdhdGV3YXlDbG9zZUNvZGVzLlVOS05PV05fRVJST1I6XG4gICAgICAgIHRoaXMuZGVidWcoJ0FQSSBoYXMgZW5jb3VudGVyZWQgVW5rbm93biBFcnJvci4gUmVjb25uZWN0aW5nLi4uJylcbiAgICAgICAgYXdhaXQgdGhpcy5yZWNvbm5lY3QoKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBHYXRld2F5Q2xvc2VDb2Rlcy5VTktOT1dOX09QQ09ERTpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIFwiSW52YWxpZCBPUCBDb2RlIG9yIFBheWxvYWQgd2FzIHNlbnQuIFRoaXMgc2hvdWxkbid0IGhhcHBlbiFcIlxuICAgICAgICApXG4gICAgICBjYXNlIEdhdGV3YXlDbG9zZUNvZGVzLkRFQ09ERV9FUlJPUjpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW52YWxpZCBQYXlsb2FkIHdhcyBzZW50LiBUaGlzIHNob3VsZG4ndCBoYXBwZW4hXCIpXG4gICAgICBjYXNlIEdhdGV3YXlDbG9zZUNvZGVzLk5PVF9BVVRIRU5USUNBVEVEOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ05vdCBBdXRob3JpemVkOiBQYXlsb2FkIHdhcyBzZW50IGJlZm9yZSBJZGVudGlmeWluZy4nKVxuICAgICAgY2FzZSBHYXRld2F5Q2xvc2VDb2Rlcy5BVVRIRU5USUNBVElPTl9GQUlMRUQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBUb2tlbiBwcm92aWRlZCEnKVxuICAgICAgY2FzZSBHYXRld2F5Q2xvc2VDb2Rlcy5JTlZBTElEX1NFUTpcbiAgICAgICAgdGhpcy5kZWJ1ZygnSW52YWxpZCBTZXEgd2FzIHNlbnQuIFJlY29ubmVjdGluZy4nKVxuICAgICAgICBhd2FpdCB0aGlzLnJlY29ubmVjdCgpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlIEdhdGV3YXlDbG9zZUNvZGVzLlJBVEVfTElNSVRFRDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiWW91J3JlIHJhdGVsaW1pdGVkLiBDYWxtIGRvd24uXCIpXG4gICAgICBjYXNlIEdhdGV3YXlDbG9zZUNvZGVzLlNFU1NJT05fVElNRURfT1VUOlxuICAgICAgICB0aGlzLmRlYnVnKCdTZXNzaW9uIFRpbWVvdXQuIFJlY29ubmVjdGluZy4nKVxuICAgICAgICBhd2FpdCB0aGlzLnJlY29ubmVjdCh0cnVlKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBHYXRld2F5Q2xvc2VDb2Rlcy5JTlZBTElEX1NIQVJEOlxuICAgICAgICB0aGlzLmRlYnVnKCdJbnZhbGlkIFNoYXJkIHdhcyBzZW50LiBSZWNvbm5lY3RpbmcuJylcbiAgICAgICAgYXdhaXQgdGhpcy5yZWNvbm5lY3QoKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSBHYXRld2F5Q2xvc2VDb2Rlcy5TSEFSRElOR19SRVFVSVJFRDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ291bGRuJ3QgY29ubmVjdC4gU2hhcmRpbmcgaXMgcmVxdWlyZWQhXCIpXG4gICAgICBjYXNlIEdhdGV3YXlDbG9zZUNvZGVzLklOVkFMSURfQVBJX1ZFUlNJT046XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgQVBJIFZlcnNpb24gd2FzIHVzZWQuIFRoaXMgc2hvdWxkbid0IGhhcHBlbiFcIilcbiAgICAgIGNhc2UgR2F0ZXdheUNsb3NlQ29kZXMuSU5WQUxJRF9JTlRFTlRTOlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgSW50ZW50cycpXG4gICAgICBjYXNlIEdhdGV3YXlDbG9zZUNvZGVzLkRJU0FMTE9XRURfSU5URU5UUzpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2l2ZW4gSW50ZW50cyBhcmVuJ3QgYWxsb3dlZFwiKVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhpcy5kZWJ1ZyhcbiAgICAgICAgICAnVW5rbm93biBDbG9zZSBjb2RlLCBwcm9iYWJseSBjb25uZWN0aW9uIGVycm9yLiBSZWNvbm5lY3RpbmcgaW4gNXMuJ1xuICAgICAgICApXG5cbiAgICAgICAgYXdhaXQgZGVsYXkoNTAwMClcbiAgICAgICAgYXdhaXQgdGhpcy5yZWNvbm5lY3QodHJ1ZSlcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGFzeW5jIG9uZXJyb3IoZXZlbnQ6IEVycm9yRXZlbnQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgIERlbm8uaW5zcGVjdCh7XG4gICAgICAgIG1lc3NhZ2U6IGV2ZW50Lm1lc3NhZ2UsXG4gICAgICAgIGVycm9yOiBldmVudC5lcnJvcixcbiAgICAgICAgdHlwZTogZXZlbnQudHlwZSxcbiAgICAgICAgdGFyZ2V0OiBldmVudC50YXJnZXRcbiAgICAgIH0pXG4gICAgKVxuICAgIGVycm9yLm5hbWUgPSAnRXJyb3JFdmVudCdcbiAgICAvLyBEbyBub3QgbG9nIGVycm9ycyBieSBkZWZhdWx0XG4gICAgLy8gY29uc29sZS5lcnJvcihlcnJvcilcbiAgICB0aGlzLmVtaXQoJ2Vycm9yJywgZXJyb3IsIGV2ZW50KVxuICAgIHRoaXMuY2xpZW50LmVtaXQoJ2dhdGV3YXlFcnJvcicsIGV2ZW50LCB0aGlzLnNoYXJkcylcbiAgfVxuXG4gIHByaXZhdGUgZW5xdWV1ZUlkZW50aWZ5KGZvcmNlTmV3PzogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuY2xpZW50LnNoYXJkcy5lbnF1ZXVlSWRlbnRpZnkoXG4gICAgICBhc3luYyAoKSA9PlxuICAgICAgICBhd2FpdCB0aGlzLnNlbmRJZGVudGlmeShmb3JjZU5ldykudGhlbigoKSA9PlxuICAgICAgICAgIHRoaXMud2FpdEZvcihHYXRld2F5RXZlbnRzLlJlYWR5KVxuICAgICAgICApXG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzZW5kSWRlbnRpZnkoZm9yY2VOZXdTZXNzaW9uPzogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0eXBlb2YgdGhpcy5jbGllbnQudG9rZW4gIT09ICdzdHJpbmcnKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUb2tlbiBub3Qgc3BlY2lmaWVkJylcbiAgICBpZiAodHlwZW9mIHRoaXMuY2xpZW50LmludGVudHMgIT09ICdvYmplY3QnKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnRlbnRzIG5vdCBzcGVjaWZpZWQnKVxuXG4gICAgaWYgKGZvcmNlTmV3U2Vzc2lvbiA9PT0gdW5kZWZpbmVkIHx8ICFmb3JjZU5ld1Nlc3Npb24pIHtcbiAgICAgIGNvbnN0IHNlc3Npb25JRENhY2hlZCA9IGF3YWl0IHRoaXMuY2FjaGUuZ2V0KFxuICAgICAgICBgc2Vzc2lvbl9pZF8ke3RoaXMuc2hhcmRzPy5qb2luKCctJykgPz8gJzAnfWBcbiAgICAgIClcbiAgICAgIGlmICh0eXBlb2Ygc2Vzc2lvbklEQ2FjaGVkID09PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLmRlYnVnKGBGb3VuZCBDYWNoZWQgU2Vzc2lvbklEOiAke3Nlc3Npb25JRENhY2hlZH1gKVxuICAgICAgICB0aGlzLnNlc3Npb25JRCA9IHNlc3Npb25JRENhY2hlZFxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5zZW5kUmVzdW1lKClcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwYXlsb2FkOiBJZGVudGl0eVBheWxvYWQgPSB7XG4gICAgICB0b2tlbjogdGhpcy5jbGllbnQudG9rZW4sXG4gICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICRvczogdGhpcy5jbGllbnQuY2xpZW50UHJvcGVydGllcy5vcyA/PyBEZW5vLmJ1aWxkLm9zLFxuICAgICAgICAkYnJvd3NlcjogdGhpcy5jbGllbnQuY2xpZW50UHJvcGVydGllcy5icm93c2VyID8/ICdoYXJtb255JyxcbiAgICAgICAgJGRldmljZTogdGhpcy5jbGllbnQuY2xpZW50UHJvcGVydGllcy5kZXZpY2UgPz8gJ2hhcm1vbnknXG4gICAgICB9LFxuICAgICAgY29tcHJlc3M6IHRoaXMuY2xpZW50LmNvbXByZXNzLFxuICAgICAgc2hhcmQ6XG4gICAgICAgIHRoaXMuc2hhcmRzID09PSB1bmRlZmluZWRcbiAgICAgICAgICA/IFswLCAxXVxuICAgICAgICAgIDogW3RoaXMuc2hhcmRzWzBdID8/IDAsIHRoaXMuc2hhcmRzWzFdID8/IDFdLFxuICAgICAgaW50ZW50czogdGhpcy5jbGllbnQuaW50ZW50cy5yZWR1Y2UoXG4gICAgICAgIChwcmV2aW91cywgY3VycmVudCkgPT4gcHJldmlvdXMgfCBjdXJyZW50LFxuICAgICAgICAwXG4gICAgICApLFxuICAgICAgcHJlc2VuY2U6IHRoaXMuY2xpZW50LnByZXNlbmNlLmNyZWF0ZSgpXG4gICAgfVxuXG4gICAgdGhpcy5kZWJ1ZygnU2VuZGluZyBJZGVudGlmeSBwYXlsb2FkLi4uJylcbiAgICB0aGlzLmVtaXQoJ3NlbnRJZGVudGlmeScpXG4gICAgdGhpcy5zZW5kKHtcbiAgICAgIG9wOiBHYXRld2F5T3Bjb2Rlcy5JREVOVElGWSxcbiAgICAgIGQ6IHBheWxvYWRcbiAgICB9KVxuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBzZW5kUmVzdW1lKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0eXBlb2YgdGhpcy5jbGllbnQudG9rZW4gIT09ICdzdHJpbmcnKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUb2tlbiBub3Qgc3BlY2lmaWVkJylcblxuICAgIGlmICh0aGlzLnNlc3Npb25JRCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aGlzLnNlc3Npb25JRCA9IGF3YWl0IHRoaXMuY2FjaGUuZ2V0KFxuICAgICAgICBgc2Vzc2lvbl9pZF8ke3RoaXMuc2hhcmRzPy5qb2luKCctJykgPz8gJzAnfWBcbiAgICAgIClcbiAgICAgIGlmICh0aGlzLnNlc3Npb25JRCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdGhpcy5lbnF1ZXVlSWRlbnRpZnkoKVxuICAgIH1cbiAgICB0aGlzLmRlYnVnKGBQcmVwYXJpbmcgdG8gcmVzdW1lIHdpdGggU2Vzc2lvbjogJHt0aGlzLnNlc3Npb25JRH1gKVxuICAgIGlmICh0aGlzLnNlcXVlbmNlSUQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3QgY2FjaGVkID0gYXdhaXQgdGhpcy5jYWNoZS5nZXQoXG4gICAgICAgIGBzZXFfJHt0aGlzLnNoYXJkcz8uam9pbignLScpID8/ICcwJ31gXG4gICAgICApXG4gICAgICBpZiAoY2FjaGVkICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHRoaXMuc2VxdWVuY2VJRCA9XG4gICAgICAgICAgdHlwZW9mIGNhY2hlZCA9PT0gJ3N0cmluZycgPyBwYXJzZUludChjYWNoZWQpIDogKGNhY2hlZCBhcyBudW1iZXIpXG4gICAgfVxuICAgIGNvbnN0IHJlc3VtZVBheWxvYWQgPSB7XG4gICAgICBvcDogR2F0ZXdheU9wY29kZXMuUkVTVU1FLFxuICAgICAgZDoge1xuICAgICAgICB0b2tlbjogdGhpcy5jbGllbnQudG9rZW4sXG4gICAgICAgIHNlc3Npb25faWQ6IHRoaXMuc2Vzc2lvbklELFxuICAgICAgICBzZXE6IHRoaXMuc2VxdWVuY2VJRCA/PyBudWxsXG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuZW1pdCgnc2VudFJlc3VtZScpXG4gICAgdGhpcy5kZWJ1ZygnU2VuZGluZyBSZXN1bWUgcGF5bG9hZC4uLicpXG4gICAgdGhpcy5zZW5kKHJlc3VtZVBheWxvYWQpXG4gIH1cblxuICByZXF1ZXN0TWVtYmVycyhndWlsZDogc3RyaW5nLCBvcHRpb25zOiBSZXF1ZXN0TWVtYmVyc09wdGlvbnMgPSB7fSk6IHN0cmluZyB7XG4gICAgaWYgKG9wdGlvbnMucXVlcnkgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLmxpbWl0ID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdNaXNzaW5nIGxpbWl0IHByb3BlcnR5IHdoZW4gc3BlY2lmeWluZyBxdWVyeSBmb3IgUmVxdWVzdGluZyBNZW1iZXJzISdcbiAgICAgIClcbiAgICBjb25zdCBub25jZSA9IGNyeXB0by5yYW5kb21VVUlEKClcbiAgICB0aGlzLnNlbmQoe1xuICAgICAgb3A6IEdhdGV3YXlPcGNvZGVzLlJFUVVFU1RfR1VJTERfTUVNQkVSUyxcbiAgICAgIGQ6IHtcbiAgICAgICAgZ3VpbGRfaWQ6IGd1aWxkLFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3N0cmljdC1ib29sZWFuLWV4cHJlc3Npb25zXG4gICAgICAgIHF1ZXJ5OiBvcHRpb25zLnVzZXJzPy5sZW5ndGggPyB1bmRlZmluZWQgOiBvcHRpb25zLnF1ZXJ5ID8/ICcnLFxuICAgICAgICBsaW1pdDogb3B0aW9ucy5saW1pdCA/PyAwLFxuICAgICAgICBwcmVzZW5jZXM6IG9wdGlvbnMucHJlc2VuY2VzLFxuICAgICAgICB1c2VyX2lkczogb3B0aW9ucy51c2VycyxcbiAgICAgICAgbm9uY2VcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiBub25jZVxuICB9XG5cbiAgdXBkYXRlVm9pY2VTdGF0ZShcbiAgICBndWlsZDogR3VpbGQgfCBzdHJpbmcsXG4gICAgY2hhbm5lbD86IFZvaWNlQ2hhbm5lbCB8IHN0cmluZyxcbiAgICB2b2ljZU9wdGlvbnM6IFZvaWNlU3RhdGVPcHRpb25zID0ge31cbiAgKTogdm9pZCB7XG4gICAgdGhpcy5zZW5kKHtcbiAgICAgIG9wOiBHYXRld2F5T3Bjb2Rlcy5WT0lDRV9TVEFURV9VUERBVEUsXG4gICAgICBkOiB7XG4gICAgICAgIGd1aWxkX2lkOiB0eXBlb2YgZ3VpbGQgPT09ICdzdHJpbmcnID8gZ3VpbGQgOiBndWlsZC5pZCxcbiAgICAgICAgY2hhbm5lbF9pZDpcbiAgICAgICAgICBjaGFubmVsID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gbnVsbFxuICAgICAgICAgICAgOiB0eXBlb2YgY2hhbm5lbCA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgID8gY2hhbm5lbFxuICAgICAgICAgICAgOiBjaGFubmVsPy5pZCxcbiAgICAgICAgc2VsZl9tdXRlOlxuICAgICAgICAgIGNoYW5uZWwgPT09IHVuZGVmaW5lZFxuICAgICAgICAgICAgPyBmYWxzZVxuICAgICAgICAgICAgOiB2b2ljZU9wdGlvbnMubXV0ZSA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICA6IHZvaWNlT3B0aW9ucy5tdXRlLFxuICAgICAgICBzZWxmX2RlYWY6XG4gICAgICAgICAgY2hhbm5lbCA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgICA/IGZhbHNlXG4gICAgICAgICAgICA6IHZvaWNlT3B0aW9ucy5kZWFmID09PSB1bmRlZmluZWRcbiAgICAgICAgICAgID8gZmFsc2VcbiAgICAgICAgICAgIDogdm9pY2VPcHRpb25zLmRlYWZcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZGVidWcobXNnOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNsaWVudC5kZWJ1ZyhgU2hhcmQgJHt0aGlzLnNoYXJkSUR9YCwgbXNnKVxuICB9XG5cbiAgYXN5bmMgcmVjb25uZWN0KGZvcmNlTmV3PzogYm9vbGVhbik6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICh0aGlzLiNkZXN0cm95Q2FsbGVkKSByZXR1cm5cblxuICAgIHRoaXMuZW1pdCgncmVjb25uZWN0aW5nJylcbiAgICB0aGlzLmRlYnVnKCdSZWNvbm5lY3RpbmcuLi4gKGZvcmNlIG5ldzogJyArIFN0cmluZyhmb3JjZU5ldykgKyAnKScpXG5cbiAgICBjbGVhckludGVydmFsKHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWxJRClcbiAgICBpZiAoZm9yY2VOZXcgPT09IHRydWUpIHtcbiAgICAgIGF3YWl0IHRoaXMuY2FjaGUuZGVsZXRlKGBzZXNzaW9uX2lkXyR7dGhpcy5zaGFyZHM/LmpvaW4oJy0nKSA/PyAnMCd9YClcbiAgICAgIGF3YWl0IHRoaXMuY2FjaGUuZGVsZXRlKGBzZXFfJHt0aGlzLnNoYXJkcz8uam9pbignLScpID8/ICcwJ31gKVxuICAgIH1cblxuICAgIHRoaXMuY2xvc2VHYXRld2F5KDM5OTkpXG4gICAgdGhpcy5pbml0V2Vic29ja2V0KClcbiAgfVxuXG4gIGluaXRXZWJzb2NrZXQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuI2Rlc3Ryb3lDYWxsZWQpIHJldHVyblxuXG4gICAgdGhpcy5lbWl0KCdpbml0JylcbiAgICB0aGlzLmRlYnVnKCdJbml0aWFsaXppbmcgV2ViU29ja2V0Li4uJylcbiAgICB0aGlzLndlYnNvY2tldCA9IG5ldyBXZWJTb2NrZXQoXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXRlbXBsYXRlLWV4cHJlc3Npb25zXG4gICAgICBgJHtDb25zdGFudHMuRElTQ09SRF9HQVRFV0FZX1VSTH0vP3Y9JHtDb25zdGFudHMuRElTQ09SRF9BUElfVkVSU0lPTn0mZW5jb2Rpbmc9anNvbmAsXG4gICAgICBbXVxuICAgIClcbiAgICB0aGlzLndlYnNvY2tldC5iaW5hcnlUeXBlID0gJ2FycmF5YnVmZmVyJ1xuICAgIHRoaXMud2Vic29ja2V0Lm9ub3BlbiA9IHRoaXMub25vcGVuLmJpbmQodGhpcylcbiAgICB0aGlzLndlYnNvY2tldC5vbm1lc3NhZ2UgPSB0aGlzLm9ubWVzc2FnZS5iaW5kKHRoaXMpXG4gICAgdGhpcy53ZWJzb2NrZXQub25jbG9zZSA9IHRoaXMub25jbG9zZS5iaW5kKHRoaXMpXG4gICAgdGhpcy53ZWJzb2NrZXQub25lcnJvciA9IHRoaXMub25lcnJvci5iaW5kKFxuICAgICAgdGhpc1xuICAgICkgYXMgdW5rbm93biBhcyBXZWJTb2NrZXRbJ29uZXJyb3InXVxuICB9XG5cbiAgY2xvc2VHYXRld2F5KGNvZGU6IG51bWJlciA9IDEwMDAsIHJlYXNvbj86IHN0cmluZyk6IHZvaWQge1xuICAgIHRoaXMuZGVidWcoXG4gICAgICBgQ2xvc2luZyB3aXRoIGNvZGUgJHtjb2RlfSR7XG4gICAgICAgIHJlYXNvbiAhPT0gdW5kZWZpbmVkICYmIHJlYXNvbiAhPT0gJycgPyBgIGFuZCByZWFzb24gJHtyZWFzb259YCA6ICcnXG4gICAgICB9YFxuICAgIClcbiAgICByZXR1cm4gdGhpcy53ZWJzb2NrZXQ/LmNsb3NlKGNvZGUsIHJlYXNvbilcbiAgfVxuXG4gIC8vIEFsaWFzIGZvciBiYWNrd2FyZCBjb21wYXQsIHNpbmNlIGV2ZW50QDIuMC4wIHJlbW92ZWQgY2xvc2UgYWdhaW4uLi5cbiAgY2xvc2UoY29kZT86IG51bWJlciwgcmVhc29uPzogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5jbG9zZUdhdGV3YXkoY29kZSwgcmVhc29uKVxuICB9XG5cbiAgI2Rlc3Ryb3lDYWxsZWQgPSBmYWxzZVxuICAjZGVzdHJveUNvbXBsZXRlID0gZmFsc2VcblxuICBnZXQgZGVzdHJveWVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLiNkZXN0cm95Q2FsbGVkICYmIHRoaXMuI2Rlc3Ryb3lDb21wbGV0ZVxuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLmRlYnVnKCdEZXN0cm95aW5nIFNoYXJkJylcbiAgICB0aGlzLiNkZXN0cm95Q2FsbGVkID0gdHJ1ZVxuXG4gICAgaWYgKHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWxJRCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjbGVhckludGVydmFsKHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWxJRClcbiAgICAgIHRoaXMuaGVhcnRiZWF0SW50ZXJ2YWxJRCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgICB0aGlzLmNsb3NlR2F0ZXdheSgxMDAwLCBERVNUUk9ZX1JFQVNPTilcbiAgfVxuXG4gIHNlbmQoZGF0YTogR2F0ZXdheVJlc3BvbnNlKTogYm9vbGVhbiB7XG4gICAgaWYgKHRoaXMud2Vic29ja2V0Py5yZWFkeVN0YXRlICE9PSB0aGlzLndlYnNvY2tldD8uT1BFTikgcmV0dXJuIGZhbHNlXG4gICAgY29uc3QgcGFja2V0ID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgb3A6IGRhdGEub3AsXG4gICAgICBkOiBkYXRhLmQsXG4gICAgICBzOiB0eXBlb2YgZGF0YS5zID09PSAnbnVtYmVyJyA/IGRhdGEucyA6IG51bGwsXG4gICAgICB0OiBkYXRhLnQgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBkYXRhLnRcbiAgICB9KVxuICAgIHRoaXMud2Vic29ja2V0Py5zZW5kKHBhY2tldClcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgc2VuZFByZXNlbmNlKGRhdGE6IFN0YXR1c1VwZGF0ZVBheWxvYWQpOiB2b2lkIHtcbiAgICB0aGlzLnNlbmQoe1xuICAgICAgb3A6IEdhdGV3YXlPcGNvZGVzLlBSRVNFTkNFX1VQREFURSxcbiAgICAgIGQ6IGRhdGFcbiAgICB9KVxuICB9XG5cbiAgc2VuZEhlYXJ0YmVhdCgpOiB2b2lkIHtcbiAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgb3A6IEdhdGV3YXlPcGNvZGVzLkhFQVJUQkVBVCxcbiAgICAgIGQ6IHRoaXMuc2VxdWVuY2VJRCA/PyBudWxsXG4gICAgfVxuXG4gICAgdGhpcy5zZW5kKHBheWxvYWQpXG4gICAgdGhpcy5sYXN0UGluZ1RpbWVzdGFtcCA9IERhdGUubm93KClcbiAgfVxuXG4gIGhlYXJ0YmVhdCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kZXN0cm95ZWQpIHJldHVyblxuXG4gICAgaWYgKHRoaXMuaGVhcnRiZWF0U2VydmVyUmVzcG9uZGVkKSB7XG4gICAgICB0aGlzLmhlYXJ0YmVhdFNlcnZlclJlc3BvbmRlZCA9IGZhbHNlXG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZGVidWcoJ0ZvdW5kIGRlYWQgY29ubmVjdGlvbiwgcmVjb25uZWN0aW5nLi4uJylcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5oZWFydGJlYXRJbnRlcnZhbElEKVxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1mbG9hdGluZy1wcm9taXNlc1xuICAgICAgdGhpcy5yZWNvbm5lY3QoZmFsc2UpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICB0aGlzLnNlbmRIZWFydGJlYXQoKVxuICB9XG59XG5cbi8vIFRoZXJlJ3MgYSBsb3Qgb2Ygbm90IGFzc2lnbmFibGUgZXJyb3JzIGFuZCBhbGwgd2hlbiB1c2luZyB1bmtub3duLFxuLy8gc28gSSdsbCBzdGljayB3aXRoIGFueSBoZXJlLlxuZXhwb3J0IHR5cGUgR2F0ZXdheUV2ZW50SGFuZGxlciA9IChnYXRld2F5OiBHYXRld2F5LCBkOiBhbnkpID0+IHZvaWRcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLE1BQU0sUUFBUSxnQkFBZTtBQUd0QyxTQUNFLGNBQWMsRUFDZCxpQkFBaUIsRUFHakIsYUFBYSxRQUNSLHNCQUFxQjtBQUM1QixTQUFTLGVBQWUsUUFBUSxvQkFBbUI7QUFDbkQsU0FBUyxZQUFZLFFBQVEsOEJBQTZCO0FBQzFELFNBQVMsS0FBSyxRQUFRLG9CQUFtQjtBQUd6QyxTQUFTLG1CQUFtQixRQUFRLHFCQUFvQjtBQUN4RCxTQUFTLFVBQVUsUUFBUSx1QkFBc0I7QUFDakQsU0FBUyxTQUFTLFFBQVEs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