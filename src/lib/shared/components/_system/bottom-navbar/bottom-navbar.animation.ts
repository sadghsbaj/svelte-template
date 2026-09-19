import { ease, motionPreference } from "$core/_system/motion";

import type { BottomNavbarAnimation } from "./bottom-navbar.types";

export function runBottomNavbarAnimation(
    element: HTMLElement,
    phase: "enter" | "exit",
    animation: "default" | "none" | BottomNavbarAnimation
): Animation | null {
    if (animation === "none") return null;

    const reducedMotion = motionPreference.resolved === "reduce";
    if (reducedMotion) return null;

    const context = { phase, reducedMotion } as const;
    if (typeof animation === "function") return animation(element, context);

    const entering = phase === "enter";
    element.style.transformOrigin = "50% 100%";
    element.style.willChange = "opacity, transform, filter";

    return element.animate(
        entering
            ? [
                  {
                      opacity: 0,
                      transform: "translate3d(0, 16px, 0) scale(.96, .9)",
                      filter: "blur(5px)",
                      easing: ease.expoOut,
                  },
                  {
                      opacity: 1,
                      transform: "translate3d(0, -1px, 0) scale(1.004, 1.012)",
                      filter: "blur(0)",
                      offset: 0.78,
                      easing: ease.sineInOut,
                  },
                  {
                      opacity: 1,
                      transform: "translate3d(0, 0, 0) scale(1)",
                      filter: "blur(0)",
                  },
              ]
            : [
                  {
                      opacity: 1,
                      transform: "translate3d(0, 0, 0) scale(1)",
                      filter: "blur(0)",
                      easing: ease.quadIn,
                  },
                  {
                      opacity: 0,
                      transform: "translate3d(0, 12px, 0) scale(.97, .92)",
                      filter: "blur(4px)",
                  },
              ],
        {
            duration: entering ? 260 : 165,
            easing: "linear",
            fill: "both",
        }
    );
}

export async function waitForBottomNavbarAnimation(animation: Animation | null): Promise<void> {
    if (!animation) return;
    try {
        await animation.finished;
    } catch {
        // A superseding visibility change intentionally cancels the current animation.
    }
}
