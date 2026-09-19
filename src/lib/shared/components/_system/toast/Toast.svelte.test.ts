import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import Toast from "./Toast.svelte";
import type { ToastProps } from "./toast.types";

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

    test("renders a compact toast surface", () => {
        const element = render({ title: "Saved", status: "success", dismissible: false });

        expect(element.dataset.slot).toBe("toast");
        expect(element.dataset.status).toBe("success");
        expect(element.classList).toContain("max-w-384px");
        expect(element.getAttribute("aria-labelledby")).toBeTruthy();
    });

    test("runs a direct action without requiring a host", () => {
        const onSelect = vi.fn();
        const element = render({
            title: "Update ready",
            description: "Restart when convenient",
            dismissible: false,
            action: { label: "Later", onSelect },
        });
        const trailing = element.querySelector<HTMLElement>('[data-slot="feedback-trailing"]');
        const action = [...element.querySelectorAll("button")].find(
            (button) => button.textContent?.trim() === "Later"
        );

        expect(trailing?.classList).toContain("row-span-2");
        expect(trailing?.classList).toContain("self-center");
        (action as HTMLButtonElement | undefined)?.click();
        expect(onSelect).toHaveBeenCalledOnce();
    });

    test("keeps the close button opt-in", async () => {
        const onDismiss = vi.fn();
        const defaultElement = render({ title: "No close by default", onDismiss });
        expect(defaultElement.querySelector("button")).toBeNull();
        if (component) await unmount(component);
        component = null;

        const element = render({ title: "Closable", closeButton: true, onDismiss });
        const close = element.querySelector<HTMLButtonElement>('button[aria-label="Dismiss toast"]');
        close?.click();
        expect(onDismiss).toHaveBeenCalledOnce();
    });
});
