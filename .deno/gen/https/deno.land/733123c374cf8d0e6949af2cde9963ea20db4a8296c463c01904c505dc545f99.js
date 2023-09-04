// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { consumeMediaParam, decode2331Encoding } from "./_util.ts";
/**
 * Parses the media type and any optional parameters, per
 * [RFC 1521](https://datatracker.ietf.org/doc/html/rfc1521). Media types are
 * the values in `Content-Type` and `Content-Disposition` headers. On success
 * the function returns a tuple where the first element is the media type and
 * the second element is the optional parameters or `undefined` if there are
 * none.
 *
 * The function will throw if the parsed value is invalid.
 *
 * The returned media type will be normalized to be lower case, and returned
 * params keys will be normalized to lower case, but preserves the casing of
 * the value.
 *
 * @example
 * ```ts
 * import { parseMediaType } from "https://deno.land/std@$STD_VERSION/media_types/parse_media_type.ts";
 * import { assertEquals } from "https://deno.land/std@$STD_VERSION/assert/assert_equals.ts";
 *
 * assertEquals(
 *   parseMediaType("application/JSON"),
 *   [
 *     "application/json",
 *     undefined
 *   ]
 * );
 *
 * assertEquals(
 *   parseMediaType("text/html; charset=UTF-8"),
 *   [
 *     "text/html",
 *     { charset: "UTF-8" },
 *   ]
 * );
 * ```
 */ export function parseMediaType(v) {
    const [base] = v.split(";");
    const mediaType = base.toLowerCase().trim();
    const params = {};
    // Map of base parameter name -> parameter name -> value
    // for parameters containing a '*' character.
    const continuation = new Map();
    v = v.slice(base.length);
    while(v.length){
        v = v.trimStart();
        if (v.length === 0) {
            break;
        }
        const [key, value, rest] = consumeMediaParam(v);
        if (!key) {
            if (rest.trim() === ";") {
                break;
            }
            throw new TypeError("Invalid media parameter.");
        }
        let pmap = params;
        const [baseName, rest2] = key.split("*");
        if (baseName && rest2 != null) {
            if (!continuation.has(baseName)) {
                continuation.set(baseName, {});
            }
            pmap = continuation.get(baseName);
        }
        if (key in pmap) {
            throw new TypeError("Duplicate key parsed.");
        }
        pmap[key] = value;
        v = rest;
    }
    // Stitch together any continuations or things with stars
    // (i.e. RFC 2231 things with stars: "foo*0" or "foo*")
    let str = "";
    for (const [key1, pieceMap] of continuation){
        const singlePartKey = `${key1}*`;
        const v1 = pieceMap[singlePartKey];
        if (v1) {
            const decv = decode2331Encoding(v1);
            if (decv) {
                params[key1] = decv;
            }
            continue;
        }
        str = "";
        let valid = false;
        for(let n = 0;; n++){
            const simplePart = `${key1}*${n}`;
            let v2 = pieceMap[simplePart];
            if (v2) {
                valid = true;
                str += v2;
                continue;
            }
            const encodedPart = `${simplePart}*`;
            v2 = pieceMap[encodedPart];
            if (!v2) {
                break;
            }
            valid = true;
            if (n === 0) {
                const decv1 = decode2331Encoding(v2);
                if (decv1) {
                    str += decv1;
                }
            } else {
                const decv2 = decodeURI(v2);
                str += decv2;
            }
        }
        if (valid) {
            params[key1] = str;
        }
    }
    return Object.keys(params).length ? [
        mediaType,
        params
    ] : [
        mediaType,
        undefined
    ];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMC4wL21lZGlhX3R5cGVzL3BhcnNlX21lZGlhX3R5cGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgY29uc3VtZU1lZGlhUGFyYW0sIGRlY29kZTIzMzFFbmNvZGluZyB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbi8qKlxuICogUGFyc2VzIHRoZSBtZWRpYSB0eXBlIGFuZCBhbnkgb3B0aW9uYWwgcGFyYW1ldGVycywgcGVyXG4gKiBbUkZDIDE1MjFdKGh0dHBzOi8vZGF0YXRyYWNrZXIuaWV0Zi5vcmcvZG9jL2h0bWwvcmZjMTUyMSkuIE1lZGlhIHR5cGVzIGFyZVxuICogdGhlIHZhbHVlcyBpbiBgQ29udGVudC1UeXBlYCBhbmQgYENvbnRlbnQtRGlzcG9zaXRpb25gIGhlYWRlcnMuIE9uIHN1Y2Nlc3NcbiAqIHRoZSBmdW5jdGlvbiByZXR1cm5zIGEgdHVwbGUgd2hlcmUgdGhlIGZpcnN0IGVsZW1lbnQgaXMgdGhlIG1lZGlhIHR5cGUgYW5kXG4gKiB0aGUgc2Vjb25kIGVsZW1lbnQgaXMgdGhlIG9wdGlvbmFsIHBhcmFtZXRlcnMgb3IgYHVuZGVmaW5lZGAgaWYgdGhlcmUgYXJlXG4gKiBub25lLlxuICpcbiAqIFRoZSBmdW5jdGlvbiB3aWxsIHRocm93IGlmIHRoZSBwYXJzZWQgdmFsdWUgaXMgaW52YWxpZC5cbiAqXG4gKiBUaGUgcmV0dXJuZWQgbWVkaWEgdHlwZSB3aWxsIGJlIG5vcm1hbGl6ZWQgdG8gYmUgbG93ZXIgY2FzZSwgYW5kIHJldHVybmVkXG4gKiBwYXJhbXMga2V5cyB3aWxsIGJlIG5vcm1hbGl6ZWQgdG8gbG93ZXIgY2FzZSwgYnV0IHByZXNlcnZlcyB0aGUgY2FzaW5nIG9mXG4gKiB0aGUgdmFsdWUuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyBwYXJzZU1lZGlhVHlwZSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL21lZGlhX3R5cGVzL3BhcnNlX21lZGlhX3R5cGUudHNcIjtcbiAqIGltcG9ydCB7IGFzc2VydEVxdWFscyB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2Fzc2VydC9hc3NlcnRfZXF1YWxzLnRzXCI7XG4gKlxuICogYXNzZXJ0RXF1YWxzKFxuICogICBwYXJzZU1lZGlhVHlwZShcImFwcGxpY2F0aW9uL0pTT05cIiksXG4gKiAgIFtcbiAqICAgICBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAqICAgICB1bmRlZmluZWRcbiAqICAgXVxuICogKTtcbiAqXG4gKiBhc3NlcnRFcXVhbHMoXG4gKiAgIHBhcnNlTWVkaWFUeXBlKFwidGV4dC9odG1sOyBjaGFyc2V0PVVURi04XCIpLFxuICogICBbXG4gKiAgICAgXCJ0ZXh0L2h0bWxcIixcbiAqICAgICB7IGNoYXJzZXQ6IFwiVVRGLThcIiB9LFxuICogICBdXG4gKiApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZU1lZGlhVHlwZShcbiAgdjogc3RyaW5nLFxuKTogW21lZGlhVHlwZTogc3RyaW5nLCBwYXJhbXM6IFJlY29yZDxzdHJpbmcsIHN0cmluZz4gfCB1bmRlZmluZWRdIHtcbiAgY29uc3QgW2Jhc2VdID0gdi5zcGxpdChcIjtcIik7XG4gIGNvbnN0IG1lZGlhVHlwZSA9IGJhc2UudG9Mb3dlckNhc2UoKS50cmltKCk7XG5cbiAgY29uc3QgcGFyYW1zOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gIC8vIE1hcCBvZiBiYXNlIHBhcmFtZXRlciBuYW1lIC0+IHBhcmFtZXRlciBuYW1lIC0+IHZhbHVlXG4gIC8vIGZvciBwYXJhbWV0ZXJzIGNvbnRhaW5pbmcgYSAnKicgY2hhcmFjdGVyLlxuICBjb25zdCBjb250aW51YXRpb24gPSBuZXcgTWFwPHN0cmluZywgUmVjb3JkPHN0cmluZywgc3RyaW5nPj4oKTtcblxuICB2ID0gdi5zbGljZShiYXNlLmxlbmd0aCk7XG4gIHdoaWxlICh2Lmxlbmd0aCkge1xuICAgIHYgPSB2LnRyaW1TdGFydCgpO1xuICAgIGlmICh2Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IFtrZXksIHZhbHVlLCByZXN0XSA9IGNvbnN1bWVNZWRpYVBhcmFtKHYpO1xuICAgIGlmICgha2V5KSB7XG4gICAgICBpZiAocmVzdC50cmltKCkgPT09IFwiO1wiKSB7XG4gICAgICAgIC8vIGlnbm9yZSB0cmFpbGluZyBzZW1pY29sb25zXG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkludmFsaWQgbWVkaWEgcGFyYW1ldGVyLlwiKTtcbiAgICB9XG5cbiAgICBsZXQgcG1hcCA9IHBhcmFtcztcbiAgICBjb25zdCBbYmFzZU5hbWUsIHJlc3QyXSA9IGtleS5zcGxpdChcIipcIik7XG4gICAgaWYgKGJhc2VOYW1lICYmIHJlc3QyICE9IG51bGwpIHtcbiAgICAgIGlmICghY29udGludWF0aW9uLmhhcyhiYXNlTmFtZSkpIHtcbiAgICAgICAgY29udGludWF0aW9uLnNldChiYXNlTmFtZSwge30pO1xuICAgICAgfVxuICAgICAgcG1hcCA9IGNvbnRpbnVhdGlvbi5nZXQoYmFzZU5hbWUpITtcbiAgICB9XG4gICAgaWYgKGtleSBpbiBwbWFwKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRHVwbGljYXRlIGtleSBwYXJzZWQuXCIpO1xuICAgIH1cbiAgICBwbWFwW2tleV0gPSB2YWx1ZTtcbiAgICB2ID0gcmVzdDtcbiAgfVxuXG4gIC8vIFN0aXRjaCB0b2dldGhlciBhbnkgY29udGludWF0aW9ucyBvciB0aGluZ3Mgd2l0aCBzdGFyc1xuICAvLyAoaS5lLiBSRkMgMjIzMSB0aGluZ3Mgd2l0aCBzdGFyczogXCJmb28qMFwiIG9yIFwiZm9vKlwiKVxuICBsZXQgc3RyID0gXCJcIjtcbiAgZm9yIChjb25zdCBba2V5LCBwaWVjZU1hcF0gb2YgY29udGludWF0aW9uKSB7XG4gICAgY29uc3Qgc2luZ2xlUGFydEtleSA9IGAke2tleX0qYDtcbiAgICBjb25zdCB2ID0gcGllY2VNYXBbc2luZ2xlUGFydEtleV07XG4gICAgaWYgKHYpIHtcbiAgICAgIGNvbnN0IGRlY3YgPSBkZWNvZGUyMzMxRW5jb2Rpbmcodik7XG4gICAgICBpZiAoZGVjdikge1xuICAgICAgICBwYXJhbXNba2V5XSA9IGRlY3Y7XG4gICAgICB9XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBzdHIgPSBcIlwiO1xuICAgIGxldCB2YWxpZCA9IGZhbHNlO1xuICAgIGZvciAobGV0IG4gPSAwOzsgbisrKSB7XG4gICAgICBjb25zdCBzaW1wbGVQYXJ0ID0gYCR7a2V5fSoke259YDtcbiAgICAgIGxldCB2ID0gcGllY2VNYXBbc2ltcGxlUGFydF07XG4gICAgICBpZiAodikge1xuICAgICAgICB2YWxpZCA9IHRydWU7XG4gICAgICAgIHN0ciArPSB2O1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGVuY29kZWRQYXJ0ID0gYCR7c2ltcGxlUGFydH0qYDtcbiAgICAgIHYgPSBwaWVjZU1hcFtlbmNvZGVkUGFydF07XG4gICAgICBpZiAoIXYpIHtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICB2YWxpZCA9IHRydWU7XG4gICAgICBpZiAobiA9PT0gMCkge1xuICAgICAgICBjb25zdCBkZWN2ID0gZGVjb2RlMjMzMUVuY29kaW5nKHYpO1xuICAgICAgICBpZiAoZGVjdikge1xuICAgICAgICAgIHN0ciArPSBkZWN2O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBkZWN2ID0gZGVjb2RlVVJJKHYpO1xuICAgICAgICBzdHIgKz0gZGVjdjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKHZhbGlkKSB7XG4gICAgICBwYXJhbXNba2V5XSA9IHN0cjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gT2JqZWN0LmtleXMocGFyYW1zKS5sZW5ndGhcbiAgICA/IFttZWRpYVR5cGUsIHBhcmFtc11cbiAgICA6IFttZWRpYVR5cGUsIHVuZGVmaW5lZF07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLGlCQUFpQixFQUFFLGtCQUFrQixRQUFRLGFBQWE7QUFFbkU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBbUNDLEdBQ0QsT0FBTyxTQUFTLGVBQ2QsQ0FBUyxFQUN3RDtJQUNqRSxNQUFNLENBQUMsS0FBSyxHQUFHLEVBQUUsS0FBSyxDQUFDO0lBQ3ZCLE1BQU0sWUFBWSxLQUFLLFdBQVcsR0FBRyxJQUFJO0lBRXpDLE1BQU0sU0FBaUMsQ0FBQztJQUN4Qyx3REFBd0Q7SUFDeEQsNkNBQTZDO0lBQzdDLE1BQU0sZUFBZSxJQUFJO0lBRXpCLElBQUksRUFBRSxLQUFLLENBQUMsS0FBSyxNQUFNO0lBQ3ZCLE1BQU8sRUFBRSxNQUFNLENBQUU7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLElBQUksRUFBRSxNQUFNLEtBQUssR0FBRztZQUNsQixLQUFNO1FBQ1IsQ0FBQztRQUNELE1BQU0sQ0FBQyxLQUFLLE9BQU8sS0FBSyxHQUFHLGtCQUFrQjtRQUM3QyxJQUFJLENBQUMsS0FBSztZQUNSLElBQUksS0FBSyxJQUFJLE9BQU8sS0FBSztnQkFFdkIsS0FBTTtZQUNSLENBQUM7WUFDRCxNQUFNLElBQUksVUFBVSw0QkFBNEI7UUFDbEQsQ0FBQztRQUVELElBQUksT0FBTztRQUNYLE1BQU0sQ0FBQyxVQUFVLE1BQU0sR0FBRyxJQUFJLEtBQUssQ0FBQztRQUNwQyxJQUFJLFlBQVksU0FBUyxJQUFJLEVBQUU7WUFDN0IsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLFdBQVc7Z0JBQy9CLGFBQWEsR0FBRyxDQUFDLFVBQVUsQ0FBQztZQUM5QixDQUFDO1lBQ0QsT0FBTyxhQUFhLEdBQUcsQ0FBQztRQUMxQixDQUFDO1FBQ0QsSUFBSSxPQUFPLE1BQU07WUFDZixNQUFNLElBQUksVUFBVSx5QkFBeUI7UUFDL0MsQ0FBQztRQUNELElBQUksQ0FBQyxJQUFJLEdBQUc7UUFDWixJQUFJO0lBQ047SUFFQSx5REFBeUQ7SUFDekQsdURBQXVEO0lBQ3ZELElBQUksTUFBTTtJQUNWLEtBQUssTUFBTSxDQUFDLE1BQUssU0FBUyxJQUFJLGFBQWM7UUFDMUMsTUFBTSxnQkFBZ0IsQ0FBQyxFQUFFLEtBQUksQ0FBQyxDQUFDO1FBQy9CLE1BQU0sS0FBSSxRQUFRLENBQUMsY0FBYztRQUNqQyxJQUFJLElBQUc7WUFDTCxNQUFNLE9BQU8sbUJBQW1CO1lBQ2hDLElBQUksTUFBTTtnQkFDUixNQUFNLENBQUMsS0FBSSxHQUFHO1lBQ2hCLENBQUM7WUFDRCxRQUFTO1FBQ1gsQ0FBQztRQUVELE1BQU07UUFDTixJQUFJLFFBQVEsS0FBSztRQUNqQixJQUFLLElBQUksSUFBSSxJQUFJLElBQUs7WUFDcEIsTUFBTSxhQUFhLENBQUMsRUFBRSxLQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDaEMsSUFBSSxLQUFJLFFBQVEsQ0FBQyxXQUFXO1lBQzVCLElBQUksSUFBRztnQkFDTCxRQUFRLElBQUk7Z0JBQ1osT0FBTztnQkFDUCxRQUFTO1lBQ1gsQ0FBQztZQUNELE1BQU0sY0FBYyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDcEMsS0FBSSxRQUFRLENBQUMsWUFBWTtZQUN6QixJQUFJLENBQUMsSUFBRztnQkFDTixLQUFNO1lBQ1IsQ0FBQztZQUNELFFBQVEsSUFBSTtZQUNaLElBQUksTUFBTSxHQUFHO2dCQUNYLE1BQU0sUUFBTyxtQkFBbUI7Z0JBQ2hDLElBQUksT0FBTTtvQkFDUixPQUFPO2dCQUNULENBQUM7WUFDSCxPQUFPO2dCQUNMLE1BQU0sUUFBTyxVQUFVO2dCQUN2QixPQUFPO1lBQ1QsQ0FBQztRQUNIO1FBQ0EsSUFBSSxPQUFPO1lBQ1QsTUFBTSxDQUFDLEtBQUksR0FBRztRQUNoQixDQUFDO0lBQ0g7SUFFQSxPQUFPLE9BQU8sSUFBSSxDQUFDLFFBQVEsTUFBTSxHQUM3QjtRQUFDO1FBQVc7S0FBTyxHQUNuQjtRQUFDO1FBQVc7S0FBVTtBQUM1QixDQUFDIn0=