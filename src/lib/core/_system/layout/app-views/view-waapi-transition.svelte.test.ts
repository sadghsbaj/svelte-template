import { describe, expect, test, vi } from "vitest";

import { motionPreference } from "$core/_system/motion";
import { ease } from "$constants/easings";

import {
    viewWaapiIn,
    viewWaapiOut,
    viewWaapiTransition,
} from "./view-waapi-transition";

describe("WAAPI View Transitions", () => {
    test("should execute viewWaapiIn and invoke node.animate with correct keyframes", () => {
        const animateMock = vi.fn();
        const mockNode = { animate: animateMock } as unknown as Element;

        const result = viewWaapiIn(mockNode);

        expect(result.duration).toBe(360);
        expect(animateMock).toHaveBeenCalledWith(
            [
                {
                    opacity: 0,
                    transform: "translate3d(0, 18px, 0) scale(0.985)",
                    filter: "blur(6px)",
                },
                {
                    opacity: 1,
                    transform: "translate3d(0, 0px, 0) scale(1)",
                    filter: "blur(0px)",
                },
            ],
            {
                duration: 360,
                easing: ease.quintOut,
                fill: "forwards",
            }
        );
    });

    test("should execute viewWaapiOut and invoke node.animate with correct keyframes", () => {
        const animateMock = vi.fn();
        const mockNode = { animate: animateMock } as unknown as Element;

        const result = viewWaapiOut(mockNode);

        expect(result.duration).toBe(180);
        expect(animateMock).toHaveBeenCalledWith(
            [
                {
                    opacity: 1,
                    transform: "translate3d(0, 0px, 0) scale(1)",
                    filter: "blur(0px)",
                },
                {
                    opacity: 0,
                    transform: "translate3d(0, -8px, 0) scale(0.99)",
                    filter: "none",
                },
            ],
            {
                duration: 180,
                easing: ease.cubicOut,
                fill: "forwards",
            }
        );
    });

    test("should accept custom options for viewWaapiIn", () => {
        const animateMock = vi.fn();
        const mockNode = { animate: animateMock } as unknown as Element;

        const result = viewWaapiIn(mockNode, {
            duration: 500,
            y: 30,
            scale: 0.95,
            blur: 10,
            easing: ease.expoOut,
        });

        expect(result.duration).toBe(500);
        expect(animateMock).toHaveBeenCalledWith(
            [
                {
                    opacity: 0,
                    transform: "translate3d(0, 30px, 0) scale(0.95)",
                    filter: "blur(10px)",
                },
                {
                    opacity: 1,
                    transform: "translate3d(0, 0px, 0) scale(1)",
                    filter: "blur(0px)",
                },
            ],
            {
                duration: 500,
                easing: ease.expoOut,
                fill: "forwards",
            }
        );
    });

    test("should provide viewWaapiTransition as an alias for viewWaapiIn", () => {
        expect(viewWaapiTransition).toBe(viewWaapiIn);
    });

    test("should return duration 0 when reduced motion is enabled", () => {
        motionPreference.set("reduce");

        const animateMock = vi.fn();
        const mockNode = { animate: animateMock } as unknown as Element;

        const result = viewWaapiIn(mockNode);
        expect(result.duration).toBe(0);

        motionPreference.set("no-preference");
    });
});
