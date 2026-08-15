/**
 * @file shortcuts.ts
 * Custom ESLint rule enforcing UnoCSS shortcuts over redundant atomic utility combinations.
 */

import type { Linter, Rule } from "eslint";

interface ShortcutRule {
    name: string;
    classes: string[];
}

const SHORTCUT_RULES: ShortcutRule[] = [
    {
        name: "flex-center",
        classes: ["flex", "justify-center", "items-center"],
    },
    {
        name: "absolute-center",
        classes: ["absolute", "top-1/2", "left-1/2", "-translate-x-1/2", "-translate-y-1/2"],
    },
];

function applyFix(
    node: Rule.Node,
    newContent: string,
    context: Rule.RuleContext
): (fixer: Rule.RuleFixer) => Rule.Fix {
    const rawText = context.sourceCode.getText(node);

    if (
        (rawText.startsWith('"') && rawText.endsWith('"')) ||
        (rawText.startsWith("'") && rawText.endsWith("'")) ||
        (rawText.startsWith("`") && rawText.endsWith("`"))
    ) {
        const quote = rawText[0];
        return (fixer: Rule.RuleFixer): Rule.Fix =>
            fixer.replaceText(node, `${quote}${newContent}${quote}`);
    }

    return (fixer: Rule.RuleFixer): Rule.Fix => fixer.replaceText(node, newContent);
}

function checkAndReport(
    str: string | null | undefined,
    node: Rule.Node,
    context: Rule.RuleContext
): void {
    if (typeof str !== "string" || !str.trim()) return;

    const tokens = str.split(/\s+/).filter(Boolean);
    const tokenSet = new Set(tokens);

    for (const { name, classes } of SHORTCUT_RULES) {
        const hasAll = classes.every((cls) => tokenSet.has(cls));
        if (!hasAll) continue;

        context.report({
            node,
            message: `Redundant atomic utilities detected. Use shortcut "${name}" instead of ${classes.map((c) => `"${c}"`).join(", ")}.`,
            fix(fixer) {
                let replacedFirst = false;
                const newTokens: string[] = [];

                for (const token of tokens) {
                    if (classes.includes(token)) {
                        if (!replacedFirst) {
                            newTokens.push(name);
                            replacedFirst = true;
                        }
                    } else {
                        newTokens.push(token);
                    }
                }

                const newClassString = newTokens.join(" ");
                return applyFix(node, newClassString, context)(fixer);
            },
        });
    }
}

export const enforceShortcutsRule: Rule.RuleModule = {
    meta: {
        type: "suggestion",
        docs: {
            description: "Enforce UnoCSS shortcuts for redundant utility combinations.",
        },
        fixable: "code",
        schema: [],
    },
    create(context: Rule.RuleContext): Rule.RuleListener {
        const filename = context.filename ?? "";
        if (
            filename.endsWith("uno/shortcuts.ts") ||
            filename.endsWith(String.raw`uno\shortcuts.ts`)
        ) {
            return {};
        }

        return {
            SvelteLiteral(node: Rule.Node & { value?: string }): void {
                checkAndReport(node.value, node, context);
            },
            Literal(node: Rule.Node & { value?: unknown }): void {
                if (typeof node.value === "string") {
                    checkAndReport(node.value, node, context);
                }
            },
            TemplateElement(node: Rule.Node & { value?: { raw?: string } }): void {
                if (node.value?.raw) {
                    checkAndReport(node.value.raw, node, context);
                }
            },
        };
    },
};

export const shortcutsConfig: Linter.Config = {
    plugins: {
        shortcuts: {
            rules: {
                "enforce-shortcuts": enforceShortcutsRule,
            },
        },
    },
    rules: {
        "shortcuts/enforce-shortcuts": "error",
    },
};
