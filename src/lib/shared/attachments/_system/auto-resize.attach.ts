import type { Attachment } from "svelte/attachments";

export type AutoResizeAxis = "vertical" | "horizontal" | "both";

export interface AutoResizeDetail {
    element: HTMLElement;
    width: number;
    height: number;
    isClamped: boolean;
    clampedAxis?: "vertical" | "horizontal";
    clampedBoundary?: "min" | "max";
}

export interface AutoResizeOptions {
    /**
     * Whether auto-resizing is active.
     * @default true
     */
    enabled?: boolean;

    /**
     * Axis to resize:
     * - `"vertical"`: Expands/shrinks height (standard for textareas).
     * - `"horizontal"`: Expands/shrinks width (ideal for single-line inputs).
     * - `"both"`: Expands both width and height.
     * @default "vertical" for textarea/contenteditable, "horizontal" for input
     */
    axis?: AutoResizeAxis;

    /**
     * Minimum number of text rows to display (vertical axis).
     */
    minRows?: number;

    /**
     * Maximum number of text rows before scrolling (vertical axis).
     */
    maxRows?: number;

    /**
     * Minimum height in pixels or CSS value (e.g. 80 or "80px").
     */
    minHeight?: number | string;

    /**
     * Maximum height in pixels or CSS value (e.g. 400 or "400px").
     */
    maxHeight?: number | string;

    /**
     * Minimum width in pixels or CSS value (horizontal axis).
     */
    minWidth?: number | string;

    /**
     * Maximum width in pixels or CSS value (horizontal axis).
     */
    maxWidth?: number | string;

    /**
     * Additional padding/buffer in pixels added to measured dimensions to avoid cursor clipping.
     * @default 0
     */
    buffer?: number;

    /**
     * Observes element container width changes to recalculate height on reflow / word-wrap.
     * @default true
     */
    observeResize?: boolean;

    /**
     * Recalculates dimensions when web fonts finish loading (prevents FOUT/FOIT layout misalignment).
     * @default true
     */
    observeFonts?: boolean;

    /**
     * Callback triggered whenever dimensions are recalculated.
     */
    onResize?: (detail: AutoResizeDetail) => void;
}

export type AutoResizeSource = boolean | AutoResizeAxis | AutoResizeOptions;

/**
 * Safely extracts numerical pixel value from CSS strings (e.g. "16px", "2.5rem").
 */
function parsePixels(value: string | undefined): number {
    if (!value) {
        return 0;
    }
    const match = /^[-+]?\d*\.?\d+/.exec(value);
    if (!match) {
        return 0;
    }
    const num = Number(match[0]);
    return Number.isFinite(num) ? num : 0;
}

/**
 * Parses numeric pixel value or CSS dimension string into pixels.
 */
