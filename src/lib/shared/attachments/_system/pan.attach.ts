import type { Attachment } from "svelte/attachments";
import { isElementDisabledOrInert } from "./focus.utils";

export type PanAxis = "x" | "y" | "both" | "lock-on-start";
export type PanDirection = "left" | "right" | "up" | "down";

export interface PanPoint {
    x: number;
    y: number;
    time: number;
}

export interface PanVector {
    x: number;
    y: number;
}

export interface PanEventBase {
    /** The element the pan attachment is attached to */
    target: HTMLElement;
    /** Pointer ID currently being tracked */
    pointerId: number;
    /** Type of pointer ("touch", "mouse", "pen") */
    pointerType: string;
    /** Starting coordinate and timestamp of the gesture */
    startPoint: PanPoint;
    /** Current coordinate and timestamp */
    currentPoint: PanPoint;
    /** Raw unconstrained displacement from start position */
    delta: PanVector;
    /** Damped / resisted displacement when boundaries or resistance are configured */
    resistedDelta: PanVector;
    /** Delta difference between current frame and previous frame */
    stepDelta: PanVector;
    /** Smoothed velocity in px/ms */
    velocity: PanVector;
    /** Dominant movement direction */
    direction: PanDirection;
    /** Progress ratio between 0 and 1 relative to swipe distance threshold */
    progress: number;
    /** Original browser PointerEvent triggering this update */
    originalEvent: PointerEvent;
}

export type PanStartEvent = PanEventBase;
export type PanMoveEvent = PanEventBase;

export interface PanEndEvent extends PanEventBase {
    /** Whether movement qualified as a swipe gesture */
    isSwipe: boolean;
    /** Whether release velocity exceeded fling threshold */
    isFling: boolean;
}

export interface SwipeEvent extends PanEventBase {
    /** Dominant direction of swipe */
    direction: PanDirection;
    /** Whether swipe was triggered by high-velocity flick */
    isFling: boolean;
}

export interface PanBounds {
    minX?: number;
    maxX?: number;
    minY?: number;
    maxY?: number;
}

export interface PanCancelEvent {
    target: HTMLElement;
    reason: "cancelled" | "escape" | "lost-capture" | "blur" | "disabled";
    originalEvent?: Event;
}

export interface PanOptions {
    /**
     * Whether pan tracking is active.
     * @default true
     */
    enabled?: boolean;

    /**
     * Active tracking axis:
     * - `"x"`: Tracks horizontal gestures, allows vertical page scrolling until locked.
     * - `"y"`: Tracks vertical gestures, allows horizontal page scrolling until locked.
     * - `"both"`: Tracks 2D free panning.
     * - `"lock-on-start"`: Dynamically locks onto dominant axis once movement threshold is met.
     * @default "x"
     */
    axis?: PanAxis;

    /**
     * Minimum movement in pixels required before gesture transitions from pending to active.
     * Prevents accidental gesture triggers when tapping or clicking.
     * @default 8
     */
    threshold?: number;

    /**
     * Ratio of primary vs secondary axis movement required to confirm directional intent.
     * For example, at 1.25, horizontal movement must be at least 1.25x greater than vertical movement.
     * @default 1.25
     */
    axisLockRatio?: number;

    /**
     * Minimum release velocity in px/ms to qualify as a flick/fling gesture.
     * 0.5 px/ms = 500 px/second.
     * @default 0.5
     */
    swipeVelocityThreshold?: number;

    /**
     * Minimum travel distance in pixels to qualify as a completed swipe on release.
     * @default 50
     */
    swipeDistanceThreshold?: number;

    /**
     * Boundary limits for displacement calculations.
     * Can be a static bounds object or dynamic factory receiving the container element.
     */
    bounds?: PanBounds | ((container: HTMLElement) => PanBounds);

    /**
     * Resistance damping factor when overshooting configured bounds (0 = hard stop, 1 = no resistance).
     * @default 0.55
     */
    resistance?: number;

    /**
     * Management of the CSS `touch-action` property on the element:
     * - `true` / `"auto"`: Automatically sets `pan-y` for axis="x", `pan-x` for axis="y", or `none` for axis="both".
     * - `"none"` | `"pan-x"` | `"pan-y"`: Explicit touch-action style.
     * - `false`: Does not modify touch-action style.
     * @default true
     */
    touchAction?: boolean | "auto" | "none" | "pan-x" | "pan-y";

    /**
     * Prevent default browser touch scrolling once gesture is locked into active state.
     * @default true
     */
    preventScrollOnLock?: boolean;

    /**
     * Suppress synthetic click events on child elements if a drag occurred.
     * @default true
     */
    preventClickOnDrag?: boolean;

