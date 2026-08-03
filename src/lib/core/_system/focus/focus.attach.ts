import type { Attachment } from "svelte/attachments";
import type { FocusOverrides } from "./focus.types.js";

export const focusOverridesMap = new WeakMap<Element, FocusOverrides>();

export function focusAttach(overrides: FocusOverrides): Attachment {
    return (element: Element) => {
        focusOverridesMap.set(element, overrides);

        return () => {
            focusOverridesMap.delete(element);
        };
    };
}
