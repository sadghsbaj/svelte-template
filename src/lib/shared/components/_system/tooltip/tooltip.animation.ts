import { motionPreference } from "$core/_system/motion/motion.svelte";

import type { FloatingContext, FloatingSide } from "$components/_system/floating/floating.types";

import type { TooltipAnimation, TooltipAnimationContext, TooltipReason } from "./tooltip.types";

const enterTransform: Record<FloatingSide, string> = {
    top: "translate3d(0, 6px, 0) scale(.94, .72)",
    right: "translate3d(-6px, 0, 0) scale(.72, .94)",
    bottom: "translate3d(0, -6px, 0) scale(.94, .72)",
    left: "translate3d(6px, 0, 0) scale(.72, .94)",
};
const overshootTransform: Record<FloatingSide, string> = {
    top: "translate3d(0, -.75px, 0) scale(1.01, 1.025)",
    right: "translate3d(.75px, 0, 0) scale(1.025, 1.01)",
    bottom: "translate3d(0, .75px, 0) scale(1.01, 1.025)",
    left: "translate3d(-.75px, 0, 0) scale(1.025, 1.01)",
};
const exitTransform: Record<FloatingSide, string> = {
    top: "translate3d(0, 3px, 0) scale(.97, .88)",
    right: "translate3d(-3px, 0, 0) scale(.88, .97)",
    bottom: "translate3d(0, -3px, 0) scale(.97, .88)",
    left: "translate3d(3px, 0, 0) scale(.88, .97)",
};
const OPEN_TRANSFORM = "translate3d(0, 0, 0) scale(1)";

export function getTooltipTransformOrigin(context: FloatingContext): string {
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

export function runTooltipAnimation(
    element: HTMLElement,
    phase: "enter" | "exit",
    reason: TooltipReason,
    floating: FloatingContext,
    animation: "default" | "none" | TooltipAnimation
): Animation | null {
    if (animation === "none") return null;
    const reducedMotion = motionPreference.resolved === "reduce";
    const transformOrigin = getTooltipTransformOrigin(floating);
    const context: TooltipAnimationContext = {
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
    return element.animate(
        entering
            ? [
                  {
                      opacity: 0,
                      transform: enterTransform[floating.side],
                      filter: "blur(3px)",
                  },
                  {
                      opacity: 1,
                      transform: overshootTransform[floating.side],
                      filter: "blur(0)",
                      offset: 0.72,
                  },
                  { opacity: 1, transform: OPEN_TRANSFORM, filter: "blur(0)" },
              ]
            : [
                  { opacity: 1, transform: OPEN_TRANSFORM, filter: "blur(0)" },
                  {
                      opacity: 0,
                      transform: exitTransform[floating.side],
                      filter: "blur(2px)",
                  },
              ],
        {
            duration: entering ? 205 : 100,
            easing: entering ? "cubic-bezier(.16, 1, .3, 1)" : "cubic-bezier(.4, 0, 1, 1)",
            fill: "both",
        }
    );
}

export async function waitForTooltipAnimation(animation: Animation | null): Promise<void> {
    if (!animation) return;
    try {
        await animation.finished;
    } catch {
        // Cancellation completes the superseded lifecycle immediately.
    }
}
