import { Collection } from '../utils/collection.ts';
/** Default Cache Adapter for in-memory caching. */ export class DefaultCacheAdapter {
    // we're using Map here because we don't utilize Collection's methods
    data = new Map();
    get(cacheName, key) {
        return this.data.get(cacheName)?.get(key);
    }
    set(cacheName, key, value, expire) {
        let cache = this.data.get(cacheName);
        if (cache === undefined) {
            cache = new Collection();
            this.data.set(cacheName, cache);
        }
        cache.set(key, value);
        if (expire !== undefined) setTimeout(()=>{
            cache?.delete(key);
        }, expire);
    }
    delete(cacheName, ...keys) {
        const cache = this.data.get(cacheName);
        if (cache === undefined) return false;
        let deleted = true;
        for (const key of keys){
            if (cache.delete(key) === false) deleted = false;
        }
        return deleted;
    }
    array(cacheName) {
        return this.data.get(cacheName)?.array();
    }
    deleteCache(cacheName) {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        return this.data.delete(cacheName);
    }
    size(cacheName, filter) {
        const cache = this.data.get(cacheName);
        if (cache === undefined) return;
        return filter !== undefined ? cache.filter(filter).size : cache.size;
    }
    keys(cacheName) {
        const cache = this.data.get(cacheName);
        if (cache === undefined) return;
        return [
            ...cache.keys()
        ];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2NhY2hlL2RlZmF1bHQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gJy4uL3V0aWxzL2NvbGxlY3Rpb24udHMnXG5pbXBvcnQgdHlwZSB7IElDYWNoZUFkYXB0ZXIgfSBmcm9tICcuL2FkYXB0ZXIudHMnXG5cbi8qKiBEZWZhdWx0IENhY2hlIEFkYXB0ZXIgZm9yIGluLW1lbW9yeSBjYWNoaW5nLiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRDYWNoZUFkYXB0ZXIgaW1wbGVtZW50cyBJQ2FjaGVBZGFwdGVyIHtcbiAgLy8gd2UncmUgdXNpbmcgTWFwIGhlcmUgYmVjYXVzZSB3ZSBkb24ndCB1dGlsaXplIENvbGxlY3Rpb24ncyBtZXRob2RzXG4gIGRhdGEgPSBuZXcgTWFwPHN0cmluZywgQ29sbGVjdGlvbjxzdHJpbmcsIHVua25vd24+PigpXG5cbiAgZ2V0PFQ+KGNhY2hlTmFtZTogc3RyaW5nLCBrZXk6IHN0cmluZyk6IFQgfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmRhdGEuZ2V0KGNhY2hlTmFtZSk/LmdldChrZXkpIGFzIFQgfCB1bmRlZmluZWRcbiAgfVxuXG4gIHNldDxUPihjYWNoZU5hbWU6IHN0cmluZywga2V5OiBzdHJpbmcsIHZhbHVlOiBULCBleHBpcmU/OiBudW1iZXIpOiB2b2lkIHtcbiAgICBsZXQgY2FjaGUgPSB0aGlzLmRhdGEuZ2V0KGNhY2hlTmFtZSlcbiAgICBpZiAoY2FjaGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY2FjaGUgPSBuZXcgQ29sbGVjdGlvbigpXG4gICAgICB0aGlzLmRhdGEuc2V0KGNhY2hlTmFtZSwgY2FjaGUpXG4gICAgfVxuICAgIGNhY2hlLnNldChrZXksIHZhbHVlKVxuICAgIGlmIChleHBpcmUgIT09IHVuZGVmaW5lZClcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjYWNoZT8uZGVsZXRlKGtleSlcbiAgICAgIH0sIGV4cGlyZSlcbiAgfVxuXG4gIGRlbGV0ZShjYWNoZU5hbWU6IHN0cmluZywgLi4ua2V5czogc3RyaW5nW10pOiBib29sZWFuIHtcbiAgICBjb25zdCBjYWNoZSA9IHRoaXMuZGF0YS5nZXQoY2FjaGVOYW1lKVxuICAgIGlmIChjYWNoZSA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2VcbiAgICBsZXQgZGVsZXRlZCA9IHRydWVcbiAgICBmb3IgKGNvbnN0IGtleSBvZiBrZXlzKSB7XG4gICAgICBpZiAoY2FjaGUuZGVsZXRlKGtleSkgPT09IGZhbHNlKSBkZWxldGVkID0gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIGRlbGV0ZWRcbiAgfVxuXG4gIGFycmF5PFQ+KGNhY2hlTmFtZTogc3RyaW5nKTogVFtdIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmdldChjYWNoZU5hbWUpPy5hcnJheSgpIGFzIFRbXSB8IHVuZGVmaW5lZFxuICB9XG5cbiAgZGVsZXRlQ2FjaGUoY2FjaGVOYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWR5bmFtaWMtZGVsZXRlXG4gICAgcmV0dXJuIHRoaXMuZGF0YS5kZWxldGUoY2FjaGVOYW1lKVxuICB9XG5cbiAgc2l6ZTxUPihcbiAgICBjYWNoZU5hbWU6IHN0cmluZyxcbiAgICBmaWx0ZXI/OiAocGF5bG9hZDogVCkgPT4gYm9vbGVhblxuICApOiBudW1iZXIgfCB1bmRlZmluZWQge1xuICAgIGNvbnN0IGNhY2hlID0gdGhpcy5kYXRhLmdldChjYWNoZU5hbWUpXG4gICAgaWYgKGNhY2hlID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIHJldHVybiBmaWx0ZXIgIT09IHVuZGVmaW5lZFxuICAgICAgPyBjYWNoZS5maWx0ZXIoZmlsdGVyIGFzICh2YWx1ZTogdW5rbm93biwga2V5OiBzdHJpbmcpID0+IGJvb2xlYW4pLnNpemVcbiAgICAgIDogY2FjaGUuc2l6ZVxuICB9XG5cbiAga2V5cyhjYWNoZU5hbWU6IHN0cmluZyk6IHN0cmluZ1tdIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBjYWNoZSA9IHRoaXMuZGF0YS5nZXQoY2FjaGVOYW1lKVxuICAgIGlmIChjYWNoZSA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICByZXR1cm4gWy4uLmNhY2hlLmtleXMoKV1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsVUFBVSxRQUFRLHlCQUF3QjtBQUduRCxpREFBaUQsR0FDakQsT0FBTyxNQUFNO0lBQ1gscUVBQXFFO0lBQ3JFLE9BQU8sSUFBSSxNQUEwQztJQUVyRCxJQUFPLFNBQWlCLEVBQUUsR0FBVyxFQUFpQjtRQUNwRCxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSTtJQUN2QztJQUVBLElBQU8sU0FBaUIsRUFBRSxHQUFXLEVBQUUsS0FBUSxFQUFFLE1BQWUsRUFBUTtRQUN0RSxJQUFJLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDMUIsSUFBSSxVQUFVLFdBQVc7WUFDdkIsUUFBUSxJQUFJO1lBQ1osSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVztRQUMzQixDQUFDO1FBQ0QsTUFBTSxHQUFHLENBQUMsS0FBSztRQUNmLElBQUksV0FBVyxXQUNiLFdBQVcsSUFBTTtZQUNmLE9BQU8sT0FBTztRQUNoQixHQUFHO0lBQ1A7SUFFQSxPQUFPLFNBQWlCLEVBQUUsR0FBRyxJQUFjLEVBQVc7UUFDcEQsTUFBTSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQzVCLElBQUksVUFBVSxXQUFXLE9BQU8sS0FBSztRQUNyQyxJQUFJLFVBQVUsSUFBSTtRQUNsQixLQUFLLE1BQU0sT0FBTyxLQUFNO1lBQ3RCLElBQUksTUFBTSxNQUFNLENBQUMsU0FBUyxLQUFLLEVBQUUsVUFBVSxLQUFLO1FBQ2xEO1FBQ0EsT0FBTztJQUNUO0lBRUEsTUFBUyxTQUFpQixFQUFtQjtRQUMzQyxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVk7SUFDbkM7SUFFQSxZQUFZLFNBQWlCLEVBQVc7UUFDdEMsZ0VBQWdFO1FBQ2hFLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7SUFDMUI7SUFFQSxLQUNFLFNBQWlCLEVBQ2pCLE1BQWdDLEVBQ1o7UUFDcEIsTUFBTSxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQzVCLElBQUksVUFBVSxXQUFXO1FBQ3pCLE9BQU8sV0FBVyxZQUNkLE1BQU0sTUFBTSxDQUFDLFFBQW9ELElBQUksR0FDckUsTUFBTSxJQUFJO0lBQ2hCO0lBRUEsS0FBSyxTQUFpQixFQUF3QjtRQUM1QyxNQUFNLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7UUFDNUIsSUFBSSxVQUFVLFdBQVc7UUFDekIsT0FBTztlQUFJLE1BQU0sSUFBSTtTQUFHO0lBQzFCO0FBQ0YsQ0FBQyJ9