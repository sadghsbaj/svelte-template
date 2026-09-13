export interface FloatingAutoUpdateOptions {
    anchorElement?: Element | null;
    contextElement?: Element | null;
    floatingElement: HTMLElement;
    update: () => void;
    trackPosition?: boolean;
    readAnchorRect?: (() => DOMRect | DOMRectReadOnly) | null;
}

const rectChanged = (
    previous: DOMRect | DOMRectReadOnly | null,
    next: DOMRect | DOMRectReadOnly
): boolean =>
    previous !== null &&
    (previous.x !== next.x ||
        previous.y !== next.y ||
        previous.width !== next.width ||
        previous.height !== next.height);

export function autoUpdateFloating({
    anchorElement,
    contextElement,
    floatingElement,
    update,
    trackPosition = false,
    readAnchorRect,
}: FloatingAutoUpdateOptions): () => void {
    let active = true;
    let updateFrame = 0;
    let trackingFrame = 0;
    let previousRect: DOMRect | DOMRectReadOnly | null = null;

    const schedule = (): void => {
        if (!active || updateFrame) return;
        updateFrame = requestAnimationFrame(() => {
            updateFrame = 0;
            if (active) update();
        });
    };

    const resizeObserver =
        typeof ResizeObserver === "undefined" ? null : new ResizeObserver(schedule);
    const observed = new Set<Element>();
    for (const element of [anchorElement, contextElement, floatingElement]) {
        if (!element || observed.has(element)) continue;
        observed.add(element);
        resizeObserver?.observe(element);
    }

    window.addEventListener("scroll", schedule, { capture: true, passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    window.visualViewport?.addEventListener("resize", schedule, { passive: true });
    window.visualViewport?.addEventListener("scroll", schedule, { passive: true });

    const track = (): void => {
        if (!active) return;
        if (readAnchorRect) {
            try {
                const nextRect = readAnchorRect();
                if (rectChanged(previousRect, nextRect)) schedule();
                previousRect = nextRect;
            } catch {
                schedule();
            }
        }
        trackingFrame = requestAnimationFrame(track);
    };
    if (trackPosition) trackingFrame = requestAnimationFrame(track);
    schedule();

    return () => {
        if (!active) return;
        active = false;
        if (updateFrame) cancelAnimationFrame(updateFrame);
        if (trackingFrame) cancelAnimationFrame(trackingFrame);
        resizeObserver?.disconnect();
        window.removeEventListener("scroll", schedule, true);
        window.removeEventListener("resize", schedule);
        window.visualViewport?.removeEventListener("resize", schedule);
        window.visualViewport?.removeEventListener("scroll", schedule);
    };
}
