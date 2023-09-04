export const messageDelete = async (gateway, d)=>{
    const channel = await gateway.client.channels.get(d.channel_id);
    // if (channel === undefined)
    //   // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    //   channel = (await gateway.client.channels.fetch(d.channel_id)) as TextChannel
    if (channel === undefined) return;
    const message = await channel.messages.get(d.id);
    if (message === undefined) return gateway.client.emit('messageDeleteUncached', d);
    await channel.messages._delete(d.id);
    gateway.client.emit('messageDelete', message);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2dhdGV3YXkvaGFuZGxlcnMvbWVzc2FnZURlbGV0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFRleHRDaGFubmVsIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy90ZXh0Q2hhbm5lbC50cydcbmltcG9ydCB0eXBlIHsgTWVzc2FnZURlbGV0ZVBheWxvYWQgfSBmcm9tICcuLi8uLi90eXBlcy9nYXRld2F5LnRzJ1xuaW1wb3J0IHR5cGUgeyBHYXRld2F5LCBHYXRld2F5RXZlbnRIYW5kbGVyIH0gZnJvbSAnLi4vbW9kLnRzJ1xuXG5leHBvcnQgY29uc3QgbWVzc2FnZURlbGV0ZTogR2F0ZXdheUV2ZW50SGFuZGxlciA9IGFzeW5jIChcbiAgZ2F0ZXdheTogR2F0ZXdheSxcbiAgZDogTWVzc2FnZURlbGV0ZVBheWxvYWRcbikgPT4ge1xuICBjb25zdCBjaGFubmVsID0gYXdhaXQgZ2F0ZXdheS5jbGllbnQuY2hhbm5lbHMuZ2V0PFRleHRDaGFubmVsPihkLmNoYW5uZWxfaWQpXG4gIC8vIGlmIChjaGFubmVsID09PSB1bmRlZmluZWQpXG4gIC8vICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS10eXBlLWFzc2VydGlvblxuICAvLyAgIGNoYW5uZWwgPSAoYXdhaXQgZ2F0ZXdheS5jbGllbnQuY2hhbm5lbHMuZmV0Y2goZC5jaGFubmVsX2lkKSkgYXMgVGV4dENoYW5uZWxcbiAgaWYgKGNoYW5uZWwgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gIGNvbnN0IG1lc3NhZ2UgPSBhd2FpdCBjaGFubmVsLm1lc3NhZ2VzLmdldChkLmlkKVxuICBpZiAobWVzc2FnZSA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBnYXRld2F5LmNsaWVudC5lbWl0KCdtZXNzYWdlRGVsZXRlVW5jYWNoZWQnLCBkKVxuICBhd2FpdCBjaGFubmVsLm1lc3NhZ2VzLl9kZWxldGUoZC5pZClcbiAgZ2F0ZXdheS5jbGllbnQuZW1pdCgnbWVzc2FnZURlbGV0ZScsIG1lc3NhZ2UpXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBSUEsT0FBTyxNQUFNLGdCQUFxQyxPQUNoRCxTQUNBLElBQ0c7SUFDSCxNQUFNLFVBQVUsTUFBTSxRQUFRLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFjLEVBQUUsVUFBVTtJQUMzRSw2QkFBNkI7SUFDN0IsaUZBQWlGO0lBQ2pGLGlGQUFpRjtJQUNqRixJQUFJLFlBQVksV0FBVztJQUMzQixNQUFNLFVBQVUsTUFBTSxRQUFRLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFFO0lBQy9DLElBQUksWUFBWSxXQUNkLE9BQU8sUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLHlCQUF5QjtJQUN0RCxNQUFNLFFBQVEsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUU7SUFDbkMsUUFBUSxNQUFNLENBQUMsSUFBSSxDQUFDLGlCQUFpQjtBQUN2QyxFQUFDIn0=