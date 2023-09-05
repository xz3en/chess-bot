// Import some packages
import "https://deno.land/x/dotenv@v3.2.2/load.ts"
import { Harmony, Oak } from "./deps.ts";
import { Game } from "./commands/chess.ts";
import CCommand from "./classes/customCommand.ts";

// Webserver stuff
const port = Number(Deno.env.get("PORT")) || 3000;
const app = new Oak.Application();

export const games: Map<string,Game> = new Map<string,Game>;
export const userGames: Map<string,string> = new Map<string,string>;

// Command stuff

const commands: Map<string,CCommand> = new Map<string,CCommand>;

// We create a Harmony client
const client = new Harmony.Client({
    enableSlash: true,
    intents: [
        "GUILDS",
        "GUILD_MESSAGES",
        "GUILD_MEMBERS",
        "MESSAGE_CONTENT"
    ]
});

// Functions

async function setupCommands() {
    const commandObjects = []
    for (const file of Deno.readDirSync("commands")) {
        const commandObject: CCommand = new (await import(`./commands/${file.name}`)).default(client);
        
        commands.set(commandObject.name,commandObject);

        commandObjects.push(commandObject.toObject());
    }
    client.interactions.commands.bulkEdit(commandObjects)
}

// Client listeners
client.on("ready",(_shards: number) => {
    console.log(`Connected as ${client.user?.username}#${client.user?.discriminator}`);
    setupCommands();
});

client.on("interactionCreate",async (ctx: Harmony.Interaction) => {
    try {
        if (ctx.type === Harmony.InteractionType.APPLICATION_COMMAND) {
            if (!ctx.data || !("name" in ctx.data)) return;
            if (!ctx.guild) return await ctx.respond({content: "This command can only be used in guilds"});
    
            const command = commands.get(ctx.data.name);
    
            if (!command) return;
    
            await command.execute(ctx);
        } else if (ctx.type === Harmony.InteractionType.MESSAGE_COMPONENT || ctx.type === Harmony.InteractionType.MODAL_SUBMIT) {
            console.log(ctx.data);
            if (!ctx.data || !("custom_id" in ctx.data)) return;
            
            const func = (await import(`./buttons/${ctx.data.custom_id}.ts`)).default;

            await func(ctx);
        }
    } catch (err) {
        console.log(err);
        await ctx.respond({
            embeds: [
                new Harmony.Embed()
                    .setTitle("An error has occured")
                    .setDescription("```" + err + "```")
                    .setColor(255,0,0)
            ]
        })
    }
});

// Another webserver stuff wtf
app.use((ctx) => {
    ctx.response.body = "Works"
});

app.listen({port});
console.log(`Listening on port ${port}`);

client.connect();