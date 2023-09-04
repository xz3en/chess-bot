import { Buffer } from "../vendor/https/deno.land/std/io/buffer.ts";
import { EOFError, ErrorReplyError, InvalidStateError } from "../errors.ts";
import { decoder } from "./_util.ts";
const IntegerReplyCode = ":".charCodeAt(0);
const BulkReplyCode = "$".charCodeAt(0);
const SimpleStringCode = "+".charCodeAt(0);
const ArrayReplyCode = "*".charCodeAt(0);
const ErrorReplyCode = "-".charCodeAt(0);
export const replyTypes = {
    Integer: "integer",
    SimpleString: "simple string",
    Array: "array",
    BulkString: "bulk string"
};
export function unwrapReply(reply) {
    if (reply instanceof ErrorReplyError) {
        return reply;
    }
    return reply.value();
}
export function createSimpleStringReply(status) {
    return new SimpleStringReply(status);
}
export function readArrayReply(reader) {
    return ArrayReply.decode(reader);
}
export async function readReply(reader) {
    const res = await reader.peek(1);
    if (res === null) {
        throw new EOFError();
    }
    switch(res[0]){
        case IntegerReplyCode:
            return await IntegerReply.decode(reader);
        case SimpleStringCode:
            return await SimpleStringReply.decode(reader);
        case BulkReplyCode:
            return await BulkReply.decode(reader);
        case ArrayReplyCode:
            return await ArrayReply.decode(reader);
        case ErrorReplyCode:
            tryParseErrorReply(await readLine(reader));
    }
    throw new InvalidStateError();
}
class IntegerReply {
    #integer;
    constructor(integer){
        this.#integer = integer;
    }
    static async decode(reader) {
        const line = await readLine(reader);
        if (line[0] === ":") {
            const str = line.substr(1, line.length - 3);
            return new IntegerReply(parseInt(str));
        }
        tryParseErrorReply(line);
    }
    get type() {
        return replyTypes.Integer;
    }
    value() {
        return this.#integer;
    }
}
class BulkReply {
    #buffer;
    constructor(buffer){
        this.#buffer = buffer;
    }
    static nil() {
        return new BulkReply(undefined);
    }
    static async decode(reader) {
        const line = await readLine(reader);
        if (line[0] !== "$") {
            tryParseErrorReply(line);
        }
        const sizeStr = line.substr(1, line.length - 3);
        const size = parseInt(sizeStr);
        if (size < 0) {
            // nil bulk reply
            return BulkReply.nil();
        }
        const dest = new Uint8Array(size + 2);
        await reader.readFull(dest);
        return new BulkReply(dest);
    }
    get type() {
        return replyTypes.BulkString;
    }
    value() {
        return this.#buffer ? decoder.decode(this.#buffer.subarray(0, this.#buffer.length - 2)) : undefined;
    }
    buffer() {
        return this.#buffer?.subarray(0, this.#buffer.length - 2);
    }
}
class SimpleStringReply {
    #status;
    constructor(status){
        this.#status = status;
    }
    static async decode(reader) {
        const line = await readLine(reader);
        if (line[0] === "+") {
            return new SimpleStringReply(line.substr(1, line.length - 3));
        }
        tryParseErrorReply(line);
    }
    get type() {
        return replyTypes.SimpleString;
    }
    value() {
        return this.#status;
    }
}
class ArrayReply {
    #array;
    constructor(array){
        this.#array = array;
    }
    static async decode(reader) {
        const line = await readLine(reader);
        const argCount = parseInt(line.substr(1, line.length - 3));
        const result = [];
        for(let i = 0; i < argCount; i++){
            const res = await reader.peek(1);
            if (res === null) {
                throw new EOFError();
            }
            switch(res[0]){
                case SimpleStringCode:
                    {
                        const reply = await SimpleStringReply.decode(reader);
                        result.push(reply.value());
                        break;
                    }
                case BulkReplyCode:
                    {
                        const reply1 = await BulkReply.decode(reader);
                        result.push(reply1.value());
                        break;
                    }
                case IntegerReplyCode:
                    {
                        const reply2 = await IntegerReply.decode(reader);
                        result.push(reply2.value());
                        break;
                    }
                case ArrayReplyCode:
                    {
                        const reply3 = await ArrayReply.decode(reader);
                        result.push(reply3.value());
                        break;
                    }
            }
        }
        return new ArrayReply(result);
    }
    get type() {
        return replyTypes.Array;
    }
    value() {
        return this.#array;
    }
}
function tryParseErrorReply(line) {
    const code = line[0];
    if (code === "-") {
        throw new ErrorReplyError(line);
    }
    throw new Error(`invalid line: ${line}`);
}
// TODO Consider using `std/io/bufio.ts` instead
async function readLine(reader) {
    const buf = new Uint8Array(1024);
    let loc = 0;
    let d = null;
    while((d = await reader.readByte()) && d !== null){
        if (d === "\r".charCodeAt(0)) {
            const d1 = await reader.readByte();
            if (d1 === "\n".charCodeAt(0)) {
                buf[loc++] = d;
                buf[loc++] = d1;
                return decoder.decode(new Buffer(buf.subarray(0, loc)).bytes());
            }
        }
        buf[loc++] = d;
    }
    throw new InvalidStateError();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMjUuMS9wcm90b2NvbC9yZXBseS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCdWZmZXIsIEJ1ZlJlYWRlciB9IGZyb20gXCIuLi92ZW5kb3IvaHR0cHMvZGVuby5sYW5kL3N0ZC9pby9idWZmZXIudHNcIjtcbmltcG9ydCB0eXBlICogYXMgdHlwZXMgZnJvbSBcIi4vdHlwZXMudHNcIjtcbmltcG9ydCB7IEVPRkVycm9yLCBFcnJvclJlcGx5RXJyb3IsIEludmFsaWRTdGF0ZUVycm9yIH0gZnJvbSBcIi4uL2Vycm9ycy50c1wiO1xuaW1wb3J0IHsgZGVjb2RlciB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5cbmNvbnN0IEludGVnZXJSZXBseUNvZGUgPSBcIjpcIi5jaGFyQ29kZUF0KDApO1xuY29uc3QgQnVsa1JlcGx5Q29kZSA9IFwiJFwiLmNoYXJDb2RlQXQoMCk7XG5jb25zdCBTaW1wbGVTdHJpbmdDb2RlID0gXCIrXCIuY2hhckNvZGVBdCgwKTtcbmNvbnN0IEFycmF5UmVwbHlDb2RlID0gXCIqXCIuY2hhckNvZGVBdCgwKTtcbmNvbnN0IEVycm9yUmVwbHlDb2RlID0gXCItXCIuY2hhckNvZGVBdCgwKTtcblxuZXhwb3J0IGNvbnN0IHJlcGx5VHlwZXMgPSB7XG4gIEludGVnZXI6IFwiaW50ZWdlclwiLFxuICBTaW1wbGVTdHJpbmc6IFwic2ltcGxlIHN0cmluZ1wiLFxuICBBcnJheTogXCJhcnJheVwiLFxuICBCdWxrU3RyaW5nOiBcImJ1bGsgc3RyaW5nXCIsXG59IGFzIGNvbnN0O1xuXG5leHBvcnQgZnVuY3Rpb24gdW53cmFwUmVwbHkoXG4gIHJlcGx5OiB0eXBlcy5SZWRpc1JlcGx5T3JFcnJvcixcbik6IHR5cGVzLlJhdyB8IEVycm9yUmVwbHlFcnJvciB7XG4gIGlmIChyZXBseSBpbnN0YW5jZW9mIEVycm9yUmVwbHlFcnJvcikge1xuICAgIHJldHVybiByZXBseTtcbiAgfVxuICByZXR1cm4gcmVwbHkudmFsdWUoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNpbXBsZVN0cmluZ1JlcGx5KFxuICBzdGF0dXM6IHN0cmluZyxcbik6IHR5cGVzLlNpbXBsZVN0cmluZ1JlcGx5IHtcbiAgcmV0dXJuIG5ldyBTaW1wbGVTdHJpbmdSZXBseShzdGF0dXMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVhZEFycmF5UmVwbHkocmVhZGVyOiBCdWZSZWFkZXIpOiBQcm9taXNlPHR5cGVzLkFycmF5UmVwbHk+IHtcbiAgcmV0dXJuIEFycmF5UmVwbHkuZGVjb2RlKHJlYWRlcik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZWFkUmVwbHkoXG4gIHJlYWRlcjogQnVmUmVhZGVyLFxuKTogUHJvbWlzZTx0eXBlcy5SZWRpc1JlcGx5PiB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IHJlYWRlci5wZWVrKDEpO1xuICBpZiAocmVzID09PSBudWxsKSB7XG4gICAgdGhyb3cgbmV3IEVPRkVycm9yKCk7XG4gIH1cbiAgc3dpdGNoIChyZXNbMF0pIHtcbiAgICBjYXNlIEludGVnZXJSZXBseUNvZGU6XG4gICAgICByZXR1cm4gYXdhaXQgSW50ZWdlclJlcGx5LmRlY29kZShyZWFkZXIpO1xuICAgIGNhc2UgU2ltcGxlU3RyaW5nQ29kZTpcbiAgICAgIHJldHVybiBhd2FpdCBTaW1wbGVTdHJpbmdSZXBseS5kZWNvZGUocmVhZGVyKTtcbiAgICBjYXNlIEJ1bGtSZXBseUNvZGU6XG4gICAgICByZXR1cm4gYXdhaXQgQnVsa1JlcGx5LmRlY29kZShyZWFkZXIpO1xuICAgIGNhc2UgQXJyYXlSZXBseUNvZGU6XG4gICAgICByZXR1cm4gYXdhaXQgQXJyYXlSZXBseS5kZWNvZGUocmVhZGVyKTtcbiAgICBjYXNlIEVycm9yUmVwbHlDb2RlOlxuICAgICAgdHJ5UGFyc2VFcnJvclJlcGx5KGF3YWl0IHJlYWRMaW5lKHJlYWRlcikpO1xuICB9XG4gIHRocm93IG5ldyBJbnZhbGlkU3RhdGVFcnJvcigpO1xufVxuXG5jbGFzcyBJbnRlZ2VyUmVwbHkgaW1wbGVtZW50cyB0eXBlcy5JbnRlZ2VyUmVwbHkge1xuICAjaW50ZWdlcjogdHlwZXMuSW50ZWdlcjtcblxuICBjb25zdHJ1Y3RvcihpbnRlZ2VyOiB0eXBlcy5JbnRlZ2VyKSB7XG4gICAgdGhpcy4jaW50ZWdlciA9IGludGVnZXI7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgZGVjb2RlKHJlYWRlcjogQnVmUmVhZGVyKTogUHJvbWlzZTx0eXBlcy5JbnRlZ2VyUmVwbHk+IHtcbiAgICBjb25zdCBsaW5lID0gYXdhaXQgcmVhZExpbmUocmVhZGVyKTtcbiAgICBpZiAobGluZVswXSA9PT0gXCI6XCIpIHtcbiAgICAgIGNvbnN0IHN0ciA9IGxpbmUuc3Vic3RyKDEsIGxpbmUubGVuZ3RoIC0gMyk7XG4gICAgICByZXR1cm4gbmV3IEludGVnZXJSZXBseShwYXJzZUludChzdHIpKTtcbiAgICB9XG4gICAgdHJ5UGFyc2VFcnJvclJlcGx5KGxpbmUpO1xuICB9XG5cbiAgZ2V0IHR5cGUoKTogXCJpbnRlZ2VyXCIge1xuICAgIHJldHVybiByZXBseVR5cGVzLkludGVnZXI7XG4gIH1cblxuICB2YWx1ZSgpOiB0eXBlcy5JbnRlZ2VyIHtcbiAgICByZXR1cm4gdGhpcy4jaW50ZWdlcjtcbiAgfVxufVxuXG5jbGFzcyBCdWxrUmVwbHkgaW1wbGVtZW50cyB0eXBlcy5CdWxrUmVwbHkge1xuICAjYnVmZmVyPzogVWludDhBcnJheTtcblxuICBjb25zdHJ1Y3RvcihidWZmZXI6IFVpbnQ4QXJyYXkgfCB0eXBlcy5CdWxrTmlsKSB7XG4gICAgdGhpcy4jYnVmZmVyID0gYnVmZmVyO1xuICB9XG5cbiAgc3RhdGljIG5pbCgpOiB0eXBlcy5CdWxrUmVwbHkge1xuICAgIHJldHVybiBuZXcgQnVsa1JlcGx5KHVuZGVmaW5lZCk7XG4gIH1cblxuICBzdGF0aWMgYXN5bmMgZGVjb2RlKHJlYWRlcjogQnVmUmVhZGVyKTogUHJvbWlzZTx0eXBlcy5CdWxrUmVwbHk+IHtcbiAgICBjb25zdCBsaW5lID0gYXdhaXQgcmVhZExpbmUocmVhZGVyKTtcbiAgICBpZiAobGluZVswXSAhPT0gXCIkXCIpIHtcbiAgICAgIHRyeVBhcnNlRXJyb3JSZXBseShsaW5lKTtcbiAgICB9XG4gICAgY29uc3Qgc2l6ZVN0ciA9IGxpbmUuc3Vic3RyKDEsIGxpbmUubGVuZ3RoIC0gMyk7XG4gICAgY29uc3Qgc2l6ZSA9IHBhcnNlSW50KHNpemVTdHIpO1xuICAgIGlmIChzaXplIDwgMCkge1xuICAgICAgLy8gbmlsIGJ1bGsgcmVwbHlcbiAgICAgIHJldHVybiBCdWxrUmVwbHkubmlsKCk7XG4gICAgfVxuICAgIGNvbnN0IGRlc3QgPSBuZXcgVWludDhBcnJheShzaXplICsgMik7XG4gICAgYXdhaXQgcmVhZGVyLnJlYWRGdWxsKGRlc3QpO1xuICAgIHJldHVybiBuZXcgQnVsa1JlcGx5KGRlc3QpO1xuICB9XG5cbiAgZ2V0IHR5cGUoKTogXCJidWxrIHN0cmluZ1wiIHtcbiAgICByZXR1cm4gcmVwbHlUeXBlcy5CdWxrU3RyaW5nO1xuICB9XG5cbiAgdmFsdWUoKTogdHlwZXMuQnVsayB7XG4gICAgcmV0dXJuIHRoaXMuI2J1ZmZlclxuICAgICAgPyBkZWNvZGVyLmRlY29kZSh0aGlzLiNidWZmZXIuc3ViYXJyYXkoMCwgdGhpcy4jYnVmZmVyLmxlbmd0aCAtIDIpKVxuICAgICAgOiB1bmRlZmluZWQ7XG4gIH1cblxuICBidWZmZXIoKTogVWludDhBcnJheSB8IHR5cGVzLkJ1bGtOaWwge1xuICAgIHJldHVybiB0aGlzLiNidWZmZXI/LnN1YmFycmF5KDAsIHRoaXMuI2J1ZmZlci5sZW5ndGggLSAyKTtcbiAgfVxufVxuXG5jbGFzcyBTaW1wbGVTdHJpbmdSZXBseSBpbXBsZW1lbnRzIHR5cGVzLlNpbXBsZVN0cmluZ1JlcGx5IHtcbiAgI3N0YXR1czogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXR1czogc3RyaW5nKSB7XG4gICAgdGhpcy4jc3RhdHVzID0gc3RhdHVzO1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGRlY29kZShyZWFkZXI6IEJ1ZlJlYWRlcik6IFByb21pc2U8dHlwZXMuU2ltcGxlU3RyaW5nUmVwbHk+IHtcbiAgICBjb25zdCBsaW5lID0gYXdhaXQgcmVhZExpbmUocmVhZGVyKTtcbiAgICBpZiAobGluZVswXSA9PT0gXCIrXCIpIHtcbiAgICAgIHJldHVybiBuZXcgU2ltcGxlU3RyaW5nUmVwbHkobGluZS5zdWJzdHIoMSwgbGluZS5sZW5ndGggLSAzKSk7XG4gICAgfVxuICAgIHRyeVBhcnNlRXJyb3JSZXBseShsaW5lKTtcbiAgfVxuXG4gIGdldCB0eXBlKCk6IFwic2ltcGxlIHN0cmluZ1wiIHtcbiAgICByZXR1cm4gcmVwbHlUeXBlcy5TaW1wbGVTdHJpbmc7XG4gIH1cblxuICB2YWx1ZSgpOiB0eXBlcy5TaW1wbGVTdHJpbmcge1xuICAgIHJldHVybiB0aGlzLiNzdGF0dXM7XG4gIH1cbn1cblxuY2xhc3MgQXJyYXlSZXBseSBpbXBsZW1lbnRzIHR5cGVzLkFycmF5UmVwbHkge1xuICAjYXJyYXk6IHR5cGVzLkNvbmRpdGlvbmFsQXJyYXk7XG5cbiAgY29uc3RydWN0b3IoYXJyYXk6IHR5cGVzLkNvbmRpdGlvbmFsQXJyYXkpIHtcbiAgICB0aGlzLiNhcnJheSA9IGFycmF5O1xuICB9XG5cbiAgc3RhdGljIGFzeW5jIGRlY29kZShyZWFkZXI6IEJ1ZlJlYWRlcik6IFByb21pc2U8dHlwZXMuQXJyYXlSZXBseT4ge1xuICAgIGNvbnN0IGxpbmUgPSBhd2FpdCByZWFkTGluZShyZWFkZXIpO1xuICAgIGNvbnN0IGFyZ0NvdW50ID0gcGFyc2VJbnQobGluZS5zdWJzdHIoMSwgbGluZS5sZW5ndGggLSAzKSk7XG4gICAgY29uc3QgcmVzdWx0OiB0eXBlcy5Db25kaXRpb25hbEFycmF5ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcmdDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCByZXMgPSBhd2FpdCByZWFkZXIucGVlaygxKTtcbiAgICAgIGlmIChyZXMgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVPRkVycm9yKCk7XG4gICAgICB9XG4gICAgICBzd2l0Y2ggKHJlc1swXSkge1xuICAgICAgICBjYXNlIFNpbXBsZVN0cmluZ0NvZGU6IHtcbiAgICAgICAgICBjb25zdCByZXBseSA9IGF3YWl0IFNpbXBsZVN0cmluZ1JlcGx5LmRlY29kZShyZWFkZXIpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHJlcGx5LnZhbHVlKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgQnVsa1JlcGx5Q29kZToge1xuICAgICAgICAgIGNvbnN0IHJlcGx5ID0gYXdhaXQgQnVsa1JlcGx5LmRlY29kZShyZWFkZXIpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHJlcGx5LnZhbHVlKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgSW50ZWdlclJlcGx5Q29kZToge1xuICAgICAgICAgIGNvbnN0IHJlcGx5ID0gYXdhaXQgSW50ZWdlclJlcGx5LmRlY29kZShyZWFkZXIpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHJlcGx5LnZhbHVlKCkpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgQXJyYXlSZXBseUNvZGU6IHtcbiAgICAgICAgICBjb25zdCByZXBseSA9IGF3YWl0IEFycmF5UmVwbHkuZGVjb2RlKHJlYWRlcik7XG4gICAgICAgICAgcmVzdWx0LnB1c2gocmVwbHkudmFsdWUoKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG5ldyBBcnJheVJlcGx5KHJlc3VsdCk7XG4gIH1cblxuICBnZXQgdHlwZSgpOiBcImFycmF5XCIge1xuICAgIHJldHVybiByZXBseVR5cGVzLkFycmF5O1xuICB9XG5cbiAgdmFsdWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuI2FycmF5O1xuICB9XG59XG5cbmZ1bmN0aW9uIHRyeVBhcnNlRXJyb3JSZXBseShsaW5lOiBzdHJpbmcpOiBuZXZlciB7XG4gIGNvbnN0IGNvZGUgPSBsaW5lWzBdO1xuICBpZiAoY29kZSA9PT0gXCItXCIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3JSZXBseUVycm9yKGxpbmUpO1xuICB9XG4gIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBsaW5lOiAke2xpbmV9YCk7XG59XG5cbi8vIFRPRE8gQ29uc2lkZXIgdXNpbmcgYHN0ZC9pby9idWZpby50c2AgaW5zdGVhZFxuYXN5bmMgZnVuY3Rpb24gcmVhZExpbmUocmVhZGVyOiBCdWZSZWFkZXIpOiBQcm9taXNlPHN0cmluZz4ge1xuICBjb25zdCBidWYgPSBuZXcgVWludDhBcnJheSgxMDI0KTtcbiAgbGV0IGxvYyA9IDA7XG4gIGxldCBkOiBudW1iZXIgfCBudWxsID0gbnVsbDtcbiAgd2hpbGUgKChkID0gYXdhaXQgcmVhZGVyLnJlYWRCeXRlKCkpICYmIGQgIT09IG51bGwpIHtcbiAgICBpZiAoZCA9PT0gXCJcXHJcIi5jaGFyQ29kZUF0KDApKSB7XG4gICAgICBjb25zdCBkMSA9IGF3YWl0IHJlYWRlci5yZWFkQnl0ZSgpO1xuICAgICAgaWYgKGQxID09PSBcIlxcblwiLmNoYXJDb2RlQXQoMCkpIHtcbiAgICAgICAgYnVmW2xvYysrXSA9IGQ7XG4gICAgICAgIGJ1Zltsb2MrK10gPSBkMTtcbiAgICAgICAgcmV0dXJuIGRlY29kZXIuZGVjb2RlKG5ldyBCdWZmZXIoYnVmLnN1YmFycmF5KDAsIGxvYykpLmJ5dGVzKCkpO1xuICAgICAgfVxuICAgIH1cbiAgICBidWZbbG9jKytdID0gZDtcbiAgfVxuICB0aHJvdyBuZXcgSW52YWxpZFN0YXRlRXJyb3IoKTtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLE1BQU0sUUFBbUIsNkNBQTZDO0FBRS9FLFNBQVMsUUFBUSxFQUFFLGVBQWUsRUFBRSxpQkFBaUIsUUFBUSxlQUFlO0FBQzVFLFNBQVMsT0FB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