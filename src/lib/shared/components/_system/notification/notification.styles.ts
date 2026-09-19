import { cva, type VariantProps } from "$utils";

export const notificationStyles = cva({
    base: {
        layout: "grid grid-cols-[minmax(0,1fr)] w-full min-w-0 max-w-544px gap-x-12px p-14px",
        frame: "bg-elevation-1 rounded-4xl squircle-smooth",
        misc: "isolate pointer-events-auto select-none",
    },
    modifiers: {
        hasTrailing: "",
        hasBody: "",
    },
    compounds: [
        {
            hasTrailing: true,
            class: "grid-cols-[minmax(0,1fr)_auto]",
        },
        {
            hasBody: false,
            class: "items-center",
        },
        {
            hasBody: true,
            class: "items-start",
        },
    ],
    defaults: {
        hasTrailing: false,
        hasBody: false,
    },
});

export const notificationIconStyles = cva({
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

export const notificationTitleStyles = cva({
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

export type NotificationStyleProps = VariantProps<typeof notificationStyles>;
