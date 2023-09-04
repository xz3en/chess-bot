import { fetchAuto } from '../../deps.ts';
import { Role } from '../structures/role.ts';
import { GUILD_ROLE, GUILD_ROLES } from '../types/endpoint.ts';
import { BaseManager } from './base.ts';
export class RolesManager extends BaseManager {
    guild;
    constructor(client, guild){
        super(client, `roles:${guild.id}`, Role);
        this.guild = guild;
    }
    /** Fetch All Guild Roles */ async fetchAll() {
        return await new Promise((resolve, reject)=>{
            this.client.rest.api.guilds[this.guild.id].roles.get().then(async (data)=>{
                const roles = [];
                for (const raw of data){
                    await this.set(raw.id, raw);
                    roles.push(new Role(this.client, raw, this.guild));
                }
                resolve(roles);
            }).catch((e)=>reject(e));
        });
    }
    async get(key) {
        const raw = await this._get(key);
        if (raw === undefined) return;
        return new Role(this.client, raw, this.guild);
    }
    async array() {
        let arr = await this.client.cache.array(this.cacheName);
        if (arr === undefined) arr = [];
        return arr.map((e)=>new Role(this.client, e, this.guild));
    }
    async fromPayload(roles) {
        for (const role of roles){
            await this.set(role.id, role);
        }
        return true;
    }
    /** Create a Guild Role */ async create(data) {
        if (typeof data?.color === 'string') {
            if (data.color.startsWith('#')) data.color = data.color.slice(1);
        }
        const roleRaw = await this.client.rest.post(GUILD_ROLES(this.guild.id), {
            name: data?.name,
            permissions: data?.permissions === undefined ? undefined : (typeof data.permissions === 'object' ? data.permissions.bitfield : data.permissions).toString(),
            color: data?.color === undefined ? undefined : typeof data.color === 'string' ? isNaN(parseInt(data.color, 16)) ? 0 : parseInt(data.color, 16) : data.color,
            hoist: data?.hoist ?? false,
            mentionable: data?.mentionable ?? false
        });
        await this.set(roleRaw.id, roleRaw);
        return await this.get(roleRaw.id);
    }
    /** Delete a Guild Role */ async delete(role) {
        const oldRole = await this.get(typeof role === 'object' ? role.id : role);
        await this.client.rest.delete(GUILD_ROLE(this.guild.id, typeof role === 'object' ? role.id : role));
        return oldRole;
    }
    async edit(role, options) {
        if (options.icon !== undefined && options.icon !== null && // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        !options.icon.startsWith('data:')) {
            options.icon = await fetchAuto(options.icon);
        }
        if (role instanceof Role) {
            role = role.id;
        }
        const resp = await this.client.rest.patch(GUILD_ROLE(this.guild.id, role), {
            name: options.name,
            permissions: options.permissions,
            color: options.color,
            hoist: options.hoist,
            icon: options.icon,
            unicode_emoji: options.unicodeEmoji,
            mentionable: options.mentionable
        });
        return new Role(this.client, resp, this.guild);
    }
    /** Modify the positions of a set of role positions for the guild. */ async editPositions(...positions) {
        if (positions.length === 0) throw new Error('No role positions to change specified');
        await this.client.rest.api.guilds[this.guild.id].roles.patch(positions.map((e)=>({
                id: typeof e.id === 'string' ? e.id : e.id.id,
                position: e.position ?? null
            })));
        return this;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL3JvbGVzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBlcm1pc3Npb25zIH0gZnJvbSAnLi4vLi4vbW9kLnRzJ1xuaW1wb3J0IHsgZmV0Y2hBdXRvIH0gZnJvbSAnLi4vLi4vZGVwcy50cydcbmltcG9ydCB0eXBlIHsgQ2xpZW50IH0gZnJvbSAnLi4vY2xpZW50L21vZC50cydcbmltcG9ydCB0eXBlIHsgR3VpbGQgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL2d1aWxkLnRzJ1xuaW1wb3J0IHsgUm9sZSB9IGZyb20gJy4uL3N0cnVjdHVyZXMvcm9sZS50cydcbmltcG9ydCB7IEdVSUxEX1JPTEUsIEdVSUxEX1JPTEVTIH0gZnJvbSAnLi4vdHlwZXMvZW5kcG9pbnQudHMnXG5pbXBvcnQgdHlwZSB7IFJvbGVNb2RpZnlQYXlsb2FkLCBSb2xlUGF5bG9hZCB9IGZyb20gJy4uL3R5cGVzL3JvbGUudHMnXG5pbXBvcnQgeyBCYXNlTWFuYWdlciB9IGZyb20gJy4vYmFzZS50cydcblxuZXhwb3J0IGludGVyZmFjZSBDcmVhdGVHdWlsZFJvbGVPcHRpb25zIHtcbiAgbmFtZT86IHN0cmluZ1xuICBwZXJtaXNzaW9ucz86IG51bWJlciB8IHN0cmluZyB8IFBlcm1pc3Npb25zXG4gIGNvbG9yPzogbnVtYmVyIHwgc3RyaW5nXG4gIGhvaXN0PzogYm9vbGVhblxuICBtZW50aW9uYWJsZT86IGJvb2xlYW5cbn1cblxuZXhwb3J0IGNsYXNzIFJvbGVzTWFuYWdlciBleHRlbmRzIEJhc2VNYW5hZ2VyPFJvbGVQYXlsb2FkLCBSb2xlPiB7XG4gIGd1aWxkOiBHdWlsZFxuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50LCBndWlsZDogR3VpbGQpIHtcbiAgICBzdXBlcihjbGllbnQsIGByb2xlczoke2d1aWxkLmlkfWAsIFJvbGUpXG4gICAgdGhpcy5ndWlsZCA9IGd1aWxkXG4gIH1cblxuICAvKiogRmV0Y2ggQWxsIEd1aWxkIFJvbGVzICovXG4gIGFzeW5jIGZldGNoQWxsKCk6IFByb21pc2U8Um9sZVtdPiB7XG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY2xpZW50LnJlc3QuYXBpLmd1aWxkc1t0aGlzLmd1aWxkLmlkXS5yb2xlc1xuICAgICAgICAuZ2V0KClcbiAgICAgICAgLnRoZW4oYXN5bmMgKGRhdGE6IFJvbGVQYXlsb2FkW10pID0+IHtcbiAgICAgICAgICBjb25zdCByb2xlczogUm9sZVtdID0gW11cbiAgICAgICAgICBmb3IgKGNvbnN0IHJhdyBvZiBkYXRhKSB7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLnNldChyYXcuaWQsIHJhdylcbiAgICAgICAgICAgIHJvbGVzLnB1c2gobmV3IFJvbGUodGhpcy5jbGllbnQsIHJhdywgdGhpcy5ndWlsZCkpXG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc29sdmUocm9sZXMpXG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZSkgPT4gcmVqZWN0KGUpKVxuICAgIH0pXG4gIH1cblxuICBhc3luYyBnZXQoa2V5OiBzdHJpbmcpOiBQcm9taXNlPFJvbGUgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCByYXcgPSBhd2FpdCB0aGlzLl9nZXQoa2V5KVxuICAgIGlmIChyYXcgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gICAgcmV0dXJuIG5ldyBSb2xlKHRoaXMuY2xpZW50LCByYXcsIHRoaXMuZ3VpbGQpXG4gIH1cblxuICBhc3luYyBhcnJheSgpOiBQcm9taXNlPFJvbGVbXT4ge1xuICAgIGxldCBhcnIgPSBhd2FpdCAodGhpcy5jbGllbnQuY2FjaGUuYXJyYXkodGhpcy5jYWNoZU5hbWUpIGFzIFJvbGVQYXlsb2FkW10pXG4gICAgaWYgKGFyciA9PT0gdW5kZWZpbmVkKSBhcnIgPSBbXVxuICAgIHJldHVybiBhcnIubWFwKChlKSA9PiBuZXcgUm9sZSh0aGlzLmNsaWVudCwgZSwgdGhpcy5ndWlsZCkpXG4gIH1cblxuICBhc3luYyBmcm9tUGF5bG9hZChyb2xlczogUm9sZVBheWxvYWRbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIGZvciAoY29uc3Qgcm9sZSBvZiByb2xlcykge1xuICAgICAgYXdhaXQgdGhpcy5zZXQocm9sZS5pZCwgcm9sZSlcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKiBDcmVhdGUgYSBHdWlsZCBSb2xlICovXG4gIGFzeW5jIGNyZWF0ZShkYXRhPzogQ3JlYXRlR3VpbGRSb2xlT3B0aW9ucyk6IFByb21pc2U8Um9sZT4ge1xuICAgIGlmICh0eXBlb2YgZGF0YT8uY29sb3IgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoZGF0YS5jb2xvci5zdGFydHNXaXRoKCcjJykpIGRhdGEuY29sb3IgPSBkYXRhLmNvbG9yLnNsaWNlKDEpXG4gICAgfVxuXG4gICAgY29uc3Qgcm9sZVJhdyA9IChhd2FpdCB0aGlzLmNsaWVudC5yZXN0LnBvc3QoR1VJTERfUk9MRVModGhpcy5ndWlsZC5pZCksIHtcbiAgICAgIG5hbWU6IGRhdGE/Lm5hbWUsXG4gICAgICBwZXJtaXNzaW9uczpcbiAgICAgICAgZGF0YT8ucGVybWlzc2lvbnMgPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgOiAodHlwZW9mIGRhdGEucGVybWlzc2lvbnMgPT09ICdvYmplY3QnXG4gICAgICAgICAgICAgID8gZGF0YS5wZXJtaXNzaW9ucy5iaXRmaWVsZFxuICAgICAgICAgICAgICA6IGRhdGEucGVybWlzc2lvbnNcbiAgICAgICAgICAgICkudG9TdHJpbmcoKSxcbiAgICAgIGNvbG9yOlxuICAgICAgICBkYXRhPy5jb2xvciA9PT0gdW5kZWZpbmVkXG4gICAgICAgICAgPyB1bmRlZmluZWRcbiAgICAgICAgICA6IHR5cGVvZiBkYXRhLmNvbG9yID09PSAnc3RyaW5nJ1xuICAgICAgICAgID8gaXNOYU4ocGFyc2VJbnQoZGF0YS5jb2xvciwgMTYpKVxuICAgICAgICAgICAgPyAwXG4gICAgICAgICAgICA6IHBhcnNlSW50KGRhdGEuY29sb3IsIDE2KVxuICAgICAgICAgIDogZGF0YS5jb2xvcixcbiAgICAgIGhvaXN0OiBkYXRhPy5ob2lzdCA/PyBmYWxzZSxcbiAgICAgIG1lbnRpb25hYmxlOiBkYXRhPy5tZW50aW9uYWJsZSA/PyBmYWxzZVxuICAgIH0pKSBhcyB1bmtub3duIGFzIFJvbGVQYXlsb2FkXG5cbiAgICBhd2FpdCB0aGlzLnNldChyb2xlUmF3LmlkLCByb2xlUmF3KVxuICAgIHJldHVybiAoYXdhaXQgdGhpcy5nZXQocm9sZVJhdy5pZCkpIGFzIHVua25vd24gYXMgUm9sZVxuICB9XG5cbiAgLyoqIERlbGV0ZSBhIEd1aWxkIFJvbGUgKi9cbiAgYXN5bmMgZGVsZXRlKHJvbGU6IFJvbGUgfCBzdHJpbmcpOiBQcm9taXNlPFJvbGUgfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBvbGRSb2xlID0gYXdhaXQgdGhpcy5nZXQodHlwZW9mIHJvbGUgPT09ICdvYmplY3QnID8gcm9sZS5pZCA6IHJvbGUpXG5cbiAgICBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmRlbGV0ZShcbiAgICAgIEdVSUxEX1JPTEUodGhpcy5ndWlsZC5pZCwgdHlwZW9mIHJvbGUgPT09ICdvYmplY3QnID8gcm9sZS5pZCA6IHJvbGUpXG4gICAgKVxuXG4gICAgcmV0dXJuIG9sZFJvbGVcbiAgfVxuXG4gIGFzeW5jIGVkaXQocm9sZTogUm9sZSB8IHN0cmluZywgb3B0aW9uczogUm9sZU1vZGlmeVBheWxvYWQpOiBQcm9taXNlPFJvbGU+IHtcbiAgICBpZiAoXG4gICAgICBvcHRpb25zLmljb24gIT09IHVuZGVmaW5lZCAmJlxuICAgICAgb3B0aW9ucy5pY29uICE9PSBudWxsICYmXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3N0cmljdC1ib29sZWFuLWV4cHJlc3Npb25zXG4gICAgICAhb3B0aW9ucy5pY29uLnN0YXJ0c1dpdGgoJ2RhdGE6JylcbiAgICApIHtcbiAgICAgIG9wdGlvbnMuaWNvbiA9IGF3YWl0IGZldGNoQXV0byhvcHRpb25zLmljb24pXG4gICAgfVxuICAgIGlmIChyb2xlIGluc3RhbmNlb2YgUm9sZSkge1xuICAgICAgcm9sZSA9IHJvbGUuaWRcbiAgICB9XG4gICAgY29uc3QgcmVzcDogUm9sZVBheWxvYWQgPSBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LnBhdGNoKFxuICAgICAgR1VJTERfUk9MRSh0aGlzLmd1aWxkLmlkLCByb2xlKSxcbiAgICAgIHtcbiAgICAgICAgbmFtZTogb3B0aW9ucy5uYW1lLFxuICAgICAgICBwZXJtaXNzaW9uczogb3B0aW9ucy5wZXJtaXNzaW9ucyxcbiAgICAgICAgY29sb3I6IG9wdGlvbnMuY29sb3IsXG4gICAgICAgIGhvaXN0OiBvcHRpb25zLmhvaXN0LFxuICAgICAgICBpY29uOiBvcHRpb25zLmljb24sXG4gICAgICAgIHVuaWNvZGVfZW1vamk6IG9wdGlvbnMudW5pY29kZUVtb2ppLFxuICAgICAgICBtZW50aW9uYWJsZTogb3B0aW9ucy5tZW50aW9uYWJsZVxuICAgICAgfVxuICAgIClcblxuICAgIHJldHVybiBuZXcgUm9sZSh0aGlzLmNsaWVudCwgcmVzcCwgdGhpcy5ndWlsZClcbiAgfVxuXG4gIC8qKiBNb2RpZnkgdGhlIHBvc2l0aW9ucyBvZiBhIHNldCBvZiByb2xlIHBvc2l0aW9ucyBmb3IgdGhlIGd1aWxkLiAqL1xuICBhc3luYyBlZGl0UG9zaXRpb25zKFxuICAgIC4uLnBvc2l0aW9uczogQXJyYXk8eyBpZDogc3RyaW5nIHwgUm9sZTsgcG9zaXRpb246IG51bWJlciB8IG51bGwgfT5cbiAgKTogUHJvbWlzZTxSb2xlc01hbmFnZXI+IHtcbiAgICBpZiAocG9zaXRpb25zLmxlbmd0aCA9PT0gMClcbiAgICAgIHRocm93IG5ldyBFcnJvcignTm8gcm9sZSBwb3NpdGlvbnMgdG8gY2hhbmdlIHNwZWNpZmllZCcpXG5cbiAgICBhd2FpdCB0aGlzLmNsaWVudC5yZXN0LmFwaS5ndWlsZHNbdGhpcy5ndWlsZC5pZF0ucm9sZXMucGF0Y2goXG4gICAgICBwb3NpdGlvbnMubWFwKChlKSA9PiAoe1xuICAgICAgICBpZDogdHlwZW9mIGUuaWQgPT09ICdzdHJpbmcnID8gZS5pZCA6IGUuaWQuaWQsXG4gICAgICAgIHBvc2l0aW9uOiBlLnBvc2l0aW9uID8/IG51bGxcbiAgICAgIH0pKVxuICAgIClcbiAgICByZXR1cm4gdGhpc1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsU0FBUyxTQUFTLFFBQVEsZ0JBQWU7QUFHekMsU0FBUyxJQUFJLFFBQVEsd0JBQXVCO0FBQzVDLFNBQVMsVUFBVSxFQUFFLFdBQVcsUUFBUSx1QkFBc0I7QUFFOUQsU0FBUyxXQUFXLFFBQVEsWUFBVztBQVV2QyxPQUFPLE1BQU0scUJBQXFCO0lBQ2hDLE1BQVk7SUFFWixZQUFZLE1BQWMsRUFBRSxLQUFZLENBQUU7UUFDeEMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFO1FBQ25DLElBQUksQ0FBQyxLQUFLLEdBQUc7SUFDZjtJQUVBLDBCQUEwQixHQUMxQixNQUFNLFdBQTRCO1FBQ2hDLE9BQU8sTUFBTSxJQUFJLFFBQVEsQ0FBQyxTQUFTLFNBQVc7WUFDNUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FDN0MsR0FBRyxHQUNILElBQUksQ0FBQyxPQUFPLE9BQXdCO2dCQUNuQyxNQUFNLFFBQWdCLEVBQUU7Z0JBQ3hCLEtBQUssTUFBTSxPQUFPLEtBQU07b0JBQ3RCLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBRTtvQkFDdkIsTUFBTSxJQUFJLENBQUMsSUFBSSxLQUFLLElBQUksQ0FBQyxNQUFNLEVBQUUs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