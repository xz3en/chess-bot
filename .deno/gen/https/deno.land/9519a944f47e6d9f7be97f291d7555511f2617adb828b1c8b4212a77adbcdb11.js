import { CHANNEL } from '../types/endpoint.ts';
import { BaseManager } from './base.ts';
import { ThreadMember } from '../structures/threadChannel.ts';
export class ThreadMembersManager extends BaseManager {
    constructor(client, thread){
        super(client, `thread_members:${thread.id}`, ThreadMember);
        this.thread = thread;
    }
    async get(id) {
        const res = await this._get(id);
        if (res !== undefined) {
            return new ThreadMember(this.client, res);
        } else return undefined;
    }
    /** Delete a Thread */ async delete(id) {
        return this.client.rest.delete(CHANNEL(typeof id === 'string' ? id : id.id));
    }
    async array() {
        const arr = await this.client.cache.array(this.cacheName);
        if (arr === undefined) return [];
        const result = [];
        for (const elem of arr){
            result.push(new ThreadMember(this.client, elem));
        }
        return result;
    }
    async add(who) {
        await this.thread.addUser(who);
        return this;
    }
    async remove(who) {
        await this.thread.removeUser(who);
        return this;
    }
    thread;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL3RocmVhZE1lbWJlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuaW1wb3J0IHsgVGhyZWFkTWVtYmVyUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzL2NoYW5uZWwudHMnXG5pbXBvcnQgeyBDSEFOTkVMIH0gZnJvbSAnLi4vdHlwZXMvZW5kcG9pbnQudHMnXG5pbXBvcnQgeyBCYXNlTWFuYWdlciB9IGZyb20gJy4vYmFzZS50cydcbmltcG9ydCB7IFRocmVhZENoYW5uZWwsIFRocmVhZE1lbWJlciB9IGZyb20gJy4uL3N0cnVjdHVyZXMvdGhyZWFkQ2hhbm5lbC50cydcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi8uLi9tb2QudHMnXG5cbmV4cG9ydCBjbGFzcyBUaHJlYWRNZW1iZXJzTWFuYWdlciBleHRlbmRzIEJhc2VNYW5hZ2VyPFxuICBUaHJlYWRNZW1iZXJQYXlsb2FkLFxuICBUaHJlYWRNZW1iZXJcbj4ge1xuICBjb25zdHJ1Y3RvcihjbGllbnQ6IENsaWVudCwgcHVibGljIHRocmVhZDogVGhyZWFkQ2hhbm5lbCkge1xuICAgIHN1cGVyKGNsaWVudCwgYHRocmVhZF9tZW1iZXJzOiR7dGhyZWFkLmlkfWAsIFRocmVhZE1lbWJlcilcbiAgfVxuXG4gIGFzeW5jIGdldChpZDogc3RyaW5nKTogUHJvbWlzZTxUaHJlYWRNZW1iZXIgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLl9nZXQoaWQpXG4gICAgaWYgKHJlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gbmV3IFRocmVhZE1lbWJlcih0aGlzLmNsaWVudCwgcmVzKVxuICAgIH0gZWxzZSByZXR1cm4gdW5kZWZpbmVkXG4gIH1cblxuICAvKiogRGVsZXRlIGEgVGhyZWFkICovXG4gIGFzeW5jIGRlbGV0ZShpZDogc3RyaW5nIHwgVGhyZWFkQ2hhbm5lbCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5yZXN0LmRlbGV0ZShDSEFOTkVMKHR5cGVvZiBpZCA9PT0gJ3N0cmluZycgPyBpZCA6IGlkLmlkKSlcbiAgfVxuXG4gIGFzeW5jIGFycmF5KCk6IFByb21pc2U8VGhyZWFkTWVtYmVyW10+IHtcbiAgICBjb25zdCBhcnIgPSBhd2FpdCAodGhpcy5jbGllbnQuY2FjaGUuYXJyYXkoXG4gICAgICB0aGlzLmNhY2hlTmFtZVxuICAgICkgYXMgVGhyZWFkTWVtYmVyUGF5bG9hZFtdKVxuICAgIGlmIChhcnIgPT09IHVuZGVmaW5lZCkgcmV0dXJuIFtdXG4gICAgY29uc3QgcmVzdWx0ID0gW11cbiAgICBmb3IgKGNvbnN0IGVsZW0gb2YgYXJyKSB7XG4gICAgICByZXN1bHQucHVzaChuZXcgVGhyZWFkTWVtYmVyKHRoaXMuY2xpZW50LCBlbGVtKSlcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgYXN5bmMgYWRkKHdobzogc3RyaW5nIHwgVXNlcik6IFByb21pc2U8VGhyZWFkTWVtYmVyc01hbmFnZXI+IHtcbiAgICBhd2FpdCB0aGlzLnRocmVhZC5hZGRVc2VyKHdobylcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgYXN5bmMgcmVtb3ZlKHdobzogc3RyaW5nIHwgVXNlcik6IFByb21pc2U8VGhyZWFkTWVtYmVyc01hbmFnZXI+IHtcbiAgICBhd2FpdCB0aGlzLnRocmVhZC5yZW1vdmVVc2VyKHdobylcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsU0FBUyxPQUFPLFFBQVEsdUJBQXNCO0FBQzlDLFNBQVMsV0FBVyxRQUFRLFlBQVc7QUFDdkMsU0FBd0IsWUFBWSxRQUFRLGlDQUFnQztBQUc1RSxPQUFPLE1BQU0sNkJBQTZCO0lBSXhDLFlBQVksTUFBYyxFQUFTLE9BQXVCO1FBQ3hELEtBQUssQ0FBQyxRQUFRLENBQUMsZUFBZSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRTtzQkFEWjtJQUVuQztJQUVBLE1BQU0sSUFBSSxFQUFVLEVBQXFDO1FBQ3ZELE1BQU0sTUFBTSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDNUIsSUFBSSxRQUFRLFdBQVc7WUFDckIsT0FBTyxJQUFJLGFBQWEsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUN2QyxPQUFPLE9BQU87SUFDaEI7SUFFQSxvQkFBb0IsR0FDcEIsTUFBTSxPQUFPLEVBQTBCLEVBQW9CO1FBQ3pELE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsT0FBTyxPQUFPLFdBQVcsS0FBSyxHQUFHLEVBQUU7SUFDNUU7SUFFQSxNQUFNLFFBQWlDO1FBQ3JDLE1BQU0sTUFBTSxNQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FDeEMsSUFBSSxDQUFDLFNBQVM7UUFFaEIsSUFBSSxRQUFRLFdBQVcsT0FBTyxFQUFFO1FBQ2hDLE1BQU0sU0FBUyxFQUFFO1FBQ2pCLEtBQUssTUFBTSxRQUFRLElBQUs7WUFDdEIsT0FBTyxJQUFJLENBQUMsSUFBSSxhQUFhLElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDNUM7UUFDQSxPQUFPO0lBQ1Q7SUFFQSxNQUFNLElBQUksR0FBa0IsRUFBaUM7UUFDM0QsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztRQUMxQixPQUFPLElBQUk7SUFDYjtJQUVBLE1BQU0sT0FBTyxHQUFrQixFQUFpQztRQUM5RCxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO1FBQzdCLE9BQU8sSUFBSTtJQUNiO0lBcENtQztBQXFDckMsQ0FBQyJ9