/**
 * @file unicode-dots.ts
 * Custom ESLint rule forbidding unicode separator dots in favor of UnoCSS dot utility classes.
 */

import type { Linter, Rule } from "eslint";

export const FORBIDDEN_DOTS_REGEX = /[\u{B7}\u{2022}\u{2027}\u{2219}\u{22C5}]/u;

export const unicodeDotsRule: Rule.RuleModule = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Disallow unicode separator dots (e.g. · or •) in favor of UnoCSS dot utilities.",
        },
        messages: {
            forbiddenDot:
                'Unicode separator dot "{{dot}}" is forbidden. Use a <span> with UnoCSS dot utilities (e.g. "dot-sm", "dot-md", "dot-lg") instead.',
        },
        schema: [],
    },
    create(context: Rule.RuleContext): Rule.RuleListener {
        const filename = context.filename ?? "";

        // Skip rule definition, dot definition, and test files
        if (
            filename.includes("uno/dots") ||
            filename.includes("eslint/") ||
            filename.endsWith(".test.ts") ||
            filename.endsWith(".spec.ts")
        ) {
            return {};
        }

        function checkNode(node: Rule.Node, text: string | null | undefined): void {
            if (!text) return;
            const match = text.match(FORBIDDEN_DOTS_REGEX);
            if (match) {
                context.report({
                    node,
                    messageId: "forbiddenDot",
                    data: { dot: match[0] },
                });
            }
        }

        return {
            SvelteText(node: Rule.Node & { value?: string }): void {
                checkNode(node, node.value);
            },
            Literal(node: Rule.Node & { value?: unknown }): void {
                if (typeof node.value === "string") {
                    checkNode(node, node.value);
                }
            },
            TemplateElement(node: Rule.Node & { value?: { raw?: string } }): void {
                checkNode(node, node.value?.raw);
            },
        };
    },
};

export const unicodeDotsConfig: Linter.Config = {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,svelte}"],
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
};
