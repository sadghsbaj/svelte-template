import { cva, type VariantProps } from "$utils";

export const buttonStyles = cva({
    base: {
        layout: "inline-flex justify-center items-center shrink-0 w-fit select-none",
        typography: "font-600 leading-none",
        frame: "rounded-full squircle-smooth",
        interaction: "cursor-pointer active:scale-97",
        motion: "will-change-transform t:(scale-200-expo-out bg-200-quad-out text-200-quad-out border-200-quad-out shadow-200-quad-out)",
        misc: "isolate",
    },

    options: {
        variant: {
            solid: "",
            soft: "",
            outline: "bg-transparent border-2",
            elevate: "bg-white dark:bg-base-900 shadow-sm hover:shadow-md",
            ghost: "bg-transparent",
            plain: "bg-transparent h-fit! p-0!",
        },

        color: {
            accent: "",
            danger: "",
            base: "",
        },

        size: {
            sm: "h-9 px-3 text-xs gap-1",
            md: "h-10 px-4 text-sm gap-1.5",
            lg: "h-11 px-5 text-base gap-2",
        },
    },

    modifiers: {
        fullWidth: "w-full!",
        iconOnly: "p-0! aspect-square",
    },

    compounds: [
        // --- SOLID ---
        {
            variant: "solid",
            color: "accent",
            class: "bg-accent-solid-1 hover:bg-accent-solid-2 text-white",
        },
        {
            variant: "solid",
            color: "danger",
            class: "bg-danger-solid-1 hover:bg-danger-solid-2 text-white",
        },
        {
            variant: "solid",
            color: "base",
            class: "bg-base-solid-1 hover:bg-base-solid-2 text-base-50 dark:text-base-950",
        },

        // --- SOFT ---
        {
            variant: "soft",
            color: "accent",
            class: "bg-accent-soft-1 hover:bg-accent-soft-2 text-accent-solid-1",
        },
        {
            variant: "soft",
            color: "danger",
            class: "bg-danger-soft-1 hover:bg-danger-soft-2 text-danger-solid-1",
        },
        {
            variant: "soft",
            color: "base",
            class: "bg-base-soft-1 hover:(bg-base-soft-2 text-strong) text-main",
        },

        // --- Outline ---
        {
            variant: "outline",
            color: "accent",
            class: "text-accent-solid-1 border-accent-soft-2 hover:(bg-accent-soft-1 text-accent-solid-2)",
        },
        {
            variant: "outline",
            color: "danger",
            class: "text-danger-solid-1 border-danger-soft-2 hover:(bg-danger-soft-1 text-danger-solid-2)",
        },
        {
            variant: "outline",
            color: "base",
            class: "text-main border-base-soft-2 hover:(bg-base-soft-1 text-strong)",
        },

        // --- Elevate ---
        // Should only be used on elevation-0 e.g. in floating app style
        {
            variant: "elevate",
            color: "accent",
            class: "text-accent-solid-1 hover:(text-accent-solid-2)",
        },
        {
            variant: "elevate",
            color: "danger",
            class: "text-danger-solid-1 hover:(text-danger-solid-2)",
        },
        {
            variant: "elevate",
            color: "base",
            class: "text-main hover:(text-strong)",
        },

        // --- Ghost ---
        {
            variant: "ghost",
            color: "accent",
            class: "text-accent-solid-1 hover:(bg-accent-soft-1 text-accent-solid-2)",
        },
        {
            variant: "ghost",
            color: "danger",
            class: "text-danger-solid-1 hover:(bg-danger-soft-1 text-danger-solid-2)",
        },
        {
            variant: "ghost",
            color: "base",
            class: "text-main hover:(bg-base-soft-1 text-strong)",
        },

        // --- Plain ---
        {
            variant: "plain",
            color: "accent",
            class: "text-accent-solid-1 hover:(text-accent-solid-2)",
        },
        {
            variant: "plain",
            color: "danger",
            class: "text-danger-solid-1 hover:(text-danger-solid-2)",
        },
        {
            variant: "plain",
            color: "base",
            class: "text-main hover:(text-strong)",
        },
    ],

    defaults: {
        variant: "solid",
        color: "accent",
        size: "md",
    },
});

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
