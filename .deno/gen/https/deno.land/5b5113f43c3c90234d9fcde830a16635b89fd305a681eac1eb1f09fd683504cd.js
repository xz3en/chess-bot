import { User } from '../structures/user.ts';
import { USER } from '../types/endpoint.ts';
import { BaseManager } from './base.ts';
export class UsersManager extends BaseManager {
    constructor(client){
        super(client, 'users', User);
    }
    async fetch(id) {
        return await new Promise((resolve, reject)=>{
            this.client.rest.get(USER(id)).then((data)=>{
                this.set(id, data);
                resolve(new User(this.client, data));
            }).catch((e)=>reject(e));
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL21hbmFnZXJzL3VzZXJzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ2xpZW50IH0gZnJvbSAnLi4vY2xpZW50L21vZC50cydcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuLi9zdHJ1Y3R1cmVzL3VzZXIudHMnXG5pbXBvcnQgeyBVU0VSIH0gZnJvbSAnLi4vdHlwZXMvZW5kcG9pbnQudHMnXG5pbXBvcnQgdHlwZSB7IFVzZXJQYXlsb2FkIH0gZnJvbSAnLi4vdHlwZXMvdXNlci50cydcbmltcG9ydCB7IEJhc2VNYW5hZ2VyIH0gZnJvbSAnLi9iYXNlLnRzJ1xuXG5leHBvcnQgY2xhc3MgVXNlcnNNYW5hZ2VyIGV4dGVuZHMgQmFzZU1hbmFnZXI8VXNlclBheWxvYWQsIFVzZXI+IHtcbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQpIHtcbiAgICBzdXBlcihjbGllbnQsICd1c2VycycsIFVzZXIpXG4gIH1cblxuICBhc3luYyBmZXRjaChpZDogc3RyaW5nKTogUHJvbWlzZTxVc2VyPiB7XG4gICAgcmV0dXJuIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuY2xpZW50LnJlc3RcbiAgICAgICAgLmdldChVU0VSKGlkKSlcbiAgICAgICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgICAgICB0aGlzLnNldChpZCwgZGF0YSBhcyBVc2VyUGF5bG9hZClcbiAgICAgICAgICByZXNvbHZlKG5ldyBVc2VyKHRoaXMuY2xpZW50LCBkYXRhIGFzIFVzZXJQYXlsb2FkKSlcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKChlKSA9PiByZWplY3QoZSkpXG4gICAgfSlcbiAgfVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLFNBQVMsSUFBSSxRQUFRLHdCQUF1QjtBQUM1QyxTQUFTLElBQUksUUFBUSx1QkFBc0I7QUFFM0MsU0FBUyxXQUFXLFFBQVEsWUFBVztBQUV2QyxPQUFPLE1BQU0scUJBQXFCO0lBQ2hDLFlBQVksTUFBYyxDQUFFO1FBQzFCLEtBQUssQ0FBQyxRQUFRLFNBQVM7SUFDekI7SUFFQSxNQUFNLE1BQU0sRUFBVSxFQUFpQjtRQUNyQyxPQUFPLE1BQU0sSUFBSSxRQUFRLENBQUMsU0FBUyxTQUFXO1lBQzVDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUNiLEdBQUcsQ0FBQyxLQUFLLEtBQ1QsSUFBSSxDQUFDLENBQUMsT0FBUztnQkFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUk7Z0JBQ2IsUUFBUSxJQUFJLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNoQyxHQUNDLEtBQUssQ0FBQyxDQUFDLElBQU0sT0FBTztRQUN6QjtJQUNGO0FBQ0YsQ0FBQyJ9