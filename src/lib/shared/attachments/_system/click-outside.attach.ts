import type { Attachment } from "svelte/attachments";

export type ClickOutsideTarget =
    | Element
    | string
    | (() => Element | null | undefined)
    | null
    | undefined;

export type ClickOutsideIgnore =
    | ClickOutsideTarget
    | ClickOutsideTarget[]
    | ((target: Element, event: Event) => boolean);

export type ClickOutsideEventName = "pointerdown" | "pointerup" | "click" | "contextmenu";

export interface ClickOutsideDetail {
    target: Element;
    event: Event;
    container: HTMLElement | SVGElement;
}

export type ClickOutsideHandler = (detail: ClickOutsideDetail) => void;

export interface ClickOutsideOptions {
    /**
     * Callback triggered when an interaction occurs outside the element and ignored targets.
     */
    handler?: ClickOutsideHandler;

    /**
     * Whether the click-outside detection is currently active.
     * @default true
     */
    enabled?: boolean;

    /**
     * Element(s), selector(s), or predicate function to exclude from outside click detection.
     */
    ignore?: ClickOutsideIgnore;

    /**
     * The DOM event(s) to listen for outside interactions.
     * @default ["click"]
     */
    events?: ClickOutsideEventName[];

    /**
     * Use capture phase for event listeners.
     * Intercepts events before child elements or frameworks call stopPropagation.
     * @default true
     */
    capture?: boolean;

    /**
     * Detect clicks inside iframes by listening to window blur events.
     * @default true
     */
    detectIframe?: boolean;

    /**
     * Require both pointerdown and the triggering event to originate outside.
     * Prevents false triggers when text selection or dragging starts inside and ends outside.
     * @default true
     */
    requireMatchingPointerDown?: boolean;

    /**
     * Delay in milliseconds before activating listeners to prevent the opening trigger from immediately closing the element.
     * @default 0
     */
    delay?: number;
}

export type ClickOutsideSource = ClickOutsideHandler | ClickOutsideOptions;

const DEFAULT_EVENTS: ClickOutsideEventName[] = ["click"];

/**
 * Checks whether a single ignore item matches the event or target.
 */
function matchesIgnoreItem(
    item: ClickOutsideTarget,
    target: Element,
    path: EventTarget[]
): boolean {
    if (!item) {
        return false;
    }

    if (typeof item === "string") {
        if (target.matches?.(item) || Boolean(target.closest?.(item))) {
            return true;
        }
        for (const node of path) {
            if (node instanceof Element && node.matches?.(item)) {
                return true;
            }
        }
        return false;
    }

    if (typeof item === "function") {
        const resolved = item();
        if (resolved instanceof Element) {
            return path.includes(resolved) || resolved.contains(target);
        }
        return false;
    }

    if (item instanceof Element) {
        return path.includes(item) || item.contains(target);
    }

    return false;
}

/**
 * Evaluates whether an event occurred inside the container or matches an ignore rule.
 */
function isEventInside(
    event: Event,
    container: HTMLElement | SVGElement,
    ignore?: ClickOutsideIgnore,
    cachedPath?: EventTarget[]
): boolean {
    const path = cachedPath ?? (typeof event.composedPath === "function" ? event.composedPath() : []);

    // 1. Direct container match in composed path
    if (path.includes(container)) {
        return true;
    }

    const rawTarget = event.target;
    const targetElement = rawTarget instanceof Element ? rawTarget : null;

    // 2. Direct DOM hierarchy match
    if (targetElement && container.contains(targetElement)) {
        return true;
    }

    if (!ignore || !targetElement) {
        return false;
    }

    // 3. Function ignore check (predicate function or element getter)
    if (typeof ignore === "function") {
        try {
            const result = (ignore as (t: Element, e: Event) => unknown)(targetElement, event);
            if (typeof result === "boolean") {
                return result;
            }
            if (result instanceof Element) {
                return path.includes(result) || result.contains(targetElement);
            }
            return false;
        } catch {
            return false;
        }
    }

    // 4. Array ignore check
    if (Array.isArray(ignore)) {
        return ignore.some((item) => matchesIgnoreItem(item, targetElement, path));
    }

    // 5. Single item ignore check
    return matchesIgnoreItem(ignore, targetElement, path);
}

