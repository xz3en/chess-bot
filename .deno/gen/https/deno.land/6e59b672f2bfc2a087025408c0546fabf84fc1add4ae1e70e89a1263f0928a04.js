import { Collection } from '../utils/collection.ts';
import { HarmonyEventEmitter } from '../utils/events.ts';
export class Collector extends HarmonyEventEmitter {
    client;
    _started = false;
    event;
    filter = ()=>true;
    collected = new Collection();
    max;
    deinitOnEnd = false;
    timeout;
    _timer;
    get started() {
        return this._started;
    }
    set started(d) {
        if (d !== this._started) {
            this._started = d;
            if (d) this.emit('start');
            else {
                if (this.deinitOnEnd && this.client !== undefined) this.deinit(this.client);
                this.emit('end');
            }
        }
    }
    constructor(options){
        super();
        if (typeof options === 'string') this.event = options;
        else {
            this.event = options.event;
            this.client = options.client;
            this.filter = options.filter ?? (()=>true);
            this.max = options.max;
            this.deinitOnEnd = options.deinitOnEnd ?? false;
            this.timeout = options.timeout;
        }
    }
    /** Start collecting */ collect() {
        this.started = true;
        if (this.client !== undefined) this.init(this.client);
        if (this._timer !== undefined) clearTimeout(this._timer);
        if (this.timeout !== undefined) {
            this._timer = setTimeout(()=>{
                this.end();
            }, this.timeout);
        }
        return this;
    }
    /** End collecting */ end() {
        this.started = false;
        if (this._timer !== undefined) clearTimeout(this._timer);
        return this;
    }
    /** Reset collector and start again */ reset() {
        this.collected = new Collection();
        this.collect();
        return this;
    }
    /** Init the Collector on Client */ init(client) {
        this.client = client;
        client.addCollector(this);
        return this;
    }
    /** De initialize the Collector i.e. remove cleanly */ deinit(client) {
        client.removeCollector(this);
        return this;
    }
    /** Checks we may want to perform on an extended version of Collector */ check(..._args) {
        return true;
    }
    /** Fire the Collector */ async _fire(...args) {
        if (!this.started) return;
        const check = await this.check(...args);
        if (!check) return;
        const filter = await this.filter(...args);
        if (!filter) return;
        this.collected.set((Number(this.collected.size) + 1).toString(), args);
        this.emit('collect', ...args);
        if (this.max !== undefined && // linter: send help
        this.max < Number(this.collected.size) + 1) {
            this.end();
        }
    }
    /** Set filter of the Collector */ when(filter) {
        this.filter = filter;
        return this;
    }
    /** Add a new listener for 'collect' event */ each(handler) {
        this.on('collect', ()=>handler());
        return this;
    }
    /** Returns a Promise resolved when Collector ends or a timeout occurs */ async wait(timeout) {
        if (timeout === undefined) timeout = this.timeout ?? 0;
        return await new Promise((resolve, reject)=>{
            // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
            if (!timeout) throw new Error('Timeout is required parameter if not given in CollectorOptions');
            let done = false;
            const onend = ()=>{
                done = true;
                this.off('end', onend);
                resolve(this);
            };
            this.on('end', onend);
            setTimeout(()=>{
                if (!done) {
                    this.off('end', onend);
                    reject(new Error('Timeout'));
                }
            }, timeout);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2NsaWVudC9jb2xsZWN0b3JzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbGxlY3Rpb24gfSBmcm9tICcuLi91dGlscy9jb2xsZWN0aW9uLnRzJ1xuaW1wb3J0IHR5cGUgeyBDbGllbnQgfSBmcm9tICcuLi9jbGllbnQvY2xpZW50LnRzJ1xuaW1wb3J0IHsgSGFybW9ueUV2ZW50RW1pdHRlciB9IGZyb20gJy4uL3V0aWxzL2V2ZW50cy50cydcblxuLy8gTm90ZTogbmVlZCB0byBrZWVwIGFueXMgaGVyZSBmb3IgY29tcGF0aWJpbGl0eVxuXG5leHBvcnQgdHlwZSBDb2xsZWN0b3JGaWx0ZXIgPSAoLi4uYXJnczogYW55W10pID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29sbGVjdG9yT3B0aW9ucyB7XG4gIC8qKiBFdmVudCBuYW1lIHRvIGxpc3RlbiBmb3IgKi9cbiAgZXZlbnQ6IHN0cmluZ1xuICAvKiogT3B0aW9uYWxseSBDbGllbnQgb2JqZWN0IGZvciBkZWluaXRPbkVuZCBmdW5jdGlvbmFsaXR5ICovXG4gIGNsaWVudD86IENsaWVudFxuICAvKiogRmlsdGVyIGZ1bmN0aW9uICovXG4gIGZpbHRlcj86IENvbGxlY3RvckZpbHRlclxuICAvKiogTWF4IGVudHJpZXMgdG8gY29sbGVjdCAqL1xuICBtYXg/OiBudW1iZXJcbiAgLyoqIFdoZXRoZXIgb3Igbm90IHRvIGRlLWluaXRpYWxpemUgb24gZW5kICovXG4gIGRlaW5pdE9uRW5kPzogYm9vbGVhblxuICAvKiogVGltZW91dCB0byBlbmQgdGhlIENvbGxlY3RvciBpZiBub3QgZnVsZmlsbGVkIGlmIGFueSBmaWx0ZXIgb3IgbWF4ICovXG4gIHRpbWVvdXQ/OiBudW1iZXJcbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9jb25zaXN0ZW50LXR5cGUtZGVmaW5pdGlvbnNcbmV4cG9ydCB0eXBlIENvbGxlY3RvckV2ZW50cyA9IHtcbiAgc3RhcnQ6IFtdXG4gIGVuZDogW11cbiAgY29sbGVjdDogYW55W11cbn1cblxuZXhwb3J0IGNsYXNzIENvbGxlY3RvcjxcbiAgVCBleHRlbmRzIHVua25vd25bXSA9IGFueVtdXG4+IGV4dGVuZHMgSGFybW9ueUV2ZW50RW1pdHRlcjxDb2xsZWN0b3JFdmVudHM+IHtcbiAgY2xpZW50PzogQ2xpZW50XG4gIHByaXZhdGUgX3N0YXJ0ZWQ6IGJvb2xlYW4gPSBmYWxzZVxuICBldmVudDogc3RyaW5nXG4gIGZpbHRlcjogQ29sbGVjdG9yRmlsdGVyID0gKCkgPT4gdHJ1ZVxuICBjb2xsZWN0ZWQ6IENvbGxlY3Rpb248c3RyaW5nLCBUPiA9IG5ldyBDb2xsZWN0aW9uKClcbiAgbWF4PzogbnVtYmVyXG4gIGRlaW5pdE9uRW5kOiBib29sZWFuID0gZmFsc2VcbiAgdGltZW91dD86IG51bWJlclxuICBwcml2YXRlIF90aW1lcj86IG51bWJlclxuXG4gIGdldCBzdGFydGVkKCk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLl9zdGFydGVkXG4gIH1cblxuICBzZXQgc3RhcnRlZChkOiBib29sZWFuKSB7XG4gICAgaWYgKGQgIT09IHRoaXMuX3N0YXJ0ZWQpIHtcbiAgICAgIHRoaXMuX3N0YXJ0ZWQgPSBkXG4gICAgICBpZiAoZCkgdGhpcy5lbWl0KCdzdGFydCcpXG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuZGVpbml0T25FbmQgJiYgdGhpcy5jbGllbnQgIT09IHVuZGVmaW5lZClcbiAgICAgICAgICB0aGlzLmRlaW5pdCh0aGlzLmNsaWVudClcbiAgICAgICAgdGhpcy5lbWl0KCdlbmQnKVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0cnVjdG9yKG9wdGlvbnM6IENvbGxlY3Rvck9wdGlvbnMgfCBzdHJpbmcpIHtcbiAgICBzdXBlcigpXG4gICAgaWYgKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJykgdGhpcy5ldmVudCA9IG9wdGlvbnNcbiAgICBlbHNlIHtcbiAgICAgIHRoaXMuZXZlbnQgPSBvcHRpb25zLmV2ZW50XG4gICAgICB0aGlzLmNsaWVudCA9IG9wdGlvbnMuY2xpZW50XG4gICAgICB0aGlzLmZpbHRlciA9IG9wdGlvbnMuZmlsdGVyID8/ICgoKSA9PiB0cnVlKVxuICAgICAgdGhpcy5tYXggPSBvcHRpb25zLm1heFxuICAgICAgdGhpcy5kZWluaXRPbkVuZCA9IG9wdGlvbnMuZGVpbml0T25FbmQgPz8gZmFsc2VcbiAgICAgIHRoaXMudGltZW91dCA9IG9wdGlvbnMudGltZW91dFxuICAgIH1cbiAgfVxuXG4gIC8qKiBTdGFydCBjb2xsZWN0aW5nICovXG4gIGNvbGxlY3QoKTogdGhpcyB7XG4gICAgdGhpcy5zdGFydGVkID0gdHJ1ZVxuICAgIGlmICh0aGlzLmNsaWVudCAhPT0gdW5kZWZpbmVkKSB0aGlzLmluaXQodGhpcy5jbGllbnQpXG4gICAgaWYgKHRoaXMuX3RpbWVyICE9PSB1bmRlZmluZWQpIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcilcbiAgICBpZiAodGhpcy50aW1lb3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIHRoaXMuZW5kKClcbiAgICAgIH0sIHRoaXMudGltZW91dClcbiAgICB9XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBFbmQgY29sbGVjdGluZyAqL1xuICBlbmQoKTogdGhpcyB7XG4gICAgdGhpcy5zdGFydGVkID0gZmFsc2VcbiAgICBpZiAodGhpcy5fdGltZXIgIT09IHVuZGVmaW5lZCkgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogUmVzZXQgY29sbGVjdG9yIGFuZCBzdGFydCBhZ2FpbiAqL1xuICByZXNldCgpOiB0aGlzIHtcbiAgICB0aGlzLmNvbGxlY3RlZCA9IG5ldyBDb2xsZWN0aW9uKClcbiAgICB0aGlzLmNvbGxlY3QoKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICAvKiogSW5pdCB0aGUgQ29sbGVjdG9yIG9uIENsaWVudCAqL1xuICBpbml0KGNsaWVudDogQ2xpZW50KTogdGhpcyB7XG4gICAgdGhpcy5jbGllbnQgPSBjbGllbnRcbiAgICBjbGllbnQuYWRkQ29sbGVjdG9yKHRoaXMpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBEZSBpbml0aWFsaXplIHRoZSBDb2xsZWN0b3IgaS5lLiByZW1vdmUgY2xlYW5seSAqL1xuICBkZWluaXQoY2xpZW50OiBDbGllbnQpOiB0aGlzIHtcbiAgICBjbGllbnQucmVtb3ZlQ29sbGVjdG9yKHRoaXMpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2UgbWF5IHdhbnQgdG8gcGVyZm9ybSBvbiBhbiBleHRlbmRlZCB2ZXJzaW9uIG9mIENvbGxlY3RvciAqL1xuICBwcm90ZWN0ZWQgY2hlY2soLi4uX2FyZ3M6IFQpOiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKiBGaXJlIHRoZSBDb2xsZWN0b3IgKi9cbiAgYXN5bmMgX2ZpcmUoLi4uYXJnczogVCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGlmICghdGhpcy5zdGFydGVkKSByZXR1cm5cbiAgICBjb25zdCBjaGVjayA9IGF3YWl0IHRoaXMuY2hlY2soLi4uYXJncylcbiAgICBpZiAoIWNoZWNrKSByZXR1cm5cbiAgICBjb25zdCBmaWx0ZXIgPSBhd2FpdCB0aGlzLmZpbHRlciguLi5hcmdzKVxuICAgIGlmICghZmlsdGVyKSByZXR1cm5cbiAgICB0aGlzLmNvbGxlY3RlZC5zZXQoKE51bWJlcih0aGlzLmNvbGxlY3RlZC5zaXplKSArIDEpLnRvU3RyaW5nKCksIGFyZ3MpXG4gICAgdGhpcy5lbWl0KCdjb2xsZWN0JywgLi4uYXJncylcbiAgICBpZiAoXG4gICAgICB0aGlzLm1heCAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAvLyBsaW50ZXI6IHNlbmQgaGVscFxuICAgICAgdGhpcy5tYXggPCBOdW1iZXIodGhpcy5jb2xsZWN0ZWQuc2l6ZSkgKyAxXG4gICAgKSB7XG4gICAgICB0aGlzLmVuZCgpXG4gICAgfVxuICB9XG5cbiAgLyoqIFNldCBmaWx0ZXIgb2YgdGhlIENvbGxlY3RvciAqL1xuICB3aGVuKGZpbHRlcjogQ29sbGVjdG9yRmlsdGVyKTogdGhpcyB7XG4gICAgdGhpcy5maWx0ZXIgPSBmaWx0ZXJcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgLyoqIEFkZCBhIG5ldyBsaXN0ZW5lciBmb3IgJ2NvbGxlY3QnIGV2ZW50ICovXG4gIGVhY2goaGFuZGxlcjogQ2FsbGFibGVGdW5jdGlvbik6IHRoaXMge1xuICAgIHRoaXMub24oJ2NvbGxlY3QnLCAoKSA9PiBoYW5kbGVyKCkpXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIC8qKiBSZXR1cm5zIGEgUHJvbWlzZSByZXNvbHZlZCB3aGVuIENvbGxlY3RvciBlbmRzIG9yIGEgdGltZW91dCBvY2N1cnMgKi9cbiAgYXN5bmMgd2FpdCh0aW1lb3V0PzogbnVtYmVyKTogUHJvbWlzZTx0aGlzPiB7XG4gICAgaWYgKHRpbWVvdXQgPT09IHVuZGVmaW5lZCkgdGltZW91dCA9IHRoaXMudGltZW91dCA/PyAwXG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvc3RyaWN0LWJvb2xlYW4tZXhwcmVzc2lvbnNcbiAgICAgIGlmICghdGltZW91dClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICdUaW1lb3V0IGlzIHJlcXVpcmVkIHBhcmFtZXRlciBpZiBub3QgZ2l2ZW4gaW4gQ29sbGVjdG9yT3B0aW9ucydcbiAgICAgICAgKVxuXG4gICAgICBsZXQgZG9uZSA9IGZhbHNlXG4gICAgICBjb25zdCBvbmVuZCA9ICgpOiB2b2lkID0+IHtcbiAgICAgICAgZG9uZSA9IHRydWVcbiAgICAgICAgdGhpcy5vZmYoJ2VuZCcsIG9uZW5kKVxuICAgICAgICByZXNvbHZlKHRoaXMpXG4gICAgICB9XG5cbiAgICAgIHRoaXMub24oJ2VuZCcsIG9uZW5kKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmICghZG9uZSkge1xuICAgICAgICAgIHRoaXMub2ZmKCdlbmQnLCBvbmVuZClcbiAgICAgICAgICByZWplY3QobmV3IEVycm9yKCdUaW1lb3V0JykpXG4gICAgICAgIH1cbiAgICAgIH0sIHRpbWVvdXQpXG4gICAgfSlcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsVUFBVSxRQUFRLHlCQUF3QjtBQUVuRCxTQUFTLG1CQUFtQixRQUFRLHFCQUFvQjtBQTRCeEQsT0FBTyxNQUFNLGtCQUVIO0lBQ1IsT0FBZTtJQUNQLFdBQW9CLEtBQUssQ0FBQTtJQUNqQyxNQUFhO0lBQ2IsU0FBMEIsSUFBTSxJQUFJLENBQUE7SUFDcEMsWUFBbUMsSUFBSSxhQUFZO0lBQ25ELElBQVk7SUFDWixjQUF1QixLQUFLLENBQUE7SUFDNUIsUUFBZ0I7SUFDUixPQUFlO0lBRXZCLElBQUksVUFBbUI7UUFDckIsT0FBTyxJQUFJLENBQUMsUUFBUTtJQUN0QjtJQUVBLElBQUksUUFBUSxDQUFVLEVBQUU7UUFDdEIsSUFBSSxNQUFNLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDdkIsSUFBSSxDQUFDLFFBQVEsR0FBRztZQUNoQixJQUFJLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztpQkFDWjtnQkFDSCxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxXQUN0QyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNO2dCQUN6QixJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ1osQ0FBQztRQUNILENBQUM7SUFDSDtJQUVBLFlBQVksT0FBa0MsQ0FBRTtRQUM5QyxLQUFLO1FBQ0wsSUFBSSxPQUFPLFlBQVksVUFBVSxJQUFJLENBQUMsS0FBSyxHQUFHO2FBQ3pDO1lBQ0gsSUFBSSxDQUFDLEtBQUssR0FBRyxRQUFRLEtBQUs7WUFDMUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLE1BQU07WUFDNUIsSUFBSSxDQUFDLE1BQU0sR0FBRyxRQUFRLE1BQU0sSUFBSSxDQUFDLElBQU0sSUFBSTtZQUMzQyxJQUFJLENBQUMsR0FBRyxHQUFHLFFBQVEsR0FBRztZQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLFFBQVEsV0FBVyxJQUFJLEtBQUs7WUFDL0MsSUFBSSxDQUFDLE9BQU8sR0FBRyxRQUFRLE9BQU87UUFDaEMsQ0FBQztJQUNIO0lBRUEscUJBQXFCLEdBQ3JCLFVBQWdCO1FBQ2QsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJO1FBQ25CLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU07UUFDcEQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFdBQVcsYUFBYSxJQUFJLENBQUMsTUFBTTtRQUN2RCxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssV0FBVztZQUM5QixJQUFJLENBQUMsTUFBTSxHQUFHLFdBQVcsSUFBTTtnQkFDN0IsSUFBSSxDQUFDLEdBQUc7WUFDVixHQUFHLElBQUksQ0FBQyxPQUFPO1FBQ2pCLENBQUM7UUFDRCxPQUFPLElBQUk7SUFDYjtJQUVBLG1CQUFtQixHQUNuQixNQUFZO1FBQ1YsSUFBSSxDQUFDLE9BQU8sR0FBRyxLQUFLO1FBQ3BCLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxXQUFXLGFBQWEsSUFBSSxDQUFDLE1BQU07UUFDdkQsT0FBTyxJQUFJO0lBQ2I7SUFFQSxvQ0FBb0MsR0FDcEMsUUFBYztRQUNaLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSTtRQUNyQixJQUFJLENBQUMsT0FBTztRQUNaLE9BQU8sSUFBSTtJQUNiO0lBRUEsaUNBQWlDLEdBQ2pDLEtBQUssTUFBYyxFQUFRO1FBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUc7UUFDZCxPQUFPLFlBQVksQ0FBQyxJQUFJO1FBQ3hCLE9BQU8sSUFBSTtJQUNiO0lBRUEsb0RBQW9ELEdBQ3BELE9BQU8sTUFBYyxFQUFRO1FBQzNCLE9BQU8sZUFBZSxDQUFDLElBQUk7UUFDM0IsT0FBTyxJQUFJO0lBQ2I7SUFFQSxzRUFBc0UsR0FDdEUsQUFBVSxNQUFNLEdBQUcsS0FBUSxFQUE4QjtRQUN2RCxPQUFPLElBQUk7SUFDYjtJQUVBLHVCQUF1QixHQUN2QixNQUFNLE1BQU0sR0FBRyxJQUFPLEVBQWlCO1FBQ3JDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ25CLE1BQU0sUUFBUSxNQUFNLElBQUksQ0FBQyxLQUFLLElBQUk7UUFDbEMsSUFBSSxDQUFDLE9BQU87UUFDWixNQUFNLFNBQVMsTUFBTSxJQUFJLENBQUMsTUFBTSxJQUFJO1FBQ3BDLElBQUksQ0FBQyxRQUFRO1FBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxRQUFRLElBQUk7UUFDakUsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjO1FBQ3hCLElBQ0UsSUFBSSxDQUFDLEdBQUcsS0FBSyxhQUNiLG9CQUFvQjtRQUNwQixJQUFJLENBQUMsR0FBRyxHQUFHLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLElBQUksR0FDekM7WUFDQSxJQUFJLENBQUMsR0FBRztRQUNWLENBQUM7SUFDSDtJQUVBLGdDQUFnQyxHQUNoQyxLQUFLLE1BQXVCLEVBQVE7UUFDbEMsSUFBSSxDQUFDLE1BQU0sR0FBRztRQUNkLE9BQU8sSUFBSTtJQUNiO0lBRUEsMkNBQTJDLEdBQzNDLEtBQUssT0FBeUIsRUFBUTtRQUNwQyxJQUFJLENBQUMsRUFBRSxDQUFDLFdBQVcsSUFBTTtRQUN6QixPQUFPLElBQUk7SUFDYjtJQUVBLHVFQUF1RSxHQUN2RSxNQUFNLEtBQUssT0FBZ0IsRUFBaUI7UUFDMUMsSUFBSSxZQUFZLFdBQVcsVUFBVSxJQUFJLENBQUMsT0FBTyxJQUFJO1FBQ3JELE9BQU8sTUFBTSxJQUFJLFFBQVEsQ0FBQyxTQUFTLFNBQVc7WUFDNUMseUVBQXlFO1lBQ3pFLElBQUksQ0FBQyxTQUNILE1BQU0sSUFBSSxNQUNSLGtFQUNEO1lBRUgsSUFBSSxPQUFPLEtBQUs7WUFDaEIsTUFBTSxRQUFRLElBQVk7Z0JBQ3hCLE9BQU8sSUFBSTtnQkFDWCxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU87Z0JBQ2hCLFFBQVEsSUFBSTtZQUNkO1lBRUEsSUFBSSxDQUFDLEVBQUUsQ0FBQyxPQUFPO1lBQ2YsV0FBVyxJQUFNO2dCQUNmLElBQUksQ0FBQyxNQUFNO29CQUNULElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTztvQkFDaEIsT0FBTyxJQUFJLE1BQU07Z0JBQ25CLENBQUM7WUFDSCxHQUFHO1FBQ0w7SUFDRjtBQUNGLENBQUMifQ==