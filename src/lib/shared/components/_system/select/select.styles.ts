import { cva, type VariantProps } from "$utils";

export {
    selectionContentStyles as selectContentStyles,
    selectionOptionStyles as selectOptionStyles,
    selectionSectionLabelStyles as selectSectionLabelStyles,
    selectionSectionStyles as selectSectionStyles,
} from "$components/_system/selection/selection.styles";

export const selectTriggerStyles = cva({
    base: {
        layout: "group inline-flex items-center justify-between min-w-0 select-none",
        typography: "font-600 text-main text-left",
        frame: "rounded-full squircle-smooth",
        interaction: "cursor-pointer hover:text-strong active:scale-97",
        motion: "will-change-transform transform-gpu t:(scale-200-cubic-out bg-200-quad-out text-200-quad-out shadow-200-quad-out)",
    },
    options: {
        variant: {
            soft: "bg-base-soft-1 shadow-xs hover:(bg-base-soft-2 shadow-sm) aria-expanded:bg-base-soft-2",
            elevated:
                "bg-white dark:bg-base-900 shadow-sm hover:(shadow-md dark:bg-base-800) aria-expanded:shadow-md active:shadow-sm!",
        },
        size: {
            sm: "h-36px px-12px gap-6px text-xs [&_svg]:(size-14px stroke-2.5)",
            md: "h-40px px-16px gap-8px text-sm [&_svg]:(size-16px stroke-2.5)",
            lg: "h-44px px-20px gap-10px text-base [&_svg]:(size-18px stroke-2.5)",
        },
    },
    defaults: { variant: "soft", size: "md" },
});

export type SelectStyleProps = VariantProps<typeof selectTriggerStyles>;
