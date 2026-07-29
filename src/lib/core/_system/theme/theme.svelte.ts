import { flushSync } from "svelte";

/**
 * @file Reactive Theme Manager for Svelte 5 Applications.
 *
 * This module coordinates user theme preferences ('light' | 'dark' | 'system')
 * with document styling, OS-level preferences, and tab synchronization.
 *
 * ### Architecture & FOUC Prevention
 * To prevent the Flash of Unstyled Content (FOUC) during initial page load,
 * this manager cooperates with an inline script located in `index.html`. The inline script
 * immediately resolves the theme and applies the `.dark` class to `<html>` before first paint.
 * Upon instantiation, the client-side `ThemeManager` reads the DOM class to initialize
 * its state, ensuring a seamless hydration transition without visual glitches.
 *
 * ### Native View Transitions
 * Smooth theme morphing is achieved using the browser's native View Transition API.
 * The manager handles several constraints:
 * - **Initial Load**: Bypasses transitions to load instantly.
 * - **Browser Support**: Falls back to a hard class-swap if the API is unsupported.
 * - **Accessibility**: Respects `prefers-reduced-motion: reduce` by disabling animations.
 * - **Transition Suspension**: Temporarily applies the `.theme-switching` class to the DOM.
 *   This disables standard CSS transitions globally during the snapshot phase, preventing
 *   individual elements from transition-animating concurrently behind the view transition.
 *
 * ### SSR & Svelte Context Design
 * In Server-Side Rendering (SSR) environments like SvelteKit or Astro, modules containing
 * global singletons are shared across all incoming requests. To avoid cross-request state leakage:
 * 1. The manager is strictly immutable on the server (all mutative methods immediately no-op).
 * 2. The `ThemeManager` class is exported alongside the singleton `theme` instance.
 *    For large SSR apps, developers can instantiate the class inside Svelte context
 *    (`setContext` / `getContext`) to achieve absolute request-level isolation.
 */

export type ThemeMode = "light" | "dark" | "system";

/**
 * Runtime type guard to validate ThemeMode values.
 */
export const isValidMode = (v: unknown): v is ThemeMode =>
    typeof v === "string" && ["light", "dark", "system"].includes(v);

/**
 * Defensive localStorage getter handling SecurityError / QuotaExceededError.
 */
function safeGetStorage(key: string): string | null {
    try {
        return typeof window !== "undefined" && window.localStorage ? localStorage.getItem(key) : null;
    } catch {
        return null;
    }
}

/**
 * Defensive localStorage setter handling SecurityError / QuotaExceededError.
 */
function safeSetStorage(key: string, value: string): void {
    try {
        if (typeof window !== "undefined" && window.localStorage) {
            localStorage.setItem(key, value);
        }
    } catch {
        // Safe fall-through on restricted storage access
    }
}

/**
 * Reactive theme manager for Svelte 5 applications.
 * Coordinates user preferences, OS color schemes, and document styling.
 */
export class ThemeManager {
    #mode = $state<ThemeMode>("system");
    #resolved = $state<"light" | "dark">("light");
    #isInitial = true;
    #transitionId = 0;

    #mediaQuery: MediaQueryList | null = null;
    #mediaListener: (() => void) | null = null;
    #storageListener: ((event: StorageEvent) => void) | null = null;

    constructor(initialMode: ThemeMode = "system", initialResolved: "light" | "dark" = "light") {
        if (typeof window === "undefined") {
            const validInitial = isValidMode(initialMode) ? initialMode : "system";
            this.#mode = validInitial;
            this.#resolved =
                validInitial === "dark"
                    ? "dark"
                    : validInitial === "light"
                      ? "light"
                      : initialResolved === "dark"
                        ? "dark"
                        : "light";
            return;
        }

        const stored = safeGetStorage("ui-theme");
        const validMode = isValidMode(stored) ? stored : isValidMode(initialMode) ? initialMode : "system";
        this.#mode = validMode;

        const documentIsDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
        this.#resolved = documentIsDark ? "dark" : initialResolved === "dark" ? "dark" : "light";

        // Initial apply to fully synchronize DOM states and meta tags
        this.apply();
        this.#isInitial = false;

        const media = window.matchMedia?.("(prefers-color-scheme: dark)");
        if (media) {
            this.#mediaQuery = media;
            this.#mediaListener = () => {
                if (this.#mode === "system") {
                    this.apply();
                }
            };
            this.#mediaQuery.addEventListener?.("change", this.#mediaListener);
        }

