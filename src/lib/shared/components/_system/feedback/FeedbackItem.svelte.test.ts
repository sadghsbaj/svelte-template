import { flushSync, mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import FeedbackItem from "./FeedbackItem.svelte";

interface RenderResult {
    surface: HTMLElement;
    onDismiss: ReturnType<typeof vi.fn>;
    onPause: ReturnType<typeof vi.fn>;
    onResume: ReturnType<typeof vi.fn>;
}

describe("FeedbackItem touch gestures", () => {
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

    function render(): RenderResult {
        const onDismiss = vi.fn();
        const onPause = vi.fn();
        const onResume = vi.fn();
        component = mount(FeedbackItem, {
            target,
            props: {
                phase: "visible",
                edge: "bottom",
                dismissible: true,
                pauseOnInteraction: true,
                onEntered: vi.fn(),
                onExited: vi.fn(),
                onDismiss,
                onPause,
                onResume,
            },
        });
        flushSync();
        const surface = target.querySelector<HTMLElement>('[data-slot="feedback-swipe"]');
        if (!surface) throw new Error("Expected feedback swipe surface");
        return { surface, onDismiss, onPause, onResume };
    }

    test("pauses a stationary touch press without dismissing", () => {
        const { surface, onDismiss, onPause, onResume } = render();
        surface.dispatchEvent(
            new PointerEvent("pointerdown", {
                pointerType: "touch",
                isPrimary: true,
                pointerId: 1,
                button: 0,
                clientX: 100,
                clientY: 100,
                bubbles: true,
            })
        );
        window.dispatchEvent(
            new PointerEvent("pointerup", {
                pointerType: "touch",
                isPrimary: true,
                pointerId: 1,
                clientX: 100,
                clientY: 100,
                bubbles: true,
            })
        );

        expect(onPause).toHaveBeenCalledWith("press");
        expect(onResume).toHaveBeenCalledWith("press");
        expect(onDismiss).not.toHaveBeenCalled();
    });

    test("hands a touch press to horizontal drag and dismisses without a long delay", () => {
        const { surface, onDismiss, onPause, onResume } = render();
        surface.dispatchEvent(
            new PointerEvent("pointerdown", {
                pointerType: "touch",
                isPrimary: true,
                pointerId: 2,
                button: 0,
                clientX: 100,
                clientY: 100,
                bubbles: true,
            })
        );
        window.dispatchEvent(
            new PointerEvent("pointermove", {
                pointerType: "touch",
                isPrimary: true,
                pointerId: 2,
                clientX: 106,
                clientY: 105,
                bubbles: true,
                cancelable: true,
            })
        );
        window.dispatchEvent(
            new PointerEvent("pointermove", {
                pointerType: "touch",
                isPrimary: true,
                pointerId: 2,
                clientX: 150,
                clientY: 107,
                bubbles: true,
                cancelable: true,
            })
        );
        window.dispatchEvent(
            new PointerEvent("pointerup", {
                pointerType: "touch",
                isPrimary: true,
                pointerId: 2,
                clientX: 150,
                clientY: 107,
                bubbles: true,
            })
        );

        expect(onResume).toHaveBeenCalledWith("press");
        expect(onPause).toHaveBeenCalledWith("drag");
        expect(onResume).toHaveBeenCalledWith("drag");
        expect(onDismiss).toHaveBeenCalledOnce();
        expect(onDismiss).toHaveBeenCalledWith("swipe");
    });

    test("follows a short touch movement but only pauses and snaps back below threshold", () => {
        const { surface, onDismiss, onPause } = render();
        surface.dispatchEvent(
            new PointerEvent("pointerdown", {
                pointerType: "touch",
                isPrimary: true,
                pointerId: 3,
                button: 0,
                clientX: 100,
                clientY: 100,
                bubbles: true,
            })
        );
        window.dispatchEvent(
            new PointerEvent("pointermove", {
                pointerType: "touch",
                isPrimary: true,
                pointerId: 3,
                clientX: 104,
                clientY: 101,
                bubbles: true,
                cancelable: true,
            })
        );

        expect(surface.style.transform).toBe("translate3d(4px, 0px, 0px)");
        expect(onPause).toHaveBeenCalledWith("press");

        window.dispatchEvent(
            new PointerEvent("pointerup", {
                pointerType: "touch",
                isPrimary: true,
                pointerId: 3,
                clientX: 104,
                clientY: 101,
                bubbles: true,
            })
        );

        expect(onDismiss).not.toHaveBeenCalled();
    });
});
