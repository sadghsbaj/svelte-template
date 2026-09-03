import { mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import TransitionInheritanceFixture from "../__fixtures__/TransitionInheritanceFixture.svelte";

describe("Uno transition utilities", () => {
    let fixture: ReturnType<typeof mount>;

    beforeEach(() => {
        fixture = mount(TransitionInheritanceFixture, { target: document.body });
    });

    afterEach(async () => {
        await unmount(fixture);
    });

    test("does not inherit a parent transition slot", () => {
        const parent = document.querySelector<HTMLElement>("[data-transition-parent]")!;
        const child = document.querySelector<HTMLElement>("[data-transition-child]")!;

        const parentStyle = getComputedStyle(parent);
        const childStyle = getComputedStyle(child);

        expect(parentStyle.getPropertyValue("--t-all")).toContain("all .3s");
        expect(childStyle.getPropertyValue("--t-all")).toBe("opacity 0s");
        expect(childStyle.transitionProperty.split(", ")).toContain("box-shadow");
        expect(childStyle.transitionProperty.split(", ")).not.toContain("all");
        expect(childStyle.transitionProperty.split(", ")).not.toContain("scale");
        expect(childStyle.transitionProperty.split(", ")).not.toContain("background-color");
    });

    test("preserves independent durations on the same element", () => {
        const element = document.querySelector<HTMLElement>("[data-transition-independent]")!;

        const style = getComputedStyle(element);
        const properties = style.transitionProperty.split(", ");
        const durations = style.transitionDuration.split(", ");

        expect(durations[properties.indexOf("scale")]).toBe("20s");
        expect(durations[properties.indexOf("background-color")]).toBe("0.7s");
    });
});
