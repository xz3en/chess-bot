export var HttpResponseCode;
(function(HttpResponseCode) {
    HttpResponseCode[HttpResponseCode["Ok"] = 200] = "Ok";
    HttpResponseCode[HttpResponseCode["Created"] = 201] = "Created";
    HttpResponseCode[HttpResponseCode["NoContent"] = 204] = "NoContent";
    HttpResponseCode[HttpResponseCode["NotModified"] = 304] = "NotModified";
    HttpResponseCode[HttpResponseCode["BadRequest"] = 400] = "BadRequest";
    HttpResponseCode[HttpResponseCode["Unauthorized"] = 401] = "Unauthorized";
    HttpResponseCode[HttpResponseCode["Forbidden"] = 403] = "Forbidden";
    HttpResponseCode[HttpResponseCode["NotFound"] = 404] = "NotFound";
    HttpResponseCode[HttpResponseCode["MethodNotAllowed"] = 405] = "MethodNotAllowed";
    HttpResponseCode[HttpResponseCode["TooManyRequests"] = 429] = "TooManyRequests";
    HttpResponseCode[HttpResponseCode["GatewayUnavailable"] = 502] = "GatewayUnavailable";
})(HttpResponseCode || (HttpResponseCode = {}));
export const METHODS = [
    'get',
    'post',
    'patch',
    'put',
    'delete',
    'head'
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3Jlc3QvdHlwZXMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IHR5cGUgUmVxdWVzdE1ldGhvZHMgPVxuICB8ICdnZXQnXG4gIHwgJ3Bvc3QnXG4gIHwgJ3B1dCdcbiAgfCAncGF0Y2gnXG4gIHwgJ2hlYWQnXG4gIHwgJ2RlbGV0ZSdcblxuZXhwb3J0IGVudW0gSHR0cFJlc3BvbnNlQ29kZSB7XG4gIE9rID0gMjAwLFxuICBDcmVhdGVkID0gMjAxLFxuICBOb0NvbnRlbnQgPSAyMDQsXG4gIE5vdE1vZGlmaWVkID0gMzA0LFxuICBCYWRSZXF1ZXN0ID0gNDAwLFxuICBVbmF1dGhvcml6ZWQgPSA0MDEsXG4gIEZvcmJpZGRlbiA9IDQwMyxcbiAgTm90Rm91bmQgPSA0MDQsXG4gIE1ldGhvZE5vdEFsbG93ZWQgPSA0MDUsXG4gIFRvb01hbnlSZXF1ZXN0cyA9IDQyOSxcbiAgR2F0ZXdheVVuYXZhaWxhYmxlID0gNTAyXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdEhlYWRlcnMge1xuICBbbmFtZTogc3RyaW5nXTogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgRGlzY29yZEFQSUVycm9yUGF5bG9hZCB7XG4gIHVybDogc3RyaW5nXG4gIHN0YXR1czogbnVtYmVyXG4gIG1ldGhvZDogc3RyaW5nXG4gIGNvZGU/OiBudW1iZXJcbiAgbWVzc2FnZT86IHN0cmluZ1xuICBlcnJvcnM6IG9iamVjdFxuICAvLyBhbnkgZm9yIGJhY2t3YXJkIGNvbXBhdGlibGl0eVxuICByZXF1ZXN0RGF0YTogUmVjb3JkPHN0cmluZywgYW55PlxufVxuXG5leHBvcnQgY29uc3QgTUVUSE9EUyA9IFsnZ2V0JywgJ3Bvc3QnLCAncGF0Y2gnLCAncHV0JywgJ2RlbGV0ZScsICdoZWFkJ11cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQVFPO1VBQUssZ0JBQWdCO0lBQWhCLGlCQUFBLGlCQUNWLFFBQUssT0FBTDtJQURVLGlCQUFBLGlCQUVWLGFBQVUsT0FBVjtJQUZVLGlCQUFBLGlCQUdWLGVBQVksT0FBWjtJQUhVLGlCQUFBLGlCQUlWLGlCQUFjLE9BQWQ7SUFKVSxpQkFBQSxpQkFLVixnQkFBYSxPQUFiO0lBTFUsaUJBQUEsaUJBTVYsa0JBQWUsT0FBZjtJQU5VLGlCQUFBLGlCQU9WLGVBQVksT0FBWjtJQVBVLGlCQUFBLGlCQVFWLGNBQVcsT0FBWDtJQVJVLGlCQUFBLGlCQVNWLHNCQUFtQixPQUFuQjtJQVRVLGlCQUFBLGlCQVVWLHFCQUFrQixPQUFsQjtJQVZVLGlCQUFBLGlCQVdWLHdCQUFxQixPQUFyQjtHQVhVLHFCQUFBO0FBNkJaLE9BQU8sTUFBTSxVQUFVO0lBQUM7SUFBTztJQUFRO0lBQVM7SUFBTztJQUFVO0NBQU8sQ0FBQSJ9