import type { Attachment } from "svelte/attachments";

export interface DisableInteractionOptions {
    /**
     * Whether interaction disabling is active.
     * When false, the attachment performs no DOM modifications and returns an empty cleanup.
     * @default true
     */
    enabled?: boolean;
    /**
     * Prevent keyboard focus from entering the element or its subtree.
     * Sets tabindex="-1", blurs active elements, and intercepts `focusin` events in capture phase.
     * @default true
     */
    preventFocus?: boolean;
    /**
     * Custom cursor style to apply while disabled. Pass `false` to avoid setting inline cursor.
     * @default "not-allowed"
     */
    cursor?: string | false;
    /**
     * Sets `aria-disabled="true"` for WAI-ARIA accessibility tree discoverability.
     * @default true
     */
    ariaDisabled?: boolean;
    /**
     * Applies the native HTML `inert` attribute for total subtree non-interactivity.
     * Note: unlike `aria-disabled`, `inert` hides the subtree entirely from the accessibility tree.
     * @default false
     */
    inert?: boolean;
    /**
     * Keys to block on keydown in capture phase.
     * @default ["Enter", " ", "Spacebar"]
     */
    blockedKeys?: string[] | ReadonlySet<string>;
}

/** Alias for backward compatibility */
export type DisabledOptions = DisableInteractionOptions;

const DEFAULT_INTERACTION_EVENTS = [
    "click",
    "dblclick",
    "auxclick",
    "contextmenu",
    "pointerdown",
    "pointerup",
    "mousedown",
    "mouseup",
    "dragstart",
    "drop",
    "submit",
    "reset",
] as const;

const DEFAULT_BLOCKED_KEYS = new Set<string>(["Enter", " ", "Spacebar"]);

function interceptInteraction(e: Event): void {
    e.preventDefault();
    e.stopImmediatePropagation();
}

function interceptFocus(e: FocusEvent): void {
    e.preventDefault();
    e.stopImmediatePropagation();
    (e.target as HTMLElement)?.blur?.();
}

/**
 * Svelte 5 Element Attachment to disable user interaction on an element or subtree.
 *
 * Intercepts pointer, keyboard, and focus events in the capture phase, sets WAI-ARIA
 * disabled state and tabindex, and cleanly restores previous DOM attributes upon unmount.
 *
 * @example
 * ```svelte
 * <div {@attach disableInteraction({ enabled: isPending })}>
 *     <button>Save</button>
 * </div>
 * ```
 */
export function disableInteraction<T extends HTMLElement = HTMLElement>(
    options: DisableInteractionOptions = {}
): Attachment<T> {
    const {
        enabled = true,
        preventFocus = true,
        cursor = "not-allowed",
        ariaDisabled = true,
        inert = false,
        blockedKeys = DEFAULT_BLOCKED_KEYS,
    } = options;

    if (!enabled) {
        return () => () => {};
    }

    const keySet = Array.isArray(blockedKeys) ? new Set(blockedKeys) : blockedKeys;

    const handleKeydown = (e: KeyboardEvent): void => {
        if (!keySet.has(e.key)) {
            return;
        }
        e.preventDefault();
        e.stopImmediatePropagation();
    };

    return (node: T) => {
        // Snapshot original DOM state for precise restoration on teardown
        const originalAriaDisabled = node.getAttribute("aria-disabled");
        const originalCursor = node.style.cursor;
        const originalTabIndex = node.getAttribute("tabindex");
        const originalInert = node.hasAttribute("inert");

        // 1. Apply Accessibility & Inert
        if (ariaDisabled) {
            node.setAttribute("aria-disabled", "true");
        }
        if (inert) {
            node.toggleAttribute("inert", true);
        }

        // 2. Apply Cursor
        if (cursor) {
            node.style.cursor = cursor;
        }

        // 3. Apply Focus Management
        if (preventFocus) {
            node.setAttribute("tabindex", "-1");

            if (typeof document !== "undefined") {
                const root = (node.getRootNode?.() as Document | ShadowRoot | undefined) ?? document;
                const activeEl = root?.activeElement ?? document.activeElement;
                if (activeEl && node.contains(activeEl)) {
                    (activeEl as HTMLElement)?.blur?.();
                }
            }
        }

        // Register capture-phase listeners
        for (const eventName of DEFAULT_INTERACTION_EVENTS) {
            node.addEventListener(eventName, interceptInteraction, { capture: true });
        }
        node.addEventListener("keydown", handleKeydown, { capture: true });
        if (preventFocus) {
            node.addEventListener("focusin", interceptFocus, { capture: true });
        }

        // Teardown: cleanup listeners and restore original DOM state
        return () => {
            for (const eventName of DEFAULT_INTERACTION_EVENTS) {
                node.removeEventListener(eventName, interceptInteraction, { capture: true });
            }
            node.removeEventListener("keydown", handleKeydown, { capture: true });
            if (preventFocus) {
                node.removeEventListener("focusin", interceptFocus, { capture: true });
            }

            // Restore ARIA state
            if (originalAriaDisabled !== null) {
                node.setAttribute("aria-disabled", originalAriaDisabled);
            } else if (ariaDisabled) {
                node.removeAttribute("aria-disabled");
            }

            // Restore inert state
            if (originalInert) {
                node.toggleAttribute("inert", true);
            } else if (inert) {
                node.removeAttribute("inert");
            }

            // Restore cursor
            node.style.cursor = originalCursor;

            // Restore tabindex
            if (originalTabIndex !== null) {
                node.setAttribute("tabindex", originalTabIndex);
            } else if (preventFocus) {
                node.removeAttribute("tabindex");
            }
        };
    };
}
