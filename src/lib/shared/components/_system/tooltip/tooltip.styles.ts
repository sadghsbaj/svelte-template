import { cva, type VariantProps } from "$utils";

export const tooltipStyles = cva({
    base: {
        layout: "grid grid-cols-[minmax(0,1fr)] items-center gap-x-6px max-w-280px px-10px py-8px",
        typography: "text-xs leading-snug",
        frame: "rounded-2xl squircle-smooth bg-elevation-1 text-strong",
        misc: "isolate select-none",
    },
    modifiers: {
        hasLeading: "",
        hasTrailing: "",
    },
    compounds: [
        {
            hasLeading: true,
            hasTrailing: false,
            class: "grid-cols-[14px_minmax(0,1fr)]",
        },
        {
            hasLeading: false,
            hasTrailing: true,
            class: "grid-cols-[minmax(0,1fr)_auto]",
        },
        {
            hasLeading: true,
            hasTrailing: true,
            class: "grid-cols-[14px_minmax(0,1fr)_auto]",
        },
    ],
    defaults: {
        hasLeading: false,
        hasTrailing: false,
    },
});

export const tooltipTrailingStyles = cva({
    base: {
        layout: "inline-flex items-center justify-center shrink-0 row-start-1 self-center",
    },
});

export const tooltipLeadingStyles = cva({
    base: {
        layout: "flex-center shrink-0 size-14px col-start-1 row-start-1 self-center",
        misc: "[&>svg]:size-14px [&>svg]:stroke-[2.25px]",
    },
});

export type TooltipStyleProps = VariantProps<typeof tooltipStyles>;
