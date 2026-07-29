import unicorn from "eslint-plugin-unicorn";

export const unicornConfig = [
    unicorn.configs.recommended,
    {
        rules: {
            "unicorn/no-null": "off",
            "unicorn/filename-case": ["warn", { case: "kebabCase" }],
        },
    },
    {
        files: ["**/*.svelte"],
        rules: {
            "unicorn/filename-case": ["warn", { case: "pascalCase" }],
        },
    },
    {
        files: ["**/*.svelte.ts", "**/*.svelte.js"],
        rules: {
            "unicorn/filename-case": ["warn", { case: "camelCase" }],
        },
    },
];
