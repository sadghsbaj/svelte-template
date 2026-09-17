import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import Separator from "./Separator.svelte";

describe("Separator", () => {
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

    const render = (props: Record<string, unknown> = {}): HTMLElement => {
        mounted.push(mount(Separator, { target: app, props }));
        flushSync();
        return app.lastElementChild as HTMLElement;
    };

    test("renders with default props (horizontal, sm, base, 100%, decorative)", () => {
        const el = render();
        expect(el.classList).toContain("w-full");
        expect(el.classList).toContain("h-px");
        expect(el.classList).toContain("bg-base-soft-1");
        expect(el.classList).toContain("rounded-full");
        expect(el.getAttribute("role")).toBe("none");
        expect(el.getAttribute("aria-orientation")).toBe("horizontal");
    });

    test("supports vertical orientation", () => {
        const el = render({ orientation: "vertical" });
        expect(el.classList).toContain("h-full");
        expect(el.classList).toContain("w-px");
        expect(el.getAttribute("aria-orientation")).toBe("vertical");
    });

    test("supports thickness presets sm, md, lg", () => {
        const sm = render({ thickness: "sm" });
        expect(sm.classList).toContain("h-px");

        const md = render({ thickness: "md" });
        expect(md.classList).toContain("h-2px");

        const lg = render({ thickness: "lg" });
        expect(lg.classList).toContain("h-4px");
    });

    test("supports custom numeric and string thickness", () => {
        const numeric = render({ thickness: 3 });
        expect(numeric.style.height).toBe("3px");

        const str = render({ orientation: "vertical", thickness: "6px" });
        expect(str.style.width).toBe("6px");
    });

    test("supports partial length with auto-centering", () => {
        const partial = render({ length: 80 });
        expect(partial.style.width).toBe("80%");
        expect(partial.classList).toContain("mx-auto");

        const partialVertical = render({ orientation: "vertical", length: "50%" });
        expect(partialVertical.style.height).toBe("50%");
        expect(partialVertical.classList).toContain("my-auto");
    });

    test("supports accent color", () => {
        const el = render({ color: "accent" });
        expect(el.classList).toContain("bg-accent-soft-1");
    });

    test("respects decorative=false for semantic separation", () => {
        const el = render({ decorative: false });
        expect(el.getAttribute("role")).toBe("separator");
    });

    test("binds to element prop correctly", () => {
        let elRef: HTMLDivElement | null = null;
        mounted.push(
            mount(Separator, {
                target: app,
                props: {
                    get element() {
                        return elRef;
                    },
                    set element(v) {
                        elRef = v;
                    },
                },
            })
        );
        flushSync();
        expect(elRef).toBeInstanceOf(HTMLDivElement);
    });

    test("merges custom consumer classes and styles", () => {
        const el = render({ class: "my-6 custom-sep", style: "opacity: 0.5;" });
        expect(el.classList).toContain("my-6");
        expect(el.classList).toContain("custom-sep");
        expect(el.style.opacity).toBe("0.5");
    });
});
