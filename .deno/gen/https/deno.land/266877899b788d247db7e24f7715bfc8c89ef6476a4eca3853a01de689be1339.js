import { Collection } from '../utils/collection.ts';
import { Command } from './command.ts';
/** Extension Commands Manager */ export class ExtensionCommands {
    extension;
    constructor(ext){
        this.extension = ext;
    }
    /** Gets a list of Extension's Commands */ get list() {
        return this.extension.client.commands.list.filter((c)=>c.extension?.name === this.extension.name);
    }
    /** Gets an Extension Command */ get(cmd) {
        const find = this.extension.client.commands.find(cmd);
        // linter sucks
        if (find === undefined) return undefined;
        else if (find.extension === undefined) return undefined;
        else if (find.extension.name !== this.extension.name) return undefined;
        else return find;
    }
    /** Adds an Extension Command */ add(Cmd) {
        const cmd = Cmd instanceof Command ? Cmd : new Cmd();
        cmd.extension = this.extension;
        return this.extension.client.commands.add(cmd);
    }
    /** Deletes an Extension Command */ delete(cmd) {
        const find = this.extension.client.commands.find(typeof cmd === 'string' ? cmd : cmd.name);
        if (find === undefined) return false;
        if (find.extension !== undefined && find.extension.name !== this.extension.name) return false;
        else return this.extension.client.commands.delete(find);
    }
    /** Deletes all Commands of an Extension */ deleteAll() {
        for (const [cmd] of this.list){
            this.delete(cmd);
        }
    }
}
/** Customizable, isolated and pluggable Extensions are a great way of writing certain Modules independent of others */ export class Extension {
    client;
    /** Name of the Extension */ name = '';
    /** Description of the Extension */ description;
    /** Extensions's Commands Manager */ commands = new ExtensionCommands(this);
    /** Sub-Prefix to be used for ALL of Extension's Commands. */ subPrefix;
    /** Events registered by this Extension */ events = {};
    constructor(client){
        this.client = client;
        const self = this;
        if (self._decoratedCommands !== undefined) {
            Object.entries(self._decoratedCommands).forEach((entry)=>{
                entry[1].extension = this;
                this.commands.add(entry[1]);
            });
            self._decoratedCommands = undefined;
        }
        if (self._decoratedEvents !== undefined && Object.keys(self._decoratedEvents).length !== 0) {
            Object.entries(self._decoratedEvents).forEach((entry)=>{
                this.listen(entry[0], entry[1].bind(this));
            });
            self._decoratedEvents = undefined;
        }
    }
    /** Listens for an Event through Extension. */ listen(event, cb) {
        if (this.events[event] !== undefined) return false;
        else {
            const fn = (...args)=>{
                // eslint-disable-next-line n/no-callback-literal
                cb(this, ...args);
            };
            this.client.on(event, fn);
            this.events[event] = fn;
            return true;
        }
    }
    /** Method called upon loading of an Extension */ load() {
        // eslint-disable-next-line no-useless-return
        return;
    }
    /** Method called upon unloading of an Extension */ unload() {
        // eslint-disable-next-line no-useless-return
        return;
    }
}
/** Extensions Manager for CommandClient */ export class ExtensionsManager {
    client;
    list = new Collection();
    constructor(client){
        this.client = client;
    }
    /** Gets an Extension by name */ get(ext) {
        return this.list.get(ext);
    }
    /** Checks whether an Extension exists or not */ exists(ext) {
        return this.get(ext) !== undefined;
    }
    /** Loads an Extension onto Command Client */ load(ext) {
        // eslint-disable-next-line new-cap
        if (!(ext instanceof Extension)) ext = new ext(this.client);
        if (this.exists(ext.name)) throw new Error(`Extension with name '${ext.name}' already exists`);
        this.list.set(ext.name, ext);
        ext.load();
    }
    /** Unloads an Extension from Command Client */ unload(ext) {
        const name = typeof ext === 'string' ? ext : ext.name;
        const extension = this.get(name);
        if (extension === undefined) return false;
        extension.commands.deleteAll();
        for (const [k, v] of Object.entries(extension.events)){
            this.client.off(k, v);
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete extension.events[k];
        }
        extension.unload();
        return this.list.delete(name);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2NvbW1hbmRzL2V4dGVuc2lvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb2xsZWN0aW9uIH0gZnJvbSAnLi4vdXRpbHMvY29sbGVjdGlvbi50cydcbmltcG9ydCB7IENvbW1hbmQgfSBmcm9tICcuL2NvbW1hbmQudHMnXG5pbXBvcnQgeyBDb21tYW5kQ2xpZW50IH0gZnJvbSAnLi9jbGllbnQudHMnXG5pbXBvcnQgdHlwZSB7IENsaWVudEV2ZW50cyB9IGZyb20gJy4uL2dhdGV3YXkvaGFuZGxlcnMvbW9kLnRzJ1xuXG4vLyBCcmVha2luZyBjaGFuZ2UgaWYgd2UgY2hhbmdlIHRvIHVua25vd25cbmV4cG9ydCB0eXBlIEV4dGVuc2lvbkV2ZW50Q2FsbGJhY2sgPSAoZXh0OiBFeHRlbnNpb24sIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnlcblxuLyoqIEV4dGVuc2lvbiBDb21tYW5kcyBNYW5hZ2VyICovXG5leHBvcnQgY2xhc3MgRXh0ZW5zaW9uQ29tbWFuZHMge1xuICBleHRlbnNpb246IEV4dGVuc2lvblxuXG4gIGNvbnN0cnVjdG9yKGV4dDogRXh0ZW5zaW9uKSB7XG4gICAgdGhpcy5leHRlbnNpb24gPSBleHRcbiAgfVxuXG4gIC8qKiBHZXRzIGEgbGlzdCBvZiBFeHRlbnNpb24ncyBDb21tYW5kcyAqL1xuICBnZXQgbGlzdCgpOiBDb2xsZWN0aW9uPHN0cmluZywgQ29tbWFuZD4ge1xuICAgIHJldHVybiB0aGlzLmV4dGVuc2lvbi5jbGllbnQuY29tbWFuZHMubGlzdC5maWx0ZXIoXG4gICAgICAoYykgPT4gYy5leHRlbnNpb24/Lm5hbWUgPT09IHRoaXMuZXh0ZW5zaW9uLm5hbWVcbiAgICApXG4gIH1cblxuICAvKiogR2V0cyBhbiBFeHRlbnNpb24gQ29tbWFuZCAqL1xuICBnZXQoY21kOiBzdHJpbmcpOiBDb21tYW5kIHwgdW5kZWZpbmVkIHtcbiAgICBjb25zdCBmaW5kID0gdGhpcy5leHRlbnNpb24uY2xpZW50LmNvbW1hbmRzLmZpbmQoY21kKVxuICAgIC8vIGxpbnRlciBzdWNrc1xuICAgIGlmIChmaW5kID09PSB1bmRlZmluZWQpIHJldHVybiB1bmRlZmluZWRcbiAgICBlbHNlIGlmIChmaW5kLmV4dGVuc2lvbiA9PT0gdW5kZWZpbmVkKSByZXR1cm4gdW5kZWZpbmVkXG4gICAgZWxzZSBpZiAoZmluZC5leHRlbnNpb24ubmFtZSAhPT0gdGhpcy5leHRlbnNpb24ubmFtZSkgcmV0dXJuIHVuZGVmaW5lZFxuICAgIGVsc2UgcmV0dXJuIGZpbmRcbiAgfVxuXG4gIC8qKiBBZGRzIGFuIEV4dGVuc2lvbiBDb21tYW5kICovXG4gIGFkZChDbWQ6IENvbW1hbmQgfCB0eXBlb2YgQ29tbWFuZCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGNtZCA9IENtZCBpbnN0YW5jZW9mIENvbW1hbmQgPyBDbWQgOiBuZXcgQ21kKClcbiAgICBjbWQuZXh0ZW5zaW9uID0gdGhpcy5leHRlbnNpb25cbiAgICByZXR1cm4gdGhpcy5leHRlbnNpb24uY2xpZW50LmNvbW1hbmRzLmFkZChjbWQpXG4gIH1cblxuICAvKiogRGVsZXRlcyBhbiBFeHRlbnNpb24gQ29tbWFuZCAqL1xuICBkZWxldGUoY21kOiBDb21tYW5kIHwgc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZmluZCA9IHRoaXMuZXh0ZW5zaW9uLmNsaWVudC5jb21tYW5kcy5maW5kKFxuICAgICAgdHlwZW9mIGNtZCA9PT0gJ3N0cmluZycgPyBjbWQgOiBjbWQubmFtZVxuICAgIClcbiAgICBpZiAoZmluZCA9PT0gdW5kZWZpbmVkKSByZXR1cm4gZmFsc2VcbiAgICBpZiAoXG4gICAgICBmaW5kLmV4dGVuc2lvbiAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBmaW5kLmV4dGVuc2lvbi5uYW1lICE9PSB0aGlzLmV4dGVuc2lvbi5uYW1lXG4gICAgKVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgZWxzZSByZXR1cm4gdGhpcy5leHRlbnNpb24uY2xpZW50LmNvbW1hbmRzLmRlbGV0ZShmaW5kKVxuICB9XG5cbiAgLyoqIERlbGV0ZXMgYWxsIENvbW1hbmRzIG9mIGFuIEV4dGVuc2lvbiAqL1xuICBkZWxldGVBbGwoKTogdm9pZCB7XG4gICAgZm9yIChjb25zdCBbY21kXSBvZiB0aGlzLmxpc3QpIHtcbiAgICAgIHRoaXMuZGVsZXRlKGNtZClcbiAgICB9XG4gIH1cbn1cblxuLyoqIEN1c3RvbWl6YWJsZSwgaXNvbGF0ZWQgYW5kIHBsdWdnYWJsZSBFeHRlbnNpb25zIGFyZSBhIGdyZWF0IHdheSBvZiB3cml0aW5nIGNlcnRhaW4gTW9kdWxlcyBpbmRlcGVuZGVudCBvZiBvdGhlcnMgKi9cbmV4cG9ydCBjbGFzcyBFeHRlbnNpb24ge1xuICBjbGllbnQ6IENvbW1hbmRDbGllbnRcbiAgLyoqIE5hbWUgb2YgdGhlIEV4dGVuc2lvbiAqL1xuICBuYW1lOiBzdHJpbmcgPSAnJ1xuICAvKiogRGVzY3JpcHRpb24gb2YgdGhlIEV4dGVuc2lvbiAqL1xuICBkZXNjcmlwdGlvbj86IHN0cmluZ1xuICAvKiogRXh0ZW5zaW9ucydzIENvbW1hbmRzIE1hbmFnZXIgKi9cbiAgY29tbWFuZHM6IEV4dGVuc2lvbkNvbW1hbmRzID0gbmV3IEV4dGVuc2lvbkNvbW1hbmRzKHRoaXMpXG4gIC8qKiBTdWItUHJlZml4IHRvIGJlIHVzZWQgZm9yIEFMTCBvZiBFeHRlbnNpb24ncyBDb21tYW5kcy4gKi9cbiAgc3ViUHJlZml4Pzogc3RyaW5nXG4gIC8qKiBFdmVudHMgcmVnaXN0ZXJlZCBieSB0aGlzIEV4dGVuc2lvbiAqL1xuICBldmVudHM6IHsgW25hbWU6IHN0cmluZ106ICguLi5hcmdzOiB1bmtub3duW10pID0+IHVua25vd24gfSA9IHt9XG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDb21tYW5kQ2xpZW50KSB7XG4gICAgdGhpcy5jbGllbnQgPSBjbGllbnRcbiAgICBjb25zdCBzZWxmID0gdGhpcyBhcyBhbnlcbiAgICBpZiAoc2VsZi5fZGVjb3JhdGVkQ29tbWFuZHMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgT2JqZWN0LmVudHJpZXMoc2VsZi5fZGVjb3JhdGVkQ29tbWFuZHMpLmZvckVhY2goKGVudHJ5OiBhbnkpID0+IHtcbiAgICAgICAgZW50cnlbMV0uZXh0ZW5zaW9uID0gdGhpc1xuICAgICAgICB0aGlzLmNvbW1hbmRzLmFkZChlbnRyeVsxXSlcbiAgICAgIH0pXG4gICAgICBzZWxmLl9kZWNvcmF0ZWRDb21tYW5kcyA9IHVuZGVmaW5lZFxuICAgIH1cblxuICAgIGlmIChcbiAgICAgIHNlbGYuX2RlY29yYXRlZEV2ZW50cyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBPYmplY3Qua2V5cyhzZWxmLl9kZWNvcmF0ZWRFdmVudHMpLmxlbmd0aCAhPT0gMFxuICAgICkge1xuICAgICAgT2JqZWN0LmVudHJpZXMoc2VsZi5fZGVjb3JhdGVkRXZlbnRzKS5mb3JFYWNoKChlbnRyeTogYW55KSA9PiB7XG4gICAgICAgIHRoaXMubGlzdGVuKGVudHJ5WzBdIGFzIGtleW9mIENsaWVudEV2ZW50cywgZW50cnlbMV0uYmluZCh0aGlzKSlcbiAgICAgIH0pXG4gICAgICBzZWxmLl9kZWNvcmF0ZWRFdmVudHMgPSB1bmRlZmluZWRcbiAgICB9XG4gIH1cblxuICAvKiogTGlzdGVucyBmb3IgYW4gRXZlbnQgdGhyb3VnaCBFeHRlbnNpb24uICovXG4gIGxpc3RlbihldmVudDoga2V5b2YgQ2xpZW50RXZlbnRzLCBjYjogRXh0ZW5zaW9uRXZlbnRDYWxsYmFjayk6IGJvb2xlYW4ge1xuICAgIGlmICh0aGlzLmV2ZW50c1tldmVudF0gIT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlXG4gICAgZWxzZSB7XG4gICAgICBjb25zdCBmbiA9ICguLi5hcmdzOiBhbnlbXSk6IHZvaWQgPT4ge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbi9uby1jYWxsYmFjay1saXRlcmFsXG4gICAgICAgIGNiKHRoaXMsIC4uLmFyZ3MpXG4gICAgICB9XG4gICAgICB0aGlzLmNsaWVudC5vbihldmVudCwgZm4pXG4gICAgICB0aGlzLmV2ZW50c1tldmVudF0gPSBmblxuICAgICAgcmV0dXJuIHRydWVcbiAgICB9XG4gIH1cblxuICAvKiogTWV0aG9kIGNhbGxlZCB1cG9uIGxvYWRpbmcgb2YgYW4gRXh0ZW5zaW9uICovXG4gIGxvYWQoKTogdW5rbm93biB8IFByb21pc2U8dW5rbm93bj4ge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby11c2VsZXNzLXJldHVyblxuICAgIHJldHVyblxuICB9XG5cbiAgLyoqIE1ldGhvZCBjYWxsZWQgdXBvbiB1bmxvYWRpbmcgb2YgYW4gRXh0ZW5zaW9uICovXG4gIHVubG9hZCgpOiB1bmtub3duIHwgUHJvbWlzZTx1bmtub3duPiB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXVzZWxlc3MtcmV0dXJuXG4gICAgcmV0dXJuXG4gIH1cbn1cblxuLyoqIEV4dGVuc2lvbnMgTWFuYWdlciBmb3IgQ29tbWFuZENsaWVudCAqL1xuZXhwb3J0IGNsYXNzIEV4dGVuc2lvbnNNYW5hZ2VyIHtcbiAgY2xpZW50OiBDb21tYW5kQ2xpZW50XG4gIGxpc3Q6IENvbGxlY3Rpb248c3RyaW5nLCBFeHRlbnNpb24+ID0gbmV3IENvbGxlY3Rpb24oKVxuXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ29tbWFuZENsaWVudCkge1xuICAgIHRoaXMuY2xpZW50ID0gY2xpZW50XG4gIH1cblxuICAvKiogR2V0cyBhbiBFeHRlbnNpb24gYnkgbmFtZSAqL1xuICBnZXQoZXh0OiBzdHJpbmcpOiBFeHRlbnNpb24gfCB1bmRlZmluZWQge1xuICAgIHJldHVybiB0aGlzLmxpc3QuZ2V0KGV4dClcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciBhbiBFeHRlbnNpb24gZXhpc3RzIG9yIG5vdCAqL1xuICBleGlzdHMoZXh0OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5nZXQoZXh0KSAhPT0gdW5kZWZpbmVkXG4gIH1cblxuICAvKiogTG9hZHMgYW4gRXh0ZW5zaW9uIG9udG8gQ29tbWFuZCBDbGllbnQgKi9cbiAgbG9hZChleHQ6IEV4dGVuc2lvbiB8IHR5cGVvZiBFeHRlbnNpb24pOiB2b2lkIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbmV3LWNhcFxuICAgIGlmICghKGV4dCBpbnN0YW5jZW9mIEV4dGVuc2lvbikpIGV4dCA9IG5ldyBleHQodGhpcy5jbGllbnQpXG4gICAgaWYgKHRoaXMuZXhpc3RzKGV4dC5uYW1lKSlcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXh0ZW5zaW9uIHdpdGggbmFtZSAnJHtleHQubmFtZX0nIGFscmVhZHkgZXhpc3RzYClcbiAgICB0aGlzLmxpc3Quc2V0KGV4dC5uYW1lLCBleHQpXG4gICAgZXh0LmxvYWQoKVxuICB9XG5cbiAgLyoqIFVubG9hZHMgYW4gRXh0ZW5zaW9uIGZyb20gQ29tbWFuZCBDbGllbnQgKi9cbiAgdW5sb2FkKGV4dDogRXh0ZW5zaW9uIHwgc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbmFtZSA9IHR5cGVvZiBleHQgPT09ICdzdHJpbmcnID8gZXh0IDogZXh0Lm5hbWVcbiAgICBjb25zdCBleHRlbnNpb24gPSB0aGlzLmdldChuYW1lKVxuICAgIGlmIChleHRlbnNpb24gPT09IHVuZGVmaW5lZCkgcmV0dXJuIGZhbHNlXG4gICAgZXh0ZW5zaW9uLmNvbW1hbmRzLmRlbGV0ZUFsbCgpXG4gICAgZm9yIChjb25zdCBbaywgdl0gb2YgT2JqZWN0LmVudHJpZXMoZXh0ZW5zaW9uLmV2ZW50cykpIHtcbiAgICAgIHRoaXMuY2xpZW50Lm9mZihrIGFzIGtleW9mIENsaWVudEV2ZW50cywgdilcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZHluYW1pYy1kZWxldGVcbiAgICAgIGRlbGV0ZSBleHRlbnNpb24uZXZlbnRzW2tdXG4gICAgfVxuICAgIGV4dGVuc2lvbi51bmxvYWQoKVxuICAgIHJldHVybiB0aGlzLmxpc3QuZGVsZXRlKG5hbWUpXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFVBQVUsUUFBUSx5QkFBd0I7QUFDbkQsU0FBUyxPQUFPLFFBQVEsZUFBYztBQU90QywrQkFBK0IsR0FDL0IsT0FBTyxNQUFNO0lBQ1gsVUFBb0I7SUFFcEIsWUFBWSxHQUFjLENBQUU7UUFDMUIsSUFBSSxDQUFDLFNBQVMsR0FBRztJQUNuQjtJQUVBLHdDQUF3QyxHQUN4QyxJQUFJLE9BQW9DO1FBQ3RDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQy9DLENBQUMsSUFBTSxFQUFFLFNBQVMsRUFBRSxTQUFTLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSTtJQUVwRDtJQUVBLDhCQUE4QixHQUM5QixJQUFJLEdBQVcsRUFBdUI7UUFDcEMsTUFBTSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7UUFDakQsZUFBZTtRQUNmLElBQUksU0FBUyxXQUFXLE9BQU87YUFDMUIsSUFBSSxLQUFLLFNBQVMsS0FBSyxXQUFXLE9BQU87YUFDekMsSUFBSSxLQUFLLFNBQVMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsT0FBTzthQUN4RCxPQUFPO0lBQ2Q7SUFFQSw4QkFBOEIsR0FDOUIsSUFBSSxHQUE2QixFQUFXO1FBQzFDLE1BQU0sTUFBTSxlQUFlLFVBQVUsTUFBTSxJQUFJLEtBQUs7UUFDcEQsSUFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVM7UUFDOUIsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDO0lBQzVDO0lBRUEsaUNBQWlDLEdBQ2pDLE9BQU8sR0FBcUIsRUFBVztRQUNyQyxNQUFNLE9BQU8sSUFBSSxDQUFD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