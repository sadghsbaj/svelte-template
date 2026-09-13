import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import Kbd from "./Kbd.svelte";

describe("Kbd Component", () => {
    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[] = [];

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [];
    });

    afterEach(() => {
        for (const instance of mounted) {
            unmount(instance);
        }
        mounted = [];
        app.remove();
    });

    test("renders as a single badge with soft background and squircle frame (symbol-first)", () => {
        const instance = mount(Kbd, {
            target: app,
            props: {
                combo: "Ctrl+K",
            },
        });
        mounted.push(instance);
        flushSync();

        const kbdEl = app.querySelector("kbd");
        expect(kbdEl).not.toBeNull();

        // The kbd element itself is the single badge
        expect(kbdEl?.className).toContain("bg-base-soft-1");
        expect(kbdEl?.className).toContain("squircle-smooth");
        expect(kbdEl?.className).not.toContain("border");

        // Inside the single badge, renders Control Lucide icon and K text
        const svg = kbdEl?.querySelector("svg");
        expect(svg).not.toBeNull();
        expect(svg?.getAttribute("aria-hidden")).toBe("true");
        expect(kbdEl?.getAttribute("aria-label")).toBe("Control plus K");

        const span = kbdEl?.querySelector(":scope > span");
        expect(span?.textContent?.trim()).toBe("K");
    });

    test("renders single character key with square squircle aspect ratio", () => {
        const instance = mount(Kbd, {
            target: app,
            props: {
                key: "K",
            },
        });
        mounted.push(instance);
        flushSync();

        const kbdEl = app.querySelector("kbd");
        expect(kbdEl?.className).toContain("aspect-square");
        expect(kbdEl?.textContent?.trim()).toBe("K");
    });

    test("renders Command icon inside the single badge", () => {
        const instance = mount(Kbd, {
            target: app,
            props: {
                combo: "Cmd+K",
                platform: "mac",
            },
        });
        mounted.push(instance);
        flushSync();

        const kbdEl = app.querySelector("kbd");
        expect(kbdEl).not.toBeNull();

        // Contains an SVG for the Command icon
        const svg = kbdEl?.querySelector("svg");
        expect(svg).not.toBeNull();
        expect(svg?.getAttribute("aria-hidden")).toBe("true");
        expect(kbdEl?.getAttribute("aria-label")).toBe("Command plus K");

        // And text for K
        const span = kbdEl?.querySelector(":scope > span");
        expect(span?.textContent?.trim()).toBe("K");
    });

    test("renders text format when format='text' is requested on Windows", () => {
        const instance = mount(Kbd, {
            target: app,
            props: {
                combo: "Ctrl+K",
                format: "text",
                platform: "windows",
            },
        });
        mounted.push(instance);
        flushSync();

        const kbdEl = app.querySelector("kbd");
        const labels = [...(kbdEl?.querySelectorAll(":scope > span") ?? [])].map((s) =>
            s.textContent?.trim()
        );
        expect(labels).toEqual(["Ctrl", "K"]);
    });

    test("renders elevated and ghost variants", () => {
        const instanceElevated = mount(Kbd, {
            target: app,
            props: {
                combo: "Esc",
                variant: "elevated",
            },
        });
        mounted.push(instanceElevated);
        flushSync();

        const kbdElevated = app.querySelector(":scope kbd");
        expect(kbdElevated?.className).toContain("shadow-xs");

        const instanceGhost = mount(Kbd, {
            target: app,
            props: {
                combo: "Esc",
                variant: "ghost",
            },
        });
        mounted.push(instanceGhost);
        flushSync();

        const allKbds = app.querySelectorAll("kbd");
        expect(allKbds[1]?.className).toContain("bg-transparent");
    });

    test("renders separator between keys inside badge when separator prop is enabled", () => {
        const instance = mount(Kbd, {
            target: app,
            props: {
                combo: "Ctrl+Alt+Del",
                separator: "+",
            },
        });
        mounted.push(instance);
        flushSync();

        const kbdEl = app.querySelector("kbd");
        const svgs = kbdEl?.querySelectorAll("svg");
        expect(svgs).toHaveLength(2); // Control and Option icons

        const spans = [...(kbdEl?.querySelectorAll(":scope > span") ?? [])].map((s) =>
            s.textContent?.trim()
        );
        // separator spans and "Del"
        expect(spans).toEqual(["+", "+", "Del"]);
    });

    test("renders sizes correctly", () => {
        const instanceSm = mount(Kbd, {
            target: app,
            props: { combo: "K", size: "sm" },
        });
        mounted.push(instanceSm);

        const instanceLg = mount(Kbd, {
            target: app,
            props: { combo: "K", size: "lg" },
        });
        mounted.push(instanceLg);
        flushSync();

        const kbds = app.querySelectorAll("kbd");
        expect(kbds[0]?.className).toContain("h-20px");
        expect(kbds[1]?.className).toContain("h-28px");
    });
});
