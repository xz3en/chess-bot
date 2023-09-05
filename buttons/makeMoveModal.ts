import { Harmony } from "../deps.ts";
import { games, userGames } from "../mods.ts";

export default async function execute(ctx: Harmony.Interaction) {
    if (!ctx.data) return;
    if (!ctx.member) return;

    console.log(ctx.data);

    const gameId = userGames.get(ctx.member.user.id);

    if (!gameId) return;

    const game = games.get(gameId);

    if (!game) return;

    //game.move(ctx.data)

    await ctx.respond({
        content: "nuh uh",
        ephemeral: true
    })
}