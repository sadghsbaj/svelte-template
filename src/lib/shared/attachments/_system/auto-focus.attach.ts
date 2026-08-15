import type { Attachment } from "svelte/attachments";

export type AutoFocusTarget =
    | "self"
    | "first-focusable"
    | "last-focusable"
    | (string & {})
    | ((container: HTMLElement) => HTMLElement | null);

export type AutoFocusSelection = "all" | "start" | "end" | [start: number, end: number] | boolean;

export type AutoFocusTiming = "immediate" | "microtask" | "raf" | "idle";

export interface AutoFocusSuccessEvent {
    target: HTMLElement;
    container: HTMLElement;
}

export interface AutoFocusErrorEvent {
    error: unknown;
    container: HTMLElement;
}

export interface AutoFocusOptions {
    /**
     * Which element to focus:
     * - `"self"`: Focus the attached element itself.
     * - `"first-focusable"`: Focus the first interactive descendant (or self if interactive).
     * - `"last-focusable"`: Focus the last interactive descendant (or self if interactive).
     * - `string`: A custom CSS selector matching a descendant.
     * - `function`: Custom resolver returning the HTMLElement to focus.
     * @default "first-focusable" when attached to a container, otherwise "self"
     */
    target?: AutoFocusTarget;

    /**
     * Text selection or cursor placement for text inputs, textareas, and contenteditable elements:
     * - `true` | `"all"`: Selects the entire text content.
     * - `"start"`: Collapses cursor to the beginning (index 0).
     * - `"end"`: Collapses cursor to the end of the text.
     * - `[start, end]`: Sets a custom selection range.
     * @default false
     */
    select?: AutoFocusSelection;

    /**
     * Prevents browser from scrolling the document to bring the newly-focused element into view.
     * Essential for modals, dropdowns, and drawers to avoid viewport jumps.
     * @default true
     */
    preventScroll?: boolean;

    /**
     * Execution schedule for the focus attempt:
     * - `"raf"`: Queued via requestAnimationFrame (ideal for transitions and freshly painted DOM).
     * - `"microtask"`: Queued via queueMicrotask (runs immediately after current JS execution tick).
     * - `"idle"`: Queued via requestIdleCallback (low priority).
     * - `"immediate"`: Synchronous immediate focus.
     * @default "raf"
     */
    timing?: AutoFocusTiming;

    /**
     * Optional delay in milliseconds before attempting focus (e.g. waiting for entrance transitions).
     * @default 0
     */
    delay?: number;

    /**
     * Restores focus upon unmount.
     * - `true`: Snapshots active element at mount time and restores on unmount.
     * - `HTMLElement`: Restores focus to the given element on unmount.
     * - `() => HTMLElement | null`: Lazily evaluated callback called on unmount to resolve target.
     * @default false
     */
    restoreFocus?: boolean | HTMLElement | (() => HTMLElement | null);

    /**
     * Number of frame retries if no focusable target is found immediately (useful for asynchronous sub-renders).
     * @default 3
     */
    retries?: number;

    /**
     * Whether the attachment is active.
     * @default true
     */
    enabled?: boolean;

    /**
     * Callback triggered when focus has successfully been applied.
     */
    onSuccess?: (event: AutoFocusSuccessEvent) => void;

    /**
     * Callback triggered if focusing fails or no focusable element could be resolved.
     */
    onError?: (event: AutoFocusErrorEvent) => void;
}

export type AutoFocusSource = boolean | AutoFocusTarget | AutoFocusOptions;

const FOCUSABLE_SELECTOR =
    'button, [href], input:not([type="hidden"]), select, textarea, [tabindex], [contenteditable]:not([contenteditable="false"]), summary, iframe, audio[controls], video[controls]';

/**
 * Returns the currently active element, traversing through Shadow DOM boundaries if necessary.
 */
function getActiveElement(root: Document | ShadowRoot = document): HTMLElement | null {
    if (typeof document === "undefined") {
        return null;
    }

    let active = root.activeElement as HTMLElement | null;
    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement as HTMLElement | null;
    }
    return active;
}

/**
 * Checks if an element is disabled or located inside an inert/disabled subtree.
 */
function isElementDisabledOrInert(element: Element): boolean {
    return Boolean(element.closest(':disabled, [aria-disabled="true"], [inert]'));
}

/**
 * Verifies if an element is visible and capable of receiving focus in the DOM layout.
 */
function isElementVisible(element: HTMLElement): boolean {
    if (element.hidden || element.getAttribute("aria-hidden") === "true") {
        return false;
    }

    if (typeof element.checkVisibility === "function") {
        return element.checkVisibility({
            checkOpacity: false,
            checkVisibilityCSS: true,
        });
    }

    if (element.style.display === "none" || element.style.visibility === "hidden") {
        return false;
    }

    return Boolean(
        element.offsetWidth ||
            element.offsetHeight ||
            element.getClientRects().length > 0 ||
            element.parentElement
    );
}

