// @vitest-environment jsdom
import { mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { motionPreference } from "$core/_system/motion/motion.svelte.js";

import { FocusAnimationController } from "./focus.animation.js";
import FocusHostFixture from "./__fixtures__/FocusHostFixture.svelte";
import { focusAttach, focusOverridesMap, onFocusOverridesChange } from "./focus.attach.js";
import {
    computeTargetBox,
    getFocusLayerRoot,
    resolveFocusLayerZIndex,
    resolveFocusTarget,
} from "./focus.geometry.js";
import {
    clearCanvas,
    drawFocusRing,
    drawSquirclePath,
    resolveAccentColor,
} from "./focus.renderer.js";
import type { ClipBox, FocusBox, FocusPaintState } from "./focus.types.js";
import { isTextEntryControl } from "./focus.visibility.js";

describe("focus.renderer", () => {
    it("resolveAccentColor returns a non-empty string", () => {
        const color = resolveAccentColor();
        expect(typeof color).toBe("string");
        expect(color.length).toBeGreaterThan(0);
    });

    it("clearCanvas calls clearRect with canvas dimensions", () => {
        const ctx = { clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        const canvas = { width: 100, height: 100 } as HTMLCanvasElement;
        clearCanvas(ctx, canvas);
        expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 100, 100);
    });

    it("drawFocusRing does not throw without paint state (defaults to ring)", () => {
        const ctx = makeMockCtx();
        const canvas = {} as HTMLCanvasElement;
        const box: FocusBox = { x: 0, y: 0, w: 10, h: 10, r: 0 };
        const clip: ClipBox = { x: 0, y: 0, w: 10, h: 10 };

        expect(() => drawFocusRing(ctx, canvas, box, clip)).not.toThrow();
    });

    it("drawFocusRing clamps negative radius to 0", () => {
        const ctx = makeMockCtx();
        const canvas = {} as HTMLCanvasElement;
        const box: FocusBox = { x: 10, y: 10, w: 100, h: 100, r: -4 };
        const clip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        drawFocusRing(ctx, canvas, box, clip);
        const args = (ctx.roundRect as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(args[4]).toBe(0);
    });

    it("drawFocusRing falls back to ctx.rect when ctx.roundRect is not available", () => {
        const ctx = makeMockCtx();
        delete (ctx as unknown as Record<string, unknown>).roundRect;
        const canvas = {} as HTMLCanvasElement;
        const box: FocusBox = { x: 10, y: 10, w: 100, h: 100, r: 4 };
        const clip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        expect(() => drawFocusRing(ctx, canvas, box, clip)).not.toThrow();
        expect(ctx.rect).toHaveBeenCalledWith(10, 10, 100, 100);
    });

    it("drawFocusRing respects overrides color", () => {
        let capturedStyle: string | undefined;
        const ctx = {
            ...makeMockCtx(),
            set strokeStyle(v: string) {
                capturedStyle = v;
            },
        } as unknown as CanvasRenderingContext2D;
        const canvas = {} as HTMLCanvasElement;
        const box: FocusBox = { x: 0, y: 0, w: 10, h: 10, r: 0 };
        const clip: ClipBox = { x: 0, y: 0, w: 10, h: 10 };

        drawFocusRing(ctx, canvas, box, clip, { color: "red" });
        expect(capturedStyle).toBe("red");
    });
});

describe("focus.geometry DOM functions", () => {
    it("computeTargetBox returns null when element has zero width/height", () => {
        const el = document.createElement("div");
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            width: 0,
            height: 0,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            toJSON: () => {},
        } as DOMRect);

        expect(computeTargetBox(el, 4)).toBeNull();
    });

    it("computeTargetBox returns null when element has 0 width even with height", () => {
        const el = document.createElement("div");
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            width: 0,
            height: 50,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 50,
            right: 0,
            toJSON: () => {},
        } as DOMRect);

        expect(computeTargetBox(el, 4)).toBeNull();
    });

    it("computeTargetBox returns a valid box when element has size", () => {
        const el = document.createElement("div");
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            width: 100,
            height: 100,
            x: 10,
            y: 10,
            top: 10,
            left: 10,
            bottom: 110,
            right: 110,
            toJSON: () => {},
        } as DOMRect);

        const result = computeTargetBox(el, 4);
        expect(result).not.toBeNull();
        expect(result?.box.w).toBe(108);
        expect(result?.box.h).toBe(108);
    });

    it("computeTargetBox reads borderRadius via parseBorderRadius (fixes '8px' returning 0)", () => {
        const el = document.createElement("div");
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            width: 100,
            height: 40,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 40,
            right: 100,
            toJSON: () => {},
        } as DOMRect);
        vi.spyOn(window, "getComputedStyle").mockReturnValue({
            borderRadius: "8px",
            overflow: "",
            overflowX: "",
            overflowY: "",
        } as unknown as CSSStyleDeclaration);

        const result = computeTargetBox(el, 4);
        expect(result).not.toBeNull();
        expect(result?.box.r).toBeGreaterThan(0);
    });

    it("computeTargetBox handles percentage border-radius correctly", () => {
        const el = document.createElement("div");
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            width: 100,
            height: 100,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 100,
            right: 100,
            toJSON: () => {},
        } as DOMRect);
        vi.spyOn(window, "getComputedStyle").mockReturnValue({
            borderRadius: "50%",
            overflow: "",
            overflowX: "",
            overflowY: "",
        } as unknown as CSSStyleDeclaration);

        const result = computeTargetBox(el, 0);
        expect(result).not.toBeNull();
        expect(result?.box.r).toBe(50);
    });

    it("resolveFocusTarget returns the element itself when no focusTarget is set", () => {
        const el = document.createElement("input");
        expect(resolveFocusTarget(el)).toBe(el);
    });

    it("resolveFocusTarget resolves via overrideTarget parameter", () => {
        const input = document.createElement("input");
        const proxy = document.createElement("span");
        proxy.id = "visual-proxy";
        document.body.append(proxy);

        const result = resolveFocusTarget(input, "#visual-proxy");
        expect(result).toBe(proxy);

        proxy.remove();
    });

    it("resolveFocusTarget resolves via data-focus-target attribute", () => {
        const input = document.createElement("input");
        input.dataset.focusTarget = "#visual-proxy";
        const proxy = document.createElement("span");
        proxy.id = "visual-proxy";
        document.body.append(proxy);

        const result = resolveFocusTarget(input);
        expect(result).toBe(proxy);

        proxy.remove();
    });

    it("resolveFocusTarget falls back to the element when selector does not match", () => {
        const input = document.createElement("input");
        input.dataset.focusTarget = "#nonexistent";

        const result = resolveFocusTarget(input);
        expect(result).toBe(input);
    });

    it("resolveFocusTarget prefers overrideTarget over data attribute", () => {
        const input = document.createElement("input");
        input.dataset.focusTarget = "#data-attr-target";
        const proxy = document.createElement("span");
        proxy.id = "override-target";
        document.body.append(proxy);

        const result = resolveFocusTarget(input, "#override-target");
        expect(result).toBe(proxy);

        proxy.remove();
    });

    it("resolves the z-index from the direct body layer instead of a local stacking context", () => {
        const layer = document.createElement("div");
        const localStack = document.createElement("div");
        const button = document.createElement("button");
        layer.style.position = "relative";
        layer.style.zIndex = "100";
        localStack.style.position = "relative";
        localStack.style.zIndex = "900";
        localStack.append(button);
        layer.append(localStack);
        document.body.append(layer);

        expect(resolveFocusLayerZIndex(button)).toBe(100);

        layer.remove();
    });

    it("uses zero for elements in an app root without an explicit z-index", () => {
        const app = document.createElement("div");
        const button = document.createElement("button");
        app.append(button);
        document.body.append(app);

        expect(resolveFocusLayerZIndex(button)).toBe(0);

        app.remove();
    });

    it("uses the outermost local z-index when the app root has no stacking level", () => {
        const app = document.createElement("div");
        const positionedContent = document.createElement("div");
        const button = document.createElement("button");
        positionedContent.style.position = "relative";
        positionedContent.style.zIndex = "40";
        positionedContent.append(button);
        app.append(positionedContent);
        document.body.append(app);

        expect(resolveFocusLayerZIndex(button)).toBe(40);

        app.remove();
    });

    it("detects when a focused element is reparented into a body layer", () => {
        const app = document.createElement("div");
        const layer = document.createElement("div");
        const button = document.createElement("button");
        app.append(button);
        document.body.append(app, layer);

        expect(getFocusLayerRoot(button)).toBe(app);
        layer.append(button);
        expect(getFocusLayerRoot(button)).toBe(layer);

        app.remove();
        layer.remove();
    });
});

