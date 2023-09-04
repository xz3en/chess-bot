import { decodeBase64 } from "./base64.ts";
import { init as canvasKitInit } from "./canvaskit.ts";
let canvas;
export async function init(options) {
    if (canvas) return canvas;
    canvas = await canvasKitInit(options);
    return canvas;
}
export function dataURLtoFile(dataurl) {
    let arr = dataurl.split(",");
    return decodeBase64(arr[1]);
}
export async function loadImage(url) {
    let data;
    if (url instanceof Uint8Array) {
        data = url;
    } else if (url.startsWith("http")) {
        data = await fetch(url).then((e)=>e.arrayBuffer()).then((e)=>new Uint8Array(e));
    } else if (url.startsWith("data")) {
        data = dataURLtoFile(url);
    } else {
        data = await Deno.readFile(url);
    }
    const img = canvas.MakeImageFromEncoded(data);
    if (!img) throw new Error("Invalid image data");
    return img;
}
export const createCanvas = (width, height)=>{
    return canvas.MakeCanvas(width, height);
};
export * from "./types.ts";
export * from "./base64.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvY2FudmFzQHYxLjQuMS9zcmMvY2FudmFzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlY29kZUJhc2U2NCB9IGZyb20gXCIuL2Jhc2U2NC50c1wiO1xuaW1wb3J0IHsgaW5pdCBhcyBjYW52YXNLaXRJbml0IH0gZnJvbSBcIi4vY2FudmFza2l0LnRzXCI7XG5pbXBvcnQgeyBDYW52YXNLaXQgfSBmcm9tIFwiLi90eXBlcy50c1wiO1xuXG5sZXQgY2FudmFzOiBDYW52YXNLaXQ7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0KG9wdGlvbnM/OiBhbnkpOiBQcm9taXNlPENhbnZhc0tpdD4ge1xuICBpZiAoY2FudmFzKSByZXR1cm4gY2FudmFzO1xuICBjYW52YXMgPSBhd2FpdCBjYW52YXNLaXRJbml0KG9wdGlvbnMpO1xuICByZXR1cm4gY2FudmFzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZGF0YVVSTHRvRmlsZShkYXRhdXJsOiBzdHJpbmcpIHtcbiAgbGV0IGFycjogc3RyaW5nW10gPSBkYXRhdXJsLnNwbGl0KFwiLFwiKTtcbiAgcmV0dXJuIGRlY29kZUJhc2U2NChhcnJbMV0pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZEltYWdlKHVybDogc3RyaW5nIHwgVWludDhBcnJheSkge1xuICBsZXQgZGF0YTtcblxuICBpZiAodXJsIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgIGRhdGEgPSB1cmw7XG4gIH0gZWxzZSBpZiAodXJsLnN0YXJ0c1dpdGgoXCJodHRwXCIpKSB7XG4gICAgZGF0YSA9IGF3YWl0IGZldGNoKHVybCkudGhlbigoZSkgPT4gZS5hcnJheUJ1ZmZlcigpKS50aGVuKChlKSA9PlxuICAgICAgbmV3IFVpbnQ4QXJyYXkoZSlcbiAgICApO1xuICB9IGVsc2UgaWYgKHVybC5zdGFydHNXaXRoKFwiZGF0YVwiKSkge1xuICAgIGRhdGEgPSBkYXRhVVJMdG9GaWxlKHVybCk7XG4gIH0gZWxzZSB7XG4gICAgZGF0YSA9IGF3YWl0IERlbm8ucmVhZEZpbGUodXJsKTtcbiAgfVxuXG4gIGNvbnN0IGltZyA9IGNhbnZhcy5NYWtlSW1hZ2VGcm9tRW5jb2RlZChkYXRhKTtcbiAgaWYgKCFpbWcpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW1hZ2UgZGF0YVwiKTtcblxuICByZXR1cm4gaW1nO1xufVxuXG5leHBvcnQgY29uc3QgY3JlYXRlQ2FudmFzID0gKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSA9PiB7XG4gIHJldHVybiBjYW52YXMuTWFrZUNhbnZhcyh3aWR0aCwgaGVpZ2h0KTtcbn07XG5cbmV4cG9ydCAqIGZyb20gXCIuL3R5cGVzLnRzXCI7XG5leHBvcnQgKiBmcm9tIFwiLi9iYXNlNjQudHNcIjtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLFlBQVksUUFBUSxjQUFjO0FBQzNDLFNBQVMsUUFBUSxhQUFhLFFBQVEsaUJBQWlCO0FBR3ZELElBQUk7QUFFSixPQUFPLGVBQWUsS0FBSyxPQUFhLEVBQXNCO0lBQzVELElBQUksUUFBUSxPQUFPO0lBQ25CLFNBQVMsTUFBTSxjQUFjO0lBQzdCLE9BQU87QUFDVCxDQUFDO0FBRUQsT0FBTyxTQUFTLGNBQWMsT0FBZSxFQUFFO0lBQzdDLElBQUksTUFBZ0IsUUFBUSxLQUFLLENBQUM7SUFDbEMsT0FBTyxhQUFhLEdBQUcsQ0FBQyxFQUFFO0FBQzVCLENBQUM7QUFFRCxPQUFPLGVBQWUsVUFBVSxHQUF3QixFQUFFO0lBQ3hELElBQUk7SUFFSixJQUFJLGVBQWUsWUFBWTtRQUM3QixPQUFPO0lBQ1QsT0FBTyxJQUFJLElBQUksVUFBVSxDQUFDLFNBQVM7UUFDakMsT0FBTyxNQUFNLE1BQU0sS0FBSyxJQUFJLENBQUMsQ0FBQyxJQUFNLEVBQUUsV0FBVyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQ3pELElBQUksV0FBVztJQUVuQixPQUFPLElBQUksSUFBSSxVQUFVLENBQUMsU0FBUztRQUNqQyxPQUFPLGNBQWM7SUFDdkIsT0FBTztRQUNMLE9BQU8sTUFBTSxLQUFLLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRUQsTUFBTSxNQUFNLE9BQU8sb0JBQW9CLENBQUM7SUFDeEMsSUFBSSxDQUFDLEtBQUssTUFBTSxJQUFJLE1BQU0sc0JBQXNCO0lBRWhELE9BQU87QUFDVCxDQUFDO0FBRUQsT0FBTyxNQUFNLGVBQWUsQ0FBQyxPQUFlLFNBQW1CO0lBQzdELE9BQU8sT0FBTyxVQUFVLENBQUMsT0FBTztBQUNsQyxFQUFFO0FBRUYsY0FBYyxhQUFhO0FBQzNCLGNBQWMsY0FBYyJ9