import { Collection } from '../utils/collection.ts';
import { Gateway } from '../gateway/mod.ts';
import { HarmonyEventEmitter } from '../utils/events.ts';
import { GatewayEvents } from '../types/gateway.ts';
import { delay } from '../utils/delay.ts';
export class ShardManager extends HarmonyEventEmitter {
    list = new Collection();
    client;
    cachedShardCount;
    queueProcessing = false;
    queue = [];
    get rest() {
        return this.client.rest;
    }
    /** Get average ping from all Shards */ get ping() {
        return(// eslint-disable-next-line @typescript-eslint/restrict-plus-operands
        this.list.map((e)=>e.ping).reduce((p, a)=>p + a, 0) / this.list.size);
    }
    constructor(client){
        super();
        this.client = client;
    }
    debug(msg) {
        this.client.debug('Shards', msg);
    }
    enqueueIdentify(fn) {
        this.queue.push(fn);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        if (!this.queueProcessing) this.processQueue();
        return this;
    }
    async processQueue() {
        if (this.queueProcessing || this.queue.length === 0) return;
        this.queueProcessing = true;
        const item = this.queue[0];
        await item();
        this.queue.shift();
        await delay(5000);
        this.queueProcessing = false;
        if (this.queue.length === 0) {
            this.queueProcessing = false;
        } else {
            await this.processQueue();
        }
    }
    async getShardCount() {
        let shardCount;
        if (this.cachedShardCount !== undefined) shardCount = this.cachedShardCount;
        else {
            if (this.client.shardCount === 'auto' && this.client.fetchGatewayInfo !== false) {
                this.debug(`Fetch /api/v${this.client.rest.version}/gateway/bot...`);
                const info = await this.client.rest.api.gateway.bot.get();
                this.debug(`Recommended Shards: ${info.shards}`);
                this.debug('=== Session Limit Info ===');
                this.debug(`Remaining: ${info.session_start_limit.remaining}/${info.session_start_limit.total}`);
                this.debug(`Reset After: ${info.session_start_limit.reset_after}ms`);
                shardCount = info.shards;
            } else shardCount = typeof this.client.shardCount === 'string' ? 1 : this.client.shardCount ?? 1;
        }
        this.cachedShardCount = shardCount;
        return this.cachedShardCount;
    }
    /** Launches a new Shard */ async launch(id, waitFor = GatewayEvents.Ready) {
        if (this.list.has(id.toString()) === true) throw new Error(`Shard ${id} already launched`);
        this.debug(`Launching Shard: ${id}`);
        const shardCount = this.cachedShardCount ?? await this.getShardCount();
        const gw = new Gateway(this.client, [
            Number(id),
            shardCount
        ]);
        this.list.set(id.toString(), gw);
        gw.initWebsocket();
        this.emit('launch', id);
        gw.on(GatewayEvents.Ready, ()=>this.emit('shardReady', id));
        gw.on('error', (err, evt)=>this.emit('shardError', id, err, evt));
        gw.on(GatewayEvents.Resumed, ()=>this.emit('shardResume', id));
        gw.on('close', (code, reason)=>this.emit('shardDisconnect', id, code, reason));
        gw.on('guildsLoaded', ()=>this.client.emit('guildsLoaded', id));
        return gw.waitFor(waitFor, ()=>true).then(()=>this);
    }
    /** Launches all Shards */ async connect() {
        const shardCount = await this.getShardCount();
        this.client.shardCount = shardCount;
        this.debug(`Launching ${shardCount} shard${shardCount === 1 ? '' : 's'}...`);
        const startTime = Date.now();
        const shardLoadPromises = [];
        for(let i = 0; i < shardCount; i++){
            shardLoadPromises.push(this.client.waitFor('guildsLoaded', (n)=>n === i));
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            await this.launch(i, 'hello');
        }
        await Promise.allSettled(shardLoadPromises).then(()=>{
            this.client.emit('ready', shardCount);
        }, (e)=>{
            console.error('Failed to launch some shard', e);
        });
        const endTime = Date.now();
        const diff = endTime - startTime;
        this.debug(`Launched ${shardCount} shards! Time taken: ${Math.floor(diff / 1000)}s`);
        return this;
    }
    destroy() {
        this.list.forEach((shard)=>{
            shard.destroy();
        });
    }
    get(id) {
        return this.list.get(id.toString());
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2NsaWVudC9zaGFyZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb2xsZWN0aW9uIH0gZnJvbSAnLi4vdXRpbHMvY29sbGVjdGlvbi50cydcbmltcG9ydCB0eXBlIHsgQ2xpZW50IH0gZnJvbSAnLi9jbGllbnQudHMnXG5pbXBvcnQgeyBSRVNUTWFuYWdlciB9IGZyb20gJy4uL3Jlc3QvbW9kLnRzJ1xuaW1wb3J0IHsgR2F0ZXdheSB9IGZyb20gJy4uL2dhdGV3YXkvbW9kLnRzJ1xuaW1wb3J0IHsgSGFybW9ueUV2ZW50RW1pdHRlciB9IGZyb20gJy4uL3V0aWxzL2V2ZW50cy50cydcbmltcG9ydCB7IEdhdGV3YXlFdmVudHMgfSBmcm9tICcuLi90eXBlcy9nYXRld2F5LnRzJ1xuaW1wb3J0IHsgZGVsYXkgfSBmcm9tICcuLi91dGlscy9kZWxheS50cydcblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9jb25zaXN0ZW50LXR5cGUtZGVmaW5pdGlvbnNcbmV4cG9ydCB0eXBlIFNoYXJkTWFuYWdlckV2ZW50cyA9IHtcbiAgbGF1bmNoOiBbbnVtYmVyXVxuICBzaGFyZFJlYWR5OiBbbnVtYmVyXVxuICBzaGFyZERpc2Nvbm5lY3Q6IFtudW1iZXIsIG51bWJlciB8IHVuZGVmaW5lZCwgc3RyaW5nIHwgdW5kZWZpbmVkXVxuICBzaGFyZEVycm9yOiBbbnVtYmVyLCBFcnJvciwgRXJyb3JFdmVudF1cbiAgc2hhcmRSZXN1bWU6IFtudW1iZXJdXG59XG5cbmV4cG9ydCBjbGFzcyBTaGFyZE1hbmFnZXIgZXh0ZW5kcyBIYXJtb255RXZlbnRFbWl0dGVyPFNoYXJkTWFuYWdlckV2ZW50cz4ge1xuICBsaXN0OiBDb2xsZWN0aW9uPHN0cmluZywgR2F0ZXdheT4gPSBuZXcgQ29sbGVjdGlvbigpXG4gIGNsaWVudDogQ2xpZW50XG4gIGNhY2hlZFNoYXJkQ291bnQ/OiBudW1iZXJcbiAgcXVldWVQcm9jZXNzaW5nOiBib29sZWFuID0gZmFsc2VcbiAgcXVldWU6IENhbGxhYmxlRnVuY3Rpb25bXSA9IFtdXG5cbiAgZ2V0IHJlc3QoKTogUkVTVE1hbmFnZXIge1xuICAgIHJldHVybiB0aGlzLmNsaWVudC5yZXN0XG4gIH1cblxuICAvKiogR2V0IGF2ZXJhZ2UgcGluZyBmcm9tIGFsbCBTaGFyZHMgKi9cbiAgZ2V0IHBpbmcoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gKFxuICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9yZXN0cmljdC1wbHVzLW9wZXJhbmRzXG4gICAgICB0aGlzLmxpc3QubWFwKChlKSA9PiBlLnBpbmcpLnJlZHVjZSgocCwgYSkgPT4gcCArIGEsIDApIC8gdGhpcy5saXN0LnNpemVcbiAgICApXG4gIH1cblxuICBjb25zdHJ1Y3RvcihjbGllbnQ6IENsaWVudCkge1xuICAgIHN1cGVyKClcbiAgICB0aGlzLmNsaWVudCA9IGNsaWVudFxuICB9XG5cbiAgZGVidWcobXNnOiBzdHJpbmcpOiB2b2lkIHtcbiAgICB0aGlzLmNsaWVudC5kZWJ1ZygnU2hhcmRzJywgbXNnKVxuICB9XG5cbiAgZW5xdWV1ZUlkZW50aWZ5KGZuOiBDYWxsYWJsZUZ1bmN0aW9uKTogU2hhcmRNYW5hZ2VyIHtcbiAgICB0aGlzLnF1ZXVlLnB1c2goZm4pXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1mbG9hdGluZy1wcm9taXNlc1xuICAgIGlmICghdGhpcy5xdWV1ZVByb2Nlc3NpbmcpIHRoaXMucHJvY2Vzc1F1ZXVlKClcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBwcm9jZXNzUXVldWUoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKHRoaXMucXVldWVQcm9jZXNzaW5nIHx8IHRoaXMucXVldWUubGVuZ3RoID09PSAwKSByZXR1cm5cbiAgICB0aGlzLnF1ZXVlUHJvY2Vzc2luZyA9IHRydWVcbiAgICBjb25zdCBpdGVtID0gdGhpcy5xdWV1ZVswXVxuICAgIGF3YWl0IGl0ZW0oKVxuICAgIHRoaXMucXVldWUuc2hpZnQoKVxuICAgIGF3YWl0IGRlbGF5KDUwMDApXG4gICAgdGhpcy5xdWV1ZVByb2Nlc3NpbmcgPSBmYWxzZVxuICAgIGlmICh0aGlzLnF1ZXVlLmxlbmd0aCA9PT0gMCkge1xuICAgICAgdGhpcy5xdWV1ZVByb2Nlc3NpbmcgPSBmYWxzZVxuICAgIH0gZWxzZSB7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3NRdWV1ZSgpXG4gICAgfVxuICB9XG5cbiAgYXN5bmMgZ2V0U2hhcmRDb3VudCgpOiBQcm9taXNlPG51bWJlcj4ge1xuICAgIGxldCBzaGFyZENvdW50OiBudW1iZXJcbiAgICBpZiAodGhpcy5jYWNoZWRTaGFyZENvdW50ICE9PSB1bmRlZmluZWQpIHNoYXJkQ291bnQgPSB0aGlzLmNhY2hlZFNoYXJkQ291bnRcbiAgICBlbHNlIHtcbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy5jbGllbnQuc2hhcmRDb3VudCA9PT0gJ2F1dG8nICYmXG4gICAgICAgIHRoaXMuY2xpZW50LmZldGNoR2F0ZXdheUluZm8gIT09IGZhbHNlXG4gICAgICApIHtcbiAgICAgICAgdGhpcy5kZWJ1ZyhgRmV0Y2ggL2FwaS92JHt0aGlzLmNsaWVudC5yZXN0LnZlcnNpb259L2dhdGV3YXkvYm90Li4uYClcbiAgICAgICAgY29uc3QgaW5mbyA9IGF3YWl0IHRoaXMuY2xpZW50LnJlc3QuYXBpLmdhdGV3YXkuYm90LmdldCgpXG4gICAgICAgIHRoaXMuZGVidWcoYFJlY29tbWVuZGVkIFNoYXJkczogJHtpbmZvLnNoYXJkc31gKVxuICAgICAgICB0aGlzLmRlYnVnKCc9PT0gU2Vzc2lvbiBMaW1pdCBJbmZvID09PScpXG4gICAgICAgIHRoaXMuZGVidWcoXG4gICAgICAgICAgYFJlbWFpbmluZzogJHtpbmZvLnNlc3Npb25fc3RhcnRfbGltaXQucmVtYWluaW5nfS8ke2luZm8uc2Vzc2lvbl9zdGFydF9saW1pdC50b3RhbH1gXG4gICAgICAgIClcbiAgICAgICAgdGhpcy5kZWJ1ZyhgUmVzZXQgQWZ0ZXI6ICR7aW5mby5zZXNzaW9uX3N0YXJ0X2xpbWl0LnJlc2V0X2FmdGVyfW1zYClcbiAgICAgICAgc2hhcmRDb3VudCA9IGluZm8uc2hhcmRzIGFzIG51bWJlclxuICAgICAgfSBlbHNlXG4gICAgICAgIHNoYXJkQ291bnQgPVxuICAgICAgICAgIHR5cGVvZiB0aGlzLmNsaWVudC5zaGFyZENvdW50ID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgPyAxXG4gICAgICAgICAgICA6IHRoaXMuY2xpZW50LnNoYXJkQ291bnQgPz8gMVxuICAgIH1cbiAgICB0aGlzLmNhY2hlZFNoYXJkQ291bnQgPSBzaGFyZENvdW50XG4gICAgcmV0dXJuIHRoaXMuY2FjaGVkU2hhcmRDb3VudFxuICB9XG5cbiAgLyoqIExhdW5jaGVzIGEgbmV3IFNoYXJkICovXG4gIGFzeW5jIGxhdW5jaChcbiAgICBpZDogbnVtYmVyLFxuICAgIHdhaXRGb3I6IEdhdGV3YXlFdmVudHMuUmVhZHkgfCAnaGVsbG8nID0gR2F0ZXdheUV2ZW50cy5SZWFkeVxuICApOiBQcm9taXNlPFNoYXJkTWFuYWdlcj4ge1xuICAgIGlmICh0aGlzLmxpc3QuaGFzKGlkLnRvU3RyaW5nKCkpID09PSB0cnVlKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBTaGFyZCAke2lkfSBhbHJlYWR5IGxhdW5jaGVkYClcblxuICAgIHRoaXMuZGVidWcoYExhdW5jaGluZyBTaGFyZDogJHtpZH1gKVxuICAgIGNvbnN0IHNoYXJkQ291bnQgPSB0aGlzLmNhY2hlZFNoYXJkQ291bnQgPz8gKGF3YWl0IHRoaXMuZ2V0U2hhcmRDb3VudCgpKVxuXG4gICAgY29uc3QgZ3cgPSBuZXcgR2F0ZXdheSh0aGlzLmNsaWVudCwgW051bWJlcihpZCksIHNoYXJkQ291bnRdKVxuICAgIHRoaXMubGlzdC5zZXQoaWQudG9TdHJpbmcoKSwgZ3cpXG5cbiAgICBndy5pbml0V2Vic29ja2V0KClcbiAgICB0aGlzLmVtaXQoJ2xhdW5jaCcsIGlkKVxuXG4gICAgZ3cub24oR2F0ZXdheUV2ZW50cy5SZWFkeSwgKCkgPT4gdGhpcy5lbWl0KCdzaGFyZFJlYWR5JywgaWQpKVxuICAgIGd3Lm9uKCdlcnJvcicsIChlcnI6IEVycm9yLCBldnQ6IEVycm9yRXZlbnQpID0+XG4gICAgICB0aGlzLmVtaXQoJ3NoYXJkRXJyb3InLCBpZCwgZXJyLCBldnQpXG4gICAgKVxuICAgIGd3Lm9uKEdhdGV3YXlFdmVudHMuUmVzdW1lZCwgKCkgPT4gdGhpcy5lbWl0KCdzaGFyZFJlc3VtZScsIGlkKSlcbiAgICBndy5vbignY2xvc2UnLCAoY29kZTogbnVtYmVyLCByZWFzb246IHN0cmluZykgPT5cbiAgICAgIHRoaXMuZW1pdCgnc2hhcmREaXNjb25uZWN0JywgaWQsIGNvZGUsIHJlYXNvbilcbiAgICApXG4gICAgZ3cub24oJ2d1aWxkc0xvYWRlZCcsICgpID0+IHRoaXMuY2xpZW50LmVtaXQoJ2d1aWxkc0xvYWRlZCcsIGlkKSlcblxuICAgIHJldHVybiBndy53YWl0Rm9yKHdhaXRGb3IsICgpID0+IHRydWUpLnRoZW4oKCkgPT4gdGhpcylcbiAgfVxuXG4gIC8qKiBMYXVuY2hlcyBhbGwgU2hhcmRzICovXG4gIGFzeW5jIGNvbm5lY3QoKTogUHJvbWlzZTxTaGFyZE1hbmFnZXI+IHtcbiAgICBjb25zdCBzaGFyZENvdW50ID0gYXdhaXQgdGhpcy5nZXRTaGFyZENvdW50KClcbiAgICB0aGlzLmNsaWVudC5zaGFyZENvdW50ID0gc2hhcmRDb3VudFxuICAgIHRoaXMuZGVidWcoYExhdW5jaGluZyAke3NoYXJkQ291bnR9IHNoYXJkJHtzaGFyZENvdW50ID09PSAxID8gJycgOiAncyd9Li4uYClcbiAgICBjb25zdCBzdGFydFRpbWUgPSBEYXRlLm5vdygpXG4gICAgY29uc3Qgc2hhcmRMb2FkUHJvbWlzZXMgPSBbXVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2hhcmRDb3VudDsgaSsrKSB7XG4gICAgICBzaGFyZExvYWRQcm9taXNlcy5wdXNoKFxuICAgICAgICB0aGlzLmNsaWVudC53YWl0Rm9yKCdndWlsZHNMb2FkZWQnLCAobikgPT4gbiA9PT0gaSlcbiAgICAgIClcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZmxvYXRpbmctcHJvbWlzZXNcbiAgICAgIGF3YWl0IHRoaXMubGF1bmNoKGksICdoZWxsbycpXG4gICAgfVxuICAgIGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChzaGFyZExvYWRQcm9taXNlcykudGhlbihcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy5jbGllbnQuZW1pdCgncmVhZHknLCBzaGFyZENvdW50KVxuICAgICAgfSxcbiAgICAgIChlKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0ZhaWxlZCB0byBsYXVuY2ggc29tZSBzaGFyZCcsIGUpXG4gICAgICB9XG4gICAgKVxuICAgIGNvbnN0IGVuZFRpbWUgPSBEYXRlLm5vdygpXG4gICAgY29uc3QgZGlmZiA9IGVuZFRpbWUgLSBzdGFydFRpbWVcbiAgICB0aGlzLmRlYnVnKFxuICAgICAgYExhdW5jaGVkICR7c2hhcmRDb3VudH0gc2hhcmRzISBUaW1lIHRha2VuOiAke01hdGguZmxvb3IoZGlmZiAvIDEwMDApfXNgXG4gICAgKVxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMubGlzdC5mb3JFYWNoKChzaGFyZCkgPT4ge1xuICAgICAgc2hhcmQuZGVzdHJveSgpXG4gICAgfSlcbiAgfVxuXG4gIGdldChpZDogbnVtYmVyKTogR2F0ZXdheSB8IHVuZGVmaW5lZCB7XG4gICAgcmV0dXJuIHRoaXMubGlzdC5nZXQoaWQudG9TdHJpbmcoKSlcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsVUFBVSxR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