import fs from "node:fs";
import path from "node:path";
import type { IndexHtmlTransformContext, ViteDevServer } from "vite";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { inlineHtmlPlugin } from "./inline-html.ts";

const TEST_DIR = path.resolve(__dirname, "__tmp_inline_test__");

function createTempFile(relPath: string, content: string): void {
    const fullPath = path.resolve(TEST_DIR, relPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content, "utf8");
}

const mockDevCtx: IndexHtmlTransformContext = {
    path: "/index.html",
    filename: "index.html",
    server: {} as ViteDevServer,
};

const mockBuildCtx: IndexHtmlTransformContext = {
    path: "/index.html",
    filename: "index.html",
};

describe("inlineHtmlPlugin", () => {
    beforeEach(() => {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
        fs.mkdirSync(TEST_DIR, { recursive: true });
    });

    afterEach(() => {
        if (fs.existsSync(TEST_DIR)) {
            fs.rmSync(TEST_DIR, { recursive: true, force: true });
        }
        vi.restoreAllMocks();
    });

    test("should return HTML unchanged if no placeholders exist", async () => {
        const plugin = inlineHtmlPlugin({ dir: "plugins/__tmp_inline_test__" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformIndexHtml = (plugin.transformIndexHtml as any).handler;

        const html = "<html><head><title>Test</title></head><body></body></html>";
        const result = await transformIndexHtml.call({}, html, mockBuildCtx);

        expect(result).toBe(html);
    });

    test("should inline CSS file", async () => {
        createTempFile("styles.css", "body { background-color: red; }");

        const plugin = inlineHtmlPlugin({ dir: "plugins/__tmp_inline_test__" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformIndexHtml = (plugin.transformIndexHtml as any).handler;

        const html = "<style>%inline:styles.css%</style>";
        const result = await transformIndexHtml.call({}, html, mockDevCtx);

        expect(result).toContain("body");
        expect(result).toContain("background-color: red");
    });

    test("should inline full TS file", async () => {
        createTempFile("app.ts", "const x: number = 42; window.__val = x;");

        const plugin = inlineHtmlPlugin({ dir: "plugins/__tmp_inline_test__" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformIndexHtml = (plugin.transformIndexHtml as any).handler;

        const html = "<script>%inline:app.ts%</script>";
        const result = await transformIndexHtml.call({}, html, mockDevCtx);

        expect(result).not.toContain(": number");
        expect(result).toContain("window.__val = x");
    });

    test("should inline named exports from a TS file separately", async () => {
        createTempFile(
            "loading.ts",
            `
            export function timeInit() {
                window.__start = performance.now();
            }
            export function core() {
                console.log("Loading core initialized");
            }
            `
        );

        const plugin = inlineHtmlPlugin({ dir: "plugins/__tmp_inline_test__" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformIndexHtml = (plugin.transformIndexHtml as any).handler;

        const headHtml = "<script>%inline:loading.ts#timeInit%</script>";
        const bodyHtml = "<script>%inline:loading.ts#core%</script>";

        const headResult = await transformIndexHtml.call({}, headHtml, mockDevCtx);
        const bodyResult = await transformIndexHtml.call({}, bodyHtml, mockDevCtx);

        expect(headResult).toContain("performance.now()");
        expect(headResult).not.toContain("Loading core initialized");
        expect(headResult).not.toContain("core");

        expect(bodyResult).toContain("Loading core initialized");
        expect(bodyResult).not.toContain("performance.now()");
    });

    test("should throw error if inline file does not exist", async () => {
        const plugin = inlineHtmlPlugin({ dir: "plugins/__tmp_inline_test__" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformIndexHtml = (plugin.transformIndexHtml as any).handler;

        const html = "<script>%inline:missing.ts%</script>";

        await expect(transformIndexHtml.call({}, html, mockDevCtx)).rejects.toThrow(
            "[inline-html] File not found"
        );
    });

    test("should throw error if named export does not exist in TS file", async () => {
        createTempFile("exports.ts", "export function valid() {}");

        const plugin = inlineHtmlPlugin({ dir: "plugins/__tmp_inline_test__" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformIndexHtml = (plugin.transformIndexHtml as any).handler;

        const html = "<script>%inline:exports.ts#nonExistent%</script>";

        await expect(transformIndexHtml.call({}, html, mockDevCtx)).rejects.toThrow(
            "[inline-html] Failed to bundle export"
        );
    });

    test("should throw error for unsupported file extensions", async () => {
        createTempFile("data.json", '{"key": "value"}');

        const plugin = inlineHtmlPlugin({ dir: "plugins/__tmp_inline_test__" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformIndexHtml = (plugin.transformIndexHtml as any).handler;

        const html = "<script>%inline:data.json%</script>";

        await expect(transformIndexHtml.call({}, html, mockDevCtx)).rejects.toThrow(
            "Unsupported file type"
        );
    });

    test("should minify in build command mode", async () => {
        createTempFile(
            "verbose.ts",
            `
            function longFunctionName() {
                const unusedVariable = "hello world";
                console.log(unusedVariable);
            }
            longFunctionName();
            `
        );

        const plugin = inlineHtmlPlugin({ dir: "plugins/__tmp_inline_test__" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformIndexHtml = (plugin.transformIndexHtml as any).handler;

        const html = "<script>%inline:verbose.ts%</script>";

        const devResult = await transformIndexHtml.call({}, html, mockDevCtx);
        const buildResult = await transformIndexHtml.call({}, html, mockBuildCtx);

        expect(buildResult.length).toBeLessThan(devResult.length);
    });

    test("should inline via plugin.transform hook for .html files", async () => {
        createTempFile("styles.css", "h1 { color: blue; }");

        const plugin = inlineHtmlPlugin({ dir: "plugins/__tmp_inline_test__" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transformHook = (plugin as any).transform;

        const html = "<style>%inline:styles.css%</style>";
        const result = await transformHook.call({}, html, "index.html");

        expect(result).toBeDefined();
        expect(result.code).toContain("h1");
        expect(result.code).toContain("color: blue");
    });
});
