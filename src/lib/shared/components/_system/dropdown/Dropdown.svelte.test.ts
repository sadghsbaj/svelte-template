import { flushSync, mount, unmount, type ComponentProps } from "svelte";
import { FilePlus, Pencil, Trash2 } from "@lucide/svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import FloatingLayerFixture from "$components/_system/floating/__fixtures__/FloatingLayerFixture.svelte";

import DropdownFixture from "./__fixtures__/DropdownFixture.svelte";
import type { DropdownActionDetail, DropdownEntry } from "./dropdown.types";

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

const menus = (): HTMLElement[] => [...document.querySelectorAll<HTMLElement>('[role="menu"]')];
const menuItem = (label: string): HTMLButtonElement =>
    [...document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]')].find(
        (item) => item.dataset.dropdownLabel === label
    ) as HTMLButtonElement;

describe("Dropdown", () => {
    interface FixtureExports {
        getOpen: () => boolean;
    }

    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[];
    let action: ReturnType<typeof vi.fn<(detail: DropdownActionDetail) => void>>;
    let items: readonly DropdownEntry[];

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [mount(FloatingLayerFixture, { target: app })];
        action = vi.fn<(detail: DropdownActionDetail) => void>();
        items = [
            {
                type: "section",
                id: "actions",
                label: "Actions",
                items: [
                    {
                        id: "new",
                        label: "New file",
                        description: "Create an empty document",
                        icon: FilePlus,
                        shortcut: "Cmd+N",
                        onAction: action,
                    },
                    {
                        id: "edit",
                        label: "Edit file",
                        icon: Pencil,
                        onAction: action,
                    },
                    {
                        type: "submenu",
                        id: "more",
                        label: "More actions",
                        items: [
                            {
                                id: "duplicate",
                                label: "Duplicate",
                                onAction: action,
                            },
                            {
                                type: "submenu",
                                id: "advanced",
                                label: "Advanced",
                                items: [
                                    {
                                        id: "archive",
                                        label: "Archive permanently",
                                        onAction: action,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            {
                type: "section",
                id: "danger",
                label: "Danger zone",
                items: [
                    {
                        id: "delete",
                        label: "Delete file",
                        icon: Trash2,
                        danger: true,
                        onAction: action,
                    },
                    {
                        id: "locked",
                        label: "Locked action",
                        disabled: true,
                        onAction: action,
                    },
                ],
            },
        ];
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

    const fixture = (
        props: Partial<ComponentProps<typeof DropdownFixture>> = {}
    ): FixtureExports => {
        const component = mount(DropdownFixture, {
            target: app,
            props: { items, ...props },
        });
        flushSync();
        mounted.push(component);
        return component as FixtureExports;
    };

    const trigger = (): HTMLButtonElement =>
        app.querySelector<HTMLButtonElement>("[data-dropdown-trigger]") as HTMLButtonElement;
    const open = async (): Promise<void> => {
        trigger().click();
        await settle();
    };

    test("forwards the trigger attachment through Button and renders rich action sections", async () => {
        fixture();
        expect(trigger().getAttribute("aria-haspopup")).toBe("menu");
        expect(trigger().getAttribute("aria-expanded")).toBe("false");
        await open();

        expect(trigger().getAttribute("aria-expanded")).toBe("true");
        expect(menus()).toHaveLength(1);
        expect(menus()[0]?.getAttribute("aria-label")).toBe("File actions");
        expect(menus()[0]?.querySelectorAll('[role="group"]')).toHaveLength(2);
        expect(menuItem("New file").textContent).toContain("Create an empty document");
        expect(menuItem("New file").querySelector("kbd")).toBeTruthy();
        expect(menuItem("New file").hasAttribute("aria-keyshortcuts")).toBe(false);
        expect(menuItem("Delete file").textContent).toContain("Delete file");
        expect(menuItem("Delete file").querySelector(".text-danger-500")).toBeTruthy();
        expect(menuItem("Locked action").firstElementChild?.textContent).toContain("Locked action");
        expect(menuItem("Locked action").ariaDisabled).toBe("true");
        expect(menuItem("Locked action").style.cursor).toBe("not-allowed");
    });

    test("opens with keyboard intent and provides roving focus and label-only typeahead", async () => {
        fixture();
        trigger().focus();
        expect(press(trigger(), "ArrowDown").defaultPrevented).toBe(true);
        await settle();
        expect(document.activeElement).toBe(menuItem("New file"));

        press(menuItem("New file"), "ArrowDown");
        expect(document.activeElement).toBe(menuItem("Edit file"));
        press(menuItem("Edit file"), "End");
        expect(document.activeElement).toBe(menuItem("Delete file"));
        press(menuItem("Delete file"), "n");
        expect(document.activeElement).toBe(menuItem("New file"));
    });

    test("keeps trigger focus after pointer opening until arrow navigation begins", async () => {
        fixture();
        trigger().focus();
        trigger().dispatchEvent(
            new PointerEvent("pointerdown", { bubbles: true, pointerType: "mouse" })
        );
        trigger().dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 1 }));
        await settle();
        expect(document.activeElement).toBe(trigger());
        expect(menus()).toHaveLength(1);

        press(trigger(), "ArrowDown");
        expect(document.activeElement).toBe(menuItem("New file"));
    });

    test("executes actions once and closes the complete menu family", async () => {
        const component = fixture();
        await open();
        menuItem("Edit file").click();
        await settle();
        expect(component.getOpen()).toBe(false);
        expect(menus()).toHaveLength(0);
        expect(action).toHaveBeenCalledOnce();
        expect(action.mock.calls[0]?.[0].item.id).toBe("edit");
        expect(action.mock.calls[0]?.[0].path).toEqual([]);
    });

    test("opens arbitrarily nested submenus and closes the root from a deep action", async () => {
        const component = fixture();
        await open();
        menuItem("More actions").focus();
        press(menuItem("More actions"), "ArrowRight");
        await settle();
        expect(menus()).toHaveLength(2);
        expect(document.activeElement).toBe(menuItem("Duplicate"));

        menuItem("Advanced").focus();
        press(menuItem("Advanced"), "ArrowRight");
        await settle();
        expect(menus()).toHaveLength(3);
        expect(document.activeElement).toBe(menuItem("Archive permanently"));

        menuItem("Archive permanently").click();
        await settle();
        expect(component.getOpen()).toBe(false);
        expect(menus()).toHaveLength(0);
        expect(action.mock.calls[0]?.[0].path).toEqual(["more", "advanced"]);
    });

    test("closes one submenu level with the backward arrow and restores its parent item", async () => {
        fixture();
        await open();
        menuItem("More actions").focus();
        press(menuItem("More actions"), "ArrowRight");
        await settle();
        press(menuItem("Duplicate"), "ArrowLeft");
        await settle();
        expect(menus()).toHaveLength(1);
        expect(document.activeElement).toBe(menuItem("More actions"));
    });

    test("closes only the current submenu with Escape, then closes the root", async () => {
        const component = fixture();
        await open();
        menuItem("More actions").click();
        await settle();
        expect(menus()).toHaveLength(2);

        press(menuItem("Duplicate"), "Escape");
        await settle();
        expect(component.getOpen()).toBe(true);
        expect(menus()).toHaveLength(1);
        expect(document.activeElement).toBe(menuItem("More actions"));

        press(menuItem("More actions"), "Escape");
        await settle();
        expect(component.getOpen()).toBe(false);
        expect(document.activeElement).toBe(trigger());
    });

    test("closes the complete family on Tab without trapping normal navigation", async () => {
        const component = fixture();
        await open();
        menuItem("More actions").click();
        await settle();
        const tab = press(menuItem("Duplicate"), "Tab");
        await settle();
        expect(tab.defaultPrevented).toBe(false);
        expect(component.getOpen()).toBe(false);
        expect(menus()).toHaveLength(0);
    });

    test("uses logical submenu arrow navigation in RTL", async () => {
        fixture({ direction: "rtl" });
        await open();
        menuItem("More actions").focus();
        press(menuItem("More actions"), "ArrowLeft");
        await settle();
        expect(menus()).toHaveLength(2);
        expect(document.activeElement).toBe(menuItem("Duplicate"));

        press(menuItem("Duplicate"), "ArrowRight");
        await settle();
        expect(menus()).toHaveLength(1);
        expect(document.activeElement).toBe(menuItem("More actions"));
    });

    test("locks deeper submenus to the side resolved by the first flipped branch", async () => {
        fixture();
        await open();
        const firstTrigger = menuItem("More actions");
        vi.spyOn(firstTrigger, "getBoundingClientRect").mockReturnValue(
            new DOMRect(window.innerWidth - 100, 120, 80, 36)
        );
        firstTrigger.click();
        await Promise.resolve();
        flushSync();

        const firstSubmenu = menus()[1] as HTMLElement;
        const firstFloating = firstSubmenu.parentElement?.parentElement as HTMLDivElement;
        vi.spyOn(firstFloating, "getBoundingClientRect").mockReturnValue(
            new DOMRect(0, 0, 272, 180)
        );
        window.dispatchEvent(new Event("resize"));
        await settle();
        expect(firstFloating.dataset.placement).toBe("left-start");
        const branchChevron = firstTrigger.querySelector<SVGElement>(".lucide-chevron-right");
        expect(branchChevron?.classList.contains("t-rotate-200-cubic-out")).toBe(true);
        expect(branchChevron?.classList.contains("rotate-180")).toBe(true);
        expect(
            firstSubmenu.querySelector<HTMLElement>('[data-dropdown-depth="1"]')?.dataset
                .dropdownBranchSide
        ).toBe("left");

        const secondTrigger = menuItem("Advanced");
        expect(secondTrigger.dataset.dropdownSubmenuSide).toBe("left");
        vi.spyOn(secondTrigger, "getBoundingClientRect").mockReturnValue(
            new DOMRect(window.innerWidth - 380, 180, 240, 36)
        );
        secondTrigger.click();
        await settle();
        const secondSubmenu = menus()[2] as HTMLElement;
        const secondFloating = secondSubmenu.parentElement?.parentElement as HTMLDivElement;
        expect(secondFloating.dataset.placement).toBe("left-start");
    });

    test("closes the entire family on an outside pointer from a nested submenu", async () => {
        const component = fixture();
        await open();
        menuItem("More actions").click();
        await settle();
        expect(menus()).toHaveLength(2);
        document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
        await settle();
        expect(component.getOpen()).toBe(false);
        expect(menus()).toHaveLength(0);
    });

    test("opens submenus from mouse hover and keeps actions neutral on hover", async () => {
        fixture();
        await open();
        menuItem("More actions").dispatchEvent(
            new PointerEvent("pointerenter", { pointerType: "mouse" })
        );
        await settle();
        expect(menus()).toHaveLength(2);
        expect(menuItem("Delete file").className).toContain("hover:bg-base-soft-1");
        expect(menuItem("Delete file").className).not.toContain("hover:bg-danger");
    });

    test("keeps submenu focus stable while the pointer crosses the parent menu gap", async () => {
        fixture({ hoverCloseDelay: 200 });
        await open();
        const submenuTrigger = menuItem("More actions");
        submenuTrigger.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
        await settle();
        submenuTrigger.focus();
        submenuTrigger.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
        menuItem("Delete file").dispatchEvent(
            new PointerEvent("pointermove", { pointerType: "mouse" })
        );
        expect(document.activeElement).toBe(submenuTrigger);
        expect(menus()).toHaveLength(2);

        menus()[1]
            ?.querySelector<HTMLElement>('[role="presentation"]')
            ?.dispatchEvent(new PointerEvent("pointerenter", { pointerType: "mouse" }));
        await settle();
        expect(menus()).toHaveLength(2);
    });
});
