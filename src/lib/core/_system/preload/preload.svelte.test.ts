import { afterEach, describe, expect, test, vi } from "vitest";

import { initPreload } from "./preload";

describe("initPreload (Browser Client)", () => {
    afterEach(() => {
        document.body.classList.remove("preload");
    });

    test("should remove preload class from body after paint frames", async () => {
        document.body.classList.add("preload");
        expect(document.body.classList.contains("preload")).toBe(true);

        initPreload();

        await vi.waitFor(() => {
            expect(document.body.classList.contains("preload")).toBe(false);
        });
    });

    test("should support early cleanup cancellation", async () => {
        document.body.classList.add("preload");
        expect(document.body.classList.contains("preload")).toBe(true);

        const cleanup = initPreload();
        cleanup();

        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        expect(document.body.classList.contains("preload")).toBe(true);
    });

    test("should return no-op cleanup when body does not have preload class", () => {
        document.body.classList.remove("preload");
        const cleanup = initPreload();
        expect(typeof cleanup).toBe("function");
        expect(() => cleanup()).not.toThrow();
    });
});

