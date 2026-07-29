/**
 * @file Optimized and flexible random utilities for TypeScript applications.
 *
 * Provides functions for generating secure UUIDs, random numbers, shuffling arrays,
 * and generating alphanumeric strings with cryptographically secure defaults
 * where applicable.
 */

/**
 * Generates an RFC4122 v4 compliant UUID.
 * Uses the browser's secure crypto.randomUUID if available, falling back to
 * a secure getRandomValues-based or pseudorandom math-based implementation.
 */
export function uuid(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    const bytes = new Uint8Array(16);
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        crypto.getRandomValues(bytes);
    } else {
        for (let i = 0; i < 16; i++) {
            bytes[i] = Math.floor(Math.random() * 256);
        }
    }

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    let result = "";
    for (let i = 0; i < 16; i++) {
        if ([4, 6, 8, 10].includes(i)) {
            result += "-";
        }
        result += bytes[i].toString(16).padStart(2, "0");
    }
    return result;
}

/**
 * Returns a random integer between min and max (both inclusive).
 */
export function randomInt(min: number, max: number): number {
    const minCeil = Math.ceil(min);
    const maxFloor = Math.floor(max);
    return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

/**
 * Returns a random float between min (inclusive) and max (exclusive).
 */
export function randomFloat(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

/**
 * Returns a random item from the provided array, or undefined if the array is empty.
 */
export function randomItem<T>(arr: T[]): T | undefined {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * Returns a new array, leaving the original array unmodified.
 */
export function shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = result[i];
        result[i] = result[j];
        result[j] = temp;
    }
    return result;
}

/**
 * Generates a random alphanumeric string of a specified length.
 * Uses cryptographically secure random values where available, with a fallback.
 */
export function randomString(
    length: number,
    chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
): string {
    const charsLength = chars.length;
    let result = "";

    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const bytes = new Uint32Array(length);
        crypto.getRandomValues(bytes);
        for (let i = 0; i < length; i++) {
            result += chars.charAt(bytes[i] % charsLength);
        }
    } else {
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * charsLength));
        }
    }
    return result;
}

/**
 * Returns a random boolean based on a given probability.
 *
 * @param probability The chance of returning true, between 0 and 1 (default is 0.5).
 */
export function randomBool(probability = 0.5): boolean {
    return Math.random() < probability;
}

/**
 * Returns a random item from an array based on relative weights.
 *
 * @param items The items to select from.
 * @param weights The corresponding weights for each item.
 */
export function weightedRandom<T>(items: T[], weights: number[]): T | undefined {
    if (items.length === 0 || items.length !== weights.length) {
        return undefined;
    }

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    if (totalWeight <= 0) {
        return undefined;
    }

    const random = Math.random() * totalWeight;
    let cumulativeWeight = 0;

    for (const [i, item] of items.entries()) {
        cumulativeWeight += weights[i];
        if (random < cumulativeWeight) {
            return item;
        }
    }

    return items.at(-1);
}
