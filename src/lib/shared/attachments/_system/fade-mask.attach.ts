/**
 * @file fade-mask.attach.ts
 * @description Svelte 5 attachment that applies static alpha fade masks (radial, directional, symmetrical)
 * to HTML and SVG elements using modern CSS oklch gradients.
 */

import type { Attachment } from "svelte/attachments";

export type FadeMaskType =
    | "radial"
    | "top"
    | "bottom"
    | "left"
    | "right"
    | "block"
    | "inline";

export type FadeMaskStrength = "sm" | "md" | "lg";

export interface FadeMaskOptions {
    /**
     * Whether the fade mask effect is active.
     * @default true
     */
    enabled?: boolean;

    /**
     * The shape and direction of the fade mask:
     * - `"radial"`: Centered vignette fading outwards to all edges.
     * - `"top"`: Linear fade towards the top edge.
     * - `"bottom"`: Linear fade towards the bottom edge.
     * - `"left"`: Linear fade towards the left edge.
     * - `"right"`: Linear fade towards the right edge.
     * - `"block"`: Symmetrical vertical fade on both top and bottom edges.
     * - `"inline"`: Symmetrical horizontal fade on both left and right edges.
     * @default "radial"
     */
    type?: FadeMaskType;

    /**
     * Falloff strength / opacity curve preset:
     * - `"sm"`: Subtle edge softening (60% core, 100% boundary).
     * - `"md"`: Balanced natural vignette / fade (30% core, 90% boundary).
     * - `"lg"`: Dramatic focus fade (0% core, 75% boundary).
     * @default "md"
     */
    strength?: FadeMaskStrength;
}

const STRENGTH_MAP: Record<FadeMaskStrength, { start: string; end: string; edge: string }> = {
    sm: { start: "60%", end: "100%", edge: "15%" },
    md: { start: "30%", end: "90%", edge: "25%" },
    lg: { start: "0%", end: "75%", edge: "35%" },
};

/**
 * Resolves the CSS gradient definition for the requested mask type and strength.
 */
function resolveGradient(
    type: FadeMaskType = "radial",
    strength: FadeMaskStrength = "md"
): string {
    const active = STRENGTH_MAP[strength] ?? STRENGTH_MAP.md;

    const GRADIENT_MAP: Record<FadeMaskType, string> = {
        radial: `radial-gradient(in oklch, black ${active.start}, transparent ${active.end})`,
        bottom: `linear-gradient(to bottom in oklch, black ${active.start}, transparent ${active.end})`,
        top: `linear-gradient(to top in oklch, black ${active.start}, transparent ${active.end})`,
        left: `linear-gradient(to left in oklch, black ${active.start}, transparent ${active.end})`,
        right: `linear-gradient(to right in oklch, black ${active.start}, transparent ${active.end})`,
        block: `linear-gradient(to bottom in oklch, transparent 0%, black ${active.edge}, black calc(100% - ${active.edge}), transparent 100%)`,
        inline: `linear-gradient(to right in oklch, transparent 0%, black ${active.edge}, black calc(100% - ${active.edge}), transparent 100%)`,
    };

    return GRADIENT_MAP[type] ?? GRADIENT_MAP.radial;
}

/**
 * Svelte 5 attachment that applies a hardware-accelerated CSS alpha gradient mask to any HTML or SVG element.
 *
 * @example
 * ```svelte
 * <div {@attach fadeMask({ type: "radial", strength: "lg" })}>
 *   <BackgroundPattern variant="grid" />
 * </div>
 * ```
 */
export function fadeMask(options: FadeMaskOptions = {}): Attachment<Element> {
    return (node: Element) => {
        if (
            typeof window === "undefined" ||
            !(node instanceof HTMLElement || node instanceof SVGElement)
        ) {
            return () => {};
        }
        if (options.enabled === false) {
            return () => {};
        }

        const gradient = resolveGradient(options.type, options.strength);

        node.style.maskImage = gradient;
        node.style.webkitMaskImage = gradient;
        node.style.maskRepeat = "no-repeat";
        node.style.webkitMaskRepeat = "no-repeat";
        node.style.maskSize = "100% 100%";
        node.style.webkitMaskSize = "100% 100%";

        // Cleanup on unmount
        return () => {
            node.style.removeProperty("mask-image");
            node.style.removeProperty("-webkit-mask-image");
            node.style.removeProperty("mask-repeat");
            node.style.removeProperty("-webkit-mask-repeat");
            node.style.removeProperty("mask-size");
            node.style.removeProperty("-webkit-mask-size");
        };
    };
}
