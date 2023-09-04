import { MessageComponentType } from '../types/messageComponents.ts';
import { Interaction } from './interactions.ts';
export class ModalSubmitInteraction extends Interaction {
    data;
    components = [];
    constructor(client, data, others){
        super(client, data, others);
        this.data = data.data;
        for (const raw of this.data.components){
            if (raw.type === MessageComponentType.ACTION_ROW) {
                const components = [];
                for (const data1 of raw.components){
                    components.push({
                        type: data1.type,
                        customID: data1.custom_id,
                        value: data1.value
                    });
                }
                this.components.push({
                    type: raw.type,
                    components
                });
            }
        }
    }
    get customID() {
        return this.data.custom_id;
    }
    getComponent(customID) {
        for (const component of this.components){
            if (component.type === MessageComponentType.ACTION_ROW) {
                for (const inner of component.components){
                    if (inner.customID === customID) {
                        return inner;
                    }
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvbW9kYWxTdWJtaXRJbnRlcmFjdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9jbGllbnQudHMnXG5pbXBvcnQgeyBJbnRlcmFjdGlvblBheWxvYWQgfSBmcm9tICcuLi90eXBlcy9pbnRlcmFjdGlvbnMudHMnXG5pbXBvcnQge1xuICBJbnRlcmFjdGlvbk1vZGFsU3VibWl0RGF0YSxcbiAgTWVzc2FnZUNvbXBvbmVudFR5cGVcbn0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZUNvbXBvbmVudHMudHMnXG5pbXBvcnQgeyBHdWlsZCB9IGZyb20gJy4vZ3VpbGQudHMnXG5pbXBvcnQgeyBHdWlsZFRleHRDaGFubmVsIH0gZnJvbSAnLi9ndWlsZFRleHRDaGFubmVsLnRzJ1xuaW1wb3J0IHsgSW50ZXJhY3Rpb24gfSBmcm9tICcuL2ludGVyYWN0aW9ucy50cydcbmltcG9ydCB7IE1lbWJlciB9IGZyb20gJy4vbWVtYmVyLnRzJ1xuaW1wb3J0IHsgVGV4dENoYW5uZWwgfSBmcm9tICcuL3RleHRDaGFubmVsLnRzJ1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdXNlci50cydcblxuZXhwb3J0IGludGVyZmFjZSBNb2RhbFN1Ym1pdENvbXBvbmVudEFjdGlvblJvdyB7XG4gIHR5cGU6IE1lc3NhZ2VDb21wb25lbnRUeXBlLkFDVElPTl9ST1dcbiAgY29tcG9uZW50czogTW9kYWxTdWJtaXRDb21wb25lbnRCYXNlW11cbn1cblxuZXhwb3J0IHR5cGUgTW9kYWxTdWJtaXRDb21wb25lbnRCYXNlID0gTW9kYWxTdWJtaXRDb21wb25lbnRUZXh0SW5wdXRcblxuZXhwb3J0IGludGVyZmFjZSBNb2RhbFN1Ym1pdENvbXBvbmVudFRleHRJbnB1dCB7XG4gIHR5cGU6IE1lc3NhZ2VDb21wb25lbnRUeXBlLlRFWFRfSU5QVVRcbiAgY3VzdG9tSUQ6IHN0cmluZ1xuICB2YWx1ZTogc3RyaW5nXG59XG5cbmV4cG9ydCBjbGFzcyBNb2RhbFN1Ym1pdEludGVyYWN0aW9uIGV4dGVuZHMgSW50ZXJhY3Rpb24ge1xuICBkYXRhOiBJbnRlcmFjdGlvbk1vZGFsU3VibWl0RGF0YVxuICBjb21wb25lbnRzOiBNb2RhbFN1Ym1pdENvbXBvbmVudEFjdGlvblJvd1tdID0gW11cblxuICBjb25zdHJ1Y3RvcihcbiAgICBjbGllbnQ6IENsaWVudCxcbiAgICBkYXRhOiBJbnRlcmFjdGlvblBheWxvYWQsXG4gICAgb3RoZXJzOiB7XG4gICAgICBjaGFubmVsPzogVGV4dENoYW5uZWwgfCBHdWlsZFRleHRDaGFubmVsXG4gICAgICBndWlsZD86IEd1aWxkXG4gICAgICBtZW1iZXI/OiBNZW1iZXJcbiAgICAgIHVzZXI6IFVzZXJcbiAgICB9XG4gICkge1xuICAgIHN1cGVyKGNsaWVudCwgZGF0YSwgb3RoZXJzKVxuICAgIHRoaXMuZGF0YSA9IGRhdGEuZGF0YSBhcyB1bmtub3duIGFzIEludGVyYWN0aW9uTW9kYWxTdWJtaXREYXRhXG5cbiAgICBmb3IgKGNvbnN0IHJhdyBvZiB0aGlzLmRhdGEuY29tcG9uZW50cykge1xuICAgICAgaWYgKHJhdy50eXBlID09PSBNZXNzYWdlQ29tcG9uZW50VHlwZS5BQ1RJT05fUk9XKSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudHM6IE1vZGFsU3VibWl0Q29tcG9uZW50QmFzZVtdID0gW11cbiAgICAgICAgZm9yIChjb25zdCBkYXRhIG9mIHJhdy5jb21wb25lbnRzKSB7XG4gICAgICAgICAgY29tcG9uZW50cy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6IGRhdGEudHlwZSxcbiAgICAgICAgICAgIGN1c3RvbUlEOiBkYXRhLmN1c3RvbV9pZCxcbiAgICAgICAgICAgIHZhbHVlOiBkYXRhLnZhbHVlXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNvbXBvbmVudHMucHVzaCh7XG4gICAgICAgICAgdHlwZTogcmF3LnR5cGUsXG4gICAgICAgICAgY29tcG9uZW50c1xuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldCBjdXN0b21JRCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLmRhdGEuY3VzdG9tX2lkXG4gIH1cblxuICBnZXRDb21wb25lbnQ8VCBleHRlbmRzIE1vZGFsU3VibWl0Q29tcG9uZW50QmFzZT4oXG4gICAgY3VzdG9tSUQ6IHN0cmluZ1xuICApOiBUIHwgdW5kZWZpbmVkIHtcbiAgICBmb3IgKGNvbnN0IGNvbXBvbmVudCBvZiB0aGlzLmNvbXBvbmVudHMpIHtcbiAgICAgIGlmIChjb21wb25lbnQudHlwZSA9PT0gTWVzc2FnZUNvbXBvbmVudFR5cGUuQUNUSU9OX1JPVykge1xuICAgICAgICBmb3IgKGNvbnN0IGlubmVyIG9mIGNvbXBvbmVudC5jb21wb25lbnRzKSB7XG4gICAgICAgICAgaWYgKGlubmVyLmN1c3RvbUlEID09PSBjdXN0b21JRCkge1xuICAgICAgICAgICAgcmV0dXJuIGlubmVyIGFzIFRcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxTQUVFLG9CQUFvQixRQUNmLGdDQUErQjtBQUd0QyxTQUFTLFdBQVcsUUFBUSxvQkFBbUI7QUFrQi9DLE9BQU8sTUFBTSwrQkFBK0I7SUFDMUMsS0FBZ0M7SUFDaEMsYUFBOEMsRUFBRSxDQUFBO0lBRWhELFlBQ0UsTUFBYyxFQUNkLElBQXdCLEVBQ3hCLE1BS0MsQ0FDRDtRQUNBLEtBQUssQ0FBQyxRQUFRLE1BQU07UUFDcEIsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLElBQUk7UUFFckIsS0FBSyxNQUFNLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUU7WUFDdEMsSUFBSSxJQUFJLElBQUksS0FBSyxxQkFBcUIsVUFBVSxFQUFFO2dCQUNoRCxNQUFNLGFBQXlDLEVBQUU7Z0JBQ2pELEtBQUssTUFBTSxTQUFRLElBQUksVUFBVSxDQUFFO29CQUNqQyxXQUFXLElBQUksQ0FBQzt3QkFDZCxNQUFNLE1BQUssSUFBSTt3QkFDZixVQUFVLE1BQUssU0FBUzt3QkFDeEIsT0FBTyxNQUFLLEtBQUs7b0JBQ25CO2dCQUNGO2dCQUNBLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDO29CQUNuQixNQUFNLElBQUksSUFBSTtvQkFDZDtnQkFDRjtZQUNGLENBQUM7UUFDSDtJQUNGO0lBRUEsSUFBSSxXQUFtQjtRQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztJQUM1QjtJQUVBLGFBQ0UsUUFBZ0IsRUFDRDtRQUNmLEtBQUssTUFBTSxhQUFhLElBQUksQ0FBQyxVQUFVLENBQUU7WUFDdkMsSUFBSSxVQUFVLElBQUksS0FBSyxxQkFBcUIsVUFBVSxFQUFFO2dCQUN0RCxLQUFLLE1BQU0sU0FBUyxVQUFVLFVBQVUsQ0FBRTtvQkFDeEMsSUFBSSxNQUFNLFFBQVEsS0FBSyxVQUFVO3dCQUMvQixPQUFPO29CQUNULENBQUM7Z0JBQ0g7WUFDRixDQUFDO1FBQ0g7SUFDRjtBQUNGLENBQUMifQ==