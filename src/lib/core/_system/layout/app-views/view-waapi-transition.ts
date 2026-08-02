/**
 * @file view-waapi-transition.ts
 * High-performance Web Animations API (WAAPI) transition functions for view switching (`viewWaapiIn` / `viewWaapiOut`).
 * 
 * Runs natively on the browser Compositor thread for 60/120 FPS performance,
 * while seamlessly returning duration metadata to Svelte's transition runner.
 */

import type { TransitionConfig } from "svelte/transition";

import { withMotionGuard } from "$core/_system/motion";
import { ease } from "$constants/easings";

export interface WaapiViewTransitionOptions {
    y?: number;
    scale?: number;
    blur?: number;
    duration?: number;
    easing?: string;
    forceAnimate?: boolean;
}

/**
 * High-performance WAAPI intro transition for view switching.
 * Fades, scales up, translates up, and applies a subtle blur effect on the GPU.
 * Automatically respects `motionPreference` unless `forceAnimate: true` is provided.
 */
export const viewWaapiIn = withMotionGuard<WaapiViewTransitionOptions>(
    (
        node: Element,
        {
            y = 18,
            scale = 0.985,
            blur = 6,
            duration = 360,
            easing = ease.quintOut,
        }: WaapiViewTransitionOptions = {}
    ): TransitionConfig => {
        if (typeof node.animate === "function") {
            node.animate(
                [
                    {
                        opacity: 0,
                        transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                        filter: blur > 0 ? `blur(${blur}px)` : "none",
                    },
                    {
                        opacity: 1,
                        transform: "translate3d(0, 0px, 0) scale(1)",
                        filter: "blur(0px)",
                    },
                ],
                {
                    duration,
                    easing,
                    fill: "forwards",
                }
            );
        }

        return { duration };
    }
);

/**
 * High-performance WAAPI outro transition for view switching.
 * Quick fade and scale down for responsive view exits on the GPU.
 * Automatically respects `motionPreference` unless `forceAnimate: true` is provided.
 */
export const viewWaapiOut = withMotionGuard<WaapiViewTransitionOptions>(
    (
        node: Element,
        {
            y = -8,
            scale = 0.99,
            blur = 0,
            duration = 180,
            easing = ease.cubicOut,
        }: WaapiViewTransitionOptions = {}
    ): TransitionConfig => {
        if (typeof node.animate === "function") {
            node.animate(
                [
                    {
                        opacity: 1,
                        transform: "translate3d(0, 0px, 0) scale(1)",
                        filter: "blur(0px)",
                    },
                    {
                        opacity: 0,
                        transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
                        filter: blur > 0 ? `blur(${blur}px)` : "none",
                    },
                ],
                {
                    duration,
                    easing,
                    fill: "forwards",
                }
            );
        }

        return { duration };
    }
);

/** Alias for `viewWaapiIn` for consistent transition naming */
export const viewWaapiTransition = viewWaapiIn;
