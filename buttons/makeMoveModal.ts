import { Harmony } from "../deps.ts";

export default async function execute(ctx: Harmony.Interaction) {
    console.log(ctx.data);

    await ctx.respond({
        content: "nuh uh",
        ephemeral: true
    })
}