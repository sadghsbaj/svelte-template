import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import {
    autoResize,
    type AutoResizeDetail,
} from "./auto-resize.attach";

describe("autoResize Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
    });

    afterEach(() => {
        container.remove();
        vi.restoreAllMocks();
    });

    describe("Basic Vertical Resizing (Textarea)", () => {
        test("should apply autoResized dataset and calculate initial height with border-box", () => {
            const textarea = document.createElement("textarea");
            textarea.style.boxSizing = "border-box";
            textarea.style.padding = "8px";
            textarea.style.border = "1px solid black";
            textarea.value = "Line 1\nLine 2\nLine 3";
            container.append(textarea);

            // Mock scrollHeight: 84px (content + 16px padding)
            Object.defineProperty(textarea, "scrollHeight", {
                configurable: true,
                value: 84,
            });

            const attach = autoResize();
            const cleanup = attach(textarea);

            expect(Object.hasOwn(textarea.dataset, "autoResized")).toBe(true);
            // 84px scrollHeight + 2px borders = 86px
            expect(textarea.style.height).toBe("86px");
            expect(textarea.style.overflowY).toBe("hidden");

            cleanup?.();
            expect(Object.hasOwn(textarea.dataset, "autoResized")).toBe(false);
        });

        test("should not modify DOM when enabled is false", () => {
            const textarea = document.createElement("textarea");
            textarea.value = "Some text";
            container.append(textarea);

            const attach = autoResize(false);
            const cleanup = attach(textarea);

            expect(Object.hasOwn(textarea.dataset, "autoResized")).toBe(false);
            expect(textarea.style.height).toBe("");

            cleanup?.();
        });

        test("should expand on input and shrink on delete", () => {
            const textarea = document.createElement("textarea");
            textarea.style.boxSizing = "border-box";
            textarea.style.padding = "0px";
            textarea.style.border = "0px";
            container.append(textarea);

            let currentScrollHeight = 32;
            Object.defineProperty(textarea, "scrollHeight", {
                configurable: true,
                get: () => currentScrollHeight,
            });

            const attach = autoResize();
            const cleanup = attach(textarea);

            expect(textarea.style.height).toBe("32px");

            // User types multiple lines
            currentScrollHeight = 96;
            textarea.value = "Line 1\nLine 2\nLine 3\nLine 4";
            textarea.dispatchEvent(new Event("input"));

            expect(textarea.style.height).toBe("96px");

            // User deletes lines (shrinking)
            currentScrollHeight = 48;
            textarea.value = "Line 1\nLine 2";
            textarea.dispatchEvent(new Event("input"));

            expect(textarea.style.height).toBe("48px");

            cleanup?.();
        });
    });

    describe("Row Constraints (minRows & maxRows)", () => {
        test("should enforce minRows even with empty content", () => {
            const textarea = document.createElement("textarea");
            textarea.style.boxSizing = "border-box";
            textarea.style.padding = "0px";
            textarea.style.border = "0px";
            container.append(textarea);

            Object.defineProperty(textarea, "scrollHeight", {
                configurable: true,
                value: 20,
            });

            vi.spyOn(window, "getComputedStyle").mockReturnValue({
                display: "block",
                boxSizing: "border-box",
                lineHeight: "20px",
                fontSize: "16px",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                borderTopWidth: "0px",
                borderBottomWidth: "0px",
                borderLeftWidth: "0px",
                borderRightWidth: "0px",
            } as unknown as CSSStyleDeclaration);

            const attach = autoResize({ minRows: 3 });
            const cleanup = attach(textarea);

            // 3 rows * 20px = 60px minimum
            expect(textarea.style.height).toBe("60px");

            cleanup?.();
        });

        test("should clamp to maxRows and enable vertical scrollbar when exceeded", () => {
            const textarea = document.createElement("textarea");
            textarea.style.boxSizing = "border-box";
            textarea.style.padding = "0px";
            textarea.style.border = "0px";
            container.append(textarea);

            Object.defineProperty(textarea, "scrollHeight", {
                configurable: true,
                value: 200,
            });

            vi.spyOn(window, "getComputedStyle").mockReturnValue({
                display: "block",
                boxSizing: "border-box",
                lineHeight: "20px",
                fontSize: "16px",
                paddingTop: "0px",
                paddingBottom: "0px",
                paddingLeft: "0px",
                paddingRight: "0px",
                borderTopWidth: "0px",
                borderBottomWidth: "0px",
                borderLeftWidth: "0px",
                borderRightWidth: "0px",
            } as unknown as CSSStyleDeclaration);

            const attach = autoResize({ maxRows: 5 });
            const cleanup = attach(textarea);

            // 5 rows * 20px = 100px maximum
            expect(textarea.style.height).toBe("100px");
            expect(textarea.style.overflowY).toBe("auto");

            cleanup?.();
        });
    });

    describe("Pixel Constraints (minHeight & maxHeight)", () => {
        test("should enforce minHeight and maxHeight pixel boundaries", () => {
            const textarea = document.createElement("textarea");
            textarea.style.boxSizing = "border-box";
            textarea.style.padding = "0px";
            textarea.style.border = "0px";
            container.append(textarea);

            let currentScrollHeight = 30;
            Object.defineProperty(textarea, "scrollHeight", {
                configurable: true,
                get: () => currentScrollHeight,
            });

            const attach = autoResize({
                minHeight: 50,
                maxHeight: 120,
            });
            const cleanup = attach(textarea);

            // Below minHeight -> clamped to 50px
            expect(textarea.style.height).toBe("50px");

            // In-between -> exact height
            currentScrollHeight = 80;
            textarea.dispatchEvent(new Event("input"));
            expect(textarea.style.height).toBe("80px");

            // Exceeds maxHeight -> clamped to 120px with auto scroll
            currentScrollHeight = 250;
            textarea.dispatchEvent(new Event("input"));
            expect(textarea.style.height).toBe("120px");
            expect(textarea.style.overflowY).toBe("auto");

            cleanup?.();
        });
    });

    describe("Horizontal Resizing (Input)", () => {
        test("should resize input width horizontally based on text length", () => {
            const input = document.createElement("input");
            input.type = "text";
            input.value = "Short";
            container.append(input);

            const attach = autoResize({ axis: "horizontal", minWidth: 40, buffer: 10 });
            const cleanup = attach(input);

            expect(Object.hasOwn(input.dataset, "autoResized")).toBe(true);
            expect(input.style.width).not.toBe("");

            const initialWidth = Number(input.style.width.replace("px", ""));

            // User types longer content
            input.value = "A significantly longer search query string";
            input.dispatchEvent(new Event("input"));

            const expandedWidth = Number(input.style.width.replace("px", ""));
            expect(expandedWidth).toBeGreaterThan(initialWidth);

            cleanup?.();
        });

        test("should clamp horizontal input width to minWidth and maxWidth", () => {
            const input = document.createElement("input");
            input.type = "text";
            input.value = "";
            container.append(input);

            const attach = autoResize({
                axis: "horizontal",
                minWidth: 80,
                maxWidth: 200,
            });
            const cleanup = attach(input);

            // Empty input -> clamped to minWidth (80px)
            expect(input.style.width).toBe("80px");

            cleanup?.();
        });
    });

    describe("Form Reset & Content Mutation", () => {
        test("should recalculate dimensions on form reset", () => {
            vi.useFakeTimers();

            const form = document.createElement("form");
            const textarea = document.createElement("textarea");
            textarea.style.boxSizing = "border-box";
            textarea.style.padding = "0px";
            textarea.style.border = "0px";
            form.append(textarea);
            container.append(form);

            let currentScrollHeight = 120;
            Object.defineProperty(textarea, "scrollHeight", {
                configurable: true,
                get: () => currentScrollHeight,
            });

            const attach = autoResize();
            const cleanup = attach(textarea);

            expect(textarea.style.height).toBe("120px");

            // Form resets
            currentScrollHeight = 40;
            form.dispatchEvent(new Event("reset"));

            vi.advanceTimersByTime(10);
            expect(textarea.style.height).toBe("40px");

            cleanup?.();
            vi.useRealTimers();
        });
    });

    describe("Callback & Metric Reporting", () => {
        test("should trigger onResize callback with detailed metrics", () => {
            const textarea = document.createElement("textarea");
            textarea.style.boxSizing = "border-box";
            textarea.style.padding = "0px";
            textarea.style.border = "0px";
            container.append(textarea);

            Object.defineProperty(textarea, "scrollHeight", {
                configurable: true,
                value: 300,
            });

            const onResize = vi.fn<(detail: AutoResizeDetail) => void>();

            const attach = autoResize({
                maxHeight: 150,
                onResize,
            });
            const cleanup = attach(textarea);

            expect(onResize).toHaveBeenCalledTimes(1);
            expect(onResize).toHaveBeenCalledWith(
                expect.objectContaining({
                    element: textarea,
                    height: 150,
                    isClamped: true,
                    clampedAxis: "vertical",
                    clampedBoundary: "max",
                })
            );

            cleanup?.();
        });
    });

    describe("Scroll Position Preservation", () => {
        test("should restore element and parent scroll positions during vertical recalculation", () => {
            const scrollParent = document.createElement("div");
            scrollParent.style.overflow = "auto";
            scrollParent.style.height = "200px";

            const spacer = document.createElement("div");
            spacer.style.height = "1000px";

            const textarea = document.createElement("textarea");
            textarea.style.boxSizing = "border-box";
            textarea.value =
                "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10\nLine 11\nLine 12";
            scrollParent.append(textarea, spacer);
            container.append(scrollParent);

            const attach = autoResize({ maxHeight: 60 });
            const cleanup = attach(textarea);

            scrollParent.scrollTop = 150;
            textarea.scrollTop = 45;

            textarea.dispatchEvent(new Event("input"));

            expect(scrollParent.scrollTop).toBe(150);
            expect(textarea.scrollTop).toBe(45);

            cleanup?.();
        });
    });

    describe("ResizeObserver Axis Isolation", () => {
        test("should not observe element with ResizeObserver in horizontal mode", () => {
            const observeSpy = vi.fn();

            vi.stubGlobal(
                "ResizeObserver",
                class {
                    observe = observeSpy;
                    unobserve = vi.fn();
                    disconnect = vi.fn();
                }
            );

            const input = document.createElement("input");
            container.append(input);

            const attach = autoResize({ axis: "horizontal" });
            const cleanup = attach(input);

            expect(observeSpy).not.toHaveBeenCalled();

            cleanup?.();
            vi.unstubAllGlobals();
        });

        test("should observe element with ResizeObserver in vertical mode", () => {
            const observeSpy = vi.fn();

            vi.stubGlobal(
                "ResizeObserver",
                class {
                    observe = observeSpy;
                    unobserve = vi.fn();
                    disconnect = vi.fn();
                }
            );

            const textarea = document.createElement("textarea");
            container.append(textarea);

            const attach = autoResize({ axis: "vertical" });
            const cleanup = attach(textarea);

            expect(observeSpy).toHaveBeenCalledWith(textarea);

            cleanup?.();
            vi.unstubAllGlobals();
        });
    });

    describe("Clean Teardown & Style Restoration", () => {
        test("should restore original styles and remove event listeners on unmount", () => {
            const textarea = document.createElement("textarea");
            textarea.style.height = "100px";
            textarea.style.width = "200px";
            textarea.style.overflowY = "scroll";
            textarea.style.resize = "vertical";
            container.append(textarea);

            const attach = autoResize();
            const cleanup = attach(textarea);

            // Modified during active lifecycle
            expect(Object.hasOwn(textarea.dataset, "autoResized")).toBe(true);

            // Teardown
            cleanup?.();

            expect(Object.hasOwn(textarea.dataset, "autoResized")).toBe(false);
            expect(textarea.style.height).toBe("100px");
            expect(textarea.style.width).toBe("200px");
            expect(textarea.style.overflowY).toBe("scroll");
            expect(textarea.style.resize).toBe("vertical");
        });
    });
});
