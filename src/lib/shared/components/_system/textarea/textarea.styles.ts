import { cva, type VariantProps } from "$utils";

export const textareaContainerStyles = cva({
    base: {
        layout: "flex flex-col w-full relative cursor-text select-none",
        frame: "rounded-2xl squircle-smooth",
        motion: "t:(bg-200-quad-out shadow-200-quad-out)",
        misc: "isolate",
    },

    options: {
        variant: {
            soft: "",
            elevated: "",
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
        invalid: false,
    },
});

export const textareaElementStyles = cva({
    base: {
        layout: "min-w-0 w-full bg-transparent border-none outline-none focus:outline-none select-text m-0 box-border",
        typography: "font-500",
        misc: "placeholder:text-weak placeholder:font-400",
    },

    options: {
        size: {
            sm: "px-10px py-8px text-xs leading-18px",
            md: "px-14px py-10px text-sm leading-20px",
            lg: "px-16px py-12px text-base leading-24px",
        },
    },

    modifiers: {
        invalid: "",
        hasFooter: "",
        hasIconLeft: "",
        hasIconRight: "",
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

        // Has footer padding adjustment
        {
            size: "sm",
            hasFooter: true,
            class: "pb-1",
        },
        {
            size: "md",
            hasFooter: true,
            class: "pb-1.5",
        },
        {
            size: "lg",
            hasFooter: true,
            class: "pb-2",
        },

        // Has iconLeft padding adjustment
        {
            size: "sm",
            hasIconLeft: true,
            class: "pl-32px",
        },
        {
            size: "md",
            hasIconLeft: true,
            class: "pl-38px",
        },
        {
            size: "lg",
            hasIconLeft: true,
            class: "pl-44px",
        },

        // Has iconRight padding adjustment
        {
            size: "sm",
            hasIconRight: true,
            class: "pr-32px",
        },
        {
            size: "md",
            hasIconRight: true,
            class: "pr-38px",
        },
        {
            size: "lg",
            hasIconRight: true,
            class: "pr-44px",
        },
    ],

    defaults: {
        size: "md",
        invalid: false,
        hasFooter: false,
        hasIconLeft: false,
        hasIconRight: false,
    },
});

export const textareaIconStyles = cva({
    base: {
        layout: "absolute shrink-0 flex-center pointer-events-none select-none z-1 [&_button]:pointer-events-auto [&_button]:shrink-0 [&_a]:pointer-events-auto [&_a]:shrink-0 [&_[role=button]]:pointer-events-auto [&_[role=button]]:shrink-0",
        motion: "t:(text-180-quad-out)",
    },

    options: {
        size: {
            sm: "size-14px top-10px left-10px [&_svg]:size-14px [&_svg]:stroke-[2.25px]",
            md: "size-16px top-12px left-14px [&_svg]:size-16px [&_svg]:stroke-[2.25px]",
            lg: "size-18px top-14px left-16px [&_svg]:size-18px [&_svg]:stroke-[2.25px]",
        },

        position: {
            left: "",
            right: "",
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
        {
            size: "sm",
            position: "right",
            class: "left-auto right-10px",
        },
        {
            size: "md",
            position: "right",
            class: "left-auto right-14px",
        },
        {
            size: "lg",
            position: "right",
            class: "left-auto right-16px",
        },
    ],

    defaults: {
        size: "md",
        position: "left",
        invalid: false,
    },
});

export const textareaFooterStyles = cva({
    base: {
        layout: "flex items-center justify-between w-full mt-auto select-none box-border",
    },

    options: {
        size: {
            sm: "px-10px pb-8px pt-0 gap-2 text-xs",
            md: "px-14px pb-10px pt-0 gap-2.5 text-xs",
            lg: "px-16px pb-12px pt-0 gap-3 text-sm",
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
export type TextareaStyleProps = TextareaContainerStyleProps & {
    size?: "sm" | "md" | "lg";
};
