import { readReply } from "./reply.ts";
import { ErrorReplyError } from "../errors.ts";
import { encoder } from "./_util.ts";
const CRLF = encoder.encode("\r\n");
const ArrayCode = encoder.encode("*");
const BulkCode = encoder.encode("$");
async function writeRequest(writer, command, args) {
    const _args = args.filter((v)=>v !== void 0 && v !== null);
    await writer.write(ArrayCode);
    await writer.write(encoder.encode(String(1 + _args.length)));
    await writer.write(CRLF);
    await writer.write(BulkCode);
    await writer.write(encoder.encode(String(command.length)));
    await writer.write(CRLF);
    await writer.write(encoder.encode(command));
    await writer.write(CRLF);
    for (const arg of _args){
        const bytes = arg instanceof Uint8Array ? arg : encoder.encode(String(arg));
        const bytesLen = bytes.byteLength;
        await writer.write(BulkCode);
        await writer.write(encoder.encode(String(bytesLen)));
        await writer.write(CRLF);
        await writer.write(bytes);
        await writer.write(CRLF);
    }
}
export async function sendCommand(writer, reader, command, ...args) {
    await writeRequest(writer, command, args);
    await writer.flush();
    return readReply(reader);
}
export async function sendCommands(writer, reader, commands) {
    for (const { command , args  } of commands){
        await writeRequest(writer, command, args);
    }
    await writer.flush();
    const ret = [];
    for(let i = 0; i < commands.length; i++){
        try {
            const rep = await readReply(reader);
            ret.push(rep);
        } catch (e) {
            if (e instanceof ErrorReplyError) {
                ret.push(e);
            } else {
                throw e;
            }
        }
    }
    return ret;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMjUuMS9wcm90b2NvbC9jb21tYW5kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIEJ1ZlJlYWRlcixcbiAgQnVmV3JpdGVyLFxufSBmcm9tIFwiLi4vdmVuZG9yL2h0dHBzL2Rlbm8ubGFuZC9zdGQvaW8vYnVmZmVyLnRzXCI7XG5pbXBvcnQgeyByZWFkUmVwbHkgfSBmcm9tIFwiLi9yZXBseS50c1wiO1xuaW1wb3J0IHsgRXJyb3JSZXBseUVycm9yIH0gZnJvbSBcIi4uL2Vycm9ycy50c1wiO1xuaW1wb3J0IHsgZW5jb2RlciB9IGZyb20gXCIuL191dGlsLnRzXCI7XG5pbXBvcnQgdHlwZSB7IFJlZGlzUmVwbHksIFJlZGlzUmVwbHlPckVycm9yLCBSZWRpc1ZhbHVlIH0gZnJvbSBcIi4vdHlwZXMudHNcIjtcblxuY29uc3QgQ1JMRiA9IGVuY29kZXIuZW5jb2RlKFwiXFxyXFxuXCIpO1xuY29uc3QgQXJyYXlDb2RlID0gZW5jb2Rlci5lbmNvZGUoXCIqXCIpO1xuY29uc3QgQnVsa0NvZGUgPSBlbmNvZGVyLmVuY29kZShcIiRcIik7XG5cbmFzeW5jIGZ1bmN0aW9uIHdyaXRlUmVxdWVzdChcbiAgd3JpdGVyOiBCdWZXcml0ZXIsXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgYXJnczogUmVkaXNWYWx1ZVtdLFxuKSB7XG4gIGNvbnN0IF9hcmdzID0gYXJncy5maWx0ZXIoKHYpID0+IHYgIT09IHZvaWQgMCAmJiB2ICE9PSBudWxsKTtcbiAgYXdhaXQgd3JpdGVyLndyaXRlKEFycmF5Q29kZSk7XG4gIGF3YWl0IHdyaXRlci53cml0ZShlbmNvZGVyLmVuY29kZShTdHJpbmcoMSArIF9hcmdzLmxlbmd0aCkpKTtcbiAgYXdhaXQgd3JpdGVyLndyaXRlKENSTEYpO1xuICBhd2FpdCB3cml0ZXIud3JpdGUoQnVsa0NvZGUpO1xuICBhd2FpdCB3cml0ZXIud3JpdGUoZW5jb2Rlci5lbmNvZGUoU3RyaW5nKGNvbW1hbmQubGVuZ3RoKSkpO1xuICBhd2FpdCB3cml0ZXIud3JpdGUoQ1JMRik7XG4gIGF3YWl0IHdyaXRlci53cml0ZShlbmNvZGVyLmVuY29kZShjb21tYW5kKSk7XG4gIGF3YWl0IHdyaXRlci53cml0ZShDUkxGKTtcbiAgZm9yIChjb25zdCBhcmcgb2YgX2FyZ3MpIHtcbiAgICBjb25zdCBieXRlcyA9IGFyZyBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkgPyBhcmcgOiBlbmNvZGVyLmVuY29kZShTdHJpbmcoYXJnKSk7XG4gICAgY29uc3QgYnl0ZXNMZW4gPSBieXRlcy5ieXRlTGVuZ3RoO1xuICAgIGF3YWl0IHdyaXRlci53cml0ZShCdWxrQ29kZSk7XG4gICAgYXdhaXQgd3JpdGVyLndyaXRlKGVuY29kZXIuZW5jb2RlKFN0cmluZyhieXRlc0xlbikpKTtcbiAgICBhd2FpdCB3cml0ZXIud3JpdGUoQ1JMRik7XG4gICAgYXdhaXQgd3JpdGVyLndyaXRlKGJ5dGVzKTtcbiAgICBhd2FpdCB3cml0ZXIud3JpdGUoQ1JMRik7XG4gIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIHNlbmRDb21tYW5kKFxuICB3cml0ZXI6IEJ1ZldyaXRlcixcbiAgcmVhZGVyOiBCdWZSZWFkZXIsXG4gIGNvbW1hbmQ6IHN0cmluZyxcbiAgLi4uYXJnczogUmVkaXNWYWx1ZVtdXG4pOiBQcm9taXNlPFJlZGlzUmVwbHk+IHtcbiAgYXdhaXQgd3JpdGVSZXF1ZXN0KHdyaXRlciwgY29tbWFuZCwgYXJncyk7XG4gIGF3YWl0IHdyaXRlci5mbHVzaCgpO1xuICByZXR1cm4gcmVhZFJlcGx5KHJlYWRlcik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBzZW5kQ29tbWFuZHMoXG4gIHdyaXRlcjogQnVmV3JpdGVyLFxuICByZWFkZXI6IEJ1ZlJlYWRlcixcbiAgY29tbWFuZHM6IHtcbiAgICBjb21tYW5kOiBzdHJpbmc7XG4gICAgYXJnczogUmVkaXNWYWx1ZVtdO1xuICB9W10sXG4pOiBQcm9taXNlPFJlZGlzUmVwbHlPckVycm9yW10+IHtcbiAgZm9yIChjb25zdCB7IGNvbW1hbmQsIGFyZ3MgfSBvZiBjb21tYW5kcykge1xuICAgIGF3YWl0IHdyaXRlUmVxdWVzdCh3cml0ZXIsIGNvbW1hbmQsIGFyZ3MpO1xuICB9XG4gIGF3YWl0IHdyaXRlci5mbHVzaCgpO1xuICBjb25zdCByZXQ6IFJlZGlzUmVwbHlPckVycm9yW10gPSBbXTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21tYW5kcy5sZW5ndGg7IGkrKykge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXAgPSBhd2FpdCByZWFkUmVwbHkocmVhZGVyKTtcbiAgICAgIHJldC5wdXNoKHJlcCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKGUgaW5zdGFuY2VvZiBFcnJvclJlcGx5RXJyb3IpIHtcbiAgICAgICAgcmV0LnB1c2goZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gcmV0O1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUlBLFNBQVMsU0FBUyxRQUFRLGFBQWE7QUFDdkMsU0FBUyxlQUFlLFFBQVEsZUFBZTtBQUMvQyxTQUFTLE9BQU8sUUFBUSxhQUFhO0FBR3JDLE1BQU0sT0FBTyxRQUFRLE1BQU0sQ0FBQztBQUM1QixNQUFNLFlBQVksUUFBUSxNQUFNLENBQUM7QUFDakMsTUFBTSxXQUFXLFFBQVEsTUFBTSxDQUFDO0FBRWhDLGVBQWUsYUFDYixNQUFpQixFQUNqQixPQUFlLEVBQ2YsSUFBa0IsRUFDbEI7SUFDQSxNQUFNLFFBQVEsS0FBSyxNQUFNLENBQUMsQ0FBQyxJQUFNLE1BQU0sS0FBSyxLQUFLLE1BQU0sSUFBSTtJQUMzRCxNQUFNLE9BQU8sS0FBSyxDQUFDO0lBQ25CLE1BQU0sT0FBTyxLQUFLLENBQUMsUUFBUSxNQUFNLENBQUMsT0FBTyxJQUFJLE1BQU0sTUFBTTtJQUN6RCxNQUFNLE9BQU8sS0FBSyxDQUFDO0lBQ25CLE1BQU0sT0FBTyxLQUFLLENBQUM7SUFDbkIsTUFBTSxPQUFPLEtBQUssQ0FBQyxRQUFRLE1BQU0sQ0FBQyxPQUFPLFFBQVEsTUFBTTtJQUN2RCxNQUFNLE9BQU8sS0FBSyxDQUFDO0lBQ25CLE1BQU0sT0FBTyxLQUFLLENBQUMsUUFBUSxNQUFNLENBQUM7SUFDbEMsTUFBTSxPQUFPLEtBQUssQ0FBQztJQUNuQixLQUFLLE1BQU0sT0FBTyxNQUFPO1FBQ3ZCLE1BQU0sUUFBUSxlQUFlLGFBQWEsTUFBTSxRQUFRLE1BQU0sQ0FBQyxPQUFPLEtBQUs7UUFDM0UsTUFBTSxXQUFXLE1BQU0sVUFBVTtRQUNqQyxNQUFNLE9BQU8sS0FBSyxDQUFDO1FBQ25CLE1BQU0sT0FBTyxLQUFLLENBQUMsUUFBUSxNQUFNLENBQUMsT0FBTztRQUN6QyxNQUFNLE9BQU8sS0FBSyxDQUFDO1FBQ25CLE1BQU0sT0FBTyxLQUFLLENBQUM7UUFDbkIsTUFBTSxPQUFPLEtBQUssQ0FBQztJQUNyQjtBQUNGO0FBRUEsT0FBTyxlQUFlLFlBQ3BCLE1BQWlCLEVBQ2pCLE1BQWlCLEVBQ2pCLE9BQWUsRUFDZixHQUFHLElBQWtCLEVBQ0E7SUFDckIsTUFBTSxhQUFhLFFBQVEsU0FBUztJQUNwQyxNQUFNLE9BQU8sS0FBSztJQUNsQixPQUFPLFVBQVU7QUFDbkIsQ0FBQztBQUVELE9BQU8sZUFBZSxhQUNwQixNQUFpQixFQUNqQixNQUFpQixFQUNqQixRQUdHLEVBQzJCO0lBQzlCLEtBQUssTUFBTSxFQUFFLFFBQU8sRUFBRSxLQUFJLEVBQUUsSUFBSSxTQUFVO1FBQ3hDLE1BQU0sYUFBYSxRQUFRLFNBQVM7SUFDdEM7SUFDQSxNQUFNLE9BQU8sS0FBSztJQUNsQixNQUFNLE1BQTJCLEVBQUU7SUFDbkMsSUFBSyxJQUFJLElBQUksR0FBRyxJQUFJLFNBQVMsTUFBTSxFQUFFLElBQUs7UUFDeEMsSUFBSTtZQUNGLE1BQU0sTUFBTSxNQUFNLFVBQVU7WUFDNUIsSUFBSSxJQUFJLENBQUM7UUFDWCxFQUFFLE9BQU8sR0FBRztZQUNWLElBQUksYUFBYSxpQkFBaUI7Z0JBQ2hDLElBQUksSUFBSSxDQUFDO1lBQ1gsT0FBTztnQkFDTCxNQUFNLEVBQUU7WUFDVixDQUFDO1FBQ0g7SUFDRjtJQUNBLE9BQU87QUFDVCxDQUFDIn0=