import { createSimpleStringReply, sendCommands } from "./protocol/mod.ts";
import { create } from "./redis.ts";
import { deferred } from "./vendor/https/deno.land/std/async/deferred.ts";
export function createRedisPipeline(connection, tx = false) {
    const executor = new PipelineExecutor(connection, tx);
    function flush() {
        return executor.flush();
    }
    const client = create(executor);
    return Object.assign(client, {
        flush
    });
}
export class PipelineExecutor {
    commands;
    queue;
    constructor(connection, tx){
        this.connection = connection;
        this.tx = tx;
        this.commands = [];
        this.queue = [];
    }
    exec(command, ...args) {
        this.commands.push({
            command,
            args
        });
        return Promise.resolve(createSimpleStringReply("OK"));
    }
    close() {
        return this.connection.close();
    }
    flush() {
        if (this.tx) {
            this.commands.unshift({
                command: "MULTI",
                args: []
            });
            this.commands.push({
                command: "EXEC",
                args: []
            });
        }
        const d = deferred();
        this.queue.push({
            commands: [
                ...this.commands
            ],
            d
        });
        if (this.queue.length === 1) {
            this.dequeue();
        }
        this.commands = [];
        return d;
    }
    dequeue() {
        const [e] = this.queue;
        if (!e) return;
        sendCommands(this.connection.writer, this.connection.reader, e.commands).then(e.d.resolve).catch(e.d.reject).finally(()=>{
            this.queue.shift();
            this.dequeue();
        });
    }
    connection;
    tx;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvcmVkaXNAdjAuMjUuMS9waXBlbGluZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbm5lY3Rpb24gfSBmcm9tIFwiLi9jb25uZWN0aW9uLnRzXCI7XG5pbXBvcnQgeyBDb21tYW5kRXhlY3V0b3IgfSBmcm9tIFwiLi9leGVjdXRvci50c1wiO1xuaW1wb3J0IHtcbiAgY3JlYXRlU2ltcGxlU3RyaW5nUmVwbHksXG4gIFJlZGlzUmVwbHksXG4gIFJlZGlzUmVwbHlPckVycm9yLFxuICBSZWRpc1ZhbHVlLFxuICBzZW5kQ29tbWFuZHMsXG59IGZyb20gXCIuL3Byb3RvY29sL21vZC50c1wiO1xuaW1wb3J0IHsgY3JlYXRlLCBSZWRpcyB9IGZyb20gXCIuL3JlZGlzLnRzXCI7XG5pbXBvcnQge1xuICBEZWZlcnJlZCxcbiAgZGVmZXJyZWQsXG59IGZyb20gXCIuL3ZlbmRvci9odHRwcy9kZW5vLmxhbmQvc3RkL2FzeW5jL2RlZmVycmVkLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVkaXNQaXBlbGluZSBleHRlbmRzIFJlZGlzIHtcbiAgZmx1c2goKTogUHJvbWlzZTxSZWRpc1JlcGx5T3JFcnJvcltdPjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVJlZGlzUGlwZWxpbmUoXG4gIGNvbm5lY3Rpb246IENvbm5lY3Rpb24sXG4gIHR4ID0gZmFsc2UsXG4pOiBSZWRpc1BpcGVsaW5lIHtcbiAgY29uc3QgZXhlY3V0b3IgPSBuZXcgUGlwZWxpbmVFeGVjdXRvcihjb25uZWN0aW9uLCB0eCk7XG4gIGZ1bmN0aW9uIGZsdXNoKCk6IFByb21pc2U8UmVkaXNSZXBseU9yRXJyb3JbXT4ge1xuICAgIHJldHVybiBleGVjdXRvci5mbHVzaCgpO1xuICB9XG4gIGNvbnN0IGNsaWVudCA9IGNyZWF0ZShleGVjdXRvcik7XG4gIHJldHVybiBPYmplY3QuYXNzaWduKGNsaWVudCwgeyBmbHVzaCB9KTtcbn1cblxuZXhwb3J0IGNsYXNzIFBpcGVsaW5lRXhlY3V0b3IgaW1wbGVtZW50cyBDb21tYW5kRXhlY3V0b3Ige1xuICBwcml2YXRlIGNvbW1hbmRzOiB7XG4gICAgY29tbWFuZDogc3RyaW5nO1xuICAgIGFyZ3M6IFJlZGlzVmFsdWVbXTtcbiAgfVtdID0gW107XG4gIHByaXZhdGUgcXVldWU6IHtcbiAgICBjb21tYW5kczoge1xuICAgICAgY29tbWFuZDogc3RyaW5nO1xuICAgICAgYXJnczogUmVkaXNWYWx1ZVtdO1xuICAgIH1bXTtcbiAgICBkOiBEZWZlcnJlZDxSZWRpc1JlcGx5T3JFcnJvcltdPjtcbiAgfVtdID0gW107XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcmVhZG9ubHkgY29ubmVjdGlvbjogQ29ubmVjdGlvbixcbiAgICBwcml2YXRlIHR4OiBib29sZWFuLFxuICApIHtcbiAgfVxuXG4gIGV4ZWMoXG4gICAgY29tbWFuZDogc3RyaW5nLFxuICAgIC4uLmFyZ3M6IFJlZGlzVmFsdWVbXVxuICApOiBQcm9taXNlPFJlZGlzUmVwbHk+IHtcbiAgICB0aGlzLmNvbW1hbmRzLnB1c2goeyBjb21tYW5kLCBhcmdzIH0pO1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoY3JlYXRlU2ltcGxlU3RyaW5nUmVwbHkoXCJPS1wiKSk7XG4gIH1cblxuICBjbG9zZSgpOiB2b2lkIHtcbiAgICByZXR1cm4gdGhpcy5jb25uZWN0aW9uLmNsb3NlKCk7XG4gIH1cblxuICBmbHVzaCgpOiBQcm9taXNlPFJlZGlzUmVwbHlPckVycm9yW10+IHtcbiAgICBpZiAodGhpcy50eCkge1xuICAgICAgdGhpcy5jb21tYW5kcy51bnNoaWZ0KHsgY29tbWFuZDogXCJNVUxUSVwiLCBhcmdzOiBbXSB9KTtcbiAgICAgIHRoaXMuY29tbWFuZHMucHVzaCh7IGNvbW1hbmQ6IFwiRVhFQ1wiLCBhcmdzOiBbXSB9KTtcbiAgICB9XG4gICAgY29uc3QgZCA9IGRlZmVycmVkPFJlZGlzUmVwbHlPckVycm9yW10+KCk7XG4gICAgdGhpcy5xdWV1ZS5wdXNoKHsgY29tbWFuZHM6IFsuLi50aGlzLmNvbW1hbmRzXSwgZCB9KTtcbiAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPT09IDEpIHtcbiAgICAgIHRoaXMuZGVxdWV1ZSgpO1xuICAgIH1cbiAgICB0aGlzLmNvbW1hbmRzID0gW107XG4gICAgcmV0dXJuIGQ7XG4gIH1cblxuICBwcml2YXRlIGRlcXVldWUoKTogdm9pZCB7XG4gICAgY29uc3QgW2VdID0gdGhpcy5xdWV1ZTtcbiAgICBpZiAoIWUpIHJldHVybjtcbiAgICBzZW5kQ29tbWFuZHModGhpcy5jb25uZWN0aW9uLndyaXRlciwgdGhpcy5jb25uZWN0aW9uLnJlYWRlciwgZS5jb21tYW5kcylcbiAgICAgIC50aGVuKGUuZC5yZXNvbHZlKVxuICAgICAgLmNhdGNoKGUuZC5yZWplY3QpXG4gICAgICAuZmluYWxseSgoKSA9PiB7XG4gICAgICAgIHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICAgICAgdGhpcy5kZXF1ZXVlKCk7XG4gICAgICB9KTtcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLFNBQ0UsdUJBQXVCLEVBSXZCLFlBQVksUUFDUCxvQkFBb0I7QUFDM0IsU0FBUyxNQUFNLFFBQWUsYUFBYTtBQUMzQyxTQUVFLFFBQVEsUUFDSCxpREFBaUQ7QUFNeEQsT0FBTyxTQUFTLG9CQUNkLFVBQXNCLEVBQ3RCLEtBQUssS0FBSyxFQUNLO0lBQ2YsTUFBTSxXQUFXLElBQUksaUJBQWlCLFlBQVk7SUFDbEQsU0FBUyxRQUFzQztRQUM3QyxPQUFPLFNBQVMsS0FBSztJQUN2QjtJQUNBLE1BQU0sU0FBUyxPQUFPO0lBQ3RCLE9BQU8sT0FBTyxNQUFNLENBQUMsUUFBUTtRQUFFO0lBQU07QUFDdkMsQ0FBQztBQUVELE9BQU8sTUFBTTtJQUNILFNBR0M7SUFDRCxNQU1DO0lBRVQsWUFDVyxZQUNELEdBQ1I7MEJBRlM7a0JBQ0Q7YUFkRixXQUdGLEVBQUU7YUFDQSxRQU1GLEVBQUU7SUFNUjtJQUVBLEtBQ0UsT0FBZSxFQUNmLEdBQUcsSUFBa0IsRUFDQTtRQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztZQUFFO1lBQVM7UUFBSztRQUNuQyxPQUFPLFFBQVEsT0FBTyxDQUFDLHdCQUF3QjtJQUNqRDtJQUVBLFFBQWM7UUFDWixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsS0FBSztJQUM5QjtJQUVBLFFBQXNDO1FBQ3BDLElBQUksSUFBSSxDQUFDLEVBQUUsRUFBRTtZQUNYLElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO2dCQUFFLFNBQVM7Z0JBQVMsTUFBTSxFQUFFO1lBQUM7WUFDbkQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7Z0JBQUUsU0FBUztnQkFBUSxNQUFNLEVBQUU7WUFBQztRQUNqRCxDQUFDO1FBQ0QsTUFBTSxJQUFJO1FBQ1YsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFBRSxVQUFVO21CQUFJLElBQUksQ0FBQyxRQUFRO2FBQUM7WUFBRTtRQUFFO1FBQ2xELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssR0FBRztZQUMzQixJQUFJLENBQUMsT0FBTztRQUNkLENBQUM7UUFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUU7UUFDbEIsT0FBTztJQUNUO0lBRVEsVUFBZ0I7UUFDdEIsTUFBTSxDQUFDLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSztRQUN0QixJQUFJLENBQUMsR0FBRztRQUNSLGFBQWEsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUUsRUFBRSxRQUFRLEVBQ3BFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLEVBQ2hCLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQ2hCLE9BQU8sQ0FBQyxJQUFNO1lBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLO1lBQ2hCLElBQUksQ0FBQyxPQUFPO1FBQ2Q7SUFDSjtJQXpDVztJQUNEO0FBeUNaLENBQUMifQ==