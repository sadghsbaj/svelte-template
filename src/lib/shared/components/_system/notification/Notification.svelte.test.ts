import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import "$styles/index.css";
import "virtual:uno.css";

import NotificationFixture from "./__fixtures__/NotificationFixture.svelte";
import Notification from "./Notification.svelte";
import type { NotificationProps } from "./notification.types";

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

describe("Notification", () => {
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

    function render(props: NotificationProps): HTMLElement {
        component = mount(Notification, { target, props });
        flushSync();
        return target.firstElementChild as HTMLElement;
    }

    function renderFixture(
        props: { trailing?: "none" | "badge" | "button"; body?: boolean } = {}
    ): HTMLElement {
        component = mount(NotificationFixture, { target, props });
        flushSync();
        return target.firstElementChild as HTMLElement;
    }

    test("renders semantic status and compact list content without a close control", () => {
        const element = render({
            status: "warning",
            title: "Review changes",
            description: ["First item", "Second item"],
        });

        expect(element.dataset.slot).toBe("notification");
        expect(element.dataset.status).toBe("warning");
        expect(element.querySelector('[data-slot="notification-title"]')?.textContent).toBe(
            "Review changes"
        );
        const list = element.querySelector<HTMLElement>('[data-slot="notification-list"]');
        const items = element.querySelectorAll("li");
        expect(items).toHaveLength(2);
        if (!list || !items[0] || !items[1]) throw new Error("Expected notification list");
        expect(getComputedStyle(list).rowGap).toBe("4px");
        expect(items[1].getBoundingClientRect().top - items[0].getBoundingClientRect().bottom).toBe(
            4
        );
        expect(element.querySelector("button")).toBeNull();
    });

    test("uses exact notification padding and typography geometry", () => {
        const card = renderFixture({ trailing: "badge", body: true });
        const message = card.querySelector<HTMLElement>('[data-slot="notification-message"]');
        const icon = card.querySelector<HTMLElement>('[data-slot="notification-leading"]');
        const titleRow = card.querySelector<HTMLElement>('[data-slot="notification-title-row"]');
        const title = card.querySelector<HTMLElement>('[data-slot="notification-title"]');
        const description = card.querySelector<HTMLElement>(
            '[data-slot="notification-description"]'
        );
        const trailing = card.querySelector<HTMLElement>('[data-slot="notification-trailing"]');
        if (!message || !icon || !titleRow || !title || !description || !trailing) {
            throw new Error("Expected complete notification geometry");
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
        expect(titleRowBox.top - cardBox.top).toBe(14);
        expect(titleRowBox.height).toBe(16);
        expect(iconBox.top + iconBox.height / 2).toBeCloseTo(
            titleBox.top + titleBox.height / 2,
            1
        );
        expect(cardBox.right - trailingBox.right).toBe(14);
        expect(trailingBox.top - cardBox.top).toBe(14);
        expect(cardBox.bottom - descriptionBox.bottom).toBe(14);
        expect(descriptionBox.top - titleRowBox.bottom).toBe(4);
        expect(titleStyle.display).toBe("block");
        expect(titleStyle.fontSize).toBe("14px");
        expect(titleStyle.lineHeight).toBe("16px");
        expect(titleStyle.textBoxTrim).toBe("trim-both");
        expect(descriptionStyle.fontSize).toBe("12px");
        expect(descriptionStyle.lineHeight).toBe("16px");
        expect(descriptionStyle.marginTop).toBe("4px");
        expect(getComputedStyle(trailing).transform).toBe("none");
    });

    test("keeps title geometry stable with a tall trailing control", async () => {
        const badgeCard = renderFixture({ trailing: "badge", body: true });
        const badgeTitle = badgeCard.querySelector<HTMLElement>('[data-slot="notification-title"]');
        if (!badgeTitle) throw new Error("Expected badge title");
        const badgeOffset = box(badgeTitle).top - box(badgeCard).top;

        if (component) await unmount(component);
        component = null;
        const buttonCard = renderFixture({ trailing: "button", body: true });
        const buttonTitle = buttonCard.querySelector<HTMLElement>('[data-slot="notification-title"]');
        const buttonTrailing = buttonCard.querySelector<HTMLElement>(
            '[data-slot="notification-trailing"]'
        );
        if (!buttonTitle || !buttonTrailing) throw new Error("Expected button geometry");

        expect(box(buttonTitle).top - box(buttonCard).top).toBe(badgeOffset);
        expect(getComputedStyle(buttonTrailing).transform).toBe("none");
    });

    test("centers title-only message against a taller trailing badge", () => {
        const card = renderFixture({ trailing: "badge", body: false });
        const message = card.querySelector<HTMLElement>('[data-slot="notification-message"]');
        const trailing = card.querySelector<HTMLElement>('[data-slot="notification-trailing"]');
        if (!message || !trailing) throw new Error("Expected title-only geometry");

        const cardBox = box(card);
        const messageBox = box(message);
        const trailingBox = box(trailing);
        expect(messageBox.top - cardBox.top).toBe(cardBox.bottom - messageBox.bottom);
        expect(trailingBox.top - cardBox.top).toBe(cardBox.bottom - trailingBox.bottom);
    });
});
