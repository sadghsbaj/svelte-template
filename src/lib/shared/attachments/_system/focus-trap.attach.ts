import type { Attachment } from "svelte/attachments";

import {
    getActiveElement,
    getFocusableElements,
    isCandidateFocusable,
    isElementDisabledOrInert,
    isElementVisible,
} from "./focus.utils";

export type FocusTrapTarget =
    | "first-focusable"
    | "last-focusable"
    | "self"
    | (string & {})
    | ((container: HTMLElement) => HTMLElement | null);

export type FocusTrapTiming = "immediate" | "microtask" | "raf" | "idle";

export interface FocusTrapSuccessEvent {
    target: HTMLElement;
    container: HTMLElement;
}

export interface FocusTrapErrorEvent {
    error: unknown;
    container: HTMLElement;
}

export interface FocusTrapOptions {
    /**
     * Whether the focus trap is active.
     * @default true
     */
    enabled?: boolean;

    /**
     * Which element to initially focus upon trap activation:
     * - `"first-focusable"`: Focuses the first interactive descendant.
     * - `"last-focusable"`: Focuses the last interactive descendant.
     * - `"self"`: Focuses the container itself.
     * - `string`: A custom CSS selector matching a descendant.
     * - `function`: Custom resolver returning the HTMLElement to focus.
     * - `false`: Disables automatic initial focusing.
     * @default "first-focusable"
     */
    initialFocus?: FocusTrapTarget | false;

    /**
     * Fallback target to focus if no candidate is resolved by `initialFocus`
     * or if the container contains no focusable elements.
     * @default "self"
     */
    fallbackFocus?: FocusTrapTarget;

    /**
     * Restores focus upon deactivation / unmount.
     * - `true`: Snapshots the active element before activation and restores on unmount.
     * - `HTMLElement`: Restores focus directly to the given element.
     * - `() => HTMLElement | null`: Lazily evaluated resolver called on unmount.
     * - `false`: Leaves focus wherever it is.
     * @default true
     */
    restoreFocus?: boolean | HTMLElement | (() => HTMLElement | null);

    /**
     * Prevents browser from scrolling the document when programmatic focus occurs.
     * @default true
     */
    preventScroll?: boolean;

    /**
     * Execution schedule for the initial focus attempt:
     * - `"raf"`: Queued via requestAnimationFrame (ideal for enter animations / transitions).
     * - `"microtask"`: Queued via queueMicrotask.
     * - `"idle"`: Queued via requestIdleCallback.
     * - `"immediate"`: Synchronous immediate focus.
     * @default "raf"
     */
    timing?: FocusTrapTiming;

    /**
     * Optional delay in milliseconds before attempting the initial focus.
     * @default 0
     */
    delay?: number;

    /**
     * Number of frame retries for initial focus if target cannot be found immediately.
     * @default 3
     */
    retries?: number;

    /**
     * Automatically sets `aria-modal="true"` on the attached container if not already present.
     * Restores previous state on teardown.
     * @default true
     */
    setAriaModal?: boolean;

    /**
     * Callback triggered when the Escape key is pressed while the trap is active.
     */
    onEscape?: (event: KeyboardEvent) => void;

    /**
     * Controls whether clicks outside the container are permitted or intercepted.
     * - `true`: Clicks outside proceed normally.
     * - `false`: Intercepts pointerdown and returns focus to the trap immediately.
     * - `function`: Dynamic predicate receiving the event. If returning false, intercepts and restores focus.
     * @default false
     */
    allowOutsideClick?: boolean | ((event: MouseEvent | PointerEvent) => boolean);

    /**
     * Callback triggered when the focus trap is activated.
     */
    onActivate?: (container: HTMLElement) => void;

    /**
     * Callback triggered when the focus trap is deactivated / unmounted.
     */
    onDeactivate?: (container: HTMLElement) => void;

    /**
     * Callback triggered on initial focus success.
     */
    onSuccess?: (event: FocusTrapSuccessEvent) => void;

    /**
     * Callback triggered on initial focus failure.
     */
    onError?: (event: FocusTrapErrorEvent) => void;
}

export type FocusTrapSource = boolean | FocusTrapOptions;

interface ActiveTrapEntry {
    container: HTMLElement;
    pause: () => void;
    resume: (preferredTarget?: HTMLElement) => void;
}

/**
 * Module-level stack managing active focus traps.
 * Supports nested modals/dialogs by prioritizing the topmost trap.
 */
const trapStack: ActiveTrapEntry[] = [];

