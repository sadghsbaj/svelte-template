import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { pending } from "./pending.attach";

describe("pending Svelte 5 Element Attachment (Direct Host Animation)", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);

        if (!Element.prototype.animate) {
            Element.prototype.animate = vi.fn().mockReturnValue({
                cancel: vi.fn(),
                finish: vi.fn(),
                play: vi.fn(),
                pause: vi.fn(),
            });
        }
    });

    afterEach(() => {
        container.remove();
        vi.restoreAllMocks();
    });

    test("should apply aria-busy and animate host node directly without child overlay", () => {
        const btn = document.createElement("button");
        container.append(btn);

        const animateSpy = vi.spyOn(btn, "animate");

        const attach = pending({ active: true, color: "accent" });
        const cleanup = attach(btn);

        expect(btn.getAttribute("aria-busy")).toBe("true");
        expect(animateSpy).toHaveBeenCalled();
        expect(btn.children.length).toBe(0);

        cleanup?.();
        expect(btn.getAttribute("aria-busy")).toBeNull();
    });

    test("should return early no-op cleanup when active/enabled is false", () => {
        const btn = document.createElement("button");
        container.append(btn);

        const animateSpy = vi.spyOn(btn, "animate");

        const attach = pending({ active: false });
        const cleanup = attach(btn);

        expect(btn.getAttribute("aria-busy")).toBeNull();
        expect(animateSpy).not.toHaveBeenCalled();

        const clickSpy = vi.fn();
        btn.addEventListener("click", clickSpy);
        btn.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));

        expect(clickSpy).toHaveBeenCalled();
        cleanup?.();
    });

    test("should intercept click and pointerdown events when blockInteraction is true", () => {
        const btn = document.createElement("button");
        container.append(btn);

        const attach = pending({ active: true, blockInteraction: true });
        const cleanup = attach(btn);

        const clickSpy = vi.fn();
        btn.addEventListener("click", clickSpy);

        const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
        btn.dispatchEvent(clickEvent);

        expect(clickEvent.defaultPrevented).toBe(true);
        expect(clickSpy).not.toHaveBeenCalled();

        cleanup?.();
    });

    test("should intercept Enter and Space keydown events", () => {
        const btn = document.createElement("button");
        container.append(btn);

        const attach = pending({ active: true });
        const cleanup = attach(btn);

        const enterEvent = new KeyboardEvent("keydown", {
            key: "Enter",
            bubbles: true,
            cancelable: true,
        });
        btn.dispatchEvent(enterEvent);
        expect(enterEvent.defaultPrevented).toBe(true);

        const spaceEvent = new KeyboardEvent("keydown", {
            key: " ",
            bubbles: true,
            cancelable: true,
        });
        btn.dispatchEvent(spaceEvent);
        expect(spaceEvent.defaultPrevented).toBe(true);

        cleanup?.();
    });

    test("should allow clicks when blockInteraction is false", () => {
        const btn = document.createElement("button");
        container.append(btn);

        const attach = pending({ active: true, blockInteraction: false });
        const cleanup = attach(btn);

        const clickSpy = vi.fn();
        btn.addEventListener("click", clickSpy);

        const clickEvent = new MouseEvent("click", { bubbles: true, cancelable: true });
        btn.dispatchEvent(clickEvent);

        expect(clickSpy).toHaveBeenCalled();
        cleanup?.();
    });

    test("should support success, danger, and base colors in keyframes", () => {
        const btn = document.createElement("button");
        container.append(btn);

        const animateSpy = vi.spyOn(btn, "animate");

        const attachSuccess = pending({ active: true, color: "success" });
        const cleanupSuccess = attachSuccess(btn);
        expect(animateSpy).toHaveBeenCalled();
        cleanupSuccess?.();

        const attachDanger = pending({ active: true, color: "danger" });
        const cleanupDanger = attachDanger(btn);
        expect(animateSpy).toHaveBeenCalled();
        cleanupDanger?.();

        const attachBase = pending({ active: true, color: "base" });
        const cleanupBase = attachBase(btn);
        expect(animateSpy).toHaveBeenCalled();
        cleanupBase?.();
    });

    test("should restore original DOM attributes and cancel animation on unmount", () => {
        const btn = document.createElement("button");
        btn.setAttribute("aria-busy", "false");
        btn.style.cursor = "pointer";
        container.append(btn);

        const cancelSpy = vi.fn();
        vi.spyOn(btn, "animate").mockReturnValue({
            cancel: cancelSpy,
            finish: vi.fn(),
            play: vi.fn(),
            pause: vi.fn(),
        } as unknown as Animation);

        const attach = pending({ active: true, cursor: "wait" });
        const cleanup = attach(btn);

        expect(btn.getAttribute("aria-busy")).toBe("true");
        expect(btn.style.cursor).toBe("wait");

        cleanup?.();

        expect(btn.getAttribute("aria-busy")).toBe("false");
        expect(btn.style.cursor).toBe("pointer");
        expect(cancelSpy).toHaveBeenCalled();
    });
});