/**
 * Checks whether an element (such as an active iframe) is inside the container or matches ignore rules.
 */
function isElementInside(
    element: Element,
    container: HTMLElement | SVGElement,
    ignore?: ClickOutsideIgnore
): boolean {
    if (element === container || container.contains(element)) {
        return true;
    }

    if (!ignore) {
        return false;
    }

    if (typeof ignore === "function") {
        try {
            const syntheticEvent = new Event("blur");
            const result = (ignore as (t: Element, e: Event) => unknown)(element, syntheticEvent);
            if (typeof result === "boolean") {
                return result;
            }
            if (result instanceof Element) {
                return element === result || result.contains(element);
            }
            return false;
        } catch {
            return false;
        }
    }

    if (Array.isArray(ignore)) {
        return ignore.some((item) => matchesIgnoreItem(item, element, [element]));
    }

    return matchesIgnoreItem(ignore, element, [element]);
}

/**
 * Resolves the currently active element across standard and Shadow DOM trees.
 */
function getDeepActiveElement(): Element | null {
    if (typeof document === "undefined") {
        return null;
    }

    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement;
    }
    return active;
}

/**
 * Svelte 5 Element Attachment to detect and handle click/pointer interactions outside an element.
 *
 * Implements resilient outside detection:
 * - Two-phase pointer tracking: prevents drag and text-selection false positives.
 * - Composed path inspection: works across Shadow DOM boundaries and with elements detached during click handlers.
 * - Opening event immunity: defers listener attachment to avoid instant dismissal on mount.
 * - Iframe blur detection: catches clicks inside external iframes across Shadow DOM roots.
 * - Polymorphic ignore rules: supports selectors, DOM elements, arrays, refs, and predicate functions.
 *
 * @example
 * ```svelte
 * <!-- Simple handler shortcut -->
 * <div {@attach clickOutside(() => isOpen = false)}>
 *     Dropdown Content
 * </div>
 *
 * <!-- Comprehensive options -->
 * <div {@attach clickOutside({
 *     handler: (detail) => console.log("Outside click on", detail.target),
 *     enabled: isMenuOpen,
 *     ignore: ["#toggle-button", ".modal-portal"],
 *     detectIframe: true
 * })}>
 *     Menu Content
 * </div>
 * ```
 */
