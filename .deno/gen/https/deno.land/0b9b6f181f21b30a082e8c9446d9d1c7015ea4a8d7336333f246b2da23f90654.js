import { SnowflakeBase } from './base.ts';
import { Permissions } from '../utils/permissions.ts';
import { User } from './user.ts';
import { ImageURL } from './cdn.ts';
import { ROLE_ICON } from '../types/endpoint.ts';
/** Represents a Guild Role */ export class Role extends SnowflakeBase {
    id;
    guild;
    name;
    color;
    hoist;
    icon;
    unicodeEmoji;
    position;
    /** Use `edit` method to update permissions */ permissions;
    managed;
    mentionable;
    tags;
    constructor(client, data, guild){
        super(client, data);
        this.id = data.id;
        this.guild = guild;
        this.readFromData(data);
    }
    readFromData(data) {
        this.name = data.name ?? this.name;
        this.color = data.color ?? this.color;
        this.hoist = data.hoist ?? this.hoist;
        this.icon = data.icon ?? this.icon;
        this.unicodeEmoji = data.unicode_emoji ?? this.unicodeEmoji;
        this.position = data.position ?? this.position;
        this.permissions = data.permissions !== undefined ? new Permissions(data.permissions) : this.permissions;
        this.managed = data.managed ?? this.managed;
        this.mentionable = data.mentionable ?? this.mentionable;
        this.tags = data.tags !== undefined ? {
            botID: data.tags?.bot_id,
            integrationID: data.tags?.integration_id,
            premiumSubscriber: 'premium_subscriber' in (data.tags ?? {})
        } : undefined;
    }
    /** Delete the Role */ async delete() {
        return this.guild.roles.delete(this);
    }
    /** Edit the Role */ async edit(options) {
        return this.guild.roles.edit(this, options);
    }
    /** Add the Role to a Member */ async addTo(member) {
        if (member instanceof User) {
            member = member.id;
        }
        if (typeof member === 'string') {
            const tempMember = await this.guild.members.get(member);
            if (tempMember === undefined) {
                throw new Error(`Couldn't find the member ${member}.`);
            } else {
                member = tempMember;
            }
        }
        return member.roles.add(this.id);
    }
    /** Remove the Role from a Member */ async removeFrom(member) {
        if (member instanceof User) {
            member = member.id;
        }
        if (typeof member === 'string') {
            const tempMember = await this.guild.members.get(member);
            if (tempMember === undefined) {
                throw new Error(`Couldn't find the member ${member}.`);
            } else {
                member = tempMember;
            }
        }
        return member.roles.remove(this.id);
    }
    /** Get the icon for the role. If set, is either a URL to an icon, or a Unicode emoji. */ roleIcon(format = 'png', size = 512) {
        return this.icon !== undefined ? `${ImageURL(ROLE_ICON(this.id, this.icon), format, size)}` : this.unicodeEmoji;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvcm9sZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgeyBTbm93Zmxha2VCYXNlIH0gZnJvbSAnLi9iYXNlLnRzJ1xuaW1wb3J0IHR5cGUgeyBSb2xlTW9kaWZ5UGF5bG9hZCwgUm9sZVBheWxvYWQgfSBmcm9tICcuLi90eXBlcy9yb2xlLnRzJ1xuaW1wb3J0IHsgUGVybWlzc2lvbnMgfSBmcm9tICcuLi91dGlscy9wZXJtaXNzaW9ucy50cydcbmltcG9ydCB0eXBlIHsgR3VpbGQgfSBmcm9tICcuL2d1aWxkLnRzJ1xuaW1wb3J0IHR5cGUgeyBNZW1iZXIgfSBmcm9tICcuL21lbWJlci50cydcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL3VzZXIudHMnXG5pbXBvcnQgeyBJbWFnZVVSTCB9IGZyb20gJy4vY2RuLnRzJ1xuaW1wb3J0IHsgSW1hZ2VGb3JtYXRzLCBJbWFnZVNpemUgfSBmcm9tICcuLi90eXBlcy9jZG4udHMnXG5pbXBvcnQgeyBST0xFX0lDT04gfSBmcm9tICcuLi90eXBlcy9lbmRwb2ludC50cydcblxuLyoqIFJlcHJlc2VudHMgYSBHdWlsZCBSb2xlICovXG5leHBvcnQgY2xhc3MgUm9sZSBleHRlbmRzIFNub3dmbGFrZUJhc2Uge1xuICBpZDogc3RyaW5nXG4gIGd1aWxkOiBHdWlsZFxuICBuYW1lITogc3RyaW5nXG4gIGNvbG9yITogbnVtYmVyXG4gIGhvaXN0ITogYm9vbGVhblxuICBpY29uPzogc3RyaW5nXG4gIHVuaWNvZGVFbW9qaT86IHN0cmluZ1xuICBwb3NpdGlvbiE6IG51bWJlclxuICAvKiogVXNlIGBlZGl0YCBtZXRob2QgdG8gdXBkYXRlIHBlcm1pc3Npb25zICovXG4gIHBlcm1pc3Npb25zITogUGVybWlzc2lvbnNcbiAgbWFuYWdlZCE6IGJvb2xlYW5cbiAgbWVudGlvbmFibGUhOiBib29sZWFuXG4gIHRhZ3M/OiBSb2xlVGFnc1xuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50LCBkYXRhOiBSb2xlUGF5bG9hZCwgZ3VpbGQ6IEd1aWxkKSB7XG4gICAgc3VwZXIoY2xpZW50LCBkYXRhKVxuICAgIHRoaXMuaWQgPSBkYXRhLmlkXG4gICAgdGhpcy5ndWlsZCA9IGd1aWxkXG4gICAgdGhpcy5yZWFkRnJvbURhdGEoZGF0YSlcbiAgfVxuXG4gIHJlYWRGcm9tRGF0YShkYXRhOiBSb2xlUGF5bG9hZCk6IHZvaWQge1xuICAgIHRoaXMubmFtZSA9IGRhdGEubmFtZSA/PyB0aGlzLm5hbWVcbiAgICB0aGlzLmNvbG9yID0gZGF0YS5jb2xvciA/PyB0aGlzLmNvbG9yXG4gICAgdGhpcy5ob2lzdCA9IGRhdGEuaG9pc3QgPz8gdGhpcy5ob2lzdFxuICAgIHRoaXMuaWNvbiA9IGRhdGEuaWNvbiA/PyB0aGlzLmljb25cbiAgICB0aGlzLnVuaWNvZGVFbW9qaSA9IGRhdGEudW5pY29kZV9lbW9qaSA/PyB0aGlzLnVuaWNvZGVFbW9qaVxuICAgIHRoaXMucG9zaXRpb24gPSBkYXRhLnBvc2l0aW9uID8/IHRoaXMucG9zaXRpb25cbiAgICB0aGlzLnBlcm1pc3Npb25zID1cbiAgICAgIGRhdGEucGVybWlzc2lvbnMgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IG5ldyBQZXJtaXNzaW9ucyhkYXRhLnBlcm1pc3Npb25zKVxuICAgICAgICA6IHRoaXMucGVybWlzc2lvbnNcbiAgICB0aGlzLm1hbmFnZWQgPSBkYXRhLm1hbmFnZWQgPz8gdGhpcy5tYW5hZ2VkXG4gICAgdGhpcy5tZW50aW9uYWJsZSA9IGRhdGEubWVudGlvbmFibGUgPz8gdGhpcy5tZW50aW9uYWJsZVxuICAgIHRoaXMudGFncyA9XG4gICAgICBkYXRhLnRhZ3MgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IHtcbiAgICAgICAgICAgIGJvdElEOiBkYXRhLnRhZ3M/LmJvdF9pZCxcbiAgICAgICAgICAgIGludGVncmF0aW9uSUQ6IGRhdGEudGFncz8uaW50ZWdyYXRpb25faWQsXG4gICAgICAgICAgICBwcmVtaXVtU3Vic2NyaWJlcjogJ3ByZW1pdW1fc3Vic2NyaWJlcicgaW4gKGRhdGEudGFncyA/PyB7fSlcbiAgICAgICAgICB9XG4gICAgICAgIDogdW5kZWZpbmVkXG4gIH1cblxuICAvKiogRGVsZXRlIHRoZSBSb2xlICovXG4gIGFzeW5jIGRlbGV0ZSgpOiBQcm9taXNlPFJvbGUgfCB1bmRlZmluZWQ+IHtcbiAgICByZXR1cm4gdGhpcy5ndWlsZC5yb2xlcy5kZWxldGUodGhpcylcbiAgfVxuXG4gIC8qKiBFZGl0IHRoZSBSb2xlICovXG4gIGFzeW5jIGVkaXQob3B0aW9uczogUm9sZU1vZGlmeVBheWxvYWQpOiBQcm9taXNlPFJvbGU+IHtcbiAgICByZXR1cm4gdGhpcy5ndWlsZC5yb2xlcy5lZGl0KHRoaXMsIG9wdGlvbnMpXG4gIH1cblxuICAvKiogQWRkIHRoZSBSb2xlIHRvIGEgTWVtYmVyICovXG4gIGFzeW5jIGFkZFRvKG1lbWJlcjogTWVtYmVyIHwgVXNlciB8IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGlmIChtZW1iZXIgaW5zdGFuY2VvZiBVc2VyKSB7XG4gICAgICBtZW1iZXIgPSBtZW1iZXIuaWRcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBtZW1iZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICBjb25zdCB0ZW1wTWVtYmVyID0gYXdhaXQgdGhpcy5ndWlsZC5tZW1iZXJzLmdldChtZW1iZXIpXG4gICAgICBpZiAodGVtcE1lbWJlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgQ291bGRuJ3QgZmluZCB0aGUgbWVtYmVyICR7bWVtYmVyfS5gKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbWVtYmVyID0gdGVtcE1lbWJlclxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtZW1iZXIucm9sZXMuYWRkKHRoaXMuaWQpXG4gIH1cblxuICAvKiogUmVtb3ZlIHRoZSBSb2xlIGZyb20gYSBNZW1iZXIgKi9cbiAgYXN5bmMgcmVtb3ZlRnJvbShtZW1iZXI6IE1lbWJlciB8IFVzZXIgfCBzdHJpbmcpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICBpZiAobWVtYmVyIGluc3RhbmNlb2YgVXNlcikge1xuICAgICAgbWVtYmVyID0gbWVtYmVyLmlkXG4gICAgfVxuICAgIGlmICh0eXBlb2YgbWVtYmVyID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgdGVtcE1lbWJlciA9IGF3YWl0IHRoaXMuZ3VpbGQubWVtYmVycy5nZXQobWVtYmVyKVxuICAgICAgaWYgKHRlbXBNZW1iZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYENvdWxkbid0IGZpbmQgdGhlIG1lbWJlciAke21lbWJlcn0uYClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG1lbWJlciA9IHRlbXBNZW1iZXJcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWVtYmVyLnJvbGVzLnJlbW92ZSh0aGlzLmlkKVxuICB9XG5cbiAgLyoqIEdldCB0aGUgaWNvbiBmb3IgdGhlIHJvbGUuIElmIHNldCwgaXMgZWl0aGVyIGEgVVJMIHRvIGFuIGljb24sIG9yIGEgVW5pY29kZSBlbW9qaS4gKi9cbiAgcm9sZUljb24oXG4gICAgZm9ybWF0OiBJbWFnZUZvcm1hdHMgPSAncG5nJyxcbiAgICBzaXplOiBJbWFnZVNpemUgPSA1MTJcbiAgKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcbiAgICByZXR1cm4gdGhpcy5pY29uICE9PSB1bmRlZmluZWRcbiAgICAgID8gYCR7SW1hZ2VVUkwoUk9MRV9JQ09OKHRoaXMuaWQsIHRoaXMuaWNvbiksIGZvcm1hdCwgc2l6ZSl9YFxuICAgICAgOiB0aGlzLnVuaWNvZGVFbW9qaVxuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUm9sZVRhZ3Mge1xuICAvKiogVGhlIGlkIG9mIHRoZSBib3Qgd2hvIGhhcyB0aGlzIHJvbGUgKi9cbiAgYm90SUQ/OiBzdHJpbmdcbiAgLyoqIFdoZXRoZXIgdGhpcyBpcyB0aGUgcHJlbWl1bSBzdWJzY3JpYmVyIHJvbGUgZm9yIHRoaXMgZ3VpbGQgKi9cbiAgcHJlbWl1bVN1YnNjcmliZXI6IGJvb2xlYW5cbiAgLyoqIFRoZSBpZCBvZiB0aGUgaW50ZWdyYXRpb24gdGhpcyByb2xlIGJlbG9uZ3MgdG8gKi9cbiAgaW50ZWdyYXRpb25JRD86IHN0cmluZ1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsYUFBYSxRQUFRLFlBQVc7QUFFekMsU0FBUyxXQUFXLFFBQVEsMEJBQXlCO0FBR3JELFNBQVMsSUFBSSxRQUFRLFlBQVc7QUFDaEMsU0FBUyxRQUFRLFFBQVEsV0FBVTtBQUVuQyxTQUFTLFNBQVMsUUFBUSx1QkFBc0I7QUFFaEQsNEJBQTRCLEdBQzVCLE9BQU8sTUFBTSxhQUFhO0lBQ3hCLEdBQVU7SUFDVixNQUFZO0lBQ1osS0FBYTtJQUNiLE1BQWM7SUFDZCxNQUFlO0lBQ2YsS0FBYTtJQUNiLGFBQXFCO0lBQ3JCLFNBQWlCO0lBQ2pCLDRDQUE0QyxHQUM1QyxZQUF5QjtJQUN6QixRQUFpQjtJQUNqQixZQUFxQjtJQUNyQixLQUFlO0lBRWYsWUFBWSxNQUFjLEVBQUUsSUFBaUIsRUFBRSxLQUFZLENBQUU7UUFDM0QsS0FBSyxDQUFDLFFBQVE7UUFDZCxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRTtRQUNqQixJQUFJLENBQUMsS0FBSyxHQUFHO1FBQ2IsSUFBSSxDQUFDLFlBQVksQ0FBQztJQUNwQjtJQUVBLGFBQWEsSUFBaUIsRUFBUTtRQUNwQyxJQUFJLENBQUMsSUFBSSxHQUFHLEtBQUssSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJO1FBQ2xDLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxLQUFLLElBQUksSUFBSSxDQUFDLEtBQUs7UUFDckMsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEtBQUssSUFBSSxJQUFJLENBQUMs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