/**
 * @file inline-html.ts
 * Vite plugin to inline TypeScript, JavaScript, and CSS files from an `inline/` directory
 * into `index.html` placeholders.
 *
 * Syntax:
 * - `%inline:filename.css%` - Inlines minified CSS into <style> tags
 * - `%inline:filename.ts%` - Inlines transpiled JS into <script> tags
 * - `%inline:filename.ts#exportName%` - Bundles and executes a specific named export
 */

import fs from "node:fs";
import path from "node:path";
import { transformWithOxc, type Plugin } from "vite";

export interface InlineHtmlOptions {
    /**
     * Root directory for inline files, relative to Vite root.
     * @default "inline"
     */
    dir?: string;
}

function minifyCss(css: string): string {
    return css
        .replaceAll(/\/\*[\s\S]*?\*\//g, "")
        .replaceAll(/\s+/g, " ")
        .replaceAll(/\s*([{}:;,])\s*/g, "$1")
        .trim();
}

function minifyJs(js: string): string {
    return js
        .replaceAll(/\/\/[^\n]*/g, "")
        .replaceAll(/\/\*[\s\S]*?\*\//g, "")
        .replaceAll(/\s+/g, " ")
        .replaceAll(/\s*([{}::;,=()+*/-])\s*/g, "$1")
        .trim();
}

function findEndIndex(result: string, startIndex: number, matchLength: number): number {
    let braceCount = 0;
    let startedBraces = false;
    for (let i = startIndex; i < result.length; i++) {
        if (result[i] === "{") {
            braceCount++;
            startedBraces = true;
        } else if (result[i] === "}") {
            braceCount--;
            if (startedBraces && braceCount === 0) {
                return i + 1;
            }
        } else if (result[i] === ";" && !startedBraces) {
            return i + 1;
        }
    }
    return startIndex + matchLength;
}

function stripOtherExports(code: string, targetExport: string): string {
    const exportRegex = /export\s+(?:async\s+)?(function|const|let|var|class)\s+([a-zA-Z0-9_]+)/g;
    let result = code;
    let match: RegExpExecArray | null;

    while ((match = exportRegex.exec(code)) !== null) {
        const fullMatch = match[0];
        const name = match[2];

        if (name !== targetExport) {
            const startIndex = result.indexOf(fullMatch);
            if (startIndex !== -1) {
                const endIndex = findEndIndex(result, startIndex, fullMatch.length);
                result = result.slice(0, startIndex) + result.slice(endIndex);
            }
        }
    }
    return result;
}

export function inlineHtmlPlugin(options: InlineHtmlOptions = {}): Plugin {
    const inlineDirName = options.dir || "inline";

    return {
        name: "vite-plugin-inline-html",
        enforce: "pre",

        configureServer(server) {
            const inlineDir = path.resolve(server.config.root, inlineDirName);
            if (fs.existsSync(inlineDir)) {
                server.watcher.add(inlineDir);
                server.watcher.on("change", (file) => {
                    if (file.startsWith(inlineDir)) {
                        server.ws.send({ type: "full-reload" });
                    }
                });
            }
        },

        transformIndexHtml: {
            order: "pre",
            async handler(html, ctx) {
                const isBuild = !ctx.server;
                const rootDir = ctx.server?.config?.root ?? process.cwd();
                const baseInlineDir = path.resolve(rootDir, inlineDirName);

                // Match %inline:path/to/file.ext% or %inline:path/to/file.ext#exportName%
                const pattern = /%inline:([a-zA-Z0-9_\-./]+)(?:#([a-zA-Z0-9_]+))?%/g;
                const matches = [...(html.matchAll(pattern) as unknown as Iterable<RegExpExecArray>)];

                if (matches.length === 0) return html;

                let resultHtml = html;

                for (const match of matches) {
                    const fullPlaceholder = match[0];
                    const fileRelPath = match[1];
                    const exportName = match[2];

                    const absolutePath = path.resolve(baseInlineDir, fileRelPath);

                    // Security check: ensure path is within baseInlineDir
                    if (!absolutePath.startsWith(baseInlineDir)) {
                        throw new Error(
                            `[inline-html] Security restriction: "${fileRelPath}" is outside of ${inlineDirName}/ directory.`
                        );
                    }

                    if (!fs.existsSync(absolutePath)) {
                        throw new Error(
                            `[inline-html] File not found: "${inlineDirName}/${fileRelPath}" (referenced by placeholder ${fullPlaceholder})`
                        );
                    }

                    let inlinedCode = "";

                    if (fileRelPath.endsWith(".css")) {
                        const rawCss = fs.readFileSync(absolutePath, "utf8");
                        inlinedCode = isBuild ? minifyCss(rawCss) : rawCss.trim();
                    } else if (fileRelPath.endsWith(".ts") || fileRelPath.endsWith(".js")) {
                        const rawCode = fs.readFileSync(absolutePath, "utf8");
                        let wrappedCode = rawCode;

                        if (exportName) {
                            // Check if the exportName exists in rawCode
                            const exportRegex = new RegExp(
                                String.raw`\bexport\s+(?:async\s+)?(?:function|const|let|var|class)\s+${exportName}\b|\bexport\s*\{[^}]*\b${exportName}\b`
                            );
                            if (!exportRegex.test(rawCode)) {
                                throw new Error(
                                    `[inline-html] Failed to bundle export "${exportName}" from "${inlineDirName}/${fileRelPath}": export not found.`
                                );
                            }

                            // Strip other unrequested exports
                            const codeWithoutOtherExports = stripOtherExports(rawCode, exportName);

                            // Strip export keyword for target export
                            const cleanedCode = codeWithoutOtherExports
                                .replaceAll(/\bexport\s+default\s+/g, "")
                                .replaceAll(
                                    /\bexport\s+(?:async\s+)?(function|const|let|var|class)\b/g,
                                    "$1"
                                )
                                .replaceAll(/export\s*\{[^}]*\};?/g, "");

                            wrappedCode = `(function() {\n${cleanedCode}\n  if (typeof ${exportName} === 'function') { ${exportName}(); }\n})();`;
                        }

                        const oxcResult = await transformWithOxc(wrappedCode, absolutePath, {
                            lang: fileRelPath.endsWith(".ts") ? "ts" : "js",
                        });

                        inlinedCode = isBuild ? minifyJs(oxcResult.code) : oxcResult.code.trim();
                    } else {
                        throw new Error(
                            `[inline-html] Unsupported file type for inline placeholder: "${fileRelPath}". Supported extensions: .ts, .js, .css`
                        );
                    }

                    resultHtml = resultHtml.replace(fullPlaceholder, () => inlinedCode);
                }

                return resultHtml;
            },
        },
    };
}
