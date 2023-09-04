import { Emoji } from '../structures/emoji.ts';
import { GUILD_EMOJI } from '../types/endpoint.ts';
import { BaseManager } from './base.ts';
export class EmojisManager extends BaseManager {
    constructor(client){
        super(client, `emojis`, Emoji);
    }
    async get(key) {
        const raw = await this._get(key);
        if (raw === undefined) return;
        const emoji = new this.DataType(this.client, raw);
        if (raw.guild_id !== undefined) {
            const guild = await this.client.guilds.get(raw.guild_id);
            if (guild !== undefined) emoji.guild = guild;
        }
        return emoji;
    }
    /** Fetches an Emoji by Guild ID and Emoji ID, cache it and resolve it */ async fetch(guildID, id) {
        return await new Promise((resolve, reject)=>{
            this.client.rest.get(GUILD_EMOJI(guildID, id)).then(async (data)=>{
                await this.set(id, data);
                resolve(new Emoji(this.client, data));
            }).catch((e)=>reject(e));
        });
    }
    /** Try to get Emoji from cache, if not found then fetch */ async resolve(key, guild) {
        const cacheValue = await this.get(key);
        if (cacheValue !== undefined) return cacheValue;
        else {
            if (guild !== undefined) {
                const guildID = typeof guild === 'string' ? guild : guild.id;
                const fetchValue = await this.fetch(guildID, key).catch(()=>undefined);
                if (fetchValue !== undefined) return fetchValue;
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL2Vtb2ppcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEd1aWxkIH0gZnJvbSAnLi4vLi4vbW9kLnRzJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuaW1wb3J0IHsgRW1vamkgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2Vtb2ppLnRzJ1xuaW1wb3J0IHR5cGUgeyBFbW9qaVBheWxvYWQgfSBmcm9tICcuLi90eXBlcy9lbW9qaS50cydcbmltcG9ydCB7IEdVSUxEX0VNT0pJIH0gZnJvbSAnLi4vdHlwZXMvZW5kcG9pbnQudHMnXG5pbXBvcnQgeyBCYXNlTWFuYWdlciB9IGZyb20gJy4vYmFzZS50cydcblxuZXhwb3J0IGNsYXNzIEVtb2ppc01hbmFnZXIgZXh0ZW5kcyBCYXNlTWFuYWdlcjxFbW9qaVBheWxvYWQsIEVtb2ppPiB7XG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50KSB7XG4gICAgc3VwZXIoY2xpZW50LCBgZW1vamlzYCwgRW1vamkpXG4gIH1cblxuICBhc3luYyBnZXQoa2V5OiBzdHJpbmcpOiBQcm9taXNlPEVtb2ppIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgdGhpcy5fZ2V0KGtleSlcbiAgICBpZiAocmF3ID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIGNvbnN0IGVtb2ppID0gbmV3IHRoaXMuRGF0YVR5cGUodGhpcy5jbGllbnQsIHJhdylcbiAgICBpZiAocmF3Lmd1aWxkX2lkICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IGd1aWxkID0gYXdhaXQgdGhpcy5jbGllbnQuZ3VpbGRzLmdldChyYXcuZ3VpbGRfaWQpXG4gICAgICBpZiAoZ3VpbGQgIT09IHVuZGVmaW5lZCkgZW1vamkuZ3VpbGQgPSBndWlsZFxuICAgIH1cbiAgICByZXR1cm4gZW1vamlcbiAgfVxuXG4gIC8qKiBGZXRjaGVzIGFuIEVtb2ppIGJ5IEd1aWxkIElEIGFuZCBFbW9qaSBJRCwgY2FjaGUgaXQgYW5kIHJlc29sdmUgaXQgKi9cbiAgYXN5bmMgZmV0Y2goZ3VpbGRJRDogc3RyaW5nLCBpZDogc3RyaW5nKTogUHJvbWlzZTxFbW9qaT4ge1xuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmNsaWVudC5yZXN0XG4gICAgICAgIC5nZXQoR1VJTERfRU1PSkkoZ3VpbGRJRCwgaWQpKVxuICAgICAgICAudGhlbihhc3luYyAoZGF0YSkgPT4ge1xuICAgICAgICAgIGF3YWl0IHRoaXMuc2V0KGlkLCBkYXRhIGFzIEVtb2ppUGF5bG9hZClcbiAgICAgICAgICByZXNvbHZlKG5ldyBFbW9qaSh0aGlzLmNsaWVudCwgZGF0YSBhcyBFbW9qaVBheWxvYWQpKVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGUpID0+IHJlamVjdChlKSlcbiAgICB9KVxuICB9XG5cbiAgLyoqIFRyeSB0byBnZXQgRW1vamkgZnJvbSBjYWNoZSwgaWYgbm90IGZvdW5kIHRoZW4gZmV0Y2ggKi9cbiAgYXN5bmMgcmVzb2x2ZShcbiAgICBrZXk6IHN0cmluZyxcbiAgICBndWlsZD86IHN0cmluZyB8IEd1aWxkXG4gICk6IFByb21pc2U8RW1vamkgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBjYWNoZVZhbHVlID0gYXdhaXQgdGhpcy5nZXQoa2V5KVxuICAgIGlmIChjYWNoZVZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBjYWNoZVZhbHVlXG4gICAgZWxzZSB7XG4gICAgICBpZiAoZ3VpbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjb25zdCBndWlsZElEID0gdHlwZW9mIGd1aWxkID09PSAnc3RyaW5nJyA/IGd1aWxkIDogZ3VpbGQuaWRcbiAgICAgICAgY29uc3QgZmV0Y2hWYWx1ZSA9IGF3YWl0IHRoaXMuZmV0Y2goZ3VpbGRJRCwga2V5KS5jYXRjaCgoKSA9PiB1bmRlZmluZWQpXG4gICAgICAgIGlmIChmZXRjaFZhbHVlICE9PSB1bmRlZmluZWQpIHJldHVybiBmZXRjaFZhbHVlXG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsU0FBUyxLQUFLLFFBQVEseUJBQXdCO0FBRTlDLFNBQVMsV0FBVyxRQUFRLHVCQUFzQjtBQUNsRCxTQUFTLFdBQVcsUUFBUSxZQUFXO0FBRXZDLE9BQU8sTUFBTSxzQkFBc0I7SUFDakMsWUFBWSxNQUFjLENBQUU7UUFDMUIsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsRUFBRTtJQUMxQjtJQUVBLE1BQU0sSUFBSSxHQUFXLEVBQThCO1FBQ2pELE1BQU0sTUFBTSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUM7UUFDNUIsSUFBSSxRQUFRLFdBQVc7UUFDdkIsTUFBTSxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQzdDLElBQUksSUFBSSxRQUFRLEtBQUssV0FBVztZQUM5QixNQUFNLFFBQVEsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxRQUFRO1lBQ3ZELElBQUksVUFBVSxXQUFXLE1BQU0sS0FBSyxHQUFHO1FBQ3pDLENBQUM7UUFDRCxPQUFPO0lBQ1Q7SUFFQSx1RUFBdUUsR0FDdkUsTUFBTSxNQUFNLE9BQWUsRUFBRSxFQUFVLEVBQWtCO1FBQ3ZELE9BQU8sTUFBTSxJQUFJLFFBQVEsQ0FBQyxTQUFTLFNBQVc7WUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQ2IsR0FBRyxDQUFDLFlBQVksU0FBUyxLQUN6QixJQUFJLENBQUMsT0FBTyxPQUFTO2dCQUNwQixNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSTtnQkFDbkIsUUFBUSxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNqQyxHQUNDLEtBQUssQ0FBQyxDQUFDLElBQU0sT0FBTztRQUN6QjtJQUNGO0lBRUEseURBQXlELEdBQ3pELE1BQU0sUUFDSixHQUFXLEVBQ1gsS0FBc0IsRUFDTTtRQUM1QixNQUFNLGFBQWEsTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDO1FBQ2xDLElBQUksZUFBZSxXQUFXLE9BQU87YUFDaEM7WUFDSCxJQUFJLFVBQVUsV0FBVztnQkFDdkIsTUFBTSxVQUFVLE9BQU8sVUFBVSxXQUFXLFFBQVEsTUFBTSxFQUFFO2dCQUM1RCxNQUFNLGFBQWEsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsS0FBSyxLQUFLLENBQUMsSUFBTTtnQkFDOUQsSUFBSSxlQUFlLFdBQVcsT0FBTztZQUN2QyxDQUFDO1FBQ0gsQ0FBQztJQUNIO0FBQ0YsQ0FBQyJ9