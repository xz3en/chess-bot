/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */ import { Guild } from '../../structures/guild.ts';
import { Member } from '../../structures/member.ts';
import { ApplicationCommandInteraction } from '../../structures/applicationCommand.ts';
import { MessageComponentInteraction } from '../../structures/messageComponents.ts';
import { Interaction, InteractionChannel } from '../../structures/interactions.ts';
import { InteractionType } from '../../types/interactions.ts';
import { Permissions } from '../../utils/permissions.ts';
import { User } from '../../structures/user.ts';
import { Role } from '../../structures/role.ts';
import { Message } from '../../structures/message.ts';
import { AutocompleteInteraction } from '../../structures/autocompleteInteraction.ts';
import { ModalSubmitInteraction } from '../../structures/modalSubmitInteraction.ts';
export const interactionCreate = async (gateway, d)=>{
    // NOTE(DjDeveloperr): Mason once mentioned that channel_id can be optional in Interaction.
    // This case can be seen in future proofing Interactions, and one he mentioned was
    // that bots will be able to add custom context menus. In that case, Interaction will not have it.
    // Ref: https://github.com/discord/discord-api-docs/pull/2568/files#r569025697
    if (d.channel_id === undefined) return;
    const guild = d.guild_id === undefined ? undefined : await gateway.client.guilds.get(d.guild_id) ?? // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    new Guild(gateway.client, {
        unavailable: true,
        id: d.guild_id
    });
    if (d.member !== undefined) await guild?.members.set(d.member.user.id, d.member);
    const member = d.member !== undefined ? await guild?.members.get(d.member.user.id) ?? new Member(gateway.client, d.member, new User(gateway.client, d.member.user), // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    guild, new Permissions(d.member.permissions)) : undefined;
    if (member !== undefined) {
        member.permissions.bitfield = BigInt(d.member.permissions);
    }
    if (d.user !== undefined) await gateway.client.users.set(d.user.id, d.user);
    const dmUser = d.user !== undefined ? await gateway.client.users.get(d.user.id) : undefined;
    const user = member !== undefined ? member.user : dmUser;
    if (user === undefined) return;
    const channel = await gateway.client.channels.get(d.channel_id);
    const resolved = {
        users: {},
        channels: {},
        members: {},
        roles: {},
        messages: {}
    };
    if (d.data?.resolved !== undefined) {
        for (const [id, data] of Object.entries(d.data?.resolved?.users ?? {})){
            await gateway.client.users.set(id, data);
            resolved.users[id] = await gateway.client.users.get(id);
            if (resolved.members[id] !== undefined) resolved.users[id].member = resolved.members[id];
        }
        for (const [id1, data1] of Object.entries(d.data?.resolved?.members ?? {})){
            const roles = await guild?.roles.array();
            let permissions = new Permissions(Permissions.DEFAULT);
            if (roles !== undefined) {
                const mRoles = roles.filter((r)=>data1?.roles?.includes(r.id) || r.id === guild?.id);
                permissions = new Permissions(mRoles.map((r)=>r.permissions));
            }
            data1.user = d.data.resolved?.users?.[id1];
            resolved.members[id1] = new Member(gateway.client, data1, resolved.users[id1], guild, permissions);
        }
        for (const [id2, data2] of Object.entries(d.data.resolved?.roles ?? {})){
            if (guild !== undefined) {
                await guild.roles.set(id2, data2);
                resolved.roles[id2] = await guild.roles.get(id2);
            } else {
                resolved.roles[id2] = new Role(gateway.client, data2, guild);
            }
        }
        for (const [id3, data3] of Object.entries(d.data.resolved?.channels ?? {})){
            resolved.channels[id3] = new InteractionChannel(gateway.client, data3);
        }
        for (const [id4, data4] of Object.entries(d.data.resolved?.messages ?? {})){
            const channel1 = await gateway.client.channels.get(data4.channel_id);
            await channel1?.messages.set(data4.id, data4);
            await gateway.client.users.set(data4.author.id, data4.author);
            resolved.messages[id4] = new Message(gateway.client, data4, channel1, await gateway.client.users.get(data4.author.id));
        }
    }
    let message;
    if (d.message !== undefined) {
        const channel2 = await gateway.client.channels.get(d.message.channel_id);
        await gateway.client.users.set(d.message.author.id, d.message.author);
        message = new Message(gateway.client, d.message, channel2, d.message.author !== undefined ? new User(gateway.client, d.message.author) : undefined);
        await message.mentions.fromPayload(d.message);
    }
    let interaction;
    if (d.type === InteractionType.APPLICATION_COMMAND) {
        interaction = new ApplicationCommandInteraction(gateway.client, d, {
            member,
            guild,
            channel,
            user,
            resolved
        });
    } else if (d.type === InteractionType.AUTOCOMPLETE) {
        interaction = new AutocompleteInteraction(gateway.client, d, {
            member,
            guild,
            channel,
            user,
            resolved
        });
    } else if (d.type === InteractionType.MESSAGE_COMPONENT) {
        interaction = new MessageComponentInteraction(gateway.client, d, {
            member,
            guild,
            channel,
            user,
            message
        });
    } else if (d.type === InteractionType.MODAL_SUBMIT) {
        interaction = new ModalSubmitInteraction(gateway.client, d, {
            member,
            guild,
            channel,
            user
        });
    } else {
        interaction = new Interaction(gateway.client, d, {
            member,
            guild,
            channel,
            user,
            message
        });
    }
    gateway.client.emit('interactionCreate', interaction);
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3gvaGFybW9ueUB2Mi45LjAvc3JjL2dhdGV3YXkvaGFuZGxlcnMvaW50ZXJhY3Rpb25DcmVhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uICovXG5pbXBvcnQgeyBHdWlsZCB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvZ3VpbGQudHMnXG5pbXBvcnQgeyBNZW1iZXIgfSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL21lbWJlci50cydcbmltcG9ydCB7XG4gIEludGVyYWN0aW9uQXBwbGljYXRpb25Db21tYW5kUmVzb2x2ZWQsXG4gIEFwcGxpY2F0aW9uQ29tbWFuZEludGVyYWN0aW9uXG59IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvYXBwbGljYXRpb25Db21tYW5kLnRzJ1xuaW1wb3J0IHsgTWVzc2FnZUNvbXBvbmVudEludGVyYWN0aW9uIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9tZXNzYWdlQ29tcG9uZW50cy50cydcbmltcG9ydCB7XG4gIEludGVyYWN0aW9uLFxuICBJbnRlcmFjdGlvbkNoYW5uZWxcbn0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy9pbnRlcmFjdGlvbnMudHMnXG5pbXBvcnQgeyBHdWlsZFRleHRCYXNlZENoYW5uZWwgfSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL2d1aWxkVGV4dENoYW5uZWwudHMnXG5pbXBvcnQge1xuICBJbnRlcmFjdGlvblBheWxvYWQsXG4gIEludGVyYWN0aW9uVHlwZVxufSBmcm9tICcuLi8uLi90eXBlcy9pbnRlcmFjdGlvbnMudHMnXG5pbXBvcnQgeyBVc2VyUGF5bG9hZCB9IGZyb20gJy4uLy4uL3R5cGVzL3VzZXIudHMnXG5pbXBvcnQgeyBQZXJtaXNzaW9ucyB9IGZyb20gJy4uLy4uL3V0aWxzL3Blcm1pc3Npb25zLnRzJ1xuaW1wb3J0IHR5cGUgeyBHYXRld2F5LCBHYXRld2F5RXZlbnRIYW5kbGVyIH0gZnJvbSAnLi4vbW9kLnRzJ1xuaW1wb3J0IHsgVXNlciB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvdXNlci50cydcbmltcG9ydCB7IFJvbGUgfSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL3JvbGUudHMnXG5pbXBvcnQgeyBSb2xlUGF5bG9hZCB9IGZyb20gJy4uLy4uL3R5cGVzL3JvbGUudHMnXG5pbXBvcnQge1xuICBJbnRlcmFjdGlvbkFwcGxpY2F0aW9uQ29tbWFuZERhdGEsXG4gIEludGVyYWN0aW9uQ2hhbm5lbFBheWxvYWRcbn0gZnJvbSAnLi4vLi4vdHlwZXMvYXBwbGljYXRpb25Db21tYW5kLnRzJ1xuaW1wb3J0IHsgTWVzc2FnZSB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvbWVzc2FnZS50cydcbmltcG9ydCB7IFRleHRDaGFubmVsIH0gZnJvbSAnLi4vLi4vc3RydWN0dXJlcy90ZXh0Q2hhbm5lbC50cydcbmltcG9ydCB7IE1lc3NhZ2VQYXlsb2FkIH0gZnJvbSAnLi4vLi4vdHlwZXMvY2hhbm5lbC50cydcbmltcG9ydCB7IEd1aWxkUGF5bG9hZCwgTWVtYmVyUGF5bG9hZCB9IGZyb20gJy4uLy4uL3R5cGVzL2d1aWxkLnRzJ1xuaW1wb3J0IHsgQXV0b2NvbXBsZXRlSW50ZXJhY3Rpb24gfSBmcm9tICcuLi8uLi9zdHJ1Y3R1cmVzL2F1dG9jb21wbGV0ZUludGVyYWN0aW9uLnRzJ1xuaW1wb3J0IHsgTW9kYWxTdWJtaXRJbnRlcmFjdGlvbiB9IGZyb20gJy4uLy4uL3N0cnVjdHVyZXMvbW9kYWxTdWJtaXRJbnRlcmFjdGlvbi50cydcblxuZXhwb3J0IGNvbnN0IGludGVyYWN0aW9uQ3JlYXRlOiBHYXRld2F5RXZlbnRIYW5kbGVyID0gYXN5bmMgKFxuICBnYXRld2F5OiBHYXRld2F5LFxuICBkOiBJbnRlcmFjdGlvblBheWxvYWRcbikgPT4ge1xuICAvLyBOT1RFKERqRGV2ZWxvcGVycik6IE1hc29uIG9uY2UgbWVudGlvbmVkIHRoYXQgY2hhbm5lbF9pZCBjYW4gYmUgb3B0aW9uYWwgaW4gSW50ZXJhY3Rpb24uXG4gIC8vIFRoaXMgY2FzZSBjYW4gYmUgc2VlbiBpbiBmdXR1cmUgcHJvb2ZpbmcgSW50ZXJhY3Rpb25zLCBhbmQgb25lIGhlIG1lbnRpb25lZCB3YXNcbiAgLy8gdGhhdCBib3RzIHdpbGwgYmUgYWJsZSB0byBhZGQgY3VzdG9tIGNvbnRleHQgbWVudXMuIEluIHRoYXQgY2FzZSwgSW50ZXJhY3Rpb24gd2lsbCBub3QgaGF2ZSBpdC5cbiAgLy8gUmVmOiBodHRwczovL2dpdGh1Yi5jb20vZGlzY29yZC9kaXNjb3JkLWFwaS1kb2NzL3B1bGwvMjU2OC9maWxlcyNyNTY5MDI1Njk3XG4gIGlmIChkLmNoYW5uZWxfaWQgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG5cbiAgY29uc3QgZ3VpbGQgPVxuICAgIGQuZ3VpbGRfaWQgPT09IHVuZGVmaW5lZFxuICAgICAgPyB1bmRlZmluZWRcbiAgICAgIDogKGF3YWl0IGdhdGV3YXkuY2xpZW50Lmd1aWxkcy5nZXQoZC5ndWlsZF9pZCkpID8/XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvY29uc2lzdGVudC10eXBlLWFzc2VydGlvbnNcbiAgICAgICAgbmV3IEd1aWxkKGdhdGV3YXkuY2xpZW50LCB7XG4gICAgICAgICAgdW5hdmFpbGFibGU6IHRydWUsXG4gICAgICAgICAgaWQ6IGQuZ3VpbGRfaWRcbiAgICAgICAgfSBhcyBHdWlsZFBheWxvYWQpXG5cbiAgaWYgKGQubWVtYmVyICE9PSB1bmRlZmluZWQpXG4gICAgYXdhaXQgZ3VpbGQ/Lm1lbWJlcnMuc2V0KGQubWVtYmVyLnVzZXIuaWQsIGQubWVtYmVyKVxuICBjb25zdCBtZW1iZXIgPVxuICAgIGQubWVtYmVyICE9PSB1bmRlZmluZWRcbiAgICAgID8gKGF3YWl0IGd1aWxkPy5tZW1iZXJzLmdldChkLm1lbWJlci51c2VyLmlkKSkhID8/XG4gICAgICAgIG5ldyBNZW1iZXIoXG4gICAgICAgICAgZ2F0ZXdheS5jbGllbnQsXG4gICAgICAgICAgZC5tZW1iZXIhLFxuICAgICAgICAgIG5ldyBVc2VyKGdhdGV3YXkuY2xpZW50LCBkLm1lbWJlci51c2VyKSxcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LXR5cGUtYXNzZXJ0aW9uXG4gICAgICAgICAgZ3VpbGQhLFxuICAgICAgICAgIG5ldyBQZXJtaXNzaW9ucyhkLm1lbWJlci5wZXJtaXNzaW9ucylcbiAgICAgICAgKVxuICAgICAgOiB1bmRlZmluZWRcbiAgaWYgKG1lbWJlciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbWVtYmVyLnBlcm1pc3Npb25zLmJpdGZpZWxkID0gQmlnSW50KGQubWVtYmVyIS5wZXJtaXNzaW9ucyEpXG4gIH1cbiAgaWYgKGQudXNlciAhPT0gdW5kZWZpbmVkKSBhd2FpdCBnYXRld2F5LmNsaWVudC51c2Vycy5zZXQoZC51c2VyLmlkLCBkLnVzZXIpXG4gIGNvbnN0IGRtVXNlciA9XG4gICAgZC51c2VyICE9PSB1bmRlZmluZWQgPyBhd2FpdCBnYXRld2F5LmNsaWVudC51c2Vycy5nZXQoZC51c2VyLmlkKSA6IHVuZGVmaW5lZFxuXG4gIGNvbnN0IHVzZXIgPSBtZW1iZXIgIT09IHVuZGVmaW5lZCA/IG1lbWJlci51c2VyIDogZG1Vc2VyXG4gIGlmICh1c2VyID09PSB1bmRlZmluZWQpIHJldHVyblxuXG4gIGNvbnN0IGNoYW5uZWwgPSBhd2FpdCBnYXRld2F5LmNsaWVudC5jaGFubmVscy5nZXQ8R3VpbGRUZXh0QmFzZWRDaGFubmVsPihcbiAgICBkLmNoYW5uZWxfaWRcbiAgKVxuXG4gIGNvbnN0IHJlc29sdmVkOiBJbnRlcmFjdGlvbkFwcGxpY2F0aW9uQ29tbWFuZFJlc29sdmVkID0ge1xuICAgIHVzZXJzOiB7fSxcbiAgICBjaGFubmVsczoge30sXG4gICAgbWVtYmVyczoge30sXG4gICAgcm9sZXM6IHt9LFxuICAgIG1lc3NhZ2VzOiB7fVxuICB9XG5cbiAgaWYgKChkLmRhdGEgYXMgSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmREYXRhKT8ucmVzb2x2ZWQgIT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAoY29uc3QgW2lkLCBkYXRhXSBvZiBPYmplY3QuZW50cmllcyhcbiAgICAgIChkLmRhdGEgYXMgSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmREYXRhKT8ucmVzb2x2ZWQ/LnVzZXJzID8/IHt9XG4gICAgKSkge1xuICAgICAgYXdhaXQgZ2F0ZXdheS5jbGllbnQudXNlcnMuc2V0KGlkLCBkYXRhIGFzIFVzZXJQYXlsb2FkKVxuICAgICAgcmVzb2x2ZWQudXNlcnNbaWRdID0gKGF3YWl0IGdhdGV3YXkuY2xpZW50LnVzZXJzLmdldChcbiAgICAgICAgaWRcbiAgICAgICkpIGFzIHVua25vd24gYXMgVXNlclxuICAgICAgaWYgKHJlc29sdmVkLm1lbWJlcnNbaWRdICE9PSB1bmRlZmluZWQpXG4gICAgICAgIHJlc29sdmVkLnVzZXJzW2lkXS5tZW1iZXIgPSByZXNvbHZlZC5tZW1iZXJzW2lkXVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgW2lkLCBkYXRhXSBvZiBPYmplY3QuZW50cmllcyhcbiAgICAgIChkLmRhdGEgYXMgSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmREYXRhKT8ucmVzb2x2ZWQ/Lm1lbWJlcnMgPz8ge31cbiAgICApKSB7XG4gICAgICBjb25zdCByb2xlcyA9IGF3YWl0IGd1aWxkPy5yb2xlcy5hcnJheSgpXG4gICAgICBsZXQgcGVybWlzc2lvbnMgPSBuZXcgUGVybWlzc2lvbnMoUGVybWlzc2lvbnMuREVGQVVMVClcbiAgICAgIGlmIChyb2xlcyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGNvbnN0IG1Sb2xlcyA9IHJvbGVzLmZpbHRlcihcbiAgICAgICAgICAocikgPT4gKGRhdGE/LnJvbGVzPy5pbmNsdWRlcyhyLmlkKSBhcyBib29sZWFuKSB8fCByLmlkID09PSBndWlsZD8uaWRcbiAgICAgICAgKVxuICAgICAgICBwZXJtaXNzaW9ucyA9IG5ldyBQZXJtaXNzaW9ucyhtUm9sZXMubWFwKChyKSA9PiByLnBlcm1pc3Npb25zKSlcbiAgICAgIH1cbiAgICAgIDsoZGF0YSBhcyBNZW1iZXJQYXlsb2FkKS51c2VyID0gKFxuICAgICAgICBkLmRhdGEgYXMgSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmREYXRhXG4gICAgICApLnJlc29sdmVkPy51c2Vycz8uW2lkXSBhcyB1bmtub3duIGFzIFVzZXJQYXlsb2FkXG4gICAgICByZXNvbHZlZC5tZW1iZXJzW2lkXSA9IG5ldyBNZW1iZXIoXG4gICAgICAgIGdhdGV3YXkuY2xpZW50LFxuICAgICAgICBkYXRhLFxuICAgICAgICByZXNvbHZlZC51c2Vyc1tpZF0sXG4gICAgICAgIGd1aWxkIGFzIEd1aWxkLFxuICAgICAgICBwZXJtaXNzaW9uc1xuICAgICAgKVxuICAgIH1cblxuICAgIGZvciAoY29uc3QgW2lkLCBkYXRhXSBvZiBPYmplY3QuZW50cmllcyhcbiAgICAgIChkLmRhdGEgYXMgSW50ZXJhY3Rpb25BcHBsaWNhdGlvbkNvbW1hbmREYXRhKS5yZXNvbHZlZD8ucm9sZXMgPz8ge31cbiAgICApKSB7XG4gICAgICBpZiAoZ3VpbGQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBhd2FpdCBndWlsZC5yb2xlcy5zZXQoaWQsIGRhdGEgYXMgUm9sZVBheWxvYWQpXG4gICAgICAgIHJlc29sdmVkLnJvbGVzW2lkXSA9IChhd2FpdCBndWlsZC5yb2xlcy5nZXQoaWQpKSBhcyB1bmtub3duIGFzIFJvbGVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc29sdmVkLnJvbGVzW2lkXSA9IG5ldyBSb2xlKFxuICAgICAgICAgIGdhdGV3YXkuY2xpZW50LFxuICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgZ3VpbGQgYXMgdW5rbm93biBhcyBHdWlsZFxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBbaWQsIGRhdGFdIG9mIE9iamVjdC5lbnRyaWVzKFxuICAgICAgKGQuZGF0YSBhcyBJbnRlcmFjdGlvbkFwcGxpY2F0aW9uQ29tbWFuZERhdGEpLnJlc29sdmVkPy5jaGFubmVscyA/PyB7fVxuICAgICkpIHtcbiAgICAgIHJlc29sdmVkLmNoYW5uZWxzW2lkXSA9IG5ldyBJbnRlcmFjdGlvbkNoYW5uZWwoXG4gICAgICAgIGdhdGV3YXkuY2xpZW50LFxuICAgICAgICBkYXRhIGFzIEludGVyYWN0aW9uQ2hhbm5lbFBheWxvYWRcbiAgICAgIClcbiAgICB9XG5cbiAgICBmb3IgKGNvbnN0IFtpZCwgZGF0YV0gb2YgT2JqZWN0LmVudHJpZXMoXG4gICAgICAoZC5kYXRhIGFzIEludGVyYWN0aW9uQXBwbGljYXRpb25Db21tYW5kRGF0YSkucmVzb2x2ZWQ/Lm1lc3NhZ2VzID8/IHt9XG4gICAgKSkge1xuICAgICAgY29uc3QgY2hhbm5lbCA9IGF3YWl0IGdhdGV3YXkuY2xpZW50LmNoYW5uZWxzLmdldDxUZXh0Q2hhbm5lbD4oXG4gICAgICAgIGRhdGEuY2hhbm5lbF9pZFxuICAgICAgKVxuICAgICAgYXdhaXQgY2hhbm5lbD8ubWVzc2FnZXMuc2V0KGRhdGEuaWQsIGRhdGEpXG4gICAgICBhd2FpdCBnYXRld2F5LmNsaWVudC51c2Vycy5zZXQoZGF0YS5hdXRob3IuaWQsIGRhdGEuYXV0aG9yKVxuICAgICAgcmVzb2x2ZWQubWVzc2FnZXNbaWRdID0gbmV3IE1lc3NhZ2UoXG4gICAgICAgIGdhdGV3YXkuY2xpZW50LFxuICAgICAgICBkYXRhIGFzIE1lc3NhZ2VQYXlsb2FkLFxuICAgICAgICBjaGFubmVsISxcbiAgICAgICAgKGF3YWl0IGdhdGV3YXkuY2xpZW50LnVzZXJzLmdldChkYXRhLmF1dGhvci5pZCkpIVxuICAgICAgKVxuICAgIH1cbiAgfVxuXG4gIGxldCBtZXNzYWdlOiBNZXNzYWdlIHwgdW5kZWZpbmVkXG4gIGlmIChkLm1lc3NhZ2UgIT09IHVuZGVmaW5lZCkge1xuICAgIGNvbnN0IGNoYW5uZWwgPSAoYXdhaXQgZ2F0ZXdheS5jbGllbnQuY2hhbm5lbHMuZ2V0PFRleHRDaGFubmVsPihcbiAgICAgIGQubWVzc2FnZS5jaGFubmVsX2lkXG4gICAgKSkhXG4gICAgYXdhaXQgZ2F0ZXdheS5jbGllbnQudXNlcnMuc2V0KGQubWVzc2FnZS5hdXRob3IuaWQsIGQubWVzc2FnZS5hdXRob3IpXG4gICAgbWVzc2FnZSA9IG5ldyBNZXNzYWdlKFxuICAgICAgZ2F0ZXdheS5jbGllbnQsXG4gICAgICBkLm1lc3NhZ2UsXG4gICAgICBjaGFubmVsLFxuICAgICAgKGQubWVzc2FnZS5hdXRob3IgIT09IHVuZGVmaW5lZFxuICAgICAgICA/IG5ldyBVc2VyKGdhdGV3YXkuY2xpZW50LCBkLm1lc3NhZ2UuYXV0aG9yKVxuICAgICAgICA6IHVuZGVmaW5lZCkhIC8vIHNraXAgYXV0aG9yIGZvciBub3cgc2luY2UgZXBoZW1lcmFsIG1lc3NhZ2VzIGRvbid0IGhhdmUgaXRcbiAgICApXG4gICAgYXdhaXQgbWVzc2FnZS5tZW50aW9ucy5mcm9tUGF5bG9hZChkLm1lc3NhZ2UpXG4gIH1cblxuICBsZXQgaW50ZXJhY3Rpb25cbiAgaWYgKGQudHlwZSA9PT0gSW50ZXJhY3Rpb25UeXBlLkFQUExJQ0FUSU9OX0NPTU1BTkQpIHtcbiAgICBpbnRlcmFjdGlvbiA9IG5ldyBBcHBsaWNhdGlvbkNvbW1hbmRJbnRlcmFjdGlvbihnYXRld2F5LmNsaWVudCwgZCwge1xuICAgICAgbWVtYmVyLFxuICAgICAgZ3VpbGQsXG4gICAgICBjaGFubmVsLFxuICAgICAgdXNlcixcbiAgICAgIHJlc29sdmVkXG4gICAgfSlcbiAgfSBlbHNlIGlmIChkLnR5cGUgPT09IEludGVyYWN0aW9uVHlwZS5BVVRPQ09NUExFVEUpIHtcbiAgICBpbnRlcmFjdGlvbiA9IG5ldyBBdXRvY29tcGxldGVJbnRlcmFjdGlvbihnYXRld2F5LmNsaWVudCwgZCwge1xuICAgICAgbWVtYmVyLFxuICAgICAgZ3VpbGQsXG4gICAgICBjaGFubmVsLFxuICAgICAgdXNlcixcbiAgICAgIHJlc29sdmVkXG4gICAgfSlcbiAgfSBlbHNlIGlmIChkLnR5cGUgPT09IEludGVyYWN0aW9uVHlwZS5NRVNTQUdFX0NPTVBPTkVOVCkge1xuICAgIGludGVyYWN0aW9uID0gbmV3IE1lc3NhZ2VDb21wb25lbnRJbnRlcmFjdGlvbihnYXRld2F5LmNsaWVudCwgZCwge1xuICAgICAgbWVtYmVyLFxuICAgICAgZ3VpbGQsXG4gICAgICBjaGFubmVsLFxuICAgICAgdXNlcixcbiAgICAgIG1lc3NhZ2VcbiAgICB9KVxuICB9IGVsc2UgaWYgKGQudHlwZSA9PT0gSW50ZXJhY3Rpb25UeXBlLk1PREFMX1NVQk1JVCkge1xuICAgIGludGVyYWN0aW9uID0gbmV3IE1vZGFsU3VibWl0SW50ZXJhY3Rpb24oZ2F0ZXdheS5jbGllbnQsIGQsIHtcbiAgICAgIG1lbWJlcixcbiAgICAgIGd1aWxkLFxuICAgICAgY2hhbm5lbCxcbiAgICAgIHVzZXJcbiAgICB9KVxuICB9IGVsc2Uge1xuICAgIGludGVyYWN0aW9uID0gbmV3IEludGVyYWN0aW9uKGdhdGV3YXkuY2xpZW50LCBkLCB7XG4gICAgICBtZW1iZXIsXG4gICAgICBndWlsZCxcbiAgICAgIGNoYW5uZWwsXG4gICAgICB1c2VyLFxuICAgICAgbWVzc2FnZVxuICAgIH0pXG4gIH1cblxuICBnYXRld2F5LmNsaWVudC5lbWl0KCdpbnRlcmFjdGlvbkNyZWF0ZScsIGludGVyYWN0aW9uKVxufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLG1FQUFtRSxHQUNuRSxTQUFTLEtBQUssUUFBUSw0QkFBMkI7QUFDakQsU0FBUyxNQUFNLFFBQVEsNkJBQTRCO0FBQ25ELFNBRUUsNkJBQTZCLFFBQ3hCLHlDQUF3QztBQUMvQyxTQUFTLDJCQUEyQixRQUFRLHdDQUF1QztBQUNuRixTQUNFLFdBQVcsRUFDWCxrQkFBa0IsUUFDYixtQ0FBa0M7QUFFekMsU0FFRSxlQUFlLFFBQ1YsOEJBQTZCO0FBRXBD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