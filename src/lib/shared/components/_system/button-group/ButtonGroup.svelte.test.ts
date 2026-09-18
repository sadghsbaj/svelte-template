import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import ButtonGroup from "./ButtonGroup.svelte";
import ButtonGroupFixture from "./ButtonGroupFixture.svelte";

describe("ButtonGroup", () => {
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

    function render(props: Record<string, unknown> = {}): HTMLDivElement {
        const component = mount(ButtonGroupFixture, { target: app, props });
        mounted.push(component);
        flushSync();
        const group = app.querySelector('[data-slot="button-group"]');
        if (!(group instanceof HTMLDivElement)) {
            throw new TypeError("ButtonGroup did not render a div element");
        }
        return group;
    }

    test("renders a horizontal group by default", () => {
        const group = render({ "aria-label": "History", class: "custom-group" });

        expect(group.getAttribute("role")).toBe("group");
        expect(group.getAttribute("aria-label")).toBe("History");
        expect(group.dataset.orientation).toBe("horizontal");
        expect(group.dataset.separators).toBeUndefined();
        expect(group.classList).toContain("flex-row");
        expect(group.classList).toContain("custom-group");
    });

    test("exposes the group element via its bindable element prop", () => {
        let groupElement: HTMLDivElement | undefined;
        const component = mount(ButtonGroup, {
            target: app,
            props: {
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

    test("joins horizontal button geometry and bordered neighbors", () => {
        const group = render();
        const buttons = group.querySelectorAll<HTMLButtonElement>('[data-slot="button"]');
        const firstStyle = getComputedStyle(buttons[0]);
        const middleStyle = getComputedStyle(buttons[1]);
        const lastStyle = getComputedStyle(buttons[2]);

        expect(firstStyle.borderTopLeftRadius).toBe("9999px");
        expect(firstStyle.borderTopRightRadius).toBe("0px");
        expect(middleStyle.borderRadius).toBe("0px");
        expect(lastStyle.borderTopLeftRadius).toBe("0px");
        expect(lastStyle.borderTopRightRadius).toBe("9999px");
        expect(firstStyle.borderInlineStartWidth).toBe("2px");
        expect(firstStyle.borderInlineEndWidth).toBe("0px");
        expect(middleStyle.borderInlineStartWidth).toBe("0px");
        expect(middleStyle.borderInlineEndWidth).toBe("0px");
        expect(lastStyle.borderInlineStartWidth).toBe("0px");
        expect(lastStyle.borderInlineEndWidth).toBe("2px");
        expect(middleStyle.transform).toBe("none");
        expect(middleStyle.willChange).toBe("auto");
        expect(getComputedStyle(group).overflow).toBe("visible");
    });

    test("renders optional separators centered between borderless buttons", () => {
        const group = render({ separators: true, variant: "soft" });
        const buttons = group.querySelectorAll<HTMLButtonElement>('[data-slot="button"]');
        const middleStyle = getComputedStyle(buttons[1]);
        const separatorStyle = getComputedStyle(buttons[1], "::before");

        expect(group.dataset.separators).toBe("");
        expect(middleStyle.marginInlineStart).toBe("0px");
        expect(separatorStyle.display).not.toBe("none");
        expect(separatorStyle.width).toBe("1px");
        expect(Number(separatorStyle.height.replace("px", ""))).toBeLessThan(
            Number(middleStyle.height.replace("px", ""))
        );
    });

    test("distributes horizontal buttons equally with fullWidth", () => {
        const group = render({ fullWidth: true, variant: "soft" });
        const buttons = group.querySelectorAll<HTMLButtonElement>('[data-slot="button"]');
        const widths = [...buttons].map((button) => getComputedStyle(button).width);
        const middleStyle = getComputedStyle(buttons[1]);

        expect(group.dataset.fullWidth).toBe("");
        expect(group.classList).toContain("w-full!");
        expect(new Set(widths).size).toBe(1);
        expect(middleStyle.flexGrow).toBe("1");
        expect(middleStyle.flexBasis).toBe("0%");
        expect(middleStyle.minWidth).toBe("0px");
    });

    test("renders optional separators instead of internal outline borders", () => {
        const group = render({ separators: true });
        const buttons = group.querySelectorAll<HTMLButtonElement>('[data-slot="button"]');
        const separatorStyle = getComputedStyle(buttons[1], "::before");

        expect(getComputedStyle(buttons[0]).borderInlineEndWidth).toBe("0px");
        expect(getComputedStyle(buttons[1]).borderInlineStartWidth).toBe("0px");
        expect(separatorStyle.display).not.toBe("none");
        expect(separatorStyle.width).toBe("1px");
    });

    test("uses one shared shadow for elevated button groups", () => {
        const group = render({ variant: "elevated" });
        const buttons = group.querySelectorAll<HTMLButtonElement>('[data-slot="button"]');

        expect(getComputedStyle(group).boxShadow).not.toBe("none");
        expect(getComputedStyle(buttons[1]).boxShadow).toBe("none");
    });

    test("joins vertical button geometry and bordered neighbors", () => {
        const group = render({ orientation: "vertical" });
        const buttons = group.querySelectorAll<HTMLButtonElement>('[data-slot="button"]');
        const firstStyle = getComputedStyle(buttons[0]);
        const middleStyle = getComputedStyle(buttons[1]);
        const lastStyle = getComputedStyle(buttons[2]);

        expect(group.dataset.orientation).toBe("vertical");
        expect(group.classList).toContain("flex-col");
        expect(firstStyle.borderTopLeftRadius).toBe("9999px");
        expect(firstStyle.borderBottomLeftRadius).toBe("0px");
        expect(middleStyle.borderRadius).toBe("0px");
        expect(lastStyle.borderTopLeftRadius).toBe("0px");
        expect(lastStyle.borderBottomLeftRadius).toBe("9999px");
        expect(firstStyle.borderBlockStartWidth).toBe("2px");
        expect(firstStyle.borderBlockEndWidth).toBe("0px");
        expect(middleStyle.borderBlockStartWidth).toBe("0px");
        expect(middleStyle.borderBlockEndWidth).toBe("0px");
        expect(lastStyle.borderBlockStartWidth).toBe("0px");
        expect(lastStyle.borderBlockEndWidth).toBe("2px");
        expect(firstStyle.width).toBe(middleStyle.width);
        expect(middleStyle.width).toBe(lastStyle.width);
    });
});
