import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
    focusTrap,
    type FocusTrapErrorEvent,
    type FocusTrapSuccessEvent,
} from "./focus-trap.attach";

describe("focusTrap Svelte 5 Element Attachment", () => {
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

    describe("Initialization & Basic Behavior", () => {
        test("should focus first interactive element by default and set aria-modal", () => {
            const modal = document.createElement("div");
            const btn1 = document.createElement("button");
            btn1.textContent = "First";
            const btn2 = document.createElement("button");
            btn2.textContent = "Second";
            modal.append(btn1, btn2);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(btn1);
            expect(modal.getAttribute("aria-modal")).toBe("true");
            expect(Object.hasOwn(modal.dataset, "focusTrapped")).toBe(true);

            cleanup?.();

            expect(Object.hasOwn(modal.dataset, "focusTrapped")).toBe(false);
            expect(modal.hasAttribute("aria-modal")).toBe(false);
        });

        test("should preserve pre-existing aria-modal attribute on teardown", () => {
            const modal = document.createElement("div");
            modal.setAttribute("aria-modal", "false");
            const btn = document.createElement("button");
            modal.append(btn);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(modal.getAttribute("aria-modal")).toBe("false");

            cleanup?.();

            expect(modal.getAttribute("aria-modal")).toBe("false");
        });

        test("should do nothing when enabled is false via boolean shorthand", () => {
            const modal = document.createElement("div");
            const btn = document.createElement("button");
            modal.append(btn);
            container.append(modal);

            const attach = focusTrap(false);
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).not.toBe(btn);
            expect(Object.hasOwn(modal.dataset, "focusTrapped")).toBe(false);
            expect(modal.hasAttribute("aria-modal")).toBe(false);

            cleanup?.();
        });

        test("should not set initial focus when initialFocus is false", () => {
            const externalBtn = document.createElement("button");
            container.append(externalBtn);
            externalBtn.focus();

            const modal = document.createElement("div");
            const btn = document.createElement("button");
            modal.append(btn);
            container.append(modal);

            const onActivate = vi.fn();
            const attach = focusTrap({ initialFocus: false, onActivate });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(externalBtn);
            expect(Object.hasOwn(modal.dataset, "focusTrapped")).toBe(true);
            expect(onActivate).toHaveBeenCalledWith(modal);

            cleanup?.();
        });
    });

    describe("Initial Focus Target Resolution", () => {
        test("should focus last-focusable element when configured", () => {
            const modal = document.createElement("div");
            const input = document.createElement("input");
            const btn = document.createElement("button");
            modal.append(input, btn);
            container.append(modal);

            const attach = focusTrap({ initialFocus: "last-focusable" });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(btn);

            cleanup?.();
        });

        test("should focus specific element matching CSS selector", () => {
            const modal = document.createElement("div");
            const btn1 = document.createElement("button");
            const btn2 = document.createElement("button");
            btn2.id = "target-action";
            modal.append(btn1, btn2);
            container.append(modal);

            const attach = focusTrap({ initialFocus: "#target-action" });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(btn2);

            cleanup?.();
        });

        test("should focus element resolved by custom function", () => {
            const modal = document.createElement("div");
            const input = document.createElement("input");
            modal.append(input);
            container.append(modal);

            const attach = focusTrap({
                initialFocus: (c) => c.querySelector("input"),
            });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(input);

            cleanup?.();
        });

        test("should focus container when initialFocus is 'self'", () => {
            const modal = document.createElement("div");
            const btn = document.createElement("button");
            modal.append(btn);
            container.append(modal);

            const attach = focusTrap({ initialFocus: "self" });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(modal);
            expect(modal.getAttribute("tabindex")).toBe("-1");

            cleanup?.();
            expect(modal.hasAttribute("tabindex")).toBe(false);
        });

        test("should fallback to fallbackFocus when initial target is not found", () => {
            const modal = document.createElement("div");
            const btn = document.createElement("button");
            btn.id = "fallback-btn";
            modal.append(btn);
            container.append(modal);

            const attach = focusTrap({
                initialFocus: "#non-existent",
                fallbackFocus: "#fallback-btn",
            });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(btn);

            cleanup?.();
        });

        test("should trigger onSuccess callback with target and container", () => {
            const modal = document.createElement("div");
            const btn = document.createElement("button");
            modal.append(btn);
            container.append(modal);

            const onSuccess = vi.fn<(event: FocusTrapSuccessEvent) => void>();
            const attach = focusTrap({ onSuccess });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(onSuccess).toHaveBeenCalledTimes(1);
            expect(onSuccess).toHaveBeenCalledWith({
                target: btn,
                container: modal,
            });

            cleanup?.();
        });

        test("should trigger onError callback and set dataset flag when focus fails entirely", () => {
            const modal = document.createElement("div");
            modal.style.display = "none"; // invisible container with no children
            container.append(modal);

            const onError = vi.fn<(event: FocusTrapErrorEvent) => void>();
            const attach = focusTrap({
                initialFocus: "#unknown",
                fallbackFocus: "#unknown2",
                onError,
            });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(100);

            expect(onError).toHaveBeenCalledTimes(1);
            expect(Object.hasOwn(modal.dataset, "focusTrapFailed")).toBe(true);

            cleanup?.();
            expect(Object.hasOwn(modal.dataset, "focusTrapFailed")).toBe(false);
        });
    });

    describe("Tab Key Trapping & Cyclical Wrap-Around", () => {
        test("should wrap Tab from last element to first element", () => {
            const modal = document.createElement("div");
            const btn1 = document.createElement("button");
            const btn2 = document.createElement("button");
            const btn3 = document.createElement("button");
            modal.append(btn1, btn2, btn3);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            // Move focus to last button
            btn3.focus();
            expect(document.activeElement).toBe(btn3);

            // Press Tab on last button
            const tabEvent = new KeyboardEvent("keydown", {
                key: "Tab",
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(tabEvent);

            expect(tabEvent.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(btn1);

            cleanup?.();
        });

        test("should wrap Shift+Tab from first element to last element", () => {
            const modal = document.createElement("div");
            const btn1 = document.createElement("button");
            const btn2 = document.createElement("button");
            const btn3 = document.createElement("button");
            modal.append(btn1, btn2, btn3);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            btn1.focus();
            expect(document.activeElement).toBe(btn1);

            // Press Shift + Tab on first button
            const shiftTabEvent = new KeyboardEvent("keydown", {
                key: "Tab",
                shiftKey: true,
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(shiftTabEvent);

            expect(shiftTabEvent.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(btn3);

            cleanup?.();
        });

        test("should let standard Tab event proceed normally on middle elements", () => {
            const modal = document.createElement("div");
            const btn1 = document.createElement("button");
            const btn2 = document.createElement("button");
            const btn3 = document.createElement("button");
            modal.append(btn1, btn2, btn3);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            btn2.focus();
            expect(document.activeElement).toBe(btn2);

            const tabEvent = new KeyboardEvent("keydown", {
                key: "Tab",
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(tabEvent);

            // Not on edge, standard browser navigation proceeds
            expect(tabEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });

        test("should wrap Shift+Tab to last element when focus is on container itself", () => {
            const modal = document.createElement("div");
            const btn1 = document.createElement("button");
            const btn2 = document.createElement("button");
            modal.append(btn1, btn2);
            container.append(modal);

            const attach = focusTrap({ initialFocus: "self" });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(modal);

            const shiftTabEvent = new KeyboardEvent("keydown", {
                key: "Tab",
                shiftKey: true,
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(shiftTabEvent);

            expect(shiftTabEvent.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(btn2);

            cleanup?.();
        });

        test("should lock focus to container and prevent Tab when no focusables exist", () => {
            const modal = document.createElement("div");
            const paragraph = document.createElement("p");
            paragraph.textContent = "Information only";
            modal.append(paragraph);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            const tabEvent = new KeyboardEvent("keydown", {
                key: "Tab",
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(tabEvent);

            expect(tabEvent.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(modal);

            cleanup?.();
        });

        test("should ignore non-Tab keys", () => {
            const modal = document.createElement("div");
            const btn = document.createElement("button");
            modal.append(btn);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(enterEvent);

            expect(enterEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });
    });

    describe("Tab Order & Positive TabIndex Support", () => {
        test("should respect positive tabindex ordering during cyclic navigation", () => {
            const modal = document.createElement("div");
            const btnNormal = document.createElement("button"); // tabIndex 0
            btnNormal.textContent = "Normal";

            const btnSecond = document.createElement("button");
            btnSecond.setAttribute("tabindex", "2");
            btnSecond.textContent = "Second";

            const btnFirst = document.createElement("button");
            btnFirst.setAttribute("tabindex", "1");
            btnFirst.textContent = "First";

            modal.append(btnNormal, btnSecond, btnFirst);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            // Initial focus should land on lowest positive tabindex (tabindex 1)
            expect(document.activeElement).toBe(btnFirst);

            // Tab on last element (btnNormal) should wrap back to first (btnFirst)
            btnNormal.focus();
            const tabEvent = new KeyboardEvent("keydown", {
                key: "Tab",
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(tabEvent);

            expect(tabEvent.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(btnFirst);

            // Shift+Tab on first element (btnFirst) should wrap to last (btnNormal)
            const shiftTabEvent = new KeyboardEvent("keydown", {
                key: "Tab",
                shiftKey: true,
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(shiftTabEvent);

            expect(shiftTabEvent.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(btnNormal);

            cleanup?.();
        });
    });

    describe("Inert, Disabled & Hidden Candidates", () => {
        test("should skip disabled and inert elements in tab navigation", () => {
            const modal = document.createElement("div");
            const btn1 = document.createElement("button");
            const disabledBtn = document.createElement("button");
            disabledBtn.disabled = true;
            const ariaDisabledBtn = document.createElement("button");
            ariaDisabledBtn.setAttribute("aria-disabled", "true");
            const btn2 = document.createElement("button");

            modal.append(btn1, disabledBtn, ariaDisabledBtn, btn2);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            // Tab on btn2 should wrap around disabled elements straight back to btn1
            btn2.focus();
            const tabEvent = new KeyboardEvent("keydown", {
                key: "Tab",
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(tabEvent);

            expect(tabEvent.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(btn1);

            cleanup?.();
        });

        test("should skip elements with tabindex='-1' in tab navigation", () => {
            const modal = document.createElement("div");
            const btn1 = document.createElement("button");
            const programmaticBtn = document.createElement("button");
            programmaticBtn.setAttribute("tabindex", "-1");
            const btn2 = document.createElement("button");

            modal.append(btn1, programmaticBtn, btn2);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            btn2.focus();
            const tabEvent = new KeyboardEvent("keydown", {
                key: "Tab",
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(tabEvent);

            expect(tabEvent.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(btn1);

            cleanup?.();
        });
    });

    describe("Escape Key Handling", () => {
        test("should trigger onEscape callback and stop propagation when Escape is pressed", () => {
            const modal = document.createElement("div");
            const btn = document.createElement("button");
            modal.append(btn);
            container.append(modal);

            const onEscape = vi.fn();
            const attach = focusTrap({ onEscape });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            const escapeEvent = new KeyboardEvent("keydown", {
                key: "Escape",
                bubbles: true,
                cancelable: true,
            });
            const stopPropagationSpy = vi.spyOn(escapeEvent, "stopPropagation");
            document.dispatchEvent(escapeEvent);

            expect(onEscape).toHaveBeenCalledTimes(1);
            expect(onEscape).toHaveBeenCalledWith(escapeEvent);
            expect(escapeEvent.defaultPrevented).toBe(true);
            expect(stopPropagationSpy).toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Outside Focus & Click Interception", () => {
        test("should pull focus back into trap when outside element gains focus", () => {
            const outsideBtn = document.createElement("button");
            container.append(outsideBtn);

            const modal = document.createElement("div");
            const insideBtn = document.createElement("button");
            modal.append(insideBtn);
            container.append(modal);

            const attach = focusTrap();
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            expect(document.activeElement).toBe(insideBtn);

            // Simulate outside focusin
            const focusInEvent = new FocusEvent("focusin", {
                bubbles: true,
            });
            Object.defineProperty(focusInEvent, "target", { value: outsideBtn });
            document.dispatchEvent(focusInEvent);

            expect(document.activeElement).toBe(insideBtn);

            cleanup?.();
        });

        test("should permit outside focus when allowOutsideClick is true", () => {
            const outsideBtn = document.createElement("button");
            container.append(outsideBtn);

            const modal = document.createElement("div");
            const insideBtn = document.createElement("button");
            modal.append(insideBtn);
            container.append(modal);

            const attach = focusTrap({ allowOutsideClick: true });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            outsideBtn.focus();
            const focusInEvent = new FocusEvent("focusin", {
                bubbles: true,
            });
            Object.defineProperty(focusInEvent, "target", { value: outsideBtn });
            document.dispatchEvent(focusInEvent);

            expect(document.activeElement).toBe(outsideBtn);

            cleanup?.();
        });

        test("should execute allowOutsideClick predicate and block pointerdown when returning false", () => {
            const outsideBtn = document.createElement("button");
            outsideBtn.id = "forbidden-btn";
            container.append(outsideBtn);

            const modal = document.createElement("div");
            const insideBtn = document.createElement("button");
            modal.append(insideBtn);
            container.append(modal);

            const predicate = vi.fn((e: MouseEvent | PointerEvent) => {
                const target = e.target as HTMLElement | null;
                return target?.id === "allowed-btn";
            });

            const attach = focusTrap({ allowOutsideClick: predicate });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            const pointerDownEvent = new PointerEvent("pointerdown", {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerDownEvent, "target", { value: outsideBtn });
            document.dispatchEvent(pointerDownEvent);

            expect(predicate).toHaveBeenCalledTimes(1);
            expect(pointerDownEvent.defaultPrevented).toBe(true);
            expect(document.activeElement).toBe(insideBtn);

            cleanup?.();
        });

        test("should execute allowOutsideClick predicate and permit pointerdown when returning true", () => {
            const outsideBtn = document.createElement("button");
            outsideBtn.id = "allowed-btn";
            container.append(outsideBtn);

            const modal = document.createElement("div");
            const insideBtn = document.createElement("button");
            modal.append(insideBtn);
            container.append(modal);

            const predicate = vi.fn((e: MouseEvent | PointerEvent) => {
                const target = e.target as HTMLElement | null;
                return target?.id === "allowed-btn";
            });

            const attach = focusTrap({ allowOutsideClick: predicate });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            const pointerDownEvent = new PointerEvent("pointerdown", {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(pointerDownEvent, "target", { value: outsideBtn });
            document.dispatchEvent(pointerDownEvent);

            expect(predicate).toHaveBeenCalledTimes(1);
            expect(pointerDownEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });
    });

    describe("Nested Traps / Trap Stack Coordination", () => {
        test("should pause underlying trap when a nested trap is mounted, then resume and reclaim focus on teardown", () => {
            const modal1 = document.createElement("div");
            const btn1A = document.createElement("button");
            const btn1B = document.createElement("button");
            modal1.append(btn1A, btn1B);
            container.append(modal1);

            const modal2 = document.createElement("div");
            const btn2 = document.createElement("button");
            modal2.append(btn2);
            container.append(modal2);

            const onEscape1 = vi.fn();
            const onEscape2 = vi.fn();

            // Mount Trap 1
            const attach1 = focusTrap({ onEscape: onEscape1 });
            const cleanup1 = attach1(modal1);
            vi.advanceTimersByTime(20);

            // User moves focus to second button in Trap 1
            btn1B.focus();
            const focusIn1B = new FocusEvent("focusin", { bubbles: true });
            Object.defineProperty(focusIn1B, "target", { value: btn1B });
            document.dispatchEvent(focusIn1B);
            expect(document.activeElement).toBe(btn1B);

            expect(Object.hasOwn(modal1.dataset, "focusTrapped")).toBe(true);
            expect(Object.hasOwn(modal1.dataset, "focusTrapPaused")).toBe(false);

            // Mount Trap 2 (Nested)
            const attach2 = focusTrap({ onEscape: onEscape2 });
            const cleanup2 = attach2(modal2);
            vi.advanceTimersByTime(20);

            expect(Object.hasOwn(modal1.dataset, "focusTrapPaused")).toBe(true);
            expect(Object.hasOwn(modal2.dataset, "focusTrapped")).toBe(true);
            expect(Object.hasOwn(modal2.dataset, "focusTrapPaused")).toBe(false);
            expect(document.activeElement).toBe(btn2);

            // Escape should only trigger on top trap (Trap 2)
            const escapeEvent = new KeyboardEvent("keydown", {
                key: "Escape",
                bubbles: true,
                cancelable: true,
            });
            document.dispatchEvent(escapeEvent);

            expect(onEscape2).toHaveBeenCalledTimes(1);
            expect(onEscape1).not.toHaveBeenCalled();

            // Unmount Trap 2 -> Trap 1 resumes and reclaims focus directly to btn1B (last focused)
            cleanup2?.();

            expect(Object.hasOwn(modal1.dataset, "focusTrapPaused")).toBe(false);
            expect(document.activeElement).toBe(btn1B);

            // Now Escape triggers Trap 1
            document.dispatchEvent(escapeEvent);
            expect(onEscape1).toHaveBeenCalledTimes(1);

            cleanup1?.();
        });
    });

    describe("Focus Restoration on Teardown", () => {
        test("should restore focus to pre-activation element upon teardown", () => {
            const triggerBtn = document.createElement("button");
            container.append(triggerBtn);
            triggerBtn.focus();
            expect(document.activeElement).toBe(triggerBtn);

            const modal = document.createElement("div");
            const insideBtn = document.createElement("button");
            modal.append(insideBtn);
            container.append(modal);

            const attach = focusTrap({ restoreFocus: true });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);
            expect(document.activeElement).toBe(insideBtn);

            cleanup?.();
            expect(document.activeElement).toBe(triggerBtn);
        });

        test("should not throw when restored element was removed from DOM", () => {
            const triggerBtn = document.createElement("button");
            container.append(triggerBtn);
            triggerBtn.focus();

            const modal = document.createElement("div");
            const insideBtn = document.createElement("button");
            modal.append(insideBtn);
            container.append(modal);

            const attach = focusTrap({ restoreFocus: true });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            // Remove trigger element before closing modal
            triggerBtn.remove();

            expect(() => cleanup?.()).not.toThrow();
        });

        test("should restore focus to custom element when restoreFocus is an HTMLElement", () => {
            const fallbackEl = document.createElement("button");
            container.append(fallbackEl);

            const modal = document.createElement("div");
            const insideBtn = document.createElement("button");
            modal.append(insideBtn);
            container.append(modal);

            const attach = focusTrap({ restoreFocus: fallbackEl });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);

            cleanup?.();
            expect(document.activeElement).toBe(fallbackEl);
        });

        test("should respect restoreFocus: false", () => {
            const triggerBtn = document.createElement("button");
            container.append(triggerBtn);
            triggerBtn.focus();

            const modal = document.createElement("div");
            const insideBtn = document.createElement("button");
            modal.append(insideBtn);
            container.append(modal);

            const attach = focusTrap({ restoreFocus: false });
            const cleanup = attach(modal);

            vi.advanceTimersByTime(20);
            expect(document.activeElement).toBe(insideBtn);

            cleanup?.();
            expect(document.activeElement).toBe(insideBtn);
        });
    });
});
