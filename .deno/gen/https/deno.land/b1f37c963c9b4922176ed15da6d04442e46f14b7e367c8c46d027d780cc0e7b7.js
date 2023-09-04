// Note: can't change this any to unknown now, it'd be breaking
/** Enhanced Map with various utility functions */ export class Collection extends Map {
    /** Set a key to value in Collection */ set(key, value) {
        return super.set(key, value);
    }
    /** Get Array of values in Collection */ array() {
        return [
            ...this.values()
        ];
    }
    first(amount) {
        if (typeof amount === 'undefined') return this.values().next().value;
        if (amount < 0) return this.last(amount * -1);
        amount = Math.min(this.size, amount);
        const iter = this.values();
        return Array.from({
            length: amount
        }, ()=>iter.next().value);
    }
    last(amount) {
        const arr = this.array();
        if (typeof amount === 'undefined') return arr[arr.length - 1];
        if (amount < 0) return this.first(amount * -1);
        if (!amount) return [] // eslint-disable-line
        ;
        return arr.slice(-amount);
    }
    random(amount) {
        let arr = this.array();
        if (typeof amount === 'undefined') return arr[Math.floor(Math.random() * arr.length)];
        if (arr.length === 0 || !amount) return [] // eslint-disable-line
        ;
        arr = arr.slice();
        return Array.from({
            length: amount
        }, ()=>arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
    }
    /** Find a value from Collection using callback */ find(callback) {
        for (const key of this.keys()){
            const value = this.get(key);
            if (callback(value, key)) return value;
        }
    }
    /** Filter out the Collection using callback */ filter(callback) {
        const relevant = new Collection();
        this.forEach((value, key)=>{
            if (callback(value, key)) relevant.set(key, value);
        });
        return relevant;
    }
    /** Map the collection */ map(callback) {
        const results = [];
        for (const key of this.keys()){
            const value = this.get(key);
            results.push(callback(value, key));
        }
        return results;
    }
    /** Check if any of the values/keys in Collection satisfies callback */ some(callback) {
        for (const key of this.keys()){
            const value = this.get(key);
            if (callback(value, key)) return true;
        }
        return false;
    }
    /** Check if every value/key in Collection satisfies callback */ every(callback) {
        for (const key of this.keys()){
            const value = this.get(key);
            if (!callback(value, key)) return false;
        }
        return true;
    }
    /** Reduce the Collection to a single value */ reduce(callback, initialValue) {
        let accumulator = initialValue;
        for (const key of this.keys()){
            const value = this.get(key);
            accumulator = callback(accumulator, value, key);
        }
        return accumulator;
    }
    /** Create a Collection from an Object */ static fromObject(object) {
        return new Collection(Object.entries(object));
    }
    /** Convert Collection to an object */ toObject() {
        return Object.fromEntries(this);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3V0aWxzL2NvbGxlY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gTm90ZTogY2FuJ3QgY2hhbmdlIHRoaXMgYW55IHRvIHVua25vd24gbm93LCBpdCdkIGJlIGJyZWFraW5nXG5cbi8qKiBFbmhhbmNlZCBNYXAgd2l0aCB2YXJpb3VzIHV0aWxpdHkgZnVuY3Rpb25zICovXG5leHBvcnQgY2xhc3MgQ29sbGVjdGlvbjxLID0gc3RyaW5nLCBWID0gYW55PiBleHRlbmRzIE1hcDxLLCBWPiB7XG4gIC8qKiBTZXQgYSBrZXkgdG8gdmFsdWUgaW4gQ29sbGVjdGlvbiAqL1xuICBzZXQoa2V5OiBLLCB2YWx1ZTogVik6IHRoaXMge1xuICAgIHJldHVybiBzdXBlci5zZXQoa2V5LCB2YWx1ZSlcbiAgfVxuXG4gIC8qKiBHZXQgQXJyYXkgb2YgdmFsdWVzIGluIENvbGxlY3Rpb24gKi9cbiAgYXJyYXkoKTogVltdIHtcbiAgICByZXR1cm4gWy4uLnRoaXMudmFsdWVzKCldXG4gIH1cblxuICAvKiogR2V0IGZpcnN0IHZhbHVlKHMpIGluIENvbGxlY3Rpb24gKi9cbiAgZmlyc3QoKTogViB8IHVuZGVmaW5lZFxuICBmaXJzdChhbW91bnQ6IG51bWJlcik6IFZbXVxuICBmaXJzdChhbW91bnQ/OiBudW1iZXIpOiBWIHwgVltdIHwgdW5kZWZpbmVkIHtcbiAgICBpZiAodHlwZW9mIGFtb3VudCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiB0aGlzLnZhbHVlcygpLm5leHQoKS52YWx1ZVxuICAgIGlmIChhbW91bnQgPCAwKSByZXR1cm4gdGhpcy5sYXN0KGFtb3VudCAqIC0xKVxuICAgIGFtb3VudCA9IE1hdGgubWluKHRoaXMuc2l6ZSwgYW1vdW50KVxuICAgIGNvbnN0IGl0ZXIgPSB0aGlzLnZhbHVlcygpXG4gICAgcmV0dXJuIEFycmF5LmZyb20oeyBsZW5ndGg6IGFtb3VudCB9LCAoKTogViA9PiBpdGVyLm5leHQoKS52YWx1ZSlcbiAgfVxuXG4gIC8qKiBHZXQgbGFzdCB2YWx1ZShzKSBpbiBDb2xsZWN0aW9uICovXG4gIGxhc3QoKTogViB8IHVuZGVmaW5lZFxuICBsYXN0KGFtb3VudDogbnVtYmVyKTogVltdXG4gIGxhc3QoYW1vdW50PzogbnVtYmVyKTogViB8IFZbXSB8IHVuZGVmaW5lZCB7XG4gICAgY29uc3QgYXJyID0gdGhpcy5hcnJheSgpXG4gICAgaWYgKHR5cGVvZiBhbW91bnQgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gYXJyW2Fyci5sZW5ndGggLSAxXVxuICAgIGlmIChhbW91bnQgPCAwKSByZXR1cm4gdGhpcy5maXJzdChhbW91bnQgKiAtMSlcbiAgICBpZiAoIWFtb3VudCkgcmV0dXJuIFtdIC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbiAgICByZXR1cm4gYXJyLnNsaWNlKC1hbW91bnQpXG4gIH1cblxuICAvKiogR2V0IHJhbmRvbSB2YWx1ZShzKSBmcm9tIENvbGxlY3Rpb24gKi9cbiAgcmFuZG9tKCk6IFZcbiAgcmFuZG9tKGFtb3VudDogbnVtYmVyKTogVltdXG4gIHJhbmRvbShhbW91bnQ/OiBudW1iZXIpOiBWIHwgVltdIHtcbiAgICBsZXQgYXJyID0gdGhpcy5hcnJheSgpXG4gICAgaWYgKHR5cGVvZiBhbW91bnQgPT09ICd1bmRlZmluZWQnKVxuICAgICAgcmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV1cbiAgICBpZiAoYXJyLmxlbmd0aCA9PT0gMCB8fCAhYW1vdW50KSByZXR1cm4gW10gLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgIGFyciA9IGFyci5zbGljZSgpXG4gICAgcmV0dXJuIEFycmF5LmZyb20oXG4gICAgICB7IGxlbmd0aDogYW1vdW50IH0sXG4gICAgICAoKTogViA9PiBhcnIuc3BsaWNlKE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIGFyci5sZW5ndGgpLCAxKVswXVxuICAgIClcbiAgfVxuXG4gIC8qKiBGaW5kIGEgdmFsdWUgZnJvbSBDb2xsZWN0aW9uIHVzaW5nIGNhbGxiYWNrICovXG4gIGZpbmQoY2FsbGJhY2s6ICh2YWx1ZTogViwga2V5OiBLKSA9PiBib29sZWFuKTogViB8IHVuZGVmaW5lZCB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgdGhpcy5rZXlzKCkpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXQoa2V5KSBhcyBWXG4gICAgICBpZiAoY2FsbGJhY2sodmFsdWUsIGtleSkpIHJldHVybiB2YWx1ZVxuICAgIH1cbiAgfVxuXG4gIC8qKiBGaWx0ZXIgb3V0IHRoZSBDb2xsZWN0aW9uIHVzaW5nIGNhbGxiYWNrICovXG4gIGZpbHRlcihjYWxsYmFjazogKHZhbHVlOiBWLCBrZXk6IEspID0+IGJvb2xlYW4pOiBDb2xsZWN0aW9uPEssIFY+IHtcbiAgICBjb25zdCByZWxldmFudCA9IG5ldyBDb2xsZWN0aW9uPEssIFY+KClcbiAgICB0aGlzLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgIGlmIChjYWxsYmFjayh2YWx1ZSwga2V5KSkgcmVsZXZhbnQuc2V0KGtleSwgdmFsdWUpXG4gICAgfSlcbiAgICByZXR1cm4gcmVsZXZhbnRcbiAgfVxuXG4gIC8qKiBNYXAgdGhlIGNvbGxlY3Rpb24gKi9cbiAgbWFwPFQ+KGNhbGxiYWNrOiAodmFsdWU6IFYsIGtleTogSykgPT4gVCk6IFRbXSB7XG4gICAgY29uc3QgcmVzdWx0cyA9IFtdXG4gICAgZm9yIChjb25zdCBrZXkgb2YgdGhpcy5rZXlzKCkpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXQoa2V5KSBhcyBWXG4gICAgICByZXN1bHRzLnB1c2goY2FsbGJhY2sodmFsdWUsIGtleSkpXG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzXG4gIH1cblxuICAvKiogQ2hlY2sgaWYgYW55IG9mIHRoZSB2YWx1ZXMva2V5cyBpbiBDb2xsZWN0aW9uIHNhdGlzZmllcyBjYWxsYmFjayAqL1xuICBzb21lKGNhbGxiYWNrOiAodmFsdWU6IFYsIGtleTogSykgPT4gYm9vbGVhbik6IGJvb2xlYW4ge1xuICAgIGZvciAoY29uc3Qga2V5IG9mIHRoaXMua2V5cygpKSB7XG4gICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0KGtleSkgYXMgVlxuICAgICAgaWYgKGNhbGxiYWNrKHZhbHVlLCBrZXkpKSByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuXG4gIC8qKiBDaGVjayBpZiBldmVyeSB2YWx1ZS9rZXkgaW4gQ29sbGVjdGlvbiBzYXRpc2ZpZXMgY2FsbGJhY2sgKi9cbiAgZXZlcnkoY2FsbGJhY2s6ICh2YWx1ZTogViwga2V5OiBLKSA9PiBib29sZWFuKTogYm9vbGVhbiB7XG4gICAgZm9yIChjb25zdCBrZXkgb2YgdGhpcy5rZXlzKCkpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXQoa2V5KSBhcyBWXG4gICAgICBpZiAoIWNhbGxiYWNrKHZhbHVlLCBrZXkpKSByZXR1cm4gZmFsc2VcbiAgICB9XG4gICAgcmV0dXJuIHRydWVcbiAgfVxuXG4gIC8qKiBSZWR1Y2UgdGhlIENvbGxlY3Rpb24gdG8gYSBzaW5nbGUgdmFsdWUgKi9cbiAgcmVkdWNlPFQ+KFxuICAgIGNhbGxiYWNrOiAoYWNjdW11bGF0b3I6IFQsIHZhbHVlOiBWLCBrZXk6IEspID0+IFQsXG4gICAgaW5pdGlhbFZhbHVlPzogVFxuICApOiBUIHtcbiAgICBsZXQgYWNjdW11bGF0b3I6IFQgPSBpbml0aWFsVmFsdWUgYXMgVFxuXG4gICAgZm9yIChjb25zdCBrZXkgb2YgdGhpcy5rZXlzKCkpIHtcbiAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXQoa2V5KSBhcyBWXG4gICAgICBhY2N1bXVsYXRvciA9IGNhbGxiYWNrKGFjY3VtdWxhdG9yLCB2YWx1ZSwga2V5KVxuICAgIH1cblxuICAgIHJldHVybiBhY2N1bXVsYXRvclxuICB9XG5cbiAgLyoqIENyZWF0ZSBhIENvbGxlY3Rpb24gZnJvbSBhbiBPYmplY3QgKi9cbiAgc3RhdGljIGZyb21PYmplY3Q8Vj4ob2JqZWN0OiB7IFtrZXk6IHN0cmluZ106IFYgfSk6IENvbGxlY3Rpb248c3RyaW5nLCBWPiB7XG4gICAgcmV0dXJuIG5ldyBDb2xsZWN0aW9uPHN0cmluZywgVj4oT2JqZWN0LmVudHJpZXMob2JqZWN0KSlcbiAgfVxuXG4gIC8qKiBDb252ZXJ0IENvbGxlY3Rpb24gdG8gYW4gb2JqZWN0ICovXG4gIHRvT2JqZWN0KCk6IHsgW25hbWU6IHN0cmluZ106IFYgfSB7XG4gICAgcmV0dXJuIE9iamVjdC5mcm9tRW50cmllcyh0aGlzKVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0RBQStEO0FBRS9ELGdEQUFnRCxHQUNoRCxPQUFPLE1BQU0sbUJBQXdDO0lBQ25ELHFDQUFxQyxHQUNyQyxJQUFJLEdBQU0sRUFBRSxLQUFRLEVBQVE7UUFDMUIsT0FBTyxLQUFLLENBQUMsR0FBRyxDQUFDLEtBQUs7SUFDeEI7SUFFQSxzQ0FBc0MsR0FDdEMsUUFBYTtRQUNYLE9BQU87ZUFBSSxJQUFJLENBQUMsTUFBTTtTQUFHO0lBQzNCO0lBS0EsTUFBTSxNQUFlLEVBQXVCO1FBQzFDLElBQUksT0FBTyxXQUFXLGFBQWEsT0FBTyxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksR0FBRyxLQUFLO1FBQ3BFLElBQUksU0FBUyxHQUFHLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDM0MsU0FBUyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFO1FBQzdCLE1BQU0sT0FBTyxJQUFJLENBQUMsTUFBTTtRQUN4QixPQUFPLE1BQU0sSUFBSSxDQUFDO1lBQUUsUUFBUTtRQUFPLEdBQUcsSUFBUyxLQUFLLElBQUksR0FBRyxLQUFLO0lBQ2xFO0lBS0EsS0FBSyxNQUFlLEVBQXVCO1FBQ3pDLE1BQU0sTUFBTSxJQUFJLENBQUMsS0FBSztRQUN0QixJQUFJLE9BQU8sV0FBVyxhQUFhLE9BQU8sR0FBRyxDQUFDLElBQUksTUFBTSxHQUFHLEVBQUU7UUFDN0QsSUFBSSxTQUFTLEdBQUcsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQztRQUM1QyxJQUFJLENBQUMsUUFBUSxPQUFPLEVBQUUsQ0FBQyxzQkFBc0I7O1FBQzdDLE9BQU8sSUFBSSxLQUFLLENBQUMsQ0FBQztJQUNwQjtJQUtBLE9BQU8sTUFBZSxFQUFXO1FBQy9CLElBQUksTUFBTSxJQUFJLENBQUMsS0FBSztRQUNwQixJQUFJLE9BQU8sV0FBVyxhQUNwQixPQUFPLEdBQUcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxLQUFLLE1BQU0sS0FBSyxJQUFJLE1BQU0sRUFBRTtRQUNwRCxJQUFJLElBQUksTUFBTSxLQUFLLEtBQUssQ0FBQyxRQUFRLE9BQU8sRUFBRSxDQUFDLHNCQUFzQjs7UUFDakUsTUFBTSxJQUFJLEtBQUs7UUFDZixPQUFPLE1BQU0sSUFBSSxDQUNmO1lBQUUsUUFBUTtRQUFPLEdBQ2pCLElBQVMsSUFBSSxNQUFNLENBQUMsS0FBSyxLQUFLLENBQUMsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEdBQUcsRUFBRSxDQUFDLEVBQUU7SUFFckU7SUFFQSxnREFBZ0QsR0FDaEQsS0FBSyxRQUF1QyxFQUFpQjtRQUMzRCxLQUFLLE1BQU0sT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFJO1lBQzdCLE1BQU0sUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ3ZCLElBQUksU0FBUyxPQUFPLE1BQU0sT0FBTztRQUNuQztJQUNGO0lBRUEsNkNBQTZDLEdBQzdDLE9BQU8sUUFBdUMsRUFBb0I7UUFDaEUsTUFBTSxXQUFXLElBQUk7UUFDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sTUFBUTtZQUMzQixJQUFJLFNBQVMsT0FBTyxNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQUs7UUFDOUM7UUFDQSxPQUFPO0lBQ1Q7SUFFQSx1QkFBdUIsR0FDdkIsSUFBTyxRQUFpQyxFQUFPO1FBQzdDLE1BQU0sVUFBVSxFQUFFO1FBQ2xCLEtBQUssTUFBTSxPQUFPLElBQUksQ0FBQyxJQUFJLEdBQUk7WUFDN0IsTUFBTSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDdkIsUUFBUSxJQUFJLENBQUMsU0FBUyxPQUFPO1FBQy9CO1FBQ0EsT0FBTztJQUNUO0lBRUEscUVBQXFFLEdBQ3JFLEtBQUssUUFBdUMsRUFBVztRQUNyRCxLQUFLLE1BQU0sT0FBTyxJQUFJLENBQUMsSUFBSSxHQUFJO1lBQzdCLE1BQU0sUUFBUSxJQUFJLENBQUMsR0FBRyxDQUFDO1lBQ3ZCLElBQUksU0FBUyxPQUFPLE1BQU0sT0FBTyxJQUFJO1FBQ3ZDO1FBQ0EsT0FBTyxLQUFLO0lBQ2Q7SUFFQSw4REFBOEQsR0FDOUQsTUFBTSxRQUF1QyxFQUFXO1FBQ3RELEtBQUssTUFBTSxPQUFPLElBQUksQ0FBQyxJQUFJLEdBQUk7WUFDN0IsTUFBTSxRQUFRLElBQUksQ0FBQyxHQUFHLENBQUM7WUFDdkIsSUFBSSxDQUFDLFNBQVMsT0FBTyxNQUFNLE9BQU8sS0FBSztRQUN6QztRQUNBLE9BQU8sSUFBSTtJQUNiO0lBRUEsNENBQTRDLEdBQzVDLE9BQ0UsUUFBaUQsRUFDakQsWUFBZ0IsRUFDYjtRQUNILElBQUksY0FBaUI7UUFFckIsS0FBSyxNQUFNLE9BQU8sSUFBSSxDQUFDLElBQUksR0FBSTtZQUM3QixNQUFNLFFBQVEsSUFBSSxDQUFDLEdBQUcsQ0FBQztZQUN2QixjQUFjLFNBQVMsYUFBYSxPQUFPO1FBQzdDO1FBRUEsT0FBTztJQUNUO0lBRUEsdUNBQXVDLEdBQ3ZDLE9BQU8sV0FBYyxNQUE0QixFQUF5QjtRQUN4RSxPQUFPLElBQUksV0FBc0IsT0FBTyxPQUFPLENBQUM7SUFDbEQ7SUFFQSxvQ0FBb0MsR0FDcEMsV0FBa0M7UUFDaEMsT0FBTyxPQUFPLFdBQVcsQ0FBQyxJQUFJO0lBQ2hDO0FBQ0YsQ0FBQyJ9