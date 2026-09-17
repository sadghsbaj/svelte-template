/**
 * @file unicode-dots.node.test.ts
 * Tests for the custom unicode-dots ESLint rule.
 */

import { Linter } from "eslint";
import * as svelteParser from "svelte-eslint-parser";
import { describe, expect, test } from "vitest";

import { unicodeDotsConfig, unicodeDotsRule } from "./unicode-dots.ts";

describe("unicode-dots ESLint rule", () => {
    const linter = new Linter({ configType: "flat" });

    test("reports error when string literal contains middle dot", () => {
        const results = linter.verify(
            'const text = "30px · 700";',
            [unicodeDotsConfig],
            "src/component.ts"
        );

        expect(results).toHaveLength(1);
        expect(results[0]?.message).toContain('Unicode separator dot "·" is forbidden');
    });

    test("reports error when template literal contains bullet", () => {
        const results = linter.verify(
            "const text = `30px • ${weight}`;",
            [unicodeDotsConfig],
            "src/component.ts"
        );

        expect(results).toHaveLength(1);
        expect(results[0]?.message).toContain('Unicode separator dot "•" is forbidden');
    });

    test("reports error when svelte template text contains unicode dot", () => {
        const results = linter.verify(
            "<span>30px · 700</span>",
            [
                {
                    files: ["**/*.svelte"],
                    languageOptions: {
                        parser: svelteParser,
                    },
                    plugins: {
                        "unicode-dots": {
                            rules: {
                                "no-unicode-dots": unicodeDotsRule,
                            },
                        },
                    },
                    rules: {
                        "unicode-dots/no-unicode-dots": "error",
                    },
                },
            ],
            "src/Component.svelte"
        );

        expect(results).toHaveLength(1);
        expect(results[0]?.message).toContain('Unicode separator dot "·" is forbidden');
    });

    test("allows clean code using UnoCSS dot utilities", () => {
        const results = linter.verify(
            'const html = \'30px <span class="dot-sm"></span> 700\';',
            [unicodeDotsConfig],
            "src/component.ts"
        );

        expect(results).toHaveLength(0);
    });

    test("skips test files and eslint rule files", () => {
        const results = linter.verify(
            'const text = "30px · 700";',
            [unicodeDotsConfig],
            "src/component.test.ts"
        );

        expect(results).toHaveLength(0);
    });
});
