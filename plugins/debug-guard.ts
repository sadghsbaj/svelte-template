/**
 * @file debug-guard.ts
 * Vite plugin to warn developers when debug CSS classes are left in the codebase.
 *
 * This plugin scans raw source files from disk during the build phase for the
 * presence of "debug-border" utility classes. It emits a non-fatal console warning
 * at the very end of the build to ensure it isn't cleared by Vite's logger.
 */

import fs from "node:fs";
import type { Plugin } from "vite";

export interface DebugGuardOptions {
    /** Custom paths or regex patterns to exclude from the check. */
    exclude?: (string | RegExp)[];
}

export function debugGuardPlugin(options: DebugGuardOptions = {}): Plugin {
    const defaultExcludes = [
        /[/\\]node_modules[/\\]/,
        /[/\\]uno\.config\.ts$/, // Ignore the config where the class is defined
        /[/\\]debug-guard(\.test)?\.ts$/, // Ignore this plugin itself and its test file
    ];

    const excludes = [...defaultExcludes, ...(options.exclude || [])];

    // Array to collect warnings and emit them after Vite clears the terminal
    const warnings: string[] = [];

    return {
        name: "vite-plugin-debug-guard",
        enforce: "pre", // Run as early as possible in the Vite pipeline

        transform(_code, id) {
            // Ignore virtual modules and query params (e.g., ?svelte&type=style)
            if (id.startsWith("\0") || id.includes("?")) return null;

            // Check if the current file matches any exclude patterns
            const isExcluded = excludes.some((pattern) => {
                if (typeof pattern === "string") return id.includes(pattern);
                return pattern.test(id);
            });

            if (isExcluded) return null;

            try {
                // Read the original file directly from disk.
                // This guarantees we scan the raw "debug-border" class before
                // Svelte or UnoCSS hash it into scoped classes (e.g., uno-xxx).
                const rawCode = fs.readFileSync(id, "utf8");
                const match = rawCode.match(/debug-border(?:-[0-9])?/);

                if (match) {
                    const filename = id.split(/[/\\]/).pop() || id;

                    // Store the formatted warning message
                    warnings.push(
                        `\u{1B}[33m🚨 [DEBUG-GUARD] Leftover Debug Class Detected: "${match[0]}" in ${filename}\u{1B}[0m`
                    );
                }
            } catch {
                // Fail silently if a file cannot be read (e.g., binary files)
            }

            // Return null to indicate that this plugin does not modify the source code
            return null;
        },

        closeBundle() {
            // Print all collected warnings at the very end of the build process
            if (warnings.length === 0) return;

            console.warn("\n" + warnings.join("\n"));
            console.warn(
                `\u{1B}[33m   Make sure to remove debug utilities before committing.\u{1B}[0m\n`
            );
        },
    };
}
