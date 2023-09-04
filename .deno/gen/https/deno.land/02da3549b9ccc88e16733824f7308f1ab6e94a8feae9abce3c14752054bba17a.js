// based on https://github.com/discordjs/discord.js/blob/master/src/rest/RequestHandler.js
// adapted to work with harmony rest manager
/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */ import { delay } from '../utils/delay.ts';
import { DiscordAPIError, HTTPError } from './error.ts';
import { RequestQueue } from './queue.ts';
// It returns JSON objects which are untyped so
async function parseResponse(res, raw) {
    let result;
    if (res.status === 204) result = Promise.resolve(undefined);
    else if (res.headers.get('content-type')?.startsWith('application/json') === true) result = res.json();
    else result = await res.arrayBuffer().then((e)=>new Uint8Array(e));
    if (raw) {
        return {
            response: res,
            body: result
        };
    } else return result;
}
function getAPIOffset(serverDate) {
    return new Date(serverDate).getTime() - Date.now();
}
function calculateReset(reset, serverDate) {
    return new Date(Number(reset) * 1000).getTime() - getAPIOffset(serverDate);
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let invalidCount = 0;
let invalidCountResetTime = null;
export class BucketHandler {
    queue;
    reset;
    remaining;
    limit;
    constructor(manager){
        this.manager = manager;
        this.queue = new RequestQueue();
        this.reset = -1;
        this.remaining = -1;
        this.limit = -1;
    }
    // Returns Response (untyped JSON)
    async push(request) {
        await this.queue.wait();
        let res;
        try {
            res = await this.execute(request);
        } finally{
            this.queue.shift();
        }
        return res;
    }
    get globalLimited() {
        return this.manager.globalRemaining <= 0 && Date.now() < Number(this.manager.globalReset);
    }
    get localLimited() {
        return this.remaining <= 0 && Date.now() < this.reset;
    }
    get limited() {
        return this.globalLimited || this.localLimited;
    }
    get inactive() {
        return this.queue.remaining === 0 && !this.limited;
    }
    async globalDelayFor(ms) {
        return await new Promise((resolve)=>{
            this.manager.setTimeout(()=>{
                this.manager.globalDelay = null;
                resolve();
            }, ms);
        });
    }
    async execute(request) {
        while(this.limited){
            const isGlobal = this.globalLimited;
            let limit, timeout, delayPromise;
            if (isGlobal) {
                limit = this.manager.globalLimit;
                timeout = // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                Number(this.manager.globalReset) + this.manager.restTimeOffset - Date.now();
                if (typeof this.manager.globalDelay !== 'number') {
                    this.manager.globalDelay = this.globalDelayFor(timeout);
                }
                delayPromise = this.manager.globalDelay;
            } else {
                limit = this.limit;
                // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
                timeout = this.reset + this.manager.restTimeOffset - Date.now();
                delayPromise = delay(timeout);
            }
            this.manager.client?.emit('rateLimit', {
                timeout,
                limit,
                method: request.method,
                path: request.path,
                global: isGlobal
            });
            await delayPromise;
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!this.manager.globalReset || this.manager.globalReset < Date.now()) {
            this.manager.globalReset = Date.now() + 1000;
            this.manager.globalRemaining = this.manager.globalLimit;
        }
        this.manager.globalRemaining--;
        // Perform the request
        let res;
        try {
            res = await request.execute();
        } catch (_error) {
            // For backward compatibility.
            const error = _error;
            if (request.retries === this.manager.retryLimit) {
                throw new HTTPError(error.message, error.constructor.name, error.code, request.method, request.path);
            }
            request.retries++;
            return await this.execute(request);
        }
        let sublimitTimeout;
        if (res?.headers !== undefined) {
            const serverDate = res.headers.get('date');
            const limit1 = res.headers.get('x-ratelimit-limit');
            const remaining = res.headers.get('x-ratelimit-remaining');
            const reset = res.headers.get('x-ratelimit-reset');
            this.limit = limit1 !== null ? Number(limit1) : Infinity;
            this.remaining = remaining !== null ? Number(remaining) : 1;
            this.reset = reset !== null ? calculateReset(reset, serverDate) : Date.now();
            if (request.path.includes('reactions') === true) {
                this.reset = new Date(serverDate).getTime() - getAPIOffset(serverDate) + 250;
            }
            let retryAfter = res.headers.get('retry-after');
            retryAfter = retryAfter !== null ? Number(retryAfter) * 1000 : -1;
            if (retryAfter > 0) {
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                if (res.headers.get('x-ratelimit-global')) {
                    this.manager.globalRemaining = 0;
                    this.manager.globalReset = Date.now() + retryAfter;
                } else if (!this.localLimited) {
                    sublimitTimeout = retryAfter;
                }
            }
        }
        if (res.status === 401 || res.status === 403 || res.status === 429) {
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (!invalidCountResetTime || invalidCountResetTime < Date.now()) {
                invalidCountResetTime = Date.now() + 1000 * 60 * 10;
                invalidCount = 0;
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            invalidCount++;
        }
        if (res.ok === true) {
            return await parseResponse(res, request.options.rawResponse ?? false);
        }
        if (res.status >= 400 && res.status < 500) {
            if (res.status === 429) {
                this.manager.client?.emit('debug', `Rate-Limited on route ${request.path}${sublimitTimeout !== undefined ? ' for sublimit' : ''}`);
                if (sublimitTimeout !== undefined) {
                    await delay(sublimitTimeout);
                }
                return await this.execute(request);
            }
            let data;
            try {
                data = await parseResponse(res, false);
            } catch (_err) {
                const err = _err;
                throw new HTTPError(err.message, err.constructor.name, err.code, request.method, request.path);
            }
            throw new DiscordAPIError({
                url: request.path,
                errors: data?.errors,
                status: res.status,
                method: request.method,
                message: data?.message,
                code: data?.code,
                requestData: request.options.data
            });
        }
        if (res.status >= 500 && res.status < 600) {
            if (request.retries === this.manager.retryLimit) {
                throw new HTTPError(res.statusText, res.constructor.name, res.status, request.method, request.path);
            }
            request.retries++;
            return await this.execute(request);
        }
        return null;
    }
    manager;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3Jlc3QvYnVja2V0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGJhc2VkIG9uIGh0dHBzOi8vZ2l0aHViLmNvbS9kaXNjb3JkanMvZGlzY29yZC5qcy9ibG9iL21hc3Rlci9zcmMvcmVzdC9SZXF1ZXN0SGFuZGxlci5qc1xuLy8gYWRhcHRlZCB0byB3b3JrIHdpdGggaGFybW9ueSByZXN0IG1hbmFnZXJcblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uICovXG5cbmltcG9ydCB7IGRlbGF5IH0gZnJvbSAnLi4vdXRpbHMvZGVsYXkudHMnXG5pbXBvcnQgeyBEaXNjb3JkQVBJRXJyb3IsIEhUVFBFcnJvciB9IGZyb20gJy4vZXJyb3IudHMnXG5pbXBvcnQgdHlwZSB7IFJFU1RNYW5hZ2VyIH0gZnJvbSAnLi9tYW5hZ2VyLnRzJ1xuaW1wb3J0IHsgUmVxdWVzdFF1ZXVlIH0gZnJvbSAnLi9xdWV1ZS50cydcbmltcG9ydCB7IEFQSVJlcXVlc3QgfSBmcm9tICcuL3JlcXVlc3QudHMnXG5cbi8vIEl0IHJldHVybnMgSlNPTiBvYmplY3RzIHdoaWNoIGFyZSB1bnR5cGVkIHNvXG5hc3luYyBmdW5jdGlvbiBwYXJzZVJlc3BvbnNlKHJlczogUmVzcG9uc2UsIHJhdzogYm9vbGVhbik6IFByb21pc2U8YW55PiB7XG4gIGxldCByZXN1bHRcbiAgaWYgKHJlcy5zdGF0dXMgPT09IDIwNCkgcmVzdWx0ID0gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZClcbiAgZWxzZSBpZiAoXG4gICAgcmVzLmhlYWRlcnMuZ2V0KCdjb250ZW50LXR5cGUnKT8uc3RhcnRzV2l0aCgnYXBwbGljYXRpb24vanNvbicpID09PSB0cnVlXG4gIClcbiAgICByZXN1bHQgPSByZXMuanNvbigpXG4gIGVsc2UgcmVzdWx0ID0gYXdhaXQgcmVzLmFycmF5QnVmZmVyKCkudGhlbigoZSkgPT4gbmV3IFVpbnQ4QXJyYXkoZSkpXG5cbiAgaWYgKHJhdykge1xuICAgIHJldHVybiB7IHJlc3BvbnNlOiByZXMsIGJvZHk6IHJlc3VsdCB9XG4gIH0gZWxzZSByZXR1cm4gcmVzdWx0XG59XG5cbmZ1bmN0aW9uIGdldEFQSU9mZnNldChzZXJ2ZXJEYXRlOiBudW1iZXIgfCBzdHJpbmcpOiBudW1iZXIge1xuICByZXR1cm4gbmV3IERhdGUoc2VydmVyRGF0ZSkuZ2V0VGltZSgpIC0gRGF0ZS5ub3coKVxufVxuXG5mdW5jdGlvbiBjYWxjdWxhdGVSZXNldChcbiAgcmVzZXQ6IG51bWJlciB8IHN0cmluZyxcbiAgc2VydmVyRGF0ZTogbnVtYmVyIHwgc3RyaW5nXG4pOiBudW1iZXIge1xuICByZXR1cm4gbmV3IERhdGUoTnVtYmVyKHJlc2V0KSAqIDEwMDApLmdldFRpbWUoKSAtIGdldEFQSU9mZnNldChzZXJ2ZXJEYXRlKVxufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5sZXQgaW52YWxpZENvdW50ID0gMFxubGV0IGludmFsaWRDb3VudFJlc2V0VGltZTogbnVtYmVyIHwgbnVsbCA9IG51bGxcblxuZXhwb3J0IGNsYXNzIEJ1Y2tldEhhbmRsZXIge1xuICBxdWV1ZSA9IG5ldyBSZXF1ZXN0UXVldWUoKVxuICByZXNldCA9IC0xXG4gIHJlbWFpbmluZyA9IC0xXG4gIGxpbWl0ID0gLTFcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbWFuYWdlcjogUkVTVE1hbmFnZXIpIHt9XG5cbiAgLy8gUmV0dXJucyBSZXNwb25zZSAodW50eXBlZCBKU09OKVxuICBhc3luYyBwdXNoKHJlcXVlc3Q6IEFQSVJlcXVlc3QpOiBQcm9taXNlPGFueT4ge1xuICAgIGF3YWl0IHRoaXMucXVldWUud2FpdCgpXG4gICAgbGV0IHJlc1xuICAgIHRyeSB7XG4gICAgICByZXMgPSBhd2FpdCB0aGlzLmV4ZWN1dGUocmVxdWVzdClcbiAgICB9IGZpbmFsbHkge1xuICAgICAgdGhpcy5xdWV1ZS5zaGlmdCgpXG4gICAgfVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIGdldCBnbG9iYWxMaW1pdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICB0aGlzLm1hbmFnZXIuZ2xvYmFsUmVtYWluaW5nIDw9IDAgJiZcbiAgICAgIERhdGUubm93KCkgPCBOdW1iZXIodGhpcy5tYW5hZ2VyLmdsb2JhbFJlc2V0KVxuICAgIClcbiAgfVxuXG4gIGdldCBsb2NhbExpbWl0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMucmVtYWluaW5nIDw9IDAgJiYgRGF0ZS5ub3coKSA8IHRoaXMucmVzZXRcbiAgfVxuXG4gIGdldCBsaW1pdGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmdsb2JhbExpbWl0ZWQgfHwgdGhpcy5sb2NhbExpbWl0ZWRcbiAgfVxuXG4gIGdldCBpbmFjdGl2ZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5xdWV1ZS5yZW1haW5pbmcgPT09IDAgJiYgIXRoaXMubGltaXRlZFxuICB9XG5cbiAgYXN5bmMgZ2xvYmFsRGVsYXlGb3IobXM6IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgdGhpcy5tYW5hZ2VyLnNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICB0aGlzLm1hbmFnZXIuZ2xvYmFsRGVsYXkgPSBudWxsXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfSwgbXMpXG4gICAgfSlcbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGUocmVxdWVzdDogQVBJUmVxdWVzdCk6IFByb21pc2U8YW55PiB7XG4gICAgd2hpbGUgKHRoaXMubGltaXRlZCkge1xuICAgICAgY29uc3QgaXNHbG9iYWwgPSB0aGlzLmdsb2JhbExpbWl0ZWRcbiAgICAgIGxldCBsaW1pdCwgdGltZW91dCwgZGVsYXlQcm9taXNlXG5cbiAgICAgIGlmIChpc0dsb2JhbCkge1xuICAgICAgICBsaW1pdCA9IHRoaXMubWFuYWdlci5nbG9iYWxMaW1pdFxuICAgICAgICB0aW1lb3V0ID1cbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXBsdXMtb3BlcmFuZHNcbiAgICAgICAgICBOdW1iZXIodGhpcy5tYW5hZ2VyLmdsb2JhbFJlc2V0KSArXG4gICAgICAgICAgdGhpcy5tYW5hZ2VyLnJlc3RUaW1lT2Zmc2V0IC1cbiAgICAgICAgICBEYXRlLm5vdygpXG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5tYW5hZ2VyLmdsb2JhbERlbGF5ICE9PSAnbnVtYmVyJykge1xuICAgICAgICAgIHRoaXMubWFuYWdlci5nbG9iYWxEZWxheSA9IHRoaXMuZ2xvYmFsRGVsYXlGb3IodGltZW91dClcbiAgICAgICAgfVxuICAgICAgICBkZWxheVByb21pc2UgPSB0aGlzLm1hbmFnZXIuZ2xvYmFsRGVsYXlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxpbWl0ID0gdGhpcy5saW1pdFxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXBsdXMtb3BlcmFuZHNcbiAgICAgICAgdGltZW91dCA9IHRoaXMucmVzZXQgKyB0aGlzLm1hbmFnZXIucmVzdFRpbWVPZmZzZXQgLSBEYXRlLm5vdygpXG4gICAgICAgIGRlbGF5UHJvbWlzZSA9IGRlbGF5KHRpbWVvdXQpXG4gICAgICB9XG5cbiAgICAgIHRoaXMubWFuYWdlci5jbGllbnQ/LmVtaXQoJ3JhdGVMaW1pdCcsIHtcbiAgICAgICAgdGltZW91dCxcbiAgICAgICAgbGltaXQsXG4gICAgICAgIG1ldGhvZDogcmVxdWVzdC5tZXRob2QsXG4gICAgICAgIHBhdGg6IHJlcXVlc3QucGF0aCxcbiAgICAgICAgZ2xvYmFsOiBpc0dsb2JhbFxuICAgICAgfSlcblxuICAgICAgYXdhaXQgZGVsYXlQcm9taXNlXG4gICAgfVxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9zdHJpY3QtYm9vbGVhbi1leHByZXNzaW9uc1xuICAgIGlmICghdGhpcy5tYW5hZ2VyLmdsb2JhbFJlc2V0IHx8IHRoaXMubWFuYWdlci5nbG9iYWxSZXNldCA8IERhdGUubm93KCkpIHtcbiAgICAgIHRoaXMubWFuYWdlci5nbG9iYWxSZXNldCA9IERhdGUubm93KCkgKyAxMDAwXG4gICAgICB0aGlzLm1hbmFnZXIuZ2xvYmFsUmVtYWluaW5nID0gdGhpcy5tYW5hZ2VyLmdsb2JhbExpbWl0XG4gICAgfVxuICAgIHRoaXMubWFuYWdlci5nbG9iYWxSZW1haW5pbmctLVxuXG4gICAgLy8gUGVyZm9ybSB0aGUgcmVxdWVzdFxuICAgIGxldCByZXNcbiAgICB0cnkge1xuICAgICAgcmVzID0gYXdhaXQgcmVxdWVzdC5leGVjdXRlKClcbiAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgIC8vIEZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5LlxuICAgICAgY29uc3QgZXJyb3IgPSBfZXJyb3IgYXMgSFRUUEVycm9yXG4gICAgICBpZiAocmVxdWVzdC5yZXRyaWVzID09PSB0aGlzLm1hbmFnZXIucmV0cnlMaW1pdCkge1xuICAgICAgICB0aHJvdyBuZXcgSFRUUEVycm9yKFxuICAgICAgICAgIGVycm9yLm1lc3NhZ2UsXG4gICAgICAgICAgZXJyb3IuY29uc3RydWN0b3IubmFtZSxcbiAgICAgICAgICBlcnJvci5jb2RlLFxuICAgICAgICAgIHJlcXVlc3QubWV0aG9kLFxuICAgICAgICAgIHJlcXVlc3QucGF0aFxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHJlcXVlc3QucmV0cmllcysrXG4gICAgICByZXR1cm4gYXdhaXQgdGhpcy5leGVjdXRlKHJlcXVlc3QpXG4gICAgfVxuXG4gICAgbGV0IHN1YmxpbWl0VGltZW91dFxuICAgIGlmIChyZXM/LmhlYWRlcnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3Qgc2VydmVyRGF0ZSA9IHJlcy5oZWFkZXJzLmdldCgnZGF0ZScpXG4gICAgICBjb25zdCBsaW1pdCA9IHJlcy5oZWFkZXJzLmdldCgneC1yYXRlbGltaXQtbGltaXQnKVxuICAgICAgY29uc3QgcmVtYWluaW5nID0gcmVzLmhlYWRlcnMuZ2V0KCd4LXJhdGVsaW1pdC1yZW1haW5pbmcnKVxuICAgICAgY29uc3QgcmVzZXQgPSByZXMuaGVhZGVycy5nZXQoJ3gtcmF0ZWxpbWl0LXJlc2V0JylcbiAgICAgIHRoaXMubGltaXQgPSBsaW1pdCAhPT0gbnVsbCA/IE51bWJlcihsaW1pdCkgOiBJbmZpbml0eVxuICAgICAgdGhpcy5yZW1haW5pbmcgPSByZW1haW5pbmcgIT09IG51bGwgPyBOdW1iZXIocmVtYWluaW5nKSA6IDFcbiAgICAgIHRoaXMucmVzZXQgPVxuICAgICAgICByZXNldCAhPT0gbnVsbCA/IGNhbGN1bGF0ZVJlc2V0KHJlc2V0LCBzZXJ2ZXJEYXRlISkgOiBEYXRlLm5vdygpXG5cbiAgICAgIGlmIChyZXF1ZXN0LnBhdGguaW5jbHVkZXMoJ3JlYWN0aW9ucycpID09PSB0cnVlKSB7XG4gICAgICAgIHRoaXMucmVzZXQgPVxuICAgICAgICAgIG5ldyBEYXRlKHNlcnZlckRhdGUhKS5nZXRUaW1lKCkgLSBnZXRBUElPZmZzZXQoc2VydmVyRGF0ZSEpICsgMjUwXG4gICAgICB9XG5cbiAgICAgIGxldCByZXRyeUFmdGVyOiBudW1iZXIgfCBudWxsIHwgc3RyaW5nID0gcmVzLmhlYWRlcnMuZ2V0KCdyZXRyeS1hZnRlcicpXG4gICAgICByZXRyeUFmdGVyID0gcmV0cnlBZnRlciAhPT0gbnVsbCA/IE51bWJlcihyZXRyeUFmdGVyKSAqIDEwMDAgOiAtMVxuICAgICAgaWYgKHJldHJ5QWZ0ZXIgPiAwKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvc3RyaWN0LWJvb2xlYW4tZXhwcmVzc2lvbnNcbiAgICAgICAgaWYgKHJlcy5oZWFkZXJzLmdldCgneC1yYXRlbGltaXQtZ2xvYmFsJykpIHtcbiAgICAgICAgICB0aGlzLm1hbmFnZXIuZ2xvYmFsUmVtYWluaW5nID0gMFxuICAgICAgICAgIHRoaXMubWFuYWdlci5nbG9iYWxSZXNldCA9IERhdGUubm93KCkgKyByZXRyeUFmdGVyXG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMubG9jYWxMaW1pdGVkKSB7XG4gICAgICAgICAgc3VibGltaXRUaW1lb3V0ID0gcmV0cnlBZnRlclxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMSB8fCByZXMuc3RhdHVzID09PSA0MDMgfHwgcmVzLnN0YXR1cyA9PT0gNDI5KSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3N0cmljdC1ib29sZWFuLWV4cHJlc3Npb25zXG4gICAgICBpZiAoIWludmFsaWRDb3VudFJlc2V0VGltZSB8fCBpbnZhbGlkQ291bnRSZXNldFRpbWUgPCBEYXRlLm5vdygpKSB7XG4gICAgICAgIGludmFsaWRDb3VudFJlc2V0VGltZSA9IERhdGUubm93KCkgKyAxMDAwICogNjAgKiAxMFxuICAgICAgICBpbnZhbGlkQ291bnQgPSAwXG4gICAgICB9XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG4gICAgICBpbnZhbGlkQ291bnQrK1xuICAgIH1cblxuICAgIGlmIChyZXMub2sgPT09IHRydWUpIHtcbiAgICAgIHJldHVybiBhd2FpdCBwYXJzZVJlc3BvbnNlKHJlcywgcmVxdWVzdC5vcHRpb25zLnJhd1Jlc3BvbnNlID8/IGZhbHNlKVxuICAgIH1cblxuICAgIGlmIChyZXMuc3RhdHVzID49IDQwMCAmJiByZXMuc3RhdHVzIDwgNTAwKSB7XG4gICAgICBpZiAocmVzLnN0YXR1cyA9PT0gNDI5KSB7XG4gICAgICAgIHRoaXMubWFuYWdlci5jbGllbnQ/LmVtaXQoXG4gICAgICAgICAgJ2RlYnVnJyxcbiAgICAgICAgICBgUmF0ZS1MaW1pdGVkIG9uIHJvdXRlICR7cmVxdWVzdC5wYXRofSR7XG4gICAgICAgICAgICBzdWJsaW1pdFRpbWVvdXQgIT09IHVuZGVmaW5lZCA/ICcgZm9yIHN1YmxpbWl0JyA6ICcnXG4gICAgICAgICAgfWBcbiAgICAgICAgKVxuXG4gICAgICAgIGlmIChzdWJsaW1pdFRpbWVvdXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGF3YWl0IGRlbGF5KHN1YmxpbWl0VGltZW91dClcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXdhaXQgdGhpcy5leGVjdXRlKHJlcXVlc3QpXG4gICAgICB9XG5cbiAgICAgIGxldCBkYXRhXG4gICAgICB0cnkge1xuICAgICAgICBkYXRhID0gYXdhaXQgcGFyc2VSZXNwb25zZShyZXMsIGZhbHNlKVxuICAgICAgfSBjYXRjaCAoX2Vycikge1xuICAgICAgICBjb25zdCBlcnIgPSBfZXJyIGFzIEhUVFBFcnJvclxuICAgICAgICB0aHJvdyBuZXcgSFRUUEVycm9yKFxuICAgICAgICAgIGVyci5tZXNzYWdlLFxuICAgICAgICAgIGVyci5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgICAgIGVyci5jb2RlLFxuICAgICAgICAgIHJlcXVlc3QubWV0aG9kLFxuICAgICAgICAgIHJlcXVlc3QucGF0aFxuICAgICAgICApXG4gICAgICB9XG5cbiAgICAgIHRocm93IG5ldyBEaXNjb3JkQVBJRXJyb3Ioe1xuICAgICAgICB1cmw6IHJlcXVlc3QucGF0aCxcbiAgICAgICAgZXJyb3JzOiBkYXRhPy5lcnJvcnMsXG4gICAgICAgIHN0YXR1czogcmVzLnN0YXR1cyxcbiAgICAgICAgbWV0aG9kOiByZXF1ZXN0Lm1ldGhvZCxcbiAgICAgICAgbWVzc2FnZTogZGF0YT8ubWVzc2FnZSxcbiAgICAgICAgY29kZTogZGF0YT8uY29kZSxcbiAgICAgICAgcmVxdWVzdERhdGE6IHJlcXVlc3Qub3B0aW9ucy5kYXRhXG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmIChyZXMuc3RhdHVzID49IDUwMCAmJiByZXMuc3RhdHVzIDwgNjAwKSB7XG4gICAgICBpZiAocmVxdWVzdC5yZXRyaWVzID09PSB0aGlzLm1hbmFnZXIucmV0cnlMaW1pdCkge1xuICAgICAgICB0aHJvdyBuZXcgSFRUUEVycm9yKFxuICAgICAgICAgIHJlcy5zdGF0dXNUZXh0LFxuICAgICAgICAgIHJlcy5jb25zdHJ1Y3Rvci5uYW1lLFxuICAgICAgICAgIHJlcy5zdGF0dXMsXG4gICAgICAgICAgcmVxdWVzdC5tZXRob2QsXG4gICAgICAgICAgcmVxdWVzdC5wYXRoXG4gICAgICAgIClcbiAgICAgIH1cblxuICAgICAgcmVxdWVzdC5yZXRyaWVzKytcbiAgICAgIHJldHVybiBhd2FpdCB0aGlzLmV4ZWN1dGUocmVxdWVzdClcbiAgICB9XG5cbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEZBQTBGO0FBQzFGLDRDQUE0QztBQUU1QyxtRUFBbUUsR0FFbkUsU0FBUyxLQUFLLFFBQVEsb0JBQW1CO0FBQ3pDLFNBQVMsZUFBZSxFQUFFLFNBQVMsUUFBUSxhQUFZO0FBRXZELFNBQVMsWUFBWSxRQUFRLGFBQVk7QUFHekMsK0NBQStDO0FBQy9DLGVBQWUsY0FBYyxHQUFhLEVBQUUsR0FBWSxFQUFnQjtJQUN0RSxJQUFJO0lBQ0osSUFBSSxJQUFJLE1BQU0sS0FBSyxLQUFLLFNBQVMsUUFBUSxPQUFPLENBQUM7U0FDNUMsSUFDSCxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsaUJBQWlCLFdBQVcsd0JBQXdCLElBQUksRUFFeEUsU0FBUyxJQUFJLElBQUk7U0FDZCxTQUFTLE1BQU0sSUFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLENBQUMsSUFBTSxJQUFJLFdBQVc7SUFFakUsSUFBSSxLQUFLO1FBQ1AsT0FBTztZQUFF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