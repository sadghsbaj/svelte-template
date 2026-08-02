/**
 * @file layer-guard.ts
 * Vite plugin to enforce layerAttach usage on overlay components rendered inside AppLayer
 * and validate z-index prop values at compile time.
 *
 * This compiler-level guard inspects Svelte source files during development and build.
 * When an <AppLayer> component tag is detected, it validates the z-index prop range (0-9999 or "top-layer")
 * and verifies that child overlay components contain `{@attach layerAttach}`.
 */

import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export interface LayerGuardOptions {
    /** Custom paths or regex patterns to exclude from the check. */
    exclude?: (string | RegExp)[];
}

function loadTsconfigPaths(): Record<string, string> {
    try {
        const tsconfigPath = path.resolve(process.cwd(), "tsconfig.app.json");
        if (!fs.existsSync(tsconfigPath)) return {};

        const raw = fs.readFileSync(tsconfigPath, "utf8");
        // Strip single-line and multi-line comments from JSONC tsconfig files
        const cleaned = raw.replaceAll(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*/g, "$1");
        const json = JSON.parse(cleaned);

        const paths: Record<string, string[]> = json.compilerOptions?.paths || {};
        const aliasMap: Record<string, string> = {};

        for (const [aliasPattern, targetArray] of Object.entries(paths)) {
            if (!targetArray || targetArray.length === 0) continue;

            const cleanAlias = aliasPattern.replaceAll(/\/\*$/g, "");
            const cleanTarget = targetArray[0].replaceAll(/^\.\//g, "").replaceAll(/\/\*$/g, "");

            aliasMap[cleanAlias] = cleanTarget;
        }

        return aliasMap;
    } catch {
        return {};
    }
}

const ALIAS_MAP = loadTsconfigPaths();

const MAX_NUMERIC_Z = 9999;

function resolveImportPath(importPath: string, currentFileId: string): string {
    if (importPath.startsWith(".")) {
        const resolved = path.resolve(path.dirname(currentFileId), importPath);
        return resolved.endsWith(".svelte") ? resolved : `${resolved}.svelte`;
    }

    for (const [alias, dir] of Object.entries(ALIAS_MAP)) {
        if (importPath === alias || importPath.startsWith(`${alias}/`)) {
            const relPath = importPath.slice(alias.length);
            const resolved = path.resolve(process.cwd(), dir + relPath);
            return resolved.endsWith(".svelte") ? resolved : `${resolved}.svelte`;
        }
    }

    return "";
}

function checkZIndex(block: string, id: string, onError: (msg: string) => void): void {
    const zMatch = block.match(/\bz=(?:["']([^"']+)["']|\{([^}]+)\})/);
    if (!zMatch) return;

    const rawZ = (zMatch[1] ?? zMatch[2] ?? "").trim();
    if (!rawZ) return;

    if (["top-layer", "'top-layer'", '"top-layer"'].includes(rawZ)) return;

    const numZ = Number(rawZ);
    if (Number.isNaN(numZ) || !Number.isSafeInteger(numZ) || numZ < 0 || numZ > MAX_NUMERIC_Z) {
        onError(
            `Invalid z-index (${rawZ}) on <AppLayer> in ${path.basename(id)}.\n` +
                `Numeric z must be an integer between 0 and ${MAX_NUMERIC_Z}. Use z="top-layer" for 10000.`
        );
    }
}

function checkChildComponent(
    compName: string,
    code: string,
    id: string,
    onError: (msg: string) => void
): void {
    if (compName === "AppLayer") return;

    // Locate the import statement for this component in the current file
    const importRegex = new RegExp(String.raw`import\s+${compName}\s+from\s+['"]([^'"]+)['"]`);
    const importMatch = code.match(importRegex);
    if (!importMatch) return;

    const resolvedPath = resolveImportPath(importMatch[1], id);
    if (!resolvedPath || !fs.existsSync(resolvedPath)) return;

    try {
        const childCode = fs.readFileSync(resolvedPath, "utf8");
        // Verify that layerAttach is actually attached to an element in the template ({@attach layerAttach})
        const hasAttachDirective = /@attach\s+layerAttach\b/.test(childCode);

        if (!hasAttachDirective) {
            onError(
                `Missing {@attach layerAttach} directive in overlay component "<${compName} />" (${path.basename(resolvedPath)}) ` +
                    `rendered inside <AppLayer> in ${path.basename(id)}.\n` +
                    `To ensure proper z-index, teleportation, and active layer tracking, ` +
                    `an element inside "<${compName} />" must use {@attach layerAttach}.`
            );
        }
    } catch (error) {
        if (error && typeof error === "object" && "message" in error) {
            throw error;
        }
    }
}

export function layerGuardPlugin(options: LayerGuardOptions = {}): Plugin {
    const defaultExcludes = [/[/\\]node_modules[/\\]/, /[/\\]layer-guard(\.test)?\.ts$/];

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
                checkZIndex(block, id, onError);

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
