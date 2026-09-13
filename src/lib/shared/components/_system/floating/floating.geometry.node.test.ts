import { describe, expect, test } from "vitest";

import {
    computeFloatingPosition,
    normalizeFloatingRect,
    pointToFloatingRect,
} from "./floating.geometry";
import type { FloatingPlacement, FloatingRect } from "./floating.types";

const rect = (x: number, y: number, width: number, height: number): FloatingRect =>
    normalizeFloatingRect({ x, y, width, height });

const base = {
    anchorRect: rect(100, 100, 40, 20),
    floatingRect: rect(0, 0, 20, 10),
    boundaryRect: rect(0, 0, 400, 300),
    padding: 0,
    flip: false,
    shift: false,
} as const;

describe("floating geometry", () => {
    test.each([
        ["top", 110, 90],
        ["right", 140, 105],
        ["bottom", 110, 120],
        ["left", 80, 105],
    ] satisfies [FloatingPlacement, number, number][])(
        "places %s on its physical side",
        (placement, x, y) => {
            const result = computeFloatingPosition({ ...base, placement });
            expect({ x: result.x, y: result.y }).toEqual({ x, y });
        }
    );

    test.each([
        ["bottom-start", "ltr", 100],
        ["bottom-center", "ltr", 110],
        ["bottom-end", "ltr", 120],
        ["bottom-start", "rtl", 120],
        ["bottom-end", "rtl", 100],
    ] satisfies [FloatingPlacement, "ltr" | "rtl", number][])(
        "resolves %s in %s",
        (placement, direction, x) => {
            expect(computeFloatingPosition({ ...base, placement, direction }).x).toBe(x);
        }
    );

    test("applies main- and cross-axis offsets", () => {
        const result = computeFloatingPosition({
            ...base,
            placement: "right",
            offset: { mainAxis: 7, crossAxis: -3 },
        });
        expect({ x: result.x, y: result.y }).toEqual({ x: 147, y: 102 });
    });

    test("flips to the opposite side on main-axis overflow", () => {
        const result = computeFloatingPosition({
            ...base,
            anchorRect: rect(100, 2, 40, 10),
            floatingRect: rect(0, 0, 30, 20),
            placement: "top-start",
            flip: true,
        });
        expect(result.placement).toBe("bottom-start");
        expect(result.y).toBe(12);
    });

    test("uses deterministic best-fit and keeps the initial side on a tie", () => {
        const anchorRect = rect(45, 45, 10, 10);
        const floatingRect = rect(0, 0, 20, 60);
        const boundaryRect = rect(0, 0, 100, 100);
        expect(
            computeFloatingPosition({
                anchorRect,
                floatingRect,
                boundaryRect,
                placement: "top",
                padding: 0,
            }).side
        ).toBe("top");
        expect(
            computeFloatingPosition({
                anchorRect: rect(45, 20, 10, 10),
                floatingRect,
                boundaryRect,
                placement: "top",
                padding: 0,
            }).side
        ).toBe("bottom");
    });

    test.each([
        [rect(-20, 50, 10, 10), "bottom", 8, 60],
        [rect(190, 50, 10, 10), "bottom", 172, 60],
        [rect(50, -20, 10, 10), "right", 60, 8],
        [rect(50, 100, 10, 10), "right", 60, 72],
    ] as const)("shifts at every boundary edge", (anchorRect, placement, x, y) => {
        const result = computeFloatingPosition({
            anchorRect,
            floatingRect: rect(0, 0, 20, 20),
            boundaryRect: rect(0, 0, 200, 100),
            placement,
            padding: 8,
            flip: false,
        });
        expect({ x: result.x, y: result.y }).toEqual({ x, y });
    });

    test("supports per-side padding and reports available space", () => {
        const result = computeFloatingPosition({
            ...base,
            placement: "bottom",
            padding: { top: 1, right: 20, bottom: 30, left: 10 },
            offset: 5,
        });
        expect(result.availableWidth).toBe(370);
        expect(result.availableHeight).toBe(145);
    });

    test("pins oversized floating elements to the padded start edge", () => {
        const result = computeFloatingPosition({
            ...base,
            floatingRect: rect(0, 0, 500, 400),
            padding: 8,
            shift: true,
        });
        expect({ x: result.x, y: result.y }).toEqual({ x: 8, y: 8 });
        expect(Number.isFinite(result.x) && Number.isFinite(result.y)).toBe(true);
    });

    test("normalizes negative dimensions and point anchors", () => {
        expect(normalizeFloatingRect({ x: 10, y: 20, width: -5, height: -8 })).toEqual(
            rect(5, 12, 5, 8)
        );
        expect(pointToFloatingRect({ x: 12, y: 14 })).toEqual(rect(12, 14, 0, 0));
        expect(pointToFloatingRect({ x: 12, y: 14, width: 4, height: 6 })).toEqual(
            rect(12, 14, 4, 6)
        );
    });

    test("rounds only final coordinates to device pixels", () => {
        const result = computeFloatingPosition({
            ...base,
            anchorRect: rect(10.2, 20.3, 11.1, 7.7),
            placement: "bottom",
            devicePixelRatio: 2,
        });
        expect(result.x).toBe(5.5);
        expect(result.y).toBe(28);
        expect(result.anchorRect.x).toBe(10.2);
    });

    test.each([
        () => normalizeFloatingRect({ x: NaN, y: 0, width: 1, height: 1 }),
        () => computeFloatingPosition({ ...base, placement: "diagonal" as FloatingPlacement }),
        () => computeFloatingPosition({ ...base, offset: Infinity }),
        () => computeFloatingPosition({ ...base, devicePixelRatio: 0 }),
    ])("rejects invalid values", (operation) => {
        expect(operation).toThrow();
    });
});
