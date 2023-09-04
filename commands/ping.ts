import { Harmony } from "../deps.ts";
import CCommand from "../classes/customCommand.ts";

export default class Ping extends CCommand {
    name = "ping";
    description?: string = "Pong!";
    async execute(ctx: Harmony.Interaction) {
        await ctx.respond({
            content: "Pong!"
        });
    }
}