function isTopmostTrap(container: HTMLElement): boolean {
    const top = trapStack.at(-1);
    return top !== undefined && top.container === container;
}

function resolveTarget(
    container: HTMLElement,
    target: FocusTrapTarget | undefined
): HTMLElement | null {
    if (!target) return null;

    if (typeof target === "function") {
        return target(container);
    }

    if (target === "self") {
        if (isElementDisabledOrInert(container) || !isElementVisible(container)) {
            return null;
        }
        return container;
    }

    if (
        typeof target === "string" &&
        target !== "first-focusable" &&
        target !== "last-focusable"
    ) {
        try {
            const matched = container.querySelector<HTMLElement>(target);
            if (matched && !isElementDisabledOrInert(matched) && isElementVisible(matched)) {
                return matched;
            }
        } catch {
            return null;
        }
        return null;
    }

    const candidates = getFocusableElements(container);

    if (target === "last-focusable") {
        const last = candidates.at(-1);
        if (last) return last;
        return isCandidateFocusable(container) ? container : null;
    }

    // Default "first-focusable"
    const first = candidates.at(0);
    if (first) return first;
    return isCandidateFocusable(container) ? container : null;
}

/**
 * Svelte 5 Element Attachment to trap keyboard and programmatic focus within a container.
 *
 * Implements W3C APG Modal Dialog pattern:
 * - Traps Tab and Shift+Tab navigation in a cyclical loop.
 * - Handles nested modals seamlessly via an internal trap stack.
 * - Prevents focus leaks to outside elements.
 * - Manages initial focus with retries and timing options.
 * - Restores focus to the trigger element on deactivation.
 * - Reflects state via native data-attributes (`data-focus-trapped`, `data-focus-trap-paused`).
 *
 * @example
 * ```svelte
 * <!-- Simple dialog focus trap -->
 * <div role="dialog" {@attach focusTrap()}>
 *     <h2>Title</h2>
 *     <button onclick={close}>Close</button>
 * </div>
 *
 * <!-- Custom initial focus, escape handler and outside click control -->
 * <div role="dialog" {@attach focusTrap({
 *     initialFocus: "#confirm-btn",
 *     onEscape: () => isModalOpen = false,
 *     allowOutsideClick: false
 * })}>
 *     <button id="cancel-btn">Cancel</button>
 *     <button id="confirm-btn">Confirm</button>
 * </div>
 * ```
 */
