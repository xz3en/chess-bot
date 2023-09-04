import { Harmony, Canvas } from "../deps.ts";
import CCommand from "../classes/customCommand.ts";

// Types

type PieceType = "pawn" | "rook" | "knight" | "bishop" | "king" | "queen"
type PieceColor = "white" | "black"

// Interfaces

interface Piece {
    type: PieceType,
    color: PieceColor
}

// Classes

class Square {
    piece?: Piece
    constructor(
        public x: number,
        public y: number,
        public position: string,
        public color: PieceColor
    ) {

    }
}

class Board {
    canvas!: Canvas.EmulatedCanvas2D;
    context!: Canvas.CanvasRenderingContext2D;
    constructor(public size: number) {
        this.canvas = Canvas.createCanvas(size,size);
        this.context = this.canvas.getContext("2d");
    }
}

export class Game {
    board: Map<string,Square> = new Map<string,Square>;
    canvas!: Board;
    
    constructor() {
        this.canvas = new Board(600);
    }

    updateSquare(position: string,piece?: Piece) {
        const square = this.board.get(position);
        if (!square) return;
        square.piece = piece;
    }

    move(oldPosition: string,newPosition: string) {
        const square1 = this.board.get(oldPosition);
        const square2 = this.board.get(newPosition);

        if (!square1 || !square2) return false;
        if (!square1.piece) return false;
        if (square2.piece && (square1.piece.color === square2.piece.color)) return false;

        square2.piece = square1.piece;
        square1.piece = undefined;

        this.board.set(oldPosition,square1);
        this.board.set(newPosition,square2);

        return true
    }

    async updateBoard() {
        for (const [_position,square] of this.board.entries()) {
            if (!square.piece) continue;
            const imagePath = `assets/pieces/${square.piece.color}/${square.piece.type}.png`;
            try {
                const image = await Canvas.loadImage(imagePath);
                this.canvas.context.drawImage(image,square.x,square.y,this.board.size + 10,this.board.size + 10);
            } catch (err) {
                console.log(err);
            }
        }
    }
}

// Variables

const messageComponents: Harmony.MessageComponentData[] = [
    {
        type: Harmony.MessageComponentType.ACTION_ROW,
        components: [
            {
                type: Harmony.MessageComponentType.BUTTON,
                style: Harmony.ButtonStyle.BLURPLE,
                label: "Make a move",
                customID: "makeMove"
            }
        ]
    }
]

const primaryColor = "#eeeed5"; // White
const secondaryColor = "#7c955b"; // Green
const fileLetters = "abcdefgh";

const games: Map<string,Game> = new Map<string,Game>;
const subcommandFunctions: Map<string,(ctx: Harmony.Interaction) => Promise<void>> = new Map<string,(ctx: Harmony.Interaction) => Promise<void>>;

subcommandFunctions.set(
    "play",
    async (ctx: Harmony.Interaction) => {
        if (!ctx.member || !ctx.data || !("options" in ctx.data)) return;
        if (!ctx.data.options[0]) return;
        
        console.log(ctx.data)
        const game = games.get(ctx.member.user.id);
        if (!game) {
            await createGame(ctx.member.user.id);
            const selfFunc = subcommandFunctions.get("play");
            if (selfFunc) {
                return selfFunc(ctx);
            }
        }
        if (!game) return;
        await game.updateBoard();
        ctx.respond({
            files: [
                new Harmony.MessageAttachment(
                    "board.png",
                    new Blob([game.canvas.canvas.toBuffer()])
                )
            ],
            embeds: [
                new Harmony.Embed()
                    .setTitle("Chess game")
                    .setImage("attachment://board.png")
            ],
            components: new Harmony.MessageComponents(...messageComponents)
        });
    }
);

// Functions

async function createGame(id: string) {
    if (games.get(id)) return;

    const game = new Game();
    const squareSize = game.canvas.size / 8;

    for (let x = 0; x < 8; x++) {
        const fileLetter = fileLetters.at(x);
        for (let y = 0; y < 8; y++) {
            const squarePosition = `${fileLetter}${(8 - y)}`
            game.canvas.context.fillStyle = ((x+y)%2==0) ? primaryColor:secondaryColor;
            const xOffset = x * squareSize;
            const yOffset = y * squareSize;
            game.canvas.context.fillRect(xOffset,yOffset,squareSize,squareSize);
            const square = new Square(
                xOffset,
                yOffset,
                squarePosition,
                ((x+y)%2==0) ? "white":"black"
            );
            game.board.set(squarePosition,square);
        }
    }

    // Create white pieces
    game.updateSquare(
        "a1",
        {
            type: "rook",
            color: "white"
        }
    );
    game.updateSquare(
        "b1",
        {
            type: "knight",
            color: "white"
        }
    );
    game.updateSquare(
        "c1",
        {
            type: "bishop",
            color: "white"
        }
    );
    game.updateSquare(
        "d1",
        {
            type: "king",
            color: "white"
        }
    );
    game.updateSquare(
        "e1",
        {
            type: "queen",
            color: "white"
        }
    );
    game.updateSquare(
        "f1",
        {
            type: "bishop",
            color: "white"
        }
    );
    game.updateSquare(
        "g1",
        {
            type: "knight",
            color: "white"
        }
    );
    game.updateSquare(
        "h1",
        {
            type: "rook",
            color: "white"
        }
    );
    // Create black pieces
    game.updateSquare(
        "a8",
        {
            type: "rook",
            color: "black"
        }
    );
    game.updateSquare(
        "b8",
        {
            type: "knight",
            color: "black"
        }
    );
    game.updateSquare(
        "c8",
        {
            type: "bishop",
            color: "black"
        }
    );
    game.updateSquare(
        "d8",
        {
            type: "king",
            color: "black"
        }
    );
    game.updateSquare(
        "e8",
        {
            type: "queen",
            color: "black"
        }
    );
    game.updateSquare(
        "f8",
        {
            type: "bishop",
            color: "black"
        }
    );
    game.updateSquare(
        "g8",
        {
            type: "knight",
            color: "black"
        }
    );
    game.updateSquare(
        "h8",
        {
            type: "rook",
            color: "black"
        }
    );

    for (let i=1;i <= 8;i++) {
        const file = fileLetters.at(i - 1);
        game.updateSquare(
            `${file}2`,
            {
                type: "pawn",
                color: "white"
            }
        );
        game.updateSquare(
            `${file}7`,
            {
                type: "pawn",
                color: "black"
            }
        );
    }

    await game.updateBoard();

    games.set(id,game);
}

export default class Chess extends CCommand {
    name = "chess";
    description?: string | undefined = "Chess related commands";
    options: Harmony.SlashCommandOption[] = [
        {
            name: "play",
            description: "Play chess with someone",
            type: Harmony.ApplicationCommandOptionType.SUB_COMMAND,
            options: [
                {
                    type: Harmony.ApplicationCommandOptionType.USER,
                    name: "opponent",
                    description: "Who you want to play against",
                    required: true
                }
            ]
        }
    ]
    async execute(ctx: Harmony.Interaction) {
        if (!ctx.data || !("options" in ctx.data) || !ctx.data.options[0]) return;

        const func = subcommandFunctions.get(ctx.data.options[0].name);

        if (!func) return;
        
        await func(ctx);
    }
}