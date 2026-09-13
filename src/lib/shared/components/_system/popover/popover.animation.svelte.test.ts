import { describe, expect, test, vi } from "vitest";

import type { FloatingContext } from "$components/_system/floating/floating.types";

import { getPopoverTransformOrigin, runPopoverAnimation } from "./popover.animation";

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
        bottom: 180,
        left: 80,
        width: 100,
        height: 60,
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

describe("popover animation", () => {
    test("uses shifted anchor geometry for the resolved-side origin", () => {
        expect(getPopoverTransformOrigin(floating("bottom"))).toBe("40px top");
        expect(getPopoverTransformOrigin(floating("left"))).toBe("right 0px");
    });

    test("runs custom WAAPI runners with the resolved placement", () => {
        const element = document.createElement("div");
        const runner = vi.fn(() => null);
        expect(
            runPopoverAnimation(element, "enter", "trigger", floating("right"), runner)
        ).toBeNull();
        expect(runner).toHaveBeenCalledWith(
            element,
            expect.objectContaining({ phase: "enter", placement: "right", side: "right" })
        );
        expect(element.style.transformOrigin).toBe("left 0px");
    });

    test("none does not start or mutate an animation", () => {
        const element = document.createElement("div");
        expect(runPopoverAnimation(element, "exit", "escape", floating("top"), "none")).toBeNull();
        expect(element.style.willChange).toBe("");
    });

    test("default enter keyframes move from the resolved anchor side", () => {
        const element = document.createElement("div");
        const finished = Promise.resolve();
        const nativeAnimation = { finished, cancel: vi.fn() } as unknown as Animation;
        const animate = vi.spyOn(element, "animate").mockReturnValue(nativeAnimation);
        expect(
            runPopoverAnimation(element, "enter", "trigger", floating("bottom"), "default")
        ).toBe(nativeAnimation);
        expect(animate).toHaveBeenCalledWith(
            [
                {
                    opacity: 0,
                    transform: "translateY(-4px) scale(.97)",
                    filter: "blur(2px)",
                },
                {
                    opacity: 1,
                    transform: "translate(0) scale(1)",
                    filter: "blur(0)",
                },
            ],
            expect.objectContaining({ duration: 180, fill: "both" })
        );
    });
});
