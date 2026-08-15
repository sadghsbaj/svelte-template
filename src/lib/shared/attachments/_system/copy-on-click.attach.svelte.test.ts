import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
    copyOnClick,
    type CopyOnClickErrorEvent,
    type CopyOnClickSuccessEvent,
} from "./copy-on-click.attach";

describe("copyOnClick Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
        vi.useFakeTimers();

        // Mock navigator.clipboard API
        let clipboardContent = "";
        Object.defineProperty(navigator, "clipboard", {
            value: {
                writeText: vi.fn(async (text: string) => {
                    clipboardContent = text;
                }),
                readText: vi.fn(async () => clipboardContent),
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

    describe("Shorthand & Value Resolution", () => {
        test("should copy static string passed directly as shorthand", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = copyOnClick("static-token-123");
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("static-token-123");
            expect(Object.hasOwn(btn.dataset, "copied")).toBe(true);

            cleanup?.();
        });

        test("should copy dynamic string from synchronous getter function", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            let token = "token-v1";
            const attach = copyOnClick(() => token);
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("token-v1");

            token = "token-v2";
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("token-v2");

            cleanup?.();
        });

        test("should copy from asynchronous getter function returning a Promise", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = copyOnClick(async () => {
                return "async-resolved-data";
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("async-resolved-data");
            expect(Object.hasOwn(btn.dataset, "copied")).toBe(true);

            cleanup?.();
        });

        test("should copy value from target input element reference", async () => {
            const input = document.createElement("input");
            input.value = "input-field-value";
            const btn = document.createElement("button");
            container.append(input, btn);

            const attach = copyOnClick(input);
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("input-field-value");

            cleanup?.();
        });

        test("should copy text from target SVGElement reference", async () => {
            const svgText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            svgText.textContent = "svg-source-content";
            const btn = document.createElement("button");
            container.append(svgText, btn);

            const attach = copyOnClick(svgText);
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("svg-source-content");

            cleanup?.();
        });

        test("should fallback to attached input value when text option is omitted", async () => {
            const input = document.createElement("input");
            input.value = "my-input-content";
            container.append(input);

            const attach = copyOnClick();
            const cleanup = attach(input);

            input.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("my-input-content");

            cleanup?.();
        });

        test("should fallback to attached textarea value when text option is omitted", async () => {
            const textarea = document.createElement("textarea");
            textarea.value = "multiline\ntextarea\ncontent";
            container.append(textarea);

            const attach = copyOnClick();
            const cleanup = attach(textarea);

            textarea.dispatchEvent(
                new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })
            );
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("multiline\ntextarea\ncontent");

            cleanup?.();
        });

        test("should fallback to attached element textContent when text option is omitted", async () => {
            const btn = document.createElement("button");
            btn.textContent = "  Copy this content  ";
            container.append(btn);

            const attach = copyOnClick();
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("Copy this content");

            cleanup?.();
        });

        test("should work seamlessly on SVGElement and update its dataset", async () => {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            container.append(svg);

            const attach = copyOnClick<SVGSVGElement>("svg-copy-token");
            const cleanup = attach(svg);

            svg.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("svg-copy-token");
            expect(Object.hasOwn(svg.dataset, "copied")).toBe(true);

            cleanup?.();
        });
    });

    describe("Feedback Lifecycle & State Attributes", () => {
        test("should set data-copied and clear it after feedbackDuration", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = copyOnClick({
                text: "copied-data",
                feedbackDuration: 1000,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));

            // Immediately after microtasks
            await vi.advanceTimersByTimeAsync(10);
            expect(Object.hasOwn(btn.dataset, "copied")).toBe(true);

            // Advance before timer finishes
            await vi.advanceTimersByTimeAsync(800);
            expect(Object.hasOwn(btn.dataset, "copied")).toBe(true);

            // Advance past duration
            await vi.advanceTimersByTimeAsync(200);
            expect(Object.hasOwn(btn.dataset, "copied")).toBe(false);

            cleanup?.();
        });

        test("should reset and extend timer on rapid consecutive clicks", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = copyOnClick({
                text: "rapid-click-data",
                feedbackDuration: 1000,
            });
            const cleanup = attach(btn);

            // First click
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(600);
            expect(Object.hasOwn(btn.dataset, "copied")).toBe(true);

            // Second click resets the 1000ms timer
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(600);
            expect(Object.hasOwn(btn.dataset, "copied")).toBe(true);

            await vi.advanceTimersByTimeAsync(450);
            expect(Object.hasOwn(btn.dataset, "copied")).toBe(false);

            cleanup?.();
        });

        test("should trigger onSuccess callback with event details", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const onSuccess = vi.fn<(event: CopyOnClickSuccessEvent) => void>();
            const attach = copyOnClick({
                text: "success-event-test",
                onSuccess,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(onSuccess).toHaveBeenCalledWith(
                expect.objectContaining({
                    text: "success-event-test",
                    node: btn,
                })
            );

            cleanup?.();
        });
    });

    describe("Error Handling", () => {
        test("should trigger onError and set data-copy-error when clipboard write rejects", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            // Force clipboard error
            Object.defineProperty(navigator, "clipboard", {
                value: {
                    writeText: vi.fn().mockRejectedValue(new Error("Permission denied")),
                },
                configurable: true,
                writable: true,
            });

            // Mock document.execCommand failure as well
            vi.spyOn(document, "execCommand").mockImplementation(() => false);

            const onError = vi.fn<(event: CopyOnClickErrorEvent) => void>();
            const attach = copyOnClick({
                text: "fail-test",
                onError,
                feedbackDuration: 800,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onError).toHaveBeenCalledTimes(1);
            expect(Object.hasOwn(btn.dataset, "copyError")).toBe(true);
            expect(Object.hasOwn(btn.dataset, "copied")).toBe(false);

            await vi.advanceTimersByTimeAsync(800);
            expect(Object.hasOwn(btn.dataset, "copyError")).toBe(false);

            cleanup?.();
        });

        test("should trigger onError when text getter throws an error", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const onError = vi.fn<(event: CopyOnClickErrorEvent) => void>();
            const attach = copyOnClick({
                text: () => {
                    throw new Error("Getter failed");
                },
                onError,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onError).toHaveBeenCalledTimes(1);
            expect(Object.hasOwn(btn.dataset, "copyError")).toBe(true);

            cleanup?.();
        });
    });

    describe("Keyboard Accessibility & Deduplication", () => {
        test("should NOT double-fire on native button keydown (delegates to browser click)", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const onSuccess = vi.fn();
            const attach = copyOnClick({
                text: "native-btn-token",
                onSuccess,
            });
            const cleanup = attach(btn);

            // Keydown on native button does not directly trigger handler (prevents duplicate)
            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(enterEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).not.toHaveBeenCalled();

            // Native browser dispatches click on Enter/Space
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("native-btn-token");

            cleanup?.();
        });

        test("should NOT double-fire on wrapper container when inner button receives keydown", async () => {
            const wrapper = document.createElement("div");
            const innerBtn = document.createElement("button");
            wrapper.append(innerBtn);
            container.append(wrapper);

            const onSuccess = vi.fn();
            const attach = copyOnClick({
                text: "wrapper-inner-btn-token",
                onSuccess,
            });
            const cleanup = attach(wrapper);

            // Keydown dispatched on inner button inside attached wrapper
            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            innerBtn.dispatchEvent(enterEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).not.toHaveBeenCalled();

            // Then native click bubbled from inner button
            innerBtn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("wrapper-inner-btn-token");

            cleanup?.();
        });

        test("should NOT double-fire on native link with href keydown", async () => {
            const link = document.createElement("a");
            link.href = "https://example.com";
            container.append(link);

            const onSuccess = vi.fn();
            const attach = copyOnClick({
                text: "link-token",
                onSuccess,
            });
            const cleanup = attach(link);

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            link.dispatchEvent(enterEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(onSuccess).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should trigger copy on custom focusable element via Enter keydown", async () => {
            const customDiv = document.createElement("div");
            customDiv.setAttribute("tabindex", "0");
            container.append(customDiv);

            const attach = copyOnClick("custom-div-token");
            const cleanup = attach(customDiv);

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            customDiv.dispatchEvent(enterEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("custom-div-token");

            cleanup?.();
        });

        test("should trigger copy on custom element via Space keydown and prevent default scroll", async () => {
            const customSpan = document.createElement("span");
            customSpan.setAttribute("role", "button");
            customSpan.setAttribute("tabindex", "0");
            container.append(customSpan);

            const attach = copyOnClick("space-custom-token");
            const cleanup = attach(customSpan);

            const spaceEvent = new KeyboardEvent("keydown", {
                key: " ",
                bubbles: true,
                cancelable: true,
            });
            customSpan.dispatchEvent(spaceEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(spaceEvent.defaultPrevented).toBe(true);
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("space-custom-token");

            cleanup?.();
        });

        test("should NOT trigger copy on keydown inside contenteditable container (true or plaintext-only)", async () => {
            const editableDiv = document.createElement("div");
            editableDiv.setAttribute("contenteditable", "plaintext-only");
            container.append(editableDiv);

            const attach = copyOnClick("should-not-copy-in-editable");
            const cleanup = attach(editableDiv);

            const spaceEvent = new KeyboardEvent("keydown", {
                key: " ",
                bubbles: true,
                cancelable: true,
            });
            editableDiv.dispatchEvent(spaceEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(spaceEvent.defaultPrevented).toBe(false);
            expect(navigator.clipboard.writeText).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should NOT trigger copy on keydown inside an editable input", async () => {
            const input = document.createElement("input");
            input.value = "editing";
            container.append(input);

            const attach = copyOnClick({
                text: "should-not-copy-on-type",
            });
            const cleanup = attach(input);

            const spaceEvent = new KeyboardEvent("keydown", {
                key: " ",
                bubbles: true,
                cancelable: true,
            });
            input.dispatchEvent(spaceEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should ignore keyboard triggers when keyboard: false", async () => {
            const customDiv = document.createElement("div");
            customDiv.setAttribute("tabindex", "0");
            container.append(customDiv);

            const attach = copyOnClick({
                text: "no-keyboard",
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

            expect(navigator.clipboard.writeText).not.toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Disabled & Inert Handling", () => {
        test("should ignore clicks when element has aria-disabled='true'", async () => {
            const btn = document.createElement("button");
            btn.setAttribute("aria-disabled", "true");
            container.append(btn);

            const attach = copyOnClick("disabled-test");
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should ignore clicks when element is native :disabled", async () => {
            const btn = document.createElement("button");
            btn.disabled = true;
            container.append(btn);

            const attach = copyOnClick("disabled-test");
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should ignore clicks when ancestor is inert", async () => {
            const wrapper = document.createElement("div");
            wrapper.toggleAttribute("inert", true);
            const btn = document.createElement("button");
            wrapper.append(btn);
            container.append(wrapper);

            const attach = copyOnClick("inert-test");
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should allow copy despite disabled state when ignoreDisabled: false", async () => {
            const btn = document.createElement("button");
            btn.setAttribute("aria-disabled", "true");
            container.append(btn);

            const attach = copyOnClick({
                text: "allow-disabled",
                ignoreDisabled: false,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledWith("allow-disabled");

            cleanup?.();
        });
    });

    describe("Event Modifiers & Enabled Configuration", () => {
        test("should prevent default when preventDefault: true", async () => {
            const link = document.createElement("a");
            link.href = "#";
            container.append(link);

            const attach = copyOnClick({
                text: "link-copy",
                preventDefault: true,
            });
            const cleanup = attach(link);

            const clickEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                button: 0,
            });
            link.dispatchEvent(clickEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(clickEvent.defaultPrevented).toBe(true);

            cleanup?.();
        });

        test("should stop propagation when stopPropagation: true", async () => {
            const parent = document.createElement("div");
            const btn = document.createElement("button");
            parent.append(btn);
            container.append(parent);

            const parentSpy = vi.fn();
            parent.addEventListener("click", parentSpy);

            const attach = copyOnClick({
                text: "prop-test",
                stopPropagation: true,
            });
            const cleanup = attach(btn);

            const clickEvent = new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                button: 0,
            });
            btn.dispatchEvent(clickEvent);
            await vi.advanceTimersByTimeAsync(10);

            expect(parentSpy).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should return early no-op cleanup when enabled: false", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = copyOnClick({
                text: "disabled-attachment",
                enabled: false,
            });
            const cleanup = attach(btn);

            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).not.toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Teardown & Cleanup", () => {
        test("should remove event listeners and clear timers on cleanup", async () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = copyOnClick("cleanup-test");
            const cleanup = attach(btn);

            // Trigger copy
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);
            expect(Object.hasOwn(btn.dataset, "copied")).toBe(true);

            // Execute cleanup immediately
            cleanup?.();

            expect(Object.hasOwn(btn.dataset, "copied")).toBe(false);

            // Subsequent clicks do nothing
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 }));
            await vi.advanceTimersByTimeAsync(10);

            expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
        });
    });
});
