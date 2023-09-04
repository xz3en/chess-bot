// based on https://github.com/discordjs/discord.js/blob/master/src/rest/AsyncQueue.js
export class RequestQueue {
    promises = [];
    get remaining() {
        return this.promises.length;
    }
    async wait() {
        const next = this.promises.length !== 0 ? this.promises[this.promises.length - 1].promise : Promise.resolve();
        let resolveFn;
        const promise = new Promise((resolve)=>{
            resolveFn = resolve;
        });
        this.promises.push({
            resolve: resolveFn,
            promise
        });
        return await next;
    }
    shift() {
        const deferred = this.promises.shift();
        if (typeof deferred !== 'undefined') deferred.resolve();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3Jlc3QvcXVldWUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gYmFzZWQgb24gaHR0cHM6Ly9naXRodWIuY29tL2Rpc2NvcmRqcy9kaXNjb3JkLmpzL2Jsb2IvbWFzdGVyL3NyYy9yZXN0L0FzeW5jUXVldWUuanNcblxuZXhwb3J0IGludGVyZmFjZSBSZXF1ZXN0UHJvbWlzZSB7XG4gIHJlc29sdmU6IENhbGxhYmxlRnVuY3Rpb25cbiAgcHJvbWlzZTogUHJvbWlzZTx1bmtub3duPlxufVxuXG5leHBvcnQgY2xhc3MgUmVxdWVzdFF1ZXVlIHtcbiAgcHJvbWlzZXM6IFJlcXVlc3RQcm9taXNlW10gPSBbXVxuXG4gIGdldCByZW1haW5pbmcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5wcm9taXNlcy5sZW5ndGhcbiAgfVxuXG4gIGFzeW5jIHdhaXQoKTogUHJvbWlzZTx1bmtub3duPiB7XG4gICAgY29uc3QgbmV4dCA9XG4gICAgICB0aGlzLnByb21pc2VzLmxlbmd0aCAhPT0gMFxuICAgICAgICA/IHRoaXMucHJvbWlzZXNbdGhpcy5wcm9taXNlcy5sZW5ndGggLSAxXS5wcm9taXNlXG4gICAgICAgIDogUHJvbWlzZS5yZXNvbHZlKClcbiAgICBsZXQgcmVzb2x2ZUZuOiBDYWxsYWJsZUZ1bmN0aW9uIHwgdW5kZWZpbmVkXG4gICAgY29uc3QgcHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICByZXNvbHZlRm4gPSByZXNvbHZlXG4gICAgfSlcblxuICAgIHRoaXMucHJvbWlzZXMucHVzaCh7XG4gICAgICByZXNvbHZlOiByZXNvbHZlRm4hLFxuICAgICAgcHJvbWlzZVxuICAgIH0pXG5cbiAgICByZXR1cm4gYXdhaXQgbmV4dFxuICB9XG5cbiAgc2hpZnQoKTogdm9pZCB7XG4gICAgY29uc3QgZGVmZXJyZWQgPSB0aGlzLnByb21pc2VzLnNoaWZ0KClcbiAgICBpZiAodHlwZW9mIGRlZmVycmVkICE9PSAndW5kZWZpbmVkJykgZGVmZXJyZWQucmVzb2x2ZSgpXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxzRkFBc0Y7QUFPdEYsT0FBTyxNQUFNO0lBQ1gsV0FBNkIsRUFBRSxDQUFBO0lBRS9CLElBQUksWUFBb0I7UUFDdEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU07SUFDN0I7SUFFQSxNQUFNLE9BQXlCO1FBQzdCLE1BQU0sT0FDSixJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxJQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEdBQy9DLFFBQVEsT0FBTyxFQUFFO1FBQ3ZCLElBQUk7UUFDSixNQUFNLFVBQVUsSUFBSSxRQUFRLENBQUMsVUFBWTtZQUN2QyxZQUFZO1FBQ2Q7UUFFQSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQztZQUNqQixTQUFTO1lBQ1Q7UUFDRjtRQUVBLE9BQU8sTUFBTTtJQUNmO0lBRUEsUUFBYztRQUNaLE1BQU0sV0FBVyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUs7UUFDcEMsSUFBSSxPQUFPLGFBQWEsYUFBYSxTQUFTLE9BQU87SUFDdkQ7QUFDRixDQUFDIn0=