describe("focus.attach", () => {
    it("stores and removes overrides from WeakMap", () => {
        const el = document.createElement("div");
        const overrides = { color: "red" };

        const attachFn = focusAttach(overrides);
        const destroy = attachFn(el);

        expect(focusOverridesMap.get(el)).toBe(overrides);

        if (typeof destroy === "function") {
            destroy();
        }
        expect(focusOverridesMap.has(el)).toBe(false);
    });

    it("stores lineWidth override correctly", () => {
        const el = document.createElement("div");
        const overrides = { lineWidth: 3 };
        const attachFn = focusAttach(overrides);
        attachFn(el);
        expect(focusOverridesMap.get(el)?.lineWidth).toBe(3);
    });

    it("sets data-focus-target attribute when focusTarget is provided", () => {
        const el = document.createElement("input");
        const attachFn = focusAttach({ focusTarget: "#visual-proxy" });
        const destroy = attachFn(el);

        expect(el.dataset.focusTarget).toBe("#visual-proxy");

        if (typeof destroy === "function") {
            destroy();
        }
        expect(el.dataset.focusTarget).toBeUndefined();
    });

    it("does not set data-focus-target when focusTarget is not provided", () => {
        const el = document.createElement("input");
        const attachFn = focusAttach({ color: "red" });
        attachFn(el);

        expect(el.dataset.focusTarget).toBeUndefined();
    });

    it("notifies listeners when overrides are registered", () => {
        const el = document.createElement("input");
        const listener = vi.fn();
        const unsubscribe = onFocusOverridesChange(listener);

        focusAttach({ color: "red" })(el);

        expect(listener).toHaveBeenCalledExactlyOnceWith(el);
        unsubscribe();
    });

    it("stops notifying an unsubscribed listener", () => {
        const el = document.createElement("input");
        const listener = vi.fn();
        const unsubscribe = onFocusOverridesChange(listener);
        unsubscribe();

        focusAttach({ color: "red" })(el);

        expect(listener).not.toHaveBeenCalled();
    });
});

