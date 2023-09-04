// Copyright 2020-present the denosaurs team. All rights reserved. MIT license.
export class EventEmitter {
    #listeners = {};
    #globalWriters = [];
    #onWriters = {};
    #limit;
    /**
   * @param maxListenersPerEvent - if set to 0, no limit is applied. defaults to 10
   */ constructor(maxListenersPerEvent){
        this.#limit = maxListenersPerEvent ?? 10;
    }
    on(eventName, listener) {
        if (listener) {
            if (!this.#listeners[eventName]) {
                this.#listeners[eventName] = [];
            }
            if (this.#limit !== 0 && this.#listeners[eventName].length >= this.#limit) {
                throw new TypeError("Listeners limit reached: limit is " + this.#limit);
            }
            this.#listeners[eventName].push({
                once: false,
                cb: listener
            });
            return this;
        } else {
            if (!this.#onWriters[eventName]) {
                this.#onWriters[eventName] = [];
            }
            if (this.#limit !== 0 && this.#onWriters[eventName].length >= this.#limit) {
                throw new TypeError("Listeners limit reached: limit is " + this.#limit);
            }
            const { readable , writable  } = new TransformStream();
            this.#onWriters[eventName].push(writable.getWriter());
            return readable[Symbol.asyncIterator]();
        }
    }
    once(eventName, listener) {
        if (!this.#listeners[eventName]) {
            this.#listeners[eventName] = [];
        }
        if (this.#limit !== 0 && this.#listeners[eventName].length >= this.#limit) {
            throw new TypeError("Listeners limit reached: limit is " + this.#limit);
        }
        if (listener) {
            this.#listeners[eventName].push({
                once: true,
                cb: listener
            });
            return this;
        } else {
            return new Promise((res)=>{
                this.#listeners[eventName].push({
                    once: true,
                    cb: (...args)=>res(args)
                });
            });
        }
    }
    /**
   * Removes the listener from eventName.
   * If no listener is passed, all listeners will be removed from eventName,
   * this includes async listeners.
   * If no eventName is passed, all listeners will be removed from the EventEmitter,
   * including the async iterator for the class
   */ async off(eventName, listener) {
        if (eventName) {
            if (listener) {
                this.#listeners[eventName] = this.#listeners[eventName]?.filter(({ cb  })=>cb !== listener);
            } else {
                if (this.#onWriters[eventName]) {
                    for (const writer of this.#onWriters[eventName]){
                        await writer.close();
                    }
                    delete this.#onWriters[eventName];
                }
                delete this.#listeners[eventName];
            }
        } else {
            for (const writers of Object.values(this.#onWriters)){
                for (const writer1 of writers){
                    await writer1.close();
                }
            }
            this.#onWriters = {};
            for (const writer2 of this.#globalWriters){
                await writer2.close();
            }
            this.#globalWriters = [];
            this.#listeners = {};
        }
        return this;
    }
    /**
   * Synchronously calls each of the listeners registered for the event named
   * eventName, in the order they were registered, passing the supplied
   * arguments to each.
   */ async emit(eventName, ...args) {
        const listeners = this.#listeners[eventName]?.slice() ?? [];
        for (const { cb , once  } of listeners){
            cb(...args);
            if (once) {
                this.off(eventName, cb);
            }
        }
        if (this.#onWriters[eventName]) {
            for (const writer of this.#onWriters[eventName]){
                await writer.write(args);
            }
        }
        for (const writer1 of this.#globalWriters){
            await writer1.write({
                name: eventName,
                value: args
            });
        }
    }
    [Symbol.asyncIterator]() {
        if (this.#limit !== 0 && this.#globalWriters.length >= this.#limit) {
            throw new TypeError("Listeners limit reached: limit is " + this.#limit);
        }
        const { readable , writable  } = new TransformStream();
        this.#globalWriters.push(writable.getWriter());
        return readable[Symbol.asyncIterator]();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZXZlbnRAMi4wLjAvbW9kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDIwLXByZXNlbnQgdGhlIGRlbm9zYXVycyB0ZWFtLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxudHlwZSBFbnRyeTxFLCBLIGV4dGVuZHMga2V5b2YgRT4gPSB7XG4gIG5hbWU6IEs7XG4gIHZhbHVlOiBFW0tdO1xufTtcblxuZXhwb3J0IGNsYXNzIEV2ZW50RW1pdHRlcjxFIGV4dGVuZHMgUmVjb3JkPHN0cmluZywgdW5rbm93bltdPj4ge1xuICAjbGlzdGVuZXJzOiB7XG4gICAgW0sgaW4ga2V5b2YgRV0/OiBBcnJheTx7XG4gICAgICBvbmNlOiBib29sZWFuO1xuICAgICAgY2I6ICguLi5hcmdzOiBFW0tdKSA9PiB2b2lkO1xuICAgIH0+O1xuICB9ID0ge307XG4gICNnbG9iYWxXcml0ZXJzOiBXcml0YWJsZVN0cmVhbURlZmF1bHRXcml0ZXI8RW50cnk8RSwga2V5b2YgRT4+W10gPSBbXTtcbiAgI29uV3JpdGVyczoge1xuICAgIFtLIGluIGtleW9mIEVdPzogV3JpdGFibGVTdHJlYW1EZWZhdWx0V3JpdGVyPEVbS10+W107XG4gIH0gPSB7fTtcbiAgI2xpbWl0OiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBtYXhMaXN0ZW5lcnNQZXJFdmVudCAtIGlmIHNldCB0byAwLCBubyBsaW1pdCBpcyBhcHBsaWVkLiBkZWZhdWx0cyB0byAxMFxuICAgKi9cbiAgY29uc3RydWN0b3IobWF4TGlzdGVuZXJzUGVyRXZlbnQ/OiBudW1iZXIpIHtcbiAgICB0aGlzLiNsaW1pdCA9IG1heExpc3RlbmVyc1BlckV2ZW50ID8/IDEwO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGVuZHMgdGhlIGxpc3RlbmVyIHRvIHRoZSBsaXN0ZW5lcnMgYXJyYXkgb2YgdGhlIGNvcnJlc3BvbmRpbmcgZXZlbnROYW1lLlxuICAgKiBObyBjaGVja3MgYXJlIG1hZGUgaWYgdGhlIGxpc3RlbmVyIHdhcyBhbHJlYWR5IGFkZGVkLCBzbyBhZGRpbmcgbXVsdGlwbGVcbiAgICogbGlzdGVuZXJzIHdpbGwgcmVzdWx0IGluIHRoZSBsaXN0ZW5lciBiZWluZyBjYWxsZWQgbXVsdGlwbGUgdGltZXMuXG4gICAqIElmIG5vIGxpc3RlbmVyIGlzIHBhc3NlZCwgaXQgcmV0dXJucyBhbiBhc3luY0l0ZXJhdG9yIHdoaWNoIHdpbGwgZmlyZVxuICAgKiBldmVyeSB0aW1lIGV2ZW50TmFtZSBpcyBlbWl0dGVkLlxuICAgKi9cbiAgb248SyBleHRlbmRzIGtleW9mIEU+KGV2ZW50TmFtZTogSywgbGlzdGVuZXI6ICguLi5hcmdzOiBFW0tdKSA9PiB2b2lkKTogdGhpcztcbiAgb248SyBleHRlbmRzIGtleW9mIEU+KGV2ZW50TmFtZTogSyk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxFW0tdPjtcbiAgb248SyBleHRlbmRzIGtleW9mIEU+KFxuICAgIGV2ZW50TmFtZTogSyxcbiAgICBsaXN0ZW5lcj86ICguLi5hcmdzOiBFW0tdKSA9PiB2b2lkLFxuICApOiB0aGlzIHwgQXN5bmNJdGVyYWJsZUl0ZXJhdG9yPEVbS10+IHtcbiAgICBpZiAobGlzdGVuZXIpIHtcbiAgICAgIGlmICghdGhpcy4jbGlzdGVuZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgICAgdGhpcy4jbGlzdGVuZXJzW2V2ZW50TmFtZV0gPSBbXTtcbiAgICAgIH1cbiAgICAgIGlmIChcbiAgICAgICAgdGhpcy4jbGltaXQgIT09IDAgJiYgdGhpcy4jbGlzdGVuZXJzW2V2ZW50TmFtZV0hLmxlbmd0aCA+PSB0aGlzLiNsaW1pdFxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJMaXN0ZW5lcnMgbGltaXQgcmVhY2hlZDogbGltaXQgaXMgXCIgKyB0aGlzLiNsaW1pdCk7XG4gICAgICB9XG4gICAgICB0aGlzLiNsaXN0ZW5lcnNbZXZlbnROYW1lXSEucHVzaCh7XG4gICAgICAgIG9uY2U6IGZhbHNlLFxuICAgICAgICBjYjogbGlzdGVuZXIsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoIXRoaXMuI29uV3JpdGVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgIHRoaXMuI29uV3JpdGVyc1tldmVudE5hbWVdID0gW107XG4gICAgICB9XG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuI2xpbWl0ICE9PSAwICYmIHRoaXMuI29uV3JpdGVyc1tldmVudE5hbWVdIS5sZW5ndGggPj0gdGhpcy4jbGltaXRcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiTGlzdGVuZXJzIGxpbWl0IHJlYWNoZWQ6IGxpbWl0IGlzIFwiICsgdGhpcy4jbGltaXQpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCB7IHJlYWRhYmxlLCB3cml0YWJsZSB9ID0gbmV3IFRyYW5zZm9ybVN0cmVhbTxFW0tdLCBFW0tdPigpO1xuICAgICAgdGhpcy4jb25Xcml0ZXJzW2V2ZW50TmFtZV0hLnB1c2god3JpdGFibGUuZ2V0V3JpdGVyKCkpO1xuICAgICAgcmV0dXJuIHJlYWRhYmxlW1N5bWJvbC5hc3luY0l0ZXJhdG9yXSgpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBBZGRzIGEgb25lLXRpbWUgbGlzdGVuZXIgZnVuY3Rpb24gZm9yIHRoZSBldmVudCBuYW1lZCBldmVudE5hbWUuXG4gICAqIFRoZSBuZXh0IHRpbWUgZXZlbnROYW1lIGlzIGVtaXR0ZWQsIGxpc3RlbmVyIGlzIGNhbGxlZCBhbmQgdGhlbiByZW1vdmVkLlxuICAgKiBJZiBubyBsaXN0ZW5lciBpcyBwYXNzZWQsIGl0IHJldHVybnMgYSBQcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIG9uY2VcbiAgICogZXZlbnROYW1lIGlzIGVtaXR0ZWQuXG4gICAqL1xuICBvbmNlPEsgZXh0ZW5kcyBrZXlvZiBFPihcbiAgICBldmVudE5hbWU6IEssXG4gICAgbGlzdGVuZXI6ICguLi5hcmdzOiBFW0tdKSA9PiB2b2lkLFxuICApOiB0aGlzO1xuICBvbmNlPEsgZXh0ZW5kcyBrZXlvZiBFPihldmVudE5hbWU6IEspOiBQcm9taXNlPEVbS10+O1xuICBvbmNlPEsgZXh0ZW5kcyBrZXlvZiBFPihcbiAgICBldmVudE5hbWU6IEssXG4gICAgbGlzdGVuZXI/OiAoLi4uYXJnczogRVtLXSkgPT4gdm9pZCxcbiAgKTogdGhpcyB8IFByb21pc2U8RVtLXT4ge1xuICAgIGlmICghdGhpcy4jbGlzdGVuZXJzW2V2ZW50TmFtZV0pIHtcbiAgICAgIHRoaXMuI2xpc3RlbmVyc1tldmVudE5hbWVdID0gW107XG4gICAgfVxuICAgIGlmIChcbiAgICAgIHRoaXMuI2xpbWl0ICE9PSAwICYmIHRoaXMuI2xpc3RlbmVyc1tldmVudE5hbWVdIS5sZW5ndGggPj0gdGhpcy4jbGltaXRcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJMaXN0ZW5lcnMgbGltaXQgcmVhY2hlZDogbGltaXQgaXMgXCIgKyB0aGlzLiNsaW1pdCk7XG4gICAgfVxuICAgIGlmIChsaXN0ZW5lcikge1xuICAgICAgdGhpcy4jbGlzdGVuZXJzW2V2ZW50TmFtZV0hLnB1c2goe1xuICAgICAgICBvbmNlOiB0cnVlLFxuICAgICAgICBjYjogbGlzdGVuZXIsXG4gICAgICB9KTtcbiAgICAgIHJldHVybiB0aGlzO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlcykgPT4ge1xuICAgICAgICB0aGlzLiNsaXN0ZW5lcnNbZXZlbnROYW1lXSEucHVzaCh7XG4gICAgICAgICAgb25jZTogdHJ1ZSxcbiAgICAgICAgICBjYjogKC4uLmFyZ3MpID0+IHJlcyhhcmdzKSxcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVtb3ZlcyB0aGUgbGlzdGVuZXIgZnJvbSBldmVudE5hbWUuXG4gICAqIElmIG5vIGxpc3RlbmVyIGlzIHBhc3NlZCwgYWxsIGxpc3RlbmVycyB3aWxsIGJlIHJlbW92ZWQgZnJvbSBldmVudE5hbWUsXG4gICAqIHRoaXMgaW5jbHVkZXMgYXN5bmMgbGlzdGVuZXJzLlxuICAgKiBJZiBubyBldmVudE5hbWUgaXMgcGFzc2VkLCBhbGwgbGlzdGVuZXJzIHdpbGwgYmUgcmVtb3ZlZCBmcm9tIHRoZSBFdmVudEVtaXR0ZXIsXG4gICAqIGluY2x1ZGluZyB0aGUgYXN5bmMgaXRlcmF0b3IgZm9yIHRoZSBjbGFzc1xuICAgKi9cbiAgYXN5bmMgb2ZmPEsgZXh0ZW5kcyBrZXlvZiBFPihcbiAgICBldmVudE5hbWU/OiBLLFxuICAgIGxpc3RlbmVyPzogKC4uLmFyZ3M6IEVbS10pID0+IHZvaWQsXG4gICk6IFByb21pc2U8dGhpcz4ge1xuICAgIGlmIChldmVudE5hbWUpIHtcbiAgICAgIGlmIChsaXN0ZW5lcikge1xuICAgICAgICB0aGlzLiNsaXN0ZW5lcnNbZXZlbnROYW1lXSA9IHRoaXMuI2xpc3RlbmVyc1tldmVudE5hbWVdPy5maWx0ZXIoXG4gICAgICAgICAgKHsgY2IgfSkgPT4gY2IgIT09IGxpc3RlbmVyLFxuICAgICAgICApO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKHRoaXMuI29uV3JpdGVyc1tldmVudE5hbWVdKSB7XG4gICAgICAgICAgZm9yIChjb25zdCB3cml0ZXIgb2YgdGhpcy4jb25Xcml0ZXJzW2V2ZW50TmFtZV0hKSB7XG4gICAgICAgICAgICBhd2FpdCB3cml0ZXIuY2xvc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZGVsZXRlIHRoaXMuI29uV3JpdGVyc1tldmVudE5hbWVdO1xuICAgICAgICB9XG5cbiAgICAgICAgZGVsZXRlIHRoaXMuI2xpc3RlbmVyc1tldmVudE5hbWVdO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBmb3IgKFxuICAgICAgICBjb25zdCB3cml0ZXJzIG9mIE9iamVjdC52YWx1ZXMoXG4gICAgICAgICAgdGhpcy4jb25Xcml0ZXJzLFxuICAgICAgICApIGFzIFdyaXRhYmxlU3RyZWFtRGVmYXVsdFdyaXRlcjxFW0tdPltdW11cbiAgICAgICkge1xuICAgICAgICBmb3IgKGNvbnN0IHdyaXRlciBvZiB3cml0ZXJzKSB7XG4gICAgICAgICAgYXdhaXQgd3JpdGVyLmNsb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMuI29uV3JpdGVycyA9IHt9O1xuXG4gICAgICBmb3IgKGNvbnN0IHdyaXRlciBvZiB0aGlzLiNnbG9iYWxXcml0ZXJzKSB7XG4gICAgICAgIGF3YWl0IHdyaXRlci5jbG9zZSgpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLiNnbG9iYWxXcml0ZXJzID0gW107XG4gICAgICB0aGlzLiNsaXN0ZW5lcnMgPSB7fTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvKipcbiAgICogU3luY2hyb25vdXNseSBjYWxscyBlYWNoIG9mIHRoZSBsaXN0ZW5lcnMgcmVnaXN0ZXJlZCBmb3IgdGhlIGV2ZW50IG5hbWVkXG4gICAqIGV2ZW50TmFtZSwgaW4gdGhlIG9yZGVyIHRoZXkgd2VyZSByZWdpc3RlcmVkLCBwYXNzaW5nIHRoZSBzdXBwbGllZFxuICAgKiBhcmd1bWVudHMgdG8gZWFjaC5cbiAgICovXG4gIGFzeW5jIGVtaXQ8SyBleHRlbmRzIGtleW9mIEU+KGV2ZW50TmFtZTogSywgLi4uYXJnczogRVtLXSk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGxpc3RlbmVycyA9IHRoaXMuI2xpc3RlbmVyc1tldmVudE5hbWVdPy5zbGljZSgpID8/IFtdO1xuICAgIGZvciAoY29uc3QgeyBjYiwgb25jZSB9IG9mIGxpc3RlbmVycykge1xuICAgICAgY2IoLi4uYXJncyk7XG5cbiAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgIHRoaXMub2ZmKGV2ZW50TmFtZSwgY2IpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLiNvbldyaXRlcnNbZXZlbnROYW1lXSkge1xuICAgICAgZm9yIChjb25zdCB3cml0ZXIgb2YgdGhpcy4jb25Xcml0ZXJzW2V2ZW50TmFtZV0hKSB7XG4gICAgICAgIGF3YWl0IHdyaXRlci53cml0ZShhcmdzKTtcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yIChjb25zdCB3cml0ZXIgb2YgdGhpcy4jZ2xvYmFsV3JpdGVycykge1xuICAgICAgYXdhaXQgd3JpdGVyLndyaXRlKHtcbiAgICAgICAgbmFtZTogZXZlbnROYW1lLFxuICAgICAgICB2YWx1ZTogYXJncyxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIFtTeW1ib2wuYXN5bmNJdGVyYXRvcl08SyBleHRlbmRzIGtleW9mIEU+KCk6IEFzeW5jSXRlcmFibGVJdGVyYXRvcjxcbiAgICB7IFtWIGluIEtdOiBFbnRyeTxFLCBWPiB9W0tdXG4gID4ge1xuICAgIGlmICh0aGlzLiNsaW1pdCAhPT0gMCAmJiB0aGlzLiNnbG9iYWxXcml0ZXJzLmxlbmd0aCA+PSB0aGlzLiNsaW1pdCkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkxpc3RlbmVycyBsaW1pdCByZWFjaGVkOiBsaW1pdCBpcyBcIiArIHRoaXMuI2xpbWl0KTtcbiAgICB9XG5cbiAgICBjb25zdCB7IHJlYWRhYmxlLCB3cml0YWJsZSB9ID0gbmV3IFRyYW5zZm9ybVN0cmVhbTxcbiAgICAgIEVudHJ5PEUsIEs+LFxuICAgICAgRW50cnk8RSwgSz5cbiAgICA+KCk7XG4gICAgdGhpcy4jZ2xvYmFsV3JpdGVycy5wdXNoKHdyaXRhYmxlLmdldFdyaXRlcigpKTtcbiAgICByZXR1cm4gcmVhZGFibGVbU3ltYm9sLmFzeW5jSXRlcmF0b3JdKCk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrRUFBK0U7QUFPL0UsT0FBTyxNQUFNO0lBQ1gsQ0FBQyxTQUFTLEdBS04sQ0FBQyxFQUFFO0lBQ1AsQ0FBQyxhQUFhLEdBQXFELEVBQUUsQ0FBQztJQUN0RSxDQUFDLFNBQVMsR0FFTixDQUFDLEVBQUU7SUFDUCxDQUFD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