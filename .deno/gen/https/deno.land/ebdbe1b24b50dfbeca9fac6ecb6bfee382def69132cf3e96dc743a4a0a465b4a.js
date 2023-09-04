import { ChannelTypes } from '../types/channel.ts';
import { Base } from './base.ts';
export class VoiceState extends Base {
    guild;
    channelID;
    channel;
    user;
    member;
    sessionID;
    deaf;
    mute;
    selfDeaf;
    selfMute;
    stream;
    video;
    suppress;
    constructor(client, data, _data){
        super(client, data);
        this.channel = _data.channel;
        this.user = _data.user;
        this.member = _data.member;
        this.guild = _data.guild;
        this.readFromData(data);
    }
    readFromData(data) {
        this.sessionID = data.session_id ?? this.sessionID;
        this.deaf = data.deaf ?? this.deaf;
        this.channelID = data.channel_id ?? this.channelID;
        this.mute = data.mute ?? this.mute;
        this.selfDeaf = data.self_deaf ?? this.selfDeaf;
        this.selfMute = data.self_mute ?? this.selfMute;
        this.stream = data.self_stream ?? this.stream;
        this.video = data.self_video ?? this.video;
        this.suppress = data.suppress ?? this.suppress;
    }
    /**
   * Disconnects a Member from connected VC
   */ async disconnect() {
        const result = this.member?.disconnectVoice();
        if (result !== undefined) {
            this.channelID = null;
            this.channel = null;
        }
        return result;
    }
    /**
   * Moves a Member to another VC
   * @param channel Channel to move(null or undefined to disconnect)
   */ async moveChannel(channel) {
        const result = this.member?.moveVoiceChannel(channel);
        if (result !== undefined) {
            let channelFetched;
            let channelID;
            if (typeof channel === 'string') {
                channelID = channel;
                const channelCached = await this.guild?.channels.fetch(channel);
                if (channelCached?.type === ChannelTypes.GUILD_VOICE) {
                    channelFetched = channelCached;
                } else {
                    throw new Error(`Channel ${channel} is not a VoiceChannel.`);
                }
            } else {
                channelID = channel?.id ?? null;
                channelFetched = channel ?? null;
            }
            this.channelID = channelID;
            this.channel = channelFetched;
        }
        return result;
    }
    /**
   * Sets a Member mute in VC
   * @param mute Value to set
   */ async setMute(mute) {
        return this.member?.setMute(mute);
    }
    /**
   * Sets a Member deaf in VC
   * @param deaf Value to set
   */ async setDeaf(deaf) {
        return this.member?.setDeaf(deaf);
    }
    /**
   * Unmutes the Member from VC.
   */ async unmute() {
        return await this.setMute(false);
    }
    /**
   * Undeafs the Member from VC.
   */ async undeaf() {
        return await this.setDeaf(false);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvdm9pY2VTdGF0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgeyBDaGFubmVsVHlwZXMgfSBmcm9tICcuLi90eXBlcy9jaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBWb2ljZVN0YXRlUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzL3ZvaWNlLnRzJ1xuaW1wb3J0IHsgQmFzZSB9IGZyb20gJy4vYmFzZS50cydcbmltcG9ydCB0eXBlIHsgR3VpbGQgfSBmcm9tICcuL2d1aWxkLnRzJ1xuaW1wb3J0IHR5cGUgeyBWb2ljZUNoYW5uZWwgfSBmcm9tICcuL2d1aWxkVm9pY2VDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBNZW1iZXIgfSBmcm9tICcuL21lbWJlci50cydcbmltcG9ydCB0eXBlIHsgVXNlciB9IGZyb20gJy4vdXNlci50cydcblxuZXhwb3J0IGNsYXNzIFZvaWNlU3RhdGUgZXh0ZW5kcyBCYXNlIHtcbiAgZ3VpbGQ/OiBHdWlsZFxuICBjaGFubmVsSUQhOiBzdHJpbmcgfCBudWxsXG4gIGNoYW5uZWw6IFZvaWNlQ2hhbm5lbCB8IG51bGxcbiAgdXNlcjogVXNlclxuICBtZW1iZXI/OiBNZW1iZXJcbiAgc2Vzc2lvbklEITogc3RyaW5nXG4gIGRlYWYhOiBib29sZWFuXG4gIG11dGUhOiBib29sZWFuXG4gIHNlbGZEZWFmITogYm9vbGVhblxuICBzZWxmTXV0ZSE6IGJvb2xlYW5cbiAgc3RyZWFtPzogYm9vbGVhblxuICB2aWRlbyE6IGJvb2xlYW5cbiAgc3VwcHJlc3MhOiBib29sZWFuXG5cbiAgY29uc3RydWN0b3IoXG4gICAgY2xpZW50OiBDbGllbnQsXG4gICAgZGF0YTogVm9pY2VTdGF0ZVBheWxvYWQsXG4gICAgX2RhdGE6IHtcbiAgICAgIHVzZXI6IFVzZXJcbiAgICAgIGNoYW5uZWw6IFZvaWNlQ2hhbm5lbCB8IG51bGxcbiAgICAgIG1lbWJlcj86IE1lbWJlclxuICAgICAgZ3VpbGQ/OiBHdWlsZFxuICAgIH1cbiAgKSB7XG4gICAgc3VwZXIoY2xpZW50LCBkYXRhKVxuICAgIHRoaXMuY2hhbm5lbCA9IF9kYXRhLmNoYW5uZWxcbiAgICB0aGlzLnVzZXIgPSBfZGF0YS51c2VyXG4gICAgdGhpcy5tZW1iZXIgPSBfZGF0YS5tZW1iZXJcbiAgICB0aGlzLmd1aWxkID0gX2RhdGEuZ3VpbGRcbiAgICB0aGlzLnJlYWRGcm9tRGF0YShkYXRhKVxuICB9XG5cbiAgcmVhZEZyb21EYXRhKGRhdGE6IFZvaWNlU3RhdGVQYXlsb2FkKTogdm9pZCB7XG4gICAgdGhpcy5zZXNzaW9uSUQgPSBkYXRhLnNlc3Npb25faWQgPz8gdGhpcy5zZXNzaW9uSURcbiAgICB0aGlzLmRlYWYgPSBkYXRhLmRlYWYgPz8gdGhpcy5kZWFmXG4gICAgdGhpcy5jaGFubmVsSUQgPSBkYXRhLmNoYW5uZWxfaWQgPz8gdGhpcy5jaGFubmVsSURcbiAgICB0aGlzLm11dGUgPSBkYXRhLm11dGUgPz8gdGhpcy5tdXRlXG4gICAgdGhpcy5zZWxmRGVhZiA9IGRhdGEuc2VsZl9kZWFmID8/IHRoaXMuc2VsZkRlYWZcbiAgICB0aGlzLnNlbGZNdXRlID0gZGF0YS5zZWxmX211dGUgPz8gdGhpcy5zZWxmTXV0ZVxuICAgIHRoaXMuc3RyZWFtID0gZGF0YS5zZWxmX3N0cmVhbSA/PyB0aGlzLnN0cmVhbVxuICAgIHRoaXMudmlkZW8gPSBkYXRhLnNlbGZfdmlkZW8gPz8gdGhpcy52aWRlb1xuICAgIHRoaXMuc3VwcHJlc3MgPSBkYXRhLnN1cHByZXNzID8/IHRoaXMuc3VwcHJlc3NcbiAgfVxuXG4gIC8qKlxuICAgKiBEaXNjb25uZWN0cyBhIE1lbWJlciBmcm9tIGNvbm5lY3RlZCBWQ1xuICAgKi9cbiAgYXN5bmMgZGlzY29ubmVjdCgpOiBQcm9taXNlPE1lbWJlciB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IHJlc3VsdCA9IHRoaXMubWVtYmVyPy5kaXNjb25uZWN0Vm9pY2UoKVxuICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhpcy5jaGFubmVsSUQgPSBudWxsXG4gICAgICB0aGlzLmNoYW5uZWwgPSBudWxsXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyBhIE1lbWJlciB0byBhbm90aGVyIFZDXG4gICAqIEBwYXJhbSBjaGFubmVsIENoYW5uZWwgdG8gbW92ZShudWxsIG9yIHVuZGVmaW5lZCB0byBkaXNjb25uZWN0KVxuICAgKi9cbiAgYXN5bmMgbW92ZUNoYW5uZWwoXG4gICAgY2hhbm5lbD86IHN0cmluZyB8IFZvaWNlQ2hhbm5lbCB8IG51bGxcbiAgKTogUHJvbWlzZTxNZW1iZXIgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCByZXN1bHQgPSB0aGlzLm1lbWJlcj8ubW92ZVZvaWNlQ2hhbm5lbChjaGFubmVsKVxuICAgIGlmIChyZXN1bHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgbGV0IGNoYW5uZWxGZXRjaGVkOiBWb2ljZUNoYW5uZWwgfCBudWxsXG4gICAgICBsZXQgY2hhbm5lbElEOiBzdHJpbmcgfCBudWxsXG4gICAgICBpZiAodHlwZW9mIGNoYW5uZWwgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIGNoYW5uZWxJRCA9IGNoYW5uZWxcbiAgICAgICAgY29uc3QgY2hhbm5lbENhY2hlZCA9IGF3YWl0IHRoaXMuZ3VpbGQ/LmNoYW5uZWxzLmZldGNoKGNoYW5uZWwpXG4gICAgICAgIGlmIChjaGFubmVsQ2FjaGVkPy50eXBlID09PSBDaGFubmVsVHlwZXMuR1VJTERfVk9JQ0UpIHtcbiAgICAgICAgICBjaGFubmVsRmV0Y2hlZCA9IGNoYW5uZWxDYWNoZWQgYXMgVm9pY2VDaGFubmVsXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDaGFubmVsICR7Y2hhbm5lbH0gaXMgbm90IGEgVm9pY2VDaGFubmVsLmApXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNoYW5uZWxJRCA9IGNoYW5uZWw/LmlkID8/IG51bGxcbiAgICAgICAgY2hhbm5lbEZldGNoZWQgPSBjaGFubmVsID8/IG51bGxcbiAgICAgIH1cbiAgICAgIHRoaXMuY2hhbm5lbElEID0gY2hhbm5lbElEXG4gICAgICB0aGlzLmNoYW5uZWwgPSBjaGFubmVsRmV0Y2hlZFxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIE1lbWJlciBtdXRlIGluIFZDXG4gICAqIEBwYXJhbSBtdXRlIFZhbHVlIHRvIHNldFxuICAgKi9cbiAgYXN5bmMgc2V0TXV0ZShtdXRlPzogYm9vbGVhbik6IFByb21pc2U8TWVtYmVyIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIHRoaXMubWVtYmVyPy5zZXRNdXRlKG11dGUpXG4gIH1cblxuICAvKipcbiAgICogU2V0cyBhIE1lbWJlciBkZWFmIGluIFZDXG4gICAqIEBwYXJhbSBkZWFmIFZhbHVlIHRvIHNldFxuICAgKi9cbiAgYXN5bmMgc2V0RGVhZihkZWFmPzogYm9vbGVhbik6IFByb21pc2U8TWVtYmVyIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIHRoaXMubWVtYmVyPy5zZXREZWFmKGRlYWYpXG4gIH1cblxuICAvKipcbiAgICogVW5tdXRlcyB0aGUgTWVtYmVyIGZyb20gVkMuXG4gICAqL1xuICBhc3luYyB1bm11dGUoKTogUHJvbWlzZTxNZW1iZXIgfCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zZXRNdXRlKGZhbHNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFVuZGVhZnMgdGhlIE1lbWJlciBmcm9tIFZDLlxuICAgKi9cbiAgYXN5bmMgdW5kZWFmKCk6IFByb21pc2U8TWVtYmVyIHwgdW5kZWZpbmVkPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc2V0RGVhZihmYWxzZSlcbiAg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