import { cva, type VariantProps } from "$utils";

export const toastStyles = cva({
    base: {
        layout: "grid grid-cols-[minmax(0,1fr)] w-full min-w-0 max-w-384px gap-x-12px p-14px items-center",
        frame: "bg-elevation-1 rounded-4xl squircle-smooth",
        misc: "isolate pointer-events-auto select-none",
    },
    modifiers: {
        hasTrailing: "",
    },
    compounds: [
        {
            hasTrailing: true,
            class: "grid-cols-[minmax(0,1fr)_auto]",
        },
    ],
    defaults: {
        hasTrailing: false,
    },
});

export const toastIconStyles = cva({
    base: "flex-center size-16px shrink-0 self-start [&>svg]:size-16px [&>svg]:stroke-[2.35px]",
    options: {
        status: {
            base: "text-main",
            accent: "",
            info: "",
            success: "",
            warning: "",
            danger: "",
        },
    },
    defaults: {
        status: "base",
    },
});

export const toastTitleStyles = cva({
    base: "block w-full min-w-0 text-sm font-600 leading-4 tracking-tight text-trim-truncate",
    options: {
        status: {
            base: "text-strong",
            accent: "",
            info: "",
            success: "",
            warning: "",
            danger: "",
        },
    },
    defaults: {
        status: "base",
    },
});

export type ToastStyleProps = VariantProps<typeof toastStyles>;
