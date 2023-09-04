/** Represents a row containing other components. All components must go inside Action Rows. */ export function ActionRow(props, children) {
    return {
        type: 'ActionRow',
        props,
        children
    };
}
/** A button component */ export function Button(props, _children) {
    return {
        type: 'Button',
        props,
        children: undefined
    };
}
/** Select (drop down) component. Allows user to choose one or more options */ export function Select(props, children) {
    return {
        type: 'Select',
        props,
        children: children[0] // FIXME: Why is it double nested?
    };
}
/** An option or choice for Select Component */ export function Option(props, _children) {
    return {
        type: 'Option',
        props,
        children: undefined
    };
}
/** TSX compiles down to BotUI.createElement */ // eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class BotUI {
    static createElement(component, props, ...children) {
        if (component === undefined) return undefined;
        const element = component(props, children);
        return element;
    }
}
function resolveStyle(name) {
    switch(name){
        case 'primary':
        case 'blurple':
            return 1;
        case 'secondary':
        case 'grey':
            return 2;
        case 'success':
        case 'green':
            return 3;
        case 'danger':
        case 'red':
            return 4;
        case 'link':
            return 5;
        default:
            throw new Error(`Invalid style: ${name}`);
    }
}
/** Fragment is like the root component which converts TSX elements into Component Payload */ export function fragment(props, components) {
    if (props !== null) throw new Error('Root fragment does not accept props');
    const res = [];
    components.flat(2).forEach((component)=>{
        if (typeof component !== 'object' || component === null) return;
        if (component.type !== 'ActionRow') {
            throw new Error('Only ActionRow components may appear at top level');
        }
        const row = {
            type: 1,
            components: []
        };
        component.children?.flat(2).forEach((el)=>{
            if (el.type !== 'Button' && el.type !== 'Select') {
                throw new Error('Invalid second level component: ' + el.type);
            }
            row.components?.push({
                type: el.type === 'Button' ? 2 : 3,
                custom_id: el.props.id,
                label: el.props.label,
                style: el.props.style !== undefined ? resolveStyle(el.props.style) : undefined,
                url: el.props.url,
                emoji: el.props.emoji,
                min_values: el.props.minValues,
                max_values: el.props.maxValues,
                placeholder: el.props.placeholder,
                disabled: el.props.disabled,
                options: Array.isArray(el.children) ? el.children.map((e)=>{
                    return e.props;
                }) : []
            });
        });
        if (row.components !== undefined && row.components.length > 5) {
            throw new Error('An Action Row may only have 5 components at max');
        }
        res.push(row);
    });
    if (res.length > 5) {
        throw new Error(`Max number of components exceeded ${res.length}`);
    }
    return res;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2ludGVyYWN0aW9ucy90c3hDb21wb25lbnRzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gIE1lc3NhZ2VDb21wb25lbnRFbW9qaSxcbiAgTWVzc2FnZUNvbXBvbmVudFBheWxvYWRcbn0gZnJvbSAnLi4vdHlwZXMvbWVzc2FnZUNvbXBvbmVudHMudHMnXG5cbmV4cG9ydCB0eXBlIEVsZW1lbnRUeXBlID0gJ1Jvb3QnIHwgJ0FjdGlvblJvdycgfCAnQnV0dG9uJyB8ICdTZWxlY3QnIHwgJ09wdGlvbidcbmV4cG9ydCB0eXBlIEJ1dHRvblN0eWxlTmFtZSA9XG4gIHwgJ3ByaW1hcnknXG4gIHwgJ3NlY29uZGFyeSdcbiAgfCAnc3VjY2VzcydcbiAgfCAnZGFuZ2VyJ1xuICB8ICdsaW5rJ1xuICB8ICdibHVycGxlJ1xuICB8ICdncmV5J1xuICB8ICdyZWQnXG4gIHwgJ2dyZWVuJ1xuXG4vLyBOb3RlOiBCZWxpZXZlIG1lIGBhbnlgcyBpbiBoZXJlIGFyZSBmb3IgZ29vZC5cblxuZXhwb3J0IGludGVyZmFjZSBFbGVtZW50PFQgPSBhbnk+IHtcbiAgdHlwZTogRWxlbWVudFR5cGVcbiAgcHJvcHM6IFRcbiAgY2hpbGRyZW4/OiBFbGVtZW50W11cbn1cblxuZXhwb3J0IHR5cGUgQ29tcG9uZW50PFQgPSBhbnk+ID0gKHByb3BzPzogVCwgY2hpbGRyZW4/OiBhbnkpID0+IEVsZW1lbnQ8VD5cblxuLyoqIFJlcHJlc2VudHMgYSByb3cgY29udGFpbmluZyBvdGhlciBjb21wb25lbnRzLiBBbGwgY29tcG9uZW50cyBtdXN0IGdvIGluc2lkZSBBY3Rpb24gUm93cy4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBY3Rpb25Sb3cocHJvcHM6IHt9LCBjaGlsZHJlbjogRWxlbWVudFtdKTogRWxlbWVudDx7fT4ge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdBY3Rpb25Sb3cnLFxuICAgIHByb3BzLFxuICAgIGNoaWxkcmVuXG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBCdXR0b25Qcm9wcyB7XG4gIGlkPzogc3RyaW5nXG4gIGxhYmVsPzogc3RyaW5nXG4gIHN0eWxlOiBCdXR0b25TdHlsZU5hbWVcbiAgdXJsPzogc3RyaW5nXG4gIGRpc2FibGVkPzogYm9vbGVhblxuICBlbW9qaT86IE1lc3NhZ2VDb21wb25lbnRFbW9qaVxufVxuXG4vKiogQSBidXR0b24gY29tcG9uZW50ICovXG5leHBvcnQgZnVuY3Rpb24gQnV0dG9uKFxuICBwcm9wczogQnV0dG9uUHJvcHMsXG4gIF9jaGlsZHJlbjogdW5kZWZpbmVkXG4pOiBFbGVtZW50PEJ1dHRvblByb3BzPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1dHRvbicsXG4gICAgcHJvcHMsXG4gICAgY2hpbGRyZW46IHVuZGVmaW5lZFxuICB9XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgU2VsZWN0UHJvcHMge1xuICBpZDogc3RyaW5nXG4gIHBsYWNlaG9sZGVyPzogc3RyaW5nXG4gIG1pblZhbHVlcz86IG51bWJlclxuICBtYXhWYWx1ZXM/OiBudW1iZXJcbn1cblxuLyoqIFNlbGVjdCAoZHJvcCBkb3duKSBjb21wb25lbnQuIEFsbG93cyB1c2VyIHRvIGNob29zZSBvbmUgb3IgbW9yZSBvcHRpb25zICovXG5leHBvcnQgZnVuY3Rpb24gU2VsZWN0KFxuICBwcm9wczogU2VsZWN0UHJvcHMsXG4gIGNoaWxkcmVuOiBBcnJheTxBcnJheTxFbGVtZW50PE9wdGlvblByb3BzPj4+XG4pOiBFbGVtZW50PFNlbGVjdFByb3BzPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ1NlbGVjdCcsXG4gICAgcHJvcHMsXG4gICAgY2hpbGRyZW46IGNoaWxkcmVuWzBdIC8vIEZJWE1FOiBXaHkgaXMgaXQgZG91YmxlIG5lc3RlZD9cbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvblByb3BzIHtcbiAgbGFiZWw6IHN0cmluZ1xuICB2YWx1ZTogc3RyaW5nXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nXG4gIGVtb2ppPzogTWVzc2FnZUNvbXBvbmVudEVtb2ppXG4gIGRlZmF1bHQ/OiBib29sZWFuXG59XG5cbi8qKiBBbiBvcHRpb24gb3IgY2hvaWNlIGZvciBTZWxlY3QgQ29tcG9uZW50ICovXG5leHBvcnQgZnVuY3Rpb24gT3B0aW9uKFxuICBwcm9wczogT3B0aW9uUHJvcHMsXG4gIF9jaGlsZHJlbjogdW5kZWZpbmVkXG4pOiBFbGVtZW50PE9wdGlvblByb3BzPiB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ09wdGlvbicsXG4gICAgcHJvcHMsXG4gICAgY2hpbGRyZW46IHVuZGVmaW5lZFxuICB9XG59XG5cbi8qKiBUU1ggY29tcGlsZXMgZG93biB0byBCb3RVSS5jcmVhdGVFbGVtZW50ICovXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4dHJhbmVvdXMtY2xhc3NcbmV4cG9ydCBjbGFzcyBCb3RVSSB7XG4gIHN0YXRpYyBjcmVhdGVFbGVtZW50PFQgPSBhbnk+KFxuICAgIGNvbXBvbmVudDogQ29tcG9uZW50PFQ+LFxuICAgIHByb3BzOiBULFxuICAgIC4uLmNoaWxkcmVuOiBBcnJheTxFbGVtZW50PEJ1dHRvblByb3BzIHwgU2VsZWN0UHJvcHM+PlxuICApOiBFbGVtZW50PFQ+IHtcbiAgICBpZiAoY29tcG9uZW50ID09PSB1bmRlZmluZWQpIHJldHVybiB1bmRlZmluZWQgYXMgYW55XG4gICAgY29uc3QgZWxlbWVudCA9IGNvbXBvbmVudChwcm9wcywgY2hpbGRyZW4pXG4gICAgcmV0dXJuIGVsZW1lbnRcbiAgfVxufVxuXG5mdW5jdGlvbiByZXNvbHZlU3R5bGUobmFtZTogQnV0dG9uU3R5bGVOYW1lKTogbnVtYmVyIHtcbiAgc3dpdGNoIChuYW1lKSB7XG4gICAgY2FzZSAncHJpbWFyeSc6XG4gICAgY2FzZSAnYmx1cnBsZSc6XG4gICAgICByZXR1cm4gMVxuICAgIGNhc2UgJ3NlY29uZGFyeSc6XG4gICAgY2FzZSAnZ3JleSc6XG4gICAgICByZXR1cm4gMlxuICAgIGNhc2UgJ3N1Y2Nlc3MnOlxuICAgIGNhc2UgJ2dyZWVuJzpcbiAgICAgIHJldHVybiAzXG4gICAgY2FzZSAnZGFuZ2VyJzpcbiAgICBjYXNlICdyZWQnOlxuICAgICAgcmV0dXJuIDRcbiAgICBjYXNlICdsaW5rJzpcbiAgICAgIHJldHVybiA1XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBzdHlsZTogJHtuYW1lfWApXG4gIH1cbn1cblxuLyoqIEZyYWdtZW50IGlzIGxpa2UgdGhlIHJvb3QgY29tcG9uZW50IHdoaWNoIGNvbnZlcnRzIFRTWCBlbGVtZW50cyBpbnRvIENvbXBvbmVudCBQYXlsb2FkICovXG5leHBvcnQgZnVuY3Rpb24gZnJhZ21lbnQoXG4gIHByb3BzOiBudWxsLFxuICBjb21wb25lbnRzOiBFbGVtZW50W11cbik6IE1lc3NhZ2VDb21wb25lbnRQYXlsb2FkW10ge1xuICBpZiAocHJvcHMgIT09IG51bGwpIHRocm93IG5ldyBFcnJvcignUm9vdCBmcmFnbWVudCBkb2VzIG5vdCBhY2NlcHQgcHJvcHMnKVxuICBjb25zdCByZXM6IE1lc3NhZ2VDb21wb25lbnRQYXlsb2FkW10gPSBbXVxuXG4gIGNvbXBvbmVudHMuZmxhdCgyKS5mb3JFYWNoKChjb21wb25lbnQpID0+IHtcbiAgICBpZiAodHlwZW9mIGNvbXBvbmVudCAhPT0gJ29iamVjdCcgfHwgY29tcG9uZW50ID09PSBudWxsKSByZXR1cm5cbiAgICBpZiAoY29tcG9uZW50LnR5cGUgIT09ICdBY3Rpb25Sb3cnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ09ubHkgQWN0aW9uUm93IGNvbXBvbmVudHMgbWF5IGFwcGVhciBhdCB0b3AgbGV2ZWwnKVxuICAgIH1cbiAgICBjb25zdCByb3c6IE1lc3NhZ2VDb21wb25lbnRQYXlsb2FkID0ge1xuICAgICAgdHlwZTogMSxcbiAgICAgIGNvbXBvbmVudHM6IFtdXG4gICAgfVxuXG4gICAgY29tcG9uZW50LmNoaWxkcmVuXG4gICAgICA/LmZsYXQoMilcbiAgICAgIC5mb3JFYWNoKChlbDogRWxlbWVudDxCdXR0b25Qcm9wcyAmIFNlbGVjdFByb3BzPikgPT4ge1xuICAgICAgICBpZiAoZWwudHlwZSAhPT0gJ0J1dHRvbicgJiYgZWwudHlwZSAhPT0gJ1NlbGVjdCcpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc2Vjb25kIGxldmVsIGNvbXBvbmVudDogJyArIGVsLnR5cGUpXG4gICAgICAgIH1cblxuICAgICAgICByb3cuY29tcG9uZW50cz8ucHVzaCh7XG4gICAgICAgICAgdHlwZTogZWwudHlwZSA9PT0gJ0J1dHRvbicgPyAyIDogMyxcbiAgICAgICAgICBjdXN0b21faWQ6IGVsLnByb3BzLmlkLFxuICAgICAgICAgIGxhYmVsOiBlbC5wcm9wcy5sYWJlbCxcbiAgICAgICAgICBzdHlsZTpcbiAgICAgICAgICAgIGVsLnByb3BzLnN0eWxlICE9PSB1bmRlZmluZWRcbiAgICAgICAgICAgICAgPyByZXNvbHZlU3R5bGUoZWwucHJvcHMuc3R5bGUpXG4gICAgICAgICAgICAgIDogdW5kZWZpbmVkLFxuICAgICAgICAgIHVybDogZWwucHJvcHMudXJsLFxuICAgICAgICAgIGVtb2ppOiBlbC5wcm9wcy5lbW9qaSxcbiAgICAgICAgICBtaW5fdmFsdWVzOiBlbC5wcm9wcy5taW5WYWx1ZXMsXG4gICAgICAgICAgbWF4X3ZhbHVlczogZWwucHJvcHMubWF4VmFsdWVzLFxuICAgICAgICAgIHBsYWNlaG9sZGVyOiBlbC5wcm9wcy5wbGFjZWhvbGRlcixcbiAgICAgICAgICBkaXNhYmxlZDogZWwucHJvcHMuZGlzYWJsZWQsXG4gICAgICAgICAgb3B0aW9uczogQXJyYXkuaXNBcnJheShlbC5jaGlsZHJlbilcbiAgICAgICAgICAgID8gZWwuY2hpbGRyZW4ubWFwKChlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGUucHJvcHNcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDogW11cbiAgICAgICAgfSlcbiAgICAgIH0pXG5cbiAgICBpZiAocm93LmNvbXBvbmVudHMgIT09IHVuZGVmaW5lZCAmJiByb3cuY29tcG9uZW50cy5sZW5ndGggPiA1KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0FuIEFjdGlvbiBSb3cgbWF5IG9ubHkgaGF2ZSA1IGNvbXBvbmVudHMgYXQgbWF4JylcbiAgICB9XG5cbiAgICByZXMucHVzaChyb3cpXG4gIH0pXG5cbiAgaWYgKHJlcy5sZW5ndGggPiA1KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBNYXggbnVtYmVyIG9mIGNvbXBvbmVudHMgZXhjZWVkZWQgJHtyZXMubGVuZ3RofWApXG4gIH1cblxuICByZXR1cm4gcmVzXG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBMkJBLDZGQUE2RixHQUM3RixPQUFPLFNBQVMsVUFBVSxLQUFTLEVBQUUsUUFBbUIsRUFBZTtJQUNyRSxPQUFPO1FBQ0wsTUFBTTtRQUNOO1FBQ0E7SUFDRjtBQUNGLENBQUM7QUFXRCx1QkFBdUIsR0FDdkIsT0FBTyxTQUFTLE9BQ2QsS0FBa0IsRUFDbEIsU0FBb0IsRUFDRTtJQUN0QixPQUFPO1FBQ0wsTUFBTTtRQUNOO1FBQ0EsVUFBVTtJQUNaO0FBQ0YsQ0FBQztBQVNELDRFQUE0RSxHQUM1RSxPQUFPLFNBQVMsT0FDZCxLQUFrQixFQUNsQixRQUE0QyxFQUN0QjtJQUN0QixPQUFPO1FBQ0wsTUFBTTtRQUNOO1FBQ0EsVUFBVSxRQUFRLENBQUMsRUFBRSxDQUFDLGtDQUFrQztJQUMxRDtBQUNGLENBQUM7QUFVRCw2Q0FBNkMsR0FDN0MsT0FBTyxTQUFTLE9BQ2QsS0FBa0IsRUFDbEIsU0FBb0IsRUFDRTtJQUN0QixPQUFPO1FBQ0wsTUFBTTtRQUNOO1FBQ0EsVUFBVTtJQUNaO0FBQ0YsQ0FBQztBQUVELDZDQUE2QyxHQUM3QyxrRUFBa0U7QUFDbEUsT0FBTyxNQUFNO0lBQ1gsT0FBTyxjQUNMLFNBQXVCLEVB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