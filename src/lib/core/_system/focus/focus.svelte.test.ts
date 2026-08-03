// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";

import { motionPreference } from "$core/_system/motion/motion.svelte.js";

import { FocusAnimationController } from "./focus.animation.js";
import { focusAttach, focusOverridesMap } from "./focus.attach.js";
import { computeTargetBox } from "./focus.geometry.js";
import { clearCanvas, drawFocusRing, resolveAccentColor } from "./focus.renderer.js";
import type { ClipBox, FocusBox, FocusPaintState } from "./focus.types.js";

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

    it("drawFocusRing applies offsetDelta transform correctly when offsetDelta !== 0", () => {
        const ctx = makeMockCtx();
        const canvas = {} as HTMLCanvasElement;
        const box: FocusBox = { x: 10, y: 10, w: 100, h: 100, r: 4 };
        const clip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };
        const paint: FocusPaintState = { opacity: 0.8, offsetDelta: -3.85 };

        drawFocusRing(ctx, canvas, box, clip, undefined, undefined, paint);
        const args = (ctx.roundRect as ReturnType<typeof vi.fn>).mock.calls[0];
        expect(args[0]).toBeCloseTo(13.85, 1);
        expect(args[1]).toBeCloseTo(13.85, 1);
        expect(args[2]).toBeCloseTo(92.3, 1);
        expect(args[3]).toBeCloseTo(92.3, 1);
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

    it("computeTargetBox reads borderRadius via Number.parseFloat (fixes '8px' returning 0)", () => {
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
});

describe("FocusAnimationController (Houdini Pulse & Same-Element Handling)", () => {
    let controller: FocusAnimationController;
    const targetBox: FocusBox = { x: 100, y: 100, w: 50, h: 50, r: 5 };
    const targetClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

    beforeEach(() => {
        controller = new FocusAnimationController();
    });

    it("reduced motion: calls onDone immediately with opacity=1 offsetDelta=0", () => {
        vi.spyOn(motionPreference, "resolved", "get").mockReturnValue("reduce");

        const frames: FocusPaintState[] = [];
        const onDone = vi.fn();

        const initialBox: FocusBox = { x: 0, y: 0, w: 10, h: 10, r: 0 };
        const initialClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        controller.start(targetBox, targetClip, initialBox, initialClip, (_b, _c, paint) => {
            frames.push(paint);
        }, onDone);

        expect(frames).toHaveLength(1);
        expect(frames[0].opacity).toBe(1);
        expect(frames[0].offsetDelta).toBe(0);
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

        await new Promise((r) => setTimeout(r, 500));

        expect(onDone).toHaveBeenCalled();
        expect(paintStates.every((p) => p.opacity === 1 && p.offsetDelta === 0)).toBe(true);
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

    it("short distance (< 120px): snappy morph onFrame receives opacity=1 offsetDelta=0", async () => {
        vi.spyOn(motionPreference, "resolved", "get").mockReturnValue("no-preference");
        const paintStates: FocusPaintState[] = [];
        const onDone = vi.fn();

        const initialBox: FocusBox = { x: 90, y: 90, w: 40, h: 40, r: 4 };
        const initialClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };

        controller.start(targetBox, targetClip, initialBox, initialClip, (_b, _c, paint) => {
            paintStates.push(paint);
        }, onDone);

        await new Promise((r) => setTimeout(r, 300));

        expect(onDone).toHaveBeenCalled();
        expect(paintStates.every((p) => p.opacity === 1 && p.offsetDelta === 0)).toBe(true);
    });

    it("long distance (>= 120px): Houdini pulse runs Phase 1 dissolve-out then Phase 2 pulse-in", async () => {
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
        expect(paintStates.some((p) => (p.offsetDelta ?? 0) !== 0 || (p.opacity ?? 1) !== 1)).toBe(true);
    });

    it("startPulseIn animates initial focus appearance smoothly with offsetDelta and opacity", async () => {
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
        expect(paintStates.some((p) => p.opacity < 1 || (p.offsetDelta ?? 0) !== 0)).toBe(true);
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
        stroke: vi.fn(),
        fill: vi.fn(),
        set strokeStyle(_: string) {},
        set fillStyle(_: string) {},
        set lineWidth(_: number) {},
        set globalAlpha(_: number) {},
    } as unknown as CanvasRenderingContext2D;
}
