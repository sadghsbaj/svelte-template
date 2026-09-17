import { cva, type VariantProps } from "$utils";

export const sliderContainerStyles = cva({
    base: {
        layout: "relative flex items-center select-none touch-none",
        misc: "isolate cursor-grab active:cursor-grabbing",
    },
    options: {
        orientation: {
            horizontal: "w-full",
            vertical: "h-full justify-center min-h-120px",
        },
        size: {
            sm: "",
            md: "",
            lg: "",
        },
    },
    compounds: [
        {
            orientation: "horizontal",
            size: "sm",
            class: "h-16px",
        },
        {
            orientation: "horizontal",
            size: "md",
            class: "h-20px",
        },
        {
            orientation: "horizontal",
            size: "lg",
            class: "h-24px",
        },
        {
            orientation: "vertical",
            size: "sm",
            class: "w-16px",
        },
        {
            orientation: "vertical",
            size: "md",
            class: "w-20px",
        },
        {
            orientation: "vertical",
            size: "lg",
            class: "w-24px",
        },
    ],
    defaults: {
        orientation: "horizontal",
        size: "md",
    },
});

export const sliderTrackStyles = cva({
    base: {
        layout: "relative overflow-hidden rounded-full squircle-soft pointer-events-none select-none",
        color: "bg-base-soft-1",
        misc: "isolate",
    },
    options: {
        orientation: {
            horizontal: "w-full",
            vertical: "h-full",
        },
        size: {
            sm: "",
            md: "",
            lg: "",
        },
    },
    compounds: [
        {
            orientation: "horizontal",
            size: "sm",
            class: "h-4px",
        },
        {
            orientation: "horizontal",
            size: "md",
            class: "h-6px",
        },
        {
            orientation: "horizontal",
            size: "lg",
            class: "h-8px",
        },
        {
            orientation: "vertical",
            size: "sm",
            class: "w-4px",
        },
        {
            orientation: "vertical",
            size: "md",
            class: "w-6px",
        },
        {
            orientation: "vertical",
            size: "lg",
            class: "w-8px",
        },
    ],
    defaults: {
        orientation: "horizontal",
        size: "md",
    },
});

export const sliderFillStyles = cva({
    base: {
        layout: "absolute rounded-full squircle-soft",
        motion: "t:(bg-200-quad-out)",
    },
    options: {
        color: {
            accent: "bg-accent-solid-1",
            base: "bg-base-solid-1",
            invalid: "bg-danger-solid-1",
        },
    },
    defaults: {
        color: "accent",
    },
});

export const sliderThumbStyles = cva({
    base: {
        layout: "absolute flex-center rounded-full squircle-soft pointer-events-none select-none",
        frame: "border-none shadow-sm",
        motion: "will-change-transform transform-gpu backface-hidden t:(scale-150-cubic-out bg-200-quad-out shadow-200-quad-out)",
    },
    options: {
        size: {
            sm: "size-16px",
            md: "size-20px",
            lg: "size-24px",
        },
        color: {
            accent: "bg-white",
            base: "bg-white dark:bg-base-800 shadow-md",
            invalid: "bg-white",
        },
    },
    defaults: {
        size: "md",
        color: "accent",
    },
});

export const sliderInputStyles = cva({
    base: {
        layout: "absolute inset-0 size-full m-0 p-0",
        appearance:
            "appearance-none bg-transparent bor^er-none outline-none ring-0 shadow-none cursor-grab active:cursor-grabbing select-none",
        interaction:
            "[&::-webkit-slider-runnable-track]:(bg-transparent border-none cursor-grab active:cursor-grabbing) [&::-moz-range-track]:(bg-transparent border-none cursor-grab active:cursor-grabbing) [&::-webkit-slider-thumb]:(appearance-none bg-transparent border-none cursor-grab active:cursor-grabbing w-[var(--slider-touch-size)] h-[var(--slider-touch-size)]) [&::-moz-range-thumb]:(appearance-none bg-transparent border-none cursor-grab active:cursor-grabbing w-[var(--slider-touch-size)] h-[var(--slider-touch-size)])",
    },
    options: {
        orientation: {
            horizontal: "",
            vertical: "[writing-mode:vertical-lr] rotate-180",
        },
    },
    defaults: {
        orientation: "horizontal",
    },
});

export type SliderContainerStyleProps = VariantProps<typeof sliderContainerStyles>;
export type SliderTrackStyleProps = VariantProps<typeof sliderTrackStyles>;
export type SliderFillStyleProps = VariantProps<typeof sliderFillStyles>;
export type SliderThumbStyleProps = VariantProps<typeof sliderThumbStyles>;
export type SliderInputStyleProps = VariantProps<typeof sliderInputStyles>;
