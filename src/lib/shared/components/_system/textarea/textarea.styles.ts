import { cva, type VariantProps } from "$utils";

export const textareaContainerStyles = cva({
    base: {
        layout: "flex flex-col w-full relative select-none cursor-text",
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
            sm: "px-10px py-8px gap-1.5 text-xs [&_svg]:size-14px [&_svg]:stroke-[2.25px]",
            md: "px-14px py-10px gap-2 text-sm [&_svg]:size-16px [&_svg]:stroke-[2.25px]",
            lg: "px-16px py-12px gap-2.5 text-base [&_svg]:size-18px [&_svg]:stroke-[2.25px]",
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

export const textareaElementStyles = cva({
    base: {
        layout: "flex-1 min-w-0 w-full bg-transparent border-none outline-none focus:outline-none select-text m-0 p-0",
        typography: "font-500",
        misc: "placeholder:text-weak placeholder:font-400",
    },

    options: {
        size: {
            sm: "text-xs leading-18px",
            md: "text-sm leading-20px",
            lg: "text-base leading-24px",
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

export const textareaIconStyles = cva({
    base: {
        layout: "shrink-0 flex-center pointer-events-none select-none",
        motion: "t:(text-180-quad-out)",
    },

    options: {
        size: {
            sm: "size-14px mt-2px [&_svg]:size-14px [&_svg]:stroke-[2.25px]",
            md: "size-16px mt-2px [&_svg]:size-16px [&_svg]:stroke-[2.25px]",
            lg: "size-18px mt-3px [&_svg]:size-18px [&_svg]:stroke-[2.25px]",
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

export const textareaFooterStyles = cva({
    base: {
        layout: "flex items-center justify-between w-full mt-auto select-none",
    },

    options: {
        size: {
            sm: "pt-1.5 gap-2 text-xs",
            md: "pt-2 gap-2.5 text-xs",
            lg: "pt-2.5 gap-3 text-sm",
        },
    },

    defaults: {
        size: "md",
    },
});

export type TextareaContainerStyleProps = VariantProps<typeof textareaContainerStyles>;
export type TextareaElementStyleProps = VariantProps<typeof textareaElementStyles>;
export type TextareaIconStyleProps = VariantProps<typeof textareaIconStyles>;
export type TextareaFooterStyleProps = VariantProps<typeof textareaFooterStyles>;
export type TextareaStyleProps = TextareaContainerStyleProps;
