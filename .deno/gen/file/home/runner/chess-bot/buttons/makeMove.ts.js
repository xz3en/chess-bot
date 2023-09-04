import { Harmony } from "../deps.ts";
export default async function execute(ctx) {
    await ctx.showModal({
        title: "Make a move",
        customID: "makeMoveModal",
        components: [
            {
                type: Harmony.MessageComponentType.ACTION_ROW,
                components: [
                    {
                        type: Harmony.MessageComponentType.TEXT_INPUT,
                        customID: "oldPosition",
                        label: "Selected piece position",
                        style: Harmony.TextInputStyle.SHORT,
                        placeholder: "a1"
                    }
                ]
            },
            {
                type: Harmony.MessageComponentType.ACTION_ROW,
                components: [
                    {
                        type: Harmony.MessageComponentType.TEXT_INPUT,
                        customID: "newPosition",
                        label: "Move position",
                        style: Harmony.TextInputStyle.SHORT,
                        placeholder: "h8"
                    }
                ]
            }
        ]
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImZpbGU6Ly8vaG9tZS9ydW5uZXIvY2hlc3MtYm90L2J1dHRvbnMvbWFrZU1vdmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSGFybW9ueSB9IGZyb20gXCIuLi9kZXBzLnRzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGUoY3R4OiBIYXJtb255LkludGVyYWN0aW9uKSB7XG4gICAgYXdhaXQgY3R4LnNob3dNb2RhbCh7XG4gICAgICAgIHRpdGxlOiBcIk1ha2UgYSBtb3ZlXCIsXG4gICAgICAgIGN1c3RvbUlEOiBcIm1ha2VNb3ZlTW9kYWxcIixcbiAgICAgICAgY29tcG9uZW50czogW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6IEhhcm1vbnkuTWVzc2FnZUNvbXBvbmVudFR5cGUuQUNUSU9OX1JPVyxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IEhhcm1vbnkuTWVzc2FnZUNvbXBvbmVudFR5cGUuVEVYVF9JTlBVVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUlEOiBcIm9sZFBvc2l0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJTZWxlY3RlZCBwaWVjZSBwb3NpdGlvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IEhhcm1vbnkuVGV4dElucHV0U3R5bGUuU0hPUlQsXG4gICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcjogXCJhMVwiXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6IEhhcm1vbnkuTWVzc2FnZUNvbXBvbmVudFR5cGUuQUNUSU9OX1JPVyxcbiAgICAgICAgICAgICAgICBjb21wb25lbnRzOiBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IEhhcm1vbnkuTWVzc2FnZUNvbXBvbmVudFR5cGUuVEVYVF9JTlBVVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUlEOiBcIm5ld1Bvc2l0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJNb3ZlIHBvc2l0aW9uXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZTogSGFybW9ueS5UZXh0SW5wdXRTdHlsZS5TSE9SVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyOiBcImg4XCJcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgIH0pO1xufSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUFTLE9BQU8sUUFBUSxhQUFhO0FBRXJDLGVBQWUsZUFBZSxRQUFRLEdBQXdCLEVBQUU7SUFDNUQsTUFBTSxJQUFJLFNBQVMsQ0FBQztRQUNoQixPQUFPO1FBQ1AsVUFBVTtRQUNWLFlBQVk7WUFDUjtnQkFDSSxNQUFNLFFBQVEsb0JBQW9CLENBQUMsVUFBVTtnQkFDN0MsWUFBWTtvQkFDUjt3QkFDSSxNQUFNLFFBQVEsb0JBQW9CLENBQUMsVUFBVTt3QkFDN0MsVUFBVTt3QkFDVixPQUFPO3dCQUNQLE9BQU8sUUFBUSxjQUFjLENBQUMsS0FBSzt3QkFDbkMsYUFBYTtvQkFDakI7aUJBQ0g7WUFDTDtZQUNBO2dCQUNJLE1BQU0sUUFBUSxvQkFBb0IsQ0FBQyxVQUFVO2dCQUM3QyxZQUFZO29CQUNSO3dCQUNJLE1BQU0sUUFBUSxvQkFBb0IsQ0FBQyxVQUFVO3dCQUM3QyxVQUFVO3dCQUNWLE9BQU87d0JBQ1AsT0FBTyxRQUFRLGNBQWMsQ0FBQyxLQUFLO3dCQUNuQyxhQUFhO29CQUNqQjtpQkFDSDtZQUNMO1NBQ0g7SUFDTDtBQUNKLENBQUMifQ==