import { PermissionFlags } from '../../mod.ts';
import { Constants } from '../types/constants.ts';
import { Permissions } from './permissions.ts';
export function createOAuthURL(options) {
    if (options.scopes.length < 1) throw new Error('Must provide at least one scope');
    const params = new URLSearchParams({
        client_id: options.clientID,
        scopes: [
            ...new Set(options.scopes)
        ].join(' ')
    });
    if (options.permissions !== undefined) {
        let perms;
        if (typeof options.permissions === 'string' || typeof options.permissions === 'bigint') {
            perms = String(options.permissions);
        } else if (typeof options.permissions === 'object' && options.permissions !== null && options.permissions instanceof Permissions) {
            perms = String(options.permissions.bitfield);
        } else if (Array.isArray(options.permissions)) {
            let acum = 0n;
            for (const perm of options.permissions){
                if (typeof perm === 'string') {
                    const flag = PermissionFlags[perm];
                    if (typeof flag !== 'number') throw new TypeError(`Invalid Permission Flag: ${flag}`);
                    acum |= flag;
                } else if (typeof perm === 'bigint') {
                    acum |= perm;
                } else throw new TypeError('Unexpected value in permissions array');
            }
            perms = String(acum);
        } else throw new TypeError(`Unexpected value for permissions`);
        params.set('permissions', perms);
    }
    if (options.permissions === undefined && options.scopes.includes('bot')) {
        params.set('permissions', '0');
    }
    if (typeof options.redirectURI === 'string') {
        params.set('redirect_uri', options.redirectURI);
    }
    return `${Constants.DISCORD_API_URL}/v${Constants.DISCORD_API_VERSION}/oauth2/authorize?${params.toString()}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3V0aWxzL29hdXRoVVJMLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBlcm1pc3Npb25GbGFncyB9IGZyb20gJy4uLy4uL21vZC50cydcbmltcG9ydCB7IENvbnN0YW50cyB9IGZyb20gJy4uL3R5cGVzL2NvbnN0YW50cy50cydcbmltcG9ydCB0eXBlIHsgT0F1dGhTY29wZSB9IGZyb20gJy4uL3R5cGVzL29hdXRoLnRzJ1xuaW1wb3J0IHsgUGVybWlzc2lvbnMgfSBmcm9tICcuL3Blcm1pc3Npb25zLnRzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIE9BdXRoVVJMT3B0aW9ucyB7XG4gIGNsaWVudElEOiBzdHJpbmdcbiAgc2NvcGVzOiBPQXV0aFNjb3BlW11cbiAgcGVybWlzc2lvbnM/OlxuICAgIHwgc3RyaW5nXG4gICAgfCBiaWdpbnRcbiAgICB8IFBlcm1pc3Npb25zXG4gICAgfCBBcnJheTxrZXlvZiB0eXBlb2YgUGVybWlzc2lvbkZsYWdzIHwgYmlnaW50PlxuICByZWRpcmVjdFVSST86IHN0cmluZ1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlT0F1dGhVUkwob3B0aW9uczogT0F1dGhVUkxPcHRpb25zKTogc3RyaW5nIHtcbiAgaWYgKG9wdGlvbnMuc2NvcGVzLmxlbmd0aCA8IDEpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdNdXN0IHByb3ZpZGUgYXQgbGVhc3Qgb25lIHNjb3BlJylcblxuICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHtcbiAgICBjbGllbnRfaWQ6IG9wdGlvbnMuY2xpZW50SUQsXG4gICAgc2NvcGVzOiBbLi4ubmV3IFNldChvcHRpb25zLnNjb3BlcyldLmpvaW4oJyAnKVxuICB9KVxuXG4gIGlmIChvcHRpb25zLnBlcm1pc3Npb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICBsZXQgcGVybXM6IHN0cmluZ1xuXG4gICAgaWYgKFxuICAgICAgdHlwZW9mIG9wdGlvbnMucGVybWlzc2lvbnMgPT09ICdzdHJpbmcnIHx8XG4gICAgICB0eXBlb2Ygb3B0aW9ucy5wZXJtaXNzaW9ucyA9PT0gJ2JpZ2ludCdcbiAgICApIHtcbiAgICAgIHBlcm1zID0gU3RyaW5nKG9wdGlvbnMucGVybWlzc2lvbnMpXG4gICAgfSBlbHNlIGlmIChcbiAgICAgIHR5cGVvZiBvcHRpb25zLnBlcm1pc3Npb25zID09PSAnb2JqZWN0JyAmJlxuICAgICAgb3B0aW9ucy5wZXJtaXNzaW9ucyAhPT0gbnVsbCAmJlxuICAgICAgb3B0aW9ucy5wZXJtaXNzaW9ucyBpbnN0YW5jZW9mIFBlcm1pc3Npb25zXG4gICAgKSB7XG4gICAgICBwZXJtcyA9IFN0cmluZyhvcHRpb25zLnBlcm1pc3Npb25zLmJpdGZpZWxkKVxuICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvcHRpb25zLnBlcm1pc3Npb25zKSkge1xuICAgICAgbGV0IGFjdW0gPSAwblxuICAgICAgZm9yIChjb25zdCBwZXJtIG9mIG9wdGlvbnMucGVybWlzc2lvbnMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwZXJtID09PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IGZsYWcgPSBQZXJtaXNzaW9uRmxhZ3NbcGVybV1cbiAgICAgICAgICBpZiAodHlwZW9mIGZsYWcgIT09ICdudW1iZXInKVxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBQZXJtaXNzaW9uIEZsYWc6ICR7ZmxhZ31gKVxuICAgICAgICAgIGFjdW0gfD0gZmxhZ1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBwZXJtID09PSAnYmlnaW50Jykge1xuICAgICAgICAgIGFjdW0gfD0gcGVybVxuICAgICAgICB9IGVsc2UgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5leHBlY3RlZCB2YWx1ZSBpbiBwZXJtaXNzaW9ucyBhcnJheScpXG4gICAgICB9XG4gICAgICBwZXJtcyA9IFN0cmluZyhhY3VtKVxuICAgIH0gZWxzZSB0aHJvdyBuZXcgVHlwZUVycm9yKGBVbmV4cGVjdGVkIHZhbHVlIGZvciBwZXJtaXNzaW9uc2ApXG4gICAgcGFyYW1zLnNldCgncGVybWlzc2lvbnMnLCBwZXJtcylcbiAgfVxuXG4gIGlmIChvcHRpb25zLnBlcm1pc3Npb25zID09PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5zY29wZXMuaW5jbHVkZXMoJ2JvdCcpKSB7XG4gICAgcGFyYW1zLnNldCgncGVybWlzc2lvbnMnLCAnMCcpXG4gIH1cblxuICBpZiAodHlwZW9mIG9wdGlvbnMucmVkaXJlY3RVUkkgPT09ICdzdHJpbmcnKSB7XG4gICAgcGFyYW1zLnNldCgncmVkaXJlY3RfdXJpJywgb3B0aW9ucy5yZWRpcmVjdFVSSSlcbiAgfVxuXG4gIHJldHVybiBgJHtDb25zdGFudHMuRElTQ09SRF9BUElfVVJMfS92JHtcbiAgICBDb25zdGFudHMuRElTQ09SRF9BUElfVkVSU0lPTlxuICB9L29hdXRoMi9hdXRob3JpemU/JHtwYXJhbXMudG9TdHJpbmcoKX1gXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxlQUFlLFFBQVEsZUFBYztBQUM5QyxTQUFTLFNBQVMsUUFBUSx3QkFBdUI7QUFFakQsU0FBUyxXQUFXLFFBQVEsbUJBQWtCO0FBYTlDLE9BQU8sU0FBUyxlQUFlLE9BQXdCLEVBQVU7SUFDL0QsSUFBSSxRQUFRLE1BQU0sQ0FBQyxNQUFNLEdBQUcsR0FDMUIsTUFBTSxJQUFJLE1BQU0sbUNBQWtDO0lBRXBELE1BQU0sU0FBUyxJQUFJLGdCQUFnQjtRQUNqQyxXQUFXLFFBQVEsUUFBUTtRQUMzQixRQUFRO2VBQUksSUFBSSxJQUFJLFFBQVEsTUFBTTtTQUFFLENBQUMsSUFBSSxDQUFDO0lBQzVDO0lBRUEsSUFBSSxRQUFRLFdBQVcsS0FBSyxXQUFXO1FBQ3JDLElBQUk7UUFFSixJQUNFLE9BQU8sUUFBUSxXQUFXLEtBQUssWUFDL0IsT0FBTyxRQUFRLFdBQVcsS0FBSyxVQUMvQjtZQUNBLFFBQVEsT0FBTyxRQUFRLFdBQVc7UUFDcEMsT0FBTyxJQUNMLE9BQU8sUUFBUSxXQUFXLEtBQUssWUFDL0IsUUFBUSxXQUFXLEtBQUssSUFBSSxJQUM1QixRQUFRLFdBQVcsWUFBWSxhQUMvQjtZQUNBLFFBQVEsT0FBTyxRQUFRLFdBQVcsQ0FBQyxRQUFRO1FBQzdDLE9BQU8sSUFBSSxNQUFNLE9BQU8sQ0FBQyxRQUFRLFdBQVcsR0FBRztZQUM3QyxJQUFJLE9BQU8sRUFBRTtZQUNiLEtBQUssTUFBTSxRQUFRLFFBQVEsV0FBVyxDQUFFO2dCQUN0QyxJQUFJLE9BQU8sU0FBUyxVQUFVO29CQUM1QixNQUFNLE9BQU8sZUFBZSxDQUFDLEtBQUs7b0JBQ2xDLElBQUksT0FBTyxTQUFTLFVBQ2xCLE1BQU0sSUFBSSxVQUFVLENBQUMseUJBQXlCLEVBQUUsS0FBSyxDQUFDLEVBQUM7b0JBQ3pELFFBQVE7Z0JBQ1YsT0FBTyxJQUFJLE9BQU8sU0FBUyxVQUFVO29CQUNuQyxRQUFRO2dCQUNWLE9BQU8sTUFBTSxJQUFJLFVBQVUseUNBQXdDO1lBQ3JFO1lBQ0EsUUFBUSxPQUFPO1FBQ2pCLE9BQU8sTUFBTSxJQUFJLFVBQVUsQ0FBQyxnQ0FBZ0MsQ0FBQyxFQUFDO1FBQzlELE9BQU8sR0FBRyxDQUFDLGVBQWU7SUFDNUIsQ0FBQztJQUVELElBQUksUUFBUSxXQUFXLEtBQUssYUFBYSxRQUFRLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUTtRQUN2RSxPQUFPLEdBQUcsQ0FBQyxlQUFlO0lBQzVCLENBQUM7SUFFRCxJQUFJLE9BQU8sUUFBUSxXQUFXLEtBQUssVUFBVTtRQUMzQyxPQUFPLEdBQUcsQ0FBQyxnQkFBZ0IsUUFBUSxXQUFXO0lBQ2hELENBQUM7SUFFRCxPQUFPLENBQUMsRUFBRSxVQUFVLGVBQWUsQ0FBQyxFQUFFLEVBQ3BDLFVBQVUsbUJBQW1CLENBQzlCLGtCQUFrQixFQUFFLE9BQU8sUUFBUSxHQUFHLENBQUM7QUFDMUMsQ0FBQyJ9