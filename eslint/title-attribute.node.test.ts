/**
 * @file title-attribute.node.test.ts
 * Tests for the forbidden title attribute ESLint restriction in Svelte templates.
 */

import * as svelteParser from "svelte-eslint-parser";
import { Linter } from "eslint";
import { describe, expect, test } from "vitest";

import { forbiddenTitleAttributeSelector } from "./title-attribute.ts";

describe("title attribute ESLint rule", () => {
    const linter = new Linter({ configType: "flat" });

    const config: Linter.Config = {
        files: ["**/*.svelte"],
        languageOptions: {
            parser: svelteParser,
        },
        rules: {
            "no-restricted-syntax": ["error", forbiddenTitleAttributeSelector],
        },
    };

    test("reports error when native HTML element has static title attribute", () => {
        const results = linter.verify(
            '<button title="Save">Save</button>',
            [config],
            "Component.svelte"
        );
        expect(results).toHaveLength(1);
        expect(results[0]?.message).toContain(
            "The native 'title' attribute is forbidden on HTML elements"
        );
    });

    test("reports error when native HTML element has dynamic title attribute", () => {
        const results = linter.verify(
            "<button title={tooltipText}>Save</button>",
            [config],
            "Component.svelte"
        );
        expect(results).toHaveLength(1);
        expect(results[0]?.message).toContain(
            "The native 'title' attribute is forbidden on HTML elements"
        );
    });

    test("reports error when native HTML element has shorthand title attribute", () => {
        const results = linter.verify(
            "<button {title}>Save</button>",
            [config],
            "Component.svelte"
        );
        expect(results).toHaveLength(1);
        expect(results[0]?.message).toContain(
            "The native 'title' attribute is forbidden on HTML elements"
        );
    });

    test("allows title attribute on iframe elements per WCAG requirements", () => {
        const results = linter.verify(
            '<iframe title="Embedded Content"></iframe>',
            [config],
            "Component.svelte"
        );
        expect(results).toHaveLength(0);
    });

    test("allows title props on Svelte components", () => {
        const results = linter.verify(
            '<PreviewHeader title="Buttons" />',
            [config],
            "Component.svelte"
        );
        expect(results).toHaveLength(0);
    });

    test("allows SVG title elements", () => {
        const results = linter.verify(
            "<svg><title>Close icon</title><path /></svg>",
            [config],
            "Component.svelte"
        );
        expect(results).toHaveLength(0);
    });
});
