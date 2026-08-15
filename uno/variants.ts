import type { Variant } from "unocss";

export const variantsConfig: Variant[] = [
    // Hover: High priority over presetWind4, fine pointer media query, excluding disabled states
    {
        name: "custom-hover",
        order: -1,
        match(matcher) {
            if (!matcher.startsWith("hover:")) return;
            return {
                matcher: matcher.slice(6),
                parent: "@media (hover: hover) and (pointer: fine)",
                selector: (s) => `${s}:hover:not([aria-disabled="true"], :disabled, .disabled)`,
            };
        },
    },

    // Disabled: High priority over presetWind4, matching native disabled, aria-disabled, and .disabled
    {
        name: "custom-disabled",
        order: -1,
        match(matcher) {
            if (!matcher.startsWith("disabled:")) return;
            return {
                matcher: matcher.slice(9),
                selector: (s) => `${s}:is(:disabled, [aria-disabled="true"], .disabled)`,
            };
        },
    },

    // Active: High priority over presetWind4, excluding disabled states
    {
        name: "custom-active",
        order: -1,
        match(matcher) {
            if (!matcher.startsWith("active:")) return;
            return {
                matcher: matcher.slice(7),
                selector: (s) => `${s}:active:not([aria-disabled="true"], :disabled, .disabled)`,
            };
        },
    },

    // Transitions
    (matcher) => {
        if (!matcher.startsWith("t:")) return;
        return {
            matcher: `t-${matcher.slice(2)}`,
        };
    },
];
