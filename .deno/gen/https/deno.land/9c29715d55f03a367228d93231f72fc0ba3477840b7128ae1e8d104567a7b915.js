export class APIRequest {
    retries;
    route;
    constructor(rest, method, path, options){
        this.rest = rest;
        this.method = method;
        this.path = path;
        this.options = options;
        this.retries = 0;
        this.route = options.route ?? path;
        if ((method === 'get' || method === 'delete' || method === 'head') && typeof options.data === 'object') {
            if (options.query !== undefined) {
                Object.assign(options.query, options.data);
            } else options.query = options.data;
            options.data = undefined;
        }
        if (typeof options.query === 'object') {
            const entries = Object.entries(options.query).filter((e)=>e[1] !== undefined && e[1] !== null);
            if (entries.length > 0) {
                this.path += '?';
                entries.forEach((entry, i)=>{
                    this.path += `${i === 0 ? '' : '&'}${encodeURIComponent(entry[0])}=${encodeURIComponent(entry[1])}`;
                });
            }
        }
        let _files;
        if (options.data?.embed?.files !== undefined && Array.isArray(options.data?.embed?.files)) {
            _files = [
                ...options.data?.embed?.files
            ];
        }
        if (options.data?.embeds !== undefined && Array.isArray(options.data?.embeds)) {
            const files1 = options.data?.embeds.map((e)=>e.files).filter((e)=>e !== undefined);
            for (const files of files1){
                for (const file of files){
                    if (_files === undefined) _files = [];
                    _files?.push(file);
                }
            }
        }
        if (options.data?.file !== undefined) {
            if (_files === undefined) _files = [];
            _files.push(options.data?.file);
        }
        if (options.data?.files !== undefined && Array.isArray(options.data?.files)) {
            if (_files === undefined) _files = [];
            options.data?.files.forEach((file)=>{
                _files.push(file);
            });
        }
        // Interaction response
        if (options.data?.data?.files !== undefined && Array.isArray(options.data?.data?.files)) {
            if (_files === undefined) _files = [];
            options.data?.data?.files.forEach((file)=>{
                _files.push(file);
            });
        }
        if (options.data?.data?.embeds !== undefined && Array.isArray(options.data?.data?.embeds)) {
            const files11 = options.data?.data?.embeds.map((e)=>e.files).filter((e)=>e !== undefined);
            for (const files2 of files11){
                for (const file1 of files2){
                    if (_files === undefined) _files = [];
                    _files?.push(file1);
                }
            }
        }
        if (_files !== undefined && _files.length > 0) {
            if (options.files === undefined) options.files = _files;
            else options.files = [
                ...options.files,
                ..._files
            ];
        }
    }
    async execute() {
        let contentType;
        let body;
        if (this.method === 'post' || this.method === 'put' || this.method === 'patch') {
            // Use empty JSON object as body by default
            // this should not be required, but seems like CloudFlare is not
            // letting these requests without a body through.
            body = this.options.data ?? {};
            if (this.options.files !== undefined && this.options.files.length > 0) {
                contentType = undefined;
                const form = new FormData();
                this.options.files.forEach((file, i)=>form.append(`files[${i}]`, file.blob, file.name));
                if (typeof body === 'object' && body !== null) {
                    // Differentiate between interaction response
                    // and other endpoints.
                    const target = 'data' in body && 'type' in body ? body.data : body;
                    target.attachments = this.options.files.map((e, i)=>({
                            id: i,
                            filename: e.name,
                            description: e.description
                        }));
                }
                form.append('payload_json', JSON.stringify(body));
                body = form;
            } else if (body instanceof FormData) {
                contentType = 'multipart/form-data';
            } else {
                contentType = 'application/json';
                body = JSON.stringify(body);
            }
        }
        const controller = new AbortController();
        const timer = setTimeout(()=>{
            controller.abort();
        }, this.rest.requestTimeout);
        this.rest.timers.add(timer);
        const url = this.path.startsWith('http') ? this.path : `${this.rest.apiURL}/v${this.rest.version}${this.path}`;
        const headers = {
            'User-Agent': this.rest.userAgent ?? `DiscordBot (harmony, https://github.com/harmonyland/harmony)`,
            Authorization: this.rest.token === undefined ? undefined : `${this.rest.tokenType} ${typeof this.rest.token === 'string' ? this.rest.token : this.rest.token()}`.trim()
        };
        if (contentType !== undefined) headers['Content-Type'] = contentType;
        const init = {
            method: this.method.toUpperCase(),
            signal: controller.signal,
            headers: Object.assign(headers, this.rest.headers, this.options.headers),
            body
        };
        if (this.options.reason !== undefined) {
            init.headers['X-Audit-Log-Reason'] = encodeURIComponent(this.options.reason);
        }
        return fetch(url, init).finally(()=>{
            clearTimeout(timer);
            this.rest.timers.delete(timer);
        });
    }
    rest;
    method;
    path;
    options;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3Jlc3QvcmVxdWVzdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEVtYmVkIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9lbWJlZC50cydcbmltcG9ydCB0eXBlIHsgTWVzc2FnZUF0dGFjaG1lbnQgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL21lc3NhZ2UudHMnXG5pbXBvcnQgdHlwZSB7IFJFU1RNYW5hZ2VyIH0gZnJvbSAnLi9tYW5hZ2VyLnRzJ1xuaW1wb3J0IHR5cGUgeyBSZXF1ZXN0TWV0aG9kcyB9IGZyb20gJy4vdHlwZXMudHMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdE9wdGlvbnMge1xuICBoZWFkZXJzPzogeyBbbmFtZTogc3RyaW5nXTogc3RyaW5nIH1cbiAgcXVlcnk/OiB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfVxuICBmaWxlcz86IE1lc3NhZ2VBdHRhY2htZW50W11cbiAgLy8gVW50eXBlZCBKU09OXG4gIGRhdGE/OiBhbnlcbiAgcmVhc29uPzogc3RyaW5nXG4gIHJhd1Jlc3BvbnNlPzogYm9vbGVhblxuICByb3V0ZT86IHN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgQVBJUmVxdWVzdCB7XG4gIHJldHJpZXMgPSAwXG4gIHJvdXRlOiBzdHJpbmdcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgcmVzdDogUkVTVE1hbmFnZXIsXG4gICAgcHVibGljIG1ldGhvZDogUmVxdWVzdE1ldGhvZHMsXG4gICAgcHVibGljIHBhdGg6IHN0cmluZyxcbiAgICBwdWJsaWMgb3B0aW9uczogUmVxdWVzdE9wdGlvbnNcbiAgKSB7XG4gICAgdGhpcy5yb3V0ZSA9IG9wdGlvbnMucm91dGUgPz8gcGF0aFxuICAgIGlmIChcbiAgICAgIChtZXRob2QgPT09ICdnZXQnIHx8IG1ldGhvZCA9PT0gJ2RlbGV0ZScgfHwgbWV0aG9kID09PSAnaGVhZCcpICYmXG4gICAgICB0eXBlb2Ygb3B0aW9ucy5kYXRhID09PSAnb2JqZWN0J1xuICAgICkge1xuICAgICAgaWYgKG9wdGlvbnMucXVlcnkgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBPYmplY3QuYXNzaWduKG9wdGlvbnMucXVlcnksIG9wdGlvbnMuZGF0YSlcbiAgICAgIH0gZWxzZSBvcHRpb25zLnF1ZXJ5ID0gb3B0aW9ucy5kYXRhXG4gICAgICBvcHRpb25zLmRhdGEgPSB1bmRlZmluZWRcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBvcHRpb25zLnF1ZXJ5ID09PSAnb2JqZWN0Jykge1xuICAgICAgY29uc3QgZW50cmllcyA9IE9iamVjdC5lbnRyaWVzKG9wdGlvbnMucXVlcnkpLmZpbHRlcihcbiAgICAgICAgKGUpID0+IGVbMV0gIT09IHVuZGVmaW5lZCAmJiBlWzFdICE9PSBudWxsXG4gICAgICApXG4gICAgICBpZiAoZW50cmllcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIHRoaXMucGF0aCArPSAnPydcbiAgICAgICAgZW50cmllcy5mb3JFYWNoKChlbnRyeSwgaSkgPT4ge1xuICAgICAgICAgIHRoaXMucGF0aCArPSBgJHtpID09PSAwID8gJycgOiAnJid9JHtlbmNvZGVVUklDb21wb25lbnQoXG4gICAgICAgICAgICBlbnRyeVswXVxuICAgICAgICAgICl9PSR7ZW5jb2RlVVJJQ29tcG9uZW50KGVudHJ5WzFdKX1gXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IF9maWxlczogdW5kZWZpbmVkIHwgTWVzc2FnZUF0dGFjaG1lbnRbXVxuICAgIGlmIChcbiAgICAgIG9wdGlvbnMuZGF0YT8uZW1iZWQ/LmZpbGVzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIEFycmF5LmlzQXJyYXkob3B0aW9ucy5kYXRhPy5lbWJlZD8uZmlsZXMpXG4gICAgKSB7XG4gICAgICBfZmlsZXMgPSBbLi4ub3B0aW9ucy5kYXRhPy5lbWJlZD8uZmlsZXNdXG4gICAgfVxuICAgIGlmIChcbiAgICAgIG9wdGlvbnMuZGF0YT8uZW1iZWRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIEFycmF5LmlzQXJyYXkob3B0aW9ucy5kYXRhPy5lbWJlZHMpXG4gICAgKSB7XG4gICAgICBjb25zdCBmaWxlczEgPSBvcHRpb25zLmRhdGE/LmVtYmVkc1xuICAgICAgICAubWFwKChlOiBFbWJlZCkgPT4gZS5maWxlcylcbiAgICAgICAgLmZpbHRlcigoZTogTWVzc2FnZUF0dGFjaG1lbnRbXSkgPT4gZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgZm9yIChjb25zdCBmaWxlcyBvZiBmaWxlczEpIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgaWYgKF9maWxlcyA9PT0gdW5kZWZpbmVkKSBfZmlsZXMgPSBbXVxuICAgICAgICAgIF9maWxlcz8ucHVzaChmaWxlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZGF0YT8uZmlsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoX2ZpbGVzID09PSB1bmRlZmluZWQpIF9maWxlcyA9IFtdXG4gICAgICBfZmlsZXMucHVzaChvcHRpb25zLmRhdGE/LmZpbGUpXG4gICAgfVxuXG4gICAgaWYgKFxuICAgICAgb3B0aW9ucy5kYXRhPy5maWxlcyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICBBcnJheS5pc0FycmF5KG9wdGlvbnMuZGF0YT8uZmlsZXMpXG4gICAgKSB7XG4gICAgICBpZiAoX2ZpbGVzID09PSB1bmRlZmluZWQpIF9maWxlcyA9IFtdXG4gICAgICBvcHRpb25zLmRhdGE/LmZpbGVzLmZvckVhY2goKGZpbGU6IE1lc3NhZ2VBdHRhY2htZW50KSA9PiB7XG4gICAgICAgIF9maWxlcyEucHVzaChmaWxlKVxuICAgICAgfSlcbiAgICB9XG5cbiAgICAvLyBJbnRlcmFjdGlvbiByZXNwb25zZVxuICAgIGlmIChcbiAgICAgIG9wdGlvbnMuZGF0YT8uZGF0YT8uZmlsZXMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgQXJyYXkuaXNBcnJheShvcHRpb25zLmRhdGE/LmRhdGE/LmZpbGVzKVxuICAgICkge1xuICAgICAgaWYgKF9maWxlcyA9PT0gdW5kZWZpbmVkKSBfZmlsZXMgPSBbXVxuICAgICAgb3B0aW9ucy5kYXRhPy5kYXRhPy5maWxlcy5mb3JFYWNoKChmaWxlOiBNZXNzYWdlQXR0YWNobWVudCkgPT4ge1xuICAgICAgICBfZmlsZXMhLnB1c2goZmlsZSlcbiAgICAgIH0pXG4gICAgfVxuICAgIGlmIChcbiAgICAgIG9wdGlvbnMuZGF0YT8uZGF0YT8uZW1iZWRzICE9PSB1bmRlZmluZWQgJiZcbiAgICAgIEFycmF5LmlzQXJyYXkob3B0aW9ucy5kYXRhPy5kYXRhPy5lbWJlZHMpXG4gICAgKSB7XG4gICAgICBjb25zdCBmaWxlczEgPSBvcHRpb25zLmRhdGE/LmRhdGE/LmVtYmVkc1xuICAgICAgICAubWFwKChlOiBFbWJlZCkgPT4gZS5maWxlcylcbiAgICAgICAgLmZpbHRlcigoZTogTWVzc2FnZUF0dGFjaG1lbnRbXSkgPT4gZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgZm9yIChjb25zdCBmaWxlcyBvZiBmaWxlczEpIHtcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XG4gICAgICAgICAgaWYgKF9maWxlcyA9PT0gdW5kZWZpbmVkKSBfZmlsZXMgPSBbXVxuICAgICAgICAgIF9maWxlcz8ucHVzaChmaWxlKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKF9maWxlcyAhPT0gdW5kZWZpbmVkICYmIF9maWxlcy5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAob3B0aW9ucy5maWxlcyA9PT0gdW5kZWZpbmVkKSBvcHRpb25zLmZpbGVzID0gX2ZpbGVzXG4gICAgICBlbHNlIG9wdGlvbnMuZmlsZXMgPSBbLi4ub3B0aW9ucy5maWxlcywgLi4uX2ZpbGVzXVxuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGV4ZWN1dGUoKTogUHJvbWlzZTxSZXNwb25zZT4ge1xuICAgIGxldCBjb250ZW50VHlwZTogc3RyaW5nIHwgdW5kZWZpbmVkXG4gICAgbGV0IGJvZHk6IEJvZHlJbml0IHwgdW5kZWZpbmVkXG4gICAgaWYgKFxuICAgICAgdGhpcy5tZXRob2QgPT09ICdwb3N0JyB8fFxuICAgICAgdGhpcy5tZXRob2QgPT09ICdwdXQnIHx8XG4gICAgICB0aGlzLm1ldGhvZCA9PT0gJ3BhdGNoJ1xuICAgICkge1xuICAgICAgLy8gVXNlIGVtcHR5IEpTT04gb2JqZWN0IGFzIGJvZHkgYnkgZGVmYXVsdFxuICAgICAgLy8gdGhpcyBzaG91bGQgbm90IGJlIHJlcXVpcmVkLCBidXQgc2VlbXMgbGlrZSBDbG91ZEZsYXJlIGlzIG5vdFxuICAgICAgLy8gbGV0dGluZyB0aGVzZSByZXF1ZXN0cyB3aXRob3V0IGEgYm9keSB0aHJvdWdoLlxuICAgICAgYm9keSA9IHRoaXMub3B0aW9ucy5kYXRhID8/IHt9XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmZpbGVzICE9PSB1bmRlZmluZWQgJiYgdGhpcy5vcHRpb25zLmZpbGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29udGVudFR5cGUgPSB1bmRlZmluZWRcbiAgICAgICAgY29uc3QgZm9ybSA9IG5ldyBGb3JtRGF0YSgpXG4gICAgICAgIHRoaXMub3B0aW9ucy5maWxlcy5mb3JFYWNoKChmaWxlLCBpKSA9PlxuICAgICAgICAgIGZvcm0uYXBwZW5kKGBmaWxlc1ske2l9XWAsIGZpbGUuYmxvYiwgZmlsZS5uYW1lKVxuICAgICAgICApXG4gICAgICAgIGlmICh0eXBlb2YgYm9keSA9PT0gJ29iamVjdCcgJiYgYm9keSAhPT0gbnVsbCkge1xuICAgICAgICAgIC8vIERpZmZlcmVudGlhdGUgYmV0d2VlbiBpbnRlcmFjdGlvbiByZXNwb25zZVxuICAgICAgICAgIC8vIGFuZCBvdGhlciBlbmRwb2ludHMuXG4gICAgICAgICAgY29uc3QgdGFyZ2V0ID1cbiAgICAgICAgICAgICdkYXRhJyBpbiBib2R5ICYmICd0eXBlJyBpbiBib2R5XG4gICAgICAgICAgICAgID8gKGJvZHkgYXMgdW5rbm93biBhcyB7IGRhdGE6IFJlY29yZDxzdHJpbmcsIHVua25vd24+IH0pLmRhdGFcbiAgICAgICAgICAgICAgOiAoYm9keSBhcyB1bmtub3duIGFzIFJlY29yZDxzdHJpbmcsIHVua25vd24+KVxuICAgICAgICAgIHRhcmdldC5hdHRhY2htZW50cyA9IHRoaXMub3B0aW9ucy5maWxlcy5tYXAoKGUsIGkpID0+ICh7XG4gICAgICAgICAgICBpZDogaSxcbiAgICAgICAgICAgIGZpbGVuYW1lOiBlLm5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogZS5kZXNjcmlwdGlvblxuICAgICAgICAgIH0pKVxuICAgICAgICB9XG4gICAgICAgIGZvcm0uYXBwZW5kKCdwYXlsb2FkX2pzb24nLCBKU09OLnN0cmluZ2lmeShib2R5KSlcbiAgICAgICAgYm9keSA9IGZvcm1cbiAgICAgIH0gZWxzZSBpZiAoYm9keSBpbnN0YW5jZW9mIEZvcm1EYXRhKSB7XG4gICAgICAgIGNvbnRlbnRUeXBlID0gJ211bHRpcGFydC9mb3JtLWRhdGEnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb250ZW50VHlwZSA9ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgICAgICBib2R5ID0gSlNPTi5zdHJpbmdpZnkoYm9keSlcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBjb250cm9sbGVyID0gbmV3IEFib3J0Q29udHJvbGxlcigpXG4gICAgY29uc3QgdGltZXIgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGNvbnRyb2xsZXIuYWJvcnQoKVxuICAgIH0sIHRoaXMucmVzdC5yZXF1ZXN0VGltZW91dClcbiAgICB0aGlzLnJlc3QudGltZXJzLmFkZCh0aW1lcilcblxuICAgIGNvbnN0IHVybCA9IHRoaXMucGF0aC5zdGFydHNXaXRoKCdodHRwJylcbiAgICAgID8gdGhpcy5wYXRoXG4gICAgICA6IGAke3RoaXMucmVzdC5hcGlVUkx9L3Yke3RoaXMucmVzdC52ZXJzaW9ufSR7dGhpcy5wYXRofWBcblxuICAgIGNvbnN0IGhlYWRlcnM6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IHVuZGVmaW5lZD4gPSB7XG4gICAgICAnVXNlci1BZ2VudCc6XG4gICAgICAgIHRoaXMucmVzdC51c2VyQWdlbnQgPz9cbiAgICAgICAgYERpc2NvcmRCb3QgKGhhcm1vbnksIGh0dHBzOi8vZ2l0aHViLmNvbS9oYXJtb255bGFuZC9oYXJtb255KWAsXG4gICAgICBBdXRob3JpemF0aW9uOlxuICAgICAgICB0aGlzLnJlc3QudG9rZW4gPT09IHVuZGVmaW5lZFxuICAgICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgICAgOiBgJHt0aGlzLnJlc3QudG9rZW5UeXBlfSAke1xuICAgICAgICAgICAgICB0eXBlb2YgdGhpcy5yZXN0LnRva2VuID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgICAgID8gdGhpcy5yZXN0LnRva2VuXG4gICAgICAgICAgICAgICAgOiB0aGlzLnJlc3QudG9rZW4oKVxuICAgICAgICAgICAgfWAudHJpbSgpXG4gICAgfVxuXG4gICAgaWYgKGNvbnRlbnRUeXBlICE9PSB1bmRlZmluZWQpIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gY29udGVudFR5cGVcblxuICAgIGNvbnN0IGluaXQ6IFJlcXVlc3RJbml0ID0ge1xuICAgICAgbWV0aG9kOiB0aGlzLm1ldGhvZC50b1VwcGVyQ2FzZSgpLFxuICAgICAgc2lnbmFsOiBjb250cm9sbGVyLnNpZ25hbCxcbiAgICAgIGhlYWRlcnM6IE9iamVjdC5hc3NpZ24oaGVhZGVycywgdGhpcy5yZXN0LmhlYWRlcnMsIHRoaXMub3B0aW9ucy5oZWFkZXJzKSxcbiAgICAgIGJvZHlcbiAgICB9XG5cbiAgICBpZiAodGhpcy5vcHRpb25zLnJlYXNvbiAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICA7KGluaXQuaGVhZGVycyBhcyB7IFtuYW1lOiBzdHJpbmddOiBzdHJpbmcgfSlbJ1gtQXVkaXQtTG9nLVJlYXNvbiddID1cbiAgICAgICAgZW5jb2RlVVJJQ29tcG9uZW50KHRoaXMub3B0aW9ucy5yZWFzb24pXG4gICAgfVxuXG4gICAgcmV0dXJuIGZldGNoKHVybCwgaW5pdCkuZmluYWxseSgoKSA9PiB7XG4gICAgICBjbGVhclRpbWVvdXQodGltZXIpXG4gICAgICB0aGlzLnJlc3QudGltZXJzLmRlbGV0ZSh0aW1lcilcbiAgICB9KVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBZ0JBLE9BQU8sTUFBTTtJQUNYLFFBQVc7SUFDWCxNQUFhO0lBRWIsWUFDUyxNQUNBLFFBQ0EsTUFDQSxRQUNQO29CQUpPO3NCQUNBO29CQUNBO3VCQUNBO2FBUFQsVUFBVTtRQVNSLElBQUksQ0FBQyxLQUFLLEdBQUcsUUFBUSxLQUFLLElBQUk7UUFDOUIsSUFDRSxDQUFDLFdBQVcsU0FBUyxXQUFXLFlBQVksV0FBVyxNQUFNLEtBQzdELE9BQU8sUUFBUSxJQUFJLEtBQUssVUFDeEI7WUFDQSxJQUFJLFFBQVEsS0FBSyxLQUFLLFdBQVc7Z0JBQy9CLE9BQU8sTUFBTSxDQUFDLFFBQVEsS0FBSyxFQUFFLFFBQVEsSUFBSTtZQUMzQyxPQUFPLFFBQVEsS0FBSyxHQUFHLFFBQVEsSUFBSTtZQUNuQyxRQUFRLElBQUksR0FBRztRQUNqQixDQUFDO1FBQ0QsSUFBSSxPQUFPLFFBQVEsS0FBSyxLQUFLLFVBQVU7WUFDckMsTUFBTSxVQUFVLE9BQU8sT0FBTyxDQUFDLFFBQVEsS0FBSyxFQUFFLE1BQU0sQ0FDbEQsQ0FBQyxJQUFNLENBQUMsQ0FBQyxFQUFFLEtBQUssYUFBYSxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUk7WUFFNUMsSUFBSSxRQUFRLE1BQU0sR0FBRyxHQUFHO2dCQUN0QixJQUFJLENBQUMsSUFBSSxJQUFJO2dCQUNiLFFBQVEsT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFNO29CQUM1QixJQUFJLENBQUMsSUFBSSxJQUFJLENBQUMsRUFBRSxNQUFNLElBQUksS0FBSyxHQUFHLENBQUMsRUFBRSxtQkFDbkMsS0FBSyxDQUFD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