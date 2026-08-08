import type { Attachment } from "svelte/attachments";

import type { FocusOverrides } from "./focus.types.js";

export const focusOverridesMap = new WeakMap<Element, FocusOverrides>();

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
