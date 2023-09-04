import { ChannelTypes } from '../types/channel.ts';
import { HarmonyEventEmitter } from '../utils/events.ts';
export class VoiceManager extends HarmonyEventEmitter {
    #pending = new Map();
    client;
    constructor(client){
        super();
        Object.defineProperty(this, 'client', {
            value: client,
            enumerable: false
        });
    }
    async join(channel, options) {
        const id = typeof channel === 'string' ? channel : channel.id;
        const chan = await this.client.channels.get(id);
        if (chan === undefined) throw new Error('Voice Channel not cached');
        if (chan.type !== ChannelTypes.GUILD_VOICE && chan.type !== ChannelTypes.GUILD_STAGE_VOICE) throw new Error('Cannot join non-voice channel');
        const pending = this.#pending.get(chan.guild.id);
        if (pending !== undefined) {
            clearTimeout(pending[0]);
            pending[1](new Error('Voice Connection timed out'));
            this.#pending.delete(chan.guild.id);
        }
        return await new Promise((resolve, reject)=>{
            let vcdata;
            let done = 0;
            const onVoiceStateAdd = (state)=>{
                if (state.user.id !== this.client.user?.id) return;
                if (state.channel?.id !== id) return;
                this.client.off('voiceStateAdd', onVoiceStateAdd);
                done++;
                vcdata = vcdata ?? {};
                vcdata.sessionID = state.sessionID;
                vcdata.userID = state.user.id;
                if (done >= 2) {
                    this.#pending.delete(chan.guild.id);
                    resolve(vcdata);
                }
            };
            const onVoiceServerUpdate = (data)=>{
                if (data.guild.id !== chan.guild.id) return;
                vcdata = Object.assign(vcdata ?? {}, data);
                this.client.off('voiceServerUpdate', onVoiceServerUpdate);
                done++;
                if (done >= 2) {
                    this.#pending.delete(chan.guild.id);
                    resolve(vcdata);
                }
            };
            this.client.shards.get(chan.guild.shardID).updateVoiceState(chan.guild.id, chan.id, options);
            this.on('voiceStateUpdate', onVoiceStateAdd);
            this.client.on('voiceServerUpdate', onVoiceServerUpdate);
            const timer = setTimeout(()=>{
                if (done < 2) {
                    this.client.off('voiceServerUpdate', onVoiceServerUpdate);
                    this.client.off('voiceStateAdd', onVoiceStateAdd);
                    reject(new Error("Connection timed out - couldn't connect to Voice Channel"));
                }
            }, options?.timeout ?? 1000 * 30);
            this.#pending.set(chan.guild.id, [
                timer,
                reject
            ]);
        });
    }
    async leave(guildOrID) {
        const id = typeof guildOrID === 'string' ? guildOrID : guildOrID.id;
        const guild = await this.client.guilds.get(id);
        if (guild === undefined) throw new Error('Guild not cached');
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const vcs = await guild.voiceStates.get(this.client.user?.id);
        if (vcs === undefined) throw new Error('Not in Voice Channel');
        this.client.shards.get(guild.shardID).updateVoiceState(guild, undefined);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2NsaWVudC92b2ljZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IFZvaWNlU2VydmVyVXBkYXRlRGF0YSB9IGZyb20gJy4uL2dhdGV3YXkvaGFuZGxlcnMvbW9kLnRzJ1xuaW1wb3J0IHR5cGUgeyBWb2ljZUNoYW5uZWwgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2d1aWxkVm9pY2VDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBWb2ljZVN0YXRlT3B0aW9ucyB9IGZyb20gJy4uL2dhdGV3YXkvbW9kLnRzJ1xuaW1wb3J0IHsgVm9pY2VTdGF0ZSB9IGZyb20gJy4uL3N0cnVjdHVyZXMvdm9pY2VTdGF0ZS50cydcbmltcG9ydCB7IENoYW5uZWxUeXBlcyB9IGZyb20gJy4uL3R5cGVzL2NoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IEd1aWxkIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9ndWlsZC50cydcbmltcG9ydCB7IEhhcm1vbnlFdmVudEVtaXR0ZXIgfSBmcm9tICcuLi91dGlscy9ldmVudHMudHMnXG5pbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4vY2xpZW50LnRzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFZvaWNlU2VydmVyRGF0YSBleHRlbmRzIFZvaWNlU2VydmVyVXBkYXRlRGF0YSB7XG4gIHVzZXJJRDogc3RyaW5nXG4gIHNlc3Npb25JRDogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVm9pY2VDaGFubmVsSm9pbk9wdGlvbnMgZXh0ZW5kcyBWb2ljZVN0YXRlT3B0aW9ucyB7XG4gIHRpbWVvdXQ/OiBudW1iZXJcbn1cblxuZXhwb3J0IGNsYXNzIFZvaWNlTWFuYWdlciBleHRlbmRzIEhhcm1vbnlFdmVudEVtaXR0ZXI8e1xuICB2b2ljZVN0YXRlVXBkYXRlOiBbVm9pY2VTdGF0ZV1cbn0+IHtcbiAgI3BlbmRpbmcgPSBuZXcgTWFwPHN0cmluZywgW251bWJlciwgQ2FsbGFibGVGdW5jdGlvbl0+KClcblxuICByZWFkb25seSBjbGllbnQhOiBDbGllbnRcblxuICBjb25zdHJ1Y3RvcihjbGllbnQ6IENsaWVudCkge1xuICAgIHN1cGVyKClcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NsaWVudCcsIHtcbiAgICAgIHZhbHVlOiBjbGllbnQsXG4gICAgICBlbnVtZXJhYmxlOiBmYWxzZVxuICAgIH0pXG4gIH1cblxuICBhc3luYyBqb2luKFxuICAgIGNoYW5uZWw6IHN0cmluZyB8IFZvaWNlQ2hhbm5lbCxcbiAgICBvcHRpb25zPzogVm9pY2VDaGFubmVsSm9pbk9wdGlvbnNcbiAgKTogUHJvbWlzZTxWb2ljZVNlcnZlckRhdGE+IHtcbiAgICBjb25zdCBpZCA9IHR5cGVvZiBjaGFubmVsID09PSAnc3RyaW5nJyA/IGNoYW5uZWwgOiBjaGFubmVsLmlkXG4gICAgY29uc3QgY2hhbiA9IGF3YWl0IHRoaXMuY2xpZW50LmNoYW5uZWxzLmdldDxWb2ljZUNoYW5uZWw+KGlkKVxuICAgIGlmIChjaGFuID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignVm9pY2UgQ2hhbm5lbCBub3QgY2FjaGVkJylcbiAgICBpZiAoXG4gICAgICBjaGFuLnR5cGUgIT09IENoYW5uZWxUeXBlcy5HVUlMRF9WT0lDRSAmJlxuICAgICAgY2hhbi50eXBlICE9PSBDaGFubmVsVHlwZXMuR1VJTERfU1RBR0VfVk9JQ0VcbiAgICApXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCBqb2luIG5vbi12b2ljZSBjaGFubmVsJylcblxuICAgIGNvbnN0IHBlbmRpbmcgPSB0aGlzLiNwZW5kaW5nLmdldChjaGFuLmd1aWxkLmlkKVxuICAgIGlmIChwZW5kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNsZWFyVGltZW91dChwZW5kaW5nWzBdKVxuICAgICAgcGVuZGluZ1sxXShuZXcgRXJyb3IoJ1ZvaWNlIENvbm5lY3Rpb24gdGltZWQgb3V0JykpXG4gICAgICB0aGlzLiNwZW5kaW5nLmRlbGV0ZShjaGFuLmd1aWxkLmlkKVxuICAgIH1cblxuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBsZXQgdmNkYXRhOiBWb2ljZVNlcnZlckRhdGFcbiAgICAgIGxldCBkb25lID0gMFxuXG4gICAgICBjb25zdCBvblZvaWNlU3RhdGVBZGQgPSAoc3RhdGU6IFZvaWNlU3RhdGUpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKHN0YXRlLnVzZXIuaWQgIT09IHRoaXMuY2xpZW50LnVzZXI/LmlkKSByZXR1cm5cbiAgICAgICAgaWYgKHN0YXRlLmNoYW5uZWw/LmlkICE9PSBpZCkgcmV0dXJuXG4gICAgICAgIHRoaXMuY2xpZW50Lm9mZigndm9pY2VTdGF0ZUFkZCcsIG9uVm9pY2VTdGF0ZUFkZClcbiAgICAgICAgZG9uZSsrXG4gICAgICAgIHZjZGF0YSA9IHZjZGF0YSA/PyB7fVxuICAgICAgICB2Y2RhdGEuc2Vzc2lvbklEID0gc3RhdGUuc2Vzc2lvbklEXG4gICAgICAgIHZjZGF0YS51c2VySUQgPSBzdGF0ZS51c2VyLmlkXG4gICAgICAgIGlmIChkb25lID49IDIpIHtcbiAgICAgICAgICB0aGlzLiNwZW5kaW5nLmRlbGV0ZShjaGFuLmd1aWxkLmlkKVxuICAgICAgICAgIHJlc29sdmUodmNkYXRhKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG9uVm9pY2VTZXJ2ZXJVcGRhdGUgPSAoZGF0YTogVm9pY2VTZXJ2ZXJVcGRhdGVEYXRhKTogdm9pZCA9PiB7XG4gICAgICAgIGlmIChkYXRhLmd1aWxkLmlkICE9PSBjaGFuLmd1aWxkLmlkKSByZXR1cm5cbiAgICAgICAgdmNkYXRhID0gT2JqZWN0LmFzc2lnbih2Y2RhdGEgPz8ge30sIGRhdGEpXG4gICAgICAgIHRoaXMuY2xpZW50Lm9mZigndm9pY2VTZXJ2ZXJVcGRhdGUnLCBvblZvaWNlU2VydmVyVXBkYXRlKVxuICAgICAgICBkb25lKytcbiAgICAgICAgaWYgKGRvbmUgPj0gMikge1xuICAgICAgICAgIHRoaXMuI3BlbmRpbmcuZGVsZXRlKGNoYW4uZ3VpbGQuaWQpXG4gICAgICAgICAgcmVzb2x2ZSh2Y2RhdGEpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGllbnQuc2hhcmRzXG4gICAgICAgIC5nZXQoY2hhbi5ndWlsZC5zaGFyZElEKSFcbiAgICAgICAgLnVwZGF0ZVZvaWNlU3RhdGUoY2hhbi5ndWlsZC5pZCwgY2hhbi5pZCwgb3B0aW9ucylcblxuICAgICAgdGhpcy5vbigndm9pY2VTdGF0ZVVwZGF0ZScsIG9uVm9pY2VTdGF0ZUFkZClcbiAgICAgIHRoaXMuY2xpZW50Lm9uKCd2b2ljZVNlcnZlclVwZGF0ZScsIG9uVm9pY2VTZXJ2ZXJVcGRhdGUpXG5cbiAgICAgIGNvbnN0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmIChkb25lIDwgMikge1xuICAgICAgICAgIHRoaXMuY2xpZW50Lm9mZigndm9pY2VTZXJ2ZXJVcGRhdGUnLCBvblZvaWNlU2VydmVyVXBkYXRlKVxuICAgICAgICAgIHRoaXMuY2xpZW50Lm9mZigndm9pY2VTdGF0ZUFkZCcsIG9uVm9pY2VTdGF0ZUFkZClcbiAgICAgICAgICByZWplY3QoXG4gICAgICAgICAgICBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgIFwiQ29ubmVjdGlvbiB0aW1lZCBvdXQgLSBjb3VsZG4ndCBjb25uZWN0IHRvIFZvaWNlIENoYW5uZWxcIlxuICAgICAgICAgICAgKVxuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSwgb3B0aW9ucz8udGltZW91dCA/PyAxMDAwICogMzApXG5cbiAgICAgIHRoaXMuI3BlbmRpbmcuc2V0KGNoYW4uZ3VpbGQuaWQsIFt0aW1lciwgcmVqZWN0XSlcbiAgICB9KVxuICB9XG5cbiAgYXN5bmMgbGVhdmUoZ3VpbGRPcklEOiBHdWlsZCB8IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGlkID0gdHlwZW9mIGd1aWxkT3JJRCA9PT0gJ3N0cmluZycgPyBndWlsZE9ySUQgOiBndWlsZE9ySUQuaWRcbiAgICBjb25zdCBndWlsZCA9IGF3YWl0IHRoaXMuY2xpZW50Lmd1aWxkcy5nZXQoaWQpXG4gICAgaWYgKGd1aWxkID09PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcignR3VpbGQgbm90IGNhY2hlZCcpXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1ub24tbnVsbC1hc3NlcnRlZC1vcHRpb25hbC1jaGFpblxuICAgIGNvbnN0IHZjcyA9IGF3YWl0IGd1aWxkLnZvaWNlU3RhdGVzLmdldCh0aGlzLmNsaWVudC51c2VyPy5pZCEpXG4gICAgaWYgKHZjcyA9PT0gdW5kZWZpbmVkKSB0aHJvdyBuZXcgRXJyb3IoJ05vdCBpbiBWb2ljZSBDaGFubmVsJylcblxuICAgIHRoaXMuY2xpZW50LnNoYXJkcy5nZXQoZ3VpbGQuc2hhcmRJRCkhLnVwZGF0ZVZvaWNlU3RhdGUoZ3VpbGQsIHVuZGVmaW5lZClcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLFNBQVMsWUFBWSxRQUFRLHNCQUFxQjtBQUVsRCxTQUFTLG1CQUFtQixRQUFRLHFCQUFvQjtBQVl4RCxPQUFPLE1BQU0scUJBQXFCO0lBR2hDLENBQUMsT0FBTyxHQUFHLElBQUksTUFBeUM7SUFFL0MsT0FBZTtJQUV4QixZQUFZLE1BQWMsQ0FBRTtRQUMxQixLQUFLO1FBQ0wsT0FBTyxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVU7WUFDcEMsT0FBTztZQUNQLFlBQVksS0FBSztRQUNuQjtJQUNGO0lBRUEsTUFBTSxLQUNKLE9BQThCLEVBQzlCLE9BQWlDLEVBQ1A7UUFDMUIsTUFBTSxLQUFLLE9BQU8sWUFBWSxXQUFXLFVBQVUsUUFBUSxFQUFFO1FBQzdELE1BQU0sT0FBTyxNQUFNLElBQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FB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