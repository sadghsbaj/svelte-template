import { afterEach, describe, expect, test, vi } from "vitest";

import { dismissLoadingScreen, initPreload } from "./preload";

describe("initPreload & dismissLoadingScreen (Browser Client)", () => {
    afterEach(() => {
        delete document.body.dataset.preload;
        document.getElementById("app-loading")?.remove();
        document.getElementById("app-loading-script")?.remove();
    });

    test("should remove preload class from body and dismiss loading screen and script after paint frames", async () => {
        document.body.dataset.preload = "";
        const loadingEl = document.createElement("div");
        loadingEl.id = "app-loading";
        document.body.append(loadingEl);

        const scriptEl = document.createElement("script");
        scriptEl.id = "app-loading-script";
        document.body.append(scriptEl);

        expect(Object.hasOwn(document.body.dataset, "preload")).toBe(true);
        expect(document.getElementById("app-loading")).not.toBeNull();
        expect(document.getElementById("app-loading-script")).not.toBeNull();

        initPreload();

        await vi.waitFor(() => {
            expect(Object.hasOwn(document.body.dataset, "preload")).toBe(false);
            expect(document.getElementById("app-loading")).toBeNull();
            expect(document.getElementById("app-loading-script")).toBeNull();
        });
    });

    test("should immediately remove loading screen and script on fast loads when not yet visible", async () => {
        const loadingEl = document.createElement("div");
        loadingEl.id = "app-loading";
        document.body.append(loadingEl);

        const scriptEl = document.createElement("script");
        scriptEl.id = "app-loading-script";
        document.body.append(scriptEl);

        dismissLoadingScreen();

        expect(document.getElementById("app-loading")).toBeNull();
        expect(document.getElementById("app-loading-script")).toBeNull();
    });

    test("should animate fade-out and remove visible loading screen after minimum display duration", async () => {
        const loadingEl = document.createElement("div");
        loadingEl.id = "app-loading";
        loadingEl.dataset.visible = "";
        document.body.append(loadingEl);

        const scriptEl = document.createElement("script");
        scriptEl.id = "app-loading-script";
        document.body.append(scriptEl);

        // Pass 0 for minShowDuration so it triggers fade-out immediately
        dismissLoadingScreen("app-loading", "app-loading-script", 0, 0);

        expect(Object.hasOwn(loadingEl.dataset, "fadeOut")).toBe(true);

        // Simulate transitionend event
        loadingEl.dispatchEvent(new Event("transitionend"));

        expect(document.getElementById("app-loading")).toBeNull();
        expect(document.getElementById("app-loading-script")).toBeNull();
    });

    test("should support early cleanup cancellation", async () => {
        document.body.dataset.preload = "";
        expect(Object.hasOwn(document.body.dataset, "preload")).toBe(true);

        const cleanup = initPreload();
        cleanup();

        await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        expect(Object.hasOwn(document.body.dataset, "preload")).toBe(true);
    });

    test("should return no-op cleanup when body does not have preload class", () => {
        delete document.body.dataset.preload;
        const cleanup = initPreload();
        expect(typeof cleanup).toBe("function");
        expect(() => cleanup()).not.toThrow();
    });
});
