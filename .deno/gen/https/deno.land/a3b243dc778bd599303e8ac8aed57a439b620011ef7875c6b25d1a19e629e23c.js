// Not in deps.ts to allow optional dep loading
import { connect } from 'https://deno.land/x/redis@v0.25.1/mod.ts';
/** Redis Cache Adapter for using Redis as a cache-provider. */ export class RedisCacheAdapter {
    _redis;
    redis;
    ready = false;
    _expireIntervalTimer = 5000;
    _expireInterval;
    constructor(options){
        this._redis = connect(options);
        this._redis.then((redis)=>{
            this.redis = redis;
            this.ready = true;
            this._startExpireInterval();
        }, ()=>{
        // TODO: Make error for this
        });
    }
    _startExpireInterval() {
        this._expireInterval = setInterval(()=>{
            this.redis?.scan(0, {
                pattern: '*:expires'
            }).then(([_, names])=>{
                for (const name of names){
                    this.redis?.hvals(name).then((vals)=>{
                        for (const val of vals){
                            const expireVal = JSON.parse(val);
                            const expired = new Date().getTime() > expireVal.at;
                            if (expired) this.redis?.hdel(expireVal.name, expireVal.key);
                        }
                    });
                }
            });
        }, this._expireIntervalTimer);
    }
    async _checkReady() {
        if (!this.ready) await this._redis;
    }
    async get(cacheName, key) {
        await this._checkReady();
        const cache = await this.redis?.hget(cacheName, key);
        if (cache === undefined) return;
        try {
            return JSON.parse(cache);
        } catch (e) {
            return cache;
        }
    }
    async set(cacheName, key, value, expire) {
        await this._checkReady();
        await this.redis?.hset(cacheName, key, typeof value === 'object' ? JSON.stringify(value) : value);
        if (expire !== undefined) {
            await this.redis?.hset(`${cacheName}:expires`, key, JSON.stringify({
                name: cacheName,
                key,
                at: new Date().getTime() + expire
            }));
        }
    }
    async delete(cacheName, ...keys) {
        await this._checkReady();
        return (await this.redis?.hdel(cacheName, ...keys) ?? 0) === keys.length;
    }
    async array(cacheName) {
        await this._checkReady();
        const data = await this.redis?.hvals(cacheName);
        return data?.map((e)=>JSON.parse(e));
    }
    async keys(cacheName) {
        await this._checkReady();
        return this.redis?.hkeys(cacheName);
    }
    async deleteCache(cacheName) {
        await this._checkReady();
        return await this.redis?.del(cacheName) !== 0;
    }
    async size(cacheName) {
        await this._checkReady();
        return this.redis?.hlen(cacheName);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2NhY2hlL3JlZGlzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IElDYWNoZUFkYXB0ZXIgfSBmcm9tICcuL2FkYXB0ZXIudHMnXG4vLyBOb3QgaW4gZGVwcy50cyB0byBhbGxvdyBvcHRpb25hbCBkZXAgbG9hZGluZ1xuaW1wb3J0IHtcbiAgY29ubmVjdCxcbiAgUmVkaXMsXG4gIFJlZGlzQ29ubmVjdE9wdGlvbnMsXG4gIFJlZGlzVmFsdWVcbn0gZnJvbSAnaHR0cHM6Ly9kZW5vLmxhbmQveC9yZWRpc0B2MC4yNS4xL21vZC50cydcblxuLyoqIFJlZGlzIENhY2hlIEFkYXB0ZXIgZm9yIHVzaW5nIFJlZGlzIGFzIGEgY2FjaGUtcHJvdmlkZXIuICovXG5leHBvcnQgY2xhc3MgUmVkaXNDYWNoZUFkYXB0ZXIgaW1wbGVtZW50cyBJQ2FjaGVBZGFwdGVyIHtcbiAgX3JlZGlzOiBQcm9taXNlPFJlZGlzPlxuICByZWRpcz86IFJlZGlzXG4gIHJlYWR5OiBib29sZWFuID0gZmFsc2VcbiAgcmVhZG9ubHkgX2V4cGlyZUludGVydmFsVGltZXI6IG51bWJlciA9IDUwMDBcbiAgcHJpdmF0ZSBfZXhwaXJlSW50ZXJ2YWw/OiBudW1iZXJcblxuICBjb25zdHJ1Y3RvcihvcHRpb25zOiBSZWRpc0Nvbm5lY3RPcHRpb25zKSB7XG4gICAgdGhpcy5fcmVkaXMgPSBjb25uZWN0KG9wdGlvbnMpXG4gICAgdGhpcy5fcmVkaXMudGhlbihcbiAgICAgIChyZWRpcykgPT4ge1xuICAgICAgICB0aGlzLnJlZGlzID0gcmVkaXNcbiAgICAgICAgdGhpcy5yZWFkeSA9IHRydWVcbiAgICAgICAgdGhpcy5fc3RhcnRFeHBpcmVJbnRlcnZhbCgpXG4gICAgICB9LFxuICAgICAgKCkgPT4ge1xuICAgICAgICAvLyBUT0RPOiBNYWtlIGVycm9yIGZvciB0aGlzXG4gICAgICB9XG4gICAgKVxuICB9XG5cbiAgcHJpdmF0ZSBfc3RhcnRFeHBpcmVJbnRlcnZhbCgpOiB2b2lkIHtcbiAgICB0aGlzLl9leHBpcmVJbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIHRoaXMucmVkaXM/LnNjYW4oMCwgeyBwYXR0ZXJuOiAnKjpleHBpcmVzJyB9KS50aGVuKChbXywgbmFtZXNdKSA9PiB7XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykge1xuICAgICAgICAgIHRoaXMucmVkaXM/Lmh2YWxzKG5hbWUpLnRoZW4oKHZhbHMpID0+IHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgdmFsIG9mIHZhbHMpIHtcbiAgICAgICAgICAgICAgY29uc3QgZXhwaXJlVmFsOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogc3RyaW5nXG4gICAgICAgICAgICAgICAga2V5OiBzdHJpbmdcbiAgICAgICAgICAgICAgICBhdDogbnVtYmVyXG4gICAgICAgICAgICAgIH0gPSBKU09OLnBhcnNlKHZhbClcbiAgICAgICAgICAgICAgY29uc3QgZXhwaXJlZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpID4gZXhwaXJlVmFsLmF0XG4gICAgICAgICAgICAgIGlmIChleHBpcmVkKSB0aGlzLnJlZGlzPy5oZGVsKGV4cGlyZVZhbC5uYW1lLCBleHBpcmVWYWwua2V5KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSwgdGhpcy5fZXhwaXJlSW50ZXJ2YWxUaW1lcilcbiAgfVxuXG4gIGFzeW5jIF9jaGVja1JlYWR5KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5yZWFkeSkgYXdhaXQgdGhpcy5fcmVkaXNcbiAgfVxuXG4gIGFzeW5jIGdldDxUPihjYWNoZU5hbWU6IHN0cmluZywga2V5OiBzdHJpbmcpOiBQcm9taXNlPFQgfCB1bmRlZmluZWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9jaGVja1JlYWR5KClcbiAgICBjb25zdCBjYWNoZSA9IGF3YWl0IHRoaXMucmVkaXM/LmhnZXQoY2FjaGVOYW1lLCBrZXkpXG4gICAgaWYgKGNhY2hlID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gSlNPTi5wYXJzZShjYWNoZSkgYXMgVFxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiBjYWNoZSBhcyB1bmtub3duIGFzIFRcbiAgICB9XG4gIH1cblxuICBhc3luYyBzZXQ8VD4oXG4gICAgY2FjaGVOYW1lOiBzdHJpbmcsXG4gICAga2V5OiBzdHJpbmcsXG4gICAgdmFsdWU6IFQsXG4gICAgZXhwaXJlPzogbnVtYmVyXG4gICk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuX2NoZWNrUmVhZHkoKVxuICAgIGF3YWl0IHRoaXMucmVkaXM/LmhzZXQoXG4gICAgICBjYWNoZU5hbWUsXG4gICAgICBrZXksXG4gICAgICB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnXG4gICAgICAgID8gSlNPTi5zdHJpbmdpZnkodmFsdWUpXG4gICAgICAgIDogKHZhbHVlIGFzIHVua25vd24gYXMgUmVkaXNWYWx1ZSlcbiAgICApXG4gICAgaWYgKGV4cGlyZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBhd2FpdCB0aGlzLnJlZGlzPy5oc2V0KFxuICAgICAgICBgJHtjYWNoZU5hbWV9OmV4cGlyZXNgLFxuICAgICAgICBrZXksXG4gICAgICAgIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICBuYW1lOiBjYWNoZU5hbWUsXG4gICAgICAgICAga2V5LFxuICAgICAgICAgIGF0OiBuZXcgRGF0ZSgpLmdldFRpbWUoKSArIGV4cGlyZVxuICAgICAgICB9KVxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGRlbGV0ZShjYWNoZU5hbWU6IHN0cmluZywgLi4ua2V5czogc3RyaW5nW10pOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBhd2FpdCB0aGlzLl9jaGVja1JlYWR5KClcbiAgICByZXR1cm4gKChhd2FpdCB0aGlzLnJlZGlzPy5oZGVsKGNhY2hlTmFtZSwgLi4ua2V5cykpID8/IDApID09PSBrZXlzLmxlbmd0aFxuICB9XG5cbiAgYXN5bmMgYXJyYXk8VD4oY2FjaGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPFRbXSB8IHVuZGVmaW5lZD4ge1xuICAgIGF3YWl0IHRoaXMuX2NoZWNrUmVhZHkoKVxuICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLnJlZGlzPy5odmFscyhjYWNoZU5hbWUpXG4gICAgcmV0dXJuIGRhdGE/Lm1hcCgoZTogc3RyaW5nKSA9PiBKU09OLnBhcnNlKGUpKVxuICB9XG5cbiAgYXN5bmMga2V5cyhjYWNoZU5hbWU6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10gfCB1bmRlZmluZWQ+IHtcbiAgICBhd2FpdCB0aGlzLl9jaGVja1JlYWR5KClcbiAgICByZXR1cm4gdGhpcy5yZWRpcz8uaGtleXMoY2FjaGVOYW1lKVxuICB9XG5cbiAgYXN5bmMgZGVsZXRlQ2FjaGUoY2FjaGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBhd2FpdCB0aGlzLl9jaGVja1JlYWR5KClcbiAgICByZXR1cm4gKGF3YWl0IHRoaXMucmVkaXM/LmRlbChjYWNoZU5hbWUpKSAhPT0gMFxuICB9XG5cbiAgYXN5bmMgc2l6ZShjYWNoZU5hbWU6IHN0cmluZyk6IFByb21pc2U8bnVtYmVyIHwgdW5kZWZpbmVkPiB7XG4gICAgYXdhaXQgdGhpcy5fY2hlY2tSZWFkeSgpXG4gICAgcmV0dXJuIHRoaXMucmVkaXM/LmhsZW4oY2FjaGVOYW1lKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsK0NBQStDO0FBQy9DLFNBQ0UsT0FBTyxRQUlGLDJDQUEwQztBQUVqRCw2REFBNkQsR0FDN0QsT0FBTyxNQUFNO0lBQ1gsT0FBc0I7SUFDdEIsTUFBYTtJQUNiLFFBQWlCLEtBQUssQ0FBQTtJQUNiLHVCQUErQixLQUFJO0lBQ3BDLGdCQUF3QjtJQUVoQyxZQUFZLE9BQTRCLENBQUU7UUFDeEMsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRO1FBQ3RCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNkLENBQUMsUUFBVTtZQUNULElBQUksQ0FBQyxLQUFLLEdBQUc7WUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUk7WUFDakIsSUFBSSxDQUFDLG9CQUFvQjtRQUMzQixHQUNBLElBQU07UUFDSiw0QkFBNEI7UUFDOUI7SUFFSjtJQUVRLHVCQUE2QjtRQUNuQyxJQUFJLENBQUMsZUFBZSxHQUFHLFlBQVksSUFBTTtZQUN2QyxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRztnQkFBRSxTQUFTO1lBQVksR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxHQUFLO2dCQUNqRSxLQUFLLE1BQU0sUUFBUSxNQUFPO29CQUN4QixJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU0sTUFBTSxJQUFJLENBQUMsQ0FBQyxPQUFTO3dCQUNyQyxLQUFLLE1BQU0sT0FBTyxLQUFNOzRCQUN0QixNQUFNLFlBSUYsS0FBSyxLQUFLLENBQUM7NEJBQ2YsTUFBTSxVQUFVLElBQUksT0FBTyxPQUFPLEtBQUssVUFBVSxFQUFFOzRCQUNuRCxJQUFJLFNBQVMsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLFVBQVUsSUFBSSxFQUFFLFVBQVUsR0FBRzt3QkFDN0Q7b0JBQ0Y7Z0JBQ0Y7WUFDRjtRQUNGLEdBQUcsSUFBSSxDQUFDLG9CQUFvQjtJQUM5QjtJQUVBLE1BQU0sY0FBNkI7UUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsTUFBTSxJQUFJLENBQUMsTUFBTTtJQUNwQztJQUVBLE1BQU0sSUFBTyxTQUFpQixFQUFFLEdBQVcsRUFBMEI7UUFDbkUsTUFBTSxJQUFJLENBQUMsV0FBVztRQUN0QixNQUFNLFFBQVEsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssV0FBVztRQUNoRCxJQUFJLFVBQVUsV0FBVztRQUN6QixJQUFJO1lBQ0YsT0FBTyxLQUFLLEtBQUssQ0FBQztRQUNwQixFQUFFLE9BQU8sR0FBRztZQUNWLE9BQU87UUFDVDtJQUNGO0lBRUEsTUFBTSxJQUNKLFNBQWlCLEVBQ2pCLEdBQVcsRUFDWCxLQUFRLEVBQ1IsTUFBZSxFQUNBO1FBQ2YsTUFBTSxJQUFJLENBQUMsV0FBVztRQUN0QixNQUFNLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FDaEIsV0FDQSxLQUNBLE9BQU8sVUFBVSxXQUNiLEtBQUssU0FBUyxDQUFDLFNBQ2QsS0FBK0I7UUFFdEMsSUFBSSxXQUFXLFdBQVc7WUFDeEIsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQ2hCLENBQUMsRUFBRSxVQUFVLFFBQVEsQ0FBQyxFQUN0QixLQUNBLEtBQUssU0FBUyxDQUFDO2dCQUNiLE1BQU07Z0JBQ047Z0JBQ0EsSUFBSSxJQUFJLE9BQU8sT0FBTyxLQUFLO1lBQzdCO1FBRUosQ0FBQztJQUNIO0lBRUEsTUFBTSxPQUFPLFNBQWlCLEVBQUUsR0FBRyxJQUFjLEVBQW9CO1FBQ25FLE1BQU0sSUFBSSxDQUFDLFdBQVc7UUFDdEIsT0FBTyxDQUFDLEFBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLEtBQUssY0FBYyxTQUFVLENBQUMsTUFBTSxLQUFLLE1BQU07SUFDNUU7SUFFQSxNQUFNLE1BQVMsU0FBaUIsRUFBNEI7UUFDMUQsTUFBTSxJQUFJLENBQUMsV0FBVztRQUN0QixNQUFNLE9BQU8sTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU07UUFDckMsT0FBTyxNQUFNLElBQUksQ0FBQyxJQUFjLEtBQUssS0FBSyxDQUFDO0lBQzdDO0lBRUEsTUFBTSxLQUFLLFNBQWlCLEVBQWlDO1FBQzNELE1BQU0sSUFBSSxDQUFDLFdBQVc7UUFDdEIsT0FBTyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU07SUFDM0I7SUFFQSxNQUFNLFlBQVksU0FBaUIsRUFBb0I7UUFDckQsTUFBTSxJQUFJLENBQUMsV0FBVztRQUN0QixPQUFPLEFBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksZUFBZ0I7SUFDaEQ7SUFFQSxNQUFNLEtBQUssU0FBaUIsRUFBK0I7UUFDekQsTUFBTSxJQUFJLENBQUMsV0FBVztRQUN0QixPQUFPLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSztJQUMxQjtBQUNGLENBQUMifQ==