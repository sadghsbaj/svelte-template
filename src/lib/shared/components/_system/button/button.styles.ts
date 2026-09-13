import { cva, type VariantProps } from "$utils";

export const buttonStyles = cva({
    base: {
        layout: "text-trim inline-flex items-center shrink-0 w-fit select-none",
        typography: "font-600 leading-normal",
        frame: "rounded-full squircle",
        interaction: "cursor-pointer active:scale-97",
        motion: "will-change-transform transform-gpu backface-hidden t:(scale-200-cubic-out bg-200-quad-out text-200-quad-out border-200-quad-out shadow-200-quad-out)",
        misc: "isolate",
    },

    options: {
        variant: {
            solid: "",
            "soft-outline": "border-2",
            soft: "",
            outline: "bg-transparent border-2",
            elevated:
                "bg-white dark:bg-base-900 shadow-sm hover:(shadow-md dark:bg-base-800) active:shadow-sm!",
            ghost: "bg-transparent",
            plain: "bg-transparent h-fit! p-0!",
        },

        color: {
            accent: "",
            danger: "",
            base: "",
        },

        size: {
            sm: "h-36px px-12px text-xs gap-4px [&_svg]:(size-14px stroke-2.5)",
            md: "h-40px px-16px text-sm gap-6px [&_svg]:(size-16px stroke-2.5)",
            lg: "h-44px px-20px  text-base gap-8px [&_svg]:(size-18px stroke-2.5)",
        },

        align: {
            center: "justify-center text-center",
            start: "justify-start text-left",
            end: "justify-end text-right",
            between: "justify-between",
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
            class: "bg-accent-solid-1 text-white hover:bg-accent-solid-2",
        },
        {
            variant: "solid",
            color: "danger",
            class: "bg-danger-solid-1 text-white hover:bg-danger-solid-2",
        },
        {
            variant: "solid",
            color: "base",
            class: "bg-base-solid-1 text-base-50 dark:text-base-950 hover:bg-base-solid-2",
        },

        // --- SOFT-OUTLINE ---
        {
            variant: "soft-outline",
            color: "accent",
            class: "bg-accent-soft-1 border-accent-soft-2 text-accent-solid-1 hover:bg-accent-soft-2",
        },
        {
            variant: "soft-outline",
            color: "danger",
            class: "bg-danger-soft-1 border-danger-soft-2  text-danger-solid-1 hover:bg-danger-soft-2",
        },
        {
            variant: "soft-outline",
            color: "base",
            class: "bg-base-soft-1 border-base-soft-2 text-main hover:(bg-base-soft-2 text-strong)",
        },

        // --- SOFT ---
        {
            variant: "soft",
            color: "accent",
            class: "bg-accent-soft-1 text-accent-solid-1 hover:bg-accent-soft-2",
        },
        {
            variant: "soft",
            color: "danger",
            class: "bg-danger-soft-1 text-danger-solid-1 hover:bg-danger-soft-2",
        },
        {
            variant: "soft",
            color: "base",
            class: "bg-base-soft-1 text-main hover:(bg-base-soft-2 text-strong) ",
        },

        // --- Outline ---
        {
            variant: "outline",
            color: "accent",
            class: "text-accent-solid-1 border-accent-soft-2 hover:(bg-accent-soft-1)",
        },
        {
            variant: "outline",
            color: "danger",
            class: "text-danger-solid-1 border-danger-soft-2 hover:(bg-danger-soft-1)",
        },
        {
            variant: "outline",
            color: "base",
            class: "text-main border-base-soft-2 hover:(bg-base-soft-1 text-strong)",
        },

        // --- Elevated ---
        // Should only be used on elevation-0 e.g. in floating app style
        {
            variant: "elevated",
            color: "accent",
            class: "text-accent-solid-1",
        },
        {
            variant: "elevated",
            color: "danger",
            class: "text-danger-solid-1",
        },
        {
            variant: "elevated",
            color: "base",
            class: "text-main hover:(text-strong)",
        },

        // --- Ghost ---
        {
            variant: "ghost",
            color: "accent",
            class: "text-accent-solid-1 hover:(bg-accent-soft-1)",
        },
        {
            variant: "ghost",
            color: "danger",
            class: "text-danger-solid-1 hover:(bg-danger-soft-1)",
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
        align: "center",
    },
});

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
