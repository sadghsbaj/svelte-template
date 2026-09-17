import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import Meter from "./Meter.svelte";

describe("Meter", () => {
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
        mounted.push(mount(Meter, { target: app, props }));
        flushSync();
        return app.children.item(mounted.length - 1) as HTMLElement;
    };

    test("renders default meter with role='meter' and default props", () => {
        const el = render();
        expect(el.getAttribute("role")).toBe("meter");
        expect(el.getAttribute("aria-valuenow")).toBe("0");
        expect(el.getAttribute("aria-valuemin")).toBe("0");
        expect(el.getAttribute("aria-valuemax")).toBe("100");
        expect(el.classList).toContain("h-8px");
        expect(el.classList).toContain("w-full");

        const fill = el.querySelector(".meter-fill") as HTMLElement;
        expect(fill).not.toBeNull();
        expect(fill.classList).toContain("bg-accent-solid-1");
        expect(fill.style.width).toBe("0%");
    });

    test("calculates percentage correctly for standard range (0-100)", () => {
        const el = render({ value: 65 });
        expect(el.getAttribute("aria-valuenow")).toBe("65");

        const fill = el.querySelector(".meter-fill") as HTMLElement;
        expect(fill.style.width).toBe("65%");
    });

    test("calculates percentage correctly for custom min and max", () => {
        const el = render({ min: 0, max: 5, value: 3 });
        expect(el.getAttribute("aria-valuenow")).toBe("3");
        expect(el.getAttribute("aria-valuemin")).toBe("0");
        expect(el.getAttribute("aria-valuemax")).toBe("5");

        const fill = el.querySelector(".meter-fill") as HTMLElement;
        expect(fill.style.width).toBe("60%");
    });

    test("clamps percentage between 0% and 100%", () => {
        const underflow = render({ min: 10, max: 50, value: 5 });
        const underflowFill = underflow.querySelector(".meter-fill") as HTMLElement;
        expect(underflowFill.style.width).toBe("0%");

        const overflow = render({ min: 10, max: 50, value: 60 });
        const overflowFill = overflow.querySelector(".meter-fill") as HTMLElement;
        expect(overflowFill.style.width).toBe("100%");
    });

    test("handles edge case when max <= min safely", () => {
        const el = render({ min: 50, max: 50, value: 50 });
        const fill = el.querySelector(".meter-fill") as HTMLElement;
        expect(fill.style.width).toBe("0%");
    });

    test("renders all sizes correctly", () => {
        const sm = render({ size: "sm" });
        expect(sm.classList).toContain("h-4px");

        const md = render({ size: "md" });
        expect(md.classList).toContain("h-8px");

        const lg = render({ size: "lg" });
        expect(lg.classList).toContain("h-12px");
    });

    test("renders all semantic colors correctly", () => {
        const colors = [
            ["accent", "bg-accent-solid-1"],
            ["danger", "bg-danger-solid-1"],
            ["success", "bg-success-solid-1"],
            ["warning", "bg-warning-solid-1"],
            ["info", "bg-info-solid-1"],
            ["base", "bg-base-solid-1"],
        ] as const;

        for (const [color, expectedClass] of colors) {
            const el = render({ color });
            const fill = el.querySelector(".meter-fill");
            expect(fill?.classList).toContain(expectedClass);
        }
    });

    test("allows overriding class and fillClass", () => {
        const el = render({ class: "w-48 shadow-sm", fillClass: "opacity-80" });
        expect(el.classList).toContain("w-48");
        expect(el.classList).toContain("shadow-sm");

        const fill = el.querySelector(".meter-fill");
        expect(fill?.classList).toContain("opacity-80");
    });

    test("binds to element prop correctly", () => {
        let boundEl: HTMLDivElement | null = null;
        const component = mount(Meter, {
            target: app,
            props: {
                get element() {
                    return boundEl;
                },
                set element(val) {
                    boundEl = val;
                },
            },
        });
        mounted.push(component);
        flushSync();

        expect(boundEl).toBeInstanceOf(HTMLDivElement);
    });
});
