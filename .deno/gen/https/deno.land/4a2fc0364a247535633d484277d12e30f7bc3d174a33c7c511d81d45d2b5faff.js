import { difference, removeEmptyValues } from "./util.ts";
const emptyParseResult = ()=>({
        env: {},
        exports: new Set()
    });
const EXPORT_REGEX = /^\s*export\s+/;
export function parse(rawDotenv) {
    const env = {};
    const exports = new Set();
    for (const line of rawDotenv.split("\n")){
        if (!isAssignmentLine(line)) continue;
        const lhs = line.slice(0, line.indexOf("=")).trim();
        const { key , exported  } = parseKey(lhs);
        if (exported) {
            exports.add(key);
        }
        let value = line.slice(line.indexOf("=") + 1).trim();
        if (hasSingleQuotes(value)) {
            value = value.slice(1, -1);
        } else if (hasDoubleQuotes(value)) {
            value = value.slice(1, -1);
            value = expandNewlines(value);
        } else value = value.trim();
        env[key] = value;
    }
    return {
        env,
        exports
    };
}
const defaultConfigOptions = {
    path: `.env`,
    export: false,
    safe: false,
    example: `.env.example`,
    allowEmptyValues: false,
    defaults: `.env.defaults`
};
export function config(options = {}) {
    const o = mergeDefaults(options);
    const conf = parseFile(o.path);
    const confDefaults = o.defaults ? parseFile(o.defaults) : emptyParseResult();
    const confExample = o.safe ? parseFile(o.example) : emptyParseResult();
    return processConfig(o, conf, confDefaults, confExample);
}
export async function configAsync(options = {}) {
    const o = mergeDefaults(options);
    const conf = await parseFileAsync(o.path);
    const confDefaults = o.defaults ? await parseFileAsync(o.defaults) : emptyParseResult();
    const confExample = o.safe ? await parseFileAsync(o.example) : emptyParseResult();
    return processConfig(o, conf, confDefaults, confExample);
}
// accepts the left-hand side of an assignment
function parseKey(lhs) {
    if (EXPORT_REGEX.test(lhs)) {
        const key = lhs.replace(EXPORT_REGEX, "");
        return {
            key,
            exported: true
        };
    }
    return {
        key: lhs,
        exported: false
    };
}
const mergeDefaults = (options)=>({
        ...defaultConfigOptions,
        ...options
    });
