import { ButtonStyle, MessageComponentType } from '../types/messageComponents.ts';
import { Interaction } from './interactions.ts';
import { InteractionResponseType } from '../types/interactions.ts';
export class MessageComponents extends Array {
    row(cb) {
        const components = new MessageComponents();
        cb(components);
        this.push({
            type: MessageComponentType.ACTION_ROW,
            components: this
        });
        return this;
    }
    button(options) {
        if (options.style !== ButtonStyle.LINK && options.customID === undefined) throw new Error('customID is required for non-link buttons');
        if (options.style === ButtonStyle.LINK && options.url === undefined) throw new Error('url is required for link buttons');
        this.push({
            type: MessageComponentType.BUTTON,
            ...options
        });
        return this;
    }
    select(options) {
        this.push({
            type: MessageComponentType.SELECT,
            ...options
        });
        return this;
    }
    textInput(options) {
        this.push({
            type: MessageComponentType.TEXT_INPUT,
            ...options
        });
        return this;
    }
}
export class MessageComponentInteraction extends Interaction {
    data;
    constructor(client, data, others){
        super(client, data, others);
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        this.data = data.data;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        this.message = others.message;
    }
    get customID() {
        return this.data.custom_id;
    }
    get componentType() {
        return this.data.component_type;
    }
    get values() {
        return this.data.values ?? [];
    }
    /** Respond with DEFERRED_MESSAGE_UPDATE */ async deferredMessageUpdate() {
        await this.respond({
            type: InteractionResponseType.DEFERRED_MESSAGE_UPDATE
        });
    }
    /** Respond with UPDATE_MESSAGE */ async updateMessage(options) {
        await this.respond({
            type: InteractionResponseType.UPDATE_MESSAGE,
            ...options
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3N0cnVjdHVyZXMvbWVzc2FnZUNvbXBvbmVudHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgQnV0dG9uU3R5bGUsXG4gIEludGVyYWN0aW9uTWVzc2FnZUNvbXBvbmVudERhdGEsXG4gIE1lc3NhZ2VDb21wb25lbnREYXRhLFxuICBNZXNzYWdlQ29tcG9uZW50VHlwZSxcbiAgQnV0dG9uQ29tcG9uZW50LFxuICBTZWxlY3RDb21wb25lbnQsXG4gIFRleHRJbnB1dENvbXBvbmVudFxufSBmcm9tICcuLi90eXBlcy9tZXNzYWdlQ29tcG9uZW50cy50cydcbmltcG9ydCB7IEludGVyYWN0aW9uLCBJbnRlcmFjdGlvbk1lc3NhZ2VPcHRpb25zIH0gZnJvbSAnLi9pbnRlcmFjdGlvbnMudHMnXG5pbXBvcnQgdHlwZSB7IENsaWVudCB9IGZyb20gJy4uL2NsaWVudC9tb2QudHMnXG5pbXBvcnQge1xuICBJbnRlcmFjdGlvblBheWxvYWQsXG4gIEludGVyYWN0aW9uUmVzcG9uc2VUeXBlXG59IGZyb20gJy4uL3R5cGVzL2ludGVyYWN0aW9ucy50cydcbmltcG9ydCB0eXBlIHsgR3VpbGQgfSBmcm9tICcuL2d1aWxkLnRzJ1xuaW1wb3J0IHR5cGUgeyBHdWlsZFRleHRDaGFubmVsIH0gZnJvbSAnLi9ndWlsZFRleHRDaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBNZW1iZXIgfSBmcm9tICcuL21lbWJlci50cydcbmltcG9ydCB0eXBlIHsgVGV4dENoYW5uZWwgfSBmcm9tICcuL3RleHRDaGFubmVsLnRzJ1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4vdXNlci50cydcbmltcG9ydCB7IE1lc3NhZ2UgfSBmcm9tICcuL21lc3NhZ2UudHMnXG5cbmV4cG9ydCBjbGFzcyBNZXNzYWdlQ29tcG9uZW50cyBleHRlbmRzIEFycmF5PE1lc3NhZ2VDb21wb25lbnREYXRhPiB7XG4gIHJvdyhjYjogKGJ1aWxkZXI6IE1lc3NhZ2VDb21wb25lbnRzKSA9PiB1bmtub3duKTogdGhpcyB7XG4gICAgY29uc3QgY29tcG9uZW50cyA9IG5ldyBNZXNzYWdlQ29tcG9uZW50cygpXG4gICAgY2IoY29tcG9uZW50cylcbiAgICB0aGlzLnB1c2goe1xuICAgICAgdHlwZTogTWVzc2FnZUNvbXBvbmVudFR5cGUuQUNUSU9OX1JPVyxcbiAgICAgIGNvbXBvbmVudHM6IHRoaXMgYXMgTWVzc2FnZUNvbXBvbmVudERhdGFbXVxuICAgIH0pXG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIGJ1dHRvbihvcHRpb25zOiBPbWl0PEJ1dHRvbkNvbXBvbmVudCwgJ3R5cGUnPik6IHRoaXMge1xuICAgIGlmIChvcHRpb25zLnN0eWxlICE9PSBCdXR0b25TdHlsZS5MSU5LICYmIG9wdGlvbnMuY3VzdG9tSUQgPT09IHVuZGVmaW5lZClcbiAgICAgIHRocm93IG5ldyBFcnJvcignY3VzdG9tSUQgaXMgcmVxdWlyZWQgZm9yIG5vbi1saW5rIGJ1dHRvbnMnKVxuICAgIGlmIChvcHRpb25zLnN0eWxlID09PSBCdXR0b25TdHlsZS5MSU5LICYmIG9wdGlvbnMudXJsID09PSB1bmRlZmluZWQpXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3VybCBpcyByZXF1aXJlZCBmb3IgbGluayBidXR0b25zJylcblxuICAgIHRoaXMucHVzaCh7XG4gICAgICB0eXBlOiBNZXNzYWdlQ29tcG9uZW50VHlwZS5CVVRUT04sXG4gICAgICAuLi5vcHRpb25zXG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzZWxlY3Qob3B0aW9uczogT21pdDxTZWxlY3RDb21wb25lbnQsICd0eXBlJz4pOiB0aGlzIHtcbiAgICB0aGlzLnB1c2goe1xuICAgICAgdHlwZTogTWVzc2FnZUNvbXBvbmVudFR5cGUuU0VMRUNULFxuICAgICAgLi4ub3B0aW9uc1xuICAgIH0pXG5cbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgdGV4dElucHV0KG9wdGlvbnM6IE9taXQ8VGV4dElucHV0Q29tcG9uZW50LCAndHlwZSc+KTogdGhpcyB7XG4gICAgdGhpcy5wdXNoKHtcbiAgICAgIHR5cGU6IE1lc3NhZ2VDb21wb25lbnRUeXBlLlRFWFRfSU5QVVQsXG4gICAgICAuLi5vcHRpb25zXG4gICAgfSlcblxuICAgIHJldHVybiB0aGlzXG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIE1lc3NhZ2VDb21wb25lbnRJbnRlcmFjdGlvbiBleHRlbmRzIEludGVyYWN0aW9uIHtcbiAgZGF0YTogSW50ZXJhY3Rpb25NZXNzYWdlQ29tcG9uZW50RGF0YVxuICBkZWNsYXJlIG1lc3NhZ2U6IE1lc3NhZ2VcbiAgZGVjbGFyZSBsb2NhbGU6IHN0cmluZ1xuICBkZWNsYXJlIGd1aWxkTG9jYWxlOiBzdHJpbmdcblxuICBjb25zdHJ1Y3RvcihcbiAgICBjbGllbnQ6IENsaWVudCxcbiAgICBkYXRhOiBJbnRlcmFjdGlvblBheWxvYWQsXG4gICAgb3RoZXJzOiB7XG4gICAgICBjaGFubmVsPzogVGV4dENoYW5uZWwgfCBHdWlsZFRleHRDaGFubmVsXG4gICAgICBndWlsZD86IEd1aWxkXG4gICAgICBtZW1iZXI/OiBNZW1iZXJcbiAgICAgIHVzZXI6IFVzZXJcbiAgICAgIG1lc3NhZ2U/OiBNZXNzYWdlXG4gICAgfVxuICApIHtcbiAgICBzdXBlcihjbGllbnQsIGRhdGEsIG90aGVycylcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgdGhpcy5kYXRhID0gZGF0YS5kYXRhIGFzIEludGVyYWN0aW9uTWVzc2FnZUNvbXBvbmVudERhdGFcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgdGhpcy5tZXNzYWdlID0gb3RoZXJzLm1lc3NhZ2UhXG4gIH1cblxuICBnZXQgY3VzdG9tSUQoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhLmN1c3RvbV9pZFxuICB9XG5cbiAgZ2V0IGNvbXBvbmVudFR5cGUoKTogTWVzc2FnZUNvbXBvbmVudFR5cGUge1xuICAgIHJldHVybiB0aGlzLmRhdGEuY29tcG9uZW50X3R5cGVcbiAgfVxuXG4gIGdldCB2YWx1ZXMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmRhdGEudmFsdWVzID8/IFtdXG4gIH1cblxuICAvKiogUmVzcG9uZCB3aXRoIERFRkVSUkVEX01FU1NBR0VfVVBEQVRFICovXG4gIGFzeW5jIGRlZmVycmVkTWVzc2FnZVVwZGF0ZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBhd2FpdCB0aGlzLnJlc3BvbmQoe1xuICAgICAgdHlwZTogSW50ZXJhY3Rpb25SZXNwb25zZVR5cGUuREVGRVJSRURfTUVTU0FHRV9VUERBVEVcbiAgICB9KVxuICB9XG5cbiAgLyoqIFJlc3BvbmQgd2l0aCBVUERBVEVfTUVTU0FHRSAqL1xuICBhc3luYyB1cGRhdGVNZXNzYWdlKFxuICAgIG9wdGlvbnM6IFBhcnRpYWw8SW50ZXJhY3Rpb25NZXNzYWdlT3B0aW9ucz5cbiAgKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgYXdhaXQgdGhpcy5yZXNwb25kKHtcbiAgICAgIHR5cGU6IEludGVyYWN0aW9uUmVzcG9uc2VUeXBlLlVQREFURV9NRVNTQUdFLFxuICAgICAgLi4ub3B0aW9uc1xuICAgIH0pXG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxTQUNFLFdBQVcsRUFHWCxvQkFBb0IsUUFJZixnQ0FBK0I7QUFDdEMsU0FBUyxXQUFXLFFBQW1DLG9CQUFtQjtBQUUxRSxTQUVFLHVCQUF1QixRQUNsQiwyQkFBMEI7QUFRakMsT0FBTyxNQUFNLDBCQUEwQjtJQUNyQyxJQUFJLEVBQTJDLEVBQVE7UUFDckQsTUFBTSxhQUFhLElBQUk7UUFDdkIsR0FBRztRQUNILElBQUksQ0FBQyxJQUFJLENBQUM7WUFDUixNQUFNLHFCQUFxQixVQUFVO1lBQ3JDLFlBQVksSUFBSTtRQUNsQjtRQUNBLE9BQU8sSUFBSTtJQUNiO0lBRUEsT0FBTyxPQUFzQyxFQUFRO1FBQ25ELElBQUksUUFBUSxLQUFLLEtBQUssWUFBWSxJQUFJLElBQUksUUFBUSxRQUFRLEtBQUssV0FDN0QsTUFBTSxJQUFJLE1BQU0sNkNBQTRDO1FBQzlELElBQUksUUFBUSxLQUFLLEtBQUssWUFBWSxJQUFJLElBQUksUUFBUSxHQUFHLEtBQUssV0FDeEQsTUFBTSxJQUFJLE1BQU0sb0NBQW1DO1FBRXJELElBQUksQ0FBQyxJQUFJLENBQUM7WUFDUixNQUFNLHFCQUFxQixNQUFNO1lBQ2pDLEdBQUcsT0FBTztRQUNaO1FBRUEsT0FBTyxJQUFJO0lBQ2I7SUFFQSxPQUFPLE9BQXNDLEVBQVE7UUFDbkQsSUFBSSxDQUFDLElBQUksQ0FBQztZQUNSLE1BQU0scUJBQXFCLE1BQU07WUFDakMsR0FBRyxPQUFPO1FBQ1o7UUFFQSxPQUFPLElBQUk7SUFDYjtJQUVBLFVBQVUsT0FBeUMsRUFBUTtRQUN6RCxJQUFJLENBQUMsSUFBSSxDQUFDO1lBQ1IsTUFBTSxxQkFBcUIsVUFBVTtZQUNyQyxHQUFHLE9BQU87UUFDWjtRQUVBLE9BQU8sSUFBSTtJQUNiO0FBQ0YsQ0FBQztBQUVELE9BQU8sTUFBTSxvQ0FBb0M7SUFDL0MsS0FBcUM7SUFLckMsWUFDRSxNQUFjLEVBQ2QsSUFBd0IsRUFDeEIsTUFNQyxDQUNEO1FBQ0EsS0FBSyxDQUFDLFFBQVEsTUFBTTtRQUNwQiw0RUFBNEU7UUFDNUUsSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLElBQUk7UUFDckIsNEVBQTRFO1FBQzVFLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxPQUFPO0lBQy9CO0lBRUEsSUFBSSxXQUFtQjtRQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUztJQUM1QjtJQUVBLElBQUksZ0JBQXNDO1FBQ3hDLE9BQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjO0lBQ2pDO0lBRUEsSUFBSSxTQUFtQjtRQUNyQixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLEVBQUU7SUFDL0I7SUFFQSx5Q0FBeUMsR0FDekMsTUFBTSx3QkFBdUM7UUFDM0MsTUFBTSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBQ2pCLE1BQU0sd0JBQXdCLHVCQUF1QjtRQUN2RDtJQUNGO0lBRUEsZ0NBQWdDLEdBQ2hDLE1BQU0sY0FDSixPQUEyQyxFQUM1QjtRQUNmLE1BQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUNqQixNQUFNLHdCQUF3QixjQUFjO1lBQzVDLEdBQUcsT0FBTztRQUNaO0lBQ0Y7QUFDRixDQUFDIn0=