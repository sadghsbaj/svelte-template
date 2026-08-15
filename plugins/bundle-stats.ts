/**
 * @file bundle-stats.ts
 * Vite plugin to generate a structured markdown report (dist/analysis/bundle_stats.md)
 * analyzing output assets, vendor packages (node_modules), and application code modules.
 */

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import type { Plugin } from "vite";

interface RenderedModuleInfo {
    renderedLength?: number;
}

interface ChunkInfo {
    type: "chunk";
    code: string;
    fileName: string;
    modules?: Record<string, RenderedModuleInfo>;
}

interface AssetInfo {
    type: "asset";
    fileName: string;
    source: string | Uint8Array;
}

function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "kB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const val = bytes / Math.pow(k, i);
    return `${val.toFixed(2)} ${sizes[i]}`;
}

function getGitInfo(): string {
    try {
        const hash = execSync("git rev-parse --short HEAD", {
            stdio: ["ignore", "pipe", "ignore"],
        })
            .toString()
            .trim();
        const branch = execSync("git rev-parse --abbrev-ref HEAD", {
            stdio: ["ignore", "pipe", "ignore"],
        })
            .toString()
            .trim();
        const isDirty =
            execSync("git status --porcelain", {
                stdio: ["ignore", "pipe", "ignore"],
            })
                .toString()
                .trim().length > 0;
        return `\`${hash}\` (branch: \`${branch}\`${isDirty ? ", dirty" : ", clean"})`;
    } catch {
        return "N/A";
    }
}

function extractVendorPackage(id: string): string | null {
    const normalized = id.replaceAll("\\", "/");
    const match = normalized.match(/\/node_modules\/((?:@[^/]+\/)?[^/]+)/);
    return match ? match[1] : null;
}

function extractAppGroup(id: string, projectRoot: string): string {
    const cleanId = id.replace(/^\0+/, "").trim();
    const normalized = path.relative(projectRoot, cleanId).replaceAll("\\", "/");
    const parts = normalized.split("/");

    if (parts[0] === "src" && parts[1] === "lib" && parts[2]) {
        return `src/lib/${parts[2]}`;
    }
    if (parts[0] === "src" && parts[1] === "lib") {
        return "src/lib";
    }
    if (parts[0] === "src") {
        return "src";
    }
    return parts[0] || "root";
}

function processChunkModules(
    modules: Record<string, RenderedModuleInfo>,
    projectRoot: string,
    vendorMap: Map<string, number>,
    appMap: Map<string, number>
): { vendorBytes: number; appBytes: number } {
    let vendorBytes = 0;
    let appBytes = 0;

    for (const [modId, modInfo] of Object.entries(modules)) {
        const rendered = modInfo.renderedLength || 0;
        if (rendered <= 0) continue;

        const vendorPkg = extractVendorPackage(modId);
        if (vendorPkg) {
            vendorMap.set(vendorPkg, (vendorMap.get(vendorPkg) || 0) + rendered);
            vendorBytes += rendered;
        } else {
            const appGroup = extractAppGroup(modId, projectRoot);
            appMap.set(appGroup, (appMap.get(appGroup) || 0) + rendered);
            appBytes += rendered;
        }
    }

    return { vendorBytes, appBytes };
}

