import { EventEmitter } from '../../deps.ts';
export class HarmonyEventEmitter extends EventEmitter {
    constructor(){
        super(0);
    }
    /** Wait for an Event to fire with given condition. */ async waitFor(event, checkFunction = ()=>true, timeout) {
        return await new Promise((resolve)=>{
            let timeoutID;
            if (timeout !== undefined) {
                timeoutID = setTimeout(()=>{
                    this.off(event, eventFunc);
                    resolve([]);
                }, timeout);
            }
            const eventFunc = (...args)=>{
                if (checkFunction(...args)) {
                    resolve(args);
                    this.off(event, eventFunc);
                    if (timeoutID !== undefined) clearTimeout(timeoutID);
                }
            };
            this.on(event, eventFunc);
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3V0aWxzL2V2ZW50cy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICcuLi8uLi9kZXBzLnRzJ1xuXG5leHBvcnQgY2xhc3MgSGFybW9ueUV2ZW50RW1pdHRlcjxcbiAgVCBleHRlbmRzIFJlY29yZDxzdHJpbmcsIHVua25vd25bXT5cbj4gZXh0ZW5kcyBFdmVudEVtaXR0ZXI8VD4ge1xuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigwKVxuICB9XG5cbiAgLyoqIFdhaXQgZm9yIGFuIEV2ZW50IHRvIGZpcmUgd2l0aCBnaXZlbiBjb25kaXRpb24uICovXG4gIGFzeW5jIHdhaXRGb3I8SyBleHRlbmRzIGtleW9mIFQ+KFxuICAgIGV2ZW50OiBLLFxuICAgIGNoZWNrRnVuY3Rpb246ICguLi5hcmdzOiBUW0tdKSA9PiBib29sZWFuID0gKCkgPT4gdHJ1ZSxcbiAgICB0aW1lb3V0PzogbnVtYmVyXG4gICk6IFByb21pc2U8VFtLXSB8IFtdPiB7XG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICBsZXQgdGltZW91dElEOiBudW1iZXIgfCB1bmRlZmluZWRcbiAgICAgIGlmICh0aW1lb3V0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGltZW91dElEID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgdGhpcy5vZmYoZXZlbnQsIGV2ZW50RnVuYylcbiAgICAgICAgICByZXNvbHZlKFtdKVxuICAgICAgICB9LCB0aW1lb3V0KVxuICAgICAgfVxuICAgICAgY29uc3QgZXZlbnRGdW5jID0gKC4uLmFyZ3M6IFRbS10pOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKGNoZWNrRnVuY3Rpb24oLi4uYXJncykpIHtcbiAgICAgICAgICByZXNvbHZlKGFyZ3MpXG4gICAgICAgICAgdGhpcy5vZmYoZXZlbnQsIGV2ZW50RnVuYylcbiAgICAgICAgICBpZiAodGltZW91dElEICE9PSB1bmRlZmluZWQpIGNsZWFyVGltZW91dCh0aW1lb3V0SUQpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHRoaXMub24oZXZlbnQsIGV2ZW50RnVuYylcbiAgICB9KVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxZQUFZLFFBQVEsZ0JBQWU7QUFFNUMsT0FBTyxNQUFNLDRCQUVIO0lBQ1IsYUFBYztRQUNaLEtBQUssQ0FBQztJQUNSO0lBRUEsb0RBQW9ELEdBQ3BELE1BQU0sUUFDSixLQUFRLEVBQ1IsZ0JBQTRDLElBQU0sSUFBSSxFQUN0RCxPQUFnQixFQUNJO1FBQ3BCLE9BQU8sTUFBTSxJQUFJLFFBQVEsQ0FBQyxVQUFZO1lBQ3BDLElBQUk7WUFDSixJQUFJLFlBQVksV0FBVztnQkFDekIsWUFBWSxXQUFXLElBQU07b0JBQzNCLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTztvQkFDaEIsUUFBUSxFQUFFO2dCQUNaLEdBQUc7WUFDTCxDQUFDO1lBQ0QsTUFBTSxZQUFZLENBQUMsR0FBRyxPQUFxQjtnQkFDekMsSUFBSSxpQkFBaUIsT0FBTztvQkFDMUIsUUFBUTtvQkFDUixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU87b0JBQ2hCLElBQUksY0FBYyxXQUFXLGFBQWE7Z0JBQzVDLENBQUM7WUFDSDtZQUNBLElBQUksQ0FBQyxFQUFFLENBQUMsT0FBTztRQUNqQjtJQUNGO0FBQ0YsQ0FBQyJ9