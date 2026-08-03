import type { FocusBox, ClipBox, FocusOverrides } from "./focus.types.js";

export function resolveAccentColor(): string {
    if (typeof window === "undefined") return "oklch(62.3% 0.214 259.815)";
    const computedStyle = window.getComputedStyle(document.documentElement);
    const color = computedStyle.getPropertyValue("--color-accent-500").trim();
    if (color) return color;
    return "oklch(62.3% 0.214 259.815)";
}

export function clearCanvas(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement): void {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawFocusRing(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    currentBox: FocusBox,
    currentClip: ClipBox,
    overrides?: FocusOverrides,
    resolvedColor?: string
): void {
    ctx.save();

    ctx.beginPath();
    ctx.rect(currentClip.x, currentClip.y, currentClip.w, currentClip.h);
    ctx.clip();

    ctx.beginPath();
    ctx.roundRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h, currentBox.r);
    
    ctx.strokeStyle = overrides?.color ?? resolvedColor ?? "oklch(62.3% 0.214 259.815)";
    ctx.lineWidth = overrides?.lineWidth ?? 2;
    ctx.stroke();

    ctx.restore();
}
