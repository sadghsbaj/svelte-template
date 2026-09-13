import { cva, type VariantProps } from "$utils";

export const textInputContainerStyles = cva({
    base: {
        layout: "inline-flex items-center w-full relative select-none cursor-text",
        frame: "rounded-2xl squircle-smooth",
        motion: "t:(bg-200-quad-out shadow-200-quad-out)",
        misc: "isolate",
    },

    options: {
        variant: {
            soft: "",
            elevated: "",
        },

        size: {
            sm: "h-36px px-10px gap-2 text-xs [&_svg]:size-14px [&_svg]:stroke-[2.25px]",
            md: "h-42px px-14px gap-2.5 text-sm [&_svg]:size-16px [&_svg]:stroke-[2.25px]",
            lg: "h-48px px-16px gap-3 text-base [&_svg]:size-18px [&_svg]:stroke-[2.25px]",
        },
    },

    modifiers: {
        invalid: "",
    },

    compounds: [
        // --- SOFT ---
        {
            variant: "soft",
            invalid: false,
            class: "bg-base-soft-1 hover:bg-base-soft-2",
        },
        {
            variant: "soft",
            invalid: true,
            class: "bg-danger-soft-1 hover:bg-danger-soft-2",
        },

        // --- ELEVATED ---
        {
            variant: "elevated",
            invalid: false,
            class: "bg-white dark:bg-base-900 shadow-sm hover:shadow-md",
        },
        {
            variant: "elevated",
            invalid: true,
            class: "bg-white dark:bg-base-900 shadow-sm hover:shadow-md ring-1.5 ring-danger-500/40",
        },
    ],

    defaults: {
        variant: "soft",
        size: "md",
        invalid: false,
    },
});

export const textInputInputStyles = cva({
    base: {
        layout: "flex-1 min-w-0 h-full bg-transparent border-none outline-none focus:outline-none",
        typography: "font-500 leading-normal",
        misc: "placeholder:text-weak placeholder:font-400",
    },

    options: {
        size: {
            sm: "text-xs",
            md: "text-sm",
            lg: "text-base",
        },
    },

    modifiers: {
        invalid: "",
    },

    compounds: [
        {
            invalid: false,
            class: "text-strong",
        },
        {
            invalid: true,
            class: "text-danger-solid-1 placeholder:text-danger-solid-1/50",
        },
    ],

    defaults: {
        size: "md",
        invalid: false,
    },
});

export const textInputIconStyles = cva({
    base: {
        layout: "shrink-0 flex-center pointer-events-none select-none",
        motion: "t:(text-180-quad-out)",
    },

    options: {
        size: {
            sm: "size-14px [&_svg]:size-14px [&_svg]:stroke-[2.25px]",
            md: "size-16px [&_svg]:size-16px [&_svg]:stroke-[2.25px]",
            lg: "size-18px [&_svg]:size-18px [&_svg]:stroke-[2.25px]",
        },
    },

    modifiers: {
        invalid: "",
    },

    compounds: [
        {
            invalid: false,
            class: "text-weak",
        },
        {
            invalid: true,
            class: "text-danger-solid-1",
        },
    ],

    defaults: {
        size: "md",
        invalid: false,
    },
});

export const textInputActionStyles = cva({
    base: {
        layout: "inline-flex justify-center items-center shrink-0 cursor-pointer select-none",
        frame: "rounded-full squircle-soft",
        typography: "text-weak hover:text-strong",
        interaction: "active:scale-93 hover:bg-base-soft-2",
        motion: "will-change-transform t:(bg-150-quad-out text-150-quad-out scale-150-quad-out)",
    },

    options: {
        size: {
            sm: "size-24px [&_svg]:size-14px [&_svg]:stroke-[2.25px]",
            md: "size-28px [&_svg]:size-16px [&_svg]:stroke-[2.25px]",
            lg: "size-32px [&_svg]:size-18px [&_svg]:stroke-[2.25px]",
        },
    },

    defaults: {
        size: "md",
    },
});

export type TextInputContainerStyleProps = VariantProps<typeof textInputContainerStyles>;
export type TextInputInputStyleProps = VariantProps<typeof textInputInputStyles>;
export type TextInputIconStyleProps = VariantProps<typeof textInputIconStyles>;
export type TextInputActionStyleProps = VariantProps<typeof textInputActionStyles>;
export type TextInputStyleProps = TextInputContainerStyleProps;
