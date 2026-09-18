import { describe, expect, it } from "vitest";

import { boxDistance, focusBoxChanged, focusClipChanged, lerp } from "./focus.geometry.js";
import type { ClipBox, CornerRadii, FocusBox } from "./focus.types.js";

const uniformRadii = (radius: number): CornerRadii => ({
    topLeft: radius,
    topRight: radius,
    bottomRight: radius,
    bottomLeft: radius,
});

describe("focus.geometry pure functions", () => {
    it("lerp(0, 100, 0.25) === 25", () => {
        expect(lerp(0, 100, 0.25)).toBe(25);
    });

    it("lerp(100, 0, 0.5) === 50", () => {
        expect(lerp(100, 0, 0.5)).toBe(50);
    });

    it("boxDistance between two identical boxes = 0", () => {
        const box1: FocusBox = { x: 10, y: 10, w: 20, h: 20, radii: uniformRadii(0) };
        const box2: FocusBox = { x: 10, y: 10, w: 20, h: 20, radii: uniformRadii(0) };
        expect(boxDistance(box1, box2)).toBe(0);
    });

    it("boxDistance between distant boxes > 150", () => {
        const box1: FocusBox = { x: 0, y: 0, w: 10, h: 10, radii: uniformRadii(0) }; // center (5,5)
        const box2: FocusBox = { x: 200, y: 0, w: 10, h: 10, radii: uniformRadii(0) }; // center (205,5)
        expect(boxDistance(box1, box2)).toBeGreaterThan(150);
    });

    it("detects transform-sized box changes even when position is stable", () => {
        const before: FocusBox = { x: 10, y: 10, w: 100, h: 40, radii: uniformRadii(8) };
        const scaled: FocusBox = { x: 10, y: 10, w: 97, h: 38.8, radii: uniformRadii(8) };

        expect(focusBoxChanged(before, scaled)).toBe(true);
        expect(focusBoxChanged(before, { ...before, x: 10.05 })).toBe(false);
    });

    it("detects changes to any individual corner radius", () => {
        const before: FocusBox = { x: 0, y: 0, w: 100, h: 40, radii: uniformRadii(0) };

        expect(
            focusBoxChanged(before, {
                ...before,
                radii: { ...before.radii, bottomLeft: 8 },
            })
        ).toBe(true);
    });

    it("detects clipping changes caused by transformed ancestors", () => {
        const before: ClipBox = { x: 0, y: 0, w: 400, h: 300 };

        expect(focusClipChanged(before, { ...before, w: 399 })).toBe(true);
        expect(focusClipChanged(before, { ...before, y: 0.05 })).toBe(false);
    });
});
