import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import TextareaFixture from "./__fixtures__/TextareaFixture.svelte";
import Textarea from "./Textarea.svelte";

describe("Textarea", () => {
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
        const instance = mount(Textarea, {
            target: app,
            props: {
                placeholder: "Type something...",
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector("[role='group']");
        const textarea = app.querySelector("textarea");

        expect(container).not.toBeNull();
        expect(textarea).not.toBeNull();
        expect(container?.className).toContain("bg-base-soft-1");
        expect(container?.className).toContain("rounded-2xl");
        expect(container?.className).toContain("squircle-smooth");
        expect(container?.className).not.toContain("border");
        expect(textarea?.placeholder).toBe("Type something...");
    });

    test("renders elevated variant with shadow and white background", () => {
        const instance = mount(Textarea, {
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
        const instance = mount(Textarea, {
            target: app,
            props: {
                invalid: true,
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector("[role='group']");
        const textarea = app.querySelector("textarea");

        expect(container?.className).toContain("bg-danger-soft-1");
        expect(textarea?.getAttribute("aria-invalid")).toBe("true");
    });

    test("handles disabled state with disableInteraction", () => {
        const instance = mount(Textarea, {
            target: app,
            props: {
                disabled: true,
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector<HTMLElement>("[role='group']");
        const textarea = app.querySelector("textarea");

        expect(textarea?.disabled).toBe(true);
        expect(container?.getAttribute("aria-disabled")).toBe("true");
        expect(container?.style.cursor).toBe("not-allowed");
    });

    test("renders external label when provided", () => {
        const instance = mount(Textarea, {
            target: app,
            props: {
                label: "Description",
            },
        });
        mounted.push(instance);
        flushSync();

        const label = app.querySelector("label");
        const textarea = app.querySelector("textarea");

        expect(label).not.toBeNull();
        expect(label?.textContent?.trim()).toBe("Description");
        expect(label?.getAttribute("for")).toBe(textarea?.id);
    });

    test("applies autoResize attachment when enabled", () => {
        const instance = mount(Textarea, {
            target: app,
            props: {
                autoResize: true,
            },
        });
        mounted.push(instance);
        flushSync();

        const textarea = app.querySelector("textarea");
        expect(textarea).not.toBeNull();
        if (textarea) {
            expect(Object.hasOwn(textarea.dataset, "autoResized")).toBe(true);
        }
    });

    test("renders built-in character count when showCount or maxlength is active", () => {
        const instance = mount(Textarea, {
            target: app,
            props: {
                value: "Hello",
                maxlength: 100,
                showCount: true,
            },
        });
        mounted.push(instance);
        flushSync();

        const counter = app.querySelector(".tabular-nums");
        expect(counter).not.toBeNull();
        expect(counter?.textContent?.trim()).toBe("5 / 100");
    });

    test("renders iconLeft, iconRight, and custom footer snippets", () => {
        const instance = mount(TextareaFixture, {
            target: app,
        });
        mounted.push(instance);
        flushSync();

        const leftIcon = app.querySelector("[data-testid='left-icon']");
        const rightIcon = app.querySelector("[data-testid='right-icon']");
        const customFooter = app.querySelector("[data-testid='custom-footer']");

        expect(leftIcon).not.toBeNull();
        expect(rightIcon).not.toBeNull();
        expect(customFooter).not.toBeNull();
    });

    test("positions cursor at beginning when clicking above textarea and at end when clicking below", () => {
        const instance = mount(Textarea, {
            target: app,
            props: {
                value: "Line 1\nLine 2",
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector<HTMLElement>("[role='group']");
        const textarea = app.querySelector<HTMLTextAreaElement>("textarea");
        expect(container).not.toBeNull();
        expect(textarea).not.toBeNull();

        if (container && textarea) {
            textarea.getBoundingClientRect = () =>
                ({
                    x: 50,
                    y: 40,
                    left: 50,
                    top: 40,
                    right: 250,
                    bottom: 120,
                    width: 200,
                    height: 80,
                }) as DOMRect;

            // 1. Click above the textarea (clientY = 20 < top = 40)
            const topClick = new MouseEvent("click", {
                bubbles: true,
                clientX: 100,
                clientY: 20,
            });
            container.dispatchEvent(topClick);
            expect(textarea.selectionStart).toBe(0);
            expect(textarea.selectionEnd).toBe(0);

            // 2. Click below the textarea (clientY = 140 > bottom = 120)
            const bottomClick = new MouseEvent("click", {
                bubbles: true,
                clientX: 100,
                clientY: 140,
            });
            container.dispatchEvent(bottomClick);
            expect(textarea.selectionStart).toBe(13); // "Line 1\nLine 2".length
            expect(textarea.selectionEnd).toBe(13);
        }
    });

    test("preserves active text selection on container click", () => {
        const instance = mount(Textarea, {
            target: app,
            props: {
                value: "Multiline\nSelection\nTest",
            },
        });
        mounted.push(instance);
        flushSync();

        const container = app.querySelector<HTMLElement>("[role='group']");
        const textarea = app.querySelector<HTMLTextAreaElement>("textarea");
        expect(container).not.toBeNull();
        expect(textarea).not.toBeNull();

        if (container && textarea) {
            textarea.focus();
            textarea.setSelectionRange(2, 8);

            const clickEvent = new MouseEvent("click", {
                bubbles: true,
                clientX: 10,
                clientY: 10,
            });
            container.dispatchEvent(clickEvent);

            expect(textarea.selectionStart).toBe(2);
            expect(textarea.selectionEnd).toBe(8);
        }
    });
});