        this.#storageListener = (event: StorageEvent) => {
            const isTargetKey = event.key === "ui-theme" || event.key === null;
            const isTargetStorage = !event.storageArea || event.storageArea === localStorage;
            if (!isTargetKey || !isTargetStorage) return;

            const rawVal = event.newValue;
            const newMode = isValidMode(rawVal) ? rawVal : "system";
            if (newMode !== this.#mode) {
                this.#mode = newMode;
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
            this.#mediaQuery.removeEventListener?.("change", this.#mediaListener);
        }
        if (this.#storageListener) {
            window.removeEventListener("storage", this.#storageListener);
        }
    }

    /**
     * The active theme mode preference ('light', 'dark', or 'system').
     */
    get mode(): ThemeMode {
        return this.#mode;
    }

    /**
     * The actual resolved theme currently applied ('light' or 'dark').
     */
    get resolved(): "light" | "dark" {
        return this.#resolved;
    }

    /**
     * Updates the theme preference.
     * @param newMode - The new theme mode selection.
     */
    set(newMode: ThemeMode): void {
        if (typeof window === "undefined") return;
        if (!isValidMode(newMode)) return;
        if (newMode === this.#mode) return;
        this.#mode = newMode;
        safeSetStorage("ui-theme", newMode);
        this.apply();
    }

    /**
     * Toggles the active theme between light and dark.
     */
    toggle(): void {
        if (typeof window === "undefined") return;
        this.set(this.#resolved === "dark" ? "light" : "dark");
    }

    /**
     * Applies the current theme configuration to the DOM.
     * Integrates native View Transitions when supported and preferred.
     */
    apply(): void {
        if (typeof window === "undefined") return;

        const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
        const shouldBeDark = this.#mode === "dark" || (this.#mode === "system" && prefersDark);
        const isCurrentlyDark = this.#resolved === "dark";

        // Skip DOM modifications and transitions if the visual state is already correct
        if (shouldBeDark === isCurrentlyDark) {
            return;
        }

        const performSwap = () => {
            flushSync(() => {
                this.#resolved = shouldBeDark ? "dark" : "light";

                if (shouldBeDark) {
                    document.documentElement.classList.add("dark");
                    document.documentElement.style.colorScheme = "dark";
                } else {
                    document.documentElement.classList.remove("dark");
                    document.documentElement.style.colorScheme = "light";
                }

                const appBg = getComputedStyle(document.documentElement).getPropertyValue("--color-app").trim();
                const meta =
                    document.querySelector('meta[name="theme-color"]') || document.getElementById("theme-color-meta");
                if (meta && appBg) {
                    meta.setAttribute("content", appBg);
                }
            });
        };

        const prefersReducedMotion =
            (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) ||
            document.documentElement.classList.contains("ui-reduce-motion");
        const useTransition = !this.#isInitial && "startViewTransition" in document && !prefersReducedMotion;

        if (useTransition) {
            document.documentElement.classList.add("theme-switching");
            const currentId = ++this.#transitionId;

            try {
                const doc = document as Document & {
                    startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
                };
                if (!doc.startViewTransition) {
                    document.documentElement.classList.remove("theme-switching");
                    performSwap();
                    return;
                }
                const transition = doc.startViewTransition(performSwap);

                // Silence unhandled rejections on transition.ready and background cleanup
                /* eslint-disable unicorn/prefer-await */
                transition.ready.catch(() => {});

                transition.finished
                    .catch(() => {})
                    .finally(() => {
                        if (this.#transitionId === currentId) {
                            document.documentElement.classList.remove("theme-switching");
                        }
                    });
                /* eslint-enable unicorn/prefer-await */
            } catch {
                document.documentElement.classList.remove("theme-switching");
                performSwap();
            }
        } else {
            performSwap();
        }
    }
}

export const theme = new ThemeManager();

