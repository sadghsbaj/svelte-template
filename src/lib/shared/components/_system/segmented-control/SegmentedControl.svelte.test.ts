import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import SegmentedControl from "./SegmentedControl.svelte";
import SegmentedControlFixture from "./SegmentedControlFixture.svelte";

function press(item: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    item.dispatchEvent(event);
    flushSync();
    return event;
}

describe("SegmentedControl", () => {
    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[] = [];

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [];
        vi.spyOn(HTMLElement.prototype, "scrollIntoView").mockImplementation(() => {});
        vi.spyOn(HTMLElement.prototype, "scrollTo").mockImplementation(() => {});
    });

    afterEach(async () => {
        for (const component of mounted.toReversed()) {
            await unmount(component);
        }
        vi.restoreAllMocks();
        mounted = [];
        app.remove();
    });

    function render(props: Record<string, unknown> = {}): {
        control: HTMLDivElement;
        group: HTMLDivElement;
        items: NodeListOf<HTMLButtonElement>;
        output: HTMLOutputElement;
    } {
        const component = mount(SegmentedControlFixture, { target: app, props });
        mounted.push(component);
        flushSync();

        const control = app.querySelector<HTMLDivElement>('[data-slot="segmented-control"]');
        const group = app.querySelector<HTMLDivElement>('[data-slot="segmented-control-track"]');
        const output = app.querySelector<HTMLOutputElement>("[data-segmented-value]");
        if (!control || !group || !output)
            throw new Error("SegmentedControl fixture did not render");

        return {
            control,
            group,
            items: group.querySelectorAll<HTMLButtonElement>(
                '[data-slot="segmented-control-item"]'
            ),
            output,
        };
    }

    test("renders an accessible horizontal radio group with the selected item as tab stop", () => {
        const { control, group, items } = render();

        expect(group.getAttribute("role")).toBe("radiogroup");
        expect(group.getAttribute("aria-label")).toBe("View density");
        expect(group.getAttribute("aria-orientation")).toBe("horizontal");
        expect(control.dataset.layout).toBe("equal");
        expect(items[1]?.getAttribute("aria-checked")).toBe("true");
        expect([...items].map((item) => item.tabIndex)).toEqual([-1, 0, -1]);
    });

    test("selects one item and does not clear the active selection", () => {
        const { items, output } = render();

        items[0]?.click();
        flushSync();
        expect(output.value).toBe("first");
        expect(items[0]?.getAttribute("aria-checked")).toBe("true");

        items[0]?.click();
        flushSync();
        expect(output.value).toBe("first");
        expect(items[0]?.getAttribute("aria-checked")).toBe("true");
    });

    test("moves focus and selection together with arrow keys", () => {
        const { control, items, output } = render();
        const second = items[1];
        const third = items[2];
        if (!second || !third) throw new Error("Expected segmented control items");
        const viewport = control.querySelector<HTMLElement>(
            '[data-slot="segmented-control-viewport"]'
        );
        if (!viewport) throw new Error("Expected segmented control viewport");
        Object.defineProperties(viewport, {
            clientWidth: { configurable: true, value: 200 },
            scrollWidth: { configurable: true, value: 560 },
        });

        second.focus();
        const event = press(second, "ArrowRight");

        expect(event.defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(third);
        expect(output.value).toBe("third");
        expect(third.getAttribute("aria-checked")).toBe("true");
        expect(viewport.scrollTo).toHaveBeenCalledWith({ left: 360 });
        expect(third.scrollIntoView).not.toHaveBeenCalled();
    });

    test("scrolls exactly to the start when keyboard navigation reaches the first item", () => {
        const { control, items } = render({ initialValue: "second" });
        const first = items[0];
        const second = items[1];
        if (!first || !second) throw new Error("Expected segmented control items");
        const viewport = control.querySelector<HTMLElement>(
            '[data-slot="segmented-control-viewport"]'
        );
        if (!viewport) throw new Error("Expected segmented control viewport");

        second.focus();
        press(second, "ArrowLeft");

        expect(document.activeElement).toBe(first);
        expect(viewport.scrollTo).toHaveBeenCalledWith({ left: 0 });
        expect(first.scrollIntoView).not.toHaveBeenCalled();
    });

    test("skips disabled items during keyboard navigation", () => {
        const { items, output } = render({ initialValue: "first", disabledMiddle: true });
        const first = items[0];
        const third = items[2];
        if (!first || !third) throw new Error("Expected segmented control items");

        first.focus();
        press(first, "ArrowRight");

        expect(document.activeElement).toBe(third);
        expect(output.value).toBe("third");
        expect(items[1]?.getAttribute("aria-disabled")).toBe("true");
    });

    test("respects prevented item clicks", () => {
        const { items, output } = render({ preventLastSelection: true });

        items[2]?.click();
        flushSync();

        expect(output.value).toBe("second");
        expect(items[2]?.getAttribute("aria-checked")).toBe("false");
    });

    test("disables the complete control through the shared interaction attachment", () => {
        const { control, items, output } = render({ disabled: true });

        items[0]?.click();
        flushSync();

        expect(control.getAttribute("aria-disabled")).toBe("true");
        expect(output.value).toBe("second");
    });

    test("supports intrinsic auto layout and horizontal scroll fading", () => {
        const { control } = render({ layout: "auto" });
        const viewport = control.querySelector<HTMLElement>(
            '[data-slot="segmented-control-viewport"]'
        );
        if (!viewport) throw new Error("Expected segmented control viewport");

        expect(control.dataset.layout).toBe("auto");
        expect(viewport.style.maskImage).toContain("linear-gradient");
        expect(getComputedStyle(viewport).overflowX).toBe("auto");
    });

    test("hides separators adjacent to the selected item", () => {
        const { items } = render({ separators: true });
        const firstSeparator = getComputedStyle(items[0] as HTMLButtonElement, "::before");
        const activeSeparator = getComputedStyle(items[1] as HTMLButtonElement, "::before");
        const trailingSeparator = getComputedStyle(items[2] as HTMLButtonElement, "::before");

        expect(firstSeparator.content).toBe("none");
        expect(activeSeparator.opacity).toBe("0");
        expect(trailingSeparator.opacity).toBe("0");
    });

    test("exposes the root element through its bindable element prop", () => {
        let controlElement: HTMLDivElement | null | undefined;
        const component = mount(SegmentedControl, {
            target: app,
            props: {
                value: "",
                get element() {
                    return controlElement;
                },
                set element(value) {
                    controlElement = value;
                },
            },
        });
        mounted.push(component);
        flushSync();

        expect(controlElement).toBeInstanceOf(HTMLDivElement);
    });
});
