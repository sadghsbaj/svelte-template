import type { Attachment } from "svelte/attachments";

import { readFromClipboard } from "$utils";

export type PasteTarget = HTMLInputElement | HTMLTextAreaElement | HTMLElement;
export type PasteTargetSupplier = () => PasteTarget | undefined | null;
export type PasteCallback = (event: PasteOnClickSuccessEvent) => void | Promise<void>;
export type PasteSource = PasteTarget | PasteTargetSupplier | PasteCallback;
export type PasteMode = "insert" | "replace";

export interface PasteOnClickSuccessEvent {
    text: string;
    node: HTMLElement | SVGElement;
    target?: PasteTarget;
    event: MouseEvent | KeyboardEvent;
}

export interface PasteOnClickErrorEvent {
    error: unknown;
    node: HTMLElement | SVGElement;
    event: MouseEvent | KeyboardEvent;
}

export interface PasteOnClickEmptyEvent {
    node: HTMLElement | SVGElement;
    event: MouseEvent | KeyboardEvent;
}

export interface PasteOnClickOptions {
    /**
     * Target input/textarea/element to paste into, a dynamic getter function (`() => inputEl`),
     * OR a callback function to handle the pasted text.
     * When omitted and attached directly to an `<input>` or `<textarea>`, the attached element is used as target.
     */
    target?: PasteSource;
    /**
     * Insertion mode when pasting into text inputs or textareas:
     * - "insert": Inserts text at the current cursor selection position (default).
     * - "replace": Replaces the entire field value with the clipboard text.
     * @default "insert"
     */
    mode?: PasteMode;
    /**
     * Duration in milliseconds to retain the `data-pasted`, `data-paste-error`, or `data-paste-empty` state attribute.
     * @default 2000
     */
    feedbackDuration?: number;
    /**
     * Automatically focus the target input element after pasting.
     * @default true
     */
    focusTarget?: boolean;
    /**
     * Callback triggered when text has been pasted successfully.
     */
    onSuccess?: (event: PasteOnClickSuccessEvent) => void;
    /**
     * Callback triggered when reading from clipboard fails or permission is denied.
     */
    onError?: (event: PasteOnClickErrorEvent) => void;
    /**
     * Callback triggered when the clipboard is empty.
     */
    onEmpty?: (event: PasteOnClickEmptyEvent) => void;
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
 * Checks whether an element or any ancestor natively synthesizes click events on keyboard Enter/Space.
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
 * Sets feedback state attribute on HTML or SVG element dataset while purging previous states.
 */
function setFeedbackState(
    node: HTMLElement | SVGElement,
    state: "pasted" | "pasteError" | "pasteEmpty"
): void {
    if (!("dataset" in node) || !node.dataset) {
        return;
    }
    delete node.dataset.pasted;
    delete node.dataset.pasteError;
    delete node.dataset.pasteEmpty;

    node.dataset[state] = "";
}

/**
 * Clears feedback state attributes from HTML or SVG element dataset.
 */
function clearFeedbackState(node: HTMLElement | SVGElement): void {
    if (!("dataset" in node) || !node.dataset) {
        return;
    }
    delete node.dataset.pasted;
    delete node.dataset.pasteError;
    delete node.dataset.pasteEmpty;
}

/**
 * Inserts or replaces text in an input or textarea and triggers Svelte-reactive DOM events.
 */
function insertTextIntoInput(
    element: HTMLInputElement | HTMLTextAreaElement,
    text: string,
    mode: PasteMode
): void {
    if (mode === "replace") {
        element.value = text;
        try {
            element.setSelectionRange(text.length, text.length);
        } catch {
            // Some input types (e.g. email, number) do not support setSelectionRange
        }
    } else {
        let inserted = false;
        try {
            if (typeof element.setRangeText === "function") {
                const start = element.selectionStart ?? element.value.length;
                const end = element.selectionEnd ?? element.value.length;
                element.setRangeText(text, start, end, "end");
                inserted = true;
            }
        } catch {
            inserted = false;
        }

        if (!inserted) {
            element.value += text;
        }
    }

    // Dispatch native input & change events so Svelte 5 $state/bind:value synchronizes reactively
    element.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
    element.dispatchEvent(new Event("change", { bubbles: true, cancelable: true }));
}

/**
 * Inserts or replaces text in a contenteditable container using Selection/Range API to preserve DOM structure.
 */
function insertTextIntoContentEditable(element: HTMLElement, text: string, mode: PasteMode): void {
    if (mode === "replace") {
        element.textContent = text;
        element.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
        return;
    }

    if (typeof window !== "undefined") {
        const selection = window.getSelection();
        if (
            selection &&
            selection.rangeCount > 0 &&
            selection.anchorNode &&
            element.contains(selection.anchorNode)
        ) {
            const range = selection.getRangeAt(0);
            range.deleteContents();
            const textNode = document.createTextNode(text);
            range.insertNode(textNode);

            range.setStartAfter(textNode);
            range.setEndAfter(textNode);
            selection.removeAllRanges();
            selection.addRange(range);

            element.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
            return;
        }
    }

    element.append(document.createTextNode(text));
    element.dispatchEvent(new Event("input", { bubbles: true, cancelable: true }));
}

/**
 * Svelte 5 Element Attachment to read text from clipboard on click or keyboard trigger
 * and insert it into a target element, dynamic getter supplier, or pass it to a callback.
 *
 * Supports input target elements, dynamic suppliers (`() => inputEl`), custom callback processors,
 * Selection/Range contenteditable insertion, Svelte reactivity syncing, and dataset feedback attributes.
 *
 * @example
 * ```svelte
 * <!-- Shorthand: Paste into target input reference -->
 * <input bind:this={inputEl} bind:value={apiKey} />
 * <button {@attach pasteOnClick(inputEl)}>Paste</button>
 *
 * <!-- Shorthand: Lazy dynamic getter for conditional inputs -->
 * <button {@attach pasteOnClick(() => inputEl)}>Paste</button>
 *
 * <!-- Shorthand: Custom callback processor -->
 * <button {@attach pasteOnClick((event) => handleImport(event.text))}>Import</button>
 *
 * <!-- Full options with replace mode -->
 * <button {@attach pasteOnClick({
 *     target: () => inputEl,
 *     mode: "replace",
 *     onSuccess: ({ text }) => showNotification(`Pasted: ${text}`)
 * })}>Replace All</button>
 * ```
 */
export function pasteOnClick<T extends HTMLElement | SVGElement = HTMLElement>(
    targetOrOptions?: PasteSource | PasteOnClickOptions
): Attachment<T> {
    const options: PasteOnClickOptions =
        typeof targetOrOptions === "function" || targetOrOptions instanceof HTMLElement
            ? { target: targetOrOptions }
            : (targetOrOptions ?? {});

    const {
        target,
        mode = "insert",
        feedbackDuration = 2000,
        focusTarget = true,
        onSuccess,
        onError,
        onEmpty,
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
            const currentTarget = event.target instanceof Element ? event.target : node;
            if (ignoreDisabled && (isElementDisabled(node) || isElementDisabled(currentTarget))) {
                return;
            }

            cancelPendingTimer();

            if (preventDefault) {
                event.preventDefault();
            }

            if (stopPropagation) {
                event.stopPropagation();
            }

            let clipboardText: string | null;
            try {
                clipboardText = await readFromClipboard();
            } catch (error: unknown) {
                if (isUnmounted) return;

                clearFeedbackTimer();
                setFeedbackState(node, "pasteError");
                onError?.({ error, node, event });
                scheduleFeedbackReset();
                return;
            }

            if (isUnmounted) return;

            if (clipboardText === null) {
                clearFeedbackTimer();
                setFeedbackState(node, "pasteError");
                onError?.({
                    error: new Error("Clipboard read operation failed or was denied"),
                    node,
                    event,
                });
                scheduleFeedbackReset();
                return;
            }

            if (clipboardText === "") {
                clearFeedbackTimer();
                setFeedbackState(node, "pasteEmpty");
                onEmpty?.({ node, event });
                scheduleFeedbackReset();
                return;
            }

            // Resolve target or execute custom callback
            let resolvedTarget: PasteTarget | undefined;

            if (typeof target === "function") {
                if (target.length === 0) {
                    // Supplier function returning element reference
                    let supplierResult: unknown;
                    try {
                        supplierResult = (target as PasteTargetSupplier)();
                    } catch (error: unknown) {
                        if (isUnmounted) return;

                        clearFeedbackTimer();
                        setFeedbackState(node, "pasteError");
                        onError?.({ error, node, event });
                        scheduleFeedbackReset();
                        return;
                    }

                    if (supplierResult instanceof HTMLElement) {
                        resolvedTarget = supplierResult;
                    } else {
                        if (isUnmounted) return;

                        clearFeedbackTimer();
                        setFeedbackState(node, "pasteError");
                        onError?.({
                            error: new Error(
                                "Target element supplier returned null, undefined, or an invalid element"
                            ),
                            node,
                            event,
                        });
                        scheduleFeedbackReset();
                        return;
                    }
                } else {
                    // Custom event callback handler
                    try {
                        const callbackResult = (target as PasteCallback)({
                            text: clipboardText,
                            node,
                            event,
                        });

                        if (callbackResult instanceof Promise) {
                            await callbackResult;
                        }
                    } catch (error: unknown) {
                        if (isUnmounted) return;

                        clearFeedbackTimer();
                        setFeedbackState(node, "pasteError");
                        onError?.({ error, node, event });
                        scheduleFeedbackReset();
                        return;
                    }

                    if (isUnmounted) return;

                    setFeedbackState(node, "pasted");
                    onSuccess?.({ text: clipboardText, node, event });
                    scheduleFeedbackReset();
                    return;
                }
            } else if (target instanceof HTMLElement) {
                resolvedTarget = target;
            } else if (node instanceof HTMLElement) {
                resolvedTarget = node;
            }

            // 1. Target is an input/textarea element
            if (
                resolvedTarget instanceof HTMLInputElement ||
                resolvedTarget instanceof HTMLTextAreaElement
            ) {
                insertTextIntoInput(resolvedTarget, clipboardText, mode);

                if (focusTarget) {
                    resolvedTarget.focus();
                }

                setFeedbackState(node, "pasted");
                onSuccess?.({ text: clipboardText, node, target: resolvedTarget, event });
                scheduleFeedbackReset();
                return;
            }

            // 3. Target is an HTML element (contenteditable or standard container)
            if (resolvedTarget instanceof HTMLElement) {
                if (resolvedTarget.isContentEditable) {
                    insertTextIntoContentEditable(resolvedTarget, clipboardText, mode);
                } else {
                    resolvedTarget.textContent =
                        mode === "replace"
                            ? clipboardText
                            : (resolvedTarget.textContent ?? "") + clipboardText;

                    resolvedTarget.dispatchEvent(
                        new Event("input", { bubbles: true, cancelable: true })
                    );
                }

                if (focusTarget) {
                    resolvedTarget.focus();
                }

                setFeedbackState(node, "pasted");
                onSuccess?.({ text: clipboardText, node, target: resolvedTarget, event });
                scheduleFeedbackReset();
                return;
            }

            // Fallback if no target element was attached
            setFeedbackState(node, "pasted");
            onSuccess?.({ text: clipboardText, node, event });
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
