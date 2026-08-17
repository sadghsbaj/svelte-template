/**
 * @file scroll-fade.attach.ts
 * @description Svelte 5 attachment that applies dynamic, hardware-accelerated alpha fade masks to scrollable containers.
 * Detects scroll position, container resizing, and dynamic content changes to smoothly blend content at scroll boundaries.
 */

import type { Attachment } from "svelte/attachments";

export type ScrollFadeDirection = "vertical" | "horizontal" | "both";
export type ScrollFadeEdges = "both" | "start" | "end";
export type ScrollFadeSizePreset = "sm" | "md" | "lg";
export type ScrollFadeSize = ScrollFadeSizePreset | number;

export const SCROLL_FADE_SIZE_PRESETS: Record<ScrollFadeSizePreset, number> = {
    sm: 24,
    md: 40,
    lg: 64,
};

/**
 * Resolves a semantic size preset or raw pixel number into concrete pixels.
 */
export function resolveScrollFadeSize(size: ScrollFadeSize = "md"): number {
    return typeof size === "number"
        ? size
        : SCROLL_FADE_SIZE_PRESETS[size] ?? SCROLL_FADE_SIZE_PRESETS.md;
}

export interface ScrollFadeState {
    canScrollStart: boolean;
    canScrollEnd: boolean;
    isScrollable: boolean;
    startFade: number;
    endFade: number;
}

export interface ScrollFadeDetail {
    element: HTMLElement;
    vertical: ScrollFadeState;
    horizontal: ScrollFadeState;
}

export interface ScrollFadeOptions {
    /**
     * Whether the scroll fade effect is enabled.
     * @default true
     */
    enabled?: boolean;

    /**
     * Maximum depth/size of the fade gradient in pixels or a preset ("sm" | "md" | "lg").
     * - `"sm"`: 24px (compact, ideal for dropdowns & tab strips)
     * - `"md"`: 40px (standard, balanced for cards and dialogs)
     * - `"lg"`: 64px (deep, prominent for full-height views)
     * - `number`: Custom pixel value (e.g. 50)
     * @default "md"
     */
    size?: ScrollFadeSize;

    /**
     * Scroll direction to observe and mask:
     * - `"vertical"`: Top and bottom edge fades (standard for vertical scrolling).
     * - `"horizontal"`: Left and right edge fades (ideal for carousels / tab strips).
     * - `"both"`: Both vertical and horizontal fades combined.
     * @default "vertical"
     */
    direction?: ScrollFadeDirection;

    /**
     * Which edges should receive a fade mask:
     * - `"both"`: Fades both the start (top/left) and end (bottom/right) edges when scrolled.
     * - `"start"`: Fades only the start (top/left) edge.
     * - `"end"`: Fades only the end (bottom/right) edge.
     * @default "both"
     */
    edges?: ScrollFadeEdges;

    /**
     * Distance in pixels before an edge is considered scrolled away from boundary.
     * @default 1
     */
    threshold?: number;

    /**
     * Smoothly scales the fade size from 0px up to `size` as the user scrolls away from the edge,
     * preventing abrupt binary mask popping.
     * @default true
     */
    smooth?: boolean;

    /**
     * Callback fired whenever the scroll fade states update.
     */
    onFadeChange?: (detail: ScrollFadeDetail) => void;
}

const DEFAULT_OPTIONS: Required<Omit<ScrollFadeOptions, "onFadeChange">> = {
    enabled: true,
    size: "md",
    direction: "vertical",
    edges: "both",
    threshold: 1,
    smooth: true,
};

/**
 * Builds the CSS mask-image declaration for the requested direction.
 */
function buildMaskImage(direction: ScrollFadeDirection): string {
    if (direction === "vertical") {
        return "linear-gradient(to bottom in oklch, transparent 0px, black var(--scroll-fade-top, 0px), black calc(100% - var(--scroll-fade-bottom, 0px)), transparent 100%)";
    }
    if (direction === "horizontal") {
        return "linear-gradient(to right in oklch, transparent 0px, black var(--scroll-fade-left, 0px), black calc(100% - var(--scroll-fade-right, 0px)), transparent 100%)";
    }
    const verticalMask =
        "linear-gradient(to bottom in oklch, transparent 0px, black var(--scroll-fade-top, 0px), black calc(100% - var(--scroll-fade-bottom, 0px)), transparent 100%)";
    const horizontalMask =
        "linear-gradient(to right in oklch, transparent 0px, black var(--scroll-fade-left, 0px), black calc(100% - var(--scroll-fade-right, 0px)), transparent 100%)";
    return `${verticalMask}, ${horizontalMask}`;
}

