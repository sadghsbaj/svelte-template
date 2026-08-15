import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

import { bundleStatsPlugin } from "./bundle-stats.ts";

describe("bundleStatsPlugin", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("should have correct plugin metadata", () => {
        const plugin = bundleStatsPlugin();
        expect(plugin.name).toBe("vite-plugin-bundle-stats");
        expect(plugin.apply).toBe("build");
    });

    test("should set projectRoot on configResolved", () => {
        const plugin = bundleStatsPlugin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const configResolved = plugin.configResolved as any;

        configResolved?.call({}, { root: "/custom/root" });
        expect(typeof configResolved).toBe("function");
    });

    test("should generate bundle_stats.md with assets, vendor packages, and app code breakdowns", () => {
        const plugin = bundleStatsPlugin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const configResolved = plugin.configResolved as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const generateBundle = plugin.generateBundle as any;

        const fakeRoot = "/test/project";
        configResolved?.call({}, { root: fakeRoot });

        let writtenFilePath = "";
        let writtenContent = "";

        vi.spyOn(fs, "mkdirSync").mockImplementation(() => {});
        vi.spyOn(fs, "writeFileSync").mockImplementation((targetPath, content) => {
            writtenFilePath = String(targetPath);
            writtenContent = String(content);
        });

        // Mock bundle structure
        const mockBundle = {
            "assets/index.js": {
                type: "chunk",
                fileName: "assets/index.js",
                code: "console.log('hello world');",
                modules: {
                    "/test/project/node_modules/svelte/src/index.js": {
                        renderedLength: 5000,
                    },
                    "/test/project/node_modules/@lucide/svelte/dist/index.js": {
                        renderedLength: 2000,
                    },
                    "/test/project/src/lib/core/index.ts": {
                        renderedLength: 3000,
                    },
                    "/test/project/src/lib/shared/utils.ts": {
                        renderedLength: 1000,
                    },
                    "\0vite/preload-helper.js": {
                        renderedLength: 200,
                    },
                },
            },
            "assets/style.css": {
                type: "asset",
                fileName: "assets/style.css",
                source: ".test { color: red; }",
            },
            "index.html": {
                type: "asset",
                fileName: "index.html",
                source: Buffer.from("<!DOCTYPE html><html></html>"),
            },
        };

        generateBundle?.call({}, {}, mockBundle);

        expect(writtenFilePath).toBe(path.resolve(fakeRoot, "dist", "analysis", "bundle_stats.md"));
        expect(writtenContent).toContain("# 📦 Bundle Size Analysis");
        expect(writtenContent).toContain("## 📄 Output Assets & Chunks");
        expect(writtenContent).toContain("`assets/index.js`");
        expect(writtenContent).toContain("`assets/style.css`");
        expect(writtenContent).toContain("`index.html`");

        // Vendor Breakdown Checks
        expect(writtenContent).toContain("## 📚 Vendor Dependencies (`node_modules`)");
        expect(writtenContent).toContain("`svelte`");
        expect(writtenContent).toContain("`@lucide/svelte`");

        // App Code Breakdown Checks
        expect(writtenContent).toContain("## 🚀 Application Code (`src/`)");
        expect(writtenContent).toContain("`src/lib/core`");
        expect(writtenContent).toContain("`src/lib/shared`");
    });

    test("should handle empty bundle and empty modules gracefully", () => {
        const plugin = bundleStatsPlugin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const generateBundle = plugin.generateBundle as any;

        let writtenContent = "";
        vi.spyOn(fs, "mkdirSync").mockImplementation(() => {});
        vi.spyOn(fs, "writeFileSync").mockImplementation((_, content) => {
            writtenContent = String(content);
        });

        generateBundle?.call({}, {}, {});

        expect(writtenContent).toContain("# 📦 Bundle Size Analysis");
        expect(writtenContent).toContain("Total Output Size**: `0 B`");
        expect(writtenContent).toContain("| _None_ | 0 B | 0.0 % |");
    });
});
