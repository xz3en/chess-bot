import { ChannelTypes } from '../types/channel.ts';
export function isDMChannel(channel) {
    return channel.type === ChannelTypes.DM;
}
export function isGroupDMChannel(channel) {
    return channel.type === ChannelTypes.GROUP_DM;
}
export function isGuildTextChannel(channel) {
    return channel.type === ChannelTypes.GUILD_TEXT;
}
export function isGuildBasedTextChannel(channel) {
    return channel.type === ChannelTypes.GUILD_TEXT || channel.type === ChannelTypes.GUILD_NEWS || channel.type === ChannelTypes.NEWS_THREAD || channel.type === ChannelTypes.PRIVATE_THREAD || channel.type === ChannelTypes.PUBLIC_THREAD || channel.type === ChannelTypes.GUILD_VOICE;
}
export function isCategoryChannel(channel) {
    return channel.type === ChannelTypes.GUILD_CATEGORY;
}
export function isNewsChannel(channel) {
    return channel.type === ChannelTypes.GUILD_NEWS;
}
export function isVoiceChannel(channel) {
    return channel.type === ChannelTypes.GUILD_VOICE;
}
export function isStageVoiceChannel(channel) {
    return channel.type === ChannelTypes.GUILD_STAGE_VOICE;
}
export function isStoreChannel(channel) {
    return channel.type === ChannelTypes.GUILD_STORE;
}
export function isGuildChannel(channel) {
    return channel.type === ChannelTypes.GUILD_CATEGORY || channel.type === ChannelTypes.GUILD_NEWS || channel.type === ChannelTypes.GUILD_STORE || channel.type === ChannelTypes.GUILD_TEXT || channel.type === ChannelTypes.GUILD_VOICE || channel.type === ChannelTypes.GUILD_STAGE_VOICE || channel.type === ChannelTypes.NEWS_THREAD || channel.type === ChannelTypes.PRIVATE_THREAD || channel.type === ChannelTypes.PUBLIC_THREAD || channel.type === ChannelTypes.GUILD_FORUM;
}
export function isThreadChannel(channel) {
    return channel.type === ChannelTypes.NEWS_THREAD || channel.type === ChannelTypes.PRIVATE_THREAD || channel.type === ChannelTypes.PUBLIC_THREAD;
}
export function isTextChannel(channel) {
    return channel.type === ChannelTypes.DM || channel.type === ChannelTypes.GROUP_DM || channel.type === ChannelTypes.GUILD_TEXT || channel.type === ChannelTypes.GUILD_NEWS || channel.type === ChannelTypes.NEWS_THREAD || channel.type === ChannelTypes.PRIVATE_THREAD || channel.type === ChannelTypes.PUBLIC_THREAD || channel.type === ChannelTypes.GUILD_VOICE;
}
export function isThreadAvailableChannel(channel) {
    return channel.type === ChannelTypes.GUILD_TEXT || channel.type === ChannelTypes.GUILD_NEWS || channel.type === ChannelTypes.GUILD_FORUM;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3V0aWxzL2NoYW5uZWxUeXBlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENoYW5uZWwsIEd1aWxkQ2hhbm5lbCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvY2hhbm5lbC50cydcbmltcG9ydCB0eXBlIHsgRE1DaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9kbUNoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IEdyb3VwRE1DaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9ncm91cENoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IENhdGVnb3J5Q2hhbm5lbCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvZ3VpbGRDYXRlZ29yeUNoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IE5ld3NDaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9ndWlsZE5ld3NDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBTdG9yZUNoYW5uZWwgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2d1aWxkU3RvcmVDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUge1xuICBHdWlsZFRleHRCYXNlZENoYW5uZWwsXG4gIEd1aWxkVGV4dENoYW5uZWxcbn0gZnJvbSAnLi4vc3RydWN0dXJlcy9ndWlsZFRleHRDaGFubmVsLnRzJ1xuaW1wb3J0IHsgR3VpbGRUaHJlYWRBdmFpbGFibGVDaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9ndWlsZFRocmVhZEF2YWlsYWJsZUNoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IFZvaWNlQ2hhbm5lbCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvZ3VpbGRWb2ljZUNoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IFN0YWdlVm9pY2VDaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9ndWlsZFZvaWNlU3RhZ2VDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBUZXh0Q2hhbm5lbCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvdGV4dENoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IFRocmVhZENoYW5uZWwgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL3RocmVhZENoYW5uZWwudHMnXG5pbXBvcnQgeyBDaGFubmVsVHlwZXMgfSBmcm9tICcuLi90eXBlcy9jaGFubmVsLnRzJ1xuXG5leHBvcnQgZnVuY3Rpb24gaXNETUNoYW5uZWwoY2hhbm5lbDogQ2hhbm5lbCk6IGNoYW5uZWwgaXMgRE1DaGFubmVsIHtcbiAgcmV0dXJuIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLkRNXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0dyb3VwRE1DaGFubmVsKGNoYW5uZWw6IENoYW5uZWwpOiBjaGFubmVsIGlzIEdyb3VwRE1DaGFubmVsIHtcbiAgcmV0dXJuIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLkdST1VQX0RNXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0d1aWxkVGV4dENoYW5uZWwoXG4gIGNoYW5uZWw6IENoYW5uZWxcbik6IGNoYW5uZWwgaXMgR3VpbGRUZXh0Q2hhbm5lbCB7XG4gIHJldHVybiBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5HVUlMRF9URVhUXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0d1aWxkQmFzZWRUZXh0Q2hhbm5lbChcbiAgY2hhbm5lbDogQ2hhbm5lbFxuKTogY2hhbm5lbCBpcyBHdWlsZFRleHRCYXNlZENoYW5uZWwge1xuICByZXR1cm4gKFxuICAgIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLkdVSUxEX1RFWFQgfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5HVUlMRF9ORVdTIHx8XG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuTkVXU19USFJFQUQgfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5QUklWQVRFX1RIUkVBRCB8fFxuICAgIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLlBVQkxJQ19USFJFQUQgfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5HVUlMRF9WT0lDRVxuICApXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0NhdGVnb3J5Q2hhbm5lbChcbiAgY2hhbm5lbDogQ2hhbm5lbFxuKTogY2hhbm5lbCBpcyBDYXRlZ29yeUNoYW5uZWwge1xuICByZXR1cm4gY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfQ0FURUdPUllcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTmV3c0NoYW5uZWwoY2hhbm5lbDogQ2hhbm5lbCk6IGNoYW5uZWwgaXMgTmV3c0NoYW5uZWwge1xuICByZXR1cm4gY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfTkVXU1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNWb2ljZUNoYW5uZWwoY2hhbm5lbDogQ2hhbm5lbCk6IGNoYW5uZWwgaXMgVm9pY2VDaGFubmVsIHtcbiAgcmV0dXJuIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLkdVSUxEX1ZPSUNFXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0YWdlVm9pY2VDaGFubmVsKFxuICBjaGFubmVsOiBDaGFubmVsXG4pOiBjaGFubmVsIGlzIFN0YWdlVm9pY2VDaGFubmVsIHtcbiAgcmV0dXJuIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLkdVSUxEX1NUQUdFX1ZPSUNFXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc1N0b3JlQ2hhbm5lbChjaGFubmVsOiBDaGFubmVsKTogY2hhbm5lbCBpcyBTdG9yZUNoYW5uZWwge1xuICByZXR1cm4gY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfU1RPUkVcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzR3VpbGRDaGFubmVsKGNoYW5uZWw6IENoYW5uZWwpOiBjaGFubmVsIGlzIEd1aWxkQ2hhbm5lbCB7XG4gIHJldHVybiAoXG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfQ0FURUdPUlkgfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5HVUlMRF9ORVdTIHx8XG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfU1RPUkUgfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5HVUlMRF9URVhUIHx8XG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfVk9JQ0UgfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5HVUlMRF9TVEFHRV9WT0lDRSB8fFxuICAgIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLk5FV1NfVEhSRUFEIHx8XG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuUFJJVkFURV9USFJFQUQgfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5QVUJMSUNfVEhSRUFEIHx8XG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfRk9SVU1cbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUaHJlYWRDaGFubmVsKGNoYW5uZWw6IENoYW5uZWwpOiBjaGFubmVsIGlzIFRocmVhZENoYW5uZWwge1xuICByZXR1cm4gKFxuICAgIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLk5FV1NfVEhSRUFEIHx8XG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuUFJJVkFURV9USFJFQUQgfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5QVUJMSUNfVEhSRUFEXG4gIClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzVGV4dENoYW5uZWwoY2hhbm5lbDogQ2hhbm5lbCk6IGNoYW5uZWwgaXMgVGV4dENoYW5uZWwge1xuICByZXR1cm4gKFxuICAgIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLkRNIHx8XG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1JPVVBfRE0gfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5HVUlMRF9URVhUIHx8XG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfTkVXUyB8fFxuICAgIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLk5FV1NfVEhSRUFEIHx8XG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuUFJJVkFURV9USFJFQUQgfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5QVUJMSUNfVEhSRUFEIHx8XG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfVk9JQ0VcbiAgKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNUaHJlYWRBdmFpbGFibGVDaGFubmVsKFxuICBjaGFubmVsOiBDaGFubmVsXG4pOiBjaGFubmVsIGlzIEd1aWxkVGhyZWFkQXZhaWxhYmxlQ2hhbm5lbCB7XG4gIHJldHVybiAoXG4gICAgY2hhbm5lbC50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfVEVYVCB8fFxuICAgIGNoYW5uZWwudHlwZSA9PT0gQ2hhbm5lbFR5cGVzLkdVSUxEX05FV1MgfHxcbiAgICBjaGFubmVsLnR5cGUgPT09IENoYW5uZWxUeXBlcy5HVUlMRF9GT1JVTVxuICApXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBZUEsU0FBUyxZQUFZLFFBQVEsc0JBQXFCO0FBRWxELE9BQU8sU0FBUyxZQUFZLE9BQWdCLEVBQXdCO0lBQ2xFLE9BQU8sUUFBUSxJQUFJLEtBQUssYUFBYSxFQUFFO0FBQ3pDLENBQUM7QUFFRCxPQUFPLFNBQVMsaUJBQWlCLE9BQWdCLEVBQTZCO0lBQzVFLE9BQU8sUUFBUSxJQUFJLEtBQUssYUFBYSxRQUFRO0FBQy9DLENBQUM7QUFFRCxPQUFPLFNBQVMsbUJBQ2QsT0FBZ0IsRUFDYTtJQUM3QixPQUFPLFFBQVEsSUFBSSxLQUFLLGFBQWEsVUFBVTtBQUNq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