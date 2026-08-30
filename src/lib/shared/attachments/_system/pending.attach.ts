/**
 * @file pending.attach.ts
 * @description Svelte 5 Element Attachment providing a form-fitting, GPU-accelerated pulsing glow ring
 * directly on any element with click suppression, smooth color transitions, headless mode, and WAI-ARIA busy state.
 */

import type { Attachment } from "svelte/attachments";
import { ease } from "$core/_system/motion/easings";

export type PendingColor = "accent" | "success" | "danger" | "base";

export interface PendingOptions {
    /**
     * Whether the pending loading state is active.
     * When false, the attachment performs no DOM modifications and tears down cleanly.
     * @default true
     */
    enabled?: boolean;

    /**
     * Alias for `enabled` for natural ergonomic boolean binding (e.g. `pending({ active: isPending })`).
     */
    active?: boolean;

    /**
     * Color theme for the pulsing ring effect:
     * - `"accent"`: Primary theme blue.
     * - `"success"`: Action success green.
     * - `"danger"`: Error or warning red.
     * - `"base"`: Monochromatic, subtle neutral light-dark tone.
     * @default "accent"
     */
    color?: PendingColor;

    /**
     * Whether to render the visual pulsing glow ring on the element.
     * Set to `false` for headless operation (preserves event blocking, aria-busy, and focus logic without visual ring).
     * @default true
     */
    ring?: boolean;

    /**
     * Intercept and block user clicks and keyboard submits while pending to prevent duplicate submissions.
     * @default true
     */
    blockInteraction?: boolean;

    /**
     * Custom cursor to apply while pending. Pass `false` to keep current cursor.
     * @default "wait"
     */
    cursor?: string | false;

    /**
     * Sets `aria-busy="true"` on the DOM node while pending.
     * @default true
     */
    ariaBusy?: boolean;

    /**
     * Duration of a single breathing pulse cycle in milliseconds.
     * @default 1500
     */
    duration?: number;
}

const COLOR_MAP: Record<PendingColor, string> = {
    accent: "var(--color-accent-500)",
    success: "var(--color-success-500)",
    danger: "var(--color-danger-500)",
    base: "light-dark(var(--color-base-900), var(--color-base-100))",
};

const BLOCKED_EVENTS = [
    "click",
    "dblclick",
    "pointerdown",
    "submit",
] as const;

const BLOCKED_KEYS = new Set<string>(["Enter", " ", "Spacebar"]);

function interceptEvent(e: Event): void {
    e.preventDefault();
    e.stopImmediatePropagation();
}

function handleKeydown(e: KeyboardEvent): void {
    if (!BLOCKED_KEYS.has(e.key)) {
        return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
}

/**
 * Svelte 5 Element Attachment that renders a form-fitting, pulsing glow ring around an element while pending.
 * Supports headless operation via `ring: false`.
 *
 * @example
 * ```svelte
 * <button {@attach pending({ active: isSubmitting, color: "accent" })}>
 *     Save Changes
 * </button>
 * ```
 */
export function pending<T extends HTMLElement = HTMLElement>(
    options: PendingOptions = {}
): Attachment<T> {
    const isEnabled = options.active ?? options.enabled ?? true;

    if (!isEnabled) {
        return () => () => {};
    }

    const {
        color = "accent",
        ring = true,
        blockInteraction = true,
        cursor = "wait",
        ariaBusy = true,
        duration = 1500,
    } = options;

    const resolvedColor = COLOR_MAP[color] ?? COLOR_MAP.accent;
    const isBase = color === "base";

    // Refined, subtle opacity curves (base is kept intentionally softer and monotone)
    const minRingAlpha = isBase ? "12%" : "25%";
    const minGlowAlpha = isBase ? "4%" : "10%";
    const maxRingAlpha = isBase ? "36%" : "75%";
    const maxGlowAlpha = isBase ? "16%" : "35%";
    const maxRingWidth = isBase ? "1.5px" : "2px";
    const maxGlowSpread = isBase ? "8px" : "12px";

    return (node: T) => {
        if (typeof window === "undefined" || !node) {
            return () => {};
        }

        // Snapshot original DOM state for accurate teardown
        const originalAriaBusy = node.getAttribute("aria-busy");
        const originalCursor = node.style.cursor;
        const originalOutline = node.style.outline;
        const hadNoCanvasFocus = "noCanvasFocus" in node.dataset;

        // 1. Suppress both canvas focus ring and native browser focus outline during pulse
        node.dataset.noCanvasFocus = "";
        node.style.outline = "none";

        // Notify FocusHost immediately if element is currently focused so it fades out canvas ring
        if (document.activeElement === node) {
            node.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        }

        // 2. Accessibility
        if (ariaBusy) {
            node.setAttribute("aria-busy", "true");
        }

        // 3. Cursor
        if (cursor) {
            node.style.cursor = cursor;
        }

        // 4. Event Suppression (Double-click protection)
        if (blockInteraction) {
            for (const eventName of BLOCKED_EVENTS) {
                node.addEventListener(eventName, interceptEvent, { capture: true });
            }
            node.addEventListener("keydown", handleKeydown, { capture: true });
        }

        // 5. Two-layer Breathing Ring Animation (skipped in headless mode)
        let animation: Animation | null = null;

        if (ring) {
            const keyframes = [
                {
                    boxShadow: `0 0 0 1px color-mix(in srgb, ${resolvedColor} ${minRingAlpha}, transparent), 0 0 3px color-mix(in srgb, ${resolvedColor} ${minGlowAlpha}, transparent)`,
                },
                {
                    boxShadow: `0 0 0 ${maxRingWidth} color-mix(in srgb, ${resolvedColor} ${maxRingAlpha}, transparent), 0 0 ${maxGlowSpread} color-mix(in srgb, ${resolvedColor} ${maxGlowAlpha}, transparent)`,
                },
                {
                    boxShadow: `0 0 0 1px color-mix(in srgb, ${resolvedColor} ${minRingAlpha}, transparent), 0 0 3px color-mix(in srgb, ${resolvedColor} ${minGlowAlpha}, transparent)`,
                },
            ];

            animation = node.animate(keyframes, {
                duration,
                iterations: Infinity,
                easing: ease.sineInOut,
            });
        }

        // Cleanup & Teardown
        return () => {
            // Restore Canvas Focus suppression & native outline
            if (!hadNoCanvasFocus) {
                delete node.dataset.noCanvasFocus;
            }
            node.style.outline = originalOutline;

            // Re-evaluate focus on FocusHost if element still holds DOM focus
            if (document.activeElement === node) {
                node.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
            }

            // Restore Accessibility
            if (originalAriaBusy !== null) {
                node.setAttribute("aria-busy", originalAriaBusy);
            } else if (ariaBusy) {
                node.removeAttribute("aria-busy");
            }

            // Restore Cursor
            node.style.cursor = originalCursor;

            // Remove Event Listeners
            if (blockInteraction) {
                for (const eventName of BLOCKED_EVENTS) {
                    node.removeEventListener(eventName, interceptEvent, { capture: true });
                }
                node.removeEventListener("keydown", handleKeydown, { capture: true });
            }

            // Cancel Animation if active
            animation?.cancel();
        };
    };
}
