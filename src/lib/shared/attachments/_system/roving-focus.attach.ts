import type { Attachment } from "svelte/attachments";

import { getActiveElement, isElementDisabledOrInert, isElementVisible } from "./focus.utils";

export type RovingFocusOrientation = "vertical" | "horizontal" | "both";
export type RovingFocusDirection = "auto" | "ltr" | "rtl";
export type RovingFocusChangeReason = "keyboard" | "focus" | "pointer" | "mutation";

export type RovingFocusInitialItem =
    | number
    | string
    | HTMLElement
    | ((container: HTMLElement, items: readonly HTMLElement[]) => HTMLElement | null);

export interface RovingFocusTypeaheadOptions {
    /** Time in milliseconds before the search buffer resets. @default 500 */
    timeout?: number;
    /** Resolves the searchable text for an item. @default item.textContent */
    getText?: (item: HTMLElement) => string;
}

export interface RovingFocusActiveChangeDetail {
    item: HTMLElement;
    index: number;
    reason: RovingFocusChangeReason;
}

export interface RovingFocusOptions {
    /** CSS selector used to discover item descendants. @default "[data-roving-focus-item]" */
    selector?: string;
    /** Arrow-key axes managed by the attachment. @default "vertical" */
    orientation?: RovingFocusOrientation;
    /** Whether arrow navigation wraps at either end. @default true */
    loop?: boolean;
    /** Horizontal writing direction, or `auto` to read computed CSS direction. @default "auto" */
    direction?: RovingFocusDirection;
    /**
     * Initial item as a DOM index, descendant selector, element, or resolver.
     * The focused item and `[data-roving-focus-active]` marker take precedence.
     */
    initialItem?: RovingFocusInitialItem;
    /** Enables first-character and buffered prefix navigation. @default false */
    typeahead?: boolean | RovingFocusTypeaheadOptions;
    /** Prevents scrolling when keyboard navigation moves focus. @default true */
    preventScroll?: boolean;
    /** Called whenever the active item or its DOM index changes after initialization. */
    onActiveChange?: (detail: RovingFocusActiveChangeDetail) => void;
}

interface TabIndexOwnership {
    originalValue: string | null;
    owners: Set<symbol>;
}

const DEFAULT_ITEM_SELECTOR = "[data-roving-focus-item]";
const ACTIVE_ITEM_SELECTOR = "[data-roving-focus-active]";
const CONTAINER_ATTRIBUTE = "data-roving-focus-container";
const tabIndexOwnership = new WeakMap<HTMLElement, TabIndexOwnership>();

function claimTabIndex(item: HTMLElement, owner: symbol): void {
    let ownership = tabIndexOwnership.get(item);
    if (!ownership) {
        ownership = {
            originalValue: item.getAttribute("tabindex"),
            owners: new Set(),
        };
        tabIndexOwnership.set(item, ownership);
    }
    ownership.owners.add(owner);
}

function releaseTabIndex(item: HTMLElement, owner: symbol): void {
    const ownership = tabIndexOwnership.get(item);
    if (!ownership) return;

    ownership.owners.delete(owner);
    if (ownership.owners.size > 0) return;

    if (ownership.originalValue === null) {
        item.toggleAttribute("tabindex", false);
    } else {
        item.setAttribute("tabindex", ownership.originalValue);
    }
    tabIndexOwnership.delete(item);
}

/**
 * Svelte 5 attachment implementing the WAI-ARIA roving tabindex pattern for a container.
 * It only manages focus: it never selects, activates, or clicks an item.
 */
