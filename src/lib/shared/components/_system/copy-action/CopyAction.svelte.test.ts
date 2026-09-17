import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import CopyAction from "./CopyAction.svelte";

describe("CopyAction", () => {
    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[];

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [];
    });

    afterEach(async () => {
        for (const component of mounted.toReversed()) await unmount(component);
        app.remove();
        vi.restoreAllMocks();
    });

    const render = (props: Record<string, unknown> = {}): HTMLElement => {
        mounted.push(mount(CopyAction, { target: app, props }));
        flushSync();
        return app.children.item(mounted.length - 1) as HTMLElement;
    };

    test("renders default button with copy SVG and default size", () => {
        const el = render();
        expect(el.tagName.toLowerCase()).toBe("button");
        expect(el.getAttribute("type")).toBe("button");
        expect(el.classList).toContain("size-16px");
        expect(el.getAttribute("aria-label")).toBe("Copy to clipboard");

        const copySvg = el.querySelector(".copy-icon");
        expect(copySvg).not.toBeNull();
        expect(copySvg?.classList).not.toContain("is-hidden");

        const checkSvg = el.querySelector(".check-icon");
        expect(checkSvg).not.toBeNull();
        expect(checkSvg?.classList).not.toContain("is-active");
    });

    test("renders as a span when as='span'", () => {
        const el = render({ as: "span" });
        expect(el.tagName.toLowerCase()).toBe("span");
        expect(el.hasAttribute("type")).toBe(false);
        expect(el.classList).toContain("pointer-events-none");
    });

    test("switches to copied state on click with celebration sparkles", () => {
        const el = render();
        expect(el.querySelector(".particles")).toBeNull();

        el.click();
        flushSync();

        expect(el.classList).toContain("text-success-500");
        expect(el.getAttribute("aria-label")).toBe("Copied");

        const checkSvg = el.querySelector(".check-icon");
        expect(checkSvg?.classList).toContain("is-active");

        const copySvg = el.querySelector(".copy-icon");
        expect(copySvg?.classList).toContain("is-hidden");

        const particles = el.querySelector(".particles");
        expect(particles).not.toBeNull();
        expect(particles?.children).toHaveLength(6);
    });

    test("resets back to initial state after duration", () => {
        vi.useFakeTimers();
        const el = render({ duration: 1000 });

        el.click();
        flushSync();
        expect(el.querySelector(".check-icon")?.classList).toContain("is-active");

        vi.advanceTimersByTime(1000);
        flushSync();

        expect(el.querySelector(".check-icon")?.classList).not.toContain("is-active");
        expect(el.querySelector(".copy-icon")?.classList).not.toContain("is-hidden");
        expect(el.querySelector(".particles")).toBeNull();
        expect(el.classList).not.toContain("text-success-500");
        expect(el.getAttribute("aria-label")).toBe("Copy to clipboard");
        vi.useRealTimers();
    });

    test("respects controlled copied prop", () => {
        const el = render({ copied: true });
        expect(el.classList).toContain("text-success-500");
        expect(el.querySelector(".check-icon")?.classList).toContain("is-active");
        expect(el.querySelector(".copy-icon")?.classList).toContain("is-hidden");
        expect(el.querySelector(".particles")).not.toBeNull();
    });

    test("respects controlled status='error' prop", () => {
        const el = render({ status: "error" });
        expect(el.classList).toContain("text-danger-500");
        expect(el.getAttribute("aria-label")).toBe("Failed to copy");
        expect(el.querySelector(".x-icon")?.classList).toContain("is-active");
        expect(el.querySelector(".check-icon")?.classList).not.toContain("is-active");
        expect(el.querySelector(".copy-icon")?.classList).toContain("is-hidden");
        expect(el.querySelector(".particles")?.classList).toContain("is-error");
    });

    test("handles rejected promise in onclick by switching to error state", async () => {
        const el = render({
            onclick: () => Promise.reject(new Error("Network Error")),
        });

        el.click();
        await flushSync();
        // Wait microtask for promise resolution
        await new Promise((resolve) => setTimeout(resolve, 10));
        flushSync();

        expect(el.classList).toContain("text-danger-500");
        expect(el.getAttribute("aria-label")).toBe("Failed to copy");
        expect(el.querySelector(".x-icon")?.classList).toContain("is-active");
        expect(el.querySelector(".particles")?.classList).toContain("is-error");
    });

    test("allows overriding size and custom classes", () => {
        const el = render({ class: "size-5 text-weak" });
        expect(el.classList).toContain("size-5");
        expect(el.classList).toContain("text-weak");
    });
});
