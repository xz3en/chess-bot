import { Base } from '../structures/base.ts';
import { Collection } from '../utils/collection.ts';
/**
 * Managers handle caching data. And also some REST Methods as required.
 *
 * You should not be making Managers yourself.
 */ export class BaseManager extends Base {
    /** Caches Name or Key used to differentiate caches */ cacheName;
    /** Which data type does this cache have */ DataType;
    constructor(client, cacheName, DataType){
        super(client);
        this.cacheName = cacheName;
        this.DataType = DataType;
    }
    /** Gets raw value from a cache (payload) */ async _get(key) {
        return this.client.cache.get(this.cacheName, key);
    }
    /** Gets a value from Cache */ async get(key) {
        const raw = await this._get(key);
        if (raw === undefined) return;
        return new this.DataType(this.client, raw);
    }
    /** Sets a value to Cache */ async set(key, value) {
        await this.client.cache.set(this.cacheName, key, value);
    }
    /** Deletes a key from Cache */ async _delete(key) {
        return this.client.cache.delete(this.cacheName, key);
    }
    // any for backward compatibility and args: unknown[] for allowing
    // extending classes to extend number of arguments required.
    async delete(key, ...args) {}
    /** Gets an Array of values from Cache */ async array() {
        let arr = await this.client.cache.array(this.cacheName);
        if (arr === undefined) arr = [];
        return arr.map((e)=>new this.DataType(this.client, e));
    }
    /** Gets a Collection of values from Cache */ async collection() {
        const arr = await this.array();
        if (arr === undefined) return new Collection();
        const collection = new Collection();
        for (const elem of arr){
            // @ts-expect-error
            collection.set(elem.id, elem);
        }
        return collection;
    }
    async *[Symbol.asyncIterator]() {
        for (const data of await this.array() ?? []){
            yield data;
        }
    }
    async fetch(...args) {
        return undefined;
    }
    /** Try to get value from cache, if not found then fetch */ async resolve(key) {
        const cacheValue = await this.get(key);
        if (cacheValue !== undefined) return cacheValue;
        else {
            const fetchValue = await this.fetch(key).catch(()=>undefined);
            if (fetchValue !== undefined) return fetchValue;
        }
    }
    /** Deletes everything from Cache */ async flush() {
        await this.client.cache.deleteCache(this.cacheName);
    }
    /** Gets number of values stored in Cache */ async size() {
        return await this.client.cache.size(this.cacheName) ?? 0;
    }
    /** Gets all keys in the cache (mostly snowflakes) */ async keys() {
        return await this.client.cache.keys(this.cacheName) ?? [];
    }
    [Symbol.for('Deno.customInspect')]() {
        return `Manager(${this.cacheName})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL2Jhc2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuaW1wb3J0IHsgQmFzZSB9IGZyb20gJy4uL3N0cnVjdHVyZXMvYmFzZS50cydcbmltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tICcuLi91dGlscy9jb2xsZWN0aW9uLnRzJ1xuXG4vLyB1bmtub3duIGRvZXMgbm90IHdvcmsgaGVyZS5cbnR5cGUgVERhdGFUeXBlPFQsIFQyPiA9IG5ldyAoY2xpZW50OiBDbGllbnQsIHJhdzogVCwgLi4uYXJnczogYW55W10pID0+IFQyXG5cbi8qKlxuICogTWFuYWdlcnMgaGFuZGxlIGNhY2hpbmcgZGF0YS4gQW5kIGFsc28gc29tZSBSRVNUIE1ldGhvZHMgYXMgcmVxdWlyZWQuXG4gKlxuICogWW91IHNob3VsZCBub3QgYmUgbWFraW5nIE1hbmFnZXJzIHlvdXJzZWxmLlxuICovXG5leHBvcnQgY2xhc3MgQmFzZU1hbmFnZXI8VCwgVDI+IGV4dGVuZHMgQmFzZSB7XG4gIC8qKiBDYWNoZXMgTmFtZSBvciBLZXkgdXNlZCB0byBkaWZmZXJlbnRpYXRlIGNhY2hlcyAqL1xuICBjYWNoZU5hbWU6IHN0cmluZ1xuICAvKiogV2hpY2ggZGF0YSB0eXBlIGRvZXMgdGhpcyBjYWNoZSBoYXZlICovXG4gIERhdGFUeXBlOiBURGF0YVR5cGU8VCwgVDI+XG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQsIGNhY2hlTmFtZTogc3RyaW5nLCBEYXRhVHlwZTogVERhdGFUeXBlPFQsIFQyPikge1xuICAgIHN1cGVyKGNsaWVudClcbiAgICB0aGlzLmNhY2hlTmFtZSA9IGNhY2hlTmFtZVxuICAgIHRoaXMuRGF0YVR5cGUgPSBEYXRhVHlwZVxuICB9XG5cbiAgLyoqIEdldHMgcmF3IHZhbHVlIGZyb20gYSBjYWNoZSAocGF5bG9hZCkgKi9cbiAgYXN5bmMgX2dldChrZXk6IHN0cmluZyk6IFByb21pc2U8VCB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5jYWNoZS5nZXQodGhpcy5jYWNoZU5hbWUsIGtleSlcbiAgfVxuXG4gIC8qKiBHZXRzIGEgdmFsdWUgZnJvbSBDYWNoZSAqL1xuICBhc3luYyBnZXQoa2V5OiBzdHJpbmcpOiBQcm9taXNlPFQyIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgdGhpcy5fZ2V0KGtleSlcbiAgICBpZiAocmF3ID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIHJldHVybiBuZXcgdGhpcy5EYXRhVHlwZSh0aGlzLmNsaWVudCwgcmF3KVxuICB9XG5cbiAgLyoqIFNldHMgYSB2YWx1ZSB0byBDYWNoZSAqL1xuICBhc3luYyBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBUKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jbGllbnQuY2FjaGUuc2V0KHRoaXMuY2FjaGVOYW1lLCBrZXksIHZhbHVlKVxuICB9XG5cbiAgLyoqIERlbGV0ZXMgYSBrZXkgZnJvbSBDYWNoZSAqL1xuICBhc3luYyBfZGVsZXRlKGtleTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50LmNhY2hlLmRlbGV0ZSh0aGlzLmNhY2hlTmFtZSwga2V5KVxuICB9XG5cbiAgLy8gYW55IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IGFuZCBhcmdzOiB1bmtub3duW10gZm9yIGFsbG93aW5nXG4gIC8vIGV4dGVuZGluZyBjbGFzc2VzIHRvIGV4dGVuZCBudW1iZXIgb2YgYXJndW1lbnRzIHJlcXVpcmVkLlxuICBhc3luYyBkZWxldGUoa2V5OiBzdHJpbmcsIC4uLmFyZ3M6IHVua25vd25bXSk6IFByb21pc2U8YW55PiB7fVxuXG4gIC8qKiBHZXRzIGFuIEFycmF5IG9mIHZhbHVlcyBmcm9tIENhY2hlICovXG4gIGFzeW5jIGFycmF5KCk6IFByb21pc2U8VDJbXT4ge1xuICAgIGxldCBhcnIgPSBhd2FpdCAodGhpcy5jbGllbnQuY2FjaGUuYXJyYXkodGhpcy5jYWNoZU5hbWUpIGFzIFRbXSlcbiAgICBpZiAoYXJyID09PSB1bmRlZmluZWQpIGFyciA9IFtdXG4gICAgcmV0dXJuIGFyci5tYXAoKGUpID0+IG5ldyB0aGlzLkRhdGFUeXBlKHRoaXMuY2xpZW50LCBlKSlcbiAgfVxuXG4gIC8qKiBHZXRzIGEgQ29sbGVjdGlvbiBvZiB2YWx1ZXMgZnJvbSBDYWNoZSAqL1xuICBhc3luYyBjb2xsZWN0aW9uKCk6IFByb21pc2U8Q29sbGVjdGlvbjxzdHJpbmcsIFQyPj4ge1xuICAgIGNvbnN0IGFyciA9IGF3YWl0IHRoaXMuYXJyYXkoKVxuICAgIGlmIChhcnIgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG5ldyBDb2xsZWN0aW9uKClcbiAgICBjb25zdCBjb2xsZWN0aW9uID0gbmV3IENvbGxlY3Rpb24oKVxuICAgIGZvciAoY29uc3QgZWxlbSBvZiBhcnIpIHtcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3JcbiAgICAgIGNvbGxlY3Rpb24uc2V0KGVsZW0uaWQsIGVsZW0pXG4gICAgfVxuICAgIHJldHVybiBjb2xsZWN0aW9uXG4gIH1cblxuICBhc3luYyAqW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8VDI+IHtcbiAgICBmb3IgKGNvbnN0IGRhdGEgb2YgKGF3YWl0IHRoaXMuYXJyYXkoKSkgPz8gW10pIHtcbiAgICAgIHlpZWxkIGRhdGFcbiAgICB9XG4gIH1cblxuICBhc3luYyBmZXRjaCguLi5hcmdzOiB1bmtub3duW10pOiBQcm9taXNlPFQyIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG5cbiAgLyoqIFRyeSB0byBnZXQgdmFsdWUgZnJvbSBjYWNoZSwgaWYgbm90IGZvdW5kIHRoZW4gZmV0Y2ggKi9cbiAgYXN5bmMgcmVzb2x2ZShrZXk6IHN0cmluZyk6IFByb21pc2U8VDIgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBjYWNoZVZhbHVlID0gYXdhaXQgdGhpcy5nZXQoa2V5KVxuICAgIGlmIChjYWNoZVZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBjYWNoZVZhbHVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBmZXRjaFZhbHVlID0gYXdhaXQgdGhpcy5mZXRjaChrZXkpLmNhdGNoKCgpID0+IHVuZGVmaW5lZClcbiAgICAgIGlmIChmZXRjaFZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBmZXRjaFZhbHVlXG4gICAgfVxuICB9XG5cbiAgLyoqIERlbGV0ZXMgZXZlcnl0aGluZyBmcm9tIENhY2hlICovXG4gIGFzeW5jIGZsdXNoKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuY2xpZW50LmNhY2hlLmRlbGV0ZUNhY2hlKHRoaXMuY2FjaGVOYW1lKVxuICB9XG5cbiAgLyoqIEdldHMgbnVtYmVyIG9mIHZhbHVlcyBzdG9yZWQgaW4gQ2FjaGUgKi9cbiAgYXN5bmMgc2l6ZSgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5jbGllbnQuY2FjaGUuc2l6ZSh0aGlzLmNhY2hlTmFtZSkpID8/IDBcbiAgfVxuXG4gIC8qKiBHZXRzIGFsbCBrZXlzIGluIHRoZSBjYWNoZSAobW9zdGx5IHNub3dmbGFrZXMpICovXG4gIGFzeW5jIGtleXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHJldHVybiAoYXdhaXQgdGhpcy5jbGllbnQuY2FjaGUua2V5cyh0aGlzLmNhY2hlTmFtZSkpID8/IFtdXG4gIH1cblxuICBbU3ltYm9sLmZvcignRGVuby5jdXN0b21JbnNwZWN0JyldKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIGBNYW5hZ2VyKCR7dGhpcy5jYWNoZU5hbWV9KWBcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsSUFBSSxRQUFRLHdCQUF1QjtBQUM1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