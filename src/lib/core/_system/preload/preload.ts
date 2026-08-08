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

interface WindowWithLoadingState {
    __appLoadingShowTimer?: ReturnType<typeof setTimeout>;
    __appLoadingStartTime?: number;
}

/**
 * Dismisses the initial application loading screen (#app-loading) and its associated
 * inline script (#app-loading-script) with a smooth transition and cleans them up from the DOM.
 * Enforces a show delay (default 200ms) to prevent flashes on fast loads, and a minimum
 * display duration (default 500ms) if shown to avoid jarring UI flickers.
 *
 * @param targetId Optional ID of the loading container (defaults to "app-loading").
 * @param scriptId Optional ID of the inline script element (defaults to "app-loading-script").
 * @param minShowDuration Optional minimum display duration in ms (defaults to 500).
 * @param showDelay Optional delay before loading screen is shown in ms (defaults to 200).
 */
export function dismissLoadingScreen(
    targetId = "app-loading",
    scriptId = "app-loading-script",
    minShowDuration = 500,
    showDelay = 200
): void {
    if (typeof document === "undefined") {
        return;
    }

    const win = typeof window !== "undefined" ? (window as unknown as WindowWithLoadingState) : undefined;
    if (win?.__appLoadingShowTimer !== undefined) {
        clearTimeout(win.__appLoadingShowTimer);
        delete win.__appLoadingShowTimer;
    }

    const loadingEl = document.getElementById(targetId);
    const scriptEl = document.getElementById(scriptId);

    if (!loadingEl) {
        scriptEl?.remove();
        return;
    }

    const isVisible = Object.hasOwn(loadingEl.dataset, "visible");
    const startTime = win?.__appLoadingStartTime ?? performance.now();
    const elapsed = performance.now() - startTime;

    // Fast load case: if loading screen was never shown (or load took < showDelay), remove immediately
    if (!isVisible && elapsed < showDelay) {
        loadingEl.remove();
        scriptEl?.remove();
        return;
    }

    let isRemoved = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
    let fadeOutTimer: ReturnType<typeof setTimeout> | null = null;

    const removeElements = () => {
        if (isRemoved) return;
        isRemoved = true;
        loadingEl.removeEventListener("transitionend", handleTransitionEnd);
        if (fallbackTimer !== null) {
            clearTimeout(fallbackTimer);
            fallbackTimer = null;
        }
        if (fadeOutTimer !== null) {
            clearTimeout(fadeOutTimer);
            fadeOutTimer = null;
        }
        loadingEl.remove();
        scriptEl?.remove();
    };

    const handleTransitionEnd = (event: TransitionEvent) => {
        if (event.target === loadingEl) {
            removeElements();
        }
    };

    const triggerFadeOut = () => {
        loadingEl.dataset.fadeOut = "";
        loadingEl.addEventListener("transitionend", handleTransitionEnd);
        // Fallback timer to guarantee DOM removal if transitionend does not fire
        fallbackTimer = setTimeout(removeElements, 400);
    };

    const remaining = minShowDuration - elapsed;
    if (remaining > 0) {
        fadeOutTimer = setTimeout(triggerFadeOut, remaining);
    } else {
        triggerFadeOut();
    }
}

/**
 * Initializes the preload removal flow. It ensures the 'data-preload' attribute
 * is removed from the body only after browser paint cycles have completed,
 * avoiding flash of unstyled content (FOUC) and flash of animated motion (FOAM).
 * Also dismisses the initial loading screen (#app-loading) and script if present.
 *
 * @returns A cleanup function to cancel pending animation frame callbacks,
 * fallback timers, or DOM event listeners.
 */
export function initPreload(): () => void {
    if (typeof document === "undefined") {
        return () => {};
    }

    if (document.body && !Object.hasOwn(document.body.dataset, "preload")) {
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
        document.body?.removeAttribute("data-preload");
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
