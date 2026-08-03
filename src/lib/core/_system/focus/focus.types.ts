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
 * - `opacity`      – main ring opacity (0.0 to 1.0)
 * - `scale`        – scaling factor applied relative to the box center (defaults to 1.0)
 * - `ghost`        – optional static origin ring snapshot that lingers briefly
 * - `ghostOpacity` – opacity for the origin ghost (fades 0.25 → 0)
 */
export interface FocusPaintState {
    opacity: number;
    scale?: number;
    ghost?: FocusBox;
    ghostOpacity?: number;
}
