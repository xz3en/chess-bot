import { sendCommand } from "./protocol/mod.ts";
import { BufReader, BufWriter } from "./vendor/https/deno.land/std/io/buffer.ts";
export class RedisConnection {
    name;
    closer;
    reader;
    writer;
    maxRetryCount;
    retryInterval;
    retryCount;
    _isClosed;
    _isConnected;
    connectThunkified;
    get isClosed() {
        return this._isClosed;
    }
    get isConnected() {
        return this._isConnected;
    }
    get isRetriable() {
        return this.maxRetryCount > 0;
    }
    constructor(hostname, port, options){
        this.options = options;
        this.name = null;
        this.maxRetryCount = 0;
        this.retryInterval = 1200;
        this.retryCount = 0;
        this._isClosed = false;
        this._isConnected = false;
        this.connectThunkified = this.thunkifyConnect(hostname, port, options);
    }
    thunkifyConnect(hostname, port, options) {
        return async ()=>{
            const dialOpts = {
                hostname,
                port: parsePortLike(port)
            };
            const conn = options?.tls ? await Deno.connectTls(dialOpts) : await Deno.connect(dialOpts);
            if (options.name) {
                this.name = options.name;
            }
            if (options.maxRetryCount) {
                this.maxRetryCount = options.maxRetryCount;
            }
            if (options.retryInterval) {
                this.retryInterval = options.retryInterval;
            }
            this.closer = conn;
            this.reader = new BufReader(conn);
            this.writer = new BufWriter(conn);
            this._isClosed = false;
            this._isConnected = true;
            try {
                if (options?.password != null) {
                    await this.authenticate(options.password);
                }
                if (options?.db) {
                    await this.selectDb(options.db);
                }
            } catch (error) {
                this.close();
                throw error;
            }
            return this;
        };
    }
    authenticate(password) {
        return sendCommand(this.writer, this.reader, "AUTH", password);
    }
    selectDb(db = this.options.db) {
        if (!db) throw new Error("The database index is undefined.");
        return sendCommand(this.writer, this.reader, "SELECT", db);
    }
    /**
   * Connect to Redis server
   */ async connect() {
        await this.connectThunkified();
    }
    close() {
        this._isClosed = true;
        this._isConnected = false;
        try {
            this.closer.close();
        } catch (error) {
            if (!(error instanceof Deno.errors.BadResource)) throw error;
        }
    }
    async reconnect() {
        if (!this.reader.peek(1)) {
            throw new Error("Client is closed.");
        }
        try {
            await sendCommand(this.writer, this.reader, "PING");
            this._isConnected = true;
        } catch (_error) {
            this._isConnected = false;
            return new Promise((resolve, reject)=>{
                const _interval = setInterval(async ()=>{
                    if (this.retryCount > this.maxRetryCount) {
                        this.close();
                        clearInterval(_interval);
                        reject(new Error("Could not reconnect"));
                    }
                    try {
                        this.close();
                        await this.connect();
                        await sendCommand(this.writer, this.reader, "PING");
                        this._isConnected = true;
                        this.retryCount = 0;
                        clearInterval(_interval);
                        resolve();
                    } catch (_err) {
                    // retrying
                    } finally{
                        this.retryCount++;
                    }
                }, this.retryInterval);
            });
        }
    }
    forceRetry() {
        this.maxRetryCount = 10; // TODO Adjust this.
    }
    options;
}
function parsePortLike(port) {
    let parsedPort;
    if (typeof port === "string") {
        parsedPort = parseInt(port);
    } else if (typeof port === "number") {
        parsedPort = port;
    } else {
        parsedPort = 6379;
    }
    if (!Number.isSafeInteger(parsedPort)) {
        throw new Error("Port is invalid");
    }
    return parsedPort;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMjUuMS9jb25uZWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlZGlzUmVwbHksIHNlbmRDb21tYW5kIH0gZnJvbSBcIi4vcHJvdG9jb2wvbW9kLnRzXCI7XG5pbXBvcnQge1xuICBCdWZSZWFkZXIsXG4gIEJ1ZldyaXRlcixcbn0gZnJvbSBcIi4vdmVuZG9yL2h0dHBzL2Rlbm8ubGFuZC9zdGQvaW8vYnVmZmVyLnRzXCI7XG50eXBlIENsb3NlciA9IERlbm8uQ2xvc2VyO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbm5lY3Rpb24ge1xuICBjbG9zZXI6IENsb3NlcjtcbiAgcmVhZGVyOiBCdWZSZWFkZXI7XG4gIHdyaXRlcjogQnVmV3JpdGVyO1xuICBtYXhSZXRyeUNvdW50OiBudW1iZXI7XG4gIHJldHJ5SW50ZXJ2YWw6IG51bWJlcjtcbiAgaXNDbG9zZWQ6IGJvb2xlYW47XG4gIGlzQ29ubmVjdGVkOiBib29sZWFuO1xuICBpc1JldHJpYWJsZTogYm9vbGVhbjtcbiAgY2xvc2UoKTogdm9pZDtcbiAgY29ubmVjdCgpOiBQcm9taXNlPHZvaWQ+O1xuICByZWNvbm5lY3QoKTogUHJvbWlzZTx2b2lkPjtcbiAgZm9yY2VSZXRyeSgpOiB2b2lkO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlZGlzQ29ubmVjdGlvbk9wdGlvbnMge1xuICB0bHM/OiBib29sZWFuO1xuICBkYj86IG51bWJlcjtcbiAgcGFzc3dvcmQ/OiBzdHJpbmc7XG4gIG5hbWU/OiBzdHJpbmc7XG4gIG1heFJldHJ5Q291bnQ/OiBudW1iZXI7XG4gIHJldHJ5SW50ZXJ2YWw/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBjbGFzcyBSZWRpc0Nvbm5lY3Rpb24gaW1wbGVtZW50cyBDb25uZWN0aW9uIHtcbiAgbmFtZTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG4gIGNsb3NlciE6IENsb3NlcjtcbiAgcmVhZGVyITogQnVmUmVhZGVyO1xuICB3cml0ZXIhOiBCdWZXcml0ZXI7XG4gIG1heFJldHJ5Q291bnQgPSAwO1xuICByZXRyeUludGVydmFsID0gMTIwMDtcblxuICBwcml2YXRlIHJldHJ5Q291bnQgPSAwO1xuICBwcml2YXRlIF9pc0Nsb3NlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9pc0Nvbm5lY3RlZCA9IGZhbHNlO1xuICBwcml2YXRlIGNvbm5lY3RUaHVua2lmaWVkOiAoKSA9PiBQcm9taXNlPFJlZGlzQ29ubmVjdGlvbj47XG5cbiAgZ2V0IGlzQ2xvc2VkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9pc0Nsb3NlZDtcbiAgfVxuXG4gIGdldCBpc0Nvbm5lY3RlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5faXNDb25uZWN0ZWQ7XG4gIH1cblxuICBnZXQgaXNSZXRyaWFibGUoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMubWF4UmV0cnlDb3VudCA+IDA7XG4gIH1cblxuICBjb25zdHJ1Y3RvcihcbiAgICBob3N0bmFtZTogc3RyaW5nLFxuICAgIHBvcnQ6IG51bWJlciB8IHN0cmluZyxcbiAgICBwcml2YXRlIG9wdGlvbnM6IFJlZGlzQ29ubmVjdGlvbk9wdGlvbnMsXG4gICkge1xuICAgIHRoaXMuY29ubmVjdFRodW5raWZpZWQgPSB0aGlzLnRodW5raWZ5Q29ubmVjdChob3N0bmFtZSwgcG9ydCwgb3B0aW9ucyk7XG4gIH1cblxuICBwcml2YXRlIHRodW5raWZ5Q29ubmVjdChcbiAgICBob3N0bmFtZTogc3RyaW5nLFxuICAgIHBvcnQ6IHN0cmluZyB8IG51bWJlcixcbiAgICBvcHRpb25zOiBSZWRpc0Nvbm5lY3Rpb25PcHRpb25zLFxuICApOiAoKSA9PiBQcm9taXNlPFJlZGlzQ29ubmVjdGlvbj4ge1xuICAgIHJldHVybiBhc3luYyAoKSA9PiB7XG4gICAgICBjb25zdCBkaWFsT3B0czogRGVuby5Db25uZWN0T3B0aW9ucyA9IHtcbiAgICAgICAgaG9zdG5hbWUsXG4gICAgICAgIHBvcnQ6IHBhcnNlUG9ydExpa2UocG9ydCksXG4gICAgICB9O1xuICAgICAgY29uc3QgY29ubjogRGVuby5Db25uID0gb3B0aW9ucz8udGxzXG4gICAgICAgID8gYXdhaXQgRGVuby5jb25uZWN0VGxzKGRpYWxPcHRzKVxuICAgICAgICA6IGF3YWl0IERlbm8uY29ubmVjdChkaWFsT3B0cyk7XG5cbiAgICAgIGlmIChvcHRpb25zLm5hbWUpIHtcbiAgICAgICAgdGhpcy5uYW1lID0gb3B0aW9ucy5uYW1lO1xuICAgICAgfVxuICAgICAgaWYgKG9wdGlvbnMubWF4UmV0cnlDb3VudCkge1xuICAgICAgICB0aGlzLm1heFJldHJ5Q291bnQgPSBvcHRpb25zLm1heFJldHJ5Q291bnQ7XG4gICAgICB9XG4gICAgICBpZiAob3B0aW9ucy5yZXRyeUludGVydmFsKSB7XG4gICAgICAgIHRoaXMucmV0cnlJbnRlcnZhbCA9IG9wdGlvbnMucmV0cnlJbnRlcnZhbDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbG9zZXIgPSBjb25uO1xuICAgICAgdGhpcy5yZWFkZXIgPSBuZXcgQnVmUmVhZGVyKGNvbm4pO1xuICAgICAgdGhpcy53cml0ZXIgPSBuZXcgQnVmV3JpdGVyKGNvbm4pO1xuICAgICAgdGhpcy5faXNDbG9zZWQgPSBmYWxzZTtcbiAgICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gdHJ1ZTtcblxuICAgICAgdHJ5IHtcbiAgICAgICAgaWYgKG9wdGlvbnM/LnBhc3N3b3JkICE9IG51bGwpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLmF1dGhlbnRpY2F0ZShvcHRpb25zLnBhc3N3b3JkKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucz8uZGIpIHtcbiAgICAgICAgICBhd2FpdCB0aGlzLnNlbGVjdERiKG9wdGlvbnMuZGIpO1xuICAgICAgICB9XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRocm93IGVycm9yO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcyBhcyBSZWRpc0Nvbm5lY3Rpb247XG4gICAgfTtcbiAgfVxuXG4gIHByaXZhdGUgYXV0aGVudGljYXRlKHBhc3N3b3JkOiBzdHJpbmcpOiBQcm9taXNlPFJlZGlzUmVwbHk+IHtcbiAgICByZXR1cm4gc2VuZENvbW1hbmQodGhpcy53cml0ZXIsIHRoaXMucmVhZGVyLCBcIkFVVEhcIiwgcGFzc3dvcmQpO1xuICB9XG5cbiAgcHJpdmF0ZSBzZWxlY3REYihcbiAgICBkYjogbnVtYmVyIHwgdW5kZWZpbmVkID0gdGhpcy5vcHRpb25zLmRiLFxuICApOiBQcm9taXNlPFJlZGlzUmVwbHk+IHtcbiAgICBpZiAoIWRiKSB0aHJvdyBuZXcgRXJyb3IoXCJUaGUgZGF0YWJhc2UgaW5kZXggaXMgdW5kZWZpbmVkLlwiKTtcbiAgICByZXR1cm4gc2VuZENvbW1hbmQodGhpcy53cml0ZXIsIHRoaXMucmVhZGVyLCBcIlNFTEVDVFwiLCBkYik7XG4gIH1cblxuICAvKipcbiAgICogQ29ubmVjdCB0byBSZWRpcyBzZXJ2ZXJcbiAgICovXG4gIGFzeW5jIGNvbm5lY3QoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5jb25uZWN0VGh1bmtpZmllZCgpO1xuICB9XG5cbiAgY2xvc2UoKSB7XG4gICAgdGhpcy5faXNDbG9zZWQgPSB0cnVlO1xuICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gZmFsc2U7XG4gICAgdHJ5IHtcbiAgICAgIHRoaXMuY2xvc2VyIS5jbG9zZSgpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBpZiAoIShlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkJhZFJlc291cmNlKSkgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVjb25uZWN0KCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5yZWFkZXIucGVlaygxKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2xpZW50IGlzIGNsb3NlZC5cIik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBhd2FpdCBzZW5kQ29tbWFuZCh0aGlzLndyaXRlciwgdGhpcy5yZWFkZXIsIFwiUElOR1wiKTtcbiAgICAgIHRoaXMuX2lzQ29ubmVjdGVkID0gdHJ1ZTtcbiAgICB9IGNhdGNoIChfZXJyb3IpIHsgLy8gVE9ETzogTWF5YmUgd2Ugc2hvdWxkIGxvZyB0aGlzIGVycm9yLlxuICAgICAgdGhpcy5faXNDb25uZWN0ZWQgPSBmYWxzZTtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IF9pbnRlcnZhbCA9IHNldEludGVydmFsKGFzeW5jICgpID0+IHtcbiAgICAgICAgICBpZiAodGhpcy5yZXRyeUNvdW50ID4gdGhpcy5tYXhSZXRyeUNvdW50KSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICBjbGVhckludGVydmFsKF9pbnRlcnZhbCk7XG4gICAgICAgICAgICByZWplY3QobmV3IEVycm9yKFwiQ291bGQgbm90IHJlY29ubmVjdFwiKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgICAgICBhd2FpdCB0aGlzLmNvbm5lY3QoKTtcbiAgICAgICAgICAgIGF3YWl0IHNlbmRDb21tYW5kKHRoaXMud3JpdGVyLCB0aGlzLnJlYWRlciwgXCJQSU5HXCIpO1xuICAgICAgICAgICAgdGhpcy5faXNDb25uZWN0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5yZXRyeUNvdW50ID0gMDtcbiAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoX2ludGVydmFsKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICB9IGNhdGNoIChfZXJyKSB7XG4gICAgICAgICAgICAvLyByZXRyeWluZ1xuICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICB0aGlzLnJldHJ5Q291bnQrKztcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRoaXMucmV0cnlJbnRlcnZhbCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmb3JjZVJldHJ5KCk6IHZvaWQge1xuICAgIHRoaXMubWF4UmV0cnlDb3VudCA9IDEwOyAvLyBUT0RPIEFkanVzdCB0aGlzLlxuICB9XG59XG5cbmZ1bmN0aW9uIHBhcnNlUG9ydExpa2UocG9ydDogc3RyaW5nIHwgbnVtYmVyIHwgdW5kZWZpbmVkKTogbnVtYmVyIHtcbiAgbGV0IHBhcnNlZFBvcnQ6IG51bWJlcjtcbiAgaWYgKHR5cGVvZiBwb3J0ID09PSBcInN0cmluZ1wiKSB7XG4gICAgcGFyc2VkUG9ydCA9IHBhcnNlSW50KHBvcnQpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBwb3J0ID09PSBcIm51bWJlclwiKSB7XG4gICAgcGFyc2VkUG9ydCA9IHBvcnQ7XG4gIH0gZWxzZSB7XG4gICAgcGFyc2VkUG9ydCA9IDYzNzk7XG4gIH1cbiAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihwYXJzZWRQb3J0KSkge1xuICAgIHRocm93IG5ldyBFcnJvcihcIlBvcnQgaXMgaW52YWxpZFwiKTtcbiAgfVxuICByZXR1cm4gcGFyc2VkUG9ydDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFxQixXQUFXLFFBQVEsb0JBQW9CO0FBQzVELFNBQ0UsU0FBUyxFQUNULFNBQVMsUUFDSiw0Q0FBNEM7QUEyQm5ELE9BQU8sTUFBTTtJQUNYLEtBQTJCO0lBQzNCLE9BQWdCO0lBQ2hCLE9BQW1CO0lBQ25CLE9BQW1CO0lBQ25CLGNBQWtCO0lBQ2xCLGNBQXFCO0lBRWIsV0FBZTtJQUNmLFVBQWtCO0lBQ2xCLGFBQXFCO0lBQ3JCLGtCQUFrRDtJQUUxRCxJQUFJLFdBQW9CO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLFNBQVM7SUFDdkI7SUFFQSxJQUFJLGNBQXVCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLFlBQVk7SUFDMUI7SUFFQSxJQUFJLGNBQXVCO1FBQ3pCLE9BQU8sSUFBSSxD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