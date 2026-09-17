import type { HTMLAttributes } from "svelte/elements";
import type { HitAreaConfig } from "$components";

export type SliderSize = "sm" | "md" | "lg";
export type SliderColor = "accent" | "base" | "invalid";
export type SliderOrientation = "horizontal" | "vertical";
export type SliderOrigin = "start" | "center";
export type SliderValue = number | [number, number];

export interface SliderProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
    id?: string;
    value?: SliderValue;
    min?: number;
    max?: number;
    step?: number;
    size?: SliderSize;
    color?: SliderColor;
    orientation?: SliderOrientation;
    origin?: SliderOrigin;
    disabled?: boolean;
    hitArea?: HitAreaConfig;
    class?: string;
    trackClass?: string;
    fillClass?: string;
    thumbClass?: string;
    name?: string;
    ariaLabel?: string;
    ariaLabelMin?: string;
    ariaLabelMax?: string;
    ariaDescribedby?: string;
    element?: HTMLDivElement | null;
}
