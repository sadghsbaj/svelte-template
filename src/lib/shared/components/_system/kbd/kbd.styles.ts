import { cva, type VariantProps } from "$utils";

export const KBD_ICON_SIZES = {
    sm: 12,
    md: 14,
    lg: 16,
} as const;

export const kbdStyles = cva({
    base: {
        layout: "inline-flex justify-center items-center shrink-0 select-none",
        typography: "font-500 font-sans leading-none text-center",
        frame: "rounded-full squircle-smooth",
        misc: "isolate",
    },

    options: {
        variant: {
            soft: "bg-base-soft-1 text-weak",
            ghost: "bg-transparent text-weaker",
            elevated: "bg-white dark:bg-base-900 shadow-xs text-main",
        },

        size: {
            sm: "h-20px min-w-20px px-1.5 text-[11px] gap-0.5",
            md: "h-24px min-w-24px px-2 text-sm gap-1",
            lg: "h-28px min-w-28px px-2.5 text-base gap-1.5",
        },
    },

    modifiers: {
        single: "px-0! aspect-square",
    },

    defaults: {
        variant: "soft",
        size: "md",
        single: false,
    },
});

export const kbdSeparatorStyles = cva({
    base: {
        layout: "inline-flex items-center justify-center select-none leading-none opacity-40",
        typography: "font-400 font-sans",
    },
    options: {
        size: {
            sm: "text-[10px]",
            md: "text-xs",
            lg: "text-sm",
        },
    },
    defaults: {
        size: "md",
    },
});

export type KbdStyleProps = VariantProps<typeof kbdStyles>;
