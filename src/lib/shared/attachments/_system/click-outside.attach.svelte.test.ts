import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { clickOutside } from "./click-outside.attach";

describe("clickOutside Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;
    let outsideElement: HTMLButtonElement;

    beforeEach(() => {
        container = document.createElement("div");
        outsideElement = document.createElement("button");
        outsideElement.id = "outside-btn";

        document.body.append(container);
        document.body.append(outsideElement);
    });

    afterEach(() => {
        container.remove();
        outsideElement.remove();
        vi.restoreAllMocks();
    });

    describe("Initialization & Lifecycle", () => {
        test("should set data-click-outside attribute and remove on unmount", async () => {
            const handler = vi.fn();
            const attach = clickOutside(handler);
            const cleanup = attach(container);

            expect(Object.hasOwn(container.dataset, "clickOutside")).toBe(true);

            cleanup?.();
            expect(Object.hasOwn(container.dataset, "clickOutside")).toBe(false);
        });

        test("should return early no-op cleanup when enabled is false", () => {
            const handler = vi.fn();
            const attach = clickOutside({ handler, enabled: false });
            const cleanup = attach(container);

            expect(Object.hasOwn(container.dataset, "clickOutside")).toBe(false);

            outsideElement.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
            expect(handler).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should return early no-op cleanup when handler is undefined", () => {
            const attach = clickOutside({});
            const cleanup = attach(container);

            expect(Object.hasOwn(container.dataset, "clickOutside")).toBe(false);
            cleanup?.();
        });
    });

    describe("Outside Interaction Detection", () => {
        test("should trigger handler when clicking outside element", async () => {
            const handler = vi.fn();
            const attach = clickOutside(handler);
            const cleanup = attach(container);

            // Wait a microtask for listener registration
            await Promise.resolve();

            outsideElement.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            const clickEvent = new MouseEvent("click", { bubbles: true });
            outsideElement.dispatchEvent(clickEvent);

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: outsideElement,
                    container,
                })
            );

            cleanup?.();
        });

        test("should NOT trigger handler when clicking inside container or its children", async () => {
            const handler = vi.fn();
            const childButton = document.createElement("button");
            container.append(childButton);

            const attach = clickOutside(handler);
            const cleanup = attach(container);

            await Promise.resolve();

            childButton.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            childButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            container.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            container.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            expect(handler).not.toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Drag & Text-Selection Edge Case (Pointerdown Pairing)", () => {
        test("should NOT trigger when pointerdown started inside and click/mouseup released outside", async () => {
            const handler = vi.fn();
            const child = document.createElement("span");
            container.append(child);

            const attach = clickOutside({
                handler,
                requireMatchingPointerDown: true,
            });
            const cleanup = attach(container);

            await Promise.resolve();

            // 1. Mouse down inside container (e.g. text selection start)
            child.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));

            // 2. Mouse up / click outside container (selection released outside)
            outsideElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            expect(handler).not.toHaveBeenCalled();

            cleanup?.();
        });

        test("should trigger when pointerdown started outside and click released outside", async () => {
            const handler = vi.fn();
            const attach = clickOutside({
                handler,
                requireMatchingPointerDown: true,
            });
            const cleanup = attach(container);

            await Promise.resolve();

            outsideElement.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            outsideElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            expect(handler).toHaveBeenCalledTimes(1);

            cleanup?.();
        });
    });

    describe("Detached DOM Node Edge Case", () => {
        test("should NOT trigger outside click when clicking an element that gets removed from DOM during click", async () => {
            const handler = vi.fn();
            const removableBtn = document.createElement("button");
            container.append(removableBtn);

            removableBtn.addEventListener("click", () => {
                removableBtn.remove();
            });

            const attach = clickOutside(handler);
            const cleanup = attach(container);

            await Promise.resolve();

            removableBtn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            removableBtn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            expect(handler).not.toHaveBeenCalled();

            cleanup?.();
        });
    });

    describe("Ignore Rules & Selectors", () => {
        test("should ignore clicks on elements matching CSS selector", async () => {
            const handler = vi.fn();
            const ignoreButton = document.createElement("button");
            ignoreButton.className = "ignore-me";
            document.body.append(ignoreButton);

            const attach = clickOutside({
                handler,
                ignore: ".ignore-me",
            });
            const cleanup = attach(container);

            await Promise.resolve();

            ignoreButton.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            ignoreButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            expect(handler).not.toHaveBeenCalled();

            ignoreButton.remove();
            cleanup?.();
        });

        test("should ignore clicks on direct HTMLElement references", async () => {
            const handler = vi.fn();
            const toggleButton = document.createElement("button");
            document.body.append(toggleButton);

            const attach = clickOutside({
                handler,
                ignore: toggleButton,
            });
            const cleanup = attach(container);

            await Promise.resolve();

            toggleButton.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            toggleButton.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            expect(handler).not.toHaveBeenCalled();

            toggleButton.remove();
            cleanup?.();
        });

        test("should ignore clicks when matching dynamic predicate function", async () => {
            const handler = vi.fn();
            const specialElement = document.createElement("div");
            specialElement.dataset.portal = "toast";
            document.body.append(specialElement);

            const attach = clickOutside({
                handler,
                ignore: (target) => Boolean(target.closest("[data-portal]")),
            });
            const cleanup = attach(container);

            await Promise.resolve();

            specialElement.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            specialElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            expect(handler).not.toHaveBeenCalled();

            specialElement.remove();
            cleanup?.();
        });

        test("should support array of mixed ignore targets and getter functions", async () => {
            const handler = vi.fn();
            const portalEl = document.createElement("div");
            portalEl.id = "portal-root";
            document.body.append(portalEl);

            const attach = clickOutside({
                handler,
                ignore: [() => portalEl, "#extra-trigger"],
            });
            const cleanup = attach(container);

            await Promise.resolve();

            portalEl.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            portalEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            expect(handler).not.toHaveBeenCalled();

            portalEl.remove();
            cleanup?.();
        });
    });

    describe("Iframe Focus Detection", () => {
        test("should trigger handler on window blur when focus moves into an external iframe", async () => {
            vi.useFakeTimers();

            const handler = vi.fn();
            const iframe = document.createElement("iframe");
            document.body.append(iframe);

            const attach = clickOutside({
                handler,
                detectIframe: true,
            });
            const cleanup = attach(container);

            await vi.advanceTimersByTimeAsync(0);

            // Mock document.activeElement as the iframe
            vi.spyOn(document, "activeElement", "get").mockReturnValue(iframe);

            window.dispatchEvent(new FocusEvent("blur"));
            await vi.advanceTimersByTimeAsync(10);

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: iframe,
                    container,
                })
            );

            iframe.remove();
            cleanup?.();
            vi.useRealTimers();
        });

        test("should NOT trigger handler on window blur when iframe is inside the container", async () => {
            vi.useFakeTimers();

            const handler = vi.fn();
            const innerIframe = document.createElement("iframe");
            container.append(innerIframe);

            const attach = clickOutside({
                handler,
                detectIframe: true,
            });
            const cleanup = attach(container);

            await vi.advanceTimersByTimeAsync(0);

            vi.spyOn(document, "activeElement", "get").mockReturnValue(innerIframe);

            window.dispatchEvent(new FocusEvent("blur"));
            await vi.advanceTimersByTimeAsync(10);

            expect(handler).not.toHaveBeenCalled();

            cleanup?.();
            vi.useRealTimers();
        });
    });

    describe("Custom Events & Delay Options", () => {
        test("should listen to custom event list (e.g. contextmenu)", async () => {
            const handler = vi.fn();
            const attach = clickOutside({
                handler,
                events: ["contextmenu"],
                requireMatchingPointerDown: false,
            });
            const cleanup = attach(container);

            await Promise.resolve();

            outsideElement.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }));
            expect(handler).toHaveBeenCalledTimes(1);

            cleanup?.();
        });

        test("should respect custom delay before activating listeners", async () => {
            vi.useFakeTimers();

            const handler = vi.fn();
            const attach = clickOutside({
                handler,
                delay: 150,
            });
            const cleanup = attach(container);

            // Event before delay expires
            outsideElement.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            outsideElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            expect(handler).not.toHaveBeenCalled();

            // Advance past delay
            await vi.advanceTimersByTimeAsync(160);

            outsideElement.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            outsideElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            expect(handler).toHaveBeenCalledTimes(1);

            cleanup?.();
            vi.useRealTimers();
        });
    });

    describe("Advanced Edge Cases & Hardening", () => {
        test("should handle keyboard activation on outside button after an earlier inside pointerdown", async () => {
            const handler = vi.fn();
            const child = document.createElement("input");
            container.append(child);

            const attach = clickOutside(handler);
            const cleanup = attach(container);

            await Promise.resolve();

            // 1. Earlier pointerdown inside container
            child.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
            child.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));

            // Allow microtask to reset pointerdown inside state
            await Promise.resolve();

            // 2. Keyboard click (Enter key on outside button produces synthetic click with no pointerdown)
            outsideElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));

            expect(handler).toHaveBeenCalledTimes(1);

            cleanup?.();
        });

        test("should detect iframe inside shadow DOM on window blur", async () => {
            vi.useFakeTimers();

            const handler = vi.fn();
            const host = document.createElement("div");
            const shadowRoot = host.attachShadow({ mode: "open" });
            const shadowIframe = document.createElement("iframe");
            shadowRoot.append(shadowIframe);
            document.body.append(host);

            const attach = clickOutside({
                handler,
                detectIframe: true,
            });
            const cleanup = attach(container);

            await vi.advanceTimersByTimeAsync(0);

            // Mock document.activeElement as shadow host and shadowRoot.activeElement as iframe
            vi.spyOn(document, "activeElement", "get").mockReturnValue(host);
            vi.spyOn(shadowRoot, "activeElement", "get").mockReturnValue(shadowIframe);

            window.dispatchEvent(new FocusEvent("blur"));
            await vi.advanceTimersByTimeAsync(10);

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: shadowIframe,
                    container,
                })
            );

            host.remove();
            cleanup?.();
            vi.useRealTimers();
        });

        test("should fall back to documentElement when event target is not an Element", async () => {
            const handler = vi.fn();
            const attach = clickOutside(handler);
            const cleanup = attach(container);

            await Promise.resolve();

            const clickOnDocument = new MouseEvent("click", { bubbles: true });
            document.dispatchEvent(clickOnDocument);

            expect(handler).toHaveBeenCalledTimes(1);
            expect(handler).toHaveBeenCalledWith(
                expect.objectContaining({
                    target: document.documentElement,
                    container,
                })
            );

            cleanup?.();
        });

        test("should work with mousedown/touchstart fallback when PointerEvent is not supported", async () => {
            vi.stubGlobal("PointerEvent", undefined);

            const handler = vi.fn();
            const attach = clickOutside({
                handler,
                requireMatchingPointerDown: true,
            });
            const cleanup = attach(container);

            await Promise.resolve();

            // 1. Mouse down inside container (using fallback mousedown listener)
            const child = document.createElement("button");
            container.append(child);
            child.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));

            // 2. Click outside (should be ignored because mousedown was inside)
            outsideElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            expect(handler).not.toHaveBeenCalled();

            // 3. Mousedown outside + click outside
            outsideElement.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
            outsideElement.dispatchEvent(new MouseEvent("click", { bubbles: true }));
            expect(handler).toHaveBeenCalledTimes(1);

            cleanup?.();
            vi.unstubAllGlobals();
        });
    });
});
