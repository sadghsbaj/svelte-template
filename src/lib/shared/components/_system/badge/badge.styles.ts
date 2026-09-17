import { cva, type VariantProps } from "$utils";

export const badgeStyles = cva({
    base: {
        layout: "inline-flex items-center shrink-0 w-fit select-none justify-center",
        typography: "font-600 leading-none",
        frame: "rounded-full",
        misc: "isolate",
    },

    options: {
        variant: {
            soft: "",
            solid: "",
        },

        color: {
            accent: "",
            danger: "",
            success: "",
            warning: "",
            info: "",
            base: "",
        },

        size: {
            xs: "h-18px px-6px text-[10px] gap-3px [&_svg]:size-10px [&_svg]:shrink-0",
            sm: "h-22px px-8px text-[11px] gap-4px [&_svg]:size-12px [&_svg]:shrink-0",
            md: "h-26px px-10px text-xs gap-5px [&_svg]:size-13px [&_svg]:shrink-0",
            lg: "h-30px px-12px text-xs gap-6px [&_svg]:size-14px [&_svg]:shrink-0",
            xl: "h-34px px-14px text-sm gap-7px [&_svg]:size-16px [&_svg]:shrink-0",
        },
    },

    modifiers: {
        square: "p-0! aspect-square squircle-soft",
    },

    compounds: [
        {
            square: false,
            class: "squircle-smooth",
        },

        // --- SOFT ---
        {
            variant: "soft",
            color: "accent",
            class: "bg-accent-soft-1 text-accent-solid-1",
        },
        {
            variant: "soft",
            color: "danger",
            class: "bg-danger-soft-1 text-danger-solid-1",
        },
        {
            variant: "soft",
            color: "success",
            class: "bg-success-soft-1 text-success-solid-1",
        },
        {
            variant: "soft",
            color: "warning",
            class: "bg-warning-soft-1 text-warning-solid-1",
        },
        {
            variant: "soft",
            color: "info",
            class: "bg-info-soft-1 text-info-solid-1",
        },
        {
            variant: "soft",
            color: "base",
            class: "bg-base-soft-1 text-main",
        },

        // --- SOLID ---
        {
            variant: "solid",
            color: "accent",
            class: "bg-accent-solid-1 text-white",
        },
        {
            variant: "solid",
            color: "danger",
            class: "bg-danger-solid-1 text-white",
        },
        {
            variant: "solid",
            color: "success",
            class: "bg-success-solid-1 text-white",
        },
        {
            variant: "solid",
            color: "warning",
            class: "bg-warning-solid-1 text-white",
        },
        {
            variant: "solid",
            color: "info",
            class: "bg-info-solid-1 text-white",
        },
        {
            variant: "solid",
            color: "base",
            class: "bg-base-solid-1 text-base-50 dark:text-base-950",
        },
    ],

    defaults: {
        variant: "soft",
        color: "base",
        size: "md",
        square: false,
    },
});

export type BadgeStyleProps = VariantProps<typeof badgeStyles>;
