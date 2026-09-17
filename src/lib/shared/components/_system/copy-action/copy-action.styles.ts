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
        status: {
            idle: "",
            pending: "",
            copied: "text-success-500",
            error: "text-danger-500",
        },
    },

    modifiers: {
        locked: "pointer-events-none",
    },

    defaults: {
        as: "button",
        status: "idle",
        locked: false,
    },
});

export type CopyActionStyleProps = VariantProps<typeof copyActionStyles>;
