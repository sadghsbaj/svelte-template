import type { Attachment } from "svelte/attachments";

export interface DisabledOptions {
    preventFocus?: boolean;
    cursor?: string | false;
    ariaDisabled?: boolean;
}

const INTERACTION_EVENTS = [
    "click",
    "dblclick",
    "auxclick",
    "contextmenu",
    "pointerdown",
    "pointerup",
    "mousedown",
    "mouseup",
    "touchstart",
    "touchend",
    "dragstart",
    "drop",
] as const;

const BLOCKED_KEYS = new Set<string>(["Enter", " ", "Spacebar"]);

const defaultOptions: DisabledOptions = {
    preventFocus: true,
    cursor: "not-allowed",
    ariaDisabled: true,
};

export function disableInteraction(options: DisabledOptions = {}): Attachment<HTMLElement> {
    const config = { ...defaultOptions, ...options };

    return (node: HTMLElement) => {
        // Original state
        const originalAriaDisabled = node.getAttribute("aria-disabled");
        const originalCursor = node.style.cursor;
        const originalTabIndex = node.getAttribute("tabindex");

        // Apply accessibility and cursor
        if (config.ariaDisabled) node.setAttribute("aria-disabled", "true");
        if (config.cursor) node.style.cursor = config.cursor;
        if (config.preventFocus) {
            node.setAttribute("tabindex", "-1");

            if (node.contains(document.activeElement)) {
                (document.activeElement as HTMLElement)?.blur?.();
            }
        }

        // Register events in capture-phase
        for (const eventName of INTERACTION_EVENTS) {
            node.addEventListener(eventName, interceptEvent, { capture: true });
        }
        node.addEventListener("keydown", interceptKeyboard, { capture: true });

        // Cleanup: if disabled=false or component got unmounted
        return () => {
            for (const eventName of INTERACTION_EVENTS) {
                node.removeEventListener(eventName, interceptEvent, { capture: true });
            }
            node.removeEventListener("keydown", interceptKeyboard, { capture: true });

            // Restore the previous dom state
            if (originalAriaDisabled !== null) {
                node.setAttribute("aria-disabled", originalAriaDisabled);
            } else if (config.ariaDisabled) {
                node.removeAttribute("aria-disabled");
            }

            node.style.cursor = originalCursor;

            if (originalTabIndex !== null) {
                node.setAttribute("tabindex", originalTabIndex);
            } else if (config.preventFocus) {
                node.removeAttribute("tabindex");
            }
        };
    };
}

// Capture-handler for pointer-events
function interceptEvent(e: Event): void {
    e.preventDefault();
    e.stopImmediatePropagation();
}

// Capture-handler for keyboard (space / enter)
function interceptKeyboard(e: KeyboardEvent): void {
    if (!BLOCKED_KEYS.has(e.key)) {
        return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();
}
