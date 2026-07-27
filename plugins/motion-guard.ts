/**
 * @file motion-guard.ts
 * Vite plugin to enforce the use of custom motion wrappers instead of native Svelte ones.
 *
 * This compiler-level guard intercepts files during the Vite development and build phases.
 * It raises structured compiler errors if it detects direct imports from "svelte/transition",
 * "svelte/animate", or "svelte/motion". This prevents developers from accidentally bypassing
 * the library's reduced-motion preference coordination.
 */

import type { Plugin } from "vite";

export interface MotionGuardOptions {
    /**
     * Custom paths or regex patterns to exclude from the check.
     */
    exclude?: (string | RegExp)[];
}

export function motionGuardPlugin(options: MotionGuardOptions = {}): Plugin {
    const defaultExcludes = [
        /[/\\]node_modules[/\\]/,
        /src[/\\]lib[/\\](.*[/\\])?motion[/\\]svelte\.ts/,
        /[/\\]motion-guard\.test\.ts$/,
    ];

    const excludes = [...defaultExcludes, ...(options.exclude || [])];

    return {
        name: "vite-plugin-svelte-motion-guard",

        transform(code, id) {
            const isExcluded = excludes.some((pattern) => {
                if (typeof pattern === "string") {
                    return id.includes(pattern);
                }
                return pattern.test(id);
            });

            if (isExcluded) {
                return null;
            }

            const forbiddenMatch = code.match(/from\s+['"]svelte\/(transition|animate|motion)['"]/);
            const forbiddenDynamicMatch = code.match(/import\s*\(\s*['"]svelte\/(transition|animate|motion)['"]\s*\)/);

            if (forbiddenMatch || forbiddenDynamicMatch) {
                const matchedPkg = (forbiddenMatch || forbiddenDynamicMatch)![1];

                this.error(
                    `Forbidden direct import from "svelte/${matchedPkg}" detected in ${id}.\n` +
                        `To ensure proper reduced motion support and global preference synchronization, ` +
                        `please import from the library wrappers instead of "svelte/${matchedPkg}".`
                );
            }

            return null;
        },
    };
}
