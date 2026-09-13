import { motionPreference } from "$core/_system/motion/motion.svelte";

import type { FloatingContext, FloatingSide } from "$components/_system/floating/floating.types";

import type { PopoverAnimation, PopoverAnimationContext, PopoverReason } from "./popover.types";

const enterTransform: Record<FloatingSide, string> = {
    top: "translate3d(0, 7px, 0) scale(.975, .94)",
    right: "translate3d(-7px, 0, 0) scale(.94, .975)",
    bottom: "translate3d(0, -7px, 0) scale(.975, .94)",
    left: "translate3d(7px, 0, 0) scale(.94, .975)",
};
const overshootTransform: Record<FloatingSide, string> = {
    top: "translate3d(0, -.75px, 0) scale(1.004, 1.01)",
    right: "translate3d(.75px, 0, 0) scale(1.01, 1.004)",
    bottom: "translate3d(0, .75px, 0) scale(1.004, 1.01)",
    left: "translate3d(-.75px, 0, 0) scale(1.01, 1.004)",
};
const exitTransform: Record<FloatingSide, string> = {
    top: "translate3d(0, 3px, 0) scale(.985, .965)",
    right: "translate3d(-3px, 0, 0) scale(.965, .985)",
    bottom: "translate3d(0, -3px, 0) scale(.985, .965)",
    left: "translate3d(3px, 0, 0) scale(.965, .985)",
};
const OPEN_TRANSFORM = "translate3d(0, 0, 0) scale(1)";
const ENTER_EASING = "cubic-bezier(.16, 1, .3, 1)";
const SETTLE_EASING = "cubic-bezier(.33, 1, .68, 1)";
const EXIT_EASING = "cubic-bezier(.4, 0, 1, 1)";

export function getPopoverTransformOrigin(context: FloatingContext): string {
    const rawCross =
        context.side === "top" || context.side === "bottom"
            ? context.anchorRect.left + context.anchorRect.width / 2 - context.x
            : context.anchorRect.top + context.anchorRect.height / 2 - context.y;
    const crossSize =
        context.side === "top" || context.side === "bottom"
            ? context.floatingRect.width
            : context.floatingRect.height;
    const cross = `${Math.min(Math.max(rawCross, 0), crossSize)}px`;
    if (context.side === "top") return `${cross} bottom`;
    if (context.side === "bottom") return `${cross} top`;
    if (context.side === "left") return `right ${cross}`;
    return `left ${cross}`;
}

export function runPopoverAnimation(
    element: HTMLElement,
    phase: "enter" | "exit",
    reason: PopoverReason,
    floating: FloatingContext,
    animation: "default" | "none" | PopoverAnimation
): Animation | null {
    if (animation === "none") return null;
    const reducedMotion = motionPreference.resolved === "reduce";
    const transformOrigin = getPopoverTransformOrigin(floating);
    const context: PopoverAnimationContext = {
        phase,
        reason,
        placement: floating.placement,
        side: floating.side,
        alignment: floating.alignment,
        transformOrigin,
        reducedMotion,
    };
    if (typeof animation === "function" && reducedMotion) {
        animation(element, context)?.cancel();
        return null;
    }
    if (reducedMotion) return null;
    element.style.transformOrigin = transformOrigin;
    element.style.willChange = "transform, opacity, filter";
    if (typeof animation === "function") return animation(element, context);

    const entering = phase === "enter";
    const horizontal = floating.side === "left" || floating.side === "right";
    return element.animate(
        entering
            ? [
                  {
                      offset: 0,
                      opacity: 0,
                      transform: enterTransform[floating.side],
                      filter: "blur(4px)",
                      easing: ENTER_EASING,
                  },
                  {
                      offset: 0.7,
                      opacity: 1,
                      transform: overshootTransform[floating.side],
                      filter: "blur(0)",
                      easing: SETTLE_EASING,
                  },
                  {
                      offset: 1,
                      opacity: 1,
                      transform: OPEN_TRANSFORM,
                      filter: "blur(0)",
                  },
              ]
            : [
                  {
                      opacity: 1,
                      transform: OPEN_TRANSFORM,
                      filter: "blur(0)",
                  },
                  {
                      opacity: 0,
                      transform: exitTransform[floating.side],
                      filter: "blur(2px)",
                  },
              ],
        {
            duration: entering ? (horizontal ? 220 : 260) : horizontal ? 120 : 145,
            easing: entering ? "linear" : EXIT_EASING,
            fill: "both",
        }
    );
}

export async function waitForPopoverAnimation(animation: Animation | null): Promise<void> {
    if (!animation) return;
    try {
        await animation.finished;
    } catch {
        // Cancellation and custom runner failures complete the current lifecycle immediately.
    }
}
