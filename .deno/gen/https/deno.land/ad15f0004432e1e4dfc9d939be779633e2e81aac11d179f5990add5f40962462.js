// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { Buffer } from "../io/buffer.ts";
import { writeAll } from "./write_all.ts";
/** Create a `Reader` from an iterable of `Uint8Array`s.
 *
 * ```ts
 *      import { readerFromIterable } from "https://deno.land/std@$STD_VERSION/streams/reader_from_iterable.ts";
 *      import { copy } from "https://deno.land/std@$STD_VERSION/streams/copy.ts";
 *
 *      const file = await Deno.open("metrics.txt", { write: true });
 *      const reader = readerFromIterable((async function* () {
 *        while (true) {
 *          await new Promise((r) => setTimeout(r, 1000));
 *          const message = `data: ${JSON.stringify(Deno.metrics())}\n\n`;
 *          yield new TextEncoder().encode(message);
 *        }
 *      })());
 *      await copy(reader, file);
 * ```
 */ export function readerFromIterable(iterable) {
    const iterator = iterable[Symbol.asyncIterator]?.() ?? iterable[Symbol.iterator]?.();
    const buffer = new Buffer();
    return {
        async read (p) {
            if (buffer.length == 0) {
                const result = await iterator.next();
                if (result.done) {
                    return null;
                } else {
                    if (result.value.byteLength <= p.byteLength) {
                        p.set(result.value);
                        return result.value.byteLength;
                    }
                    p.set(result.value.subarray(0, p.byteLength));
                    await writeAll(buffer, result.value.subarray(p.byteLength));
                    return p.byteLength;
                }
            } else {
                const n = await buffer.read(p);
                if (n == null) {
                    return this.read(p);
                }
                return n;
            }
        }
    };
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMC4wL3N0cmVhbXMvcmVhZGVyX2Zyb21faXRlcmFibGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuaW1wb3J0IHsgQnVmZmVyIH0gZnJvbSBcIi4uL2lvL2J1ZmZlci50c1wiO1xuaW1wb3J0IHsgd3JpdGVBbGwgfSBmcm9tIFwiLi93cml0ZV9hbGwudHNcIjtcbmltcG9ydCB7IFJlYWRlciB9IGZyb20gXCIuLi90eXBlcy5kLnRzXCI7XG5cbi8qKiBDcmVhdGUgYSBgUmVhZGVyYCBmcm9tIGFuIGl0ZXJhYmxlIG9mIGBVaW50OEFycmF5YHMuXG4gKlxuICogYGBgdHNcbiAqICAgICAgaW1wb3J0IHsgcmVhZGVyRnJvbUl0ZXJhYmxlIH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vc3RyZWFtcy9yZWFkZXJfZnJvbV9pdGVyYWJsZS50c1wiO1xuICogICAgICBpbXBvcnQgeyBjb3B5IH0gZnJvbSBcImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAkU1REX1ZFUlNJT04vc3RyZWFtcy9jb3B5LnRzXCI7XG4gKlxuICogICAgICBjb25zdCBmaWxlID0gYXdhaXQgRGVuby5vcGVuKFwibWV0cmljcy50eHRcIiwgeyB3cml0ZTogdHJ1ZSB9KTtcbiAqICAgICAgY29uc3QgcmVhZGVyID0gcmVhZGVyRnJvbUl0ZXJhYmxlKChhc3luYyBmdW5jdGlvbiogKCkge1xuICogICAgICAgIHdoaWxlICh0cnVlKSB7XG4gKiAgICAgICAgICBhd2FpdCBuZXcgUHJvbWlzZSgocikgPT4gc2V0VGltZW91dChyLCAxMDAwKSk7XG4gKiAgICAgICAgICBjb25zdCBtZXNzYWdlID0gYGRhdGE6ICR7SlNPTi5zdHJpbmdpZnkoRGVuby5tZXRyaWNzKCkpfVxcblxcbmA7XG4gKiAgICAgICAgICB5aWVsZCBuZXcgVGV4dEVuY29kZXIoKS5lbmNvZGUobWVzc2FnZSk7XG4gKiAgICAgICAgfVxuICogICAgICB9KSgpKTtcbiAqICAgICAgYXdhaXQgY29weShyZWFkZXIsIGZpbGUpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZWFkZXJGcm9tSXRlcmFibGUoXG4gIGl0ZXJhYmxlOiBJdGVyYWJsZTxVaW50OEFycmF5PiB8IEFzeW5jSXRlcmFibGU8VWludDhBcnJheT4sXG4pOiBSZWFkZXIge1xuICBjb25zdCBpdGVyYXRvcjogSXRlcmF0b3I8VWludDhBcnJheT4gfCBBc3luY0l0ZXJhdG9yPFVpbnQ4QXJyYXk+ID1cbiAgICAoaXRlcmFibGUgYXMgQXN5bmNJdGVyYWJsZTxVaW50OEFycmF5PilbU3ltYm9sLmFzeW5jSXRlcmF0b3JdPy4oKSA/P1xuICAgICAgKGl0ZXJhYmxlIGFzIEl0ZXJhYmxlPFVpbnQ4QXJyYXk+KVtTeW1ib2wuaXRlcmF0b3JdPy4oKTtcbiAgY29uc3QgYnVmZmVyID0gbmV3IEJ1ZmZlcigpO1xuICByZXR1cm4ge1xuICAgIGFzeW5jIHJlYWQocDogVWludDhBcnJheSk6IFByb21pc2U8bnVtYmVyIHwgbnVsbD4ge1xuICAgICAgaWYgKGJ1ZmZlci5sZW5ndGggPT0gMCkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgIGlmIChyZXN1bHQuZG9uZSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChyZXN1bHQudmFsdWUuYnl0ZUxlbmd0aCA8PSBwLmJ5dGVMZW5ndGgpIHtcbiAgICAgICAgICAgIHAuc2V0KHJlc3VsdC52YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0LnZhbHVlLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHAuc2V0KHJlc3VsdC52YWx1ZS5zdWJhcnJheSgwLCBwLmJ5dGVMZW5ndGgpKTtcbiAgICAgICAgICBhd2FpdCB3cml0ZUFsbChidWZmZXIsIHJlc3VsdC52YWx1ZS5zdWJhcnJheShwLmJ5dGVMZW5ndGgpKTtcbiAgICAgICAgICByZXR1cm4gcC5ieXRlTGVuZ3RoO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuID0gYXdhaXQgYnVmZmVyLnJlYWQocCk7XG4gICAgICAgIGlmIChuID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5yZWFkKHApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQyxTQUFTLE1BQU0sUUFBUSxrQkFBa0I7QUFDekMsU0FBUyxRQUFRLFFBQVEsaUJBQWlCO0FBRzFDOzs7Ozs7Ozs7Ozs7Ozs7O0NBZ0JDLEdBQ0QsT0FBTyxTQUFTLG1CQUNkLFFBQTBELEVBQ2xEO0lBQ1IsTUFBTSxXQUNKLEFBQUMsUUFBc0MsQ0FBQyxPQUFPLGFBQWEsQ0FBQyxRQUMzRCxBQUFDLFFBQWlDLENBQUMsT0FBTyxRQUFRLENBQUM7SUFDdkQsTUFBTSxTQUFTLElBQUk7SUFDbkIsT0FBTztRQUNMLE1BQU0sTUFBSyxDQUFhLEVBQTBCO1lBQ2hELElBQUksT0FBTyxNQUFNLElBQUksR0FBRztnQkFDdEIsTUFBTSxTQUFTLE1BQU0sU0FBUyxJQUFJO2dCQUNsQyxJQUFJLE9BQU8sSUFBSSxFQUFFO29CQUNmLE9BQU8sSUFBSTtnQkFDYixPQUFPO29CQUNMLElBQUksT0FBTyxLQUFLLENBQUMsVUFBVSxJQUFJLEVBQUUsVUFBVSxFQUFFO3dCQUMzQyxFQUFFLEdBQUcsQ0FBQyxPQUFPLEtBQUs7d0JBQ2xCLE9BQU8sT0FBTyxLQUFLLENBQUMsVUFBVTtvQkFDaEMsQ0FBQztvQkFDRCxFQUFFLEdBQUcsQ0FBQyxPQUFPLEtBQUssQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLFVBQVU7b0JBQzNDLE1BQU0sU0FBUyxRQUFRLE9BQU8sS0FBSyxDQUFDLFFBQVEsQ0FBQyxFQUFFLFVBQVU7b0JBQ3pELE9BQU8sRUFBRSxVQUFVO2dCQUNyQixDQUFDO1lBQ0gsT0FBTztnQkFDTCxNQUFNLElBQUksTUFBTSxPQUFPLElBQUksQ0FBQztnQkFDNUIsSUFBSSxLQUFLLElBQUksRUFBRTtvQkFDYixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUM7Z0JBQ25CLENBQUM7Z0JBQ0QsT0FBTztZQUNULENBQUM7UUFDSDtJQUNGO0FBQ0YsQ0FBQyJ9