    /**
     * Stop event propagation to parent gesture handlers during active pan.
     * @default false
     */
    stopEventPropagation?: boolean;

    /**
     * Cancel active pan when Escape key is pressed.
     * @default true
     */
    cancelOnEscape?: boolean;

    /**
     * Ignore gestures originating on disabled, aria-disabled, or inert elements.
     * @default true
     */
    ignoreDisabled?: boolean;

    // Event Callbacks
    onPanStart?: (event: PanStartEvent) => void;
    onPan?: (event: PanMoveEvent) => void;
    onPanEnd?: (event: PanEndEvent) => void;
    onSwipe?: (event: SwipeEvent) => void;
    onSwipeLeft?: (event: SwipeEvent) => void;
    onSwipeRight?: (event: SwipeEvent) => void;
    onSwipeUp?: (event: SwipeEvent) => void;
    onSwipeDown?: (event: SwipeEvent) => void;
    onCancel?: (event: PanCancelEvent) => void;
}

export type PanCallback = (event: PanMoveEvent) => void;
export type PanSource = PanCallback | PanOptions;

/** Maximum time window in ms for rolling velocity calculation */
const VELOCITY_SAMPLE_WINDOW_MS = 100;
/** Click suppression safety timeout in ms */
const CLICK_SUPPRESSION_TIMEOUT_MS = 400;

/**
 * Calculates smoothed velocity from a rolling window of recent pointer samples.
 */
function calculateSmoothedVelocity(history: readonly PanPoint[], now: number): PanVector {
    if (history.length < 2) {
        return { x: 0, y: 0 };
    }

    const cutoff = now - VELOCITY_SAMPLE_WINDOW_MS;
    const recentSamples = history.filter((sample) => sample.time >= cutoff);

    const first = recentSamples.at(0) ?? history.at(0);
    const last = recentSamples.at(-1) ?? history.at(-1);

    if (!first || !last || first === last) {
        return { x: 0, y: 0 };
    }

    const dt = last.time - first.time;
    if (dt <= 0) {
        return { x: 0, y: 0 };
    }

    return {
        x: (last.x - first.x) / dt,
        y: (last.y - first.y) / dt,
    };
}

/**
 * Applies logarithmic / asymptotic rubber-band damping when overshooting boundary limits.
 */
function applyRubberBandResistance(
    value: number,
    min: number | undefined,
    max: number | undefined,
    resistance: number
): number {
    if (min !== undefined && value < min) {
        const overshoot = min - value;
        const dimension = 200;
        const dampedOvershoot = (overshoot * dimension) / (dimension + (1 / Math.max(0.01, resistance)) * overshoot);
        return min - dampedOvershoot;
    }

    if (max !== undefined && value > max) {
        const overshoot = value - max;
        const dimension = 200;
        const dampedOvershoot = (overshoot * dimension) / (dimension + (1 / Math.max(0.01, resistance)) * overshoot);
        return max + dampedOvershoot;
    }

    return value;
}

/**
 * Resolves resisted displacement vector based on configured bounds.
 */
function computeResistedDelta(
    delta: PanVector,
    bounds: PanBounds | undefined,
    resistance: number
): PanVector {
    if (!bounds) {
        return delta;
    }

    return {
        x: applyRubberBandResistance(delta.x, bounds.minX, bounds.maxX, resistance),
        y: applyRubberBandResistance(delta.y, bounds.minY, bounds.maxY, resistance),
    };
}

/**
 * Determines dominant direction of movement.
 */
function computeDominantDirection(dx: number, dy: number): PanDirection {
    if (Math.abs(dx) >= Math.abs(dy)) {
        return dx >= 0 ? "right" : "left";
    }
    return dy >= 0 ? "down" : "up";
}

/**
 * Resolves touch-action CSS property string from configuration.
 */
function resolveTouchAction(
    touchAction: PanOptions["touchAction"],
    axis: PanAxis
): string | null {
    if (touchAction === false) {
        return null;
    }

    if (typeof touchAction === "string" && touchAction !== "auto") {
        return touchAction;
    }

    if (axis === "x") {
        return "pan-y";
    }
    if (axis === "y") {
        return "pan-x";
    }
    return "none";
}

/**
 * Svelte 5 Element Attachment for high-performance pan, drag, and swipe gestures.
 *
 * Implements intent detection, axis locking, smoothed rolling velocity, boundary rubber-banding,
 * pointer capture lifecycle, click suppression, and full ARIA / dataset reflection.
 *
 * @example
 * ```svelte
 * <div {@attach pan({
 *     axis: "x",
 *     onPan: ({ delta }) => { transformX = delta.x; },
 *     onSwipeRight: () => { navigateBack(); }
 * })}>
 *     Swipeable Card
 * </div>
 * ```
 */
