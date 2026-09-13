import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import Kbd from "./Kbd.svelte";

const compactText = (element: HTMLElement): string =>
    (element.textContent ?? "").replaceAll(/\s/g, "");

describe("Kbd", () => {
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
    });

    const render = (props: Record<string, unknown>): HTMLElement => {
        mounted.push(mount(Kbd, { target: app, props }));
        flushSync();
        return app.querySelectorAll<HTMLElement>("kbd").item(mounted.length - 1);
    };

    test("renders stable SVG symbols alongside text tokens", () => {
        const kbd = render({ combo: "Mod+Shift+P" });
        expect(kbd.querySelectorAll("svg")).toHaveLength(2);
        expect(
            [...kbd.querySelectorAll<HTMLElement>("[data-kbd-key]")].map(
                (item) => item.dataset.kbdValue
            )
        ).toEqual(["⌘", "⇧", "P"]);
        expect(compactText(kbd)).toBe("P");
    });

    test("generates a complete title and accessible name", () => {
        const kbd = render({ combo: "Mod+Shift+P" });
        expect(kbd.title).toBe("Primary modifier (Command / Control) + Shift + P");
        expect(kbd.getAttribute("aria-label")).toBe(
            "Primary modifier (Command / Control) plus Shift plus P"
        );
        expect(kbd.querySelector("[data-kbd-key]")?.getAttribute("aria-hidden")).toBe("true");
    });

    test("lets consumer title and aria-label values override generated text", () => {
        const kbd = render({ combo: "Mod+K", title: "Open search", "aria-label": "Search key" });
        expect(kbd.title).toBe("Open search");
        expect(kbd.getAttribute("aria-label")).toBe("Search key");
    });

    test("omits the accessible name when the complete badge is decorative", () => {
        const kbd = render({ combo: "Mod+K", "aria-hidden": "true" });
        expect(kbd.getAttribute("aria-hidden")).toBe("true");
        expect(kbd.hasAttribute("aria-label")).toBe(false);
        expect(kbd.title).toBe("Primary modifier (Command / Control) + K");
    });

    test("renders sequential steps with a distinct visual separator", () => {
        const kbd = render({ combo: "G I" });
        expect(compactText(kbd)).toBe("G›I");
        expect(kbd.title).toBe("G, then I");
    });

    test("supports explicit separators within simultaneous combinations", () => {
        const kbd = render({ combo: "Mod+Shift+P", separator: "+" });
        expect(compactText(kbd)).toBe("++P");
        expect(
            [...kbd.querySelectorAll<HTMLElement>("[data-kbd-key]")].map(
                (item) => item.dataset.kbdValue
            )
        ).toEqual(["⌘", "⇧", "P"]);
    });

    test("preserves variants and calibrated sizes", () => {
        const small = render({ key: "K", size: "sm", variant: "soft" });
        const large = render({ key: "K", size: "lg", variant: "elevated" });
        expect(small.className).toContain("h-20px");
        expect(small.className).toContain("aspect-square");
        expect(large.className).toContain("h-28px");
        expect(large.className).toContain("shadow-xs");
    });
});
