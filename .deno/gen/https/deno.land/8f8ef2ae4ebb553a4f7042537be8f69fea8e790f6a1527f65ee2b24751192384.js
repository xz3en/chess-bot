// Copyright 2018-2023 the oak authors. All rights reserved. MIT license.
import { base64, createHttpError, isAbsolute, join, normalize, SEP } from "./deps.ts";
const ENCODE_CHARS_REGEXP = /(?:[^\x21\x25\x26-\x3B\x3D\x3F-\x5B\x5D\x5F\x61-\x7A\x7E]|%(?:[^0-9A-Fa-f]|[0-9A-Fa-f][^0-9A-Fa-f]|$))+/g;
const HTAB = "\t".charCodeAt(0);
const SPACE = " ".charCodeAt(0);
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
const UNMATCHED_SURROGATE_PAIR_REGEXP = /(^|[^\uD800-\uDBFF])[\uDC00-\uDFFF]|[\uD800-\uDBFF]([^\uDC00-\uDFFF]|$)/g;
const UNMATCHED_SURROGATE_PAIR_REPLACE = "$1\uFFFD$2";
export const DEFAULT_CHUNK_SIZE = 16_640; // 17 Kib
/** Body types which will be coerced into strings before being sent. */ export const BODY_TYPES = [
    "string",
    "number",
    "bigint",
    "boolean",
    "symbol"
];
export function assert(cond, msg = "Assertion failed") {
    if (!cond) {
        throw new Error(msg);
    }
}
/** Safely decode a URI component, where if it fails, instead of throwing,
 * just returns the original string
 */ export function decodeComponent(text) {
    try {
        return decodeURIComponent(text);
    } catch  {
        return text;
    }
}
/** Encodes the url preventing double enconding */ export function encodeUrl(url) {
    return String(url).replace(UNMATCHED_SURROGATE_PAIR_REGEXP, UNMATCHED_SURROGATE_PAIR_REPLACE).replace(ENCODE_CHARS_REGEXP, encodeURI);
}
function bufferToHex(buffer) {
    const arr = Array.from(new Uint8Array(buffer));
    return arr.map((b)=>b.toString(16).padStart(2, "0")).join("");
}
export async function getRandomFilename(prefix = "", extension = "") {
    const buffer = await crypto.subtle.digest("SHA-1", crypto.getRandomValues(new Uint8Array(256)));
    return `${prefix}${bufferToHex(buffer)}${extension ? `.${extension}` : ""}`;
}
export async function getBoundary() {
    const buffer = await crypto.subtle.digest("SHA-1", crypto.getRandomValues(new Uint8Array(256)));
    return `oak_${bufferToHex(buffer)}`;
}
/** Guard for Async Iterables */ export function isAsyncIterable(value) {
    return typeof value === "object" && value !== null && Symbol.asyncIterator in value && // deno-lint-ignore no-explicit-any
    typeof value[Symbol.asyncIterator] === "function";
}
export function isRouterContext(value) {
    return "params" in value;
}
/** Guard for `Deno.Reader`. */ export function isReader(value) {
    return typeof value === "object" && value !== null && "read" in value && typeof value.read === "function";
}
function isCloser(value) {
    return typeof value === "object" && value != null && "close" in value && // deno-lint-ignore no-explicit-any
    typeof value["close"] === "function";
}
export function isConn(value) {
    return typeof value === "object" && value != null && "rid" in value && // deno-lint-ignore no-explicit-any
    typeof value.rid === "number" && "localAddr" in value && "remoteAddr" in value;
}
export function isListenTlsOptions(value) {
    return typeof value === "object" && value !== null && ("cert" in value || "certFile" in value) && ("key" in value || "keyFile" in value) && "port" in value;
}
/**
 * Create a `ReadableStream<Uint8Array>` from an `AsyncIterable`.
 */ export function readableStreamFromAsyncIterable(source) {
    return new ReadableStream({
        async start (controller) {
            for await (const chunk of source){
                if (BODY_TYPES.includes(typeof chunk)) {
                    controller.enqueue(encoder.encode(String(chunk)));
                } else if (chunk instanceof Uint8Array) {
                    controller.enqueue(chunk);
                } else if (ArrayBuffer.isView(chunk)) {
                    controller.enqueue(new Uint8Array(chunk.buffer));
                } else if (chunk instanceof ArrayBuffer) {
                    controller.enqueue(new Uint8Array(chunk));
                } else {
                    try {
                        controller.enqueue(encoder.encode(JSON.stringify(chunk)));
                    } catch  {
                    // we just swallow errors here
                    }
                }
            }
            controller.close();
        }
    });
}
/**
 * Create a `ReadableStream<Uint8Array>` from a `Deno.Reader`.
 *
 * When the pull algorithm is called on the stream, a chunk from the reader
 * will be read.  When `null` is returned from the reader, the stream will be
 * closed along with the reader (if it is also a `Deno.Closer`).
 *
 * An example converting a `Deno.FsFile` into a readable stream:
 *
 * ```ts
 * import { readableStreamFromReader } from "https://deno.land/std/io/mod.ts";
 *
 * const file = await Deno.open("./file.txt", { read: true });
 * const fileStream = readableStreamFromReader(file);
 * ```
 */ export function readableStreamFromReader(reader, options = {}) {
    const { autoClose =true , chunkSize =DEFAULT_CHUNK_SIZE , strategy  } = options;
    return new ReadableStream({
        async pull (controller) {
            const chunk = new Uint8Array(chunkSize);
            try {
                const read = await reader.read(chunk);
                if (read === null) {
                    if (isCloser(reader) && autoClose) {
                        reader.close();
                    }
                    controller.close();
                    return;
                }
                controller.enqueue(chunk.subarray(0, read));
            } catch (e) {
                controller.error(e);
                if (isCloser(reader)) {
                    reader.close();
                }
            }
        },
        cancel () {
            if (isCloser(reader) && autoClose) {
                reader.close();
            }
        }
    }, strategy);
}
/** Determines if a string "looks" like HTML */ export function isHtml(value) {
    return /^\s*<(?:!DOCTYPE|html|body)/i.test(value);
}
/** Returns `u8` with leading white space removed. */ export function skipLWSPChar(u8) {
    const result = new Uint8Array(u8.length);
    let j = 0;
    for(let i = 0; i < u8.length; i++){
        if (u8[i] === SPACE || u8[i] === HTAB) continue;
        result[j++] = u8[i];
    }
    return result.slice(0, j);
}
export function stripEol(value) {
    if (value[value.byteLength - 1] == LF) {
        let drop = 1;
        if (value.byteLength > 1 && value[value.byteLength - 2] === CR) {
            drop = 2;
        }
        return value.subarray(0, value.byteLength - drop);
    }
    return value;
}
/*!
 * Adapted directly from https://github.com/pillarjs/resolve-path
 * which is licensed as follows:
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 Jonathan Ong <me@jongleberry.com>
 * Copyright (c) 2015-2018 Douglas Christopher Wilson <doug@somethingdoug.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * 'Software'), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */ const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