describe("focus.visibility", () => {
    it.each(["text", "search", "url", "tel", "email", "password", "number"])(
        "recognizes input type %s as a text entry control",
        (type) => {
            const input = document.createElement("input");
            input.type = type;

            expect(isTextEntryControl(input)).toBe(true);
        }
    );

    it.each(["checkbox", "radio", "range", "color", "file", "button"])(
        "does not treat input type %s as a text entry control",
        (type) => {
            const input = document.createElement("input");
            input.type = type;

            expect(isTextEntryControl(input)).toBe(false);
        }
    );

    it("recognizes textareas and editable content", () => {
        const textarea = document.createElement("textarea");
        const editable = document.createElement("div");
        Object.defineProperty(editable, "isContentEditable", { value: true });

        expect(isTextEntryControl(textarea)).toBe(true);
        expect(isTextEntryControl(editable)).toBe(true);
    });
});

describe("FocusAnimationController (Houdini Pulse & Same-Element Handling)", () => {
    let controller: FocusAnimationController;
    const targetBox: FocusBox = { x: 100, y: 100, w: 50, h: 50, r: 5 };
    const targetClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

    beforeEach(() => {
        controller = new FocusAnimationController();
    });

    it("reduced motion: calls onDone immediately with opacity=1", () => {
        vi.spyOn(motionPreference, "resolved", "get").mockReturnValue("reduce");

        const frames: FocusPaintState[] = [];
        const onDone = vi.fn();

        const initialBox: FocusBox = { x: 0, y: 0, w: 10, h: 10, r: 0 };
        const initialClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        controller.start(
            targetBox,
            targetClip,
            initialBox,
            initialClip,
            (_b, _c, paint) => {
                frames.push(paint);
            },
            onDone
        );

        expect(frames).toHaveLength(1);
        expect(frames[0].opacity).toBe(1);
        expect(onDone).toHaveBeenCalled();
    });

    it("same element resize (isSameElement = true): always runs lerp without Houdini pulse", async () => {
        vi.spyOn(motionPreference, "resolved", "get").mockReturnValue("no-preference");
        const paintStates: FocusPaintState[] = [];
        const onDone = vi.fn();

        // Far distance box, but isSameElement = true!
        const initialBox: FocusBox = { x: 0, y: 0, w: 1000, h: 1000, r: 0 };
        const initialClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        controller.start(
            targetBox,
            targetClip,
            initialBox,
            initialClip,
            (_b, _c, paint) => {
                paintStates.push(paint);
            },
            onDone,
            true // isSameElement
        );

        await new Promise((r) => setTimeout(r, 600));

        expect(onDone).toHaveBeenCalled();
        expect(paintStates.every((p) => p.opacity === 1)).toBe(true);
    });

    it("calling stop() before onDone cancels animation", () => {
        vi.spyOn(motionPreference, "resolved", "get").mockReturnValue("no-preference");
        const onDone = vi.fn();

        const initialBox: FocusBox = { x: 0, y: 0, w: 10, h: 10, r: 0 };
        const initialClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        controller.start(targetBox, targetClip, initialBox, initialClip, () => {}, onDone);
        controller.stop();

        expect(onDone).not.toHaveBeenCalled();
    });

    it("short distance (< 240px): snappy morph onFrame receives opacity=1", async () => {
        vi.spyOn(motionPreference, "resolved", "get").mockReturnValue("no-preference");
        const paintStates: FocusPaintState[] = [];
        const onDone = vi.fn();

        const initialBox: FocusBox = { x: 90, y: 90, w: 40, h: 40, r: 4 };
        const initialClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        controller.start(
            targetBox,
            targetClip,
            initialBox,
            initialClip,
            (_b, _c, paint) => {
                paintStates.push(paint);
            },
            onDone
        );

        await new Promise((r) => setTimeout(r, 300));

        expect(onDone).toHaveBeenCalled();
        expect(paintStates.every((p) => p.opacity === 1)).toBe(true);
    });

    it("medium distance (120-240px): now uses morph instead of teleport", async () => {
        vi.spyOn(motionPreference, "resolved", "get").mockReturnValue("no-preference");
        const paintStates: FocusPaintState[] = [];
        const onDone = vi.fn();

        // ~200px distance — was teleport with 120px threshold, now morph with 240px
        const initialBox: FocusBox = { x: 0, y: 0, w: 50, h: 30, r: 4 };
        const targetBox200: FocusBox = { x: 180, y: 100, w: 50, h: 30, r: 4 };
        const initialClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        controller.start(
            targetBox200,
            initialClip,
            initialBox,
            initialClip,
            (_b, _c, paint) => {
                paintStates.push(paint);
            },
            onDone
        );

        await new Promise((r) => setTimeout(r, 600));

        expect(onDone).toHaveBeenCalled();
        expect(paintStates.every((p) => p.opacity === 1)).toBe(true);
    });

    it("rapid tab (< 150ms between focus changes): always morphs, even at long distance", async () => {
        vi.spyOn(motionPreference, "resolved", "get").mockReturnValue("no-preference");

        const ctrl = new FocusAnimationController();
        const clip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };
        const boxA: FocusBox = { x: 0, y: 0, w: 50, h: 30, r: 4 };
        const boxB: FocusBox = { x: 500, y: 400, w: 50, h: 30, r: 4 };
        const boxC: FocusBox = { x: 0, y: 0, w: 50, h: 30, r: 4 };

        // First start — teleport (long distance, no rapid tab)
        const firstPaints: FocusPaintState[] = [];
        await new Promise<void>((resolve) => {
            ctrl.start(
                boxB,
                clip,
                boxA,
                clip,
                (_b, _c, paint) => {
                    firstPaints.push({ ...paint });
                    if (firstPaints.length >= 3) {
                        ctrl.stop();
                        resolve();
                    }
                },
                resolve
            );
        });

        // Immediately start again (simulates rapid tab) — should morph, not teleport
        const secondPaints: FocusPaintState[] = [];
        await new Promise<void>((resolve) => {
            ctrl.start(
                boxC,
                clip,
                boxB,
                clip,
                (_b, _c, paint) => {
                    secondPaints.push({ ...paint });
                    if (secondPaints.length >= 6) {
                        ctrl.stop();
                        resolve();
                    }
                },
                resolve
            );
        });

        // Second call was within 150ms of first → morph path (opacity recovers toward 1)
        // Teleport would dissolve opacity toward 0 first. Morph lerps it back up.
        expect(secondPaints.length).toBeGreaterThan(0);
        const lastPaint = secondPaints.at(-1);
        const firstPaint = secondPaints[0];
        expect(lastPaint).toBeDefined();
        expect(firstPaint).toBeDefined();
        if (lastPaint && firstPaint) {
            // Opacity should be recovering (increasing or staying at 1), not dissolving to 0
            expect(lastPaint.opacity).toBeGreaterThanOrEqual(firstPaint.opacity);
        }
    });

    it("long distance (>= 240px): Houdini pulse runs Phase 1 dissolve-out then Phase 2 pulse-in", async () => {
        const paintStates: FocusPaintState[] = [];

        const farBox: FocusBox = { x: 0, y: 0, w: 50, h: 30, r: 4 };
        const nearBox: FocusBox = { x: 500, y: 400, w: 50, h: 30, r: 4 };
        const clip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        await new Promise<void>((resolve) => {
            const ctrl = new FocusAnimationController();
            ctrl.start(
                nearBox,
                clip,
                farBox,
                clip,
                (_b, _c, paint) => {
                    paintStates.push({ ...paint });
                    if (paintStates.length >= 6) {
                        ctrl.stop();
                        resolve();
                    }
                },
                resolve
            );
        });

        expect(paintStates.length).toBeGreaterThan(0);
        expect(paintStates.some((p) => (p.opacity ?? 1) !== 1)).toBe(true);
    });

    it("forced teleport switches layers between exit and reveal even over a short distance", async () => {
        vi.spyOn(motionPreference, "resolved", "get").mockReturnValue("no-preference");
        const onTeleport = vi.fn();
        const clip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };
        const boxA: FocusBox = { x: 0, y: 0, w: 50, h: 30, r: 4 };
        const boxB: FocusBox = { x: 20, y: 20, w: 50, h: 30, r: 4 };

        await new Promise<void>((resolve) => {
            const ctrl = new FocusAnimationController();
            ctrl.start(boxB, clip, boxA, clip, () => {}, resolve, false, 2, true, onTeleport);
        });

        expect(onTeleport).toHaveBeenCalledOnce();
    });

    it("startPulseIn animates initial focus appearance smoothly with offset and opacity", async () => {
        const paintStates: FocusPaintState[] = [];

        await new Promise<void>((resolve) => {
            const ctrl = new FocusAnimationController();
            ctrl.startPulseIn(
                targetBox,
                targetClip,
                (_b, _c, paint) => {
                    paintStates.push({ ...paint });
                    if (paintStates.length >= 3) {
                        ctrl.stop();
                        resolve();
                    }
                },
                resolve
            );
        });

        expect(paintStates.length).toBeGreaterThan(0);
        expect(paintStates.some((p) => p.opacity < 1)).toBe(true);
    });
});

