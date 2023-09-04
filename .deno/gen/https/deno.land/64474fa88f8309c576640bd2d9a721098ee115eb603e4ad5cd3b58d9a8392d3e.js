import { Presence } from '../structures/presence.ts';
import { User } from '../structures/user.ts';
import { BaseManager } from './base.ts';
export class GuildPresencesManager extends BaseManager {
    guild;
    constructor(client, guild){
        super(client, `presences:${guild.id}`, Presence);
        this.guild = guild;
    }
    async get(id) {
        const raw = await this._get(id);
        if (raw === undefined) return;
        let user = await this.client.users.get(raw.user.id);
        if (user === undefined) user = new User(this.client, raw.user);
        const guild = await this.client.guilds.get(raw.guild_id ?? this.guild.id);
        if (guild === undefined) return;
        const presence = new Presence(this.client, raw, user, guild);
        return presence;
    }
    async set(id, payload) {
        await this.client.users.set(payload.user.id, payload.user);
        // see Members Manager's set method for more info
        payload = {
            ...payload
        };
        payload.user = {
            id: payload.user.id
        };
        await super.set(id, payload);
    }
    async fetch(id) {
        await this.guild.chunk({
            users: [
                id
            ],
            presences: true
        });
        return await this.get(id);
    }
    async array() {
        let arr = await this.client.cache.array(this.cacheName);
        if (arr === undefined) arr = [];
        const result = [];
        await Promise.all(arr.map(async (raw)=>{
            let user = await this.client.users.get(raw.user.id);
            if (user === undefined) user = new User(this.client, raw.user);
            const guild = await this.client.guilds.get(raw.guild_id);
            if (guild === undefined) return;
            result.push(new Presence(this.client, raw, user, guild));
        }));
        return result;
    }
    async fromPayload(data) {
        await this.flush();
        for (const pres of data){
            await this.set(pres.user.id, pres);
        }
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL3ByZXNlbmNlcy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgdHlwZSB7IEd1aWxkIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9ndWlsZC50cydcbmltcG9ydCB7IFByZXNlbmNlIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9wcmVzZW5jZS50cydcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL3VzZXIudHMnXG5pbXBvcnQgdHlwZSB7IFByZXNlbmNlVXBkYXRlUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzL2dhdGV3YXkudHMnXG5pbXBvcnQgeyBVc2VyUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzL3VzZXIudHMnXG5pbXBvcnQgeyBCYXNlTWFuYWdlciB9IGZyb20gJy4vYmFzZS50cydcblxuZXhwb3J0IGNsYXNzIEd1aWxkUHJlc2VuY2VzTWFuYWdlciBleHRlbmRzIEJhc2VNYW5hZ2VyPFxuICBQcmVzZW5jZVVwZGF0ZVBheWxvYWQsXG4gIFByZXNlbmNlXG4+IHtcbiAgZ3VpbGQ6IEd1aWxkXG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQsIGd1aWxkOiBHdWlsZCkge1xuICAgIHN1cGVyKGNsaWVudCwgYHByZXNlbmNlczoke2d1aWxkLmlkfWAsIFByZXNlbmNlKVxuICAgIHRoaXMuZ3VpbGQgPSBndWlsZFxuICB9XG5cbiAgYXN5bmMgZ2V0KGlkOiBzdHJpbmcpOiBQcm9taXNlPFByZXNlbmNlIHwgdW5kZWZpbmVkPiB7XG4gICAgY29uc3QgcmF3ID0gYXdhaXQgdGhpcy5fZ2V0KGlkKVxuICAgIGlmIChyYXcgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgbGV0IHVzZXIgPSBhd2FpdCB0aGlzLmNsaWVudC51c2Vycy5nZXQocmF3LnVzZXIuaWQpXG4gICAgaWYgKHVzZXIgPT09IHVuZGVmaW5lZCkgdXNlciA9IG5ldyBVc2VyKHRoaXMuY2xpZW50LCByYXcudXNlcilcbiAgICBjb25zdCBndWlsZCA9IGF3YWl0IHRoaXMuY2xpZW50Lmd1aWxkcy5nZXQocmF3Lmd1aWxkX2lkID8/IHRoaXMuZ3VpbGQuaWQpXG4gICAgaWYgKGd1aWxkID09PSB1bmRlZmluZWQpIHJldHVyblxuICAgIGNvbnN0IHByZXNlbmNlID0gbmV3IFByZXNlbmNlKHRoaXMuY2xpZW50LCByYXcsIHVzZXIsIGd1aWxkKVxuICAgIHJldHVybiBwcmVzZW5jZVxuICB9XG5cbiAgYXN5bmMgc2V0KGlkOiBzdHJpbmcsIHBheWxvYWQ6IFByZXNlbmNlVXBkYXRlUGF5bG9hZCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGF3YWl0IHRoaXMuY2xpZW50LnVzZXJzLnNldChwYXlsb2FkLnVzZXIuaWQsIHBheWxvYWQudXNlcilcbiAgICAvLyBzZWUgTWVtYmVycyBNYW5hZ2VyJ3Mgc2V0IG1ldGhvZCBmb3IgbW9yZSBpbmZvXG4gICAgcGF5bG9hZCA9IHsgLi4ucGF5bG9hZCB9XG4gICAgcGF5bG9hZC51c2VyID0geyBpZDogcGF5bG9hZC51c2VyLmlkIH0gYXMgdW5rbm93biBhcyBVc2VyUGF5bG9hZFxuICAgIGF3YWl0IHN1cGVyLnNldChpZCwgcGF5bG9hZClcbiAgfVxuXG4gIGFzeW5jIGZldGNoKGlkOiBzdHJpbmcpOiBQcm9taXNlPFByZXNlbmNlIHwgdW5kZWZpbmVkPiB7XG4gICAgYXdhaXQgdGhpcy5ndWlsZC5jaHVuayh7XG4gICAgICB1c2VyczogW2lkXSxcbiAgICAgIHByZXNlbmNlczogdHJ1ZVxuICAgIH0pXG4gICAgcmV0dXJuIGF3YWl0IHRoaXMuZ2V0KGlkKVxuICB9XG5cbiAgYXN5bmMgYXJyYXkoKTogUHJvbWlzZTxQcmVzZW5jZVtdPiB7XG4gICAgbGV0IGFyciA9IGF3YWl0ICh0aGlzLmNsaWVudC5jYWNoZS5hcnJheShcbiAgICAgIHRoaXMuY2FjaGVOYW1lXG4gICAgKSBhcyBQcmVzZW5jZVVwZGF0ZVBheWxvYWRbXSlcbiAgICBpZiAoYXJyID09PSB1bmRlZmluZWQpIGFyciA9IFtdXG5cbiAgICBjb25zdCByZXN1bHQ6IFByZXNlbmNlW10gPSBbXVxuICAgIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgYXJyLm1hcChhc3luYyAocmF3KSA9PiB7XG4gICAgICAgIGxldCB1c2VyID0gYXdhaXQgdGhpcy5jbGllbnQudXNlcnMuZ2V0KHJhdy51c2VyLmlkKVxuICAgICAgICBpZiAodXNlciA9PT0gdW5kZWZpbmVkKSB1c2VyID0gbmV3IFVzZXIodGhpcy5jbGllbnQsIHJhdy51c2VyKVxuICAgICAgICBjb25zdCBndWlsZCA9IGF3YWl0IHRoaXMuY2xpZW50Lmd1aWxkcy5nZXQocmF3Lmd1aWxkX2lkKVxuICAgICAgICBpZiAoZ3VpbGQgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgICAgIHJlc3VsdC5wdXNoKG5ldyBQcmVzZW5jZSh0aGlzLmNsaWVudCwgcmF3LCB1c2VyLCBndWlsZCkpXG4gICAgICB9KVxuICAgIClcbiAgICByZXR1cm4gcmVzdWx0XG4gIH1cblxuICBhc3luYyBmcm9tUGF5bG9hZChcbiAgICBkYXRhOiBQcmVzZW5jZVVwZGF0ZVBheWxvYWRbXVxuICApOiBQcm9taXNlPEd1aWxkUHJlc2VuY2VzTWFuYWdlcj4ge1xuICAgIGF3YWl0IHRoaXMuZmx1c2goKVxuICAgIGZvciAoY29uc3QgcHJlcyBvZiBkYXRhKSB7XG4gICAgICBhd2FpdCB0aGlzLnNldChwcmVzLnVzZXIuaWQsIHByZXMpXG4gICAgfVxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxTQUFTLFFBQVEsUUFBUSw0QkFBMkI7QUFDcEQsU0FBUyxJQUFJLFFBQVEsd0JBQXVCO0FBRzVDLFNBQVMsV0FBVyxRQUFRLFlBQVc7QUFFdkMsT0FBTyxNQUFNLDhCQUE4QjtJQUl6QyxNQUFZO0lBRVosWUFBWSxNQUFjLEVB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