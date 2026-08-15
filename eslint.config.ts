/**
 * Root ESLint Flat Configuration
 *
 * To keep this main setup clean, scalable, and easy to maintain, specific rule sets,
 * plugin overrides, and environment settings are modularized inside the `./eslint/`
 * directory. Add or adjust modular configs there without cluttering this file.
 */
import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";

import { baseRulesConfig } from "./eslint/base-rules.ts";
import { ignoresConfig } from "./eslint/ignores.ts";
import { restrictedImportsConfig } from "./eslint/imports.ts";
import { shortcutsConfig } from "./eslint/shortcuts.ts";
import { svelteConfig } from "./eslint/svelte.ts";
import { forbiddenTransitionsConfig } from "./eslint/transitions.ts";
import { unicornConfig } from "./eslint/unicorn.ts";
import { unocssConfig } from "./eslint/unocss.ts";

export default defineConfig([
    ignoresConfig,

    js.configs.recommended,
    ...ts.configs.recommended,

    ...baseRulesConfig,
    forbiddenTransitionsConfig,
    shortcutsConfig,
    ...unicornConfig,
    ...unocssConfig,

    {
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.es2024,
            },
        },
    },

    ...svelteConfig,
    ...restrictedImportsConfig,

    prettier,
]);
