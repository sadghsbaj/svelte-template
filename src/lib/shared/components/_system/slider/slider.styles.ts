import { cva, type VariantProps } from "$utils";

export const sliderContainerStyles = cva({
    base: {
        layout: "relative flex items-center select-none touch-none",
        misc: "isolate cursor-pointer",
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
        layout: "absolute flex-center rounded-full squircle-soft select-none",
        frame: "border-none shadow-[0_0_1px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.08)] dark:shadow-sm",
        motion: "will-change-transform transform-gpu backface-hidden t:(scale-200-cubic-out bg-200-quad-out shadow-200-quad-out)",
    },
    options: {
        shape: {
            circle: "rounded-full",
            bar: "rounded-full",
            pill: "rounded-full",
        },
        size: {
            sm: "",
            md: "",
            lg: "",
        },
        orientation: {
            horizontal: "",
            vertical: "",
        },
        color: {
            accent: "bg-white",
            base: "bg-white dark:ring-1 dark:ring-base-950/25 dark:shadow-md",
            invalid: "bg-white",
        },
    },
    compounds: [
        // circle (orientation agnostic)
        { shape: "circle", size: "sm", class: "size-16px" },
        { shape: "circle", size: "md", class: "size-20px" },
        { shape: "circle", size: "lg", class: "size-24px" },

        // bar - horizontal (narrow width, tall height)
        { shape: "bar", orientation: "horizontal", size: "sm", class: "w-6px h-18px" },
        { shape: "bar", orientation: "horizontal", size: "md", class: "w-8px h-24px" },
        { shape: "bar", orientation: "horizontal", size: "lg", class: "w-10px h-28px" },

        // bar - vertical (wide width, flat height)
        { shape: "bar", orientation: "vertical", size: "sm", class: "w-18px h-6px" },
        { shape: "bar", orientation: "vertical", size: "md", class: "w-24px h-8px" },
        { shape: "bar", orientation: "vertical", size: "lg", class: "w-28px h-10px" },

        // pill - horizontal (wide width, compact height)
        { shape: "pill", orientation: "horizontal", size: "sm", class: "w-24px h-16px" },
        { shape: "pill", orientation: "horizontal", size: "md", class: "w-28px h-20px" },
        { shape: "pill", orientation: "horizontal", size: "lg", class: "w-34px h-24px" },

        // pill - vertical (compact width, tall height)
        { shape: "pill", orientation: "vertical", size: "sm", class: "w-16px h-24px" },
        { shape: "pill", orientation: "vertical", size: "md", class: "w-20px h-28px" },
        { shape: "pill", orientation: "vertical", size: "lg", class: "w-24px h-34px" },
    ],
    defaults: {
        shape: "circle",
        size: "md",
        orientation: "horizontal",
        color: "accent",
    },
});

export type SliderContainerStyleProps = VariantProps<typeof sliderContainerStyles>;
export type SliderTrackStyleProps = VariantProps<typeof sliderTrackStyles>;
export type SliderFillStyleProps = VariantProps<typeof sliderFillStyles>;
export type SliderThumbStyleProps = VariantProps<typeof sliderThumbStyles>;
