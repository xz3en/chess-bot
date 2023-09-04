// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Check whether binary arrays are equal to each other using 8-bit comparisons.
 * @private
 * @param a first array to check equality
 * @param b second array to check equality
 */ function equalsNaive(a, b) {
    for(let i = 0; i < b.length; i++){
        if (a[i] !== b[i]) return false;
    }
    return true;
}
/** Check whether binary arrays are equal to each other using 32-bit comparisons.
 * @private
 * @param a first array to check equality
 * @param b second array to check equality
 */ function equals32Bit(a, b) {
    const len = a.length;
    const compressible = Math.floor(len / 4);
    const compressedA = new Uint32Array(a.buffer, 0, compressible);
    const compressedB = new Uint32Array(b.buffer, 0, compressible);
    for(let i = compressible * 4; i < len; i++){
        if (a[i] !== b[i]) return false;
    }
    for(let i1 = 0; i1 < compressedA.length; i1++){
        if (compressedA[i1] !== compressedB[i1]) return false;
    }
    return true;
}
/** Check whether binary arrays are equal to each other.
 * @param a first array to check equality
 * @param b second array to check equality
 */ export function equals(a, b) {
    if (a.length !== b.length) {
        return false;
    }
    return a.length < 1000 ? equalsNaive(a, b) : equals32Bit(a, b);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjIwMC4wL2J5dGVzL2VxdWFscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKiogQ2hlY2sgd2hldGhlciBiaW5hcnkgYXJyYXlzIGFyZSBlcXVhbCB0byBlYWNoIG90aGVyIHVzaW5nIDgtYml0IGNvbXBhcmlzb25zLlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBhIGZpcnN0IGFycmF5IHRvIGNoZWNrIGVxdWFsaXR5XG4gKiBAcGFyYW0gYiBzZWNvbmQgYXJyYXkgdG8gY2hlY2sgZXF1YWxpdHlcbiAqL1xuZnVuY3Rpb24gZXF1YWxzTmFpdmUoYTogVWludDhBcnJheSwgYjogVWludDhBcnJheSk6IGJvb2xlYW4ge1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGIubGVuZ3RoOyBpKyspIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHJldHVybiB0cnVlO1xufVxuXG4vKiogQ2hlY2sgd2hldGhlciBiaW5hcnkgYXJyYXlzIGFyZSBlcXVhbCB0byBlYWNoIG90aGVyIHVzaW5nIDMyLWJpdCBjb21wYXJpc29ucy5cbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gYSBmaXJzdCBhcnJheSB0byBjaGVjayBlcXVhbGl0eVxuICogQHBhcmFtIGIgc2Vjb25kIGFycmF5IHRvIGNoZWNrIGVxdWFsaXR5XG4gKi9cbmZ1bmN0aW9uIGVxdWFsczMyQml0KGE6IFVpbnQ4QXJyYXksIGI6IFVpbnQ4QXJyYXkpOiBib29sZWFuIHtcbiAgY29uc3QgbGVuID0gYS5sZW5ndGg7XG4gIGNvbnN0IGNvbXByZXNzaWJsZSA9IE1hdGguZmxvb3IobGVuIC8gNCk7XG4gIGNvbnN0IGNvbXByZXNzZWRBID0gbmV3IFVpbnQzMkFycmF5KGEuYnVmZmVyLCAwLCBjb21wcmVzc2libGUpO1xuICBjb25zdCBjb21wcmVzc2VkQiA9IG5ldyBVaW50MzJBcnJheShiLmJ1ZmZlciwgMCwgY29tcHJlc3NpYmxlKTtcbiAgZm9yIChsZXQgaSA9IGNvbXByZXNzaWJsZSAqIDQ7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wcmVzc2VkQS5sZW5ndGg7IGkrKykge1xuICAgIGlmIChjb21wcmVzc2VkQVtpXSAhPT0gY29tcHJlc3NlZEJbaV0pIHJldHVybiBmYWxzZTtcbiAgfVxuICByZXR1cm4gdHJ1ZTtcbn1cblxuLyoqIENoZWNrIHdoZXRoZXIgYmluYXJ5IGFycmF5cyBhcmUgZXF1YWwgdG8gZWFjaCBvdGhlci5cbiAqIEBwYXJhbSBhIGZpcnN0IGFycmF5IHRvIGNoZWNrIGVxdWFsaXR5XG4gKiBAcGFyYW0gYiBzZWNvbmQgYXJyYXkgdG8gY2hlY2sgZXF1YWxpdHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhOiBVaW50OEFycmF5LCBiOiBVaW50OEFycmF5KTogYm9vbGVhbiB7XG4gIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIGEubGVuZ3RoIDwgMTAwMCA/IGVxdWFsc05haXZlKGEsIGIpIDogZXF1YWxzMzJCaXQoYSwgYik7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7OztDQUlDLEdBQ0QsU0FBUyxZQUFZLENBQWEsRUFBRSxDQUFhLEVBQVc7SUFDMUQsSUFBSyxJQUFJLElBQUksR0FBRyxJQUFJLEVBQUUsTUFBTSxFQUFFLElBQUs7UUFDakMsSUFBSSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsT0FBTyxLQUFLO0lBQ2pDO0lBQ0EsT0FBTyxJQUFJO0FBQ2I7QUFFQTs7OztDQUlDLEdBQ0QsU0FBUyxZQUFZLENBQWEsRUFBRSxDQUFhLEVBQVc7SUFDMUQsTUFBTSxNQUFNLEVBQUUsTUFBTTtJQUNwQixNQUFNLGVBQWUsS0FBSyxLQUFLLENBQUMsTUFBTTtJQUN0QyxNQUFNLGNBQWMsSUFBSSxZQUFZLEVBQUUsTUFBTSxFQUFFLEdBQUc7SUFDakQsTUFBTSxjQUFjLElBQUksWUFBWSxFQUFFLE1BQU0sRUFBRSxHQUFHO0lBQ2pELElBQUssSUFBSSxJQUFJLGVBQWUsR0FBRyxJQUFJLEtBQUssSUFBSztRQUMzQyxJQUFJLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsRUFBRSxPQUFPLEtBQUs7SUFDakM7SUFDQSxJQUFLLElBQUksS0FBSSxHQUFHLEtBQUksWUFBWSxNQUFNLEVBQUUsS0FBSztRQUMzQyxJQUFJLFdBQVcsQ0FBQyxHQUFFLEtBQUssV0FBVyxDQUFDLEdBQUUsRUFBRSxPQUFPLEtBQUs7SUFDckQ7SUFDQSxPQUFPLElBQUk7QUFDYjtBQUVBOzs7Q0FHQyxHQUNELE9BQU8sU0FBUyxPQUFPLENBQWEsRUFBRSxDQUFhLEVBQVc7SUFDNUQsSUFBSSxFQUFFLE1BQU0sS0FBSyxFQUFFLE1BQU0sRUFBRTtRQUN6QixPQUFPLEtBQUs7SUFDZCxDQUFDO0lBQ0QsT0FBTyxFQUFFLE1BQU0sR0FBRyxPQUFPLFlBQVksR0FBRyxLQUFLLFlBQVksR0FBRyxFQUFFO0FBQ2hFLENBQUMifQ==