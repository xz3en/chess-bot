import { MemberRolesManager } from '../managers/memberRoles.ts';
import { GUILD_MEMBER, GUILD_MEMBER_AVATAR } from '../types/endpoint.ts';
import { Permissions } from '../utils/permissions.ts';
import { SnowflakeBase } from './base.ts';
import { ImageURL } from './cdn.ts';
export class Member extends SnowflakeBase {
    user;
    nick;
    avatar;
    roles;
    joinedAt;
    premiumSince;
    deaf;
    mute;
    guild;
    permissions;
    communicationDisabledUntil;
    constructor(client, data, user, guild, perms){
        super(client);
        this.id = data.user.id;
        this.readFromData(data);
        this.user = user;
        this.guild = guild;
        this.roles = new MemberRolesManager(this.client, this.guild.roles, this);
        this.permissions = perms ?? new Permissions(Permissions.DEFAULT);
        this.roles.array().then((roles)=>{
            const rolePermissions = [];
            for (const role of roles){
                rolePermissions.push(...role.permissions.toArray().filter((p)=>!rolePermissions.includes(p)));
            }
            this.permissions.remove(...this.permissions.toArray().filter((p)=>!rolePermissions.includes(p)));
            this.permissions.add(...rolePermissions.filter((p)=>this.permissions.toArray().includes(p) === false));
        }).catch((e)=>{
        // probably missing permissions, ignore
        });
    }
    get displayName() {
        return this.nick !== null ? this.nick : this.user.username;
    }
    toString() {
        return this.user.nickMention;
    }
    readFromData(data) {
        this.nick = data.nick ?? this.nick;
        this.avatar = data.avatar ?? this.avatar;
        this.joinedAt = data.joined_at ?? this.joinedAt;
        this.premiumSince = data.premium_since ?? this.premiumSince;
        this.deaf = data.deaf ?? this.deaf;
        this.mute = data.mute ?? this.mute;
        this.communicationDisabledUntil = data.communication_disabled_until === null ? null : data.communication_disabled_until === undefined ? undefined : new Date(data.communication_disabled_until);
    }
    /**
   * Updates the Member data in cache (and this object).
   */ async fetch() {
        const raw = await this.client.rest.get(this.id);
        if (typeof raw !== 'object') throw new Error('Member not found');
        await this.guild.members.set(this.id, raw);
        this.readFromData(raw);
        return this;
    }
    /**
   * Edits the Member
   * @param data Data to apply
   * @param reason Audit Log reason
   */ async edit(data, reason) {
        const payload = {
            nick: data.nick,
            roles: data.roles?.map((e)=>typeof e === 'string' ? e : e.id),
            deaf: data.deaf,
            mute: data.mute,
            communication_disabled_until: data.communicationDisabledUntil?.toISOString(),
            channel_id: typeof data.channel === 'string' ? data.channel : data.channel?.id
        };
        const res = await this.client.rest.patch(GUILD_MEMBER(this.guild.id, this.id), payload, undefined, null, true, {
            reason
        });
        if (res.ok === true) {
            if (data.nick !== undefined) this.nick = data.nick === null ? null : data.nick;
            if (data.deaf !== undefined) this.deaf = data.deaf;
            if (data.mute !== undefined) this.mute = data.mute;
        }
        return this;
    }
    /**
   * New nickname to set. If empty, nick is reset
   * @param nick New nickname
   */ async setNickname(nick, reason) {
        return await this.edit({
            nick: nick === undefined ? null : nick
        }, reason);
    }
    /**
   * Resets nickname of the Member
   */ async resetNickname(reason) {
        return await this.setNickname(undefined, reason);
    }
    /**
   * Sets a Member mute in VC
   * @param mute Value to set
   */ async setMute(mute, reason) {
        return await this.edit({
            mute: mute ?? false
        }, reason);
    }
    /**
   * Sets Timeout for the Member
   * @param expiration Value to set
   */ async setTimeout(expiration, reason) {
        return await this.edit({
            communicationDisabledUntil: expiration
        }, reason);
    }
    /**
   * Resets Timeout for the Member
   */ async resetTimeout(reason) {
        return await this.setTimeout(null, reason);
    }
    /**
   * Sets a Member deaf in VC
   * @param deaf Value to set
   */ async setDeaf(deaf, reason) {
        return await this.edit({
            deaf: deaf ?? false
        }, reason);
    }
    /**
   * Moves a Member to another VC
   * @param channel Channel to move(null or undefined to disconnect)
   */ async moveVoiceChannel(channel, reason) {
        return await this.edit({
            channel: channel ?? null
        }, reason);
    }
    /**
   * Disconnects a Member from connected VC
   */ async disconnectVoice(reason) {
        return await this.edit({
            channel: null
        }, reason);
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
    /**
   * Kicks the member.
   */ async kick(reason) {
        await this.client.rest.delete(GUILD_MEMBER(this.guild.id, this.id), undefined, undefined, null, undefined, {
            reason
        });
        return true;
    }
    /**
   * Bans the Member.
   * @param reason Reason for the Ban.
   * @param deleteOldMessages Delete Old Messages? If yes, how much days.
   */ async ban(reason, deleteOldMessages) {
        return this.guild.bans.add(this.id, reason, deleteOldMessages);
    }
    async manageable(by) {
        by = by ?? await this.guild.me();
        if (this.id === this.guild.ownerID || this.id === by.id) return false;
        if (this.guild.ownerID === by.id) return true;
        const highestBy = (await by.roles.array()).sort((b, a)=>a.position - b.position)[0];
        const highest = (await this.roles.array()).sort((b, a)=>a.position - b.position)[0];
        return highestBy.position > highest.position;
    }
    async bannable(by) {
        const manageable = await this.manageable(by);
        if (!manageable) return false;
        const me = by ?? await this.guild.me();
        return me.permissions.has('BAN_MEMBERS');
    }
    async kickable(by) {
        const manageable = await this.manageable(by);
        if (!manageable) return false;
        const me = by ?? await this.guild.me();
        return me.permissions.has('KICK_MEMBERS');
    }
    avatarURL(format = 'png', size = 512) {
        return this.avatar !== null && this.avatar !== undefined ? `${ImageURL(GUILD_MEMBER_AVATAR(this.guild.id, this.user.id, this.avatar), format, size)}` : this.user.avatarURL(format, size);
    }
    async effectiveColor() {
        return (await this.roles.array()).sort((a, b)=>b.position - a.position).find((r)=>r.color !== 0)?.color ?? 0;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvbWVtYmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1lbWJlclJvbGVzTWFuYWdlciB9IGZyb20gJy4uL21hbmFnZXJzL21lbWJlclJvbGVzLnRzJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuaW1wb3J0IHsgR1VJTERfTUVNQkVSLCBHVUlMRF9NRU1CRVJfQVZBVEFSIH0gZnJvbSAnLi4vdHlwZXMvZW5kcG9pbnQudHMnXG5pbXBvcnQgdHlwZSB7IE1lbWJlclBheWxvYWQgfSBmcm9tICcuLi90eXBlcy9ndWlsZC50cydcbmltcG9ydCB7IFBlcm1pc3Npb25zIH0gZnJvbSAnLi4vdXRpbHMvcGVybWlzc2lvbnMudHMnXG5pbXBvcnQgeyBTbm93Zmxha2VCYXNlIH0gZnJvbSAnLi9iYXNlLnRzJ1xuaW1wb3J0IHR5cGUgeyBHdWlsZCB9IGZyb20gJy4vZ3VpbGQudHMnXG5pbXBvcnQgdHlwZSB7IFZvaWNlQ2hhbm5lbCB9IGZyb20gJy4vZ3VpbGRWb2ljZUNoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IFJvbGUgfSBmcm9tICcuL3JvbGUudHMnXG5pbXBvcnQgdHlwZSB7IFVzZXIgfSBmcm9tICcuL3VzZXIudHMnXG5pbXBvcnQgeyBJbWFnZVVSTCB9IGZyb20gJy4vY2RuLnRzJ1xuaW1wb3J0IHR5cGUgeyBJbWFnZVNpemUsIEltYWdlRm9ybWF0cyB9IGZyb20gJy4uL3R5cGVzL2Nkbi50cydcblxuZXhwb3J0IGludGVyZmFjZSBNZW1iZXJEYXRhIHtcbiAgbmljaz86IHN0cmluZyB8IG51bGxcbiAgcm9sZXM/OiBBcnJheTxSb2xlIHwgc3RyaW5nPlxuICBkZWFmPzogYm9vbGVhblxuICBtdXRlPzogYm9vbGVhblxuICBjaGFubmVsPzogc3RyaW5nIHwgVm9pY2VDaGFubmVsIHwgbnVsbFxuICBjb21tdW5pY2F0aW9uRGlzYWJsZWRVbnRpbD86IERhdGUgfCBudWxsXG59XG5cbmV4cG9ydCBjbGFzcyBNZW1iZXIgZXh0ZW5kcyBTbm93Zmxha2VCYXNlIHtcbiAgdXNlcjogVXNlclxuICBuaWNrITogc3RyaW5nIHwgbnVsbFxuICBhdmF0YXIhOiBzdHJpbmcgfCBudWxsXG4gIHJvbGVzOiBNZW1iZXJSb2xlc01hbmFnZXJcbiAgam9pbmVkQXQhOiBzdHJpbmdcbiAgcHJlbWl1bVNpbmNlPzogc3RyaW5nXG4gIGRlYWYhOiBib29sZWFuXG4gIG11dGUhOiBib29sZWFuXG4gIGd1aWxkOiBHdWlsZFxuICBwZXJtaXNzaW9uczogUGVybWlzc2lvbnNcbiAgY29tbXVuaWNhdGlvbkRpc2FibGVkVW50aWw/OiBEYXRlIHwgbnVsbFxuXG4gIGNvbnN0cnVjdG9yKFxuICAgIGNsaWVudDogQ2xpZW50LFxuICAgIGRhdGE6IE1lbWJlclBheWxvYWQsXG4gICAgdXNlcjogVXNlcixcbiAgICBndWlsZDogR3VpbGQsXG4gICAgcGVybXM/OiBQZXJtaXNzaW9uc1xuICApIHtcbiAgICBzdXBlcihjbGllbnQpXG4gICAgdGhpcy5pZCA9IGRhdGEudXNlci5pZFxuICAgIHRoaXMucmVhZEZyb21EYXRhKGRhdGEpXG4gICAgdGhpcy51c2VyID0gdXNlclxuICAgIHRoaXMuZ3VpbGQgPSBndWlsZFxuICAgIHRoaXMucm9sZXMgPSBuZXcgTWVtYmVyUm9sZXNNYW5hZ2VyKHRoaXMuY2xpZW50LCB0aGlzLmd1aWxkLnJvbGVzLCB0aGlzKVxuICAgIHRoaXMucGVybWlzc2lvbnMgPSBwZXJtcyA/PyBuZXcgUGVybWlzc2lvbnMoUGVybWlzc2lvbnMuREVGQVVMVClcbiAgICB0aGlzLnJvbGVzXG4gICAgICAuYXJyYXkoKVxuICAgICAgLnRoZW4oKHJvbGVzKSA9PiB7XG4gICAgICAgIGNvbnN0IHJvbGVQZXJtaXNzaW9uczogc3RyaW5nW10gPSBbXVxuXG4gICAgICAgIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgICAgICAgIHJvbGVQZXJtaXNzaW9ucy5wdXNoKFxuICAgICAgICAgICAgLi4ucm9sZS5wZXJtaXNzaW9uc1xuICAgICAgICAgICAgICAudG9BcnJheSgpXG4gICAgICAgICAgICAgIC5maWx0ZXIoKHApID0+ICFyb2xlUGVybWlzc2lvbnMuaW5jbHVkZXMocCkpXG4gICAgICAgICAgKVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5wZXJtaXNzaW9ucy5yZW1vdmUoXG4gICAgICAgICAgLi4udGhpcy5wZXJtaXNzaW9uc1xuICAgICAgICAgICAgLnRvQXJyYXkoKVxuICAgICAgICAgICAgLmZpbHRlcigocCkgPT4gIXJvbGVQZXJtaXNzaW9ucy5pbmNsdWRlcyhwKSlcbiAgICAgICAgKVxuICAgICAgICB0aGlzLnBlcm1pc3Npb25zLmFkZChcbiAgICAgICAgICAuLi5yb2xlUGVybWlzc2lvbnMuZmlsdGVyKFxuICAgICAgICAgICAgKHApID0+IHRoaXMucGVybWlzc2lvbnMudG9BcnJheSgpLmluY2x1ZGVzKHApID09PSBmYWxzZVxuICAgICAgICAgIClcbiAgICAgICAgKVxuICAgICAgfSlcbiAgICAgIC5jYXRjaCgoZSkgPT4ge1xuICAgICAgICAvLyBwcm9iYWJseSBtaXNzaW5nIHBlcm1pc3Npb25zLCBpZ25vcmVcbiAgICAgIH0pXG4gIH1cblxuICBnZXQgZGlzcGxheU5hbWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5uaWNrICE9PSBudWxsID8gdGhpcy5uaWNrIDogdGhpcy51c2VyLnVzZXJuYW1lXG4gIH1cblxuICB0b1N0cmluZygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVzZXIubmlja01lbnRpb25cbiAgfVxuXG4gIHJlYWRGcm9tRGF0YShkYXRhOiBNZW1iZXJQYXlsb2FkKTogdm9pZCB7XG4gICAgdGhpcy5uaWNrID0gZGF0YS5uaWNrID8/IHRoaXMubmlja1xuICAgIHRoaXMuYXZhdGFyID0gZGF0YS5hdmF0YXIgPz8gdGhpcy5hdmF0YXJcbiAgICB0aGlzLmpvaW5lZEF0ID0gZGF0YS5qb2luZWRfYXQgPz8gdGhpcy5qb2luZWRBdFxuICAgIHRoaXMucHJlbWl1bVNpbmNlID0gZGF0YS5wcmVtaXVtX3NpbmNlID8/IHRoaXMucHJlbWl1bVNpbmNlXG4gICAgdGhpcy5kZWFmID0gZGF0YS5kZWFmID8/IHRoaXMuZGVhZlxuICAgIHRoaXMubXV0ZSA9IGRhdGEubXV0ZSA/PyB0aGlzLm11dGVcbiAgICB0aGlzLmNvbW11bmljYXRpb25EaXNhYmxlZFVudGlsID1cbiAgICAgIGRhdGEuY29tbXVuaWNhdGlvbl9kaXNhYmxlZF91bnRpbCA9PT0gbnVsbFxuICAgICAgICA/IG51bGxcbiAgICAgICAgOiBkYXRhLmNvbW11bmljYXRpb25fZGlzYWJsZWRfdW50aWwgPT09IHVuZGVmaW5lZFxuICAgICAgICA/IHVuZGVmaW5lZFxuICAgICAgICA6IG5ldyBEYXRlKGRhdGEuY29tbXVuaWNhdGlvbl9kaXNhYmxlZF91bnRpbClcbiAgfVxuXG4gIC8qKlxuICAgKiBVcGRhdGVzIHRoZSBNZW1iZXIgZGF0YSBpbiBjYWNoZSAoYW5kIHRoaXMgb2JqZWN0KS5cbiAgICovXG4gIGFzeW5jIGZldGNoKCk6IFByb21pc2U8TWVtYmVyPiB7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgdGhpcy5jbGllbnQucmVzdC5nZXQodGhpcy5pZClcbiAgICBpZiAodHlwZW9mIHJhdyAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBFcnJvcignTWVtYmVyIG5vdCBmb3VuZCcpXG4gICAgYXdhaXQgdGhpcy5ndWlsZC5tZW1iZXJzLnNldCh0aGlzLmlkLCByYXcpXG4gICAgdGhpcy5yZWFkRnJvbURhdGEocmF3KVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKipcbiAgICogRWRpdHMgdGhlIE1lbWJlclxuICAgKiBAcGFyYW0gZGF0YSBEYXRhIHRvIGFwcGx5XG4gICAqIEBwYXJhbSByZWFzb24gQXVkaXQgTG9nIHJlYXNvblxuICAgKi9cbiAgYXN5bmMgZWRpdChkYXRhOiBNZW1iZXJEYXRhLCByZWFzb24/OiBzdHJpbmcpOiBQcm9taXNlPE1lbWJlcj4ge1xuICAgIGNvbnN0IHBheWxvYWQgPSB7XG4gICAgICBuaWNrOiBkYXRhLm5pY2ssXG4gICAgICByb2xlczogZGF0YS5yb2xlcz8ubWFwKChlKSA9PiAodHlwZW9mIGUgPT09ICdzdHJpbmcnID8gZSA6IGUuaWQpKSxcbiAgICAgIGRlYWY6IGRhdGEuZGVhZixcbiAgICAgIG11dGU6IGRhdGEubXV0ZSxcbiAgICAgIGNvbW11bmljYXRpb25fZGlzYWJsZWRfdW50aWw6XG4gICAgICAgIGRhdGEuY29tbXVuaWNhdGlvbkRpc2FibGVkVW50aWw/LnRvSVNPU3RyaW5nKCksXG4gICAgICBjaGFubmVsX2lkOlxuICAgICAgICB0eXBlb2YgZGF0YS5jaGFubmVsID09PSAnc3RyaW5nJyA/IGRhdGEuY2hhbm5lbCA6IGRhdGEuY2hhbm5lbD8uaWRcbiAgICB9XG5cbiAgICBjb25zdCByZXMgPSBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LnBhdGNoKFxuICAgICAgR1VJTERfTUVNQkVSKHRoaXMuZ3VpbGQuaWQsIHRoaXMuaWQpLFxuICAgICAgcGF5bG9hZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIG51bGwsXG4gICAgICB0cnVlLFxuICAgICAge1xuICAgICAgICByZWFzb25cbiAgICAgIH1cbiAgICApXG4gICAgaWYgKHJlcy5vayA9PT0gdHJ1ZSkge1xuICAgICAgaWYgKGRhdGEubmljayAhPT0gdW5kZWZpbmVkKVxuICAgICAgICB0aGlzLm5pY2sgPSBkYXRhLm5pY2sgPT09IG51bGwgPyBudWxsIDogZGF0YS5uaWNrXG4gICAgICBpZiAoZGF0YS5kZWFmICE9PSB1bmRlZmluZWQpIHRoaXMuZGVhZiA9IGRhdGEuZGVhZlxuICAgICAgaWYgKGRhdGEubXV0ZSAhPT0gdW5kZWZpbmVkKSB0aGlzLm11dGUgPSBkYXRhLm11dGVcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKlxuICAgKiBOZXcgbmlja25hbWUgdG8gc2V0LiBJZiBlbXB0eSwgbmljayBpcyByZXNldFxuICAgKiBAcGFyYW0gbmljayBOZXcgbmlja25hbWVcbiAgICovXG4gIGFzeW5jIHNldE5pY2tuYW1lKG5pY2s/OiBzdHJpbmcsIHJlYXNvbj86IHN0cmluZyk6IFByb21pc2U8TWVtYmVyPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZWRpdChcbiAgICAgIHtcbiAgICAgICAgbmljazogbmljayA9PT0gdW5kZWZpbmVkID8gbnVsbCA6IG5pY2tcbiAgICAgIH0sXG4gICAgICByZWFzb25cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIG5pY2tuYW1lIG9mIHRoZSBNZW1iZXJcbiAgICovXG4gIGFzeW5jIHJlc2V0Tmlja25hbWUocmVhc29uPzogc3RyaW5nKTogUHJvbWlzZTxNZW1iZXI+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zZXROaWNrbmFtZSh1bmRlZmluZWQsIHJlYXNvbilcbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIGEgTWVtYmVyIG11dGUgaW4gVkNcbiAgICogQHBhcmFtIG11dGUgVmFsdWUgdG8gc2V0XG4gICAqL1xuICBhc3luYyBzZXRNdXRlKG11dGU/OiBib29sZWFuLCByZWFzb24/OiBzdHJpbmcpOiBQcm9taXNlPE1lbWJlcj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmVkaXQoXG4gICAgICB7XG4gICAgICAgIG11dGU6IG11dGUgPz8gZmFsc2VcbiAgICAgIH0sXG4gICAgICByZWFzb25cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogU2V0cyBUaW1lb3V0IGZvciB0aGUgTWVtYmVyXG4gICAqIEBwYXJhbSBleHBpcmF0aW9uIFZhbHVlIHRvIHNldFxuICAgKi9cbiAgYXN5bmMgc2V0VGltZW91dChleHBpcmF0aW9uPzogRGF0ZSB8IG51bGwsIHJlYXNvbj86IHN0cmluZyk6IFByb21pc2U8TWVtYmVyPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZWRpdChcbiAgICAgIHtcbiAgICAgICAgY29tbXVuaWNhdGlvbkRpc2FibGVkVW50aWw6IGV4cGlyYXRpb25cbiAgICAgIH0sXG4gICAgICByZWFzb25cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogUmVzZXRzIFRpbWVvdXQgZm9yIHRoZSBNZW1iZXJcbiAgICovXG4gIGFzeW5jIHJlc2V0VGltZW91dChyZWFzb24/OiBzdHJpbmcpOiBQcm9taXNlPE1lbWJlcj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLnNldFRpbWVvdXQobnVsbCwgcmVhc29uKVxuICB9XG5cbiAgLyoqXG4gICAqIFNldHMgYSBNZW1iZXIgZGVhZiBpbiBWQ1xuICAgKiBAcGFyYW0gZGVhZiBWYWx1ZSB0byBzZXRcbiAgICovXG4gIGFzeW5jIHNldERlYWYoZGVhZj86IGJvb2xlYW4sIHJlYXNvbj86IHN0cmluZyk6IFByb21pc2U8TWVtYmVyPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZWRpdChcbiAgICAgIHtcbiAgICAgICAgZGVhZjogZGVhZiA/PyBmYWxzZVxuICAgICAgfSxcbiAgICAgIHJlYXNvblxuICAgIClcbiAgfVxuXG4gIC8qKlxuICAgKiBNb3ZlcyBhIE1lbWJlciB0byBhbm90aGVyIFZDXG4gICAqIEBwYXJhbSBjaGFubmVsIENoYW5uZWwgdG8gbW92ZShudWxsIG9yIHVuZGVmaW5lZCB0byBkaXNjb25uZWN0KVxuICAgKi9cbiAgYXN5bmMgbW92ZVZvaWNlQ2hhbm5lbChcbiAgICBjaGFubmVsPzogc3RyaW5nIHwgVm9pY2VDaGFubmVsIHwgbnVsbCxcbiAgICByZWFzb24/OiBzdHJpbmdcbiAgKTogUHJvbWlzZTxNZW1iZXI+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5lZGl0KFxuICAgICAge1xuICAgICAgICBjaGFubmVsOiBjaGFubmVsID8/IG51bGxcbiAgICAgIH0sXG4gICAgICByZWFzb25cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogRGlzY29ubmVjdHMgYSBNZW1iZXIgZnJvbSBjb25uZWN0ZWQgVkNcbiAgICovXG4gIGFzeW5jIGRpc2Nvbm5lY3RWb2ljZShyZWFzb24/OiBzdHJpbmcpOiBQcm9taXNlPE1lbWJlcj4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmVkaXQoXG4gICAgICB7XG4gICAgICAgIGNoYW5uZWw6IG51bGxcbiAgICAgIH0sXG4gICAgICByZWFzb25cbiAgICApXG4gIH1cblxuICAvKipcbiAgICogVW5tdXRlcyB0aGUgTWVtYmVyIGZyb20gVkMuXG4gICAqL1xuICBhc3luYyB1bm11dGUoKTogUHJvbWlzZTxNZW1iZXI+IHtcbiAgICByZXR1cm4gYXdhaXQgdGhpcy5zZXRNdXRlKGZhbHNlKVxuICB9XG5cbiAgLyoqXG4gICAqIFVuZGVhZnMgdGhlIE1lbWJlciBmcm9tIFZDLlxuICAgKi9cbiAgYXN5bmMgdW5kZWFmKCk6IFByb21pc2U8TWVtYmVyPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuc2V0RGVhZihmYWxzZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBLaWNrcyB0aGUgbWVtYmVyLlxuICAgKi9cbiAgYXN5bmMga2ljayhyZWFzb24/OiBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmRlbGV0ZShcbiAgICAgIEdVSUxEX01FTUJFUih0aGlzLmd1aWxkLmlkLCB0aGlzLmlkKSxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIHVuZGVmaW5lZCxcbiAgICAgIG51bGwsXG4gICAgICB1bmRlZmluZWQsXG4gICAgICB7XG4gICAgICAgIHJlYXNvblxuICAgICAgfVxuICAgIClcbiAgICByZXR1cm4gdHJ1ZVxuICB9XG5cbiAgLyoqXG4gICAqIEJhbnMgdGhlIE1lbWJlci5cbiAgICogQHBhcmFtIHJlYXNvbiBSZWFzb24gZm9yIHRoZSBCYW4uXG4gICAqIEBwYXJhbSBkZWxldGVPbGRNZXNzYWdlcyBEZWxldGUgT2xkIE1lc3NhZ2VzPyBJZiB5ZXMsIGhvdyBtdWNoIGRheXMuXG4gICAqL1xuICBhc3luYyBiYW4ocmVhc29uPzogc3RyaW5nLCBkZWxldGVPbGRNZXNzYWdlcz86IG51bWJlcik6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmd1aWxkLmJhbnMuYWRkKHRoaXMuaWQsIHJlYXNvbiwgZGVsZXRlT2xkTWVzc2FnZXMpXG4gIH1cblxuICBhc3luYyBtYW5hZ2VhYmxlKGJ5PzogTWVtYmVyKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgYnkgPSBieSA/PyAoYXdhaXQgdGhpcy5ndWlsZC5tZSgpKVxuICAgIGlmICh0aGlzLmlkID09PSB0aGlzLmd1aWxkLm93bmVySUQgfHwgdGhpcy5pZCA9PT0gYnkuaWQpIHJldHVybiBmYWxzZVxuICAgIGlmICh0aGlzLmd1aWxkLm93bmVySUQgPT09IGJ5LmlkKSByZXR1cm4gdHJ1ZVxuICAgIGNvbnN0IGhpZ2hlc3RCeSA9IChhd2FpdCBieS5yb2xlcy5hcnJheSgpKS5zb3J0KFxuICAgICAgKGIsIGEpID0+IGEucG9zaXRpb24gLSBiLnBvc2l0aW9uXG4gICAgKVswXVxuICAgIGNvbnN0IGhpZ2hlc3QgPSAoYXdhaXQgdGhpcy5yb2xlcy5hcnJheSgpKS5zb3J0KFxuICAgICAgKGIsIGEpID0+IGEucG9zaXRpb24gLSBiLnBvc2l0aW9uXG4gICAgKVswXVxuICAgIHJldHVybiBoaWdoZXN0QnkucG9zaXRpb24gPiBoaWdoZXN0LnBvc2l0aW9uXG4gIH1cblxuICBhc3luYyBiYW5uYWJsZShieT86IE1lbWJlcik6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGNvbnN0IG1hbmFnZWFibGUgPSBhd2FpdCB0aGlzLm1hbmFnZWFibGUoYnkpXG4gICAgaWYgKCFtYW5hZ2VhYmxlKSByZXR1cm4gZmFsc2VcbiAgICBjb25zdCBtZSA9IGJ5ID8/IChhd2FpdCB0aGlzLmd1aWxkLm1lKCkpXG4gICAgcmV0dXJuIG1lLnBlcm1pc3Npb25zLmhhcygnQkFOX01FTUJFUlMnKVxuICB9XG5cbiAgYXN5bmMga2lja2FibGUoYnk/OiBNZW1iZXIpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBjb25zdCBtYW5hZ2VhYmxlID0gYXdhaXQgdGhpcy5tYW5hZ2VhYmxlKGJ5KVxuICAgIGlmICghbWFuYWdlYWJsZSkgcmV0dXJuIGZhbHNlXG4gICAgY29uc3QgbWUgPSBieSA/PyAoYXdhaXQgdGhpcy5ndWlsZC5tZSgpKVxuICAgIHJldHVybiBtZS5wZXJtaXNzaW9ucy5oYXMoJ0tJQ0tfTUVNQkVSUycpXG4gIH1cblxuICBhdmF0YXJVUkwoZm9ybWF0OiBJbWFnZUZvcm1hdHMgPSAncG5nJywgc2l6ZTogSW1hZ2VTaXplID0gNTEyKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5hdmF0YXIgIT09IG51bGwgJiYgdGhpcy5hdmF0YXIgIT09IHVuZGVmaW5lZFxuICAgICAgPyBgJHtJbWFnZVVSTChcbiAgICAgICAgICBHVUlMRF9NRU1CRVJfQVZBVEFSKHRoaXMuZ3VpbGQuaWQsIHRoaXMudXNlci5pZCwgdGhpcy5hdmF0YXIpLFxuICAgICAgICAgIGZvcm1hdCxcbiAgICAgICAgICBzaXplXG4gICAgICAgICl9YFxuICAgICAgOiB0aGlzLnVzZXIuYXZhdGFyVVJMKGZvcm1hdCwgc2l6ZSlcbiAgfVxuXG4gIGFzeW5jIGVmZmVjdGl2ZUNvbG9yKCk6IFByb21pc2U8bnVtYmVyPiB7XG4gICAgcmV0dXJuIChcbiAgICAgIChhd2FpdCB0aGlzLnJvbGVzLmFycmF5KCkpXG4gICAgICAgIC5zb3J0KChhLCBiKSA9PiBiLnBvc2l0aW9uIC0gYS5wb3NpdGlvbilcbiAgICAgICAgLmZpbmQoKHIpID0+IHIuY29sb3IgIT09IDApPy5jb2xvciA/PyAwXG4gICAgKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxrQkFBa0IsUUFBUSw2QkFBNEI7QUFFL0QsU0FBUyxZQUFZLEVBQUUsbUJBQW1CLFFBQVEsdUJBQXNCO0FBRXhFLFNBQVMsV0FBVyxRQUFRLDBCQUF5QjtBQUNyRCxTQUFTLGFBQWEsUUFBUSxZQUFXO0FBS3pDLFNBQVMsUUFBUSxRQUFRLFdBQVU7QUFZbkMsT0FBTyxNQUFNLGVBQWU7SUFDMUIsS0FBVTtJQUNWLEtBQW9CO0lBQ3BCLE9BQXNCO0lBQ3RCLE1BQXlCO0lBQ3pCLFNBQWlCO0lBQ2pCLGFBQXFCO0lBQ3JCLEtBQWM7SUFDZCxLQUFjO0lBQ2QsTUFBWTtJQUNaLFlBQXdCO0lBQ3hCLDJCQUF3QztJQUV4QyxZQUNFLE1BQWMsRUFDZCxJQUFtQixFQUNuQixJQUFVLEVBQ1YsS0FBWSxFQUNaLEtBQW1CLENBQ25CO1FBQ0EsS0FBSyxDQUFDO1FBQ04sSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLElBQUksQ0FBQyxFQUFFO1FBQ3RCLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDbEIsSUFBSSxDQUFDLElBQUksR0FBRztRQUNaLElBQUksQ0FBQyxLQUFLLEdBQUc7UUFDYixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksbUJBQW1CLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSTtRQUN2RSxJQUFJLENBQUMsV0FBVyxHQUFHLFNBQVMsSUFBSSxZQUFZLFlBQVksT0FBTztRQUMvRCxJQUFJLENBQUMsS0FBSyxDQUNQLEtBQUssR0FDTCxJQUFJLENBQUMsQ0FBQyxRQUFVO1lBQ2YsTUFBTSxrQkFBNEIsRUFBRTtZQUVwQyxLQUFLLE1BQU0sUUFBUSxNQUFPO2dCQUN4QixnQkFBZ0IsSUFBSSxJQUNmLEtBQUssV0FBVyxDQUNoQixPQUFPLEdBQ1AsTUFBTSxDQUFDLENBQUMsSUFBTSxDQUFDLGdCQUFnQixRQUFRLENBQUM7WUFFL0M7WUFFQSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sSUFDbEIsSUFBSSxDQUFDLFdBQVcsQ0FDaEIsT0FBTyxHQUNQLE1BQU0sQ0FBQyxDQUFDLElBQU0sQ0FBQyxnQkFBZ0IsUUFBUSxDQUFDO1lBRTdDLElBQUksQ0FBQyxXQUFXLENBQUMsR0FBRyxJQUNmLGdCQUFnQixNQUFNLENBQ3ZCLENBQUMsSUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxLQUFLO1FBRzdELEdBQ0MsS0FBSyxDQUFDLENBQUMsSUFBTTtRQUNaLHVDQUF1QztRQUN6QztJQUNKO0lBRUEsSUFBSSxjQUFzQjtRQUN4QixPQUFPLElBQUksQ0FBQyxJQUFJLEtBQUssSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRO0lBQzVEO0lBRUEsV0FBbUI7UUFDakIsT0FBTyxJQUFJLENBQUMsSUFBSSxDQUFDLFdBQVc7SUFDOUI7SUFFQSxhQUFhLElBQW1CLEVBQVE7UUFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSTtRQUNsQyxJQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNO1FBQ3hDLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLFFBQVE7UUFDL0MsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLGFBQWEsSUFBSSxJQUFJLENBQUMsWUFBWTtRQUMzRCxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJO1FBQ2xDLElBQUksQ0FBQyxJQUFJLEdBQUcsS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUk7UUFDbEMsSUFBSSxDQUFDLDBCQUEwQixHQUM3QixLQUFLLDRCQUE0QixLQUFLLElBQUksR0FDdEMsSUFBSSxHQUNKLEtBQUssNEJBQTRCLEtBQUssWUFDdEMsWUFDQSxJQUFJLEtBQUssS0FBSyw0QkFBNEIsQ0FBQztJQUNuRDtJQUVBOztHQUVDLEdBQ0QsTUFBTSxRQUF5QjtRQUM3QixNQUFNLE1BQU0sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDOUMsSUFBSSxPQUFPLFFBQVEsVUFBVSxNQUFNLElBQUksTUFBTSxvQkFBbUI7UUFDaEUsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRTtRQUN0QyxJQUFJLENBQUMsWUFBWSxDQUFDO1FBQ2xCLE9BQU8sSUFBSTtJQUNiO0lBRUE7Ozs7R0FJQyxHQUNELE1BQU0sS0FBSyxJQUFnQixFQUFFLE1BQWUsRUFBbUI7UUFDN0QsTUFBTSxVQUFVO1lBQ2QsTUFBTSxLQUFLLElBQUk7WUFDZixPQUFPLEtBQUssS0FBSyxFQUFFLElBQUksQ0FBQyxJQUFPLE9BQU8sTUFBTSxXQUFXLElBQUksRUFBRSxFQUFFO1lBQy9ELE1BQU0sS0FBSyxJQUFJO1lBQ2YsTUFBTSxLQUFLLElBQUk7WUFDZiw4QkFDRSxLQUFLLDBCQUEwQixFQUFFO1lBQ25DLFlBQ0UsT0FBTyxLQUFLLE9BQU8sS0FBSyxXQUFXLEtBQUssT0FBTyxHQUFHLEtBQUssT0FBTyxFQUFFLEVBQUU7UUFDdEU7UUFFQSxNQUFNLE1BQU0sTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQ3RDLGFBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FDbkMsU0FDQSxXQUNBLElBQUksRUFDSixJQUFJLEVBQ0o7WUFDRTtRQUNGO1FBRUYsSUFBSSxJQUFJLEVBQUUsS0FBSyxJQUFJLEVBQUU7WUFDbkIsSUFBSSxLQUFLLElBQUksS0FBSyxXQUNoQixJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssSUFBSSxLQUFLLElBQUksR0FBRyxJQUFJLEdBQUcsS0FBSyxJQUFJO1lBQ25ELElBQUksS0FBSyxJQUFJLEtBQUssV0FBVyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssSUFBSTtZQUNsRCxJQUFJLEtBQUssSUFBSSxLQUFLLFdBQVcsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLElBQUk7UUFDcEQsQ0FBQztRQUNELE9BQU8sSUFBSTtJQUNiO0lBRUE7OztHQUdDLEdBQ0QsTUFBTSxZQUFZLElBQWEsRUFBRSxNQUFlLEVBQW1CO1FBQ2pFLE9BQU8sTUFBTSxJQUFJLENBQUMsSUFBSSxDQUNwQjtZQUNFLE1BQU0sU0FBUyxZQUFZLElBQUksR0FBRyxJQUFJO1FBQ3hDLEdBQ0E7SUFFSjtJQUVBOztHQUVDLEdBQ0QsTUFBTSxjQUFjLE1BQWUsRUFBbUI7UUFDcEQsT0FBTyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsV0FBVztJQUMzQztJQUVBOzs7R0FHQyxHQUNELE1BQU0sUUFBUSxJQUFjLEVBQUUsTUFBZSxFQUFtQjtRQUM5RCxPQUFPLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FDcEI7WUFDRSxNQUFNLFFBQVEsS0FBSztRQUNyQixHQUNBO0lBRUo7SUFFQTs7O0dBR0MsR0FDRCxNQUFNLFdBQVcsVUFBd0IsRUFBRSxNQUFlLEVBQW1CO1FBQzNFLE9BQU8sTUFBTSxJQUFJLENBQUMsSUFBSSxDQUNwQjtZQUNFLDRCQUE0QjtRQUM5QixHQUNBO0lBRUo7SUFFQTs7R0FFQyxHQUNELE1BQU0sYUFBYSxNQUFlLEVBQW1CO1FBQ25ELE9BQU8sTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRTtJQUNyQztJQUVBOzs7R0FHQyxHQUNELE1BQU0sUUFBUSxJQUFjLEVBQUUsTUFBZSxFQUFtQjtRQUM5RCxPQUFPLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FDcEI7WUFDRSxNQUFNLFFBQVEsS0FBSztRQUNyQixHQUNBO0lBRUo7SUFFQTs7O0dBR0MsR0FDRCxNQUFNLGlCQUNKLE9BQXNDLEVBQ3RDLE1BQWUsRUFDRTtRQUNqQixPQUFPLE1BQU0sSUFBSSxDQUFDLElBQUksQ0FDcEI7WUFDRSxTQUFTLFdBQVcsSUFBSTtRQUMxQixHQUNBO0lBRUo7SUFFQTs7R0FFQyxHQUNELE1BQU0sZ0JBQWdCLE1BQWUsRUFBbUI7UUFDdEQsT0FBTyxNQUFNLElBQUksQ0FBQyxJQUFJLENBQ3BCO1lBQ0UsU0FBUyxJQUFJO1FBQ2YsR0FDQTtJQUVKO0lBRUE7O0dBRUMsR0FDRCxNQUFNLFNBQTBCO1FBQzlCLE9BQU8sTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUs7SUFDakM7SUFFQTs7R0FFQyxHQUNELE1BQU0sU0FBMEI7UUFDOUIsT0FBTyxNQUFNLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSztJQUNqQztJQUVBOztHQUVDLEdBQ0QsTUFBTSxLQUFLLE1BQWUsRUFBb0I7UUFDNUMsTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQzNCLGFBQWEsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FDbkMsV0FDQSxXQUNBLElBQUksRUFDSixXQUNBO1lBQ0U7UUFDRjtRQUVGLE9BQU8sSUFBSTtJQUNiO0lBRUE7Ozs7R0FJQyxHQUNELE1BQU0sSUFBSSxNQUFlLEVBQUUsaUJBQTBCLEVBQWlCO1FBQ3BFLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsUUFBUTtJQUM5QztJQUVBLE1BQU0sV0FBVyxFQUFXLEVBQW9CO1FBQzlDLEtBQUssTUFBTyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUMvQixJQUFJLElBQUksQ0FBQyxFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLEVBQUUsS0FBSyxHQUFHLEVBQUUsRUFBRSxPQUFPLEtBQUs7UUFDckUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sS0FBSyxHQUFHLEVBQUUsRUFBRSxPQUFPLElBQUk7UUFDN0MsTUFBTSxZQUFZLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxJQUFJLENBQzdDLENBQUMsR0FBRyxJQUFNLEVBQUUsUUFBUSxHQUFHLEVBQUUsUUFBUSxDQUNsQyxDQUFDLEVBQUU7UUFDSixNQUFNLFVBQVUsQ0FBQyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsSUFBSSxDQUM3QyxDQUFDLEdBQUcsSUFBTSxFQUFFLFFBQVEsR0FBRyxFQUFFLFFBQVEsQ0FDbEMsQ0FBQyxFQUFFO1FBQ0osT0FBTyxVQUFVLFFBQVEsR0FBRyxRQUFRLFFBQVE7SUFDOUM7SUFFQSxNQUFNLFNBQVMsRUFBVyxFQUFvQjtRQUM1QyxNQUFNLGFBQWEsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxZQUFZLE9BQU8sS0FBSztRQUM3QixNQUFNLEtBQUssTUFBTyxNQUFNLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNyQyxPQUFPLEdBQUcsV0FBVyxDQUFDLEdBQUcsQ0FBQztJQUM1QjtJQUVBLE1BQU0sU0FBUyxFQUFXLEVBQW9CO1FBQzVDLE1BQU0sYUFBYSxNQUFNLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDekMsSUFBSSxDQUFDLFlBQVksT0FBTyxLQUFLO1FBQzdCLE1BQU0sS0FBSyxNQUFPLE1BQU0sSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3JDLE9BQU8sR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDO0lBQzVCO0lBRUEsVUFBVSxTQUF1QixLQUFLLEVBQUUsT0FBa0IsR0FBRyxFQUFVO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxZQUMzQyxDQUFDLEVBQUUsU0FDRCxvQkFBb0IsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FDNUQsUUFDQSxNQUNBLENBQUMsR0FDSCxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEtBQUs7SUFDdkM7SUFFQSxNQUFNLGlCQUFrQztRQUN0QyxPQUNFLENBQUMsTUFBTSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUN0QixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQU0sRUFBRSxRQUFRLEdBQUcsRUFBRSxRQUFRLEVBQ3RDLElBQUksQ0FBQyxDQUFDLElBQU0sRUFBRSxLQUFLLEtBQUssSUFBSSxTQUFTO0lBRTVDO0FBQ0YsQ0FBQyJ9