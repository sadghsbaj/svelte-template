import type { Attachment } from "svelte/attachments";

import { tooltipState } from "./tooltip.svelte";
import type { TooltipInput } from "./tooltip.types";

export function tooltip(input: TooltipInput): Attachment<HTMLElement> {
    return (element) => {
        let pointerInside = false;
        let focusInside = false;
        let suppressPointerFocus = false;

        const onPointerEnter = (event: PointerEvent): void => {
            if (event.pointerType === "touch") return;
            pointerInside = true;
            tooltipState.requestOpen(element, input, "pointer");
        };
        const onPointerLeave = (event: PointerEvent): void => {
            if (event.pointerType === "touch") return;
            pointerInside = false;
            if (!focusInside) tooltipState.requestClose(element, "pointer");
        };
        const onFocusIn = (): void => {
            focusInside = true;
            if (suppressPointerFocus) return;
            tooltipState.requestOpen(element, input, "focus");
        };
        const onFocusOut = (): void => {
            focusInside = false;
            suppressPointerFocus = false;
            if (!pointerInside) tooltipState.requestClose(element, "focus");
        };
        const onPointerDown = (): void => {
            suppressPointerFocus = true;
            tooltipState.requestClose(element, "pointer-down", true);
        };
        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === "Escape") tooltipState.requestClose(element, "escape", true);
        };

        element.addEventListener("pointerenter", onPointerEnter);
        element.addEventListener("pointerleave", onPointerLeave);
        element.addEventListener("focusin", onFocusIn);
        element.addEventListener("focusout", onFocusOut);
        element.addEventListener("pointerdown", onPointerDown, { capture: true });
        element.addEventListener("keydown", onKeyDown);

        return () => {
            element.removeEventListener("pointerenter", onPointerEnter);
            element.removeEventListener("pointerleave", onPointerLeave);
            element.removeEventListener("focusin", onFocusIn);
            element.removeEventListener("focusout", onFocusOut);
            element.removeEventListener("pointerdown", onPointerDown, { capture: true });
            element.removeEventListener("keydown", onKeyDown);
            tooltipState.unregister(element);
        };
    };
}
