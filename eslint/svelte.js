import svelte from "eslint-plugin-svelte";
import ts from "typescript-eslint";

export const svelteConfig = [
    ...svelte.configs.recommended,

    {
        files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
        languageOptions: {
            parserOptions: {
                parser: ts.parser,
                extraFileExtensions: [".svelte"],
            },
        },
    },
    {
        files: ["**/*.svelte"],
        rules: {
            "prefer-const": "off",
        },
    },
];
