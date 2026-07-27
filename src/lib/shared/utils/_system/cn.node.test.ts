/**
 * @file cn.node.test.ts
 * @description Unit tests for the class name utility function cn.
 * Tests primitives, arrays, objects, recursion, falsy values, and inheritance.
 */

import { describe, expect, test } from "vitest";

import { cn } from "./cn";

describe("cn (class name utility)", () => {
    test("should join standard strings and numbers", () => {
        expect(cn("foo", "bar")).toBe("foo bar");
        expect(cn("foo", 123)).toBe("foo 123");
    });

    test("should ignore all falsy values", () => {
        expect(cn("foo", null, undefined, false, "", 0)).toBe("foo");
    });

    test("should handle nested arrays recursively", () => {
        expect(cn("foo", ["bar", ["baz", null, "qux"]])).toBe("foo bar baz qux");
    });

    test("should handle objects for conditional classes", () => {
        expect(cn("foo", { bar: true, baz: false, active: 1 })).toBe("foo bar active");
    });

    test("should handle mixed input types", () => {
        expect(cn("foo", ["bar", { baz: true }], { active: false })).toBe("foo bar baz");
    });

    test("should ignore inherited properties of objects", () => {
        const proto = { inheritedClass: true };
        const obj = Object.create(proto);
        obj.ownClass = true;

        expect(cn(obj)).toBe("ownClass");
    });
});
