import { cva, type VariantProps } from "$utils";

export {
    selectionContentStyles as selectContentStyles,
    selectionOptionStyles as selectOptionStyles,
} from "$components/_system/selection/selection.styles";

export const selectTriggerStyles = cva({
    base: {
        layout: "group inline-flex items-center justify-between min-w-0 select-none",
        typography: "font-600 text-main text-left",
        frame: "bg-base-soft-1 shadow-xs rounded-2xl squircle-smooth",
        interaction:
            "cursor-pointer hover:(bg-base-soft-2 text-strong shadow-sm) aria-expanded:bg-base-soft-2 active:scale-97",
        motion: "will-change-transform transform-gpu t:(scale-200-cubic-out bg-200-quad-out text-200-quad-out shadow-200-quad-out)",
    },
    options: {
        size: {
            sm: "h-36px px-12px gap-6px text-xs [&_svg]:(size-14px stroke-2.5)",
            md: "h-40px px-16px gap-8px text-sm [&_svg]:(size-16px stroke-2.5)",
            lg: "h-44px px-20px gap-10px text-base [&_svg]:(size-18px stroke-2.5)",
        },
    },
    defaults: { size: "md" },
});

export type SelectStyleProps = VariantProps<typeof selectTriggerStyles>;
