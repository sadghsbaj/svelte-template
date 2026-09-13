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

    test("default enter blooms from the resolved anchor side and settles from a small overshoot", () => {
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
                    offset: 0,
                    opacity: 0,
                    transform: "translate3d(0, -7px, 0) scale(.975, .94)",
                    filter: "blur(4px)",
                    clipPath: "inset(0 0 18% 0 round 22px)",
                    easing: "cubic-bezier(.16, 1, .3, 1)",
                },
                {
                    offset: 0.7,
                    opacity: 1,
                    transform: "translate3d(0, .75px, 0) scale(1.004, 1.01)",
                    filter: "blur(0)",
                    clipPath: "inset(0 round 22px)",
                    easing: "cubic-bezier(.33, 1, .68, 1)",
                },
                {
                    offset: 1,
                    opacity: 1,
                    transform: "translate3d(0, 0, 0) scale(1)",
                    filter: "blur(0)",
                    clipPath: "inset(0 round 22px)",
                },
            ],
            expect.objectContaining({ duration: 260, easing: "linear", fill: "both" })
        );
        expect(element.style.willChange).toBe("transform, opacity, filter, clip-path");
    });

    test("keeps horizontal submenu motion tighter and exits toward its anchor", () => {
        const element = document.createElement("div");
        const nativeAnimation = {
            finished: Promise.resolve(),
            cancel: vi.fn(),
        } as unknown as Animation;
        const animate = vi.spyOn(element, "animate").mockReturnValue(nativeAnimation);

        runPopoverAnimation(element, "enter", "programmatic", floating("left"), "default");
        expect(animate.mock.calls[0]?.[1]).toEqual(
            expect.objectContaining({ duration: 220, easing: "linear" })
        );

        runPopoverAnimation(element, "exit", "escape", floating("right"), "default");
        expect(animate).toHaveBeenLastCalledWith(
            [
                {
                    opacity: 1,
                    transform: "translate3d(0, 0, 0) scale(1)",
                    filter: "blur(0)",
                    clipPath: "inset(0 round 22px)",
                },
                {
                    opacity: 0,
                    transform: "translate3d(-3px, 0, 0) scale(.965, .985)",
                    filter: "blur(2px)",
                    clipPath: "inset(0 18% 0 0 round 22px)",
                },
            ],
            expect.objectContaining({
                duration: 120,
                easing: "cubic-bezier(.4, 0, 1, 1)",
            })
        );
    });
});
