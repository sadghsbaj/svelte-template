import type { Component, Snippet } from "svelte";
import type { HTMLAttributes } from "svelte/elements";

import type { KbdStyleProps } from "./kbd.styles";

export type KbdPlatform = "auto" | "mac" | "windows";

export type KbdFormat = "symbols" | "text";

export type KeyItemType = "icon" | "text";

export interface KeyItem {
    type: KeyItemType;
    label: string;
    icon?: Component<{
        size?: number;
        class?: string;
        strokeWidth?: number;
        "aria-hidden"?: boolean | "true" | "false";
        "aria-label"?: string;
    }>;
    ariaLabel?: string;
}

export type KbdProps = KbdStyleProps &
    Omit<HTMLAttributes<HTMLElement>, "class" | "size"> & {
        class?: string;

        /**
         * Shortcut combination string (e.g. "Cmd+Shift+P", "mod+k", "Ctrl+Alt+Delete", "ArrowUp").
         * All keys in the combo render together inside one compact badge.
         */
        combo?: string;

        /**
         * Explicit list of key identifiers (e.g. ["Cmd", "Shift", "P"]).
         */
        keys?: string[];

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
         * Defaults to "symbols" for a universal, language-neutral, compact display.
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
