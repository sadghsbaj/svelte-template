import { cva, type VariantProps } from "$utils";

export const checkboxStyles = cva({
    base: {
        layout: "inline-flex justify-center items-center shrink-0",
        frame: "rounded-40% squircle-soft shadow-xs",
        interaction: "cursor-pointer",
        motion: "t:(bg-200-quad-out)",
        misc: "",
    },

    options: {
        color: {
            accent: "",
            base: "",
            invalid: "",
        },

        size: {
            sm: "size-12px",
            md: "size-16px",
            lg: "size-20px",
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
        {
            color: "invalid",
            checked: true,
            class: "bg-danger-solid-1 hover:bg-danger-solid-2",
        },
    ],

    defaults: {
        color: "accent",
        size: "md",
        checked: false,
    },
});

export const checkboxIconStyles = cva({
    base: {
        typography: "text-white",
    },

    options: {
        color: {
            accent: "",
            base: "",
            invalid: "",
        },

        size: {
            sm: "size-8px",
            md: "size-10px",
            lg: "size-12px",
        },
    },

    modifiers: {
        checked: "",
    },

    compounds: [
        {
            color: "base",
            class: "text-white dark:text-base-800",
        },
    ],

    defaults: {
        color: "accent",
        size: "md",
        checked: false,
    },
});

export type CheckboxStyleProps = VariantProps<typeof checkboxStyles>;
