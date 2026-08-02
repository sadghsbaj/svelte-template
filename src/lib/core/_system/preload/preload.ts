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
 * Dismisses the initial application loading screen (#app-loading) with a smooth
 * transition and cleans it up from the DOM.
 *
 * @param targetId Optional ID of the loading container (defaults to "app-loading").
 */
export function dismissLoadingScreen(targetId = "app-loading"): void {
    if (typeof document === "undefined") {
        return;
    }

    const loadingEl = document.getElementById(targetId);
    if (!loadingEl) {
        return;
    }

    let isRemoved = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const removeElement = () => {
        if (isRemoved) return;
        isRemoved = true;
        loadingEl.removeEventListener("transitionend", handleTransitionEnd);
        if (fallbackTimer !== null) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
        }
        loadingEl.remove();
    };

    const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.target === loadingEl) {
            removeElement();
        }
    };

    loadingEl.classList.add("fade-out");
    loadingEl.addEventListener("transitionend", handleTransitionEnd);

    // Fallback timer to guarantee DOM removal if transitionend does not fire
    fallbackTimer = setTimeout(removeElement, 400);
}

/**
 * Initializes the preload removal flow. It ensures the '.preload' class
 * is removed from the body only after browser paint cycles have completed,
 * avoiding flash of unstyled content (FOUC) and flash of animated motion (FOAM).
 * Also dismisses the initial loading screen (#app-loading) if present.
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
        dismissLoadingScreen();
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
