import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { scrollFade } from "./scroll-fade.attach";

/**
 * Helper to mock scroll metrics on an element.
 */
function mockScrollMetrics(
    el: HTMLElement,
    metrics: {
        clientHeight?: number;
        scrollHeight?: number;
        scrollTop?: number;
        clientWidth?: number;
        scrollWidth?: number;
        scrollLeft?: number;
    }
): void {
    if (metrics.clientHeight !== undefined) {
        Object.defineProperty(el, "clientHeight", {
            value: metrics.clientHeight,
            configurable: true,
        });
    }
    if (metrics.scrollHeight !== undefined) {
        Object.defineProperty(el, "scrollHeight", {
            value: metrics.scrollHeight,
            configurable: true,
        });
    }
    if (metrics.scrollTop !== undefined) {
        Object.defineProperty(el, "scrollTop", {
            value: metrics.scrollTop,
            configurable: true,
            writable: true,
        });
    }
    if (metrics.clientWidth !== undefined) {
        Object.defineProperty(el, "clientWidth", {
            value: metrics.clientWidth,
            configurable: true,
        });
    }
    if (metrics.scrollWidth !== undefined) {
        Object.defineProperty(el, "scrollWidth", {
            value: metrics.scrollWidth,
            configurable: true,
        });
    }
    if (metrics.scrollLeft !== undefined) {
        Object.defineProperty(el, "scrollLeft", {
            value: metrics.scrollLeft,
            configurable: true,
            writable: true,
        });
    }
}

describe("scrollFade Svelte 5 Element Attachment", () => {
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
        test("should apply vertical linear gradient mask by default", () => {
            const div = document.createElement("div");
            container.append(div);

            const attach = scrollFade();
            const cleanup = attach(div);

            expect(div.style.maskImage).toContain("to bottom in oklch");
            expect(div.style.maskRepeat).toBe("no-repeat");
            expect(div.style.maskSize).toBe("100% 100%");

            cleanup?.();
        });

        test("should do nothing when enabled is false", () => {
            const div = document.createElement("div");
            container.append(div);

            const attach = scrollFade({ enabled: false });
            const cleanup = attach(div);

            expect(div.style.maskImage).toBe("");
            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("");

            cleanup?.();
        });
    });

    describe("Directions & Mask Generation", () => {
        test("should configure horizontal mask", () => {
            const div = document.createElement("div");
            container.append(div);

            const attach = scrollFade({ direction: "horizontal" });
            const cleanup = attach(div);

            expect(div.style.maskImage).toContain("to right in oklch");
            expect(div.style.maskRepeat).toBe("no-repeat");

            cleanup?.();
        });

        test("should configure both directions with intersect compositing", () => {
            const div = document.createElement("div");
            container.append(div);

            const attach = scrollFade({ direction: "both" });
            const cleanup = attach(div);

            expect(div.style.maskImage).toContain("to bottom in oklch");
            expect(div.style.maskImage).toContain("to right in oklch");
            expect(["intersect", "source-in"]).toContain(
                div.style.maskComposite || div.style.webkitMaskComposite
            );

            cleanup?.();
        });
    });

    describe("Vertical Scroll State Calculations", () => {
        test("should show bottom fade only when scrolled to top", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 0 });

            const attach = scrollFade({ size: 40 });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("0px");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("40px");

            cleanup?.();
        });

        test("should show both top and bottom fade when scrolled in middle", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 150 });

            const attach = scrollFade({ size: 40 });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("40px");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("40px");

            cleanup?.();
        });

        test("should show top fade only when scrolled to bottom", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 400 });

            const attach = scrollFade({ size: 40 });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("40px");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("0px");

            cleanup?.();
        });

        test("should show no fades when content does not overflow", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 300, scrollHeight: 300, scrollTop: 0 });

            const attach = scrollFade({ size: 40 });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("0px");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("0px");

            cleanup?.();
        });
    });

    describe("Smooth Scaling & Snapping", () => {
        test("should smoothly scale fade size when smooth is true", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 15 });

            const attach = scrollFade({ size: 40, smooth: true });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("15px");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("40px");

            cleanup?.();
        });

        test("should snap directly to max size when smooth is false", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 5 });

            const attach = scrollFade({ size: 40, smooth: false });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("40px");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("40px");

            cleanup?.();
        });
    });

    describe("Edge Filtering ('start' / 'end')", () => {
        test("should only fade start edge when edges is 'start'", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 100 });

            const attach = scrollFade({ size: 40, edges: "start" });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("40px");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("0px");

            cleanup?.();
        });

        test("should only fade end edge when edges is 'end'", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 100 });

            const attach = scrollFade({ size: 40, edges: "end" });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("0px");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("40px");

            cleanup?.();
        });
    });

    describe("Edge Case Clamping (iOS / Safari Bounce)", () => {
        test("should clamp negative scrollTop during rubber-band bounce", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: -25 });

            const attach = scrollFade({ size: 40 });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("0px");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("40px");

            cleanup?.();
        });

        test("should clamp excessive scrollTop beyond maxScrollTop during bounce", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 450 });

            const attach = scrollFade({ size: 40 });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("40px");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("0px");

            cleanup?.();
        });
    });

    describe("onFadeChange Callback", () => {
        test("should invoke onFadeChange with comprehensive scroll detail", () => {
            const onFadeChange = vi.fn();
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 100 });

            const attach = scrollFade({ size: 40, onFadeChange });
            const cleanup = attach(div);

            expect(onFadeChange).toHaveBeenCalledWith(
                expect.objectContaining({
                    element: div,
                    vertical: expect.objectContaining({
                        canScrollStart: true,
                        canScrollEnd: true,
                        isScrollable: true,
                        startFade: 40,
                        endFade: 40,
                    }),
                })
            );

            cleanup?.();
        });
    });

    describe("Size Presets & Resolution", () => {
        test("should apply sm preset (24px)", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 0 });

            const attach = scrollFade({ size: "sm" });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("24px");
            cleanup?.();
        });

        test("should apply md preset (40px) by default", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 0 });

            const attach = scrollFade();
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("40px");
            cleanup?.();
        });

        test("should apply lg preset (64px)", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 0 });

            const attach = scrollFade({ size: "lg" });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("64px");
            cleanup?.();
        });

        test("should apply custom numeric size (e.g. 55px)", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 0 });

            const attach = scrollFade({ size: 55 });
            const cleanup = attach(div);

            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("55px");
            cleanup?.();
        });
    });

    describe("Teardown & Cleanup Lifecycle", () => {
        test("should remove all CSS custom properties and mask declarations upon cleanup", () => {
            const div = document.createElement("div");
            container.append(div);
            mockScrollMetrics(div, { clientHeight: 200, scrollHeight: 600, scrollTop: 100 });

            const attach = scrollFade();
            const cleanup = attach(div);

            expect(div.style.maskImage).not.toBe("");
            expect(div.style.getPropertyValue("--scroll-fade-top")).not.toBe("");

            cleanup?.();

            expect(div.style.maskImage).toBe("");
            expect(div.style.webkitMaskImage).toBe("");
            expect(div.style.maskRepeat).toBe("");
            expect(div.style.webkitMaskRepeat).toBe("");
            expect(div.style.maskSize).toBe("");
            expect(div.style.webkitMaskSize).toBe("");
            expect(div.style.getPropertyValue("--scroll-fade-top")).toBe("");
            expect(div.style.getPropertyValue("--scroll-fade-bottom")).toBe("");
            expect(div.style.getPropertyValue("--scroll-fade-left")).toBe("");
            expect(div.style.getPropertyValue("--scroll-fade-right")).toBe("");
        });
    });
});
