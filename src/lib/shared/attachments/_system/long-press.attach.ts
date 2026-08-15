import type { Attachment } from "svelte/attachments";

export type LongPressCancelReason = "moved" | "released" | "cancelled" | "blur";
export type LongPressCallback = (event: PointerEvent | KeyboardEvent) => void;

export interface LongPressOptions {
    /**
     * Callback triggered when the long-press threshold duration is reached.
     */
    onLongPress?: LongPressCallback;
    /**
     * Optional callback triggered when the press starts.
     */
    onStart?: (event: PointerEvent | KeyboardEvent) => void;
    /**
     * Optional callback triggered if the press is aborted before completion.
     */
    onCancel?: (reason: LongPressCancelReason) => void;
    /**
     * Optional progress callback receiving normalized progress from `0.0` to `1.0`.
     */
    onProgress?: (progress: number) => void;
    /**
     * Press duration in milliseconds required to trigger the long-press.
     * @default 500
     */
    duration?: number;
    /**
     * Maximum allowed movement in pixels before cancelling the press.
     * @default 10
     */
    moveTolerance?: number;
    /**
     * Prevent subsequent native `click` event following a successful long-press.
     * @default true
     */
    preventClick?: boolean;
    /**
     * Prevent native context menu on touch / long-press devices.
     * @default true
     */
    preventContextMenu?: boolean;
    /**
     * Inline `touch-action` CSS property to apply to prevent mobile browsers from aborting
     * the pointer stream with native scroll/pan gesture recognition. Pass `false` to disable.
     * @default "none"
     */
    touchAction?: "none" | "manipulation" | "pan-x" | "pan-y" | false;
    /**
     * Haptic feedback vibration in milliseconds (or boolean for default 50ms) on supported devices.
     * @default false
     */
    vibrate?: boolean | number;
    /**
     * Enable keyboard triggers via Enter and Space keys.
     * @default true
     */
    keyboard?: boolean;
    /**
     * Ignore interactions when the element or an ancestor is disabled or inert.
     * @default true
     */
    ignoreDisabled?: boolean;
    /**
     * Whether the attachment is active.
     * @default true
     */
    enabled?: boolean;
}

/**
 * Checks whether an element or any ancestor is disabled or inert.
 */
function isElementDisabled(element: Element): boolean {
    return Boolean(element.closest(':disabled, [aria-disabled="true"], [inert]'));
}

/**
 * Triggers device haptic feedback if supported and enabled.
 */
function triggerVibration(vibrate?: boolean | number): void {
    if (!vibrate || typeof navigator === "undefined" || !("vibrate" in navigator)) {
        return;
    }
    const durationMs = typeof vibrate === "number" ? vibrate : 50;
    navigator.vibrate(durationMs);
}

/**
 * Svelte 5 Element Attachment for handling long-press interactions.
 *
 * Supports PointerEvents with multi-touch isolation, movement jitter tolerance,
 * progress callbacks, haptic vibration, ghost-click suppression, and keyboard access.
 *
 * @example
 * ```svelte
 * <!-- Shorthand callback -->
 * <button {@attach longPress(() => console.log('Long pressed!'))}>Hold me</button>
 *
 * <!-- Full options with progress -->
 * <div {@attach longPress({
 *     duration: 800,
 *     onProgress: (p) => { progress = p; },
 *     onLongPress: handleSelectAll
 * })}>...</div>
 * ```
 */
