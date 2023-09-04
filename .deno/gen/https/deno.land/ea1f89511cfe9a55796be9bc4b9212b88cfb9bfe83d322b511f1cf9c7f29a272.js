import { CHANNEL } from '../types/endpoint.ts';
import { GuildChannel } from './channel.ts';
import { GuildChannelVoiceStatesManager } from '../managers/guildChannelVoiceStates.ts';
import { Mixin } from '../../deps.ts';
import { TextChannel } from './textChannel.ts';
export class VoiceChannel extends Mixin(GuildChannel, TextChannel) {
    bitrate;
    userLimit;
    voiceStates = new GuildChannelVoiceStatesManager(this.client, this.guild.voiceStates, this);
    constructor(client, data, guild){
        super(client, data, guild);
        this.readFromData(data);
    }
    /** Join the Voice Channel */ async join(options) {
        return this.client.voice.join(this.id, options);
    }
    /** Leave the Voice Channel */ async leave() {
        return this.client.voice.leave(this.guild);
    }
    readFromData(data) {
        super.readFromData(data);
        this.bitrate = data.bitrate ?? this.bitrate;
        this.userLimit = data.user_limit ?? this.userLimit;
    }
    async edit(options) {
        const body = {
            name: options?.name,
            position: options?.position,
            permission_overwrites: options?.permissionOverwrites,
            parent_id: options?.parentID,
            bitrate: options?.bitrate,
            user_limit: options?.userLimit
        };
        const resp = await this.client.rest.patch(CHANNEL(this.id), body);
        return new VoiceChannel(this.client, resp, this.guild);
    }
    async setBitrate(rate) {
        return await this.edit({
            bitrate: rate
        });
    }
    async setUserLimit(limit) {
        return await this.edit({
            userLimit: limit
        });
    }
    async disconnectMember(member) {
        const memberID = typeof member === 'string' ? member : member.id;
        const memberVoiceState = await this.voiceStates.get(memberID);
        return memberVoiceState?.disconnect();
    }
    async disconnectAll() {
        const members = [];
        for await (const memberVoiceState of this.voiceStates){
            const member = await memberVoiceState.disconnect();
            if (member !== undefined) {
                members.push(member);
            }
        }
        return members;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvZ3VpbGRWb2ljZUNoYW5uZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuaW1wb3J0IHR5cGUge1xuICBHdWlsZFZvaWNlQ2hhbm5lbFBheWxvYWQsXG4gIE1vZGlmeVZvaWNlQ2hhbm5lbE9wdGlvbixcbiAgTW9kaWZ5Vm9pY2VDaGFubmVsUGF5bG9hZFxufSBmcm9tICcuLi90eXBlcy9jaGFubmVsLnRzJ1xuaW1wb3J0IHsgQ0hBTk5FTCB9IGZyb20gJy4uL3R5cGVzL2VuZHBvaW50LnRzJ1xuaW1wb3J0IHsgR3VpbGRDaGFubmVsIH0gZnJvbSAnLi9jaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBHdWlsZCB9IGZyb20gJy4vZ3VpbGQudHMnXG5pbXBvcnQgeyBHdWlsZENoYW5uZWxWb2ljZVN0YXRlc01hbmFnZXIgfSBmcm9tICcuLi9tYW5hZ2Vycy9ndWlsZENoYW5uZWxWb2ljZVN0YXRlcy50cydcbmltcG9ydCB0eXBlIHsgVXNlciB9IGZyb20gJy4vdXNlci50cydcbmltcG9ydCB0eXBlIHsgTWVtYmVyIH0gZnJvbSAnLi9tZW1iZXIudHMnXG5pbXBvcnQgdHlwZSB7XG4gIFZvaWNlQ2hhbm5lbEpvaW5PcHRpb25zLFxuICBWb2ljZVNlcnZlckRhdGFcbn0gZnJvbSAnLi4vY2xpZW50L3ZvaWNlLnRzJ1xuaW1wb3J0IHsgTWl4aW4gfSBmcm9tICcuLi8uLi9kZXBzLnRzJ1xuaW1wb3J0IHsgVGV4dENoYW5uZWwgfSBmcm9tICcuL3RleHRDaGFubmVsLnRzJ1xuXG5leHBvcnQgY2xhc3MgVm9pY2VDaGFubmVsIGV4dGVuZHMgTWl4aW4oR3VpbGRDaGFubmVsLCBUZXh0Q2hhbm5lbCkge1xuICBiaXRyYXRlITogc3RyaW5nXG4gIHVzZXJMaW1pdCE6IG51bWJlclxuICB2b2ljZVN0YXRlcyA9IG5ldyBHdWlsZENoYW5uZWxWb2ljZVN0YXRlc01hbmFnZXIoXG4gICAgdGhpcy5jbGllbnQsXG4gICAgdGhpcy5ndWlsZC52b2ljZVN0YXRlcyxcbiAgICB0aGlzXG4gIClcblxuICBjb25zdHJ1Y3RvcihjbGllbnQ6IENsaWVudCwgZGF0YTogR3VpbGRWb2ljZUNoYW5uZWxQYXlsb2FkLCBndWlsZDogR3VpbGQpIHtcbiAgICBzdXBlcihjbGllbnQsIGRhdGEsIGd1aWxkKVxuICAgIHRoaXMucmVhZEZyb21EYXRhKGRhdGEpXG4gIH1cblxuICAvKiogSm9pbiB0aGUgVm9pY2UgQ2hhbm5lbCAqL1xuICBhc3luYyBqb2luKG9wdGlvbnM/OiBWb2ljZUNoYW5uZWxKb2luT3B0aW9ucyk6IFByb21pc2U8Vm9pY2VTZXJ2ZXJEYXRhPiB7XG4gICAgcmV0dXJuIHRoaXMuY2xpZW50LnZvaWNlLmpvaW4odGhpcy5pZCwgb3B0aW9ucylcbiAgfVxuXG4gIC8qKiBMZWF2ZSB0aGUgVm9pY2UgQ2hhbm5lbCAqL1xuICBhc3luYyBsZWF2ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5jbGllbnQudm9pY2UubGVhdmUodGhpcy5ndWlsZClcbiAgfVxuXG4gIHJlYWRGcm9tRGF0YShkYXRhOiBHdWlsZFZvaWNlQ2hhbm5lbFBheWxvYWQpOiB2b2lkIHtcbiAgICBzdXBlci5yZWFkRnJvbURhdGEoZGF0YSlcbiAgICB0aGlzLmJpdHJhdGUgPSBkYXRhLmJpdHJhdGUgPz8gdGhpcy5iaXRyYXRlXG4gICAgdGhpcy51c2VyTGltaXQgPSBkYXRhLnVzZXJfbGltaXQgPz8gdGhpcy51c2VyTGltaXRcbiAgfVxuXG4gIGFzeW5jIGVkaXQob3B0aW9ucz86IE1vZGlmeVZvaWNlQ2hhbm5lbE9wdGlvbik6IFByb21pc2U8Vm9pY2VDaGFubmVsPiB7XG4gICAgY29uc3QgYm9keTogTW9kaWZ5Vm9pY2VDaGFubmVsUGF5bG9hZCA9IHtcbiAgICAgIG5hbWU6IG9wdGlvbnM/Lm5hbWUsXG4gICAgICBwb3NpdGlvbjogb3B0aW9ucz8ucG9zaXRpb24sXG4gICAgICBwZXJtaXNzaW9uX292ZXJ3cml0ZXM6IG9wdGlvbnM/LnBlcm1pc3Npb25PdmVyd3JpdGVzLFxuICAgICAgcGFyZW50X2lkOiBvcHRpb25zPy5wYXJlbnRJRCxcbiAgICAgIGJpdHJhdGU6IG9wdGlvbnM/LmJpdHJhdGUsXG4gICAgICB1c2VyX2xpbWl0OiBvcHRpb25zPy51c2VyTGltaXRcbiAgICB9XG5cbiAgICBjb25zdCByZXNwID0gYXdhaXQgdGhpcy5jbGllbnQucmVzdC5wYXRjaChDSEFOTkVMKHRoaXMuaWQpLCBib2R5KVxuXG4gICAgcmV0dXJuIG5ldyBWb2ljZUNoYW5uZWwodGhpcy5jbGllbnQsIHJlc3AsIHRoaXMuZ3VpbGQpXG4gIH1cblxuICBhc3luYyBzZXRCaXRyYXRlKHJhdGU6IG51bWJlciB8IHVuZGVmaW5lZCk6IFByb21pc2U8Vm9pY2VDaGFubmVsPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZWRpdCh7IGJpdHJhdGU6IHJhdGUgfSlcbiAgfVxuXG4gIGFzeW5jIHNldFVzZXJMaW1pdChsaW1pdDogbnVtYmVyIHwgdW5kZWZpbmVkKTogUHJvbWlzZTxWb2ljZUNoYW5uZWw+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5lZGl0KHsgdXNlckxpbWl0OiBsaW1pdCB9KVxuICB9XG5cbiAgYXN5bmMgZGlzY29ubmVjdE1lbWJlcihcbiAgICBtZW1iZXI6IFVzZXIgfCBNZW1iZXIgfCBzdHJpbmdcbiAgKTogUHJvbWlzZTxNZW1iZXIgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBtZW1iZXJJRCA9IHR5cGVvZiBtZW1iZXIgPT09ICdzdHJpbmcnID8gbWVtYmVyIDogbWVtYmVyLmlkXG4gICAgY29uc3QgbWVtYmVyVm9pY2VTdGF0ZSA9IGF3YWl0IHRoaXMudm9pY2VTdGF0ZXMuZ2V0KG1lbWJlcklEKVxuXG4gICAgcmV0dXJuIG1lbWJlclZvaWNlU3RhdGU/LmRpc2Nvbm5lY3QoKVxuICB9XG5cbiAgYXN5bmMgZGlzY29ubmVjdEFsbCgpOiBQcm9taXNlPE1lbWJlcltdPiB7XG4gICAgY29uc3QgbWVtYmVyczogTWVtYmVyW10gPSBbXVxuICAgIGZvciBhd2FpdCAoY29uc3QgbWVtYmVyVm9pY2VTdGF0ZSBvZiB0aGlzLnZvaWNlU3RhdGVzKSB7XG4gICAgICBjb25zdCBtZW1iZXIgPSBhd2FpdCBtZW1iZXJWb2ljZVN0YXRlLmRpc2Nvbm5lY3QoKVxuICAgICAgaWYgKG1lbWJlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIG1lbWJlcnMucHVzaChtZW1iZXIpXG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIG1lbWJlcnNcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQU1BLFNBQVMsT0FBTyxRQUFRLHVCQUFzQjtBQUM5QyxTQUFTLFlBQVksUUFBUSxlQUFjO0FBRTNDLFNBQVMsOEJBQThCLFFBQVEseUNBQXdDO0FBT3ZGLFNBQVMsS0FBSyxRQUFRLGdCQUFlO0FBQ3JDLFNBQVMsV0FBVyxRQUFRLG1CQUFrQjtBQUU5QyxPQUFPLE1BQU0scUJBQXFCLE1BQU0sY0FBYztJQUNwRCxRQUFnQjtJQUNoQixVQUFrQjtJQUNsQixjQUFjLElBQUksK0JBQ2hCLElBQUksQ0FBQyxNQUFNLEVBQ1gsSUFBSSxDQUFDLEtBQUssQ0FBQyxXQUFXLEVBQ3RCLElBQUksRUFDTDtJQUVELFlBQVksTUFBYyxFQUFFLElBQThCLEVBQUUsS0FBWSxDQUFFO1FBQ3hFLEtBQUssQ0FBQyxRQUFRLE1BQU07UUFDcEIsSUFBSSxDQUFDLFlBQVksQ0FBQztJQUNwQjtJQUVBLDJCQUEyQixHQUMzQixNQUFNLEtBQUssT0FBaUMsRUFBNEI7UUFDdEUsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtJQUN6QztJQUVBLDRCQUE0QixHQUM1QixNQUFNLFFBQXVCO1FBQzNCLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLO0lBQzNDO0lBRUEsYUFBYSxJQUE4QixFQUFRO1FBQ2pELEtBQUssQ0FBQyxZQUFZLENBQUM7UUFDbkIsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLLE9BQU8sSUFBSSxJQUFJLENBQUMsT0FBTztRQUMzQyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssVUFBVSxJQUFJLElBQUksQ0FBQyxTQUFTO0lBQ3BEO0lBRUEsTUFBTSxLQUFLLE9BQWtDLEVBQXlCO1FBQ3BFLE1BQU0sT0FBa0M7WUFDdEMsTUFBTSxTQUFTO1lBQ2YsVUFBVSxTQUFTO1lBQ25CLHVCQUF1QixTQUFTO1lBQ2hDLFdBQVcsU0FBUztZQUNwQixTQUFTLFNBQVM7WUFDbEIsWUFBWSxTQUFTO1FBQ3ZCO1FBRUEsTUFBTSxPQUFPLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsSUFBSSxDQUFDLEVBQUUsR0FBRztRQUU1RCxPQUFPLElBQUksYUFBYSxJQUFJLENBQUMsTUFBTSxFQUFFLE1BQU0sSUFBSSxDQUFDLEtBQUs7SUFDdkQ7SUFFQSxNQUFNLFdBQVcsSUFBd0IsRUFBeUI7UUFDaEUsT0FBTyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUM7WUFBRSxTQUFTO1FBQUs7SUFDekM7SUFFQSxNQUFNLGFBQWEsS0FBeUIsRUFBeUI7UUFDbkUsT0FBTyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUM7WUFBRSxXQUFXO1FBQU07SUFDNUM7SUFFQSxNQUFNLGlCQUNKLE1BQThCLEVBQ0Q7UUFDN0IsTUFBTSxXQUFXLE9BQU8sV0FBVyxXQUFXLFNBQVMsT0FBTyxFQUFFO1FBQ2hFLE1BQU0sbUJBQW1CLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUM7UUFFcEQsT0FBTyxrQkFBa0I7SUFDM0I7SUFFQSxNQUFNLGdCQUFtQztRQUN2QyxNQUFNLFVBQW9CLEVBQUU7UUFDNUIsV0FBVyxNQUFNLG9CQUFvQixJQUFJLENBQUMsV0FBVyxDQUFFO1lBQ3JELE1BQU0sU0FBUyxNQUFNLGlCQUFpQixVQUFVO1lBQ2hELElBQUksV0FBVyxXQUFXO2dCQUN4QixRQUFRLElBQUksQ0FBQztZQUNmLENBQUM7UUFDSDtRQUVBLE9BQU87SUFDVDtBQUNGLENBQUMifQ==