/*!
 * Adapted from koa-send at https://github.com/koajs/send and which is licensed
 * with the MIT license.
 */ import { calculate, ifNoneMatch } from "./etag.ts";
import { basename, createHttpError, extname, LimitedReader, parse, readAll, Status } from "./deps.ts";
import { ifRange, MultiPartStream, parseRange } from "./range.ts";
import { assert, decodeComponent, getBoundary, resolvePath } from "./util.ts";
const MAXBUFFER_DEFAULT = 1_048_576; // 1MiB;
// this will be lazily set as it needs to be done asynchronously and we want to
// avoid top level await
let boundary;
function isHidden(path) {
    const pathArr = path.split("/");
    for (const segment of pathArr){
        if (segment[0] === "." && segment !== "." && segment !== "..") {
            return true;
        }
        return false;
    }
}
async function exists(path) {
    try {
        return (await Deno.stat(path)).isFile;
    } catch  {
        return false;
    }
}
async function getEntity(path, mtime, stats, maxbuffer, response) {
    let body;
    let entity;
    const file = await Deno.open(path, {
        read: true
    });
    if (stats.size < maxbuffer) {
        const buffer = await readAll(file);
        file.close();
        body = entity = buffer;
    } else {
        response.addResource(file.rid);
        body = file;
        entity = {
            mtime: new Date(mtime),
            size: stats.size
        };
    }
    return [
        body,
        entity
    ];
}
async function sendRange(response, body, range, size) {
    const ranges = parseRange(range, size);
    if (ranges.length === 0) {
        throw createHttpError(Status.RequestedRangeNotSatisfiable);
    }
    response.status = Status.PartialContent;
    if (ranges.length === 1) {
        const [byteRange] = ranges;
        response.headers.set("Content-Range", `bytes ${byteRange.start}-${byteRange.end}/${size}`);
        if (body instanceof Uint8Array) {
            response.body = body.slice(byteRange.start, byteRange.end + 1);
        } else {
            await body.seek(byteRange.start, Deno.SeekMode.Start);
            response.body = new LimitedReader(body, byteRange.end - byteRange.start + 1);
        }
    } else {
        assert(response.type);
        if (!boundary) {
            boundary = await getBoundary();
        }
        response.headers.set("content-type", `multipart/byteranges; boundary=${boundary}`);
        const multipartBody = new MultiPartStream(body, response.type, ranges, size, boundary);
        response.body = multipartBody;
    }
}
/** Asynchronously fulfill a response with a file from the local file
 * system.
 *
 * Requires Deno read permission for the `root` directory. */ export async function send(// deno-lint-ignore no-explicit-any
{ request , response  }, path, options = {
    root: ""
}) {
    const { brotli =true , contentTypes ={} , extensions , format =true , gzip =true , hidden =false , immutable =false , index , maxbuffer =MAXBUFFER_DEFAULT , maxage =0 , root  } = options;
    const trailingSlash = path[path.length - 1] === "/";
    path = decodeComponent(path.substr(parse(path).root.length));
    if (index && trailingSlash) {
        path += index;
    }
    if (!hidden && isHidden(path)) {
        throw createHttpError(403);
    }
    path = resolvePath(root, path);
    let encodingExt = "";
    if (brotli && request.acceptsEncodings("br", "identity") === "br" && await exists(`${path}.br`)) {
        path = `${path}.br`;
        response.headers.set("Content-Encoding", "br");
        response.headers.delete("Content-Length");
        encodingExt = ".br";
    } else if (gzip && request.acceptsEncodings("gzip", "identity") === "gzip" && await exists(`${path}.gz`)) {
        path = `${path}.gz`;
        response.headers.set("Content-Encoding", "gzip");
        response.headers.delete("Content-Length");
        encodingExt = ".gz";
    }
    if (extensions && !/\.[^/]*$/.exec(path)) {
        for (let ext of extensions){
            if (!/^\./.exec(ext)) {
                ext = `.${ext}`;
            }
            if (await exists(`${path}${ext}`)) {
                path += ext;
                break;
            }
        }
    }
    let stats;
    try {
        stats = await Deno.stat(path);
        if (stats.isDirectory) {
            if (format && index) {
                path += `/${index}`;
                stats = await Deno.stat(path);
            } else {
                return;
            }
        }
    } catch (err) {
        if (err instanceof Deno.errors.NotFound) {
            throw createHttpError(404, err.message);
        }
        // TODO(@kitsonk) remove when https://github.com/denoland/node_deno_shims/issues/87 resolved
        if (err instanceof Error && err.message.startsWith("ENOENT:")) {
            throw createHttpError(404, err.message);
        }
        throw createHttpError(500, err instanceof Error ? err.message : "[non-error thrown]");
    }
    let mtime = null;
    if (response.headers.has("Last-Modified")) {
        mtime = new Date(response.headers.get("Last-Modified")).getTime();
    } else if (stats.mtime) {
        // Round down to second because it's the precision of the UTC string.
        mtime = stats.mtime.getTime();
        mtime -= mtime % 1000;
        response.headers.set("Last-Modified", new Date(mtime).toUTCString());
    }
    if (!response.headers.has("Cache-Control")) {
        const directives = [
            `max-age=${maxage / 1000 | 0}`
        ];
        if (immutable) {
            directives.push("immutable");
        }
        response.headers.set("Cache-Control", directives.join(","));
    }
    if (!response.type) {
        response.type = encodingExt !== "" ? extname(basename(path, encodingExt)) : contentTypes[extname(path)] ?? extname(path);
    }
    let entity = null;
    let body = null;
    if (request.headers.has("If-None-Match") && mtime) {
        [body, entity] = await getEntity(path, mtime, stats, maxbuffer, response);
        const etag = await calculate(entity);
        if (etag && !await ifNoneMatch(request.headers.get("If-None-Match"), etag)) {
            response.headers.set("ETag", etag);
            response.status = 304;
            return path;
        }
    }
    if (request.headers.has("If-Modified-Since") && mtime) {
        const ifModifiedSince = new Date(request.headers.get("If-Modified-Since"));
        if (ifModifiedSince.getTime() >= mtime) {
            response.status = 304;
            return path;
        }
    }
    if (!body || !entity) {
        [body, entity] = await getEntity(path, mtime ?? 0, stats, maxbuffer, response);
    }
    if (request.headers.has("If-Range") && mtime && await ifRange(request.headers.get("If-Range"), mtime, entity) && request.headers.has("Range")) {
        await sendRange(response, body, request.headers.get("Range"), stats.size);
        return path;
    }
    if (request.headers.has("Range")) {
        await sendRange(response, body, request.headers.get("Range"), stats.size);
        return path;
    }
    response.body = body;
    if (!response.headers.has("ETag")) {
        const etag1 = await calculate(entity);
        if (etag1) {
            response.headers.set("ETag", etag1);
        }
    }
    if (!response.headers.has("Accept-Ranges")) {
        response.headers.set("Accept-Ranges", "bytes");
    }
    return path;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvb2FrQHYxMi42LjEvc2VuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIEFkYXB0ZWQgZnJvbSBrb2Etc2VuZCBhdCBodHRwczovL2dpdGh1Yi5jb20va29hanMvc2VuZCBhbmQgd2hpY2ggaXMgbGljZW5zZWRcbiAqIHdpdGggdGhlIE1JVCBsaWNlbnNlLlxuICovXG5cbmltcG9ydCB0eXBlIHsgQ29udGV4dCB9IGZyb20gXCIuL2NvbnRleHQudHNcIjtcbmltcG9ydCB7IGNhbGN1bGF0ZSwgRmlsZUluZm8sIGlmTm9uZU1hdGNoIH0gZnJvbSBcIi4vZXRhZy50c1wiO1xuaW1wb3J0IHtcbiAgYmFzZW5hbWUsXG4gIGNyZWF0ZUh0dHBFcnJvcixcbiAgZXh0bmFtZSxcbiAgTGltaXRlZFJlYWRlcixcbiAgcGFyc2UsXG4gIHJlYWRBbGwsXG4gIFN0YXR1cyxcbn0gZnJvbSBcIi4vZGVwcy50c1wiO1xuaW1wb3J0IHsgaWZSYW5nZSwgTXVsdGlQYXJ0U3RyZWFtLCBwYXJzZVJhbmdlIH0gZnJvbSBcIi4vcmFuZ2UudHNcIjtcbmltcG9ydCB0eXBlIHsgUmVzcG9uc2UgfSBmcm9tIFwiLi9yZXNwb25zZS50c1wiO1xuaW1wb3J0IHsgYXNzZXJ0LCBkZWNvZGVDb21wb25lbnQsIGdldEJvdW5kYXJ5LCByZXNvbHZlUGF0aCB9IGZyb20gXCIuL3V0aWwudHNcIjtcblxuY29uc3QgTUFYQlVGRkVSX0RFRkFVTFQgPSAxXzA0OF81NzY7IC8vIDFNaUI7XG5cbi8vIHRoaXMgd2lsbCBiZSBsYXppbHkgc2V0IGFzIGl0IG5lZWRzIHRvIGJlIGRvbmUgYXN5bmNocm9ub3VzbHkgYW5kIHdlIHdhbnQgdG9cbi8vIGF2b2lkIHRvcCBsZXZlbCBhd2FpdFxubGV0IGJvdW5kYXJ5OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VuZE9wdGlvbnMge1xuICAvKiogVHJ5IHRvIHNlcnZlIHRoZSBicm90bGkgdmVyc2lvbiBvZiBhIGZpbGUgYXV0b21hdGljYWxseSB3aGVuIGJyb3RsaSBpc1xuICAgKiBzdXBwb3J0ZWQgYnkgYSBjbGllbnQgYW5kIGlmIHRoZSByZXF1ZXN0ZWQgZmlsZSB3aXRoIGAuYnJgIGV4dGVuc2lvblxuICAgKiBleGlzdHMuIChkZWZhdWx0cyB0byBgdHJ1ZWApICovXG4gIGJyb3RsaT86IGJvb2xlYW47XG5cbiAgLyoqIEEgcmVjb3JkIG9mIGV4dGVuc2lvbnMgYW5kIGNvbnRlbnQgdHlwZXMgdGhhdCBzaG91bGQgYmUgdXNlZCB3aGVuXG4gICAqIGRldGVybWluaW5nIHRoZSBjb250ZW50IG9mIGEgZmlsZSBiZWluZyBzZXJ2ZWQuIEJ5IGRlZmF1bHQsIHRoZVxuICAgKiBbYG1lZGlhX3R5cGVgXShodHRwczovL2dpdGh1Yi5jb20vb2Frc2VydmVyL21lZGlhX3R5cGVzLykgZGF0YWJhc2UgaXMgdXNlZFxuICAgKiB0byBtYXAgYW4gZXh0ZW5zaW9uIHRvIHRoZSBzZXJ2ZWQgY29udGVudC10eXBlLiBUaGUga2V5cyBvZiB0aGUgbWFwIGFyZVxuICAgKiBleHRlbnNpb25zLCBhbmQgdmFsdWVzIGFyZSB0aGUgY29udGVudCB0eXBlcyB0byB1c2UuIFRoZSBjb250ZW50IHR5cGUgY2FuXG4gICAqIGJlIGEgcGFydGlhbCBjb250ZW50IHR5cGUsIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gYSBmdWxsIGNvbnRlbnQgdHlwZVxuICAgKiBoZWFkZXIuXG4gICAqXG4gICAqIEFueSBleHRlbnNpb25zIG1hdGNoZWQgd2lsbCBvdmVycmlkZSB0aGUgZGVmYXVsdCBiZWhhdmlvci4gS2V5IHNob3VsZFxuICAgKiBpbmNsdWRlIHRoZSBsZWFkaW5nIGRvdCAoZS5nLiBgLmV4dGAgaW5zdGVhZCBvZiBqdXN0IGBleHRgKS5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgdHNcbiAgICogYXBwLnVzZSgoY3R4KSA9PiB7XG4gICAqICAgcmV0dXJuIHNlbmQoY3R4LCBjdHgucmVxdWVzdC51cmwucGF0aG5hbWUsIHtcbiAgICogICAgIGNvbnRlbnRUeXBlczoge1xuICAgKiAgICAgICBcIi5pbXBvcnRtYXBcIjogXCJhcHBsaWNhdGlvbi9pbXBvcnRtYXAranNvblwiXG4gICAqICAgICB9LFxuICAgKiAgICAgcm9vdDogXCIuXCIsXG4gICAqICAgfSlcbiAgICogfSk7XG4gICAqIGBgYFxuICAgKi9cbiAgY29udGVudFR5cGVzPzogUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcblxuICAvKiogVHJ5IHRvIG1hdGNoIGV4dGVuc2lvbnMgZnJvbSBwYXNzZWQgYXJyYXkgdG8gc2VhcmNoIGZvciBmaWxlIHdoZW4gbm9cbiAgICogZXh0ZW5zaW9uIGlzIHN1ZmZpY2VkIGluIFVSTC4gRmlyc3QgZm91bmQgaXMgc2VydmVkLiAoZGVmYXVsdHMgdG9cbiAgICogYHVuZGVmaW5lZGApICovXG4gIGV4dGVuc2lvbnM/OiBzdHJpbmdbXTtcblxuICAvKiogSWYgYHRydWVgLCBmb3JtYXQgdGhlIHBhdGggdG8gc2VydmUgc3RhdGljIGZpbGUgc2VydmVycyBhbmQgbm90IHJlcXVpcmUgYVxuICAgKiB0cmFpbGluZyBzbGFzaCBmb3IgZGlyZWN0b3JpZXMsIHNvIHRoYXQgeW91IGNhbiBkbyBib3RoIGAvZGlyZWN0b3J5YCBhbmRcbiAgICogYC9kaXJlY3RvcnkvYC4gKGRlZmF1bHRzIHRvIGB0cnVlYCkgKi9cbiAgZm9ybWF0PzogYm9vbGVhbjtcblxuICAvKiogVHJ5IHRvIHNlcnZlIHRoZSBnemlwcGVkIHZlcnNpb24gb2YgYSBmaWxlIGF1dG9tYXRpY2FsbHkgd2hlbiBnemlwIGlzXG4gICAqIHN1cHBvcnRlZCBieSBhIGNsaWVudCBhbmQgaWYgdGhlIHJlcXVlc3RlZCBmaWxlIHdpdGggYC5nemAgZXh0ZW5zaW9uXG4gICAqIGV4aXN0cy4gKGRlZmF1bHRzIHRvIGB0cnVlYCkuICovXG4gIGd6aXA/OiBib29sZWFuO1xuXG4gIC8qKiBBbGxvdyB0cmFuc2ZlciBvZiBoaWRkZW4gZmlsZXMuIChkZWZhdWx0cyB0byBgZmFsc2VgKSAqL1xuICBoaWRkZW4/OiBib29sZWFuO1xuXG4gIC8qKiBUZWxsIHRoZSBicm93c2VyIHRoZSByZXNvdXJjZSBpcyBpbW11dGFibGUgYW5kIGNhbiBiZSBjYWNoZWRcbiAgICogaW5kZWZpbml0ZWx5LiAoZGVmYXVsdHMgdG8gYGZhbHNlYCkgKi9cbiAgaW1tdXRhYmxlPzogYm9vbGVhbjtcblxuICAvKiogTmFtZSBvZiB0aGUgaW5kZXggZmlsZSB0byBzZXJ2ZSBhdXRvbWF0aWNhbGx5IHdoZW4gdmlzaXRpbmcgdGhlIHJvb3RcbiAgICogbG9jYXRpb24uIChkZWZhdWx0cyB0byBub25lKSAqL1xuICBpbmRleD86IHN0cmluZztcblxuICAvKiogQnJvd3NlciBjYWNoZSBtYXgtYWdlIGluIG1pbGxpc2Vjb25kcy4gKGRlZmF1bHRzIHRvIGAwYCkgKi9cbiAgbWF4YWdlPzogbnVtYmVyO1xuXG4gIC8qKiBBIHNpemUgaW4gYnl0ZXMgd2hlcmUgaWYgdGhlIGZpbGUgaXMgbGVzcyB0aGFuIHRoaXMgc2l6ZSwgdGhlIGZpbGUgd2lsbFxuICAgKiBiZSByZWFkIGludG8gbWVtb3J5IGJ5IHNlbmQgaW5zdGVhZCBvZiByZXR1cm5pbmcgYSBmaWxlIGhhbmRsZS4gIEZpbGVzIGxlc3NcbiAgICogdGhhbiB0aGUgYnl0ZSBzaXplIHdpbGwgc2VuZCBhbiBcInN0cm9uZ1wiIGBFVGFnYCBoZWFkZXIgd2hpbGUgdGhvc2UgbGFyZ2VyXG4gICAqIHRoYW4gdGhlIGJ5dGVzIHNpemUgd2lsbCBvbmx5IGJlIGFibGUgdG8gc2VuZCBhIFwid2Vha1wiIGBFVGFnYCBoZWFkZXIgKGFzXG4gICAqIHRoZXkgY2Fubm90IGhhc2ggdGhlIGNvbnRlbnRzIG9mIHRoZSBmaWxlKS4gKGRlZmF1bHRzIHRvIDFNaUIpXG4gICAqL1xuICBtYXhidWZmZXI/OiBudW1iZXI7XG5cbiAgLyoqIFJvb3QgZGlyZWN0b3J5IHRvIHJlc3RyaWN0IGZpbGUgYWNjZXNzLiAqL1xuICByb290OiBzdHJpbmc7XG59XG5cbmZ1bmN0aW9uIGlzSGlkZGVuKHBhdGg6IHN0cmluZykge1xuICBjb25zdCBwYXRoQXJyID0gcGF0aC5zcGxpdChcIi9cIik7XG4gIGZvciAoY29uc3Qgc2VnbWVudCBvZiBwYXRoQXJyKSB7XG4gICAgaWYgKHNlZ21lbnRbMF0gPT09IFwiLlwiICYmIHNlZ21lbnQgIT09IFwiLlwiICYmIHNlZ21lbnQgIT09IFwiLi5cIikge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5hc3luYyBmdW5jdGlvbiBleGlzdHMocGF0aDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIChhd2FpdCBEZW5vLnN0YXQocGF0aCkpLmlzRmlsZTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEVudGl0eShcbiAgcGF0aDogc3RyaW5nLFxuICBtdGltZTogbnVtYmVyLFxuICBzdGF0czogRGVuby5GaWxlSW5mbyxcbiAgbWF4YnVmZmVyOiBudW1iZXIsXG4gIHJlc3BvbnNlOiBSZXNwb25zZSxcbik6IFByb21pc2U8W1VpbnQ4QXJyYXkgfCBEZW5vLkZzRmlsZSwgVWludDhBcnJheSB8IEZpbGVJbmZvXT4ge1xuICBsZXQgYm9keTogVWludDhBcnJheSB8IERlbm8uRnNGaWxlO1xuICBsZXQgZW50aXR5OiBVaW50OEFycmF5IHwgRmlsZUluZm87XG4gIGNvbnN0IGZpbGUgPSBhd2FpdCBEZW5vLm9wZW4ocGF0aCwgeyByZWFkOiB0cnVlIH0pO1xuICBpZiAoc3RhdHMuc2l6ZSA8IG1heGJ1ZmZlcikge1xuICAgIGNvbnN0IGJ1ZmZlciA9IGF3YWl0IHJlYWRBbGwoZmlsZSk7XG4gICAgZmlsZS5jbG9zZSgpO1xuICAgIGJvZHkgPSBlbnRpdHkgPSBidWZmZXI7XG4gIH0gZWxzZSB7XG4gICAgcmVzcG9uc2UuYWRkUmVzb3VyY2UoZmlsZS5yaWQpO1xuICAgIGJvZHkgPSBmaWxlO1xuICAgIGVudGl0eSA9IHtcbiAgICAgIG10aW1lOiBuZXcgRGF0ZShtdGltZSEpLFxuICAgICAgc2l6ZTogc3RhdHMuc2l6ZSxcbiAgICB9O1xuICB9XG4gIHJldHVybiBbYm9keSwgZW50aXR5XTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gc2VuZFJhbmdlKFxuICByZXNwb25zZTogUmVzcG9uc2UsXG4gIGJvZHk6IFVpbnQ4QXJyYXkgfCBEZW5vLkZzRmlsZSxcbiAgcmFuZ2U6IHN0cmluZyxcbiAgc2l6ZTogbnVtYmVyLFxuKSB7XG4gIGNvbnN0IHJhbmdlcyA9IHBhcnNlUmFuZ2UocmFuZ2UsIHNpemUpO1xuICBpZiAocmFuZ2VzLmxlbmd0aCA9PT0gMCkge1xuICAgIHRocm93IGNyZWF0ZUh0dHBFcnJvcihTdGF0dXMuUmVxdWVzdGVkUmFuZ2VOb3RTYXRpc2ZpYWJsZSk7XG4gIH1cbiAgcmVzcG9uc2Uuc3RhdHVzID0gU3RhdHVzLlBhcnRpYWxDb250ZW50O1xuICBpZiAocmFuZ2VzLmxlbmd0aCA9PT0gMSkge1xuICAgIGNvbnN0IFtieXRlUmFuZ2VdID0gcmFuZ2VzO1xuICAgIHJlc3BvbnNlLmhlYWRlcnMuc2V0KFxuICAgICAgXCJDb250ZW50LVJhbmdlXCIsXG4gICAgICBgYnl0ZXMgJHtieXRlUmFuZ2Uuc3RhcnR9LSR7Ynl0ZVJhbmdlLmVuZH0vJHtzaXplfWAsXG4gICAgKTtcbiAgICBpZiAoYm9keSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgIHJlc3BvbnNlLmJvZHkgPSBib2R5LnNsaWNlKGJ5dGVSYW5nZS5zdGFydCwgYnl0ZVJhbmdlLmVuZCArIDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCBib2R5LnNlZWsoYnl0ZVJhbmdlLnN0YXJ0LCBEZW5vLlNlZWtNb2RlLlN0YXJ0KTtcbiAgICAgIHJlc3BvbnNlLmJvZHkgPSBuZXcgTGltaXRlZFJlYWRlcihcbiAgICAgICAgYm9keSxcbiAgICAgICAgYnl0ZVJhbmdlLmVuZCAtIGJ5dGVSYW5nZS5zdGFydCArIDEsXG4gICAgICApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBhc3NlcnQocmVzcG9uc2UudHlwZSk7XG4gICAgaWYgKCFib3VuZGFyeSkge1xuICAgICAgYm91bmRhcnkgPSBhd2FpdCBnZXRCb3VuZGFyeSgpO1xuICAgIH1cbiAgICByZXNwb25zZS5oZWFkZXJzLnNldChcbiAgICAgIFwiY29udGVudC10eXBlXCIsXG4gICAgICBgbXVsdGlwYXJ0L2J5dGVyYW5nZXM7IGJvdW5kYXJ5PSR7Ym91bmRhcnl9YCxcbiAgICApO1xuICAgIGNvbnN0IG11bHRpcGFydEJvZHkgPSBuZXcgTXVsdGlQYXJ0U3RyZWFtKFxuICAgICAgYm9keSxcbiAgICAgIHJlc3BvbnNlLnR5cGUsXG4gICAgICByYW5nZXMsXG4gICAgICBzaXplLFxuICAgICAgYm91bmRhcnksXG4gICAgKTtcbiAgICByZXNwb25zZS5ib2R5ID0gbXVsdGlwYXJ0Qm9keTtcbiAgfVxufVxuXG4vKiogQXN5bmNocm9ub3VzbHkgZnVsZmlsbCBhIHJlc3BvbnNlIHdpdGggYSBmaWxlIGZyb20gdGhlIGxvY2FsIGZpbGVcbiAqIHN5c3RlbS5cbiAqXG4gKiBSZXF1aXJlcyBEZW5vIHJlYWQgcGVybWlzc2lvbiBmb3IgdGhlIGByb290YCBkaXJlY3RvcnkuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2VuZChcbiAgLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbiAgeyByZXF1ZXN0LCByZXNwb25zZSB9OiBDb250ZXh0PGFueT4sXG4gIHBhdGg6IHN0cmluZyxcbiAgb3B0aW9uczogU2VuZE9wdGlvbnMgPSB7IHJvb3Q6IFwiXCIgfSxcbik6IFByb21pc2U8c3RyaW5nIHwgdW5kZWZpbmVkPiB7XG4gIGNvbnN0IHtcbiAgICBicm90bGkgPSB0cnVlLFxuICAgIGNvbnRlbnRUeXBlcyA9IHt9LFxuICAgIGV4dGVuc2lvbnMsXG4gICAgZm9ybWF0ID0gdHJ1ZSxcbiAgICBnemlwID0gdHJ1ZSxcbiAgICBoaWRkZW4gPSBmYWxzZSxcbiAgICBpbW11dGFibGUgPSBmYWxzZSxcbiAgICBpbmRleCxcbiAgICBtYXhidWZmZXIgPSBNQVhCVUZGRVJfREVGQVVMVCxcbiAgICBtYXhhZ2UgPSAwLFxuICAgIHJvb3QsXG4gIH0gPSBvcHRpb25zO1xuICBjb25zdCB0cmFpbGluZ1NsYXNoID0gcGF0aFtwYXRoLmxlbmd0aCAtIDFdID09PSBcIi9cIjtcbiAgcGF0aCA9IGRlY29kZUNvbXBvbmVudChwYXRoLnN1YnN0cihwYXJzZShwYXRoKS5yb290Lmxlbmd0aCkpO1xuICBpZiAoaW5kZXggJiYgdHJhaWxpbmdTbGFzaCkge1xuICAgIHBhdGggKz0gaW5kZXg7XG4gIH1cblxuICBpZiAoIWhpZGRlbiAmJiBpc0hpZGRlbihwYXRoKSkge1xuICAgIHRocm93IGNyZWF0ZUh0dHBFcnJvcig0MDMpO1xuICB9XG5cbiAgcGF0aCA9IHJlc29sdmVQYXRoKHJvb3QsIHBhdGgpO1xuXG4gIGxldCBlbmNvZGluZ0V4dCA9IFwiXCI7XG4gIGlmIChcbiAgICBicm90bGkgJiZcbiAgICByZXF1ZXN0LmFjY2VwdHNFbmNvZGluZ3MoXCJiclwiLCBcImlkZW50aXR5XCIpID09PSBcImJyXCIgJiZcbiAgICAoYXdhaXQgZXhpc3RzKGAke3BhdGh9LmJyYCkpXG4gICkge1xuICAgIHBhdGggPSBgJHtwYXRofS5icmA7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoXCJDb250ZW50LUVuY29kaW5nXCIsIFwiYnJcIik7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5kZWxldGUoXCJDb250ZW50LUxlbmd0aFwiKTtcbiAgICBlbmNvZGluZ0V4dCA9IFwiLmJyXCI7XG4gIH0gZWxzZSBpZiAoXG4gICAgZ3ppcCAmJlxuICAgIHJlcXVlc3QuYWNjZXB0c0VuY29kaW5ncyhcImd6aXBcIiwgXCJpZGVudGl0eVwiKSA9PT0gXCJnemlwXCIgJiZcbiAgICAoYXdhaXQgZXhpc3RzKGAke3BhdGh9Lmd6YCkpXG4gICkge1xuICAgIHBhdGggPSBgJHtwYXRofS5nemA7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoXCJDb250ZW50LUVuY29kaW5nXCIsIFwiZ3ppcFwiKTtcbiAgICByZXNwb25zZS5oZWFkZXJzLmRlbGV0ZShcIkNvbnRlbnQtTGVuZ3RoXCIpO1xuICAgIGVuY29kaW5nRXh0ID0gXCIuZ3pcIjtcbiAgfVxuXG4gIGlmIChleHRlbnNpb25zICYmICEvXFwuW14vXSokLy5leGVjKHBhdGgpKSB7XG4gICAgZm9yIChsZXQgZXh0IG9mIGV4dGVuc2lvbnMpIHtcbiAgICAgIGlmICghL15cXC4vLmV4ZWMoZXh0KSkge1xuICAgICAgICBleHQgPSBgLiR7ZXh0fWA7XG4gICAgICB9XG4gICAgICBpZiAoYXdhaXQgZXhpc3RzKGAke3BhdGh9JHtleHR9YCkpIHtcbiAgICAgICAgcGF0aCArPSBleHQ7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGxldCBzdGF0czogRGVuby5GaWxlSW5mbztcbiAgdHJ5IHtcbiAgICBzdGF0cyA9IGF3YWl0IERlbm8uc3RhdChwYXRoKTtcblxuICAgIGlmIChzdGF0cy5pc0RpcmVjdG9yeSkge1xuICAgICAgaWYgKGZvcm1hdCAmJiBpbmRleCkge1xuICAgICAgICBwYXRoICs9IGAvJHtpbmRleH1gO1xuICAgICAgICBzdGF0cyA9IGF3YWl0IERlbm8uc3RhdChwYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gIH0gY2F0Y2ggKGVycikge1xuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkge1xuICAgICAgdGhyb3cgY3JlYXRlSHR0cEVycm9yKDQwNCwgZXJyLm1lc3NhZ2UpO1xuICAgIH1cbiAgICAvLyBUT0RPKEBraXRzb25rKSByZW1vdmUgd2hlbiBodHRwczovL2dpdGh1Yi5jb20vZGVub2xhbmQvbm9kZV9kZW5vX3NoaW1zL2lzc3Vlcy84NyByZXNvbHZlZFxuICAgIGlmIChlcnIgaW5zdGFuY2VvZiBFcnJvciAmJiBlcnIubWVzc2FnZS5zdGFydHNXaXRoKFwiRU5PRU5UOlwiKSkge1xuICAgICAgdGhyb3cgY3JlYXRlSHR0cEVycm9yKDQwNCwgZXJyLm1lc3NhZ2UpO1xuICAgIH1cbiAgICB0aHJvdyBjcmVhdGVIdHRwRXJyb3IoXG4gICAgICA1MDAsXG4gICAgICBlcnIgaW5zdGFuY2VvZiBFcnJvciA/IGVyci5tZXNzYWdlIDogXCJbbm9uLWVycm9yIHRocm93bl1cIixcbiAgICApO1xuICB9XG5cbiAgbGV0IG10aW1lOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgaWYgKHJlc3BvbnNlLmhlYWRlcnMuaGFzKFwiTGFzdC1Nb2RpZmllZFwiKSkge1xuICAgIG10aW1lID0gbmV3IERhdGUocmVzcG9uc2UuaGVhZGVycy5nZXQoXCJMYXN0LU1vZGlmaWVkXCIpISkuZ2V0VGltZSgpO1xuICB9IGVsc2UgaWYgKHN0YXRzLm10aW1lKSB7XG4gICAgLy8gUm91bmQgZG93biB0byBzZWNvbmQgYmVjYXVzZSBpdCdzIHRoZSBwcmVjaXNpb24gb2YgdGhlIFVUQyBzdHJpbmcuXG4gICAgbXRpbWUgPSBzdGF0cy5tdGltZS5nZXRUaW1lKCk7XG4gICAgbXRpbWUgLT0gbXRpbWUgJSAxMDAwO1xuICAgIHJlc3BvbnNlLmhlYWRlcnMuc2V0KFwiTGFzdC1Nb2RpZmllZFwiLCBuZXcgRGF0ZShtdGltZSkudG9VVENTdHJpbmcoKSk7XG4gIH1cblxuICBpZiAoIXJlc3BvbnNlLmhlYWRlcnMuaGFzKFwiQ2FjaGUtQ29udHJvbFwiKSkge1xuICAgIGNvbnN0IGRpcmVjdGl2ZXMgPSBbYG1heC1hZ2U9JHsobWF4YWdlIC8gMTAwMCkgfCAwfWBdO1xuICAgIGlmIChpbW11dGFibGUpIHtcbiAgICAgIGRpcmVjdGl2ZXMucHVzaChcImltbXV0YWJsZVwiKTtcbiAgICB9XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoXCJDYWNoZS1Db250cm9sXCIsIGRpcmVjdGl2ZXMuam9pbihcIixcIikpO1xuICB9XG4gIGlmICghcmVzcG9uc2UudHlwZSkge1xuICAgIHJlc3BvbnNlLnR5cGUgPSBlbmNvZGluZ0V4dCAhPT0gXCJcIlxuICAgICAgPyBleHRuYW1lKGJhc2VuYW1lKHBhdGgsIGVuY29kaW5nRXh0KSlcbiAgICAgIDogY29udGVudFR5cGVzW2V4dG5hbWUocGF0aCldID8/IGV4dG5hbWUocGF0aCk7XG4gIH1cblxuICBsZXQgZW50aXR5OiBVaW50OEFycmF5IHwgRmlsZUluZm8gfCBudWxsID0gbnVsbDtcbiAgbGV0IGJvZHk6IFVpbnQ4QXJyYXkgfCBEZW5vLkZzRmlsZSB8IG51bGwgPSBudWxsO1xuXG4gIGlmIChyZXF1ZXN0LmhlYWRlcnMuaGFzKFwiSWYtTm9uZS1NYXRjaFwiKSAmJiBtdGltZSkge1xuICAgIFtib2R5LCBlbnRpdHldID0gYXdhaXQgZ2V0RW50aXR5KHBhdGgsIG10aW1lLCBzdGF0cywgbWF4YnVmZmVyLCByZXNwb25zZSk7XG4gICAgY29uc3QgZXRhZyA9IGF3YWl0IGNhbGN1bGF0ZShlbnRpdHkpO1xuICAgIGlmIChcbiAgICAgIGV0YWcgJiYgKCFhd2FpdCBpZk5vbmVNYXRjaChyZXF1ZXN0LmhlYWRlcnMuZ2V0KFwiSWYtTm9uZS1NYXRjaFwiKSEsIGV0YWcpKVxuICAgICkge1xuICAgICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoXCJFVGFnXCIsIGV0YWcpO1xuICAgICAgcmVzcG9uc2Uuc3RhdHVzID0gMzA0O1xuICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuICB9XG5cbiAgaWYgKHJlcXVlc3QuaGVhZGVycy5oYXMoXCJJZi1Nb2RpZmllZC1TaW5jZVwiKSAmJiBtdGltZSkge1xuICAgIGNvbnN0IGlmTW9kaWZpZWRTaW5jZSA9IG5ldyBEYXRlKHJlcXVlc3QuaGVhZGVycy5nZXQoXCJJZi1Nb2RpZmllZC1TaW5jZVwiKSEpO1xuICAgIGlmIChpZk1vZGlmaWVkU2luY2UuZ2V0VGltZSgpID49IG10aW1lKSB7XG4gICAgICByZXNwb25zZS5zdGF0dXMgPSAzMDQ7XG4gICAgICByZXR1cm4gcGF0aDtcbiAgICB9XG4gIH1cblxuICBpZiAoIWJvZHkgfHwgIWVudGl0eSkge1xuICAgIFtib2R5LCBlbnRpdHldID0gYXdhaXQgZ2V0RW50aXR5KFxuICAgICAgcGF0aCxcbiAgICAgIG10aW1lID8/IDAsXG4gICAgICBzdGF0cyxcbiAgICAgIG1heGJ1ZmZlcixcbiAgICAgIHJlc3BvbnNlLFxuICAgICk7XG4gIH1cblxuICBpZiAoXG4gICAgcmVxdWVzdC5oZWFkZXJzLmhhcyhcIklmLVJhbmdlXCIpICYmIG10aW1lICYmXG4gICAgYXdhaXQgaWZSYW5nZShyZXF1ZXN0LmhlYWRlcnMuZ2V0KFwiSWYtUmFuZ2VcIikhLCBtdGltZSwgZW50aXR5KSAmJlxuICAgIHJlcXVlc3QuaGVhZGVycy5oYXMoXCJSYW5nZVwiKVxuICApIHtcbiAgICBhd2FpdCBzZW5kUmFuZ2UocmVzcG9uc2UsIGJvZHksIHJlcXVlc3QuaGVhZGVycy5nZXQoXCJSYW5nZVwiKSEsIHN0YXRzLnNpemUpO1xuICAgIHJldHVybiBwYXRoO1xuICB9XG5cbiAgaWYgKHJlcXVlc3QuaGVhZGVycy5oYXMoXCJSYW5nZVwiKSkge1xuICAgIGF3YWl0IHNlbmRSYW5nZShyZXNwb25zZSwgYm9keSwgcmVxdWVzdC5oZWFkZXJzLmdldChcIlJhbmdlXCIpISwgc3RhdHMuc2l6ZSk7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICByZXNwb25zZS5ib2R5ID0gYm9keTtcblxuICBpZiAoIXJlc3BvbnNlLmhlYWRlcnMuaGFzKFwiRVRhZ1wiKSkge1xuICAgIGNvbnN0IGV0YWcgPSBhd2FpdCBjYWxjdWxhdGUoZW50aXR5KTtcbiAgICBpZiAoZXRhZykge1xuICAgICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoXCJFVGFnXCIsIGV0YWcpO1xuICAgIH1cbiAgfVxuXG4gIGlmICghcmVzcG9uc2UuaGVhZGVycy5oYXMoXCJBY2NlcHQtUmFuZ2VzXCIpKSB7XG4gICAgcmVzcG9uc2UuaGVhZGVycy5zZXQoXCJBY2NlcHQtUmFuZ2VzXCIsIFwiYnl0ZXNcIik7XG4gIH1cblxuICByZXR1cm4gcGF0aDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0NBR0MsR0FFRCxBQUNBLFNBQVMsU0FBUyxFQUFZLFdBQVcsUUFBUSxZQUFZO0FBQzdELFNBQ0UsUUFBUSxFQUNSLGVBQWUsRUFDZixPQUFPLEVBQ1AsYUFBYSxFQUNiLEtBQUssRUFDTCxPQUFPLEVBQ1AsTUFBTSxRQUNELFlBQVk7QUFDbkIsU0FBUyxPQUFPLEVBQUUsZUFBZSxFQUFFLFVBQVUsUUFBUSxhQUFhO0FBRWxFLFNBQVMsTUFBTSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsV0FBVyxRQUFRLFlBQVk7QUFFOUUsTUFBTSxvQkFBb0IsV0FBVyxRQUFRO0FBRTdDLCtFQUErRTtBQUMvRSx3QkFBd0I7QUFDeEIsSUFBSTtBQTJFSixTQUFTLFNBQVMsSUFBWSxFQUFFO0lBQzlCLE1BQU0sVUFBVSxLQUFLLEtBQUssQ0FBQztJQUMzQixLQUFLLE1BQU0sV0FBVyxRQUFTO1FBQzdCLElBQUksT0FBTyxDQUFDLEVBQUUsS0FBSyxPQUFPLFlBQVksT0FBTyxZQUFZLE1BQU07WUFDN0QsT0FBTyxJQUFJO1FBQ2IsQ0FBQztRQUNELE9BQU8sS0FBSztJQUNkO0FBQ0Y7QUFFQSxlQUFlLE9BQU8sSUFBWSxFQUFvQjtJQUNwRCxJQUFJO1FBQ0YsT0FBTyxDQUFDLE1BQU0sS0FBSyxJQUFJLENBQUMsS0FBSyxFQUFFLE1BQU07SUFDdkMsRUFBRSxPQUFNO1FBQ04sT0FBTyxLQUFLO0lBQ2Q7QUFDRjtBQUVBLGVBQWUsVUFDYixJQUFZLEVBQ1osS0FBYSxFQUNiLEtBQW9CLEVBQ3BCLFNBQWlCLEVBQ2pCLFFBQWtCLEVBQzBDO0lBQzVELElBQUk7SUFDSixJQUFJO0lBQ0osTUFBTSxPQUFPLE1BQU0sS0FBSyxJQUFJLENBQUMsTUFBTTtRQUFFLE1BQU0sSUFBSTtJQUFDO0lBQ2hELElBQUksTUFBTSxJQUFJLEdBQUcsV0FB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