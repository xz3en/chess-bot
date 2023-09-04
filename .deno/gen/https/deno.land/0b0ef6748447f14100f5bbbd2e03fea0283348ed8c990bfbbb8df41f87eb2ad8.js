export const guildEmojiUpdate = async (gateway, d)=>{
    const guild = await gateway.client.guilds.get(d.guild_id);
    if (guild !== undefined) {
        const emojis = await guild.emojis.collection();
        const deleted = [];
        const added = [];
        const updated = [];
        const _updated = [];
        for (const raw of d.emojis){
            if (raw.user !== undefined) await gateway.client.users.set(raw.user.id, raw.user);
            const emojiID = raw.id !== null ? raw.id : raw.name;
            const has = emojis.get(emojiID);
            if (has === undefined) {
                await guild.emojis.set(emojiID, raw);
                const emoji = await guild.emojis.get(emojiID);
                added.push(emoji);
            } else _updated.push(raw);
        }
        for (const emoji1 of emojis.values()){
            const emojiID1 = emoji1.id !== null ? emoji1.id : emoji1.name;
            const find = _updated.find((e)=>{
                const eID = e.id !== null ? e.id : e.name;
                return emojiID1 === eID;
            });
            if (find === undefined) {
                await guild.emojis.delete(emojiID1);
                deleted.push(emoji1);
            } else {
                const foundID = find.id !== null ? find.id : find.name;
                const before = await guild.emojis.get(foundID);
                await guild.emojis.set(foundID, find);
                const after = await guild.emojis.get(foundID);
                updated.push({
                    before,
                    after
                });
            }
        }
        gateway.client.emit('guildEmojisUpdate', guild);
        for (const emoji2 of deleted){
            gateway.client.emit('guildEmojiDelete', emoji2);
        }
        for (const emoji3 of added){
            gateway.client.emit('guildEmojiAdd', emoji3);
        }
        for (const emoji4 of updated){
            gateway.client.emit('guildEmojiUpdate', emoji4.before, emoji4.after);
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2dhdGV3YXkvaGFuZGxlcnMvZ3VpbGRFbW9qaVVwZGF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFbW9qaSB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvZW1vamkudHMnXG5pbXBvcnQgeyBHdWlsZCB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvZ3VpbGQudHMnXG5pbXBvcnQgeyBFbW9qaVBheWxvYWQgfSBmcm9tICcuLi8uLi90eXBlcy9lbW9qaS50cydcbmltcG9ydCB7IEd1aWxkRW1vamlVcGRhdGVQYXlsb2FkIH0gZnJvbSAnLi4vLi4vdHlwZXMvZ2F0ZXdheS50cydcbmltcG9ydCB0eXBlIHsgR2F0ZXdheSwgR2F0ZXdheUV2ZW50SGFuZGxlciB9IGZyb20gJy4uL21vZC50cydcblxuZXhwb3J0IGNvbnN0IGd1aWxkRW1vamlVcGRhdGU6IEdhdGV3YXlFdmVudEhhbmRsZXIgPSBhc3luYyAoXG4gIGdhdGV3YXk6IEdhdGV3YXksXG4gIGQ6IEd1aWxkRW1vamlVcGRhdGVQYXlsb2FkXG4pID0+IHtcbiAgY29uc3QgZ3VpbGQ6IEd1aWxkIHwgdW5kZWZpbmVkID0gYXdhaXQgZ2F0ZXdheS5jbGllbnQuZ3VpbGRzLmdldChkLmd1aWxkX2lkKVxuICBpZiAoZ3VpbGQgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGVtb2ppcyA9IGF3YWl0IGd1aWxkLmVtb2ppcy5jb2xsZWN0aW9uKClcbiAgICBjb25zdCBkZWxldGVkOiBFbW9qaVtdID0gW11cbiAgICBjb25zdCBhZGRlZDogRW1vamlbXSA9IFtdXG4gICAgY29uc3QgdXBkYXRlZDogQXJyYXk8eyBiZWZvcmU6IEVtb2ppOyBhZnRlcjogRW1vamkgfT4gPSBbXVxuICAgIGNvbnN0IF91cGRhdGVkOiBFbW9qaVBheWxvYWRbXSA9IFtdXG5cbiAgICBmb3IgKGNvbnN0IHJhdyBvZiBkLmVtb2ppcykge1xuICAgICAgaWYgKHJhdy51c2VyICE9PSB1bmRlZmluZWQpXG4gICAgICAgIGF3YWl0IGdhdGV3YXkuY2xpZW50LnVzZXJzLnNldChyYXcudXNlci5pZCwgcmF3LnVzZXIpXG4gICAgICBjb25zdCBlbW9qaUlEID0gKHJhdy5pZCAhPT0gbnVsbCA/IHJhdy5pZCA6IHJhdy5uYW1lKSBhcyBzdHJpbmdcbiAgICAgIGNvbnN0IGhhcyA9IGVtb2ppcy5nZXQoZW1vamlJRClcbiAgICAgIGlmIChoYXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhd2FpdCBndWlsZC5lbW9qaXMuc2V0KGVtb2ppSUQsIHJhdylcbiAgICAgICAgY29uc3QgZW1vamkgPSAoYXdhaXQgZ3VpbGQuZW1vamlzLmdldChlbW9qaUlEKSkgYXMgRW1vamlcbiAgICAgICAgYWRkZWQucHVzaChlbW9qaSlcbiAgICAgIH0gZWxzZSBfdXBkYXRlZC5wdXNoKHJhdylcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGVtb2ppIG9mIGVtb2ppcy52YWx1ZXMoKSkge1xuICAgICAgY29uc3QgZW1vamlJRCA9IChlbW9qaS5pZCAhPT0gbnVsbCA/IGVtb2ppLmlkIDogZW1vamkubmFtZSkgYXMgc3RyaW5nXG4gICAgICBjb25zdCBmaW5kID0gX3VwZGF0ZWQuZmluZCgoZSkgPT4ge1xuICAgICAgICBjb25zdCBlSUQgPSBlLmlkICE9PSBudWxsID8gZS5pZCA6IGUubmFtZVxuICAgICAgICByZXR1cm4gZW1vamlJRCA9PT0gZUlEXG4gICAgICB9KVxuICAgICAgaWYgKGZpbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhd2FpdCBndWlsZC5lbW9qaXMuZGVsZXRlKGVtb2ppSUQpXG4gICAgICAgIGRlbGV0ZWQucHVzaChlbW9qaSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IGZvdW5kSUQgPSAoZmluZC5pZCAhPT0gbnVsbCA/IGZpbmQuaWQgOiBmaW5kLm5hbWUpIGFzIHN0cmluZ1xuICAgICAgICBjb25zdCBiZWZvcmUgPSAoYXdhaXQgZ3VpbGQuZW1vamlzLmdldChmb3VuZElEKSkgYXMgRW1vamlcbiAgICAgICAgYXdhaXQgZ3VpbGQuZW1vamlzLnNldChmb3VuZElELCBmaW5kKVxuICAgICAgICBjb25zdCBhZnRlciA9IChhd2FpdCBndWlsZC5lbW9qaXMuZ2V0KGZvdW5kSUQpKSBhcyBFbW9qaVxuICAgICAgICB1cGRhdGVkLnB1c2goeyBiZWZvcmUsIGFmdGVyIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2F0ZXdheS5jbGllbnQuZW1pdCgnZ3VpbGRFbW9qaXNVcGRhdGUnLCBndWlsZClcblxuICAgIGZvciAoY29uc3QgZW1vamkgb2YgZGVsZXRlZCkge1xuICAgICAgZ2F0ZXdheS5jbGllbnQuZW1pdCgnZ3VpbGRFbW9qaURlbGV0ZScsIGVtb2ppKVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgZW1vamkgb2YgYWRkZWQpIHtcbiAgICAgIGdhdGV3YXkuY2xpZW50LmVtaXQoJ2d1aWxkRW1vamlBZGQnLCBlbW9qaSlcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IGVtb2ppIG9mIHVwZGF0ZWQpIHtcbiAgICAgIGdhdGV3YXkuY2xpZW50LmVtaXQoJ2d1aWxkRW1vamlVcGRhdGUnLCBlbW9qaS5iZWZvcmUsIGVtb2ppLmFmdGVyKVxuICAgIH1cbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLE9BQU8sTUFBTSxtQkFBd0MsT0FDbkQsU0FDQSxJQUNHO0lBQ0gsTUFBTSxRQUEyQixNQUFNLFFBQVEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRO0lBQzNFLElBQUksVUFBVSxXQUFXO1FBQ3ZCLE1BQU0sU0FBUyxNQUFNLE1BQU0sTUFBTSxDQUFDLFVBQVU7UUFDNUMsTUFBTSxVQUFtQixFQUFFO1FBQzNCLE1BQU0sUUFBaUIsRUFBRTtRQUN6QixNQUFNLFVBQWtELEVBQUU7UUFDMUQsTUFBTSxXQUEyQixFQUFFO1FBRW5DLEtBQUssTUFBTSxPQUFPLEVBQUUsTUFBTSxDQUFFO1lBQzFCLElBQUksSUFBSSxJQUFJLEtBQUssV0FDZixNQUFNLFFBQVEsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxFQUFFLElBQUksSUFBSTtZQUN0RCxNQUFNLFVBQVcsSUFBSSxFQUFFLEtBQUssSUFBSSxHQUFHLElBQUksRUFBRSxHQUFHLElBQUksSUFBSTtZQUNwRCxNQUFNLE1BQU0sT0FBTyxHQUFHLENBQUM7WUFDdkIsSUFBSSxRQUFRLFdBQVc7Z0JBQ3JCLE1BQU0sTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVM7Z0JBQ2hDLE1BQU0sUUFBUyxNQUFNLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQztnQkFDdEMsTUFBTSxJQUFJLENBQUM7WUFDYixPQUFPLFNBQVMsSUFBSSxDQUFDO1FBQ3ZCO1FBRUEsS0FBSyxNQUFNLFVBQVMsT0FBTyxNQUFNLEdBQUk7WUFDbkMsTUFBTSxXQUFXLE9BQU0sRUFBRSxLQUFLLElBQUksR0FBRyxPQUFNLEVBQUUsR0FBRyxPQUFNLElBQUk7WUFDMUQsTUFBTSxPQUFPLFNBQVMsSUFBSSxDQUFDLENBQUMsSUFBTTtnQkFDaEMsTUFBTSxNQUFNLEVBQUUsRUFBRSxLQUFLLElBQUksR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUk7Z0JBQ3pDLE9BQU8sYUFBWTtZQUNyQjtZQUNBLElBQUksU0FBUyxXQUFXO2dCQUN0QixNQUFNLE1BQU0sTUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDMUIsUUFBUSxJQUFJLENBQUM7WUFDZixPQUFPO2dCQUNMLE1BQU0sVUFBVyxLQUFLLEVBQUUsS0FBSyxJQUFJLEdBQUcsS0FBSyxFQUFFLEdBQUcsS0FBSyxJQUFJO2dCQUN2RCxNQUFNLFNBQVUsTUFBTSxNQUFNLE1BQU0sQ0FBQyxHQUFHLENBQUM7Z0JBQ3ZDLE1BQU0sTUFBTSxNQUFNLENBQUMsR0FBRyxDQUFDLFNBQVM7Z0JBQ2hDLE1BQU0sUUFBUyxNQUFNLE1BQU0sTUFBTSxDQUFDLEdBQUcsQ0FBQztnQkFDdEMsUUFBUSxJQUFJLENBQUM7b0JBQUU7b0JBQVE7Z0JBQU07WUFDL0IsQ0FBQztRQUNIO1FBRUEsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLHFCQUFxQjtRQUV6QyxLQUFLLE1BQU0sVUFBUyxRQUFTO1lBQzNCLFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0I7UUFDMUM7UUFFQSxLQUFLLE1BQU0sVUFBUyxNQUFPO1lBQ3pCLFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUI7UUFDdkM7UUFFQSxLQUFLLE1BQU0sVUFBUyxRQUFTO1lBQzNCLFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyxvQkFBb0IsT0FBTSxNQUFNLEVBQUUsT0FBTSxLQUFLO1FBQ25FO0lBQ0YsQ0FBQztBQUNILEVBQUMifQ==