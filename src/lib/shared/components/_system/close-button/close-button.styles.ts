import { cva, type VariantProps } from "$utils";

export const closeButtonStyles = cva({
    base: {
        layout: "inline-flex justify-center items-center shrink-0",
        typography: "text-weak leading-none",
        frame: "rounded-full squircle-soft",
        interaction: "cursor-pointer active:scale-93 hover:text-main",
        motion: "will-change-transform t:(scale-200-cubic-out bg-200-quad-out text-200-quad-out)",
        misc: "isolate",
    },

    options: {
        variant: {
            solid: "bg-base-soft-1 hover:(bg-base-soft-2)",
            ghost: "bg-transparent hover:(bg-base-soft-1)",
        },

        size: {
            sm: "size-16px",
            md: "size-24px",
            lg: "size-32px",
        },
    },

    defaults: {
        variant: "solid",
        size: "md",
    },
});

export type CloseButtonStyleProps = VariantProps<typeof closeButtonStyles>;
