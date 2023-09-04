import { decode, encode } from "../deps.ts";
// core is unstable (in sense of actual stability not --unstable)
// so we'll fallback to pure js impl
// why use internal op? it's super fast
export function decodeBase64(value) {
    let res;
    try {
        res = Deno.core.opSync("op_base64_decode", value);
    } catch (e) {
        res = decode(value);
    }
    return res;
}
export function encodeBase64(value) {
    let res;
    try {
        res = Deno.core.opSync("op_base64_encode", value);
    } catch (e) {
        res = encode(value);
    }
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvY2FudmFzQHYxLjQuMS9zcmMvYmFzZTY0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlY29kZSwgZW5jb2RlIH0gZnJvbSBcIi4uL2RlcHMudHNcIjtcblxuLy8gY29yZSBpcyB1bnN0YWJsZSAoaW4gc2Vuc2Ugb2YgYWN0dWFsIHN0YWJpbGl0eSBub3QgLS11bnN0YWJsZSlcbi8vIHNvIHdlJ2xsIGZhbGxiYWNrIHRvIHB1cmUganMgaW1wbFxuLy8gd2h5IHVzZSBpbnRlcm5hbCBvcD8gaXQncyBzdXBlciBmYXN0XG5cbmV4cG9ydCBmdW5jdGlvbiBkZWNvZGVCYXNlNjQodmFsdWU6IHN0cmluZyk6IFVpbnQ4QXJyYXkge1xuICBsZXQgcmVzO1xuICB0cnkge1xuICAgIHJlcyA9IChEZW5vIGFzIGFueSkuY29yZS5vcFN5bmMoXCJvcF9iYXNlNjRfZGVjb2RlXCIsIHZhbHVlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJlcyA9IGRlY29kZSh2YWx1ZSk7XG4gIH1cbiAgcmV0dXJuIHJlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZUJhc2U2NCh2YWx1ZTogVWludDhBcnJheSk6IHN0cmluZyB7XG4gIGxldCByZXM7XG4gIHRyeSB7XG4gICAgcmVzID0gKERlbm8gYXMgYW55KS5jb3JlLm9wU3luYyhcIm9wX2Jhc2U2NF9lbmNvZGVcIiwgdmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmVzID0gZW5jb2RlKHZhbHVlKTtcbiAgfVxuICByZXR1cm4gcmVzO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsTUFBTSxFQUFFLE1BQU0sUUFBUSxhQUFhO0FBRTVDLGlFQUFpRTtBQUNqRSxvQ0FBb0M7QUFDcEMsdUNBQXVDO0FBRXZDLE9BQU8sU0FBUyxhQUFhLEtBQWEsRUFBYztJQUN0RCxJQUFJO0lBQ0osSUFBSTtRQUNGLE1BQU0sQUFBQyxLQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsb0JBQW9CO0lBQ3RELEVBQUUsT0FBTyxHQUFHO1FBQ1YsTUFBTSxPQUFPO0lBQ2Y7SUFDQSxPQUFPO0FBQ1QsQ0FBQztBQUVELE9BQU8sU0FBUyxhQUFhLEtBQWlCLEVBQVU7SUFDdEQsSUFBSTtJQUNKLElBQUk7UUFDRixNQUFNLEFBQUMsS0FBYSxJQUFJLENBQUMsTUFBTSxDQUFDLG9CQUFvQjtJQUN0RCxFQUFFLE9BQU8sR0FBRztRQUNWLE1BQU0sT0FBTztJQUNmO0lBQ0EsT0FBTztBQUNULENBQUMifQ==