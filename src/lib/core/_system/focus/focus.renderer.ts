import type { ClipBox, FocusBox, FocusOverrides, FocusPaintState } from "./focus.types.js";

let cachedAccentColor: string | null = null;
const resolvedColorCache = new Map<string, string>();

export function invalidateAccentColorCache(): void {
    cachedAccentColor = null;
    resolvedColorCache.clear();
}

/**
 * Resolves a color string for the 2D Canvas context.
 * If the string contains a CSS variable (e.g. `var(--color-accent-300)` or `--color-accent-300`),
 * it extracts and reads the computed value from `:root`, caching the result in memory.
 */
export function resolveFocusColor(rawColor?: string): string {
    if (!rawColor) {
        return resolveAccentColor();
    }

    // Direct color string (hex, oklch, rgb, hsl, named) -> 0 DOM overhead
    if (!rawColor.includes("--")) {
        return rawColor;
    }

    const cached = resolvedColorCache.get(rawColor);
    if (cached !== undefined) return cached;

    if (typeof window === "undefined") {
        return rawColor;
    }

    // Extract property name: e.g. "var(--color-accent-300)" -> "--color-accent-300"
    const match = /(--[\w-]+)/.exec(rawColor);
    if (!match) {
        resolvedColorCache.set(rawColor, rawColor);
        return rawColor;
    }

    const varName = match[1];
    const resolved = window
        .getComputedStyle(document.documentElement)
        .getPropertyValue(varName)
        .trim();

    const finalColor = resolved || rawColor;
    resolvedColorCache.set(rawColor, finalColor);
    return finalColor;
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

interface CachedCornerPoint {
    cos: number;
    sin: number;
}

/** Cache for normalized superellipse corner points per exponent (16 steps). */
const superellipsePointCache = new Map<number, CachedCornerPoint[]>();

/** Returns cached superellipse sample points for the given exponent, computing them once. */
function getSuperellipsePoints(exponent: number): CachedCornerPoint[] {
    const cached = superellipsePointCache.get(exponent);
    if (cached) return cached;

    const STEPS = 16;
    const invExp = 1 / exponent;
    const points: CachedCornerPoint[] = [];

    for (let i = 0; i <= STEPS; i++) {
        const theta = (i / STEPS) * (Math.PI / 2);
        const cosAbs = Math.abs(Math.cos(theta));
        const sinAbs = Math.abs(Math.sin(theta));
        points.push({
            cos: Math.pow(cosAbs, invExp),
            sin: Math.pow(sinAbs, invExp),
        });
    }

    superellipsePointCache.set(exponent, points);
    return points;
}

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
 * Uses cached normalized superellipse points — Math.pow is computed once per
 * exponent, then only multiplication and addition per frame. Each corner is
 * centered at the corner of the bounding box, inset by r from both adjacent edges.
 */
function drawSuperellipseCorner(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    exponent: number,
    corner: Corner
): void {
    const points = getSuperellipsePoints(exponent);

    for (const { cos, sin } of points) {
        const pt = cornerPoint(cx, cy, r, corner, cos, sin);
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
 * Draws the focus ring on the canvas with offset and width reveal animations.
 *
 * @param ctx           - The 2D rendering context.
 * @param canvas        - The canvas element.
 * @param currentBox    - The current animated FocusBox.
 * @param currentClip   - The current clipping region.
 * @param overrides     - Optional per-element color/offset/lineWidth overrides.
 * @param resolvedColor - Pre-resolved CSS accent color string.
 * @param paint         - Paint state controlling opacity, offsetDelta, and lineWidth.
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

    const accentColor = resolveFocusColor(overrides?.color ?? resolvedColor);
    const baseLineWidth = overrides?.lineWidth ?? 2;
    const lineWidth = paint?.lineWidthOverride ?? baseLineWidth;

    // Canvas silently IGNORES a non-positive lineWidth assignment (the previous width stays
    // in effect), so a reveal starting at 0px must bail here rather than stroke at stale width.
    if (lineWidth <= 0) return;

    // Uniform px outset/inset — mirrors CSS `outline-offset`, including the radius travelling
    // with the offset (same model as computeTargetBox). Deliberately NOT a multiplicative
    // scale: with scale, a wide element's left/right edges travel much further than its
    // top/bottom ones and the radius does not follow, which reads as a mushy shrink.
    const offsetDelta = paint?.offsetDelta ?? 0;
    const drawW = Math.max(0, currentBox.w + offsetDelta * 2);
    const drawH = Math.max(0, currentBox.h + offsetDelta * 2);
    if (drawW === 0 || drawH === 0) return;

    const drawX = currentBox.x - offsetDelta;
    const drawY = currentBox.y - offsetDelta;
    const drawR = Math.max(0, currentBox.r + offsetDelta);

    ctx.save();

    // Apply scroll-container clip region
    ctx.beginPath();
    ctx.rect(currentClip.x, currentClip.y, currentClip.w, currentClip.h);
    ctx.clip();

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
