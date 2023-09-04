import { Snowflake } from '../utils/snowflake.ts';
export class Base {
    client;
    // any is for untyped JSON here too.
    constructor(client, _data){
        Object.defineProperty(this, 'client', {
            value: client,
            enumerable: false
        });
    }
}
export class SnowflakeBase extends Base {
    id;
    /** Get Snowflake Object */ get snowflake() {
        return new Snowflake(this.id);
    }
    /** Timestamp of when resource was created */ get timestamp() {
        return new Date(this.snowflake.timestamp);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvYmFzZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQgeyBTbm93Zmxha2UgfSBmcm9tICcuLi91dGlscy9zbm93Zmxha2UudHMnXG5cbmV4cG9ydCBjbGFzcyBCYXNlIHtcbiAgY2xpZW50ITogQ2xpZW50XG5cbiAgLy8gYW55IGlzIGZvciB1bnR5cGVkIEpTT04gaGVyZSB0b28uXG4gIGNvbnN0cnVjdG9yKGNsaWVudDogQ2xpZW50LCBfZGF0YT86IGFueSkge1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnY2xpZW50JywgeyB2YWx1ZTogY2xpZW50LCBlbnVtZXJhYmxlOiBmYWxzZSB9KVxuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBTbm93Zmxha2VCYXNlIGV4dGVuZHMgQmFzZSB7XG4gIGlkITogc3RyaW5nXG5cbiAgLyoqIEdldCBTbm93Zmxha2UgT2JqZWN0ICovXG4gIGdldCBzbm93Zmxha2UoKTogU25vd2ZsYWtlIHtcbiAgICByZXR1cm4gbmV3IFNub3dmbGFrZSh0aGlzLmlkKVxuICB9XG5cbiAgLyoqIFRpbWVzdGFtcCBvZiB3aGVuIHJlc291cmNlIHdhcyBjcmVhdGVkICovXG4gIGdldCB0aW1lc3RhbXAoKTogRGF0ZSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHRoaXMuc25vd2ZsYWtlLnRpbWVzdGFtcClcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsU0FBUyxRQUFRLHdCQUF1QjtBQUVqRCxPQUFPLE1BQU07SUFDWCxPQUFlO0lBRWYsb0NBQW9DO0lBQ3BDLFlBQVksTUFBYyxFQUFFLEtBQVcsQ0FBRTtRQUN2QyxPQUFPLGNBQWMsQ0FBQyxJQUFJLEVBQUUsVUFBVTtZQUFFLE9BQU87WUFBUSxZQUFZLEtBQUs7UUFBQztJQUMzRTtBQUNGLENBQUM7QUFFRCxPQUFPLE1BQU0sc0JBQXNCO0lBQ2pDLEdBQVc7SUFFWCx5QkFBeUIsR0FDekIsSUFBSSxZQUF1QjtRQUN6QixPQUFPLElBQUksVUFBVSxJQUFJLENBQUMsRUFBRTtJQUM5QjtJQUVBLDJDQUEyQyxHQUMzQyxJQUFJLFlBQWtCO1FBQ3BCLE9BQU8sSUFBSSxLQUFLLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUztJQUMxQztBQUNGLENBQUMifQ==