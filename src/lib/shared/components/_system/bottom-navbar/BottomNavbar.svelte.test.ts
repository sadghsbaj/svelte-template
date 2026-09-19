import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { createViewState } from "$core/_system/layout/app-views/view-state/viewState.svelte";

import BottomNavbar from "./BottomNavbar.svelte";
import BottomNavbarFixture from "./BottomNavbarFixture.svelte";

describe("BottomNavbar", () => {
    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[];

    const items = [
        { value: "home", label: "Home" },
        { value: "search", label: "Search" },
        { value: "settings", label: "Settings", disabled: true },
    ] as const;

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [];
    });

    afterEach(async () => {
        for (const component of mounted.toReversed()) await unmount(component);
        vi.restoreAllMocks();
        app.remove();
    });

    function render(props: Record<string, unknown> = {}): HTMLElement {
        const target = document.createElement("div");
        app.append(target);
        mounted.push(
            mount(BottomNavbar, {
                target,
                props: { items, value: "home", position: "static", ...props },
            })
        );
        flushSync();
        const navbar = target.querySelector<HTMLElement>('[data-slot="bottom-navbar"]');
        if (!navbar) throw new Error("BottomNavbar did not render");
        return navbar;
    }

    test("renders equal navigation items and marks the active page", () => {
        const navbar = render();
        const buttons = navbar.querySelectorAll<HTMLButtonElement>(
            '[data-slot="bottom-navbar-item"]'
        );

        expect(navbar.getAttribute("aria-label")).toBe("Primary navigation");
        expect(buttons).toHaveLength(3);
        expect(buttons[0]?.getAttribute("aria-current")).toBe("page");
        expect(buttons[1]?.getAttribute("aria-current")).toBeNull();
        expect(buttons[2]?.getAttribute("aria-disabled")).toBe("true");
    });

    test("updates manual selection and emits value changes", () => {
        const onValueChange = vi.fn();
        mounted.push(mount(BottomNavbarFixture, { target: app, props: { onValueChange } }));
        flushSync();
        const navbar = app.querySelector<HTMLElement>('[data-slot="bottom-navbar"]');
        const output = app.querySelector<HTMLOutputElement>("[data-bottom-navbar-value]");
        if (!navbar || !output) throw new Error("Expected BottomNavbar fixture");
        const search = navbar.querySelector<HTMLButtonElement>('[data-value="search"]');
        if (!search) throw new Error("Expected search item");

        search.click();
        flushSync();

        expect(output.value).toBe("search");
        expect(search.dataset.state).toBe("active");
        expect(onValueChange).toHaveBeenCalledWith("search");
    });

    test("does not select disabled items", () => {
        const onValueChange = vi.fn();
        const navbar = render({ onValueChange });
        const settings = navbar.querySelector<HTMLButtonElement>('[data-value="settings"]');
        if (!settings) throw new Error("Expected settings item");

        settings.click();
        flushSync();

        expect(settings.getAttribute("aria-current")).toBeNull();
        expect(onValueChange).not.toHaveBeenCalled();
    });

    test("derives root items and active parent from view state", () => {
        const viewState = createViewState({
            views: [
                { view: "home", label: "Home", parent: "root" },
                { view: "analytics", label: "Analytics", parent: "root" },
                { view: "report", label: "Report", parent: "analytics" },
                { view: "settings", label: "Settings", parent: "root" },
            ] as const,
        });
        viewState.setView("report");

        const navbar = render({ mode: "views", viewState, exclude: ["settings"] });
        const buttons = navbar.querySelectorAll<HTMLButtonElement>(
            '[data-slot="bottom-navbar-item"]'
        );

        expect([...buttons].map((button) => button.dataset.value)).toEqual(["home", "analytics"]);
        expect(buttons[1]?.getAttribute("aria-current")).toBe("page");
    });

    test("does not animate its initial visible mount", () => {
        const animate = vi.spyOn(HTMLElement.prototype, "animate");
        render();
        expect(animate).not.toHaveBeenCalled();
    });

    test("applies appropriate text and icon sizing based on size prop", () => {
        const navbarSm = render({ size: "sm" });
        const itemSm = navbarSm.querySelector<HTMLButtonElement>(
            '[data-slot="bottom-navbar-item"]'
        );
        expect(itemSm?.className).toContain("text-sm");
        expect(itemSm?.className).toContain("[&>svg]:size-16px");

        const navbarMd = render({ size: "md" });
        const itemMd = navbarMd.querySelector<HTMLButtonElement>(
            '[data-slot="bottom-navbar-item"]'
        );
        expect(itemMd?.className).toContain("text-sm");
        expect(itemMd?.className).toContain("[&>svg]:size-16px");

        const navbarLg = render({ size: "lg" });
        const itemLg = navbarLg.querySelector<HTMLButtonElement>(
            '[data-slot="bottom-navbar-item"]'
        );
        expect(itemLg?.className).toContain("text-base");
        expect(itemLg?.className).toContain("[&>svg]:size-18px");
    });
});
