import { cva, type VariantProps } from "$utils";

export const pulseDotStyles = cva({
    base: {
        layout: "relative inline-flex items-center justify-center shrink-0",
        misc: "isolate select-none",
    },

    options: {
        color: {
            success: "text-success-500",
            danger: "text-danger-500",
            warning: "text-warning-500",
            accent: "text-accent-500",
            info: "text-info-500",
            base: "text-base-500",
        },

        size: {
            sm: "size-6px",
            md: "size-8px",
            lg: "size-10px",
        },
    },

    defaults: {
        color: "success",
        size: "md",
    },
});

export const pulseDotCoreStyles = cva({
    base: {
        layout: "relative size-full",
        frame: "rounded-full bg-current",
    },

    modifiers: {
        glow: "pulse-dot-glow",
    },

    defaults: {
        glow: true,
    },
});

export const pulseDotPingStyles = cva({
    base: {
        layout: "absolute inset-0",
        frame: "rounded-full bg-current",
        motion: "animate-pulse-dot will-change-transform transform-gpu pointer-events-none",
    },
});

export type PulseDotStyleProps = VariantProps<typeof pulseDotStyles>;
