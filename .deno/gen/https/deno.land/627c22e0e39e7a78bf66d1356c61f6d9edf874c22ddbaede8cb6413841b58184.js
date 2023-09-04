// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * Convert the generator function into a TransformStream.
 *
 * ```ts
 * import { toTransformStream } from "https://deno.land/std@$STD_VERSION/streams/to_transform_stream.ts";
 *
 * const readable = ReadableStream.from([0, 1, 2])
 *   .pipeThrough(toTransformStream(async function* (src) {
 *     for await (const chunk of src) {
 *       yield chunk * 100;
 *     }
 *   }));
 *
 * for await (const chunk of readable) {
 *   console.log(chunk);
 * }
 * // output: 0, 100, 200
 * ```
 *
 * @param transformer A function to transform.
 * @param writableStrategy An object that optionally defines a queuing strategy for the stream.
 * @param readableStrategy An object that optionally defines a queuing strategy for the stream.
 */ export function toTransformStream(transformer, writableStrategy, readableStrategy) {
    const { writable , readable  } = new TransformStream(undefined, writableStrategy);
    const iterable = transformer(readable);
    const iterator = iterable[Symbol.asyncIterator]?.() ?? iterable[Symbol.iterator]?.();
    return {
        writable,
        readable: new ReadableStream({
            async pull (controller) {
                let result;
                try {
                    result = await iterator.next();
                } catch (error) {
                    // Propagate error to stream from iterator
                    // If the stream status is "errored", it will be thrown, but ignore.
                    await readable.cancel(error).catch(()=>{});
                    controller.error(error);
                    return;
                }
                if (result.done) {
                    controller.close();
                    return;
                }
                controller.enqueue(result.value);
            },
            async cancel (reason) {
                // Propagate cancellation to readable and iterator
                if (typeof iterator.throw == "function") {
                    try {
                        await iterator.throw(reason);
                    } catch  {
                    /* `iterator.throw()` always throws on site. We catch it. */ }
                }
                await readable.cancel(reason);
            }
        }, readableStrategy)
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMC4wL3N0cmVhbXMvdG9fdHJhbnNmb3JtX3N0cmVhbS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKipcbiAqIENvbnZlcnQgdGhlIGdlbmVyYXRvciBmdW5jdGlvbiBpbnRvIGEgVHJhbnNmb3JtU3RyZWFtLlxuICpcbiAqIGBgYHRzXG4gKiBpbXBvcnQgeyB0b1RyYW5zZm9ybVN0cmVhbSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL3N0cmVhbXMvdG9fdHJhbnNmb3JtX3N0cmVhbS50c1wiO1xuICpcbiAqIGNvbnN0IHJlYWRhYmxlID0gUmVhZGFibGVTdHJlYW0uZnJvbShbMCwgMSwgMl0pXG4gKiAgIC5waXBlVGhyb3VnaCh0b1RyYW5zZm9ybVN0cmVhbShhc3luYyBmdW5jdGlvbiogKHNyYykge1xuICogICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2Ygc3JjKSB7XG4gKiAgICAgICB5aWVsZCBjaHVuayAqIDEwMDtcbiAqICAgICB9XG4gKiAgIH0pKTtcbiAqXG4gKiBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHJlYWRhYmxlKSB7XG4gKiAgIGNvbnNvbGUubG9nKGNodW5rKTtcbiAqIH1cbiAqIC8vIG91dHB1dDogMCwgMTAwLCAyMDBcbiAqIGBgYFxuICpcbiAqIEBwYXJhbSB0cmFuc2Zvcm1lciBBIGZ1bmN0aW9uIHRvIHRyYW5zZm9ybS5cbiAqIEBwYXJhbSB3cml0YWJsZVN0cmF0ZWd5IEFuIG9iamVjdCB0aGF0IG9wdGlvbmFsbHkgZGVmaW5lcyBhIHF1ZXVpbmcgc3RyYXRlZ3kgZm9yIHRoZSBzdHJlYW0uXG4gKiBAcGFyYW0gcmVhZGFibGVTdHJhdGVneSBBbiBvYmplY3QgdGhhdCBvcHRpb25hbGx5IGRlZmluZXMgYSBxdWV1aW5nIHN0cmF0ZWd5IGZvciB0aGUgc3RyZWFtLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9UcmFuc2Zvcm1TdHJlYW08SSwgTz4oXG4gIHRyYW5zZm9ybWVyOiAoc3JjOiBSZWFkYWJsZVN0cmVhbTxJPikgPT4gSXRlcmFibGU8Tz4gfCBBc3luY0l0ZXJhYmxlPE8+LFxuICB3cml0YWJsZVN0cmF0ZWd5PzogUXVldWluZ1N0cmF0ZWd5PEk+LFxuICByZWFkYWJsZVN0cmF0ZWd5PzogUXVldWluZ1N0cmF0ZWd5PE8+LFxuKTogVHJhbnNmb3JtU3RyZWFtPEksIE8+IHtcbiAgY29uc3Qge1xuICAgIHdyaXRhYmxlLFxuICAgIHJlYWRhYmxlLFxuICB9ID0gbmV3IFRyYW5zZm9ybVN0cmVhbTxJLCBJPih1bmRlZmluZWQsIHdyaXRhYmxlU3RyYXRlZ3kpO1xuXG4gIGNvbnN0IGl0ZXJhYmxlID0gdHJhbnNmb3JtZXIocmVhZGFibGUpO1xuICBjb25zdCBpdGVyYXRvcjogSXRlcmF0b3I8Tz4gfCBBc3luY0l0ZXJhdG9yPE8+ID1cbiAgICAoaXRlcmFibGUgYXMgQXN5bmNJdGVyYWJsZTxPPilbU3ltYm9sLmFzeW5jSXRlcmF0b3JdPy4oKSA/P1xuICAgICAgKGl0ZXJhYmxlIGFzIEl0ZXJhYmxlPE8+KVtTeW1ib2wuaXRlcmF0b3JdPy4oKTtcbiAgcmV0dXJuIHtcbiAgICB3cml0YWJsZSxcbiAgICByZWFkYWJsZTogbmV3IFJlYWRhYmxlU3RyZWFtPE8+KHtcbiAgICAgIGFzeW5jIHB1bGwoY29udHJvbGxlcikge1xuICAgICAgICBsZXQgcmVzdWx0OiBJdGVyYXRvclJlc3VsdDxPPjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSBhd2FpdCBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgLy8gUHJvcGFnYXRlIGVycm9yIHRvIHN0cmVhbSBmcm9tIGl0ZXJhdG9yXG4gICAgICAgICAgLy8gSWYgdGhlIHN0cmVhbSBzdGF0dXMgaXMgXCJlcnJvcmVkXCIsIGl0IHdpbGwgYmUgdGhyb3duLCBidXQgaWdub3JlLlxuICAgICAgICAgIGF3YWl0IHJlYWRhYmxlLmNhbmNlbChlcnJvcikuY2F0Y2goKCkgPT4ge30pO1xuICAgICAgICAgIGNvbnRyb2xsZXIuZXJyb3IoZXJyb3IpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAocmVzdWx0LmRvbmUpIHtcbiAgICAgICAgICBjb250cm9sbGVyLmNsb3NlKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShyZXN1bHQudmFsdWUpO1xuICAgICAgfSxcbiAgICAgIGFzeW5jIGNhbmNlbChyZWFzb24pIHtcbiAgICAgICAgLy8gUHJvcGFnYXRlIGNhbmNlbGxhdGlvbiB0byByZWFkYWJsZSBhbmQgaXRlcmF0b3JcbiAgICAgICAgaWYgKHR5cGVvZiBpdGVyYXRvci50aHJvdyA9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgaXRlcmF0b3IudGhyb3cocmVhc29uKTtcbiAgICAgICAgICB9IGNhdGNoIHtcbiAgICAgICAgICAgIC8qIGBpdGVyYXRvci50aHJvdygpYCBhbHdheXMgdGhyb3dzIG9uIHNpdGUuIFdlIGNhdGNoIGl0LiAqL1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBhd2FpdCByZWFkYWJsZS5jYW5jZWwocmVhc29uKTtcbiAgICAgIH0sXG4gICAgfSwgcmVhZGFibGVTdHJhdGVneSksXG4gIH07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXNCQyxHQUNELE9BQU8sU0FBUyxrQkFDZCxXQUF1RSxFQUN2RSxnQkFBcUMsRUFDckMsZ0JBQXFDLEVBQ2Q7SUFDdkIsTUFBTSxFQUNKLFNBQVEsRUFDUixTQUFRLEVBQ1QsR0FBRyxJQUFJLGdCQUFzQixXQUFXO0lBRXpDLE1BQU0sV0FBVyxZQUFZO0lBQzdCLE1BQU0sV0FDSixBQUFDLFFBQTZCLENBQUMsT0FBTyxhQUFhLENBQUMsUUFDbEQsQUFBQyxRQUF3QixDQUFDLE9BQU8sUUFBUSxDQUFDO0lBQzlDLE9BQU87UUFDTDtRQUNBLFVBQVUsSUFBSSxlQUFrQjtZQUM5QixNQUFNLE1BQUssVUFBVSxFQUFFO2dCQUNyQixJQUFJO2dCQUNKLElBQUk7b0JBQ0YsU0FBUyxNQUFNLFNBQVMsSUFBSTtnQkFDOUIsRUFBRSxPQUFPLE9BQU87b0JBQ2QsMENBQTBDO29CQUMxQyxvRUFBb0U7b0JBQ3BFLE1BQU0sU0FBUyxNQUFNLENBQUMsT0FBTyxLQUFLLENBQUMsSUFBTSxDQUFDO29CQUMxQyxXQUFXLEtBQUssQ0FBQztvQkFDakI7Z0JBQ0Y7Z0JBQ0EsSUFBSSxPQUFPLElBQUksRUFBRTtvQkFDZixXQUFXLEtBQUs7b0JBQ2hCO2dCQUNGLENBQUM7Z0JBQ0QsV0FBVyxPQUFPLENBQUMsT0FBTyxLQUFLO1lBQ2pDO1lBQ0EsTUFBTSxRQUFPLE1BQU0sRUFBRTtnQkFDbkIsa0RBQWtEO2dCQUNsRCxJQUFJLE9BQU8sU0FBUyxLQUFLLElBQUksWUFBWTtvQkFDdkMsSUFBSTt3QkFDRixNQUFNLFNBQVMsS0FBSyxDQUFDO29CQUN2QixFQUFFLE9BQU07b0JBQ04sMERBQTBELEdBQzVEO2dCQUNGLENBQUM7Z0JBQ0QsTUFBTSxTQUFTLE1BQU0sQ0FBQztZQUN4QjtRQUNGLEdBQUc7SUFDTDtBQUNGLENBQUMifQ==