describe("focus.geometry corner-shape parsing", () => {
    it("parseCornerShape returns round by default when corner-shape is empty or round", () => {
        const el = document.createElement("div");
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            width: 100,
            height: 40,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 40,
            right: 100,
            toJSON: () => {},
        } as DOMRect);
        vi.spyOn(window, "getComputedStyle").mockReturnValue({
            borderRadius: "8px",
            getPropertyValue: (prop: string) => (prop === "corner-shape" ? "round" : ""),
        } as unknown as CSSStyleDeclaration);

        const result = computeTargetBox(el, 4);
        expect(result?.box.cornerShape).toEqual({ type: "round" });
    });

    it("parseCornerShape parses 'squircle' keyword correctly", () => {
        const el = document.createElement("div");
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            width: 100,
            height: 40,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 40,
            right: 100,
            toJSON: () => {},
        } as DOMRect);
        vi.spyOn(window, "getComputedStyle").mockReturnValue({
            borderRadius: "8px",
            getPropertyValue: (prop: string) => (prop === "corner-shape" ? "squircle" : ""),
        } as unknown as CSSStyleDeclaration);

        const result = computeTargetBox(el, 4);
        expect(result?.box.cornerShape).toEqual({ type: "squircle", exponent: 2 });
    });

    it("parseCornerShape parses 'superellipse(1.6)' function correctly", () => {
        const el = document.createElement("div");
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            width: 100,
            height: 40,
            x: 0,
            y: 0,
            top: 0,
            left: 0,
            bottom: 40,
            right: 100,
            toJSON: () => {},
        } as DOMRect);
        vi.spyOn(window, "getComputedStyle").mockReturnValue({
            borderRadius: "8px",
            getPropertyValue: (prop: string) =>
                prop === "corner-shape" ? "superellipse(1.6)" : "",
        } as unknown as CSSStyleDeclaration);

        const result = computeTargetBox(el, 4);
        expect(result?.box.cornerShape).toEqual({ type: "squircle", exponent: 1.6 });
    });
});

