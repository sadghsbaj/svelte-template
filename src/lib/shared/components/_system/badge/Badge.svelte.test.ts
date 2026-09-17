import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import Badge from "./Badge.svelte";

describe("Badge", () => {
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
        mounted.push(mount(Badge, { target: app, props }));
        flushSync();
        return app.lastElementChild as HTMLElement;
    };

    test("renders with default props (soft, base, md)", () => {
        const badge = render();
        expect(badge.classList).toContain("bg-base-soft-1");
        expect(badge.classList).toContain("text-main");
        expect(badge.classList).toContain("h-26px");
        expect(badge.classList).toContain("rounded-full");
        expect(badge.classList).toContain("squircle-smooth");
        expect(badge.classList).not.toContain("squircle-soft");
        expect(badge.classList).toContain("select-none");
    });

    test("renders all sizes correctly", () => {
        const xs = render({ size: "xs" });
        expect(xs.classList).toContain("h-18px");
        expect(xs.classList).toContain("text-[10px]");

        const sm = render({ size: "sm" });
        expect(sm.classList).toContain("h-22px");
        expect(sm.classList).toContain("text-[11px]");

        const md = render({ size: "md" });
        expect(md.classList).toContain("h-26px");
        expect(md.classList).toContain("text-xs");

        const lg = render({ size: "lg" });
        expect(lg.classList).toContain("h-30px");

        const xl = render({ size: "xl" });
        expect(xl.classList).toContain("h-34px");
        expect(xl.classList).toContain("text-sm");
    });

    test("renders soft color variants correctly", () => {
        const accent = render({ variant: "soft", color: "accent" });
        expect(accent.classList).toContain("bg-accent-soft-1");
        expect(accent.classList).toContain("text-accent-solid-1");

        const danger = render({ variant: "soft", color: "danger" });
        expect(danger.classList).toContain("bg-danger-soft-1");
        expect(danger.classList).toContain("text-danger-solid-1");

        const success = render({ variant: "soft", color: "success" });
        expect(success.classList).toContain("bg-success-soft-1");
        expect(success.classList).toContain("text-success-solid-1");

        const warning = render({ variant: "soft", color: "warning" });
        expect(warning.classList).toContain("bg-warning-soft-1");
        expect(warning.classList).toContain("text-warning-solid-1");

        const info = render({ variant: "soft", color: "info" });
        expect(info.classList).toContain("bg-info-soft-1");
        expect(info.classList).toContain("text-info-solid-1");

        const base = render({ variant: "soft", color: "base" });
        expect(base.classList).toContain("bg-base-soft-1");
        expect(base.classList).toContain("text-main");
    });

    test("renders solid color variants correctly", () => {
        const accent = render({ variant: "solid", color: "accent" });
        expect(accent.classList).toContain("bg-accent-solid-1");
        expect(accent.classList).toContain("text-white");

        const danger = render({ variant: "solid", color: "danger" });
        expect(danger.classList).toContain("bg-danger-solid-1");
        expect(danger.classList).toContain("text-white");

        const success = render({ variant: "solid", color: "success" });
        expect(success.classList).toContain("bg-success-solid-1");
        expect(success.classList).toContain("text-white");

        const warning = render({ variant: "solid", color: "warning" });
        expect(warning.classList).toContain("bg-warning-solid-1");

        const info = render({ variant: "solid", color: "info" });
        expect(info.classList).toContain("bg-info-solid-1");
        expect(info.classList).toContain("text-white");

        const base = render({ variant: "solid", color: "base" });
        expect(base.classList).toContain("bg-base-solid-1");
    });

    test("supports square modifier for count pills and dots", () => {
        const square = render({ square: true, size: "md" });
        expect(square.classList).toContain("aspect-square");
        expect(square.classList).toContain("p-0!");
        expect(square.classList).toContain("h-26px");
        expect(square.classList).toContain("squircle-soft");
        expect(square.classList).not.toContain("squircle-smooth");
    });

    test("binds to element prop correctly", () => {
        let elRef: HTMLSpanElement | null = null;
        mounted.push(
            mount(Badge, {
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
        expect(elRef).toBeInstanceOf(HTMLSpanElement);
    });

    test("forwards custom classes and HTML attributes", () => {
        const badge = render({
            class: "custom-badge shadow-sm",
            id: "my-badge",
            title: "Badge title",
        });
        expect(badge.classList).toContain("custom-badge");
        expect(badge.classList).toContain("shadow-sm");
        expect(badge.id).toBe("my-badge");
        expect(badge.getAttribute("title")).toBe("Badge title");
    });

    test("applies SVG size and shrink classes across all sizes", () => {
        const xs = render({ size: "xs" });
        expect(xs.className).toContain("[&_svg]:size-10px");
        expect(xs.className).toContain("[&_svg]:shrink-0");

        const sm = render({ size: "sm" });
        expect(sm.className).toContain("[&_svg]:size-12px");
        expect(sm.className).toContain("[&_svg]:shrink-0");

        const md = render({ size: "md" });
        expect(md.className).toContain("[&_svg]:size-13px");
        expect(md.className).toContain("[&_svg]:shrink-0");

        const lg = render({ size: "lg" });
        expect(lg.className).toContain("[&_svg]:size-14px");
        expect(lg.className).toContain("[&_svg]:shrink-0");

        const xl = render({ size: "xl" });
        expect(xl.className).toContain("[&_svg]:size-16px");
        expect(xl.className).toContain("[&_svg]:shrink-0");
    });
});
