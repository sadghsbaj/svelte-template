import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { rovingFocus, type RovingFocusActiveChangeDetail } from "./roving-focus.attach";

function createItem(text: string): HTMLButtonElement {
    const item = document.createElement("button");
    item.dataset.rovingFocusItem = "";
    item.textContent = text;
    return item;
}

function press(item: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    item.dispatchEvent(event);
    return event;
}

async function flushMutations(): Promise<void> {
    await Promise.resolve();
    await Promise.resolve();
}

describe("rovingFocus Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
    });

    afterEach(() => {
        container.remove();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    test("initializes exactly one item from the active element, marker, option, or first valid item", () => {
        const first = createItem("First");
        const marked = createItem("Marked");
        const indexed = createItem("Indexed");
        marked.dataset.rovingFocusActive = "";
        container.append(first, marked, indexed);
        first.focus();

        const cleanup = rovingFocus({ initialItem: 2 })(container);
        expect(first.tabIndex).toBe(0);
        expect(marked.tabIndex).toBe(-1);
        expect(indexed.tabIndex).toBe(-1);
        cleanup?.();

        first.blur();
        const secondCleanup = rovingFocus({ initialItem: 2 })(container);
        expect(marked.tabIndex).toBe(0);
        secondCleanup?.();

        delete marked.dataset.rovingFocusActive;
        const thirdCleanup = rovingFocus({ initialItem: 2 })(container);
        expect(indexed.tabIndex).toBe(0);
        thirdCleanup?.();
    });

    test("supports vertical arrows, Home, End, wrapping, and no-loop boundaries", () => {
        const first = createItem("First");
        const second = createItem("Second");
        const third = createItem("Third");
        container.append(first, second, third);
        const cleanup = rovingFocus()(container);

        first.focus();
        expect(press(first, "ArrowDown").defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(second);
        press(second, "End");
        expect(document.activeElement).toBe(third);
        press(third, "ArrowDown");
        expect(document.activeElement).toBe(first);
        press(first, "Home");
        expect(document.activeElement).toBe(first);
        cleanup?.();

        const noLoopCleanup = rovingFocus({ loop: false })(container);
        third.focus();
        const boundaryEvent = press(third, "ArrowDown");
        expect(boundaryEvent.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(third);
        noLoopCleanup?.();
    });

    test("maps horizontal arrows for LTR, RTL, and automatic CSS direction", () => {
        const first = createItem("First");
        const second = createItem("Second");
        container.append(first, second);

        const ltrCleanup = rovingFocus({ orientation: "horizontal", direction: "ltr" })(container);
        first.focus();
        press(first, "ArrowRight");
        expect(document.activeElement).toBe(second);
        ltrCleanup?.();

        const rtlCleanup = rovingFocus({ orientation: "horizontal", direction: "rtl" })(container);
        first.focus();
        press(first, "ArrowLeft");
        expect(document.activeElement).toBe(second);
        rtlCleanup?.();

        container.style.direction = "rtl";
        const autoCleanup = rovingFocus({ orientation: "both" })(container);
        second.focus();
        press(second, "ArrowRight");
        expect(document.activeElement).toBe(first);
        autoCleanup?.();
    });

    test("ignores arrows outside the configured orientation", () => {
        const first = createItem("First");
        const second = createItem("Second");
        container.append(first, second);
        const cleanup = rovingFocus({ orientation: "vertical" })(container);
        first.focus();

        const event = press(first, "ArrowRight");
        expect(event.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(first);
        cleanup?.();
    });

    test("skips disabled, aria-disabled, inert, and hidden items", () => {
        const first = createItem("First");
        const disabled = createItem("Disabled");
        const ariaDisabled = createItem("Aria disabled");
        const inert = createItem("Inert");
        const hidden = createItem("Hidden");
        const last = createItem("Last");
        disabled.disabled = true;
        ariaDisabled.setAttribute("aria-disabled", "true");
        inert.toggleAttribute("inert", true);
        hidden.hidden = true;
        container.append(first, disabled, ariaDisabled, inert, hidden, last);
        const cleanup = rovingFocus()(container);

        first.focus();
        press(first, "ArrowDown");
        expect(document.activeElement).toBe(last);
        expect(disabled.tabIndex).toBe(-1);
        expect(ariaDisabled.tabIndex).toBe(-1);
        expect(inert.tabIndex).toBe(-1);
        expect(hidden.tabIndex).toBe(-1);
        cleanup?.();
    });

    test("synchronizes active state from focus and click without activating items", () => {
        const first = createItem("First");
        const second = createItem("Second");
        const child = document.createElement("span");
        second.append(child);
        container.append(first, second);
        const onActiveChange = vi.fn<(detail: RovingFocusActiveChangeDetail) => void>();
        const clickSpy = vi.fn();
        second.addEventListener("click", clickSpy);
        const cleanup = rovingFocus({ onActiveChange })(container);

        second.focus();
        expect(second.tabIndex).toBe(0);
        expect(onActiveChange).toHaveBeenLastCalledWith({
            item: second,
            index: 1,
            reason: "focus",
        });

        first.click();
        expect(first.tabIndex).toBe(0);
        expect(document.activeElement).toBe(second);
        expect(onActiveChange).toHaveBeenLastCalledWith({
            item: first,
            index: 0,
            reason: "pointer",
        });
        expect(clickSpy).not.toHaveBeenCalled();
        cleanup?.();
    });

    test("batches dynamic additions, removals, and disabled-state mutations", async () => {
        const first = createItem("First");
        first.setAttribute("tabindex", "4");
        container.append(first);
        const onActiveChange = vi.fn<(detail: RovingFocusActiveChangeDetail) => void>();
        const cleanup = rovingFocus({ onActiveChange })(container);
        const second = createItem("Second");
        container.append(second);
        await flushMutations();
        expect(first.tabIndex).toBe(0);
        expect(second.tabIndex).toBe(-1);

        first.remove();
        await flushMutations();
        expect(first.getAttribute("tabindex")).toBe("4");
        expect(second.tabIndex).toBe(0);
        expect(onActiveChange).toHaveBeenLastCalledWith({
            item: second,
            index: 0,
            reason: "mutation",
        });

        second.setAttribute("aria-disabled", "true");
        await flushMutations();
        expect(second.tabIndex).toBe(-1);
        cleanup?.();
    });

    test("supports buffered typeahead, repeated-character cycling, custom text, and timeout reset", () => {
        vi.useFakeTimers();
        vi.setSystemTime(1000);
        const apple = createItem("Apple");
        const apricot = createItem("Apricot");
        const banana = createItem("Not searchable");
        banana.dataset.label = "Banana";
        container.append(apple, apricot, banana);
        const cleanup = rovingFocus({
            typeahead: {
                timeout: 300,
                getText: (item) => item.dataset.label ?? item.textContent ?? "",
            },
        })(container);

        apple.focus();
        expect(press(apple, "a").defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(apricot);
        expect(press(apricot, "p").defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(apricot);

        vi.advanceTimersByTime(301);
        press(apricot, "a");
        expect(document.activeElement).toBe(apple);
        press(apple, "a");
        expect(document.activeElement).toBe(apricot);

        vi.advanceTimersByTime(301);
        press(apricot, "b");
        expect(document.activeElement).toBe(banana);
        cleanup?.();
    });

    test("restores every original tabindex and container marker during cleanup", () => {
        const first = createItem("First");
        const second = createItem("Second");
        const third = createItem("Third");
        first.setAttribute("tabindex", "3");
        third.setAttribute("tabindex", "-1");
        container.dataset.rovingFocusContainer = "existing";
        container.append(first, second, third);
        const cleanup = rovingFocus()(container);

        expect(first.tabIndex).toBe(0);
        cleanup?.();
        expect(first.getAttribute("tabindex")).toBe("3");
        expect(second.hasAttribute("tabindex")).toBe(false);
        expect(third.getAttribute("tabindex")).toBe("-1");
        expect(container.dataset.rovingFocusContainer).toBe("existing");
    });

    test("does not adopt items owned by a nested roving container", async () => {
        const outerFirst = createItem("Outer first");
        const nested = document.createElement("div");
        const innerFirst = createItem("Inner first");
        const innerSecond = createItem("Inner second");
        const outerLast = createItem("Outer last");
        nested.append(innerFirst, innerSecond);
        container.append(outerFirst, nested, outerLast);

        const outerCleanup = rovingFocus()(container);
        const innerCleanup = rovingFocus()(nested);
        await flushMutations();
        outerFirst.focus();
        press(outerFirst, "ArrowDown");
        expect(document.activeElement).toBe(outerLast);

        innerFirst.focus();
        press(innerFirst, "ArrowDown");
        expect(document.activeElement).toBe(innerSecond);
        innerCleanup?.();
        outerCleanup?.();
        expect(innerFirst.hasAttribute("tabindex")).toBe(false);
        expect(innerSecond.hasAttribute("tabindex")).toBe(false);
    });

    test("handles an empty container and later adopts its first valid item", async () => {
        const cleanup = rovingFocus()(container);
        expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(0);

        const item = createItem("Late item");
        container.append(item);
        await flushMutations();
        expect(item.tabIndex).toBe(0);
        cleanup?.();
        expect(item.hasAttribute("tabindex")).toBe(false);
    });
});
