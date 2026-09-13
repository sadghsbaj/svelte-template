import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import FloatingFixture from "./__fixtures__/FloatingFixture.svelte";
import FloatingLayerFixture from "./__fixtures__/FloatingLayerFixture.svelte";
import Floating from "./Floating.svelte";
import type {
    FloatingAnchor,
    FloatingPlacement,
    FloatingPositionResult,
    VirtualAnchor,
} from "./floating.types";

const domRect = (x: number, y: number, width: number, height: number): DOMRect =>
    new DOMRect(x, y, width, height);

const nextFrame = (): Promise<void> =>
    new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

describe("Floating", () => {
    let app: HTMLDivElement;
    let anchor: HTMLButtonElement;
    let mounted: ReturnType<typeof mount>[];
    let resizeObservers: MockResizeObserver[];

    class MockResizeObserver {
        observe = vi.fn();
        disconnect = vi.fn();

        constructor(public callback: ResizeObserverCallback) {
            resizeObservers.push(this);
        }
    }

    beforeEach(() => {
        app = document.createElement("div");
        app.id = "app";
        anchor = document.createElement("button");
        app.append(anchor);
        document.body.append(app);
        mounted = [];
        resizeObservers = [];
        vi.stubGlobal("ResizeObserver", MockResizeObserver);
        vi.spyOn(anchor, "getBoundingClientRect").mockReturnValue(domRect(100, 100, 20, 20));
        mounted.push(mount(FloatingLayerFixture, { target: app }));
    });

    afterEach(async () => {
        for (const component of mounted.toReversed()) await unmount(component);
        document.body.replaceChildren();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    const getLastFloating = (): HTMLDivElement => {
        const floatings = document.querySelectorAll<HTMLDivElement>("[data-placement]");
        const floating = floatings.item(floatings.length - 1);
        if (!floating) throw new Error("Floating element was not mounted");
        return floating;
    };

    const mountFixture = (
        props: {
            anchor?: FloatingAnchor;
            placement?: FloatingPlacement;
            onPositionChange?: (result: FloatingPositionResult) => void;
            trackPosition?: boolean;
        } = {}
    ): { component: ReturnType<typeof mount>; floating: HTMLDivElement } => {
        const component = mount(FloatingFixture, {
            target: app,
            props: { anchor, ...props },
        });
        mounted.push(component);
        const floating = document.querySelector<HTMLDivElement>("#fixture-floating");
        if (!floating) throw new Error("Floating element was not mounted");
        vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(domRect(0, 0, 40, 10));
        return { component, floating };
    };

    test("portals through AppLayer and preserves neutral consumer attributes", async () => {
        const { component, floating } = mountFixture();
        await Promise.resolve();

        expect(floating.parentElement?.parentElement).toBe(document.body);
        expect(floating.style.visibility).toBe("hidden");
        expect(floating.classList.contains("pointer-events-auto")).toBe(true);
        expect(floating.classList.contains("consumer-class")).toBe(true);
        expect(floating.style.pointerEvents).toBe("auto");
        expect(floating.parentElement?.style.zIndex).toBe("1000");
        expect(floating.style.color).toBe("red");
        expect(floating.style.transform).toBe("scale(1)");
        expect(floating.hasAttribute("role")).toBe(false);
        expect(floating.hasAttribute("tabindex")).toBe(false);
        expect([...floating.attributes].some(({ name }) => name.startsWith("aria-"))).toBe(false);
        expect(component.getElement()).toBe(floating);

        await nextFrame();

        expect(floating.style.visibility).toBe("visible");
        expect(floating.style.left).toBe("90px");
        expect(floating.style.top).toBe("120px");
        expect(floating.dataset.placement).toBe("bottom");
        expect(floating.dataset.positioned).toBe("");
        expect(floating.dataset.side).toBeUndefined();
        expect(floating.dataset.alignment).toBeUndefined();
        expect(floating.style.getPropertyValue("--floating-anchor-width")).toBe("20px");
        expect(floating.style.getPropertyValue("--floating-available-height")).not.toBe("");
        expect(floating.querySelector("[data-context]")?.textContent).toBe("bottom:true");
    });

    test("waits safely when Floating mounts before the central layer host", async () => {
        const initialHostElement = document.body.querySelector<HTMLElement>(
            "[style*='z-index: 1000']"
        );
        const initialHost = mounted.shift();
        if (initialHost) await unmount(initialHost);
        expect(initialHostElement?.isConnected).toBe(false);

        const component = mount(FloatingFixture, { target: app, props: { anchor } });
        mounted.push(component);
        await nextFrame();
        expect(document.querySelector("#fixture-floating")).toBeNull();

        const host = mount(FloatingLayerFixture, { target: app });
        mounted.unshift(host);
        await Promise.resolve();
        const floating = document.querySelector<HTMLDivElement>("#fixture-floating");
        if (!floating) throw new Error("Floating did not attach to the registered layer host");
        vi.spyOn(floating, "getBoundingClientRect").mockReturnValue(domRect(0, 0, 40, 10));

        await nextFrame();

        expect(floating.parentElement?.style.zIndex).toBe("1000");
        expect(floating.dataset.positioned).toBe("");
    });

    test("supports point and virtual anchors with context elements", async () => {
        const contextElement = document.createElement("div");
        app.append(contextElement);
        const virtual: VirtualAnchor = {
            contextElement,
            getBoundingClientRect: () => domRect(30, 40, 10, 10),
        };
        const virtualMount = mount(Floating, {
            target: app,
            props: { anchor: virtual, shift: false },
        });
        mounted.push(virtualMount);
        await Promise.resolve();
        const virtualFloating = getLastFloating();
        vi.spyOn(virtualFloating, "getBoundingClientRect").mockReturnValue(domRect(0, 0, 20, 10));
        await nextFrame();
        expect({ left: virtualFloating.style.left, top: virtualFloating.style.top }).toEqual({
            left: "25px",
            top: "50px",
        });
        expect(resizeObservers[0]?.observe).toHaveBeenCalledWith(contextElement);

        await unmount(virtualMount);
        mounted.splice(mounted.indexOf(virtualMount), 1);
        const pointMount = mount(Floating, {
            target: app,
            props: { anchor: { x: 70, y: 80, width: 4, height: 6 }, shift: false },
        });
        mounted.push(pointMount);
        await Promise.resolve();
        const pointFloating = getLastFloating();
        vi.spyOn(pointFloating, "getBoundingClientRect").mockReturnValue(domRect(0, 0, 20, 10));
        await nextFrame();
        expect({ left: pointFloating.style.left, top: pointFloating.style.top }).toEqual({
            left: "62px",
            top: "86px",
        });
    });

    test("reacts to anchor and placement changes and reports positions", async () => {
        const callback = vi.fn<(result: FloatingPositionResult) => void>();
        const { component, floating } = mountFixture({ onPositionChange: callback });
        await nextFrame();
        expect(callback).toHaveBeenCalledTimes(1);

        flushSync(() => component.setPlacement("top-start"));
        await nextFrame();
        expect(floating.dataset.placement).toBe("top-start");
        expect(floating.style.left).toBe("100px");
        expect(floating.style.top).toBe("90px");

        flushSync(() => component.setAnchor({ x: 200, y: 150 }));
        await nextFrame();
        expect(floating.style.left).toBe("200px");
        expect(floating.style.top).toBe("140px");
        expect(callback).toHaveBeenCalledTimes(3);
    });

    test("coalesces scroll and resize events to one update per frame", async () => {
        let anchorRect = domRect(100, 100, 20, 20);
        vi.mocked(anchor.getBoundingClientRect).mockImplementation(() => anchorRect);
        const callback = vi.fn<(result: FloatingPositionResult) => void>();
        mountFixture({ onPositionChange: callback });
        await nextFrame();
        callback.mockClear();

        anchorRect = domRect(120, 100, 20, 20);
        window.dispatchEvent(new Event("resize"));
        window.dispatchEvent(new Event("resize"));
        document.dispatchEvent(new Event("scroll"));
        resizeObservers[0]?.callback([], resizeObservers[0] as unknown as ResizeObserver);
        await nextFrame();

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback.mock.calls[0]?.[0].x).toBe(110);
    });

    test("tracks getter anchor rect changes without an external event", async () => {
        const point = { x: 40, y: 50 };
        const callback = vi.fn<(result: FloatingPositionResult) => void>();
        const { floating } = mountFixture({
            anchor: () => point,
            trackPosition: true,
            onPositionChange: callback,
        });
        await nextFrame();
        callback.mockClear();

        point.x = 80;
        await nextFrame();

        expect(callback).toHaveBeenCalledOnce();
        expect(floating.style.left).toBe("60px");
    });

    test("disconnects observers and prevents callbacks after unmount", async () => {
        const callback = vi.fn<(result: FloatingPositionResult) => void>();
        const { component } = mountFixture({ onPositionChange: callback });
        await nextFrame();
        const observer = resizeObservers[0];
        expect(observer?.observe).toHaveBeenCalledWith(anchor);

        await unmount(component);
        mounted.splice(mounted.indexOf(component), 1);
        callback.mockClear();
        window.dispatchEvent(new Event("resize"));
        await nextFrame();

        expect(observer?.disconnect).toHaveBeenCalledTimes(1);
        expect(callback).not.toHaveBeenCalled();
        expect(document.querySelector("#fixture-floating")).toBeNull();
    });

    test("reports invalid anchor geometry without adding semantics", async () => {
        const onPositionError = vi.fn();
        const component = mount(Floating, {
            target: app,
            props: {
                anchor: { x: NaN, y: 0 },
                onPositionError,
            },
        });
        mounted.push(component);
        await nextFrame();
        expect(onPositionError).toHaveBeenCalledOnce();
        expect(getLastFloating().dataset.positioned).toBeUndefined();
    });

    test("can remain visible while no anchor is available", async () => {
        const component = mount(Floating, {
            target: app,
            props: { anchor: null, hideUntilPositioned: false },
        });
        mounted.push(component);
        await Promise.resolve();
        const floating = getLastFloating();

        expect(floating.style.visibility).toBe("visible");
        expect(floating.dataset.positioned).toBeUndefined();
    });
});
