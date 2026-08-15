import type { Attachment } from "svelte/attachments";

import { copyToClipboard } from "$utils";

export type CopySource = string | (() => string | Promise<string>) | HTMLElement | SVGElement;

export interface CopyOnClickSuccessEvent {
    text: string;
    node: HTMLElement | SVGElement;
    event: MouseEvent | KeyboardEvent;
}

export interface CopyOnClickErrorEvent {
    error: unknown;
    node: HTMLElement | SVGElement;
    event: MouseEvent | KeyboardEvent;
}

export interface CopyOnClickOptions {
    /**
     * The text string, synchronous/asynchronous supplier function, or DOM element to copy from.
     * When omitted, automatically copies `value` from input/textarea elements or `textContent` from container elements.
     */
    text?: CopySource;
    /**
     * Duration in milliseconds to retain the `data-copied` or `data-copy-error` state attribute.
     * @default 2000
     */
    feedbackDuration?: number;
    /**
     * Callback triggered when text has been copied successfully.
     */
    onSuccess?: (event: CopyOnClickSuccessEvent) => void;
    /**
     * Callback triggered when copying fails (e.g. rejected permissions or clipboard unavailable).
     */
    onError?: (event: CopyOnClickErrorEvent) => void;
    /**
     * Prevent default event behavior (useful on `<a>` links or submit buttons).
     * @default false
     */
    preventDefault?: boolean;
    /**
     * Stop event propagation on click or key activation.
     * @default false
     */
    stopPropagation?: boolean;
    /**
     * Allow activation via keyboard Enter and Space keys for non-native interactive elements.
     * @default true
     */
    keyboard?: boolean;
    /**
     * Ignore activation when the element or an ancestor is disabled or inert.
     * @default true
     */
    ignoreDisabled?: boolean;
    /**
     * Whether the attachment is active.
     * @default true
     */
    enabled?: boolean;
}

const NATIVE_CLICKABLE_SELECTOR =
    'button, summary, a[href], input[type="button"], input[type="submit"], input[type="reset"]';

/**
 * Checks whether an element or any ancestor is disabled or inert.
 */
function isElementDisabled(element: Element): boolean {
    return Boolean(element.closest(':disabled, [aria-disabled="true"], [inert]'));
}

/**
 * Checks whether an element or an ancestor natively synthesizes click events on keyboard Enter/Space.
 * Native buttons and links trigger click events natively, so manual keydown handlers would cause double execution.
 */
function isNativelyKeyboardClickable(element: Element): boolean {
    return Boolean(element.closest(NATIVE_CLICKABLE_SELECTOR));
}

/**
 * Checks whether the event target is an editable input or contenteditable area.
 */
function isEditableTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
        return false;
    }
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
        return true;
    }
    if (target instanceof HTMLElement && target.isContentEditable) {
        return true;
    }
    return Boolean(target.closest('[contenteditable]:not([contenteditable="false"])'));
}

/**
 * Sets feedback state attribute on HTML or SVG element dataset.
 */
function setFeedbackState(node: HTMLElement | SVGElement, state: "copied" | "copyError"): void {
    if (!("dataset" in node) || !node.dataset) {
        return;
    }
    node.dataset[state] = "";
}

/**
 * Clears feedback state attributes from HTML or SVG element dataset.
 */
function clearFeedbackState(node: HTMLElement | SVGElement): void {
    if (!("dataset" in node) || !node.dataset) {
        return;
    }
    delete node.dataset.copied;
    delete node.dataset.copyError;
}

/**
 * Resolves the final text string to be copied from the provided source or target node.
 */
async function resolveCopyText(
    source: CopySource | undefined,
    fallbackNode: HTMLElement | SVGElement
): Promise<string> {
    if (typeof source === "function") {
        return await source();
    }

    if (typeof source === "string") {
        return source;
    }

    const targetElement =
        source instanceof HTMLElement || source instanceof SVGElement ? source : fallbackNode;

    if (
        targetElement instanceof HTMLInputElement ||
        targetElement instanceof HTMLTextAreaElement
    ) {
        return targetElement.value;
    }

    return targetElement.textContent?.trim() ?? "";
}

/**
 * Svelte 5 Element Attachment to copy text to clipboard on click or keyboard trigger.
 *
 * Supports static strings, dynamic sync/async getter functions, target element references,
 * DOM dataset feedback attributes (`data-copied`, `data-copy-error`), debounce timer resets,
 * deduplicated keyboard handling for native vs custom elements, and robust clipboard fallbacks.
 *
 * @example
 * ```svelte
 * <!-- Static string shorthand -->
 * <button {@attach copyOnClick("npm install @package")}>Copy</button>
 *
 * <!-- Dynamic getter shorthand -->
 * <button {@attach copyOnClick(() => generateToken())}>Copy Token</button>
 *
 * <!-- Full options with callbacks and custom feedback duration -->
 * <button {@attach copyOnClick({
 *     text: () => currentSelection,
 *     feedbackDuration: 1500,
 *     onSuccess: ({ text }) => showNotification(`Copied: ${text}`)
 * })}>Copy</button>
 * ```
 */