export function resolvePath(rootPath, relativePath) {
    let path = relativePath;
    let root = rootPath;
    // root is optional, similar to root.resolve
    if (relativePath === undefined) {
        path = rootPath;
        root = ".";
    }
    if (path == null) {
        throw new TypeError("Argument relativePath is required.");
    }
    // containing NULL bytes is malicious
    if (path.includes("\0")) {
        throw createHttpError(400, "Malicious Path");
    }
    // path should never be absolute
    if (isAbsolute(path)) {
        throw createHttpError(400, "Malicious Path");
    }
    // path outside root
    if (UP_PATH_REGEXP.test(normalize(`.${SEP}${path}`))) {
        throw createHttpError(403);
    }
    // join the relative path
    return normalize(join(root, path));
}
/** A utility class that transforms "any" chunk into an `Uint8Array`. */ export class Uint8ArrayTransformStream extends TransformStream {
    constructor(){
        const init = {
            async transform (chunk, controller) {
                chunk = await chunk;
                switch(typeof chunk){
                    case "object":
                        if (chunk === null) {
                            controller.terminate();
                        } else if (ArrayBuffer.isView(chunk)) {
                            controller.enqueue(new Uint8Array(chunk.buffer, chunk.byteOffset, chunk.byteLength));
                        } else if (Array.isArray(chunk) && chunk.every((value)=>typeof value === "number")) {
                            controller.enqueue(new Uint8Array(chunk));
                        } else if (typeof chunk.valueOf === "function" && chunk.valueOf() !== chunk) {
                            this.transform(chunk.valueOf(), controller);
                        } else if ("toJSON" in chunk) {
                            this.transform(JSON.stringify(chunk), controller);
                        }
                        break;
                    case "symbol":
                        controller.error(new TypeError("Cannot transform a symbol to a Uint8Array"));
                        break;
                    case "undefined":
                        controller.error(new TypeError("Cannot transform undefined to a Uint8Array"));
                        break;
                    default:
                        controller.enqueue(this.encoder.encode(String(chunk)));
                }
            },
            encoder: new TextEncoder()
        };
        super(init);
    }
}
const replacements = {
    "/": "_",
    "+": "-",
    "=": ""
};
const encoder = new TextEncoder();
export function encodeBase64Safe(data) {
    return base64.encode(data).replace(/\/|\+|=/g, (c)=>replacements[c]);
}
export function isNode() {
    return "process" in globalThis && "global" in globalThis;
}
export function importKey(key) {
    if (typeof key === "string") {
        key = encoder.encode(key);
    } else if (Array.isArray(key)) {
        key = new Uint8Array(key);
    }
    return crypto.subtle.importKey("raw", key, {
        name: "HMAC",
        hash: {
            name: "SHA-256"
        }
    }, true, [
        "sign",
        "verify"
    ]);
}
export function sign(data, key) {
    if (typeof data === "string") {
        data = encoder.encode(data);
    } else if (Array.isArray(data)) {
        data = Uint8Array.from(data);
    }
    return crypto.subtle.sign("HMAC", key, data);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvb2FrQHYxMi42LjEvdXRpbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBvYWsgYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB0eXBlIHsgU3RhdGUgfSBmcm9tIFwiLi9hcHBsaWNhdGlvbi50c1wiO1xuaW1wb3J0IHR5cGUgeyBDb250ZXh0IH0gZnJvbSBcIi4vY29udGV4dC50c1wiO1xuaW1wb3J0IHtcbiAgYmFzZTY0LFxuICBjcmVhdGVIdHRwRXJyb3IsXG4gIGlzQWJzb2x1dGUsXG4gIGpvaW4sXG4gIG5vcm1hbGl6ZSxcbiAgU0VQLFxufSBmcm9tIFwiLi9kZXBzLnRzXCI7XG5pbXBvcnQgdHlwZSB7IFJvdXRlUGFyYW1zLCBSb3V0ZXJDb250ZXh0IH0gZnJvbSBcIi4vcm91dGVyLnRzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGEsIEtleSB9IGZyb20gXCIuL3R5cGVzLmQudHNcIjtcblxuY29uc3QgRU5DT0RFX0NIQVJTX1JFR0VYUCA9XG4gIC8oPzpbXlxceDIxXFx4MjVcXHgyNi1cXHgzQlxceDNEXFx4M0YtXFx4NUJcXHg1RFxceDVGXFx4NjEtXFx4N0FcXHg3RV18JSg/OlteMC05QS1GYS1mXXxbMC05QS1GYS1mXVteMC05QS1GYS1mXXwkKSkrL2c7XG5jb25zdCBIVEFCID0gXCJcXHRcIi5jaGFyQ29kZUF0KDApO1xuY29uc3QgU1BBQ0UgPSBcIiBcIi5jaGFyQ29kZUF0KDApO1xuY29uc3QgQ1IgPSBcIlxcclwiLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBMRiA9IFwiXFxuXCIuY2hhckNvZGVBdCgwKTtcbmNvbnN0IFVOTUFUQ0hFRF9TVVJST0dBVEVfUEFJUl9SRUdFWFAgPVxuICAvKF58W15cXHVEODAwLVxcdURCRkZdKVtcXHVEQzAwLVxcdURGRkZdfFtcXHVEODAwLVxcdURCRkZdKFteXFx1REMwMC1cXHVERkZGXXwkKS9nO1xuY29uc3QgVU5NQVRDSEVEX1NVUlJPR0FURV9QQUlSX1JFUExBQ0UgPSBcIiQxXFx1RkZGRCQyXCI7XG5leHBvcnQgY29uc3QgREVGQVVMVF9DSFVOS19TSVpFID0gMTZfNjQwOyAvLyAxNyBLaWJcblxuLyoqIEJvZHkgdHlwZXMgd2hpY2ggd2lsbCBiZSBjb2VyY2VkIGludG8gc3RyaW5ncyBiZWZvcmUgYmVpbmcgc2VudC4gKi9cbmV4cG9ydCBjb25zdCBCT0RZX1RZUEVTID0gW1wic3RyaW5nXCIsIFwibnVtYmVyXCIsIFwiYmlnaW50XCIsIFwiYm9vbGVhblwiLCBcInN5bWJvbFwiXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydChjb25kOiB1bmtub3duLCBtc2cgPSBcIkFzc2VydGlvbiBmYWlsZWRcIik6IGFzc2VydHMgY29uZCB7XG4gIGlmICghY29uZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICB9XG59XG5cbi8qKiBTYWZlbHkgZGVjb2RlIGEgVVJJIGNvbXBvbmVudCwgd2hlcmUgaWYgaXQgZmFpbHMsIGluc3RlYWQgb2YgdGhyb3dpbmcsXG4gKiBqdXN0IHJldHVybnMgdGhlIG9yaWdpbmFsIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZGVjb2RlQ29tcG9uZW50KHRleHQ6IHN0cmluZykge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodGV4dCk7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB0ZXh0O1xuICB9XG59XG5cbi8qKiBFbmNvZGVzIHRoZSB1cmwgcHJldmVudGluZyBkb3VibGUgZW5jb25kaW5nICovXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlVXJsKHVybDogc3RyaW5nKSB7XG4gIHJldHVybiBTdHJpbmcodXJsKVxuICAgIC5yZXBsYWNlKFVOTUFUQ0hFRF9TVVJST0dBVEVfUEFJUl9SRUdFWFAsIFVOTUFUQ0hFRF9TVVJST0dBVEVfUEFJUl9SRVBMQUNFKVxuICAgIC5yZXBsYWNlKEVOQ09ERV9DSEFSU19SRUdFWFAsIGVuY29kZVVSSSk7XG59XG5cbmZ1bmN0aW9uIGJ1ZmZlclRvSGV4KGJ1ZmZlcjogQXJyYXlCdWZmZXIpOiBzdHJpbmcge1xuICBjb25zdCBhcnIgPSBBcnJheS5mcm9tKG5ldyBVaW50OEFycmF5KGJ1ZmZlcikpO1xuICByZXR1cm4gYXJyLm1hcCgoYikgPT4gYi50b1N0cmluZygxNikucGFkU3RhcnQoMiwgXCIwXCIpKS5qb2luKFwiXCIpO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZ2V0UmFuZG9tRmlsZW5hbWUoXG4gIHByZWZpeCA9IFwiXCIsXG4gIGV4dGVuc2lvbiA9IFwiXCIsXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBidWZmZXIgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdChcbiAgICBcIlNIQS0xXCIsXG4gICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgyNTYpKSxcbiAgKTtcbiAgcmV0dXJuIGAke3ByZWZpeH0ke2J1ZmZlclRvSGV4KGJ1ZmZlcil9JHtleHRlbnNpb24gPyBgLiR7ZXh0ZW5zaW9ufWAgOiBcIlwifWA7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRCb3VuZGFyeSgpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBidWZmZXIgPSBhd2FpdCBjcnlwdG8uc3VidGxlLmRpZ2VzdChcbiAgICBcIlNIQS0xXCIsXG4gICAgY3J5cHRvLmdldFJhbmRvbVZhbHVlcyhuZXcgVWludDhBcnJheSgyNTYpKSxcbiAgKTtcbiAgcmV0dXJuIGBvYWtfJHtidWZmZXJUb0hleChidWZmZXIpfWA7XG59XG5cbi8qKiBHdWFyZCBmb3IgQXN5bmMgSXRlcmFibGVzICovXG5leHBvcnQgZnVuY3Rpb24gaXNBc3luY0l0ZXJhYmxlKFxuICB2YWx1ZTogdW5rbm93bixcbik6IHZhbHVlIGlzIEFzeW5jSXRlcmFibGU8dW5rbm93bj4ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmXG4gICAgU3ltYm9sLmFzeW5jSXRlcmF0b3IgaW4gdmFsdWUgJiZcbiAgICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuICAgIHR5cGVvZiAodmFsdWUgYXMgYW55KVtTeW1ib2wuYXN5bmNJdGVyYXRvcl0gPT09IFwiZnVuY3Rpb25cIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzUm91dGVyQ29udGV4dDxcbiAgUiBleHRlbmRzIHN0cmluZyxcbiAgUCBleHRlbmRzIFJvdXRlUGFyYW1zPFI+LFxuICBTIGV4dGVuZHMgU3RhdGUsXG4+KFxuICB2YWx1ZTogQ29udGV4dDxTPixcbik6IHZhbHVlIGlzIFJvdXRlckNvbnRleHQ8UiwgUCwgUz4ge1xuICByZXR1cm4gXCJwYXJhbXNcIiBpbiB2YWx1ZTtcbn1cblxuLyoqIEd1YXJkIGZvciBgRGVuby5SZWFkZXJgLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzUmVhZGVyKHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgRGVuby5SZWFkZXIge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9PSBudWxsICYmIFwicmVhZFwiIGluIHZhbHVlICYmXG4gICAgdHlwZW9mICh2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPikucmVhZCA9PT0gXCJmdW5jdGlvblwiO1xufVxuXG5mdW5jdGlvbiBpc0Nsb3Nlcih2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIERlbm8uQ2xvc2VyIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPSBudWxsICYmIFwiY2xvc2VcIiBpbiB2YWx1ZSAmJlxuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgdHlwZW9mICh2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCBhbnk+KVtcImNsb3NlXCJdID09PSBcImZ1bmN0aW9uXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0Nvbm4odmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBEZW5vLkNvbm4ge1xuICByZXR1cm4gdHlwZW9mIHZhbHVlID09PSBcIm9iamVjdFwiICYmIHZhbHVlICE9IG51bGwgJiYgXCJyaWRcIiBpbiB2YWx1ZSAmJlxuICAgIC8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4gICAgdHlwZW9mICh2YWx1ZSBhcyBhbnkpLnJpZCA9PT0gXCJudW1iZXJcIiAmJiBcImxvY2FsQWRkclwiIGluIHZhbHVlICYmXG4gICAgXCJyZW1vdGVBZGRyXCIgaW4gdmFsdWU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0xpc3RlblRsc09wdGlvbnMoXG4gIHZhbHVlOiB1bmtub3duLFxuKTogdmFsdWUgaXMgRGVuby5MaXN0ZW5UbHNPcHRpb25zIHtcbiAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCAmJlxuICAgIChcImNlcnRcIiBpbiB2YWx1ZSB8fCBcImNlcnRGaWxlXCIgaW4gdmFsdWUpICYmXG4gICAgKFwia2V5XCIgaW4gdmFsdWUgfHwgXCJrZXlGaWxlXCIgaW4gdmFsdWUpICYmIFwicG9ydFwiIGluIHZhbHVlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlYWRhYmxlU3RyZWFtRnJvbVJlYWRlck9wdGlvbnMge1xuICAvKiogSWYgdGhlIGByZWFkZXJgIGlzIGFsc28gYSBgRGVuby5DbG9zZXJgLCBhdXRvbWF0aWNhbGx5IGNsb3NlIHRoZSBgcmVhZGVyYFxuICAgKiB3aGVuIGBFT0ZgIGlzIGVuY291bnRlcmVkLCBvciBhIHJlYWQgZXJyb3Igb2NjdXJzLlxuICAgKlxuICAgKiBEZWZhdWx0cyB0byBgdHJ1ZWAuICovXG4gIGF1dG9DbG9zZT86IGJvb2xlYW47XG5cbiAgLyoqIFRoZSBzaXplIG9mIGNodW5rcyB0byBhbGxvY2F0ZSB0byByZWFkLCB0aGUgZGVmYXVsdCBpcyB+MTZLaUIsIHdoaWNoIGlzXG4gICAqIHRoZSBtYXhpbXVtIHNpemUgdGhhdCBEZW5vIG9wZXJhdGlvbnMgY2FuIGN1cnJlbnRseSBzdXBwb3J0LiAqL1xuICBjaHVua1NpemU/OiBudW1iZXI7XG5cbiAgLyoqIFRoZSBxdWV1aW5nIHN0cmF0ZWd5IHRvIGNyZWF0ZSB0aGUgYFJlYWRhYmxlU3RyZWFtYCB3aXRoLiAqL1xuICBzdHJhdGVneT86IHsgaGlnaFdhdGVyTWFyaz86IG51bWJlciB8IHVuZGVmaW5lZDsgc2l6ZT86IHVuZGVmaW5lZCB9O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PmAgZnJvbSBhbiBgQXN5bmNJdGVyYWJsZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkYWJsZVN0cmVhbUZyb21Bc3luY0l0ZXJhYmxlKFxuICBzb3VyY2U6IEFzeW5jSXRlcmFibGU8dW5rbm93bj4sXG4pOiBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PiB7XG4gIHJldHVybiBuZXcgUmVhZGFibGVTdHJlYW0oe1xuICAgIGFzeW5jIHN0YXJ0KGNvbnRyb2xsZXIpIHtcbiAgICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2Ygc291cmNlKSB7XG4gICAgICAgIGlmIChCT0RZX1RZUEVTLmluY2x1ZGVzKHR5cGVvZiBjaHVuaykpIHtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoZW5jb2Rlci5lbmNvZGUoU3RyaW5nKGNodW5rKSkpO1xuICAgICAgICB9IGVsc2UgaWYgKGNodW5rIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7XG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KGNodW5rKSkge1xuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShuZXcgVWludDhBcnJheShjaHVuay5idWZmZXIpKTtcbiAgICAgICAgfSBlbHNlIGlmIChjaHVuayBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKG5ldyBVaW50OEFycmF5KGNodW5rKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShlbmNvZGVyLmVuY29kZShKU09OLnN0cmluZ2lmeShjaHVuaykpKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8vIHdlIGp1c3Qgc3dhbGxvdyBlcnJvcnMgaGVyZVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgY29udHJvbGxlci5jbG9zZSgpO1xuICAgIH0sXG4gIH0pO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIGBSZWFkYWJsZVN0cmVhbTxVaW50OEFycmF5PmAgZnJvbSBhIGBEZW5vLlJlYWRlcmAuXG4gKlxuICogV2hlbiB0aGUgcHVsbCBhbGdvcml0aG0gaXMgY2FsbGVkIG9uIHRoZSBzdHJlYW0sIGEgY2h1bmsgZnJvbSB0aGUgcmVhZGVyXG4gKiB3aWxsIGJlIHJlYWQuICBXaGVuIGBudWxsYCBpcyByZXR1cm5lZCBmcm9tIHRoZSByZWFkZXIsIHRoZSBzdHJlYW0gd2lsbCBiZVxuICogY2xvc2VkIGFsb25nIHdpdGggdGhlIHJlYWRlciAoaWYgaXQgaXMgYWxzbyBhIGBEZW5vLkNsb3NlcmApLlxuICpcbiAqIEFuIGV4YW1wbGUgY29udmVydGluZyBhIGBEZW5vLkZzRmlsZWAgaW50byBhIHJlYWRhYmxlIHN0cmVhbTpcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgcmVhZGFibGVTdHJlYW1Gcm9tUmVhZGVyIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZC9pby9tb2QudHNcIjtcbiAqXG4gKiBjb25zdCBmaWxlID0gYXdhaXQgRGVuby5vcGVuKFwiLi9maWxlLnR4dFwiLCB7IHJlYWQ6IHRydWUgfSk7XG4gKiBjb25zdCBmaWxlU3RyZWFtID0gcmVhZGFibGVTdHJlYW1Gcm9tUmVhZGVyKGZpbGUpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkYWJsZVN0cmVhbUZyb21SZWFkZXIoXG4gIHJlYWRlcjogRGVuby5SZWFkZXIgfCAoRGVuby5SZWFkZXIgJiBEZW5vLkNsb3NlciksXG4gIG9wdGlvbnM6IFJlYWRhYmxlU3RyZWFtRnJvbVJlYWRlck9wdGlvbnMgPSB7fSxcbik6IFJlYWRhYmxlU3RyZWFtPFVpbnQ4QXJyYXk+IHtcbiAgY29uc3Qge1xuICAgIGF1dG9DbG9zZSA9IHRydWUsXG4gICAgY2h1bmtTaXplID0gREVGQVVMVF9DSFVOS19TSVpFLFxuICAgIHN0cmF0ZWd5LFxuICB9ID0gb3B0aW9ucztcblxuICByZXR1cm4gbmV3IFJlYWRhYmxlU3RyZWFtKHtcbiAgICBhc3luYyBwdWxsKGNvbnRyb2xsZXIpIHtcbiAgICAgIGNvbnN0IGNodW5rID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmtTaXplKTtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlYWQgPSBhd2FpdCByZWFkZXIucmVhZChjaHVuayk7XG4gICAgICAgIGlmIChyZWFkID09PSBudWxsKSB7XG4gICAgICAgICAgaWYgKGlzQ2xvc2VyKHJlYWRlcikgJiYgYXV0b0Nsb3NlKSB7XG4gICAgICAgICAgICByZWFkZXIuY2xvc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udHJvbGxlci5jbG9zZSgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmsuc3ViYXJyYXkoMCwgcmVhZCkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjb250cm9sbGVyLmVycm9yKGUpO1xuICAgICAgICBpZiAoaXNDbG9zZXIocmVhZGVyKSkge1xuICAgICAgICAgIHJlYWRlci5jbG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSxcbiAgICBjYW5jZWwoKSB7XG4gICAgICBpZiAoaXNDbG9zZXIocmVhZGVyKSAmJiBhdXRvQ2xvc2UpIHtcbiAgICAgICAgcmVhZGVyLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfSxcbiAgfSwgc3RyYXRlZ3kpO1xufVxuXG4vKiogRGV0ZXJtaW5lcyBpZiBhIHN0cmluZyBcImxvb2tzXCIgbGlrZSBIVE1MICovXG5leHBvcnQgZnVuY3Rpb24gaXNIdG1sKHZhbHVlOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIC9eXFxzKjwoPzohRE9DVFlQRXxodG1sfGJvZHkpL2kudGVzdCh2YWx1ZSk7XG59XG5cbi8qKiBSZXR1cm5zIGB1OGAgd2l0aCBsZWFkaW5nIHdoaXRlIHNwYWNlIHJlbW92ZWQuICovXG5leHBvcnQgZnVuY3Rpb24gc2tpcExXU1BDaGFyKHU4OiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIGNvbnN0IHJlc3VsdCA9IG5ldyBVaW50OEFycmF5KHU4Lmxlbmd0aCk7XG4gIGxldCBqID0gMDtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCB1OC5sZW5ndGg7IGkrKykge1xuICAgIGlmICh1OFtpXSA9PT0gU1BBQ0UgfHwgdThbaV0gPT09IEhUQUIpIGNvbnRpbnVlO1xuICAgIHJlc3VsdFtqKytdID0gdThbaV07XG4gIH1cbiAgcmV0dXJuIHJlc3VsdC5zbGljZSgwLCBqKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmlwRW9sKHZhbHVlOiBVaW50OEFycmF5KTogVWludDhBcnJheSB7XG4gIGlmICh2YWx1ZVt2YWx1ZS5ieXRlTGVuZ3RoIC0gMV0gPT0gTEYpIHtcbiAgICBsZXQgZHJvcCA9IDE7XG4gICAgaWYgKHZhbHVlLmJ5dGVMZW5ndGggPiAxICYmIHZhbHVlW3ZhbHVlLmJ5dGVMZW5ndGggLSAyXSA9PT0gQ1IpIHtcbiAgICAgIGRyb3AgPSAyO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWUuc3ViYXJyYXkoMCwgdmFsdWUuYnl0ZUxlbmd0aCAtIGRyb3ApO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuLyohXG4gKiBBZGFwdGVkIGRpcmVjdGx5IGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3BpbGxhcmpzL3Jlc29sdmUtcGF0aFxuICogd2hpY2ggaXMgbGljZW5zZWQgYXMgZm9sbG93czpcbiAqXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQgSm9uYXRoYW4gT25nIDxtZUBqb25nbGViZXJyeS5jb20+XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtMjAxOCBEb3VnbGFzIENocmlzdG9waGVyIFdpbHNvbiA8ZG91Z0Bzb21ldGhpbmdkb3VnLmNvbT5cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmdcbiAqIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuICogJ1NvZnR3YXJlJyksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuICogd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuICogZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvXG4gKiBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG9cbiAqIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsXG4gKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0ZcbiAqIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC5cbiAqIElOIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZXG4gKiBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULFxuICogVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEVcbiAqIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5cbmNvbnN0IFVQX1BBVEhfUkVHRVhQID0gLyg/Ol58W1xcXFwvXSlcXC5cXC4oPzpbXFxcXC9dfCQpLztcblxuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYXRoKHJlbGF0aXZlUGF0aDogc3RyaW5nKTogc3RyaW5nO1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYXRoKHJvb3RQYXRoOiBzdHJpbmcsIHJlbGF0aXZlUGF0aDogc3RyaW5nKTogc3RyaW5nO1xuZXhwb3J0IGZ1bmN0aW9uIHJlc29sdmVQYXRoKHJvb3RQYXRoOiBzdHJpbmcsIHJlbGF0aXZlUGF0aD86IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBwYXRoID0gcmVsYXRpdmVQYXRoO1xuICBsZXQgcm9vdCA9IHJvb3RQYXRoO1xuXG4gIC8vIHJvb3QgaXMgb3B0aW9uYWwsIHNpbWlsYXIgdG8gcm9vdC5yZXNvbHZlXG4gIGlmIChyZWxhdGl2ZVBhdGggPT09IHVuZGVmaW5lZCkge1xuICAgIHBhdGggPSByb290UGF0aDtcbiAgICByb290ID0gXCIuXCI7XG4gIH1cblxuICBpZiAocGF0aCA9PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkFyZ3VtZW50IHJlbGF0aXZlUGF0aCBpcyByZXF1aXJlZC5cIik7XG4gIH1cblxuICAvLyBjb250YWluaW5nIE5VTEwgYnl0ZXMgaXMgbWFsaWNpb3VzXG4gIGlmIChwYXRoLmluY2x1ZGVzKFwiXFwwXCIpKSB7XG4gICAgdGhyb3cgY3JlYXRlSHR0cEVycm9yKDQwMCwgXCJNYWxpY2lvdXMgUGF0aFwiKTtcbiAgfVxuXG4gIC8vIHBhdGggc2hvdWxkIG5ldmVyIGJlIGFic29sdXRlXG4gIGlmIChpc0Fic29sdXRlKHBhdGgpKSB7XG4gICAgdGhyb3cgY3JlYXRlSHR0cEVycm9yKDQwMCwgXCJNYWxpY2lvdXMgUGF0aFwiKTtcbiAgfVxuXG4gIC8vIHBhdGggb3V0c2lkZSByb290XG4gIGlmIChVUF9QQVRIX1JFR0VYUC50ZXN0KG5vcm1hbGl6ZShgLiR7U0VQfSR7cGF0aH1gKSkpIHtcbiAgICB0aHJvdyBjcmVhdGVIdHRwRXJyb3IoNDAzKTtcbiAgfVxuXG4gIC8vIGpvaW4gdGhlIHJlbGF0aXZlIHBhdGhcbiAgcmV0dXJuIG5vcm1hbGl6ZShqb2luKHJvb3QsIHBhdGgpKTtcbn1cblxuLyoqIEEgdXRpbGl0eSBjbGFzcyB0aGF0IHRyYW5zZm9ybXMgXCJhbnlcIiBjaHVuayBpbnRvIGFuIGBVaW50OEFycmF5YC4gKi9cbmV4cG9ydCBjbGFzcyBVaW50OEFycmF5VHJhbnNmb3JtU3RyZWFtXG4gIGV4dGVuZHMgVHJhbnNmb3JtU3RyZWFtPHVua25vd24sIFVpbnQ4QXJyYXk+IHtcbiAgY29uc3RydWN0b3IoKSB7XG4gICAgY29uc3QgaW5pdCA9IHtcbiAgICAgIGFzeW5jIHRyYW5zZm9ybShcbiAgICAgICAgY2h1bms6IHVua25vd24sXG4gICAgICAgIGNvbnRyb2xsZXI6IFRyYW5zZm9ybVN0cmVhbURlZmF1bHRDb250cm9sbGVyPFVpbnQ4QXJyYXk+LFxuICAgICAgKSB7XG4gICAgICAgIGNodW5rID0gYXdhaXQgY2h1bms7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIGNodW5rKSB7XG4gICAgICAgICAgY2FzZSBcIm9iamVjdFwiOlxuICAgICAgICAgICAgaWYgKGNodW5rID09PSBudWxsKSB7XG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIudGVybWluYXRlKCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhjaHVuaykpIHtcbiAgICAgICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKFxuICAgICAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KFxuICAgICAgICAgICAgICAgICAgY2h1bmsuYnVmZmVyLFxuICAgICAgICAgICAgICAgICAgY2h1bmsuYnl0ZU9mZnNldCxcbiAgICAgICAgICAgICAgICAgIGNodW5rLmJ5dGVMZW5ndGgsXG4gICAgICAgICAgICAgICAgKSxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXG4gICAgICAgICAgICAgIEFycmF5LmlzQXJyYXkoY2h1bmspICYmXG4gICAgICAgICAgICAgIGNodW5rLmV2ZXJ5KCh2YWx1ZSkgPT4gdHlwZW9mIHZhbHVlID09PSBcIm51bWJlclwiKVxuICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShuZXcgVWludDhBcnJheShjaHVuaykpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChcbiAgICAgICAgICAgICAgdHlwZW9mIGNodW5rLnZhbHVlT2YgPT09IFwiZnVuY3Rpb25cIiAmJiBjaHVuay52YWx1ZU9mKCkgIT09IGNodW5rXG4gICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgdGhpcy50cmFuc2Zvcm0oY2h1bmsudmFsdWVPZigpLCBjb250cm9sbGVyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoXCJ0b0pTT05cIiBpbiBjaHVuaykge1xuICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybShKU09OLnN0cmluZ2lmeShjaHVuayksIGNvbnRyb2xsZXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcInN5bWJvbFwiOlxuICAgICAgICAgICAgY29udHJvbGxlci5lcnJvcihcbiAgICAgICAgICAgICAgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB0cmFuc2Zvcm0gYSBzeW1ib2wgdG8gYSBVaW50OEFycmF5XCIpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJ1bmRlZmluZWRcIjpcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZXJyb3IoXG4gICAgICAgICAgICAgIG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgdHJhbnNmb3JtIHVuZGVmaW5lZCB0byBhIFVpbnQ4QXJyYXlcIiksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZSh0aGlzLmVuY29kZXIuZW5jb2RlKFN0cmluZyhjaHVuaykpKTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGVuY29kZXI6IG5ldyBUZXh0RW5jb2RlcigpLFxuICAgIH07XG4gICAgc3VwZXIoaW5pdCk7XG4gIH1cbn1cblxuY29uc3QgcmVwbGFjZW1lbnRzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge1xuICBcIi9cIjogXCJfXCIsXG4gIFwiK1wiOiBcIi1cIixcbiAgXCI9XCI6IFwiXCIsXG59O1xuXG5jb25zdCBlbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVCYXNlNjRTYWZlKGRhdGE6IHN0cmluZyB8IEFycmF5QnVmZmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIGJhc2U2NC5lbmNvZGUoZGF0YSkucmVwbGFjZSgvXFwvfFxcK3w9L2csIChjKSA9PiByZXBsYWNlbWVudHNbY10pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOb2RlKCk6IGJvb2xlYW4ge1xuICByZXR1cm4gXCJwcm9jZXNzXCIgaW4gZ2xvYmFsVGhpcyAmJiBcImdsb2JhbFwiIGluIGdsb2JhbFRoaXM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpbXBvcnRLZXkoa2V5OiBLZXkpOiBQcm9taXNlPENyeXB0b0tleT4ge1xuICBpZiAodHlwZW9mIGtleSA9PT0gXCJzdHJpbmdcIikge1xuICAgIGtleSA9IGVuY29kZXIuZW5jb2RlKGtleSk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShrZXkpKSB7XG4gICAga2V5ID0gbmV3IFVpbnQ4QXJyYXkoa2V5KTtcbiAgfVxuICByZXR1cm4gY3J5cHRvLnN1YnRsZS5pbXBvcnRLZXkoXG4gICAgXCJyYXdcIixcbiAgICBrZXksXG4gICAge1xuICAgICAgbmFtZTogXCJITUFDXCIsXG4gICAgICBoYXNoOiB7IG5hbWU6IFwiU0hBLTI1NlwiIH0sXG4gICAgfSxcbiAgICB0cnVlLFxuICAgIFtcInNpZ25cIiwgXCJ2ZXJpZnlcIl0sXG4gICk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaWduKGRhdGE6IERhdGEsIGtleTogQ3J5cHRvS2V5KTogUHJvbWlzZTxBcnJheUJ1ZmZlcj4ge1xuICBpZiAodHlwZW9mIGRhdGEgPT09IFwic3RyaW5nXCIpIHtcbiAgICBkYXRhID0gZW5jb2Rlci5lbmNvZGUoZGF0YSk7XG4gIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShkYXRhKSkge1xuICAgIGRhdGEgPSBVaW50OEFycmF5LmZyb20oZGF0YSk7XG4gIH1cbiAgcmV0dXJuIGNyeXB0by5zdWJ0bGUuc2lnbihcIkhNQUNcIiwga2V5LCBkYXRhKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSx5RUFBeUU7QUFJekUsU0FDRSxNQUFNLEVBQ04sZUFBZSxFQUNmLFVBQVUsRUFDVixJQUFJLEVBQ0osU0FBUyxFQUNULEdBQUcsUUFDRSxZQUFZO0FBSW5CLE1BQU0sc0JBQ0o7QUFDRixNQUFNLE9BQU8sS0FBSyxVQUFVLENBQUM7QUFD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