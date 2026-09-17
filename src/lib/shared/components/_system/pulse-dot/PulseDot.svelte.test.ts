import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import PulseDot from "./PulseDot.svelte";

describe("PulseDot", () => {
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
        mounted.push(mount(PulseDot, { target: app, props }));
        flushSync();
        return app
            .querySelectorAll<HTMLElement>("span")
            .item((mounted.length - 1) * (props.pulsing === false ? 2 : 3));
    };

    test("renders with default props (size md, color success, pulsing, glow)", () => {
        const dot = render();
        expect(dot.classList).toContain("size-8px");
        expect(dot.classList).toContain("text-success-500");

        const children = dot.children;
        // pulsing=true -> 2 inner spans (ping wave + core)
        expect(children).toHaveLength(2);

        const [ping, core] = [...children];
        expect(ping.classList).toContain("animate-pulse-dot");
        expect(core.classList).toContain("pulse-dot-glow");
    });

    test("renders different sizes correctly", () => {
        const sm = render({ size: "sm" });
        expect(sm.classList).toContain("size-6px");

        const md = render({ size: "md" });
        expect(md.classList).toContain("size-8px");

        const lg = render({ size: "lg" });
        expect(lg.classList).toContain("size-10px");
    });

    test("renders all semantic colors correctly", () => {
        const colors = ["success", "danger", "warning", "accent", "info", "base"] as const;

        for (const color of colors) {
            const el = render({ color });
            expect(el.classList).toContain(`text-${color}-500`);
        }
    });

    test("omits ping wave when pulsing is false", () => {
        const dot = render({ pulsing: false });
        expect(dot.children).toHaveLength(1);
        const core = dot.firstElementChild;
        expect(core?.classList).not.toContain("animate-pulse-dot");
        expect(core?.classList).toContain("pulse-dot-glow");
    });

    test("omits glow class when glow is false", () => {
        const dot = render({ glow: false });
        const children = [...dot.children];
        const core = children[1];
        expect(core.classList).not.toContain("pulse-dot-glow");
    });

    test("forwards HTML attributes and accessibility props", () => {
        const dot = render({
            role: "status",
            "aria-label": "System Operational",
            id: "system-status",
        });

        expect(dot.getAttribute("role")).toBe("status");
        expect(dot.getAttribute("aria-label")).toBe("System Operational");
        expect(dot.id).toBe("system-status");
    });

    test("merges consumer custom class", () => {
        const dot = render({ class: "m-4 custom-indicator" });
        expect(dot.classList).toContain("custom-indicator");
        expect(dot.classList).toContain("m-4");
    });
});
