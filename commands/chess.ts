import { 
    Harmony, 
    Canvas, 
    fileLetters, 
    stringToPosition, 
    positionToString, 
    Vector2, 
    directionOffsets,
    sleep
} from "../deps.ts";
import { games, userGames } from "../mods.ts";
import CCommand from "../classes/customCommand.ts";

// Types

export type PieceType = "pawn" | "rook" | "knight" | "bishop" | "king" | "queen"
export type PieceColor = "white" | "black"

// Interfaces

interface Piece {
    type: PieceType,
    color: PieceColor
}

interface LegalMoves {
    up: string[],
    down: string[],
    left: string[],
    right: string[],

    upleft: string[],
    downleft: string[],
    upright: string[],
    downright: string[]
}

// Classes

class Square {
    piece?: Piece
    rank: number;
    file: number;
    constructor(
        public relX: number,
        public relY: number,
        public position: string,
        public color: PieceColor
    ) {
        const pos = stringToPosition(position);
        this.rank = pos.x;
        this.file = pos.y;
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
    moveData: Map<string,LegalMoves> = new Map<string,LegalMoves>;
    canvas!: Board;
    
    constructor(public ctx: Harmony.Interaction) {
        this.canvas = new Board(600);
    }

    async checkIfMoveLegal(pos1: string,pos2: string,opponentColor: PieceColor) {
        const square1 = this.board.get(pos1);
        const square2 = this.board.get(pos2);

        if (!square1 || !square2) return false;
        if (!square1.piece) return false;

        const square1moveData = this.moveData.get(pos1);

        if (!square1moveData) return [];

        for (const [key,direction] of Object.entries(square1moveData)) {
            if (square1.piece) {
                if (
                    square1.piece.type === "bishop" &&
                    (
                        key === "up" ||
                        key === "down" ||
                        key === "left" ||
                        key === "right"
                    )
                ) {
                    continue;
                }

                if (
                    square1.piece.type === "rook" &&
                    (
                        key === "upleft" ||
                        key === "downleft" ||
                        key === "upright" ||
                        key === "downright"
                    )
                ) {
                    continue;
                }

                if (
                    square1.piece.type === "pawn" &&
                    (
                        (square1.piece.color === "white" && key !== "down") ||
                        (square1.piece.color === "black" && key !== "up")
                    )
                ) {
                    continue;
                }
            }
            for (const neighborSquarePos of direction) {
                const neighborSquare = this.board.get(neighborSquarePos);
                if (!neighborSquare) {
                    break;
                }
                if (neighborSquare.piece && neighborSquare.piece.color !== opponentColor) {
                    break;
                }
                if (neighborSquare.position === pos2) return true;
            }
        }

        return false;
    }

    precomputeMoves() {
        for (const [pos,square] of this.board.entries()) {
            const newMoveData: LegalMoves = {
                up: [],
                down: [],
                left: [],
                right: [],

                upleft: [],
                downleft: [],
                upright: [],
                downright: []
            };

            for (const direction of directionOffsets) {
                for (let i = 1; i <= 64; i++) {
                    const newPos: Vector2 = {
                        x: square.rank + direction.x * i,
                        y: square.file + direction.y * i
                    };
                    const stringPos = positionToString(newPos);
                    if (!this.board.get(stringPos)) continue;
                    if (newPos.x === 0) {
                        if (newPos.y > 0) {
                            newMoveData.up.push(stringPos);
                        } else {
                            newMoveData.down.push(stringPos);
                        }
                    } else if (newPos.y === 0) {
                        if (newPos.x > 0) {
                            newMoveData.right.push(stringPos);
                        } else {
                            newMoveData.left.push(stringPos);
                        }
                    } else {
                        if (newPos.x > 0 && newPos.y > 0) {
                            newMoveData.upright.push(stringPos);
                        } else if (newPos.x > 0 && newPos.y < 0) {
                            newMoveData.downright.push(stringPos);
                        }

                        if (newPos.x < 0 && newPos.y > 0) {
                            newMoveData.upleft.push(stringPos);
                        } else if (newPos.x < 0 && newPos.y < 0) {
                            newMoveData.downleft.push(stringPos);
                        }
                    }
                }
            }

            this.moveData.set(pos,newMoveData);
        }
    }

    updateMessage() {
        this.ctx.editResponse({
            files: [
                new Harmony.MessageAttachment(
                    "board.png",
                    new Blob([this.canvas.canvas.toBuffer()])
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

    updateSquare(position: string,piece?: Piece) {
        const square = this.board.get(position);
        if (!square) return;
        square.piece = piece;
    }



    async move(oldPosition: string,newPosition: string) {
        const square1 = this.board.get(oldPosition);
        const square2 = this.board.get(newPosition);

        if (!square1 || !square2) return false;
        if (!square1.piece) return false;
        if (square2.piece && (square1.piece.color === square2.piece.color)) return false;
        if (!(await this.checkIfMoveLegal(oldPosition,newPosition,"black"))) return false;

        square2.piece = square1.piece;
        square1.piece = undefined;

        this.board.set(oldPosition,square1);
        this.board.set(newPosition,square2);

        await this.updateBoard();

        this.updateMessage();

        return true
    }

    async updateBoard() {
        for (const [_position,square] of this.board.entries()) {
            if (!square.piece) {
                let color = primaryColor;
                if (square.color === "black"){
                    color = secondaryColor;
                }
                this.canvas.context.fillStyle = color;
                this.canvas.context.fillRect(square.relX,square.relY,this.canvas.size / 8,this.canvas.size / 8);
            }
            if (!square.piece) continue;
            const imagePath = `assets/pieces/${square.piece.color}/${square.piece.type}.png`;
            try {
                const image = await Canvas.loadImage(imagePath);
                this.canvas.context.drawImage(image,square.relX,square.relY,this.canvas.size / 8,this.canvas.size / 8);
            } catch (err) {
                console.log(err);
            }
        }
    }
}

// Variables

const date = new Date();

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

// Functions

async function createGame(id: string,ctx: Harmony.Interaction) {
    if (games.get(id)) return;

    const game = new Game(ctx);
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

    game.precomputeMoves();

    await game.updateBoard();

    games.set(id,game);

    console.log("Created a game with id " + id);
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

    subcommandFunctions: Map<string,(ctx: Harmony.Interaction) => Promise<void>> = new Map<string,(ctx: Harmony.Interaction) => Promise<void>>;
    
    constructor(public client: Harmony.Client) {
        super(client);
        this.subcommandFunctions.set(
            "play",
            async (ctx: Harmony.Interaction) => {
                if (!ctx.member || !ctx.data || !("options" in ctx.data)) return;
                if (!ctx.data.options[0] || !ctx.data.options[0].options || !ctx.data.options[0].options[0]) return;
                
                let ctx2 = undefined

                if (!ctx.responded) {
                    ctx2 = await ctx.respond({
                        content: "Making your game"
                    });
                }

                console.log(ctx2);

                const opponent = await client.users.fetch(ctx.data.options[0].options[0].value);
    
                const newGameId = String(date.getTime());
                
                userGames.set(ctx.member.user.id,newGameId);
                userGames.set(opponent.id,newGameId);

                const gameId = userGames.get(ctx.member.user.id);

                if (!gameId) return;

                const game = games.get(gameId);
                if (!game) {
                    if (!ctx2) return;
                    await createGame(gameId,ctx2);
                    const selfFunc = this.subcommandFunctions.get("play");
                    if (selfFunc) {
                        return selfFunc(ctx);
                    }
                }
                if (!game) return;
                await game.updateBoard();
                game.updateMessage();
            }
        );
    }

    async execute(ctx: Harmony.Interaction) {
        if (!ctx.data || !("options" in ctx.data) || !ctx.data.options[0]) return;

        const func = this.subcommandFunctions.get(ctx.data.options[0].name);

        if (!func) return;
        
        await func(ctx);
    }
}