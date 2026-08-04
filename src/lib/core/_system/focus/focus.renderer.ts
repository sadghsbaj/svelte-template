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
 * Computes cubic Bezier handle coefficient k for a superellipse exponent p.
 * For p = 1.0 (round), k = (4/3)*(sqrt(2)-1) ≈ 0.5522847.
 * For p = 2.0 (squircle), k ≈ 0.752538 (Skia / Chromium cubic Bezier approximation for squircle).
 */
export function getSuperellipseKappa(exponent: number): number {
    const KAPPA_ROUND = 0.5522847498307935;
    const KAPPA_SQUIRCLE = 0.752538;
    const clampedExp = Math.max(1, Math.min(3, exponent));
    return KAPPA_ROUND + (clampedExp - 1) * (KAPPA_SQUIRCLE - KAPPA_ROUND);
}

/**
 * Draws a squircle / superellipse path onto the 2D canvas context.
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

    const k = getSuperellipseKappa(exponent);
    const handle = clampedR * k;

    ctx.moveTo(x + clampedR, y);

    // Top-right corner
    ctx.lineTo(x + w - clampedR, y);
    ctx.bezierCurveTo(
        x + w - clampedR + handle,
        y,
        x + w,
        y + clampedR - handle,
        x + w,
        y + clampedR
    );

    // Bottom-right corner
    ctx.lineTo(x + w, y + h - clampedR);
    ctx.bezierCurveTo(
        x + w,
        y + h - clampedR + handle,
        x + w - clampedR + handle,
        y + h,
        x + w - clampedR,
        y + h
    );

    // Bottom-left corner
    ctx.lineTo(x + clampedR, y + h);
    ctx.bezierCurveTo(
        x + clampedR - handle,
        y + h,
        x,
        y + h - clampedR + handle,
        x,
        y + h - clampedR
    );

    // Top-left corner
    ctx.lineTo(x, y + clampedR);
    ctx.bezierCurveTo(
        x,
        y + clampedR - handle,
        x + clampedR - handle,
        y,
        x + clampedR,
        y
    );

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