/**
 * Checks whether an element is inherently focusable or has a non-negative tabindex.
 */
function isNativelyFocusable(element: HTMLElement): boolean {
    if (element.hasAttribute("tabindex")) {
        const tabIndexAttr = element.getAttribute("tabindex");
        if (tabIndexAttr === null) {
            return false;
        }
        const tabIndex = Number(tabIndexAttr);
        return !Number.isNaN(tabIndex) && tabIndex >= 0;
    }

    return element.matches(
        'button, [href], input:not([type="hidden"]), select, textarea, [contenteditable]:not([contenteditable="false"]), summary, iframe, audio[controls], video[controls]'
    );
}

/**
 * Determines whether a candidate element can receive keyboard/programmatic focus.
 */
function isCandidateFocusable(element: Element): element is HTMLElement {
    if (!(element instanceof HTMLElement)) {
        return false;
    }

    if (isElementDisabledOrInert(element)) {
        return false;
    }

    if (!isNativelyFocusable(element)) {
        return false;
    }

    return isElementVisible(element);
}

/**
 * Finds the target focusable element within a container based on the target strategy.
 */
function resolveTargetElement(
    container: HTMLElement,
    targetStrategy: AutoFocusTarget | undefined
): HTMLElement | null {
    if (typeof targetStrategy === "function") {
        return targetStrategy(container);
    }

    if (targetStrategy === "self") {
        if (isElementDisabledOrInert(container) || !isElementVisible(container)) {
            return null;
        }
        return container;
    }

    if (
        typeof targetStrategy === "string" &&
        targetStrategy !== "first-focusable" &&
        targetStrategy !== "last-focusable"
    ) {
        try {
            const matched = container.querySelector<HTMLElement>(targetStrategy);
            if (matched && !isElementDisabledOrInert(matched) && isElementVisible(matched)) {
                return matched;
            }
        } catch {
            return null;
        }
        return null;
    }

    // "first-focusable", "last-focusable", or default resolution
    const candidates = [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
        (el) => isCandidateFocusable(el)
    );

    if (targetStrategy === "last-focusable") {
        const lastCandidate = candidates.at(-1);
        if (lastCandidate) {
            return lastCandidate;
        }
        return isCandidateFocusable(container) ? container : null;
    }

    // Default or "first-focusable"
    const firstCandidate = candidates.at(0);
    if (firstCandidate) {
        return firstCandidate;
    }

    return isCandidateFocusable(container) ? container : null;
}

/**
 * Safely applies text selection or cursor placement to inputs, textareas, and contenteditable elements.
 */
function applyTextSelection(element: HTMLElement, selection: AutoFocusSelection): void {
    if (!selection) {
        return;
    }

    if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
    ) {
        if (selection === true || selection === "all") {
            try {
                element.select();
            } catch {
                // Fallback for inputs not supporting selection
            }
            return;
        }

        if (selection === "start") {
            try {
                element.setSelectionRange(0, 0);
            } catch {
                // Ignore unsupported input types (e.g. number/email on older engines)
            }
            return;
        }

        const length = element.value.length;

        if (selection === "end") {
            try {
                element.setSelectionRange(length, length);
            } catch {
                // Ignore unsupported input types
            }
            return;
        }

        if (Array.isArray(selection)) {
            const [start, end] = selection;
            try {
                element.setSelectionRange(
                    Math.max(0, Math.min(start, length)),
                    Math.max(0, Math.min(end, length))
                );
            } catch {
                // Ignore unsupported input types
            }
            return;
        }
    }

    if (element.isContentEditable && typeof window !== "undefined") {
        const selectionObj = window.getSelection();
        if (!selectionObj) return;

        const range = document.createRange();

        if (selection === "start") {
            range.selectNodeContents(element);
            range.collapse(true);
        } else if (selection === "end") {
            range.selectNodeContents(element);
            range.collapse(false);
        } else {
            range.selectNodeContents(element);
        }

        selectionObj.removeAllRanges();
        selectionObj.addRange(range);
    }
}

/**
 * Svelte 5 Element Attachment to automatically and reliably focus an element or child descendant.
 *
 * Designed for SPAs, dialogs, drawers, dropdowns, forms, and step wizards.
 * Handles timing (RAF, microtask, delay), selection ranges, focus restoration on teardown,
 * shadow DOM, and graceful recovery when targets are rendered asynchronously.
 *
 * @example
 * ```svelte
 * <!-- Simple self or first-focusable auto focus -->
 * <input {@attach autoFocus()} />
 *
 * <!-- Focus specific child in a dialog with full selection and restore on close -->
 * <div role="dialog" {@attach autoFocus({
 *     target: "first-focusable",
 *     select: "all",
 *     restoreFocus: true
 * })}>
 *     <input type="text" value="https://example.com" />
 * </div>
 * ```
 */
