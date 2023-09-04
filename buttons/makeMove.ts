import { Harmony } from "../deps.ts";

export default async function execute(ctx: Harmony.Interaction) {
    await ctx.showModal({
        title: "Make a move",
        customID: "makeMoveModal",
        components: [
            {
                type: Harmony.MessageComponentType.ACTION_ROW,
                components: [
                    {
                        type: Harmony.MessageComponentType.TEXT_INPUT,
                        customID: "oldPosition",
                        label: "Selected piece position",
                        style: Harmony.TextInputStyle.SHORT,
                        placeholder: "a1"
                    }
                ]
            },
            {
                type: Harmony.MessageComponentType.ACTION_ROW,
                components: [
                    {
                        type: Harmony.MessageComponentType.TEXT_INPUT,
                        customID: "newPosition",
                        label: "Move position",
                        style: Harmony.TextInputStyle.SHORT,
                        placeholder: "h8"
                    }
                ]
            }
        ]
    });
}