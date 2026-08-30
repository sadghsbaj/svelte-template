import { cva, type VariantProps } from "$utils";

export const buttonStyles = cva({
    base: {
        layout: "inline-flex justify-center items-center shrink-0 select-none",
        typography: "font-600 leading-none",
        frame: "rounded-full squircle-smooth",
        interaction: "cursor-pointer active:scale-95",
        motion: "will-change-transform t:(scale-200-expo-out bg-200-quad-out text-200-quad-out border-200-quad-out shadow-200-quad-out)",
        misc: "isolate",
    },

    options: {
        variant: {
            solid: "",
            soft: "",
            outline: "border",
            elevate: "shadow-sm",
            ghost: "bg-transparent",
            plain: "bg-transparent",
        },

        color: {
            accent: "",
            danger: "",
            base: "",
        },

        size: {
            sm: "h-8 px-3 text-xs gap-1",
            md: "h-9 px-4 text-sm gap-1.5",
            lg: "h-10 px-5 text-base gap-2",
        },
    },

    modifiers: {
        fullWidth: "w-full",
        iconOnly: "p-0 aspect-squre",
    },

    compounds: [
        {
            variant: "solid",
            color: "accent",
            class: "bg-accent-500 text-white hover:bg-accent-400",
        },
        {
            variant: "solid",
            color: "danger",
            class: "bg-danger-500 text-white hover:bg-danger-400",
        },
        {
            variant: "solid",
            color: "base",
            class: "bg-fill-1 text-main hover:(bg-fill-2 text-strong)",
        },
    ],

    defaults: {
        variant: "solid",
        color: "accent",
        size: "md",
    },
});

export type ButtonStyleProps = VariantProps<typeof buttonStyles>;
