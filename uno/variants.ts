import type { Variant } from "unocss";

export const variantsConfig: Variant[] = [
    // Hover
    (matcher) => {
        if (!matcher.startsWith("hover:")) return matcher;
        return {
            matcher: matcher.slice(6),
            parent: "@media (hover: hover)",
            selector: (s) => `${s}:hover:not([aria-disabled="true"], :disabled, .disabled)`,
        };
    },

    // Disabled
    (matcher) => {
        if (!matcher.startsWith("disabled:")) return matcher;
        return {
            matcher: matcher.slice(9),
            selector: (s) => `${s}:is(:disabled, [aria-disabled="true"], .disabled)`,
        };
    },

    // Transitions
    (matcher) => {
        if (!matcher.startsWith("t:")) return matcher;
        return {
            matcher: `t-${matcher.slice(2)}`,
        };
    },
];
