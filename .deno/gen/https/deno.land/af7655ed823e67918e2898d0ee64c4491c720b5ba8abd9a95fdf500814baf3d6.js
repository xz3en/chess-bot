// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { CHAR_BACKWARD_SLASH, CHAR_COLON, CHAR_DOT, CHAR_QUESTION_MARK } from "./_constants.ts";
import { isWindowsDeviceRoot } from "./_util.ts";
import { windowsResolve } from "./_resolve.ts";
/**
 * Resolves path to a namespace path
 * @param path to resolve to namespace
 */ export function posixToNamespacedPath(path) {
    // Non-op on posix systems
    return path;
}
/**
 * Resolves path to a namespace path
 * @param path to resolve to namespace
 */ export function windowsToNamespacedPath(path) {
    // Note: this will *probably* throw somewhere.
    if (typeof path !== "string") return path;
    if (path.length === 0) return "";
    const resolvedPath = windowsResolve(path);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === CHAR_BACKWARD_SLASH) {
            // Possible UNC root
            if (resolvedPath.charCodeAt(1) === CHAR_BACKWARD_SLASH) {
                const code = resolvedPath.charCodeAt(2);
                if (code !== CHAR_QUESTION_MARK && code !== CHAR_DOT) {
                    // Matched non-long UNC root, convert the path to a long UNC path
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            // Possible device root
            if (resolvedPath.charCodeAt(1) === CHAR_COLON && resolvedPath.charCodeAt(2) === CHAR_BACKWARD_SLASH) {
                // Matched device root, convert the path to a long UNC path
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMC4wL3BhdGgvX3RvX25hbWVzcGFjZWRfcGF0aC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG5pbXBvcnQge1xuICBDSEFSX0JBQ0tXQVJEX1NMQVNILFxuICBDSEFSX0NPTE9OLFxuICBDSEFSX0RPVCxcbiAgQ0hBUl9RVUVTVElPTl9NQVJLLFxufSBmcm9tIFwiLi9fY29uc3RhbnRzLnRzXCI7XG5pbXBvcnQgeyBpc1dpbmRvd3NEZXZpY2VSb290IH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcbmltcG9ydCB7IHdpbmRvd3NSZXNvbHZlIH0gZnJvbSBcIi4vX3Jlc29sdmUudHNcIjtcblxuLyoqXG4gKiBSZXNvbHZlcyBwYXRoIHRvIGEgbmFtZXNwYWNlIHBhdGhcbiAqIEBwYXJhbSBwYXRoIHRvIHJlc29sdmUgdG8gbmFtZXNwYWNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwb3NpeFRvTmFtZXNwYWNlZFBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gTm9uLW9wIG9uIHBvc2l4IHN5c3RlbXNcbiAgcmV0dXJuIHBhdGg7XG59XG5cbi8qKlxuICogUmVzb2x2ZXMgcGF0aCB0byBhIG5hbWVzcGFjZSBwYXRoXG4gKiBAcGFyYW0gcGF0aCB0byByZXNvbHZlIHRvIG5hbWVzcGFjZVxuICovXG5leHBvcnQgZnVuY3Rpb24gd2luZG93c1RvTmFtZXNwYWNlZFBhdGgocGF0aDogc3RyaW5nKTogc3RyaW5nIHtcbiAgLy8gTm90ZTogdGhpcyB3aWxsICpwcm9iYWJseSogdGhyb3cgc29tZXdoZXJlLlxuICBpZiAodHlwZW9mIHBhdGggIT09IFwic3RyaW5nXCIpIHJldHVybiBwYXRoO1xuICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiBcIlwiO1xuXG4gIGNvbnN0IHJlc29sdmVkUGF0aCA9IHdpbmRvd3NSZXNvbHZlKHBhdGgpO1xuXG4gIGlmIChyZXNvbHZlZFBhdGgubGVuZ3RoID49IDMpIHtcbiAgICBpZiAocmVzb2x2ZWRQYXRoLmNoYXJDb2RlQXQoMCkgPT09IENIQVJfQkFDS1dBUkRfU0xBU0gpIHtcbiAgICAgIC8vIFBvc3NpYmxlIFVOQyByb290XG5cbiAgICAgIGlmIChyZXNvbHZlZFBhdGguY2hhckNvZGVBdCgxKSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSCkge1xuICAgICAgICBjb25zdCBjb2RlID0gcmVzb2x2ZWRQYXRoLmNoYXJDb2RlQXQoMik7XG4gICAgICAgIGlmIChjb2RlICE9PSBDSEFSX1FVRVNUSU9OX01BUksgJiYgY29kZSAhPT0gQ0hBUl9ET1QpIHtcbiAgICAgICAgICAvLyBNYXRjaGVkIG5vbi1sb25nIFVOQyByb290LCBjb252ZXJ0IHRoZSBwYXRoIHRvIGEgbG9uZyBVTkMgcGF0aFxuICAgICAgICAgIHJldHVybiBgXFxcXFxcXFw/XFxcXFVOQ1xcXFwke3Jlc29sdmVkUGF0aC5zbGljZSgyKX1gO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc1dpbmRvd3NEZXZpY2VSb290KHJlc29sdmVkUGF0aC5jaGFyQ29kZUF0KDApKSkge1xuICAgICAgLy8gUG9zc2libGUgZGV2aWNlIHJvb3RcblxuICAgICAgaWYgKFxuICAgICAgICByZXNvbHZlZFBhdGguY2hhckNvZGVBdCgxKSA9PT0gQ0hBUl9DT0xPTiAmJlxuICAgICAgICByZXNvbHZlZFBhdGguY2hhckNvZGVBdCgyKSA9PT0gQ0hBUl9CQUNLV0FSRF9TTEFTSFxuICAgICAgKSB7XG4gICAgICAgIC8vIE1hdGNoZWQgZGV2aWNlIHJvb3QsIGNvbnZlcnQgdGhlIHBhdGggdG8gYSBsb25nIFVOQyBwYXRoXG4gICAgICAgIHJldHVybiBgXFxcXFxcXFw/XFxcXCR7cmVzb2x2ZWRQYXRofWA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhdGg7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUNFLG1CQUFtQixFQUNuQixVQUFVLEVBQ1YsUUFBUSxFQUNSLGtCQUFrQixRQUNiLGtCQUFrQjtBQUN6QixTQUFTLG1CQUFtQixRQUFRLGFBQWE7QUFDakQsU0FBUyxjQUFjLFFBQVEsZ0JBQWdCO0FBRS9DOzs7Q0FHQyxHQUNELE9BQU8sU0FBUyxzQkFBc0IsSUFBWSxFQUFVO0lBQzFELDBCQUEwQjtJQUMxQixPQUFPO0FBQ1QsQ0FBQztBQUVEOzs7Q0FHQyxHQUNELE9BQU8sU0FBUyx3QkFBd0IsSUFBWSxFQUFVO0lBQzVELDhDQUE4QztJQUM5QyxJQUFJLE9BQU8sU0FBUyxVQUFVLE9BQU87SUFDckMsSUFBSSxLQUFLLE1BQU0sS0FBSyxHQUFHLE9BQU87SUFFOUIsTUFBTSxlQUFlLGVBQWU7SUFFcEMsSUFBSSxhQUFhLE1BQU0sSUFBSSxHQUFHO1FBQzVCLElBQUksYUFBYSxVQUFVLENBQUMsT0FBTyxxQkFBcUI7WUFDdEQsb0JBQW9CO1lBRXBCLElBQUksYUFBYSxVQUFVLENBQUMsT0FBTyxxQkFBcUI7Z0JBQ3RELE1BQU0sT0FBTyxhQUFhLFVBQVUsQ0FBQztnQkFDckMsSUFBSSxTQUFTLHNCQUFzQixTQUFTLFVBQVU7b0JBQ3BELGlFQUFpRTtvQkFDakUsT0FBTyxDQUFDLFlBQVksRUFBRSxhQUFhLEtBQUssQ0FBQyxHQUFHLENBQUM7Z0JBQy9DLENBQUM7WUFDSCxDQUFDO1FBQ0gsT0FBTyxJQUFJLG9CQUFvQixhQUFhLFVBQVUsQ0FBQyxLQUFLO1lBQzFELHVCQUF1QjtZQUV2QixJQUNFLGFBQWEsVUFBVSxDQUFDLE9BQU8sY0FDL0IsYUFBYSxVQUFVLENBQUMsT0FBTyxxQkFDL0I7Z0JBQ0EsMkRBQTJEO2dCQUMzRCxPQUFPLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQztZQUNqQyxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPO0FBQ1QsQ0FBQyJ9