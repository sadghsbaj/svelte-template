import type { Linter } from "eslint";
import unicorn from "eslint-plugin-unicorn";

export const unicornConfig: Linter.Config[] = [
    unicorn.configs.recommended,
    {
        rules: {
            "unicorn/name-replacements": "off",
            "unicorn/consistent-boolean-name": "off",
            "unicorn/no-null": "off",
            "unicorn/prefer-global-this": "off",
            "unicorn/no-top-level-assignment-in-function": "off",
            "unicorn/prefer-simple-condition-first": "off",
            "unicorn/no-negated-condition": "off",
            "unicorn/consistent-class-member-order": "off",
            "unicorn/no-computed-property-existence-check": "off",
            "unicorn/prefer-query-selector": "off",
            "unicorn/filename-case": ["warn", { case: "kebabCase" }],
        },
    },
    {
        files: ["src/main.ts", "src/main.js"],
        rules: {
            "unicorn/no-top-level-side-effects": "off",
        },
    },
    {
        files: ["scripts/**/*.ts", "scripts/**/*.js"],
        rules: {
            "unicorn/no-process-exit": "off",
        },
    },
    {
        files: ["**/*.svelte"],
        rules: {
            "unicorn/filename-case": ["warn", { case: "pascalCase", ignore: ["^[a-z0-9-]+$"] }],
        },
    },
    {
        files: ["**/*.svelte.ts", "**/*.svelte.js"],
        rules: {
            "unicorn/filename-case": ["warn", { case: "camelCase", ignore: ["^[a-z0-9-]+$"] }],
        },
    },
    {
        files: ["**/*.test.ts", "**/*.test.js", "**/*.spec.ts", "**/*.spec.js"],
        rules: {
            "unicorn/filename-case": [
                "warn",
                {
                    cases: {
                        kebabCase: true,
                        camelCase: true,
                    },
                    ignore: ["^[a-z0-9-]+$"],
                },
            ],
        },
    },
    {
        files: ["**/*.test.svelte", "**/*.spec.svelte"],
        rules: {
            "unicorn/filename-case": [
                "warn",
                {
                    case: "pascalCase",
                    ignore: ["^[a-z0-9-]+$"],
                },
            ],
        },
    },
];
