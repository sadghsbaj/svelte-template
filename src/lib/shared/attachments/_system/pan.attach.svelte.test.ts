import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
    pan,
    type PanCancelEvent,
    type PanEndEvent,
    type PanMoveEvent,
    type PanStartEvent,
    type SwipeEvent,
} from "./pan.attach";

describe("pan Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
    });

    afterEach(() => {
        container.remove();
        vi.restoreAllMocks();
    });

    describe("Initialization & Shorthand", () => {
        test("should support function shorthand for onPan", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanSpy = vi.fn((_event: PanMoveEvent) => {});
            const attach = pan(onPanSpy);
            const cleanup = attach(el);

            expect(el.style.touchAction).toBe("pan-y");

            cleanup?.();
        });

        test("should return early no-op when enabled is false", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const attach = pan({ enabled: false, onPanStart: onPanStartSpy });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 150,
                    clientY: 100,
                    bubbles: true,
                })
            );

            expect(onPanStartSpy).not.toHaveBeenCalled();
            expect(el.dataset.panning).toBeUndefined();

            cleanup?.();
        });
    });

    describe("Intent Detection & Deadzone Threshold", () => {
        test("should ignore movements within threshold deadzone (default 8px)", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const attach = pan({ threshold: 8, onPanStart: onPanStartSpy });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // Move 5px (within 8px threshold)
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 105,
                    clientY: 100,
                    bubbles: true,
                })
            );

            expect(onPanStartSpy).not.toHaveBeenCalled();
            expect(el.dataset.panning).toBeUndefined();

            cleanup?.();
        });

        test("should activate gesture when threshold is reached and set DOM attributes", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const attach = pan({ threshold: 8, onPanStart: onPanStartSpy });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // Move 12px (exceeds 8px)
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 112,
                    clientY: 100,
                    bubbles: true,
                })
            );

            expect(onPanStartSpy).toHaveBeenCalledTimes(1);
            expect(el.dataset.panning).toBe("");
            expect(el.dataset.panAxis).toBe("x");
            expect(el.style.userSelect).toBe("none");

            const startEvent = onPanStartSpy.mock.calls[0]?.[0];
            expect(startEvent?.delta.x).toBe(12);
            expect(startEvent?.direction).toBe("right");

            cleanup?.();
        });
    });

    describe("Axis Locking & Directional Intent", () => {
        test("should lock on horizontal gestures when axis='x' and ignore vertical scroll intent", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const onPanSpy = vi.fn((_event: PanMoveEvent) => {});
            const attach = pan({
                axis: "x",
                threshold: 8,
                axisLockRatio: 1.25,
                onPanStart: onPanStartSpy,
                onPan: onPanSpy,
            });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // User moves vertically (dy=20, dx=5) -> vertical scroll intent
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 105,
                    clientY: 120,
                    bubbles: true,
                })
            );

            expect(onPanStartSpy).not.toHaveBeenCalled();
            expect(onPanSpy).not.toHaveBeenCalled();
            expect(el.dataset.panning).toBeUndefined();

            cleanup?.();
        });

        test("should lock on vertical gestures when axis='y'", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const attach = pan({
                axis: "y",
                threshold: 8,
                axisLockRatio: 1.25,
                onPanStart: onPanStartSpy,
            });
            const cleanup = attach(el);

            expect(el.style.touchAction).toBe("pan-x");

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // User moves vertically (dy=20, dx=2)
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 102,
                    clientY: 120,
                    bubbles: true,
                })
            );

            expect(onPanStartSpy).toHaveBeenCalledTimes(1);
            expect(el.dataset.panAxis).toBe("y");
            expect(onPanStartSpy.mock.calls[0]?.[0]?.direction).toBe("down");

            cleanup?.();
        });

        test("should dynamically lock axis on start with axis='lock-on-start'", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const attach = pan({
                axis: "lock-on-start",
                threshold: 8,
                onPanStart: onPanStartSpy,
            });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // Move dx=15, dy=5 -> horizontal dominance
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 115,
                    clientY: 105,
                    bubbles: true,
                })
            );

            expect(onPanStartSpy).toHaveBeenCalledTimes(1);
            expect(el.dataset.panAxis).toBe("x");

            cleanup?.();
        });

        test("should allow 2D movement when axis='both'", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const attach = pan({
                axis: "both",
                threshold: 8,
                onPanStart: onPanStartSpy,
            });
            const cleanup = attach(el);

            expect(el.style.touchAction).toBe("none");

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 115,
                    clientY: 115,
                    bubbles: true,
                })
            );

            expect(onPanStartSpy).toHaveBeenCalledTimes(1);
            expect(el.dataset.panning).toBe("");
            expect(el.dataset.panAxis).toBeUndefined();

            cleanup?.();
        });
    });

    describe("Pointer & Mouse Filtering", () => {
        test("should ignore secondary mouse buttons (button !== 0)", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const attach = pan({ onPanStart: onPanStartSpy });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerType: "mouse",
                    button: 2, // Right click
                    pointerId: 1,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerType: "mouse",
                    pointerId: 1,
                    clientX: 150,
                    clientY: 100,
                    bubbles: true,
                })
            );

            expect(onPanStartSpy).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should ignore secondary touch contacts (multi-touch / pinch)", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const attach = pan({ onPanStart: onPanStartSpy });
            const cleanup = attach(el);

            // Secondary finger
            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerType: "touch",
                    isPrimary: false,
                    pointerId: 2,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerType: "touch",
                    pointerId: 2,
                    clientX: 150,
                    clientY: 100,
                    bubbles: true,
                })
            );

            expect(onPanStartSpy).not.toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Live Pan Updates & Step Deltas", () => {
        test("should fire onPan with continuous delta, stepDelta, and updated direction", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanSpy = vi.fn((_event: PanMoveEvent) => {});
            const attach = pan({
                axis: "x",
                threshold: 5,
                onPan: onPanSpy,
            });
            const cleanup = attach(el);

            // Start pointer
            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // Frame 1: activates pan (dx=10)
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 110,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // Frame 2: moves further right (dx=25)
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 125,
                    clientY: 100,
                    bubbles: true,
                })
            );

            expect(onPanSpy).toHaveBeenCalledTimes(2);

            const lastCall = onPanSpy.mock.calls[1]?.[0];
            expect(lastCall?.delta.x).toBe(25);
            expect(lastCall?.stepDelta.x).toBe(15);
            expect(lastCall?.direction).toBe("right");
            expect(el.dataset.panDirection).toBe("right");

            cleanup?.();
        });
    });

    describe("Boundaries & Rubber-Banding Resistance", () => {
        test("should calculate resistedDelta when overshooting defined bounds", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanSpy = vi.fn((_event: PanMoveEvent) => {});
            const attach = pan({
                axis: "x",
                threshold: 5,
                bounds: { minX: -50, maxX: 50 },
                resistance: 0.5,
                onPan: onPanSpy,
            });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // Move dx=100 (exceeds maxX of 50 by 50px)
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 200,
                    clientY: 100,
                    bubbles: true,
                })
            );

            const panEvent = onPanSpy.mock.calls[0]?.[0];
            expect(panEvent?.delta.x).toBe(100);
            expect(panEvent?.resistedDelta.x).toBeLessThan(100);
            expect(panEvent?.resistedDelta.x).toBeGreaterThan(50);

            cleanup?.();
        });

        test("should support dynamic bounds factory callback", () => {
            const el = document.createElement("div");
            container.append(el);

            const boundsFactory = vi.fn((_target: HTMLElement) => ({ minX: 0, maxX: 80 }));
            const onPanSpy = vi.fn((_event: PanMoveEvent) => {});
            const attach = pan({
                axis: "x",
                threshold: 5,
                bounds: boundsFactory,
                onPan: onPanSpy,
            });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 150,
                    clientY: 100,
                    bubbles: true,
                })
            );

            expect(boundsFactory).toHaveBeenCalledWith(el);

            cleanup?.();
        });
    });

    describe("Swipe & Fling Gestures", () => {
        test("should trigger onSwipe and onSwipeRight when distance threshold is reached", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanEndSpy = vi.fn((_event: PanEndEvent) => {});
            const onSwipeSpy = vi.fn((_event: SwipeEvent) => {});
            const onSwipeRightSpy = vi.fn((_event: SwipeEvent) => {});

            const attach = pan({
                axis: "x",
                threshold: 5,
                swipeDistanceThreshold: 60,
                onPanEnd: onPanEndSpy,
                onSwipe: onSwipeSpy,
                onSwipeRight: onSwipeRightSpy,
            });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", {
                    pointerId: 1,
                    button: 0,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // Move dx=70 (exceeds 60px distance threshold)
            el.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 170,
                    clientY: 100,
                    bubbles: true,
                })
            );

            el.dispatchEvent(
                new PointerEvent("pointerup", {
                    pointerId: 1,
                    clientX: 170,
                    clientY: 100,
                    bubbles: true,
                })
            );

            expect(onPanEndSpy).toHaveBeenCalledTimes(1);
            expect(onPanEndSpy.mock.calls[0]?.[0]?.isSwipe).toBe(true);
            expect(onSwipeSpy).toHaveBeenCalledTimes(1);
            expect(onSwipeRightSpy).toHaveBeenCalledTimes(1);
            expect(onSwipeSpy.mock.calls[0]?.[0]?.direction).toBe("right");

            cleanup?.();
        });

        test("should trigger directional callbacks: onSwipeLeft, onSwipeUp, onSwipeDown", () => {
            const el = document.createElement("div");
            container.append(el);

            const onSwipeLeftSpy = vi.fn((_event: SwipeEvent) => {});
            const attachLeft = pan({
                axis: "x",
                threshold: 5,
                swipeDistanceThreshold: 40,
                onSwipeLeft: onSwipeLeftSpy,
            });
            const cleanupLeft = attachLeft(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 1, clientX: 50, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointerup", { pointerId: 1, clientX: 50, clientY: 100, bubbles: true })
            );

            expect(onSwipeLeftSpy).toHaveBeenCalledTimes(1);
            cleanupLeft?.();

            // Test onSwipeUp
            const onSwipeUpSpy = vi.fn((_event: SwipeEvent) => {});
            const attachUp = pan({
                axis: "y",
                threshold: 5,
                swipeDistanceThreshold: 40,
                onSwipeUp: onSwipeUpSpy,
            });
            const cleanupUp = attachUp(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 2, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 2, clientX: 100, clientY: 50, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointerup", { pointerId: 2, clientX: 100, clientY: 50, bubbles: true })
            );

            expect(onSwipeUpSpy).toHaveBeenCalledTimes(1);
            cleanupUp?.();

            // Test onSwipeDown
            const onSwipeDownSpy = vi.fn((_event: SwipeEvent) => {});
            const attachDown = pan({
                axis: "y",
                threshold: 5,
                swipeDistanceThreshold: 40,
                onSwipeDown: onSwipeDownSpy,
            });
            const cleanupDown = attachDown(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 3, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 3, clientX: 100, clientY: 160, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointerup", { pointerId: 3, clientX: 100, clientY: 160, bubbles: true })
            );

            expect(onSwipeDownSpy).toHaveBeenCalledTimes(1);
            cleanupDown?.();
        });

        test("should properly recognize vertical swipes when axis='both'", () => {
            const el = document.createElement("div");
            container.append(el);

            const onSwipeUpSpy = vi.fn((_event: SwipeEvent) => {});
            const onPanEndSpy = vi.fn((_event: PanEndEvent) => {});
            const attach = pan({
                axis: "both",
                threshold: 5,
                swipeDistanceThreshold: 40,
                onSwipeUp: onSwipeUpSpy,
                onPanEnd: onPanEndSpy,
            });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            window.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 1, clientX: 102, clientY: 40, bubbles: true })
            );
            window.dispatchEvent(
                new PointerEvent("pointerup", { pointerId: 1, clientX: 102, clientY: 40, bubbles: true })
            );

            expect(onPanEndSpy).toHaveBeenCalledTimes(1);
            expect(onPanEndSpy.mock.calls[0]?.[0]?.isSwipe).toBe(true);
            expect(onSwipeUpSpy).toHaveBeenCalledTimes(1);

            cleanup?.();
        });
    });

    describe("Click Suppression", () => {
        test("should prevent click event on element after active drag", () => {
            const el = document.createElement("div");
            const btn = document.createElement("button");
            el.append(btn);
            container.append(el);

            const attach = pan({ threshold: 5, preventClickOnDrag: true });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 1, clientX: 150, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointerup", { pointerId: 1, clientX: 150, clientY: 100, bubbles: true })
            );

            const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
            btn.dispatchEvent(clickEvent);

            expect(clickEvent.defaultPrevented).toBe(true);

            cleanup?.();
        });

        test("should NOT prevent click if no drag occurred (simple tap)", () => {
            const el = document.createElement("div");
            const btn = document.createElement("button");
            el.append(btn);
            container.append(el);

            const attach = pan({ threshold: 10, preventClickOnDrag: true });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointerup", { pointerId: 1, clientX: 100, clientY: 100, bubbles: true })
            );

            const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
            btn.dispatchEvent(clickEvent);

            expect(clickEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });
    });

    describe("Cancellation, Escape & Focus Interruption", () => {
        test("should track pointer events dispatched on window even when pointer leaves element before threshold", () => {
            const el = document.createElement("div");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const onPanSpy = vi.fn((_event: PanMoveEvent) => {});
            const onPanEndSpy = vi.fn((_event: PanEndEvent) => {});
            const attach = pan({ threshold: 8, onPanStart: onPanStartSpy, onPan: onPanSpy, onPanEnd: onPanEndSpy });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );

            // Fast swipe: pointer immediately moves outside node, dispatched to window
            window.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 1, clientX: 150, clientY: 100, bubbles: true })
            );

            expect(onPanStartSpy).toHaveBeenCalledTimes(1);
            expect(el.dataset.panning).toBe("");
            expect(el.style.userSelect).toBe("none");

            window.dispatchEvent(
                new PointerEvent("pointerup", { pointerId: 1, clientX: 150, clientY: 100, bubbles: true })
            );

            expect(onPanEndSpy).toHaveBeenCalledTimes(1);
            expect(el.dataset.panning).toBeUndefined();
            expect(el.style.userSelect).toBe("");

            cleanup?.();
        });

        test("should cancel gesture and immediately restore userSelect when Escape key is pressed", () => {
            const el = document.createElement("div");
            el.style.userSelect = "text";
            container.append(el);

            const onCancelSpy = vi.fn((_event: PanCancelEvent) => {});
            const attach = pan({ threshold: 5, cancelOnEscape: true, onCancel: onCancelSpy });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            window.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 1, clientX: 120, clientY: 100, bubbles: true })
            );

            expect(el.dataset.panning).toBe("");
            expect(el.style.userSelect).toBe("none");

            const escapeEvent = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
            window.dispatchEvent(escapeEvent);

            expect(onCancelSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: el,
                    reason: "escape",
                })
            );
            expect(el.dataset.panning).toBeUndefined();
            expect(el.style.userSelect).toBe("text");

            cleanup?.();
        });

        test("should cancel gesture and immediately restore userSelect on pointercancel", () => {
            const el = document.createElement("div");
            el.style.userSelect = "text";
            container.append(el);

            const onCancelSpy = vi.fn((_event: PanCancelEvent) => {});
            const attach = pan({ threshold: 5, onCancel: onCancelSpy });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 1, clientX: 120, clientY: 100, bubbles: true })
            );

            el.dispatchEvent(
                new PointerEvent("pointercancel", { pointerId: 1, bubbles: true })
            );

            expect(onCancelSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: el,
                    reason: "cancelled",
                })
            );

            cleanup?.();
        });

        test("should cancel gesture on lostpointercapture", () => {
            const el = document.createElement("div");
            container.append(el);

            const onCancelSpy = vi.fn((_event: PanCancelEvent) => {});
            const attach = pan({ threshold: 5, onCancel: onCancelSpy });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 1, clientX: 120, clientY: 100, bubbles: true })
            );

            el.dispatchEvent(
                new PointerEvent("lostpointercapture", { pointerId: 1, bubbles: true })
            );

            expect(onCancelSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: el,
                    reason: "lost-capture",
                })
            );

            cleanup?.();
        });

        test("should cancel gesture on window blur", () => {
            const el = document.createElement("div");
            container.append(el);

            const onCancelSpy = vi.fn((_event: PanCancelEvent) => {});
            const attach = pan({ threshold: 5, onCancel: onCancelSpy });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 1, clientX: 120, clientY: 100, bubbles: true })
            );

            window.dispatchEvent(new FocusEvent("blur"));

            expect(onCancelSpy).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: el,
                    reason: "blur",
                })
            );

            cleanup?.();
        });
    });

    describe("Disabled & Inert Elements", () => {
        test("should ignore gesture when target element is aria-disabled", () => {
            const el = document.createElement("div");
            el.setAttribute("aria-disabled", "true");
            container.append(el);

            const onPanStartSpy = vi.fn((_event: PanStartEvent) => {});
            const attach = pan({ threshold: 5, ignoreDisabled: true, onPanStart: onPanStartSpy });
            const cleanup = attach(el);

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 1, clientX: 150, clientY: 100, bubbles: true })
            );

            expect(onPanStartSpy).not.toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Teardown & Restoration", () => {
        test("should restore original styles and clear dataset attributes on cleanup", () => {
            const el = document.createElement("div");
            el.style.touchAction = "manipulation";
            el.style.userSelect = "text";
            container.append(el);

            const attach = pan({ axis: "x", threshold: 5 });
            const cleanup = attach(el);

            expect(el.style.touchAction).toBe("pan-y");

            el.dispatchEvent(
                new PointerEvent("pointerdown", { pointerId: 1, button: 0, clientX: 100, clientY: 100, bubbles: true })
            );
            el.dispatchEvent(
                new PointerEvent("pointermove", { pointerId: 1, clientX: 120, clientY: 100, bubbles: true })
            );

            expect(el.dataset.panning).toBe("");

            cleanup?.();

            expect(el.style.touchAction).toBe("manipulation");
            expect(el.style.userSelect).toBe("text");
            expect(el.dataset.panning).toBeUndefined();
            expect(el.dataset.panAxis).toBeUndefined();
            expect(el.dataset.panDirection).toBeUndefined();
        });
    });
});
