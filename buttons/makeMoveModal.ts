import { Harmony } from "../deps.ts";
import { games, userGames } from "../mods.ts";

export default async function execute(ctx: Harmony.Interaction) {
    if (!ctx.data) return;
    if (!("components" in ctx.data) || (!ctx.data.components[0] && !ctx.data.components[1])) return;
    if (!ctx.data.components[0].components[0] || !ctx.data.components[1].components[0]) return;
    if (!ctx.member) return;

    const startPos = ctx.data.components[0].components[0].value;
    const endPos = ctx.data.components[1].components[0].value;

    const gameId = userGames.get(ctx.member.user.id);

    if (!gameId) return;

    const game = games.get(gameId);

    if (!game) return;

    const valid = await game.move(startPos,endPos);

    if (valid) {
        await ctx.respond({
            type: Harmony.InteractionResponseType.DEFERRED_MESSAGE_UPDATE
        });
    } else {
        await ctx.respond({
            content: "This move is illegal",
            ephemeral: true
        });
    }
}