export function copyOnClick<T extends HTMLElement | SVGElement = HTMLElement>(
    sourceOrOptions?: CopySource | CopyOnClickOptions
): Attachment<T> {
    const options: CopyOnClickOptions =
        typeof sourceOrOptions === "string" ||
        typeof sourceOrOptions === "function" ||
        sourceOrOptions instanceof HTMLElement ||
        sourceOrOptions instanceof SVGElement
            ? { text: sourceOrOptions }
            : (sourceOrOptions ?? {});

    const {
        text,
        feedbackDuration = 2000,
        onSuccess,
        onError,
        preventDefault = false,
        stopPropagation = false,
        keyboard = true,
        ignoreDisabled = true,
        enabled = true,
    } = options;

    if (!enabled) {
        return () => () => {};
    }

    return (node: T) => {
        let feedbackTimerId: ReturnType<typeof setTimeout> | null = null;
        let isUnmounted = false;

        const cancelPendingTimer = (): void => {
            if (feedbackTimerId === null) {
                return;
            }
            clearTimeout(feedbackTimerId);
            feedbackTimerId = null;
        };

        const clearFeedbackTimer = (): void => {
            cancelPendingTimer();
            clearFeedbackState(node);
        };

        const scheduleFeedbackReset = (): void => {
            cancelPendingTimer();
            if (feedbackDuration <= 0) {
                clearFeedbackState(node);
                return;
            }

            feedbackTimerId = setTimeout(() => {
                feedbackTimerId = null;
                if (!isUnmounted) {
                    clearFeedbackState(node);
                }
            }, feedbackDuration);
        };

        const handleTrigger = async (event: MouseEvent | KeyboardEvent): Promise<void> => {
            const target = event.target instanceof Element ? event.target : node;
            if (ignoreDisabled && (isElementDisabled(node) || isElementDisabled(target))) {
                return;
            }

            cancelPendingTimer();

            if (preventDefault) {
                event.preventDefault();
            }

            if (stopPropagation) {
                event.stopPropagation();
            }

            let resolvedText: string;
            try {
                resolvedText = await resolveCopyText(text, node);
            } catch (error: unknown) {
                if (isUnmounted) return;

                clearFeedbackTimer();
                setFeedbackState(node, "copyError");
                onError?.({ error, node, event });
                scheduleFeedbackReset();
                return;
            }

            if (isUnmounted) return;

            let isSuccess: boolean;
            try {
                isSuccess = await copyToClipboard(resolvedText);
            } catch (error: unknown) {
                if (isUnmounted) return;

                clearFeedbackTimer();
                setFeedbackState(node, "copyError");
                onError?.({ error, node, event });
                scheduleFeedbackReset();
                return;
            }

            if (isUnmounted) return;

            clearFeedbackTimer();

            if (isSuccess) {
                setFeedbackState(node, "copied");
                onSuccess?.({ text: resolvedText, node, event });
            } else {
                setFeedbackState(node, "copyError");
                onError?.({
                    error: new Error("Clipboard write operation failed or was denied"),
                    node,
                    event,
                });
            }

            scheduleFeedbackReset();
        };

        const handleClick = (event: Event): void => {
            const mouseEvent = event as MouseEvent;
            if (mouseEvent.button === 0) {
                void handleTrigger(mouseEvent);
            }
        };

        const handleKeyDown = (event: Event): void => {
            if (!keyboard) return;

            const targetElement = event.target instanceof Element ? event.target : null;
            const isNative =
                isNativelyKeyboardClickable(node) ||
                (targetElement !== null && isNativelyKeyboardClickable(targetElement));

            // Native interactive elements already synthesize a click event on Enter/Space
            if (isNative) {
                return;
            }

            const keyEvent = event as KeyboardEvent;
            if (keyEvent.key !== "Enter" && keyEvent.key !== " ") return;

            // Do not intercept Enter/Space inside editable input fields or contenteditable elements
            if (isEditableTarget(keyEvent.target)) {
                return;
            }

            if (keyEvent.repeat) return;

            if (keyEvent.key === " ") {
                keyEvent.preventDefault();
            }

            void handleTrigger(keyEvent);
        };

        node.addEventListener("click", handleClick);
        if (keyboard) {
            node.addEventListener("keydown", handleKeyDown);
        }

        return () => {
            isUnmounted = true;
            clearFeedbackTimer();
            node.removeEventListener("click", handleClick);
            if (keyboard) {
                node.removeEventListener("keydown", handleKeyDown);
            }
        };
    };
}
