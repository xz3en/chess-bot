import { fileLetters } from "./constants.ts";

export interface Vector2 {
    x: number,
    y: number
}

export function positionToString(x: number,y: number): string {
    return `${fileLetters.at(x)}${y}`;
}

export function stringToPosition(position: string): Vector2 {
    return {
        x: fileLetters.indexOf(position[0]),
        y: Number(position[1])
    }
}