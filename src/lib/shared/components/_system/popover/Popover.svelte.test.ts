import { flushSync, mount, unmount, type ComponentProps } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import FloatingLayerFixture from "$components/_system/floating/__fixtures__/FloatingLayerFixture.svelte";

import NestedPopoverFixture from "./__fixtures__/NestedPopoverFixture.svelte";
import PopoverFixture from "./__fixtures__/PopoverFixture.svelte";
import type { PopoverChangeDetail, PopoverDismissDetail } from "./popover.types";

const settle = async (): Promise<void> => {
    await Promise.resolve();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await Promise.resolve();
};

describe("Popover", () => {
    interface FixtureExports {
        setOpen: (value: boolean) => void;
        setDisabled: (value: boolean) => void;
        getOpen: () => boolean;
        getContent: () => HTMLDivElement | null | undefined;
        getTrigger: () => HTMLElement | null | undefined;
    }

    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[];

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [mount(FloatingLayerFixture, { target: app })];
    });

    afterEach(async () => {
        for (const component of mounted.toReversed()) await unmount(component);
        document.body.replaceChildren();
        vi.restoreAllMocks();
    });

    const fixture = (
        props: Partial<ComponentProps<typeof PopoverFixture>> = {}
    ): FixtureExports => {
        const component = mount(PopoverFixture, { target: app, props });
        flushSync();
        mounted.push(component);
        return component as FixtureExports;
    };

    test("renders no trigger wrapper and manages trigger ARIA non-destructively", async () => {
        const component = fixture();
        const trigger = component.getTrigger() as HTMLButtonElement;
        expect(trigger.parentElement).toBe(app);
        expect(trigger.id).toMatch(/^popover-.+-trigger$/);
        expect(trigger.getAttribute("aria-expanded")).toBe("false");
        expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
        expect(trigger.hasAttribute("aria-controls")).toBe(false);

        trigger.click();
        await settle();
        const content = component.getContent() as HTMLDivElement;
        expect(trigger.getAttribute("aria-expanded")).toBe("true");
        expect(trigger.getAttribute("aria-controls")).toBe(content.id);
        expect(content.getAttribute("role")).toBe("dialog");
        expect(content.getAttribute("aria-label")).toBe("Fixture popover");
        expect(content.classList.contains("consumer-content")).toBe(true);

        await unmount(component);
        mounted.splice(mounted.indexOf(component), 1);
        expect(trigger.id).toBe("consumer-trigger");
        expect(trigger.getAttribute("aria-expanded")).toBe("true");
    });

    test("respects defaultPrevented and disabled, then closes when disabled", async () => {
        const prevented = fixture({ preventTriggerClick: true });
        (prevented.getTrigger() as HTMLButtonElement).click();
        await Promise.resolve();
        expect(prevented.getOpen()).toBe(false);

        const dismiss = vi.fn<(detail: PopoverDismissDetail) => boolean>(() => false);
        const component = fixture({ initialDisabled: true, onDismiss: dismiss });
        (component.getTrigger() as HTMLButtonElement).click();
        expect(component.getOpen()).toBe(false);
        flushSync(() => component.setDisabled(false));
        (component.getTrigger() as HTMLButtonElement).click();
        await settle();
        expect(component.getOpen()).toBe(true);
        flushSync(() => component.setDisabled(true));
        await settle();
        expect(component.getOpen()).toBe(false);
        expect(component.getContent()).toBeNull();
        expect(dismiss).toHaveBeenCalledWith(expect.objectContaining({ reason: "programmatic" }));
    });

    test("reports direct binding changes once with programmatic reasons", async () => {
        const changes = vi.fn<(open: boolean, detail: PopoverChangeDetail) => void>();
        const component = fixture({ onOpenChange: changes });
        flushSync(() => component.setOpen(true));
        await settle();
        expect(changes).toHaveBeenCalledTimes(1);
        expect(changes.mock.calls[0]?.[0]).toBe(true);
        expect(changes.mock.calls[0]?.[1].reason).toBe("programmatic");

        flushSync(() => component.setOpen(false));
        await settle();
        expect(changes).toHaveBeenCalledTimes(2);
        expect(changes.mock.calls[1]?.[1].reason).toBe("programmatic");
    });

    test("allows dismiss cancellation", async () => {
        const dismiss = vi.fn<(detail: PopoverDismissDetail) => boolean>(() => false);
        const component = fixture({ initialOpen: true, onDismiss: dismiss });
        await settle();
        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        await Promise.resolve();
        expect(dismiss).toHaveBeenCalledWith(
            expect.objectContaining({ reason: "outside-pointer" })
        );
        expect(component.getOpen()).toBe(true);
    });

    test("only dismisses the topmost popover for outside pointer and Escape", async () => {
        const first = fixture({ initialOpen: true });
        const second = fixture({ initialOpen: true });
        await settle();

        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await settle();
        expect(second.getOpen()).toBe(false);
        expect(first.getOpen()).toBe(true);

        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        await settle();
        expect(first.getOpen()).toBe(false);
    });

    test("a topmost Escape opt-out does not dismiss its parent stack entry", async () => {
        const first = fixture({ initialOpen: true });
        const second = fixture({ initialOpen: true, dismiss: { escape: false } });
        await settle();
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await Promise.resolve();
        expect(second.getOpen()).toBe(true);
        expect(first.getOpen()).toBe(true);
    });

    test("applies modal semantics, app blocking, and initial focus", async () => {
        const component = fixture({ initialOpen: true, modal: true });
        await settle();
        const content = component.getContent() as HTMLDivElement;
        expect(content.getAttribute("aria-modal")).toBe("true");
        expect(app.inert).toBe(true);
        expect(document.activeElement).toBe(content.querySelector("#first-focus"));

        flushSync(() => component.setOpen(false));
        await settle();
        expect(app.inert).toBe(false);
    });

    test("restores focus for Escape but not outside pointer", async () => {
        const component = fixture();
        const trigger = component.getTrigger() as HTMLButtonElement;
        trigger.focus();
        trigger.dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
        await settle();
        expect(document.activeElement).toBe(
            (component.getContent() as HTMLDivElement).querySelector("#first-focus")
        );
        document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
        await settle();
        expect(document.activeElement).toBe(trigger);

        trigger.click();
        await settle();
        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        await settle();
        expect(document.activeElement).not.toBe(trigger);
    });

    test("uses an explicit anchor before the trigger and dismisses when it detaches", async () => {
        const explicitAnchor = document.createElement("div");
        app.append(explicitAnchor);
        vi.spyOn(explicitAnchor, "getBoundingClientRect").mockReturnValue(
            new DOMRect(20, 30, 37, 11)
        );
        const component = fixture({ initialOpen: true, anchor: explicitAnchor });
        await settle();
        const floating = (component.getContent() as HTMLDivElement).parentElement
            ?.parentElement as HTMLDivElement;
        expect(floating.style.getPropertyValue("--floating-anchor-width")).toBe("37px");

        explicitAnchor.remove();
        await Promise.resolve();
        await settle();
        expect(component.getOpen()).toBe(false);
    });

    test("survives rapid direct close and reopen without stale unmounts", async () => {
        const component = fixture();
        flushSync(() => component.setOpen(true));
        flushSync(() => component.setOpen(false));
        flushSync(() => component.setOpen(true));
        await settle();
        expect(component.getOpen()).toBe(true);
        expect(component.getContent()?.dataset.popoverPhase).toBe("open");
    });

    test("maps semantic roles to trigger ARIA and honors explicit focus", async () => {
        const component = fixture({
            initialOpen: true,
            role: "menu",
            initialFocus: "#last-focus",
        });
        await settle();
        expect(component.getTrigger()?.getAttribute("aria-haspopup")).toBe("menu");
        expect(component.getContent()?.getAttribute("role")).toBe("menu");
        expect(document.activeElement?.id).toBe("last-focus");
    });

    test("assigns and reindexes bounded local stack z-indices", async () => {
        const first = fixture({ initialOpen: true });
        const second = fixture({ initialOpen: true });
        await settle();
        const firstFloating = first.getContent()?.parentElement?.parentElement as HTMLDivElement;
        const secondFloating = second.getContent()?.parentElement?.parentElement as HTMLDivElement;
        expect(firstFloating.style.zIndex).toBe("1");
        expect(secondFloating.style.zIndex).toBe("2");

        flushSync(() => second.setOpen(false));
        await settle();
        expect(firstFloating.style.zIndex).toBe("1");
    });

    test("keeps nested portal branches inside and dismisses only the topmost child", async () => {
        const nested = mount(NestedPopoverFixture, { target: app });
        mounted.push(nested);
        flushSync();
        await settle();

        document.querySelector<HTMLButtonElement>('[data-nested="child-trigger"]')?.click();
        await settle();
        document
            .querySelector<HTMLButtonElement>('[data-nested="child-inside"]')
            ?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        expect(nested.isChildOpen()).toBe(true);
        expect(nested.isParentOpen()).toBe(true);

        document
            .querySelector<HTMLButtonElement>('[data-nested="parent-inside"]')
            ?.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        await settle();
        expect(nested.isChildOpen()).toBe(false);
        expect(nested.isParentOpen()).toBe(true);

        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        await settle();
        expect(nested.isParentOpen()).toBe(false);
    });
});
