import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
    pasteOnClick,
    type PasteOnClickEmptyEvent,
    type PasteOnClickErrorEvent,
    type PasteOnClickSuccessEvent,
} from "./paste-on-click.attach";

describe("pasteOnClick Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;
    let clipboardText = "";

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
        vi.useFakeTimers();

        clipboardText = "clipboard-payload";
        Object.defineProperty(navigator, "clipboard", {
            value: {
                readText: vi.fn(async () => clipboardText),
                writeText: vi.fn(async (text: string) => {
                    clipboardText = text;
                }),
            },
            configurable: true,
            writable: true,
        });
    });

    afterEach(() => {
        container.remove();
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe("Shorthand & Target Insertion", () => {
        test("should paste text into target input element shorthand and dispatch input/change events", async () => {
            const input = document.createElement("input");
            input.value = "";
            const btn = document.createElement("button");
            container.append(input, btn);

            const inputSpy = vi.fn();
            const changeSpy = vi.fn();
            input.addEventListener("input", inputSpy);
            input.addEventListener("change", changeSpy);

            const attach = pasteOnClick(input);
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(input.value).toBe("clipboard-payload");
            expect(inputSpy).toHaveBeenCalledTimes(1);
            expect(changeSpy).toHaveBeenCalledTimes(1);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(true);

            cleanup?.();
        });

        test("should dynamically resolve target input from supplier getter function", async () => {
            const input = document.createElement("input");
            input.value = "";
            const btn = document.createElement("button");
            container.append(input, btn);

            let dynamicRef: HTMLInputElement | null = null;
            const attach = pasteOnClick(() => dynamicRef);
            const cleanup = attach(btn);

            // Set ref later (simulating lazy Svelte bind:this inside {#if})
            dynamicRef = input;

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(input.value).toBe("clipboard-payload");
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(true);

            cleanup?.();
        });

        test("should trigger onError and set data-paste-error when supplier getter returns null", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const onError = vi.fn<(event: PasteOnClickErrorEvent) => void>();
            const attach = pasteOnClick({
                target: () => null,
                onError,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onError).toHaveBeenCalledTimes(1);
            expect(Object.hasOwn(btn.dataset, "pasteError")).toBe(true);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(false);

            cleanup?.();
        });

        test("should insert text at cursor position in input by default", async () => {
            const input = document.createElement("input");
            input.value = "Hello World";
            const btn = document.createElement("button");
            container.append(input, btn);

            // Set selection between "Hello " and "World"
            input.setSelectionRange(6, 6);

            clipboardText = "Beautiful ";
            const attach = pasteOnClick({ target: input, mode: "insert" });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(input.value).toBe("Hello Beautiful World");

            cleanup?.();
        });

        test("should replace entire input value when mode is 'replace'", async () => {
            const input = document.createElement("input");
            input.value = "Old Value To Replace";
            const btn = document.createElement("button");
            container.append(input, btn);

            clipboardText = "New Token";
            const attach = pasteOnClick({ target: input, mode: "replace" });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(input.value).toBe("New Token");

            cleanup?.();
        });

        test("should paste text into target textarea element", async () => {
            const textarea = document.createElement("textarea");
            textarea.value = "line 1\n";
            const btn = document.createElement("button");
            container.append(textarea, btn);

            textarea.setSelectionRange(7, 7);

            clipboardText = "line 2";
            const attach = pasteOnClick(textarea);
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(textarea.value).toBe("line 1\nline 2");

            cleanup?.();
        });

        test("should paste into itself when attached directly to an input without target option", async () => {
            const input = document.createElement("input");
            input.value = "prefix-";
            container.append(input);
            input.setSelectionRange(7, 7);

            clipboardText = "12345";
            const attach = pasteOnClick();
            const cleanup = attach(input);

            input.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(input.value).toBe("prefix-12345");
            expect(Object.hasOwn(input.dataset, "pasted")).toBe(true);

            cleanup?.();
        });

        test("should paste text into contenteditable element preserving child markup", async () => {
            const editableDiv = document.createElement("div");
            editableDiv.setAttribute("contenteditable", "true");
            editableDiv.innerHTML = "<b>Bold</b> Text";
            const btn = document.createElement("button");
            container.append(editableDiv, btn);

            clipboardText = " Extra";
            const attach = pasteOnClick(editableDiv);
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            // Bold tag preserved and text appended/inserted
            expect(editableDiv.querySelector("b")).not.toBeNull();
            expect(editableDiv.textContent).toBe("Bold Text Extra");

            cleanup?.();
        });

        test("should pass clipboard text to custom callback function shorthand", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn((_event: PasteOnClickSuccessEvent) => {});
            clipboardText = "json-payload-data";
            const attach = pasteOnClick(callback);
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: "json-payload-data",
                    node: btn,
                })
            );
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(true);

            cleanup?.();
        });
    });

    describe("Feedback Lifecycle & Mutual Exclusivity", () => {
        test("should set data-pasted and clear it after feedbackDuration", async () => {
            const input = document.createElement("input");
            const btn = document.createElement("button");
            container.append(input, btn);

            const attach = pasteOnClick({
                target: input,
                feedbackDuration: 1000,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(true);

            await vi.advanceTimersByTimeAsync(800);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(true);

            await vi.advanceTimersByTimeAsync(200);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(false);

            cleanup?.();
        });

        test("should guarantee mutual exclusivity between feedback states", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn((_event: PasteOnClickSuccessEvent) => {});
            const attach = pasteOnClick(callback);
            const cleanup = attach(btn);

            // 1. First trigger empty state
            clipboardText = "";
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);
            expect(Object.hasOwn(btn.dataset, "pasteEmpty")).toBe(true);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(false);

            // 2. Next trigger successful paste -> pasteEmpty must be deleted
            clipboardText = "valid-token";
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(true);
            expect(Object.hasOwn(btn.dataset, "pasteEmpty")).toBe(false);
            expect(Object.hasOwn(btn.dataset, "pasteError")).toBe(false);

            cleanup?.();
        });

        test("should reset timer on rapid consecutive clicks", async () => {
            const input = document.createElement("input");
            const btn = document.createElement("button");
            container.append(input, btn);

            const attach = pasteOnClick({
                target: input,
                feedbackDuration: 1000,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(600);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(true);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(600);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(true);

            await vi.advanceTimersByTimeAsync(450);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(false);

            cleanup?.();
        });

        test("should trigger onSuccess callback with event details", async () => {
            const input = document.createElement("input");
            const btn = document.createElement("button");
            container.append(input, btn);

            const onSuccess = vi.fn<(event: PasteOnClickSuccessEvent) => void>();
            const attach = pasteOnClick({
                target: input,
                onSuccess,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(onSuccess).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: "clipboard-payload",
                    node: btn,
                    target: input,
                })
            );

            cleanup?.();
        });
    });

    describe("Error & Empty State Handling", () => {
        test("should trigger onError and set data-paste-error when clipboard read returns null (denied/unsupported)", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            // Mock permission rejection / unsupported returning null
            Object.defineProperty(navigator, "clipboard", {
                value: {
                    readText: vi.fn().mockRejectedValue(new Error("Permission denied")),
                },
                configurable: true,
                writable: true,
            });

            const onError = vi.fn<(event: PasteOnClickErrorEvent) => void>();
            const attach = pasteOnClick({
                onError,
                feedbackDuration: 800,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onError).toHaveBeenCalledTimes(1);
            expect(Object.hasOwn(btn.dataset, "pasteError")).toBe(true);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(false);

            await vi.advanceTimersByTimeAsync(800);
            expect(Object.hasOwn(btn.dataset, "pasteError")).toBe(false);

            cleanup?.();
        });

        test("should trigger onEmpty and set data-paste-empty when clipboard is empty string", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            clipboardText = "";
            const onEmpty = vi.fn<(event: PasteOnClickEmptyEvent) => void>();
            const attach = pasteOnClick({
                onEmpty,
                feedbackDuration: 800,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onEmpty).toHaveBeenCalledTimes(1);
            expect(Object.hasOwn(btn.dataset, "pasteEmpty")).toBe(true);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(false);

            await vi.advanceTimersByTimeAsync(800);
            expect(Object.hasOwn(btn.dataset, "pasteEmpty")).toBe(false);

            cleanup?.();
        });

        test("should trigger onError when custom target callback throws", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const onError = vi.fn<(event: PasteOnClickErrorEvent) => void>();
            const attach = pasteOnClick({
                target: () => {
                    throw new Error("Callback failed");
                },
                onError,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onError).toHaveBeenCalledTimes(1);
            expect(Object.hasOwn(btn.dataset, "pasteError")).toBe(true);

            cleanup?.();
        });
    });

    describe("Keyboard Accessibility & Deduplication", () => {
        test("should NOT double-fire on native button keydown (delegates to browser click)", async () => {
            const input = document.createElement("input");
            const btn = document.createElement("button");
            container.append(input, btn);

            const onSuccess = vi.fn();
            const attach = pasteOnClick({
                target: input,
                onSuccess,
            });
            const cleanup = attach(btn);

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(enterEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).not.toHaveBeenCalled();

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).toHaveBeenCalledTimes(1);

            cleanup?.();
        });

        test("should NOT double-fire on wrapper container when inner button receives keydown", async () => {
            const wrapper = document.createElement("div");
            const innerBtn = document.createElement("button");
            const input = document.createElement("input");
            wrapper.append(innerBtn);
            container.append(wrapper, input);

            const onSuccess = vi.fn();
            const attach = pasteOnClick({
                target: input,
                onSuccess,
            });
            const cleanup = attach(wrapper);

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            innerBtn.dispatchEvent(enterEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).not.toHaveBeenCalled();

            innerBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).toHaveBeenCalledTimes(1);

            cleanup?.();
        });

        test("should NOT double-fire on keydown when attached directly to an inner element inside a native button", async () => {
            const btn = document.createElement("button");
            const innerSpan = document.createElement("span");
            const input = document.createElement("input");
            btn.append(innerSpan);
            container.append(btn, input);

            const onSuccess = vi.fn();
            const attach = pasteOnClick({
                target: input,
                onSuccess,
            });
            const cleanup = attach(innerSpan);

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            innerSpan.dispatchEvent(enterEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).not.toHaveBeenCalled();

            innerSpan.dispatchEvent(
                new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })
            );
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).toHaveBeenCalledTimes(1);

            cleanup?.();
        });

        test("should trigger paste on custom focusable element via Enter keydown", async () => {
            const customDiv = document.createElement("div");
            customDiv.setAttribute("tabindex", "0");
            const input = document.createElement("input");
            container.append(customDiv, input);

            const attach = pasteOnClick(input);
            const cleanup = attach(customDiv);

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            customDiv.dispatchEvent(enterEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(input.value).toBe("clipboard-payload");

            cleanup?.();
        });

        test("should trigger paste on custom element via Space keydown and prevent default scroll", async () => {
            const customSpan = document.createElement("span");
            customSpan.setAttribute("role", "button");
            customSpan.setAttribute("tabindex", "0");
            const input = document.createElement("input");
            container.append(customSpan, input);

            const attach = pasteOnClick(input);
            const cleanup = attach(customSpan);

            const spaceEvent = new KeyboardEvent("keydown", {
                key: " ",
                bubbles: true,
                cancelable: true,
            });
            customSpan.dispatchEvent(spaceEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(spaceEvent.defaultPrevented).toBe(true);
            expect(input.value).toBe("clipboard-payload");

            cleanup?.();
        });

        test("should NOT trigger paste on keydown inside contenteditable container", async () => {
            const editableDiv = document.createElement("div");
            editableDiv.setAttribute("contenteditable", "plaintext-only");
            const input = document.createElement("input");
            container.append(editableDiv, input);

            const attach = pasteOnClick(input);
            const cleanup = attach(editableDiv);

            const spaceEvent = new KeyboardEvent("keydown", {
                key: " ",
                bubbles: true,
                cancelable: true,
            });
            editableDiv.dispatchEvent(spaceEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(spaceEvent.defaultPrevented).toBe(false);
            expect(input.value).toBe("");

            cleanup?.();
        });

        test("should ignore keyboard triggers when keyboard: false", async () => {
            const customDiv = document.createElement("div");
            customDiv.setAttribute("tabindex", "0");
            const input = document.createElement("input");
            container.append(customDiv, input);

            const attach = pasteOnClick({
                target: input,
                keyboard: false,
            });
            const cleanup = attach(customDiv);

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            customDiv.dispatchEvent(enterEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(input.value).toBe("");

            cleanup?.();
        });
    });

    describe("Disabled & Inert Handling", () => {
        test("should ignore clicks when element has aria-disabled='true'", async () => {
            const btn = document.createElement("button");
            btn.setAttribute("aria-disabled", "true");
            const input = document.createElement("input");
            container.append(btn, input);

            const attach = pasteOnClick(input);
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(input.value).toBe("");

            cleanup?.();
        });

        test("should ignore clicks when ancestor is inert", async () => {
            const wrapper = document.createElement("div");
            wrapper.toggleAttribute("inert", true);
            const btn = document.createElement("button");
            const input = document.createElement("input");
            wrapper.append(btn);
            container.append(wrapper, input);

            const attach = pasteOnClick(input);
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(input.value).toBe("");

            cleanup?.();
        });
    });

    describe("Teardown & Cleanup", () => {
        test("should remove event listeners and clear feedback state on cleanup", async () => {
            const input = document.createElement("input");
            const btn = document.createElement("button");
            container.append(input, btn);

            const attach = pasteOnClick(input);
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);
            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(true);

            cleanup?.();

            expect(Object.hasOwn(btn.dataset, "pasted")).toBe(false);

            input.value = "";
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(input.value).toBe("");
        });
    });
});
