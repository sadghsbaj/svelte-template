import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { middleClick, type MiddleClickCallback } from "./middle-click.attach";

describe("middleClick Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
    });

    afterEach(() => {
        container.remove();
        vi.restoreAllMocks();
    });

    describe("Initialization & Shorthand Syntax", () => {
        test("should accept a direct callback function shorthand", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn();
            const attach = middleClick(callback);
            const cleanup = attach(btn);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(auxClickEvent);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(auxClickEvent.defaultPrevented).toBe(true);

            cleanup?.();
        });

        test("should return early no-op cleanup when enabled is false", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn();
            const attach = middleClick({ onMiddleClick: callback, enabled: false });
            const cleanup = attach(btn);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(auxClickEvent);

            expect(callback).not.toHaveBeenCalled();
            expect(auxClickEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });

        test("should return early no-op cleanup when onMiddleClick is undefined", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = middleClick({});
            const cleanup = attach(btn);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(auxClickEvent);

            expect(auxClickEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });
    });

    describe("Mouse Button Filtering", () => {
        test("should trigger callback only for middle clicks (button === 1)", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn();
            const attach = middleClick(callback);
            const cleanup = attach(btn);

            // Left click (button 0)
            const leftClick = new MouseEvent("auxclick", {
                button: 0,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(leftClick);
            expect(callback).not.toHaveBeenCalled();

            // Right click (button 2)
            const rightClick = new MouseEvent("auxclick", {
                button: 2,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(rightClick);
            expect(callback).not.toHaveBeenCalled();

            // Middle click (button 1)
            const middleClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(middleClickEvent);
            expect(callback).toHaveBeenCalledTimes(1);

            cleanup?.();
        });
    });

    describe("Autoscroll Prevention (mousedown)", () => {
        test("should prevent default on mousedown with button === 1 by default", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<MiddleClickCallback>();
            const attach = middleClick(callback);
            const cleanup = attach(btn);

            const mouseDownEvent = new MouseEvent("mousedown", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(mouseDownEvent);

            expect(mouseDownEvent.defaultPrevented).toBe(true);

            cleanup?.();
        });

        test("should NOT prevent default on mousedown with button === 0 (left click)", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn<MiddleClickCallback>();
            const attach = middleClick(callback);
            const cleanup = attach(btn);

            const mouseDownEvent = new MouseEvent("mousedown", {
                button: 0,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(mouseDownEvent);

            expect(mouseDownEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });

        test("should respect preventAutoscroll: false", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const attach = middleClick({
                onMiddleClick: vi.fn(),
                preventAutoscroll: false,
            });
            const cleanup = attach(btn);

            const mouseDownEvent = new MouseEvent("mousedown", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(mouseDownEvent);

            expect(mouseDownEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });
    });

    describe("Default Action & Propagation Control", () => {
        test("should respect preventDefault: false on auxclick", () => {
            const link = document.createElement("a");
            link.href = "#";
            container.append(link);

            const callback = vi.fn();
            const attach = middleClick({
                onMiddleClick: callback,
                preventDefault: false,
            });
            const cleanup = attach(link);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            link.dispatchEvent(auxClickEvent);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(auxClickEvent.defaultPrevented).toBe(false);

            cleanup?.();
        });

        test("should stop propagation when stopPropagation: true", () => {
            const parent = document.createElement("div");
            const btn = document.createElement("button");
            parent.append(btn);
            container.append(parent);

            const parentSpy = vi.fn();
            parent.addEventListener("auxclick", parentSpy);

            const callback = vi.fn();
            const attach = middleClick({
                onMiddleClick: callback,
                stopPropagation: true,
            });
            const cleanup = attach(btn);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(auxClickEvent);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(parentSpy).not.toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Disabled & Inert Element Handling", () => {
        test("should ignore clicks when the element has aria-disabled='true'", () => {
            const btn = document.createElement("button");
            btn.setAttribute("aria-disabled", "true");
            container.append(btn);

            const callback = vi.fn();
            const attach = middleClick(callback);
            const cleanup = attach(btn);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(auxClickEvent);

            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should ignore clicks when an ancestor has aria-disabled='true'", () => {
            const wrapper = document.createElement("div");
            wrapper.setAttribute("aria-disabled", "true");
            const btn = document.createElement("button");
            wrapper.append(btn);
            container.append(wrapper);

            const callback = vi.fn();
            const attach = middleClick(callback);
            const cleanup = attach(btn);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(auxClickEvent);

            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should ignore clicks when child target inside attached element is disabled", () => {
            const wrapper = document.createElement("div");
            const childBtn = document.createElement("button");
            childBtn.setAttribute("aria-disabled", "true");
            wrapper.append(childBtn);
            container.append(wrapper);

            const callback = vi.fn();
            const attach = middleClick(callback);
            const cleanup = attach(wrapper);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            childBtn.dispatchEvent(auxClickEvent);

            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should ignore clicks when element is native :disabled", () => {
            const btn = document.createElement("button");
            btn.disabled = true;
            container.append(btn);

            const callback = vi.fn();
            const attach = middleClick(callback);
            const cleanup = attach(btn);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(auxClickEvent);

            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should ignore clicks when element has inert attribute", () => {
            const btn = document.createElement("button");
            btn.toggleAttribute("inert", true);
            container.append(btn);

            const callback = vi.fn();
            const attach = middleClick(callback);
            const cleanup = attach(btn);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(auxClickEvent);

            expect(callback).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should fire despite disabled state when ignoreDisabled: false", () => {
            const btn = document.createElement("button");
            btn.setAttribute("aria-disabled", "true");
            container.append(btn);

            const callback = vi.fn();
            const attach = middleClick({
                onMiddleClick: callback,
                ignoreDisabled: false,
            });
            const cleanup = attach(btn);

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(auxClickEvent);

            expect(callback).toHaveBeenCalledTimes(1);

            cleanup?.();
        });
    });

    describe("Teardown & Cleanup", () => {
        test("should remove all event listeners upon teardown", () => {
            const btn = document.createElement("button");
            container.append(btn);

            const callback = vi.fn();
            const attach = middleClick(callback);
            const cleanup = attach(btn);

            // Execute teardown
            cleanup?.();

            const auxClickEvent = new MouseEvent("auxclick", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(auxClickEvent);

            const mouseDownEvent = new MouseEvent("mousedown", {
                button: 1,
                bubbles: true,
                cancelable: true,
            });
            btn.dispatchEvent(mouseDownEvent);

            expect(callback).not.toHaveBeenCalled();
            expect(auxClickEvent.defaultPrevented).toBe(false);
            expect(mouseDownEvent.defaultPrevented).toBe(false);
        });
    });
});
