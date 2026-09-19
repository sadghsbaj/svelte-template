import { describe, expect, test, vi } from "vitest";

import type { FloatingContext } from "$components/_system/floating/floating.types";

import { getTooltipTransformOrigin, runTooltipAnimation } from "./tooltip.animation";

const floating = (side: FloatingContext["side"]): FloatingContext => ({
    x: 80,
    y: 120,
    placement: side,
    side,
    alignment: "center",
    positioned: true,
    availableWidth: 500,
    availableHeight: 500,
    anchorRect: {
        x: 100,
        y: 100,
        top: 100,
        right: 140,
        bottom: 120,
        left: 100,
        width: 40,
        height: 20,
    },
    floatingRect: {
        x: 80,
        y: 120,
        top: 120,
        right: 180,
        bottom: 160,
        left: 80,
        width: 100,
        height: 40,
    },
    boundaryRect: {
        x: 0,
        y: 0,
        top: 0,
        right: 500,
        bottom: 500,
        left: 0,
        width: 500,
        height: 500,
    },
    update: vi.fn(),
});

describe("tooltip animation", () => {
    test("uses the resolved anchor geometry for its origin", () => {
        expect(getTooltipTransformOrigin(floating("bottom"))).toBe("40px top");
        expect(getTooltipTransformOrigin(floating("left"))).toBe("right 0px");
    });

    test("uses a short directional blur and overshoot enter", () => {
        const element = document.createElement("div");
        const nativeAnimation = {
            finished: Promise.resolve(),
            cancel: vi.fn(),
        } as unknown as Animation;
        const animate = vi.spyOn(element, "animate").mockReturnValue(nativeAnimation);

        expect(
            runTooltipAnimation(element, "enter", "pointer", floating("bottom"), "default")
        ).toBe(nativeAnimation);
        expect(animate).toHaveBeenCalledWith(
            [
                {
                    opacity: 0,
                    transform: "translate3d(0, -6px, 0) scale(.94, .72)",
                    filter: "blur(3px)",
                },
                {
                    opacity: 1,
                    transform: "translate3d(0, .75px, 0) scale(1.01, 1.025)",
                    filter: "blur(0)",
                    offset: 0.72,
                },
                {
                    opacity: 1,
                    transform: "translate3d(0, 0, 0) scale(1)",
                    filter: "blur(0)",
                },
            ],
            expect.objectContaining({
                duration: 205,
                easing: "cubic-bezier(.16, 1, .3, 1)",
                fill: "both",
            })
        );
        expect(element.style.willChange).toBe("transform, opacity, filter");
    });

    test("supports none and custom animation modes", () => {
        const element = document.createElement("div");
        expect(runTooltipAnimation(element, "exit", "escape", floating("top"), "none")).toBeNull();

        const runner = vi.fn(() => null);
        runTooltipAnimation(element, "exit", "escape", floating("right"), runner);
        expect(runner).toHaveBeenCalledWith(
            element,
            expect.objectContaining({ phase: "exit", placement: "right", side: "right" })
        );
    });
});
