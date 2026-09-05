import { cva, type VariantProps } from "$utils";

export const switchTrackStyles = cva({
    base: {
        layout: "inline-flex items-center shrink-0",
        frame: "rounded-full squircle-soft",
        interaction: "cursor-pointer",
        motion: "t:(bg-200-quad-out)",
        misc: "select-none",
    },

    options: {
        color: {
            accent: "",
            base: "",
        },

        size: {
            sm: "w-36px h-20px p-1px",
            md: "w-44px h-24px p-2px",
            lg: "w-52px h-28px p-2px",
        },
    },

    modifiers: {
        checked: "",
    },

    compounds: [
        {
            checked: false,
            class: "bg-base-soft-1 hover:bg-base-soft-2",
        },
        {
            color: "accent",
            checked: true,
            class: "bg-accent-solid-1 hover:bg-accent-solid-2",
        },
        {
            color: "base",
            checked: true,
            class: "bg-base-solid-1 hover:bg-base-solid-2",
        },
    ],

    defaults: {
        color: "accent",
        size: "md",
        checked: false,
    },
});

export const switchThumbStyles = cva({
    base: {
        frame: "rounded-full shadow-xs squircle-soft",
        motion: "transform-gpu backface-hidden t:(translate-200-cubic-out bg-200-quad-out)",
        misc: "pointer-events-none",
    },

    options: {
        color: {
            accent: "",
            base: "",
        },

        size: {
            sm: "w-24px h-18px",
            md: "w-28px h-20px",
            lg: "w-32px h-24px",
        },
    },

    modifiers: {
        checked: "",
    },

    compounds: [
        {
            checked: false,
            class: "bg-white translate-x-0",
        },
        {
            color: "accent",
            checked: true,
            class: "bg-white",
        },
        {
            color: "base",
            checked: true,
            class: "bg-base-50 dark:bg-base-950",
        },
        {
            size: "sm",
            checked: true,
            class: "translate-x-10px",
        },
        {
            size: "md",
            checked: true,
            class: "translate-x-12px",
        },
        {
            size: "lg",
            checked: true,
            class: "translate-x-16px",
        },
    ],

    defaults: {
        color: "accent",
        size: "md",
        checked: false,
    },
});

export type SwitchStyleProps = Pick<VariantProps<typeof switchTrackStyles>, "color" | "size">;
