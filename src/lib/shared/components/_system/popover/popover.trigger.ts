import type { Attachment } from "svelte/attachments";

import type { PopoverRole } from "./popover.types";

interface TriggerAttachmentOptions {
    id: string;
    contentId: string;
    open: boolean;
    present: boolean;
    role: PopoverRole;
    disabled: boolean;
    setElement: (element: HTMLElement | null) => void;
    toggle: (event: MouseEvent) => void;
}

const hasPopup = (role: PopoverRole): string => (role === "dialog" ? "dialog" : role);

export function popoverTrigger(options: TriggerAttachmentOptions): Attachment<HTMLElement> {
    return (element) => {
        const attributes = ["id", "aria-expanded", "aria-controls", "aria-haspopup"] as const;
        const originals = new Map(attributes.map((name) => [name, element.getAttribute(name)]));
        let active = true;
        const onClick = (event: MouseEvent): void => {
            // Svelte's delegated consumer handler runs later in the same bubble cycle.
            queueMicrotask(() => {
                if (active && !event.defaultPrevented && !options.disabled) options.toggle(event);
            });
        };

        element.id = options.id;
        element.setAttribute("aria-expanded", String(options.open));
        element.setAttribute("aria-haspopup", hasPopup(options.role));
        element.toggleAttribute("aria-controls", options.present);
        if (options.present) element.setAttribute("aria-controls", options.contentId);
        element.addEventListener("click", onClick);
        options.setElement(element);

        return () => {
            active = false;
            element.removeEventListener("click", onClick);
            for (const name of attributes) {
                const value = originals.get(name);
                element.toggleAttribute(name, value !== null && value !== undefined);
                if (value !== null && value !== undefined) element.setAttribute(name, value);
            }
            options.setElement(null);
        };
    };
}
