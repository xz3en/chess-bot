import { MessageSticker } from '../structures/messageSticker.ts';
import { BaseChildManager } from './baseChild.ts';
export class GuildStickersManager extends BaseChildManager {
    constructor(client, guild){
        super(client, client.stickers);
        this.guild = guild;
    }
    /** Fetches Guild Sticker from API */ async fetch(id) {
        const sticker = await this.client.stickers.fetch(id);
        if (sticker.guildID === this.guild.id) throw new Error(`This sticker (${sticker.id}) is not part of Guild ${this.guild.id}`);
        return sticker;
    }
    /** Delete a Guild Sticker */ async delete(id, reason) {
        return this.client.stickers.delete(this.guild, id, reason);
    }
    /** Fetches all Guild Stickers from API (and caches them) */ async fetchAll() {
        return this.client.stickers.fetchAll(this.guild);
    }
    /** Creates a new Guild Sticker */ async create(options) {
        return this.client.stickers.create(this.guild, options);
    }
    /** Edit an existing Guild Sticker */ async edit(sticker, options) {
        return this.client.stickers.edit(this.guild, sticker, options);
    }
    /** Returns a list of IDs of all Stickers in this Guild */ async keys() {
        const keys = [];
        for (const sticker of await this.client.cache.array('stickers') ?? []){
            if (sticker.guild_id === this.guild.id) keys.push(sticker.id);
        }
        return keys;
    }
    /** Returns an Array of all Stickers in this Guild */ async array() {
        const stickers = [];
        for (const sticker of await this.client.cache.array('stickers') ?? []){
            if (sticker.guild_id === this.guild.id) stickers.push(new MessageSticker(this.client, sticker));
        }
        return stickers;
    }
    /** Purges Guild Sticker Cache */ async flush() {
        for (const sticker of await this.client.cache.array('stickers') ?? []){
            if (sticker.guild_id === this.guild.id) await this.client.stickers._delete(sticker.id);
        }
    }
    guild;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL2d1aWxkU3RpY2tlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuaW1wb3J0IHsgR3VpbGQgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2d1aWxkLnRzJ1xuaW1wb3J0IHsgTWVzc2FnZVN0aWNrZXIgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL21lc3NhZ2VTdGlja2VyLnRzJ1xuaW1wb3J0IHtcbiAgQ3JlYXRlR3VpbGRTdGlja2VyT3B0aW9ucyxcbiAgTWVzc2FnZVN0aWNrZXJQYXlsb2FkLFxuICBNb2RpZnlHdWlsZFN0aWNrZXJPcHRpb25zXG59IGZyb20gJy4uL3R5cGVzL2NoYW5uZWwudHMnXG5pbXBvcnQgeyBCYXNlQ2hpbGRNYW5hZ2VyIH0gZnJvbSAnLi9iYXNlQ2hpbGQudHMnXG5cbmV4cG9ydCBjbGFzcyBHdWlsZFN0aWNrZXJzTWFuYWdlciBleHRlbmRzIEJhc2VDaGlsZE1hbmFnZXI8XG4gIE1lc3NhZ2VTdGlja2VyUGF5bG9hZCxcbiAgTWVzc2FnZVN0aWNrZXJcbj4ge1xuICBjb25zdHJ1Y3RvcihjbGllbnQ6IENsaWVudCwgcHVibGljIGd1aWxkOiBHdWlsZCkge1xuICAgIHN1cGVyKGNsaWVudCwgY2xpZW50LnN0aWNrZXJzKVxuICB9XG5cbiAgLyoqIEZldGNoZXMgR3VpbGQgU3RpY2tlciBmcm9tIEFQSSAqL1xuICBhc3luYyBmZXRjaChpZDogc3RyaW5nKTogUHJvbWlzZTxNZXNzYWdlU3RpY2tlcj4ge1xuICAgIGNvbnN0IHN0aWNrZXIgPSBhd2FpdCB0aGlzLmNsaWVudC5zdGlja2Vycy5mZXRjaChpZClcbiAgICBpZiAoc3RpY2tlci5ndWlsZElEID09PSB0aGlzLmd1aWxkLmlkKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgVGhpcyBzdGlja2VyICgke3N0aWNrZXIuaWR9KSBpcyBub3QgcGFydCBvZiBHdWlsZCAke3RoaXMuZ3VpbGQuaWR9YFxuICAgICAgKVxuICAgIHJldHVybiBzdGlja2VyXG4gIH1cblxuICAvKiogRGVsZXRlIGEgR3VpbGQgU3RpY2tlciAqL1xuICBhc3luYyBkZWxldGUoaWQ6IHN0cmluZyB8IE1lc3NhZ2VTdGlja2VyLCByZWFzb24/OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuc3RpY2tlcnMuZGVsZXRlKHRoaXMuZ3VpbGQsIGlkLCByZWFzb24pXG4gIH1cblxuICAvKiogRmV0Y2hlcyBhbGwgR3VpbGQgU3RpY2tlcnMgZnJvbSBBUEkgKGFuZCBjYWNoZXMgdGhlbSkgKi9cbiAgYXN5bmMgZmV0Y2hBbGwoKTogUHJvbWlzZTxNZXNzYWdlU3RpY2tlcltdPiB7XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50LnN0aWNrZXJzLmZldGNoQWxsKHRoaXMuZ3VpbGQpXG4gIH1cblxuICAvKiogQ3JlYXRlcyBhIG5ldyBHdWlsZCBTdGlja2VyICovXG4gIGFzeW5jIGNyZWF0ZShvcHRpb25zOiBDcmVhdGVHdWlsZFN0aWNrZXJPcHRpb25zKTogUHJvbWlzZTxNZXNzYWdlU3RpY2tlcj4ge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5zdGlja2Vycy5jcmVhdGUodGhpcy5ndWlsZCwgb3B0aW9ucylcbiAgfVxuXG4gIC8qKiBFZGl0IGFuIGV4aXN0aW5nIEd1aWxkIFN0aWNrZXIgKi9cbiAgYXN5bmMgZWRpdChcbiAgICBzdGlja2VyOiBzdHJpbmcgfCBNZXNzYWdlU3RpY2tlcixcbiAgICBvcHRpb25zOiBQYXJ0aWFsPE1vZGlmeUd1aWxkU3RpY2tlck9wdGlvbnM+XG4gICk6IFByb21pc2U8TWVzc2FnZVN0aWNrZXI+IHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQuc3RpY2tlcnMuZWRpdCh0aGlzLmd1aWxkLCBzdGlja2VyLCBvcHRpb25zKVxuICB9XG5cbiAgLyoqIFJldHVybnMgYSBsaXN0IG9mIElEcyBvZiBhbGwgU3RpY2tlcnMgaW4gdGhpcyBHdWlsZCAqL1xuICBhc3luYyBrZXlzKCk6IFByb21pc2U8c3RyaW5nW10+IHtcbiAgICBjb25zdCBrZXlzID0gW11cbiAgICBmb3IgKGNvbnN0IHN0aWNrZXIgb2YgKChhd2FpdCB0aGlzLmNsaWVudC5jYWNoZS5hcnJheSgnc3RpY2tlcnMnKSkgPz9cbiAgICAgIFtdKSBhcyBNZXNzYWdlU3RpY2tlclBheWxvYWRbXSkge1xuICAgICAgaWYgKHN0aWNrZXIuZ3VpbGRfaWQgPT09IHRoaXMuZ3VpbGQuaWQpIGtleXMucHVzaChzdGlja2VyLmlkKVxuICAgIH1cbiAgICByZXR1cm4ga2V5c1xuICB9XG5cbiAgLyoqIFJldHVybnMgYW4gQXJyYXkgb2YgYWxsIFN0aWNrZXJzIGluIHRoaXMgR3VpbGQgKi9cbiAgYXN5bmMgYXJyYXkoKTogUHJvbWlzZTxNZXNzYWdlU3RpY2tlcltdPiB7XG4gICAgY29uc3Qgc3RpY2tlcnMgPSBbXVxuICAgIGZvciAoY29uc3Qgc3RpY2tlciBvZiAoKGF3YWl0IHRoaXMuY2xpZW50LmNhY2hlLmFycmF5KCdzdGlja2VycycpKSA/P1xuICAgICAgW10pIGFzIE1lc3NhZ2VTdGlja2VyUGF5bG9hZFtdKSB7XG4gICAgICBpZiAoc3RpY2tlci5ndWlsZF9pZCA9PT0gdGhpcy5ndWlsZC5pZClcbiAgICAgICAgc3RpY2tlcnMucHVzaChuZXcgTWVzc2FnZVN0aWNrZXIodGhpcy5jbGllbnQsIHN0aWNrZXIpKVxuICAgIH1cbiAgICByZXR1cm4gc3RpY2tlcnNcbiAgfVxuXG4gIC8qKiBQdXJnZXMgR3VpbGQgU3RpY2tlciBDYWNoZSAqL1xuICBhc3luYyBmbHVzaCgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBmb3IgKGNvbnN0IHN0aWNrZXIgb2YgKChhd2FpdCB0aGlzLmNsaWVudC5jYWNoZS5hcnJheSgnc3RpY2tlcnMnKSkgPz9cbiAgICAgIFtdKSBhcyBNZXNzYWdlU3RpY2tlclBheWxvYWRbXSkge1xuICAgICAgaWYgKHN0aWNrZXIuZ3VpbGRfaWQgPT09IHRoaXMuZ3VpbGQuaWQpXG4gICAgICAgIGF3YWl0IHRoaXMuY2xpZW50LnN0aWNrZXJzLl9kZWxldGUoc3RpY2tlci5pZClcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLGNBQWMsUUFBUSxrQ0FBaUM7QUFNaEUsU0FBUyxnQkFBZ0IsUUFBUSxpQkFBZ0I7QUFFakQsT0FBTyxNQUFNLDZCQUE2QjtJQUl4QyxZQUFZLE1BQWMsRUFBUyxNQUFjO1FBQy9DLEtBQUssQ0FBQyxRQUFRLE9BQU8sUUFBUTtxQkFESTtJQUVuQztJQUVBLG1DQUFtQyxHQUNuQyxNQUFNLE1BQU0sRUFBVSxFQUEyQjtRQUMvQyxNQUFNLFVBQVUsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7UUFDakQsSUFBSSxRQUFRLE9BQU8sS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFDbkMsTUFBTSxJQUFJLE1BQ1IsQ0FBQyxjQUFjLEVBQUUsUUFBUSxFQUFFLENBQUMsdUJBQXVCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUNyRTtRQUNILE9BQU87SUFDVDtJQUVBLDJCQUEyQixHQUMzQixNQUFNLE9BQU8sRUFBMkIsRUFBRSxNQUFlLEVBQW9CO1FBQzNFLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSTtJQUNyRDtJQUVBLDBEQUEwRCxHQUMxRCxNQUFNLFdBQXNDO1FBQzFDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLO0lBQ2pEO0lBRUEsZ0NBQWdDLEdBQ2hDLE1BQU0sT0FBTyxPQUFrQyxFQUEyQjtRQUN4RSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFO0lBQ2pEO0lBRUEsbUNBQW1DLEdBQ25DLE1BQU0sS0FDSixPQUFnQyxFQUNoQyxPQUEyQyxFQUNsQjtRQUN6QixPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLFNBQVM7SUFDeEQ7SUFFQSx3REFBd0QsR0FDeEQsTUFBTSxPQUEwQjtRQUM5QixNQUFNLE9BQU8sRUFBRTtRQUNmLEtBQUssTUFBTSxXQUFZLEFBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFDcEQsRUFBRSxDQUE4QjtZQUNoQyxJQUFJLFFBQVEsUUFBUSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRTtRQUM5RDtRQUNBLE9BQU87SUFDVDtJQUVBLG1EQUFtRCxHQUNuRCxNQUFNLFFBQW1DO1FBQ3ZDLE1BQU0sV0FBVyxFQUFFO1FBQ25CLEtBQUssTUFBTSxXQUFZLEFBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFDcEQsRUFBRSxDQUE4QjtZQUNoQyxJQUFJLFFBQVEsUUFBUSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUNwQyxTQUFTLElBQUksQ0FBQyxJQUFJLGVBQWUsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNsRDtRQUNBLE9BQU87SUFDVDtJQUVBLCtCQUErQixHQUMvQixNQUFNLFFBQXVCO1FBQzNCLEtBQUssTUFBTSxXQUFZLEFBQUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsZUFDcEQsRUFBRSxDQUE4QjtZQUNoQyxJQUFJLFFBQVEsUUFBUSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUNwQyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUU7UUFDakQ7SUFDRjtJQWpFbUM7QUFrRXJDLENBQUMifQ==