export function clickOutside<T extends HTMLElement | SVGElement = HTMLElement>(
    sourceOrOptions?: ClickOutsideSource
): Attachment<T> {
    const options: ClickOutsideOptions =
        typeof sourceOrOptions === "function"
            ? { handler: sourceOrOptions }
            : (sourceOrOptions ?? {});

    const {
        handler,
        enabled = true,
        ignore,
        events = DEFAULT_EVENTS,
        capture = true,
        detectIframe = true,
        requireMatchingPointerDown = true,
        delay = 0,
    } = options;

    if (!enabled || !handler) {
        return () => () => {};
    }

    return (container: T) => {
        let isUnmounted = false;
        let timerId: ReturnType<typeof setTimeout> | null = null;
        let iframeTimerId: ReturnType<typeof setTimeout> | null = null;
        let pointerDownPath: EventTarget[] = [];
        let pointerDownInside = false;

        container.dataset.clickOutside = "";

        const resetPointerDownState = (): void => {
            pointerDownPath = [];
            pointerDownInside = false;
        };

        const handlePointerDown = (event: Event): void => {
            if (isUnmounted) return;
            pointerDownPath = typeof event.composedPath === "function" ? event.composedPath() : [];
            pointerDownInside = isEventInside(event, container, ignore, pointerDownPath);
        };

        const handlePointerUpOrCancel = (): void => {
            if (isUnmounted) return;
            // Defer reset to next microtask so current click/mouseup event cycle can read the state
            if (typeof queueMicrotask === "function") {
                queueMicrotask(resetPointerDownState);
            } else {
                setTimeout(resetPointerDownState, 0);
            }
        };

        const handleOutsideInteraction = (event: Event): void => {
            if (isUnmounted) return;

            // If pointerdown started inside the container or an ignored target, do not treat as outside click
            if (requireMatchingPointerDown && pointerDownInside) {
                resetPointerDownState();
                return;
            }

            const isInside = isEventInside(event, container, ignore);
            if (isInside) {
                resetPointerDownState();
                return;
            }

            const rawTarget = event.target;
            const targetElement =
                rawTarget instanceof Element
                    ? rawTarget
                    : (document.documentElement ?? container);

            resetPointerDownState();

            handler({
                target: targetElement,
                event,
                container,
            });
        };

        const handleWindowBlur = (event: FocusEvent): void => {
            if (isUnmounted || !detectIframe || typeof document === "undefined") {
                return;
            }

            if (iframeTimerId !== null) {
                clearTimeout(iframeTimerId);
            }

            iframeTimerId = setTimeout(() => {
                if (isUnmounted) return;

                const activeEl = getDeepActiveElement();
                if (
                    activeEl instanceof HTMLIFrameElement &&
                    !isElementInside(activeEl, container, ignore)
                ) {
                    handler({
                        target: activeEl,
                        event,
                        container,
                    });
                }
            }, 0);
        };

        const hasPointerEvents =
            typeof window !== "undefined" && typeof window.PointerEvent === "function";

        const registerListeners = (): void => {
            if (isUnmounted) return;

            if (typeof document !== "undefined") {
                if (requireMatchingPointerDown) {
                    if (hasPointerEvents) {
                        document.addEventListener("pointerdown", handlePointerDown, { capture });
                        document.addEventListener("pointerup", handlePointerUpOrCancel, { capture });
                        document.addEventListener("pointercancel", resetPointerDownState, { capture });
                    } else {
                        document.addEventListener("mousedown", handlePointerDown, { capture });
                        document.addEventListener("touchstart", handlePointerDown, { capture, passive: true });
                        document.addEventListener("mouseup", handlePointerUpOrCancel, { capture });
                        document.addEventListener("touchend", handlePointerUpOrCancel, { capture });
                        document.addEventListener("touchcancel", resetPointerDownState, { capture });
                    }
                }

                for (const eventName of events) {
                    document.addEventListener(eventName, handleOutsideInteraction, { capture });
                }
            }

            if (detectIframe && typeof window !== "undefined") {
                window.addEventListener("blur", handleWindowBlur);
            }
        };

        if (delay > 0) {
            timerId = setTimeout(registerListeners, delay);
        } else if (typeof queueMicrotask === "function") {
            queueMicrotask(registerListeners);
        } else {
            timerId = setTimeout(registerListeners, 0);
        }

        return () => {
            isUnmounted = true;

            if (timerId !== null) {
                clearTimeout(timerId);
                timerId = null;
            }

            if (iframeTimerId !== null) {
                clearTimeout(iframeTimerId);
                iframeTimerId = null;
            }

            delete container.dataset.clickOutside;

            if (typeof document !== "undefined") {
                if (requireMatchingPointerDown) {
                    if (hasPointerEvents) {
                        document.removeEventListener("pointerdown", handlePointerDown, { capture });
                        document.removeEventListener("pointerup", handlePointerUpOrCancel, { capture });
                        document.removeEventListener("pointercancel", resetPointerDownState, { capture });
                    } else {
                        document.removeEventListener("mousedown", handlePointerDown, { capture });
                        document.removeEventListener("touchstart", handlePointerDown, { capture });
                        document.removeEventListener("mouseup", handlePointerUpOrCancel, { capture });
                        document.removeEventListener("touchend", handlePointerUpOrCancel, { capture });
                        document.removeEventListener("touchcancel", resetPointerDownState, { capture });
                    }
                }

                for (const eventName of events) {
                    document.removeEventListener(eventName, handleOutsideInteraction, { capture });
                }
            }

            if (detectIframe && typeof window !== "undefined") {
                window.removeEventListener("blur", handleWindowBlur);
            }
        };
    };
}
