// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/**
 * A `LimitedReader` reads from `reader` but limits the amount of data returned to just `limit` bytes.
 * Each call to `read` updates `limit` to reflect the new amount remaining.
 * `read` returns `null` when `limit` <= `0` or
 * when the underlying `reader` returns `null`.
 */ export class LimitedReader {
    constructor(reader, limit){
        this.reader = reader;
        this.limit = limit;
    }
    async read(p) {
        if (this.limit <= 0) {
            return null;
        }
        if (p.length > this.limit) {
            p = p.subarray(0, this.limit);
        }
        const n = await this.reader.read(p);
        if (n == null) {
            return null;
        }
        this.limit -= n;
        return n;
    }
    reader;
    limit;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMC4wL2lvL2xpbWl0ZWRfcmVhZGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbi8qKlxuICogQSBgTGltaXRlZFJlYWRlcmAgcmVhZHMgZnJvbSBgcmVhZGVyYCBidXQgbGltaXRzIHRoZSBhbW91bnQgb2YgZGF0YSByZXR1cm5lZCB0byBqdXN0IGBsaW1pdGAgYnl0ZXMuXG4gKiBFYWNoIGNhbGwgdG8gYHJlYWRgIHVwZGF0ZXMgYGxpbWl0YCB0byByZWZsZWN0IHRoZSBuZXcgYW1vdW50IHJlbWFpbmluZy5cbiAqIGByZWFkYCByZXR1cm5zIGBudWxsYCB3aGVuIGBsaW1pdGAgPD0gYDBgIG9yXG4gKiB3aGVuIHRoZSB1bmRlcmx5aW5nIGByZWFkZXJgIHJldHVybnMgYG51bGxgLlxuICovXG5pbXBvcnQgdHlwZSB7IFJlYWRlciB9IGZyb20gXCIuLi90eXBlcy5kLnRzXCI7XG5cbmV4cG9ydCBjbGFzcyBMaW1pdGVkUmVhZGVyIGltcGxlbWVudHMgUmVhZGVyIHtcbiAgY29uc3RydWN0b3IocHVibGljIHJlYWRlcjogUmVhZGVyLCBwdWJsaWMgbGltaXQ6IG51bWJlcikge31cblxuICBhc3luYyByZWFkKHA6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPG51bWJlciB8IG51bGw+IHtcbiAgICBpZiAodGhpcy5saW1pdCA8PSAwKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBpZiAocC5sZW5ndGggPiB0aGlzLmxpbWl0KSB7XG4gICAgICBwID0gcC5zdWJhcnJheSgwLCB0aGlzLmxpbWl0KTtcbiAgICB9XG4gICAgY29uc3QgbiA9IGF3YWl0IHRoaXMucmVhZGVyLnJlYWQocCk7XG4gICAgaWYgKG4gPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdGhpcy5saW1pdCAtPSBuO1xuICAgIHJldHVybiBuO1xuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Q0FLQyxHQUNELEFBRUEsT0FBTyxNQUFNO0lBQ1gsWUFBbUIsUUFBdUIsTUFBZTtzQkFBdEM7cUJBQXVCO0lBQWdCO0lBRTFELE1BQU0sS0FBSyxDQUFhLEVBQTBCO1FBQ2hELElBQUksSUFBSSxDQUFDLEtBQUssSUFBSSxHQUFHO1lBQ25CLE9BQU8sSUFBSTtRQUNiLENBQUM7UUFFRCxJQUFJLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDekIsSUFBSSxFQUFFLFFBQVEsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLO1FBQzlCLENBQUM7UUFDRCxNQUFNLElBQUksTUFBTSxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztRQUNqQyxJQUFJLEtBQUssSUFBSSxFQUFFO1lBQ2IsT0FBTyxJQUFJO1FBQ2IsQ0FBQztRQUVELElBQUksQ0FBQyxLQUFLLElBQUk7UUFDZCxPQUFPO0lBQ1Q7SUFqQm1CO0lBQXVCO0FBa0I1QyxDQUFDIn0=