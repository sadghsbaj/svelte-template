import { cva, type VariantProps } from "$utils";

export const copyActionStyles = cva({
    base: {
        layout: "relative inline-flex items-center justify-center shrink-0 size-16px select-none",
        typography: "leading-none",
        misc: "isolate",
    },

    options: {
        as: {
            button: "cursor-pointer p-0 bg-transparent border-0 active:scale-90 t:(scale-200-cubic-out text-200-quad-out)",
            span: "pointer-events-none",
        },
    },

    modifiers: {
        copied: "text-success-500",
    },

    defaults: {
        as: "button",
        copied: false,
    },
});

export type CopyActionStyleProps = VariantProps<typeof copyActionStyles>;
