import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { longPress, type LongPressCallback } from "./long-press.attach";

describe("longPress Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        vi.useFakeTimers();
        container = document.createElement("div");
        document.body.append(container);
    });

    afterEach(() => {
        vi.runOnlyPendingTimers();
        vi.useRealTimers();
        container.remove();
        vi.restoreAllMocks();
    });

    describe("Initialization & Shorthand Syntax", () => {
        test("should trigger callback when held for default duration (500ms)", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress(callback);
            const cleanup = attach(btn);

            const pointerDown = new PointerEvent("pointerdown", {
                button: 0,
                pointerId: 1,
                clientX: 100,
                clientY: 100,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(pointerDown);

            expect(btn.dataset.longPressing).toBe("");
            expect(callback).not.toHaveBeenCalled();

            // Advance time before threshold
            vi.advanceTimersByTime(400);
            expect(callback).not.toHaveBeenCalled();

            // Reach 500ms threshold
            vi.advanceTimersByTime(100);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(btn.dataset.longPressing).toBeUndefined();

            cleanup?.();
        });

        test("should return early no-op cleanup when enabled is false", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress({ onLongPress: callback, enabled: false });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", { button: 0, pointerId: 1, bubbles: true })
            );
            vi.advanceTimersByTime(1000);

            expect(callback).not.toHaveBeenCalled();
            expect(btn.dataset.longPressing).toBeUndefined();

            cleanup?.();
        });

        test("should return early no-op cleanup when neither onLongPress nor onProgress is given", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = longPress({});
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", { button: 0, pointerId: 1, bubbles: true })
            );

            expect(btn.dataset.longPressing).toBeUndefined();

            cleanup?.();
        });
    });

    describe("Mouse & Pointer Filtering", () => {
        test("should ignore non-primary mouse buttons (button !== 0)", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress(callback);
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", { button: 2, pointerId: 1, bubbles: true })
            );
            vi.advanceTimersByTime(600);

            expect(callback).not.toHaveBeenCalled();
            expect(btn.dataset.longPressing).toBeUndefined();

            cleanup?.();
        });

        test("should track only the initial pointer in multi-touch scenarios", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const cancelSpy = vi.fn();
            const attach = longPress({
                onLongPress: callback,
                onCancel: cancelSpy,
            });
            const cleanup = attach(btn);

            // First pointer down
            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 10,
                    clientX: 50,
                    clientY: 50,
                    bubbles: true,
                })
            );

            // Second pointer move/up should be ignored
            btn.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 20,
                    clientX: 200,
                    clientY: 200,
                    bubbles: true,
                })
            );
            btn.dispatchEvent(
                new PointerEvent("pointerup", {
                    pointerId: 20,
                    bubbles: true,
                })
            );

            expect(cancelSpy).not.toHaveBeenCalled();

            // First pointer reaches duration
            vi.advanceTimersByTime(500);
            expect(callback).toHaveBeenCalledTimes(1);

            cleanup?.();
        });
    });

    describe("Movement Slop / Tolerance & Cancellation", () => {
        test("should NOT cancel when movement is within moveTolerance", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const cancelSpy = vi.fn();
            const attach = longPress({
                onLongPress: callback,
                onCancel: cancelSpy,
                moveTolerance: 10,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 1,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // Move by 5px (within 10px tolerance)
            btn.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 103,
                    clientY: 104,
                    bubbles: true,
                })
            );

            vi.advanceTimersByTime(500);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(cancelSpy).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should cancel when movement exceeds moveTolerance", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const cancelSpy = vi.fn();
            const attach = longPress({
                onLongPress: callback,
                onCancel: cancelSpy,
                moveTolerance: 10,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 1,
                    clientX: 100,
                    clientY: 100,
                    bubbles: true,
                })
            );

            // Move by 20px (exceeds 10px)
            btn.dispatchEvent(
                new PointerEvent("pointermove", {
                    pointerId: 1,
                    clientX: 120,
                    clientY: 100,
                    bubbles: true,
                })
            );

            expect(cancelSpy).toHaveBeenCalledWith("moved");
            expect(btn.dataset.longPressing).toBeUndefined();

            vi.advanceTimersByTime(500);
            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should cancel when released before duration completes", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const cancelSpy = vi.fn();
            const attach = longPress({
                onLongPress: callback,
                onCancel: cancelSpy,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 1,
                    bubbles: true,
                })
            );

            vi.advanceTimersByTime(200);

            btn.dispatchEvent(
                new PointerEvent("pointerup", {
                    pointerId: 1,
                    bubbles: true,
                })
            );

            expect(cancelSpy).toHaveBeenCalledWith("released");

            vi.advanceTimersByTime(300);
            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should cancel on pointercancel event", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const cancelSpy = vi.fn();
            const attach = longPress({
                onLongPress: callback,
                onCancel: cancelSpy,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 1,
                    bubbles: true,
                })
            );

            btn.dispatchEvent(
                new PointerEvent("pointercancel", {
                    pointerId: 1,
                    bubbles: true,
                })
            );

            expect(cancelSpy).toHaveBeenCalledWith("cancelled");

            vi.advanceTimersByTime(500);
            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Ghost-Click & Context Menu Prevention", () => {
        test("should prevent default and stop propagation on following click event if triggered", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress({
                onLongPress: callback,
                preventClick: true,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 1,
                    bubbles: true,
                })
            );
            vi.advanceTimersByTime(500);
            expect(callback).toHaveBeenCalledTimes(1);

            // Release pointer
            btn.dispatchEvent(
                new PointerEvent("pointerup", {
                    pointerId: 1,
                    bubbles: true,
                })
            );

            // Subsequent click event
            const clickEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(clickEvent);

            expect(clickEvent.defaultPrevented).toBe(true);

            cleanup?.();
        });

        test("should NOT prevent click if preventClick: false", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = longPress({
                onLongPress: vi.fn<LongPressCallback>(),
                preventClick: false,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 1,
                    bubbles: true,
                })
            );
            vi.advanceTimersByTime(500);

            const clickEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(clickEvent);

            expect(clickEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });

        test("should prevent contextmenu event when long-press was triggered", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = longPress({
                onLongPress: vi.fn<LongPressCallback>(),
                preventContextMenu: true,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 1,
                    bubbles: true,
                })
            );
            vi.advanceTimersByTime(500);

            const contextMenuEvent = new MouseEvent("contextmenu", {
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(contextMenuEvent);

            expect(contextMenuEvent.defaultPrevented).toBe(true);

            cleanup?.();
        });

        test("should prevent contextmenu event DURING active press before duration expires", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = longPress({
                onLongPress: vi.fn<LongPressCallback>(),
                preventContextMenu: true,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 1,
                    bubbles: true,
                })
            );

            // Time is only at 200ms (mobile long-press contextmenu trigger point)
            vi.advanceTimersByTime(200);

            const contextMenuEvent = new MouseEvent("contextmenu", {
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(contextMenuEvent);

            expect(contextMenuEvent.defaultPrevented).toBe(true);

            cleanup?.();
        });

        test("should prevent delayed synthetic click arriving within 400ms window (e.g. mobile 300ms tap delay)", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress({
                onLongPress: callback,
                preventClick: true,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 1,
                    bubbles: true,
                })
            );
            vi.advanceTimersByTime(500);
            expect(callback).toHaveBeenCalledTimes(1);

            // Pointer released
            btn.dispatchEvent(
                new PointerEvent("pointerup", {
                    pointerId: 1,
                    bubbles: true,
                })
            );

            // Synthetic mobile click arrives 250ms later
            vi.advanceTimersByTime(250);

            const delayedClick = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(delayedClick);

            expect(delayedClick.defaultPrevented).toBe(true);

            cleanup?.();
        });

        test("should auto-reset suppressClick window after 400ms so future real clicks are not eaten", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress({
                onLongPress: callback,
                preventClick: true,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", {
                    button: 0,
                    pointerId: 1,
                    bubbles: true,
                })
            );
            vi.advanceTimersByTime(500);
            expect(callback).toHaveBeenCalledTimes(1);

            // Pointer released (dragged away without click)
            btn.dispatchEvent(
                new PointerEvent("pointerup", {
                    pointerId: 1,
                    bubbles: true,
                })
            );

            // Advance beyond 400ms suppression window
            vi.advanceTimersByTime(450);

            // A future separate click
            const futureClick = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(futureClick);

            expect(futureClick.defaultPrevented).toBe(false);

            cleanup?.();
        });
    });

    describe("Keyboard Navigation (Space & Enter)", () => {
        test("should prevent default on initial Space keydown to stop page scrolling", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = longPress({ onLongPress: vi.fn<LongPressCallback>(), keyboard: true });
            const cleanup = attach(btn);

            const spaceDown = new KeyboardEvent("keydown", {
                key: " ",
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(spaceDown);

            expect(spaceDown.defaultPrevented).toBe(true);

            cleanup?.();
        });
        test("should trigger long-press via Enter key", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress({ onLongPress: callback, keyboard: true });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
            );
            expect(btn.dataset.longPressing).toBe("");

            vi.advanceTimersByTime(500);
            expect(callback).toHaveBeenCalledTimes(1);

            btn.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", bubbles: true }));
            expect(btn.dataset.longPressing).toBeUndefined();

            cleanup?.();
        });

        test("should cancel key long-press when key is released early", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const cancelSpy = vi.fn();
            const attach = longPress({
                onLongPress: callback,
                onCancel: cancelSpy,
                keyboard: true,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true })
            );
            vi.advanceTimersByTime(200);

            btn.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
            expect(cancelSpy).toHaveBeenCalledWith("released");

            vi.advanceTimersByTime(300);
            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should ignore keyboard when keyboard: false", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress({ onLongPress: callback, keyboard: false });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
            );
            vi.advanceTimersByTime(600);

            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Disabled & Inert Element Handling", () => {
        test("should ignore press when element has aria-disabled='true'", () => {
            const btn = document.createElement("button");
            btn.setAttribute("aria-disabled", "true");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress(callback);
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", { button: 0, pointerId: 1, bubbles: true })
            );
            vi.advanceTimersByTime(500);

            expect(callback).not.toHaveBeenCalled();
            expect(btn.dataset.longPressing).toBeUndefined();

            cleanup?.();
        });

        test("should ignore press when target child is disabled", () => {
            const wrapper = document.createElement("div");
            const childBtn = document.createElement("button");
            childBtn.setAttribute("aria-disabled", "true");
            wrapper.append(childBtn);
            container.append(wrapper);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress(callback);
            const cleanup = attach(wrapper);

            childBtn.dispatchEvent(
                new PointerEvent("pointerdown", { button: 0, pointerId: 1, bubbles: true })
            );
            vi.advanceTimersByTime(500);

            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should allow press when ignoreDisabled: false", () => {
            const btn = document.createElement("button");
            btn.setAttribute("aria-disabled", "true");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress({ onLongPress: callback, ignoreDisabled: false });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", { button: 0, pointerId: 1, bubbles: true })
            );
            vi.advanceTimersByTime(500);

            expect(callback).toHaveBeenCalledTimes(1);

            cleanup?.();
        });
    });

    describe("touchAction Option & Touchscreen Scroll Prevention", () => {
        test("should apply touch-action: none by default and restore previous value on unmount", () => {
            const btn = document.createElement("button");
            btn.style.touchAction = "pan-y";
            container.append(btn);

            const attach = longPress(vi.fn<LongPressCallback>());
            const cleanup = attach(btn);

            expect(btn.style.touchAction).toBe("none");

            cleanup?.();
            expect(btn.style.touchAction).toBe("pan-y");
        });

        test("should respect custom touchAction: 'manipulation'", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = longPress({
                onLongPress: vi.fn<LongPressCallback>(),
                touchAction: "manipulation",
            });
            const cleanup = attach(btn);

            expect(btn.style.touchAction).toBe("manipulation");

            cleanup?.();
        });

        test("should not set touch-action when touchAction: false", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = longPress({
                onLongPress: vi.fn<LongPressCallback>(),
                touchAction: false,
            });
            const cleanup = attach(btn);

            expect(btn.style.touchAction).toBe("");

            cleanup?.();
        });
    });

    describe("Vibration & Teardown", () => {
        test("should invoke navigator.vibrate when vibrate option is enabled", () => {
            const vibrateSpy = vi.fn();
            Object.defineProperty(navigator, "vibrate", {
                value: vibrateSpy,
                writable: true,
                configurable: true,
            });

            const btn = document.createElement("button");
            container.append(btn);

            const attach = longPress({
                onLongPress: vi.fn<LongPressCallback>(),
                vibrate: 100,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", { button: 0, pointerId: 1, bubbles: true })
            );
            vi.advanceTimersByTime(500);

            expect(vibrateSpy).toHaveBeenCalledWith(100);

            cleanup?.();
        });

        test("should clean up pending timers, dataset attributes, and listeners on unmount", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<LongPressCallback>();
            const attach = longPress(callback);
            const cleanup = attach(btn);

            btn.dispatchEvent(
                new PointerEvent("pointerdown", { button: 0, pointerId: 1, bubbles: true })
            );
            expect(btn.dataset.longPressing).toBe("");

            cleanup?.();
            expect(btn.dataset.longPressing).toBeUndefined();

            vi.advanceTimersByTime(500);
            expect(callback).not.toHaveBeenCalled();

            // Re-dispatch after unmount
            btn.dispatchEvent(
                new PointerEvent("pointerdown", { button: 0, pointerId: 1, bubbles: true })
            );
            vi.advanceTimersByTime(500);
            expect(callback).not.toHaveBeenCalled();
        });
    });
});
