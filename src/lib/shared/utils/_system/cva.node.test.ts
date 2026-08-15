/**
 * @file cva.node.test.ts
 * @description Unit and type tests for the cva style recipe engine.
 * Covers base slots, boolean dictionaries, numeric options, modifiers, compound rules, defaults, prototype safety, and type inference.
 */

import { describe, expect, expectTypeOf, test } from "vitest";

import { cva, type VariantProps } from "./cva";

describe("cva (class variance authority)", () => {
    test("should resolve base styles from strings, arrays, structured slots, and boolean dictionaries", () => {
        const recipeString = cva({ base: "btn flex" });
        const recipeArray = cva({ base: ["btn", "flex"] });
        const recipeSlots = cva({
            base: {
                layout: "flex items-center",
                frame: "rounded bg-elevation-1",
            },
        });
        const recipeDict = cva({
            base: {
                "btn-primary": true,
                "btn-disabled": false,
                "cursor-pointer": true,
            },
        });

        expect(recipeString()).toBe("btn flex");
        expect(recipeArray()).toBe("btn flex");
        expect(recipeSlots()).toBe("flex items-center rounded bg-elevation-1");
        expect(recipeDict()).toBe("btn-primary cursor-pointer");
    });

    test("should resolve string and numeric options and apply defaults", () => {
        const recipe = cva({
            options: {
                variant: {
                    solid: "bg-accent-500 text-white",
                    outline: "border border-accent-500",
                },
                cols: {
                    1: "grid-cols-1",
                    2: "grid-cols-2",
                    12: "grid-cols-12",
                },
                size: {
                    sm: "h-8 text-xs",
                    md: "h-10 text-sm",
                },
            },
            defaults: {
                variant: "solid",
                cols: 1,
                size: "md",
            },
        });

        expect(recipe()).toBe("bg-accent-500 text-white grid-cols-1 h-10 text-sm");
        expect(recipe({ variant: "outline", cols: 2 })).toBe(
            "border border-accent-500 grid-cols-2 h-10 text-sm"
        );
        expect(recipe({ cols: 12, size: "sm" })).toBe(
            "bg-accent-500 text-white grid-cols-12 h-8 text-xs"
        );
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

    test("should append ad-hoc consumer class and className overrides, including defaults", () => {
        const recipe = cva({ base: "btn" });

        expect(recipe({ class: "my-custom-class" })).toBe("btn my-custom-class");
        expect(recipe({ className: "my-custom-class" })).toBe("btn my-custom-class");

        const recipeWithDefaultClasses = cva({
            base: "btn",
            defaults: {
                class: "default-class",
                className: "default-classname",
            },
        });

        expect(recipeWithDefaultClasses()).toBe("btn default-class default-classname");
        expect(recipeWithDefaultClasses({ class: "override-class" })).toBe(
            "btn override-class default-classname"
        );
    });

    test("should safely ignore prototype properties and prevent prototype pollution", () => {
        const protoObject = Object.create({ inheritedKey: "should-not-appear" }) as {
            [key: string]: unknown;
            variant?: "solid";
        };
        protoObject.variant = "solid";

        const recipe = cva({
            options: {
                variant: {
                    solid: "bg-solid",
                },
            },
        });

        expect(recipe(protoObject)).toBe("bg-solid");

        // Passing prototype property keys directly
        expect(recipe({ variant: "toString" as unknown as "solid" })).toBe("");
        expect(recipe({ variant: "valueOf" as unknown as "solid" })).toBe("");
    });

    test("type tests: VariantProps preserves full option unions and supports ad-hoc compound keys", () => {
        const buttonRecipe = cva({
            options: {
                variant: {
                    solid: "bg-solid",
                    outline: "border",
                    ghost: "bg-transparent",
                },
                size: {
                    sm: "h-8",
                    md: "h-10",
                },
                cols: {
                    1: "grid-1",
                    2: "grid-2",
                },
            },
            modifiers: {
                fullWidth: "w-full",
                loading: "opacity-50",
            },
            compounds: [
                {
                    variant: "solid",
                    tone: "critical",
                    class: "bg-red-500",
                },
            ],
            defaults: {
                variant: "solid",
                tone: "critical",
            },
        });

        type ButtonProps = VariantProps<typeof buttonRecipe>;

        // Ensure declared options union was NOT narrowed to just "solid" by the compound rule
        expectTypeOf<ButtonProps["variant"]>().toEqualTypeOf<
            "solid" | "outline" | "ghost" | undefined
        >();

        // Ensure numeric option types are preserved
        expectTypeOf<ButtonProps["cols"]>().toEqualTypeOf<1 | 2 | undefined>();

        // Ensure boolean modifiers are inferred
        expectTypeOf<ButtonProps["fullWidth"]>().toEqualTypeOf<boolean | undefined>();
        expectTypeOf<ButtonProps["loading"]>().toEqualTypeOf<boolean | undefined>();

        // Ensure ad-hoc compound key "tone" is inferred
        expectTypeOf<ButtonProps["tone"]>().toEqualTypeOf<"critical" | undefined>();

        // Ensure class and className overrides are supported
        expectTypeOf<ButtonProps["class"]>().toEqualTypeOf<
            | string
            | number
            | bigint
            | boolean
            | undefined
            | null
            | Record<string, unknown>
            | import("./cn").ClassValue[]
        >();

        // Ensure higher-order / wrapped recipe function inference works
        const wrappedRecipe = (props?: ButtonProps): string => buttonRecipe(props);
        type WrappedProps = VariantProps<typeof wrappedRecipe>;
        expectTypeOf<WrappedProps>().toEqualTypeOf<ButtonProps>();

        expect(buttonRecipe()).toBe("bg-solid bg-red-500");
        expect(wrappedRecipe()).toBe("bg-solid bg-red-500");
    });
});
