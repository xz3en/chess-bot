export default class CCommand {
    name = "";
    description;
    options = [];
    execute(_ctx) {}
    toObject() {
        return {
            name: this.name,
            description: this.description,
            options: this.options
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvY2hlc3MtYm90L2NsYXNzZXMvY3VzdG9tQ29tbWFuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIYXJtb255IH0gZnJvbSBcIi4uL2RlcHMudHNcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ0NvbW1hbmQge1xuICAgIG5hbWUgPSBcIlwiO1xuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nO1xuICAgIG9wdGlvbnM6IEhhcm1vbnkuU2xhc2hDb21tYW5kT3B0aW9uW10gPSBbXTtcblxuICAgIGV4ZWN1dGUoX2N0eDogSGFybW9ueS5JbnRlcmFjdGlvbikge1xuXG4gICAgfVxuXG4gICAgdG9PYmplY3QoKTogSGFybW9ueS5TbGFzaENvbW1hbmRQYXJ0aWFsIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgb3B0aW9uczogdGhpcy5vcHRpb25zXG4gICAgICAgIH1cbiAgICB9XG59Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLGVBQWUsTUFBTTtJQUNqQixPQUFPLEdBQUc7SUFDVixZQUFxQjtJQUNyQixVQUF3QyxFQUFFLENBQUM7SUFFM0MsUUFBUSxJQUF5QixFQUFFLENBRW5DO0lBRUEsV0FBd0M7UUFDcEMsT0FBTztZQUNILE1BQU0sSUFBSSxDQUFDLElBQUk7WUFDZixhQUFhLElBQUksQ0FBQyxXQUFXO1lBQzdCLFNBQVMsSUFBSSxDQUFDLE9BQU87UUFDekI7SUFDSjtBQUNKLENBQUMifQ==