export function pan<T extends HTMLElement = HTMLElement>(
    sourceOrOptions: PanSource = {}
): Attachment<T> {
    const options: PanOptions =
        typeof sourceOrOptions === "function"
            ? { onPan: sourceOrOptions }
            : sourceOrOptions;

    const {
        enabled = true,
        axis = "x",
        threshold = 8,
        axisLockRatio = 1.25,
        swipeVelocityThreshold = 0.5,
        swipeDistanceThreshold = 50,
        bounds,
        resistance = 0.55,
        touchAction = true,
        preventScrollOnLock = true,
        preventClickOnDrag = true,
        stopEventPropagation = false,
        cancelOnEscape = true,
        ignoreDisabled = true,
        onPanStart,
        onPan,
        onPanEnd,
        onSwipe,
        onSwipeLeft,
        onSwipeRight,
        onSwipeUp,
        onSwipeDown,
        onCancel,
    } = options;

    if (!enabled) {
        return () => () => {};
    }

    return (node: T) => {
        let isUnmounted = false;
        let activePointerId: number | null = null;
        let gestureState: "idle" | "pending" | "active" | "ignored" = "idle";
        let lockedAxis: "x" | "y" | null = null;
        let isDragCompleted = false;
        let clickSuppressionTimestamp = 0;

        let startPoint: PanPoint = { x: 0, y: 0, time: 0 };
        let lastPoint: PanPoint = { x: 0, y: 0, time: 0 };
        let currentPoint: PanPoint = { x: 0, y: 0, time: 0 };
        let sampleHistory: PanPoint[] = [];

        // Snapshot original styles for precise restoration
        const originalTouchAction = node.style.touchAction;
        const originalUserSelect = node.style.userSelect;

        const computedTouchAction = resolveTouchAction(touchAction, axis);
        if (computedTouchAction !== null) {
            node.style.touchAction = computedTouchAction;
        }

        const resolveCurrentBounds = (): PanBounds | undefined => {
            if (typeof bounds === "function") {
                return bounds(node);
            }
            return bounds;
        };

        const cleanupDOMState = (): void => {
            delete node.dataset.panning;
            delete node.dataset.panAxis;
            delete node.dataset.panDirection;
            node.style.userSelect = originalUserSelect;
        };

        const releaseCapture = (): void => {
            if (activePointerId !== null && typeof node.releasePointerCapture === "function") {
                try {
                    if (node.hasPointerCapture(activePointerId)) {
                        node.releasePointerCapture(activePointerId);
                    }
                } catch {
                    // Ignore pointer capture release exceptions if pointer was already lost
                }
            }
        };

        const removeDynamicWindowListeners = (): void => {
            if (typeof window === "undefined") {
                return;
            }
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerCancel);
        };

        const resetGestureState = (): void => {
            removeDynamicWindowListeners();
            releaseCapture();
            cleanupDOMState();
            gestureState = "idle";
            activePointerId = null;
            lockedAxis = null;
            sampleHistory = [];
        };

        const handleCancel = (
            reason: PanCancelEvent["reason"],
            originalEvent?: Event
        ): void => {
            if (gestureState === "active" && !isUnmounted) {
                onCancel?.({ target: node, reason, originalEvent });
            }
            resetGestureState();
        };

        const handlePointerDown = (e: PointerEvent): void => {
            if (isUnmounted || !node.isConnected) {
                return;
            }

            // Only track primary pointer (ignore secondary touches / multi-touch)
            if (!e.isPrimary && e.pointerType === "touch") {
                return;
            }

            // Only allow primary mouse button
            if (e.pointerType === "mouse" && e.button !== 0) {
                return;
            }

            // Reject if already tracking an active gesture
            if (activePointerId !== null) {
                return;
            }

            // Check disabled state
            if (ignoreDisabled && (isElementDisabledOrInert(node) || (e.target instanceof Element && isElementDisabledOrInert(e.target)))) {
                return;
            }

            activePointerId = e.pointerId;
            gestureState = "pending";
            lockedAxis = null;
            isDragCompleted = false;

            const now = typeof performance !== "undefined" ? performance.now() : Date.now();
            startPoint = { x: e.clientX, y: e.clientY, time: now };
            lastPoint = { ...startPoint };
            currentPoint = { ...startPoint };
            sampleHistory = [startPoint];

            if (typeof window !== "undefined") {
                window.addEventListener("pointermove", handlePointerMove, { passive: false });
                window.addEventListener("pointerup", handlePointerUp);
                window.addEventListener("pointercancel", handlePointerCancel);
            }
        };

        const handlePointerMove = (e: PointerEvent): void => {
            if (isUnmounted || gestureState === "idle" || gestureState === "ignored") {
                return;
            }

            if (e.pointerId !== activePointerId) {
                return;
            }

            const now = typeof performance !== "undefined" ? performance.now() : Date.now();
            currentPoint = { x: e.clientX, y: e.clientY, time: now };
            sampleHistory.push(currentPoint);

            // Prune history samples older than the rolling velocity window
            const cutoff = now - VELOCITY_SAMPLE_WINDOW_MS;
            while (sampleHistory.length > 2 && (sampleHistory.at(0)?.time ?? 0) < cutoff) {
                sampleHistory.shift();
            }

            const dx = currentPoint.x - startPoint.x;
            const dy = currentPoint.y - startPoint.y;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            const distance = Math.hypot(dx, dy);

            // Phase 1: Intent Detection & Axis Locking
            if (gestureState === "pending") {
                if (distance < threshold) {
                    return; // Within deadzone
                }

                switch (axis) {
                    case "x": {
                        if (absDx >= absDy * axisLockRatio) {
                            gestureState = "active";
                            lockedAxis = "x";
                        } else {
                            resetGestureState();
                            return;
                        }
                        break;
                    }
                    case "y": {
                        if (absDy >= absDx * axisLockRatio) {
                            gestureState = "active";
                            lockedAxis = "y";
                        } else {
                            resetGestureState();
                            return;
                        }
                        break;
                    }
                    case "lock-on-start": {
                        gestureState = "active";
                        lockedAxis = absDx >= absDy ? "x" : "y";
                        break;
                    }
                    default: {
                        gestureState = "active";
                        lockedAxis = null;
                        break;
                    }
                }

                if (gestureState === "active") {
                    if (typeof node.setPointerCapture === "function") {
                        try {
                            node.setPointerCapture(e.pointerId);
                        } catch {
                            // Ignore capture errors on unsupported engines
                        }
                    }

                    node.dataset.panning = "";
                    if (lockedAxis) {
                        node.dataset.panAxis = lockedAxis;
                    }
                    node.style.userSelect = "none";
                    isDragCompleted = true;

                    const initialBounds = resolveCurrentBounds();
                    const rawDelta: PanVector = { x: dx, y: dy };
                    const resistedDelta = computeResistedDelta(rawDelta, initialBounds, resistance);
                    const direction = computeDominantDirection(dx, dy);
                    const progress = Math.min(1, Math.max(0, distance / Math.max(1, swipeDistanceThreshold)));

                    onPanStart?.({
                        target: node,
                        pointerId: e.pointerId,
                        pointerType: e.pointerType,
                        startPoint,
                        currentPoint,
                        delta: rawDelta,
                        resistedDelta,
                        stepDelta: { x: currentPoint.x - lastPoint.x, y: currentPoint.y - lastPoint.y },
                        velocity: { x: 0, y: 0 },
                        direction,
                        progress,
                        originalEvent: e,
                    });
                }
            }

            // Phase 2: Active Tracking
            if (gestureState === "active") {
                if (preventScrollOnLock && e.cancelable) {
                    e.preventDefault();
                }
                if (stopEventPropagation) {
                    e.stopPropagation();
                }

                const currentBounds = resolveCurrentBounds();
                const rawDelta: PanVector = { x: dx, y: dy };
                const resistedDelta = computeResistedDelta(rawDelta, currentBounds, resistance);
                const stepDelta: PanVector = {
                    x: currentPoint.x - lastPoint.x,
                    y: currentPoint.y - lastPoint.y,
                };
                const velocity = calculateSmoothedVelocity(sampleHistory, now);
                const direction = computeDominantDirection(dx, dy);
                const progress = Math.min(1, Math.max(0, distance / Math.max(1, swipeDistanceThreshold)));

                node.dataset.panDirection = direction;

                onPan?.({
                    target: node,
                    pointerId: e.pointerId,
                    pointerType: e.pointerType,
                    startPoint,
                    currentPoint,
                    delta: rawDelta,
                    resistedDelta,
                    stepDelta,
                    velocity,
                    direction,
                    progress,
                    originalEvent: e,
                });

                lastPoint = { ...currentPoint };
            }
        };

        const handlePointerUp = (e: PointerEvent): void => {
            if (e.pointerId !== activePointerId) {
                return;
            }

            if (gestureState === "active") {
                const now = typeof performance !== "undefined" ? performance.now() : Date.now();
                const dx = e.clientX - startPoint.x;
                const dy = e.clientY - startPoint.y;
                const distance = Math.hypot(dx, dy);
                const currentBounds = resolveCurrentBounds();
                const rawDelta: PanVector = { x: dx, y: dy };
                const resistedDelta = computeResistedDelta(rawDelta, currentBounds, resistance);
                const stepDelta: PanVector = {
                    x: e.clientX - lastPoint.x,
                    y: e.clientY - lastPoint.y,
                };
                const velocity = calculateSmoothedVelocity(sampleHistory, now);
                const direction = computeDominantDirection(dx, dy);
                const progress = Math.min(1, Math.max(0, distance / Math.max(1, swipeDistanceThreshold)));

                // Evaluate Swipe & Fling criteria
                const isVertical =
                    lockedAxis === "y" ||
                    axis === "y" ||
                    (axis === "both" && (direction === "up" || direction === "down"));

                const primaryVelocity = isVertical ? Math.abs(velocity.y) : Math.abs(velocity.x);
                const primaryDistance = isVertical ? Math.abs(dy) : Math.abs(dx);

                const isFling = primaryVelocity >= swipeVelocityThreshold;
                const isDistanceSwipe = primaryDistance >= swipeDistanceThreshold;
                const isSwipe = isFling || isDistanceSwipe;

                const baseEvent: PanEventBase = {
                    target: node,
                    pointerId: e.pointerId,
                    pointerType: e.pointerType,
                    startPoint,
                    currentPoint: { x: e.clientX, y: e.clientY, time: now },
                    delta: rawDelta,
                    resistedDelta,
                    stepDelta,
                    velocity,
                    direction,
                    progress,
                    originalEvent: e,
                };

                onPanEnd?.({
                    ...baseEvent,
                    isSwipe,
                    isFling,
                });

                if (isSwipe) {
                    const swipeEvent: SwipeEvent = {
                        ...baseEvent,
                        direction,
                        isFling,
                    };

                    onSwipe?.(swipeEvent);
                    switch (direction) {
                        case "left": {
                            onSwipeLeft?.(swipeEvent);
                            break;
                        }
                        case "right": {
                            onSwipeRight?.(swipeEvent);
                            break;
                        }
                        case "up": {
                            onSwipeUp?.(swipeEvent);
                            break;
                        }
                        case "down": {
                            onSwipeDown?.(swipeEvent);
                            break;
                        }
                    }
                }

                if (isDragCompleted && preventClickOnDrag) {
                    clickSuppressionTimestamp = now + CLICK_SUPPRESSION_TIMEOUT_MS;
                }
            }

            resetGestureState();
        };

        const handlePointerCancel = (e: PointerEvent): void => {
            if (e.pointerId === activePointerId) {
                handleCancel("cancelled", e);
            }
        };

        const handleLostPointerCapture = (e: PointerEvent): void => {
            if (e.pointerId === activePointerId && gestureState === "active") {
                handleCancel("lost-capture", e);
            }
        };

        const handleClickCapture = (e: MouseEvent): void => {
            const now = typeof performance !== "undefined" ? performance.now() : Date.now();
            if (isDragCompleted || now < clickSuppressionTimestamp) {
                e.preventDefault();
                e.stopImmediatePropagation();
                isDragCompleted = false;
            }
        };

        const handleKeyDown = (e: KeyboardEvent): void => {
            if (!cancelOnEscape || e.key !== "Escape" || gestureState !== "active") {
                return;
            }
            e.preventDefault();
            handleCancel("escape", e);
        };

        const handleWindowBlur = (e: FocusEvent): void => {
            if (gestureState === "active") {
                handleCancel("blur", e);
            }
        };

        // Attach listeners
        node.addEventListener("pointerdown", handlePointerDown);
        node.addEventListener("lostpointercapture", handleLostPointerCapture);
        node.addEventListener("click", handleClickCapture, { capture: true });

        if (typeof window !== "undefined") {
            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("blur", handleWindowBlur);
        }

        // Teardown / Cleanup
        return () => {
            isUnmounted = true;
            resetGestureState();

            node.removeEventListener("pointerdown", handlePointerDown);
            node.removeEventListener("lostpointercapture", handleLostPointerCapture);
            node.removeEventListener("click", handleClickCapture, { capture: true });

            if (typeof window !== "undefined") {
                window.removeEventListener("keydown", handleKeyDown);
                window.removeEventListener("blur", handleWindowBlur);
            }

            // Restore original styles
            node.style.touchAction = originalTouchAction;
            node.style.userSelect = originalUserSelect;
        };
    };
}
