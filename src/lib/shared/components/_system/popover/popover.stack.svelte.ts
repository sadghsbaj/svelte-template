import { createContext } from "svelte";

import type { PopoverCloseReason } from "./popover.types";

const [getPopoverParent, setPopoverParent] = createContext<symbol | null>();

export interface PopoverStackEntry {
    id: symbol;
    parentId: symbol | null;
    trigger: () => HTMLElement | null;
    content: () => HTMLElement | null;
    canDismiss: (reason: PopoverCloseReason) => boolean;
    dismiss: (reason: PopoverCloseReason, event: Event) => void;
    setZIndex: (index: number) => void;
}

const entries: PopoverStackEntry[] = [];
let listening = false;

const contains = (entry: PopoverStackEntry, event: Event): boolean => {
    const path = event.composedPath();
    const trigger = entry.trigger();
    const content = entry.content();
    return Boolean(
        (trigger &&
            (path.includes(trigger) ||
                (event.target instanceof Node && trigger.contains(event.target)))) ||
        (content &&
            (path.includes(content) ||
                (event.target instanceof Node && content.contains(event.target))))
    );
};

const top = (): PopoverStackEntry | undefined => entries.at(-1);

const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Escape") return;
    const entry = top();
    if (!entry) return;
    if (!entry.canDismiss("escape")) return;
    event.preventDefault();
    event.stopPropagation();
    entry.dismiss("escape", event);
};

const onPointerDown = (event: PointerEvent): void => {
    const entry = top();
    if (!entry || contains(entry, event) || !entry.canDismiss("outside-pointer")) return;
    entry.dismiss("outside-pointer", event);
};

const onFocusIn = (event: FocusEvent): void => {
    const entry = top();
    if (!entry || contains(entry, event) || !entry.canDismiss("focus-out")) return;
    entry.dismiss("focus-out", event);
};

const syncListeners = (): void => {
    if (entries.length > 0 && !listening) {
        document.addEventListener("keydown", onKeyDown, { capture: true });
        document.addEventListener("pointerdown", onPointerDown, { capture: true });
        document.addEventListener("focusin", onFocusIn, { capture: true });
        listening = true;
    } else if (entries.length === 0 && listening) {
        document.removeEventListener("keydown", onKeyDown, { capture: true });
        document.removeEventListener("pointerdown", onPointerDown, { capture: true });
        document.removeEventListener("focusin", onFocusIn, { capture: true });
        listening = false;
    }
};

const reindex = (): void => {
    for (const [index, entry] of entries.entries()) entry.setZIndex(index + 1);
};

export function createPopoverParentContext(): { id: symbol; parentId: symbol | null } {
    let parentId: symbol | null = null;
    try {
        parentId = getPopoverParent();
    } catch {
        // A root popover has no logical overlay parent.
    }
    const id = Symbol("popover");
    setPopoverParent(id);
    return { id, parentId };
}

export function registerPopover(entry: PopoverStackEntry): () => void {
    const existing = entries.indexOf(entry);
    if (existing !== -1) entries.splice(existing, 1);
    entries.push(entry);
    reindex();
    syncListeners();
    return () => {
        const index = entries.indexOf(entry);
        if (index !== -1) entries.splice(index, 1);
        reindex();
        syncListeners();
    };
}

export function popoverBranchContains(entryId: symbol, node: Node | null): boolean {
    if (!node) return false;
    return entries.some((entry) => {
        let cursor: PopoverStackEntry | undefined = entry;
        while (cursor && cursor.id !== entryId) {
            cursor = entries.find((candidate) => candidate.id === cursor?.parentId);
        }
        if (!cursor) return false;
        return Boolean(entry.content()?.contains(node) || entry.trigger()?.contains(node));
    });
}
