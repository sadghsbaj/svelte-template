import type { ClipBox, FocusBox, FocusOverrides, FocusPaintState } from "./focus.types.js";

/**
 * Reads `--color-accent-500` from the document's CSS custom properties.
 * Falls back to the project's blue-500 oklch value if not found.
 */
export function resolveAccentColor(): string {
    if (typeof window === "undefined") return "oklch(62.3% 0.214 259.815)";
    const color = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent-500")
        .trim();
    return color || "oklch(62.3% 0.214 259.815)";
}

/**
 * Clears the entire canvas drawing surface.
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Draws the focus ring on the canvas with optional opacity and scale transforms.
 *
 * - Short distance: Crisp outline ring smoothly morphs between neighbor elements.
 * - Long distance: Dissolves out at origin, then pulses in at target with scale damping.
 *
 * @param ctx           - The 2D rendering context.
 * @param canvas        - The canvas element.
 * @param currentBox    - The current animated FocusBox.
 * @param currentClip   - The current clipping region.
 * @param overrides     - Optional per-element color/offset/lineWidth overrides.
 * @param resolvedColor - Pre-resolved CSS accent color string.
 * @param paint         - Paint state controlling opacity and scale transform.
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

    const accentColor = overrides?.color ?? resolvedColor ?? "oklch(62.3% 0.214 259.815)";
    const lineWidth = overrides?.lineWidth ?? 2;
    const scale = paint?.scale ?? 1;

    ctx.save();

    // Apply scroll-container clip region
    ctx.beginPath();
    ctx.rect(currentClip.x, currentClip.y, currentClip.w, currentClip.h);
    ctx.clip();

    // Compute scaled box dimensions centered around (cx, cy)
    let drawX = currentBox.x;
    let drawY = currentBox.y;
    let drawW = currentBox.w;
    let drawH = currentBox.h;

    if (scale !== 1) {
        const cx = currentBox.x + currentBox.w / 2;
        const cy = currentBox.y + currentBox.h / 2;
        drawW = currentBox.w * scale;
        drawH = currentBox.h * scale;
        drawX = cx - drawW / 2;
        drawY = cy - drawH / 2;
    }

    // Draw main focus ring outline
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.roundRect(drawX, drawY, drawW, drawH, currentBox.r);
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    ctx.restore();
}
