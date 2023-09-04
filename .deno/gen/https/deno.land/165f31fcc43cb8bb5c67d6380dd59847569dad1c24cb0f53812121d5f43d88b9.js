export var InteractionType;
(function(InteractionType) {
    InteractionType[InteractionType[/** Ping sent by the API (HTTP-only) */ "PING"] = 1] = "PING";
    InteractionType[InteractionType[/** Slash Command Interaction */ "APPLICATION_COMMAND"] = 2] = "APPLICATION_COMMAND";
    InteractionType[InteractionType[/** Message Component Interaction */ "MESSAGE_COMPONENT"] = 3] = "MESSAGE_COMPONENT";
    InteractionType[InteractionType[/** Application Command Option Autocomplete Interaction */ "AUTOCOMPLETE"] = 4] = "AUTOCOMPLETE";
    InteractionType[InteractionType[/** When user submits a Modal */ "MODAL_SUBMIT"] = 5] = "MODAL_SUBMIT";
})(InteractionType || (InteractionType = {}));
export var InteractionResponseType;
(function(InteractionResponseType) {
    InteractionResponseType[InteractionResponseType[/** [HTTP Only] Just ack a ping. */ "PONG"] = 1] = "PONG";
    InteractionResponseType[InteractionResponseType[/** Send a channel message as response. */ "CHANNEL_MESSAGE_WITH_SOURCE"] = 4] = "CHANNEL_MESSAGE_WITH_SOURCE";
    InteractionResponseType[InteractionResponseType[/** Let the user know bot is processing ("thinking") and you can edit the response later */ "DEFERRED_CHANNEL_MESSAGE"] = 5] = "DEFERRED_CHANNEL_MESSAGE";
    InteractionResponseType[InteractionResponseType[/** Components: It will acknowledge the interaction and update the button to a loading state, and then you can PATCH the message later. */ "DEFERRED_MESSAGE_UPDATE"] = 6] = "DEFERRED_MESSAGE_UPDATE";
    InteractionResponseType[InteractionResponseType[/** Components: Sent in response to a button interaction to immediately update the message to which the button was attached */ "UPDATE_MESSAGE"] = 7] = "UPDATE_MESSAGE";
    InteractionResponseType[InteractionResponseType[/** Respond with auto-completions for Autocomplete Interactions */ "APPLICATION_COMMAND_AUTOCOMPLETE_RESULT"] = 8] = "APPLICATION_COMMAND_AUTOCOMPLETE_RESULT";
    InteractionResponseType[InteractionResponseType[/** Respond with a Modal (Form) */ "MODAL"] = 9] = "MODAL";
})(InteractionResponseType || (InteractionResponseType = {}));
export var InteractionResponseFlags;
(function(InteractionResponseFlags) {
    InteractionResponseFlags[InteractionResponseFlags[/** A Message which is only visible to Interaction User. */ "EPHEMERAL"] = 64] = "EPHEMERAL";
})(InteractionResponseFlags || (InteractionResponseFlags = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3R5cGVzL2ludGVyYWN0aW9ucy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICBBbGxvd2VkTWVudGlvbnNQYXlsb2FkLFxuICBFbWJlZFBheWxvYWQsXG4gIE1lc3NhZ2VQYXlsb2FkXG59IGZyb20gJy4vY2hhbm5lbC50cydcbmltcG9ydCB0eXBlIHsgTWVtYmVyUGF5bG9hZCB9IGZyb20gJy4vZ3VpbGQudHMnXG5pbXBvcnQge1xuICBJbnRlcmFjdGlvbk1lc3NhZ2VDb21wb25lbnREYXRhLFxuICBNZXNzYWdlQ29tcG9uZW50UGF5bG9hZFxufSBmcm9tICcuL21lc3NhZ2VDb21wb25lbnRzLnRzJ1xuaW1wb3J0IHR5cGUge1xuICBBcHBsaWNhdGlvbkNvbW1hbmRDaG9pY2UsXG4gIEludGVyYWN0aW9uQXBwbGljYXRpb25Db21tYW5kRGF0YVxufSBmcm9tICcuL2FwcGxpY2F0aW9uQ29tbWFuZC50cydcbmltcG9ydCB0eXBlIHsgVXNlclBheWxvYWQgfSBmcm9tICcuL3VzZXIudHMnXG5pbXBvcnQgeyBNZXNzYWdlQXR0YWNobWVudCB9IGZyb20gJy4uL3N0cnVjdHVyZXMvbWVzc2FnZS50cydcblxuZXhwb3J0IGVudW0gSW50ZXJhY3Rpb25UeXBlIHtcbiAgLyoqIFBpbmcgc2VudCBieSB0aGUgQVBJIChIVFRQLW9ubHkpICovXG4gIFBJTkcgPSAxLFxuICAvKiogU2xhc2ggQ29tbWFuZCBJbnRlcmFjdGlvbiAqL1xuICBBUFBMSUNBVElPTl9DT01NQU5EID0gMixcbiAgLyoqIE1lc3NhZ2UgQ29tcG9uZW50IEludGVyYWN0aW9uICovXG4gIE1FU1NBR0VfQ09NUE9ORU5UID0gMyxcbiAgLyoqIEFwcGxpY2F0aW9uIENvbW1hbmQgT3B0aW9uIEF1dG9jb21wbGV0ZSBJbnRlcmFjdGlvbiAqL1xuICBBVVRPQ09NUExFVEUgPSA0LFxuICAvKiogV2hlbiB1c2VyIHN1Ym1pdHMgYSBNb2RhbCAqL1xuICBNT0RBTF9TVUJNSVQgPSA1XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJhY3Rpb25NZW1iZXJQYXlsb2FkIGV4dGVuZHMgTWVtYmVyUGF5bG9hZCB7XG4gIC8qKiBQZXJtaXNzaW9ucyBvZiB0aGUgTWVtYmVyIHdobyBpbml0aWF0ZWQgSW50ZXJhY3Rpb24gKEd1aWxkLW9ubHkpICovXG4gIHBlcm1pc3Npb25zOiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbnRlcmFjdGlvblBheWxvYWQge1xuICAvKiogVHlwZSBvZiB0aGUgSW50ZXJhY3Rpb24gKi9cbiAgdHlwZTogSW50ZXJhY3Rpb25UeXBlXG5cbiAgLyoqIFVzZXIgbG9jYWxlIChub3QgcHJlc2VudCBvbiBQSU5HIHR5cGUpICovXG4gIGxvY2FsZT86IHN0cmluZ1xuXG4gIC8qKiBHdWlsZCBsb2NhbGUgKG5vdCBwcmVzZW50IG9uIFBJTkcgdHlwZSkgKi9cbiAgZ3VpbGRfbG9jYWxlPzogc3RyaW5nXG5cbiAgLyoqIFRva2VuIG9mIHRoZSBJbnRlcmFjdGlvbiB0byByZXNwb25kICovXG4gIHRva2VuOiBzdHJpbmdcbiAgLyoqIE1lbWJlciBvYmplY3Qgb2YgdXNlciB3aG8gaW52b2tlZCAqL1xuICBtZW1iZXI/OiBJbnRlcmFjdGlvbk1lbWJlclBheWxvYWRcbiAgLyoqIFVzZXIgd2hvIGluaXRpYXRlZCBJbnRlcmFjdGlvbiAob25seSBpbiBETXMpICovXG4gIHVzZXI/OiBVc2VyUGF5bG9hZFxuICAvKiogSUQgb2YgdGhlIEludGVyYWN0aW9uICovXG4gIGlkOiBzdHJpbmdcbiAgLyoqXG4gICAqIERhdGEgc2VudCB3aXRoIHRoZSBpbnRlcmFjdGlvbi4gVW5kZWZpbmVkIG9ubHkgd2hlbiBJbnRlcmFjdGlvbiBpcyBQSU5HIChodHRwLW9ubHkpLipcbiAgICovXG4gIGRhdGE/OiBJbnRlcmFjdGlvbkFwcGxpY2F0aW9uQ29tbWFuZERhdGEgfCBJbnRlcmFjdGlvbk1lc3NhZ2VDb21wb25lbnREYXRhXG4gIC8qKiBJRCBvZiB0aGUgR3VpbGQgaW4gd2hpY2ggSW50ZXJhY3Rpb24gd2FzIGludm9rZWQgKi9cbiAgZ3VpbGRfaWQ/OiBzdHJpbmdcbiAgLyoqIElEIG9mIHRoZSBDaGFubmVsIGluIHdoaWNoIEludGVyYWN0aW9uIHdhcyBpbnZva2VkICovXG4gIGNoYW5uZWxfaWQ/OiBzdHJpbmdcbiAgLyoqIEFwcGxpY2F0aW9uIElEIG9mIHRoZSBDbGllbnQgd2hvIHJlY2VpdmVkIGludGVyYWN0aW9uICovXG4gIGFwcGxpY2F0aW9uX2lkOiBzdHJpbmdcbiAgLyoqIE1lc3NhZ2UgSUQgaWYgdGhlIEludGVyYWN0aW9uIHdhcyBvZiB0eXBlIE1FU1NBR0VfQ09NUE9ORU5UICovXG4gIG1lc3NhZ2U/OiBNZXNzYWdlUGF5bG9hZFxufVxuXG5leHBvcnQgZW51bSBJbnRlcmFjdGlvblJlc3BvbnNlVHlwZSB7XG4gIC8qKiBbSFRUUCBPbmx5XSBKdXN0IGFjayBhIHBpbmcuICovXG4gIFBPTkcgPSAxLFxuICAvKiogU2VuZCBhIGNoYW5uZWwgbWVzc2FnZSBhcyByZXNwb25zZS4gKi9cbiAgQ0hBTk5FTF9NRVNTQUdFX1dJVEhfU09VUkNFID0gNCxcbiAgLyoqIExldCB0aGUgdXNlciBrbm93IGJvdCBpcyBwcm9jZXNzaW5nIChcInRoaW5raW5nXCIpIGFuZCB5b3UgY2FuIGVkaXQgdGhlIHJlc3BvbnNlIGxhdGVyICovXG4gIERFRkVSUkVEX0NIQU5ORUxfTUVTU0FHRSA9IDUsXG4gIC8qKiBDb21wb25lbnRzOiBJdCB3aWxsIGFja25vd2xlZGdlIHRoZSBpbnRlcmFjdGlvbiBhbmQgdXBkYXRlIHRoZSBidXR0b24gdG8gYSBsb2FkaW5nIHN0YXRlLCBhbmQgdGhlbiB5b3UgY2FuIFBBVENIIHRoZSBtZXNzYWdlIGxhdGVyLiAqL1xuICBERUZFUlJFRF9NRVNTQUdFX1VQREFURSA9IDYsXG4gIC8qKiBDb21wb25lbnRzOiBTZW50IGluIHJlc3BvbnNlIHRvIGEgYnV0dG9uIGludGVyYWN0aW9uIHRvIGltbWVkaWF0ZWx5IHVwZGF0ZSB0aGUgbWVzc2FnZSB0byB3aGljaCB0aGUgYnV0dG9uIHdhcyBhdHRhY2hlZCAqL1xuICBVUERBVEVfTUVTU0FHRSA9IDcsXG4gIC8qKiBSZXNwb25kIHdpdGggYXV0by1jb21wbGV0aW9ucyBmb3IgQXV0b2NvbXBsZXRlIEludGVyYWN0aW9ucyAqL1xuICBBUFBMSUNBVElPTl9DT01NQU5EX0FVVE9DT01QTEVURV9SRVNVTFQgPSA4LFxuICAvKiogUmVzcG9uZCB3aXRoIGEgTW9kYWwgKEZvcm0pICovXG4gIE1PREFMID0gOVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEludGVyYWN0aW9uUmVzcG9uc2VQYXlsb2FkIHtcbiAgLyoqIFR5cGUgb2YgdGhlIHJlc3BvbnNlICovXG4gIHR5cGU6IEludGVyYWN0aW9uUmVzcG9uc2VUeXBlXG4gIC8qKiBEYXRhIHRvIGJlIHNlbnQgd2l0aCByZXNwb25zZS4gT3B0aW9uYWwgZm9yIHR5cGVzOiBQb25nLCBBY2tub3dsZWRnZSwgQWNrIHdpdGggU291cmNlICovXG4gIGRhdGE/OiBJbnRlcmFjdGlvblJlc3BvbnNlRGF0YVBheWxvYWRcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbnRlcmFjdGlvblJlc3BvbnNlRGF0YUJhc2VQYXlsb2FkIHtcbiAgdHRzPzogYm9vbGVhblxuICAvKiogVGV4dCBjb250ZW50IG9mIHRoZSBSZXNwb25zZSAoTWVzc2FnZSkgKi9cbiAgY29udGVudDogc3RyaW5nXG4gIC8qKiBVcHRvIDEwIEVtYmVkIE9iamVjdHMgdG8gc2VuZCB3aXRoIFJlc3BvbnNlICovXG4gIGVtYmVkcz86IEVtYmVkUGF5bG9hZFtdXG4gIC8qKiBBbGxvd2VkIE1lbnRpb25zIG9iamVjdCAqL1xuICBhbGxvd2VkX21lbnRpb25zPzogQWxsb3dlZE1lbnRpb25zUGF5bG9hZFxuICBmbGFncz86IG51bWJlclxuICBjb21wb25lbnRzPzogTWVzc2FnZUNvbXBvbmVudFBheWxvYWRbXVxuICBmaWxlcz86IE1lc3NhZ2VBdHRhY2htZW50W11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbnRlcmFjdGlvblJlc3BvbnNlRGF0YUF1dG9jb21wbGV0ZVBheWxvYWQge1xuICBjaG9pY2VzPzogQXBwbGljYXRpb25Db21tYW5kQ2hvaWNlW11cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbnRlcmFjdGlvblJlc3BvbnNlRGF0YU1vZGFsUGF5bG9hZCB7XG4gIHRpdGxlOiBzdHJpbmdcbiAgY3VzdG9tX2lkOiBzdHJpbmdcbiAgY29tcG9uZW50czogTWVzc2FnZUNvbXBvbmVudFBheWxvYWRbXVxufVxuXG5leHBvcnQgdHlwZSBJbnRlcmFjdGlvblJlc3BvbnNlRGF0YVBheWxvYWQgPVxuICB8IEludGVyYWN0aW9uUmVzcG9uc2VEYXRhQmFzZVBheWxvYWRcbiAgfCBJbnRlcmFjdGlvblJlc3BvbnNlRGF0YUF1dG9jb21wbGV0ZVBheWxvYWRcbiAgfCBJbnRlcmFjdGlvblJlc3BvbnNlRGF0YU1vZGFsUGF5bG9hZFxuXG5leHBvcnQgZW51bSBJbnRlcmFjdGlvblJlc3BvbnNlRmxhZ3Mge1xuICAvKiogQSBNZXNzYWdlIHdoaWNoIGlzIG9ubHkgdmlzaWJsZSB0byBJbnRlcmFjdGlvbiBVc2VyLiAqL1xuICBFUEhFTUVSQUwgPSAxIDw8IDZcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQWlCTztVQUFLLGVBQWU7SUFBZixnQkFBQSxnQkFDVixxQ0FBcUMsR0FDckMsVUFBTyxLQUFQO0lBRlUsZ0JBQUEsZ0JBR1YsOEJBQThCLEdBQzlCLHlCQUFzQixLQUF0QjtJQUpVLGdCQUFBLGdCQUtWLGtDQUFrQyxHQUNsQyx1QkFBb0IsS0FBcEI7SUFOVSxnQkFBQSxnQkFPVix3REFBd0QsR0FDeEQsa0JBQWUsS0FBZjtJQVJVLGdCQUFBLGdCQVNWLDhCQUE4QixHQUM5QixrQkFBZSxLQUFmO0dBVlUsb0JBQUE7V0FrREw7VUFBSyx1QkFBdUI7SUFBdkIsd0JBQUEsd0JBQ1YsaUNBQWlDLEdBQ2pDLFVBQU8sS0FBUDtJQUZVLHdCQUFBLHdCQUdWLHdDQUF3QyxHQUN4QyxpQ0FBOEIsS0FBOUI7SUFKVSx3QkFBQSx3QkFLVix5RkFBeUYsR0FDekYsOEJBQTJCLEtBQTNCO0lBTlUsd0JBQUEsd0JBT1Ysd0lBQXdJLEdBQ3hJLDZCQUEwQixLQUExQjtJQVJVLHdCQUFBLHdCQVNWLDRIQUE0SCxHQUM1SCxvQkFBaUIsS0FBakI7SUFWVSx3QkFBQSx3QkFXVixnRUFBZ0UsR0FDaEUsNkNBQTBDLEtBQTFDO0lBWlUsd0JBQUEsd0JBYVYsZ0NBQWdDLEdBQ2hDLFdBQVEsS0FBUjtHQWRVLDRCQUFBO1dBb0RMO1VBQUssd0JBQXdCO0lBQXhCLHlCQUFBLHlCQUNWLHlEQUF5RCxHQUN6RCxlQUFBLE1BQUE7R0FGVSw2QkFBQSJ9