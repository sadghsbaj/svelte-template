import { motionPreference } from "$core/_system/motion/motion.svelte";

import type { FloatingContext, FloatingSide } from "$components/_system/floating/floating.types";

import type { PopoverAnimation, PopoverAnimationContext, PopoverReason } from "./popover.types";

const enterOffset: Record<FloatingSide, string> = {
    top: "translateY(4px)",
    right: "translateX(-4px)",
    bottom: "translateY(-4px)",
    left: "translateX(4px)",
};
const exitOffset: Record<FloatingSide, string> = {
    top: "translateY(2px)",
    right: "translateX(-2px)",
    bottom: "translateY(-2px)",
    left: "translateX(2px)",
};

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
    const offset = entering ? enterOffset[floating.side] : exitOffset[floating.side];
    return element.animate(
        entering
            ? [
                  { opacity: 0, transform: `${offset} scale(.97)`, filter: "blur(2px)" },
                  { opacity: 1, transform: "translate(0) scale(1)", filter: "blur(0)" },
              ]
            : [
                  { opacity: 1, transform: "translate(0) scale(1)", filter: "blur(0)" },
                  { opacity: 0, transform: `${offset} scale(.985)`, filter: "blur(1px)" },
              ],
        {
            duration: entering ? 180 : 125,
            easing: entering ? "cubic-bezier(.16, 1, .3, 1)" : "cubic-bezier(.4, 0, 1, 1)",
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
