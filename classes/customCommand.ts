import { Harmony } from "../deps.ts";

export default class CCommand {
    name = "";
    description?: string;
    options: Harmony.SlashCommandOption[] = [];

    execute(_ctx: Harmony.Interaction) {

    }

    toObject(): Harmony.SlashCommandPartial {
        return {
            name: this.name,
            description: this.description,
            options: this.options
        }
    }
}