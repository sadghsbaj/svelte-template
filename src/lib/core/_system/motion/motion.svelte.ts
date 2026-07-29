/**
 * @file Reactive Motion Preference Manager for Svelte 5 Applications.
 *
 * This module coordinates user motion preferences ('reduce' | 'no-preference' | 'system')
 * with document animation classes, OS-level preferences, and tab synchronization.
 *
 * ### Architecture & FOUC Prevention
 * To prevent the Flash of Animated Motion (FOAM) during initial page load,
 * this manager cooperates with an inline script located in `app.html`. The inline script
 * immediately resolves the preferred motion state and applies the `.ui-reduce-motion`
 * class to `<html>` before first paint. Upon instantiation, the client-side `MotionManager`
 * reads the DOM class to initialize its state, ensuring a seamless hydration transition
 * without visual layout jumps or unintended startup animations.
 *
 * ### SSR & Svelte Context Design
 * In Server-Side Rendering (SSR) environments:
 * 1. The manager is strictly immutable on the server (all mutative methods immediately no-op).
 * 2. The `MotionManager` class is exported alongside the singleton `motionPreference` instance.
 *    For large SSR apps, developers can instantiate the class inside Svelte context
 *    to achieve absolute request-level isolation.
 */

import type { TransitionConfig } from "svelte/transition";

export type MotionPreference = "system" | "no-preference" | "reduce";

function safeGetStorage(key: string): string | null {
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            return window.localStorage.getItem(key);
        }
    } catch {
        // Fallback gracefully in sandboxed or storage-restricted environments
    }
    return null;
}

function safeSetStorage(key: string, value: string): void {
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            window.localStorage.setItem(key, value);
        }
    } catch {
        // Fallback gracefully in sandboxed or storage-restricted environments
    }
}

function parseMotionPreference(value: unknown): MotionPreference {
    const valid: MotionPreference[] = ["no-preference", "reduce", "system"];
    if (typeof value === "string" && valid.includes(value as MotionPreference)) {
        return value as MotionPreference;
    }
    return "system";
}

export class MotionManager {
    #preference = $state<MotionPreference>(
        typeof window !== "undefined"
            ? parseMotionPreference(safeGetStorage("ui-motion-preference"))
            : "system"
    );
    #resolved = $state<"no-preference" | "reduce">(
        typeof document !== "undefined" && document.documentElement.classList.contains("ui-reduce-motion")
            ? "reduce"
            : "no-preference"
    );
    #isInitial = true;

    #mediaQuery: MediaQueryList | null = null;
    #mediaListener: (() => void) | null = null;
    #storageListener: ((event: StorageEvent) => void) | null = null;

    constructor() {
        if (typeof window === "undefined") return;

        // Initial apply to fully synchronize DOM states
        this.apply();
        this.#isInitial = false;

        const media = window.matchMedia("(prefers-reduced-motion: reduce)");
        this.#mediaQuery = media;
        this.#mediaListener = () => {
            if (this.#preference === "system") this.apply();
        };
        media.addEventListener("change", this.#mediaListener);

        this.#storageListener = (event: StorageEvent) => {
            if (event.key !== "ui-motion-preference") return;

            const newPreference = parseMotionPreference(event.newValue);
            if (newPreference !== this.#preference) {
                this.#preference = newPreference;
                this.apply();
            }
        };
        window.addEventListener("storage", this.#storageListener);
    }

    /**
     * Cleans up all global event listeners registered by this instance
     * to prevent memory leaks in multi-instance or testing environments.
     */
    destroy(): void {
        if (typeof window === "undefined") return;

        if (this.#mediaQuery && this.#mediaListener) {
            this.#mediaQuery.removeEventListener("change", this.#mediaListener);
        }
        if (this.#storageListener) {
            window.removeEventListener("storage", this.#storageListener);
        }
        this.#mediaQuery = null;
        this.#mediaListener = null;
        this.#storageListener = null;
    }

    /**
     * The active motion preference ("system" , "no-preference" , "reduce").
     */
    get preference(): MotionPreference {
        return this.#preference;
    }

    /**
     * The actual resolved motion preference currently applied ("no-preference" , "reduce").
     */
    get resolved(): "no-preference" | "reduce" {
        return this.#resolved;
    }

    /**
     * Updates the motion preference.
     * @param newPreference - The new motion preference selection.
     */
    set(newPreference: MotionPreference): void {
        if (typeof window === "undefined") return;
        const validated = parseMotionPreference(newPreference);
        if (validated === this.#preference) return;
        this.#preference = validated;
        safeSetStorage("ui-motion-preference", validated);
        this.apply();
    }

    /**
     * Applies the current motion preference configuration to the DOM.
     */
    apply(): void {
        if (typeof window === "undefined") return;

        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const shouldBeReduced = this.#preference === "reduce" || (this.#preference === "system" && prefersReduced);
        const isCurrentlyReduced = this.#resolved === "reduce";

        // Skip DOM modifications if the visual state is already correct
        if (!this.#isInitial && shouldBeReduced === isCurrentlyReduced) {
            return;
        }

        this.#resolved = shouldBeReduced ? "reduce" : "no-preference";
        document.documentElement.classList.toggle("ui-reduce-motion", shouldBeReduced);
    }
}

export const motionPreference = new MotionManager();

/**
 * Higher-order function to wrap custom Svelte transitions with global motion preference enforcement.
 *
 * When global motion preference is resolved to 'reduce', the transition is automatically bypassed by setting `duration: 0`,
 * unless `forceAnimate: true` is explicitly passed in params.
 */
export function withMotionGuard<T extends { forceAnimate?: boolean } = { forceAnimate?: boolean }>(
    fn: (node: Element, params?: T) => TransitionConfig,
    manager?: MotionManager
) {
    return (node: Element, params?: T): TransitionConfig => {
        const config = fn(node, params);
        const activeManager = manager ?? motionPreference;
        if (!params?.forceAnimate && activeManager.resolved === "reduce") {
            return { ...config, duration: 0 };
        }
        return config;
    };
}
