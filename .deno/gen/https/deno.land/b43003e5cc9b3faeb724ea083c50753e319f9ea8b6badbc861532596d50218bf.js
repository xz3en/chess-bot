import { Collection } from '../utils/collection.ts';
import { METHODS } from './types.ts';
import { Constants } from '../types/constants.ts';
import { RESTEndpoints } from './endpoints.ts';
import { BucketHandler } from './bucket.ts';
import { APIRequest } from './request.ts';
/** API Route builder function */ export const builder = (rest, acum = '/')=>{
    const routes = {};
    const proxy = new Proxy(routes, {
        get: (_, p, __)=>{
            if (p === 'toString') return ()=>acum;
            if (METHODS.includes(String(p)) === true) {
                const method = rest[String(p)];
                return async (...args)=>await method.bind(rest)(`${Constants.DISCORD_API_URL}/v${rest.version}${acum.substring(0, acum.length - 1)}`, ...args);
            }
            return builder(rest, acum + String(p) + '/');
        }
    });
    return proxy;
};
export var TokenType;
(function(TokenType) {
    TokenType[/** Token type for Bot User */ "Bot"] = "Bot";
    TokenType[/** Token Type for OAuth2 */ "Bearer"] = "Bearer";
    TokenType[/** No Token Type. Can be used for User accounts. */ "None"] = '';
})(TokenType || (TokenType = {}));
/** An easier to use interface for interacting with Discord REST API. */ export class RESTManager {
    /** API Version being used by REST Manager */ version = Constants.DISCORD_API_VERSION;
    /**
   * API Map - easy to use way for interacting with Discord API.
   *
   * Examples:
   * * ```ts
   *   rest.api.users['123'].get().then(userPayload => doSomething)
   *   ```
   * * ```ts
   *   rest.api.guilds['123'].channels.post({ name: 'my-channel', type: 0 }).then(channelPayload => {})
   *   ```
   */ api;
    #token;
    /** Token being used for Authorization */ get token() {
        return this.#token;
    }
    set token(val) {
        this.#token = val;
    }
    /** Token Type of the Token if any */ tokenType = TokenType.Bot;
    /** Headers object which patch the current ones */ headers = {};
    /** Optional custom User Agent (header) */ userAgent;
    /** Whether REST Manager is using Canary API */ canary;
    /** Optional Harmony Client object */ client;
    endpoints;
    requestTimeout = 30000;
    timers;
    apiURL = Constants.DISCORD_API_URL;
    handlers;
    globalLimit = Infinity;
    globalRemaining = this.globalLimit;
    globalReset = null;
    globalDelay = null;
    retryLimit = 1;
    restTimeOffset = 0;
    constructor(options){
        this.api = builder(this);
        if (options?.token !== undefined) this.token = options.token;
        if (options?.version !== undefined) this.version = options.version;
        if (options?.headers !== undefined) this.headers = options.headers;
        if (options?.tokenType !== undefined) this.tokenType = options.tokenType;
        if (options?.userAgent !== undefined) this.userAgent = options.userAgent;
        if (options?.canary !== undefined) this.canary = options.canary;
        if (options?.retryLimit !== undefined) this.retryLimit = options.retryLimit;
        if (options?.requestTimeout !== undefined) this.requestTimeout = options.requestTimeout;
        if (options?.client !== undefined) {
            Object.defineProperty(this, 'client', {
                value: options.client,
                enumerable: false
            });
        }
        this.endpoints = new RESTEndpoints(this);
        Object.defineProperty(this, 'timers', {
            value: new Set(),
            enumerable: false
        });
        Object.defineProperty(this, 'handlers', {
            value: new Collection(),
            enumerable: false
        });
    }
    setTimeout(fn, ms) {
        const timer = setTimeout(()=>{
            this.timers.delete(timer);
            fn();
        }, ms);
        this.timers.add(timer);
        return timer;
    }
    resolveBucket(url) {
        if (url.startsWith(this.apiURL)) url = url.slice(this.apiURL.length);
        if (url.startsWith('/')) url = url.slice(1);
        const bucket = [];
        const route = url.split('/');
        for(let i = 0; i < route.length; i++){
            if (route[i - 1] === 'reactions') break;
            if (route[i].match(/\d{15,20}/) !== null && route[i - 1].match(/(channels|guilds)/) === null) bucket.push('minor_id');
            else bucket.push(route[i]);
        }
        return bucket.join('/');
    }
    async request(method, path, options = {}) {
        const req = new APIRequest(this, method, path, options);
        const bucket = this.resolveBucket(path);
        let handler = this.handlers.get(bucket);
        if (handler === undefined) {
            handler = new BucketHandler(this);
            this.handlers.set(bucket, handler);
        }
        return handler.push(req);
    }
    /**
   * Makes a Request to Discord API.
   * @param method HTTP Method to use
   * @param url URL of the Request
   * @param body Body to send with Request
   * @param maxRetries Number of Max Retries to perform
   * @param bucket BucketID of the Request
   * @param rawResponse Whether to get Raw Response or body itself
   */ async make(method, url, body, _maxRetries = 0, bucket, rawResponse, options = {}) {
        return await this.request(method, url, Object.assign({
            data: body,
            rawResponse,
            route: bucket ?? undefined
        }, options));
    }
    /** Makes a GET Request to API */ async get(url, body, maxRetries = 0, bucket, rawResponse, options) {
        return await this.make('get', url, body, maxRetries, bucket, rawResponse, options);
    }
    /** Makes a POST Request to API */ async post(url, body, maxRetries = 0, bucket, rawResponse, options) {
        return await this.make('post', url, body, maxRetries, bucket, rawResponse, options);
    }
    /** Makes a DELETE Request to API */ async delete(url, body, maxRetries = 0, bucket, rawResponse, options) {
        return await this.make('delete', url, body, maxRetries, bucket, rawResponse, options);
    }
    /** Makes a PATCH Request to API */ async patch(url, body, maxRetries = 0, bucket, rawResponse, options) {
        return await this.make('patch', url, body, maxRetries, bucket, rawResponse, options);
    }
    /** Makes a PUT Request to API */ async put(url, body, maxRetries = 0, bucket, rawResponse, options) {
        return await this.make('put', url, body, maxRetries, bucket, rawResponse, options);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3Jlc3QvbWFuYWdlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb2xsZWN0aW9uIH0gZnJvbSAnLi4vdXRpbHMvY29sbGVjdGlvbi50cydcbmltcG9ydCB0eXBlIHsgQ2xpZW50IH0gZnJvbSAnLi4vY2xpZW50L21vZC50cydcbmltcG9ydCB7IFJlcXVlc3RNZXRob2RzLCBNRVRIT0RTIH0gZnJvbSAnLi90eXBlcy50cydcbmltcG9ydCB7IENvbnN0YW50cyB9IGZyb20gJy4uL3R5cGVzL2NvbnN0YW50cy50cydcbmltcG9ydCB7IFJFU1RFbmRwb2ludHMgfSBmcm9tICcuL2VuZHBvaW50cy50cydcbmltcG9ydCB7IEJ1Y2tldEhhbmRsZXIgfSBmcm9tICcuL2J1Y2tldC50cydcbmltcG9ydCB7IEFQSVJlcXVlc3QsIFJlcXVlc3RPcHRpb25zIH0gZnJvbSAnLi9yZXF1ZXN0LnRzJ1xuXG5leHBvcnQgdHlwZSBNZXRob2RGdW5jdGlvbiA9IChcbiAgYm9keT86IHVua25vd24sXG4gIG1heFJldHJpZXM/OiBudW1iZXIsXG4gIGJ1Y2tldD86IHN0cmluZyB8IG51bGwsXG4gIHJhd1Jlc3BvbnNlPzogYm9vbGVhbixcbiAgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zXG4pID0+IFByb21pc2U8YW55PiAvLyB1bnR5cGVkIEpTT05cblxuZXhwb3J0IGludGVyZmFjZSBBUElNYXAgZXh0ZW5kcyBNZXRob2RGdW5jdGlvbiB7XG4gIC8qKiBNYWtlIGEgR0VUIHJlcXVlc3QgdG8gY3VycmVudCByb3V0ZSAqL1xuICBnZXQ6IEFQSU1hcFxuICAvKiogTWFrZSBhIFBPU1QgcmVxdWVzdCB0byBjdXJyZW50IHJvdXRlICovXG4gIHBvc3Q6IEFQSU1hcFxuICAvKiogTWFrZSBhIFBBVENIIHJlcXVlc3QgdG8gY3VycmVudCByb3V0ZSAqL1xuICBwYXRjaDogQVBJTWFwXG4gIC8qKiBNYWtlIGEgUFVUIHJlcXVlc3QgdG8gY3VycmVudCByb3V0ZSAqL1xuICBwdXQ6IEFQSU1hcFxuICAvKiogTWFrZSBhIERFTEVURSByZXF1ZXN0IHRvIGN1cnJlbnQgcm91dGUgKi9cbiAgZGVsZXRlOiBBUElNYXBcbiAgLyoqIE1ha2UgYSBIRUFEIHJlcXVlc3QgdG8gY3VycmVudCByb3V0ZSAqL1xuICBoZWFkOiBBUElNYXBcbiAgLyoqIENvbnRpbnVlIGJ1aWxkaW5nIEFQSSBSb3V0ZSAqL1xuICBbbmFtZTogc3RyaW5nXTogQVBJTWFwXG59XG5cbi8qKiBBUEkgUm91dGUgYnVpbGRlciBmdW5jdGlvbiAqL1xuZXhwb3J0IGNvbnN0IGJ1aWxkZXIgPSAocmVzdDogUkVTVE1hbmFnZXIsIGFjdW0gPSAnLycpOiBBUElNYXAgPT4ge1xuICBjb25zdCByb3V0ZXMgPSB7fVxuICBjb25zdCBwcm94eSA9IG5ldyBQcm94eShyb3V0ZXMsIHtcbiAgICBnZXQ6IChfLCBwLCBfXykgPT4ge1xuICAgICAgaWYgKHAgPT09ICd0b1N0cmluZycpIHJldHVybiAoKSA9PiBhY3VtXG4gICAgICBpZiAoTUVUSE9EUy5pbmNsdWRlcyhTdHJpbmcocCkpID09PSB0cnVlKSB7XG4gICAgICAgIGNvbnN0IG1ldGhvZCA9IChcbiAgICAgICAgICByZXN0IGFzIHVua25vd24gYXMge1xuICAgICAgICAgICAgW25hbWU6IHN0cmluZ106ICguLi5hcmdzOiB1bmtub3duW10pID0+IFByb21pc2U8dW5rbm93bj5cbiAgICAgICAgICB9XG4gICAgICAgIClbU3RyaW5nKHApXVxuICAgICAgICByZXR1cm4gYXN5bmMgKC4uLmFyZ3M6IHVua25vd25bXSkgPT5cbiAgICAgICAgICBhd2FpdCBtZXRob2QuYmluZChyZXN0KShcbiAgICAgICAgICAgIGAke0NvbnN0YW50cy5ESVNDT1JEX0FQSV9VUkx9L3Yke3Jlc3QudmVyc2lvbn0ke2FjdW0uc3Vic3RyaW5nKFxuICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICBhY3VtLmxlbmd0aCAtIDFcbiAgICAgICAgICAgICl9YCxcbiAgICAgICAgICAgIC4uLmFyZ3NcbiAgICAgICAgICApXG4gICAgICB9XG4gICAgICByZXR1cm4gYnVpbGRlcihyZXN0LCBhY3VtICsgU3RyaW5nKHApICsgJy8nKVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIHByb3h5IGFzIHVua25vd24gYXMgQVBJTWFwXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUkVTVE9wdGlvbnMge1xuICAvKiogVG9rZW4gdG8gdXNlIGZvciBhdXRob3JpemF0aW9uICovXG4gIHRva2VuPzogc3RyaW5nIHwgKCgpID0+IHN0cmluZyB8IHVuZGVmaW5lZClcbiAgLyoqIEhlYWRlcnMgdG8gcGF0Y2ggd2l0aCBpZiBhbnkgKi9cbiAgaGVhZGVycz86IFJlY29yZDxzdHJpbmcsIHN0cmluZz5cbiAgLyoqIFdoZXRoZXIgdG8gdXNlIENhbmFyeSBpbnN0YW5jZSBvZiBEaXNjb3JkIEFQSSBvciBub3QgKi9cbiAgY2FuYXJ5PzogYm9vbGVhblxuICAvKiogRGlzY29yZCBSRVNUIEFQSSB2ZXJzaW9uIHRvIHVzZSAqL1xuICB2ZXJzaW9uPzogNiB8IDcgfCA4XG4gIC8qKiBUb2tlbiBUeXBlIHRvIHVzZSBmb3IgQXV0aG9yaXphdGlvbiAqL1xuICB0b2tlblR5cGU/OiBUb2tlblR5cGVcbiAgLyoqIFVzZXIgQWdlbnQgdG8gdXNlIChIZWFkZXIpICovXG4gIHVzZXJBZ2VudD86IHN0cmluZ1xuICAvKiogT3B0aW9uYWwgSGFybW9ueSBjbGllbnQgKi9cbiAgY2xpZW50PzogQ2xpZW50XG4gIC8qKiBSZXF1ZXN0cyBUaW1lb3V0IChpbiBNUywgZGVmYXVsdCAzMHMpICovXG4gIHJlcXVlc3RUaW1lb3V0PzogbnVtYmVyXG4gIC8qKiBSZXRyeSBMaW1pdCAoZGVmYXVsdCAxKSAqL1xuICByZXRyeUxpbWl0PzogbnVtYmVyXG59XG5cbi8qKiBUb2tlbiBUeXBlIGZvciBSRVNUIEFQSS4gKi9cbmV4cG9ydCBlbnVtIFRva2VuVHlwZSB7XG4gIC8qKiBUb2tlbiB0eXBlIGZvciBCb3QgVXNlciAqL1xuICBCb3QgPSAnQm90JyxcbiAgLyoqIFRva2VuIFR5cGUgZm9yIE9BdXRoMiAqL1xuICBCZWFyZXIgPSAnQmVhcmVyJyxcbiAgLyoqIE5vIFRva2VuIFR5cGUuIENhbiBiZSB1c2VkIGZvciBVc2VyIGFjY291bnRzLiAqL1xuICBOb25lID0gJydcbn1cblxuLyoqIEFuIGVhc2llciB0byB1c2UgaW50ZXJmYWNlIGZvciBpbnRlcmFjdGluZyB3aXRoIERpc2NvcmQgUkVTVCBBUEkuICovXG5leHBvcnQgY2xhc3MgUkVTVE1hbmFnZXIge1xuICAvKiogQVBJIFZlcnNpb24gYmVpbmcgdXNlZCBieSBSRVNUIE1hbmFnZXIgKi9cbiAgdmVyc2lvbjogbnVtYmVyID0gQ29uc3RhbnRzLkRJU0NPUkRfQVBJX1ZFUlNJT05cbiAgLyoqXG4gICAqIEFQSSBNYXAgLSBlYXN5IHRvIHVzZSB3YXkgZm9yIGludGVyYWN0aW5nIHdpdGggRGlzY29yZCBBUEkuXG4gICAqXG4gICAqIEV4YW1wbGVzOlxuICAgKiAqIGBgYHRzXG4gICAqICAgcmVzdC5hcGkudXNlcnNbJzEyMyddLmdldCgpLnRoZW4odXNlclBheWxvYWQgPT4gZG9Tb21ldGhpbmcpXG4gICAqICAgYGBgXG4gICAqICogYGBgdHNcbiAgICogICByZXN0LmFwaS5ndWlsZHNbJzEyMyddLmNoYW5uZWxzLnBvc3QoeyBuYW1lOiAnbXktY2hhbm5lbCcsIHR5cGU6IDAgfSkudGhlbihjaGFubmVsUGF5bG9hZCA9PiB7fSlcbiAgICogICBgYGBcbiAgICovXG4gIGFwaTogQVBJTWFwXG5cbiAgI3Rva2VuPzogc3RyaW5nIHwgKCgpID0+IHN0cmluZyB8IHVuZGVmaW5lZClcblxuICAvKiogVG9rZW4gYmVpbmcgdXNlZCBmb3IgQXV0aG9yaXphdGlvbiAqL1xuICBnZXQgdG9rZW4oKTogc3RyaW5nIHwgKCgpID0+IHN0cmluZyB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLiN0b2tlblxuICB9XG5cbiAgc2V0IHRva2VuKHZhbDogc3RyaW5nIHwgKCgpID0+IHN0cmluZyB8IHVuZGVmaW5lZCkgfCB1bmRlZmluZWQpIHtcbiAgICB0aGlzLiN0b2tlbiA9IHZhbFxuICB9XG5cbiAgLyoqIFRva2VuIFR5cGUgb2YgdGhlIFRva2VuIGlmIGFueSAqL1xuICB0b2tlblR5cGU6IFRva2VuVHlwZSA9IFRva2VuVHlwZS5Cb3RcbiAgLyoqIEhlYWRlcnMgb2JqZWN0IHdoaWNoIHBhdGNoIHRoZSBjdXJyZW50IG9uZXMgKi9cbiAgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9XG4gIC8qKiBPcHRpb25hbCBjdXN0b20gVXNlciBBZ2VudCAoaGVhZGVyKSAqL1xuICB1c2VyQWdlbnQ/OiBzdHJpbmdcbiAgLyoqIFdoZXRoZXIgUkVTVCBNYW5hZ2VyIGlzIHVzaW5nIENhbmFyeSBBUEkgKi9cbiAgY2FuYXJ5PzogYm9vbGVhblxuICAvKiogT3B0aW9uYWwgSGFybW9ueSBDbGllbnQgb2JqZWN0ICovXG4gIHJlYWRvbmx5IGNsaWVudD86IENsaWVudFxuICBlbmRwb2ludHM6IFJFU1RFbmRwb2ludHNcbiAgcmVxdWVzdFRpbWVvdXQgPSAzMDAwMFxuICByZWFkb25seSB0aW1lcnMhOiBTZXQ8bnVtYmVyPlxuICBhcGlVUkwgPSBDb25zdGFudHMuRElTQ09SRF9BUElfVVJMXG5cbiAgcmVhZG9ubHkgaGFuZGxlcnMhOiBDb2xsZWN0aW9uPHN0cmluZywgQnVja2V0SGFuZGxlcj5cbiAgZ2xvYmFsTGltaXQgPSBJbmZpbml0eVxuICBnbG9iYWxSZW1haW5pbmcgPSB0aGlzLmdsb2JhbExpbWl0XG4gIGdsb2JhbFJlc2V0OiBudW1iZXIgfCBudWxsID0gbnVsbFxuICBnbG9iYWxEZWxheTogbnVtYmVyIHwgbnVsbCB8IFByb21pc2U8dm9pZD4gPSBudWxsXG4gIHJldHJ5TGltaXQgPSAxXG4gIHJlc3RUaW1lT2Zmc2V0ID0gMFxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM/OiBSRVNUT3B0aW9ucykge1xuICAgIHRoaXMuYXBpID0gYnVpbGRlcih0aGlzKVxuICAgIGlmIChvcHRpb25zPy50b2tlbiAhPT0gdW5kZWZpbmVkKSB0aGlzLnRva2VuID0gb3B0aW9ucy50b2tlblxuICAgIGlmIChvcHRpb25zPy52ZXJzaW9uICE9PSB1bmRlZmluZWQpIHRoaXMudmVyc2lvbiA9IG9wdGlvbnMudmVyc2lvblxuICAgIGlmIChvcHRpb25zPy5oZWFkZXJzICE9PSB1bmRlZmluZWQpIHRoaXMuaGVhZGVycyA9IG9wdGlvbnMuaGVhZGVyc1xuICAgIGlmIChvcHRpb25zPy50b2tlblR5cGUgIT09IHVuZGVmaW5lZCkgdGhpcy50b2tlblR5cGUgPSBvcHRpb25zLnRva2VuVHlwZVxuICAgIGlmIChvcHRpb25zPy51c2VyQWdlbnQgIT09IHVuZGVmaW5lZCkgdGhpcy51c2VyQWdlbnQgPSBvcHRpb25zLnVzZXJBZ2VudFxuICAgIGlmIChvcHRpb25zPy5jYW5hcnkgIT09IHVuZGVmaW5lZCkgdGhpcy5jYW5hcnkgPSBvcHRpb25zLmNhbmFyeVxuICAgIGlmIChvcHRpb25zPy5yZXRyeUxpbWl0ICE9PSB1bmRlZmluZWQpIHRoaXMucmV0cnlMaW1pdCA9IG9wdGlvbnMucmV0cnlMaW1pdFxuICAgIGlmIChvcHRpb25zPy5yZXF1ZXN0VGltZW91dCAhPT0gdW5kZWZpbmVkKVxuICAgICAgdGhpcy5yZXF1ZXN0VGltZW91dCA9IG9wdGlvbnMucmVxdWVzdFRpbWVvdXRcblxuICAgIGlmIChvcHRpb25zPy5jbGllbnQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdjbGllbnQnLCB7XG4gICAgICAgIHZhbHVlOiBvcHRpb25zLmNsaWVudCxcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICAgIH0pXG4gICAgfVxuXG4gICAgdGhpcy5lbmRwb2ludHMgPSBuZXcgUkVTVEVuZHBvaW50cyh0aGlzKVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICd0aW1lcnMnLCB7XG4gICAgICB2YWx1ZTogbmV3IFNldCgpLFxuICAgICAgZW51bWVyYWJsZTogZmFsc2VcbiAgICB9KVxuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdoYW5kbGVycycsIHtcbiAgICAgIHZhbHVlOiBuZXcgQ29sbGVjdGlvbjxzdHJpbmcsIEJ1Y2tldEhhbmRsZXI+KCksXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pXG4gIH1cblxuICBzZXRUaW1lb3V0KGZuOiAoLi4uYXJnczogdW5rbm93bltdKSA9PiB1bmtub3duLCBtczogbnVtYmVyKTogbnVtYmVyIHtcbiAgICBjb25zdCB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgdGhpcy50aW1lcnMuZGVsZXRlKHRpbWVyKVxuICAgICAgZm4oKVxuICAgIH0sIG1zKVxuICAgIHRoaXMudGltZXJzLmFkZCh0aW1lcilcbiAgICByZXR1cm4gdGltZXJcbiAgfVxuXG4gIHJlc29sdmVCdWNrZXQodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICh1cmwuc3RhcnRzV2l0aCh0aGlzLmFwaVVSTCkpIHVybCA9IHVybC5zbGljZSh0aGlzLmFwaVVSTC5sZW5ndGgpXG4gICAgaWYgKHVybC5zdGFydHNXaXRoKCcvJykpIHVybCA9IHVybC5zbGljZSgxKVxuICAgIGNvbnN0IGJ1Y2tldDogc3RyaW5nW10gPSBbXVxuICAgIGNvbnN0IHJvdXRlID0gdXJsLnNwbGl0KCcvJylcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJvdXRlLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocm91dGVbaSAtIDFdID09PSAncmVhY3Rpb25zJykgYnJlYWtcbiAgICAgIGlmIChcbiAgICAgICAgcm91dGVbaV0ubWF0Y2goL1xcZHsxNSwyMH0vKSAhPT0gbnVsbCAmJlxuICAgICAgICByb3V0ZVtpIC0gMV0ubWF0Y2goLyhjaGFubmVsc3xndWlsZHMpLykgPT09IG51bGxcbiAgICAgIClcbiAgICAgICAgYnVja2V0LnB1c2goJ21pbm9yX2lkJylcbiAgICAgIGVsc2UgYnVja2V0LnB1c2gocm91dGVbaV0pXG4gICAgfVxuICAgIHJldHVybiBidWNrZXQuam9pbignLycpXG4gIH1cblxuICBhc3luYyByZXF1ZXN0PFQgPSBhbnk+KFxuICAgIG1ldGhvZDogUmVxdWVzdE1ldGhvZHMsXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIG9wdGlvbnM6IFJlcXVlc3RPcHRpb25zID0ge31cbiAgKTogUHJvbWlzZTxUPiB7XG4gICAgY29uc3QgcmVxID0gbmV3IEFQSVJlcXVlc3QodGhpcywgbWV0aG9kLCBwYXRoLCBvcHRpb25zKVxuICAgIGNvbnN0IGJ1Y2tldCA9IHRoaXMucmVzb2x2ZUJ1Y2tldChwYXRoKVxuICAgIGxldCBoYW5kbGVyID0gdGhpcy5oYW5kbGVycy5nZXQoYnVja2V0KVxuXG4gICAgaWYgKGhhbmRsZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaGFuZGxlciA9IG5ldyBCdWNrZXRIYW5kbGVyKHRoaXMpXG4gICAgICB0aGlzLmhhbmRsZXJzLnNldChidWNrZXQsIGhhbmRsZXIpXG4gICAgfVxuXG4gICAgcmV0dXJuIGhhbmRsZXIucHVzaChyZXEpXG4gIH1cblxuICAvKipcbiAgICogTWFrZXMgYSBSZXF1ZXN0IHRvIERpc2NvcmQgQVBJLlxuICAgKiBAcGFyYW0gbWV0aG9kIEhUVFAgTWV0aG9kIHRvIHVzZVxuICAgKiBAcGFyYW0gdXJsIFVSTCBvZiB0aGUgUmVxdWVzdFxuICAgKiBAcGFyYW0gYm9keSBCb2R5IHRvIHNlbmQgd2l0aCBSZXF1ZXN0XG4gICAqIEBwYXJhbSBtYXhSZXRyaWVzIE51bWJlciBvZiBNYXggUmV0cmllcyB0byBwZXJmb3JtXG4gICAqIEBwYXJhbSBidWNrZXQgQnVja2V0SUQgb2YgdGhlIFJlcXVlc3RcbiAgICogQHBhcmFtIHJhd1Jlc3BvbnNlIFdoZXRoZXIgdG8gZ2V0IFJhdyBSZXNwb25zZSBvciBib2R5IGl0c2VsZlxuICAgKi9cbiAgYXN5bmMgbWFrZShcbiAgICBtZXRob2Q6IFJlcXVlc3RNZXRob2RzLFxuICAgIHVybDogc3RyaW5nLFxuICAgIGJvZHk/OiB1bmtub3duLFxuICAgIF9tYXhSZXRyaWVzID0gMCxcbiAgICBidWNrZXQ/OiBzdHJpbmcgfCBudWxsLFxuICAgIHJhd1Jlc3BvbnNlPzogYm9vbGVhbixcbiAgICBvcHRpb25zOiBSZXF1ZXN0T3B0aW9ucyA9IHt9XG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMucmVxdWVzdChcbiAgICAgIG1ldGhvZCxcbiAgICAgIHVybCxcbiAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgIHtcbiAgICAgICAgICBkYXRhOiBib2R5LFxuICAgICAgICAgIHJhd1Jlc3BvbnNlLFxuICAgICAgICAgIHJvdXRlOiBidWNrZXQgPz8gdW5kZWZpbmVkXG4gICAgICAgIH0sXG4gICAgICAgIG9wdGlvbnNcbiAgICAgIClcbiAgICApXG4gIH1cblxuICAvKiogTWFrZXMgYSBHRVQgUmVxdWVzdCB0byBBUEkgKi9cbiAgYXN5bmMgZ2V0KFxuICAgIHVybDogc3RyaW5nLFxuICAgIGJvZHk/OiB1bmtub3duLFxuICAgIG1heFJldHJpZXMgPSAwLFxuICAgIGJ1Y2tldD86IHN0cmluZyB8IG51bGwsXG4gICAgcmF3UmVzcG9uc2U/OiBib29sZWFuLFxuICAgIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc1xuICApOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLm1ha2UoXG4gICAgICAnZ2V0JyxcbiAgICAgIHVybCxcbiAgICAgIGJvZHksXG4gICAgICBtYXhSZXRyaWVzLFxuICAgICAgYnVja2V0LFxuICAgICAgcmF3UmVzcG9uc2UsXG4gICAgICBvcHRpb25zXG4gICAgKVxuICB9XG5cbiAgLyoqIE1ha2VzIGEgUE9TVCBSZXF1ZXN0IHRvIEFQSSAqL1xuICBhc3luYyBwb3N0KFxuICAgIHVybDogc3RyaW5nLFxuICAgIGJvZHk/OiB1bmtub3duLFxuICAgIG1heFJldHJpZXMgPSAwLFxuICAgIGJ1Y2tldD86IHN0cmluZyB8IG51bGwsXG4gICAgcmF3UmVzcG9uc2U/OiBib29sZWFuLFxuICAgIG9wdGlvbnM/OiBSZXF1ZXN0T3B0aW9uc1xuICApOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLm1ha2UoXG4gICAgICAncG9zdCcsXG4gICAgICB1cmwsXG4gICAgICBib2R5LFxuICAgICAgbWF4UmV0cmllcyxcbiAgICAgIGJ1Y2tldCxcbiAgICAgIHJhd1Jlc3BvbnNlLFxuICAgICAgb3B0aW9uc1xuICAgIClcbiAgfVxuXG4gIC8qKiBNYWtlcyBhIERFTEVURSBSZXF1ZXN0IHRvIEFQSSAqL1xuICBhc3luYyBkZWxldGUoXG4gICAgdXJsOiBzdHJpbmcsXG4gICAgYm9keT86IHVua25vd24sXG4gICAgbWF4UmV0cmllcyA9IDAsXG4gICAgYnVja2V0Pzogc3RyaW5nIHwgbnVsbCxcbiAgICByYXdSZXNwb25zZT86IGJvb2xlYW4sXG4gICAgb3B0aW9ucz86IFJlcXVlc3RPcHRpb25zXG4gICk6IFByb21pc2U8YW55PiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMubWFrZShcbiAgICAgICdkZWxldGUnLFxuICAgICAgdXJsLFxuICAgICAgYm9keSxcbiAgICAgIG1heFJldHJpZXMsXG4gICAgICBidWNrZXQsXG4gICAgICByYXdSZXNwb25zZSxcbiAgICAgIG9wdGlvbnNcbiAgICApXG4gIH1cblxuICAvKiogTWFrZXMgYSBQQVRDSCBSZXF1ZXN0IHRvIEFQSSAqL1xuICBhc3luYyBwYXRjaChcbiAgICB1cmw6IHN0cmluZyxcbiAgICBib2R5PzogdW5rbm93bixcbiAgICBtYXhSZXRyaWVzID0gMCxcbiAgICBidWNrZXQ/OiBzdHJpbmcgfCBudWxsLFxuICAgIHJhd1Jlc3BvbnNlPzogYm9vbGVhbixcbiAgICBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnNcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5tYWtlKFxuICAgICAgJ3BhdGNoJyxcbiAgICAgIHVybCxcbiAgICAgIGJvZHksXG4gICAgICBtYXhSZXRyaWVzLFxuICAgICAgYnVja2V0LFxuICAgICAgcmF3UmVzcG9uc2UsXG4gICAgICBvcHRpb25zXG4gICAgKVxuICB9XG5cbiAgLyoqIE1ha2VzIGEgUFVUIFJlcXVlc3QgdG8gQVBJICovXG4gIGFzeW5jIHB1dChcbiAgICB1cmw6IHN0cmluZyxcbiAgICBib2R5PzogdW5rbm93bixcbiAgICBtYXhSZXRyaWVzID0gMCxcbiAgICBidWNrZXQ/OiBzdHJpbmcgfCBudWxsLFxuICAgIHJhd1Jlc3BvbnNlPzogYm9vbGVhbixcbiAgICBvcHRpb25zPzogUmVxdWVzdE9wdGlvbnNcbiAgKTogUHJvbWlzZTxhbnk+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5tYWtlKFxuICAgICAgJ3B1dCcsXG4gICAgICB1cmwsXG4gICAgICBib2R5LFxuICAgICAgbWF4UmV0cmllcyxcbiAgICAgIGJ1Y2tldCxcbiAgICAgIHJhd1Jlc3BvbnNlLFxuICAgICAgb3B0aW9uc1xuICAgIClcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsVUFBVSxRQUFRLHlCQUF3QjtBQUVuRCxTQUF5QixPQUFPLFFBQVEsYUFBWTtBQUNwRCxTQUFTLFNBQVMsUUFBUSx3QkFBdUI7QUFDakQsU0FBUyxhQUFhLFFBQVEsaUJBQWdCO0FBQzlDLFNBQVMsYUFBYSxRQUFRLGNBQWE7QUFDM0MsU0FBUyxVQUFVLFFBQXdCLGVBQWM7QUEyQnpELCtCQUErQixHQUMvQixPQUFPLE1BQU0sVUFBVSxDQUFDLE1BQW1CLE9BQU8sR0FBRyxHQUFhO0lBQ2hFLE1BQU0sU0FBUyxDQUFDO0lBQ2hCLE1BQU0sUUFBUSxJQUFJLE1BQU0sUUFBUTtRQUM5QixLQUFLLENBQUMsR0FBRyxHQUFHLEtBQU87WUFDakIsSUFBSSxNQUFNLFlBQVksT0FBTyxJQUFNO1lBQ25DLElBQUksUUFBUSxRQUFRLENBQUMs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