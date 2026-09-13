import type { Component, Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import type { KbdStyleProps } from "./kbd.styles";

export type KbdPlatform = "auto" | "mac" | "windows";

export type KbdFormat = "symbols" | "text";

export type KeyItemType = "icon" | "text";

export interface KeyItem {
    type: KeyItemType;
    value: string;
    title: string;
    icon?: Component<{
        class?: string;
        "aria-hidden"?: boolean | "true" | "false";
    }>;
}

export interface ResolvedShortcut {
    steps: KeyItem[][];
}

export type KbdProps = KbdStyleProps &
    Omit<HTMLAttributes<HTMLElement>, "class" | "size"> & {
        class?: string;

        /**
         * Shortcut combination string (e.g. "Mod+Shift+P", "Mod+K", "ArrowUp").
         * All keys in the combo render together inside one compact badge.
         */
        combo?: string;

        /**
         * Explicit list of key identifiers (e.g. ["Cmd", "Shift", "P"]).
         */
        keys?: readonly string[];

        /**
         * Single key shortcut (e.g. "Enter", "Escape", "K").
         */
        key?: string;

        /**
         * Target platform for modifier key rendering when in text mode.
         * Defaults to "auto" which uses client OS detection.
         */
        platform?: KbdPlatform;

        /**
         * Modifier rendering format: "symbols" (default, e.g. ⌘, ⌃, ⌥, ⇧) or "text" (e.g. Ctrl, Alt, Shift).
         * Symbol format uses the compact Command glyph across platforms.
         */
        format?: KbdFormat;

        /**
         * Optional visual separator between keys inside the badge (e.g. "+" or true).
         * Defaults to false (clean subtle spacing between keys).
         */
        separator?: boolean | string;

        /**
         * Custom children fallback snippet when not using combo, keys, or key props.
         */
        children?: Snippet;
    };
