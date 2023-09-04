import { Base } from './base.ts';
export var ActivityTypes;
(function(ActivityTypes) {
    ActivityTypes[ActivityTypes["PLAYING"] = 0] = "PLAYING";
    ActivityTypes[ActivityTypes["STREAMING"] = 1] = "STREAMING";
    ActivityTypes[ActivityTypes["LISTENING"] = 2] = "LISTENING";
    ActivityTypes[ActivityTypes["WATCHING"] = 3] = "WATCHING";
    ActivityTypes[ActivityTypes["CUSTOM_STATUS"] = 4] = "CUSTOM_STATUS";
    ActivityTypes[ActivityTypes["COMPETING"] = 5] = "COMPETING";
})(ActivityTypes || (ActivityTypes = {}));
export class Presence extends Base {
    user;
    guild;
    status;
    // TODO: Maybe a new structure for this?
    activities;
    clientStatus;
    constructor(client, data, user, guild){
        super(client, data);
        this.user = user;
        this.guild = guild;
        this.fromPayload(data);
    }
    fromPayload(data) {
        this.status = data.status;
        this.activities = data.activities;
        this.clientStatus = data.client_status;
        return this;
    }
}
export class ClientPresence {
    status = 'online';
    activity;
    since;
    afk;
    clientStatus;
    constructor(data){
        if (data !== undefined) {
            if ([
                'name',
                'type',
                'url'
            ].some((k)=>k in data)) {
                // ActivityGame
                if (this.activity === undefined) {
                    this.activity = data;
                } else if (this.activity instanceof Array) {
                    this.activity.push(data);
                } else this.activity = [
                    this.activity,
                    data
                ];
            } else if ([
                'client_status',
                'activities'
            ].some((k)=>k in data)) {
                // StatusPayload
                this.parse(data);
            } else if ([
                'since',
                'activity',
                'status',
                'afk'
            ].some((k)=>k in data)) {
                // ClientActivity
                Object.assign(this, data);
            }
        }
    }
    /** Parses from Payload */ parse(payload) {
        this.afk = payload.afk;
        this.activity = payload.activities ?? undefined;
        this.since = payload.since;
        this.status = payload.status;
        // this.clientStatus = payload.client_status
        return this;
    }
    /** Parses from Payload and creates new ClientPresence */ static parse(payload) {
        return new ClientPresence().parse(payload);
    }
    /** Creates Presence Payload */ create() {
        return {
            afk: this.afk === undefined ? false : this.afk,
            activities: this.createActivity() ?? [],
            since: this.since === undefined ? this.status === 'idle' ? Date.now() : null : this.since,
            status: this.status === undefined ? 'online' : this.status
        };
    }
    /** Creates Activity Payload */ createActivity() {
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        const activity = this.activity === undefined ? null : this.activity instanceof Array ? this.activity : [
            this.activity
        ];
        if (activity === null) return activity;
        else {
            activity.map((e)=>{
                if (typeof e.type === 'string') e.type = ActivityTypes[e.type];
                return e;
            });
            return activity;
        }
    }
    /** Set Status of Presence */ setStatus(status) {
        this.status = status;
        return this;
    }
    /** Set Activity for Presence */ setActivity(activity) {
        this.activity = activity;
        return this;
    }
    /** Set Activities for Presence */ setActivities(activities) {
        this.activity = activities;
        return this;
    }
    /** Set AFK value */ setAFK(afk) {
        this.afk = afk;
        return this;
    }
    /** Remove AFK (set false) */ removeAFK() {
        this.afk = false;
        return this;
    }
    /** Toggle AFK (boolean) value */ toggleAFK() {
        this.afk = this.afk === undefined ? true : !this.afk;
        return this;
    }
    /** Set Since property of Activity */ setSince(since) {
        this.since = since;
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvcHJlc2VuY2UudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQWN0aXZpdHlHYW1lLFxuICBBY3Rpdml0eVBheWxvYWQsXG4gIENsaWVudEFjdGl2aXR5LFxuICBDbGllbnRTdGF0dXMsXG4gIFN0YXR1c1R5cGVcbn0gZnJvbSAnLi4vdHlwZXMvcHJlc2VuY2UudHMnXG5pbXBvcnQgeyBQcmVzZW5jZVVwZGF0ZVBheWxvYWQsIFN0YXR1c1VwZGF0ZVBheWxvYWQgfSBmcm9tICcuLi90eXBlcy9nYXRld2F5LnRzJ1xuaW1wb3J0IHsgQmFzZSB9IGZyb20gJy4vYmFzZS50cydcbmltcG9ydCB0eXBlIHsgR3VpbGQgfSBmcm9tICcuL2d1aWxkLnRzJ1xuaW1wb3J0IHR5cGUgeyBVc2VyIH0gZnJvbSAnLi91c2VyLnRzJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvbW9kLnRzJ1xuXG5leHBvcnQgZW51bSBBY3Rpdml0eVR5cGVzIHtcbiAgUExBWUlORyA9IDAsXG4gIFNUUkVBTUlORyA9IDEsXG4gIExJU1RFTklORyA9IDIsXG4gIFdBVENISU5HID0gMyxcbiAgQ1VTVE9NX1NUQVRVUyA9IDQsXG4gIENPTVBFVElORyA9IDVcbn1cblxuZXhwb3J0IGNsYXNzIFByZXNlbmNlIGV4dGVuZHMgQmFzZSB7XG4gIHVzZXI6IFVzZXJcbiAgZ3VpbGQ6IEd1aWxkXG4gIHN0YXR1cyE6IFN0YXR1c1R5cGVcbiAgLy8gVE9ETzogTWF5YmUgYSBuZXcgc3RydWN0dXJlIGZvciB0aGlzP1xuICBhY3Rpdml0aWVzITogQWN0aXZpdHlQYXlsb2FkW11cbiAgY2xpZW50U3RhdHVzITogQ2xpZW50U3RhdHVzXG5cbiAgY29uc3RydWN0b3IoXG4gICAgY2xpZW50OiBDbGllbnQsXG4gICAgZGF0YTogUHJlc2VuY2VVcGRhdGVQYXlsb2FkLFxuICAgIHVzZXI6IFVzZXIsXG4gICAgZ3VpbGQ6IEd1aWxkXG4gICkge1xuICAgIHN1cGVyKGNsaWVudCwgZGF0YSlcbiAgICB0aGlzLnVzZXIgPSB1c2VyXG4gICAgdGhpcy5ndWlsZCA9IGd1aWxkXG4gICAgdGhpcy5mcm9tUGF5bG9hZChkYXRhKVxuICB9XG5cbiAgZnJvbVBheWxvYWQoZGF0YTogUHJlc2VuY2VVcGRhdGVQYXlsb2FkKTogUHJlc2VuY2Uge1xuICAgIHRoaXMuc3RhdHVzID0gZGF0YS5zdGF0dXNcbiAgICB0aGlzLmFjdGl2aXRpZXMgPSBkYXRhLmFjdGl2aXRpZXNcbiAgICB0aGlzLmNsaWVudFN0YXR1cyA9IGRhdGEuY2xpZW50X3N0YXR1c1xuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuaW50ZXJmYWNlIFN0YXR1c1BheWxvYWQgZXh0ZW5kcyBTdGF0dXNVcGRhdGVQYXlsb2FkIHtcbiAgY2xpZW50X3N0YXR1cz86IENsaWVudFN0YXR1c1xufVxuXG5leHBvcnQgY2xhc3MgQ2xpZW50UHJlc2VuY2Uge1xuICBzdGF0dXM6IFN0YXR1c1R5cGUgPSAnb25saW5lJ1xuICBhY3Rpdml0eT86IEFjdGl2aXR5R2FtZSB8IEFjdGl2aXR5R2FtZVtdXG4gIHNpbmNlPzogbnVtYmVyIHwgbnVsbFxuICBhZms/OiBib29sZWFuXG4gIGNsaWVudFN0YXR1cz86IENsaWVudFN0YXR1c1xuXG4gIGNvbnN0cnVjdG9yKGRhdGE/OiBDbGllbnRBY3Rpdml0eSB8IFN0YXR1c1BheWxvYWQgfCBBY3Rpdml0eUdhbWUpIHtcbiAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoWyduYW1lJywgJ3R5cGUnLCAndXJsJ10uc29tZSgoaykgPT4gayBpbiBkYXRhKSkge1xuICAgICAgICAvLyBBY3Rpdml0eUdhbWVcbiAgICAgICAgaWYgKHRoaXMuYWN0aXZpdHkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRoaXMuYWN0aXZpdHkgPSBkYXRhIGFzIEFjdGl2aXR5R2FtZVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuYWN0aXZpdHkgaW5zdGFuY2VvZiBBcnJheSkge1xuICAgICAgICAgIHRoaXMuYWN0aXZpdHkucHVzaChkYXRhIGFzIEFjdGl2aXR5R2FtZSlcbiAgICAgICAgfSBlbHNlIHRoaXMuYWN0aXZpdHkgPSBbdGhpcy5hY3Rpdml0eSwgZGF0YSBhcyBBY3Rpdml0eUdhbWVdXG4gICAgICB9IGVsc2UgaWYgKFsnY2xpZW50X3N0YXR1cycsICdhY3Rpdml0aWVzJ10uc29tZSgoaykgPT4gayBpbiBkYXRhKSkge1xuICAgICAgICAvLyBTdGF0dXNQYXlsb2FkXG4gICAgICAgIHRoaXMucGFyc2UoZGF0YSBhcyBTdGF0dXNQYXlsb2FkKVxuICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgWydzaW5jZScsICdhY3Rpdml0eScsICdzdGF0dXMnLCAnYWZrJ10uc29tZSgoaykgPT4gayBpbiBkYXRhKVxuICAgICAgKSB7XG4gICAgICAgIC8vIENsaWVudEFjdGl2aXR5XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywgZGF0YSlcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKiogUGFyc2VzIGZyb20gUGF5bG9hZCAqL1xuICBwYXJzZShwYXlsb2FkOiBTdGF0dXNQYXlsb2FkKTogQ2xpZW50UHJlc2VuY2Uge1xuICAgIHRoaXMuYWZrID0gcGF5bG9hZC5hZmtcbiAgICB0aGlzLmFjdGl2aXR5ID0gcGF5bG9hZC5hY3Rpdml0aWVzID8/IHVuZGVmaW5lZFxuICAgIHRoaXMuc2luY2UgPSBwYXlsb2FkLnNpbmNlXG4gICAgdGhpcy5zdGF0dXMgPSBwYXlsb2FkLnN0YXR1c1xuICAgIC8vIHRoaXMuY2xpZW50U3RhdHVzID0gcGF5bG9hZC5jbGllbnRfc3RhdHVzXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBQYXJzZXMgZnJvbSBQYXlsb2FkIGFuZCBjcmVhdGVzIG5ldyBDbGllbnRQcmVzZW5jZSAqL1xuICBzdGF0aWMgcGFyc2UocGF5bG9hZDogU3RhdHVzVXBkYXRlUGF5bG9hZCk6IENsaWVudFByZXNlbmNlIHtcbiAgICByZXR1cm4gbmV3IENsaWVudFByZXNlbmNlKCkucGFyc2UocGF5bG9hZClcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIFByZXNlbmNlIFBheWxvYWQgKi9cbiAgY3JlYXRlKCk6IFN0YXR1c1BheWxvYWQge1xuICAgIHJldHVybiB7XG4gICAgICBhZms6IHRoaXMuYWZrID09PSB1bmRlZmluZWQgPyBmYWxzZSA6IHRoaXMuYWZrLFxuICAgICAgYWN0aXZpdGllczogdGhpcy5jcmVhdGVBY3Rpdml0eSgpID8/IFtdLFxuICAgICAgc2luY2U6XG4gICAgICAgIHRoaXMuc2luY2UgPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gdGhpcy5zdGF0dXMgPT09ICdpZGxlJ1xuICAgICAgICAgICAgPyBEYXRlLm5vdygpXG4gICAgICAgICAgICA6IG51bGxcbiAgICAgICAgICA6IHRoaXMuc2luY2UsXG4gICAgICBzdGF0dXM6IHRoaXMuc3RhdHVzID09PSB1bmRlZmluZWQgPyAnb25saW5lJyA6IHRoaXMuc3RhdHVzXG4gICAgICAvLyBjbGllbnRfc3RhdHVzOiB0aGlzLmNsaWVudFN0YXR1c1xuICAgIH1cbiAgfVxuXG4gIC8qKiBDcmVhdGVzIEFjdGl2aXR5IFBheWxvYWQgKi9cbiAgY3JlYXRlQWN0aXZpdHkoKTogQWN0aXZpdHlHYW1lW10gfCBudWxsIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3N0cmljdC1ib29sZWFuLWV4cHJlc3Npb25zXG4gICAgY29uc3QgYWN0aXZpdHkgPVxuICAgICAgdGhpcy5hY3Rpdml0eSA9PT0gdW5kZWZpbmVkXG4gICAgICAgID8gbnVsbFxuICAgICAgICA6IHRoaXMuYWN0aXZpdHkgaW5zdGFuY2VvZiBBcnJheVxuICAgICAgICA/IHRoaXMuYWN0aXZpdHlcbiAgICAgICAgOiBbdGhpcy5hY3Rpdml0eV1cbiAgICBpZiAoYWN0aXZpdHkgPT09IG51bGwpIHJldHVybiBhY3Rpdml0eVxuICAgIGVsc2Uge1xuICAgICAgYWN0aXZpdHkubWFwKChlKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgZS50eXBlID09PSAnc3RyaW5nJykgZS50eXBlID0gQWN0aXZpdHlUeXBlc1tlLnR5cGVdXG4gICAgICAgIHJldHVybiBlXG4gICAgICB9KVxuICAgICAgcmV0dXJuIGFjdGl2aXR5XG4gICAgfVxuICB9XG5cbiAgLyoqIFNldCBTdGF0dXMgb2YgUHJlc2VuY2UgKi9cbiAgc2V0U3RhdHVzKHN0YXR1czogU3RhdHVzVHlwZSk6IENsaWVudFByZXNlbmNlIHtcbiAgICB0aGlzLnN0YXR1cyA9IHN0YXR1c1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogU2V0IEFjdGl2aXR5IGZvciBQcmVzZW5jZSAqL1xuICBzZXRBY3Rpdml0eShhY3Rpdml0eTogQWN0aXZpdHlHYW1lKTogQ2xpZW50UHJlc2VuY2Uge1xuICAgIHRoaXMuYWN0aXZpdHkgPSBhY3Rpdml0eVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogU2V0IEFjdGl2aXRpZXMgZm9yIFByZXNlbmNlICovXG4gIHNldEFjdGl2aXRpZXMoYWN0aXZpdGllczogQWN0aXZpdHlHYW1lW10pOiBDbGllbnRQcmVzZW5jZSB7XG4gICAgdGhpcy5hY3Rpdml0eSA9IGFjdGl2aXRpZXNcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIFNldCBBRksgdmFsdWUgKi9cbiAgc2V0QUZLKGFmazogYm9vbGVhbik6IENsaWVudFByZXNlbmNlIHtcbiAgICB0aGlzLmFmayA9IGFma1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogUmVtb3ZlIEFGSyAoc2V0IGZhbHNlKSAqL1xuICByZW1vdmVBRksoKTogQ2xpZW50UHJlc2VuY2Uge1xuICAgIHRoaXMuYWZrID0gZmFsc2VcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIFRvZ2dsZSBBRksgKGJvb2xlYW4pIHZhbHVlICovXG4gIHRvZ2dsZUFGSygpOiBDbGllbnRQcmVzZW5jZSB7XG4gICAgdGhpcy5hZmsgPSB0aGlzLmFmayA9PT0gdW5kZWZpbmVkID8gdHJ1ZSA6ICF0aGlzLmFma1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogU2V0IFNpbmNlIHByb3BlcnR5IG9mIEFjdGl2aXR5ICovXG4gIHNldFNpbmNlKHNpbmNlPzogbnVtYmVyKTogQ2xpZW50UHJlc2VuY2Uge1xuICAgIHRoaXMuc2luY2UgPSBzaW5jZVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQSxTQUFTLElBQUksUUFBUSxZQUFXO1dBS3pCO1VBQUssYUFBYTtJQUFiLGNBQUEsY0FDVixhQUFVLEtBQVY7SUFEVSxjQUFBLGNBRVYsZUFBWSxLQUFaO0lBRlUsY0FBQSxjQUdWLGVBQVksS0FBWjtJQUhVLGNBQUEsY0FJVixjQUFXLEtBQVg7SUFKVSxjQUFBLGNBS1YsbUJBQWdCLEtBQWhCO0lBTFUsY0FBQSxjQU1WLGVBQVksS0FBWjtHQU5VLGtCQUFBO0FBU1osT0FBTyxNQUFNLGlCQUFpQjtJQUM1QixLQUFVO0lBQ1YsTUFBWTtJQUNaLE9BQW1CO0lBQ25CLHdDQUF3QztJQUN4QyxXQUE4QjtJQUM5QixhQUEyQjtJQUUzQixZQUNFLE1BQWMsRUFDZCxJQUEyQixFQUMzQixJQUFVLEVBQ1YsS0FBWSxDQUNaO1FBQ0EsS0FBSyxDQUFDLFFBQVE7UUFDZCxJQUFJLENBQUMsSUFBSSxHQUFHO1FBQ1osSUFBSSxDQUFDLEtBQUssR0FBRztRQUNiLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDbkI7SUFFQSxZQUFZLElBQTJCLEVBQVk7UUFDakQsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLE1BQU07UUFDekIsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLFVBQVU7UUFDakMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLGFBQWE7UUFDdEMsT0FBTyxJQUFJO0lBQ2I7QUFDRixDQUFDO0FBTUQsT0FBTyxNQUFNO0lBQ1gsU0FB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