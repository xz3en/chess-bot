export var ApplicationCommandOptionType;
(function(ApplicationCommandOptionType) {
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** A sub command that is either a part of a root command or Sub Command Group */ "SUB_COMMAND"] = 1] = "SUB_COMMAND";
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** A sub command group that is present in root command's options */ "SUB_COMMAND_GROUP"] = 2] = "SUB_COMMAND_GROUP";
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** String option type */ "STRING"] = 3] = "STRING";
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** Integer option type */ "INTEGER"] = 4] = "INTEGER";
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** Boolean option type */ "BOOLEAN"] = 5] = "BOOLEAN";
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** User option type */ "USER"] = 6] = "USER";
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** Channel option type */ "CHANNEL"] = 7] = "CHANNEL";
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** Role option type */ "ROLE"] = 8] = "ROLE";
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** Union of User and Role option type */ "MENTIONABLE"] = 9] = "MENTIONABLE";
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** Number option type, similar to JS Number. Can be both integer and float */ "NUMBER"] = 10] = "NUMBER";
    ApplicationCommandOptionType[ApplicationCommandOptionType[/** Attachment option type */ "ATTACHMENT"] = 11] = "ATTACHMENT";
})(ApplicationCommandOptionType || (ApplicationCommandOptionType = {}));
export { ApplicationCommandOptionType as SlashCommandOptionType };
export var ApplicationCommandType;
(function(ApplicationCommandType) {
    ApplicationCommandType[ApplicationCommandType[/** Slash Command which user types in Chat Input */ "CHAT_INPUT"] = 1] = "CHAT_INPUT";
    ApplicationCommandType[ApplicationCommandType[/** Command triggered from the User Context Menu */ "USER"] = 2] = "USER";
    ApplicationCommandType[ApplicationCommandType[/** Command triggered from the Message Content Menu */ "MESSAGE"] = 3] = "MESSAGE";
})(ApplicationCommandType || (ApplicationCommandType = {}));
export var ApplicationCommandPermissionType;
(function(ApplicationCommandPermissionType) {
    ApplicationCommandPermissionType[ApplicationCommandPermissionType["ROLE"] = 1] = "ROLE";
    ApplicationCommandPermissionType[ApplicationCommandPermissionType["USER"] = 2] = "USER";
})(ApplicationCommandPermissionType || (ApplicationCommandPermissionType = {}));
export { ApplicationCommandPermissionType as SlashCommandPermissionType };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL3R5cGVzL2FwcGxpY2F0aW9uQ29tbWFuZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IERpY3QgfSBmcm9tICcuLi91dGlscy9kaWN0LnRzJ1xuaW1wb3J0IHR5cGUgeyBDaGFubmVsVHlwZXMsIE1lc3NhZ2VQYXlsb2FkIH0gZnJvbSAnLi9jaGFubmVsLnRzJ1xuaW1wb3J0IHR5cGUgeyBNZW1iZXJQYXlsb2FkIH0gZnJvbSAnLi9ndWlsZC50cydcbmltcG9ydCB0eXBlIHsgUm9sZVBheWxvYWQgfSBmcm9tICcuL3JvbGUudHMnXG5pbXBvcnQgdHlwZSB7IFVzZXJQYXlsb2FkIH0gZnJvbSAnLi91c2VyLnRzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIEludGVyYWN0aW9uQXBwbGljYXRpb25Db21tYW5kT3B0aW9uIHtcbiAgLyoqIE9wdGlvbiBuYW1lICovXG4gIG5hbWU6IHN0cmluZ1xuICAvKiogVHlwZSBvZiBPcHRpb24gKi9cbiAgdHlwZTogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZVxuICAvKiogVmFsdWUgb2YgdGhlIG9wdGlvbiAqL1xuICB2YWx1ZT86IGFueVxuICAvKiogU3ViIG9wdGlvbnMgKi9cbiAgb3B0aW9ucz86IEludGVyYWN0aW9uQXBwbGljYXRpb25Db21tYW5kT3B0aW9uW11cbiAgLyoqIFdoZXRoZXIgdGhpcyBvcHRpb24gd2FzIGZvY3VzZWQgaW4gQXV0b2NvbXBsZXRlIEludGVyYWN0aW9uICovXG4gIGZvY3VzZWQ/OiBib29sZWFuXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJhY3Rpb25DaGFubmVsUGF5bG9hZCB7XG4gIGlkOiBzdHJpbmdcbiAgbmFtZTogc3RyaW5nXG4gIHBlcm1pc3Npb25zOiBzdHJpbmdcbiAgdHlwZTogQ2hhbm5lbFR5cGVzXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmRSZXNvbHZlZFBheWxvYWQge1xuICB1c2Vycz86IERpY3Q8VXNlclBheWxvYWQ+XG4gIG1lbWJlcnM/OiBEaWN0PE1lbWJlclBheWxvYWQ+XG4gIGNoYW5uZWxzPzogRGljdDxJbnRlcmFjdGlvbkNoYW5uZWxQYXlsb2FkPlxuICByb2xlcz86IERpY3Q8Um9sZVBheWxvYWQ+XG4gIG1lc3NhZ2VzPzogRGljdDxNZXNzYWdlUGF5bG9hZD5cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbnRlcmFjdGlvbkFwcGxpY2F0aW9uQ29tbWFuZERhdGEge1xuICAvKiogTmFtZSBvZiB0aGUgQXBwbGljYXRpb24gQ29tbWFuZCAqL1xuICBuYW1lOiBzdHJpbmdcbiAgLyoqIFVuaXF1ZSBJRCBvZiB0aGUgQXBwbGljYXRpb24gQ29tbWFuZCAqL1xuICBpZDogc3RyaW5nXG4gIC8qKiBUeXBlIG9mIHRoZSBBcHBsaWNhdGlvbiBDb21tYW5kICovXG4gIHR5cGU6IEFwcGxpY2F0aW9uQ29tbWFuZFR5cGVcbiAgLyoqIE9wdGlvbnMgKGFyZ3VtZW50cykgc2VudCB3aXRoIEludGVyYWN0aW9uICovXG4gIG9wdGlvbnM6IEludGVyYWN0aW9uQXBwbGljYXRpb25Db21tYW5kT3B0aW9uW11cbiAgLyoqIFJlc29sdmVkIGRhdGEgZm9yIG9wdGlvbnMvdGFyZ2V0cyBpbiBBcHBsaWNhdGlvbiBDb21tYW5kICovXG4gIHJlc29sdmVkPzogSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmRSZXNvbHZlZFBheWxvYWRcbiAgLyoqIFRhcmdldCBJRCBpZiBDb21tYW5kIHdhcyB0YXJnZXRlZCB0byBzb21ldGhpbmcgdGhyb3VnaCBDb250ZXh0IE1lbnUsIGZvciBleGFtcGxlIFVzZXIsIE1lc3NhZ2UsIGV0Yy4gKi9cbiAgdGFyZ2V0X2lkPzogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25Db21tYW5kQ2hvaWNlIHtcbiAgLyoqIChEaXNwbGF5KSBuYW1lIG9mIHRoZSBDaG9pY2UgKi9cbiAgbmFtZTogc3RyaW5nXG4gIC8qKiBBY3R1YWwgdmFsdWUgdG8gYmUgc2VudCBpbiBJbnRlcmFjdGlvbiBTbGFzaCBDb21tYW5kIERhdGEgKi9cbiAgdmFsdWU6IGFueVxufVxuXG5leHBvcnQgdHlwZSB7IEFwcGxpY2F0aW9uQ29tbWFuZENob2ljZSBhcyBTbGFzaENvbW1hbmRDaG9pY2UgfVxuXG5leHBvcnQgZW51bSBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlIHtcbiAgLyoqIEEgc3ViIGNvbW1hbmQgdGhhdCBpcyBlaXRoZXIgYSBwYXJ0IG9mIGEgcm9vdCBjb21tYW5kIG9yIFN1YiBDb21tYW5kIEdyb3VwICovXG4gIFNVQl9DT01NQU5EID0gMSxcbiAgLyoqIEEgc3ViIGNvbW1hbmQgZ3JvdXAgdGhhdCBpcyBwcmVzZW50IGluIHJvb3QgY29tbWFuZCdzIG9wdGlvbnMgKi9cbiAgU1VCX0NPTU1BTkRfR1JPVVAgPSAyLFxuICAvKiogU3RyaW5nIG9wdGlvbiB0eXBlICovXG4gIFNUUklORyA9IDMsXG4gIC8qKiBJbnRlZ2VyIG9wdGlvbiB0eXBlICovXG4gIElOVEVHRVIgPSA0LFxuICAvKiogQm9vbGVhbiBvcHRpb24gdHlwZSAqL1xuICBCT09MRUFOID0gNSxcbiAgLyoqIFVzZXIgb3B0aW9uIHR5cGUgKi9cbiAgVVNFUiA9IDYsXG4gIC8qKiBDaGFubmVsIG9wdGlvbiB0eXBlICovXG4gIENIQU5ORUwgPSA3LFxuICAvKiogUm9sZSBvcHRpb24gdHlwZSAqL1xuICBST0xFID0gOCxcbiAgLyoqIFVuaW9uIG9mIFVzZXIgYW5kIFJvbGUgb3B0aW9uIHR5cGUgKi9cbiAgTUVOVElPTkFCTEUgPSA5LFxuICAvKiogTnVtYmVyIG9wdGlvbiB0eXBlLCBzaW1pbGFyIHRvIEpTIE51bWJlci4gQ2FuIGJlIGJvdGggaW50ZWdlciBhbmQgZmxvYXQgKi9cbiAgTlVNQkVSID0gMTAsXG4gIC8qKiBBdHRhY2htZW50IG9wdGlvbiB0eXBlICovXG4gIEFUVEFDSE1FTlQgPSAxMVxufVxuXG5leHBvcnQgeyBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlIGFzIFNsYXNoQ29tbWFuZE9wdGlvblR5cGUgfVxuXG5leHBvcnQgaW50ZXJmYWNlIEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkJhc2U8XG4gIFQgPSB1bmtub3duLFxuICBPcHRpb25UeXBlID0gQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZVxuPiB7XG4gIC8qKiBOYW1lIG9mIHRoZSBvcHRpb24uICovXG4gIG5hbWU6IHN0cmluZ1xuICAvKiogRGVzY3JpcHRpb24gb2YgdGhlIE9wdGlvbi4gKi9cbiAgZGVzY3JpcHRpb246IHN0cmluZ1xuICAvKiogT3B0aW9uIHR5cGUgKi9cbiAgdHlwZTogT3B0aW9uVHlwZVxuICAvKiogV2hldGhlciB0aGUgb3B0aW9uIGlzIHJlcXVpcmVkIG9yIG5vdCwgZmFsc2UgYnkgZGVmYXVsdCAqL1xuICByZXF1aXJlZD86IGJvb2xlYW5cbiAgZGVmYXVsdD86IGJvb2xlYW5cbiAgLyoqIE9wdGlvbmFsIGNob2ljZXMgb3V0IG9mIHdoaWNoIFVzZXIgY2FuIGNob29zZSB2YWx1ZSAqL1xuICBjaG9pY2VzPzogQXBwbGljYXRpb25Db21tYW5kQ2hvaWNlW11cbiAgLyoqIE5lc3RlZCBvcHRpb25zIGZvciBTdWItQ29tbWFuZCBvciBTdWItQ29tbWFuZC1Hcm91cHMgKi9cbiAgb3B0aW9ucz86IFRbXVxuICAvKiogV2hldGhlciB0aGlzIE9wdGlvbiBzdXBwb3J0cyByZWFsdGltZSBhdXRvY29tcGxldGUgKi9cbiAgYXV0b2NvbXBsZXRlPzogYm9vbGVhblxufVxuXG5leHBvcnQgdHlwZSB7IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkJhc2UgYXMgU2xhc2hDb21tYW5kT3B0aW9uQmFzZSB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uUGF5bG9hZFxuICBleHRlbmRzIEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbkJhc2U8XG4gICAgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uUGF5bG9hZCxcbiAgICBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlXG4gID4ge1xuICBjaGFubmVsX3R5cGVzPzogQ2hhbm5lbFR5cGVzW11cbiAgbWluX3ZhbHVlPzogbnVtYmVyXG4gIG1heF92YWx1ZT86IG51bWJlclxufVxuXG5leHBvcnQgdHlwZSB7IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvblBheWxvYWQgYXMgU2xhc2hDb21tYW5kT3B0aW9uUGF5bG9hZCB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uXG4gIGV4dGVuZHMgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uQmFzZTxcbiAgICBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb24sXG4gICAgQXBwbGljYXRpb25Db21tYW5kT3B0aW9uVHlwZSB8IGtleW9mIHR5cGVvZiBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25UeXBlXG4gID4ge1xuICBjaGFubmVsVHlwZXM/OiBBcnJheTxDaGFubmVsVHlwZXMgfCBrZXlvZiB0eXBlb2YgQ2hhbm5lbFR5cGVzPlxuICBtaW5WYWx1ZT86IG51bWJlclxuICBtYXhWYWx1ZT86IG51bWJlclxufVxuXG5leHBvcnQgdHlwZSB7IEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbiBhcyBTbGFzaENvbW1hbmRPcHRpb24gfVxuXG5leHBvcnQgZW51bSBBcHBsaWNhdGlvbkNvbW1hbmRUeXBlIHtcbiAgLyoqIFNsYXNoIENvbW1hbmQgd2hpY2ggdXNlciB0eXBlcyBpbiBDaGF0IElucHV0ICovXG4gIENIQVRfSU5QVVQgPSAxLFxuICAvKiogQ29tbWFuZCB0cmlnZ2VyZWQgZnJvbSB0aGUgVXNlciBDb250ZXh0IE1lbnUgKi9cbiAgVVNFUiA9IDIsXG4gIC8qKiBDb21tYW5kIHRyaWdnZXJlZCBmcm9tIHRoZSBNZXNzYWdlIENvbnRlbnQgTWVudSAqL1xuICBNRVNTQUdFID0gM1xufVxuXG4vKiogUmVwcmVzZW50cyB0aGUgU2xhc2ggQ29tbWFuZCAoQXBwbGljYXRpb24gQ29tbWFuZCkgcGF5bG9hZCBzZW50IGZvciBjcmVhdGluZy9bYnVsa10gZWRpdGluZy4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25Db21tYW5kUGFydGlhbEJhc2U8XG4gIFQgPSBBcHBsaWNhdGlvbkNvbW1hbmRPcHRpb25QYXlsb2FkLFxuICBUMiA9IEFwcGxpY2F0aW9uQ29tbWFuZFR5cGVcbj4ge1xuICAvKiogTmFtZSBvZiB0aGUgQXBwbGljYXRpb24gQ29tbWFuZCAqL1xuICBuYW1lOiBzdHJpbmdcbiAgLyoqIERlc2NyaXB0aW9uIG9mIHRoZSBTbGFzaCBDb21tYW5kLiBOb3QgYXBwbGljYWJsZSB0byBDb250ZXh0IE1lbnUgY29tbWFuZHMuICovXG4gIGRlc2NyaXB0aW9uPzogc3RyaW5nXG4gIC8qKiBPcHRpb25zIChhcmd1bWVudHMsIHN1YiBjb21tYW5kcyBvciBncm91cCkgb2YgdGhlIFNsYXNoIENvbW1hbmQuIE5vdCBhcHBsaWNhYmxlIHRvIENvbnRleHQgTWVudSBjb21tYW5kcy4gKi9cbiAgb3B0aW9ucz86IFRbXVxuICAvKiogVHlwZSBvZiB0aGUgQXBwbGljYXRpb24gQ29tbWFuZCAqL1xuICB0eXBlPzogVDJcbn1cblxuZXhwb3J0IHR5cGUgeyBBcHBsaWNhdGlvbkNvbW1hbmRQYXJ0aWFsQmFzZSBhcyBTbGFzaENvbW1hbmRQYXJ0aWFsQmFzZSB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25Db21tYW5kUGFydGlhbFBheWxvYWRcbiAgZXh0ZW5kcyBBcHBsaWNhdGlvbkNvbW1hbmRQYXJ0aWFsQmFzZSB7XG4gIGRlZmF1bHRfcGVybWlzc2lvbj86IGJvb2xlYW5cbn1cblxuZXhwb3J0IHR5cGUgeyBBcHBsaWNhdGlvbkNvbW1hbmRQYXJ0aWFsUGF5bG9hZCBhcyBTbGFzaENvbW1hbmRQYXJ0aWFsUGF5bG9hZCB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25Db21tYW5kUGFydGlhbFxuICBleHRlbmRzIEFwcGxpY2F0aW9uQ29tbWFuZFBhcnRpYWxCYXNlPFxuICAgIEFwcGxpY2F0aW9uQ29tbWFuZE9wdGlvbixcbiAgICBBcHBsaWNhdGlvbkNvbW1hbmRUeXBlIHwga2V5b2YgdHlwZW9mIEFwcGxpY2F0aW9uQ29tbWFuZFR5cGVcbiAgPiB7XG4gIGRlZmF1bHRQZXJtaXNzaW9uPzogYm9vbGVhblxufVxuXG5leHBvcnQgdHlwZSB7IEFwcGxpY2F0aW9uQ29tbWFuZFBhcnRpYWwgYXMgU2xhc2hDb21tYW5kUGFydGlhbCB9XG5cbi8qKiBSZXByZXNlbnRzIGEgZnVsbHkgcXVhbGlmaWVkIEFwcGxpY2F0aW9uIENvbW1hbmQgcGF5bG9hZC4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25Db21tYW5kUGF5bG9hZFxuICBleHRlbmRzIEFwcGxpY2F0aW9uQ29tbWFuZFBhcnRpYWxQYXlsb2FkIHtcbiAgLyoqIElEIG9mIHRoZSBBcHBsaWNhdGlvbiBDb21tYW5kICovXG4gIGlkOiBzdHJpbmdcbiAgLyoqIEFwcGxpY2F0aW9uIElEICovXG4gIGFwcGxpY2F0aW9uX2lkOiBzdHJpbmdcbiAgZ3VpbGRfaWQ/OiBzdHJpbmdcbiAgZGVmYXVsdF9wZXJtaXNzaW9uOiBib29sZWFuXG4gIHR5cGU6IEFwcGxpY2F0aW9uQ29tbWFuZFR5cGVcbiAgb3B0aW9uczogQXBwbGljYXRpb25Db21tYW5kT3B0aW9uUGF5bG9hZFtdXG59XG5cbmV4cG9ydCB0eXBlIHsgQXBwbGljYXRpb25Db21tYW5kUGF5bG9hZCBhcyBTbGFzaENvbW1hbmRQYXlsb2FkIH1cblxuZXhwb3J0IGVudW0gQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvblR5cGUge1xuICBST0xFID0gMSxcbiAgVVNFUiA9IDJcbn1cblxuZXhwb3J0IHsgQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvblR5cGUgYXMgU2xhc2hDb21tYW5kUGVybWlzc2lvblR5cGUgfVxuXG5leHBvcnQgaW50ZXJmYWNlIEd1aWxkQXBwbGljYXRpb25Db21tbWFuZFBlcm1pc3Npb25zQmFzZTxcbiAgVCA9IEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25QYXlsb2FkXG4+IHtcbiAgaWQ6IHN0cmluZ1xuICBwZXJtaXNzaW9uczogVFtdXG59XG5cbmV4cG9ydCB0eXBlIHsgR3VpbGRBcHBsaWNhdGlvbkNvbW1tYW5kUGVybWlzc2lvbnNCYXNlIGFzIEd1aWxkU2xhc2hDb21tYW5kUGVybWlzc2lvbnNCYXNlIH1cblxuZXhwb3J0IGludGVyZmFjZSBHdWlsZEFwcGxpY2F0aW9uQ29tbW1hbmRQZXJtaXNzaW9uc1BhcnRpYWxcbiAgZXh0ZW5kcyBHdWlsZEFwcGxpY2F0aW9uQ29tbW1hbmRQZXJtaXNzaW9uc0Jhc2U8QXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbj4ge31cblxuZXhwb3J0IHR5cGUgeyBHdWlsZEFwcGxpY2F0aW9uQ29tbW1hbmRQZXJtaXNzaW9uc1BhcnRpYWwgYXMgR3VpbGRTbGFzaENvbW1tYW5kUGVybWlzc2lvbnNQYXJ0aWFsIH1cblxuZXhwb3J0IGludGVyZmFjZSBHdWlsZEFwcGxpY2F0aW9uQ29tbW1hbmRQZXJtaXNzaW9uc1BheWxvYWRcbiAgZXh0ZW5kcyBHdWlsZEFwcGxpY2F0aW9uQ29tbW1hbmRQZXJtaXNzaW9uc0Jhc2Uge1xuICBhcHBsaWNhdGlvbl9pZDogc3RyaW5nXG4gIGd1aWxkX2lkOiBzdHJpbmdcbn1cblxuZXhwb3J0IHR5cGUgeyBHdWlsZEFwcGxpY2F0aW9uQ29tbW1hbmRQZXJtaXNzaW9uc1BheWxvYWQgYXMgR3VpbGRTbGFzaENvbW1tYW5kUGVybWlzc2lvbnNQYXlsb2FkIH1cblxuZXhwb3J0IGludGVyZmFjZSBHdWlsZEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25zXG4gIGV4dGVuZHMgR3VpbGRBcHBsaWNhdGlvbkNvbW1tYW5kUGVybWlzc2lvbnNQYXJ0aWFsIHtcbiAgYXBwbGljYXRpb25JRDogc3RyaW5nXG4gIGd1aWxkSUQ6IHN0cmluZ1xufVxuXG5leHBvcnQgdHlwZSB7IEd1aWxkQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbnMgYXMgR3VpbGRTbGFzaENvbW1hbmRQZXJtaXNzaW9ucyB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbkJhc2U8XG4gIFQgPSBBcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uVHlwZVxuPiB7XG4gIGlkOiBzdHJpbmdcbiAgdHlwZTogVFxuICBwZXJtaXNzaW9uOiBib29sZWFuXG59XG5cbmV4cG9ydCB0eXBlIHsgQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvbkJhc2UgYXMgU2xhc2hDb21tYW5kUGVybWlzc2lvbkJhc2UgfVxuXG5leHBvcnQgaW50ZXJmYWNlIEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25cbiAgZXh0ZW5kcyBBcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uQmFzZTxcbiAgICB8IEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25UeXBlXG4gICAgfCBrZXlvZiB0eXBlb2YgQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvblR5cGVcbiAgPiB7fVxuXG5leHBvcnQgdHlwZSB7IEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb24gYXMgU2xhc2hDb21tYW5kUGVybWlzc2lvbiB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXBwbGljYXRpb25Db21tYW5kUGVybWlzc2lvblBheWxvYWRcbiAgZXh0ZW5kcyBBcHBsaWNhdGlvbkNvbW1hbmRQZXJtaXNzaW9uQmFzZSB7fVxuXG5leHBvcnQgdHlwZSB7IEFwcGxpY2F0aW9uQ29tbWFuZFBlcm1pc3Npb25QYXlsb2FkIGFzIFNsYXNoQ29tbWFuZFBlcm1pc3Npb25QYXlsb2FkIH1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQTBETztVQUFLLDRCQUE0QjtJQUE1Qiw2QkFBQSw2QkFDViwrRUFBK0UsR0FDL0UsaUJBQWMsS0FBZDtJQUZVLDZCQUFBLDZCQUdWLGtFQUFrRSxHQUNsRSx1QkFBb0IsS0FBcEI7SUFKVSw2QkFBQSw2QkFLVix1QkFBdUIsR0FDdkIsWUFBUyxLQUFUO0lBTlUsNkJBQUEsNkJBT1Ysd0JBQXdCLEdBQ3hCLGFBQVUsS0FBVjtJQVJVLDZCQUFBLDZCQVNWLHdCQUF3QixHQUN4QixhQUFVLEtBQVY7SUFWVSw2QkFBQSw2QkFXVixxQkFBcUIsR0FDckIsVUFBTyxLQUFQO0lBWlUsNkJBQUEsNkJBYVYsd0JBQXdCLEdBQ3hCLGFBQVUsS0FBVjtJQWRVLDZCQUFBLDZCQWVWLHFCQUFxQixHQUNyQixVQUFPLEtBQVA7SUFoQlUsNkJBQUEsNkJBaUJWLHVDQUF1QyxHQUN2QyxpQkFBYyxLQUFkO0lBbEJVLDZCQUFBLDZCQW1CViw0RUFBNEUsR0FDNUUsWUFBUyxNQUFUO0lBcEJVLDZCQUFBLDZCQXFCViwyQkFBMkIsR0FDM0IsZ0JBQWEsTUFBYjtHQXRCVSxpQ0FBQTtBQXlCWixTQUFTLGdDQUFnQyxzQkFBc0IsR0FBRTtXQWlEMUQ7VUFBSyxzQkFBc0I7SUFBdEIsdUJBQUEsdUJBQ1YsaURBQWlELEdBQ2pELGdCQUFhLEtBQWI7SUFGVSx1QkFBQSx1QkFHVixpREFBaUQsR0FDakQsVUFBTyxLQUFQO0lBSlUsdUJBQUEsdUJBS1Ysb0RBQW9ELEdBQ3BELGFBQVUsS0FBVjtHQU5VLDJCQUFBO1dBMERMO1VBQUssZ0NBQWdDO0lBQWhDLGlDQUFBLGlDQUNWLFVBQU8sS0FBUDtJQURVLGlDQUFBLGlDQUVWLFVBQU8sS0FBUDtHQUZVLHFDQUFBO0FBS1osU0FBUyxvQ0FBb0MsMEJBQTBCLEdBQUUifQ==