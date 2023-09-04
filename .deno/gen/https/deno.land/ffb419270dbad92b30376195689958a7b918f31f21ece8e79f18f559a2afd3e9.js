const mentionToRegex = {
    user: /<@!?(\d{17,19})>|(\d{17,19})/,
    role: /<@&(\d{17,19})>|(\d{17,19})/,
    channel: /<#(\d{17,19})>|(\d{17,19})/
};
export async function parseArgs(commandArgs, messageArgs, message) {
    if (commandArgs === undefined) return null;
    const messageArgsNullableCopy = [
        ...messageArgs
    ];
    const args = {};
    for (const entry of commandArgs){
        switch(entry.match){
            case 'flag':
                parseFlags(args, entry, messageArgsNullableCopy);
                break;
            case 'user':
            case 'role':
            case 'channel':
                await parseMention(args, entry, messageArgsNullableCopy, message);
                break;
            case 'content':
                parseContent(args, entry, messageArgs);
                break;
            case 'rest':
                parseRest(args, entry, messageArgsNullableCopy);
                break;
        }
    }
    return args;
}
function parseFlags(args, entry, argsNullable) {
    for(let i = 0; i < argsNullable.length; i++){
        if (entry.flag === argsNullable[i]) {
            argsNullable[i] = null;
            args[entry.name] = true;
            break;
        } else args[entry.name] = entry.defaultValue ?? false;
    }
}
async function parseMention(args, entry, argsNullable, message) {
    const regex = mentionToRegex[entry.match];
    const index = argsNullable.findIndex((x)=>typeof x === 'string' && regex.test(x));
    const regexMatches = regex.exec(argsNullable[index]);
    const tempValue = regexMatches !== null ? regexMatches[0].replace(regex, '$1$2') : null;
    let temp;
    switch(entry.match){
        case 'channel':
            temp = tempValue !== null ? await message.client.channels.get(tempValue) : entry.defaultValue;
            break;
        case 'user':
            temp = tempValue !== null ? await message.client.users.get(tempValue) : entry.defaultValue;
            break;
        case 'role':
            temp = tempValue !== null ? await message.guild?.roles.get(tempValue) : entry.defaultValue;
            break;
    }
    args[entry.name] = temp;
    argsNullable[index] = null;
}
function parseContent(args, entry, argsNonNullable) {
    args[entry.name] = argsNonNullable.length > 0 ? entry.contentFilter !== undefined ? argsNonNullable.filter(entry.contentFilter) : argsNonNullable : entry.defaultValue;
}
function parseRest(args, entry, argsNullable) {
    const restValues = argsNullable.filter((x)=>typeof x === 'string');
    args[entry.name] = restValues.length > 0 ? restValues?.join(' ') : entry.defaultValue;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3V0aWxzL2NvbW1hbmQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBNZXNzYWdlIH0gZnJvbSAnLi4vc3RydWN0dXJlcy9tZXNzYWdlLnRzJ1xuaW1wb3J0IHR5cGUgeyBHdWlsZCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvZ3VpbGQudHMnXG5pbXBvcnQgdHlwZSB7IFJvbGUgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL3JvbGUudHMnXG5pbXBvcnQgdHlwZSB7IFVzZXIgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL3VzZXIudHMnXG5cbmludGVyZmFjZSBNZW50aW9uVG9SZWdleCB7XG4gIFtrZXk6IHN0cmluZ106IFJlZ0V4cFxuICB1c2VyOiBSZWdFeHBcbiAgcm9sZTogUmVnRXhwXG4gIGNoYW5uZWw6IFJlZ0V4cFxufVxuXG5jb25zdCBtZW50aW9uVG9SZWdleDogTWVudGlvblRvUmVnZXggPSB7XG4gIHVzZXI6IC88QCE/KFxcZHsxNywxOX0pPnwoXFxkezE3LDE5fSkvLFxuICByb2xlOiAvPEAmKFxcZHsxNywxOX0pPnwoXFxkezE3LDE5fSkvLFxuICBjaGFubmVsOiAvPCMoXFxkezE3LDE5fSk+fChcXGR7MTcsMTl9KS9cbn1cblxuaW50ZXJmYWNlIEFyZ3VtZW50QmFzZSB7XG4gIG5hbWU6IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIEZsYWdBcmd1bWVudCBleHRlbmRzIEFyZ3VtZW50QmFzZSB7XG4gIG1hdGNoOiAnZmxhZydcbiAgZmxhZzogc3RyaW5nXG4gIGRlZmF1bHRWYWx1ZT86IGJvb2xlYW5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBNZW50aW9uQXJndW1lbnQgZXh0ZW5kcyBBcmd1bWVudEJhc2Uge1xuICBtYXRjaDogJ3VzZXInIHwgJ3JvbGUnIHwgJ2NoYW5uZWwnXG4gIGRlZmF1bHRWYWx1ZT86IHN0cmluZ1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnRlbnRBcmd1bWVudCBleHRlbmRzIEFyZ3VtZW50QmFzZSB7XG4gIG1hdGNoOiAnY29udGVudCdcbiAgZGVmYXVsdFZhbHVlPzogc3RyaW5nIHwgbnVtYmVyXG4gIGNvbnRlbnRGaWx0ZXI/OiAodmFsdWU6IHN0cmluZywgaW5kZXg6IG51bWJlciwgYXJyYXk6IHN0cmluZ1tdKSA9PiBib29sZWFuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVzdEFyZ3VtZW50IGV4dGVuZHMgQXJndW1lbnRCYXNlIHtcbiAgbWF0Y2g6ICdyZXN0J1xuICBkZWZhdWx0VmFsdWU/OiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgQXJncyA9XG4gIHwgRmxhZ0FyZ3VtZW50XG4gIHwgTWVudGlvbkFyZ3VtZW50XG4gIHwgQ29udGVudEFyZ3VtZW50XG4gIHwgUmVzdEFyZ3VtZW50XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBwYXJzZUFyZ3MoXG4gIGNvbW1hbmRBcmdzOiBBcmdzW10gfCB1bmRlZmluZWQsXG4gIG1lc3NhZ2VBcmdzOiBzdHJpbmdbXSxcbiAgbWVzc2FnZTogTWVzc2FnZVxuKTogUHJvbWlzZTxSZWNvcmQ8XG4gIHN0cmluZyxcbiAgR3VpbGQgfCBVc2VyIHwgUm9sZSB8IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW5cbj4gfCBudWxsPiB7XG4gIGlmIChjb21tYW5kQXJncyA9PT0gdW5kZWZpbmVkKSByZXR1cm4gbnVsbFxuICBjb25zdCBtZXNzYWdlQXJnc051bGxhYmxlQ29weTogQXJyYXk8c3RyaW5nIHwgbnVsbD4gPSBbLi4ubWVzc2FnZUFyZ3NdXG4gIGNvbnN0IGFyZ3M6IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4+ID0ge31cblxuICBmb3IgKGNvbnN0IGVudHJ5IG9mIGNvbW1hbmRBcmdzKSB7XG4gICAgc3dpdGNoIChlbnRyeS5tYXRjaCkge1xuICAgICAgY2FzZSAnZmxhZyc6XG4gICAgICAgIHBhcnNlRmxhZ3MoYXJncywgZW50cnksIG1lc3NhZ2VBcmdzTnVsbGFibGVDb3B5KVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAndXNlcic6XG4gICAgICBjYXNlICdyb2xlJzpcbiAgICAgIGNhc2UgJ2NoYW5uZWwnOlxuICAgICAgICBhd2FpdCBwYXJzZU1lbnRpb24oYXJncywgZW50cnksIG1lc3NhZ2VBcmdzTnVsbGFibGVDb3B5LCBtZXNzYWdlKVxuICAgICAgICBicmVha1xuICAgICAgY2FzZSAnY29udGVudCc6XG4gICAgICAgIHBhcnNlQ29udGVudChhcmdzLCBlbnRyeSwgbWVzc2FnZUFyZ3MpXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdyZXN0JzpcbiAgICAgICAgcGFyc2VSZXN0KGFyZ3MsIGVudHJ5LCBtZXNzYWdlQXJnc051bGxhYmxlQ29weSlcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGFyZ3Ncbn1cblxuZnVuY3Rpb24gcGFyc2VGbGFncyhcbiAgYXJnczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIGVudHJ5OiBGbGFnQXJndW1lbnQsXG4gIGFyZ3NOdWxsYWJsZTogQXJyYXk8c3RyaW5nIHwgbnVsbD5cbik6IHZvaWQge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3NOdWxsYWJsZS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChlbnRyeS5mbGFnID09PSBhcmdzTnVsbGFibGVbaV0pIHtcbiAgICAgIGFyZ3NOdWxsYWJsZVtpXSA9IG51bGxcbiAgICAgIGFyZ3NbZW50cnkubmFtZV0gPSB0cnVlXG4gICAgICBicmVha1xuICAgIH0gZWxzZSBhcmdzW2VudHJ5Lm5hbWVdID0gZW50cnkuZGVmYXVsdFZhbHVlID8/IGZhbHNlXG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcGFyc2VNZW50aW9uKFxuICBhcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgZW50cnk6IE1lbnRpb25Bcmd1bWVudCxcbiAgYXJnc051bGxhYmxlOiBBcnJheTxzdHJpbmcgfCBudWxsPixcbiAgbWVzc2FnZTogTWVzc2FnZVxuKTogUHJvbWlzZTx2b2lkPiB7XG4gIGNvbnN0IHJlZ2V4ID0gbWVudGlvblRvUmVnZXhbZW50cnkubWF0Y2hdXG4gIGNvbnN0IGluZGV4ID0gYXJnc051bGxhYmxlLmZpbmRJbmRleChcbiAgICAoeCkgPT4gdHlwZW9mIHggPT09ICdzdHJpbmcnICYmIHJlZ2V4LnRlc3QoeClcbiAgKVxuICBjb25zdCByZWdleE1hdGNoZXMgPSByZWdleC5leGVjKGFyZ3NOdWxsYWJsZVtpbmRleF0hKVxuICBjb25zdCB0ZW1wVmFsdWUgPVxuICAgIHJlZ2V4TWF0Y2hlcyAhPT0gbnVsbCA/IHJlZ2V4TWF0Y2hlc1swXS5yZXBsYWNlKHJlZ2V4LCAnJDEkMicpIDogbnVsbFxuICBsZXQgdGVtcFxuICBzd2l0Y2ggKGVudHJ5Lm1hdGNoKSB7XG4gICAgY2FzZSAnY2hhbm5lbCc6XG4gICAgICB0ZW1wID1cbiAgICAgICAgdGVtcFZhbHVlICE9PSBudWxsXG4gICAgICAgICAgPyBhd2FpdCBtZXNzYWdlLmNsaWVudC5jaGFubmVscy5nZXQodGVtcFZhbHVlKVxuICAgICAgICAgIDogZW50cnkuZGVmYXVsdFZhbHVlXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAndXNlcic6XG4gICAgICB0ZW1wID1cbiAgICAgICAgdGVtcFZhbHVlICE9PSBudWxsXG4gICAgICAgICAgPyBhd2FpdCBtZXNzYWdlLmNsaWVudC51c2Vycy5nZXQodGVtcFZhbHVlKVxuICAgICAgICAgIDogZW50cnkuZGVmYXVsdFZhbHVlXG4gICAgICBicmVha1xuXG4gICAgY2FzZSAncm9sZSc6XG4gICAgICB0ZW1wID1cbiAgICAgICAgdGVtcFZhbHVlICE9PSBudWxsXG4gICAgICAgICAgPyBhd2FpdCBtZXNzYWdlLmd1aWxkPy5yb2xlcy5nZXQodGVtcFZhbHVlKVxuICAgICAgICAgIDogZW50cnkuZGVmYXVsdFZhbHVlXG4gICAgICBicmVha1xuICB9XG5cbiAgYXJnc1tlbnRyeS5uYW1lXSA9IHRlbXBcbiAgYXJnc051bGxhYmxlW2luZGV4XSA9IG51bGxcbn1cblxuZnVuY3Rpb24gcGFyc2VDb250ZW50KFxuICBhcmdzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgZW50cnk6IENvbnRlbnRBcmd1bWVudCxcbiAgYXJnc05vbk51bGxhYmxlOiBzdHJpbmdbXVxuKTogdm9pZCB7XG4gIGFyZ3NbZW50cnkubmFtZV0gPVxuICAgIGFyZ3NOb25OdWxsYWJsZS5sZW5ndGggPiAwXG4gICAgICA/IGVudHJ5LmNvbnRlbnRGaWx0ZXIgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IGFyZ3NOb25OdWxsYWJsZS5maWx0ZXIoZW50cnkuY29udGVudEZpbHRlcilcbiAgICAgICAgOiBhcmdzTm9uTnVsbGFibGVcbiAgICAgIDogZW50cnkuZGVmYXVsdFZhbHVlXG59XG5cbmZ1bmN0aW9uIHBhcnNlUmVzdChcbiAgYXJnczogUmVjb3JkPHN0cmluZywgdW5rbm93bj4sXG4gIGVudHJ5OiBSZXN0QXJndW1lbnQsXG4gIGFyZ3NOdWxsYWJsZTogQXJyYXk8c3RyaW5nIHwgbnVsbD5cbik6IHZvaWQge1xuICBjb25zdCByZXN0VmFsdWVzID0gYXJnc051bGxhYmxlLmZpbHRlcigoeCkgPT4gdHlwZW9mIHggPT09ICdzdHJpbmcnKVxuICBhcmdzW2VudHJ5Lm5hbWVdID1cbiAgICByZXN0VmFsdWVzLmxlbmd0aCA+IDAgPyByZXN0VmFsdWVzPy5qb2luKCcgJykgOiBlbnRyeS5kZWZhdWx0VmFsdWVcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFZQSxNQUFNLGlCQUFpQztJQUNyQyxNQUFNO0lBQ04sTUFBTTtJQUNOLFNBQVM7QUFDWDtBQWtDQSxPQUFPLGVBQWUsVUFDcEIsV0FBK0IsRUFDL0IsV0FBcUIsRUFDckIsT0FBZ0IsRUFJUjtJQUNSLElBQUksZ0JBQWdCLFdBQVcsT0FBTyxJQUFJO0lBQzFDLE1BQU0sMEJBQWdEO1dBQUk7S0FBWTtJQUN0RSxNQUFNLE9BQWtELENBQUM7SUFFekQsS0FBSyxNQUFNLFNB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