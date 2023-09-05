import { Harmony } from "../deps.ts";
import { games } from "../mods.ts";

export default async function execute(ctx: Harmony.Interaction) {
    console.log(ctx.data);

    console.log(games);

    await ctx.respond({
        content: "nuh uh",
        ephemeral: true
    })
}