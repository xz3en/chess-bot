// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { CHAR_COLON } from "./_constants.ts";
import { assertPath, isPathSeparator, isPosixPathSeparator, isWindowsDeviceRoot, stripTrailingSeparators } from "./_util.ts";
function stripSuffix(name, suffix) {
    if (suffix.length >= name.length) {
        return name;
    }
    const lenDiff = name.length - suffix.length;
    for(let i = suffix.length - 1; i >= 0; --i){
        if (name.charCodeAt(lenDiff + i) !== suffix.charCodeAt(i)) {
            return name;
        }
    }
    return name.slice(0, -suffix.length);
}
function lastPathSegment(path, isSep, start = 0) {
    let matchedNonSeparator = false;
    let end = path.length;
    for(let i = path.length - 1; i >= start; --i){
        if (isSep(path.charCodeAt(i))) {
            if (matchedNonSeparator) {
                start = i + 1;
                break;
            }
        } else if (!matchedNonSeparator) {
            matchedNonSeparator = true;
            end = i + 1;
        }
    }
    return path.slice(start, end);
}
function assertArgs(path, suffix) {
    assertPath(path);
    if (path.length === 0) return path;
    if (typeof suffix !== "string") {
        throw new TypeError(`Suffix must be a string. Received ${JSON.stringify(suffix)}`);
    }
}
/**
 * Return the last portion of a `path`.
 * Trailing directory separators are ignored, and optional suffix is removed.
 *
 * @param path - path to extract the name from.
 * @param [suffix] - suffix to remove from extracted name.
 */ export function posixBasename(path, suffix = "") {
    assertArgs(path, suffix);
    const lastSegment = lastPathSegment(path, isPosixPathSeparator);
    const strippedSegment = stripTrailingSeparators(lastSegment, isPosixPathSeparator);
    return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
/**
 * Return the last portion of a `path`.
 * Trailing directory separators are ignored, and optional suffix is removed.
 *
 * @param path - path to extract the name from.
 * @param [suffix] - suffix to remove from extracted name.
 */ export function windowsBasename(path, suffix = "") {
    assertArgs(path, suffix);
    // Check for a drive letter prefix so as not to mistake the following
    // path separator as an extra separator at the end of the path that can be
    // disregarded
    let start = 0;
    if (path.length >= 2) {
        const drive = path.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path.charCodeAt(1) === CHAR_COLON) start = 2;
        }
    }
    const lastSegment = lastPathSegment(path, isPathSeparator, start);
    const strippedSegment = stripTrailingSeparators(lastSegment, isPathSeparator);
    return suffix ? stripSuffix(strippedSegment, suffix) : strippedSegment;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMS4wL3BhdGgvX2Jhc2VuYW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IENIQVJfQ09MT04gfSBmcm9tIFwiLi9fY29uc3RhbnRzLnRzXCI7XG5pbXBvcnQge1xuICBhc3NlcnRQYXRoLFxuICBpc1BhdGhTZXBhcmF0b3IsXG4gIGlzUG9zaXhQYXRoU2VwYXJhdG9yLFxuICBpc1dpbmRvd3NEZXZpY2VSb290LFxuICBzdHJpcFRyYWlsaW5nU2VwYXJhdG9ycyxcbn0gZnJvbSBcIi4vX3V0aWwudHNcIjtcblxuZnVuY3Rpb24gc3RyaXBTdWZmaXgobmFtZTogc3RyaW5nLCBzdWZmaXg6IHN0cmluZyk6IHN0cmluZyB7XG4gIGlmIChzdWZmaXgubGVuZ3RoID49IG5hbWUubGVuZ3RoKSB7XG4gICAgcmV0dXJuIG5hbWU7XG4gIH1cblxuICBjb25zdCBsZW5EaWZmID0gbmFtZS5sZW5ndGggLSBzdWZmaXgubGVuZ3RoO1xuXG4gIGZvciAobGV0IGkgPSBzdWZmaXgubGVuZ3RoIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICBpZiAobmFtZS5jaGFyQ29kZUF0KGxlbkRpZmYgKyBpKSAhPT0gc3VmZml4LmNoYXJDb2RlQXQoaSkpIHtcbiAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lLnNsaWNlKDAsIC1zdWZmaXgubGVuZ3RoKTtcbn1cblxuZnVuY3Rpb24gbGFzdFBhdGhTZWdtZW50KFxuICBwYXRoOiBzdHJpbmcsXG4gIGlzU2VwOiAoY2hhcjogbnVtYmVyKSA9PiBib29sZWFuLFxuICBzdGFydCA9IDAsXG4pOiBzdHJpbmcge1xuICBsZXQgbWF0Y2hlZE5vblNlcGFyYXRvciA9IGZhbHNlO1xuICBsZXQgZW5kID0gcGF0aC5sZW5ndGg7XG5cbiAgZm9yIChsZXQgaSA9IHBhdGgubGVuZ3RoIC0gMTsgaSA+PSBzdGFydDsgLS1pKSB7XG4gICAgaWYgKGlzU2VwKHBhdGguY2hhckNvZGVBdChpKSkpIHtcbiAgICAgIGlmIChtYXRjaGVkTm9uU2VwYXJhdG9yKSB7XG4gICAgICAgIHN0YXJ0ID0gaSArIDE7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoIW1hdGNoZWROb25TZXBhcmF0b3IpIHtcbiAgICAgIG1hdGNoZWROb25TZXBhcmF0b3IgPSB0cnVlO1xuICAgICAgZW5kID0gaSArIDE7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHBhdGguc2xpY2Uoc3RhcnQsIGVuZCk7XG59XG5cbmZ1bmN0aW9uIGFzc2VydEFyZ3MocGF0aDogc3RyaW5nLCBzdWZmaXg6IHN0cmluZykge1xuICBhc3NlcnRQYXRoKHBhdGgpO1xuICBpZiAocGF0aC5sZW5ndGggPT09IDApIHJldHVybiBwYXRoO1xuICBpZiAodHlwZW9mIHN1ZmZpeCAhPT0gXCJzdHJpbmdcIikge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICBgU3VmZml4IG11c3QgYmUgYSBzdHJpbmcuIFJlY2VpdmVkICR7SlNPTi5zdHJpbmdpZnkoc3VmZml4KX1gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm4gdGhlIGxhc3QgcG9ydGlvbiBvZiBhIGBwYXRoYC5cbiAqIFRyYWlsaW5nIGRpcmVjdG9yeSBzZXBhcmF0b3JzIGFyZSBpZ25vcmVkLCBhbmQgb3B0aW9uYWwgc3VmZml4IGlzIHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHBhdGggLSBwYXRoIHRvIGV4dHJhY3QgdGhlIG5hbWUgZnJvbS5cbiAqIEBwYXJhbSBbc3VmZml4XSAtIHN1ZmZpeCB0byByZW1vdmUgZnJvbSBleHRyYWN0ZWQgbmFtZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBvc2l4QmFzZW5hbWUocGF0aDogc3RyaW5nLCBzdWZmaXggPSBcIlwiKTogc3RyaW5nIHtcbiAgYXNzZXJ0QXJncyhwYXRoLCBzdWZmaXgpO1xuXG4gIGNvbnN0IGxhc3RTZWdtZW50ID0gbGFzdFBhdGhTZWdtZW50KHBhdGgsIGlzUG9zaXhQYXRoU2VwYXJhdG9yKTtcbiAgY29uc3Qgc3RyaXBwZWRTZWdtZW50ID0gc3RyaXBUcmFpbGluZ1NlcGFyYXRvcnMoXG4gICAgbGFzdFNlZ21lbnQsXG4gICAgaXNQb3NpeFBhdGhTZXBhcmF0b3IsXG4gICk7XG4gIHJldHVybiBzdWZmaXggPyBzdHJpcFN1ZmZpeChzdHJpcHBlZFNlZ21lbnQsIHN1ZmZpeCkgOiBzdHJpcHBlZFNlZ21lbnQ7XG59XG5cbi8qKlxuICogUmV0dXJuIHRoZSBsYXN0IHBvcnRpb24gb2YgYSBgcGF0aGAuXG4gKiBUcmFpbGluZyBkaXJlY3Rvcnkgc2VwYXJhdG9ycyBhcmUgaWdub3JlZCwgYW5kIG9wdGlvbmFsIHN1ZmZpeCBpcyByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSBwYXRoIC0gcGF0aCB0byBleHRyYWN0IHRoZSBuYW1lIGZyb20uXG4gKiBAcGFyYW0gW3N1ZmZpeF0gLSBzdWZmaXggdG8gcmVtb3ZlIGZyb20gZXh0cmFjdGVkIG5hbWUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB3aW5kb3dzQmFzZW5hbWUocGF0aDogc3RyaW5nLCBzdWZmaXggPSBcIlwiKTogc3RyaW5nIHtcbiAgYXNzZXJ0QXJncyhwYXRoLCBzdWZmaXgpO1xuXG4gIC8vIENoZWNrIGZvciBhIGRyaXZlIGxldHRlciBwcmVmaXggc28gYXMgbm90IHRvIG1pc3Rha2UgdGhlIGZvbGxvd2luZ1xuICAvLyBwYXRoIHNlcGFyYXRvciBhcyBhbiBleHRyYSBzZXBhcmF0b3IgYXQgdGhlIGVuZCBvZiB0aGUgcGF0aCB0aGF0IGNhbiBiZVxuICAvLyBkaXNyZWdhcmRlZFxuICBsZXQgc3RhcnQgPSAwO1xuICBpZiAocGF0aC5sZW5ndGggPj0gMikge1xuICAgIGNvbnN0IGRyaXZlID0gcGF0aC5jaGFyQ29kZUF0KDApO1xuICAgIGlmIChpc1dpbmRvd3NEZXZpY2VSb290KGRyaXZlKSkge1xuICAgICAgaWYgKHBhdGguY2hhckNvZGVBdCgxKSA9PT0gQ0hBUl9DT0xPTikgc3RhcnQgPSAyO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGxhc3RTZWdtZW50ID0gbGFzdFBhdGhTZWdtZW50KHBhdGgsIGlzUGF0aFNlcGFyYXRvciwgc3RhcnQpO1xuICBjb25zdCBzdHJpcHBlZFNlZ21lbnQgPSBzdHJpcFRyYWlsaW5nU2VwYXJhdG9ycyhsYXN0U2VnbWVudCwgaXNQYXRoU2VwYXJhdG9yKTtcbiAgcmV0dXJuIHN1ZmZpeCA/IHN0cmlwU3VmZml4KHN0cmlwcGVkU2VnbWVudCwgc3VmZml4KSA6IHN0cmlwcGVkU2VnbWVudDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsVUFBVSxRQUFRLGtCQUFrQjtBQUM3QyxTQUNFLFVBQVUsRUFDVixlQUFlLEVBQ2Ysb0JBQW9CLEVBQ3BCLG1CQUFtQixFQUNuQix1QkFBdUIsUUFDbEIsYUFBYTtBQUVwQixTQUFTLFlBQVksSUFBWSxFQUFFLE1BQWMsRUFBVTtJQUN6RCxJQUFJLE9BQU8sTUFBTSxJQUFJLEtBQUssTUFBTSxFQUFFO1FBQ2hDLE9BQU87SUFDVCxDQUFDO0lBRUQsTUFBTSxVQUFVLEtBQUssTUFBTSxHQUFHLE9BQU8sTUFBTTtJQUUzQyxJQUFLLElBQUksSUFBSSxPQUFPLE1BQU0sR0FBRyxHQUFHLEtBQUssR0FBRyxFQUFFLEVBQUc7UUFDM0MsSUFBSSxLQUFLLFVBQVUsQ0FBQyxVQUFVLE9BQU8sT0FBTyxVQUFVLENBQUMsSUFBSTtZQUN6RCxPQUFPO1FBQ1QsQ0FBQztJQUNIO0lBRUEsT0FBTyxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxNQUFNO0FBQ3JDO0FBRUEsU0FBUyxnQkFDUCxJQUFZLEVBQ1osS0FBZ0MsRUFDaEMsUUFBUSxDQUFDLEVBQ0Q7SUFDUixJQUFJLHNCQUFzQixLQUFLO0lBQy9CLElBQUksTUFBTSxLQUFLLE1BQU07SUFFckIsSUFBSyxJQUFJLElBQUksS0FBSyxNQUFNLEdBQUcsR0FBRyxLQUFLLE9BQU8sRUFBRSxFQUFHO1FBQzdDLElBQUksTUFBTSxLQUFLLFVBQVUsQ0FBQyxLQUFLO1lBQzdCLElBQUkscUJBQXFCO2dCQUN2QixRQUFRLElBQUk7Z0JBQ1osS0FBTTtZQUNSLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQyxxQkFBcUI7WUFDL0Isc0JBQXNCLElBQUk7WUFDMUIsTUFBTSxJQUFJO1FBQ1osQ0FBQztJQUNIO0lBRUEsT0FBTyxLQUFLLEtBQUssQ0FBQyxPQUFPO0FBQzNCO0FBRUEsU0FBUyxXQUFXLElBQVksRUFBRSxNQUFjLEVBQUU7SUFDaEQsV0FBVztJQUNYLElBQUksS0FBSyxNQUFNLEtBQUssR0FBRyxPQUFPO0lBQzlCLElBQUksT0FBTyxXQUFXLFVBQVU7UUFDOUIsTUFBTSxJQUFJLFVBQ1IsQ0FBQyxrQ0FBa0MsRUFBRSxLQUFLLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFDN0Q7SUFDSixDQUFDO0FBQ0g7QUFFQTs7Ozs7O0NBTUMsR0FDRCxPQUFPLFNBQVMsY0FBYyxJQUFZLEVBQUUsU0FBUyxFQUFFLEVBQVU7SUFDL0QsV0FBVyxNQUFNO0lBRWpCLE1BQU0sY0FBYyxnQkFBZ0IsTUFBTTtJQUMxQyxNQUFNLGtCQUFrQix3QkFDdEIsYUFDQTtJQUVGLE9BQU8sU0FBUyxZQUFZLGlCQUFpQixVQUFVLGVBQWU7QUFDeEUsQ0FBQztBQUVEOzs7Ozs7Q0FNQyxHQUNELE9BQU8sU0FBUyxnQkFBZ0IsSUFBWSxFQUFFLFNBQVMsRUFBRSxFQUFVO0lBQ2pFLFdBQVcsTUFBTTtJQUVqQixxRUFBcUU7SUFDckUsMEVBQTBFO0lBQzFFLGNBQWM7SUFDZCxJQUFJLFFBQVE7SUFDWixJQUFJLEtBQUssTUFBTSxJQUFJLEdBQUc7UUFDcEIsTUFBTSxRQUFRLEtBQUssVUFBVSxDQUFDO1FBQzlCLElBQUksb0JBQW9CLFFBQVE7WUFDOUIsSUFBSSxLQUFLLFVBQVUsQ0FBQyxPQUFPLFlBQVksUUFBUTtRQUNqRCxDQUFDO0lBQ0gsQ0FBQztJQUVELE1BQU0sY0FBYyxnQkFBZ0IsTUFBTSxpQkFBaUI7SUFDM0QsTUFBTSxrQkFBa0Isd0JBQXdCLGFBQWE7SUFDN0QsT0FBTyxTQUFTLFlBQVksaUJBQWlCLFVBQVUsZUFBZTtBQUN4RSxDQUFDIn0=