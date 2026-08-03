export interface FocusBox {
    x: number;
    y: number;
    w: number;
    h: number;
    r: number;
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
}

/**
 * Paint state passed each rAF tick to the renderer.
 *
 * - `opacity`           – main ring opacity (0.0 to 1.0)
 * - `scale`             – scale factor centered on box (1.06 -> 1.0)
 * - `offsetDelta`       – offset adjustment in px (Houdini style: -3.85px to 0px)
 * - `lineWidthOverride` – stroke width override in px (Houdini style: 0.5px to targetLineWidth)
 */
export interface FocusPaintState {
    opacity: number;
    scale?: number;
    offsetDelta?: number;
    lineWidthOverride?: number;
}
