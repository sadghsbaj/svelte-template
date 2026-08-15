/**
 * @file button.styles.ts
 * @description Playground button style recipe powered by cva.
 */

import { cva, type VariantProps } from "$utils";

export const buttonStyles = cva({
    base: {
        layout: "inline-flex items-center justify-center gap-2",
        typography: "font-500 select-none leading-none",
        frame: "squircle-smooth rounded-xl",
        interaction:
            "cursor-pointer active:scale-97 disabled:(opacity-40 pointer-events-none cursor-not-allowed)",
        motion: "t-all-150-quad-out",
        misc: "outline-none focus-visible:(ring-2 ring-accent-500/50 ring-offset-2)",
    },
    options: {
        variant: {
            solid: "text-white shadow-xs",
            subtle: "text-strong",
            outline: "border bg-transparent",
            ghost: "bg-transparent text-strong hover:bg-elevation-2",
        },
        size: {
            sm: "h-8 px-3 text-xs gap-1.5",
            md: "h-9.5 px-4 text-sm gap-2",
            lg: "h-11 px-5 text-base gap-2.5",
        },
    },
    modifiers: {
        fullWidth: "w-full",
        pill: "!rounded-full",
        loading: "opacity-80 pointer-events-none cursor-wait",
        square: "aspect-square p-0",
    },
    compounds: [
        // Solid variants
        {
            variant: "solid",
            color: "accent",
            class: "bg-accent-500 hover:bg-accent-600 active:bg-accent-700",
        },
        {
            variant: "solid",
            color: "danger",
            class: "bg-danger-500 hover:bg-danger-600 active:bg-danger-700",
        },
        {
            variant: "solid",
            color: "success",
            class: "bg-success-500 hover:bg-success-600 active:bg-success-700",
        },
        {
            variant: "solid",
            color: "base",
            class: "bg-base-900 text-base-50 hover:bg-base-800 dark:(bg-base-100 text-base-900 hover:bg-base-200)",
        },

        // Subtle variants
        {
            variant: "subtle",
            color: "accent",
            class: "bg-accent-500/15 text-accent-600 hover:bg-accent-500/25 dark:text-accent-400",
        },
        {
            variant: "subtle",
            color: "danger",
            class: "bg-danger-500/15 text-danger-600 hover:bg-danger-500/25 dark:text-danger-400",
        },
        {
            variant: "subtle",
            color: "success",
            class: "bg-success-500/15 text-success-600 hover:bg-success-500/25 dark:text-success-400",
        },
        {
            variant: "subtle",
            color: "base",
            class: "bg-elevation-2 text-strong hover:bg-elevation-3",
        },

        // Outline variants
        {
            variant: "outline",
            color: "accent",
            class: "border-accent-500/40 text-accent-500 hover:bg-accent-500/10",
        },
        {
            variant: "outline",
            color: "danger",
            class: "border-danger-500/40 text-danger-500 hover:bg-danger-500/10",
        },
        {
            variant: "outline",
            color: "success",
            class: "border-success-500/40 text-success-500 hover:bg-success-500/10",
        },
        {
            variant: "outline",
            color: "base",
            class: "border-base-300 text-strong hover:bg-elevation-2 dark:border-base-700",
        },
    ],
    defaults: {
        variant: "solid",
        color: "accent",
        size: "md",
        fullWidth: false,
    },
});

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
