import type { Variant } from "unocss";

export const variantsConfig: Variant[] = [
    (matcher) => {
        if (!matcher.startsWith("hover:")) return matcher;
        return {
            matcher: matcher.slice(6),
            parent: "@media (hover: hover)",
            selector: (s) => `${s}:hover`,
        };
    },
];
