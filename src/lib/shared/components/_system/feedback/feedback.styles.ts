import { cva, type VariantProps } from "$utils";

export const feedbackStyles = cva({
    base: {
        layout: "grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-start gap-x-8px w-full min-w-0",
        frame: "bg-elevation-1 rounded-4xl squircle-smooth",
        misc: "isolate pointer-events-auto select-none",
    },
    options: {
        kind: {
            notification: "max-w-544px px-12px py-9px sm:(px-14px py-10px)",
            toast: "max-w-384px px-11px py-8px sm:(px-12px py-9px)",
        },
    },
    defaults: {
        kind: "toast",
    },
});

export const feedbackIconStyles = cva({
    base: {
        layout: "flex-center col-start-1 row-start-1 size-20px shrink-0 self-start",
        misc: "[&>svg]:size-16px [&>svg]:stroke-[2.35px]",
    },
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

export const feedbackTitleStyles = cva({
    base: "title-sm flex min-h-20px min-w-0 items-center text-trim-truncate",
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

export type FeedbackStyleProps = VariantProps<typeof feedbackStyles>;
