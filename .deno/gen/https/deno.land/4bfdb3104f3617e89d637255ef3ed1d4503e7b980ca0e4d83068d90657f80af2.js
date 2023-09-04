import { SnowflakeBase } from './base.ts';
import { User } from './user.ts';
export class MessageStickerItem extends SnowflakeBase {
    name;
    formatType;
    constructor(client, data){
        super(client);
        this.readFromData(data);
    }
    readFromData(data) {
        this.id = data.id ?? this.id;
        this.name = data.name ?? this.name;
        this.formatType = data.format_type ?? this.formatType;
    }
}
export class MessageSticker extends SnowflakeBase {
    name;
    packID;
    type;
    formatType;
    description = null;
    tags;
    available;
    guildID;
    user;
    sortValue;
    constructor(client, data){
        super(client, data);
        this.readFromData(data);
    }
    readFromData(data) {
        this.name = data.name ?? this.name;
        this.type = data.type ?? this.type;
        this.formatType = data.format_type ?? this.formatType;
        this.description = data.description ?? this.description;
        this.packID = data.pack_id ?? this.packID;
        this.tags = data.tags ?? this.tags;
        this.available = data.available ?? this.available;
        this.guildID = data.guild_id ?? this.guildID;
        this.user = data.user === undefined ? undefined : new User(this.client, data.user);
        this.sortValue = data.sort_value ?? this.sortValue;
    }
    /** Edit the Sticker */ async edit(options) {
        if (this.guildID === undefined) throw new Error('Only Guild Stickers can be edited');
        const { id  } = await this.client.stickers.edit(this.guildID, this, options);
        this.readFromData(await this.client.stickers._get(id));
        return this;
    }
    /** Delete the Sticker */ async delete(reason) {
        if (this.guildID === undefined) throw new Error('Only Guild Stickers can be deleted');
        return this.client.stickers.delete(this.guildID, this, reason);
    }
}
export class MessageStickerPack extends SnowflakeBase {
    stickers;
    name;
    skuID;
    coverStickerID;
    description;
    bannerAssetID;
    constructor(client, data){
        super(client, data);
        this.readFromData(data);
    }
    readFromData(data) {
        this.stickers = data.stickers.map((e)=>new MessageSticker(this.client, e));
        this.name = data.name ?? this.name;
        this.skuID = data.sku_id ?? this.skuID;
        this.coverStickerID = data.cover_sticker_id ?? this.coverStickerID;
        this.description = data.description ?? this.description;
        this.bannerAssetID = data.banner_asset_id ?? this.bannerAssetID;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvbWVzc2FnZVN0aWNrZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuaW1wb3J0IHR5cGUge1xuICBNZXNzYWdlU3RpY2tlckZvcm1hdFR5cGVzLFxuICBNZXNzYWdlU3RpY2tlckl0ZW1QYXlsb2FkLFxuICBNZXNzYWdlU3RpY2tlclBhY2tQYXlsb2FkLFxuICBNZXNzYWdlU3RpY2tlclBheWxvYWQsXG4gIE1lc3NhZ2VTdGlja2VyVHlwZSxcbiAgTW9kaWZ5R3VpbGRTdGlja2VyT3B0aW9uc1xufSBmcm9tICcuLi90eXBlcy9jaGFubmVsLnRzJ1xuaW1wb3J0IHsgU25vd2ZsYWtlQmFzZSB9IGZyb20gJy4vYmFzZS50cydcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3VzZXIudHMnXG5cbmV4cG9ydCBjbGFzcyBNZXNzYWdlU3RpY2tlckl0ZW0gZXh0ZW5kcyBTbm93Zmxha2VCYXNlIHtcbiAgbmFtZSE6IHN0cmluZ1xuICBmb3JtYXRUeXBlITogTWVzc2FnZVN0aWNrZXJGb3JtYXRUeXBlc1xuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50LCBkYXRhOiBNZXNzYWdlU3RpY2tlckl0ZW1QYXlsb2FkKSB7XG4gICAgc3VwZXIoY2xpZW50KVxuICAgIHRoaXMucmVhZEZyb21EYXRhKGRhdGEpXG4gIH1cblxuICByZWFkRnJvbURhdGEoZGF0YTogTWVzc2FnZVN0aWNrZXJJdGVtUGF5bG9hZCk6IHZvaWQge1xuICAgIHRoaXMuaWQgPSBkYXRhLmlkID8/IHRoaXMuaWRcbiAgICB0aGlzLm5hbWUgPSBkYXRhLm5hbWUgPz8gdGhpcy5uYW1lXG4gICAgdGhpcy5mb3JtYXRUeXBlID0gZGF0YS5mb3JtYXRfdHlwZSA/PyB0aGlzLmZvcm1hdFR5cGVcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWVzc2FnZVN0aWNrZXIgZXh0ZW5kcyBTbm93Zmxha2VCYXNlIHtcbiAgbmFtZSE6IHN0cmluZ1xuICBwYWNrSUQ/OiBzdHJpbmdcbiAgdHlwZSE6IE1lc3NhZ2VTdGlja2VyVHlwZVxuICBmb3JtYXRUeXBlITogTWVzc2FnZVN0aWNrZXJGb3JtYXRUeXBlc1xuICBkZXNjcmlwdGlvbjogc3RyaW5nIHwgbnVsbCA9IG51bGxcbiAgdGFncyE6IHN0cmluZ1xuICBhdmFpbGFibGU/OiBib29sZWFuXG4gIGd1aWxkSUQ/OiBzdHJpbmdcbiAgdXNlcj86IFVzZXJcbiAgc29ydFZhbHVlPzogbnVtYmVyXG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQsIGRhdGE6IE1lc3NhZ2VTdGlja2VyUGF5bG9hZCkge1xuICAgIHN1cGVyKGNsaWVudCwgZGF0YSlcbiAgICB0aGlzLnJlYWRGcm9tRGF0YShkYXRhKVxuICB9XG5cbiAgcmVhZEZyb21EYXRhKGRhdGE6IE1lc3NhZ2VTdGlja2VyUGF5bG9hZCk6IHZvaWQge1xuICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZSA/PyB0aGlzLm5hbWVcbiAgICB0aGlzLnR5cGUgPSBkYXRhLnR5cGUgPz8gdGhpcy50eXBlXG4gICAgdGhpcy5mb3JtYXRUeXBlID0gZGF0YS5mb3JtYXRfdHlwZSA/PyB0aGlzLmZvcm1hdFR5cGVcbiAgICB0aGlzLmRlc2NyaXB0aW9uID0gZGF0YS5kZXNjcmlwdGlvbiA/PyB0aGlzLmRlc2NyaXB0aW9uXG4gICAgdGhpcy5wYWNrSUQgPSBkYXRhLnBhY2tfaWQgPz8gdGhpcy5wYWNrSURcbiAgICB0aGlzLnRhZ3MgPSBkYXRhLnRhZ3MgPz8gdGhpcy50YWdzXG4gICAgdGhpcy5hdmFpbGFibGUgPSBkYXRhLmF2YWlsYWJsZSA/PyB0aGlzLmF2YWlsYWJsZVxuICAgIHRoaXMuZ3VpbGRJRCA9IGRhdGEuZ3VpbGRfaWQgPz8gdGhpcy5ndWlsZElEXG4gICAgdGhpcy51c2VyID1cbiAgICAgIGRhdGEudXNlciA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogbmV3IFVzZXIodGhpcy5jbGllbnQsIGRhdGEudXNlcilcbiAgICB0aGlzLnNvcnRWYWx1ZSA9IGRhdGEuc29ydF92YWx1ZSA/PyB0aGlzLnNvcnRWYWx1ZVxuICB9XG5cbiAgLyoqIEVkaXQgdGhlIFN0aWNrZXIgKi9cbiAgYXN5bmMgZWRpdChvcHRpb25zOiBQYXJ0aWFsPE1vZGlmeUd1aWxkU3RpY2tlck9wdGlvbnM+KTogUHJvbWlzZTx0aGlzPiB7XG4gICAgaWYgKHRoaXMuZ3VpbGRJRCA9PT0gdW5kZWZpbmVkKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdPbmx5IEd1aWxkIFN0aWNrZXJzIGNhbiBiZSBlZGl0ZWQnKVxuICAgIGNvbnN0IHsgaWQgfSA9IGF3YWl0IHRoaXMuY2xpZW50LnN0aWNrZXJzLmVkaXQodGhpcy5ndWlsZElELCB0aGlzLCBvcHRpb25zKVxuICAgIHRoaXMucmVhZEZyb21EYXRhKChhd2FpdCB0aGlzLmNsaWVudC5zdGlja2Vycy5fZ2V0KGlkKSkhKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogRGVsZXRlIHRoZSBTdGlja2VyICovXG4gIGFzeW5jIGRlbGV0ZShyZWFzb24/OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAodGhpcy5ndWlsZElEID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ09ubHkgR3VpbGQgU3RpY2tlcnMgY2FuIGJlIGRlbGV0ZWQnKVxuICAgIHJldHVybiB0aGlzLmNsaWVudC5zdGlja2Vycy5kZWxldGUodGhpcy5ndWlsZElELCB0aGlzLCByZWFzb24pXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VTdGlja2VyUGFjayBleHRlbmRzIFNub3dmbGFrZUJhc2Uge1xuICBzdGlja2VycyE6IE1lc3NhZ2VTdGlja2VyW11cbiAgbmFtZSE6IHN0cmluZ1xuICBza3VJRCE6IHN0cmluZ1xuICBjb3ZlclN0aWNrZXJJRD86IHN0cmluZ1xuICBkZXNjcmlwdGlvbiE6IHN0cmluZ1xuICBiYW5uZXJBc3NldElEPzogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQsIGRhdGE6IE1lc3NhZ2VTdGlja2VyUGFja1BheWxvYWQpIHtcbiAgICBzdXBlcihjbGllbnQsIGRhdGEpXG4gICAgdGhpcy5yZWFkRnJvbURhdGEoZGF0YSlcbiAgfVxuXG4gIHJlYWRGcm9tRGF0YShkYXRhOiBNZXNzYWdlU3RpY2tlclBhY2tQYXlsb2FkKTogdm9pZCB7XG4gICAgdGhpcy5zdGlja2VycyA9IGRhdGEuc3RpY2tlcnMubWFwKChlKSA9PiBuZXcgTWVzc2FnZVN0aWNrZXIodGhpcy5jbGllbnQsIGUpKVxuICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZSA/PyB0aGlzLm5hbWVcbiAgICB0aGlzLnNrdUlEID0gZGF0YS5za3VfaWQgPz8gdGhpcy5za3VJRFxuICAgIHRoaXMuY292ZXJTdGlja2VySUQgPSBkYXRhLmNvdmVyX3N0aWNrZXJfaWQgPz8gdGhpcy5jb3ZlclN0aWNrZXJJRFxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkYXRhLmRlc2NyaXB0aW9uID8/IHRoaXMuZGVzY3JpcHRpb25cbiAgICB0aGlzLmJhbm5lckFzc2V0SUQgPSBkYXRhLmJhbm5lcl9hc3NldF9pZCA/PyB0aGlzLmJhbm5lckFzc2V0SURcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLFNBQVMsYUFBYSxRQUFRLFlBQVc7QUFDekMsU0FBUyxJQUFJLFFBQVEsWUFBVztBQUVoQyxPQUFPLE1BQU0sMkJBQTJCO0lBQ3RDLEtBQWE7SUFDYixXQUFzQztJQUV0QyxZQUFZLE1BQWMsRUFBRSxJQUErQixDQUFFO1FBQzNELEtBQUssQ0FBQztRQUNOLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDcEI7SUFFQSxhQUFhLElBQStCLEVBQVE7UUFDbEQsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUUsSUFBSSxJQUFJLENBQUMsRUFBRTtRQUM1QixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJO1FBQ2xDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxXQUFXLElBQUksSUFBSSxDQUFDLFVBQVU7SUFDdkQ7QUFDRixDQUFDO0FBRUQsT0FBTyxNQUFNLHVCQUF1QjtJQUNsQyxLQUFhO0lBQ2IsT0FBZTtJQUNmLEtBQXlCO0lBQ3pCLFdBQXNDO0lBQ3RDLGNBQTZCLElBQUksQ0FBQTtJQUNqQyxLQUFhO0lBQ2IsVUFBbUI7SUFDbkIsUUFBZ0I7SUFDaEIsS0FBVztJQUNYLFVBQWtCO0lBRWxCLFlBQVksTUFBYyxFQUFFLElBQTJCLENBQUU7UUFDdkQsS0FBSyxDQUFDLFFBQVE7UUFDZCxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ3BCO0lBRUEsYUFBYSxJQUEyQixFQUFRO1FBQzlDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUk7UUFDbEMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSTtRQUNsQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVO1FBQ3JELElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVc7UUFDdkQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTTtRQUN6QyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJO1FBQ2xDLElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFNBQVM7UUFDakQsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLFFBQVEsSUFBSSxJQUFJLENBQUMsT0FBTztRQUM1QyxJQUFJLENBQUMsSUFBSSxHQUNQLEtBQUssSUFBSSxLQUFLLFlBQVksWUFBWSxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRSxLQUFLLElBQUksQ0FBQztRQUN4RSxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssVUFBVSxJQUFJLElBQUksQ0FBQyxTQUFTO0lBQ3BEO0lBRUEscUJBQXFCLEdBQ3JCLE1BQU0sS0FBSyxPQUEyQyxFQUFpQjtRQUNyRSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssV0FDbkIsTUFBTSxJQUFJLE1BQU0scUNBQW9DO1FBQ3RELE1BQU0sRUFBRSxHQUFFLEVBQUUsR0FBRyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRTtRQUNuRSxJQUFJLENBQUMsWUFBWSxDQUFFLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO1FBQ25ELE9BQU8sSUFBSTtJQUNiO0lBRUEsdUJBQXVCLEdBQ3ZCLE1BQU0sT0FBTyxNQUFlLEVBQW9CO1FBQzlDLElBQUksSUFBSSxDQUFDLE9BQU8sS0FBSyxXQUNuQixNQUFNLElBQUksTUFBTSxzQ0FBcUM7UUFDdkQsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUU7SUFDekQ7QUFDRixDQUFDO0FBRUQsT0FBTyxNQUFNLDJCQUEyQjtJQUN0QyxTQUEyQjtJQUMzQixLQUFhO0lBQ2IsTUFBYztJQUNkLGVBQXVCO0lBQ3ZCLFlBQW9CO0lBQ3BCLGNBQXNCO0lBRXRCLFlBQVksTUFBYyxFQUFFLElBQStCLENBQUU7UUFDM0QsS0FBSyxDQUFDLFFBQVE7UUFDZCxJQUFJLENBQUMsWUFBWSxDQUFDO0lBQ3BCO0lBRUEsYUFBYSxJQUErQixFQUFRO1FBQ2xELElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBTSxJQUFJLGVBQWUsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUN6RSxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJO1FBQ2xDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUs7UUFDdEMsSUFBSSxDQUFDLGNBQWMsR0FBRyxLQUFLLGdCQUFnQixJQUFJLElBQUksQ0FBQyxjQUFjO1FBQ2xFLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxXQUFXLElBQUksSUFBSSxDQUFDLFdBQVc7UUFDdkQsSUFBSSxDQUFDLGFBQWEsR0FBRyxLQUFLLGVBQWUsSUFBSSxJQUFJLENBQUMsYUFBYTtJQUNqRTtBQUNGLENBQUMifQ==