function parseDimension(value: number | string | undefined): number | null {
    if (value === undefined || value === null) {
        return null;
    }
    if (typeof value === "number") {
        return Number.isFinite(value) && value >= 0 ? value : null;
    }
    const match = /^[-+]?\d*\.?\d+/.exec(value);
    if (!match) {
        return null;
    }
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

/**
 * Calculates accurate line height in pixels from computed styles.
 */
function getComputedLineHeight(computed: CSSStyleDeclaration): number {
    const raw = computed.lineHeight;
    if (raw && raw !== "normal") {
        const parsed = parsePixels(raw);
        if (parsed > 0) {
            return parsed;
        }
    }

    const fontSize = parsePixels(computed.fontSize);
    const validFontSize = fontSize > 0 ? fontSize : 16;
    return validFontSize * 1.2;
}

/**
 * Measures text width for horizontal input auto-resizing using an offscreen canvas or mirror span.
 */
function measureInputTextWidth(
    text: string,
    computed: CSSStyleDeclaration
): number {
    if (typeof document === "undefined") {
        return 0;
    }

    // Try Canvas 2D measurement for best performance and zero DOM thrashing
    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
            const fontStyle = computed.fontStyle ?? "normal";
            const fontVariant = computed.fontVariant ?? "normal";
            const fontWeight = computed.fontWeight ?? "400";
            const fontSize = computed.fontSize ?? "16px";
            const fontFamily = computed.fontFamily ?? "sans-serif";
            ctx.font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamily}`;
            const metrics = ctx.measureText(text || " ");
            return Math.ceil(metrics.width);
        }
    } catch {
        // Fallback to DOM span measurement below
    }

    const mirror = document.createElement("span");
    mirror.style.position = "absolute";
    mirror.style.visibility = "hidden";
    mirror.style.whiteSpace = "pre";
    mirror.style.top = "-9999px";
    mirror.style.left = "-9999px";
    mirror.style.font = computed.font;
    mirror.style.letterSpacing = computed.letterSpacing;
    mirror.style.textTransform = computed.textTransform;
    mirror.textContent = text || " ";

    document.body.append(mirror);
    const width = mirror.getBoundingClientRect().width;
    mirror.remove();

    return Math.ceil(width);
}

/**
 * Svelte 5 Element Attachment to automatically resize textareas, inputs, and editable containers.
 *
 * Handles:
 * - Shrink-on-delete without layout flickering or scroll jumps.
 * - Accurate `box-sizing: border-box` and `content-box` dimension calculation.
 * - Min/max row constraints and min/max pixel limits.
 * - Container reflow & word-wrap changes via `ResizeObserver`.
 * - Web font load shifts (`document.fonts`).
 * - Native form reset event handling.
 * - Zero `any`, clean snapshot teardown, and SSR compatibility.
 *
 * @example
 * ```svelte
 * <!-- Auto-expanding textarea -->
 * <textarea {@attach autoResize({ minRows: 2, maxRows: 10 })}></textarea>
 *
 * <!-- Auto-expanding single-line input -->
 * <input type="text" {@attach autoResize({ axis: "horizontal", minWidth: 60, maxWidth: 300 })} />
 * ```
 */
export function autoResize<T extends HTMLElement = HTMLTextAreaElement | HTMLInputElement>(
    sourceOrOptions?: AutoResizeSource
): Attachment<T> {
    const options: AutoResizeOptions =
        typeof sourceOrOptions === "boolean"
            ? { enabled: sourceOrOptions }
            : typeof sourceOrOptions === "string"
              ? { axis: sourceOrOptions }
              : (sourceOrOptions ?? {});

    const {
        enabled = true,
        axis,
        minRows,
        maxRows,
        minHeight,
        maxHeight,
        minWidth,
        maxWidth,
        buffer = 0,
        observeResize = true,
        observeFonts = true,
        onResize,
    } = options;

    if (!enabled) {
        return () => () => {};
    }

    return (node: T) => {
        let isUnmounted = false;
        let lastObservedWidth = 0;
        let isRecalculating = false;
        let resizeObserver: ResizeObserver | null = null;
        let mutationObserver: MutationObserver | null = null;
        let fontCleanup: (() => void) | null = null;

        // Snapshot original styles for 100% clean teardown
        const originalHeight = node.style.height;
        const originalWidth = node.style.width;
        const originalOverflowY = node.style.overflowY;
        const originalOverflowX = node.style.overflowX;
        const originalResize = node.style.resize;

        // Determine default axis based on element type
        const resolvedAxis: AutoResizeAxis =
            axis ??
            (node instanceof HTMLInputElement && node.type !== "textarea"
                ? "horizontal"
                : "vertical");

        // Prevent native textarea manual resize conflict when autoResize controls dimensions
        if (resolvedAxis === "vertical" && originalResize === "") {
            node.style.resize = "none";
        }

        node.dataset.autoResized = "";

        const recalculate = (): void => {
            if (isUnmounted || isRecalculating || !node.isConnected) {
                return;
            }

            if (typeof window === "undefined" || typeof document === "undefined") {
                return;
            }

            const computed = window.getComputedStyle(node);
            if (computed.display === "none") {
                return;
            }

            isRecalculating = true;

            try {
                const isBorderBox = computed.boxSizing === "border-box";
                const paddingLeft = parsePixels(computed.paddingLeft);
                const paddingRight = parsePixels(computed.paddingRight);
                const paddingTop = parsePixels(computed.paddingTop);
                const paddingBottom = parsePixels(computed.paddingBottom);
                const borderLeft = parsePixels(computed.borderLeftWidth);
                const borderRight = parsePixels(computed.borderRightWidth);
                const borderTop = parsePixels(computed.borderTopWidth);
                const borderBottom = parsePixels(computed.borderBottomWidth);

                const horizontalPadding = paddingLeft + paddingRight;
                const horizontalBorders = borderLeft + borderRight;
                const verticalPadding = paddingTop + paddingBottom;
                const verticalBorders = borderTop + borderBottom;

                const lineHeight = getComputedLineHeight(computed);

                let finalWidth = node.offsetWidth;
                let finalHeight = node.offsetHeight;
                let isClamped = false;
                let clampedAxis: "vertical" | "horizontal" | undefined;
                let clampedBoundary: "min" | "max" | undefined;

                // --- 1. VERTICAL RESIZE LOGIC ---
                if (resolvedAxis === "vertical" || resolvedAxis === "both") {
                    // Snapshot scroll positions prior to height collapse to prevent viewport/container jumping
                    const nodeScrollTop = node.scrollTop;
                    const parent = node.parentElement;
                    const parentScrollTop = parent?.scrollTop;
                    const windowScrollY = typeof window !== "undefined" ? window.scrollY : 0;
                    const windowScrollX = typeof window !== "undefined" ? window.scrollX : 0;

                    // Temporarily collapse height to read true scrollHeight without shrink-lock
                    node.style.height = "auto";

                    const rawScrollHeight = node.scrollHeight;

                    const calculatedHeight =
                        (isBorderBox
                            ? rawScrollHeight + verticalBorders
                            : rawScrollHeight - verticalPadding) + buffer;

                    // Compute vertical bounds (rows take precedence or pixel bounds)
                    const parsedMinHeight = parseDimension(minHeight);
                    const parsedMaxHeight = parseDimension(maxHeight);

                    let computedMinHeight = parsedMinHeight;
                    if (minRows !== undefined && minRows > 0) {
                        const rowsHeight =
                            minRows * lineHeight +
                            (isBorderBox ? verticalPadding + verticalBorders : 0);
                        computedMinHeight =
                            computedMinHeight !== null
                                ? Math.max(computedMinHeight, rowsHeight)
                                : rowsHeight;
                    }

                    let computedMaxHeight = parsedMaxHeight;
                    if (maxRows !== undefined && maxRows > 0) {
                        const rowsHeight =
                            maxRows * lineHeight +
                            (isBorderBox ? verticalPadding + verticalBorders : 0);
                        computedMaxHeight =
                            computedMaxHeight !== null
                                ? Math.min(computedMaxHeight, rowsHeight)
                                : rowsHeight;
                    }

                    let targetHeight = calculatedHeight;

                    if (computedMinHeight !== null && targetHeight < computedMinHeight) {
                        targetHeight = computedMinHeight;
                        isClamped = true;
                        clampedAxis = "vertical";
                        clampedBoundary = "min";
                    }

                    if (computedMaxHeight !== null && targetHeight >= computedMaxHeight) {
                        targetHeight = computedMaxHeight;
                        isClamped = true;
                        clampedAxis = "vertical";
                        clampedBoundary = "max";
                        node.style.overflowY = "auto";
                    } else {
                        node.style.overflowY = "hidden";
                    }

                    node.style.height = `${targetHeight}px`;
                    finalHeight = targetHeight;

                    // Restore scroll positions seamlessly
                    node.scrollTop = nodeScrollTop;
                    if (parent && parentScrollTop !== undefined) {
                        parent.scrollTop = parentScrollTop;
                    }
                    if (typeof window !== "undefined" && window.scrollY !== windowScrollY) {
                        window.scrollTo(windowScrollX, windowScrollY);
                    }
                }

                // --- 2. HORIZONTAL RESIZE LOGIC ---
                if (resolvedAxis === "horizontal" || resolvedAxis === "both") {
                    const text =
                        node instanceof HTMLInputElement
                            ? node.value || node.placeholder || ""
                            : node.textContent || "";

                    const measuredTextWidth = measureInputTextWidth(text, computed);

                    const calculatedWidth =
                        (isBorderBox
                            ? measuredTextWidth + horizontalPadding + horizontalBorders
                            : measuredTextWidth) + buffer;

                    const parsedMinWidth = parseDimension(minWidth);
                    const parsedMaxWidth = parseDimension(maxWidth);

                    let targetWidth = calculatedWidth;

                    if (parsedMinWidth !== null && targetWidth < parsedMinWidth) {
                        targetWidth = parsedMinWidth;
                        isClamped = true;
                        clampedAxis = "horizontal";
                        clampedBoundary = "min";
                    }

                    if (parsedMaxWidth !== null && targetWidth >= parsedMaxWidth) {
                        targetWidth = parsedMaxWidth;
                        isClamped = true;
                        clampedAxis = "horizontal";
                        clampedBoundary = "max";
                        node.style.overflowX = "auto";
                    } else {
                        node.style.overflowX = "hidden";
                    }

                    node.style.width = `${targetWidth}px`;
                    finalWidth = targetWidth;
                }

                onResize?.({
                    element: node,
                    width: finalWidth,
                    height: finalHeight,
                    isClamped,
                    clampedAxis,
                    clampedBoundary,
                });
            } finally {
                isRecalculating = false;
            }
        };

        // Event listeners for text changes
        const handleInput = (): void => {
            recalculate();
        };

        node.addEventListener("input", handleInput);
        node.addEventListener("change", handleInput);

        // Handle native form reset (deferred to allow browser to restore default value)
        const form = "form" in node ? (node.form as HTMLFormElement | null) : null;
        let formResetTimerId: ReturnType<typeof setTimeout> | null = null;
        let handleFormReset: (() => void) | null = null;
        if (form) {
            handleFormReset = (): void => {
                if (formResetTimerId !== null) {
                    clearTimeout(formResetTimerId);
                }
                formResetTimerId = setTimeout(() => {
                    if (!isUnmounted) {
                        recalculate();
                    }
                }, 0);
            };
            form.addEventListener("reset", handleFormReset);
        }

        // Observe container reflows & width changes (only relevant for vertical word-wrap calculation)
        if (
            observeResize &&
            resolvedAxis !== "horizontal" &&
            typeof ResizeObserver !== "undefined"
        ) {
            resizeObserver = new ResizeObserver((entries) => {
                if (isUnmounted) return;
                for (const entry of entries) {
                    const currentWidth = entry.contentRect.width;
                    if (Math.abs(currentWidth - lastObservedWidth) > 0.5) {
                        lastObservedWidth = currentWidth;
                        recalculate();
                    }
                }
            });
            resizeObserver.observe(node);
        }

        // Observe DOM mutations for contenteditable or dynamic placeholder/value updates
        if (typeof MutationObserver !== "undefined") {
            mutationObserver = new MutationObserver(() => {
                if (isUnmounted) return;
                recalculate();
            });
            mutationObserver.observe(node, {
                childList: true,
                characterData: true,
                subtree: true,
                attributes: true,
                attributeFilter: ["placeholder", "rows", "value"],
            });
        }

        // Web font loading support
        if (
            observeFonts &&
            typeof document !== "undefined" &&
            "fonts" in document &&
            document.fonts
        ) {
            const handleFontLoaded = (): void => {
                if (!isUnmounted) {
                    recalculate();
                }
            };

            if (document.fonts.ready) {
                void (async () => {
                    await document.fonts.ready;
                    handleFontLoaded();
                })();
            }
            document.fonts.addEventListener?.("loadingdone", handleFontLoaded);

            fontCleanup = () => {
                document.fonts.removeEventListener?.("loadingdone", handleFontLoaded);
            };
        }

        // Initial measurement
        recalculate();

        // Teardown
        return () => {
            isUnmounted = true;

            node.removeEventListener("input", handleInput);
            node.removeEventListener("change", handleInput);

            if (form && handleFormReset) {
                form.removeEventListener("reset", handleFormReset);
            }

            if (formResetTimerId !== null) {
                clearTimeout(formResetTimerId);
                formResetTimerId = null;
            }

            if (resizeObserver) {
                resizeObserver.disconnect();
                resizeObserver = null;
            }

            if (mutationObserver) {
                mutationObserver.disconnect();
                mutationObserver = null;
            }

            if (fontCleanup) {
                fontCleanup();
                fontCleanup = null;
            }

            delete node.dataset.autoResized;

            // Restore original styles
            node.style.height = originalHeight;
            node.style.width = originalWidth;
            node.style.overflowY = originalOverflowY;
            node.style.overflowX = originalOverflowX;
            node.style.resize = originalResize;
        };
    };
}
