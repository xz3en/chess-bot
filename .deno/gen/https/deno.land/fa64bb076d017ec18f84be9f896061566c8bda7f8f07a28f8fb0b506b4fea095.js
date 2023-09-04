import { OverrideType } from '../types/channel.ts';
import { CHANNEL } from '../types/endpoint.ts';
import { isDMChannel, isGroupDMChannel, isThreadChannel, isCategoryChannel, isGuildBasedTextChannel, isGuildChannel, isGuildTextChannel, isNewsChannel, isStageVoiceChannel, isStoreChannel, isTextChannel, isVoiceChannel } from '../utils/channelTypes.ts';
import { Permissions } from '../utils/permissions.ts';
import { SnowflakeBase } from './base.ts';
import { Member } from './member.ts';
import { Role } from './role.ts';
export class Channel extends SnowflakeBase {
    type;
    flags;
    static cacheName = 'channel';
    get mention() {
        return `<#${this.id}>`;
    }
    toString() {
        return this.mention;
    }
    constructor(client, data){
        super(client, data);
        this.readFromData(data);
    }
    readFromData(data) {
        this.type = data.type ?? this.type;
        this.id = data.id ?? this.id;
        this.flags = data.flags ?? this.flags;
    }
    isDM() {
        return isDMChannel(this);
    }
    isGroupDM() {
        return isGroupDMChannel(this);
    }
    isGuild() {
        return isGuildChannel(this);
    }
    isText() {
        return isTextChannel(this);
    }
    isVoice() {
        return isVoiceChannel(this);
    }
    isStage() {
        return isStageVoiceChannel(this);
    }
    isThread() {
        return isThreadChannel(this);
    }
    isGuildTextBased() {
        return isGuildBasedTextChannel(this);
    }
    isGuildText() {
        return isGuildTextChannel(this);
    }
    isCategory() {
        return isCategoryChannel(this);
    }
    isNews() {
        return isNewsChannel(this);
    }
    isStore() {
        return isStoreChannel(this);
    }
}
export class GuildChannel extends Channel {
    guildID;
    name;
    position;
    permissionOverwrites;
    guild;
    nsfw;
    parentID;
    constructor(client, data, guild){
        super(client, data);
        this.guildID = data.guild_id;
        this.name = data.name;
        this.guild = guild;
        this.position = data.position;
        this.permissionOverwrites = data.permission_overwrites;
        this.nsfw = data.nsfw;
        this.parentID = data.parent_id;
    }
    readFromData(data) {
        super.readFromData(data);
        this.guildID = data.guild_id ?? this.guildID;
        this.name = data.name ?? this.name;
        this.position = data.position ?? this.position;
        this.permissionOverwrites = data.permission_overwrites ?? this.permissionOverwrites;
        this.nsfw = data.nsfw ?? this.nsfw;
        this.parentID = data.parent_id ?? this.parentID;
    }
    async delete() {
        await this.client.rest.endpoints.deleteChannel(this.id);
        return this;
    }
    /** Get Permission Overties for a specific Member or Role */ async overwritesFor(target) {
        const stringToObject = typeof target === 'string' ? await this.guild.members.get(target) ?? await this.guild.roles.get(target) : target;
        if (stringToObject === undefined) {
            throw new Error('Member or Role not found');
        } else {
            target = stringToObject;
        }
        const roles = target instanceof Member ? await target.roles.array() : undefined;
        const overwrites = [];
        for (const overwrite of this.permissionOverwrites){
            if (overwrite.id === this.guild.id || roles?.some((e)=>e.id === overwrite.id) === true || overwrite.id === target.id) {
                const id = await this.guild.members.get(overwrite.id) ?? await this.guild.roles.get(overwrite.id) ?? overwrite.id;
                const allow = new Permissions(overwrite.allow);
                const deny = new Permissions(overwrite.deny);
                overwrites.push({
                    id,
                    type: overwrite.type,
                    allow,
                    deny
                });
            }
        }
        return overwrites;
    }
    /** Edit category of the channel */ async setCategory(category) {
        return await this.edit({
            parentID: typeof category === 'object' ? category.id : category
        });
    }
    /** Get Permissions for a Member in this Channel */ async permissionsFor(target) {
        const id = typeof target === 'string' ? target : target.id;
        if (id === this.guild.ownerID) return new Permissions(Permissions.ALL);
        const stringToObject = typeof target === 'string' ? await this.guild.members.get(target) ?? await this.guild.roles.get(target) : target;
        if (stringToObject === undefined) {
            throw new Error('Member or Role not found');
        } else {
            target = stringToObject;
        }
        if (target.permissions.has('ADMINISTRATOR') === true) return new Permissions(Permissions.ALL);
        const overwrites = await this.overwritesFor(target);
        const everyoneOW = overwrites.find((e)=>e.id === this.guild.id);
        const roleOWs = overwrites.filter((e)=>e.type === 0);
        const memberOWs = overwrites.filter((e)=>e.type === 1);
        return target.permissions.remove(everyoneOW !== undefined ? Number(everyoneOW.deny) : 0).add(everyoneOW !== undefined ? Number(everyoneOW.allow) : 0).remove(roleOWs.length === 0 ? 0 : roleOWs.map((e)=>Number(e.deny))).add(roleOWs.length === 0 ? 0 : roleOWs.map((e)=>Number(e.allow))).remove(memberOWs.length === 0 ? 0 : memberOWs.map((e)=>Number(e.deny))).add(memberOWs.length === 0 ? 0 : memberOWs.map((e)=>Number(e.allow)));
    }
    async edit(options) {
        const body = {
            name: options?.name,
            position: options?.position,
            permission_overwrites: options?.permissionOverwrites,
            parent_id: options?.parentID,
            nsfw: options?.nsfw
        };
        const resp = await this.client.rest.patch(CHANNEL(this.id), body);
        await this.client.channels.set(resp.id, resp);
        return await this.client.channels.get(resp.id);
    }
    /** Edit name of the channel */ async setName(name) {
        return await this.edit({
            name
        });
    }
    /** Edit NSFW property of the channel */ async setNSFW(nsfw) {
        return await this.edit({
            nsfw
        });
    }
    /** Set Permission Overwrites of the Channel */ async setOverwrites(overwrites) {
        const result = overwrites.map((overwrite)=>{
            const id = typeof overwrite.id === 'string' ? overwrite.id : overwrite.id.id;
            const allow = typeof overwrite.allow === 'string' ? overwrite.allow : overwrite.allow?.toJSON() ?? '0';
            const deny = typeof overwrite.deny === 'string' ? overwrite.deny : overwrite.deny?.toJSON() ?? '0';
            const type = overwrite.id instanceof Role ? 0 : overwrite.id instanceof Member ? 1 : overwrite.type;
            if (type === undefined) {
                throw new Error('Overwrite type is undefined.');
            }
            return {
                id,
                type,
                allow,
                deny
            };
        });
        return await this.edit({
            permissionOverwrites: result
        });
    }
    /** Add a Permission Overwrite */ async addOverwrite(overwrite) {
        const overwrites = this.permissionOverwrites;
        const id = typeof overwrite.id === 'string' ? overwrite.id : overwrite.id.id;
        const allow = typeof overwrite.allow === 'string' ? overwrite.allow : overwrite.allow?.toJSON() ?? '0';
        const deny = typeof overwrite.deny === 'string' ? overwrite.deny : overwrite.deny?.toJSON() ?? '0';
        const type = overwrite.id instanceof Role ? 0 : overwrite.id instanceof Member ? 1 : overwrite.type;
        if (type === undefined) {
            throw new Error('Overwrite type is undefined.');
        }
        overwrites.push({
            id,
            type,
            allow,
            deny
        });
        return await this.edit({
            permissionOverwrites: overwrites
        });
    }
    /** Remove a Permission Overwrite */ async removeOverwrite(target) {
        target = typeof target === 'string' ? target : target.id;
        if (this.permissionOverwrites.find((e)=>e.id === target) === undefined) throw new Error('Permission Overwrite not found');
        const overwrites = this.permissionOverwrites.filter((e)=>e.id !== target);
        return await this.edit({
            permissionOverwrites: overwrites
        });
    }
    /** Edit a Permission Overwrite */ async editOverwrite(overwrite, { allow: overwriteAllow = OverrideType.ADD , deny: overwriteDeny = OverrideType.ADD  }) {
        const id = typeof overwrite.id === 'string' ? overwrite.id : overwrite.id.id;
        const index = this.permissionOverwrites.findIndex((e)=>e.id === id);
        if (index < 0) throw new Error('Permission Overwrite not found');
        const overwrites = this.permissionOverwrites;
        let allow;
        let deny;
        if (overwrite.allow !== undefined && overwriteAllow !== OverrideType.REPLACE) {
            switch(overwriteAllow){
                case OverrideType.ADD:
                    {
                        const originalAllow = new Permissions(overwrites[index].allow);
                        const newAllow = new Permissions(overwrite.allow);
                        allow = originalAllow.add([
                            newAllow
                        ]).toJSON();
                        break;
                    }
                case OverrideType.REMOVE:
                    {
                        const originalAllow1 = new Permissions(overwrites[index].allow);
                        const newAllow1 = new Permissions(overwrite.allow);
                        allow = originalAllow1.remove([
                            newAllow1
                        ]).toJSON();
                        break;
                    }
            }
        } else {
            allow = typeof overwrite.allow === 'string' ? overwrite.allow : overwrite.allow?.toJSON() ?? overwrites[index].allow;
        }
        if (overwrite.deny !== undefined && overwriteDeny !== OverrideType.REPLACE) {
            switch(overwriteDeny){
                case OverrideType.ADD:
                    {
                        const originalDeny = new Permissions(overwrites[index].deny);
                        const newDeny = new Permissions(overwrite.deny);
                        deny = originalDeny.add([
                            newDeny
                        ]).toJSON();
                        break;
                    }
                case OverrideType.REMOVE:
                    {
                        const originalDeny1 = new Permissions(overwrites[index].deny);
                        const newDeny1 = new Permissions(overwrite.deny);
                        deny = originalDeny1.remove([
                            newDeny1
                        ]).toJSON();
                        break;
                    }
            }
        } else {
            deny = typeof overwrite.deny === 'string' ? overwrite.deny : overwrite.deny?.toJSON() ?? overwrites[index].deny;
        }
        const type = overwrite.id instanceof Role ? 0 : overwrite.id instanceof Member ? 1 : overwrite.type;
        if (type === undefined) {
            throw new Error('Overwrite type is undefined.');
        }
        overwrites[index] = {
            id,
            type,
            allow,
            deny
        };
        return await this.edit({
            permissionOverwrites: overwrites
        });
    }
    /** Edit position of the channel */ async setPosition(position) {
        return await this.edit({
            position
        });
    }
    /** Create an Invite for this Channel */ async createInvite(options) {
        return this.guild.invites.create(this.id, options);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvY2hhbm5lbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgdHlwZSB7XG4gIENoYW5uZWxQYXlsb2FkLFxuICBDaGFubmVsVHlwZXMsXG4gIE1vZGlmeUNoYW5uZWxPcHRpb24sXG4gIE1vZGlmeUNoYW5uZWxQYXlsb2FkLFxuICBPdmVyd3JpdGUsXG4gIE92ZXJ3cml0ZVBheWxvYWQsXG4gIE92ZXJ3cml0ZUFzQXJnXG59IGZyb20gJy4uL3R5cGVzL2NoYW5uZWwudHMnXG5pbXBvcnQgeyBPdmVycmlkZVR5cGUgfSBmcm9tICcuLi90eXBlcy9jaGFubmVsLnRzJ1xuaW1wb3J0IHsgQ0hBTk5FTCB9IGZyb20gJy4uL3R5cGVzL2VuZHBvaW50LnRzJ1xuaW1wb3J0IHR5cGUgeyBHdWlsZENoYW5uZWxQYXlsb2FkcywgR3VpbGRDaGFubmVscyB9IGZyb20gJy4uL3R5cGVzL2d1aWxkLnRzJ1xuaW1wb3J0IHtcbiAgaXNETUNoYW5uZWwsXG4gIGlzR3JvdXBETUNoYW5uZWwsXG4gIGlzVGhyZWFkQ2hhbm5lbCxcbiAgaXNDYXRlZ29yeUNoYW5uZWwsXG4gIGlzR3VpbGRCYXNlZFRleHRDaGFubmVsLFxuICBpc0d1aWxkQ2hhbm5lbCxcbiAgaXNHdWlsZFRleHRDaGFubmVsLFxuICBpc05ld3NDaGFubmVsLFxuICBpc1N0YWdlVm9pY2VDaGFubmVsLFxuICBpc1N0b3JlQ2hhbm5lbCxcbiAgaXNUZXh0Q2hhbm5lbCxcbiAgaXNWb2ljZUNoYW5uZWxcbn0gZnJvbSAnLi4vdXRpbHMvY2hhbm5lbFR5cGVzLnRzJ1xuaW1wb3J0IHsgUGVybWlzc2lvbnMgfSBmcm9tICcuLi91dGlscy9wZXJtaXNzaW9ucy50cydcbmltcG9ydCB7IFNub3dmbGFrZUJhc2UgfSBmcm9tICcuL2Jhc2UudHMnXG5pbXBvcnQgdHlwZSB7IEd1aWxkIH0gZnJvbSAnLi9ndWlsZC50cydcbmltcG9ydCB7IE1lbWJlciB9IGZyb20gJy4vbWVtYmVyLnRzJ1xuaW1wb3J0IHsgUm9sZSB9IGZyb20gJy4vcm9sZS50cydcbmltcG9ydCB0eXBlIHsgRE1DaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9kbUNoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IEdyb3VwRE1DaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9ncm91cENoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IENhdGVnb3J5Q2hhbm5lbCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvZ3VpbGRDYXRlZ29yeUNoYW5uZWwudHMnXG5pbXBvcnQgdHlwZSB7IE5ld3NDaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9ndWlsZE5ld3NDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBTdG9yZUNoYW5uZWwgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2d1aWxkU3RvcmVDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUge1xuICBHdWlsZFRleHRCYXNlZENoYW5uZWwsXG4gIEd1aWxkVGV4dENoYW5uZWxcbn0gZnJvbSAnLi4vc3RydWN0dXJlcy9ndWlsZFRleHRDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBWb2ljZUNoYW5uZWwgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2d1aWxkVm9pY2VDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBTdGFnZVZvaWNlQ2hhbm5lbCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvZ3VpbGRWb2ljZVN0YWdlQ2hhbm5lbC50cydcbmltcG9ydCB0eXBlIHsgVGV4dENoYW5uZWwgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL3RleHRDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBUaHJlYWRDaGFubmVsIH0gZnJvbSAnLi4vc3RydWN0dXJlcy90aHJlYWRDaGFubmVsLnRzJ1xuaW1wb3J0IHsgQ3JlYXRlSW52aXRlT3B0aW9ucyB9IGZyb20gJy4uL21hbmFnZXJzL2ludml0ZXMudHMnXG5pbXBvcnQgeyBJbnZpdGUgfSBmcm9tICcuL2ludml0ZS50cydcblxuZXhwb3J0IGNsYXNzIENoYW5uZWwgZXh0ZW5kcyBTbm93Zmxha2VCYXNlIHtcbiAgdHlwZSE6IENoYW5uZWxUeXBlc1xuICBmbGFncyE6IG51bWJlclxuXG4gIHN0YXRpYyBjYWNoZU5hbWUgPSAnY2hhbm5lbCdcblxuICBnZXQgbWVudGlvbigpOiBzdHJpbmcge1xuICAgIHJldHVybiBgPCMke3RoaXMuaWR9PmBcbiAgfVxuXG4gIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMubWVudGlvblxuICB9XG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQsIGRhdGE6IENoYW5uZWxQYXlsb2FkKSB7XG4gICAgc3VwZXIoY2xpZW50LCBkYXRhKVxuICAgIHRoaXMucmVhZEZyb21EYXRhKGRhdGEpXG4gIH1cblxuICByZWFkRnJvbURhdGEoZGF0YTogQ2hhbm5lbFBheWxvYWQpOiB2b2lkIHtcbiAgICB0aGlzLnR5cGUgPSBkYXRhLnR5cGUgPz8gdGhpcy50eXBlXG4gICAgdGhpcy5pZCA9IGRhdGEuaWQgPz8gdGhpcy5pZFxuICAgIHRoaXMuZmxhZ3MgPSBkYXRhLmZsYWdzID8/IHRoaXMuZmxhZ3NcbiAgfVxuXG4gIGlzRE0oKTogdGhpcyBpcyBETUNoYW5uZWwge1xuICAgIHJldHVybiBpc0RNQ2hhbm5lbCh0aGlzKVxuICB9XG5cbiAgaXNHcm91cERNKCk6IHRoaXMgaXMgR3JvdXBETUNoYW5uZWwge1xuICAgIHJldHVybiBpc0dyb3VwRE1DaGFubmVsKHRoaXMpXG4gIH1cblxuICBpc0d1aWxkKCk6IHRoaXMgaXMgR3VpbGRDaGFubmVsIHtcbiAgICByZXR1cm4gaXNHdWlsZENoYW5uZWwodGhpcylcbiAgfVxuXG4gIGlzVGV4dCgpOiB0aGlzIGlzIFRleHRDaGFubmVsIHtcbiAgICByZXR1cm4gaXNUZXh0Q2hhbm5lbCh0aGlzKVxuICB9XG5cbiAgaXNWb2ljZSgpOiB0aGlzIGlzIFZvaWNlQ2hhbm5lbCB7XG4gICAgcmV0dXJuIGlzVm9pY2VDaGFubmVsKHRoaXMpXG4gIH1cblxuICBpc1N0YWdlKCk6IHRoaXMgaXMgU3RhZ2VWb2ljZUNoYW5uZWwge1xuICAgIHJldHVybiBpc1N0YWdlVm9pY2VDaGFubmVsKHRoaXMpXG4gIH1cblxuICBpc1RocmVhZCgpOiB0aGlzIGlzIFRocmVhZENoYW5uZWwge1xuICAgIHJldHVybiBpc1RocmVhZENoYW5uZWwodGhpcylcbiAgfVxuXG4gIGlzR3VpbGRUZXh0QmFzZWQoKTogdGhpcyBpcyBHdWlsZFRleHRCYXNlZENoYW5uZWwge1xuICAgIHJldHVybiBpc0d1aWxkQmFzZWRUZXh0Q2hhbm5lbCh0aGlzKVxuICB9XG5cbiAgaXNHdWlsZFRleHQoKTogdGhpcyBpcyBHdWlsZFRleHRDaGFubmVsIHtcbiAgICByZXR1cm4gaXNHdWlsZFRleHRDaGFubmVsKHRoaXMpXG4gIH1cblxuICBpc0NhdGVnb3J5KCk6IHRoaXMgaXMgQ2F0ZWdvcnlDaGFubmVsIHtcbiAgICByZXR1cm4gaXNDYXRlZ29yeUNoYW5uZWwodGhpcylcbiAgfVxuXG4gIGlzTmV3cygpOiB0aGlzIGlzIE5ld3NDaGFubmVsIHtcbiAgICByZXR1cm4gaXNOZXdzQ2hhbm5lbCh0aGlzKVxuICB9XG5cbiAgaXNTdG9yZSgpOiB0aGlzIGlzIFN0b3JlQ2hhbm5lbCB7XG4gICAgcmV0dXJuIGlzU3RvcmVDaGFubmVsKHRoaXMpXG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFZGl0T3ZlcndyaXRlT3B0aW9ucyB7XG4gIC8qKiBBbGxvdyBPdmVycmlkZSBUeXBlICovXG4gIGFsbG93PzogT3ZlcnJpZGVUeXBlXG4gIC8qKiBEZW55IE92ZXJyaWRlIFR5cGUgKi9cbiAgZGVueT86IE92ZXJyaWRlVHlwZVxufVxuXG5leHBvcnQgY2xhc3MgR3VpbGRDaGFubmVsIGV4dGVuZHMgQ2hhbm5lbCB7XG4gIGd1aWxkSUQ6IHN0cmluZ1xuICBuYW1lOiBzdHJpbmdcbiAgcG9zaXRpb246IG51bWJlclxuICBwZXJtaXNzaW9uT3ZlcndyaXRlczogT3ZlcndyaXRlUGF5bG9hZFtdXG4gIGd1aWxkOiBHdWlsZFxuICBuc2Z3OiBib29sZWFuXG4gIHBhcmVudElEPzogc3RyaW5nXG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQsIGRhdGE6IEd1aWxkQ2hhbm5lbFBheWxvYWRzLCBndWlsZDogR3VpbGQpIHtcbiAgICBzdXBlcihjbGllbnQsIGRhdGEpXG4gICAgdGhpcy5ndWlsZElEID0gZGF0YS5ndWlsZF9pZFxuICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZVxuICAgIHRoaXMuZ3VpbGQgPSBndWlsZFxuICAgIHRoaXMucG9zaXRpb24gPSBkYXRhLnBvc2l0aW9uXG4gICAgdGhpcy5wZXJtaXNzaW9uT3ZlcndyaXRlcyA9IGRhdGEucGVybWlzc2lvbl9vdmVyd3JpdGVzXG4gICAgdGhpcy5uc2Z3ID0gZGF0YS5uc2Z3XG4gICAgdGhpcy5wYXJlbnRJRCA9IGRhdGEucGFyZW50X2lkXG4gIH1cblxuICByZWFkRnJvbURhdGEoZGF0YTogR3VpbGRDaGFubmVsUGF5bG9hZHMpOiB2b2lkIHtcbiAgICBzdXBlci5yZWFkRnJvbURhdGEoZGF0YSlcbiAgICB0aGlzLmd1aWxkSUQgPSBkYXRhLmd1aWxkX2lkID8/IHRoaXMuZ3VpbGRJRFxuICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZSA/PyB0aGlzLm5hbWVcbiAgICB0aGlzLnBvc2l0aW9uID0gZGF0YS5wb3NpdGlvbiA/PyB0aGlzLnBvc2l0aW9uXG4gICAgdGhpcy5wZXJtaXNzaW9uT3ZlcndyaXRlcyA9XG4gICAgICBkYXRhLnBlcm1pc3Npb25fb3ZlcndyaXRlcyA/PyB0aGlzLnBlcm1pc3Npb25PdmVyd3JpdGVzXG4gICAgdGhpcy5uc2Z3ID0gZGF0YS5uc2Z3ID8/IHRoaXMubnNmd1xuICAgIHRoaXMucGFyZW50SUQgPSBkYXRhLnBhcmVudF9pZCA/PyB0aGlzLnBhcmVudElEXG4gIH1cblxuICBhc3luYyBkZWxldGUoKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgYXdhaXQgdGhpcy5jbGllbnQucmVzdC5lbmRwb2ludHMuZGVsZXRlQ2hhbm5lbCh0aGlzLmlkKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogR2V0IFBlcm1pc3Npb24gT3ZlcnRpZXMgZm9yIGEgc3BlY2lmaWMgTWVtYmVyIG9yIFJvbGUgKi9cbiAgYXN5bmMgb3ZlcndyaXRlc0Zvcih0YXJnZXQ6IE1lbWJlciB8IFJvbGUgfCBzdHJpbmcpOiBQcm9taXNlPE92ZXJ3cml0ZVtdPiB7XG4gICAgY29uc3Qgc3RyaW5nVG9PYmplY3QgPVxuICAgICAgdHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZydcbiAgICAgICAgPyAoYXdhaXQgdGhpcy5ndWlsZC5tZW1iZXJzLmdldCh0YXJnZXQpKSA/P1xuICAgICAgICAgIChhd2FpdCB0aGlzLmd1aWxkLnJvbGVzLmdldCh0YXJnZXQpKVxuICAgICAgICA6IHRhcmdldFxuXG4gICAgaWYgKHN0cmluZ1RvT2JqZWN0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignTWVtYmVyIG9yIFJvbGUgbm90IGZvdW5kJylcbiAgICB9IGVsc2Uge1xuICAgICAgdGFyZ2V0ID0gc3RyaW5nVG9PYmplY3RcbiAgICB9XG5cbiAgICBjb25zdCByb2xlcyA9XG4gICAgICB0YXJnZXQgaW5zdGFuY2VvZiBNZW1iZXIgPyBhd2FpdCB0YXJnZXQucm9sZXMuYXJyYXkoKSA6IHVuZGVmaW5lZFxuXG4gICAgY29uc3Qgb3ZlcndyaXRlczogT3ZlcndyaXRlW10gPSBbXVxuXG4gICAgZm9yIChjb25zdCBvdmVyd3JpdGUgb2YgdGhpcy5wZXJtaXNzaW9uT3ZlcndyaXRlcykge1xuICAgICAgaWYgKFxuICAgICAgICBvdmVyd3JpdGUuaWQgPT09IHRoaXMuZ3VpbGQuaWQgfHxcbiAgICAgICAgcm9sZXM/LnNvbWUoKGUpID0+IGUuaWQgPT09IG92ZXJ3cml0ZS5pZCkgPT09IHRydWUgfHxcbiAgICAgICAgb3ZlcndyaXRlLmlkID09PSB0YXJnZXQuaWRcbiAgICAgICkge1xuICAgICAgICBjb25zdCBpZCA9XG4gICAgICAgICAgKGF3YWl0IHRoaXMuZ3VpbGQubWVtYmVycy5nZXQob3ZlcndyaXRlLmlkKSkgPz9cbiAgICAgICAgICAoYXdhaXQgdGhpcy5ndWlsZC5yb2xlcy5nZXQob3ZlcndyaXRlLmlkKSkgPz9cbiAgICAgICAgICBvdmVyd3JpdGUuaWRcbiAgICAgICAgY29uc3QgYWxsb3cgPSBuZXcgUGVybWlzc2lvbnMob3ZlcndyaXRlLmFsbG93KVxuICAgICAgICBjb25zdCBkZW55ID0gbmV3IFBlcm1pc3Npb25zKG92ZXJ3cml0ZS5kZW55KVxuXG4gICAgICAgIG92ZXJ3cml0ZXMucHVzaCh7XG4gICAgICAgICAgaWQsXG4gICAgICAgICAgdHlwZTogb3ZlcndyaXRlLnR5cGUsXG4gICAgICAgICAgYWxsb3csXG4gICAgICAgICAgZGVueVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBvdmVyd3JpdGVzXG4gIH1cblxuICAvKiogRWRpdCBjYXRlZ29yeSBvZiB0aGUgY2hhbm5lbCAqL1xuICBhc3luYyBzZXRDYXRlZ29yeShcbiAgICBjYXRlZ29yeTogQ2F0ZWdvcnlDaGFubmVsIHwgc3RyaW5nXG4gICk6IFByb21pc2U8R3VpbGRDaGFubmVscz4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmVkaXQoe1xuICAgICAgcGFyZW50SUQ6IHR5cGVvZiBjYXRlZ29yeSA9PT0gJ29iamVjdCcgPyBjYXRlZ29yeS5pZCA6IGNhdGVnb3J5XG4gICAgfSlcbiAgfVxuXG4gIC8qKiBHZXQgUGVybWlzc2lvbnMgZm9yIGEgTWVtYmVyIGluIHRoaXMgQ2hhbm5lbCAqL1xuICBhc3luYyBwZXJtaXNzaW9uc0Zvcih0YXJnZXQ6IE1lbWJlciB8IFJvbGUgfCBzdHJpbmcpOiBQcm9taXNlPFBlcm1pc3Npb25zPiB7XG4gICAgY29uc3QgaWQgPSB0eXBlb2YgdGFyZ2V0ID09PSAnc3RyaW5nJyA/IHRhcmdldCA6IHRhcmdldC5pZFxuICAgIGlmIChpZCA9PT0gdGhpcy5ndWlsZC5vd25lcklEKSByZXR1cm4gbmV3IFBlcm1pc3Npb25zKFBlcm1pc3Npb25zLkFMTClcblxuICAgIGNvbnN0IHN0cmluZ1RvT2JqZWN0ID1cbiAgICAgIHR5cGVvZiB0YXJnZXQgPT09ICdzdHJpbmcnXG4gICAgICAgID8gKGF3YWl0IHRoaXMuZ3VpbGQubWVtYmVycy5nZXQodGFyZ2V0KSkgPz9cbiAgICAgICAgICAoYXdhaXQgdGhpcy5ndWlsZC5yb2xlcy5nZXQodGFyZ2V0KSlcbiAgICAgICAgOiB0YXJnZXRcblxuICAgIGlmIChzdHJpbmdUb09iamVjdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ01lbWJlciBvciBSb2xlIG5vdCBmb3VuZCcpXG4gICAgfSBlbHNlIHtcbiAgICAgIHRhcmdldCA9IHN0cmluZ1RvT2JqZWN0XG4gICAgfVxuXG4gICAgaWYgKHRhcmdldC5wZXJtaXNzaW9ucy5oYXMoJ0FETUlOSVNUUkFUT1InKSA9PT0gdHJ1ZSlcbiAgICAgIHJldHVybiBuZXcgUGVybWlzc2lvbnMoUGVybWlzc2lvbnMuQUxMKVxuXG4gICAgY29uc3Qgb3ZlcndyaXRlcyA9IGF3YWl0IHRoaXMub3ZlcndyaXRlc0Zvcih0YXJnZXQpXG4gICAgY29uc3QgZXZlcnlvbmVPVyA9IG92ZXJ3cml0ZXMuZmluZCgoZSkgPT4gZS5pZCA9PT0gdGhpcy5ndWlsZC5pZClcbiAgICBjb25zdCByb2xlT1dzID0gb3ZlcndyaXRlcy5maWx0ZXIoKGUpID0+IGUudHlwZSA9PT0gMClcbiAgICBjb25zdCBtZW1iZXJPV3MgPSBvdmVyd3JpdGVzLmZpbHRlcigoZSkgPT4gZS50eXBlID09PSAxKVxuXG4gICAgcmV0dXJuIHRhcmdldC5wZXJtaXNzaW9uc1xuICAgICAgLnJlbW92ZShldmVyeW9uZU9XICE9PSB1bmRlZmluZWQgPyBOdW1iZXIoZXZlcnlvbmVPVy5kZW55KSA6IDApXG4gICAgICAuYWRkKGV2ZXJ5b25lT1cgIT09IHVuZGVmaW5lZCA/IE51bWJlcihldmVyeW9uZU9XLmFsbG93KSA6IDApXG4gICAgICAucmVtb3ZlKHJvbGVPV3MubGVuZ3RoID09PSAwID8gMCA6IHJvbGVPV3MubWFwKChlKSA9PiBOdW1iZXIoZS5kZW55KSkpXG4gICAgICAuYWRkKHJvbGVPV3MubGVuZ3RoID09PSAwID8gMCA6IHJvbGVPV3MubWFwKChlKSA9PiBOdW1iZXIoZS5hbGxvdykpKVxuICAgICAgLnJlbW92ZShtZW1iZXJPV3MubGVuZ3RoID09PSAwID8gMCA6IG1lbWJlck9Xcy5tYXAoKGUpID0+IE51bWJlcihlLmRlbnkpKSlcbiAgICAgIC5hZGQobWVtYmVyT1dzLmxlbmd0aCA9PT0gMCA/IDAgOiBtZW1iZXJPV3MubWFwKChlKSA9PiBOdW1iZXIoZS5hbGxvdykpKVxuICB9XG5cbiAgYXN5bmMgZWRpdChvcHRpb25zPzogTW9kaWZ5Q2hhbm5lbE9wdGlvbik6IFByb21pc2U8R3VpbGRDaGFubmVscz4ge1xuICAgIGNvbnN0IGJvZHk6IE1vZGlmeUNoYW5uZWxQYXlsb2FkID0ge1xuICAgICAgbmFtZTogb3B0aW9ucz8ubmFtZSxcbiAgICAgIHBvc2l0aW9uOiBvcHRpb25zPy5wb3NpdGlvbixcbiAgICAgIHBlcm1pc3Npb25fb3ZlcndyaXRlczogb3B0aW9ucz8ucGVybWlzc2lvbk92ZXJ3cml0ZXMsXG4gICAgICBwYXJlbnRfaWQ6IG9wdGlvbnM/LnBhcmVudElELFxuICAgICAgbnNmdzogb3B0aW9ucz8ubnNmd1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3AgPSBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LnBhdGNoKENIQU5ORUwodGhpcy5pZCksIGJvZHkpXG4gICAgYXdhaXQgdGhpcy5jbGllbnQuY2hhbm5lbHMuc2V0KHJlc3AuaWQsIHJlc3ApXG4gICAgcmV0dXJuIChhd2FpdCB0aGlzLmNsaWVudC5jaGFubmVscy5nZXQ8R3VpbGRDaGFubmVscz4ocmVzcC5pZCkpIVxuICB9XG5cbiAgLyoqIEVkaXQgbmFtZSBvZiB0aGUgY2hhbm5lbCAqL1xuICBhc3luYyBzZXROYW1lKG5hbWU6IHN0cmluZyk6IFByb21pc2U8R3VpbGRDaGFubmVscz4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmVkaXQoeyBuYW1lIH0pXG4gIH1cblxuICAvKiogRWRpdCBOU0ZXIHByb3BlcnR5IG9mIHRoZSBjaGFubmVsICovXG4gIGFzeW5jIHNldE5TRlcobnNmdzogYm9vbGVhbik6IFByb21pc2U8R3VpbGRDaGFubmVscz4ge1xuICAgIHJldHVybiBhd2FpdCB0aGlzLmVkaXQoeyBuc2Z3IH0pXG4gIH1cblxuICAvKiogU2V0IFBlcm1pc3Npb24gT3ZlcndyaXRlcyBvZiB0aGUgQ2hhbm5lbCAqL1xuICBhc3luYyBzZXRPdmVyd3JpdGVzKG92ZXJ3cml0ZXM6IE92ZXJ3cml0ZUFzQXJnW10pOiBQcm9taXNlPEd1aWxkQ2hhbm5lbHM+IHtcbiAgICBjb25zdCByZXN1bHQgPSBvdmVyd3JpdGVzLm1hcCgob3ZlcndyaXRlKTogT3ZlcndyaXRlUGF5bG9hZCA9PiB7XG4gICAgICBjb25zdCBpZCA9XG4gICAgICAgIHR5cGVvZiBvdmVyd3JpdGUuaWQgPT09ICdzdHJpbmcnID8gb3ZlcndyaXRlLmlkIDogb3ZlcndyaXRlLmlkLmlkXG4gICAgICBjb25zdCBhbGxvdyA9XG4gICAgICAgIHR5cGVvZiBvdmVyd3JpdGUuYWxsb3cgPT09ICdzdHJpbmcnXG4gICAgICAgICAgPyBvdmVyd3JpdGUuYWxsb3dcbiAgICAgICAgICA6IG92ZXJ3cml0ZS5hbGxvdz8udG9KU09OKCkgPz8gJzAnXG4gICAgICBjb25zdCBkZW55ID1cbiAgICAgICAgdHlwZW9mIG92ZXJ3cml0ZS5kZW55ID09PSAnc3RyaW5nJ1xuICAgICAgICAgID8gb3ZlcndyaXRlLmRlbnlcbiAgICAgICAgICA6IG92ZXJ3cml0ZS5kZW55Py50b0pTT04oKSA/PyAnMCdcbiAgICAgIGNvbnN0IHR5cGUgPVxuICAgICAgICBvdmVyd3JpdGUuaWQgaW5zdGFuY2VvZiBSb2xlXG4gICAgICAgICAgPyAwXG4gICAgICAgICAgOiBvdmVyd3JpdGUuaWQgaW5zdGFuY2VvZiBNZW1iZXJcbiAgICAgICAgICA/IDFcbiAgICAgICAgICA6IG92ZXJ3cml0ZS50eXBlXG4gICAgICBpZiAodHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignT3ZlcndyaXRlIHR5cGUgaXMgdW5kZWZpbmVkLicpXG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGlkLFxuICAgICAgICB0eXBlLFxuICAgICAgICBhbGxvdyxcbiAgICAgICAgZGVueVxuICAgICAgfVxuICAgIH0pXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZWRpdCh7IHBlcm1pc3Npb25PdmVyd3JpdGVzOiByZXN1bHQgfSlcbiAgfVxuXG4gIC8qKiBBZGQgYSBQZXJtaXNzaW9uIE92ZXJ3cml0ZSAqL1xuICBhc3luYyBhZGRPdmVyd3JpdGUob3ZlcndyaXRlOiBPdmVyd3JpdGVBc0FyZyk6IFByb21pc2U8R3VpbGRDaGFubmVscz4ge1xuICAgIGNvbnN0IG92ZXJ3cml0ZXMgPSB0aGlzLnBlcm1pc3Npb25PdmVyd3JpdGVzXG4gICAgY29uc3QgaWQgPSB0eXBlb2Ygb3ZlcndyaXRlLmlkID09PSAnc3RyaW5nJyA/IG92ZXJ3cml0ZS5pZCA6IG92ZXJ3cml0ZS5pZC5pZFxuICAgIGNvbnN0IGFsbG93ID1cbiAgICAgIHR5cGVvZiBvdmVyd3JpdGUuYWxsb3cgPT09ICdzdHJpbmcnXG4gICAgICAgID8gb3ZlcndyaXRlLmFsbG93XG4gICAgICAgIDogb3ZlcndyaXRlLmFsbG93Py50b0pTT04oKSA/PyAnMCdcbiAgICBjb25zdCBkZW55ID1cbiAgICAgIHR5cGVvZiBvdmVyd3JpdGUuZGVueSA9PT0gJ3N0cmluZydcbiAgICAgICAgPyBvdmVyd3JpdGUuZGVueVxuICAgICAgICA6IG92ZXJ3cml0ZS5kZW55Py50b0pTT04oKSA/PyAnMCdcbiAgICBjb25zdCB0eXBlID1cbiAgICAgIG92ZXJ3cml0ZS5pZCBpbnN0YW5jZW9mIFJvbGVcbiAgICAgICAgPyAwXG4gICAgICAgIDogb3ZlcndyaXRlLmlkIGluc3RhbmNlb2YgTWVtYmVyXG4gICAgICAgID8gMVxuICAgICAgICA6IG92ZXJ3cml0ZS50eXBlXG4gICAgaWYgKHR5cGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdPdmVyd3JpdGUgdHlwZSBpcyB1bmRlZmluZWQuJylcbiAgICB9XG5cbiAgICBvdmVyd3JpdGVzLnB1c2goe1xuICAgICAgaWQsXG4gICAgICB0eXBlLFxuICAgICAgYWxsb3csXG4gICAgICBkZW55XG4gICAgfSlcblxuICAgIHJldHVybiBhd2FpdCB0aGlzLmVkaXQoeyBwZXJtaXNzaW9uT3ZlcndyaXRlczogb3ZlcndyaXRlcyB9KVxuICB9XG5cbiAgLyoqIFJlbW92ZSBhIFBlcm1pc3Npb24gT3ZlcndyaXRlICovXG4gIGFzeW5jIHJlbW92ZU92ZXJ3cml0ZShcbiAgICB0YXJnZXQ6IE1lbWJlciB8IFJvbGUgfCBzdHJpbmdcbiAgKTogUHJvbWlzZTxHdWlsZENoYW5uZWxzPiB7XG4gICAgdGFyZ2V0ID0gdHlwZW9mIHRhcmdldCA9PT0gJ3N0cmluZycgPyB0YXJnZXQgOiB0YXJnZXQuaWRcbiAgICBpZiAodGhpcy5wZXJtaXNzaW9uT3ZlcndyaXRlcy5maW5kKChlKSA9PiBlLmlkID09PSB0YXJnZXQpID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Blcm1pc3Npb24gT3ZlcndyaXRlIG5vdCBmb3VuZCcpXG4gICAgY29uc3Qgb3ZlcndyaXRlcyA9IHRoaXMucGVybWlzc2lvbk92ZXJ3cml0ZXMuZmlsdGVyKChlKSA9PiBlLmlkICE9PSB0YXJnZXQpXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZWRpdCh7IHBlcm1pc3Npb25PdmVyd3JpdGVzOiBvdmVyd3JpdGVzIH0pXG4gIH1cblxuICAvKiogRWRpdCBhIFBlcm1pc3Npb24gT3ZlcndyaXRlICovXG4gIGFzeW5jIGVkaXRPdmVyd3JpdGUoXG4gICAgb3ZlcndyaXRlOiBPdmVyd3JpdGVBc0FyZyxcbiAgICB7XG4gICAgICBhbGxvdzogb3ZlcndyaXRlQWxsb3cgPSBPdmVycmlkZVR5cGUuQURELFxuICAgICAgZGVueTogb3ZlcndyaXRlRGVueSA9IE92ZXJyaWRlVHlwZS5BRERcbiAgICB9OiBFZGl0T3ZlcndyaXRlT3B0aW9uc1xuICApOiBQcm9taXNlPEd1aWxkQ2hhbm5lbHM+IHtcbiAgICBjb25zdCBpZCA9IHR5cGVvZiBvdmVyd3JpdGUuaWQgPT09ICdzdHJpbmcnID8gb3ZlcndyaXRlLmlkIDogb3ZlcndyaXRlLmlkLmlkXG4gICAgY29uc3QgaW5kZXggPSB0aGlzLnBlcm1pc3Npb25PdmVyd3JpdGVzLmZpbmRJbmRleCgoZSkgPT4gZS5pZCA9PT0gaWQpXG4gICAgaWYgKGluZGV4IDwgMCkgdGhyb3cgbmV3IEVycm9yKCdQZXJtaXNzaW9uIE92ZXJ3cml0ZSBub3QgZm91bmQnKVxuICAgIGNvbnN0IG92ZXJ3cml0ZXMgPSB0aGlzLnBlcm1pc3Npb25PdmVyd3JpdGVzXG5cbiAgICBsZXQgYWxsb3c6IHN0cmluZ1xuICAgIGxldCBkZW55OiBzdHJpbmdcblxuICAgIGlmIChcbiAgICAgIG92ZXJ3cml0ZS5hbGxvdyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBvdmVyd3JpdGVBbGxvdyAhPT0gT3ZlcnJpZGVUeXBlLlJFUExBQ0VcbiAgICApIHtcbiAgICAgIHN3aXRjaCAob3ZlcndyaXRlQWxsb3cpIHtcbiAgICAgICAgY2FzZSBPdmVycmlkZVR5cGUuQUREOiB7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxBbGxvdyA9IG5ldyBQZXJtaXNzaW9ucyhvdmVyd3JpdGVzW2luZGV4XS5hbGxvdylcbiAgICAgICAgICBjb25zdCBuZXdBbGxvdyA9IG5ldyBQZXJtaXNzaW9ucyhvdmVyd3JpdGUuYWxsb3cpXG5cbiAgICAgICAgICBhbGxvdyA9IG9yaWdpbmFsQWxsb3cuYWRkKFtuZXdBbGxvd10pLnRvSlNPTigpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBjYXNlIE92ZXJyaWRlVHlwZS5SRU1PVkU6IHtcbiAgICAgICAgICBjb25zdCBvcmlnaW5hbEFsbG93ID0gbmV3IFBlcm1pc3Npb25zKG92ZXJ3cml0ZXNbaW5kZXhdLmFsbG93KVxuICAgICAgICAgIGNvbnN0IG5ld0FsbG93ID0gbmV3IFBlcm1pc3Npb25zKG92ZXJ3cml0ZS5hbGxvdylcblxuICAgICAgICAgIGFsbG93ID0gb3JpZ2luYWxBbGxvdy5yZW1vdmUoW25ld0FsbG93XSkudG9KU09OKClcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGFsbG93ID1cbiAgICAgICAgdHlwZW9mIG92ZXJ3cml0ZS5hbGxvdyA9PT0gJ3N0cmluZydcbiAgICAgICAgICA/IG92ZXJ3cml0ZS5hbGxvd1xuICAgICAgICAgIDogb3ZlcndyaXRlLmFsbG93Py50b0pTT04oKSA/PyBvdmVyd3JpdGVzW2luZGV4XS5hbGxvd1xuICAgIH1cblxuICAgIGlmIChcbiAgICAgIG92ZXJ3cml0ZS5kZW55ICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIG92ZXJ3cml0ZURlbnkgIT09IE92ZXJyaWRlVHlwZS5SRVBMQUNFXG4gICAgKSB7XG4gICAgICBzd2l0Y2ggKG92ZXJ3cml0ZURlbnkpIHtcbiAgICAgICAgY2FzZSBPdmVycmlkZVR5cGUuQUREOiB7XG4gICAgICAgICAgY29uc3Qgb3JpZ2luYWxEZW55ID0gbmV3IFBlcm1pc3Npb25zKG92ZXJ3cml0ZXNbaW5kZXhdLmRlbnkpXG4gICAgICAgICAgY29uc3QgbmV3RGVueSA9IG5ldyBQZXJtaXNzaW9ucyhvdmVyd3JpdGUuZGVueSlcblxuICAgICAgICAgIGRlbnkgPSBvcmlnaW5hbERlbnkuYWRkKFtuZXdEZW55XSkudG9KU09OKClcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgT3ZlcnJpZGVUeXBlLlJFTU9WRToge1xuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsRGVueSA9IG5ldyBQZXJtaXNzaW9ucyhvdmVyd3JpdGVzW2luZGV4XS5kZW55KVxuICAgICAgICAgIGNvbnN0IG5ld0RlbnkgPSBuZXcgUGVybWlzc2lvbnMob3ZlcndyaXRlLmRlbnkpXG5cbiAgICAgICAgICBkZW55ID0gb3JpZ2luYWxEZW55LnJlbW92ZShbbmV3RGVueV0pLnRvSlNPTigpXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkZW55ID1cbiAgICAgICAgdHlwZW9mIG92ZXJ3cml0ZS5kZW55ID09PSAnc3RyaW5nJ1xuICAgICAgICAgID8gb3ZlcndyaXRlLmRlbnlcbiAgICAgICAgICA6IG92ZXJ3cml0ZS5kZW55Py50b0pTT04oKSA/PyBvdmVyd3JpdGVzW2luZGV4XS5kZW55XG4gICAgfVxuXG4gICAgY29uc3QgdHlwZSA9XG4gICAgICBvdmVyd3JpdGUuaWQgaW5zdGFuY2VvZiBSb2xlXG4gICAgICAgID8gMFxuICAgICAgICA6IG92ZXJ3cml0ZS5pZCBpbnN0YW5jZW9mIE1lbWJlclxuICAgICAgICA/IDFcbiAgICAgICAgOiBvdmVyd3JpdGUudHlwZVxuICAgIGlmICh0eXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignT3ZlcndyaXRlIHR5cGUgaXMgdW5kZWZpbmVkLicpXG4gICAgfVxuXG4gICAgb3ZlcndyaXRlc1tpbmRleF0gPSB7XG4gICAgICBpZCxcbiAgICAgIHR5cGUsXG4gICAgICBhbGxvdyxcbiAgICAgIGRlbnlcbiAgICB9XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZWRpdCh7IHBlcm1pc3Npb25PdmVyd3JpdGVzOiBvdmVyd3JpdGVzIH0pXG4gIH1cblxuICAvKiogRWRpdCBwb3NpdGlvbiBvZiB0aGUgY2hhbm5lbCAqL1xuICBhc3luYyBzZXRQb3NpdGlvbihwb3NpdGlvbjogbnVtYmVyKTogUHJvbWlzZTxHdWlsZENoYW5uZWxzPiB7XG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZWRpdCh7IHBvc2l0aW9uIH0pXG4gIH1cblxuICAvKiogQ3JlYXRlIGFuIEludml0ZSBmb3IgdGhpcyBDaGFubmVsICovXG4gIGFzeW5jIGNyZWF0ZUludml0ZShvcHRpb25zPzogQ3JlYXRlSW52aXRlT3B0aW9ucyk6IFByb21pc2U8SW52aXRlPiB7XG4gICAgcmV0dXJuIHRoaXMuZ3VpbGQuaW52aXRlcy5jcmVhdGUodGhpcy5pZCwgb3B0aW9ucylcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVVBLFNBQVMsWUFBWSxRQUFRLHNCQUFxQjtBQUNsRCxTQUFTLE9BQU8sUUFBUSx1QkFBc0I7QUFFOUMsU0FDRSxXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLGVBQWUsRUFDZixpQkFBaUIsRUFDakIsdUJBQXVCLEVBQ3ZCLGNBQWMsRUFDZCxrQkFBa0IsRUFDbEIsYUFBYSxFQUNiLG1CQUFtQixFQUNuQixjQUFjLEVBQ2QsYUFBYSxFQUNiLGNBQWMsUUFDVCwyQkFBMEI7QUFDakMsU0FBUyxXQUFXLFFBQVEsMEJBQXlCO0FBQ3JELFNBQVMsYUFBYSxRQUFRLFlBQVc7QUFFekMsU0FBUyxNQUFNLFFBQVEsY0FBYTtBQUNwQyxTQUFTLElBQUksUUFBUSxZQUFXO0FBaUJoQyxPQUFPLE1BQU0sZ0JBQWdCO0lBQzNCLEtBQW1CO0lBQ25CLE1BQWM7SUFFZCxPQUFPLFlBQVksVUFBUztJQUU1QixJQUFJLFVBQWtCO1FBQ3BCLE9BQU8sQ0FBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDeEI7SUFFQSxXQUFtQjtRQUNqQixPQUFPLElBQUksQ0FBQyxPQUFPO0lBQ3JCO0lBRUEsWUFBWSxNQUFjLEVBQUUsSUFBb0IsQ0FBRTtRQUNoRCxLQUFLLENBQUMsUUFBUTtRQUNkLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDcEI7SUFFQSxhQUFhLElBQW9CLEVBQVE7UUFDdkMsSUFBSSxDQUFD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