export function longPress<T extends HTMLElement | SVGElement = HTMLElement>(
    handlerOrOptions?: LongPressCallback | LongPressOptions
): Attachment<T> {
    const options: LongPressOptions =
        typeof handlerOrOptions === "function"
            ? { onLongPress: handlerOrOptions }
            : (handlerOrOptions ?? {});

    const {
        onLongPress,
        onStart,
        onCancel,
        onProgress,
        duration = 500,
        moveTolerance = 10,
        preventClick = true,
        preventContextMenu = true,
        touchAction = "none",
        vibrate = false,
        keyboard = true,
        ignoreDisabled = true,
        enabled = true,
    } = options;

    if (!enabled || (!onLongPress && !onProgress)) {
        return () => () => {};
    }

    return (node: T) => {
        const htmlNode = "dataset" in node ? (node as HTMLElement) : null;
        const originalTouchAction = "style" in node ? (node as HTMLElement).style.touchAction : "";

        if (touchAction && "style" in node) {
            (node as HTMLElement).style.touchAction = touchAction;
        }

        let timerId: ReturnType<typeof setTimeout> | null = null;
        let rafId: number | null = null;
        let suppressClickTimerId: ReturnType<typeof setTimeout> | null = null;
        let startTime = 0;
        let activePointerId: number | null = null;
        let activeKey: string | null = null;
        let startX = 0;
        let startY = 0;
        let isTriggered = false;
        let isSuppressingClick = false;

        const clearTimers = (): void => {
            if (timerId !== null) {
                clearTimeout(timerId);
                timerId = null;
            }
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };

        const clearSuppressClickTimer = (): void => {
            if (suppressClickTimerId !== null) {
                clearTimeout(suppressClickTimerId);
                suppressClickTimerId = null;
            }
            isSuppressingClick = false;
        };

        const scheduleSuppressClickWindow = (): void => {
            clearSuppressClickTimer();
            isSuppressingClick = true;
            suppressClickTimerId = setTimeout(() => {
                isSuppressingClick = false;
                suppressClickTimerId = null;
            }, 400);
        };

        const releaseCapture = (): void => {
            if (activePointerId === null) {
                return;
            }
            try {
                (node as Element).releasePointerCapture?.(activePointerId);
            } catch {
                // Ignore errors if pointer capture was already lost or unsupported
            }
        };

        const removeDataset = (): void => {
            if (htmlNode) {
                delete htmlNode.dataset.longPressing;
            }
        };

        const updateProgressLoop = (): void => {
            if (!onProgress || isTriggered) return;

            const elapsed = performance.now() - startTime;
            const progressRatio = Math.min(1, Math.max(0, elapsed / duration));
            onProgress(progressRatio);

            if (progressRatio < 1 && timerId !== null) {
                rafId = requestAnimationFrame(updateProgressLoop);
            }
        };

        const startPress = (event: PointerEvent | KeyboardEvent, x = 0, y = 0): void => {
            clearTimers();
            clearSuppressClickTimer();
            isTriggered = false;
            startTime = performance.now();
            startX = x;
            startY = y;

            if (htmlNode) {
                htmlNode.dataset.longPressing = "";
            }

            onStart?.(event);

            if (onProgress) {
                onProgress(0);
                rafId = requestAnimationFrame(updateProgressLoop);
            }

            timerId = setTimeout(() => {
                isTriggered = true;
                timerId = null;
                removeDataset();

                if (onProgress) {
                    onProgress(1);
                }

                if (preventClick) {
                    scheduleSuppressClickWindow();
                }

                triggerVibration(vibrate);
                onLongPress?.(event);
            }, duration);
        };

        const cancelPress = (reason: LongPressCancelReason): void => {
            if (timerId === null && !isTriggered) return;

            clearTimers();
            clearSuppressClickTimer();
            removeDataset();
            releaseCapture();

            if (!isTriggered) {
                onProgress?.(0);
                onCancel?.(reason);
            }

            activePointerId = null;
            activeKey = null;
        };

        // Pointer Event Handlers
        const handlePointerDown = (event: Event): void => {
            const e = event as PointerEvent;
            if (e.button !== 0) return;

            const target = e.target instanceof Element ? e.target : node;
            if (ignoreDisabled && (isElementDisabled(node) || isElementDisabled(target))) {
                return;
            }

            activePointerId = e.pointerId;
            try {
                (node as Element).setPointerCapture?.(e.pointerId);
            } catch {
                // Ignore errors if pointer capture is unsupported or restricted
            }

            startPress(e, e.clientX, e.clientY);
        };

        const handlePointerMove = (event: Event): void => {
            if (activePointerId === null || isTriggered) return;

            const e = event as PointerEvent;
            if (e.pointerId !== activePointerId) return;

            const deltaDistance = Math.hypot(e.clientX - startX, e.clientY - startY);
            if (deltaDistance > moveTolerance) {
                cancelPress("moved");
            }
        };

        const handlePointerUp = (event: Event): void => {
            const e = event as PointerEvent;
            if (activePointerId === null || e.pointerId !== activePointerId) return;

            releaseCapture();

            if (!isTriggered) {
                cancelPress("released");
            } else {
                activePointerId = null;
            }
        };

        const handlePointerCancel = (event: Event): void => {
            const e = event as PointerEvent;
            if (activePointerId === null || e.pointerId !== activePointerId) return;

            cancelPress("cancelled");
        };

        // Keyboard Handlers
        const handleKeyDown = (event: Event): void => {
            if (!keyboard) return;

            const e = event as KeyboardEvent;
            if (e.key !== "Enter" && e.key !== " ") return;

            if (e.key === " ") {
                e.preventDefault();
            }

            if (e.repeat) {
                return;
            }

            const target = e.target instanceof Element ? e.target : node;
            if (ignoreDisabled && (isElementDisabled(node) || isElementDisabled(target))) {
                return;
            }

            activeKey = e.key;
            startPress(e);
        };

        const handleKeyUp = (event: Event): void => {
            if (!keyboard || activeKey === null) return;

            const e = event as KeyboardEvent;
            if (e.key !== activeKey) return;

            if (!isTriggered) {
                cancelPress("released");
            } else {
                activeKey = null;
            }
        };

        // Ghost click & Context Menu Interception
        const handleClick = (event: Event): void => {
            if (!isSuppressingClick) {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            clearSuppressClickTimer();
        };

        const handleContextMenu = (event: Event): void => {
            if (!preventContextMenu || (timerId === null && !isTriggered)) {
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
        };

        const handleWindowBlur = (): void => {
            cancelPress("blur");
        };

        // Attach listeners
        node.addEventListener("pointerdown", handlePointerDown);
        node.addEventListener("pointermove", handlePointerMove);
        node.addEventListener("pointerup", handlePointerUp);
        node.addEventListener("pointercancel", handlePointerCancel);
        node.addEventListener("click", handleClick, { capture: true });
        node.addEventListener("contextmenu", handleContextMenu, { capture: true });

        if (keyboard) {
            node.addEventListener("keydown", handleKeyDown);
            node.addEventListener("keyup", handleKeyUp);
        }

        if (typeof window !== "undefined") {
            window.addEventListener("blur", handleWindowBlur);
        }

        // Teardown
        return () => {
            clearTimers();
            clearSuppressClickTimer();
            removeDataset();
            releaseCapture();

            if ("style" in node) {
                (node as HTMLElement).style.touchAction = originalTouchAction;
            }

            node.removeEventListener("pointerdown", handlePointerDown);
            node.removeEventListener("pointermove", handlePointerMove);
            node.removeEventListener("pointerup", handlePointerUp);
            node.removeEventListener("pointercancel", handlePointerCancel);
            node.removeEventListener("click", handleClick, { capture: true });
            node.removeEventListener("contextmenu", handleContextMenu, { capture: true });

            if (keyboard) {
                node.removeEventListener("keydown", handleKeyDown);
                node.removeEventListener("keyup", handleKeyUp);
            }

            if (typeof window !== "undefined") {
                window.removeEventListener("blur", handleWindowBlur);
            }
        };
    };
}
