import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { MotionManager, withMotionGuard } from "./motion.svelte";

describe("MotionManager (Browser Client)", () => {
    let manager: MotionManager;

    beforeEach(() => {
        localStorage.clear();
        document.documentElement.className = "";
    });

    afterEach(() => {
        if (manager) {
            manager.destroy();
        }
        vi.restoreAllMocks();
    });

    test("should initialize with default preference 'system'", () => {
        manager = new MotionManager();
        expect(manager.preference).toBe("system");
    });

    test("should apply motion preference 'reduce' and write to localStorage", () => {
        manager = new MotionManager();
        manager.set("reduce");

        expect(manager.preference).toBe("reduce");
        expect(manager.resolved).toBe("reduce");
        expect(document.documentElement.classList.contains("ui-reduce-motion")).toBe(true);
        expect(localStorage.getItem("ui-motion-preference")).toBe("reduce");
    });

    test("should apply motion preference 'no-preference' and write to localStorage", () => {
        manager = new MotionManager();
        manager.set("no-preference");

        expect(manager.preference).toBe("no-preference");
        expect(manager.resolved).toBe("no-preference");
        expect(document.documentElement.classList.contains("ui-reduce-motion")).toBe(false);
        expect(localStorage.getItem("ui-motion-preference")).toBe("no-preference");
    });

    test("should sync motion preference across tabs via storage event", () => {
        manager = new MotionManager();
        manager.set("no-preference");

        // Simulate another tab updating the motion preference
        window.dispatchEvent(
            new StorageEvent("storage", {
                key: "ui-motion-preference",
                newValue: "reduce",
            })
        );

        expect(manager.preference).toBe("reduce");
        expect(manager.resolved).toBe("reduce");
        expect(document.documentElement.classList.contains("ui-reduce-motion")).toBe(true);
    });

    test("should fallback to 'system' when localStorage contains invalid string", () => {
        localStorage.setItem("ui-motion-preference", "invalid_value");
        manager = new MotionManager();
        expect(manager.preference).toBe("system");
    });

    test("should fallback to 'system' on storage event with invalid string", () => {
        manager = new MotionManager();
        manager.set("reduce");
        expect(manager.preference).toBe("reduce");

        window.dispatchEvent(
            new StorageEvent("storage", {
                key: "ui-motion-preference",
                newValue: "corrupted_preference",
            })
        );

        expect(manager.preference).toBe("system");
    });

    test("should handle DOMException during localStorage read/write safely", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new DOMException("QuotaExceededError");
        });
        vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new DOMException("QuotaExceededError");
        });

        expect(() => {
            manager = new MotionManager();
            manager.set("reduce");
        }).not.toThrow();

        expect(manager.preference).toBe("reduce");
    });

    test("should support destroy and clean up without errors when called multiple times", () => {
        manager = new MotionManager();
        expect(() => {
            manager.destroy();
            manager.destroy();
        }).not.toThrow();
    });

    test("withMotionGuard respects custom MotionManager instance", () => {
        const customManager = new MotionManager();
        customManager.set("reduce");

        const guarded = withMotionGuard(dummyTransition, customManager);
        const dummyNode = document.createElement("div");

        const result = guarded(dummyNode);
        expect(result.duration).toBe(0);

        customManager.destroy();
    });
});

function dummyTransition() {
    return { duration: 300, delay: 0 };
}

