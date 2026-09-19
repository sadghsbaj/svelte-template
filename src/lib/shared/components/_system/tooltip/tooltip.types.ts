import type { Snippet } from "svelte";

import type {
    FloatingAlignment,
    FloatingOffset,
    FloatingPadding,
    FloatingPlacement,
    FloatingSide,
} from "$components/_system/floating/floating.types";

export type TooltipPhase = "closed" | "positioning" | "entering" | "open" | "exiting";
export type TooltipOpenReason = "pointer" | "focus";
export type TooltipCloseReason = "pointer" | "focus" | "escape" | "pointer-down" | "disabled";
export type TooltipReason = TooltipOpenReason | TooltipCloseReason;

export interface TooltipAnimationContext {
    phase: "enter" | "exit";
    reason: TooltipReason;
    placement: FloatingPlacement;
    side: FloatingSide;
    alignment: FloatingAlignment;
    transformOrigin: string;
    reducedMotion: boolean;
}

export type TooltipAnimation = (
    element: HTMLElement,
    context: TooltipAnimationContext
) => Animation | null;

export interface TooltipOptions {
    content?: string;
    title?: string;
    description?: string;
    leading?: Snippet;
    trailing?: Snippet;
    placement?: FloatingPlacement;
    offset?: number | FloatingOffset;
    padding?: number | FloatingPadding;
    flip?: boolean;
    shift?: boolean;
    openDelay?: number;
    closeDelay?: number;
    disabled?: boolean;
    animation?: "default" | "none" | TooltipAnimation;
}

export type TooltipInput = string | TooltipOptions;

export interface ResolvedTooltipOptions {
    title: string;
    description?: string;
    leading?: Snippet;
    trailing?: Snippet;
    placement: FloatingPlacement;
    offset: number | FloatingOffset;
    padding: number | FloatingPadding;
    flip: boolean;
    shift: boolean;
    openDelay: number;
    closeDelay: number;
    disabled: boolean;
    animation: "default" | "none" | TooltipAnimation;
}

export interface ActiveTooltip {
    token: number;
    trigger: HTMLElement;
    options: ResolvedTooltipOptions;
    reason: TooltipReason;
}
