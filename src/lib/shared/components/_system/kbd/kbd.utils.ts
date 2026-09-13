import {
    ArrowBigUp,
    ArrowBigUpDash,
    ArrowDown,
    ArrowLeft,
    ArrowLeftToLine,
    ArrowRight,
    ArrowRightToLine,
    ArrowUp,
    ChevronsDown,
    ChevronsUp,
    Command,
    CornerDownLeft,
    Delete,
    Option,
} from "@lucide/svelte";
import { getOS } from "$utils";

import type { KbdFormat, KbdPlatform, KeyItem, ResolvedShortcut } from "./kbd.types";

export interface ResolveKeyOptions {
    format?: KbdFormat;
    platform?: KbdPlatform;
}

interface KeyDefinition {
    symbol?: string;
    text: string;
    title: string;
    icon?: KeyItem["icon"];
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

const KEY_DEFINITIONS: Record<string, KeyDefinition> = {
    ctrl: { symbol: "⌃", text: "Ctrl", title: "Control" },
    control: { symbol: "⌃", text: "Ctrl", title: "Control" },
    alt: { symbol: "⌥", text: "Alt", title: "Alt", icon: Option },
    option: { symbol: "⌥", text: "Alt", title: "Option", icon: Option },
    opt: { symbol: "⌥", text: "Alt", title: "Option", icon: Option },
    shift: { symbol: "⇧", text: "Shift", title: "Shift", icon: ArrowBigUp },
    capslock: { symbol: "⇪", text: "Caps", title: "Caps Lock", icon: ArrowBigUpDash },
    caps: { symbol: "⇪", text: "Caps", title: "Caps Lock", icon: ArrowBigUpDash },
    arrowup: { symbol: "↑", text: "Up", title: "Up Arrow", icon: ArrowUp },
    up: { symbol: "↑", text: "Up", title: "Up Arrow", icon: ArrowUp },
    arrowdown: { symbol: "↓", text: "Down", title: "Down Arrow", icon: ArrowDown },
    down: { symbol: "↓", text: "Down", title: "Down Arrow", icon: ArrowDown },
    arrowleft: { symbol: "←", text: "Left", title: "Left Arrow", icon: ArrowLeft },
    left: { symbol: "←", text: "Left", title: "Left Arrow", icon: ArrowLeft },
    arrowright: { symbol: "→", text: "Right", title: "Right Arrow", icon: ArrowRight },
    right: { symbol: "→", text: "Right", title: "Right Arrow", icon: ArrowRight },
    pageup: { symbol: "⇞", text: "PgUp", title: "Page Up", icon: ChevronsUp },
    pgup: { symbol: "⇞", text: "PgUp", title: "Page Up", icon: ChevronsUp },
    pagedown: { symbol: "⇟", text: "PgDn", title: "Page Down", icon: ChevronsDown },
    pgdn: { symbol: "⇟", text: "PgDn", title: "Page Down", icon: ChevronsDown },
    home: { symbol: "↖", text: "Home", title: "Home" },
    end: { symbol: "↘", text: "End", title: "End" },
    enter: { symbol: "↵", text: "Enter", title: "Enter", icon: CornerDownLeft },
    return: { symbol: "↵", text: "Enter", title: "Enter", icon: CornerDownLeft },
    backspace: { symbol: "⌫", text: "Backspace", title: "Backspace", icon: Delete },
    delete: { symbol: "⌦", text: "Del", title: "Delete" },
    del: { symbol: "⌦", text: "Del", title: "Delete" },
    tab: { symbol: "⇥", text: "Tab", title: "Tab", icon: ArrowRightToLine },
    backtab: { symbol: "⇤", text: "Backtab", title: "Backtab", icon: ArrowLeftToLine },
    shifttab: { symbol: "⇤", text: "Backtab", title: "Backtab", icon: ArrowLeftToLine },
    space: { symbol: "␠", text: "Space", title: "Space" },
    spacebar: { symbol: "␠", text: "Space", title: "Space" },
    fn: { text: "fn", title: "Function" },
    globe: { text: "fn", title: "Function" },
    world: { text: "fn", title: "Function" },
    escape: { text: "Esc", title: "Escape" },
    esc: { text: "Esc", title: "Escape" },
    insert: { text: "Ins", title: "Insert" },
    ins: { text: "Ins", title: "Insert" },
    printscreen: { text: "PrtSc", title: "Print Screen" },
    prtsc: { text: "PrtSc", title: "Print Screen" },
    prtscn: { text: "PrtSc", title: "Print Screen" },
    scrolllock: { text: "ScrLk", title: "Scroll Lock" },
    scrlk: { text: "ScrLk", title: "Scroll Lock" },
    break: { text: "Pause", title: "Pause / Break" },
    pausebreak: { text: "Pause", title: "Pause / Break" },
    numlock: { text: "Num", title: "Num Lock" },
    num: { text: "Num", title: "Num Lock" },
    menu: { text: "Menu", title: "Context Menu" },
    contextmenu: { text: "Menu", title: "Context Menu" },
    apps: { text: "Menu", title: "Context Menu" },
    volup: { text: "Vol+", title: "Volume Up" },
    volumeup: { text: "Vol+", title: "Volume Up" },
    voldown: { text: "Vol−", title: "Volume Down" },
    volumedown: { text: "Vol−", title: "Volume Down" },
    mute: { text: "Mute", title: "Mute" },
    volumemute: { text: "Mute", title: "Mute" },
    play: { text: "Play", title: "Play" },
    pause: { text: "Pause", title: "Pause" },
    brightnessup: { text: "Bright+", title: "Brightness Up" },
    sun: { text: "Bright+", title: "Brightness Up" },
    brightnessdown: { text: "Bright−", title: "Brightness Down" },
    moon: { text: "Bright−", title: "Brightness Down" },
    mic: { text: "Mic", title: "Microphone" },
    microphone: { text: "Mic", title: "Microphone" },
    power: { symbol: "⏻", text: "Power", title: "Power" },
    search: { text: "Search", title: "Search" },
    find: { text: "Search", title: "Search" },
    undo: { symbol: "↶", text: "Undo", title: "Undo" },
    redo: { symbol: "↷", text: "Redo", title: "Redo" },
};

const iconKey = (value: string, title: string, icon: NonNullable<KeyItem["icon"]>): KeyItem => ({
    type: "icon",
    value,
    title,
    icon,
});

const textKey = (value: string, title = value): KeyItem => ({
    type: "text",
    value,
    title,
});

export function isMacPlatform(platform: KbdPlatform = "auto"): boolean {
    if (platform === "mac") return true;
    if (platform === "windows") return false;
    if (typeof window === "undefined") return false;
    const os = getOS();
    return os === "macos" || os === "ios";
}

export function splitShortcutSteps(combo: string): string[] {
    const normalized = combo.trim().replaceAll(/\s*\+\s*/g, "+");
    return normalized ? normalized.split(/\s+/).filter(Boolean) : [];
}

export function splitComboString(combo: string): string[] {
    const normalized = combo.trim().replaceAll(/\s*\+\s*/g, "+");
    if (!normalized) return [];
    if (normalized === "+") return ["+"];

    const hasPlusKey = normalized.endsWith("++");
    const source = hasPlusKey ? normalized.slice(0, -2) : normalized;
    const keys = source
        .split("+")
        .map((part) => part.trim())
        .filter(Boolean);
    if (hasPlusKey) keys.push("+");
    return keys;
}

export function resolveKeyItem(rawKey: string, options: ResolveKeyOptions = {}): KeyItem {
    const format = options.format ?? "symbols";
    const isMac = isMacPlatform(options.platform);
    const key = rawKey.trim();
    const lower = key.toLocaleLowerCase();

    if (Object.hasOwn(KEY_NAME_ALIASES, lower)) {
        const value = KEY_NAME_ALIASES[lower] as string;
        return textKey(value);
    }

    if (lower === "mod") return iconKey("⌘", "Primary modifier (Command / Control)", Command);

    if (["cmd", "command", "meta"].includes(lower)) {
        return format === "symbols" || isMac
            ? iconKey("⌘", "Command", Command)
            : textKey("Ctrl", "Control");
    }

    if (["super", "win", "windows"].includes(lower)) {
        return textKey("Win", "Windows");
    }

    const definition = KEY_DEFINITIONS[lower];
    if (definition) {
        return format === "symbols" && definition.symbol && definition.icon
            ? iconKey(definition.symbol, definition.title, definition.icon)
            : textKey(definition.text, definition.title);
    }

    if (/^f\d{1,2}$/.test(lower)) return textKey(lower.toUpperCase());

    const value = key.length === 1 ? key.toUpperCase() : key;
    return textKey(value);
}

export function resolveShortcut(
    options: {
        combo?: string;
        keys?: readonly string[];
        key?: string;
        format?: KbdFormat;
    },
    platform: KbdPlatform = "auto"
): ResolvedShortcut {
    const keyOptions: ResolveKeyOptions = { format: options.format ?? "symbols", platform };
    if (options.combo) {
        return {
            steps: splitShortcutSteps(options.combo).map((step) =>
                splitComboString(step).map((token) => resolveKeyItem(token, keyOptions))
            ),
        };
    }
    if (options.keys && options.keys.length > 0) {
        return { steps: [options.keys.map((token) => resolveKeyItem(token, keyOptions))] };
    }
    if (options.key) return { steps: [[resolveKeyItem(options.key, keyOptions)]] };
    return { steps: [] };
}

export function resolveKeys(
    options: {
        combo?: string;
        keys?: readonly string[];
        key?: string;
        format?: KbdFormat;
    },
    platform: KbdPlatform = "auto"
): KeyItem[] {
    return resolveShortcut(options, platform).steps.flat();
}

export const getShortcutTitle = (shortcut: ResolvedShortcut): string =>
    shortcut.steps.map((step) => step.map((item) => item.title).join(" + ")).join(", then ");

export const getShortcutAriaLabel = (shortcut: ResolvedShortcut): string =>
    shortcut.steps.map((step) => step.map((item) => item.title).join(" plus ")).join(" then ");
