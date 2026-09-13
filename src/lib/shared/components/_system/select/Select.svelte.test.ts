import { flushSync, mount, unmount, type ComponentProps } from "svelte";
import { Apple } from "@lucide/svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import FloatingLayerFixture from "$components/_system/floating/__fixtures__/FloatingLayerFixture.svelte";

import SelectFixture from "./__fixtures__/SelectFixture.svelte";
import type { SelectOption } from "./select.types";

const OPTIONS: readonly SelectOption[] = [
    { value: "apple", label: "Apple", icon: Apple },
    { value: "apricot", label: "Apricot", disabled: true },
    { value: "banana", label: "Banana" },
    { value: "cherry", label: "Cherry" },
];

const settle = async (): Promise<void> => {
    await Promise.resolve();
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await Promise.resolve();
};

const press = (element: HTMLElement, key: string): KeyboardEvent => {
    const event = new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true });
    element.dispatchEvent(event);
    return event;
};

describe("Select", () => {
    interface FixtureExports {
        getValue: () => string | undefined;
        setValue: (value: string | undefined) => void;
        setOptions: (options: readonly SelectOption[]) => void;
    }

    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[];

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [mount(FloatingLayerFixture, { target: app })];
        vi.spyOn(Element.prototype, "animate").mockReturnValue({
            finished: Promise.resolve(),
            cancel: vi.fn(),
        } as unknown as Animation);
    });

    afterEach(async () => {
        for (const component of mounted.toReversed()) await unmount(component);
        document.body.replaceChildren();
        vi.restoreAllMocks();
    });

    const fixture = (props: Partial<ComponentProps<typeof SelectFixture>> = {}): FixtureExports => {
        const component = mount(SelectFixture, {
            target: app,
            props: { initialOptions: OPTIONS, ...props },
        });
        flushSync();
        mounted.push(component);
        return component as FixtureExports;
    };

    const trigger = (): HTMLButtonElement =>
        app.querySelector<HTMLButtonElement>(
            'button[aria-haspopup="listbox"]'
        ) as HTMLButtonElement;
    const listbox = (): HTMLDivElement | null =>
        document.querySelector<HTMLDivElement>('[role="listbox"]');
    const option = (label: string): HTMLDivElement =>
        [...document.querySelectorAll<HTMLDivElement>('[role="option"]')].find((item) =>
            item.textContent?.trim().startsWith(label)
        ) as HTMLDivElement;

    const open = async (): Promise<void> => {
        trigger().click();
        await settle();
    };

    test("renders placeholder, bound values, forwarded trigger attributes, and selection ARIA", async () => {
        const component = fixture({ placeholder: "Choose fruit" });
        expect(trigger().textContent).toContain("Choose fruit");
        expect(trigger().type).toBe("button");
        expect(trigger().dataset.consumer).toBe("forwarded");
        expect(trigger().classList.contains("fixture-trigger")).toBe(true);
        expect(trigger().getAttribute("aria-expanded")).toBe("false");

        flushSync(() => component.setValue("banana"));
        expect(trigger().textContent).toContain("Banana");
        await open();
        expect(listbox()?.dataset.popoverPhase).toBe("open");
        expect(listbox()?.getAttribute("aria-label")).toBe("Fruit");
        expect(listbox()?.hasAttribute("aria-labelledby")).toBe(false);
        expect(listbox()?.classList.contains("fixture-content")).toBe(true);
        expect(document.querySelectorAll('[role="option"]')).toHaveLength(4);
        expect(option("Banana").getAttribute("aria-selected")).toBe("true");
        expect(option("Apricot").getAttribute("aria-disabled")).toBe("true");
        expect(
            new Set([...document.querySelectorAll('[role="option"]')].map((item) => item.id)).size
        ).toBe(4);
    });

    test("selects by pointer once, closes, and restores focus", async () => {
        const change = vi.fn<(value: string) => void>();
        const component = fixture({ onValueChange: change });
        trigger().focus();
        await open();
        option("Banana").focus();
        option("Banana").click();
        await settle();
        expect(component.getValue()).toBe("banana");
        expect(change).toHaveBeenCalledOnce();
        expect(change).toHaveBeenCalledWith("banana");
        expect(trigger().getAttribute("aria-expanded")).toBe("false");
        expect(document.activeElement).toBe(trigger());

        await open();
        option("Banana").click();
        await settle();
        expect(change).toHaveBeenCalledOnce();
    });

    test("opens Down/Up at the intended option and navigates while skipping disabled", async () => {
        fixture({ initialValue: "banana" });
        trigger().focus();
        expect(press(trigger(), "ArrowDown").defaultPrevented).toBe(true);
        await settle();
        expect(document.activeElement).toBe(option("Banana"));
        press(option("Banana"), "ArrowUp");
        expect(document.activeElement).toBe(option("Apple"));
        press(option("Apple"), "ArrowDown");
        expect(document.activeElement).toBe(option("Banana"));
        press(option("Banana"), "Home");
        expect(document.activeElement).toBe(option("Apple"));
        press(option("Apple"), "End");
        expect(document.activeElement).toBe(option("Cherry"));

        press(document.activeElement as HTMLElement, "Escape");
        await settle();
        expect(listbox()).toBeNull();
        press(trigger(), "ArrowUp");
        await settle();
        expect(document.activeElement).toBe(option("Banana"));
    });

    test("selects with Enter and Space, while Escape makes no change", async () => {
        const change = vi.fn<(value: string) => void>();
        const component = fixture({ onValueChange: change });
        press(trigger(), "ArrowDown");
        await settle();
        press(option("Apple"), "ArrowDown");
        press(option("Banana"), "Enter");
        await settle();
        expect(component.getValue()).toBe("banana");

        press(trigger(), "ArrowDown");
        await settle();
        press(option("Banana"), "ArrowDown");
        press(option("Cherry"), " ");
        await settle();
        expect(component.getValue()).toBe("cherry");
        expect(change).toHaveBeenCalledTimes(2);

        press(trigger(), "ArrowDown");
        await settle();
        press(option("Cherry"), "ArrowDown");
        press(document.activeElement as HTMLElement, "Escape");
        await settle();
        expect(component.getValue()).toBe("cherry");
        expect(change).toHaveBeenCalledTimes(2);
    });

    test("opens from the trigger with native Enter and Space activation", async () => {
        fixture({ initialValue: "banana" });
        trigger().focus();
        press(trigger(), "Enter");
        trigger().dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
        await settle();
        expect(document.activeElement).toBe(option("Banana"));
        press(option("Banana"), "Escape");
        await settle();

        trigger().focus();
        press(trigger(), " ");
        trigger().dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 }));
        await settle();
        expect(document.activeElement).toBe(option("Banana"));
    });

    test("supports closed and open typeahead", async () => {
        fixture();
        trigger().focus();
        expect(press(trigger(), "b").defaultPrevented).toBe(true);
        await settle();
        expect(document.activeElement).toBe(option("Banana"));
        press(option("Banana"), "c");
        expect(document.activeElement).toBe(option("Cherry"));
    });

    test("closes on Tab and transfers focus naturally after the trigger", async () => {
        fixture();
        press(trigger(), "ArrowDown");
        await settle();
        press(option("Apple"), "End");
        press(option("Cherry"), "Tab");
        await settle();
        expect(document.activeElement).toBe(app.querySelector("[data-following]"));
        expect(listbox()).toBeNull();
    });

    test("applies sizes, selected checks, and disabled interaction", async () => {
        fixture({ initialValue: "apple", size: "lg" });
        expect(trigger().className).toContain("h-44px");
        const chevron = trigger().querySelector<SVGElement>(".lucide-chevron-down");
        expect(chevron?.classList.contains("t-rotate-200-cubic-out")).toBe(true);
        await open();
        expect(chevron?.classList.contains("rotate-180")).toBe(true);
        expect(option("Apple").className).toContain("min-h-40px");
        expect(trigger().querySelector(".lucide-apple")).toBeTruthy();
        expect(option("Apple").querySelector(".lucide-apple")).toBeTruthy();
        expect(option("Apple").querySelector(".lucide-check")).toBeTruthy();
        expect(option("Apricot").className).not.toContain("opacity-45");
        expect(option("Apricot").style.cursor).toBe("not-allowed");
        expect(option("Apricot").tabIndex).toBe(-1);
        option("Apricot").click();
        expect(trigger().textContent).toContain("Apple");

        const disabledComponent = fixture({ disabled: true });
        const disabledTrigger = [
            ...app.querySelectorAll<HTMLButtonElement>('button[aria-haspopup="listbox"]'),
        ].at(-1) as HTMLButtonElement;
        expect(disabledTrigger.disabled).toBe(false);
        expect(disabledTrigger.getAttribute("aria-disabled")).toBe("true");
        disabledTrigger.click();
        await settle();
        expect(disabledComponent.getValue()).toBeUndefined();
    });

    test("normalizes stale dynamic values without callbacks and handles empty or all-disabled data", async () => {
        const change = vi.fn<(value: string) => void>();
        const component = fixture({ initialValue: "banana", onValueChange: change });
        flushSync(() => component.setOptions([{ value: "apple", label: "Apple" }]));
        await Promise.resolve();
        expect(component.getValue()).toBeUndefined();
        expect(change).not.toHaveBeenCalled();

        flushSync(() => component.setOptions([]));
        press(trigger(), "ArrowDown");
        await settle();
        expect(listbox()).toBeTruthy();
        expect(document.querySelectorAll('[role="option"]')).toHaveLength(0);
        press(trigger(), "Escape");
        await settle();

        flushSync(() => component.setOptions([{ value: "none", label: "None", disabled: true }]));
        press(trigger(), "ArrowDown");
        await settle();
        expect(option("None").tabIndex).toBe(-1);
        expect(document.activeElement).not.toBe(option("None"));
    });

    test("keeps duplicate values deterministic with unique option ids", async () => {
        fixture({
            initialValue: "same",
            initialOptions: [
                { value: "same", label: "First" },
                { value: "same", label: "Second" },
            ],
        });
        await open();
        const duplicates = [...document.querySelectorAll<HTMLElement>('[role="option"]')];
        expect(duplicates.map((item) => item.id)).toHaveLength(2);
        expect(new Set(duplicates.map((item) => item.id)).size).toBe(2);
        expect(duplicates.filter((item) => item.ariaSelected === "true")).toHaveLength(1);
    });

    test("serializes forms, disables only the proxy, focuses invalid triggers, and resets", async () => {
        const component = fixture({
            initialValue: "apple",
            name: "fruit",
            required: true,
            withForm: true,
        });
        const form = app.querySelector("form") as HTMLFormElement;
        const proxy = form.querySelector("select") as HTMLSelectElement;
        expect(listbox()).toBeNull();
        expect(proxy.getAttribute("aria-hidden")).toBe("true");
        expect(new FormData(form).get("fruit")).toBe("apple");

        flushSync(() => component.setValue("banana"));
        expect(new FormData(form).get("fruit")).toBe("banana");
        form.reset();
        await Promise.resolve();
        flushSync();
        expect(component.getValue()).toBe("apple");

        flushSync(() => component.setValue(undefined));
        expect(form.checkValidity()).toBe(false);
        proxy.dispatchEvent(new Event("invalid", { cancelable: true }));
        expect(document.activeElement).toBe(trigger());

        fixture({ initialValue: "apple", name: "disabledFruit", disabled: true, withForm: true });
        const proxies = app.querySelectorAll<HTMLSelectElement>("select");
        expect(proxies[1]?.disabled).toBe(true);
        expect(new FormData(proxies[1]?.form as HTMLFormElement).has("disabledFruit")).toBe(false);
    });

    test("uses the Floating anchor width and available-height CSS variables", async () => {
        fixture();
        const stableAnchor = trigger().parentElement as HTMLSpanElement;
        vi.spyOn(stableAnchor, "getBoundingClientRect").mockReturnValue(
            new DOMRect(20, 20, 187, 40)
        );
        vi.spyOn(trigger(), "getBoundingClientRect").mockReturnValue(new DOMRect(23, 22, 181, 38));
        await open();
        const floating = listbox()?.parentElement?.parentElement as HTMLDivElement;
        expect(floating.style.getPropertyValue("--floating-anchor-width")).toBe("187px");
        expect(listbox()?.className).toContain("min-w-[var(--floating-anchor-width)]");
        expect(listbox()?.className).toContain("max-h-[var(--floating-available-height)]");
    });

    test("measures natural content before sizing and flips near the viewport bottom", async () => {
        fixture();
        const stableAnchor = trigger().parentElement as HTMLSpanElement;
        vi.spyOn(stableAnchor, "getBoundingClientRect").mockReturnValue(
            new DOMRect(100, window.innerHeight - 30, 160, 40)
        );

        trigger().click();
        await Promise.resolve();
        flushSync();

        const content = listbox();
        const floating = content?.parentElement?.parentElement as HTMLDivElement;
        expect(floating.style.getPropertyValue("--floating-available-height")).toBe("");
        vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 180, 150));

        await settle();

        expect(floating.dataset.placement).toBe("top-start");
        expect(floating.style.getPropertyValue("--floating-available-height")).not.toBe("");
    });
});
