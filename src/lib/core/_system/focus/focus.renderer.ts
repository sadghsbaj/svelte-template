import type { ClipBox, FocusBox, FocusOverrides, FocusPaintState } from "./focus.types.js";

let cachedAccentColor: string | null = null;

export function invalidateAccentColorCache(): void {
    cachedAccentColor = null;
}

/**
 * Reads `--color-accent-500` from the document's CSS custom properties.
 * Falls back to the project's blue-500 oklch value if not found.
 */
export function resolveAccentColor(): string {
    if (typeof window === "undefined") return "oklch(62.3% 0.214 259.815)";
    if (cachedAccentColor !== null) return cachedAccentColor;
    const color = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent-500")
        .trim();
    cachedAccentColor = color || "oklch(62.3% 0.214 259.815)";
    return cachedAccentColor;
}

/**
 * Clears the entire canvas drawing surface.
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

type Corner = "top-right" | "bottom-right" | "bottom-left" | "top-left";

/** Maps a superellipse sample point (cosPow, sinPow) to canvas coordinates for the given corner. */
function cornerPoint(
    cx: number,
    cy: number,
    r: number,
    corner: Corner,
    cosPow: number,
    sinPow: number
): { x: number; y: number } {
    switch (corner) {
        case "top-right": {
            return { x: cx + r * sinPow, y: cy - r * cosPow };
        }
        case "bottom-right": {
            return { x: cx + r * cosPow, y: cy + r * sinPow };
        }
        case "bottom-left": {
            return { x: cx - r * sinPow, y: cy + r * cosPow };
        }
        case "top-left": {
            return { x: cx - r * cosPow, y: cy - r * sinPow };
        }
    }
}

/**
 * Samples a superellipse corner curve and appends it to the current path.
 *
 * Parameterized superellipse (code convention: exponent 1 = circle, 2 = squircle):
 *   x = r * |cos(θ)|^(1/exponent)
 *   y = r * |sin(θ)|^(1/exponent)     θ ∈ [0, π/2]
 *
 * Each corner is centered at the corner of the bounding box, inset by r
 * from both adjacent edges. This produces a curve identical to the browser's
 * native `corner-shape` rendering (no Bézier approximation).
 */
function drawSuperellipseCorner(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    exponent: number,
    corner: Corner
): void {
    const STEPS = 16;
    const invExp = 1 / exponent;

    for (let i = 0; i <= STEPS; i++) {
        const theta = (i / STEPS) * (Math.PI / 2);
        const cosPow = Math.pow(Math.abs(Math.cos(theta)), invExp);
        const sinPow = Math.pow(Math.abs(Math.sin(theta)), invExp);

        const pt = cornerPoint(cx, cy, r, corner, cosPow, sinPow);
        ctx.lineTo(pt.x, pt.y);
    }
}

/**
 * Draws a squircle / superellipse path onto the 2D canvas context
 * using exact superellipse sampling (no Bézier approximation).
 */
export function drawSquirclePath(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    exponent: number
): void {
    const clampedR = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    if (clampedR === 0) {
        ctx.rect(x, y, w, h);
        return;
    }

    // Path goes clockwise: top edge → right edge → bottom edge → left edge

    ctx.moveTo(x + clampedR, y);

    // Top edge → top-right corner
    ctx.lineTo(x + w - clampedR, y);
    drawSuperellipseCorner(ctx, x + w - clampedR, y + clampedR, clampedR, exponent, "top-right");

    // Right edge → bottom-right corner
    ctx.lineTo(x + w, y + h - clampedR);
    drawSuperellipseCorner(
        ctx,
        x + w - clampedR,
        y + h - clampedR,
        clampedR,
        exponent,
        "bottom-right"
    );

    // Bottom edge → bottom-left corner
    ctx.lineTo(x + clampedR, y + h);
    drawSuperellipseCorner(ctx, x + clampedR, y + h - clampedR, clampedR, exponent, "bottom-left");

    // Left edge → top-left corner
    ctx.lineTo(x, y + clampedR);
    drawSuperellipseCorner(ctx, x + clampedR, y + clampedR, clampedR, exponent, "top-left");

    ctx.closePath();
}

/**
 * Draws the focus ring on the canvas with scale and width pulse animations.
 *
 * @param ctx           - The 2D rendering context.
 * @param canvas        - The canvas element.
 * @param currentBox    - The current animated FocusBox.
 * @param currentClip   - The current clipping region.
 * @param overrides     - Optional per-element color/offset/lineWidth overrides.
 * @param resolvedColor - Pre-resolved CSS accent color string.
 * @param paint         - Paint state controlling opacity, scale, and lineWidth.
 */
export function drawFocusRing(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    currentBox: FocusBox,
    currentClip: ClipBox,
    overrides?: FocusOverrides,
    resolvedColor?: string,
    paint?: FocusPaintState
): void {
    const opacity = paint?.opacity ?? 1;
    if (opacity <= 0.01) return;

    const accentColor = overrides?.color ?? resolvedColor ?? resolveAccentColor();
    const baseLineWidth = overrides?.lineWidth ?? 2;
    const lineWidth = paint?.lineWidthOverride ?? baseLineWidth;
    const scale = paint?.scale ?? 1;

    ctx.save();

    // Apply scroll-container clip region
    ctx.beginPath();
    ctx.rect(currentClip.x, currentClip.y, currentClip.w, currentClip.h);
    ctx.clip();

    // Compute dimensions
    let drawX = currentBox.x;
    let drawY = currentBox.y;
    let drawW = currentBox.w;
    let drawH = currentBox.h;
    const drawR = Math.max(0, currentBox.r);

    if (scale !== 1) {
        const cx = drawX + drawW / 2;
        const cy = drawY + drawH / 2;
        drawW *= scale;
        drawH *= scale;
        drawX = cx - drawW / 2;
        drawY = cy - drawH / 2;
    }

    // Draw main focus ring outline
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    if (currentBox.cornerShape?.type === "squircle" && drawR > 0) {
        drawSquirclePath(ctx, drawX, drawY, drawW, drawH, drawR, currentBox.cornerShape.exponent);
    } else if (typeof ctx.roundRect === "function") {
        ctx.roundRect(drawX, drawY, drawW, drawH, drawR);
    } else {
        ctx.rect(drawX, drawY, drawW, drawH);
    }
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    ctx.restore();
}
