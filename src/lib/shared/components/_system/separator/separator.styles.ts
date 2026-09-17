import { cva, type VariantProps } from "$utils";

export const separatorStyles = cva({
    base: {
        layout: "shrink-0",
        misc: "select-none",
    },

    options: {
        orientation: {
            horizontal: "w-full",
            vertical: "h-full self-stretch",
        },

        color: {
            base: "bg-base-soft-1",
            accent: "bg-accent-soft-1",
        },

        thickness: {
            sm: "",
            md: "",
            lg: "",
            custom: "",
        },
    },

    modifiers: {
        rounded: "rounded-full",
    },

    compounds: [
        // Horizontal Thickness
        { orientation: "horizontal", thickness: "sm", class: "h-px" },
        { orientation: "horizontal", thickness: "md", class: "h-2px" },
        { orientation: "horizontal", thickness: "lg", class: "h-4px" },

        // Vertical Thickness
        { orientation: "vertical", thickness: "sm", class: "w-px" },
        { orientation: "vertical", thickness: "md", class: "w-2px" },
        { orientation: "vertical", thickness: "lg", class: "w-4px" },
    ],

    defaults: {
        orientation: "horizontal",
        color: "base",
        thickness: "sm",
        rounded: true,
    },
});

export type SeparatorStyleProps = VariantProps<typeof separatorStyles>;
