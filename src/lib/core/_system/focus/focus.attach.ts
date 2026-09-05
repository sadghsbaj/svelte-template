import type { Attachment } from "svelte/attachments";

import type { FocusOverrides } from "./focus.types.js";

export const focusOverridesMap = new WeakMap<Element, FocusOverrides>();

type FocusOverridesListener = (element: Element) => void;

const focusOverridesListeners = new Set<FocusOverridesListener>();

export function onFocusOverridesChange(listener: FocusOverridesListener): () => void {
    focusOverridesListeners.add(listener);
    return () => focusOverridesListeners.delete(listener);
}

function notifyFocusOverridesChange(element: Element): void {
    for (const listener of focusOverridesListeners) {
        listener(element);
    }
}

export function focusAttach(overrides: FocusOverrides): Attachment {
    return (element: Element) => {
        focusOverridesMap.set(element, overrides);

        const isHTMLElement = element instanceof HTMLElement;

        if (overrides.enabled === false && isHTMLElement) {
            element.dataset.noCanvasFocus = "";
        }

        if (overrides.focusTarget !== undefined && isHTMLElement) {
            element.dataset.focusTarget = overrides.focusTarget;
        }

        notifyFocusOverridesChange(element);

        return () => {
            if (overrides.enabled === false && isHTMLElement) {
                delete element.dataset.noCanvasFocus;
            }

            if (overrides.focusTarget !== undefined && isHTMLElement) {
                delete element.dataset.focusTarget;
            }

            focusOverridesMap.delete(element);
        };
    };
}
