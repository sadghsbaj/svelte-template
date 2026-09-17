import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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
        expect(input.classList).toContain("is-vertical");
    });

    test("supports thumbShape variants (circle, bar, pill)", () => {
        const circle = render({ thumbShape: "circle", size: "md" });
        const circleThumb = circle.querySelector("[id^='slider-thumb-min-']");
        expect(circleThumb?.classList).toContain("size-20px");

        const bar = render({ thumbShape: "bar", size: "md", orientation: "horizontal" });
        const barThumb = bar.querySelector("[id^='slider-thumb-min-']");
        expect(barThumb?.classList).toContain("w-8px");
        expect(barThumb?.classList).toContain("h-24px");

        const pill = render({ thumbShape: "pill", size: "md", orientation: "horizontal" });
        const pillThumb = pill.querySelector("[id^='slider-thumb-min-']");
        expect(pillThumb?.classList).toContain("w-28px");
        expect(pillThumb?.classList).toContain("h-20px");

        const vertBar = render({ thumbShape: "bar", size: "md", orientation: "vertical" });
        const vertBarThumb = vertBar.querySelector("[id^='slider-thumb-min-']");
        expect(vertBarThumb?.classList).toContain("w-24px");
        expect(vertBarThumb?.classList).toContain("h-8px");
    });

    test("renders hit-area touch targets on thumbs by default", () => {
        const el = render({ hitArea: true });
        const hitArea = el.querySelector(".slider-thumb-target") as HTMLElement;
        expect(hitArea).not.toBeNull();
        expect(hitArea.style.width).toBe("44px");
        expect(hitArea.style.height).toBe("44px");
        expect(el.style.height).toBe("44px");
        expect(el.style.marginBlock).toBe("-12px");
    });

    test("allows disabling hit-area when hitArea=false", () => {
        const el = render({ hitArea: false, thumbShape: "bar", size: "md" });
        const hitArea = el.querySelector(".slider-thumb-target") as HTMLElement;
        expect(hitArea.style.width).toBe("8px");
        expect(hitArea.style.height).toBe("24px");
        expect(el.style.height).toBe("24px");
        expect(el.style.marginBlock).toBe("-2px");
    });

    test("handles disabled state via disableInteraction", () => {
        const el = render({ disabled: true });
        expect(el.getAttribute("aria-disabled")).toBe("true");
        expect(el.classList).toContain("cursor-not-allowed");
        expect(el.style.cursor).toBe("not-allowed");

        const input = el.querySelector("input[type='range']") as HTMLInputElement;
        expect(input.disabled).toBe(true);
        expect(input.classList).toContain("pointer-events-none");
        expect(input.style.cursor).toBe("not-allowed");
    });

    test("sets default pointer cursor on container and track", () => {
        const el = render();
        expect(el.classList).toContain("cursor-pointer");

        const input = el.querySelector("input[type='range']") as HTMLInputElement;
        expect(input.classList).toContain("slider-input");
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

    test("supports a custom numeric hit-area size", () => {
        const el = render({ hitArea: 56, size: "md" });
        const hitArea = el.querySelector(".slider-thumb-target") as HTMLElement;

        expect(hitArea.style.width).toBe("56px");
        expect(hitArea.style.height).toBe("56px");
        expect(el.style.height).toBe("56px");
        expect(el.style.marginBlock).toBe("-18px");
    });

    test("expands vertical touch geometry without changing its occupied width", () => {
        const el = render({ hitArea: true, orientation: "vertical", size: "md" });

        expect(el.style.width).toBe("44px");
        expect(el.style.marginInline).toBe("-12px");
    });

    test("sets --slider-thumb-width and --slider-thumb-height matching thumb shape and orientation", () => {
        const horizBar = render({ thumbShape: "bar", size: "md", orientation: "horizontal" });
        expect(horizBar.style.getPropertyValue("--slider-thumb-width")).toBe("8px");
        expect(horizBar.style.getPropertyValue("--slider-thumb-height")).toBe("24px");

        const vertBar = render({ thumbShape: "bar", size: "md", orientation: "vertical" });
        expect(vertBar.style.getPropertyValue("--slider-thumb-width")).toBe("24px");
        expect(vertBar.style.getPropertyValue("--slider-thumb-height")).toBe("8px");

        const circle = render({ thumbShape: "circle", size: "md" });
        expect(circle.style.getPropertyValue("--slider-thumb-width")).toBe("20px");
        expect(circle.style.getPropertyValue("--slider-thumb-height")).toBe("20px");
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

    test("renders thumb target with higher z-index than native input for touch accessibility", () => {
        const el = render({ value: 50, size: "md" });
        const thumbTarget = el.querySelector(".slider-thumb-target-min") as HTMLElement;
        const input = el.querySelector("input[type='range']") as HTMLInputElement;

        expect(Number(thumbTarget.style.zIndex || "0")).toBeGreaterThan(
            Number(input.style.zIndex || "0")
        );
    });

    test("drags from the touch target outside the visual thumb", () => {
        let val = 50;
        const el = render({
            get value() {
                return val;
            },
            set value(v) {
                val = v as number;
            },
        });
        const target = el.querySelector(".slider-thumb-target-min") as HTMLElement;

        vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
            bottom: 20,
            height: 20,
            left: 0,
            right: 200,
            top: 0,
            width: 200,
            x: 0,
            y: 0,
            toJSON: () => ({}),
        });

        target.dispatchEvent(
            new PointerEvent("pointerdown", {
                bubbles: true,
                button: 0,
                cancelable: true,
                clientX: 100,
                clientY: -10,
                pointerId: 1,
                pointerType: "touch",
            })
        );
        el.dispatchEvent(
            new PointerEvent("pointermove", {
                bubbles: true,
                clientX: 140,
                clientY: -10,
                pointerId: 1,
                pointerType: "touch",
            })
        );
        flushSync();

        expect(val).toBe(70);
    });
});
