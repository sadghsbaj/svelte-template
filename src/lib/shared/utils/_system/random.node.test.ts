import { describe, expect, test } from "vitest";

import {
    randomBool,
    randomFloat,
    randomInt,
    randomItem,
    randomString,
    shuffle,
    uuid,
    weightedRandom,
} from "./random";

describe("Random Utilities", () => {
    describe("uuid", () => {
        test("should generate valid v4 UUIDs", () => {
            const id = uuid();
            expect(id).toHaveLength(36);

            // Validate UUID v4 format
            const v4Regex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(id).toMatch(v4Regex);
        });

        test("should generate unique UUIDs", () => {
            const ids = new Set<string>();
            for (let i = 0; i < 100; i++) {
                ids.add(uuid());
            }
            expect(ids.size).toBe(100);
        });
    });

    describe("randomInt", () => {
        test("should return integers within range (inclusive)", () => {
            for (let i = 0; i < 100; i++) {
                const val = randomInt(5, 10);
                expect(Number.isSafeInteger(val)).toBe(true);
                expect(val).toBeGreaterThanOrEqual(5);
                expect(val).toBeLessThanOrEqual(10);
            }
        });

        test("should handle single value range", () => {
            expect(randomInt(7, 7)).toBe(7);
        });
    });

    describe("randomFloat", () => {
        test("should return float within range", () => {
            for (let i = 0; i < 100; i++) {
                const val = randomFloat(1.5, 4.5);
                expect(val).toBeGreaterThanOrEqual(1.5);
                expect(val).toBeLessThan(4.5);
            }
        });
    });

    describe("randomItem", () => {
        test("should return undefined for empty arrays", () => {
            expect(randomItem([])).toBeUndefined();
        });

        test("should return an item from the array", () => {
            const arr = ["apple", "banana", "cherry"];
            for (let i = 0; i < 50; i++) {
                const item = randomItem(arr);
                expect(arr).toContain(item);
            }
        });

        test("should return the only item in a single-element array", () => {
            expect(randomItem([42])).toBe(42);
        });
    });

    describe("shuffle", () => {
        test("should return a new array containing same elements", () => {
            const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const shuffled = shuffle(original);

            expect(shuffled).not.toBe(original);
            expect(shuffled).toHaveLength(original.length);
            expect(shuffled).toEqual(expect.arrayContaining(original));
        });

        test("should not modify the original array", () => {
            const original = [1, 2, 3];
            shuffle(original);
            expect(original).toEqual([1, 2, 3]);
        });
    });

    describe("randomString", () => {
        test("should return string of specified length", () => {
            expect(randomString(10)).toHaveLength(10);
            expect(randomString(0)).toHaveLength(0);
        });

        test("should only contain characters from the provided set", () => {
            const chars = "abc";
            for (let i = 0; i < 50; i++) {
                const str = randomString(15, chars);
                for (const char of str) {
                    expect(chars).toContain(char);
                }
            }
        });
    });

    describe("randomBool", () => {
        test("should always return true for probability 1", () => {
            for (let i = 0; i < 50; i++) {
                expect(randomBool(1)).toBe(true);
            }
        });

        test("should always return false for probability 0", () => {
            for (let i = 0; i < 50; i++) {
                expect(randomBool(0)).toBe(false);
            }
        });
    });

    describe("weightedRandom", () => {
        test("should return undefined for invalid arguments", () => {
            expect(weightedRandom([], [])).toBeUndefined();
            expect(weightedRandom(["a"], [1, 2])).toBeUndefined();
        });

        test("should respect absolute weights", () => {
            // One item has positive weight, other has zero
            const item = weightedRandom(["a", "b"], [1, 0]);
            expect(item).toBe("a");
        });

        test("should select items based on relative weights", () => {
            const items = ["a", "b"];
            const weights = [10, 90];
            const counts = { a: 0, b: 0 };

            for (let i = 0; i < 1000; i++) {
                const item = weightedRandom(items, weights);
                if (item) counts[item as "a" | "b"]++;
            }

            // Roughly check distribution (a should be selected less than b)
            expect(counts.a).toBeLessThan(counts.b);
            expect(counts.b).toBeGreaterThan(700);
        });
    });
});
