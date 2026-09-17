import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import Slider from "./Slider.svelte";

describe("Slider", () => {
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
        mounted.push(mount(Slider, { target: app, props }));
        flushSync();
        return app.children.item(mounted.length - 1) as HTMLElement;
    };

    test("renders single slider with native range input and default values", () => {
        const el = render();
        expect(el).toBeDefined();

        const input = el.querySelector("input[type='range']") as HTMLInputElement;
        expect(input).not.toBeNull();
        expect(input.min).toBe("0");
        expect(input.max).toBe("100");
        expect(input.value).toBe("0");

        const thumb = el.querySelector("[id^='slider-thumb-min-']");
        expect(thumb).not.toBeNull();
    });

    test("renders range slider with two native range inputs when value is an array", () => {
        const el = render({ value: [25, 75] });
        const inputs = el.querySelectorAll("input[type='range']");
        expect(inputs.length).toBe(2);

        const inputMin = inputs[0] as HTMLInputElement;
        const inputMax = inputs[1] as HTMLInputElement;
        expect(inputMin.value).toBe("25");
        expect(inputMax.value).toBe("75");

        const thumbMin = el.querySelector("[id^='slider-thumb-min-']");
        const thumbMax = el.querySelector("[id^='slider-thumb-max-']");
        expect(thumbMin).not.toBeNull();
        expect(thumbMax).not.toBeNull();
    });

    test("renders all size variants with correct track heights", () => {
        const sm = render({ size: "sm" });
        const smTrack = sm.querySelector(".h-4px");
        expect(smTrack).not.toBeNull();

        const md = render({ size: "md" });
        const mdTrack = md.querySelector(".h-6px");
        expect(mdTrack).not.toBeNull();

        const lg = render({ size: "lg" });
        const lgTrack = lg.querySelector(".h-8px");
        expect(lgTrack).not.toBeNull();
    });

    test("renders all semantic color variants", () => {
        const colors = [
            ["accent", "bg-accent-solid-1"],
            ["base", "bg-base-solid-1"],
            ["invalid", "bg-danger-solid-1"],
        ] as const;

        for (const [color, expectedClass] of colors) {
            const el = render({ color, value: 50 });
            const fill = el.querySelector(`.${expectedClass}`);
            expect(fill).not.toBeNull();
        }
    });

    test("supports origin='center' for bidirectional adjustments", () => {
        const el = render({ origin: "center", value: 75 });
        const fill = el.querySelector(".bg-accent-solid-1") as HTMLElement;
        expect(fill).not.toBeNull();
        expect(fill.style.left).toBe("50%");
    });

    test("supports orientation='vertical'", () => {
        const el = render({ orientation: "vertical", value: 40 });
        expect(el.classList).toContain("h-full");
        expect(el.classList).toContain("justify-center");

        const input = el.querySelector("input[type='range']") as HTMLInputElement;
        expect(input.classList).toContain("rotate-180");
    });

    test("renders hit-area touch targets on thumbs by default", () => {
        const el = render({ hitArea: true });
        const hitArea = el.querySelector(".hit-area");
        expect(hitArea).not.toBeNull();
    });

    test("allows disabling hit-area when hitArea=false", () => {
        const el = render({ hitArea: false });
        const hitArea = el.querySelector(".hit-area");
        expect(hitArea).toBeNull();
    });

    test("handles disabled state via disableInteraction", () => {
        const el = render({ disabled: true });
        expect(el.getAttribute("aria-disabled")).toBe("true");

        const input = el.querySelector("input[type='range']") as HTMLInputElement;
        expect(input.disabled).toBe(true);
    });

    test("renders max input before min input when vertical orientation for top-to-bottom tab order", () => {
        const el = render({ orientation: "vertical", value: [25, 75] });
        const inputs = el.querySelectorAll("input[type='range']");
        expect(inputs.length).toBe(2);

        const inputTop = inputs[0] as HTMLInputElement;
        const inputBottom = inputs[1] as HTMLInputElement;
        expect(inputTop.value).toBe("75");
        expect(inputBottom.value).toBe("25");
    });

    test("inverts vertical arrow keys so ArrowDown decreases value and ArrowUp increases value", () => {
        let val = 50;
        const el = render({
            orientation: "vertical",
            get value() {
                return val;
            },
            set value(v) {
                val = v as number;
            },
        });
        const input = el.querySelector("input[type='range']") as HTMLInputElement;

        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
        flushSync();
        expect(val).toBe(49);

        input.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
        flushSync();
        expect(val).toBe(50);
    });

    test("sets --slider-touch-size correctly based on hitArea prop", () => {
        const elWithHitArea = render({ hitArea: true, size: "md" });
        expect(elWithHitArea.style.getPropertyValue("--slider-touch-size")).toBe("44px");

        const elWithoutHitArea = render({ hitArea: false, size: "md" });
        expect(elWithoutHitArea.style.getPropertyValue("--slider-touch-size")).toBe("20px");
    });

    test("binds to element prop correctly", () => {
        let boundEl: HTMLDivElement | null = null;
        const component = mount(Slider, {
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
