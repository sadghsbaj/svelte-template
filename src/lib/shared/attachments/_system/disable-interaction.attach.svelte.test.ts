import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { disableInteraction } from "./disable-interaction.attach";

describe("disableInteraction Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
    });

    afterEach(() => {
        container.remove();
        vi.restoreAllMocks();
    });

    describe("Default Options & Initialization", () => {
        test("should apply default accessibility, focus prevention, and cursor attributes", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = disableInteraction();
            const cleanup = attach(btn);

            expect(btn.getAttribute("aria-disabled")).toBe("true");
            expect(btn.getAttribute("tabindex")).toBe("-1");
            expect(btn.style.cursor).toBe("not-allowed");
            expect(btn.hasAttribute("inert")).toBe(false);

            cleanup?.();
        });

        test("should return early no-op cleanup when enabled is false", () => {
            const btn = document.createElement("button");
            btn.setAttribute("tabindex", "0");
            container.append(btn);

            const attach = disableInteraction({ enabled: false });
            const cleanup = attach(btn);

            expect(btn.getAttribute("aria-disabled")).toBeNull();
            expect(btn.getAttribute("tabindex")).toBe("0");
            expect(btn.style.cursor).toBe("");

            const clickSpy = vi.fn();
            btn.addEventListener("click", clickSpy);
            btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

            expect(clickSpy).toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Event Interception", () => {
        test("should intercept pointer and mouse click events in capture phase", () => {
            const wrapper = document.createElement("div");
            const btn = document.createElement("button");
            wrapper.append(btn);
            container.append(wrapper);

            const attach = disableInteraction();
            const cleanup = attach(wrapper);

            const childClickSpy = vi.fn();
            btn.addEventListener("click", childClickSpy);

            const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
            btn.dispatchEvent(clickEvent);

            expect(clickEvent.defaultPrevented).toBe(true);
            expect(childClickSpy).not.toHaveBeenCalled();

            const pointerDownEvent = new PointerEvent("pointerdown", {
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(pointerDownEvent);
            expect(pointerDownEvent.defaultPrevented).toBe(true);

            const contextMenuEvent = new MouseEvent("contextmenu", {
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(contextMenuEvent);
            expect(contextMenuEvent.defaultPrevented).toBe(true);

            cleanup?.();
        });

        test("should NOT intercept touchstart and touchend to preserve mobile page scrolling", () => {
            const wrapper = document.createElement("div");
            container.append(wrapper);

            const attach = disableInteraction();
            const cleanup = attach(wrapper);

            const touchEvent = new CustomEvent("touchstart", {
                bubbles: true,
                cancelable: true,
            });
            wrapper.dispatchEvent(touchEvent);

            expect(touchEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });

        test("should intercept blocked keyboard keys (Enter, Space)", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = disableInteraction();
            const cleanup = attach(btn);

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(enterEvent);
            expect(enterEvent.defaultPrevented).toBe(true);

            const spaceEvent = new KeyboardEvent("keydown", {
                key: " ",
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(spaceEvent);
            expect(spaceEvent.defaultPrevented).toBe(true);

            const regularKeyEvent = new KeyboardEvent("keydown", {
                key: "a",
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(regularKeyEvent);
            expect(regularKeyEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });

        test("should support custom blockedKeys configuration", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = disableInteraction({ blockedKeys: ["Escape", "Tab"] });
            const cleanup = attach(btn);

            const escapeEvent = new KeyboardEvent("keydown", {
                key: "Escape",
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(escapeEvent);
            expect(escapeEvent.defaultPrevented).toBe(true);

            const enterEvent = new KeyboardEvent("keydown", {
                key: "Enter",
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(enterEvent);
            expect(enterEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });
    });

    describe("Focus Management & Subtree Protection", () => {
        test("should blur activeElement on mount if inside disabled container", () => {
            const wrapper = document.createElement("div");
            const input = document.createElement("input");
            wrapper.append(input);
            container.append(wrapper);

            input.focus();
            expect(document.activeElement).toBe(input);

            const attach = disableInteraction({ preventFocus: true });
            const cleanup = attach(wrapper);

            expect(document.activeElement).not.toBe(input);

            cleanup?.();
        });

        test("should intercept focusin on children to prevent keyboard focus leakage", () => {
            const wrapper = document.createElement("div");
            const childInput = document.createElement("input");
            wrapper.append(childInput);
            container.append(wrapper);

            const attach = disableInteraction({ preventFocus: true });
            const cleanup = attach(wrapper);

            const blurSpy = vi.spyOn(childInput, "blur");
            const focusinEvent = new FocusEvent("focusin", {
                bubbles: true,
                cancelable: true,
            });
            Object.defineProperty(focusinEvent, "target", { value: childInput });

            wrapper.dispatchEvent(focusinEvent);

            expect(blurSpy).toHaveBeenCalled();
            expect(focusinEvent.defaultPrevented).toBe(true);

            cleanup?.();
        });

        test("should respect preventFocus: false", () => {
            const btn = document.createElement("button");
            btn.setAttribute("tabindex", "0");
            container.append(btn);

            const attach = disableInteraction({ preventFocus: false });
            const cleanup = attach(btn);

            expect(btn.getAttribute("tabindex")).toBe("0");

            cleanup?.();
        });
    });

    describe("Inert & Custom Options", () => {
        test("should apply and restore native inert attribute when inert: true", () => {
            const wrapper = document.createElement("div");
            container.append(wrapper);

            const attach = disableInteraction({ inert: true });
            const cleanup = attach(wrapper);

            expect(wrapper.hasAttribute("inert")).toBe(true);

            cleanup?.();
            expect(wrapper.hasAttribute("inert")).toBe(false);
        });

        test("should respect custom cursor or cursor: false", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attachCustom = disableInteraction({ cursor: "wait" });
            const cleanupCustom = attachCustom(btn);
            expect(btn.style.cursor).toBe("wait");
            cleanupCustom?.();

            const attachNoCursor = disableInteraction({ cursor: false });
            const cleanupNoCursor = attachNoCursor(btn);
            expect(btn.style.cursor).toBe("");
            cleanupNoCursor?.();
        });

        test("should respect ariaDisabled: false", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = disableInteraction({ ariaDisabled: false });
            const cleanup = attach(btn);

            expect(btn.getAttribute("aria-disabled")).toBeNull();

            cleanup?.();
        });
    });

    describe("DOM State Teardown & Restoration", () => {
        test("should restore pre-existing DOM attributes on cleanup", () => {
            const btn = document.createElement("button");
            btn.setAttribute("aria-disabled", "false");
            btn.setAttribute("tabindex", "2");
            btn.style.cursor = "pointer";
            btn.toggleAttribute("inert", true);
            container.append(btn);

            const attach = disableInteraction({ inert: false });
            const cleanup = attach(btn);

            expect(btn.getAttribute("aria-disabled")).toBe("true");
            expect(btn.getAttribute("tabindex")).toBe("-1");
            expect(btn.style.cursor).toBe("not-allowed");

            cleanup?.();

            expect(btn.getAttribute("aria-disabled")).toBe("false");
            expect(btn.getAttribute("tabindex")).toBe("2");
            expect(btn.style.cursor).toBe("pointer");
            expect(btn.hasAttribute("inert")).toBe(true);
        });

        test("should remove applied attributes if they did not exist initially", () => {
            const div = document.createElement("div");
            container.append(div);

            const attach = disableInteraction();
            const cleanup = attach(div);

            cleanup?.();

            expect(div.getAttribute("aria-disabled")).toBeNull();
            expect(div.getAttribute("tabindex")).toBeNull();
            expect(div.style.cursor).toBe("");
            expect(div.hasAttribute("inert")).toBe(false);
        });

        test("should re-enable normal event dispatch after unmount", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = disableInteraction();
            const cleanup = attach(btn);

            cleanup?.();

            const clickSpy = vi.fn();
            btn.addEventListener("click", clickSpy);

            const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
            btn.dispatchEvent(clickEvent);

            expect(clickEvent.defaultPrevented).toBe(false);
            expect(clickSpy).toHaveBeenCalled();
        });
    });
});
