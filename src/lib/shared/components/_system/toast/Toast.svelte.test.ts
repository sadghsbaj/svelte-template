import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import "$styles/index.css";
import "virtual:uno.css";

import ToastFixture from "./__fixtures__/ToastFixture.svelte";
import Toast from "./Toast.svelte";
import type { ToastProps } from "./toast.types";

interface Box {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
}

function box(element: Element): Box {
    const rect = element.getBoundingClientRect();
    return {
        top: rect.top,
        right: rect.right,
        bottom: rect.bottom,
        left: rect.left,
        width: rect.width,
        height: rect.height,
    };
}

describe("Toast", () => {
    let target: HTMLDivElement;
    let component: ReturnType<typeof mount> | null;

    beforeEach(() => {
        target = document.createElement("div");
        document.body.append(target);
        component = null;
    });

    afterEach(async () => {
        if (component) await unmount(component);
        target.remove();
    });

    function render(props: ToastProps): HTMLElement {
        component = mount(Toast, { target, props });
        flushSync();
        return target.firstElementChild as HTMLElement;
    }

    function renderFixture(
        props: { trailing?: "none" | "badge" | "button"; description?: boolean } = {}
    ): HTMLElement {
        component = mount(ToastFixture, { target, props });
        flushSync();
        return target.firstElementChild as HTMLElement;
    }

    test("renders a compact semantic surface without a close control", () => {
        const element = render({ title: "Saved", status: "success" });

        expect(element.dataset.slot).toBe("toast");
        expect(element.dataset.status).toBe("success");
        expect(element.querySelector("button")).toBeNull();
        expect(element.getAttribute("aria-labelledby")).toBeTruthy();
    });

    test("uses exact toast padding and typography geometry", () => {
        const card = renderFixture({ trailing: "badge", description: true });
        const icon = card.querySelector<HTMLElement>('[data-slot="toast-leading"]');
        const titleRow = card.querySelector<HTMLElement>('[data-slot="toast-title-row"]');
        const title = card.querySelector<HTMLElement>('[data-slot="toast-title"]');
        const description = card.querySelector<HTMLElement>('[data-slot="toast-description"]');
        const trailing = card.querySelector<HTMLElement>('[data-slot="toast-trailing"]');
        if (!icon || !titleRow || !title || !description || !trailing) {
            throw new Error("Expected complete toast geometry");
        }

        const cardBox = box(card);
        const iconBox = box(icon);
        const titleRowBox = box(titleRow);
        const titleBox = box(title);
        const descriptionBox = box(description);
        const trailingBox = box(trailing);
        const cardStyle = getComputedStyle(card);
        const titleStyle = getComputedStyle(title);
        const descriptionStyle = getComputedStyle(description);

        expect(cardStyle.paddingTop).toBe("14px");
        expect(cardStyle.paddingRight).toBe("14px");
        expect(cardStyle.paddingBottom).toBe("14px");
        expect(cardStyle.paddingLeft).toBe("14px");
        expect(iconBox.width).toBe(16);
        expect(iconBox.height).toBe(16);
        expect(iconBox.left - cardBox.left).toBe(14);
        expect(titleBox.left - iconBox.right).toBe(10);
        expect(titleRowBox.height).toBe(16);
        expect(iconBox.top + iconBox.height / 2).toBeCloseTo(
            titleBox.top + titleBox.height / 2,
            1
        );
        expect(descriptionBox.top - titleRowBox.bottom).toBe(4);
        expect(cardBox.bottom - descriptionBox.bottom).toBe(14);
        expect(cardBox.right - trailingBox.right).toBe(14);
        expect(trailingBox.top + trailingBox.height / 2).toBeCloseTo(
            cardBox.top + cardBox.height / 2,
            1
        );
        expect(titleStyle.display).toBe("block");
        expect(titleStyle.fontSize).toBe("14px");
        expect(titleStyle.lineHeight).toBe("16px");
        expect(titleStyle.textBoxTrim).toBe("trim-both");
        expect(descriptionStyle.fontSize).toBe("12px");
        expect(descriptionStyle.lineHeight).toBe("16px");
        expect(descriptionStyle.marginTop).toBe("4px");
        expect(descriptionStyle.whiteSpace).toBe("nowrap");
        expect(descriptionStyle.overflow).toBe("hidden");
        expect(descriptionStyle.textOverflow).toBe("ellipsis");
        expect(getComputedStyle(trailing).transform).toBe("none");
    });

    test("keeps message geometry stable with a taller trailing button", async () => {
        const badgeCard = renderFixture({ trailing: "badge", description: true });
        const badgeTitle = badgeCard.querySelector<HTMLElement>('[data-slot="toast-title"]');
        if (!badgeTitle) throw new Error("Expected badge title");
        const badgeOffset = box(badgeTitle).top - box(badgeCard).top;

        if (component) await unmount(component);
        component = null;
        const buttonCard = renderFixture({ trailing: "button", description: true });
        const buttonTitle = buttonCard.querySelector<HTMLElement>('[data-slot="toast-title"]');
        const buttonTrailing = buttonCard.querySelector<HTMLElement>('[data-slot="toast-trailing"]');
        if (!buttonTitle || !buttonTrailing) throw new Error("Expected button geometry");

        expect(box(buttonTitle).top - box(buttonCard).top).toBe(badgeOffset);
        expect(box(buttonTrailing).top + box(buttonTrailing).height / 2).toBeCloseTo(
            box(buttonCard).top + box(buttonCard).height / 2,
            1
        );
        expect(getComputedStyle(buttonTrailing).transform).toBe("none");
    });

    test("centers title-only message and trailing content", () => {
        const card = renderFixture({ trailing: "badge", description: false });
        const message = card.querySelector<HTMLElement>('[data-slot="toast-message"]');
        const trailing = card.querySelector<HTMLElement>('[data-slot="toast-trailing"]');
        if (!message || !trailing) throw new Error("Expected title-only toast geometry");

        const cardBox = box(card);
        const messageBox = box(message);
        const trailingBox = box(trailing);
        expect(messageBox.top - cardBox.top).toBe(cardBox.bottom - messageBox.bottom);
        expect(trailingBox.top - cardBox.top).toBe(cardBox.bottom - trailingBox.bottom);
    });
});
