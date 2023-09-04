export const guildStickersUpdate = async (gateway, d)=>{
    const guild = await gateway.client.guilds.get(d.guild_id);
    if (guild !== undefined) {
        const stickers = await guild.stickers.collection();
        const deleted = [];
        const added = [];
        const updated = [];
        const _updated = [];
        for (const raw of d.stickers){
            if (raw.user !== undefined) await gateway.client.users.set(raw.user.id, raw.user);
            const stickerID = raw.id !== null ? raw.id : raw.name;
            const has = stickers.get(stickerID);
            if (has === undefined) {
                await guild.stickers.set(stickerID, raw);
                const sticker = await guild.stickers.get(stickerID);
                added.push(sticker);
            } else _updated.push(raw);
        }
        for (const sticker1 of stickers.values()){
            const stickerID1 = sticker1.id !== null ? sticker1.id : sticker1.name;
            const find = _updated.find((e)=>{
                const eID = e.id !== null ? e.id : e.name;
                return stickerID1 === eID;
            });
            if (find === undefined) {
                await guild.stickers.delete(stickerID1);
                deleted.push(sticker1);
            } else {
                const foundID = find.id !== null ? find.id : find.name;
                const before = await guild.stickers.get(foundID);
                await guild.stickers.set(foundID, find);
                const after = await guild.stickers.get(foundID);
                updated.push({
                    before,
                    after
                });
            }
        }
        gateway.client.emit('guildStickersUpdate', guild);
        for (const sticker2 of deleted){
            gateway.client.emit('guildStickerDelete', sticker2);
        }
        for (const sticker3 of added){
            gateway.client.emit('guildStickerAdd', sticker3);
        }
        for (const sticker4 of updated){
            gateway.client.emit('guildStickerUpdate', sticker4.before, sticker4.after);
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2dhdGV3YXkvaGFuZGxlcnMvZ3VpbGRTdGlja2Vyc1VwZGF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHdWlsZCB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvZ3VpbGQudHMnXG5pbXBvcnQgeyBNZXNzYWdlU3RpY2tlciB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvbWVzc2FnZVN0aWNrZXIudHMnXG5pbXBvcnQgeyBNZXNzYWdlU3RpY2tlclBheWxvYWQgfSBmcm9tICcuLi8uLi90eXBlcy9jaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBHYXRld2F5LCBHYXRld2F5RXZlbnRIYW5kbGVyIH0gZnJvbSAnLi4vbW9kLnRzJ1xuXG5leHBvcnQgY29uc3QgZ3VpbGRTdGlja2Vyc1VwZGF0ZTogR2F0ZXdheUV2ZW50SGFuZGxlciA9IGFzeW5jIChcbiAgZ2F0ZXdheTogR2F0ZXdheSxcbiAgZDogeyBndWlsZF9pZDogc3RyaW5nOyBzdGlja2VyczogTWVzc2FnZVN0aWNrZXJQYXlsb2FkW10gfVxuKSA9PiB7XG4gIGNvbnN0IGd1aWxkOiBHdWlsZCB8IHVuZGVmaW5lZCA9IGF3YWl0IGdhdGV3YXkuY2xpZW50Lmd1aWxkcy5nZXQoZC5ndWlsZF9pZClcbiAgaWYgKGd1aWxkICE9PSB1bmRlZmluZWQpIHtcbiAgICBjb25zdCBzdGlja2VycyA9IGF3YWl0IGd1aWxkLnN0aWNrZXJzLmNvbGxlY3Rpb24oKVxuICAgIGNvbnN0IGRlbGV0ZWQ6IE1lc3NhZ2VTdGlja2VyW10gPSBbXVxuICAgIGNvbnN0IGFkZGVkOiBNZXNzYWdlU3RpY2tlcltdID0gW11cbiAgICBjb25zdCB1cGRhdGVkOiBBcnJheTx7IGJlZm9yZTogTWVzc2FnZVN0aWNrZXI7IGFmdGVyOiBNZXNzYWdlU3RpY2tlciB9PiA9IFtdXG4gICAgY29uc3QgX3VwZGF0ZWQ6IE1lc3NhZ2VTdGlja2VyUGF5bG9hZFtdID0gW11cblxuICAgIGZvciAoY29uc3QgcmF3IG9mIGQuc3RpY2tlcnMpIHtcbiAgICAgIGlmIChyYXcudXNlciAhPT0gdW5kZWZpbmVkKVxuICAgICAgICBhd2FpdCBnYXRld2F5LmNsaWVudC51c2Vycy5zZXQocmF3LnVzZXIuaWQsIHJhdy51c2VyKVxuICAgICAgY29uc3Qgc3RpY2tlcklEID0gKHJhdy5pZCAhPT0gbnVsbCA/IHJhdy5pZCA6IHJhdy5uYW1lKSBhcyBzdHJpbmdcbiAgICAgIGNvbnN0IGhhcyA9IHN0aWNrZXJzLmdldChzdGlja2VySUQpXG4gICAgICBpZiAoaGFzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYXdhaXQgZ3VpbGQuc3RpY2tlcnMuc2V0KHN0aWNrZXJJRCwgcmF3KVxuICAgICAgICBjb25zdCBzdGlja2VyID0gKGF3YWl0IGd1aWxkLnN0aWNrZXJzLmdldChzdGlja2VySUQpKSBhcyBNZXNzYWdlU3RpY2tlclxuICAgICAgICBhZGRlZC5wdXNoKHN0aWNrZXIpXG4gICAgICB9IGVsc2UgX3VwZGF0ZWQucHVzaChyYXcpXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBzdGlja2VyIG9mIHN0aWNrZXJzLnZhbHVlcygpKSB7XG4gICAgICBjb25zdCBzdGlja2VySUQgPSAoXG4gICAgICAgIHN0aWNrZXIuaWQgIT09IG51bGwgPyBzdGlja2VyLmlkIDogc3RpY2tlci5uYW1lXG4gICAgICApIGFzIHN0cmluZ1xuICAgICAgY29uc3QgZmluZCA9IF91cGRhdGVkLmZpbmQoKGUpID0+IHtcbiAgICAgICAgY29uc3QgZUlEID0gZS5pZCAhPT0gbnVsbCA/IGUuaWQgOiBlLm5hbWVcbiAgICAgICAgcmV0dXJuIHN0aWNrZXJJRCA9PT0gZUlEXG4gICAgICB9KVxuICAgICAgaWYgKGZpbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhd2FpdCBndWlsZC5zdGlja2Vycy5kZWxldGUoc3RpY2tlcklEKVxuICAgICAgICBkZWxldGVkLnB1c2goc3RpY2tlcilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZvdW5kSUQgPSAoZmluZC5pZCAhPT0gbnVsbCA/IGZpbmQuaWQgOiBmaW5kLm5hbWUpIGFzIHN0cmluZ1xuICAgICAgICBjb25zdCBiZWZvcmUgPSAoYXdhaXQgZ3VpbGQuc3RpY2tlcnMuZ2V0KGZvdW5kSUQpKSBhcyBNZXNzYWdlU3RpY2tlclxuICAgICAgICBhd2FpdCBndWlsZC5zdGlja2Vycy5zZXQoZm91bmRJRCwgZmluZClcbiAgICAgICAgY29uc3QgYWZ0ZXIgPSAoYXdhaXQgZ3VpbGQuc3RpY2tlcnMuZ2V0KGZvdW5kSUQpKSBhcyBNZXNzYWdlU3RpY2tlclxuICAgICAgICB1cGRhdGVkLnB1c2goeyBiZWZvcmUsIGFmdGVyIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2F0ZXdheS5jbGllbnQuZW1pdCgnZ3VpbGRTdGlja2Vyc1VwZGF0ZScsIGd1aWxkKVxuXG4gICAgZm9yIChjb25zdCBzdGlja2VyIG9mIGRlbGV0ZWQpIHtcbiAgICAgIGdhdGV3YXkuY2xpZW50LmVtaXQoJ2d1aWxkU3RpY2tlckRlbGV0ZScsIHN0aWNrZXIpXG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBzdGlja2VyIG9mIGFkZGVkKSB7XG4gICAgICBnYXRld2F5LmNsaWVudC5lbWl0KCdndWlsZFN0aWNrZXJBZGQnLCBzdGlja2VyKVxuICAgIH1cblxuICAgIGZvciAoY29uc3Qgc3RpY2tlciBvZiB1cGRhdGVkKSB7XG4gICAgICBnYXRld2F5LmNsaWVudC5lbWl0KCdndWlsZFN0aWNrZXJVcGRhdGUnLCBzdGlja2VyLmJlZm9yZSwgc3RpY2tlci5hZnRlcilcbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFLQSxPQUFPLE1BQU0sc0JBQTJDLE9BQ3RELFNBQ0EsSUFDRztJQUNILE1BQU0sUUFBMkIsTUFBTSxRQUFRLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsUUFBUTtJQUMzRSxJQUFJLFVBQVUsV0FBVztRQUN2QixNQUFNLFdBQVcsTUFBTSxNQUFNLFFBQVEsQ0FBQyxVQUFVO1FBQ2hELE1BQU0sVUFBNEIsRUFBRTtRQUNwQyxNQUFNLFFBQTBCLEVBQUU7UUFDbEMsTUFBTSxVQUFvRSxFQUFFO1FBQzVFLE1BQU0sV0FBb0MsRUFBRTtRQUU1QyxLQUFLLE1BQU0sT0FBTyxFQUFFLFFBQVEsQ0FBRTtZQUM1QixJQUFJLElBQUksSUFBSSxLQUFLLFdBQ2YsTUFBTSxRQUFRLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRSxJQUFJLElBQUk7WUFDdEQsTUFBTSxZQUFhLElBQUksRUFBRSxLQUFLLElBQUksR0FBRyxJQUFJLEVBQUUsR0FBRyxJQUFJLElBQUk7WUFDdEQsTUFBTSxNQUFNLFNBQVMsR0FBRyxDQUFDO1lBQ3pCLElBQUksUUFBUSxXQUFXO2dCQUNyQixNQUFNLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXO2dCQUNwQyxNQUFNLFVBQVcsTUFBTSxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQzFDLE1BQU0sSUFBSSxDQUFDO1lBQ2IsT0FBTyxTQUFTLElBQUksQ0FBQztRQUN2QjtRQUVBLEtBQUssTUFBTSxZQUFXLFNBQVMsTUFBTSxHQUFJO1lBQ3ZDLE1BQU0sYUFDSixTQUFRLEVBQUUsS0FBSyxJQUFJLEdBQUcsU0FBUSxFQUFFLEdBQUcsU0FBUSxJQUFJO1lBRWpELE1BQU0sT0FBTyxTQUFTLElBQUksQ0FBQyxDQUFDLElBQU07Z0JBQ2hDLE1BQU0sTUFBTSxFQUFFLEVBQUUsS0FBSyxJQUFJLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJO2dCQUN6QyxPQUFPLGVBQWM7WUFDdkI7WUFDQSxJQUFJLFNBQVMsV0FBVztnQkFDdEIsTUFBTSxNQUFNLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQzVCLFFBQVEsSUFBSSxDQUFDO1lBQ2YsT0FBTztnQkFDTCxNQUFNLFVBQVcsS0FBSyxFQUFFLEtBQUssSUFBSSxHQUFHLEtBQUssRUFBRSxHQUFHLEtBQUssSUFBSTtnQkFDdkQsTUFBTSxTQUFVLE1BQU0sTUFBTSxRQUFRLENBQUMsR0FBRyxDQUFDO2dCQUN6QyxNQUFNLE1BQU0sUUFBUSxDQUFDLEdBQUcsQ0FBQyxTQUFTO2dCQUNsQyxNQUFNLFFBQVMsTUFBTSxNQUFNLFFBQVEsQ0FBQyxHQUFHLENBQUM7Z0JBQ3hDLFFBQVEsSUFBSSxDQUFDO29CQUFFO29CQUFRO2dCQUFNO1lBQy9CLENBQUM7UUFDSDtRQUVBLFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyx1QkFBdUI7UUFFM0MsS0FBSyxNQUFNLFlBQVcsUUFBUztZQUM3QixRQUFRLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCO1FBQzVDO1FBRUEsS0FBSyxNQUFNLFlBQVcsTUFBTztZQUMzQixRQUFRLE1BQU0sQ0FBQyxJQUFJLENBQUMsbUJBQW1CO1FBQ3pDO1FBRUEsS0FBSyxNQUFNLFlBQVcsUUFBUztZQUM3QixRQUFRLE1BQU0sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLFNBQVEsTUFBTSxFQUFFLFNBQVEsS0FBSztRQUN6RTtJQUNGLENBQUM7QUFDSCxFQUFDIn0=