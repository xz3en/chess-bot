import { Mixin } from '../../deps.ts';
import { TextChannel } from './textChannel.ts';
import { GuildChannel } from './channel.ts';
import { CHANNEL } from '../types/endpoint.ts';
import { GuildThreadAvailableChannel } from './guildThreadAvailableChannel.ts';
/** Represents a Text Channel but in a Guild */ export class GuildTextBasedChannel extends Mixin(TextChannel, GuildChannel) {
    constructor(client, data, guild){
        super(client, data, guild);
        this.readFromData(data);
    }
    readFromData(data) {
        super.readFromData(data);
    }
    /** Edit the Guild Text Channel */ async edit(options) {
        const body = {
            name: options?.name,
            position: options?.position,
            permission_overwrites: options?.permissionOverwrites,
            parent_id: options?.parentID,
            nsfw: options?.nsfw
        };
        const resp = await this.client.rest.patch(CHANNEL(this.id), body);
        return new GuildTextBasedChannel(this.client, resp, this.guild);
    }
    /**
   * Bulk Delete Messages in a Guild Text Channel
   * @param messages Messages to delete. Can be a number, or Array of Message or IDs
   */ async bulkDelete(messages) {
        let ids = [];
        if (Array.isArray(messages)) ids = messages.map((e)=>typeof e === 'string' ? e : e.id);
        else {
            let list = await this.messages.array();
            if (list.length < messages) list = (await this.fetchMessages()).array();
            ids = list.sort((b, a)=>a.createdAt.getTime() - b.createdAt.getTime()).filter((e, i)=>i < messages).filter((e)=>new Date().getTime() - e.createdAt.getTime() <= 1000 * 60 * 60 * 24 * 14).map((e)=>e.id);
        }
        ids = [
            ...new Set(ids)
        ];
        if (ids.length < 2 || ids.length > 100) throw new Error('bulkDelete can only delete messages in range 2-100');
        await this.client.rest.api.channels[this.id].messages['bulk-delete'].post({
            messages: ids
        });
        return this;
    }
}
// Still exist for API compatibility
export class GuildTextChannel extends Mixin(GuildTextBasedChannel, GuildThreadAvailableChannel) {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvZ3VpbGRUZXh0Q2hhbm5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNaXhpbiB9IGZyb20gJy4uLy4uL2RlcHMudHMnXG5pbXBvcnQgeyBUZXh0Q2hhbm5lbCB9IGZyb20gJy4vdGV4dENoYW5uZWwudHMnXG5pbXBvcnQgeyBHdWlsZENoYW5uZWwgfSBmcm9tICcuL2NoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgdHlwZSB7XG4gIEd1aWxkVGV4dEJhc2VkQ2hhbm5lbFBheWxvYWQsXG4gIE1vZGlmeUd1aWxkVGV4dEJhc2VkQ2hhbm5lbE9wdGlvbixcbiAgTW9kaWZ5R3VpbGRUZXh0QmFzZWRDaGFubmVsUGF5bG9hZFxufSBmcm9tICcuLi90eXBlcy9jaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBHdWlsZCB9IGZyb20gJy4vZ3VpbGQudHMnXG5pbXBvcnQgeyBDSEFOTkVMIH0gZnJvbSAnLi4vdHlwZXMvZW5kcG9pbnQudHMnXG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2UgfSBmcm9tICcuL21lc3NhZ2UudHMnXG5pbXBvcnQgeyBHdWlsZFRocmVhZEF2YWlsYWJsZUNoYW5uZWwgfSBmcm9tICcuL2d1aWxkVGhyZWFkQXZhaWxhYmxlQ2hhbm5lbC50cydcblxuLyoqIFJlcHJlc2VudHMgYSBUZXh0IENoYW5uZWwgYnV0IGluIGEgR3VpbGQgKi9cbmV4cG9ydCBjbGFzcyBHdWlsZFRleHRCYXNlZENoYW5uZWwgZXh0ZW5kcyBNaXhpbihUZXh0Q2hhbm5lbCwgR3VpbGRDaGFubmVsKSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgIGNsaWVudDogQ2xpZW50LFxuICAgIGRhdGE6IEd1aWxkVGV4dEJhc2VkQ2hhbm5lbFBheWxvYWQsXG4gICAgZ3VpbGQ6IEd1aWxkXG4gICkge1xuICAgIHN1cGVyKGNsaWVudCwgZGF0YSwgZ3VpbGQpXG4gICAgdGhpcy5yZWFkRnJvbURhdGEoZGF0YSlcbiAgfVxuXG4gIHJlYWRGcm9tRGF0YShkYXRhOiBHdWlsZFRleHRCYXNlZENoYW5uZWxQYXlsb2FkKTogdm9pZCB7XG4gICAgc3VwZXIucmVhZEZyb21EYXRhKGRhdGEpXG4gIH1cblxuICAvKiogRWRpdCB0aGUgR3VpbGQgVGV4dCBDaGFubmVsICovXG4gIGFzeW5jIGVkaXQoXG4gICAgb3B0aW9ucz86IE1vZGlmeUd1aWxkVGV4dEJhc2VkQ2hhbm5lbE9wdGlvblxuICApOiBQcm9taXNlPEd1aWxkVGV4dEJhc2VkQ2hhbm5lbD4ge1xuICAgIGNvbnN0IGJvZHk6IE1vZGlmeUd1aWxkVGV4dEJhc2VkQ2hhbm5lbFBheWxvYWQgPSB7XG4gICAgICBuYW1lOiBvcHRpb25zPy5uYW1lLFxuICAgICAgcG9zaXRpb246IG9wdGlvbnM/LnBvc2l0aW9uLFxuICAgICAgcGVybWlzc2lvbl9vdmVyd3JpdGVzOiBvcHRpb25zPy5wZXJtaXNzaW9uT3ZlcndyaXRlcyxcbiAgICAgIHBhcmVudF9pZDogb3B0aW9ucz8ucGFyZW50SUQsXG4gICAgICBuc2Z3OiBvcHRpb25zPy5uc2Z3XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcCA9IGF3YWl0IHRoaXMuY2xpZW50LnJlc3QucGF0Y2goQ0hBTk5FTCh0aGlzLmlkKSwgYm9keSlcblxuICAgIHJldHVybiBuZXcgR3VpbGRUZXh0QmFzZWRDaGFubmVsKHRoaXMuY2xpZW50LCByZXNwLCB0aGlzLmd1aWxkKVxuICB9XG5cbiAgLyoqXG4gICAqIEJ1bGsgRGVsZXRlIE1lc3NhZ2VzIGluIGEgR3VpbGQgVGV4dCBDaGFubmVsXG4gICAqIEBwYXJhbSBtZXNzYWdlcyBNZXNzYWdlcyB0byBkZWxldGUuIENhbiBiZSBhIG51bWJlciwgb3IgQXJyYXkgb2YgTWVzc2FnZSBvciBJRHNcbiAgICovXG4gIGFzeW5jIGJ1bGtEZWxldGUoXG4gICAgbWVzc2FnZXM6IEFycmF5PE1lc3NhZ2UgfCBzdHJpbmc+IHwgbnVtYmVyXG4gICk6IFByb21pc2U8R3VpbGRUZXh0QmFzZWRDaGFubmVsPiB7XG4gICAgbGV0IGlkczogc3RyaW5nW10gPSBbXVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkobWVzc2FnZXMpKVxuICAgICAgaWRzID0gbWVzc2FnZXMubWFwKChlKSA9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnID8gZSA6IGUuaWQpKVxuICAgIGVsc2Uge1xuICAgICAgbGV0IGxpc3QgPSBhd2FpdCB0aGlzLm1lc3NhZ2VzLmFycmF5KClcbiAgICAgIGlmIChsaXN0Lmxlbmd0aCA8IG1lc3NhZ2VzKSBsaXN0ID0gKGF3YWl0IHRoaXMuZmV0Y2hNZXNzYWdlcygpKS5hcnJheSgpXG4gICAgICBpZHMgPSBsaXN0XG4gICAgICAgIC5zb3J0KChiLCBhKSA9PiBhLmNyZWF0ZWRBdC5nZXRUaW1lKCkgLSBiLmNyZWF0ZWRBdC5nZXRUaW1lKCkpXG4gICAgICAgIC5maWx0ZXIoKGUsIGkpID0+IGkgPCBtZXNzYWdlcylcbiAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAoZSkgPT5cbiAgICAgICAgICAgIG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gZS5jcmVhdGVkQXQuZ2V0VGltZSgpIDw9XG4gICAgICAgICAgICAxMDAwICogNjAgKiA2MCAqIDI0ICogMTRcbiAgICAgICAgKVxuICAgICAgICAubWFwKChlKSA9PiBlLmlkKVxuICAgIH1cblxuICAgIGlkcyA9IFsuLi5uZXcgU2V0KGlkcyldXG4gICAgaWYgKGlkcy5sZW5ndGggPCAyIHx8IGlkcy5sZW5ndGggPiAxMDApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2J1bGtEZWxldGUgY2FuIG9ubHkgZGVsZXRlIG1lc3NhZ2VzIGluIHJhbmdlIDItMTAwJylcblxuICAgIGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuYXBpLmNoYW5uZWxzW3RoaXMuaWRdLm1lc3NhZ2VzWydidWxrLWRlbGV0ZSddLnBvc3Qoe1xuICAgICAgbWVzc2FnZXM6IGlkc1xuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG5cbi8vIFN0aWxsIGV4aXN0IGZvciBBUEkgY29tcGF0aWJpbGl0eVxuZXhwb3J0IGNsYXNzIEd1aWxkVGV4dENoYW5uZWwgZXh0ZW5kcyBNaXhpbihcbiAgR3VpbGRUZXh0QmFzZWRDaGFubmVsLFxuICBHdWlsZFRocmVhZEF2YWlsYWJsZUNoYW5uZWxcbikge31cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLEtBQUssUUFBUSxnQkFBZTtBQUNyQyxTQUFTLFdBQVcsUUFBUSxtQkFBa0I7QUFDOUMsU0FBUyxZQUFZLFFBQVEsZUFBYztBQVEzQyxTQUFTLE9BQU8sUUFBUSx1QkFBc0I7QUFFOUMsU0FBUywyQkFBMkIsUUFBUSxtQ0FBa0M7QUFFOUUsNkNBQTZDLEdBQzdDLE9BQU8sTUFBTSw4QkFBOEIsTUFBTSxhQUFhO0lBQzVELFlBQ0UsTUFBYyxFQUNkLElBQWtDLEVBQ2xDLEtBQVksQ0FDWjtRQUNBLEtBQUssQ0FBQyxRQUFRLE1BQU07UUFDcEIsSUFBSSxDQUFDLFlBQVksQ0FBQztJQUNwQjtJQUVBLGFBQWEsSUFBa0MsRUFBUTtRQUNyRCxLQUFLLENBQUMsWUFBWSxDQUFDO0lBQ3JCO0lBRUEsZ0NBQWdDLEdBQ2hDLE1BQU0sS0FDSixPQUEyQyxFQUNYO1FBQ2hDLE1BQU0sT0FBMkM7WUFDL0MsTUFBTSxTQUFTO1lBQ2YsVUFBVSxTQUFTO1lBQ25CLHVCQUF1QixTQUFTO1lBQ2hDLFdBQVcsU0FBUztZQUNwQixNQUFNLFNBQVM7UUFDakI7UUFFQSxNQUFNLE9BQU8sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxJQUFJLENBQUMsRUFBRSxHQUFHO1FBRTVELE9BQU8sSUFBSSxzQkFBc0IsSUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQyxLQUFLO0lBQ2hFO0lBRUE7OztHQUdDLEdBQ0QsTUFBTSxXQUNKLFFBQTBDLEVBQ1Y7UUFDaEMsSUFBSSxNQUFnQixFQUFFO1FBRXRCLElBQUksTUFBTSxPQUFPLENBQUMsV0FDaEIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLElBQU8sT0FBTyxNQUFNLFdBQVcsSUFBSSxFQUFFLEVBQUU7YUFDeEQ7WUFDSCxJQUFJLE9BQU8sTUFBTSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUs7WUFDcEMsSUFBSSxLQUFLLE1BQU0sR0FBRyxVQUFVLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxhQUFhLEVBQUUsRUFBRSxLQUFLO1lBQ3JFLE1BQU0sS0FDSCxJQUFJLENBQUMsQ0FBQyxHQUFHLElBQU0sRUFBRSxTQUFTLENBQUMsT0FBTyxLQUFLLEVBQUUsU0FBUyxDQUFDLE9BQU8sSUFDMUQsTUFBTSxDQUFDLENBQUMsR0FBRyxJQUFNLElBQUksVUFDckIsTUFBTSxDQUNMLENBQUMsSUFDQyxJQUFJLE9BQU8sT0FBTyxLQUFLLEVBQUUsU0FBUyxDQUFDLE9BQU8sTUFDMUMsT0FBTyxLQUFLLEtBQUssS0FBSyxJQUV6QixHQUFHLENBQUMsQ0FBQyxJQUFNLEVBQUUsRUFBRTtRQUNwQixDQUFDO1FBRUQsTUFBTTtlQUFJLElBQUksSUFBSTtTQUFLO1FBQ3ZCLElBQUksSUFBSSxNQUFNLEdBQUcsS0FBSyxJQUFJLE1BQU0sR0FBRyxLQUNqQyxNQUFNLElBQUksTUFBTSxzREFBcUQ7UUFFdkUsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQztZQUN4RSxVQUFVO1FBQ1o7UUFFQSxPQUFPLElBQUk7SUFDYjtBQUNGLENBQUM7QUFFRCxvQ0FBb0M7QUFDcEMsT0FBTyxNQUFNLHlCQUF5QixNQUNwQyx1QkFDQTtBQUNDLENBQUMifQ==