describe("focus.renderer squircle path drawing", () => {
    it("drawSquirclePath samples exact superellipse curve via lineTo (no bezierCurveTo)", () => {
        const ctx = makeMockCtx();
        drawSquirclePath(ctx, 10, 10, 100, 100, 10, 2);

        expect(ctx.moveTo).toHaveBeenCalled();
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.closePath).toHaveBeenCalled();
        // No Bézier approximation — pure superellipse sampling
        expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
    });

    it("drawSquirclePath produces correct corner start/end points", () => {
        const ctx = makeMockCtx();
        const x = 10,
            y = 20,
            w = 100,
            h = 60,
            r = 8;

        drawSquirclePath(ctx, x, y, w, h, r, 2);

        const lineCalls = (ctx.lineTo as ReturnType<typeof vi.fn>).mock.calls;
        const moveCall = (ctx.moveTo as ReturnType<typeof vi.fn>).mock.calls[0];

        // moveTo should start at top edge, after top-left corner
        expect(moveCall[0]).toBe(x + r);
        expect(moveCall[1]).toBe(y);

        // First lineTo goes to top edge, before top-right corner
        expect(lineCalls[0][0]).toBe(x + w - r);
        expect(lineCalls[0][1]).toBe(y);

        // Corner sampling: first point of top-right corner should be on top edge
        // last point should be on right edge
        const cornerStartIdx = 1; // after the straight top-edge lineTo
        const cornerPoints = lineCalls.slice(cornerStartIdx, cornerStartIdx + 17); // 16 steps + 1

        // First corner point should be at (x + w - r, y) — on the top edge
        expect(cornerPoints[0][0]).toBeCloseTo(x + w - r, 5);
        expect(cornerPoints[0][1]).toBeCloseTo(y, 5);

        // Last corner point should be at (x + w, y + r) — on the right edge
        expect(cornerPoints[16][0]).toBeCloseTo(x + w, 5);
        expect(cornerPoints[16][1]).toBeCloseTo(y + r, 5);
    });

    it("drawSquirclePath round exponent=1 produces circular corner points", () => {
        const ctx = makeMockCtx();
        const x = 0,
            y = 0,
            w = 100,
            h = 100,
            r = 10;

        drawSquirclePath(ctx, x, y, w, h, r, 1);

        const lineCalls = (ctx.lineTo as ReturnType<typeof vi.fn>).mock.calls;
        // Top-right corner: center at (x+w-r, y+r) = (90, 10)
        // At 45° (i=8 of 16): point should be at (90 + 10*sin(45°), 10 - 10*cos(45°))
        // = (90 + 7.071, 10 - 7.071) = (97.071, 2.929)
        const cornerStartIdx = 1;
        const midIdx = cornerStartIdx + 8; // midpoint of 16-step corner
        const [mx, my] = [lineCalls[midIdx][0], lineCalls[midIdx][1]];

        const expected = 90 + 10 * Math.sin(Math.PI / 4);
        const expectedY = 10 - 10 * Math.cos(Math.PI / 4);
        expect(mx).toBeCloseTo(expected, 2);
        expect(my).toBeCloseTo(expectedY, 2);
    });

    it("drawSquirclePath exponent=2 (squircle) extends further at 45° than circle", () => {
        const ctxCircle = makeMockCtx();
        const ctxSquircle = makeMockCtx();
        const x = 0,
            y = 0,
            w = 100,
            h = 100,
            r = 10;

        drawSquirclePath(ctxCircle, x, y, w, h, r, 1);
        drawSquirclePath(ctxSquircle, x, y, w, h, r, 2);

        const circleCalls = (ctxCircle.lineTo as ReturnType<typeof vi.fn>).mock.calls;
        const squircleCalls = (ctxSquircle.lineTo as ReturnType<typeof vi.fn>).mock.calls;

        // At 45° (midpoint of top-right corner, i=8 of 16)
        const midIdx = 1 + 8;
        const circleDist = Math.hypot(circleCalls[midIdx][0] - 90, circleCalls[midIdx][1] - 10);
        const squircleDist = Math.hypot(
            squircleCalls[midIdx][0] - 90,
            squircleCalls[midIdx][1] - 10
        );

        // Squircle point should be further from center (more "filled" corner)
        expect(squircleDist).toBeGreaterThan(circleDist);
    });

    it("drawFocusRing invokes drawSquirclePath when cornerShape is squircle", () => {
        const ctx = makeMockCtx();
        const canvas = {} as HTMLCanvasElement;
        const box: FocusBox = {
            x: 10,
            y: 10,
            w: 100,
            h: 100,
            r: 10,
            cornerShape: { type: "squircle", exponent: 2 },
        };
        const clip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        drawFocusRing(ctx, canvas, box, clip);
        expect(ctx.lineTo).toHaveBeenCalled();
        expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
    });
});

