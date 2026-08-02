import { afterEach, describe, expect, test, vi } from "vitest";

import { dismissLoadingScreen, initPreload } from "./preload";

describe("initPreload & dismissLoadingScreen (Browser Client)", () => {
    afterEach(() => {
        document.body.classList.remove("preload");
        document.getElementById("app-loading")?.remove();
        document.getElementById("app-loading-script")?.remove();
    });

    test("should remove preload class from body and dismiss loading screen and script after paint frames", async () => {
        document.body.classList.add("preload");
        const loadingEl = document.createElement("div");
        loadingEl.id = "app-loading";
        document.body.append(loadingEl);

        const scriptEl = document.createElement("script");
        scriptEl.id = "app-loading-script";
        document.body.append(scriptEl);

        expect(document.body.classList.contains("preload")).toBe(true);
        expect(document.getElementById("app-loading")).not.toBeNull();
        expect(document.getElementById("app-loading-script")).not.toBeNull();

        initPreload();

        await vi.waitFor(() => {
            expect(document.body.classList.contains("preload")).toBe(false);
            expect(document.getElementById("app-loading")).toBeNull();
            expect(document.getElementById("app-loading-script")).toBeNull();
        });
    });

    test("should animate fade-out and remove loading screen and script via dismissLoadingScreen", async () => {
        const loadingEl = document.createElement("div");
        loadingEl.id = "app-loading";
        document.body.append(loadingEl);

        const scriptEl = document.createElement("script");
        scriptEl.id = "app-loading-script";
        document.body.append(scriptEl);

        dismissLoadingScreen();

        expect(loadingEl.classList.contains("fade-out")).toBe(true);

        // Simulate transitionend event
        loadingEl.dispatchEvent(new Event("transitionend"));

        expect(document.getElementById("app-loading")).toBeNull();
        expect(document.getElementById("app-loading-script")).toBeNull();
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
