import { EOFError } from "./errors.ts";
import { deferred } from "./vendor/https/deno.land/std/async/deferred.ts";
import { sendCommand } from "./protocol/mod.ts";
export class MuxExecutor {
    constructor(connection){
        this.connection = connection;
        this.queue = [];
    }
    queue;
    exec(command, ...args) {
        const d = deferred();
        this.queue.push({
            command,
            args,
            d
        });
        if (this.queue.length === 1) {
            this.dequeue();
        }
        return d;
    }
    close() {
        this.connection.close();
    }
    dequeue() {
        const [e] = this.queue;
        if (!e) return;
        sendCommand(this.connection.writer, this.connection.reader, e.command, ...e.args).then(e.d.resolve).catch(async (error)=>{
            if (this.connection.maxRetryCount > 0 && // Error `BadResource` is thrown when an attempt is made to write to a closed connection,
            //  Make sure that the connection wasn't explicitly closed by the user before trying to reconnect.
            (error instanceof Deno.errors.BadResource && !this.connection.isClosed || error instanceof Deno.errors.BrokenPipe || error instanceof Deno.errors.ConnectionAborted || error instanceof Deno.errors.ConnectionRefused || error instanceof Deno.errors.ConnectionReset || error instanceof EOFError)) {
                await this.connection.reconnect();
            } else e.d.reject(error);
        }).finally(()=>{
            this.queue.shift();
            this.dequeue();
        });
    }
    connection;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMjUuMS9leGVjdXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbm5lY3Rpb24gfSBmcm9tIFwiLi9jb25uZWN0aW9uLnRzXCI7XG5pbXBvcnQgeyBFT0ZFcnJvciB9IGZyb20gXCIuL2Vycm9ycy50c1wiO1xuaW1wb3J0IHtcbiAgRGVmZXJyZWQsXG4gIGRlZmVycmVkLFxufSBmcm9tIFwiLi92ZW5kb3IvaHR0cHMvZGVuby5sYW5kL3N0ZC9hc3luYy9kZWZlcnJlZC50c1wiO1xuaW1wb3J0IHsgc2VuZENvbW1hbmQgfSBmcm9tIFwiLi9wcm90b2NvbC9tb2QudHNcIjtcbmltcG9ydCB0eXBlIHsgUmVkaXNSZXBseSwgUmVkaXNWYWx1ZSB9IGZyb20gXCIuL3Byb3RvY29sL21vZC50c1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRFeGVjdXRvciB7XG4gIHJlYWRvbmx5IGNvbm5lY3Rpb246IENvbm5lY3Rpb247XG4gIGV4ZWMoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIC4uLmFyZ3M6IFJlZGlzVmFsdWVbXVxuICApOiBQcm9taXNlPFJlZGlzUmVwbHk+O1xuXG4gIC8qKlxuICAgKiBDbG9zZXMgYSByZWRpcyBjb25uZWN0aW9uLlxuICAgKi9cbiAgY2xvc2UoKTogdm9pZDtcbn1cblxuZXhwb3J0IGNsYXNzIE11eEV4ZWN1dG9yIGltcGxlbWVudHMgQ29tbWFuZEV4ZWN1dG9yIHtcbiAgY29uc3RydWN0b3IocmVhZG9ubHkgY29ubmVjdGlvbjogQ29ubmVjdGlvbikge31cblxuICBwcml2YXRlIHF1ZXVlOiB7XG4gICAgY29tbWFuZDogc3RyaW5nO1xuICAgIGFyZ3M6IFJlZGlzVmFsdWVbXTtcbiAgICBkOiBEZWZlcnJlZDxSZWRpc1JlcGx5PjtcbiAgfVtdID0gW107XG5cbiAgZXhlYyhcbiAgICBjb21tYW5kOiBzdHJpbmcsXG4gICAgLi4uYXJnczogUmVkaXNWYWx1ZVtdXG4gICk6IFByb21pc2U8UmVkaXNSZXBseT4ge1xuICAgIGNvbnN0IGQgPSBkZWZlcnJlZDxSZWRpc1JlcGx5PigpO1xuICAgIHRoaXMucXVldWUucHVzaCh7IGNvbW1hbmQsIGFyZ3MsIGQgfSk7XG4gICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID09PSAxKSB7XG4gICAgICB0aGlzLmRlcXVldWUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGQ7XG4gIH1cblxuICBjbG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLmNvbm5lY3Rpb24uY2xvc2UoKTtcbiAgfVxuXG4gIHByaXZhdGUgZGVxdWV1ZSgpOiB2b2lkIHtcbiAgICBjb25zdCBbZV0gPSB0aGlzLnF1ZXVlO1xuICAgIGlmICghZSkgcmV0dXJuO1xuICAgIHNlbmRDb21tYW5kKFxuICAgICAgdGhpcy5jb25uZWN0aW9uLndyaXRlcixcbiAgICAgIHRoaXMuY29ubmVjdGlvbi5yZWFkZXIsXG4gICAgICBlLmNvbW1hbmQsXG4gICAgICAuLi5lLmFyZ3MsXG4gICAgKVxuICAgICAgLnRoZW4oZS5kLnJlc29sdmUpXG4gICAgICAuY2F0Y2goYXN5bmMgKGVycm9yKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLmNvbm5lY3Rpb24ubWF4UmV0cnlDb3VudCA+IDAgJiZcbiAgICAgICAgICAvLyBFcnJvciBgQmFkUmVzb3VyY2VgIGlzIHRocm93biB3aGVuIGFuIGF0dGVtcHQgaXMgbWFkZSB0byB3cml0ZSB0byBhIGNsb3NlZCBjb25uZWN0aW9uLFxuICAgICAgICAgIC8vICBNYWtlIHN1cmUgdGhhdCB0aGUgY29ubmVjdGlvbiB3YXNuJ3QgZXhwbGljaXRseSBjbG9zZWQgYnkgdGhlIHVzZXIgYmVmb3JlIHRyeWluZyB0byByZWNvbm5lY3QuXG4gICAgICAgICAgKChlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkJhZFJlc291cmNlICYmXG4gICAgICAgICAgICAhdGhpcy5jb25uZWN0aW9uLmlzQ2xvc2VkKSB8fFxuICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ccm9rZW5QaXBlIHx8XG4gICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkNvbm5lY3Rpb25BYm9ydGVkIHx8XG4gICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkNvbm5lY3Rpb25SZWZ1c2VkIHx8XG4gICAgICAgICAgICBlcnJvciBpbnN0YW5jZW9mIERlbm8uZXJyb3JzLkNvbm5lY3Rpb25SZXNldCB8fFxuICAgICAgICAgICAgZXJyb3IgaW5zdGFuY2VvZiBFT0ZFcnJvcilcbiAgICAgICAgKSB7XG4gICAgICAgICAgYXdhaXQgdGhpcy5jb25uZWN0aW9uLnJlY29ubmVjdCgpO1xuICAgICAgICB9IGVsc2UgZS5kLnJlamVjdChlcnJvcik7XG4gICAgICB9KVxuICAgICAgLmZpbmFsbHkoKCkgPT4ge1xuICAgICAgICB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgIHRoaXMuZGVxdWV1ZSgpO1xuICAgICAgfSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxTQUFTLFFBQVEsUUFBUSxjQUFjO0FBQ3ZDLFNBRUUsUUFBUSxRQUNILGlEQUFpRDtBQUN4RCxTQUFTLFdBQVcsUUFBUSxvQkFBb0I7QUFnQmhELE9BQU8sTUFBTTtJQUNYLFlBQXFCLFdBQXdCOzBCQUF4QjthQUViLFFBSUYsRUFBRTtJQU5zQztJQUV0QyxNQUlDO0lBRVQsS0FDRSxPQUFlLEVBQ2YsR0FBRyxJQUFrQixFQUNBO1FBQ3JCLE1BQU0sSUFBSTtRQUNWLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQUU7WUFBUztZQUFNO1FBQUU7UUFDbkMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxHQUFHO1lBQzNCLElBQUksQ0FBQyxPQUFPO1FBQ2QsQ0FBQztRQUNELE9BQU87SUFDVDtJQUVBLFFBQWM7UUFDWixJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUs7SUFDdkI7SUFFUSxVQUFnQjtRQUN0QixNQUFNLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLO1FBQ3RCLElBQUksQ0FBQyxHQUFHO1FBQ1IsWUFDRSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFDdEIsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQ3RCLEVBQUUsT0FBTyxLQUNOLEVBQUUsSUFBSSxFQUVSLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQ2hCLEtBQUssQ0FBQyxPQUFPLFFBQVU7WUFDdEIsSUFDRSxJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsR0FBRyxLQUNoQyx5RkFBeUY7WUFDekYsa0dBQWtHO1lBQ2xHLENBQUMsQUFBQyxpQkFBaUIsS0FBSyxNQUFNLENBQUMsV0FBVyxJQUN4QyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxJQUN6QixpQkFBaUIsS0FBSyxNQUFNLENBQUMsVUFBVSxJQUN2QyxpQkFBaUIsS0FBSyxNQUFNLENBQUMsaUJBQWlCLElBQzlDLGlCQUFpQixLQUFLLE1BQU0sQ0FBQyxpQkFBaUIsSUFDOUMsaUJBQWlCLEtBQUssTUFBTSxDQUFDLGVBQWUsSUFDNUMsaUJBQWlCLFFBQVEsR0FDM0I7Z0JBQ0EsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLFNBQVM7WUFDakMsT0FBTyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7UUFDcEIsR0FDQyxPQUFPLENBQUMsSUFBTTtZQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSztZQUNoQixJQUFJLENBQUMsT0FBTztRQUNkO0lBQ0o7SUF0RHFCO0FBdUR2QixDQUFDIn0=