export function focusTrap<T extends HTMLElement = HTMLElement>(
    sourceOrOptions?: FocusTrapSource
): Attachment<T> {
    const options: FocusTrapOptions =
        typeof sourceOrOptions === "boolean"
            ? { enabled: sourceOrOptions }
            : (sourceOrOptions ?? {});

    const {
        enabled = true,
        initialFocus = "first-focusable",
        fallbackFocus = "self",
        restoreFocus = true,
        preventScroll = true,
        timing = "raf",
        delay = 0,
        retries = 3,
        setAriaModal = true,
        onEscape,
        allowOutsideClick = false,
        onActivate,
        onDeactivate,
        onSuccess,
        onError,
    } = options;

    if (!enabled) {
        return () => () => {};
    }

    return (container: T) => {
        let isUnmounted = false;
        let isPaused = false;
        let timerId: ReturnType<typeof setTimeout> | null = null;
        let rafId: number | null = null;
        let idleId: number | null = null;
        let assignedTabIndexElement: HTMLElement | null = null;
        let lastFocusedElement: HTMLElement | null = null;

        // Snapshot original attributes for non-destructive restoration
        const originalAriaModal = container.getAttribute("aria-modal");

        // Eagerly snapshot active element before any focus shift occurs
        const initialActiveElement: HTMLElement | null =
            restoreFocus === true
                ? getActiveElement()
                : restoreFocus instanceof HTMLElement
                  ? restoreFocus
                  : null;

        // Apply accessibility metadata
        if (setAriaModal && !container.hasAttribute("aria-modal")) {
            container.setAttribute("aria-modal", "true");
        }

        const cancelPendingTasks = (): void => {
            if (timerId !== null) {
                clearTimeout(timerId);
                timerId = null;
            }
            if (rafId !== null && typeof cancelAnimationFrame === "function") {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            if (idleId !== null && typeof cancelIdleCallback === "function") {
                cancelIdleCallback(idleId);
                idleId = null;
            }
        };

        const focusTargetElement = (targetElement: HTMLElement): void => {
            if (targetElement.getAttribute("tabindex") === null && targetElement === container) {
                targetElement.setAttribute("tabindex", "-1");
                assignedTabIndexElement = targetElement;
            }
            targetElement.focus({ preventScroll });
            lastFocusedElement = targetElement;
        };

        const executeInitialFocus = (attempt: number): void => {
            if (isUnmounted || !container.isConnected) {
                return;
            }

            if (initialFocus === false) {
                container.dataset.focusTrapped = "";
                onActivate?.(container);
                return;
            }

            let targetToFocus: HTMLElement | null;
            try {
                targetToFocus =
                    resolveTarget(container, initialFocus) ?? resolveTarget(container, fallbackFocus);
            } catch (error: unknown) {
                if (isUnmounted) return;
                container.dataset.focusTrapFailed = "";
                onError?.({ error, container });
                return;
            }

            if (!targetToFocus) {
                if (attempt < retries && typeof requestAnimationFrame === "function") {
                    rafId = requestAnimationFrame(() => {
                        executeInitialFocus(attempt + 1);
                    });
                    return;
                }

                // If still unresolved, focus container as ultimate fallback
                if (isElementVisible(container) && !isElementDisabledOrInert(container)) {
                    targetToFocus = container;
                } else {
                    if (!isUnmounted) {
                        container.dataset.focusTrapFailed = "";
                        onError?.({
                            error: new Error("FocusTrap: Unable to resolve initial or fallback focusable element"),
                            container,
                        });
                    }
                    return;
                }
            }

            try {
                if (getActiveElement() !== targetToFocus) {
                    focusTargetElement(targetToFocus);
                } else {
                    lastFocusedElement = targetToFocus;
                }

                delete container.dataset.focusTrapFailed;
                container.dataset.focusTrapped = "";

                onSuccess?.({ target: targetToFocus, container });
                onActivate?.(container);
            } catch (error: unknown) {
                if (!isUnmounted) {
                    container.dataset.focusTrapFailed = "";
                    onError?.({ error, container });
                }
            }
        };

        const triggerInitialFocus = (): void => {
            executeInitialFocus(0);
        };

        // Stack registration
        const trapEntry: ActiveTrapEntry = {
            container,
            pause: () => {
                isPaused = true;
                container.dataset.focusTrapPaused = "";
            },
            resume: (preferredTarget?: HTMLElement) => {
                isPaused = false;
                delete container.dataset.focusTrapPaused;

                // If preferredTarget is valid and inside container, prioritize it; otherwise use lastFocusedElement
                const candidate =
                    preferredTarget?.isConnected &&
                    container.contains(preferredTarget) &&
                    !isElementDisabledOrInert(preferredTarget)
                        ? preferredTarget
                        : lastFocusedElement;

                const targetToFocus =
                    candidate?.isConnected &&
                    container.contains(candidate) &&
                    !isElementDisabledOrInert(candidate)
                        ? candidate
                        : (getFocusableElements(container).at(0) ?? container);

                focusTargetElement(targetToFocus);
            },
        };

        // Pause current topmost trap if one exists
        const previousTop = trapStack.at(-1);
        if (previousTop) {
            previousTop.pause();
        }
        trapStack.push(trapEntry);

        // Schedule initial focus
        if (delay > 0) {
            timerId = setTimeout(triggerInitialFocus, delay);
        } else if (timing === "immediate") {
            triggerInitialFocus();
        } else if (timing === "microtask" && typeof queueMicrotask === "function") {
            queueMicrotask(triggerInitialFocus);
        } else if (timing === "idle" && typeof requestIdleCallback === "function") {
            idleId = requestIdleCallback(triggerInitialFocus, { timeout: 200 });
        } else if (typeof requestAnimationFrame === "function") {
            rafId = requestAnimationFrame(triggerInitialFocus);
        } else {
            timerId = setTimeout(triggerInitialFocus, 0);
        }

        // Tab and Key handling
        const handleKeyDown = (event: KeyboardEvent): void => {
            if (isPaused || !isTopmostTrap(container)) {
                return;
            }

            if (event.key === "Escape" && onEscape) {
                event.preventDefault();
                event.stopPropagation();
                onEscape(event);
                return;
            }

            if (event.key !== "Tab") {
                return;
            }

            const focusables = getFocusableElements(container);

            if (focusables.length === 0) {
                // If there are no focusable elements inside the trap, lock focus to container
                event.preventDefault();
                if (getActiveElement() !== container) {
                    focusTargetElement(container);
                }
                return;
            }

            const firstElement = focusables.at(0);
            const lastElement = focusables.at(-1);

            if (!firstElement || !lastElement) {
                return;
            }

            const currentActive = getActiveElement();

            if (event.shiftKey) {
                // Shift + Tab: reverse navigation
                if (
                    currentActive === firstElement ||
                    currentActive === container ||
                    (currentActive !== null && !container.contains(currentActive))
                ) {
                    event.preventDefault();
                    lastElement.focus({ preventScroll });
                    lastFocusedElement = lastElement;
                }
            } else {
                // Tab: forward navigation
                if (
                    currentActive === lastElement ||
                    (currentActive !== null && !container.contains(currentActive))
                ) {
                    event.preventDefault();
                    firstElement.focus({ preventScroll });
                    lastFocusedElement = firstElement;
                }
            }
        };

        // Guard against outside pointer clicks
        const handlePointerDown = (event: PointerEvent): void => {
            if (isPaused || !isTopmostTrap(container)) {
                return;
            }

            const target = event.target as HTMLElement | null;
            if (!target || container.contains(target)) {
                return;
            }

            const isAllowed =
                typeof allowOutsideClick === "function"
                    ? allowOutsideClick(event)
                    : allowOutsideClick;

            if (!isAllowed) {
                event.preventDefault();
                event.stopImmediatePropagation();

                const focusables = getFocusableElements(container);
                const targetToFocus =
                    lastFocusedElement?.isConnected &&
                    container.contains(lastFocusedElement) &&
                    !isElementDisabledOrInert(lastFocusedElement)
                        ? lastFocusedElement
                        : (focusables.at(0) ?? container);

                focusTargetElement(targetToFocus);
            }
        };

        // Guard against focus escaping to external DOM elements
        const handleDocumentFocusIn = (event: FocusEvent): void => {
            if (isPaused || !isTopmostTrap(container)) {
                return;
            }

            const target = event.target as HTMLElement | null;
            if (!target) {
                return;
            }

            if (container.contains(target)) {
                lastFocusedElement = target;
                return;
            }

            // Outside element focused
            if (allowOutsideClick === true) {
                return;
            }

            // Pull focus back into the trap
            event.preventDefault();
            const focusables = getFocusableElements(container);
            const targetToFocus =
                lastFocusedElement?.isConnected &&
                container.contains(lastFocusedElement) &&
                !isElementDisabledOrInert(lastFocusedElement)
                    ? lastFocusedElement
                    : (focusables.at(0) ?? container);

            focusTargetElement(targetToFocus);
        };

        // Attach listeners
        document.addEventListener("keydown", handleKeyDown, { capture: true });
        document.addEventListener("pointerdown", handlePointerDown, { capture: true });
        document.addEventListener("focusin", handleDocumentFocusIn, { capture: true });

        // Teardown
        return () => {
            isUnmounted = true;
            cancelPendingTasks();

            document.removeEventListener("keydown", handleKeyDown, { capture: true });
            document.removeEventListener("pointerdown", handlePointerDown, { capture: true });
            document.removeEventListener("focusin", handleDocumentFocusIn, { capture: true });

            // Remove from stack
            const stackIndex = trapStack.findIndex((entry) => entry.container === container);
            if (stackIndex !== -1) {
                trapStack.splice(stackIndex, 1);
            }
            const nextTop = trapStack.at(-1);

            // Dataset state cleanup
            delete container.dataset.focusTrapped;
            delete container.dataset.focusTrapPaused;
            delete container.dataset.focusTrapFailed;

            // Restore ARIA state
            if (originalAriaModal !== null) {
                container.setAttribute("aria-modal", originalAriaModal);
            } else if (setAriaModal) {
                container.removeAttribute("aria-modal");
            }

            // Cleanup injected tabindex
            if (assignedTabIndexElement?.getAttribute("tabindex") === "-1") {
                assignedTabIndexElement.removeAttribute("tabindex");
                assignedTabIndexElement = null;
            }

            onDeactivate?.(container);

            // Restore focus / coordinate resume with preceding trap
            const targetToRestore =
                restoreFocus && typeof restoreFocus === "function"
                    ? restoreFocus()
                    : restoreFocus instanceof HTMLElement
                      ? restoreFocus
                      : initialActiveElement;

            const validRestoreTarget =
                restoreFocus && targetToRestore?.isConnected && !isElementDisabledOrInert(targetToRestore)
                    ? targetToRestore
                    : undefined;

            if (nextTop) {
                nextTop.resume(validRestoreTarget);
            } else if (validRestoreTarget) {
                try {
                    validRestoreTarget.focus({ preventScroll: true });
                } catch {
                    // Ignore focus restoration errors
                }
            }
        };
    };
}
