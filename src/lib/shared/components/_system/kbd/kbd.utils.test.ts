import { describe, expect, test } from "vitest";

import {
    getShortcutAriaLabel,
    getShortcutTitle,
    isMacPlatform,
    resolveKeyItem,
    resolveKeys,
    resolveShortcut,
    splitComboString,
    splitShortcutSteps,
} from "./kbd.utils";

describe("kbd utils", () => {
    test("resolves explicit and detected platforms", () => {
        expect(isMacPlatform("mac")).toBe(true);
        expect(isMacPlatform("windows")).toBe(false);
    });

    test("separates simultaneous combos from sequential steps", () => {
        expect(splitShortcutSteps("Mod+K Mod+C")).toEqual(["Mod+K", "Mod+C"]);
        expect(splitShortcutSteps("Mod + Shift + P")).toEqual(["Mod+Shift+P"]);
        expect(splitComboString("Mod+Shift+P")).toEqual(["Mod", "Shift", "P"]);
        expect(splitComboString("Mod + +")).toEqual(["Mod", "+"]);
        expect(splitComboString("+")).toEqual(["+"]);
    });

    test("uses text glyphs for standard keyboard symbols", () => {
        expect(resolveKeyItem("Mod")).toMatchObject({
            type: "icon",
            value: "⌘",
            title: "Primary modifier (Command / Control)",
        });
        expect(resolveKeyItem("Ctrl").value).toBe("Ctrl");
        expect(resolveKeyItem("Alt").value).toBe("⌥");
        expect(resolveKeyItem("Shift").value).toBe("⇧");
        expect(resolveKeyItem("Enter").value).toBe("↵");
        expect(resolveKeyItem("Backspace").value).toBe("⌫");
        expect(resolveKeyItem("Delete").value).toBe("Del");
        expect(resolveKeyItem("ArrowRight").value).toBe("→");
    });

    test("uses compact text legends for nonstandard system keys", () => {
        expect(resolveKeyItem("volumeup")).toEqual({
            type: "text",
            value: "Vol+",
            title: "Volume Up",
        });
        expect(resolveKeyItem("brightnessdown").value).toBe("Bright−");
        expect(resolveKeyItem("mic").value).toBe("Mic");
        expect(resolveKeyItem("search").value).toBe("Search");
    });

    test("supports optional text formatting without changing portable Mod", () => {
        const options = { format: "text" as const, platform: "windows" as const };
        expect(resolveKeyItem("Mod", options).value).toBe("⌘");
        expect(resolveKeyItem("Ctrl", options).value).toBe("Ctrl");
        expect(resolveKeyItem("Alt", options).value).toBe("Alt");
        expect(resolveKeyItem("Shift", options).value).toBe("Shift");
        expect(resolveKeyItem("Tab", options).value).toBe("Tab");
    });

    test("resolves punctuation, function keys, and unknown labels", () => {
        expect(resolveKeyItem("plus").value).toBe("+");
        expect(resolveKeyItem("slash").value).toBe("/");
        expect(resolveKeyItem("f12").value).toBe("F12");
        expect(resolveKeyItem("k").value).toBe("K");
        expect(resolveKeyItem("Custom").value).toBe("Custom");
    });

    test("returns structured shortcuts and compatibility key lists", () => {
        const shortcut = resolveShortcut({ combo: "Mod+K G I" });
        expect(shortcut.steps.map((step) => step.map((item) => item.value))).toEqual([
            ["⌘", "K"],
            ["G"],
            ["I"],
        ]);
        expect(resolveKeys({ combo: "Mod+Shift+P" }).map((item) => item.value)).toEqual([
            "⌘",
            "⇧",
            "P",
        ]);
    });

    test("builds readable tooltip and accessibility descriptions", () => {
        const shortcut = resolveShortcut({ combo: "Mod+K G" });
        expect(getShortcutTitle(shortcut)).toBe("Primary modifier (Command / Control) + K, then G");
        expect(getShortcutAriaLabel(shortcut)).toBe(
            "Primary modifier (Command / Control) plus K then G"
        );
    });
});
