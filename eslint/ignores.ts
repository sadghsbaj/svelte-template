import type { Linter } from "eslint";

export const ignoresConfig: Linter.Config = {
    ignores: [
        "dist",
        "dist/**",
        "node_modules",
        "node_modules/**",
        ".svelte-kit",
        ".svelte-kit/**",
        "coverage",
        "coverage/**",
    ],
};
