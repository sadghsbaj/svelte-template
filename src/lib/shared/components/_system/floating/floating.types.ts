import type { Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

export type FloatingSide = "top" | "right" | "bottom" | "left";
export type FloatingAlignment = "start" | "center" | "end";
export type FloatingPlacement = FloatingSide | `${FloatingSide}-${FloatingAlignment}`;
export type FloatingDirection = "auto" | "ltr" | "rtl";

export interface FloatingRect {
    x: number;
    y: number;
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
}

export interface VirtualAnchor {
    getBoundingClientRect: () => DOMRect | DOMRectReadOnly | FloatingRect;
    contextElement?: Element | null;
}

export interface PointAnchor {
    x: number;
    y: number;
    width?: number;
    height?: number;
    contextElement?: Element | null;
}

export type FloatingAnchorValue = HTMLElement | VirtualAnchor | PointAnchor;
export type FloatingAnchor =
    FloatingAnchorValue | (() => FloatingAnchorValue | null | undefined) | null | undefined;

export interface FloatingOffset {
    mainAxis?: number;
    crossAxis?: number;
}

export interface FloatingPadding {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export interface FloatingPositionResult {
    x: number;
    y: number;
    placement: FloatingPlacement;
    side: FloatingSide;
    alignment: FloatingAlignment;
    availableWidth: number;
    availableHeight: number;
    anchorRect: FloatingRect;
    floatingRect: FloatingRect;
    boundaryRect: FloatingRect;
}

export interface FloatingContext extends FloatingPositionResult {
    positioned: boolean;
    update: () => void;
}

export interface FloatingProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
    anchor?: FloatingAnchor;
    placement?: FloatingPlacement;
    offset?: number | FloatingOffset;
    padding?: number | FloatingPadding;
    flip?: boolean;
    shift?: boolean;
    boundary?: "viewport" | HTMLElement;
    direction?: FloatingDirection;
    trackPosition?: boolean;
    hideUntilPositioned?: boolean;
    element?: HTMLDivElement;
    onPositionChange?: (result: FloatingPositionResult) => void;
    onPositionError?: (error: Error) => void;
    children?: Snippet<[FloatingContext]>;
}
