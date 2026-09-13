import { cva, type VariantProps } from "$utils";

export const selectionContentStyles = cva({
    base: {
        layout: "overflow-y-auto",
        frame: "bg-elevation-1 shadow-xl rounded-3xl squircle-smooth p-6px",
        sizing: "min-w-[var(--floating-anchor-width)] max-h-[var(--floating-available-height)]",
    },
});

export const selectionOptionStyles = cva({
    base: {
        layout: "flex items-center w-full min-w-0 select-none",
        typography: "text-main text-left",
        frame: "rounded-xl squircle-smooth",
        interaction:
            "cursor-pointer hover:bg-base-soft-1 focus:(bg-base-soft-2 text-strong) outline-none",
        motion: "t:(bg-160-quad-out text-160-quad-out opacity-160-quad-out)",
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
        active: "bg-base-soft-2 text-strong",
    },
    defaults: { size: "md" },
});

export type SelectionOptionStyleProps = VariantProps<typeof selectionOptionStyles>;
