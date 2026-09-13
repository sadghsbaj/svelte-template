import { flushSync, mount, unmount, type ComponentProps } from "svelte";
import { Apple } from "@lucide/svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import FloatingLayerFixture from "$components/_system/floating/__fixtures__/FloatingLayerFixture.svelte";

import ComboboxFixture from "./__fixtures__/ComboboxFixture.svelte";
import type { ComboboxOption } from "./combobox.types";

const OPTIONS: readonly ComboboxOption[] = [
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
    flushSync();
    return event;
};

describe("Combobox", () => {
    interface FixtureExports {
        getValue: () => string | undefined;
        getInputValue: () => string | undefined;
        setValue: (value: string | undefined) => void;
        setInputValue: (value: string | undefined) => void;
        setOptions: (options: readonly ComboboxOption[]) => void;
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
        vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {});
    });

    afterEach(async () => {
        for (const component of mounted.toReversed()) await unmount(component);
        document.body.replaceChildren();
        vi.restoreAllMocks();
    });

    const fixture = (
        props: Partial<ComponentProps<typeof ComboboxFixture>> = {}
    ): FixtureExports => {
        const component = mount(ComboboxFixture, {
            target: app,
            props: { initialOptions: OPTIONS, ...props },
        });
        flushSync();
        mounted.push(component);
        return component as FixtureExports;
    };

    const input = (): HTMLInputElement =>
        app.querySelector<HTMLInputElement>('[role="combobox"]') as HTMLInputElement;
    const listbox = (): HTMLDivElement | null =>
        document.querySelector<HTMLDivElement>('[role="listbox"]');
    const options = (): HTMLDivElement[] => [
        ...document.querySelectorAll<HTMLDivElement>('[role="option"]'),
    ];
    const option = (label: string): HTMLDivElement =>
        options().find((item) => item.textContent?.trim().startsWith(label)) as HTMLDivElement;

    const type = async (value: string): Promise<void> => {
        input().value = value;
        input().dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
        await settle();
    };

    const open = async (): Promise<void> => {
        input().click();
        await settle();
    };

    test("resolves initial values unless an explicit query was supplied", () => {
        fixture({ initialValue: "banana" });
        expect(input().value).toBe("Banana");
        expect(input().dataset.consumer).toBe("forwarded");
        expect(input().classList.contains("fixture-input")).toBe(true);
        expect(input().parentElement?.classList.contains("fixture-surface")).toBe(true);

        fixture({ initialValue: "banana", initialInputValue: "ban" });
        expect([...app.querySelectorAll<HTMLInputElement>('[role="combobox"]')].at(-1)?.value).toBe(
            "ban"
        );
    });

    test("filters by contains, reports changed-only bindings, and renders empty state", async () => {
        const valueChange = vi.fn<(value: string | undefined) => void>();
        const inputChange = vi.fn<(value: string) => void>();
        const component = fixture({
            initialValue: "apple",
            onValueChange: valueChange,
            onInputValueChange: inputChange,
        });
        await type("an");
        expect(options().map((item) => item.textContent?.trim())).toEqual(["Banana"]);
        expect(component.getValue()).toBeUndefined();
        expect(component.getInputValue()).toBe("an");
        expect(valueChange).toHaveBeenCalledOnce();
        expect(valueChange).toHaveBeenCalledWith(undefined);
        expect(inputChange).toHaveBeenCalledWith("an");
        expect(input().getAttribute("aria-activedescendant")).toBe(option("Banana").id);

        await type("zzz");
        expect(options()).toHaveLength(0);
        expect(listbox()?.textContent).toContain("Nothing here");
        expect(listbox()?.querySelector('[role="option"]')).toBeNull();
    });

    test("supports a custom filter and keeps disabled matches visible", async () => {
        fixture({
            filter: (item, query) => item.label.toLowerCase().startsWith(query.toLowerCase()),
        });
        await type("ap");
        expect(options()).toHaveLength(2);
        expect(option("Apricot").ariaDisabled).toBe("true");
        option("Apricot").click();
        expect(input().value).toBe("ap");
    });

    test("reacts to external query changes and pointer activity without moving input focus", async () => {
        const component = fixture();
        input().focus();
        await open();

        flushSync(() => component.setInputValue("ch"));
        expect(options().map((item) => item.textContent?.trim())).toEqual(["Cherry"]);
        expect(input().getAttribute("aria-activedescendant")).toBe(option("Cherry").id);

        flushSync(() => component.setInputValue(""));
        option("Banana").dispatchEvent(new PointerEvent("pointermove", { bubbles: true }));
        flushSync();
        expect(input().getAttribute("aria-activedescendant")).toBe(option("Banana").id);
        expect(option("Banana").classList.contains("bg-base-soft-2")).toBe(true);
        expect(document.activeElement).toBe(input());
    });

    test("owns DOM focus while arrows loop, updates active ARIA, and commits Enter", async () => {
        const component = fixture({ initialValue: "banana" });
        input().focus();
        expect(press(input(), "ArrowDown").defaultPrevented).toBe(true);
        await settle();
        expect(document.activeElement).toBe(input());
        expect(input().ariaExpanded).toBe("true");
        expect(input().getAttribute("aria-autocomplete")).toBe("list");
        expect(input().getAttribute("aria-controls")).toBe(listbox()?.id);
        expect(input().getAttribute("aria-activedescendant")).toBe(option("Banana").id);
        expect(option("Banana").ariaSelected).toBe("true");
        expect(option("Banana").tabIndex).toBe(-1);

        press(input(), "ArrowDown");
        expect(input().getAttribute("aria-activedescendant")).toBe(option("Cherry").id);
        press(input(), "ArrowDown");
        expect(input().getAttribute("aria-activedescendant")).toBe(option("Apple").id);
        press(input(), "ArrowUp");
        expect(input().getAttribute("aria-activedescendant")).toBe(option("Cherry").id);
        press(input(), "Enter");
        await settle();
        expect(component.getValue()).toBe("cherry");
        expect(component.getInputValue()).toBe("Cherry");
        expect(document.activeElement).toBe(input());
        expect(listbox()).toBeNull();
    });

    test("opens Up at selected or last and leaves Home and End to native caret behavior", async () => {
        fixture();
        input().focus();
        press(input(), "ArrowUp");
        await settle();
        expect(input().getAttribute("aria-activedescendant")).toBe(option("Cherry").id);
        const home = press(input(), "Home");
        const end = press(input(), "End");
        expect(home.defaultPrevented).toBe(false);
        expect(end.defaultPrevented).toBe(false);
        expect(document.activeElement).toBe(input());
    });

    test("rolls editing back on Escape and Tab without committing or trapping Tab", async () => {
        const component = fixture({ initialValue: "apple" });
        await type("ban");
        press(input(), "Escape");
        await settle();
        expect(component.getValue()).toBeUndefined();
        expect(input().value).toBe("");

        flushSync(() => component.setValue("apple"));
        await type("cher");
        const tab = press(input(), "Tab");
        expect(tab.defaultPrevented).toBe(false);
        await settle();
        expect(input().value).toBe("");
        expect(listbox()).toBeNull();
    });

    test("selects by pointer without moving focus and repeated input clicks stay open", async () => {
        const openChange = vi.fn<(open: boolean) => void>();
        const component = fixture({ onOpenChange: openChange });
        input().focus();
        await open();
        input().click();
        await settle();
        expect(listbox()).toBeTruthy();
        expect(openChange).toHaveBeenCalledTimes(1);
        expect(openChange).toHaveBeenCalledWith(true);
        const pointer = new PointerEvent("pointerdown", { bubbles: true, cancelable: true });
        option("Banana").dispatchEvent(pointer);
        expect(pointer.defaultPrevented).toBe(true);
        option("Banana").click();
        await settle();
        expect(component.getValue()).toBe("banana");
        expect(document.activeElement).toBe(input());
        expect(openChange).toHaveBeenLastCalledWith(false);
    });

    test("opens when clicking the TextInput surface outside the native input", async () => {
        fixture();
        const surface = input().parentElement as HTMLDivElement;

        surface.dispatchEvent(new MouseEvent("click", { bubbles: true }));
        await settle();

        expect(document.activeElement).toBe(input());
        expect(listbox()).toBeTruthy();
        expect(input().ariaExpanded).toBe("true");
    });

    test("keeps the filtered result set stable throughout the exit animation", async () => {
        const component = fixture();
        await type("app");
        expect(options().map((item) => item.textContent?.trim())).toEqual(["Apple"]);

        option("Apple").click();
        flushSync();

        expect(component.getValue()).toBe("apple");
        expect(listbox()?.dataset.popoverPhase).toBe("exiting");
        expect(options().map((item) => item.textContent?.trim())).toEqual(["Apple"]);
        await settle();
        expect(listbox()).toBeNull();
    });

    test("delays query normalization and Enter selection during composition", async () => {
        const component = fixture({ initialValue: "apple" });
        input().dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true }));
        input().value = "ban";
        input().dispatchEvent(new InputEvent("input", { bubbles: true, isComposing: true }));
        press(input(), "Enter");
        expect(component.getValue()).toBe("apple");
        expect(component.getInputValue()).toBe("Apple");

        input().dispatchEvent(
            new CompositionEvent("compositionend", { bubbles: true, data: "ban" })
        );
        await settle();
        expect(component.getValue()).toBeUndefined();
        expect(component.getInputValue()).toBe("ban");
        expect(options().map((item) => item.textContent?.trim())).toEqual(["Banana"]);
    });

    test("normalizes removed values and filtered active items with deterministic duplicates", async () => {
        const component = fixture({ initialValue: "banana" });
        flushSync(() => component.setOptions([{ value: "apple", label: "Apple" }]));
        await Promise.resolve();
        expect(component.getValue()).toBeUndefined();
        expect(input().value).toBe("");

        flushSync(() =>
            component.setOptions([
                { value: "same", label: "First" },
                { value: "same", label: "Second" },
            ])
        );
        flushSync(() => component.setValue("same"));
        await open();
        expect(options().filter((item) => item.ariaSelected === "true")).toHaveLength(1);
        expect(new Set(options().map((item) => item.id)).size).toBe(2);
    });

    test("applies surface states, icons, chevron, sizes, and closes outside", async () => {
        fixture({ initialValue: "apple", size: "lg", variant: "elevated", invalid: true });
        expect(input().parentElement?.className).toContain("h-44px");
        expect(input().parentElement?.className).toContain("shadow-sm");
        expect(input().ariaInvalid).toBe("true");
        expect(input().parentElement?.querySelector(".lucide-chevron-down")).toBeTruthy();
        await open();
        expect(option("Apple").className).toContain("min-h-40px");
        expect(option("Apple").querySelector(".lucide-apple")).toBeTruthy();
        expect(option("Apple").querySelector(".lucide-check")).toBeTruthy();
        expect(listbox()?.classList.contains("fixture-content")).toBe(true);
        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        await settle();
        expect(listbox()).toBeNull();

        fixture({ disabled: true });
        const disabledInput = [...app.querySelectorAll<HTMLInputElement>('[role="combobox"]')].at(
            -1
        ) as HTMLInputElement;
        expect(disabledInput.disabled).toBe(true);
    });

    test("serializes, validates, focuses, disables, and resets through the native proxy", async () => {
        const component = fixture({
            initialValue: "apple",
            name: "fruit",
            required: true,
            withForm: true,
        });
        const form = app.querySelector("form") as HTMLFormElement;
        const proxy = form.querySelector("select") as HTMLSelectElement;
        expect(new FormData(form).get("fruit")).toBe("apple");
        flushSync(() => component.setValue("banana"));
        expect(new FormData(form).get("fruit")).toBe("banana");
        form.reset();
        await Promise.resolve();
        flushSync();
        expect(component.getValue()).toBe("apple");
        expect(input().value).toBe("Apple");

        flushSync(() => component.setValue(undefined));
        expect(form.checkValidity()).toBe(false);
        proxy.dispatchEvent(new Event("invalid", { cancelable: true }));
        expect(document.activeElement).toBe(input());

        fixture({ initialValue: "apple", name: "off", disabled: true, withForm: true });
        const proxies = app.querySelectorAll<HTMLSelectElement>("select");
        expect(proxies[1]?.disabled).toBe(true);
        expect(new FormData(proxies[1]?.form as HTMLFormElement).has("off")).toBe(false);
    });

    test("anchors the popup to the complete TextInput surface", async () => {
        fixture();
        const surface = input().parentElement as HTMLDivElement;
        vi.spyOn(surface, "getBoundingClientRect").mockReturnValue(new DOMRect(20, 20, 211, 40));
        await open();
        const floating = listbox()?.parentElement?.parentElement as HTMLDivElement;
        expect(floating.style.getPropertyValue("--floating-anchor-width")).toBe("211px");
        expect(listbox()?.className).toContain("min-w-[var(--floating-anchor-width)]");
        expect(listbox()?.className).toContain("max-h-[var(--floating-available-height)]");
    });
});