export function bundleStatsPlugin(): Plugin {
    let projectRoot = process.cwd();

    return {
        name: "vite-plugin-bundle-stats",
        apply: "build",

        configResolved(config) {
            projectRoot = config.root || process.cwd();
        },

        generateBundle(_options, bundle) {
            const analysisDir = path.resolve(projectRoot, "dist", "analysis");
            fs.mkdirSync(analysisDir, { recursive: true });

            const assetsList: {
                fileName: string;
                type: string;
                rawBytes: number;
                gzipBytes: number;
            }[] = [];
            const vendorMap = new Map<string, number>();
            const appMap = new Map<string, number>();

            let totalRaw = 0;
            let totalGzip = 0;
            let totalVendorRendered = 0;
            let totalAppRendered = 0;

            for (const item of Object.values(bundle)) {
                let rawBytes = 0;
                let gzipBytes = 0;
                let type = "Asset";

                if (item.type === "chunk") {
                    const chunk = item as unknown as ChunkInfo;
                    type = "JavaScript";
                    const codeBuffer = Buffer.from(chunk.code, "utf8");
                    rawBytes = codeBuffer.length;
                    gzipBytes = zlib.gzipSync(codeBuffer).length;

                    if (chunk.modules) {
                        const { vendorBytes, appBytes } = processChunkModules(
                            chunk.modules,
                            projectRoot,
                            vendorMap,
                            appMap
                        );
                        totalVendorRendered += vendorBytes;
                        totalAppRendered += appBytes;
                    }
                } else if (item.type === "asset") {
                    const asset = item as unknown as AssetInfo;
                    const ext = path.extname(asset.fileName).toLowerCase();
                    if (ext === ".css") type = "CSS";
                    else if (ext === ".html") type = "HTML";
                    else if ([".png", ".jpg", ".jpeg", ".svg", ".ico", ".webp"].includes(ext))
                        type = "Image";
                    else if ([".woff2", ".woff", ".ttf", ".eot"].includes(ext)) type = "Font";

                    const sourceBuffer =
                        typeof asset.source === "string"
                            ? Buffer.from(asset.source, "utf8")
                            : Buffer.from(asset.source || new Uint8Array());
                    rawBytes = sourceBuffer.length;
                    gzipBytes = zlib.gzipSync(sourceBuffer).length;
                }

                totalRaw += rawBytes;
                totalGzip += gzipBytes;

                assetsList.push({
                    fileName: item.fileName,
                    type,
                    rawBytes,
                    gzipBytes,
                });
            }

            const sortedAssets = assetsList.toSorted((a, b) => b.rawBytes - a.rawBytes);
            const sortedVendors = [...vendorMap].toSorted((a, b) => b[1] - a[1]);
            const sortedApp = [...appMap].toSorted((a, b) => b[1] - a[1]);

            const now = new Date().toISOString().replaceAll("T", " ").slice(0, 19);
            const gitInfo = getGitInfo();

            const mdLines: string[] = [
                "# 📦 Bundle Size Analysis",
                "",
                `- **Git Commit**: ${gitInfo}`,
                `- **Generated At**: \`${now} UTC\``,
                `- **Total Output Size**: \`${formatBytes(totalRaw)}\` (Gzip: \`${formatBytes(totalGzip)}\`)`,
                `- **Visual Treemap**: [\`bundle_stats.html\`](./bundle_stats.html)`,
                "",
                "## 📄 Output Assets & Chunks",
                "",
                "| Output File | Type | Raw Size | Gzip Size |",
                "| :--- | :--- | :--- | :--- |",
            ];

            for (const asset of sortedAssets) {
                mdLines.push(
                    `| \`${asset.fileName}\` | ${asset.type} | ${formatBytes(asset.rawBytes)} | ${formatBytes(asset.gzipBytes)} |`
                );
            }

            mdLines.push(
                "",
                "## 📚 Vendor Dependencies (`node_modules`)",
                "",
                "| Package | Rendered Size | Share of Vendors |",
                "| :--- | :--- | :--- |"
            );

            if (sortedVendors.length > 0) {
                for (const [pkg, bytes] of sortedVendors) {
                    const share =
                        totalVendorRendered > 0
                            ? ((bytes / totalVendorRendered) * 100).toFixed(1)
                            : "0.0";
                    mdLines.push(`| \`${pkg}\` | ${formatBytes(bytes)} | ${share} % |`);
                }
            } else {
                mdLines.push("| _None_ | 0 B | 0.0 % |");
            }

            mdLines.push(
                "",
                "## 🚀 Application Code (`src/`)",
                "",
                "| Module / Directory Group | Rendered Size | Share of App Code |",
                "| :--- | :--- | :--- |"
            );

            if (sortedApp.length > 0) {
                for (const [group, bytes] of sortedApp) {
                    const share =
                        totalAppRendered > 0
                            ? ((bytes / totalAppRendered) * 100).toFixed(1)
                            : "0.0";
                    mdLines.push(`| \`${group}\` | ${formatBytes(bytes)} | ${share} % |`);
                }
            } else {
                mdLines.push("| _None_ | 0 B | 0.0 % |");
            }

            mdLines.push("");

            const mdContent = mdLines.join("\n");
            fs.writeFileSync(path.resolve(analysisDir, "bundle_stats.md"), mdContent, "utf8");
        },
    };
}
