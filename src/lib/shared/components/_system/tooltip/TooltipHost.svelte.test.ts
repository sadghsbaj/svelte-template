import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import FloatingLayerFixture from "$components/_system/floating/__fixtures__/FloatingLayerFixture.svelte";

import TooltipFixture from "./__fixtures__/TooltipFixture.svelte";

const nextFrame = (): Promise<void> =>
    new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

describe("TooltipHost", () => {
    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[];

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [mount(FloatingLayerFixture, { target: app })];
    });

    afterEach(async () => {
        vi.useRealTimers();
        for (const component of mounted.toReversed()) await unmount(component);
        document.body.replaceChildren();
        vi.restoreAllMocks();
    });

    function render(input?: Record<string, unknown>): HTMLButtonElement {
        mounted.push(mount(TooltipFixture, { target: app, props: input ? { input } : {} }));
        flushSync();
        const trigger = app.querySelector<HTMLButtonElement>("#tooltip-trigger");
        if (!trigger) throw new Error("Tooltip trigger was not rendered");
        vi.spyOn(trigger, "getBoundingClientRect").mockReturnValue(new DOMRect(100, 100, 40, 24));
        return trigger;
    }

    test("opens immediately on focus and preserves an existing description", async () => {
        const trigger = render();
        trigger.focus();
        flushSync();
        await nextFrame();

        const content = document.querySelector<HTMLElement>("[role='tooltip']");
        expect(content?.textContent).toContain("Fixture tooltip");
        expect(trigger.getAttribute("aria-describedby")).toBe("existing-description app-tooltip");
        expect(content?.dataset.tooltipPhase).toBe("open");

        trigger.blur();
        flushSync();
        await Promise.resolve();
        flushSync();
        expect(document.querySelector("[role='tooltip']")).toBeNull();
        expect(trigger.getAttribute("aria-describedby")).toBe("existing-description");
    });

    test("waits for the pointer delay but ignores touch hover", async () => {
        vi.useFakeTimers();
        const trigger = render({
            content: "Delayed tooltip",
            openDelay: 400,
            closeDelay: 0,
            animation: "none",
        });

        trigger.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "touch" }));
        vi.advanceTimersByTime(500);
        flushSync();
        expect(document.querySelector("[role='tooltip']")).toBeNull();

        trigger.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
        vi.advanceTimersByTime(399);
        flushSync();
        expect(document.querySelector("[role='tooltip']")).toBeNull();

        vi.advanceTimersByTime(1);
        flushSync();
        await vi.runAllTimersAsync();
        expect(document.querySelector("[role='tooltip']")?.textContent).toContain("Delayed tooltip");
    });

    test("renders structured semantic content with the requested placement", async () => {
        const trigger = render({
            title: "Connection lost",
            description: "Changes remain on this device.",
            placement: "right",
            offset: 12,
            openDelay: 0,
            closeDelay: 0,
            animation: "none",
        });
        trigger.focus();
        flushSync();
        await nextFrame();

        const content = document.querySelector<HTMLElement>("[role='tooltip']");
        expect(content?.textContent).toContain("Connection lost");
        expect(content?.textContent).toContain("Changes remain on this device.");
        expect(content?.classList).toContain("bg-base-solid-1");
        expect(content?.dataset.placement).toBe("right");
    });

    test("Escape closes without moving focus", async () => {
        const trigger = render();
        trigger.focus();
        flushSync();
        await nextFrame();
        expect(document.querySelector("[role='tooltip']")).not.toBeNull();

        window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
        flushSync();
        await Promise.resolve();
        flushSync();

        expect(document.querySelector("[role='tooltip']")).toBeNull();
        expect(document.activeElement).toBe(trigger);
    });

    test("pointer activation does not reopen the tooltip through focus", async () => {
        const trigger = render();
        trigger.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
        flushSync();
        await nextFrame();
        expect(document.querySelector("[role='tooltip']")).not.toBeNull();

        trigger.dispatchEvent(
            new PointerEvent("pointerdown", { pointerType: "mouse", bubbles: true })
        );
        await Promise.resolve();
        trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        flushSync();
        await Promise.resolve();
        flushSync();

        expect(document.querySelector("[role='tooltip']")).toBeNull();

        trigger.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
        trigger.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
        flushSync();
        await nextFrame();
        expect(document.querySelector("[role='tooltip']")).not.toBeNull();

        trigger.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
        flushSync();
        await Promise.resolve();
        flushSync();
        expect(document.querySelector("[role='tooltip']")).toBeNull();

        trigger.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
        trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
        flushSync();
        await nextFrame();
        expect(document.querySelector("[role='tooltip']")).not.toBeNull();
    });

    test("switches content immediately while moving quickly between triggers", async () => {
        const first = render();
        const second = app.querySelector<HTMLButtonElement>("#tooltip-trigger-second");
        if (!second) throw new Error("Second tooltip trigger was not rendered");
        vi.spyOn(second, "getBoundingClientRect").mockReturnValue(new DOMRect(180, 100, 40, 24));

        first.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
        flushSync();
        await nextFrame();
        expect(document.querySelector("[role='tooltip']")?.textContent).toContain("Fixture tooltip");

        first.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
        second.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
        flushSync();
        await nextFrame();

        const content = document.querySelector<HTMLElement>("[role='tooltip']");
        expect(content?.textContent).toContain("Second tooltip");
        expect(content?.textContent).toContain("Second description");
        expect(content?.classList).toContain("py-8px");
        expect(content?.classList).toContain("grid-cols-[14px_minmax(0,1fr)_auto]");
        expect(content?.querySelector("[data-leading]")?.parentElement?.classList).toContain(
            "self-center"
        );
        expect(content?.querySelector("[data-trailing]")?.parentElement?.classList).toContain(
            "col-start-3"
        );
    });
});
