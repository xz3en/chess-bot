import { Base } from '../structures/base.ts';
import { Collection } from '../utils/collection.ts';
/** Child Managers validate data from their parents i.e. from Managers */ export class BaseChildManager extends Base {
    /** Parent Manager */ parent;
    constructor(client, parent){
        super(client);
        this.parent = parent;
    }
    get cacheName() {
        return typeof this.parent === 'undefined' ? 'unknown_parent' : this.parent.cacheName;
    }
    async get(key) {
        return this.parent.get(key);
    }
    async set(key, value) {
        return this.parent.set(key, value);
    }
    async delete(_) {
        return false;
    }
    async array() {
        return this.parent.array();
    }
    async collection() {
        const arr = await this.array();
        if (arr === undefined) return new Collection();
        const collection = new Collection();
        for (const elem of arr){
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
        return this.parent.fetch(...args);
    }
    /** Try to get value from cache, if not found then fetch */ async resolve(key) {
        const cacheValue = await this.get(key);
        if (cacheValue !== undefined) return cacheValue;
        else {
            const fetchValue = await this.fetch(key).catch(()=>undefined);
            if (fetchValue !== undefined) return fetchValue;
        }
    }
    /** Gets number of values stored in Cache */ async size() {
        return this.parent.size();
    }
    async keys() {
        return this.parent.keys();
    }
    [Symbol.for('Deno.customInspect')]() {
        return `ChildManager(${this.cacheName})`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL2Jhc2VDaGlsZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgeyBCYXNlIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9iYXNlLnRzJ1xuaW1wb3J0IHsgQ29sbGVjdGlvbiB9IGZyb20gJy4uL3V0aWxzL2NvbGxlY3Rpb24udHMnXG5pbXBvcnQgeyBCYXNlTWFuYWdlciB9IGZyb20gJy4vYmFzZS50cydcblxuLyoqIENoaWxkIE1hbmFnZXJzIHZhbGlkYXRlIGRhdGEgZnJvbSB0aGVpciBwYXJlbnRzIGkuZS4gZnJvbSBNYW5hZ2VycyAqL1xuZXhwb3J0IGNsYXNzIEJhc2VDaGlsZE1hbmFnZXI8VCwgVDI+IGV4dGVuZHMgQmFzZSB7XG4gIC8qKiBQYXJlbnQgTWFuYWdlciAqL1xuICBwYXJlbnQ6IEJhc2VNYW5hZ2VyPFQsIFQyPlxuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50LCBwYXJlbnQ6IEJhc2VNYW5hZ2VyPFQsIFQyPikge1xuICAgIHN1cGVyKGNsaWVudClcbiAgICB0aGlzLnBhcmVudCA9IHBhcmVudFxuICB9XG5cbiAgZ2V0IGNhY2hlTmFtZSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0eXBlb2YgdGhpcy5wYXJlbnQgPT09ICd1bmRlZmluZWQnXG4gICAgICA/ICd1bmtub3duX3BhcmVudCdcbiAgICAgIDogdGhpcy5wYXJlbnQuY2FjaGVOYW1lXG4gIH1cblxuICBhc3luYyBnZXQoa2V5OiBzdHJpbmcpOiBQcm9taXNlPFQyIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50LmdldChrZXkpXG4gIH1cblxuICBhc3luYyBzZXQoa2V5OiBzdHJpbmcsIHZhbHVlOiBUKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50LnNldChrZXksIHZhbHVlKVxuICB9XG5cbiAgYXN5bmMgZGVsZXRlKF86IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG5cbiAgYXN5bmMgYXJyYXkoKTogUHJvbWlzZTxUMltdPiB7XG4gICAgcmV0dXJuIHRoaXMucGFyZW50LmFycmF5KClcbiAgfVxuXG4gIGFzeW5jIGNvbGxlY3Rpb24oKTogUHJvbWlzZTxDb2xsZWN0aW9uPHN0cmluZywgVDI+PiB7XG4gICAgY29uc3QgYXJyID0gKGF3YWl0IHRoaXMuYXJyYXkoKSkgYXMgdW5kZWZpbmVkIHwgVDJbXVxuICAgIGlmIChhcnIgPT09IHVuZGVmaW5lZCkgcmV0dXJuIG5ldyBDb2xsZWN0aW9uKClcbiAgICBjb25zdCBjb2xsZWN0aW9uID0gbmV3IENvbGxlY3Rpb24oKVxuICAgIGZvciAoY29uc3QgZWxlbSBvZiBhcnIpIHtcbiAgICAgIGNvbGxlY3Rpb24uc2V0KChlbGVtIGFzIHVua25vd24gYXMgeyBpZDogc3RyaW5nIH0pLmlkLCBlbGVtKVxuICAgIH1cbiAgICByZXR1cm4gY29sbGVjdGlvblxuICB9XG5cbiAgYXN5bmMgKltTeW1ib2wuYXN5bmNJdGVyYXRvcl0oKTogQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPFQyPiB7XG4gICAgZm9yIChjb25zdCBkYXRhIG9mIChhd2FpdCB0aGlzLmFycmF5KCkpID8/IFtdKSB7XG4gICAgICB5aWVsZCBkYXRhXG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZmV0Y2goLi4uYXJnczogdW5rbm93bltdKTogUHJvbWlzZTxUMiB8IHVuZGVmaW5lZD4ge1xuICAgIHJldHVybiB0aGlzLnBhcmVudC5mZXRjaCguLi5hcmdzKVxuICB9XG5cbiAgLyoqIFRyeSB0byBnZXQgdmFsdWUgZnJvbSBjYWNoZSwgaWYgbm90IGZvdW5kIHRoZW4gZmV0Y2ggKi9cbiAgYXN5bmMgcmVzb2x2ZShrZXk6IHN0cmluZyk6IFByb21pc2U8VDIgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBjYWNoZVZhbHVlID0gYXdhaXQgdGhpcy5nZXQoa2V5KVxuICAgIGlmIChjYWNoZVZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBjYWNoZVZhbHVlXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBmZXRjaFZhbHVlID0gYXdhaXQgdGhpcy5mZXRjaChrZXkpLmNhdGNoKCgpID0+IHVuZGVmaW5lZClcbiAgICAgIGlmIChmZXRjaFZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBmZXRjaFZhbHVlXG4gICAgfVxuICB9XG5cbiAgLyoqIEdldHMgbnVtYmVyIG9mIHZhbHVlcyBzdG9yZWQgaW4gQ2FjaGUgKi9cbiAgYXN5bmMgc2l6ZSgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIHJldHVybiB0aGlzLnBhcmVudC5zaXplKClcbiAgfVxuXG4gIGFzeW5jIGtleXMoKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuICAgIHJldHVybiB0aGlzLnBhcmVudC5rZXlzKClcbiAgfVxuXG4gIFtTeW1ib2wuZm9yKCdEZW5vLmN1c3RvbUluc3BlY3QnKV0oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gYENoaWxkTWFuYWdlcigke3RoaXMuY2FjaGVOYW1lfSlgXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLElBQUksUUFBUSx3QkFBdUI7QUFDNUMsU0FBUyxVQUFVLFFBQVEseUJBQXdCO0FBR25ELHVFQUF1RSxHQUN2RSxPQUFPLE1BQU0seUJBQWdDO0lBQzNDLG1CQUFtQixHQUNuQixPQUEwQjtJQUUxQixZQUFZLE1BQWMsRUFBRSxNQUEwQixDQUFFO1FBQ3RELEtBQUssQ0FBQztRQUNOLElBQUksQ0FBQyxNQUFNLEdBQUc7SUFDaEI7SUFFQSxJQUFJLFlBQW9CO1FBQ3RCLE9BQU8sT0FBTyxJQUFJLENBQUMsTUFBTSxLQUFLLGNBQzFCLG1CQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUztJQUMzQjtJQUVBLE1BQU0sSUFBSSxHQUFXLEVBQTJCO1FBQzlDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUM7SUFDekI7SUFFQSxNQUFNLElBQUksR0FBVyxFQUFFLEtBQVEsRUFBaUI7UUFDOUMsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLO0lBQzlCO0lBRUEsTUFBTSxPQUFPLENBQVMsRUFBb0I7UUFDeEMsT0FBTyxLQUFLO0lBQ2Q7SUFFQSxNQUFNLFFBQXVCO1FBQzNCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO0lBQzFCO0lBRUEsTUFBTSxhQUE4QztRQUNsRCxNQUFNLE1BQU8sTUFBTSxJQUFJLENBQUMsS0FBSztRQUM3QixJQUFJLFFBQVEsV0FBVyxPQUFPLElBQUk7UUFDbEMsTUFBTSxhQUFhLElBQUk7UUFDdkIsS0FBSyxNQUFNLFFBQVEsSUFBSztZQUN0QixXQUFXLEdBQUcsQ0FBQyxBQUFDLEtBQW1DLEVBQUUsRUFBRTtRQUN6RDtRQUNBLE9BQU87SUFDVDtJQUVBLE9BQU8sQ0FBQyxPQUFPLGFBQWEsQ0FBQyxHQUE4QjtRQUN6RCxLQUFLLE1BQU0sUUFBUSxBQUFDLE1BQU0sSUFBSSxDQUFDLEtBQUssTUFBTyxFQUFFLENBQUU7WUFDN0MsTUFBTTtRQUNSO0lBQ0Y7SUFFQSxNQUFNLE1BQU0sR0FBRyxJQUFlLEVBQTJCO1FBQ3ZELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUk7SUFDOUI7SUFFQSx5REFBeUQsR0FDekQsTUFBTSxRQUFRLEdBQVcsRUFBMkI7UUFDbEQsTUFBTSxhQUFhLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQztRQUNsQyxJQUFJLGVBQWUsV0FBVyxPQUFPO2FBQ2hDO1lBQ0gsTUFBTSxhQUFhLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxJQUFNO1lBQ3JELElBQUksZUFBZSxXQUFXLE9BQU87UUFDdkMsQ0FBQztJQUNIO0lBRUEsMENBQTBDLEdBQzFDLE1BQU0sT0FBd0I7UUFDNUIsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUk7SUFDekI7SUFFQSxNQUFNLE9BQTBCO1FBQzlCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJO0lBQ3pCO0lBRUEsQ0FBQyxPQUFPLEdBQUcsQ0FBQyxzQkFBc0IsR0FBVztRQUMzQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQzFDO0FBQ0YsQ0FBQyJ9