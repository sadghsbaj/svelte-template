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
}

/**
 * Paint state passed each rAF tick to the renderer.
 *
 * - `opacity`           – main ring opacity (0.0 to 1.0)
 * - `scale`             – scale factor centered on box (1.08 -> 1.0)
 * - `lineWidthOverride` – stroke width override in px (0.5px to targetLineWidth)
 */
export interface FocusPaintState {
    opacity: number;
    scale?: number;
    lineWidthOverride?: number;
}
