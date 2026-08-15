/**
 * @file cva.node.test.ts
 * @description Unit tests for the cva style recipe engine.
 * Covers base slots, options, modifiers, compound rules, defaults, overrides, array matching, and undefined-safety.
 */

import { describe, expect, test } from "vitest";

import { cva } from "./cva";

describe("cva (class variance authority)", () => {
    test("should resolve base styles from strings, arrays, and structured slots", () => {
        const recipeString = cva({ base: "btn flex" });
        const recipeArray = cva({ base: ["btn", "flex"] });
        const recipeSlots = cva({
            base: {
                layout: "flex items-center",
                frame: "rounded bg-elevation-1",
            },
        });

        expect(recipeString()).toBe("btn flex");
        expect(recipeArray()).toBe("btn flex");
        expect(recipeSlots()).toBe("flex items-center rounded bg-elevation-1");
    });

    test("should resolve options and apply defaults", () => {
        const recipe = cva({
            options: {
                variant: {
                    solid: "bg-accent-500 text-white",
                    outline: "border border-accent-500",
                },
                size: {
                    sm: "h-8 text-xs",
                    md: "h-10 text-sm",
                },
            },
            defaults: {
                variant: "solid",
                size: "md",
            },
        });

        expect(recipe()).toBe("bg-accent-500 text-white h-10 text-sm");
        expect(recipe({ variant: "outline" })).toBe("border border-accent-500 h-10 text-sm");
        expect(recipe({ size: "sm" })).toBe("bg-accent-500 text-white h-8 text-xs");
    });

    test("should preserve default values when undefined is explicitly passed", () => {
        const recipe = cva({
            options: {
                variant: {
                    solid: "bg-accent-500",
                    outline: "border",
                },
            },
            defaults: {
                variant: "solid",
            },
        });

        expect(recipe({ variant: undefined })).toBe("bg-accent-500");
    });

    test("should resolve boolean modifiers correctly", () => {
        const recipe = cva({
            base: "btn",
            modifiers: {
                fullWidth: "w-full",
                pill: "rounded-full",
            },
        });

        expect(recipe()).toBe("btn");
        expect(recipe({ fullWidth: true })).toBe("btn w-full");
        expect(recipe({ fullWidth: false, pill: true })).toBe("btn rounded-full");
        expect(recipe({ fullWidth: true, pill: true })).toBe("btn w-full rounded-full");
    });

    test("should resolve compound matrix rules including multi-value array matching", () => {
        const recipe = cva({
            options: {
                variant: {
                    solid: "shadow-sm",
                    subtle: "bg-elevation-1",
                    outline: "border",
                },
            },
            compounds: [
                // Shared rule matching both solid and subtle
                {
                    variant: ["solid", "subtle"],
                    color: "accent",
                    class: "ring-accent-500",
                },
                // Specific rule for solid
                {
                    variant: "solid",
                    color: "accent",
                    class: "bg-accent-500 text-white",
                },
                // Specific rule for outline
                {
                    variant: "outline",
                    color: "accent",
                    class: "border-accent-500 text-accent-500",
                },
            ],
            defaults: {
                variant: "solid",
                color: "accent",
            },
        });

        // solid + accent matches shared rule + solid rule
        expect(recipe()).toBe("shadow-sm ring-accent-500 bg-accent-500 text-white");

        // subtle + accent matches shared rule only
        expect(recipe({ variant: "subtle", color: "accent" })).toBe(
            "bg-elevation-1 ring-accent-500"
        );

        // outline + accent matches outline rule only
        expect(recipe({ variant: "outline", color: "accent" })).toBe(
            "border border-accent-500 text-accent-500"
        );
    });

    test("should append ad-hoc consumer class overrides", () => {
        const recipe = cva({ base: "btn" });

        expect(recipe({ class: "my-custom-class" })).toBe("btn my-custom-class");
        expect(recipe({ className: "my-custom-class" })).toBe("btn my-custom-class");
    });
});
