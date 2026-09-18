import { cva, type VariantProps } from "$utils";

export const buttonGroupStyles = cva({
    base: {
        layout: "inline-flex w-fit isolate",
    },

    options: {
        orientation: {
            horizontal: "flex-row items-center",
            vertical: "flex-col items-stretch",
        },
    },

    modifiers: {
        fullWidth: "w-full!",
    },

    defaults: {
        orientation: "horizontal",
        fullWidth: false,
    },
});

export type ButtonGroupStyleProps = VariantProps<typeof buttonGroupStyles>;
