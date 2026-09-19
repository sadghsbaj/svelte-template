import { ease, motionPreference } from "$core/_system/motion";

export type FeedbackEdge = "top" | "bottom";

export function runFeedbackAnimation(
    element: HTMLElement,
    phase: "enter" | "exit",
    edge: FeedbackEdge
): Animation | null {
    if (motionPreference.resolved === "reduce") return null;
    const direction = edge === "top" ? -1 : 1;
    const entering = phase === "enter";
    element.style.willChange = "transform, opacity, filter";
    return element.animate(
        entering
            ? [
                  {
                      opacity: 0,
                      transform: `translate3d(0, ${direction * 12}px, 0) scale(.97)`,
                      filter: "blur(2px)",
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
                  },
                  {
                      opacity: 0,
                      transform: `translate3d(0, ${direction * 8}px, 0) scale(.975)`,
                      filter: "blur(1.5px)",
                  },
              ],
        {
            duration: entering ? 250 : 160,
            easing: entering ? ease.expoOut : ease.quadIn,
            fill: "both",
        }
    );
}

export function runSwipeExit(
    element: HTMLElement,
    currentX: number,
    direction: -1 | 1
): Animation | null {
    if (motionPreference.resolved === "reduce") return null;
    const width = Math.max(1, element.offsetWidth);
    const target = direction * (window.innerWidth + width);
    element.style.willChange = "transform, opacity";
    return element.animate(
        [
            { opacity: Math.max(0.35, 1 - Math.abs(currentX) / width), transform: `translate3d(${currentX}px, 0, 0)` },
            { opacity: 0, transform: `translate3d(${target}px, 0, 0)` },
        ],
        { duration: 180, easing: ease.quadOut, fill: "both" }
    );
}

export function runSwipeReset(element: HTMLElement, currentX: number): Animation | null {
    if (motionPreference.resolved === "reduce") return null;
    const width = Math.max(1, element.offsetWidth);
    return element.animate(
        [
            { opacity: Math.max(0.35, 1 - Math.abs(currentX) / width), transform: `translate3d(${currentX}px, 0, 0)` },
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
        ],
        { duration: 220, easing: ease.expoOut }
    );
}

export async function waitForFeedbackAnimation(animation: Animation | null): Promise<void> {
    if (!animation) return;
    try {
        await animation.finished;
    } catch {
        // Cancellation is expected when a newer lifecycle supersedes the current one.
    }
}
