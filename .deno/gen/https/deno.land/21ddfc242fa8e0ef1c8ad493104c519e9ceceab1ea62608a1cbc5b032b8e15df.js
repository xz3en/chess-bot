import { User } from '../structures/user.ts';
import { Member } from '../structures/member.ts';
import { GUILD_MEMBER } from '../types/endpoint.ts';
import { BaseManager } from './base.ts';
import { Permissions } from '../utils/permissions.ts';
export class MembersManager extends BaseManager {
    guild;
    constructor(client, guild){
        super(client, `members:${guild.id}`, Member);
        this.guild = guild;
    }
    async get(key) {
        const raw = await this._get(key);
        if (raw === undefined) return;
        // it will always be present, see `set` impl for details
        const user = await this.client.users.get(raw.user.id);
        let permissions = new Permissions(raw.permissions ?? Permissions.DEFAULT);
        if (raw.permissions !== undefined) {
            const roles = await this.guild.roles.array();
            if (roles !== undefined) {
                const mRoles = roles.filter((r)=>raw.roles.includes(r.id) || r.id === this.guild.id);
                permissions = new Permissions(mRoles.map((r)=>r.permissions));
            }
        }
        const res = new this.DataType(this.client, raw, user, this.guild, permissions);
        return res;
    }
    async set(id, payload) {
        await this.client.users.set(payload.user.id, payload.user);
        await super.set(id, payload);
    }
    async array() {
        let arr = await this.client.cache.array(this.cacheName);
        if (arr === undefined) arr = [];
        const roles = await this.guild.roles.array();
        return await Promise.all(arr.map(async (raw)=>{
            const user = new User(this.client, raw.user);
            let permissions = new Permissions(Permissions.DEFAULT);
            if (roles !== undefined) {
                const mRoles = roles.filter((r)=>raw.roles.includes(r.id) || r.id === this.guild.id);
                permissions = new Permissions(mRoles.map((r)=>r.permissions));
            }
            return new Member(this.client, raw, user, this.guild, permissions);
        }));
    }
    /** Fetch a Guild Member */ async fetch(id) {
        return await new Promise((resolve, reject)=>{
            this.client.rest.get(GUILD_MEMBER(this.guild.id, id)).then(async (data)=>{
                await this.set(id, data);
                const user = new User(this.client, data.user);
                const roles = await this.guild.roles.array();
                let permissions = new Permissions(Permissions.DEFAULT);
                if (roles !== undefined) {
                    const mRoles = roles.filter((r)=>data.roles.includes(r.id) || r.id === this.guild.id);
                    permissions = new Permissions(mRoles.map((r)=>r.permissions));
                }
                const res = new Member(this.client, data, user, this.guild, permissions);
                resolve(res);
            }).catch((e)=>reject(e));
        });
    }
    /** Fetch a list of Guild Members */ async fetchList(limit, after) {
        return await new Promise((resolve, reject)=>{
            this.client.rest.endpoints.listGuildMembers(this.guild.id, {
                limit,
                after
            }).then(async (data)=>{
                const roles = await this.guild.roles.array();
                const members = [];
                for (const member of data){
                    await this.set(member.user.id, member);
                    const user = new User(this.client, member.user);
                    let permissions = new Permissions(Permissions.DEFAULT);
                    if (roles !== undefined) {
                        const mRoles = roles.filter((r)=>member.roles.includes(r.id) || r.id === this.guild.id);
                        permissions = new Permissions(mRoles.map((r)=>r.permissions));
                        members.push(new Member(this.client, member, user, this.guild, permissions));
                    }
                }
                resolve(members);
            }).catch((e)=>reject(e));
        });
    }
    /** Search for Guild Members */ async search(query, limit) {
        return await new Promise((resolve, reject)=>{
            this.client.rest.endpoints.searchGuildMembers(this.guild.id, {
                query,
                limit
            }).then(async (data)=>{
                const roles = await this.guild.roles.array();
                const members = [];
                for (const member of data){
                    await this.set(member.user.id, member);
                    const user = new User(this.client, member.user);
                    let permissions = new Permissions(Permissions.DEFAULT);
                    if (roles !== undefined) {
                        const mRoles = roles.filter((r)=>member.roles.includes(r.id) || r.id === this.guild.id);
                        permissions = new Permissions(mRoles.map((r)=>r.permissions));
                        members.push(new Member(this.client, member, user, this.guild, permissions));
                    }
                }
                resolve(members);
            }).catch((e)=>reject(e));
        });
    }
    async fromPayload(members) {
        for (const member of members){
            await this.set(member.user.id, member);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL21lbWJlcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uL3N0cnVjdHVyZXMvdXNlci50cydcbmltcG9ydCB0eXBlIHsgQ2xpZW50IH0gZnJvbSAnLi4vY2xpZW50L21vZC50cydcbmltcG9ydCB0eXBlIHsgR3VpbGQgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2d1aWxkLnRzJ1xuaW1wb3J0IHsgTWVtYmVyIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9tZW1iZXIudHMnXG5pbXBvcnQgeyBHVUlMRF9NRU1CRVIgfSBmcm9tICcuLi90eXBlcy9lbmRwb2ludC50cydcbmltcG9ydCB0eXBlIHsgTWVtYmVyUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzL2d1aWxkLnRzJ1xuaW1wb3J0IHsgQmFzZU1hbmFnZXIgfSBmcm9tICcuL2Jhc2UudHMnXG5pbXBvcnQgeyBQZXJtaXNzaW9ucyB9IGZyb20gJy4uL3V0aWxzL3Blcm1pc3Npb25zLnRzJ1xuXG5leHBvcnQgY2xhc3MgTWVtYmVyc01hbmFnZXIgZXh0ZW5kcyBCYXNlTWFuYWdlcjxNZW1iZXJQYXlsb2FkLCBNZW1iZXI+IHtcbiAgZ3VpbGQ6IEd1aWxkXG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQsIGd1aWxkOiBHdWlsZCkge1xuICAgIHN1cGVyKGNsaWVudCwgYG1lbWJlcnM6JHtndWlsZC5pZH1gLCBNZW1iZXIpXG4gICAgdGhpcy5ndWlsZCA9IGd1aWxkXG4gIH1cblxuICBhc3luYyBnZXQoa2V5OiBzdHJpbmcpOiBQcm9taXNlPE1lbWJlciB8IHVuZGVmaW5lZD4ge1xuICAgIGNvbnN0IHJhdyA9IGF3YWl0IHRoaXMuX2dldChrZXkpXG4gICAgaWYgKHJhdyA9PT0gdW5kZWZpbmVkKSByZXR1cm5cbiAgICAvLyBpdCB3aWxsIGFsd2F5cyBiZSBwcmVzZW50LCBzZWUgYHNldGAgaW1wbCBmb3IgZGV0YWlsc1xuICAgIGNvbnN0IHVzZXIgPSAoYXdhaXQgdGhpcy5jbGllbnQudXNlcnMuZ2V0KHJhdy51c2VyLmlkKSkhXG4gICAgbGV0IHBlcm1pc3Npb25zID0gbmV3IFBlcm1pc3Npb25zKHJhdy5wZXJtaXNzaW9ucyA/PyBQZXJtaXNzaW9ucy5ERUZBVUxUKVxuICAgIGlmIChyYXcucGVybWlzc2lvbnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgY29uc3Qgcm9sZXMgPSBhd2FpdCB0aGlzLmd1aWxkLnJvbGVzLmFycmF5KClcbiAgICAgIGlmIChyb2xlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IG1Sb2xlcyA9IHJvbGVzLmZpbHRlcihcbiAgICAgICAgICAocikgPT4gKHJhdy5yb2xlcy5pbmNsdWRlcyhyLmlkKSBhcyBib29sZWFuKSB8fCByLmlkID09PSB0aGlzLmd1aWxkLmlkXG4gICAgICAgIClcbiAgICAgICAgcGVybWlzc2lvbnMgPSBuZXcgUGVybWlzc2lvbnMobVJvbGVzLm1hcCgocikgPT4gci5wZXJtaXNzaW9ucykpXG4gICAgICB9XG4gICAgfVxuICAgIGNvbnN0IHJlcyA9IG5ldyB0aGlzLkRhdGFUeXBlKFxuICAgICAgdGhpcy5jbGllbnQsXG4gICAgICByYXcsXG4gICAgICB1c2VyLFxuICAgICAgdGhpcy5ndWlsZCxcbiAgICAgIHBlcm1pc3Npb25zXG4gICAgKVxuICAgIHJldHVybiByZXNcbiAgfVxuXG4gIGFzeW5jIHNldChpZDogc3RyaW5nLCBwYXlsb2FkOiBNZW1iZXJQYXlsb2FkKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jbGllbnQudXNlcnMuc2V0KHBheWxvYWQudXNlci5pZCwgcGF5bG9hZC51c2VyKVxuICAgIGF3YWl0IHN1cGVyLnNldChpZCwgcGF5bG9hZClcbiAgfVxuXG4gIGFzeW5jIGFycmF5KCk6IFByb21pc2U8TWVtYmVyW10+IHtcbiAgICBsZXQgYXJyID0gYXdhaXQgKHRoaXMuY2xpZW50LmNhY2hlLmFycmF5KHRoaXMuY2FjaGVOYW1lKSBhcyBNZW1iZXJQYXlsb2FkW10pXG4gICAgaWYgKGFyciA9PT0gdW5kZWZpbmVkKSBhcnIgPSBbXVxuICAgIGNvbnN0IHJvbGVzID0gYXdhaXQgdGhpcy5ndWlsZC5yb2xlcy5hcnJheSgpXG4gICAgcmV0dXJuIGF3YWl0IFByb21pc2UuYWxsKFxuICAgICAgYXJyLm1hcChhc3luYyAocmF3KSA9PiB7XG4gICAgICAgIGNvbnN0IHVzZXIgPSBuZXcgVXNlcih0aGlzLmNsaWVudCwgcmF3LnVzZXIpXG4gICAgICAgIGxldCBwZXJtaXNzaW9ucyA9IG5ldyBQZXJtaXNzaW9ucyhQZXJtaXNzaW9ucy5ERUZBVUxUKVxuICAgICAgICBpZiAocm9sZXMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGNvbnN0IG1Sb2xlcyA9IHJvbGVzLmZpbHRlcihcbiAgICAgICAgICAgIChyKSA9PlxuICAgICAgICAgICAgICAocmF3LnJvbGVzLmluY2x1ZGVzKHIuaWQpIGFzIGJvb2xlYW4pIHx8IHIuaWQgPT09IHRoaXMuZ3VpbGQuaWRcbiAgICAgICAgICApXG4gICAgICAgICAgcGVybWlzc2lvbnMgPSBuZXcgUGVybWlzc2lvbnMobVJvbGVzLm1hcCgocikgPT4gci5wZXJtaXNzaW9ucykpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBNZW1iZXIodGhpcy5jbGllbnQsIHJhdywgdXNlciwgdGhpcy5ndWlsZCwgcGVybWlzc2lvbnMpXG4gICAgICB9KVxuICAgIClcbiAgfVxuXG4gIC8qKiBGZXRjaCBhIEd1aWxkIE1lbWJlciAqL1xuICBhc3luYyBmZXRjaChpZDogc3RyaW5nKTogUHJvbWlzZTxNZW1iZXI+IHtcbiAgICByZXR1cm4gYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5jbGllbnQucmVzdFxuICAgICAgICAuZ2V0KEdVSUxEX01FTUJFUih0aGlzLmd1aWxkLmlkLCBpZCkpXG4gICAgICAgIC50aGVuKGFzeW5jIChkYXRhKSA9PiB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5zZXQoaWQsIGRhdGEgYXMgTWVtYmVyUGF5bG9hZClcbiAgICAgICAgICBjb25zdCB1c2VyOiBVc2VyID0gbmV3IFVzZXIodGhpcy5jbGllbnQsIGRhdGEudXNlcilcbiAgICAgICAgICBjb25zdCByb2xlcyA9IGF3YWl0IHRoaXMuZ3VpbGQucm9sZXMuYXJyYXkoKVxuICAgICAgICAgIGxldCBwZXJtaXNzaW9ucyA9IG5ldyBQZXJtaXNzaW9ucyhQZXJtaXNzaW9ucy5ERUZBVUxUKVxuICAgICAgICAgIGlmIChyb2xlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb25zdCBtUm9sZXMgPSByb2xlcy5maWx0ZXIoXG4gICAgICAgICAgICAgIChyKSA9PlxuICAgICAgICAgICAgICAgIChkYXRhLnJvbGVzLmluY2x1ZGVzKHIuaWQpIGFzIGJvb2xlYW4pIHx8IHIuaWQgPT09IHRoaXMuZ3VpbGQuaWRcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIHBlcm1pc3Npb25zID0gbmV3IFBlcm1pc3Npb25zKG1Sb2xlcy5tYXAoKHIpID0+IHIucGVybWlzc2lvbnMpKVxuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCByZXMgPSBuZXcgTWVtYmVyKFxuICAgICAgICAgICAgdGhpcy5jbGllbnQsXG4gICAgICAgICAgICBkYXRhIGFzIE1lbWJlclBheWxvYWQsXG4gICAgICAgICAgICB1c2VyLFxuICAgICAgICAgICAgdGhpcy5ndWlsZCxcbiAgICAgICAgICAgIHBlcm1pc3Npb25zXG4gICAgICAgICAgKVxuICAgICAgICAgIHJlc29sdmUocmVzKVxuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goKGUpID0+IHJlamVjdChlKSlcbiAgICB9KVxuICB9XG5cbiAgLyoqIEZldGNoIGEgbGlzdCBvZiBHdWlsZCBNZW1iZXJzICovXG4gIGFzeW5jIGZldGNoTGlzdChsaW1pdD86IG51bWJlciwgYWZ0ZXI/OiBzdHJpbmcpOiBQcm9taXNlPE1lbWJlcltdPiB7XG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY2xpZW50LnJlc3QuZW5kcG9pbnRzXG4gICAgICAgIC5saXN0R3VpbGRNZW1iZXJzKHRoaXMuZ3VpbGQuaWQsIHsgbGltaXQsIGFmdGVyIH0pXG4gICAgICAgIC50aGVuKGFzeW5jIChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3Qgcm9sZXMgPSBhd2FpdCB0aGlzLmd1aWxkLnJvbGVzLmFycmF5KClcbiAgICAgICAgICBjb25zdCBtZW1iZXJzOiBNZW1iZXJbXSA9IFtdXG5cbiAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBkYXRhKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNldChtZW1iZXIudXNlci5pZCwgbWVtYmVyKVxuICAgICAgICAgICAgY29uc3QgdXNlciA9IG5ldyBVc2VyKHRoaXMuY2xpZW50LCBtZW1iZXIudXNlcilcbiAgICAgICAgICAgIGxldCBwZXJtaXNzaW9ucyA9IG5ldyBQZXJtaXNzaW9ucyhQZXJtaXNzaW9ucy5ERUZBVUxUKVxuICAgICAgICAgICAgaWYgKHJvbGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgY29uc3QgbVJvbGVzID0gcm9sZXMuZmlsdGVyKFxuICAgICAgICAgICAgICAgIChyKSA9PlxuICAgICAgICAgICAgICAgICAgKG1lbWJlci5yb2xlcy5pbmNsdWRlcyhyLmlkKSBhcyBib29sZWFuKSB8fFxuICAgICAgICAgICAgICAgICAgci5pZCA9PT0gdGhpcy5ndWlsZC5pZFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIHBlcm1pc3Npb25zID0gbmV3IFBlcm1pc3Npb25zKG1Sb2xlcy5tYXAoKHIpID0+IHIucGVybWlzc2lvbnMpKVxuICAgICAgICAgICAgICBtZW1iZXJzLnB1c2goXG4gICAgICAgICAgICAgICAgbmV3IE1lbWJlcih0aGlzLmNsaWVudCwgbWVtYmVyLCB1c2VyLCB0aGlzLmd1aWxkLCBwZXJtaXNzaW9ucylcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc29sdmUobWVtYmVycylcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlKSA9PiByZWplY3QoZSkpXG4gICAgfSlcbiAgfVxuXG4gIC8qKiBTZWFyY2ggZm9yIEd1aWxkIE1lbWJlcnMgKi9cbiAgYXN5bmMgc2VhcmNoKHF1ZXJ5OiBzdHJpbmcsIGxpbWl0PzogbnVtYmVyKTogUHJvbWlzZTxNZW1iZXJbXT4ge1xuICAgIHJldHVybiBhd2FpdCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLmNsaWVudC5yZXN0LmVuZHBvaW50c1xuICAgICAgICAuc2VhcmNoR3VpbGRNZW1iZXJzKHRoaXMuZ3VpbGQuaWQsIHsgcXVlcnksIGxpbWl0IH0pXG4gICAgICAgIC50aGVuKGFzeW5jIChkYXRhKSA9PiB7XG4gICAgICAgICAgY29uc3Qgcm9sZXMgPSBhd2FpdCB0aGlzLmd1aWxkLnJvbGVzLmFycmF5KClcbiAgICAgICAgICBjb25zdCBtZW1iZXJzOiBNZW1iZXJbXSA9IFtdXG5cbiAgICAgICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBkYXRhKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNldChtZW1iZXIudXNlci5pZCwgbWVtYmVyKVxuICAgICAgICAgICAgY29uc3QgdXNlciA9IG5ldyBVc2VyKHRoaXMuY2xpZW50LCBtZW1iZXIudXNlcilcbiAgICAgICAgICAgIGxldCBwZXJtaXNzaW9ucyA9IG5ldyBQZXJtaXNzaW9ucyhQZXJtaXNzaW9ucy5ERUZBVUxUKVxuICAgICAgICAgICAgaWYgKHJvbGVzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgY29uc3QgbVJvbGVzID0gcm9sZXMuZmlsdGVyKFxuICAgICAgICAgICAgICAgIChyKSA9PlxuICAgICAgICAgICAgICAgICAgKG1lbWJlci5yb2xlcy5pbmNsdWRlcyhyLmlkKSBhcyBib29sZWFuKSB8fFxuICAgICAgICAgICAgICAgICAgci5pZCA9PT0gdGhpcy5ndWlsZC5pZFxuICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgIHBlcm1pc3Npb25zID0gbmV3IFBlcm1pc3Npb25zKG1Sb2xlcy5tYXAoKHIpID0+IHIucGVybWlzc2lvbnMpKVxuICAgICAgICAgICAgICBtZW1iZXJzLnB1c2goXG4gICAgICAgICAgICAgICAgbmV3IE1lbWJlcih0aGlzLmNsaWVudCwgbWVtYmVyLCB1c2VyLCB0aGlzLmd1aWxkLCBwZXJtaXNzaW9ucylcbiAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHJlc29sdmUobWVtYmVycylcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlKSA9PiByZWplY3QoZSkpXG4gICAgfSlcbiAgfVxuXG4gIGFzeW5jIGZyb21QYXlsb2FkKG1lbWJlcnM6IE1lbWJlclBheWxvYWRbXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGZvciAoY29uc3QgbWVtYmVyIG9mIG1lbWJlcnMpIHtcbiAgICAgIGF3YWl0IHRoaXMuc2V0KG1lbWJlci51c2VyLmlkLCBtZW1iZXIpXG4gICAgfVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxJQUFJLFFBQVEsd0JBQXVCO0FBRzVDLFNBQVMsTUFBTSxRQUFRLDBCQUF5QjtBQUNoRCxTQUFTLFlBQVksUUFBUSx1QkFBc0I7QUFFbkQsU0FBUyxXQUFXLFFBQVEsWUFBVztBQUN2QyxTQUFTLFdBQVcsUUFBUSwwQkFBeUI7QUFFckQsT0FBTyxNQUFNLHVCQUF1QjtJQUNsQyxNQUFZO0lBRVosWUFBWSxNQUFjLEVBQUUsS0FBWSxDQUFFO1FBQ3hDLEtBQUssQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBRTtRQUNyQyxJQUFJ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