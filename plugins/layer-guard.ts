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

function stripJsonComments(jsonc: string): string {
    return jsonc.replaceAll(
        /("(?:[^\\"]|\\.)*")|(?:\/\*[\s\S]*?\*\/|\/\/[^\r\n]*)/g,
        (_match, group1: string | undefined) => group1 ?? ""
    );
}

function loadTsconfigPaths(): Record<string, string> {
    try {
        const tsconfigPath = path.resolve(process.cwd(), "tsconfig.app.json");
        if (!fs.existsSync(tsconfigPath)) return {};

        const raw = fs.readFileSync(tsconfigPath, "utf8");
        const cleaned = stripJsonComments(raw);
        const json = JSON.parse(cleaned);

        const paths: Record<string, string[]> = json.compilerOptions?.paths || {};
        const aliasMap: Record<string, string> = {};

        for (const [aliasPattern, targetArray] of Object.entries(paths)) {
            if (!targetArray || targetArray.length === 0) continue;

            const cleanAlias = aliasPattern.replaceAll(/\/\*$/g, "");
            const cleanTarget = targetArray[0].replaceAll(/^\.\//g, "").replaceAll(/\/\*$/g, "");

            aliasMap[cleanAlias] = cleanTarget;
        }

        const sortedAliasMap: Record<string, string> = {};
        const sortedEntries = Object.entries(aliasMap).toSorted((a, b) => b[0].length - a[0].length);
        for (const [key, val] of sortedEntries) {
            sortedAliasMap[key] = val;
        }

        return sortedAliasMap;
    } catch {
        return {};
    }
}

const ALIAS_MAP = loadTsconfigPaths();

const MAX_NUMERIC_Z = 9999;

function extractImports(code: string): Map<string, string> {
    const importMap = new Map<string, string>();
    const cleanCode = stripJsonComments(code);

    const importBlockRegex = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]/g;

    let match: RegExpExecArray | null;
    while ((match = importBlockRegex.exec(cleanCode)) !== null) {
        const [, clause, importPath] = match;
        if (!clause || !importPath) continue;

        const trimmed = clause.trim();

        // 1. Default import: e.g. "FloatingNavbar" or "FloatingNavbar, { Bar }"
        const defaultMatch = trimmed.match(/^([A-Za-z0-9_$]+)/);
        if (defaultMatch && defaultMatch[1] !== "type" && defaultMatch[1] !== "{") {
            importMap.set(defaultMatch[1], importPath);
        }

        // 2. Named imports: e.g. "{ FloatingNavbar, Bar as Baz }"
        const namedMatch = trimmed.match(/\{([\s\S]*?)\}/);
        if (namedMatch) {
            const specifiers = namedMatch[1].split(",");
            for (const spec of specifiers) {
                const parts = spec.trim().split(/\s+as\s+/);
                const localName = parts.at(-1)?.trim();
                if (localName && localName !== "type") {
                    importMap.set(localName, importPath);
                }
            }
        }
    }

    return importMap;
}

function resolveImportPath(importPath: string, currentFileId: string): string {
    let baseResolved = "";
    const absCurrentFile = path.isAbsolute(currentFileId)
        ? currentFileId
        : path.resolve(process.cwd(), currentFileId);

    if (importPath.startsWith(".")) {
        baseResolved = path.resolve(path.dirname(absCurrentFile), importPath);
    } else {
        for (const [alias, dir] of Object.entries(ALIAS_MAP)) {
            if (importPath === alias) {
                baseResolved = path.join(process.cwd(), dir);
                break;
            }
            if (importPath.startsWith(`${alias}/`)) {
                const relPath = importPath.slice(alias.length + 1);
                baseResolved = path.join(process.cwd(), dir, relPath);
                break;
            }
        }
    }

    if (!baseResolved) return "";

    // Check directly or append extensions (.svelte, .ts, /index.svelte, /index.ts)
    const candidates = [
        baseResolved,
        `${baseResolved}.svelte`,
        `${baseResolved}.ts`,
        path.join(baseResolved, "index.svelte"),
        path.join(baseResolved, "index.ts"),
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
            return candidate;
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

interface PluginContextLike {
    addWatchFile?: (file: string) => void;
}

function checkChildComponent(
    compName: string,
    importMap: Map<string, string>,
    id: string,
    onError: (msg: string) => void,
    pluginContext?: PluginContextLike
): void {
    const rawImportPath = importMap.get(compName);
    if (!rawImportPath) return;

    const resolvedPath = resolveImportPath(rawImportPath, id);
    if (!resolvedPath) return;

    if (typeof pluginContext?.addWatchFile === "function") {
        pluginContext.addWatchFile(resolvedPath);
    }

    try {
        const childCode = fs.readFileSync(resolvedPath, "utf8");
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

function processChildTags(
    block: string,
    importMap: Map<string, string>,
    id: string,
    onError: (msg: string) => void,
    pluginContext?: PluginContextLike
): void {
    const childComponentMatches = block.match(/<([A-Z][A-Za-z0-9_]*)\b/g);
    if (!childComponentMatches) return;

    for (const rawTag of childComponentMatches) {
        const compName = rawTag.slice(1);
        if (compName !== "AppLayer") {
            checkChildComponent(compName, importMap, id, onError, pluginContext);
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

            const importMap = extractImports(code);

            // eslint-disable-next-line unicorn/no-this-outside-of-class
            const ctx = this as PluginContextLike & { error?: (msg: string) => never };

            const onError = (msg: string): void => {
                if (typeof ctx.error === "function") {
                    ctx.error(msg);
                } else {
                    throw new TypeError(msg);
                }
            };

            for (const block of appLayerBlocks) {
                checkZIndex(block, id, onError);
                processChildTags(block, importMap, id, onError, ctx);
            }

            return null;
        },
    };
}
