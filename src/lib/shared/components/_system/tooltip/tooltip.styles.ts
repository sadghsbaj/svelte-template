import { cva, type VariantProps } from "$utils";

export const tooltipStyles = cva({
    base: {
        layout: "grid grid-cols-[minmax(0,1fr)] items-center gap-x-6px max-w-280px px-10px py-8px",
        typography: "text-xs leading-snug",
        frame: "rounded-2xl squircle-smooth shadow-md bg-base-solid-1 text-base-50 dark:text-base-950",
        misc: "isolate",
    },
    modifiers: {
        hasLeading: "grid-cols-[14px_minmax(0,1fr)]",
    },
    defaults: {
        hasLeading: false,
    },
});

export const tooltipLeadingStyles = cva({
    base: {
        layout: "flex-center shrink-0 size-14px col-start-1 row-start-1 self-center",
        misc: "[&>svg]:size-14px [&>svg]:stroke-[2.25px]",
    },
});

export type TooltipStyleProps = VariantProps<typeof tooltipStyles>;
