import { describe, expect, test } from "vitest";

import { deepClone, deepMerge, isEqual, isPlainObject, omit, pick } from "./object";

describe("Object Utilities", () => {
    describe("isPlainObject", () => {
        test("should return true for plain objects", () => {
            expect(isPlainObject({})).toBe(true);
            expect(isPlainObject({ a: 1, b: "yes" })).toBe(true);
            expect(isPlainObject(new Object())).toBe(true);
            expect(isPlainObject(Object.create(null))).toBe(true);
        });

        test("should return false for arrays, null, and primitives", () => {
            expect(isPlainObject([])).toBe(false);
            expect(isPlainObject([1, 2, 3])).toBe(false);
            expect(isPlainObject(null)).toBe(false);
            expect(isPlainObject(undefined)).toBe(false);
            expect(isPlainObject(123)).toBe(false);
            expect(isPlainObject("string")).toBe(false);
            expect(isPlainObject(true)).toBe(false);
            expect(isPlainObject(Symbol("symbol"))).toBe(false);
        });

        test("should return false for built-in object instances", () => {
            expect(isPlainObject(new Date())).toBe(false);
            expect(isPlainObject(/regex/)).toBe(false);
            expect(isPlainObject(new Map())).toBe(false);
            expect(isPlainObject(new Set())).toBe(false);
            expect(isPlainObject(new Error("error"))).toBe(false);
        });

        test("should return false for custom class instances", () => {
            class CustomClass {}
            expect(isPlainObject(new CustomClass())).toBe(false);
        });
    });

    describe("pick", () => {
        test("should select specified keys from source object", () => {
            const obj = { a: 1, b: 2, c: 3 };
            const result = pick(obj, ["a", "c"]);
            expect(result).toEqual({ a: 1, c: 3 });
            // Type safety check: result keys should not have 'b'
            expect("b" in result).toBe(false);
        });

        test("should ignore keys that are not present in source object", () => {
            const obj = { a: 1 };
            // @ts-expect-error - testing non-existent keys runtime behavior
            const result = pick(obj, ["a", "z"]);
            expect(result).toEqual({ a: 1 });
            expect("z" in result).toBe(false);
        });

        test("should return empty object if keys array is empty", () => {
            const obj = { a: 1, b: 2 };
            const result = pick(obj, []);
            expect(result).toEqual({});
        });

        test("should not mutate the original object", () => {
            const obj = { a: 1, b: 2 };
            pick(obj, ["a"]);
            expect(obj).toEqual({ a: 1, b: 2 });
        });
    });

    describe("omit", () => {
        test("should exclude specified keys from source object", () => {
            const obj = { a: 1, b: 2, c: 3 };
            const result = omit(obj, ["b"]);
            expect(result).toEqual({ a: 1, c: 3 });
        });

        test("should return shallow clone if keys array is empty", () => {
            const obj = { a: 1, b: 2 };
            const result = omit(obj, []);
            expect(result).toEqual({ a: 1, b: 2 });
            expect(result).not.toBe(obj);
        });

        test("should ignore non-existent keys during omission", () => {
            const obj = { a: 1 };
            // @ts-expect-error - testing non-existent keys runtime behavior
            const result = omit(obj, ["z"]);
            expect(result).toEqual({ a: 1 });
        });

        test("should not mutate the original object", () => {
            const obj = { a: 1, b: 2 };
            omit(obj, ["a"]);
            expect(obj).toEqual({ a: 1, b: 2 });
        });
    });

    describe("deepMerge", () => {
        test("should merge flat objects without mutation", () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { b: 3, c: 4 };
            const result = deepMerge(obj1, obj2);

            expect(result).toEqual({ a: 1, b: 3, c: 4 });
            expect(obj1).toEqual({ a: 1, b: 2 });
            expect(obj2).toEqual({ b: 3, c: 4 });
        });

        test("should merge nested objects recursively", () => {
            const obj1 = { a: { x: 1, y: 2 } };
            const obj2 = { a: { y: 3, z: 4 } };
            const result = deepMerge(obj1, obj2);

            expect(result).toEqual({ a: { x: 1, y: 3, z: 4 } });
            // Ensure nested objects are new references
            expect(result.a).not.toBe(obj1.a);
            expect(result.a).not.toBe(obj2.a);
        });

        test("should overwrite target values with array values, cloning them", () => {
            const obj1 = { arr: [1, 2] };
            const obj2 = { arr: [3, 4] };
            const result = deepMerge(obj1, obj2);

            expect(result).toEqual({ arr: [3, 4] });
            expect(result.arr).not.toBe(obj2.arr); // array cloned
        });

        test("should overwrite target with source values when they are not plain objects (Dates, RegExps)", () => {
            const date1 = new Date(1000);
            const date2 = new Date(2000);
            const regex1 = /abc/;
            const regex2 = /xyz/;

            const obj1 = { date: date1, regex: regex1 };
            const obj2 = { date: date2, regex: regex2 };
            const result = deepMerge(obj1, obj2);

            expect(result.date).toBe(date2);
            expect(result.regex).toBe(regex2);
        });

        test("should handle undefined values in source safely", () => {
            const obj1 = { a: 1, b: 2 };
            const obj2 = { b: undefined, c: 3 };
            const result = deepMerge(obj1, obj2);

            // undefined in source does not overwrite target
            expect(result).toEqual({ a: 1, b: 2, c: 3 });
        });

        test("should clone nested objects when target doesn't have it", () => {
            const obj1 = {};
            const obj2 = { nested: { val: 42 } };
            const result = deepMerge(obj1, obj2);

            expect(result).toEqual({ nested: { val: 42 } });
            expect(result.nested).not.toBe(obj2.nested); // should be cloned
        });
    });

    describe("isEqual", () => {
        test("should return true for identical primitives", () => {
            expect(isEqual(1, 1)).toBe(true);
            expect(isEqual("test", "test")).toBe(true);
            expect(isEqual(true, true)).toBe(true);
            expect(isEqual(null, null)).toBe(true);
            expect(isEqual(undefined, undefined)).toBe(true);
        });

        test("should handle NaN and +0/-0 correct according to Object.is", () => {
            expect(isEqual(NaN, NaN)).toBe(true);
            expect(isEqual(0, -0)).toBe(false);
        });

        test("should return true for identical Dates and RegExps", () => {
            expect(isEqual(new Date(1000), new Date(1000))).toBe(true);
            expect(isEqual(new Date(1000), new Date(2000))).toBe(false);

            expect(isEqual(/abc/g, /abc/g)).toBe(true);
            expect(isEqual(/abc/g, /abc/i)).toBe(false);
        });

        test("should compare flat and nested arrays deeply", () => {
            expect(isEqual([1, 2, 3], [1, 2, 3])).toBe(true);
            expect(isEqual([1, 2, 3], [1, 2])).toBe(false);
            expect(isEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
            expect(isEqual([1, [2, 3]], [1, [2, 4]])).toBe(false);
        });

        test("should compare plain objects deeply", () => {
            expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
            expect(isEqual({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true); // order of keys does not matter
            expect(isEqual({ a: 1, b: 2 }, { a: 1, b: 3 })).toBe(false);
            expect(isEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
            expect(isEqual({ a: { x: 1 } }, { a: { x: 1 } })).toBe(true);
            expect(isEqual({ a: { x: 1 } }, { a: { x: 2 } })).toBe(false);
        });

        test("should compare objects with different prototypes as not equal", () => {
            const objA = { a: 1 };
            const objB = Object.create(null);
            objB.a = 1;

            expect(isEqual(objA, objB)).toBe(false);
        });

        test("should compare non-plain objects strictly by reference", () => {
            class CustomClass {
                constructor(public val: number) {}
            }
            const instance1 = new CustomClass(42);
            const instance2 = new CustomClass(42);

            expect(isEqual(instance1, instance1)).toBe(true);
            expect(isEqual(instance1, instance2)).toBe(false); // different instances, non-plain objects
        });
    });

    describe("deepClone", () => {
        test("should clone primitives directly", () => {
            expect(deepClone(42)).toBe(42);
            expect(deepClone("hello")).toBe("hello");
            expect(deepClone(null)).toBe(null);
        });

        test("should clone arrays and nested objects deeply", () => {
            const original = {
                a: 1,
                arr: [1, { x: 2 }],
                nested: { val: 42 },
            };
            const clone = deepClone(original);

            expect(clone).toEqual(original);
            expect(clone).not.toBe(original);
            expect(clone.arr).not.toBe(original.arr);
            expect(clone.arr[1]).not.toBe(original.arr[1]);
            expect(clone.nested).not.toBe(original.nested);
        });

        test("should clone Dates and RegExps correctly", () => {
            const original = {
                date: new Date(1000),
                regex: /abc/g,
            };
            const clone = deepClone(original);

            expect(clone.date).toBeInstanceOf(Date);
            expect(clone.date.getTime()).toBe(original.date.getTime());
            expect(clone.date).not.toBe(original.date);

            expect(clone.regex).toBeInstanceOf(RegExp);
            expect(clone.regex.source).toBe(original.regex.source);
            expect(clone.regex.flags).toBe(original.regex.flags);
            expect(clone.regex).not.toBe(original.regex);
        });

        test("should clone custom class instances using fallback", () => {
            class CustomClass {
                constructor(public val: number) {}
                getDoubled(): number {
                    return this.val * 2;
                }
            }
            const original = new CustomClass(10);
            const clone = deepClone(original);

            expect(clone).toBeInstanceOf(CustomClass);
            expect(clone.val).toBe(10);
            expect(clone.getDoubled()).toBe(20);
            expect(clone).not.toBe(original);
        });
    });
});
