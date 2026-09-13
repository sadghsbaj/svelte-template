import {
    ArrowBigUp,
    ArrowBigUpDash,
    ArrowDown,
    ArrowDownToLine,
    ArrowLeft,
    ArrowLeftToLine,
    ArrowRight,
    ArrowRightToLine,
    ArrowUp,
    ArrowUpToLine,
    ChevronUp,
    ChevronsDown,
    ChevronsUp,
    Command,
    CornerDownLeft,
    Delete,
    Globe,
    Menu,
    Mic,
    Moon,
    Option,
    Pause,
    Play,
    Power,
    Redo,
    Search,
    Space,
    Sun,
    Undo,
    Volume1,
    Volume2,
    VolumeX,
} from "@lucide/svelte";
import { getOS } from "$utils";

import type { KbdFormat, KbdPlatform, KeyItem } from "./kbd.types";

export interface ResolveKeyOptions {
    format?: KbdFormat;
    platform?: KbdPlatform;
}

const KEY_NAME_ALIASES: Record<string, string> = {
    plus: "+",
    minus: "-",
    hyphen: "-",
    slash: "/",
    forwardslash: "/",
    backslash: "\\",
    asterisk: "*",
    star: "*",
    equal: "=",
    equals: "=",
    tilde: "~",
    backtick: "`",
    grave: "`",
    period: ".",
    dot: ".",
    comma: ",",
    colon: ":",
    semicolon: ";",
    question: "?",
    exclamation: "!",
};

/**
 * Checks whether the target platform should resolve as macOS/iOS.
 */
export function isMacPlatform(platform: KbdPlatform = "auto"): boolean {
    if (platform === "mac") return true;
    if (platform === "windows") return false;

    if (typeof window === "undefined") {
        return false;
    }

    const os = getOS();
    return os === "macos" || os === "ios";
}

/**
 * Splits a shortcut combo string into individual key tokens.
 * Accurately preserves plus sign keys (e.g. "Cmd++" or "Ctrl + +").
 */
export function splitComboString(combo: string): string[] {
    const trimmed = combo.trim();
    if (!trimmed) return [];

    // Check if combo ends with ++ (e.g. "Cmd++" meaning Cmd and +)
    if (trimmed.endsWith("++")) {
        const prefix = trimmed.slice(0, -2);
        const parts = prefix
            .split("+")
            .map((p) => p.trim())
            .filter(Boolean);
        return [...parts, "+"];
    }

    if (trimmed === "+") {
        return ["+"];
    }

    // If it contains '+', split by plus sign
    if (trimmed.includes("+")) {
        const rawParts = trimmed.split("+");
        const parts: string[] = [];
        let pendingPlus = false;

        for (const rawPart of rawParts) {
            const p = rawPart.trim();
            if (p) {
                parts.push(p);
            } else if (!pendingPlus) {
                pendingPlus = true;
            } else {
                parts.push("+");
                pendingPlus = false;
            }
        }
        return parts;
    }

    // Otherwise split by spaces
    return trimmed.split(/\s+/).filter(Boolean);
}

/**
 * Resolves an individual raw key string into a typed KeyItem (icon or text label),
 * formatted by default with universal ISO symbols and crisp Lucide vector icons for visual unity.
 */