describe("FocusHost text entry vs non-text transition", () => {
    let host: ReturnType<typeof mount>;
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
    });

    afterEach(async () => {
        if (host) await unmount(host);
        container.remove();
        vi.restoreAllMocks();
    });

    function setupElement(el: HTMLElement, x = 0, y = 0, w = 100, h = 40): void {
        container.append(el);
        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            width: w,
            height: h,
            x,
            y,
            top: y,
            left: x,
            bottom: y + h,
            right: x + w,
            toJSON: () => {},
        } as DOMRect);
        vi.spyOn(el, "matches").mockImplementation((sel) => sel === ":focus-visible");
    }

    it("forces teleport when moving to or from text input/textarea, but morphs between checkboxes/buttons", async () => {
        const startSpy = vi.spyOn(FocusAnimationController.prototype, "start");

        const btn1 = document.createElement("button");
        const textInput = document.createElement("input");
        textInput.type = "text";
        const textarea = document.createElement("textarea");
        const checkbox1 = document.createElement("input");
        checkbox1.type = "checkbox";
        const checkbox2 = document.createElement("input");
        checkbox2.type = "checkbox";

        setupElement(btn1, 0, 0);
        setupElement(textInput, 10, 10);
        setupElement(textarea, 20, 20);
        setupElement(checkbox1, 30, 30);
        setupElement(checkbox2, 40, 40);

        host = mount(FocusHostFixture, { target: container });

        // 1. Initial focus on button -> startPulseIn (not start)
        btn1.focus();
        window.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        expect(startSpy).not.toHaveBeenCalled();

        // 2. Focus moves from button to text input -> forceTeleport must be true!
        startSpy.mockClear();
        textInput.focus();
        window.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        expect(startSpy).toHaveBeenCalledOnce();
        expect(startSpy.mock.calls[0][8]).toBe(true);

        // 3. Focus moves from text input to textarea -> forceTeleport must be true!
        startSpy.mockClear();
        textarea.focus();
        window.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        expect(startSpy).toHaveBeenCalledOnce();
        expect(startSpy.mock.calls[0][8]).toBe(true);

        // 4. Focus moves from textarea back to button -> forceTeleport must be true!
        startSpy.mockClear();
        btn1.focus();
        window.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        expect(startSpy).toHaveBeenCalledOnce();
        expect(startSpy.mock.calls[0][8]).toBe(true);

        // 5. Focus moves from button to checkbox1 -> forceTeleport must be false (morph)!
        startSpy.mockClear();
        checkbox1.focus();
        window.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        expect(startSpy).toHaveBeenCalledOnce();
        expect(startSpy.mock.calls[0][8]).toBe(false);

        // 6. Focus moves from checkbox1 to checkbox2 -> forceTeleport must be false (morph)!
        startSpy.mockClear();
        checkbox2.focus();
        window.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        expect(startSpy).toHaveBeenCalledOnce();
        expect(startSpy.mock.calls[0][8]).toBe(false);

        // 7. Focus moves from checkbox2 to text input -> forceTeleport must be true!
        startSpy.mockClear();
        textInput.focus();
        window.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        expect(startSpy).toHaveBeenCalledOnce();
        expect(startSpy.mock.calls[0][8]).toBe(true);
    });
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeMockCtx(): CanvasRenderingContext2D {
    return {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        roundRect: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        bezierCurveTo: vi.fn(),
        closePath: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        set strokeStyle(_: string) {},
        set fillStyle(_: string) {},
        set lineWidth(_: number) {},
        set globalAlpha(_: number) {},
    } as unknown as CanvasRenderingContext2D;
}
