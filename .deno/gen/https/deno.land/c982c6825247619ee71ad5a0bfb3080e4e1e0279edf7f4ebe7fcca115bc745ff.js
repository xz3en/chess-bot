import { ReactionUsersManager } from '../managers/reactionUsers.ts';
import { Base } from './base.ts';
export class MessageReaction extends Base {
    message;
    count = 0;
    emoji;
    me = false;
    users;
    constructor(client, data, message, emoji){
        super(client, data);
        this.message = message;
        this.emoji = emoji;
        this.count = data.count;
        this.me = data.me;
        this.users = new ReactionUsersManager(client, this);
    }
    fromPayload(data) {
        this.count = data.count;
        this.me = data.me;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvbWVzc2FnZVJlYWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFJlYWN0aW9uVXNlcnNNYW5hZ2VyIH0gZnJvbSAnLi4vbWFuYWdlcnMvcmVhY3Rpb25Vc2Vycy50cydcbmltcG9ydCB0eXBlIHsgQ2xpZW50IH0gZnJvbSAnLi4vY2xpZW50L21vZC50cydcbmltcG9ydCB0eXBlIHsgUmVhY3Rpb24gfSBmcm9tICcuLi90eXBlcy9jaGFubmVsLnRzJ1xuaW1wb3J0IHsgQmFzZSB9IGZyb20gJy4vYmFzZS50cydcbmltcG9ydCB0eXBlIHsgRW1vamkgfSBmcm9tICcuL2Vtb2ppLnRzJ1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlIH0gZnJvbSAnLi9tZXNzYWdlLnRzJ1xuXG5leHBvcnQgY2xhc3MgTWVzc2FnZVJlYWN0aW9uIGV4dGVuZHMgQmFzZSB7XG4gIG1lc3NhZ2U6IE1lc3NhZ2VcbiAgY291bnQ6IG51bWJlciA9IDBcbiAgZW1vamk6IEVtb2ppXG4gIG1lOiBib29sZWFuID0gZmFsc2VcbiAgdXNlcnM6IFJlYWN0aW9uVXNlcnNNYW5hZ2VyXG5cbiAgY29uc3RydWN0b3IoY2xpZW50OiBDbGllbnQsIGRhdGE6IFJlYWN0aW9uLCBtZXNzYWdlOiBNZXNzYWdlLCBlbW9qaTogRW1vamkpIHtcbiAgICBzdXBlcihjbGllbnQsIGRhdGEpXG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZVxuICAgIHRoaXMuZW1vamkgPSBlbW9qaVxuICAgIHRoaXMuY291bnQgPSBkYXRhLmNvdW50XG4gICAgdGhpcy5tZSA9IGRhdGEubWVcbiAgICB0aGlzLnVzZXJzID0gbmV3IFJlYWN0aW9uVXNlcnNNYW5hZ2VyKGNsaWVudCwgdGhpcylcbiAgfVxuXG4gIGZyb21QYXlsb2FkKGRhdGE6IFJlYWN0aW9uKTogdm9pZCB7XG4gICAgdGhpcy5jb3VudCA9IGRhdGEuY291bnRcbiAgICB0aGlzLm1lID0gZGF0YS5tZVxuICB9XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsU0FBUyxvQkFBb0IsUUFBUSwrQkFBOEI7QUFHbkUsU0FBUyxJQUFJLFFBQVEsWUFBVztBQUloQyxPQUFPLE1BQU0sd0JBQXdCO0lBQ25DLFFBQWdCO0lBQ2hCLFFBQWdCLEVBQUM7SUFDakIsTUFBWTtJQUNaLEtBQWMsS0FBSyxDQUFBO0lBQ25CLE1BQTJCO0lBRTNCLFlBQVksTUFBYyxFQUFFLElBQWMsRUFBRSxPQUFnQixFQUFFLEtBQVksQ0FBRTtRQUMxRSxLQUFLLENBQUMsUUFBUTtRQUNkLElBQUksQ0FBQyxPQUFPLEdBQUc7UUFDZixJQUFJLENBQUMsS0FBSyxHQUFHO1FBQ2IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLEtBQUs7UUFDdkIsSUFBSSxDQUFDLEVBQUUsR0FBRyxLQUFLLEVBQUU7UUFDakIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLHFCQUFxQixRQUFRLElBQUk7SUFDcEQ7SUFFQSxZQUFZLElBQWMsRUFBUTtRQUNoQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssS0FBSztRQUN2QixJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRTtJQUNuQjtBQUNGLENBQUMifQ==