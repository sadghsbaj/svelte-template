/**
 * @file cva-blocklist.ts
 * Custom ESLint rule enforcing the central UnoCSS blocklist inside cva() recipes and style files.
 */

import type { Linter, Rule } from "eslint";

/**
 * Extracts class tokens from a string, handling whitespace and UnoCSS variant groups like `disabled:(a b)`.
 */
export function extractClassTokens(input: string): string[] {
    if (!input || !input.trim()) return [];

    // Expand variant groups e.g. "dark:(bg-base-100 text-white)" -> "dark:bg-base-100 dark:text-white"
    const variantGroupRegex = /([a-z0-9-]+:)\(([^)]+)\)/g;
    let expanded = input;
    while (variantGroupRegex.test(expanded)) {
        expanded = expanded.replaceAll(variantGroupRegex, (_, prefix: string, inner: string) => {
            return inner
                .split(/\s+/)
                .filter(Boolean)
                .map((token) => `${prefix}${token}`)
                .join(" ");
        });
    }

    return expanded.split(/\s+/).filter(Boolean);
}

/**
 * Checks if a token violates any rule in the provided blocklist patterns.
 * Returns the matching forbidden token if violated, or null if allowed.
 */
export function checkTokenAgainstBlocklist(
    token: string,
    patterns: (string | RegExp)[]
): string | null {
    // Strip important modifier if present (e.g. "!rounded-full" -> "rounded-full")
    const baseToken = (token.startsWith("!") ? token.slice(1) : token).replace(
        /^(?:[a-z0-9-]+:)+/,
        ""
    );

    for (const pattern of patterns) {
        if (typeof pattern === "string") {
            if (token === pattern || baseToken === pattern) {
                return token;
            }
        } else if (pattern.test(token) || pattern.test(baseToken)) {
            return token;
        }
    }

    return null;
}

function inspectStringNode(
    str: string | null | undefined,
    node: Rule.Node,
    patterns: (string | RegExp)[],
    context: Rule.RuleContext
): void {
    if (typeof str !== "string" || !str.trim()) return;

    const tokens = extractClassTokens(str);
    for (const token of tokens) {
        const forbidden = checkTokenAgainstBlocklist(token, patterns);
        if (forbidden) {
            context.report({
                node,
                message: `Forbidden UnoCSS utility "${forbidden}" detected in cva() style recipe. Use semantic design tokens instead (see uno/blocklist.ts).`,
            });
        }
    }
}

function inspectArgumentTokens(
    arg: Parameters<Rule.RuleContext["sourceCode"]["getTokens"]>[0],
    blocklist: (string | RegExp)[],
    context: Rule.RuleContext
): void {
    const tokens = context.sourceCode.getTokens(arg);
    for (const token of tokens) {
        if (token.type !== "String") {
            continue;
        }
        // Strip surrounding quotes
        const rawValue = token.value.slice(1, -1);
        inspectStringNode(rawValue, token as unknown as Rule.Node, blocklist, context);
    }
}

export function createCvaBlocklistRule(blocklist: (string | RegExp)[]): Rule.RuleModule {
    return {
        meta: {
            type: "problem",
            docs: {
                description:
                    "Enforce central UnoCSS blocklist inside cva() recipes and style files.",
            },
            schema: [],
        },
        create(context: Rule.RuleContext): Rule.RuleListener {
            const filename = context.filename ?? "";

            if (
                filename.includes("uno/blocklist") ||
                filename.endsWith(".test.ts") ||
                filename.endsWith(".spec.ts")
            ) {
                return {};
            }

            return {
                CallExpression(node: Rule.Node): void {
                    if (node.type !== "CallExpression") {
                        return;
                    }

                    if (node.callee.type !== "Identifier" || node.callee.name !== "cva") {
                        return;
                    }

                    for (const arg of node.arguments) {
                        inspectArgumentTokens(arg, blocklist, context);
                    }
                },
            };
        },
    };
}

export function createCvaBlocklistConfig(blocklist: (string | RegExp)[]): Linter.Config {
    return {
        plugins: {
            "cva-blocklist": {
                rules: {
                    "enforce-cva-blocklist": createCvaBlocklistRule(blocklist),
                },
            },
        },
        rules: {
            "cva-blocklist/enforce-cva-blocklist": "error",
        },
    };
}
