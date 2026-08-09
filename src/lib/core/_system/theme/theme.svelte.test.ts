import { tick } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { isValidMode, ThemeManager } from "./theme.svelte";

async function waitForSwap(): Promise<void> {
    await tick();
    await new Promise((resolve) => setTimeout(resolve, 50));
}

describe("ThemeManager (Browser Client)", () => {
    let manager: ThemeManager;

    beforeEach(() => {
        localStorage.clear();
        document.documentElement.className = "";
        delete document.documentElement.dataset.theme;
        document.documentElement.style.cssText = "";
    });

    afterEach(() => {
        if (manager) {
            manager.destroy();
        }
        vi.restoreAllMocks();
    });

    test("should initialize with default mode 'system'", () => {
        manager = new ThemeManager();
        expect(manager.mode).toBe("system");
    });

    test("should apply theme 'dark' and write to localStorage", async () => {
        manager = new ThemeManager();
        manager.set("dark");
        await waitForSwap();

        expect(manager.mode).toBe("dark");
        expect(manager.resolved).toBe("dark");
        expect(document.documentElement.dataset.theme === "dark").toBe(true);
        expect(localStorage.getItem("ui-theme")).toBe("dark");
    });

    test("should toggle theme", async () => {
        manager = new ThemeManager();
        manager.set("light");
        await waitForSwap();

        manager.toggle();
        await waitForSwap();

        expect(manager.mode).toBe("dark");
        expect(manager.resolved).toBe("dark");
        expect(document.documentElement.dataset.theme === "dark").toBe(true);

        manager.toggle();
        await waitForSwap();

        expect(manager.mode).toBe("light");
        expect(manager.resolved).toBe("light");
        expect(document.documentElement.dataset.theme === "dark").toBe(false);
    });

    test("should sync theme across tabs via storage event", async () => {
        manager = new ThemeManager();
        manager.set("light");
        await waitForSwap();

        // Simulate another tab updating the theme preference
        window.dispatchEvent(
            new StorageEvent("storage", {
                key: "ui-theme",
                newValue: "dark",
                storageArea: localStorage,
            })
        );
        await waitForSwap();

        expect(manager.mode).toBe("dark");
        expect(manager.resolved).toBe("dark");
        expect(document.documentElement.dataset.theme === "dark").toBe(true);
    });

    test("should sync theme when storage is cleared (key === null)", async () => {
        manager = new ThemeManager();
        manager.set("dark");
        await waitForSwap();

        window.dispatchEvent(
            new StorageEvent("storage", {
                key: null,
                newValue: null,
                storageArea: localStorage,
            })
        );
        await waitForSwap();

        expect(manager.mode).toBe("system");
    });

    test("should validate external storage inputs and fallback to system", async () => {
        manager = new ThemeManager();
        manager.set("dark");
        await waitForSwap();

        window.dispatchEvent(
            new StorageEvent("storage", {
                key: "ui-theme",
                newValue: "invalid-corrupted-theme",
                storageArea: localStorage,
            })
        );
        await waitForSwap();

        expect(manager.mode).toBe("system");
        expect(isValidMode("dark")).toBe(true);
        expect(isValidMode("invalid")).toBe(false);
    });

    test("should handle restricted localStorage gracefully without crashing", () => {
        const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("SecurityError: Access is denied");
        });
        const setItemSpy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("QuotaExceededError");
        });

        expect(() => {
            const restrictedManager = new ThemeManager();
            restrictedManager.set("dark");
            restrictedManager.destroy();
        }).not.toThrow();

        getItemSpy.mockRestore();
        setItemSpy.mockRestore();
    });

    test("should support destroy and clean up without errors", () => {
        manager = new ThemeManager();
        expect(() => manager.destroy()).not.toThrow();
    });
});
