import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import TextInputIconFixture from "./__fixtures__/TextInputIconFixture.svelte";
import TextInput from "./TextInput.svelte";

describe("TextInput", () => {
    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[] = [];

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [];
    });

    afterEach(() => {
        for (const instance of mounted) {
            unmount(instance);
        }
        mounted = [];
        app.remove();
    });

    test("renders soft variant by default with base-soft background and no borders", () => {
        const instance = mount(TextInput, {
            target: app,
            props: {
                placeholder: "Search...",
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector("[role='group']");
        const input = app.querySelector("input");

        expect(container).not.toBeNull();
        expect(input).not.toBeNull();
        expect(container?.className).toContain("bg-base-soft-1");
        expect(container?.className).toContain("rounded-2xl");
        expect(container?.className).toContain("squircle-smooth");
        expect(container?.className).not.toContain("border");
        expect(input?.placeholder).toBe("Search...");
    });

    test("renders elevated variant with shadow and white/base-900 background", () => {
        const instance = mount(TextInput, {
            target: app,
            props: {
                variant: "elevated",
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector("[role='group']");
        expect(container?.className).toContain("bg-white");
        expect(container?.className).toContain("shadow-sm");
    });

    test("handles invalid state with danger styling and aria-invalid", () => {
        const instance = mount(TextInput, {
            target: app,
            props: {
                invalid: true,
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector("[role='group']");
        const input = app.querySelector("input");

        expect(container?.className).toContain("bg-danger-soft-1");
        expect(input?.getAttribute("aria-invalid")).toBe("true");
    });

    test("handles disabled state with disableInteraction", () => {
        const instance = mount(TextInput, {
            target: app,
            props: {
                disabled: true,
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector<HTMLElement>("[role='group']");
        const input = app.querySelector("input");

        expect(input?.disabled).toBe(true);
        expect(container?.getAttribute("aria-disabled")).toBe("true");
        expect(container?.style.cursor).toBe("not-allowed");
    });

    test("renders external label when provided", () => {
        const instance = mount(TextInput, {
            target: app,
            props: {
                label: "Username",
            },
        });
        mounted.push(instance);
        flushSync();

        const label = app.querySelector("label");
        const input = app.querySelector("input");

        expect(label).not.toBeNull();
        expect(label?.textContent?.trim()).toBe("Username");
        expect(label?.getAttribute("for")).toBe(input?.id);
    });

    test("renders iconLeft and iconRight SVGs with correct dimensions and stroke classes", () => {
        const instance = mount(TextInputIconFixture, {
            target: app,
        });
        mounted.push(instance);
        flushSync();

        const leftIcon = app.querySelector("[data-testid='left-icon']");
        const rightIcon = app.querySelector("[data-testid='right-icon']");

        expect(leftIcon).not.toBeNull();
        expect(rightIcon).not.toBeNull();
        expect(leftIcon?.tagName.toLowerCase()).toBe("svg");
        expect(rightIcon?.tagName.toLowerCase()).toBe("svg");

        const container = app.querySelector("[role='group']");
        expect(container?.className).toContain("[&_svg]:size-16px");
        expect(container?.className).toContain("[&_svg]:stroke-[2.25px]");

        expect(leftIcon?.parentElement?.className).toContain("size-16px");
        expect(leftIcon?.parentElement?.className).toContain("shrink-0");
        expect(leftIcon?.parentElement?.className).toContain("flex-center");
    });

    test("positions cursor at beginning when clicking left of input and at end when clicking right", () => {
        const instance = mount(TextInput, {
            target: app,
            props: {
                value: "Hello World",
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector<HTMLElement>("[role='group']");
        const input = app.querySelector<HTMLInputElement>("input");
        expect(container).not.toBeNull();
        expect(input).not.toBeNull();

        if (container && input) {
            // Mock getBoundingClientRect for input
            input.getBoundingClientRect = () =>
                ({
                    x: 50,
                    y: 20,
                    left: 50,
                    top: 20,
                    right: 250,
                    bottom: 60,
                    width: 200,
                    height: 40,
                }) as DOMRect;

            // 1. Click to the left of the input (e.g. clientX = 30 < left = 50)
            const leftClick = new MouseEvent("click", {
                bubbles: true,
                clientX: 30,
                clientY: 40,
            });
            container.dispatchEvent(leftClick);
            expect(input.selectionStart).toBe(0);
            expect(input.selectionEnd).toBe(0);

            // 2. Click to the right of the input (e.g. clientX = 270 > right = 250)
            const rightClick = new MouseEvent("click", {
                bubbles: true,
                clientX: 270,
                clientY: 40,
            });
            container.dispatchEvent(rightClick);
            expect(input.selectionStart).toBe(11);
            expect(input.selectionEnd).toBe(11);
        }
    });

    test("preserves active text selection on container click", () => {
        const instance = mount(TextInput, {
            target: app,
            props: {
                value: "Selection Test",
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector<HTMLElement>("[role='group']");
        const input = app.querySelector<HTMLInputElement>("input");
        expect(container).not.toBeNull();
        expect(input).not.toBeNull();

        if (container && input) {
            input.focus();
            input.setSelectionRange(2, 7);

            // Click event triggered while text is selected
            const clickEvent = new MouseEvent("click", {
                bubbles: true,
                clientX: 20,
                clientY: 20,
            });
            container.dispatchEvent(clickEvent);

            // Selection range should be preserved
            expect(input.selectionStart).toBe(2);
            expect(input.selectionEnd).toBe(7);
        }
    });
});

