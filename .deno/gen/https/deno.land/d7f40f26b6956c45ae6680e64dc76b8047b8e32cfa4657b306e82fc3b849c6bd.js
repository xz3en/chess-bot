import { fetchLocal, fetchRemote } from "../mod.ts";
export const fetchAuto = (path, onlyData)=>{
    try {
        new URL(path);
        return fetchRemote(path, onlyData);
    } catch (e) {
        return fetchLocal(path, onlyData);
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvZmV0Y2hiYXNlNjRAMS4wLjAvc3JjL2F1dG8udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZmV0Y2hMb2NhbCwgZmV0Y2hSZW1vdGUgfSBmcm9tIFwiLi4vbW9kLnRzXCJcblxuZXhwb3J0IGNvbnN0IGZldGNoQXV0byA9IChwYXRoOiBzdHJpbmcsIG9ubHlEYXRhPzogYm9vbGVhbikgPT4ge1xuICAgIHRyeSB7XG4gICAgICAgIG5ldyBVUkwocGF0aClcbiAgICAgICAgcmV0dXJuIGZldGNoUmVtb3RlKHBhdGgsIG9ubHlEYXRhKVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgICByZXR1cm4gZmV0Y2hMb2NhbChwYXRoLCBvbmx5RGF0YSlcbiAgICB9XG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFNBQVMsVUFBVSxFQUFFLFdBQVcsUUFBUSxZQUFXO0FBRW5ELE9BQU8sTUFBTSxZQUFZLENBQUMsTUFBYyxXQUF1QjtJQUMzRCxJQUFJO1FBQ0EsSUFBSSxJQUFJO1FBQ1IsT0FBTyxZQUFZLE1BQU07SUFDN0IsRUFBRSxPQUFNLEdBQUc7UUFDUCxPQUFPLFdBQVcsTUFBTTtJQUM1QjtBQUNKLEVBQUMifQ==