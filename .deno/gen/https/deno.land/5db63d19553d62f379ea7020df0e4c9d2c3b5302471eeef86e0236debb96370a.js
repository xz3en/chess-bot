// Ported from https://github.com/discordjs/discord.js/blob/master/src/util/Permissions.js
import { PermissionFlags } from '../types/permissionFlags.ts';
import { BitField } from './bitfield.ts';
/** Represents permissions BitField */ export class Permissions extends BitField {
    static DEFAULT = 104324673n;
    static ALL = Object.values(PermissionFlags).reduce((all, p)=>BigInt(all) | BigInt(p), 0n);
    constructor(bits){
        super(PermissionFlags, bits);
    }
    any(permission, checkAdmin = true) {
        return(// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        checkAdmin && super.has(this.flags().ADMINISTRATOR) || super.any(permission));
    }
    has(permission, checkAdmin = true) {
        return(// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        checkAdmin && super.has(this.flags().ADMINISTRATOR) || super.has(permission));
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3V0aWxzL3Blcm1pc3Npb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9kaXNjb3JkanMvZGlzY29yZC5qcy9ibG9iL21hc3Rlci9zcmMvdXRpbC9QZXJtaXNzaW9ucy5qc1xuaW1wb3J0IHsgUGVybWlzc2lvbkZsYWdzIH0gZnJvbSAnLi4vdHlwZXMvcGVybWlzc2lvbkZsYWdzLnRzJ1xuaW1wb3J0IHsgQml0RmllbGQsIEJpdEZpZWxkUmVzb2x2YWJsZSB9IGZyb20gJy4vYml0ZmllbGQudHMnXG5cbmV4cG9ydCB0eXBlIFBlcm1pc3Npb25SZXNvbHZhYmxlID0gQml0RmllbGRSZXNvbHZhYmxlXG5cbi8qKiBSZXByZXNlbnRzIHBlcm1pc3Npb25zIEJpdEZpZWxkICovXG5leHBvcnQgY2xhc3MgUGVybWlzc2lvbnMgZXh0ZW5kcyBCaXRGaWVsZCB7XG4gIHN0YXRpYyBERUZBVUxUID0gMTA0MzI0NjczblxuICBzdGF0aWMgQUxMID0gT2JqZWN0LnZhbHVlcyhQZXJtaXNzaW9uRmxhZ3MpLnJlZHVjZShcbiAgICAoYWxsLCBwKSA9PiBCaWdJbnQoYWxsKSB8IEJpZ0ludChwKSxcbiAgICAwblxuICApXG5cbiAgY29uc3RydWN0b3IoYml0czogQml0RmllbGRSZXNvbHZhYmxlKSB7XG4gICAgc3VwZXIoUGVybWlzc2lvbkZsYWdzLCBiaXRzKVxuICB9XG5cbiAgYW55KHBlcm1pc3Npb246IFBlcm1pc3Npb25SZXNvbHZhYmxlLCBjaGVja0FkbWluID0gdHJ1ZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3N0cmljdC1ib29sZWFuLWV4cHJlc3Npb25zXG4gICAgICAoY2hlY2tBZG1pbiAmJiBzdXBlci5oYXModGhpcy5mbGFncygpLkFETUlOSVNUUkFUT1IpKSB8fFxuICAgICAgc3VwZXIuYW55KHBlcm1pc3Npb24pXG4gICAgKVxuICB9XG5cbiAgaGFzKHBlcm1pc3Npb246IFBlcm1pc3Npb25SZXNvbHZhYmxlLCBjaGVja0FkbWluID0gdHJ1ZSk6IGJvb2xlYW4ge1xuICAgIHJldHVybiAoXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3N0cmljdC1ib29sZWFuLWV4cHJlc3Npb25zXG4gICAgICAoY2hlY2tBZG1pbiAmJiBzdXBlci5oYXModGhpcy5mbGFncygpLkFETUlOSVNUUkFUT1IpKSB8fFxuICAgICAgc3VwZXIuaGFzKHBlcm1pc3Npb24pXG4gICAgKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEZBQTBGO0FBQzFGLFNBQVMsZUFBZSxRQUFRLDhCQUE2QjtBQUM3RCxTQUFTLFFBQVEsUUFBNEIsZ0JBQWU7QUFJNUQsb0NBQW9DLEdBQ3BDLE9BQU8sTUFBTSxvQkFBb0I7SUFDL0IsT0FBTyxVQUFVLFVBQVUsQ0FBQTtJQUMzQixPQUFPLE1BQU0sT0FBTyxNQUFNLENBQUMsaUJBQWlCLE1BQU0sQ0FDaEQsQ0FBQyxLQUFLLElBQU0sT0FBTyxPQUFPLE9BQU8sSUFDakMsRUFBRSxFQUNIO0lBRUQsWUFBWSxJQUF3QixDQUFFO1FBQ3BDLEtBQUssQ0FBQyxpQkFBaUI7SUFDekI7SUFFQSxJQUFJLFVBQWdDLEVBQUUsYUFBYSxJQUFJLEVBQVc7UUFDaEUsT0FFRSxBQURBLHlFQUF5RTtRQUN4RSxjQUFjLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssR0FBRyxhQUFhLEtBQ25ELEtBQUssQ0FBQyxHQUFHLENBQUM7SUFFZDtJQUVBLElBQUksVUFBZ0MsRUFBRSxhQUFhLElBQUksRUFBVztRQUNoRSxPQUVFLEFBREEseUVBQXlFO1FBQ3hFLGNBQWMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLGFBQWEsS0FDbkQsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUVkO0FBQ0YsQ0FBQyJ9