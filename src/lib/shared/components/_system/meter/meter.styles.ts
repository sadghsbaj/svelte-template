import { cva, type VariantProps } from "$utils";

export const meterTrackStyles = cva({
    base: {
        layout: "relative w-full overflow-hidden rounded-full squircle-soft select-none",
        color: "bg-base-soft-1",
        misc: "isolate",
    },

    options: {
        size: {
            sm: "h-4px",
            md: "h-8px",
            lg: "h-12px",
        },
    },

    defaults: {
        size: "md",
    },
});

export const meterFillStyles = cva({
    base: {
        layout: "h-full rounded-full squircle-soft",
        motion: "will-change-[width] t:(width-300-cubic-out)",
    },

    options: {
        color: {
            accent: "bg-accent-solid-1",
            danger: "bg-danger-solid-1",
            success: "bg-success-solid-1",
            warning: "bg-warning-solid-1",
            info: "bg-info-solid-1",
            base: "bg-base-solid-1",
        },
    },

    defaults: {
        color: "accent",
    },
});

export type MeterTrackStyleProps = VariantProps<typeof meterTrackStyles>;
export type MeterFillStyleProps = VariantProps<typeof meterFillStyles>;
