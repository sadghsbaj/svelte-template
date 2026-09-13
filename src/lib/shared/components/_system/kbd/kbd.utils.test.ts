import { describe, expect, it } from "vitest";

import { isMacPlatform, resolveKeyItem, resolveKeys, splitComboString } from "./kbd.utils";

describe("kbd.utils", () => {
    describe("isMacPlatform", () => {
        it("returns true when platform is explicitly 'mac'", () => {
            expect(isMacPlatform("mac")).toBe(true);
        });

        it("returns false when platform is explicitly 'windows'", () => {
            expect(isMacPlatform("windows")).toBe(false);
        });
    });

    describe("splitComboString", () => {
        it("splits plus-delimited combo string", () => {
            expect(splitComboString("Cmd+Shift+P")).toEqual(["Cmd", "Shift", "P"]);
            expect(splitComboString("Ctrl + Alt + Delete")).toEqual(["Ctrl", "Alt", "Delete"]);
        });

        it("handles plus sign as key accurately", () => {
            expect(splitComboString("Cmd++")).toEqual(["Cmd", "+"]);
            expect(splitComboString("+")).toEqual(["+"]);
        });

        it("splits space-delimited combo string", () => {
            expect(splitComboString("ArrowUp ArrowDown")).toEqual(["ArrowUp", "ArrowDown"]);
            expect(splitComboString("g i")).toEqual(["g", "i"]);
        });

        it("returns empty array for empty combo", () => {
            expect(splitComboString("")).toEqual([]);
            expect(splitComboString(" ".repeat(3))).toEqual([]);
        });
    });

    describe("resolveKeyItem - Symbols Format (Default)", () => {
        it("resolves Command/Mod as Command icon on macOS", () => {
            const mod = resolveKeyItem("mod", { platform: "mac" });
            expect(mod.type).toBe("icon");
            expect(mod.label).toBe("⌘");
            expect(mod.ariaLabel).toBe("Command");

            const cmd = resolveKeyItem("cmd", { platform: "mac" });
            expect(cmd.type).toBe("icon");
            expect(cmd.label).toBe("⌘");
        });

        it("resolves portable Command/Mod as Control outside macOS", () => {
            const mod = resolveKeyItem("mod", { platform: "windows" });
            expect(mod.type).toBe("icon");
            expect(mod.label).toBe("⌃");
            expect(mod.ariaLabel).toBe("Control");
        });

        it("resolves Control modifier as ChevronUp icon", () => {
            const ctrl = resolveKeyItem("ctrl");
            expect(ctrl.type).toBe("icon");
            expect(ctrl.label).toBe("⌃");
            expect(ctrl.ariaLabel).toBe("Control");
            expect(ctrl.icon).toBeDefined();
        });

        it("resolves Option/Alt modifier as Option icon", () => {
            const alt = resolveKeyItem("alt");
            expect(alt.type).toBe("icon");
            expect(alt.label).toBe("⌥");
            expect(alt.ariaLabel).toBe("Option");
            expect(alt.icon).toBeDefined();
        });

        it("resolves Shift modifier as ArrowBigUp icon", () => {
            const shift = resolveKeyItem("shift");
            expect(shift.type).toBe("icon");
            expect(shift.label).toBe("⇧");
            expect(shift.ariaLabel).toBe("Shift");
            expect(shift.icon).toBeDefined();
        });

        it("resolves CapsLock modifier as ArrowBigUpDash icon", () => {
            const caps = resolveKeyItem("capslock");
            expect(caps.type).toBe("icon");
            expect(caps.label).toBe("⇪");
            expect(caps.ariaLabel).toBe("Caps Lock");
            expect(caps.icon).toBeDefined();
        });
    });

    describe("resolveKeyItem - Text Format (Optional)", () => {
        it("resolves modifiers as text when format='text' on Windows", () => {
            const opts = { format: "text" as const, platform: "windows" as const };
            expect(resolveKeyItem("mod", opts).label).toBe("Ctrl");
            expect(resolveKeyItem("ctrl", opts).label).toBe("Ctrl");
            expect(resolveKeyItem("alt", opts).label).toBe("Alt");
            expect(resolveKeyItem("shift", opts).label).toBe("Shift");
            expect(resolveKeyItem("tab", opts).label).toBe("Tab");
            expect(resolveKeyItem("space", opts).label).toBe("Space");
            expect(resolveKeyItem("capslock", opts).label).toBe("Caps");
        });

        it("resolves modifiers appropriately on macOS when format='text'", () => {
            const opts = { format: "text" as const, platform: "mac" as const };
            expect(resolveKeyItem("mod", opts).type).toBe("icon");
            expect(resolveKeyItem("ctrl", opts).label).toBe("⌃");
            expect(resolveKeyItem("alt", opts).label).toBe("⌥");
            expect(resolveKeyItem("shift", opts).label).toBe("⇧");
        });
    });

    describe("resolveKeyItem - Action, Navigation & System Keys", () => {
        it("resolves Arrow keys as Lucide icons on any OS", () => {
            expect(resolveKeyItem("ArrowUp").type).toBe("icon");
            expect(resolveKeyItem("up").type).toBe("icon");
            expect(resolveKeyItem("down").type).toBe("icon");
            expect(resolveKeyItem("left").type).toBe("icon");
            expect(resolveKeyItem("right").type).toBe("icon");
        });

        it("resolves Page navigation as Lucide icons", () => {
            expect(resolveKeyItem("pageup").type).toBe("icon");
            expect(resolveKeyItem("pagedown").type).toBe("icon");
        });

        it("resolves Enter / Return as Lucide icon", () => {
            const enter = resolveKeyItem("Enter");
            expect(enter.type).toBe("icon");
            expect(enter.ariaLabel).toBe("Enter");
        });

        it("resolves Backspace as Lucide icon", () => {
            const bsp = resolveKeyItem("Backspace");
            expect(bsp.type).toBe("icon");
            expect(bsp.ariaLabel).toBe("Backspace");
        });

        it("resolves Tab and Space as Lucide icons in symbol format", () => {
            const tab = resolveKeyItem("tab");
            expect(tab.type).toBe("icon");
            expect(tab.label).toBe("⇥");

            const space = resolveKeyItem("space");
            expect(space.type).toBe("icon");
            expect(space.label).toBe("␣");
        });

        it("resolves Fn / Globe as Lucide Globe icon", () => {
            const globe = resolveKeyItem("fn");
            expect(globe.type).toBe("icon");
            expect(globe.ariaLabel).toBe("Function / Globe");
        });

        it("resolves media, audio, power, and search keys as Lucide icons", () => {
            expect(resolveKeyItem("volumeup").type).toBe("icon");
            expect(resolveKeyItem("volumedown").type).toBe("icon");
            expect(resolveKeyItem("mute").type).toBe("icon");
            expect(resolveKeyItem("play").type).toBe("icon");
            expect(resolveKeyItem("pause").type).toBe("icon");
            expect(resolveKeyItem("sun").type).toBe("icon");
            expect(resolveKeyItem("moon").type).toBe("icon");
            expect(resolveKeyItem("mic").type).toBe("icon");
            expect(resolveKeyItem("power").type).toBe("icon");
            expect(resolveKeyItem("search").type).toBe("icon");
            expect(resolveKeyItem("undo").type).toBe("icon");
            expect(resolveKeyItem("redo").type).toBe("icon");
            expect(resolveKeyItem("menu").type).toBe("icon");
        });

        it("resolves Home and End appropriately per platform", () => {
            const homeMac = resolveKeyItem("home", { platform: "mac", format: "symbols" });
            expect(homeMac.type).toBe("icon");
            expect(homeMac.ariaLabel).toBe("Home");

            const homeWin = resolveKeyItem("home", { platform: "windows", format: "symbols" });
            expect(homeWin.type).toBe("text");
            expect(homeWin.label).toBe("Home");
        });

        it("resolves Esc, Del, Ins, and lock keys as clean labels", () => {
            expect(resolveKeyItem("esc").label).toBe("Esc");
            expect(resolveKeyItem("del").label).toBe("Del");
            expect(resolveKeyItem("insert").label).toBe("Ins");
            expect(resolveKeyItem("prtsc").label).toBe("PrtSc");
            expect(resolveKeyItem("scrlk").label).toBe("ScrLk");
            expect(resolveKeyItem("numlock").label).toBe("Num");
        });

        it("resolves named punctuation aliases", () => {
            expect(resolveKeyItem("plus").label).toBe("+");
            expect(resolveKeyItem("slash").label).toBe("/");
            expect(resolveKeyItem("minus").label).toBe("-");
            expect(resolveKeyItem("equal").label).toBe("=");
        });

        it("resolves single characters as uppercase text", () => {
            expect(resolveKeyItem("k").label).toBe("K");
            expect(resolveKeyItem("p").label).toBe("P");
        });
    });

    describe("resolveKeys", () => {
        it("resolves combo string into symbol icons by default", () => {
            const keys = resolveKeys({ combo: "Cmd+Shift+P" }, "mac");
            expect(keys).toHaveLength(3);
            expect(keys[0].type).toBe("icon"); // Command icon
            expect(keys[1].type).toBe("icon"); // Shift ArrowBigUp icon
            expect(keys[2].label).toBe("P"); // P text
        });

        it("resolves Ctrl+K into ChevronUp icon and K by default", () => {
            const keys = resolveKeys({ combo: "Ctrl+K" });
            expect(keys).toHaveLength(2);
            expect(keys[0].type).toBe("icon");
            expect(keys[0].label).toBe("⌃");
            expect(keys[1].label).toBe("K");
        });

        it("resolves Ctrl+Alt+Delete into symbols by default", () => {
            const keys = resolveKeys({ combo: "Ctrl+Alt+Delete" });
            expect(keys).toHaveLength(3);
            expect(keys[0].type).toBe("icon");
            expect(keys[1].type).toBe("icon");
            expect(keys[2].label).toBe("Del");
        });

        it("resolves text format when requested explicitly", () => {
            const keys = resolveKeys({ combo: "Ctrl+Alt+Delete", format: "text" }, "windows");
            expect(keys).toHaveLength(3);
            expect(keys[0].label).toBe("Ctrl");
            expect(keys[1].label).toBe("Alt");
            expect(keys[2].label).toBe("Del");
        });
    });
});