function processConfig(options, conf, confDefaults, confExample) {
    if (options.defaults) {
        for(const key in confDefaults.env){
            if (!(key in conf.env)) {
                conf.env[key] = confDefaults.env[key];
            }
        }
        conf.exports = new Set([
            ...conf.exports,
            ...confDefaults.exports
        ]);
    }
    if (options.safe) {
        assertSafe(conf, confExample, options.allowEmptyValues);
    }
    if (options.export) {
        for(const key1 in conf.env){
            denoSetEnv(key1, conf.env[key1]);
        }
    } else {
        for (const key2 of conf.exports){
            denoSetEnv(key2, conf.env[key2]);
        }
    }
    return conf.env;
}
const denoSetEnv = (key, value)=>Deno.env.get(key) === undefined ? Deno.env.set(key, value) : undefined;
function parseFile(filepath) {
    try {
        return parse(new TextDecoder("utf-8").decode(Deno.readFileSync(filepath)));
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) return emptyParseResult();
        throw e;
    }
}
async function parseFileAsync(filepath) {
    try {
        return parse(new TextDecoder("utf-8").decode(await Deno.readFile(filepath)));
    } catch (e) {
        if (e instanceof Deno.errors.NotFound) return emptyParseResult();
        throw e;
    }
}
function isAssignmentLine(str) {
    return /^\s*(?:export\s+)?[a-zA-Z_][a-zA-Z_0-9 ]*\s*=/.test(str);
}
function hasSingleQuotes(str) {
    return /^'([\s\S]*)'$/.test(str);
}
function hasDoubleQuotes(str) {
    return /^"([\s\S]*)"$/.test(str);
}
function expandNewlines(str) {
    return str.replaceAll("\\n", "\n");
}
function assertSafe(conf, confExample, allowEmptyValues) {
    const currentEnv = Deno.env.toObject();
    const currentExportsList = Object.keys(currentEnv);
    // Not all the variables have to be defined in .env, they can be supplied externally
    const confWithEnv = Object.assign({}, currentEnv, conf.env);
    const missingVars = difference(Object.keys(confExample.env), // If allowEmptyValues is false, filter out empty values from configuration
    Object.keys(allowEmptyValues ? confWithEnv : removeEmptyValues(confWithEnv)));
    if (missingVars.length > 0) {
        const errorMessages = [
            `The following variables were defined in the example file but are not present in the environment:\n  ${missingVars.join(", ")}`,
            `Make sure to add them to your env file.`,
            !allowEmptyValues && `If you expect any of these variables to be empty, you can set the allowEmptyValues option to true.`
        ];
        throw new MissingEnvVarsError(errorMessages.filter(Boolean).join("\n\n"));
    }
    const exportsWithEnv = new Set([
        ...currentExportsList,
        ...conf.exports
    ]);
    const missingExports = difference([
        ...confExample.exports
    ], [
        ...exportsWithEnv
    ]);
    if (missingExports.length > 0) {
        throw new MissingEnvVarExportsError(`The following variables were exported in the example file but are not exported in the environment:
${missingExports.join(", ")},
make sure to export them in your env file or in the environment of the parent process (e.g. shell).`);
    }
}
export class MissingEnvVarsError extends Error {
    constructor(message){
        super(message);
        this.name = "MissingEnvVarsError";
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export class MissingEnvVarExportsError extends Error {
    constructor(message){
        super(message);
        Object.setPrototypeOf(this, MissingEnvVarExportsError.prototype);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZG90ZW52QHYzLjIuMi9tb2QudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGlmZmVyZW5jZSwgcmVtb3ZlRW1wdHlWYWx1ZXMgfSBmcm9tIFwiLi91dGlsLnRzXCI7XG5cbmV4cG9ydCBpbnRlcmZhY2UgRG90ZW52Q29uZmlnIHtcbiAgW2tleTogc3RyaW5nXTogc3RyaW5nO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbmZpZ09wdGlvbnMge1xuICBwYXRoPzogc3RyaW5nO1xuICBleHBvcnQ/OiBib29sZWFuO1xuICBzYWZlPzogYm9vbGVhbjtcbiAgZXhhbXBsZT86IHN0cmluZztcbiAgYWxsb3dFbXB0eVZhbHVlcz86IGJvb2xlYW47XG4gIGRlZmF1bHRzPzogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgUGFyc2VSZXN1bHQge1xuICBlbnY6IERvdGVudkNvbmZpZztcbiAgZXhwb3J0czogU2V0PHN0cmluZz47XG59XG5cbmNvbnN0IGVtcHR5UGFyc2VSZXN1bHQgPSAoKTogUGFyc2VSZXN1bHQgPT4gKHsgZW52OiB7fSwgZXhwb3J0czogbmV3IFNldCgpIH0pO1xuY29uc3QgRVhQT1JUX1JFR0VYID0gL15cXHMqZXhwb3J0XFxzKy87XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZShyYXdEb3RlbnY6IHN0cmluZyk6IFBhcnNlUmVzdWx0IHtcbiAgY29uc3QgZW52OiBEb3RlbnZDb25maWcgPSB7fTtcbiAgY29uc3QgZXhwb3J0cyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuXG4gIGZvciAoY29uc3QgbGluZSBvZiByYXdEb3RlbnYuc3BsaXQoXCJcXG5cIikpIHtcbiAgICBpZiAoIWlzQXNzaWdubWVudExpbmUobGluZSkpIGNvbnRpbnVlO1xuICAgIGNvbnN0IGxocyA9IGxpbmUuc2xpY2UoMCwgbGluZS5pbmRleE9mKFwiPVwiKSkudHJpbSgpO1xuICAgIGNvbnN0IHsga2V5LCBleHBvcnRlZCB9ID0gcGFyc2VLZXkobGhzKTtcbiAgICBpZiAoZXhwb3J0ZWQpIHtcbiAgICAgIGV4cG9ydHMuYWRkKGtleSk7XG4gICAgfVxuICAgIGxldCB2YWx1ZSA9IGxpbmUuc2xpY2UobGluZS5pbmRleE9mKFwiPVwiKSArIDEpLnRyaW0oKTtcbiAgICBpZiAoaGFzU2luZ2xlUXVvdGVzKHZhbHVlKSkge1xuICAgICAgdmFsdWUgPSB2YWx1ZS5zbGljZSgxLCAtMSk7XG4gICAgfSBlbHNlIGlmIChoYXNEb3VibGVRdW90ZXModmFsdWUpKSB7XG4gICAgICB2YWx1ZSA9IHZhbHVlLnNsaWNlKDEsIC0xKTtcbiAgICAgIHZhbHVlID0gZXhwYW5kTmV3bGluZXModmFsdWUpO1xuICAgIH0gZWxzZSB2YWx1ZSA9IHZhbHVlLnRyaW0oKTtcbiAgICBlbnZba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIHsgZW52LCBleHBvcnRzIH07XG59XG5cbmNvbnN0IGRlZmF1bHRDb25maWdPcHRpb25zID0ge1xuICBwYXRoOiBgLmVudmAsXG4gIGV4cG9ydDogZmFsc2UsXG4gIHNhZmU6IGZhbHNlLFxuICBleGFtcGxlOiBgLmVudi5leGFtcGxlYCxcbiAgYWxsb3dFbXB0eVZhbHVlczogZmFsc2UsXG4gIGRlZmF1bHRzOiBgLmVudi5kZWZhdWx0c2AsXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gY29uZmlnKG9wdGlvbnM6IENvbmZpZ09wdGlvbnMgPSB7fSk6IERvdGVudkNvbmZpZyB7XG4gIGNvbnN0IG8gPSBtZXJnZURlZmF1bHRzKG9wdGlvbnMpO1xuICBjb25zdCBjb25mID0gcGFyc2VGaWxlKG8ucGF0aCk7XG4gIGNvbnN0IGNvbmZEZWZhdWx0cyA9IG8uZGVmYXVsdHMgPyBwYXJzZUZpbGUoby5kZWZhdWx0cykgOiBlbXB0eVBhcnNlUmVzdWx0KCk7XG4gIGNvbnN0IGNvbmZFeGFtcGxlID0gby5zYWZlID8gcGFyc2VGaWxlKG8uZXhhbXBsZSkgOiBlbXB0eVBhcnNlUmVzdWx0KCk7XG5cbiAgcmV0dXJuIHByb2Nlc3NDb25maWcobywgY29uZiwgY29uZkRlZmF1bHRzLCBjb25mRXhhbXBsZSk7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjb25maWdBc3luYyhcbiAgb3B0aW9uczogQ29uZmlnT3B0aW9ucyA9IHt9LFxuKTogUHJvbWlzZTxEb3RlbnZDb25maWc+IHtcbiAgY29uc3QgbyA9IG1lcmdlRGVmYXVsdHMob3B0aW9ucyk7XG4gIGNvbnN0IGNvbmYgPSBhd2FpdCBwYXJzZUZpbGVBc3luYyhvLnBhdGgpO1xuICBjb25zdCBjb25mRGVmYXVsdHMgPSBvLmRlZmF1bHRzXG4gICAgPyBhd2FpdCBwYXJzZUZpbGVBc3luYyhvLmRlZmF1bHRzKVxuICAgIDogZW1wdHlQYXJzZVJlc3VsdCgpO1xuICBjb25zdCBjb25mRXhhbXBsZSA9IG8uc2FmZVxuICAgID8gYXdhaXQgcGFyc2VGaWxlQXN5bmMoby5leGFtcGxlKVxuICAgIDogZW1wdHlQYXJzZVJlc3VsdCgpO1xuXG4gIHJldHVybiBwcm9jZXNzQ29uZmlnKG8sIGNvbmYsIGNvbmZEZWZhdWx0cywgY29uZkV4YW1wbGUpO1xufVxuXG4vLyBhY2NlcHRzIHRoZSBsZWZ0LWhhbmQgc2lkZSBvZiBhbiBhc3NpZ25tZW50XG5mdW5jdGlvbiBwYXJzZUtleShsaHM6IHN0cmluZyk6IHtcbiAga2V5OiBzdHJpbmc7XG4gIGV4cG9ydGVkOiBib29sZWFuO1xufSB7XG4gIGlmIChFWFBPUlRfUkVHRVgudGVzdChsaHMpKSB7XG4gICAgY29uc3Qga2V5ID0gbGhzLnJlcGxhY2UoRVhQT1JUX1JFR0VYLCBcIlwiKTtcbiAgICByZXR1cm4geyBrZXksIGV4cG9ydGVkOiB0cnVlIH07XG4gIH1cbiAgcmV0dXJuIHsga2V5OiBsaHMsIGV4cG9ydGVkOiBmYWxzZSB9O1xufVxuXG5jb25zdCBtZXJnZURlZmF1bHRzID0gKG9wdGlvbnM6IENvbmZpZ09wdGlvbnMpOiBSZXF1aXJlZDxDb25maWdPcHRpb25zPiA9PiAoe1xuICAuLi5kZWZhdWx0Q29uZmlnT3B0aW9ucyxcbiAgLi4ub3B0aW9ucyxcbn0pO1xuXG5mdW5jdGlvbiBwcm9jZXNzQ29uZmlnKFxuICBvcHRpb25zOiBSZXF1aXJlZDxDb25maWdPcHRpb25zPixcbiAgY29uZjogUGFyc2VSZXN1bHQsXG4gIGNvbmZEZWZhdWx0czogUGFyc2VSZXN1bHQsXG4gIGNvbmZFeGFtcGxlOiBQYXJzZVJlc3VsdCxcbik6IERvdGVudkNvbmZpZyB7XG4gIGlmIChvcHRpb25zLmRlZmF1bHRzKSB7XG4gICAgZm9yIChjb25zdCBrZXkgaW4gY29uZkRlZmF1bHRzLmVudikge1xuICAgICAgaWYgKCEoa2V5IGluIGNvbmYuZW52KSkge1xuICAgICAgICBjb25mLmVudltrZXldID0gY29uZkRlZmF1bHRzLmVudltrZXldO1xuICAgICAgfVxuICAgIH1cbiAgICBjb25mLmV4cG9ydHMgPSBuZXcgU2V0KFsuLi5jb25mLmV4cG9ydHMsIC4uLmNvbmZEZWZhdWx0cy5leHBvcnRzXSk7XG4gIH1cblxuICBpZiAob3B0aW9ucy5zYWZlKSB7XG4gICAgYXNzZXJ0U2FmZShjb25mLCBjb25mRXhhbXBsZSwgb3B0aW9ucy5hbGxvd0VtcHR5VmFsdWVzKTtcbiAgfVxuXG4gIGlmIChvcHRpb25zLmV4cG9ydCkge1xuICAgIGZvciAoY29uc3Qga2V5IGluIGNvbmYuZW52KSB7XG4gICAgICBkZW5vU2V0RW52KGtleSwgY29uZi5lbnZba2V5XSk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGZvciAoY29uc3Qga2V5IG9mIGNvbmYuZXhwb3J0cykge1xuICAgICAgZGVub1NldEVudihrZXksIGNvbmYuZW52W2tleV0pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjb25mLmVudjtcbn1cblxuY29uc3QgZGVub1NldEVudiA9IChrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZykgPT5cbiAgKERlbm8uZW52LmdldChrZXkpID09PSB1bmRlZmluZWQpID8gRGVuby5lbnYuc2V0KGtleSwgdmFsdWUpIDogdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwYXJzZUZpbGUoZmlsZXBhdGg6IHN0cmluZyk6IFBhcnNlUmVzdWx0IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gcGFyc2UobmV3IFRleHREZWNvZGVyKFwidXRmLThcIikuZGVjb2RlKERlbm8ucmVhZEZpbGVTeW5jKGZpbGVwYXRoKSkpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkgcmV0dXJuIGVtcHR5UGFyc2VSZXN1bHQoKTtcbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHBhcnNlRmlsZUFzeW5jKGZpbGVwYXRoOiBzdHJpbmcpOiBQcm9taXNlPFBhcnNlUmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIHBhcnNlKFxuICAgICAgbmV3IFRleHREZWNvZGVyKFwidXRmLThcIikuZGVjb2RlKGF3YWl0IERlbm8ucmVhZEZpbGUoZmlsZXBhdGgpKSxcbiAgICApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGUgaW5zdGFuY2VvZiBEZW5vLmVycm9ycy5Ob3RGb3VuZCkgcmV0dXJuIGVtcHR5UGFyc2VSZXN1bHQoKTtcbiAgICB0aHJvdyBlO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXNzaWdubWVudExpbmUoc3RyOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgcmV0dXJuIC9eXFxzKig/OmV4cG9ydFxccyspP1thLXpBLVpfXVthLXpBLVpfMC05IF0qXFxzKj0vLnRlc3Qoc3RyKTtcbn1cblxuZnVuY3Rpb24gaGFzU2luZ2xlUXVvdGVzKHN0cjogc3RyaW5nKTogYm9vbGVhbiB7XG4gIHJldHVybiAvXicoW1xcc1xcU10qKSckLy50ZXN0KHN0cik7XG59XG5cbmZ1bmN0aW9uIGhhc0RvdWJsZVF1b3RlcyhzdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gL15cIihbXFxzXFxTXSopXCIkLy50ZXN0KHN0cik7XG59XG5cbmZ1bmN0aW9uIGV4cGFuZE5ld2xpbmVzKHN0cjogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlQWxsKFwiXFxcXG5cIiwgXCJcXG5cIik7XG59XG5cbmZ1bmN0aW9uIGFzc2VydFNhZmUoXG4gIGNvbmY6IFBhcnNlUmVzdWx0LFxuICBjb25mRXhhbXBsZTogUGFyc2VSZXN1bHQsXG4gIGFsbG93RW1wdHlWYWx1ZXM6IGJvb2xlYW4sXG4pIHtcbiAgY29uc3QgY3VycmVudEVudiA9IERlbm8uZW52LnRvT2JqZWN0KCk7XG4gIGNvbnN0IGN1cnJlbnRFeHBvcnRzTGlzdCA9IE9iamVjdC5rZXlzKGN1cnJlbnRFbnYpO1xuXG4gIC8vIE5vdCBhbGwgdGhlIHZhcmlhYmxlcyBoYXZlIHRvIGJlIGRlZmluZWQgaW4gLmVudiwgdGhleSBjYW4gYmUgc3VwcGxpZWQgZXh0ZXJuYWxseVxuICBjb25zdCBjb25mV2l0aEVudiA9IE9iamVjdC5hc3NpZ24oe30sIGN1cnJlbnRFbnYsIGNvbmYuZW52KTtcblxuICBjb25zdCBtaXNzaW5nVmFycyA9IGRpZmZlcmVuY2UoXG4gICAgT2JqZWN0LmtleXMoY29uZkV4YW1wbGUuZW52KSxcbiAgICAvLyBJZiBhbGxvd0VtcHR5VmFsdWVzIGlzIGZhbHNlLCBmaWx0ZXIgb3V0IGVtcHR5IHZhbHVlcyBmcm9tIGNvbmZpZ3VyYXRpb25cbiAgICBPYmplY3Qua2V5cyhcbiAgICAgIGFsbG93RW1wdHlWYWx1ZXMgPyBjb25mV2l0aEVudiA6IHJlbW92ZUVtcHR5VmFsdWVzKGNvbmZXaXRoRW52KSxcbiAgICApLFxuICApO1xuXG4gIGlmIChtaXNzaW5nVmFycy5sZW5ndGggPiAwKSB7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlcyA9IFtcbiAgICAgIGBUaGUgZm9sbG93aW5nIHZhcmlhYmxlcyB3ZXJlIGRlZmluZWQgaW4gdGhlIGV4YW1wbGUgZmlsZSBidXQgYXJlIG5vdCBwcmVzZW50IGluIHRoZSBlbnZpcm9ubWVudDpcXG4gICR7XG4gICAgICAgIG1pc3NpbmdWYXJzLmpvaW4oXG4gICAgICAgICAgXCIsIFwiLFxuICAgICAgICApXG4gICAgICB9YCxcbiAgICAgIGBNYWtlIHN1cmUgdG8gYWRkIHRoZW0gdG8geW91ciBlbnYgZmlsZS5gLFxuICAgICAgIWFsbG93RW1wdHlWYWx1ZXMgJiZcbiAgICAgIGBJZiB5b3UgZXhwZWN0IGFueSBvZiB0aGVzZSB2YXJpYWJsZXMgdG8gYmUgZW1wdHksIHlvdSBjYW4gc2V0IHRoZSBhbGxvd0VtcHR5VmFsdWVzIG9wdGlvbiB0byB0cnVlLmAsXG4gICAgXTtcblxuICAgIHRocm93IG5ldyBNaXNzaW5nRW52VmFyc0Vycm9yKGVycm9yTWVzc2FnZXMuZmlsdGVyKEJvb2xlYW4pLmpvaW4oXCJcXG5cXG5cIikpO1xuICB9XG5cbiAgY29uc3QgZXhwb3J0c1dpdGhFbnYgPSBuZXcgU2V0KFsuLi5jdXJyZW50RXhwb3J0c0xpc3QsIC4uLmNvbmYuZXhwb3J0c10pO1xuICBjb25zdCBtaXNzaW5nRXhwb3J0cyA9IGRpZmZlcmVuY2UoW1xuICAgIC4uLmNvbmZFeGFtcGxlLmV4cG9ydHMsXG4gIF0sIFtcbiAgICAuLi5leHBvcnRzV2l0aEVudixcbiAgXSk7XG5cbiAgaWYgKG1pc3NpbmdFeHBvcnRzLmxlbmd0aCA+IDApIHtcbiAgICB0aHJvdyBuZXcgTWlzc2luZ0VudlZhckV4cG9ydHNFcnJvcihcbiAgICAgIGBUaGUgZm9sbG93aW5nIHZhcmlhYmxlcyB3ZXJlIGV4cG9ydGVkIGluIHRoZSBleGFtcGxlIGZpbGUgYnV0IGFyZSBub3QgZXhwb3J0ZWQgaW4gdGhlIGVudmlyb25tZW50OlxuJHttaXNzaW5nRXhwb3J0cy5qb2luKFwiLCBcIil9LFxubWFrZSBzdXJlIHRvIGV4cG9ydCB0aGVtIGluIHlvdXIgZW52IGZpbGUgb3IgaW4gdGhlIGVudmlyb25tZW50IG9mIHRoZSBwYXJlbnQgcHJvY2VzcyAoZS5nLiBzaGVsbCkuYCxcbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBNaXNzaW5nRW52VmFyc0Vycm9yIGV4dGVuZHMgRXJyb3Ige1xuICBjb25zdHJ1Y3RvcihtZXNzYWdlPzogc3RyaW5nKSB7XG4gICAgc3VwZXIobWVzc2FnZSk7XG4gICAgdGhpcy5uYW1lID0gXCJNaXNzaW5nRW52VmFyc0Vycm9yXCI7XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIG5ldy50YXJnZXQucHJvdG90eXBlKTtcbiAgfVxufVxuXG5leHBvcnQgY2xhc3MgTWlzc2luZ0VudlZhckV4cG9ydHNFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZykge1xuICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBNaXNzaW5nRW52VmFyRXhwb3J0c0Vycm9yLnByb3RvdHlwZSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFVBQVUsRUFBRSxpQkFBaUIsUUFBUSxZQUFZO0FBb0IxRCxNQUFNLG1CQUFtQixJQUFtQixDQUFDO1FBQUUsS0FBSyxDQUFDO1FBQUcsU0FBUyxJQUFJO0lBQU0sQ0FBQztBQUM1RSxNQUFNLGVBQWU7QUFFckIsT0FBTyxTQUFTLE1BQU0sU0FBaUIsRUFBZTtJQUNwRCxNQUFNLE1BQW9CLENBQUM7SUFDM0IsTUFBTSxVQUFVLElBQUk7SUFFcEIsS0FBSyxNQUFNLFFBQVEsVUFBVSxLQUFLLENBQUMsTUFBTztRQUN4QyxJQUFJLENBQUMsaUJBQWlCLE9BQU8sUUFBUztRQUN0QyxNQUFNLE1BQU0sS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLE9BQU8sQ0FBQyxNQUFNLElBQUk7UUFDakQsTUFBTSxFQUFFLElBQUcsRUFBRSxTQUFRLEVBQUUsR0FBRyxTQUFTO1FBQ25DLElBQUksVUFBVTtZQUNaLFFBQVEsR0FBRyxDQUFDO1FBQ2QsQ0FBQztRQUNELElBQUksUUFBUSxLQUFLLEtBQUssQ0FBQyxLQUFLLE9BQU8sQ0FBQyxPQUFPLEdBQUcsSUFBSTtRQUNsRCxJQUFJLGdCQUFnQixRQUFRO1lBQzFCLFFBQVEsTUFBTSxLQUFLLENBQUMsR0FB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