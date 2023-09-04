import CCommand from "../classes/customCommand.ts";
export default class Ping extends CCommand {
    name;
    description;
    constructor(client){
        super(client);
        this.client = client;
        this.name = "ping";
        this.description = "Pong!";
    }
    async execute(ctx) {
        await ctx.respond({
            content: "Pong!"
        });
    }
    client;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvY2hlc3MtYm90L2NvbW1hbmRzL3BpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGFybW9ueSB9IGZyb20gXCIuLi9kZXBzLnRzXCI7XG5pbXBvcnQgQ0NvbW1hbmQgZnJvbSBcIi4uL2NsYXNzZXMvY3VzdG9tQ29tbWFuZC50c1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQaW5nIGV4dGVuZHMgQ0NvbW1hbmQge1xuICAgIG5hbWUgPSBcInBpbmdcIjtcbiAgICBkZXNjcmlwdGlvbj86IHN0cmluZyA9IFwiUG9uZyFcIjtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjbGllbnQ6IEhhcm1vbnkuQ2xpZW50KXtcbiAgICAgICAgc3VwZXIoY2xpZW50KTtcbiAgICB9XG5cbiAgICBhc3luYyBleGVjdXRlKGN0eDogSGFybW9ueS5JbnRlcmFjdGlvbikge1xuICAgICAgICBhd2FpdCBjdHgucmVzcG9uZCh7XG4gICAgICAgICAgICBjb250ZW50OiBcIlBvbmchXCJcbiAgICAgICAgfSk7XG4gICAgfVxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLGNBQWMsOEJBQThCO0FBRW5ELGVBQWUsTUFBTSxhQUFhO0lBQzlCLEtBQWM7SUFDZCxZQUErQjtJQUUvQixZQUFtQixPQUF1QjtRQUN0QyxLQUFLLENBQUM7c0JBRFM7YUFIbkIsT0FBTzthQUNQLGNBQXVCO0lBSXZCO0lBRUEsTUFBTSxRQUFRLEdBQXdCLEVBQUU7UUFDcEMsTUFBTSxJQUFJLE9BQU8sQ0FBQztZQUNkLFNBQVM7UUFDYjtJQUNKO0lBUm1CO0FBU3ZCLENBQUMifQ==