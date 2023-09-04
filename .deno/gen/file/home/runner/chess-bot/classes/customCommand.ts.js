export default class CCommand {
    name;
    description;
    options;
    constructor(client){
        this.client = client;
        this.name = "";
        this.options = [];
    }
    execute(_ctx) {}
    toObject() {
        return {
            name: this.name,
            description: this.description,
            options: this.options
        };
    }
    client;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvY2hlc3MtYm90L2NsYXNzZXMvY3VzdG9tQ29tbWFuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIYXJtb255IH0gZnJvbSBcIi4uL2RlcHMudHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ0NvbW1hbmQge1xuICAgIG5hbWUgPSBcIlwiO1xuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICAgIG9wdGlvbnM6IEhhcm1vbnkuU2xhc2hDb21tYW5kT3B0aW9uW10gPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjbGllbnQ6IEhhcm1vbnkuQ2xpZW50KXt9XG5cbiAgICBleGVjdXRlKF9jdHg6IEhhcm1vbnkuSW50ZXJhY3Rpb24pIHtcblxuICAgIH1cblxuICAgIHRvT2JqZWN0KCk6IEhhcm1vbnkuU2xhc2hDb21tYW5kUGFydGlhbCB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuYW1lOiB0aGlzLm5hbWUsXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgIG9wdGlvbnM6IHRoaXMub3B0aW9uc1xuICAgICAgICB9XG4gICAgfVxufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxlQUFlLE1BQU07SUFDakIsS0FBVTtJQUNWLFlBQXFCO0lBQ3JCLFFBQTJDO0lBRTNDLFlBQW1CLE9BQXVCO3NCQUF2QjthQUpuQixPQUFPO2FBRVAsVUFBd0MsRUFBRTtJQUVDO0lBRTNDLFFBQVEsSUFBeUIsRUFBRSxDQUVuQztJQUVBLFdBQXdDO1FBQ3BDLE9BQU87WUFDSCxNQUFNLElBQUksQ0FBQyxJQUFJO1lBQ2YsYUFBYSxJQUFJLENBQUMsV0FBVztZQUM3QixTQUFTLElBQUksQ0FBQyxPQUFPO1FBQ3pCO0lBQ0o7SUFabUI7QUFhdkIsQ0FBQyJ9