// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { parseMediaType } from "./parse_media_type.ts";
import { db } from "./_db.ts";
/**
 * Given a media type or header value, identify the encoding charset. If the
 * charset cannot be determined, the function returns `undefined`.
 *
 * @example
 * ```ts
 * import { getCharset } from "https://deno.land/std@$STD_VERSION/media_types/get_charset.ts";
 *
 * getCharset("text/plain"); // `UTF-8`
 * getCharset("application/foo"); // undefined
 * getCharset("application/news-checkgroups"); // `US-ASCII`
 * getCharset("application/news-checkgroups; charset=UTF-8"); // `UTF-8`
 * ```
 */ export function getCharset(type) {
    try {
        const [mediaType, params] = parseMediaType(type);
        if (params && params["charset"]) {
            return params["charset"];
        }
        const entry = db[mediaType];
        if (entry && entry.charset) {
            return entry.charset;
        }
        if (mediaType.startsWith("text/")) {
            return "UTF-8";
        }
    } catch  {
    // just swallow errors, returning undefined
    }
    return undefined;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMC4wL21lZGlhX3R5cGVzL2dldF9jaGFyc2V0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IHBhcnNlTWVkaWFUeXBlIH0gZnJvbSBcIi4vcGFyc2VfbWVkaWFfdHlwZS50c1wiO1xuaW1wb3J0IHsgdHlwZSBEQkVudHJ5IH0gZnJvbSBcIi4vX3V0aWwudHNcIjtcbmltcG9ydCB7IGRiLCB0eXBlIEtleU9mRGIgfSBmcm9tIFwiLi9fZGIudHNcIjtcblxuLyoqXG4gKiBHaXZlbiBhIG1lZGlhIHR5cGUgb3IgaGVhZGVyIHZhbHVlLCBpZGVudGlmeSB0aGUgZW5jb2RpbmcgY2hhcnNldC4gSWYgdGhlXG4gKiBjaGFyc2V0IGNhbm5vdCBiZSBkZXRlcm1pbmVkLCB0aGUgZnVuY3Rpb24gcmV0dXJucyBgdW5kZWZpbmVkYC5cbiAqXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7IGdldENoYXJzZXQgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9tZWRpYV90eXBlcy9nZXRfY2hhcnNldC50c1wiO1xuICpcbiAqIGdldENoYXJzZXQoXCJ0ZXh0L3BsYWluXCIpOyAvLyBgVVRGLThgXG4gKiBnZXRDaGFyc2V0KFwiYXBwbGljYXRpb24vZm9vXCIpOyAvLyB1bmRlZmluZWRcbiAqIGdldENoYXJzZXQoXCJhcHBsaWNhdGlvbi9uZXdzLWNoZWNrZ3JvdXBzXCIpOyAvLyBgVVMtQVNDSUlgXG4gKiBnZXRDaGFyc2V0KFwiYXBwbGljYXRpb24vbmV3cy1jaGVja2dyb3VwczsgY2hhcnNldD1VVEYtOFwiKTsgLy8gYFVURi04YFxuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRDaGFyc2V0KHR5cGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gIHRyeSB7XG4gICAgY29uc3QgW21lZGlhVHlwZSwgcGFyYW1zXSA9IHBhcnNlTWVkaWFUeXBlKHR5cGUpO1xuICAgIGlmIChwYXJhbXMgJiYgcGFyYW1zW1wiY2hhcnNldFwiXSkge1xuICAgICAgcmV0dXJuIHBhcmFtc1tcImNoYXJzZXRcIl07XG4gICAgfVxuICAgIGNvbnN0IGVudHJ5ID0gZGJbbWVkaWFUeXBlIGFzIEtleU9mRGJdIGFzIERCRW50cnk7XG4gICAgaWYgKGVudHJ5ICYmIGVudHJ5LmNoYXJzZXQpIHtcbiAgICAgIHJldHVybiBlbnRyeS5jaGFyc2V0O1xuICAgIH1cbiAgICBpZiAobWVkaWFUeXBlLnN0YXJ0c1dpdGgoXCJ0ZXh0L1wiKSkge1xuICAgICAgcmV0dXJuIFwiVVRGLThcIjtcbiAgICB9XG4gIH0gY2F0Y2gge1xuICAgIC8vIGp1c3Qgc3dhbGxvdyBlcnJvcnMsIHJldHVybmluZyB1bmRlZmluZWRcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSxxQ0FBcUM7QUFFckMsU0FBUyxjQUFjLFFBQVEsd0JBQXdCO0FBRXZELFNBQVMsRUFBRSxRQUFzQixXQUFXO0FBRTVDOzs7Ozs7Ozs7Ozs7O0NBYUMsR0FDRCxPQUFPLFNBQVMsV0FBVyxJQUFZLEVBQXNCO0lBQzNELElBQUk7UUFDRixNQUFNLENBQUMsV0FBVyxPQUFPLEdBQUcsZUFBZTtRQUMzQyxJQUFJLFVBQVUsTUFBTSxDQUFDLFVBQVUsRUFBRTtZQUMvQixPQUFPLE1BQU0sQ0FBQyxVQUFVO1FBQzFCLENBQUM7UUFDRCxNQUFNLFFBQVEsRUFBRSxDQUFDLFVBQXFCO1FBQ3RDLElBQUksU0FBUyxNQUFNLE9BQU8sRUFBRTtZQUMxQixPQUFPLE1BQU0sT0FBTztRQUN0QixDQUFDO1FBQ0QsSUFBSSxVQUFVLFVBQVUsQ0FBQyxVQUFVO1lBQ2pDLE9BQU87UUFDVCxDQUFDO0lBQ0gsRUFBRSxPQUFNO0lBQ04sMkNBQTJDO0lBQzdDO0lBQ0EsT0FBTztBQUNULENBQUMifQ==