/**
 * Svelte 5 attachment that adds dynamic edge fade masks to any scrollable element.
 *
 * @example
 * ```svelte
 * <div class="overflow-y-auto max-h-80" {@attach scrollFade({ size: 40 })}>
 *   {#each items as item}
 *     <div>{item}</div>
 *   {/each}
 * </div>
 * ```
 */
export function scrollFade(options?: ScrollFadeOptions): Attachment<Element> {
    return (node: Element) => {
        if (typeof window === "undefined" || !(node instanceof HTMLElement)) {
            return () => {};
        }
        if (options?.enabled === false) {
            return () => {};
        }

        const opts = { ...DEFAULT_OPTIONS, ...options };

        // Cache last written CSS variables to prevent unnecessary DOM mutations during scroll
        let lastTop = -1;
        let lastBottom = -1;
        let lastLeft = -1;
        let lastRight = -1;
        let animationFrameId: number | null = null;

        // Apply initial mask CSS declaration and reset sizing
        node.style.maskImage = buildMaskImage(opts.direction);
        node.style.webkitMaskImage = buildMaskImage(opts.direction);
        node.style.maskRepeat = "no-repeat";
        node.style.webkitMaskRepeat = "no-repeat";
        node.style.maskSize = "100% 100%";
        node.style.webkitMaskSize = "100% 100%";

        if (opts.direction === "both") {
            node.style.maskComposite = "intersect";
            node.style.webkitMaskComposite = "source-in";
        }

        /**
         * Calculates fade pixel values based on current scroll metrics.
         */
        const updateFades = (): void => {
            animationFrameId = null;

            const resolvedSize = resolveScrollFadeSize(opts.size);
            const isVertical = opts.direction === "vertical" || opts.direction === "both";
            const isHorizontal = opts.direction === "horizontal" || opts.direction === "both";

            let topFade = 0;
            let bottomFade = 0;
            let leftFade = 0;
            let rightFade = 0;

            let canScrollTop = false;
            let canScrollBottom = false;
            let canScrollLeft = false;
            let canScrollRight = false;
            let isVerticallyScrollable = false;
            let isHorizontallyScrollable = false;

            // 1. Vertical calculation
            if (isVertical) {
                const scrollHeight = node.scrollHeight;
                const clientHeight = node.clientHeight;
                const rawScrollTop = node.scrollTop;
                const maxScrollTop = Math.max(0, scrollHeight - clientHeight);
                isVerticallyScrollable = maxScrollTop > opts.threshold;

                if (isVerticallyScrollable) {
                    // Clamp scrollTop to [0, maxScrollTop] to guard against iOS/Safari rubber-band bounce
                    const clampedScrollTop = Math.max(0, Math.min(rawScrollTop, maxScrollTop));

                    if (
                        (opts.edges === "both" || opts.edges === "start") &&
                        clampedScrollTop > opts.threshold
                    ) {
                        canScrollTop = true;
                        topFade = opts.smooth ? Math.min(resolvedSize, clampedScrollTop) : resolvedSize;
                    }

                    const remaining = maxScrollTop - clampedScrollTop;
                    if (
                        (opts.edges === "both" || opts.edges === "end") &&
                        remaining > opts.threshold
                    ) {
                        canScrollBottom = true;
                        bottomFade = opts.smooth ? Math.min(resolvedSize, remaining) : resolvedSize;
                    }
                }

                // Write top/bottom CSS variables only when changed
                if (topFade !== lastTop) {
                    node.style.setProperty("--scroll-fade-top", `${topFade}px`);
                    lastTop = topFade;
                }
                if (bottomFade !== lastBottom) {
                    node.style.setProperty("--scroll-fade-bottom", `${bottomFade}px`);
                    lastBottom = bottomFade;
                }
            }

            // 2. Horizontal calculation
            if (isHorizontal) {
                const scrollWidth = node.scrollWidth;
                const clientWidth = node.clientWidth;
                // Use absolute value to safely support RTL and non-standard scroll metrics
                const rawScrollLeft = Math.abs(node.scrollLeft);
                const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);
                isHorizontallyScrollable = maxScrollLeft > opts.threshold;

                if (isHorizontallyScrollable) {
                    // Clamp scrollLeft to [0, maxScrollLeft] to guard against momentum bounce
                    const clampedScrollLeft = Math.max(0, Math.min(rawScrollLeft, maxScrollLeft));

                    if (
                        (opts.edges === "both" || opts.edges === "start") &&
                        clampedScrollLeft > opts.threshold
                    ) {
                        canScrollLeft = true;
                        leftFade = opts.smooth ? Math.min(resolvedSize, clampedScrollLeft) : resolvedSize;
                    }

                    const remaining = maxScrollLeft - clampedScrollLeft;
                    if (
                        (opts.edges === "both" || opts.edges === "end") &&
                        remaining > opts.threshold
                    ) {
                        canScrollRight = true;
                        rightFade = opts.smooth ? Math.min(resolvedSize, remaining) : resolvedSize;
                    }
                }

                // Write left/right CSS variables only when changed
                if (leftFade !== lastLeft) {
                    node.style.setProperty("--scroll-fade-left", `${leftFade}px`);
                    lastLeft = leftFade;
                }
                if (rightFade !== lastRight) {
                    node.style.setProperty("--scroll-fade-right", `${rightFade}px`);
                    lastRight = rightFade;
                }
            }

            // Optional callback notification
            if (opts.onFadeChange) {
                opts.onFadeChange({
                    element: node,
                    vertical: {
                        canScrollStart: canScrollTop,
                        canScrollEnd: canScrollBottom,
                        isScrollable: isVerticallyScrollable,
                        startFade: topFade,
                        endFade: bottomFade,
                    },
                    horizontal: {
                        canScrollStart: canScrollLeft,
                        canScrollEnd: canScrollRight,
                        isScrollable: isHorizontallyScrollable,
                        startFade: leftFade,
                        endFade: rightFade,
                    },
                });
            }
        };

        const scheduleUpdate = (): void => {
            if (animationFrameId === null) {
                animationFrameId = requestAnimationFrame(updateFades);
            }
        };

        // Scroll listener (passive for native 60/120fps scrolling performance)
        node.addEventListener("scroll", scheduleUpdate, { passive: true });

        // ResizeObserver to detect dimension changes of the container and its content
        let resizeObserver: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
                scheduleUpdate();
            });
            resizeObserver.observe(node);

            // Also observe direct children to catch content size changes (e.g. accordions, items)
            for (let i = 0; i < node.children.length; i++) {
                const child = node.children[i];
                if (child instanceof HTMLElement) {
                    resizeObserver.observe(child);
                }
            }
        }

        // MutationObserver to track elements dynamically appended or removed from children
        let mutationObserver: MutationObserver | null = null;
        if (typeof MutationObserver !== "undefined") {
            mutationObserver = new MutationObserver(() => {
                // Re-observe any new children in ResizeObserver
                if (resizeObserver) {
                    for (let i = 0; i < node.children.length; i++) {
                        const child = node.children[i];
                        if (child instanceof HTMLElement) {
                            resizeObserver.observe(child);
                        }
                    }
                }
                scheduleUpdate();
            });

            mutationObserver.observe(node, {
                childList: true,
                subtree: true,
                characterData: true,
            });
        }

        // Initial measurement
        updateFades();

        // Teardown / Cleanup on element destruction
        return () => {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }

            node.removeEventListener("scroll", scheduleUpdate);

            if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
            }

            if (mutationObserver) {
                mutationObserver.disconnect();
                mutationObserver = null;
            }

            // Remove applied styles
            node.style.removeProperty("mask-image");
            node.style.removeProperty("-webkit-mask-image");
            node.style.removeProperty("mask-repeat");
            node.style.removeProperty("-webkit-mask-repeat");
            node.style.removeProperty("mask-size");
            node.style.removeProperty("-webkit-mask-size");
            node.style.removeProperty("mask-composite");
            node.style.removeProperty("-webkit-mask-composite");
            node.style.removeProperty("--scroll-fade-top");
            node.style.removeProperty("--scroll-fade-bottom");
            node.style.removeProperty("--scroll-fade-left");
            node.style.removeProperty("--scroll-fade-right");
        };
    };
}
