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

    defaults: {
        orientation: "horizontal",
    },
});

export type ButtonGroupStyleProps = VariantProps<typeof buttonGroupStyles>;
