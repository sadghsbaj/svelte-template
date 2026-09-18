import { cva, type VariantProps } from "$utils";

export const toggleButtonGroupStyles = cva({
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

export type ToggleButtonGroupStyleProps = VariantProps<typeof toggleButtonGroupStyles>;
