import { describe, expect, test } from "vitest";

import { AppShortcutManager, normalizeCombo } from "./appShortcut.svelte";

describe("AppShortcutManager (Node SSR Environment)", () => {
    test("should instantiate safely on server without window", () => {
        expect(typeof window).toBe("undefined");
        const manager = new AppShortcutManager();
        expect(manager.size).toBe(0);
    });

    test("should normalize single and multi-step key combo strings cleanly", () => {
        expect(normalizeCombo("cmd+s")).toBe("Cmd+S");
        expect(normalizeCombo("mod+s")).toBe("Cmd+S");
        expect(normalizeCombo("ctrl+shift+p")).toBe("Ctrl+Shift+P");
        expect(normalizeCombo("alt+meta+k")).toBe("Cmd+Alt+K");
        expect(normalizeCombo("g i")).toBe("G I");
        expect(normalizeCombo("ctrl+k ctrl+c")).toBe("Ctrl+K Ctrl+C");
    });

    test("should register and unregister actions safely in SSR", () => {
        const manager = new AppShortcutManager();
        let executed = false;

        const unregister = manager.register("Cmd+K", () => {
            executed = true;
        });

        expect(manager.size).toBe(1);
        unregister();
        expect(manager.size).toBe(0);
        expect(executed).toBe(false);
    });
});
