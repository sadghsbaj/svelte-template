import { cva, type VariantProps } from "$utils";

export const segmentedControlStyles = cva({
    base: {
        layout: "relative inline-flex min-w-0 max-w-full items-center",
        frame: "rounded-full squircle-smooth",
    },
    options: {
        layout: {
            equal: "w-full",
            auto: "w-max",
        },
    },
    defaults: {
        layout: "equal",
    },
});

export const segmentedControlViewportStyles = cva({
    base: "min-w-0 max-w-full rounded-full squircle-smooth no-scrollbar",
    options: {
        layout: {
            equal: "w-full overflow-hidden",
            auto: "overflow-x-auto overflow-y-hidden",
        },
    },
    defaults: {
        layout: "equal",
    },
});

export const segmentedControlTrackStyles = cva({
    base: {
        layout: "relative flex h-32px items-center p-2px",
        frame: "rounded-full squircle-smooth bg-base-soft-1",
    },
    options: {
        layout: {
            equal: "w-full min-w-0",
            auto: "w-max min-w-max",
        },
    },
    defaults: {
        layout: "equal",
    },
});

export const segmentedControlItemStyles = cva({
    base: {
        layout: "relative z-1 inline-flex h-28px min-w-0 shrink-0 items-center justify-center gap-6px px-12px",
        typography: "text-sm font-500 leading-normal",
        frame: "rounded-full squircle-smooth bg-transparent",
        interaction: "select-none",
        motion: "t:text-200-cubic-out",
        misc: "[&>svg]:size-16px [&>svg]:shrink-0 [&>svg]:stroke-[2.25px]",
    },
    options: {
        layout: {
            equal: "w-0 flex-1",
            auto: "w-auto",
        },
    },
    modifiers: {
        selected: "cursor-default text-strong",
    },
    compounds: [
        {
            selected: false,
            class: "cursor-pointer text-main hover:text-strong",
        },
    ],
    defaults: {
        layout: "equal",
        selected: false,
    },
});

export type SegmentedControlStyleProps = VariantProps<typeof segmentedControlStyles>;
export type SegmentedControlItemStyleProps = VariantProps<typeof segmentedControlItemStyles>;
