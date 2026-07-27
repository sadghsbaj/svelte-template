import { describe, expect, test, vi } from "vitest";

import { createInterceptClick } from "./create-intercept-click";

describe("createInterceptClick", () => {
    test("should delegate to onclick when not disabled", () => {
        const onclick = vi.fn();
        const handler = createInterceptClick(() => false, onclick);
        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as MouseEvent;

        handler(event);

        expect(onclick).toHaveBeenCalledTimes(1);
        expect(onclick).toHaveBeenCalledWith(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    test("should block event and prevent delegation when disabled", () => {
        const onclick = vi.fn();
        const handler = createInterceptClick(() => true, onclick);
        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as MouseEvent;

        handler(event);

        expect(onclick).not.toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    });

    test("should dynamically evaluate isDisabled on each click", () => {
        let disabled = true;
        const onclick = vi.fn();
        const handler = createInterceptClick(() => disabled, onclick);
        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as MouseEvent;

        // First click (disabled)
        handler(event);
        expect(onclick).not.toHaveBeenCalled();

        // Toggle state to enabled
        disabled = false;
        handler(event);
        expect(onclick).toHaveBeenCalledTimes(1);
    });

    test("should handle undefined onclick gracefully when enabled", () => {
        const handler = createInterceptClick(() => false, undefined);
        const event = { preventDefault: vi.fn(), stopPropagation: vi.fn() } as unknown as MouseEvent;

        expect(() => handler(event)).not.toThrow();
        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
    });
});
