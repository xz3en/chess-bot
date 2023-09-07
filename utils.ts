import { fileLetters } from "./constants.ts";

export interface Vector2 {
    x: number,
    y: number
}

export function positionToString(position: Vector2): string {
    return `${fileLetters.at(position.x - 1)}${position.y}`;
}

export function stringToPosition(position: string): Vector2 {
    return {
        x: fileLetters.indexOf(position[0]) + 1,
        y: Number(position[1])
    }
}

export function sumVectors(vectors: Vector2[]): Vector2 {
    const vectorsSummed = {
        x: 0,
        y: 0
    };

    for (const vector of vectors) {
        vectorsSummed.x += vector.x;
        vectorsSummed.y += vector.y;
    }

    return vectorsSummed;
}