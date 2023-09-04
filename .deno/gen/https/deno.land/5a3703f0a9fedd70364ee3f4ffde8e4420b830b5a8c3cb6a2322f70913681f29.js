import { InvalidStateError } from "./errors.ts";
import { readArrayReply } from "./protocol/mod.ts";
class RedisSubscriptionImpl {
    get isConnected() {
        return this.executor.connection.isConnected;
    }
    get isClosed() {
        return this.executor.connection.isClosed;
    }
    channels;
    patterns;
    constructor(executor){
        this.executor = executor;
        this.channels = Object.create(null);
        this.patterns = Object.create(null);
        // Force retriable connection for connection shared for pub/sub.
        if (!executor.connection.isRetriable) executor.connection.forceRetry();
    }
    async psubscribe(...patterns) {
        await this.executor.exec("PSUBSCRIBE", ...patterns);
        for (const pat of patterns){
            this.patterns[pat] = true;
        }
    }
    async punsubscribe(...patterns) {
        await this.executor.exec("PUNSUBSCRIBE", ...patterns);
        for (const pat of patterns){
            delete this.patterns[pat];
        }
    }
    async subscribe(...channels) {
        await this.executor.exec("SUBSCRIBE", ...channels);
        for (const chan of channels){
            this.channels[chan] = true;
        }
    }
    async unsubscribe(...channels) {
        await this.executor.exec("UNSUBSCRIBE", ...channels);
        for (const chan of channels){
            delete this.channels[chan];
        }
    }
    async *receive() {
        let forceReconnect = false;
        const connection = this.executor.connection;
        while(this.isConnected){
            try {
                let rep;
                try {
                    rep = (await readArrayReply(connection.reader)).value();
                } catch (err) {
                    if (err instanceof Deno.errors.BadResource) {
                        // Connection already closed.
                        connection.close();
                        break;
                    }
                    throw err;
                }
                const ev = rep[0];
                if (ev === "message" && rep.length === 3) {
                    yield {
                        channel: rep[1],
                        message: rep[2]
                    };
                } else if (ev === "pmessage" && rep.length === 4) {
                    yield {
                        pattern: rep[1],
                        channel: rep[2],
                        message: rep[3]
                    };
                }
            } catch (error) {
                if (error instanceof InvalidStateError || error instanceof Deno.errors.BadResource) {
                    forceReconnect = true;
                } else throw error;
            } finally{
                if (!this.isClosed && !this.isConnected || forceReconnect) {
                    await connection.reconnect();
                    forceReconnect = false;
                    if (Object.keys(this.channels).length > 0) {
                        await this.subscribe(...Object.keys(this.channels));
                    }
                    if (Object.keys(this.patterns).length > 0) {
                        await this.psubscribe(...Object.keys(this.patterns));
                    }
                }
            }
        }
    }
    async close() {
        try {
            await this.unsubscribe(...Object.keys(this.channels));
            await this.punsubscribe(...Object.keys(this.patterns));
        } finally{
            this.executor.connection.close();
        }
    }
    executor;
}
export async function subscribe(executor, ...channels) {
    const sub = new RedisSubscriptionImpl(executor);
    await sub.subscribe(...channels);
    return sub;
}
export async function psubscribe(executor, ...patterns) {
    const sub = new RedisSubscriptionImpl(executor);
    await sub.psubscribe(...patterns);
    return sub;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMjUuMS9wdWJzdWIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDb21tYW5kRXhlY3V0b3IgfSBmcm9tIFwiLi9leGVjdXRvci50c1wiO1xuaW1wb3J0IHsgSW52YWxpZFN0YXRlRXJyb3IgfSBmcm9tIFwiLi9lcnJvcnMudHNcIjtcbmltcG9ydCB7IHJlYWRBcnJheVJlcGx5IH0gZnJvbSBcIi4vcHJvdG9jb2wvbW9kLnRzXCI7XG5cbnR5cGUgRGVmYXVsdE1lc3NhZ2VUeXBlID0gc3RyaW5nO1xudHlwZSBWYWxpZE1lc3NhZ2VUeXBlID0gc3RyaW5nIHwgc3RyaW5nW107XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVkaXNTdWJzY3JpcHRpb248XG4gIFRNZXNzYWdlIGV4dGVuZHMgVmFsaWRNZXNzYWdlVHlwZSA9IERlZmF1bHRNZXNzYWdlVHlwZSxcbj4ge1xuICByZWFkb25seSBpc0Nsb3NlZDogYm9vbGVhbjtcbiAgcmVjZWl2ZSgpOiBBc3luY0l0ZXJhYmxlSXRlcmF0b3I8UmVkaXNQdWJTdWJNZXNzYWdlPFRNZXNzYWdlPj47XG4gIHBzdWJzY3JpYmUoLi4ucGF0dGVybnM6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPjtcbiAgc3Vic2NyaWJlKC4uLmNoYW5uZWxzOiBzdHJpbmdbXSk6IFByb21pc2U8dm9pZD47XG4gIHB1bnN1YnNjcmliZSguLi5wYXR0ZXJuczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+O1xuICB1bnN1YnNjcmliZSguLi5jaGFubmVsczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+O1xuICBjbG9zZSgpOiBQcm9taXNlPHZvaWQ+O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFJlZGlzUHViU3ViTWVzc2FnZTxUTWVzc2FnZSA9IERlZmF1bHRNZXNzYWdlVHlwZT4ge1xuICBwYXR0ZXJuPzogc3RyaW5nO1xuICBjaGFubmVsOiBzdHJpbmc7XG4gIG1lc3NhZ2U6IFRNZXNzYWdlO1xufVxuXG5jbGFzcyBSZWRpc1N1YnNjcmlwdGlvbkltcGw8XG4gIFRNZXNzYWdlIGV4dGVuZHMgVmFsaWRNZXNzYWdlVHlwZSA9IERlZmF1bHRNZXNzYWdlVHlwZSxcbj4gaW1wbGVtZW50cyBSZWRpc1N1YnNjcmlwdGlvbjxUTWVzc2FnZT4ge1xuICBnZXQgaXNDb25uZWN0ZWQoKTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIHRoaXMuZXhlY3V0b3IuY29ubmVjdGlvbi5pc0Nvbm5lY3RlZDtcbiAgfVxuXG4gIGdldCBpc0Nsb3NlZCgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5leGVjdXRvci5jb25uZWN0aW9uLmlzQ2xvc2VkO1xuICB9XG5cbiAgcHJpdmF0ZSBjaGFubmVscyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHByaXZhdGUgcGF0dGVybnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgZXhlY3V0b3I6IENvbW1hbmRFeGVjdXRvcikge1xuICAgIC8vIEZvcmNlIHJldHJpYWJsZSBjb25uZWN0aW9uIGZvciBjb25uZWN0aW9uIHNoYXJlZCBmb3IgcHViL3N1Yi5cbiAgICBpZiAoIWV4ZWN1dG9yLmNvbm5lY3Rpb24uaXNSZXRyaWFibGUpIGV4ZWN1dG9yLmNvbm5lY3Rpb24uZm9yY2VSZXRyeSgpO1xuICB9XG5cbiAgYXN5bmMgcHN1YnNjcmliZSguLi5wYXR0ZXJuczogc3RyaW5nW10pIHtcbiAgICBhd2FpdCB0aGlzLmV4ZWN1dG9yLmV4ZWMoXCJQU1VCU0NSSUJFXCIsIC4uLnBhdHRlcm5zKTtcbiAgICBmb3IgKGNvbnN0IHBhdCBvZiBwYXR0ZXJucykge1xuICAgICAgdGhpcy5wYXR0ZXJuc1twYXRdID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBwdW5zdWJzY3JpYmUoLi4ucGF0dGVybnM6IHN0cmluZ1tdKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRvci5leGVjKFwiUFVOU1VCU0NSSUJFXCIsIC4uLnBhdHRlcm5zKTtcbiAgICBmb3IgKGNvbnN0IHBhdCBvZiBwYXR0ZXJucykge1xuICAgICAgZGVsZXRlIHRoaXMucGF0dGVybnNbcGF0XTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBzdWJzY3JpYmUoLi4uY2hhbm5lbHM6IHN0cmluZ1tdKSB7XG4gICAgYXdhaXQgdGhpcy5leGVjdXRvci5leGVjKFwiU1VCU0NSSUJFXCIsIC4uLmNoYW5uZWxzKTtcbiAgICBmb3IgKGNvbnN0IGNoYW4gb2YgY2hhbm5lbHMpIHtcbiAgICAgIHRoaXMuY2hhbm5lbHNbY2hhbl0gPSB0cnVlO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHVuc3Vic2NyaWJlKC4uLmNoYW5uZWxzOiBzdHJpbmdbXSkge1xuICAgIGF3YWl0IHRoaXMuZXhlY3V0b3IuZXhlYyhcIlVOU1VCU0NSSUJFXCIsIC4uLmNoYW5uZWxzKTtcbiAgICBmb3IgKGNvbnN0IGNoYW4gb2YgY2hhbm5lbHMpIHtcbiAgICAgIGRlbGV0ZSB0aGlzLmNoYW5uZWxzW2NoYW5dO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jICpyZWNlaXZlKCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxSZWRpc1B1YlN1Yk1lc3NhZ2U8VE1lc3NhZ2U+PiB7XG4gICAgbGV0IGZvcmNlUmVjb25uZWN0ID0gZmFsc2U7XG4gICAgY29uc3QgY29ubmVjdGlvbiA9IHRoaXMuZXhlY3V0b3IuY29ubmVjdGlvbjtcbiAgICB3aGlsZSAodGhpcy5pc0Nvbm5lY3RlZCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IHJlcDogW3N0cmluZywgc3RyaW5nLCBUTWVzc2FnZV0gfCBbXG4gICAgICAgICAgc3RyaW5nLFxuICAgICAgICAgIHN0cmluZyxcbiAgICAgICAgICBzdHJpbmcsXG4gICAgICAgICAgVE1lc3NhZ2UsXG4gICAgICAgIF07XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVwID0gKGF3YWl0IHJlYWRBcnJheVJlcGx5KGNvbm5lY3Rpb24ucmVhZGVyKSkudmFsdWUoKSBhcyBbXG4gICAgICAgICAgICBzdHJpbmcsXG4gICAgICAgICAgICBzdHJpbmcsXG4gICAgICAgICAgICBUTWVzc2FnZSxcbiAgICAgICAgICBdIHwgW3N0cmluZywgc3RyaW5nLCBzdHJpbmcsIFRNZXNzYWdlXTtcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgaWYgKGVyciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkJhZFJlc291cmNlKSB7XG4gICAgICAgICAgICAvLyBDb25uZWN0aW9uIGFscmVhZHkgY2xvc2VkLlxuICAgICAgICAgICAgY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBldiA9IHJlcFswXTtcblxuICAgICAgICBpZiAoZXYgPT09IFwibWVzc2FnZVwiICYmIHJlcC5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgICBjaGFubmVsOiByZXBbMV0sXG4gICAgICAgICAgICBtZXNzYWdlOiByZXBbMl0sXG4gICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmIChldiA9PT0gXCJwbWVzc2FnZVwiICYmIHJlcC5sZW5ndGggPT09IDQpIHtcbiAgICAgICAgICB5aWVsZCB7XG4gICAgICAgICAgICBwYXR0ZXJuOiByZXBbMV0sXG4gICAgICAgICAgICBjaGFubmVsOiByZXBbMl0sXG4gICAgICAgICAgICBtZXNzYWdlOiByZXBbM10sXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGVycm9yIGluc3RhbmNlb2YgSW52YWxpZFN0YXRlRXJyb3IgfHxcbiAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkJhZFJlc291cmNlXG4gICAgICAgICkge1xuICAgICAgICAgIGZvcmNlUmVjb25uZWN0ID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHRocm93IGVycm9yO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgaWYgKCghdGhpcy5pc0Nsb3NlZCAmJiAhdGhpcy5pc0Nvbm5lY3RlZCkgfHwgZm9yY2VSZWNvbm5lY3QpIHtcbiAgICAgICAgICBhd2FpdCBjb25uZWN0aW9uLnJlY29ubmVjdCgpO1xuICAgICAgICAgIGZvcmNlUmVjb25uZWN0ID0gZmFsc2U7XG5cbiAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5jaGFubmVscykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5zdWJzY3JpYmUoLi4uT2JqZWN0LmtleXModGhpcy5jaGFubmVscykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5wYXR0ZXJucykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYXdhaXQgdGhpcy5wc3Vic2NyaWJlKC4uLk9iamVjdC5rZXlzKHRoaXMucGF0dGVybnMpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhc3luYyBjbG9zZSgpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgdGhpcy51bnN1YnNjcmliZSguLi5PYmplY3Qua2V5cyh0aGlzLmNoYW5uZWxzKSk7XG4gICAgICBhd2FpdCB0aGlzLnB1bnN1YnNjcmliZSguLi5PYmplY3Qua2V5cyh0aGlzLnBhdHRlcm5zKSk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIHRoaXMuZXhlY3V0b3IuY29ubmVjdGlvbi5jbG9zZSgpO1xuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc3Vic2NyaWJlPFxuICBUTWVzc2FnZSBleHRlbmRzIFZhbGlkTWVzc2FnZVR5cGUgPSBEZWZhdWx0TWVzc2FnZVR5cGUsXG4+KFxuICBleGVjdXRvcjogQ29tbWFuZEV4ZWN1dG9yLFxuICAuLi5jaGFubmVsczogc3RyaW5nW11cbik6IFByb21pc2U8UmVkaXNTdWJzY3JpcHRpb248VE1lc3NhZ2U+PiB7XG4gIGNvbnN0IHN1YiA9IG5ldyBSZWRpc1N1YnNjcmlwdGlvbkltcGw8VE1lc3NhZ2U+KGV4ZWN1dG9yKTtcbiAgYXdhaXQgc3ViLnN1YnNjcmliZSguLi5jaGFubmVscyk7XG4gIHJldHVybiBzdWI7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwc3Vic2NyaWJlPFxuICBUTWVzc2FnZSBleHRlbmRzIFZhbGlkTWVzc2FnZVR5cGUgPSBEZWZhdWx0TWVzc2FnZVR5cGUsXG4+KFxuICBleGVjdXRvcjogQ29tbWFuZEV4ZWN1dG9yLFxuICAuLi5wYXR0ZXJuczogc3RyaW5nW11cbik6IFByb21pc2U8UmVkaXNTdWJzY3JpcHRpb248VE1lc3NhZ2U+PiB7XG4gIGNvbnN0IHN1YiA9IG5ldyBSZWRpc1N1YnNjcmlwdGlvbkltcGw8VE1lc3NhZ2U+KGV4ZWN1dG9yKTtcbiAgYXdhaXQgc3ViLnBzdWJzY3JpYmUoLi4ucGF0dGVybnMpO1xuICByZXR1cm4gc3ViO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsaUJBQWlCLFFBQVEsY0FBYztBQUNoRCxTQUFTLGNBQWMsUUFBUSxvQkFBb0I7QUF1Qm5ELE1BQU07SUFHSixJQUFJLGNBQXVCO1FBQ3pCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVztJQUM3QztJQUVBLElBQUksV0FBb0I7UUFDdEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxRQUFRO0lBQzFDO0lBRVEsU0FBK0I7SUFDL0IsU0FBK0I7SUFFdkMsWUFBb0IsU0FBMkI7d0JBQTNCO2FBSFosV0FBVyxPQUFPLE1BQU0sQ0FBQyxJQUFJO2FBQzdCLFdBQVcsT0FBTyxNQUFNLENBQUMsSUFBSTtRQUduQyxnRUFBZ0U7UUFDaEUsSUFBSSxDQUFDLFNBQVMsVUFBVSxDQUFDLFdBQVcsRUFBRSxTQUFTLFVBQVUsQ0FBQyxVQUFVO0lBQ3RFO0lBRUEsTUFBTSxX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