export function rovingFocus<T extends HTMLElement = HTMLElement>(
    options: RovingFocusOptions = {}
): Attachment<T> {
    const {
        selector = DEFAULT_ITEM_SELECTOR,
        orientation = "vertical",
        loop = true,
        direction = "auto",
        initialItem,
        typeahead = false,
        preventScroll = true,
        onActiveChange,
    } = options;

    return (container: T) => {
        const owner = Symbol("rovingFocus");
        const originalContainerMarker = container.getAttribute(CONTAINER_ATTRIBUTE);
        const managedItems = new Set<HTMLElement>();
        let activeItem: HTMLElement | null = null;
        let activeIndex = -1;
        let isUnmounted = false;
        let synchronizationQueued = false;
        let searchBuffer = "";
        let lastSearchTime = 0;

        container.toggleAttribute(CONTAINER_ATTRIBUTE, true);

        const getItems = (): HTMLElement[] => {
            try {
                return [...container.querySelectorAll<HTMLElement>(selector)].filter(
                    (item) => item.closest("[data-roving-focus-container]") === container
                );
            } catch {
                return [];
            }
        };

        const isAvailable = (item: HTMLElement): boolean =>
            !isElementDisabledOrInert(item) && isElementVisible(item);

        const reconcileOwnership = (items: readonly HTMLElement[]): void => {
            const nextItems = new Set(items);
            for (const item of managedItems) {
                if (nextItems.has(item)) continue;
                releaseTabIndex(item, owner);
                managedItems.delete(item);
            }
            for (const item of items) {
                if (managedItems.has(item)) continue;
                claimTabIndex(item, owner);
                managedItems.add(item);
            }
        };

        const applyTabIndexes = (items: readonly HTMLElement[]): void => {
            for (const item of items) {
                item.setAttribute("tabindex", item === activeItem ? "0" : "-1");
            }
        };

        const findReplacement = (
            items: readonly HTMLElement[],
            preferredIndex: number
        ): HTMLElement | null => {
            if (items.length === 0) return null;

            const start = Math.max(0, Math.min(preferredIndex, items.length - 1));
            for (let index = start; index < items.length; index += 1) {
                const item = items[index];
                if (item && isAvailable(item)) return item;
            }
            for (let index = start - 1; index >= 0; index -= 1) {
                const item = items[index];
                if (item && isAvailable(item)) return item;
            }
            return null;
        };

        const synchronize = (notify: boolean): void => {
            const previousItem = activeItem;
            const previousIndex = activeIndex;
            const items = getItems();
            reconcileOwnership(items);

            if (!activeItem || !items.includes(activeItem) || !isAvailable(activeItem)) {
                activeItem = findReplacement(items, Math.max(0, previousIndex));
            }
            activeIndex = activeItem ? items.indexOf(activeItem) : -1;
            applyTabIndexes(items);

            if (
                notify &&
                activeItem &&
                (activeItem !== previousItem || activeIndex !== previousIndex)
            ) {
                onActiveChange?.({ item: activeItem, index: activeIndex, reason: "mutation" });
            }
        };

        const resolveItemFromTarget = (target: EventTarget | null): HTMLElement | null => {
            if (!(target instanceof Element)) return null;
            return getItems().find((item) => item === target || item.contains(target)) ?? null;
        };

        const setActiveItem = (
            item: HTMLElement,
            reason: RovingFocusChangeReason,
            moveFocus: boolean
        ): boolean => {
            const items = getItems();
            if (!items.includes(item) || !isAvailable(item)) return false;

            reconcileOwnership(items);
            const previousItem = activeItem;
            const previousIndex = activeIndex;
            activeItem = item;
            activeIndex = items.indexOf(item);
            applyTabIndexes(items);

            if (moveFocus && getActiveElement() !== item) {
                item.focus({ preventScroll });
            }
            if (item !== previousItem || activeIndex !== previousIndex) {
                onActiveChange?.({ item, index: activeIndex, reason });
            }
            return true;
        };

        const resolveInitialItem = (items: readonly HTMLElement[]): HTMLElement | null => {
            const currentFocus = getActiveElement();
            const focusedItem = currentFocus
                ? items.find((item) => item === currentFocus || item.contains(currentFocus))
                : undefined;
            if (focusedItem && isAvailable(focusedItem)) return focusedItem;

            const markedItem = items.find(
                (item) => item.matches(ACTIVE_ITEM_SELECTOR) && isAvailable(item)
            );
            if (markedItem) return markedItem;

            let resolved: HTMLElement | undefined | null;
            if (typeof initialItem === "number") {
                resolved = items.at(initialItem);
            } else if (typeof initialItem === "string") {
                try {
                    resolved = container.querySelector<HTMLElement>(initialItem);
                } catch {
                    resolved = null;
                }
            } else if (typeof initialItem === "function") {
                resolved = initialItem(container, items);
            } else if (initialItem instanceof HTMLElement) {
                resolved = initialItem;
            }

            if (resolved && items.includes(resolved) && isAvailable(resolved)) return resolved;
            return items.find((item) => isAvailable(item)) ?? null;
        };

        const initialItems = getItems();
        reconcileOwnership(initialItems);
        activeItem = resolveInitialItem(initialItems);
        activeIndex = activeItem ? initialItems.indexOf(activeItem) : -1;
        applyTabIndexes(initialItems);

        const getNavigationDelta = (key: string): number | null => {
            if (orientation !== "horizontal" && (key === "ArrowUp" || key === "ArrowDown")) {
                return key === "ArrowUp" ? -1 : 1;
            }
            if (orientation !== "vertical" && (key === "ArrowLeft" || key === "ArrowRight")) {
                const resolvedDirection =
                    direction === "auto" ? getComputedStyle(container).direction : direction;
                const forward = key === "ArrowRight" ? 1 : -1;
                return resolvedDirection === "rtl" ? -forward : forward;
            }
            return null;
        };

        const findNavigationTarget = (
            availableItems: readonly HTMLElement[],
            delta: number
        ): HTMLElement | null => {
            if (availableItems.length < 2) return null;
            const currentIndex = activeItem ? availableItems.indexOf(activeItem) : -1;
            const baseIndex =
                currentIndex < 0 ? (delta > 0 ? -1 : availableItems.length) : currentIndex;
            let nextIndex = baseIndex + delta;
            if (loop) {
                nextIndex = (nextIndex + availableItems.length) % availableItems.length;
            }
            if (nextIndex < 0 || nextIndex >= availableItems.length || nextIndex === currentIndex) {
                return null;
            }
            return availableItems[nextIndex] ?? null;
        };

        const handleTypeahead = (event: KeyboardEvent, items: readonly HTMLElement[]): boolean => {
            if (!typeahead || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) {
                return false;
            }
            if (event.key.length !== 1 || event.key.trim().length === 0) return false;

            const typeaheadOptions = typeof typeahead === "object" ? typeahead : {};
            const timeout = typeaheadOptions.timeout ?? 500;
            const getText =
                typeaheadOptions.getText ?? ((item: HTMLElement) => item.textContent ?? "");
            const now = Date.now();
            const previousBuffer = now - lastSearchTime > timeout ? "" : searchBuffer;
            searchBuffer = `${previousBuffer}${event.key.toLocaleLowerCase()}`;
            lastSearchTime = now;

            const repeated = [...searchBuffer].every((character) => character === searchBuffer[0]);
            const query = repeated ? (searchBuffer[0] ?? "") : searchBuffer;
            const currentIndex = activeItem ? items.indexOf(activeItem) : -1;
            const includeCurrent = previousBuffer.length > 0 && !repeated;
            const startOffset = includeCurrent ? 0 : 1;

            for (let offset = startOffset; offset <= items.length; offset += 1) {
                const index = (Math.max(currentIndex, 0) + offset) % items.length;
                const item = items[index];
                if (
                    item &&
                    isAvailable(item) &&
                    getText(item).trim().toLocaleLowerCase().startsWith(query)
                ) {
                    setActiveItem(item, "keyboard", true);
                    return true;
                }
            }
            return false;
        };

        const handleKeyDown = (event: KeyboardEvent): void => {
            const eventItem = resolveItemFromTarget(event.target);
            if (!eventItem || !isAvailable(eventItem)) return;
            if (eventItem !== activeItem) setActiveItem(eventItem, "focus", false);

            const items = getItems();
            const availableItems = items.filter((item) => isAvailable(item));
            let target: HTMLElement | null = null;
            if (event.key === "Home") {
                target = availableItems.at(0) ?? null;
            } else if (event.key === "End") {
                target = availableItems.at(-1) ?? null;
            } else {
                const delta = getNavigationDelta(event.key);
                if (delta !== null) target = findNavigationTarget(availableItems, delta);
            }

            if (target && target !== activeItem && setActiveItem(target, "keyboard", true)) {
                event.preventDefault();
                return;
            }
            if (handleTypeahead(event, items)) event.preventDefault();
        };

        const handleFocusIn = (event: FocusEvent): void => {
            const item = resolveItemFromTarget(event.target);
            if (item) setActiveItem(item, "focus", false);
        };

        const handleClick = (event: MouseEvent): void => {
            const item = resolveItemFromTarget(event.target);
            if (item) setActiveItem(item, "pointer", false);
        };

        const observer = new MutationObserver((records) => {
            const onlyExpectedTabIndexChanges = records.every(
                (record) =>
                    record.type === "attributes" &&
                    record.attributeName === "tabindex" &&
                    record.target instanceof HTMLElement &&
                    managedItems.has(record.target) &&
                    record.target.getAttribute("tabindex") ===
                        (record.target === activeItem ? "0" : "-1")
            );
            if (onlyExpectedTabIndexChanges || synchronizationQueued) return;

            synchronizationQueued = true;
            queueMicrotask(() => {
                synchronizationQueued = false;
                if (!isUnmounted) synchronize(true);
            });
        });

        container.addEventListener("keydown", handleKeyDown);
        container.addEventListener("focusin", handleFocusIn);
        container.addEventListener("click", handleClick);
        observer.observe(container, { childList: true, subtree: true, attributes: true });

        return () => {
            isUnmounted = true;
            observer.disconnect();
            container.removeEventListener("keydown", handleKeyDown);
            container.removeEventListener("focusin", handleFocusIn);
            container.removeEventListener("click", handleClick);
            for (const item of managedItems) releaseTabIndex(item, owner);
            managedItems.clear();

            if (originalContainerMarker === null) {
                container.toggleAttribute(CONTAINER_ATTRIBUTE, false);
            } else {
                container.setAttribute(CONTAINER_ATTRIBUTE, originalContainerMarker);
            }
        };
    };
}
