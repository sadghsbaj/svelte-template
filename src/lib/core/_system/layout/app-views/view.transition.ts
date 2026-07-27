import { cubicOut, quintOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { withMotionGuard } from "$core/_system/motion";

export interface ViewTransitionOptions {
    y?: number;
    scale?: number;
    blur?: number;
    duration?: number;
    forceAnimate?: boolean;
}

/**
 * Custom Svelte intro transition for view switching.
 * Smoothly fades, scales up, and translates up with a subtle blur effect.
 * Automatically respects `motionPreference` unless `forceAnimate: true` is provided.
 */
export const viewTransition = withMotionGuard<ViewTransitionOptions>(
    (
        _node: Element,
        { y = 18, scale = 0.985, blur = 6, duration = 360 }: ViewTransitionOptions = {}
    ): TransitionConfig => {
        return {
            duration,
            easing: quintOut,
            css: (t) => {
                const inverse = 1 - t;
                return `
                    opacity: ${t};
                    transform: translate3d(0, ${inverse * y}px, 0) scale(${scale + (1 - scale) * t});
                    filter: blur(${inverse * blur}px);
                `;
            },
        };
    }
);

/**
 * Custom Svelte outro transition for view switching.
 * Quick fade and scale down for responsive view exits.
 * Automatically respects `motionPreference` unless `forceAnimate: true` is provided.
 */
export const viewOut = withMotionGuard<ViewTransitionOptions>(
    (
        _node: Element,
        { y = -8, scale = 0.99, blur = 0, duration = 180 }: ViewTransitionOptions = {}
    ): TransitionConfig => {
        return {
            duration,
            easing: cubicOut,
            css: (t) => {
                const inverse = 1 - t;
                return `
                    opacity: ${t};
                    transform: translate3d(0, ${inverse * y}px, 0) scale(${scale + (1 - scale) * t});
                    filter: blur(${inverse * blur}px);
                `;
            },
        };
    }
);

/** Alias for `viewTransition` for consistent intro/outro naming */
export const viewIn = viewTransition;
