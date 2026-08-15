import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
    autoFocus,
    type AutoFocusErrorEvent,
    type AutoFocusSuccessEvent,
} from "./auto-focus.attach";

describe("autoFocus Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
        vi.useFakeTimers();
    });

    afterEach(() => {
        container.remove();
        vi.clearAllTimers();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe("Basic & Shorthand Invocations", () => {
        test("should focus interactive element directly when called with zero arguments", () => {
            const input = document.createElement("input");
            container.append(input);

            const attach = autoFocus();
            const cleanup = attach(input);

            // Execute RAF
            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(input);
            expect(Object.hasOwn(input.dataset, "autofocused")).toBe(true);

            cleanup?.();
            expect(Object.hasOwn(input.dataset, "autofocused")).toBe(false);
        });

        test("should not focus when enabled is false via boolean shorthand", () => {
            const input = document.createElement("input");
            container.append(input);

            const attach = autoFocus(false);
            const cleanup = attach(input);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).not.toBe(input);
            expect(Object.hasOwn(input.dataset, "autofocused")).toBe(false);

            cleanup?.();
        });

        test("should focus first interactive child when attached to a container", () => {
            const wrapper = document.createElement("div");
            const btn1 = document.createElement("button");
            const btn2 = document.createElement("button");
            wrapper.append(btn1, btn2);
            container.append(wrapper);

            const attach = autoFocus();
            const cleanup = attach(wrapper);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(btn1);
            expect(Object.hasOwn(wrapper.dataset, "autofocused")).toBe(true);

            cleanup?.();
        });

        test("should not trigger redundant .focus() when element is already active", () => {
            const input = document.createElement("input");
            container.append(input);
            input.focus();

            const focusSpy = vi.spyOn(input, "focus");

            const attach = autoFocus();
            const cleanup = attach(input);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(input);
            expect(focusSpy).not.toHaveBeenCalled();
            expect(Object.hasOwn(input.dataset, "autofocused")).toBe(true);

            cleanup?.();
        });
    });

    describe("Target Strategies", () => {
        test("should focus last-focusable element when specified", () => {
            const wrapper = document.createElement("div");
            const input1 = document.createElement("input");
            const input2 = document.createElement("input");
            const input3 = document.createElement("input");
            wrapper.append(input1, input2, input3);
            container.append(wrapper);

            const attach = autoFocus("last-focusable");
            const cleanup = attach(wrapper);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(input3);
            cleanup?.();
        });

        test("should focus specific element matching CSS selector shorthand", () => {
            const wrapper = document.createElement("div");
            const input1 = document.createElement("input");
            const input2 = document.createElement("input");
            input2.dataset.primary = "";
            wrapper.append(input1, input2);
            container.append(wrapper);

            const attach = autoFocus("[data-primary]");
            const cleanup = attach(wrapper);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(input2);
            cleanup?.();
        });

        test("should focus element resolved via custom function", () => {
            const wrapper = document.createElement("div");
            const input1 = document.createElement("input");
            const input2 = document.createElement("input");
            wrapper.append(input1, input2);
            container.append(wrapper);

            const attach = autoFocus((root) => root.querySelectorAll("input")[1] ?? null);
            const cleanup = attach(wrapper);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(input2);
            cleanup?.();
        });

        test("should focus self when target is 'self'", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = autoFocus({ target: "self" });
            const cleanup = attach(btn);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(btn);
            cleanup?.();
        });

        test("should apply tabindex='-1' to non-interactive target and remove it on teardown", () => {
            const heading = document.createElement("h2");
            container.append(heading);

            const attach = autoFocus({ target: "self" });
            const cleanup = attach(heading);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(heading);
            expect(heading.getAttribute("tabindex")).toBe("-1");

            cleanup?.();
            expect(heading.hasAttribute("tabindex")).toBe(false);
        });

        test("should cleanly remove assigned tabindex from target even if container DOM mutated before teardown", () => {
            const wrapper = document.createElement("div");
            const heading = document.createElement("h2");
            wrapper.append(heading);
            container.append(wrapper);

            const attach = autoFocus({ target: "h2" });
            const cleanup = attach(wrapper);

            vi.advanceTimersByTime(20);

            expect(heading.getAttribute("tabindex")).toBe("-1");

            // Mutate DOM before teardown
            const newHeading = document.createElement("h2");
            wrapper.prepend(newHeading);

            cleanup?.();
            expect(heading.hasAttribute("tabindex")).toBe(false);
            expect(newHeading.hasAttribute("tabindex")).toBe(false);
        });

        test("should focus summary element as first-focusable within details", () => {
            const details = document.createElement("details");
            const summary = document.createElement("summary");
            summary.textContent = "Toggle info";
            const innerBtn = document.createElement("button");
            details.append(summary, innerBtn);
            container.append(details);

            const attach = autoFocus();
            const cleanup = attach(details);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(summary);
            expect(summary.hasAttribute("tabindex")).toBe(false);

            cleanup?.();
        });

        test("should skip input[type='hidden'] and focus first visible interactive element", () => {
            const form = document.createElement("form");
            const hiddenInput = document.createElement("input");
            hiddenInput.type = "hidden";
            hiddenInput.name = "csrf_token";

            const textInput = document.createElement("input");
            textInput.type = "text";
            textInput.name = "username";

            form.append(hiddenInput, textInput);
            container.append(form);

            const attach = autoFocus();
            const cleanup = attach(form);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(textInput);
            cleanup?.();
        });

        test("should not assign tabindex='-1' to contenteditable elements", () => {
            const editor = document.createElement("div");
            editor.setAttribute("contenteditable", "true");
            container.append(editor);

            const attach = autoFocus({ target: "self" });
            const cleanup = attach(editor);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(editor);
            expect(editor.hasAttribute("tabindex")).toBe(false);

            cleanup?.();
        });
    });

    describe("Disabled & Inert Element Skipping", () => {
        test("should skip disabled buttons and focus next available interactive element", () => {
            const wrapper = document.createElement("div");
            const disabledBtn = document.createElement("button");
            disabledBtn.disabled = true;

            const ariaDisabledBtn = document.createElement("button");
            ariaDisabledBtn.setAttribute("aria-disabled", "true");

            const activeBtn = document.createElement("button");

            wrapper.append(disabledBtn, ariaDisabledBtn, activeBtn);
            container.append(wrapper);

            const attach = autoFocus();
            const cleanup = attach(wrapper);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(activeBtn);
            cleanup?.();
        });

        test("should skip inert subtree elements", () => {
            const wrapper = document.createElement("div");
            const inertGroup = document.createElement("div");
            inertGroup.toggleAttribute("inert", true);
            const hiddenInput = document.createElement("input");
            inertGroup.append(hiddenInput);

            const activeInput = document.createElement("input");
            wrapper.append(inertGroup, activeInput);
            container.append(wrapper);

            const attach = autoFocus();
            const cleanup = attach(wrapper);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(activeInput);
            cleanup?.();
        });
    });

    describe("Text Selection & Cursor Positioning", () => {
        test("should select all text when select is 'all' or true", () => {
            const input = document.createElement("input");
            input.value = "Hello World";
            container.append(input);

            const selectSpy = vi.spyOn(input, "select");

            const attach = autoFocus({ select: "all" });
            const cleanup = attach(input);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(input);
            expect(selectSpy).toHaveBeenCalledTimes(1);

            cleanup?.();
        });

        test("should position cursor at start when select is 'start'", () => {
            const input = document.createElement("input");
            input.value = "Sample Text";
            container.append(input);

            const rangeSpy = vi.spyOn(input, "setSelectionRange");

            const attach = autoFocus({ select: "start" });
            const cleanup = attach(input);

            vi.advanceTimersByTime(20);

            expect(rangeSpy).toHaveBeenCalledWith(0, 0);
            cleanup?.();
        });

        test("should position cursor at end when select is 'end'", () => {
            const input = document.createElement("input");
            input.value = "Sample Text";
            container.append(input);

            const rangeSpy = vi.spyOn(input, "setSelectionRange");

            const attach = autoFocus({ select: "end" });
            const cleanup = attach(input);

            vi.advanceTimersByTime(20);

            expect(rangeSpy).toHaveBeenCalledWith(11, 11);
            cleanup?.();
        });

        test("should set custom selection range when select is tuple [start, end]", () => {
            const input = document.createElement("input");
            input.value = "Sample Text";
            container.append(input);

            const rangeSpy = vi.spyOn(input, "setSelectionRange");

            const attach = autoFocus({ select: [2, 5] });
            const cleanup = attach(input);

            vi.advanceTimersByTime(20);

            expect(rangeSpy).toHaveBeenCalledWith(2, 5);
            cleanup?.();
        });

        test("should gracefully handle inputs where setSelectionRange throws (e.g. type='number')", () => {
            const input = document.createElement("input");
            input.type = "number";
            input.value = "12345";
            container.append(input);

            vi.spyOn(input, "setSelectionRange").mockImplementation(() => {
                throw new DOMException("Not supported", "InvalidStateError");
            });

            const attach = autoFocus({ select: "start" });
            const cleanup = attach(input);

            expect(() => vi.advanceTimersByTime(20)).not.toThrow();
            expect(document.activeElement).toBe(input);

            cleanup?.();
        });
    });

    describe("Timing & Retries", () => {
        test("should execute immediately when timing is 'immediate'", () => {
            const input = document.createElement("input");
            container.append(input);

            const attach = autoFocus({ timing: "immediate" });
            const cleanup = attach(input);

            // Should be focused synchronously without advancing fake timers
            expect(document.activeElement).toBe(input);
            cleanup?.();
        });

        test("should respect custom delay parameter", () => {
            const input = document.createElement("input");
            container.append(input);

            const attach = autoFocus({ delay: 300 });
            const cleanup = attach(input);

            vi.advanceTimersByTime(200);
            expect(document.activeElement).not.toBe(input);

            vi.advanceTimersByTime(110);
            expect(document.activeElement).toBe(input);

            cleanup?.();
        });

        test("should retry and find target when element is appended asynchronously", () => {
            const wrapper = document.createElement("div");
            container.append(wrapper);

            const attach = autoFocus({ retries: 3 });
            const cleanup = attach(wrapper);

            // Frame 1: empty container
            vi.advanceTimersByTime(16);
            expect(Object.hasOwn(wrapper.dataset, "autofocused")).toBe(false);

            // Async render appends input
            const input = document.createElement("input");
            wrapper.append(input);

            // Frame 2: retry catches newly added input
            vi.advanceTimersByTime(16);
            expect(document.activeElement).toBe(input);
            expect(Object.hasOwn(wrapper.dataset, "autofocused")).toBe(true);

            cleanup?.();
        });
    });

    describe("Focus Restoration (A11y)", () => {
        test("should restore focus to previously active element upon unmount", () => {
            const initialButton = document.createElement("button");
            container.append(initialButton);
            initialButton.focus();
            expect(document.activeElement).toBe(initialButton);

            const dialog = document.createElement("div");
            const dialogInput = document.createElement("input");
            dialog.append(dialogInput);
            container.append(dialog);

            const attach = autoFocus({ restoreFocus: true });
            const cleanup = attach(dialog);

            vi.advanceTimersByTime(20);
            expect(document.activeElement).toBe(dialogInput);

            // Unmount dialog
            cleanup?.();
            expect(document.activeElement).toBe(initialButton);
        });

        test("should restore focus to explicitly provided element", () => {
            const customElement = document.createElement("button");
            container.append(customElement);

            const input = document.createElement("input");
            container.append(input);

            const attach = autoFocus({ restoreFocus: () => customElement });
            const cleanup = attach(input);

            vi.advanceTimersByTime(20);
            expect(document.activeElement).toBe(input);

            cleanup?.();
            expect(document.activeElement).toBe(customElement);
        });

        test("should lazily evaluate restoreFocus callback only upon unmount", () => {
            let lateCreatedButton: HTMLButtonElement | null = null;
            const input = document.createElement("input");
            container.append(input);

            const resolverSpy = vi.fn(() => lateCreatedButton);

            const attach = autoFocus({ restoreFocus: resolverSpy });
            const cleanup = attach(input);

            // Upon mount/executeFocus, the resolver must NOT have been called yet
            vi.advanceTimersByTime(20);
            expect(resolverSpy).not.toHaveBeenCalled();

            // Button is created and appended to DOM dynamically during component lifetime
            lateCreatedButton = document.createElement("button");
            container.append(lateCreatedButton);

            cleanup?.();

            expect(resolverSpy).toHaveBeenCalledTimes(1);
            expect(document.activeElement).toBe(lateCreatedButton);
        });

        test("should not crash when previous active element is disconnected on teardown", () => {
            const initialButton = document.createElement("button");
            container.append(initialButton);
            initialButton.focus();

            const input = document.createElement("input");
            container.append(input);

            const attach = autoFocus({ restoreFocus: true });
            const cleanup = attach(input);

            vi.advanceTimersByTime(20);

            // Remove initial button from DOM
            initialButton.remove();

            expect(() => cleanup?.()).not.toThrow();
        });
    });

    describe("Callbacks & Dataset State", () => {
        test("should fire onSuccess callback with target and container", () => {
            const input = document.createElement("input");
            container.append(input);

            const onSuccess = vi.fn<(event: AutoFocusSuccessEvent) => void>();
            const attach = autoFocus({
                onSuccess,
            });
            const cleanup = attach(input);

            vi.advanceTimersByTime(20);

            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(onSuccess).toHaveBeenCalledWith({
                target: input,
                container: input,
            });

            cleanup?.();
        });

        test("should set data-autofocus-failed and trigger onError when target not found", () => {
            const emptyContainer = document.createElement("div");
            container.append(emptyContainer);

            const onError = vi.fn<(event: AutoFocusErrorEvent) => void>();
            const attach = autoFocus({
                target: "#non-existent-selector",
                retries: 0,
                onError,
            });
            const cleanup = attach(emptyContainer);

            vi.advanceTimersByTime(20);

            expect(Object.hasOwn(emptyContainer.dataset, "autofocusFailed")).toBe(true);
            expect(onError).toHaveBeenCalledTimes(1);

            cleanup?.();
            expect(Object.hasOwn(emptyContainer.dataset, "autofocusFailed")).toBe(false);
        });

        test("should cancel pending timers and RAFs if unmounted before execution", () => {
            const input = document.createElement("input");
            container.append(input);

            const attach = autoFocus({ delay: 500 });
            const cleanup = attach(input);

            // Unmount immediately before 500ms
            cleanup?.();

            vi.advanceTimersByTime(600);

            expect(document.activeElement).not.toBe(input);
            expect(Object.hasOwn(input.dataset, "autofocused")).toBe(false);
        });
    });
});
