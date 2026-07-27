const safeRaf = (cb: FrameRequestCallback): number => {
    if (typeof requestAnimationFrame !== "undefined") {
        return requestAnimationFrame(cb);
    }
    return setTimeout(cb, 16) as unknown as number;
};

const safeCaf = (id: number): void => {
    if (typeof cancelAnimationFrame !== "undefined") {
        cancelAnimationFrame(id);
    } else {
        clearTimeout(id as unknown as ReturnType<typeof setTimeout>);
    }
};

/**
 * Initializes the preload removal flow. It ensures the '.preload' class
 * is removed from the body only after browser paint cycles have completed,
 * avoiding flash of unstyled content (FOUC) and flash of animated motion (FOAM).
 *
 * @returns A cleanup function to cancel pending animation frame callbacks,
 * fallback timers, or DOM event listeners.
 */
export function initPreload(): () => void {
    if (typeof document === "undefined") {
        return () => {};
    }

    if (document.body && !document.body.classList.contains("preload")) {
        return () => {};
    }

    let rafId1: number | null = null;
    let rafId2: number | null = null;
    let fallbackTimerId: ReturnType<typeof setTimeout> | null = null;
    let isCleanedUp = false;

    const cleanup = () => {
        isCleanedUp = true;
        if (rafId1 !== null) {
            safeCaf(rafId1);
            rafId1 = null;
        }
        if (rafId2 !== null) {
            safeCaf(rafId2);
            rafId2 = null;
        }
        if (fallbackTimerId !== null) {
            clearTimeout(fallbackTimerId);
            fallbackTimerId = null;
        }
        document.removeEventListener("DOMContentLoaded", handleDOMContentLoaded);
    };

    const removeClass = () => {
        if (isCleanedUp) return;
        document.body?.classList.remove("preload");
        cleanup();
    };

    const scheduleRemoval = () => {
        if (isCleanedUp) return;

        // Fallback timer in case tab is backgrounded and rAF stalls
        fallbackTimerId = setTimeout(removeClass, 1000);

        rafId1 = safeRaf(() => {
            rafId1 = null;
            if (isCleanedUp) return;
            rafId2 = safeRaf(() => {
                rafId2 = null;
                removeClass();
            });
        });
    };

    const handleDOMContentLoaded = () => {
        scheduleRemoval();
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", handleDOMContentLoaded, { once: true });
    } else {
        scheduleRemoval();
    }

    return cleanup;
}

