import { cva, type VariantProps } from "$utils";

export const selectionContentStyles = cva({
    base: {
        layout: "overflow-y-auto",
        frame: "bg-elevation-1 shadow-xl rounded-3xl squircle-smooth p-6px",
        sizing: "w-[var(--floating-anchor-width)] max-w-[var(--floating-available-width)] max-h-[var(--floating-available-height)]",
    },
});

export const selectionOptionStyles = cva({
    base: {
        layout: "flex items-center w-full min-w-0 select-none",
        typography: "text-main text-left",
        frame: "rounded-2xl squircle-smooth",
        interaction:
            "cursor-pointer hover:bg-base-soft-1 focus-visible:(bg-base-soft-1 text-strong) outline-none",
        motion: "t:(bg-200-quad-out text-200-quad-out opacity-200-quad-out)",
    },
    options: {
        size: {
            sm: "min-h-32px px-9px gap-6px text-xs [&_svg]:(size-14px stroke-2.5)",
            md: "min-h-36px px-10px gap-8px text-sm [&_svg]:(size-16px stroke-2.5)",
            lg: "min-h-40px px-12px gap-10px text-base [&_svg]:(size-18px stroke-2.5)",
        },
    },
    modifiers: {
        selected: "text-strong",
        active: "bg-base-soft-1 text-strong",
        described: "py-6px [&>svg]:self-start",
    },
    compounds: [
        { size: "sm", described: true, class: "[&>svg]:mt-1px" },
        { size: "md", described: true, class: "[&>svg]:mt-2px" },
        { size: "lg", described: true, class: "[&>svg]:mt-3px" },
    ],
    defaults: { size: "md" },
});

export const selectionSectionStyles = cva({
    modifiers: {
        separated: "mt-4px border-t border-base-soft-2 pt-4px",
    },
});

export const selectionSectionLabelStyles = cva({
    base: {
        layout: "select-none truncate",
        typography: "font-600 leading-normal text-weaker",
    },
    options: {
        size: {
            sm: "px-9px py-4px text-[10px]",
            md: "px-10px py-4px text-[11px]",
            lg: "px-12px py-5px text-xs",
        },
    },
    defaults: { size: "md" },
});

export type SelectionOptionStyleProps = VariantProps<typeof selectionOptionStyles>;
