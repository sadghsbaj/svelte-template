/**
 * @file layer-guard.ts
 * Vite plugin to enforce layerAttach usage on overlay components rendered inside AppLayer.
 *
 * This compiler-level guard inspects Svelte source files during development and build.
 * When an <AppLayer> component tag is detected, it resolves the imported child components
 * and verifies that the child component source contains `layerAttach`. This guarantees that
 * all layer overlays correctly register z-index, teleportation, and active state tracking.
 */

import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export interface LayerGuardOptions {
    /** Custom paths or regex patterns to exclude from the check. */
    exclude?: (string | RegExp)[];
}

const ALIAS_MAP: Record<string, string> = {
    $core: "src/lib/core",
    $modules: "src/lib/modules",
    $views: "src/lib/views",
    $features: "src/lib/features",
    $components: "src/lib/shared/components",
    $utils: "src/lib/shared/utils",
};

function resolveImportPath(importPath: string, currentFileId: string): string {
    if (importPath.startsWith(".")) {
        const resolved = path.resolve(path.dirname(currentFileId), importPath);
        return resolved.endsWith(".svelte") ? resolved : `${resolved}.svelte`;
    }

    for (const [alias, dir] of Object.entries(ALIAS_MAP)) {
        if (importPath.startsWith(alias)) {
            const relPath = importPath.slice(alias.length);
            const resolved = path.resolve(process.cwd(), dir + relPath);
            return resolved.endsWith(".svelte") ? resolved : `${resolved}.svelte`;
        }
    }

    return "";
}

function checkChildComponent(
    compName: string,
    code: string,
    id: string,
    onError: (msg: string) => void
): void {
    if (compName === "AppLayer") return;

    // Locate the import statement for this component in the current file
    const importRegex = new RegExp(
        String.raw`import\s+${compName}\s+from\s+['"]([^'"]+)['"]`
    );
    const importMatch = code.match(importRegex);
    if (!importMatch) return;

    const resolvedPath = resolveImportPath(importMatch[1], id);
    if (!resolvedPath || !fs.existsSync(resolvedPath)) return;

    try {
        const childCode = fs.readFileSync(resolvedPath, "utf8");
        const hasLayerAttach =
            childCode.includes("layerAttach") || childCode.includes("layer.context");

        if (!hasLayerAttach) {
            onError(
                `Missing {@attach layerAttach} in overlay component "<${compName} />" (${path.basename(resolvedPath)}) ` +
                    `rendered inside <AppLayer> in ${path.basename(id)}.\n` +
                    `To ensure proper z-index, teleportation, and active layer tracking, ` +
                    `the root element of "<${compName} />" must include {@attach layerAttach}.`
            );
        }
    } catch (error) {
        if (error && typeof error === "object" && "message" in error) {
            throw error;
        }
    }
}

export function layerGuardPlugin(options: LayerGuardOptions = {}): Plugin {
    const defaultExcludes = [
        /[/\\]node_modules[/\\]/,
        /[/\\]layer-guard(\.test)?\.ts$/,
    ];

    const excludes = [...defaultExcludes, ...(options.exclude || [])];

    return {
        name: "vite-plugin-svelte-layer-guard",

        transform(code, id) {
            if (id.startsWith("\0") || id.includes("?")) return null;

            const isExcluded = excludes.some((pattern) => {
                if (typeof pattern === "string") return id.includes(pattern);
                return pattern.test(id);
            });

            if (isExcluded) return null;

            // Check if the current file uses <AppLayer>
            if (!code.includes("<AppLayer")) return null;

            const appLayerBlocks = code.match(/<AppLayer[\s\S]*?<\/AppLayer>/g);
            if (!appLayerBlocks) return null;

            const onError = (msg: string) => {
                // eslint-disable-next-line unicorn/no-this-outside-of-class
                this.error(msg);
            };

            for (const block of appLayerBlocks) {
                const childComponentMatches = block.match(/<([A-Z][A-Za-z0-9_]*)\b/g);
                if (!childComponentMatches) continue;

                for (const rawTag of childComponentMatches) {
                    const compName = rawTag.slice(1);
                    checkChildComponent(compName, code, id, onError);
                }
            }

            return null;
        },
    };
}
