import { Message } from '../../structures/message.ts';
import { User } from '../../structures/user.ts';
export const messageCreate = async (gateway, d)=>{
    let channel = await gateway.client.channels.get(d.channel_id);
    // Fetch the channel if not cached.
    // Commented out right now as it causes some undefined behavior.
    // if (channel === undefined)
    //   // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    //   channel = (await gateway.client.channels.fetch(d.channel_id)) as TextChannel
    if (channel === undefined) {
        if (d.guild_id === undefined) {
            // Let's assume it's a DM channel.
            await gateway.client.channels.set(d.channel_id, {
                id: d.channel_id,
                type: 1,
                flags: 0
            });
            channel = await gateway.client.channels.get(d.channel_id);
        } else return;
    }
    await channel.messages.set(d.id, d);
    const user = new User(gateway.client, d.author);
    await gateway.client.users.set(d.author.id, d.author);
    let guild;
    let member;
    if (d.guild_id !== undefined) {
        guild = await gateway.client.guilds.get(d.guild_id);
    }
    if (guild !== undefined && d.member !== undefined) {
        d.member.user = d.author;
        await guild.members.set(d.author.id, d.member);
        member = await guild.members.get(d.author.id);
    }
    const message = new Message(gateway.client, d, channel, user);
    if (guild !== undefined) message.guild = guild;
    await message.mentions.fromPayload(d);
    message.member = member;
    if (message.member !== undefined) {
        if (message.member.user === undefined) {
            const user1 = await gateway.client.users.get(message.member.id);
            if (user1 !== undefined) {
                message.member.user = user1;
            }
        }
    }
    gateway.client.emit('messageCreate', message);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2dhdGV3YXkvaGFuZGxlcnMvbWVzc2FnZUNyZWF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBNZXNzYWdlIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9tZXNzYWdlLnRzJ1xuaW1wb3J0IHR5cGUgeyBUZXh0Q2hhbm5lbCB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvdGV4dENoYW5uZWwudHMnXG5pbXBvcnQgeyBVc2VyIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy91c2VyLnRzJ1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlUGF5bG9hZCB9IGZyb20gJy4uLy4uL3R5cGVzL2NoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IEdhdGV3YXksIEdhdGV3YXlFdmVudEhhbmRsZXIgfSBmcm9tICcuLi9tb2QudHMnXG5cbmV4cG9ydCBjb25zdCBtZXNzYWdlQ3JlYXRlOiBHYXRld2F5RXZlbnRIYW5kbGVyID0gYXN5bmMgKFxuICBnYXRld2F5OiBHYXRld2F5LFxuICBkOiBNZXNzYWdlUGF5bG9hZFxuKSA9PiB7XG4gIGxldCBjaGFubmVsID0gYXdhaXQgZ2F0ZXdheS5jbGllbnQuY2hhbm5lbHMuZ2V0PFRleHRDaGFubmVsPihkLmNoYW5uZWxfaWQpXG4gIC8vIEZldGNoIHRoZSBjaGFubmVsIGlmIG5vdCBjYWNoZWQuXG4gIC8vIENvbW1lbnRlZCBvdXQgcmlnaHQgbm93IGFzIGl0IGNhdXNlcyBzb21lIHVuZGVmaW5lZCBiZWhhdmlvci5cbiAgLy8gaWYgKGNoYW5uZWwgPT09IHVuZGVmaW5lZClcbiAgLy8gICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gIC8vICAgY2hhbm5lbCA9IChhd2FpdCBnYXRld2F5LmNsaWVudC5jaGFubmVscy5mZXRjaChkLmNoYW5uZWxfaWQpKSBhcyBUZXh0Q2hhbm5lbFxuICBpZiAoY2hhbm5lbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgaWYgKGQuZ3VpbGRfaWQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgLy8gTGV0J3MgYXNzdW1lIGl0J3MgYSBETSBjaGFubmVsLlxuICAgICAgYXdhaXQgZ2F0ZXdheS5jbGllbnQuY2hhbm5lbHMuc2V0KGQuY2hhbm5lbF9pZCwge1xuICAgICAgICBpZDogZC5jaGFubmVsX2lkLFxuICAgICAgICB0eXBlOiAxLFxuICAgICAgICBmbGFnczogMFxuICAgICAgfSlcbiAgICAgIGNoYW5uZWwgPSAoYXdhaXQgZ2F0ZXdheS5jbGllbnQuY2hhbm5lbHMuZ2V0PFRleHRDaGFubmVsPihkLmNoYW5uZWxfaWQpKSFcbiAgICB9IGVsc2UgcmV0dXJuXG4gIH1cbiAgYXdhaXQgY2hhbm5lbC5tZXNzYWdlcy5zZXQoZC5pZCwgZClcbiAgY29uc3QgdXNlciA9IG5ldyBVc2VyKGdhdGV3YXkuY2xpZW50LCBkLmF1dGhvcilcbiAgYXdhaXQgZ2F0ZXdheS5jbGllbnQudXNlcnMuc2V0KGQuYXV0aG9yLmlkLCBkLmF1dGhvcilcbiAgbGV0IGd1aWxkXG4gIGxldCBtZW1iZXJcbiAgaWYgKGQuZ3VpbGRfaWQgIT09IHVuZGVmaW5lZCkge1xuICAgIGd1aWxkID0gYXdhaXQgZ2F0ZXdheS5jbGllbnQuZ3VpbGRzLmdldChkLmd1aWxkX2lkKVxuICB9XG4gIGlmIChndWlsZCAhPT0gdW5kZWZpbmVkICYmIGQubWVtYmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICBkLm1lbWJlci51c2VyID0gZC5hdXRob3JcbiAgICBhd2FpdCBndWlsZC5tZW1iZXJzLnNldChkLmF1dGhvci5pZCwgZC5tZW1iZXIpXG4gICAgbWVtYmVyID0gYXdhaXQgZ3VpbGQubWVtYmVycy5nZXQoZC5hdXRob3IuaWQpXG4gIH1cbiAgY29uc3QgbWVzc2FnZSA9IG5ldyBNZXNzYWdlKGdhdGV3YXkuY2xpZW50LCBkLCBjaGFubmVsLCB1c2VyKVxuICBpZiAoZ3VpbGQgIT09IHVuZGVmaW5lZCkgbWVzc2FnZS5ndWlsZCA9IGd1aWxkXG4gIGF3YWl0IG1lc3NhZ2UubWVudGlvbnMuZnJvbVBheWxvYWQoZClcbiAgbWVzc2FnZS5tZW1iZXIgPSBtZW1iZXJcbiAgaWYgKG1lc3NhZ2UubWVtYmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICBpZiAobWVzc2FnZS5tZW1iZXIudXNlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCB1c2VyID0gYXdhaXQgZ2F0ZXdheS5jbGllbnQudXNlcnMuZ2V0KG1lc3NhZ2UubWVtYmVyLmlkKVxuICAgICAgaWYgKHVzZXIgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBtZXNzYWdlLm1lbWJlci51c2VyID0gdXNlclxuICAgICAgfVxuICAgIH1cbiAgfVxuICBnYXRld2F5LmNsaWVudC5lbWl0KCdtZXNzYWdlQ3JlYXRlJywgbWVzc2FnZSlcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLE9BQU8sUUFBUSw4QkFBNkI7QUFFckQsU0FBUyxJQUFJLFFBQVEsMkJBQTBCO0FBSS9DLE9BQU8sTUFBTSxnQkFBcUMsT0FDaEQsU0FDQSxJQUNHO0lBQ0gsSUFBSSxVQUFVLE1BQU0sUUFBUSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBYyxFQUFFLFVBQVU7SUFDekUsbUNBQW1DO0lBQ25DLGdFQUFnRTtJQUNoRSw2QkFBNkI7SUFDN0IsaUZBQWlGO0lBQ2pGLGlGQUFpRjtJQUNqRixJQUFJLFlBQVksV0FBVztRQUN6QixJQUFJLEVBQUUsUUFBUSxLQUFLLFdBQVc7WUFDNUIsa0NBQWtDO1lBQ2xDLE1BQU0sUUFBUSxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLFVBQVUsRUFBRTtnQkFDOUMsSUFBSSxFQUFFLFVBQVU7Z0JBQ2hCLE1BQU07Z0JBQ04sT0FBTztZQUNUO1lBQ0EsVUFBVyxNQUFNLFFBQVEsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQWMsRUFBRSxVQUFVO1FBQ3hFLE9BQU87SUFDVCxDQUFDO0lBQ0QsTUFBTSxRQUFRLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFLEVBQUU7SUFDakMsTUFBTSxPQUFPLElBQUksS0FBSyxRQUFRLE1BQU0sRUFBRSxFQUFFLE1BQU07SUFDOUMsTUFBTSxRQUFRLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU07SUFDcEQsSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJLEVBQUUsUUFBUSxLQUFLLFdBQVc7UUFDNUIsUUFBUSxNQUFNLFFBQVEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxRQUFRO0lBQ3BELENBQUM7SUFDRCxJQUFJLFVBQVUsYUFBYSxFQUFFLE1BQU0sS0FBSyxXQUFXO1FBQ2pELEVBQUUsTUFBTSxDQUFDLElBQUksR0FBRyxFQUFFLE1BQU07UUFDeEIsTUFBTSxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsTUFBTTtRQUM3QyxTQUFTLE1BQU0sTUFBTSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQUU7SUFDOUMsQ0FBQztJQUNELE1BQU0sVUFBVSxJQUFJLFFBQVEsUUFBUSxNQUFNLEVBQUUsR0FBRyxTQUFTO0lBQ3hELElBQUksVUFBVSxXQUFXLFFBQVEsS0FBSyxHQUFHO0lBQ3pDLE1BQU0sUUFBUSxRQUFRLENBQUMsV0FBVyxDQUFDO0lBQ25DLFFBQVEsTUFBTSxHQUFHO0lBQ2pCLElBQUksUUFBUSxNQUFNLEtBQUssV0FBVztRQUNoQyxJQUFJLFFBQVEsTUFBTSxDQUFDLElBQUksS0FBSyxXQUFXO1lBQ3JDLE1BQU0sUUFBTyxNQUFNLFFBQVEsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxNQUFNLENBQUMsRUFBRTtZQUM3RCxJQUFJLFVBQVMsV0FBVztnQkFDdEIsUUFBUSxNQUFNLENBQUMsSUFBSSxHQUFHO1lBQ3hCLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUNELFFBQVEsTUFBTSxDQUFDLElBQUksQ0FBQyxpQkFBaUI7QUFDdkMsRUFBQyJ9