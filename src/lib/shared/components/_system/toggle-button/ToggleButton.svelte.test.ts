import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import ToggleButton from "./ToggleButton.svelte";

describe("ToggleButton", () => {
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

    function render(props: Record<string, unknown> = {}): HTMLButtonElement {
        const component = mount(ToggleButton, { target: app, props });
        mounted.push(component);
        flushSync();
        return app.querySelectorAll<HTMLButtonElement>("button").item(mounted.length - 1);
    }

    test("renders an unpressed soft button by default", () => {
        const button = render();

        expect(button.type).toBe("button");
        expect(button.getAttribute("aria-pressed")).toBe("false");
        expect(button.dataset.slot).toBe("toggle-button");
        expect(button.dataset.state).toBe("off");
        expect(button.classList).toContain("bg-base-soft-1");
        expect(button.classList).toContain("squircle-smooth");
    });

    test("toggles its bindable pressed state on click", () => {
        const button = render();

        button.click();
        flushSync();
        expect(button.getAttribute("aria-pressed")).toBe("true");
        expect(button.dataset.state).toBe("on");
        expect(button.classList).toContain("bg-accent-soft-1");

        button.click();
        flushSync();
        expect(button.getAttribute("aria-pressed")).toBe("false");
        expect(button.dataset.state).toBe("off");
    });

    test("calls consumer onclick and respects preventDefault", () => {
        const onclick = vi.fn((event: MouseEvent) => event.preventDefault());
        const button = render({ onclick });

        button.click();
        flushSync();

        expect(onclick).toHaveBeenCalledOnce();
        expect(button.getAttribute("aria-pressed")).toBe("false");
    });

    test("blocks disabled interaction through disableInteraction", () => {
        const button = render({ disabled: true });

        button.click();
        flushSync();

        expect(button.getAttribute("aria-disabled")).toBe("true");
        expect(button.tabIndex).toBe(-1);
        expect(button.getAttribute("aria-pressed")).toBe("false");
    });

    test("matches button sizing, layout, and icon-only geometry", () => {
        const fullWidth = render({ fullWidth: true, align: "start", size: "lg" });
        const iconOnly = render({ iconOnly: true, size: "sm", variant: "ghost" });

        expect(fullWidth.classList).toContain("h-40px");
        expect(fullWidth.classList).toContain("w-full!");
        expect(fullWidth.classList).toContain("justify-start");
        expect(iconOnly.classList).toContain("h-32px");
        expect(iconOnly.classList).toContain("squircle-soft");
        expect(iconOnly.className).toContain("[&_svg]:size-16px!");
        expect(iconOnly.classList).toContain("bg-transparent");
    });

    test("exposes the button element through its bindable element prop", () => {
        let buttonElement: HTMLButtonElement | null | undefined;
        const component = mount(ToggleButton, {
            target: app,
            props: {
                get element() {
                    return buttonElement;
                },
                set element(value) {
                    buttonElement = value;
                },
            },
        });
        mounted.push(component);
        flushSync();

        expect(buttonElement).toBeInstanceOf(HTMLButtonElement);
    });
});
