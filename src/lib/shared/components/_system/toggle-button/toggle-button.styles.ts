import { cva, type VariantProps } from "$utils";

export const toggleButtonStyles = cva({
    base: {
        layout: "inline-flex items-center shrink-0 w-fit select-none",
        typography: "font-600 leading-normal",
        frame: "rounded-full",
        interaction: "cursor-pointer active:scale-97",
        motion: "will-change-transform transform-gpu backface-hidden t:(scale-200-cubic-out bg-200-quad-out text-200-quad-out)",
        misc: "isolate",
    },

    options: {
        variant: {
            soft: "",
            ghost: "",
        },

        size: {
            sm: "h-32px px-10px text-xs gap-4px [&_svg]:(size-14px stroke-2.5)",
            md: "h-36px px-14px text-sm gap-6px [&_svg]:(size-16px stroke-2.5)",
            lg: "h-40px px-18px text-base gap-8px [&_svg]:(size-18px stroke-2.5)",
        },

        align: {
            center: "justify-center text-center",
            start: "justify-start text-left",
            end: "justify-end text-right",
            between: "justify-between",
        },
    },

    modifiers: {
        pressed: "",
        fullWidth: "w-full!",
        iconOnly: "p-0! aspect-square squircle-soft",
    },

    compounds: [
        {
            iconOnly: false,
            class: "squircle-smooth",
        },
        {
            variant: "soft",
            pressed: false,
            class: "bg-base-soft-1 text-main hover:(bg-base-soft-2 text-strong) active:(bg-base-soft-2 text-strong)",
        },
        {
            variant: "ghost",
            pressed: false,
            class: "bg-transparent text-main hover:(bg-base-soft-1 text-strong) active:(bg-base-soft-1 text-strong)",
        },
        {
            pressed: true,
            class: "bg-accent-soft-1 text-accent-solid-1 hover:bg-accent-soft-2 active:bg-accent-soft-2",
        },
        {
            iconOnly: true,
            size: "sm",
            class: "[&_svg]:size-16px!",
        },
        {
            iconOnly: true,
            size: "md",
            class: "[&_svg]:size-18px!",
        },
        {
            iconOnly: true,
            size: "lg",
            class: "[&_svg]:size-20px!",
        },
    ],

    defaults: {
        variant: "soft",
        size: "md",
        align: "center",
        pressed: false,
        iconOnly: false,
    },
});

export type ToggleButtonStyleProps = VariantProps<typeof toggleButtonStyles>;
