// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
function assertArg(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol !== "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return url;
}
/**
 * Converts a file URL to a path string.
 *
 * ```ts
 * import { fromFileUrl } from "https://deno.land/std@$STD_VERSION/path/posix.ts";
 *
 * fromFileUrl("file:///home/foo"); // "/home/foo"
 * ```
 * @param url of a file URL
 */ export function posixFromFileUrl(url) {
    url = assertArg(url);
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
/**
 * Converts a file URL to a path string.
 *
 * ```ts
 * import { fromFileUrl } from "https://deno.land/std@$STD_VERSION/path/win32.ts";
 *
 * fromFileUrl("file:///home/foo"); // "\\home\\foo"
 * fromFileUrl("file:///C:/Users/foo"); // "C:\\Users\\foo"
 * fromFileUrl("file://localhost/home/foo"); // "\\\\localhost\\home\\foo"
 * ```
 * @param url of a file URL
 */ export function windowsFromFileUrl(url) {
    url = assertArg(url);
    let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname !== "") {
        // Note: The `URL` implementation guarantees that the drive letter and
        // hostname are mutually exclusive. Otherwise it would not have been valid
        // to append the hostname and path like this.
        path = `\\\\${url.hostname}${path}`;
    }
    return path;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMS4wL3BhdGgvX2Zyb21fZmlsZV91cmwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuZnVuY3Rpb24gYXNzZXJ0QXJnKHVybDogVVJMIHwgc3RyaW5nKSB7XG4gIHVybCA9IHVybCBpbnN0YW5jZW9mIFVSTCA/IHVybCA6IG5ldyBVUkwodXJsKTtcbiAgaWYgKHVybC5wcm90b2NvbCAhPT0gXCJmaWxlOlwiKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIk11c3QgYmUgYSBmaWxlIFVSTC5cIik7XG4gIH1cbiAgcmV0dXJuIHVybDtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGZpbGUgVVJMIHRvIGEgcGF0aCBzdHJpbmcuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGZyb21GaWxlVXJsIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vcGF0aC9wb3NpeC50c1wiO1xuICpcbiAqIGZyb21GaWxlVXJsKFwiZmlsZTovLy9ob21lL2Zvb1wiKTsgLy8gXCIvaG9tZS9mb29cIlxuICogYGBgXG4gKiBAcGFyYW0gdXJsIG9mIGEgZmlsZSBVUkxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvc2l4RnJvbUZpbGVVcmwodXJsOiBVUkwgfCBzdHJpbmcpOiBzdHJpbmcge1xuICB1cmwgPSBhc3NlcnRBcmcodXJsKTtcbiAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChcbiAgICB1cmwucGF0aG5hbWUucmVwbGFjZSgvJSg/IVswLTlBLUZhLWZdezJ9KS9nLCBcIiUyNVwiKSxcbiAgKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIGZpbGUgVVJMIHRvIGEgcGF0aCBzdHJpbmcuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGZyb21GaWxlVXJsIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vcGF0aC93aW4zMi50c1wiO1xuICpcbiAqIGZyb21GaWxlVXJsKFwiZmlsZTovLy9ob21lL2Zvb1wiKTsgLy8gXCJcXFxcaG9tZVxcXFxmb29cIlxuICogZnJvbUZpbGVVcmwoXCJmaWxlOi8vL0M6L1VzZXJzL2Zvb1wiKTsgLy8gXCJDOlxcXFxVc2Vyc1xcXFxmb29cIlxuICogZnJvbUZpbGVVcmwoXCJmaWxlOi8vbG9jYWxob3N0L2hvbWUvZm9vXCIpOyAvLyBcIlxcXFxcXFxcbG9jYWxob3N0XFxcXGhvbWVcXFxcZm9vXCJcbiAqIGBgYFxuICogQHBhcmFtIHVybCBvZiBhIGZpbGUgVVJMXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aW5kb3dzRnJvbUZpbGVVcmwodXJsOiBVUkwgfCBzdHJpbmcpOiBzdHJpbmcge1xuICB1cmwgPSBhc3NlcnRBcmcodXJsKTtcbiAgbGV0IHBhdGggPSBkZWNvZGVVUklDb21wb25lbnQoXG4gICAgdXJsLnBhdGhuYW1lLnJlcGxhY2UoL1xcLy9nLCBcIlxcXFxcIikucmVwbGFjZSgvJSg/IVswLTlBLUZhLWZdezJ9KS9nLCBcIiUyNVwiKSxcbiAgKS5yZXBsYWNlKC9eXFxcXCooW0EtWmEtel06KShcXFxcfCQpLywgXCIkMVxcXFxcIik7XG4gIGlmICh1cmwuaG9zdG5hbWUgIT09IFwiXCIpIHtcbiAgICAvLyBOb3RlOiBUaGUgYFVSTGAgaW1wbGVtZW50YXRpb24gZ3VhcmFudGVlcyB0aGF0IHRoZSBkcml2ZSBsZXR0ZXIgYW5kXG4gICAgLy8gaG9zdG5hbWUgYXJlIG11dHVhbGx5IGV4Y2x1c2l2ZS4gT3RoZXJ3aXNlIGl0IHdvdWxkIG5vdCBoYXZlIGJlZW4gdmFsaWRcbiAgICAvLyB0byBhcHBlbmQgdGhlIGhvc3RuYW1lIGFuZCBwYXRoIGxpa2UgdGhpcy5cbiAgICBwYXRoID0gYFxcXFxcXFxcJHt1cmwuaG9zdG5hbWV9JHtwYXRofWA7XG4gIH1cbiAgcmV0dXJuIHBhdGg7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLFVBQVUsR0FBaUIsRUFBRTtJQUNwQyxNQUFNLGVBQWUsTUFBTSxNQUFNLElBQUksSUFBSSxJQUFJO0lBQzdDLElBQUksSUFBSSxRQUFRLEtBQUssU0FBUztRQUM1QixNQUFNLElBQUksVUFBVSx1QkFBdUI7SUFDN0MsQ0FBQztJQUNELE9BQU87QUFDVDtBQUVBOzs7Ozs7Ozs7Q0FTQyxHQUNELE9BQU8sU0FBUyxpQkFBaUIsR0FBaUIsRUFBVTtJQUMxRCxNQUFNLFVBQVU7SUFDaEIsT0FBTyxtQkFDTCxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsd0JBQXdCO0FBRWpELENBQUM7QUFFRDs7Ozs7Ozs7Ozs7Q0FXQyxHQUNELE9BQU8sU0FBUyxtQkFBbUIsR0FBaUIsRUFBVTtJQUM1RCxNQUFNLFVBQVU7SUFDaEIsSUFBSSxPQUFPLG1CQUNULElBQUksUUFBUSxDQUFDLE9BQU8sQ0FBQyxPQUFPLE1BQU0sT0FBTyxDQUFDLHdCQUF3QixRQUNsRSxPQUFPLENBQUMseUJBQXlCO0lBQ25DLElBQUksSUFBSSxRQUFRLEtBQUssSUFBSTtRQUN2QixzRUFBc0U7UUFDdEUsMEVBQTBFO1FBQzFFLDZDQUE2QztRQUM3QyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksUUFBUSxDQUFDLEVBQUUsS0FBSyxDQUFDO0lBQ3JDLENBQUM7SUFDRCxPQUFPO0FBQ1QsQ0FBQyJ9