import { describe, expect, test } from "vitest";

import { ThemeManager } from "./theme.svelte";

describe("ThemeManager (Node SSR)", () => {
    test("should instantiate safely on server without crashing", () => {
        expect(typeof window).toBe("undefined");
        const manager = new ThemeManager();
        expect(manager.mode).toBe("system");
        expect(manager.resolved).toBe("light");

        manager.set("dark");
        expect(manager.mode).toBe("system");

        manager.toggle();
        expect(manager.mode).toBe("system");

        expect(() => manager.destroy()).not.toThrow();
    });

    test("should support initial mode and resolved in SSR constructor", () => {
        expect(typeof window).toBe("undefined");
        const manager = new ThemeManager("dark", "dark");
        expect(manager.mode).toBe("dark");
        expect(manager.resolved).toBe("dark");
    });
});
