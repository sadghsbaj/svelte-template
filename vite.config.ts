import path from "node:path";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import UnoCSS from "@unocss/svelte-scoped/vite";
import transformerDirectives from "@unocss/transformer-directives";
import { playwright } from "@vitest/browser-playwright";
import { createHtmlPlugin } from "vite-plugin-html";
import { defineConfig } from "vitest/config";

import { debugGuardPlugin } from "./plugins/debug-guard.ts";
import { motionGuardPlugin } from "./plugins/motion-guard.ts";

export default defineConfig({
    server: {
        host: true,
        allowedHosts: true,
    },

    plugins: [
        debugGuardPlugin(),
        motionGuardPlugin(),
        ...createHtmlPlugin({
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                minifyCSS: true,
                minifyJS: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeAttributeQuotes: true,
                collapseBooleanAttributes: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
            },
        }).map((plugin) =>
            plugin && typeof plugin === "object" && "name" in plugin
                ? { ...plugin, apply: "build" }
                : plugin
        ),
        UnoCSS({
            injectReset: "@unocss/reset/tailwind.css",
            combine: true,
            cssFileTransformers: [transformerDirectives()],
        }),
        svelte({
            dynamicCompileOptions({ filename, compileOptions }) {
                if (!filename.includes("node_modules") && !compileOptions.runes) {
                    return { runes: true };
                }
            },
        }),
    ],

    resolve: {
        tsconfigPaths: true,
        alias: {
            $styles: path.resolve(__dirname, "./src/lib/shared/styles"),
            $components: path.resolve(__dirname, "./src/lib/shared/components"),
            $utils: path.resolve(__dirname, "./src/lib/shared/utils"),
            $transitions: path.resolve(__dirname, "./src/lib/shared/transitions"),
            $types: path.resolve(__dirname, "./src/lib/shared/types"),
            $attachments: path.resolve(__dirname, "./src/lib/shared/attachments"),
            $core: path.resolve(__dirname, "./src/lib/core"),
            $views: path.resolve(__dirname, "./src/lib/views"),
            $features: path.resolve(__dirname, "./src/lib/features"),
        },
    },

    optimizeDeps: {
        include: ["@lucide/svelte"],
        exclude: ["svelte", "svelte/animate", "svelte/motion", "svelte/transition"],
    },

    css: {
        transformer: "lightningcss",
    },

    build: {
        minify: "terser",
        terserOptions: {
            ecma: 2020,
            module: true,
            toplevel: true,
            compress: {
                drop_console: true,
                drop_debugger: true,
                passes: 3,
            },
            format: {
                comments: false,
            },
            mangle: true,
        },
    },

    test: {
        expect: { requireAssertions: true },
        projects: [
            {
                extends: "./vite.config.ts",
                test: {
                    name: "client",
                    include: ["src/**/*.svelte.{test,spec}.{js,ts}"],
                    exclude: ["src/lib/server/**"],
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright(),
                        screenshotDirectory: ".vitest-attachments/screenshots",
                        instances: [{ browser: "chromium" }],
                    },
                },
            },

            {
                extends: "./vite.config.ts",
                test: {
                    name: "server",
                    environment: "node",
                    include: [
                        "src/**/*.{test,spec}.{js,ts}",
                        "scripts/**/*.{test,spec}.{js,ts}",
                        "plugins/**/*.{test,spec}.{js,ts}",
                    ],
                    exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
                },
            },
        ],
    },
});
