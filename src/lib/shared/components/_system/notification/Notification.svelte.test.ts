import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Notification from "./Notification.svelte";
import type { NotificationProps } from "./notification.types";

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

    test("renders semantic status, title, and list content", () => {
        const element = render({
            status: "warning",
            title: "Review changes",
            description: ["First item", "Second item"],
            dismissible: false,
        });

        expect(element.dataset.slot).toBe("notification");
        expect(element.dataset.status).toBe("warning");
        expect(element.querySelector('[data-slot="feedback-title"]')?.textContent).toBe(
            "Review changes"
        );
        expect(element.querySelectorAll("li")).toHaveLength(2);
        const [firstItem, secondItem] = element.querySelectorAll("li");
        if (!firstItem || !secondItem) throw new Error("Expected two list items");
        expect(
            secondItem.getBoundingClientRect().top - firstItem.getBoundingClientRect().bottom
        ).toBeLessThanOrEqual(1);
        expect(element.querySelector("button")).toBeNull();
    });

    test("keeps description close to the title", () => {
        const element = render({ title: "Title", description: "Description", dismissible: false });
        const title = element.querySelector<HTMLElement>('[data-slot="feedback-title"]');
        const description = element.querySelector<HTMLElement>(
            '[data-slot="feedback-description"]'
        );
        if (!title || !description) throw new Error("Expected title and description");

        const titleRect = title.getBoundingClientRect();
        const descriptionRect = description.getBoundingClientRect();
        expect(descriptionRect.top - titleRect.bottom).toBeLessThanOrEqual(3);
    });

    test("positions rich trailing content without changing the title row", () => {
        const element = render({
            title: "Workspace updated",
            description: "Three collaborators were notified.",
            action: { label: "Review", onSelect: () => {} },
            dismissible: false,
        });
        const trailing = element.querySelector<HTMLElement>('[data-slot="feedback-trailing"]');

        expect(element.classList).toContain("grid-cols-[auto_minmax(0,1fr)_auto]");
        expect(element.classList).not.toContain("grid-cols-[auto_minmax(0,1fr)_auto_auto]");
        expect(trailing?.classList).not.toContain("translate-y-4px");
        expect(
            element.querySelector('[data-slot="feedback-title-row"]')?.classList
        ).toContain("h-16px");
    });

    test("uses the shared close button when dismissal is available", async () => {
        const onDismiss = vi.fn();
        const defaultElement = render({ title: "No close by default", onDismiss });
        expect(defaultElement.querySelector("button")).toBeNull();
        if (component) await unmount(component);
        component = null;

        const element = render({ title: "Closable", closeButton: true, onDismiss });
        const close = element.querySelector<HTMLButtonElement>('button[aria-label="Dismiss notification"]');

        expect(close?.classList).toContain("size-24px");
        close?.click();
        expect(onDismiss).toHaveBeenCalledOnce();
    });
});
