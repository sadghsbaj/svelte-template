import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import ToggleButtonGroup from "./ToggleButtonGroup.svelte";
import ToggleButtonGroupFixture from "./ToggleButtonGroupFixture.svelte";

function press(item: HTMLElement, key: string): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    item.dispatchEvent(event);
    return event;
}

describe("ToggleButtonGroup", () => {
    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[] = [];

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [];
    });

    afterEach(async () => {
        for (const component of mounted.toReversed()) {
            await unmount(component);
        }
        mounted = [];
        app.remove();
    });

    function render(props: Record<string, unknown> = {}): {
        group: HTMLDivElement;
        buttons: NodeListOf<HTMLButtonElement>;
        output: HTMLOutputElement;
    } {
        const component = mount(ToggleButtonGroupFixture, { target: app, props });
        mounted.push(component);
        flushSync();

        const group = app.querySelector<HTMLDivElement>('[data-slot="toggle-button-group"]');
        const output = app.querySelector<HTMLOutputElement>("[data-group-value]");
        if (!group || !output) throw new Error("ToggleButtonGroup fixture did not render");
        return {
            group,
            buttons: group.querySelectorAll<HTMLButtonElement>('[data-slot="toggle-button"]'),
            output,
        };
    }

    test("renders a horizontal single-select group by default", () => {
        const { group, buttons } = render();

        expect(group.getAttribute("role")).toBe("group");
        expect(group.getAttribute("aria-label")).toBe("Single choice");
        expect(group.dataset.orientation).toBe("horizontal");
        expect(group.dataset.rovingFocus).toBe("");
        expect(buttons[1]?.getAttribute("aria-pressed")).toBe("true");
        expect(buttons[1]?.tabIndex).toBe(0);
        expect(buttons[0]?.tabIndex).toBe(-1);
        expect(buttons[2]?.tabIndex).toBe(-1);
    });

    test("allows at most one pressed value and permits an empty single selection", () => {
        const { buttons, output } = render();

        buttons[1]?.click();
        flushSync();
        expect(output.value).toBe("");
        expect(buttons[1]?.getAttribute("aria-pressed")).toBe("false");

        buttons[0]?.click();
        flushSync();
        expect(output.value).toBe("first");
        expect(buttons[0]?.getAttribute("aria-pressed")).toBe("true");
        expect(buttons[1]?.getAttribute("aria-pressed")).toBe("false");
    });

    test("toggles independent values in multiple mode", () => {
        const { buttons, output } = render({ type: "multiple" });

        expect(output.value).toBe("first,third");
        expect(buttons[0]?.getAttribute("aria-pressed")).toBe("true");
        expect(buttons[2]?.getAttribute("aria-pressed")).toBe("true");

        buttons[1]?.click();
        flushSync();
        expect(output.value).toBe("first,third,second");

        buttons[0]?.click();
        flushSync();
        expect(output.value).toBe("third,second");
        expect(buttons[0]?.getAttribute("aria-pressed")).toBe("false");
    });

    test("moves only focus with arrow keys and remembers the active item", () => {
        const { buttons, output } = render();
        const second = buttons[1];
        const third = buttons[2];
        if (!second || !third) throw new Error("Expected toggle buttons");

        second.focus();
        expect(press(second, "ArrowRight").defaultPrevented).toBe(true);
        expect(document.activeElement).toBe(third);
        expect(output.value).toBe("second");
        expect(third.getAttribute("aria-pressed")).toBe("false");

        third.blur();
        expect(third.tabIndex).toBe(0);
        expect(second.tabIndex).toBe(-1);
    });

    test("uses vertical navigation and skips disabled items", () => {
        const { buttons } = render({
            orientation: "vertical",
            disabledMiddle: true,
            singleValue: "first",
        });
        const first = buttons[0];
        const third = buttons[2];
        if (!first || !third) throw new Error("Expected toggle buttons");

        first.focus();
        press(first, "ArrowDown");

        expect(document.activeElement).toBe(third);
        expect(buttons[1]?.tabIndex).toBe(-1);
    });

    test("keeps every button in the native tab order when roving focus is disabled", () => {
        const { group, buttons } = render({ rovingFocus: false });
        const first = buttons[0];
        if (!first) throw new Error("Expected a toggle button");

        expect(group.dataset.rovingFocus).toBeUndefined();
        expect([...buttons].map((button) => button.tabIndex)).toEqual([0, 0, 0]);

        first.focus();
        expect(press(first, "ArrowRight").defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(first);
    });

    test("joins geometry, renders separators, and distributes full-width items", () => {
        const { group, buttons } = render({ separators: true, fullWidth: true });
        const first = buttons[0];
        const middle = buttons[1];
        const last = buttons[2];
        if (!first || !middle || !last) throw new Error("Expected toggle buttons");
        const firstStyle = getComputedStyle(first);
        const middleStyle = getComputedStyle(middle);
        const lastStyle = getComputedStyle(last);
        const separatorStyle = getComputedStyle(middle, "::before");

        expect(group.dataset.fullWidth).toBe("");
        expect(group.dataset.separators).toBe("");
        expect(firstStyle.borderTopLeftRadius).toBe("9999px");
        expect(firstStyle.borderTopRightRadius).toBe("0px");
        expect(middleStyle.borderRadius).toBe("0px");
        expect(lastStyle.borderTopRightRadius).toBe("9999px");
        expect(middleStyle.transform).toBe("none");
        expect(middleStyle.width).toBe(firstStyle.width);
        expect(lastStyle.width).toBe(firstStyle.width);
        expect(separatorStyle.display).not.toBe("none");
        expect(separatorStyle.width).toBe("1px");
    });

    test("exposes the group element through its bindable element prop", () => {
        let groupElement: HTMLDivElement | null | undefined;
        const component = mount(ToggleButtonGroup, {
            target: app,
            props: {
                type: "single",
                get element() {
                    return groupElement;
                },
                set element(value) {
                    groupElement = value;
                },
            },
        });
        mounted.push(component);
        flushSync();

        expect(groupElement).toBeInstanceOf(HTMLDivElement);
    });
});
