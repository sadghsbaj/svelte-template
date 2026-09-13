import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import Button from "./Button.svelte";

describe("Button", () => {
    let app: HTMLDivElement;
    let mounted: ReturnType<typeof mount>[] = [];

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        document.body.append(app);
        mounted = [];
    });

    afterEach(async () => {
        for (const component of mounted.toReversed()) {
            await unmount(component);
        }
        mounted = [];
        app.remove();
    });

    const render = (props: Record<string, unknown> = {}): HTMLButtonElement => {
        const component = mount(Button, { target: app, props });
        mounted.push(component);
        flushSync();
        return app.querySelectorAll<HTMLButtonElement>("button").item(mounted.length - 1);
    };

    test("renders centered by default", () => {
        const button = render({});
        expect(button).not.toBeNull();
        expect(button.className).toContain("justify-center");
        expect(button.className).toContain("text-center");
    });

    test("supports align='start'", () => {
        const button = render({ align: "start" });
        expect(button.className).toContain("justify-start");
        expect(button.className).toContain("text-left");
        expect(button.className).not.toContain("justify-center");
    });

    test("supports align='end'", () => {
        const button = render({ align: "end" });
        expect(button.className).toContain("justify-end");
        expect(button.className).toContain("text-right");
        expect(button.className).not.toContain("justify-center");
    });

    test("supports align='between'", () => {
        const button = render({ align: "between" });
        expect(button.className).toContain("justify-between");
        expect(button.className).not.toContain("justify-center");
    });

    test("applies fullWidth modifier correctly", () => {
        const button = render({ fullWidth: true });
        expect(button.className).toContain("w-full!");
    });

    test("supports polymorphic rendering via as prop", () => {
        const component = mount(Button, { target: app, props: { as: "a", href: "/test" } });
        mounted.push(component);
        flushSync();
        const link = app.querySelector("a");
        expect(link).not.toBeNull();
        expect(link?.getAttribute("href")).toBe("/test");
    });

    test("exposes DOM element via bindable element prop", () => {
        let btnEl: HTMLElement | undefined;
        const component = mount(Button, {
            target: app,
            props: {
                get element() {
                    return btnEl;
                },
                set element(val) {
                    btnEl = val;
                },
            },
        });
        mounted.push(component);
        flushSync();
        expect(btnEl).toBeInstanceOf(HTMLButtonElement);
    });
});