export function resolveKeyItem(
    rawKey: string,
    options: ResolveKeyOptions | boolean = {}
): KeyItem {
    // Backward compatibility: allow passing boolean for isMac
    const opts: ResolveKeyOptions =
        typeof options === "boolean"
            ? { platform: options ? "mac" : "windows", format: "symbols" }
            : options;

    const format = opts.format ?? "symbols";
    const isMac = isMacPlatform(opts.platform);

    const key = rawKey.trim();
    const lower = key.toLowerCase();

    // Check punctuation aliases first (e.g. "plus", "slash")
    if (Object.hasOwn(KEY_NAME_ALIASES, lower)) {
        const symbol = KEY_NAME_ALIASES[lower];
        return {
            type: "text",
            label: symbol,
            ariaLabel: symbol,
        };
    }

    // Modifier: Mod / Cmd / Command / Meta
    if (["mod", "cmd", "command", "meta"].includes(lower)) {
        if (format === "symbols" || isMac) {
            return {
                type: "icon",
                label: "⌘",
                icon: Command,
                ariaLabel: "Command",
            };
        }
        return {
            type: "text",
            label: "Ctrl",
            ariaLabel: "Control",
        };
    }

    // Modifier: Super / Win / Windows
    if (["super", "win", "windows"].includes(lower)) {
        if (format === "symbols" && isMac) {
            return {
                type: "icon",
                label: "⌘",
                icon: Command,
                ariaLabel: "Command",
            };
        }
        return {
            type: "text",
            label: "Win",
            ariaLabel: "Windows",
        };
    }

    // Modifier: Ctrl / Control
    if (["ctrl", "control"].includes(lower)) {
        if (format === "symbols") {
            return {
                type: "icon",
                label: "⌃",
                icon: ChevronUp,
                ariaLabel: "Control",
            };
        }
        return {
            type: "text",
            label: isMac ? "⌃" : "Ctrl",
            ariaLabel: "Control",
        };
    }

    // Modifier: Alt / Option / Opt
    if (["alt", "option", "opt"].includes(lower)) {
        if (format === "symbols") {
            return {
                type: "icon",
                label: "⌥",
                icon: Option,
                ariaLabel: "Option",
            };
        }
        return {
            type: "text",
            label: isMac ? "⌥" : "Alt",
            ariaLabel: "Alt",
        };
    }

    // Modifier: Shift
    if (["shift", "⇧"].includes(lower)) {
        if (format === "symbols") {
            return {
                type: "icon",
                label: "⇧",
                icon: ArrowBigUp,
                ariaLabel: "Shift",
            };
        }
        return {
            type: "text",
            label: isMac ? "⇧" : "Shift",
            ariaLabel: "Shift",
        };
    }

    // Directional Arrow keys
    if (["up", "arrowup", "↑"].includes(lower)) {
        return {
            type: "icon",
            label: "↑",
            icon: ArrowUp,
            ariaLabel: "Up Arrow",
        };
    }
    if (["down", "arrowdown", "↓"].includes(lower)) {
        return {
            type: "icon",
            label: "↓",
            icon: ArrowDown,
            ariaLabel: "Down Arrow",
        };
    }
    if (["left", "arrowleft", "←"].includes(lower)) {
        return {
            type: "icon",
            label: "←",
            icon: ArrowLeft,
            ariaLabel: "Left Arrow",
        };
    }
    if (["right", "arrowright", "→"].includes(lower)) {
        return {
            type: "icon",
            label: "→",
            icon: ArrowRight,
            ariaLabel: "Right Arrow",
        };
    }

    // Page navigation (Page Up / Page Down)
    if (["pageup", "pgup", "⇞"].includes(lower)) {
        return {
            type: "icon",
            label: "⇞",
            icon: ChevronsUp,
            ariaLabel: "Page Up",
        };
    }
    if (["pagedown", "pgdn", "⇟"].includes(lower)) {
        return {
            type: "icon",
            label: "⇟",
            icon: ChevronsDown,
            ariaLabel: "Page Down",
        };
    }

    // Home / End
    if (["home", "↖"].includes(lower)) {
        if (format === "symbols" && isMac) {
            return {
                type: "icon",
                label: "↖",
                icon: ArrowUpToLine,
                ariaLabel: "Home",
            };
        }
        return {
            type: "text",
            label: "Home",
            ariaLabel: "Home",
        };
    }
    if (["end", "↘"].includes(lower)) {
        if (format === "symbols" && isMac) {
            return {
                type: "icon",
                label: "↘",
                icon: ArrowDownToLine,
                ariaLabel: "End",
            };
        }
        return {
            type: "text",
            label: "End",
            ariaLabel: "End",
        };
    }

    // Enter / Return (↵)
    if (["enter", "return", "↵"].includes(lower)) {
        return {
            type: "icon",
            label: "↵",
            icon: CornerDownLeft,
            ariaLabel: "Enter",
        };
    }

    // Backspace (⌫)
    if (["backspace", "⌫"].includes(lower)) {
        return {
            type: "icon",
            label: "⌫",
            icon: Delete,
            ariaLabel: "Backspace",
        };
    }

    // Forward Delete (Del / Delete / ⌦)
    if (["del", "delete", "⌦"].includes(lower)) {
        return {
            type: "text",
            label: format === "symbols" && isMac ? "⌦" : "Del",
            ariaLabel: "Delete",
        };
    }

    // Tab (⇥)
    if (["tab", "⇥"].includes(lower)) {
        if (format === "symbols") {
            return {
                type: "icon",
                label: "⇥",
                icon: ArrowRightToLine,
                ariaLabel: "Tab",
            };
        }
        return {
            type: "text",
            label: "Tab",
            ariaLabel: "Tab",
        };
    }

    // Backtab / Shift+Tab (⇤)
    if (["backtab", "shifttab", "⇤"].includes(lower)) {
        if (format === "symbols") {
            return {
                type: "icon",
                label: "⇤",
                icon: ArrowLeftToLine,
                ariaLabel: "Backtab",
            };
        }
        return {
            type: "text",
            label: "Backtab",
            ariaLabel: "Backtab",
        };
    }

    // Space (␣)
    if (["space", "spacebar", "␣"].includes(lower)) {
        if (format === "symbols") {
            return {
                type: "icon",
                label: "␣",
                icon: Space,
                ariaLabel: "Space",
            };
        }
        return {
            type: "text",
            label: "Space",
            ariaLabel: "Space",
        };
    }

    // Globe / Fn (🌐)
    if (["fn", "globe", "world"].includes(lower)) {
        return {
            type: "icon",
            label: "Fn",
            icon: Globe,
            ariaLabel: "Function / Globe",
        };
    }

    // Caps Lock (⇪)
    if (["capslock", "caps", "⇪"].includes(lower)) {
        if (format === "symbols") {
            return {
                type: "icon",
                label: "⇪",
                icon: ArrowBigUpDash,
                ariaLabel: "Caps Lock",
            };
        }
        return {
            type: "text",
            label: "Caps",
            ariaLabel: "Caps Lock",
        };
    }

    // Escape
    if (["escape", "esc"].includes(lower)) {
        return {
            type: "text",
            label: "Esc",
            ariaLabel: "Escape",
        };
    }

    // Insert
    if (["insert", "ins"].includes(lower)) {
        return {
            type: "text",
            label: "Ins",
            ariaLabel: "Insert",
        };
    }

    // Print Screen
    if (["printscreen", "prtsc", "prtscn"].includes(lower)) {
        return {
            type: "text",
            label: "PrtSc",
            ariaLabel: "Print Screen",
        };
    }

    // Scroll Lock
    if (["scrolllock", "scrlk"].includes(lower)) {
        return {
            type: "text",
            label: "ScrLk",
            ariaLabel: "Scroll Lock",
        };
    }

    // Break / PauseBreak
    if (["break", "pausebreak"].includes(lower)) {
        return {
            type: "text",
            label: "Pause",
            ariaLabel: "Pause / Break",
        };
    }

    // Num Lock
    if (["numlock", "num"].includes(lower)) {
        return {
            type: "text",
            label: "Num",
            ariaLabel: "Num Lock",
        };
    }

    // Menu / Context Menu
    if (["menu", "contextmenu", "apps"].includes(lower)) {
        return {
            type: "icon",
            label: "Menu",
            icon: Menu,
            ariaLabel: "Context Menu",
        };
    }

    // Media & System keys
    if (["volup", "volumeup"].includes(lower)) {
        return {
            type: "icon",
            label: "Vol+",
            icon: Volume2,
            ariaLabel: "Volume Up",
        };
    }
    if (["voldown", "volumedown"].includes(lower)) {
        return {
            type: "icon",
            label: "Vol-",
            icon: Volume1,
            ariaLabel: "Volume Down",
        };
    }
    if (["mute", "volumemute"].includes(lower)) {
        return {
            type: "icon",
            label: "Mute",
            icon: VolumeX,
            ariaLabel: "Mute",
        };
    }
    if (["play"].includes(lower)) {
        return {
            type: "icon",
            label: "Play",
            icon: Play,
            ariaLabel: "Play",
        };
    }
    if (["pause"].includes(lower)) {
        return {
            type: "icon",
            label: "Pause",
            icon: Pause,
            ariaLabel: "Pause",
        };
    }
    if (["brightnessup", "sun"].includes(lower)) {
        return {
            type: "icon",
            label: "Sun",
            icon: Sun,
            ariaLabel: "Brightness Up",
        };
    }
    if (["brightnessdown", "moon"].includes(lower)) {
        return {
            type: "icon",
            label: "Moon",
            icon: Moon,
            ariaLabel: "Brightness Down",
        };
    }
    if (["mic", "microphone"].includes(lower)) {
        return {
            type: "icon",
            label: "Mic",
            icon: Mic,
            ariaLabel: "Microphone",
        };
    }
    if (["power"].includes(lower)) {
        return {
            type: "icon",
            label: "Power",
            icon: Power,
            ariaLabel: "Power",
        };
    }
    if (["search", "find"].includes(lower)) {
        return {
            type: "icon",
            label: "Search",
            icon: Search,
            ariaLabel: "Search",
        };
    }
    if (["undo"].includes(lower)) {
        return {
            type: "icon",
            label: "Undo",
            icon: Undo,
            ariaLabel: "Undo",
        };
    }
    if (["redo"].includes(lower)) {
        return {
            type: "icon",
            label: "Redo",
            icon: Redo,
            ariaLabel: "Redo",
        };
    }

    // Function keys (F1-F24)
    if (/^f\d{1,2}$/.test(lower)) {
        return {
            type: "text",
            label: lower.toUpperCase(),
            ariaLabel: lower.toUpperCase(),
        };
    }

    // Single character or uppercase representation
    const formatted = key.length === 1 ? key.toUpperCase() : key;
    return {
        type: "text",
        label: formatted,
        ariaLabel: formatted,
    };
}

/**
 * Resolves a full list of raw keys or a combo string into KeyItem objects.
 */
export function resolveKeys(
    options: {
        combo?: string;
        keys?: string[];
        key?: string;
        format?: KbdFormat;
    },
    platform: KbdPlatform = "auto"
): KeyItem[] {
    const keyOptions: ResolveKeyOptions = {
        format: options.format ?? "symbols",
        platform,
    };

    if (options.combo) {
        const tokens = splitComboString(options.combo);
        return tokens.map((token) => resolveKeyItem(token, keyOptions));
    }

    if (options.keys && options.keys.length > 0) {
        return options.keys.map((token) => resolveKeyItem(token, keyOptions));
    }

    if (options.key) {
        return [resolveKeyItem(options.key, keyOptions)];
    }

    return [];
}
