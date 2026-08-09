export type CornerShape = { type: "round" } | { type: "squircle"; exponent: number };

export interface FocusBox {
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
    cornerShape?: CornerShape;
}

export interface ClipBox {
    x: number;
    y: number;
    w: number;
    h: number;
}

export interface FocusOverrides {
    color?: string;
    offset?: number;
    lineWidth?: number;
    enabled?: boolean;
    /** CSS selector for a visual proxy element. The focus ring is drawn on this element instead of the focused one. */
    focusTarget?: string;
}

/**
 * Paint state passed each rAF tick to the renderer.
 *
 * - `opacity`           – main ring opacity (0.0 to 1.0)
 * - `offsetDelta`       – uniform px offset applied to every side of the box, mirroring CSS
 *                         `outline-offset`. Negative values inset the ring (reveal start),
 *                         `0` is the resting position. Deliberately px-based rather than a
 *                         multiplicative scale: every edge travels the same distance, so a
 *                         40px button and a 900px card animate identically. The corner radius
 *                         travels with the offset, matching `computeTargetBox`.
 * - `lineWidthOverride` – stroke width override in px (0 to targetLineWidth)
 */
export interface FocusPaintState {
    opacity: number;
    offsetDelta?: number;
    lineWidthOverride?: number;
}
