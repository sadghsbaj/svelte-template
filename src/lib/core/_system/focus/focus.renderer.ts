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
    if (typeof ctx.roundRect === "function") {
        ctx.roundRect(drawX, drawY, drawW, drawH, drawR);
    } else {
        ctx.rect(drawX, drawY, drawW, drawH);
    }
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    ctx.restore();
}

