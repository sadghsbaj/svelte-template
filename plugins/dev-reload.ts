/**
 * @file dev-reload.ts
 * Vite plugin for automatic dev server restarts and HMR module reloads on watched file changes.
 *
 * Automatically restarts the Vite dev server when configuration files (e.g., uno.config.ts, uno/*)
 * are modified, and triggers module reloads when dynamic preview files (e.g., src/lib/previews/components/*)
 * are added or deleted.
 */

import path from "node:path";
import type { Plugin, ViteDevServer } from "vite";

export interface DevReloadOptions {
    /**
     * Paths or globs relative to workspace root that trigger a full Vite dev server restart on change/add/delete.
     * (e.g., ["uno.config.ts", "uno/"])
     */
    restartPaths?: string[];

    /**
     * Paths or globs relative to workspace root that trigger a module reload of ComponentsView on add/delete.
     * (e.g., ["src/lib/previews/components/"])
     */
    reloadPaths?: string[];

    /**
     * Target Svelte view component to reload when a file in reloadPaths is added or removed.
     * Defaults to "src/lib/previews/ComponentsView.svelte".
     */
    targetViewPath?: string;

    /**
     * Debounce delay in milliseconds before executing a restart or reload (default: 150ms).
     */
    debounceMs?: number;
}

function normalizePath(filePath: string): string {
    return filePath.replaceAll("\\", "/");
}

function matchesAnyPath(filePath: string, paths: string[]): boolean {
    const normalizedFile = normalizePath(filePath);
    return paths.some((p) => {
        const normalizedP = normalizePath(p);
        return normalizedFile.includes(normalizedP) || normalizedFile.endsWith(normalizedP);
    });
}

export function devReloadPlugin(options: DevReloadOptions = {}): Plugin {
    const {
        restartPaths = ["uno.config.ts", "uno/"],
        reloadPaths = ["src/lib/previews/components/"],
        targetViewPath = "src/lib/previews/ComponentsView.svelte",
        debounceMs = 200,
    } = options;

    let restartTimer: ReturnType<typeof setTimeout> | null = null;
    let reloadTimer: ReturnType<typeof setTimeout> | null = null;

    return {
        name: "vite-plugin-dev-reload",
        apply: "serve", // Only run during dev server mode

        configureServer(server: ViteDevServer) {
            const handleRestart = (file: string): void => {
                if (!matchesAnyPath(file, restartPaths)) return;

                if (restartTimer) clearTimeout(restartTimer);
                restartTimer = setTimeout(() => {
                    queueMicrotask(async () => {
                        server.config.logger.info(
                            `\u{1B}[36m⚡ [DEV-RELOAD]\u{1B}[0m Config change detected in ${path.basename(file)} - Restarting Vite Dev Server...`,
                            { timestamp: true }
                        );
                        try {
                            await server.restart();
                        } catch (error) {
                            server.config.logger.error(
                                `\u{1B}[31m🚨 [DEV-RELOAD] Failed to restart server:\u{1B}[0m ${String(error)}`
                            );
                        }
                    });
                }, debounceMs);
            };

            const handleReload = (file: string): void => {
                if (!matchesAnyPath(file, reloadPaths)) return;

                if (reloadTimer) clearTimeout(reloadTimer);
                reloadTimer = setTimeout(async () => {
                    server.config.logger.info(
                        `\u{1B}[36m⚡ [DEV-RELOAD]\u{1B}[0m Preview component change in ${path.basename(file)} - Reloading Component Views...`,
                        { timestamp: true }
                    );

                    const resolvedTarget = path.resolve(targetViewPath);
                    const targetModule = server.moduleGraph.getModuleById(resolvedTarget);

                    if (targetModule) {
                        try {
                            await server.reloadModule(targetModule);
                        } catch {
                            server.ws.send({ type: "full-reload" });
                        }
                    } else {
                        server.ws.send({ type: "full-reload" });
                    }
                }, debounceMs);
            };

            // Watch file changes
            server.watcher.on("change", (file) => {
                handleRestart(file);
            });

            // Watch file creation
            server.watcher.on("add", (file) => {
                handleRestart(file);
                handleReload(file);
            });

            // Watch file deletion
            server.watcher.on("unlink", (file) => {
                handleRestart(file);
                handleReload(file);
            });
        },
    };
}
