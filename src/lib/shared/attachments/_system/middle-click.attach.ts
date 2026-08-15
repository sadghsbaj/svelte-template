import type { Attachment } from "svelte/attachments";

export type MiddleClickCallback = (event: MouseEvent | PointerEvent) => void;

export interface MiddleClickOptions {
    /**
     * Callback invoked when a middle click (button === 1) occurs.
     */
    onMiddleClick?: MiddleClickCallback;
    /**
     * Whether the middle click listener is active.
     * @default true
     */
    enabled?: boolean;
    /**
     * Prevent default browser action on auxclick (e.g. opening link in new background tab).
     * @default true
     */
    preventDefault?: boolean;
    /**
     * Prevent browser autoscroll (the 4-directional panning cursor on Windows/Linux).
     * Intercepts mousedown/pointerdown when button === 1.
     * @default true
     */
    preventAutoscroll?: boolean;
    /**
     * Stop event propagation for the middle click.
     * @default false
     */
    stopPropagation?: boolean;
    /**
     * Use capture phase for event listeners.
     * @default false
     */
    capture?: boolean;
    /**
     * Ignore clicks if the element or an ancestor is disabled or inert.
     * Checks `disabled`, `[aria-disabled="true"]`, and `[inert]`.
     * @default true
     */
    ignoreDisabled?: boolean;
}

/**
 * Checks whether an element or any of its ancestors is disabled or inert.
 */
function isElementDisabled(element: Element): boolean {
    return Boolean(element.closest(':disabled, [aria-disabled="true"], [inert]'));
}

/**
 * Svelte 5 Element Attachment for handling middle-mouse-button clicks (`button === 1`).
 *
 * Handles standard `auxclick` behavior, suppresses native OS autoscroll on `mousedown`,
 * respects accessibility/inert states, and provides clean teardown.
 *
 * @example
 * ```svelte
 * <!-- Simple callback -->
 * <div {@attach middleClick(() => console.log('Middle clicked!'))}>...</div>
 *
 * <!-- With configuration -->
 * <a href="/details" {@attach middleClick({
 *     onMiddleClick: handleCustomTabOpen,
 *     preventDefault: true,
 *     preventAutoscroll: true
 * })}>Open</a>
 * ```
 */
export function middleClick<T extends HTMLElement | SVGElement = HTMLElement>(
    handlerOrOptions?: MiddleClickCallback | MiddleClickOptions
): Attachment<T> {
    const options: MiddleClickOptions =
        typeof handlerOrOptions === "function"
            ? { onMiddleClick: handlerOrOptions }
            : (handlerOrOptions ?? {});

    const {
        onMiddleClick,
        enabled = true,
        preventDefault = true,
        preventAutoscroll = true,
        stopPropagation = false,
        capture = false,
        ignoreDisabled = true,
    } = options;

    if (!enabled || !onMiddleClick) {
        return () => () => {};
    }

    return (node: T) => {
        /**
         * Prevents the OS autoscroll mode (Windows/Linux) triggered on mousedown.
         */
        const handleMouseDown = (event: Event): void => {
            const e = event as MouseEvent;
            if (e.button !== 1) return;

            const target = e.target instanceof Element ? e.target : node;
            if (ignoreDisabled && (isElementDisabled(node) || isElementDisabled(target))) {
                return;
            }

            if (preventAutoscroll) {
                e.preventDefault();
            }
        };

        /**
         * Handles the actual middle click dispatch via auxclick.
         */
        const handleAuxClick = (event: Event): void => {
            const e = event as MouseEvent;
            if (e.button !== 1) return;

            const target = e.target instanceof Element ? e.target : node;
            if (ignoreDisabled && (isElementDisabled(node) || isElementDisabled(target))) {
                return;
            }

            if (preventDefault) {
                e.preventDefault();
            }

            if (stopPropagation) {
                e.stopPropagation();
            }

            onMiddleClick(e);
        };

        // Attach listeners
        node.addEventListener("auxclick", handleAuxClick, { capture });
        if (preventAutoscroll) {
            node.addEventListener("mousedown", handleMouseDown, { capture });
        }

        // Teardown
        return () => {
            node.removeEventListener("auxclick", handleAuxClick, { capture });
            if (preventAutoscroll) {
                node.removeEventListener("mousedown", handleMouseDown, { capture });
            }
        };
    };
}
