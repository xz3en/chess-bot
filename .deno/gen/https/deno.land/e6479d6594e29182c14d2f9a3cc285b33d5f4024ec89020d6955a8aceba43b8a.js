export function camelCase(name) {
    const parts = name.split('_');
    return parts.map((e, i)=>i === 0 ? e : e === 'id' ? 'ID' : `${e[0].toUpperCase()}${e.slice(1)}`).join('');
}
// Can't really make an actual type for this
export function toCamelCase(data) {
    if (Array.isArray(data)) return data.map((e)=>{
        return typeof e === 'object' && e !== null ? toCamelCase(e) : e;
    });
    const result = {};
    Object.entries(data).forEach(([k, v])=>{
        result[camelCase(k)] = typeof v === 'object' && v !== null ? toCamelCase(v) : v;
    });
    return result;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3V0aWxzL3NuYWtlQ2FzZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gY2FtZWxDYXNlKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IHBhcnRzID0gbmFtZS5zcGxpdCgnXycpXG4gIHJldHVybiBwYXJ0c1xuICAgIC5tYXAoKGUsIGkpID0+XG4gICAgICBpID09PSAwID8gZSA6IGUgPT09ICdpZCcgPyAnSUQnIDogYCR7ZVswXS50b1VwcGVyQ2FzZSgpfSR7ZS5zbGljZSgxKX1gXG4gICAgKVxuICAgIC5qb2luKCcnKVxufVxuXG4vLyBDYW4ndCByZWFsbHkgbWFrZSBhbiBhY3R1YWwgdHlwZSBmb3IgdGhpc1xuZXhwb3J0IGZ1bmN0aW9uIHRvQ2FtZWxDYXNlKGRhdGE6IGFueSk6IGFueSB7XG4gIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKVxuICAgIHJldHVybiBkYXRhLm1hcCgoZSkgPT4ge1xuICAgICAgcmV0dXJuIHR5cGVvZiBlID09PSAnb2JqZWN0JyAmJiBlICE9PSBudWxsID8gdG9DYW1lbENhc2UoZSkgOiBlXG4gICAgfSlcbiAgY29uc3QgcmVzdWx0OiBhbnkgPSB7fVxuICBPYmplY3QuZW50cmllcyhkYXRhKS5mb3JFYWNoKChbaywgdl0pID0+IHtcbiAgICByZXN1bHRbY2FtZWxDYXNlKGspXSA9XG4gICAgICB0eXBlb2YgdiA9PT0gJ29iamVjdCcgJiYgdiAhPT0gbnVsbCA/IHRvQ2FtZWxDYXNlKHYpIDogdlxuICB9KVxuICByZXR1cm4gcmVzdWx0XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxTQUFTLFVBQVUsSUFBWSxFQUFVO0lBQzlDLE1BQU0sUUFBUSxLQUFLLEtBQUssQ0FBQztJQUN6QixPQUFPLE1BQ0osR0FBRyxDQUFDLENBQUMsR0FBRyxJQUNQLE1BQU0sSUFBSSxJQUFJLE1BQU0sT0FBTyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsR0FBRyxFQUFFLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUV2RSxJQUFJLENBQUM7QUFDVixDQUFDO0FBRUQsNENBQTRDO0FBQzVDLE9BQU8sU0FBUyxZQUFZLElBQVMsRUFBTztJQUMxQyxJQUFJLE1BQU0sT0FBTyxDQUFDLE9BQ2hCLE9BQU8sS0FBSyxHQUFHLENBQUMsQ0FBQyxJQUFNO1FBQ3JCLE9BQU8sT0FBTyxNQUFNLFlBQVksTUFBTSxJQUFJLEdBQUcsWUFBWSxLQUFLLENBQUM7SUFDakU7SUFDRixNQUFNLFNBQWMsQ0FBQztJQUNyQixPQUFPLE9BQU8sQ0FBQyxNQUFNLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUs7UUFDdkMsTUFBTSxDQUFDLFVBQVUsR0FBRyxHQUNsQixPQUFPLE1BQU0sWUFBWSxNQUFNLElBQUksR0FBRyxZQUFZLEtBQUssQ0FBQztJQUM1RDtJQUNBLE9BQU87QUFDVCxDQUFDIn0=