export function autoFocus<T extends HTMLElement = HTMLElement>(
    sourceOrOptions?: AutoFocusSource
): Attachment<T> {
    const options: AutoFocusOptions =
        typeof sourceOrOptions === "boolean"
            ? { enabled: sourceOrOptions }
            : typeof sourceOrOptions === "string" || typeof sourceOrOptions === "function"
              ? { target: sourceOrOptions }
              : (sourceOrOptions ?? {});

    const {
        target,
        select = false,
        preventScroll = true,
        timing = "raf",
        delay = 0,
        restoreFocus = false,
        retries = 3,
        enabled = true,
        onSuccess,
        onError,
    } = options;

    if (!enabled) {
        return () => () => {};
    }

    return (container: T) => {
        let isUnmounted = false;
        let timerId: ReturnType<typeof setTimeout> | null = null;
        let rafId: number | null = null;
        let idleId: number | null = null;
        let assignedTabIndexElement: HTMLElement | null = null;

        // Eagerly snapshot active element at mount time for boolean / direct node restoration
        const initialActiveElement: HTMLElement | null =
            restoreFocus === true
                ? getActiveElement()
                : restoreFocus instanceof HTMLElement
                  ? restoreFocus
                  : null;

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

        const executeFocus = (attempt: number): void => {
            if (isUnmounted || !container.isConnected) {
                return;
            }

            let targetElement: HTMLElement | null;
            try {
                targetElement = resolveTargetElement(container, target);
            } catch (error: unknown) {
                if (isUnmounted) return;
                container.dataset.autofocusFailed = "";
                onError?.({ error, container });
                return;
            }

            if (!targetElement) {
                if (attempt < retries && typeof requestAnimationFrame === "function") {
                    rafId = requestAnimationFrame(() => {
                        executeFocus(attempt + 1);
                    });
                    return;
                }

                if (!isUnmounted) {
                    container.dataset.autofocusFailed = "";
                    onError?.({
                        error: new Error("AutoFocus target could not be resolved or is not focusable"),
                        container,
                    });
                }
                return;
            }

            // Ensure non-interactive target elements can receive programmatic focus
            if (
                targetElement.getAttribute("tabindex") === null &&
                !isNativelyFocusable(targetElement)
            ) {
                targetElement.setAttribute("tabindex", "-1");
                assignedTabIndexElement = targetElement;
            }

            try {
                // Avoid redundant focus calls if target element is already active
                if (getActiveElement() !== targetElement) {
                    targetElement.focus({ preventScroll });
                }

                applyTextSelection(targetElement, select);

                delete container.dataset.autofocusFailed;
                container.dataset.autofocused = "";

                onSuccess?.({ target: targetElement, container });
            } catch (error: unknown) {
                if (!isUnmounted) {
                    container.dataset.autofocusFailed = "";
                    onError?.({ error, container });
                }
            }
        };

        const triggerFocus = (): void => {
            executeFocus(0);
        };

        if (delay > 0) {
            timerId = setTimeout(triggerFocus, delay);
        } else if (timing === "immediate") {
            triggerFocus();
        } else if (timing === "microtask" && typeof queueMicrotask === "function") {
            queueMicrotask(triggerFocus);
        } else if (timing === "idle" && typeof requestIdleCallback === "function") {
            idleId = requestIdleCallback(triggerFocus, { timeout: 200 });
        } else if (typeof requestAnimationFrame === "function") {
            rafId = requestAnimationFrame(triggerFocus);
        } else {
            timerId = setTimeout(triggerFocus, 0);
        }

        // Teardown
        return () => {
            isUnmounted = true;
            cancelPendingTasks();

            delete container.dataset.autofocused;
            delete container.dataset.autofocusFailed;

            // Deterministic tabindex cleanup without re-querying DOM
            if (assignedTabIndexElement?.getAttribute("tabindex") === "-1") {
                assignedTabIndexElement.removeAttribute("tabindex");
                assignedTabIndexElement = null;
            }

            // Lazy resolution of callback if provided, fallback to initial snapshot
            const targetToRestore =
                typeof restoreFocus === "function" ? restoreFocus() : initialActiveElement;

            if (
                restoreFocus &&
                targetToRestore?.isConnected &&
                !isElementDisabledOrInert(targetToRestore)
            ) {
                try {
                    targetToRestore.focus({ preventScroll: true });
                } catch {
                    // Ignore restoration errors
                }
            }
        };
    };
}
