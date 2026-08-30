/**
 * @file cva-blocklist.node.test.ts
 * @description Tests for the custom cva-blocklist ESLint rule.
 */

import { describe, expect, test } from "vitest";

import {
    checkTokenAgainstBlocklist,
    extractClassTokens,
} from "./cva-blocklist.ts";

const SAMPLE_BLOCKLIST = [
    /^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/,
    /^(?:[a-z-]+-)?(?:slate|gray|zinc|neutral|stone|blue|green|orange|red)(?:-\d+)?(?:\/\d+)?$/,
    /^z-(\[?(?:[1-9]\d{4,})\]?)$/,
    /^aria-disabled:/,
];

describe("cva-blocklist helper functions", () => {
    describe("extractClassTokens", () => {
        test("should split simple class strings", () => {
            expect(extractClassTokens("flex gap-2 p-4")).toEqual([
                "flex",
                "gap-2",
                "p-4",
            ]);
        });

        test("should expand UnoCSS variant groups correctly", () => {
            expect(
                extractClassTokens("disabled:(opacity-40 pointer-events-none cursor-not-allowed)")
            ).toEqual([
                "disabled:opacity-40",
                "disabled:pointer-events-none",
                "disabled:cursor-not-allowed",
            ]);
        });

        test("should expand multiple variant groups in one string", () => {
            expect(
                extractClassTokens(
                    "inline-flex dark:(bg-base-100 text-white) hover:(scale-105 opacity-90)"
                )
            ).toEqual([
                "inline-flex",
                "dark:bg-base-100",
                "dark:text-white",
                "hover:scale-105",
                "hover:opacity-90",
            ]);
        });
    });

    describe("checkTokenAgainstBlocklist", () => {
        test("should allow valid semantic color tokens", () => {
            expect(checkTokenAgainstBlocklist("bg-accent-500", SAMPLE_BLOCKLIST)).toBeNull();
            expect(checkTokenAgainstBlocklist("bg-danger-500", SAMPLE_BLOCKLIST)).toBeNull();
            expect(checkTokenAgainstBlocklist("bg-success-600", SAMPLE_BLOCKLIST)).toBeNull();
            expect(checkTokenAgainstBlocklist("bg-base-900", SAMPLE_BLOCKLIST)).toBeNull();
            expect(checkTokenAgainstBlocklist("bg-elevation-2", SAMPLE_BLOCKLIST)).toBeNull();
            expect(checkTokenAgainstBlocklist("text-strong", SAMPLE_BLOCKLIST)).toBeNull();
            expect(checkTokenAgainstBlocklist("font-500", SAMPLE_BLOCKLIST)).toBeNull();
        });

        test("should block raw non-semantic color names", () => {
            expect(checkTokenAgainstBlocklist("bg-red-500", SAMPLE_BLOCKLIST)).toBe("bg-red-500");
            expect(checkTokenAgainstBlocklist("text-blue-400", SAMPLE_BLOCKLIST)).toBe("text-blue-400");
            expect(checkTokenAgainstBlocklist("border-green-600", SAMPLE_BLOCKLIST)).toBe("border-green-600");
            expect(checkTokenAgainstBlocklist("bg-slate-800", SAMPLE_BLOCKLIST)).toBe("bg-slate-800");
            expect(checkTokenAgainstBlocklist("bg-zinc-100", SAMPLE_BLOCKLIST)).toBe("bg-zinc-100");
        });

        test("should block raw colors wrapped with variant prefixes", () => {
            expect(checkTokenAgainstBlocklist("hover:bg-red-500", SAMPLE_BLOCKLIST)).toBe("hover:bg-red-500");
            expect(checkTokenAgainstBlocklist("dark:text-blue-400", SAMPLE_BLOCKLIST)).toBe("dark:text-blue-400");
            expect(checkTokenAgainstBlocklist("active:border-green-600", SAMPLE_BLOCKLIST)).toBe("active:border-green-600");
        });

        test("should block named font weights", () => {
            expect(checkTokenAgainstBlocklist("font-bold", SAMPLE_BLOCKLIST)).toBe("font-bold");
            expect(checkTokenAgainstBlocklist("font-medium", SAMPLE_BLOCKLIST)).toBe("font-medium");
            expect(checkTokenAgainstBlocklist("font-semibold", SAMPLE_BLOCKLIST)).toBe("font-semibold");
        });

        test("should block excessive z-indices", () => {
            expect(checkTokenAgainstBlocklist("z-10000", SAMPLE_BLOCKLIST)).toBe("z-10000");
            expect(checkTokenAgainstBlocklist("z-99999", SAMPLE_BLOCKLIST)).toBe("z-99999");
        });

        test("should block aria-disabled prefix", () => {
            expect(checkTokenAgainstBlocklist("aria-disabled:opacity-50", SAMPLE_BLOCKLIST)).toBe("aria-disabled:opacity-50");
        });
    });
});
