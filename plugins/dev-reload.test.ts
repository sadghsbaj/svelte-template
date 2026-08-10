import { describe, expect, test, vi } from "vitest";

import { devReloadPlugin } from "./dev-reload.ts";

describe("devReloadPlugin", () => {
    test("should return correct plugin metadata", () => {
        const plugin = devReloadPlugin();
        expect(plugin.name).toBe("vite-plugin-dev-reload");
        expect(plugin.apply).toBe("serve");
    });

    test("should attach watcher listeners on server configuration", () => {
        const plugin = devReloadPlugin();
        const mockWatcher = {
            on: vi.fn(),
        };
        const mockServer = {
            config: { logger: { info: vi.fn(), error: vi.fn() } },
            watcher: mockWatcher,
            restart: vi.fn().mockResolvedValue(undefined),
            reloadModule: vi.fn().mockResolvedValue(undefined),
            ws: { send: vi.fn() },
            moduleGraph: { getModuleById: vi.fn() },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (plugin as any).configureServer(mockServer);

        expect(mockWatcher.on).toHaveBeenCalledWith("change", expect.any(Function));
        expect(mockWatcher.on).toHaveBeenCalledWith("add", expect.any(Function));
        expect(mockWatcher.on).toHaveBeenCalledWith("unlink", expect.any(Function));
    });

    test("should trigger server restart on uno.config.ts change", async () => {
        vi.useFakeTimers();
        const plugin = devReloadPlugin({ debounceMs: 50 });
        const mockRestart = vi.fn().mockResolvedValue(undefined);
        const listeners: Record<string, (file: string) => void> = {};

        const mockServer = {
            config: { logger: { info: vi.fn(), error: vi.fn() } },
            watcher: {
                on: (event: string, fn: (file: string) => void) => {
                    listeners[event] = fn;
                },
            },
            restart: mockRestart,
            reloadModule: vi.fn().mockResolvedValue(undefined),
            ws: { send: vi.fn() },
            moduleGraph: { getModuleById: vi.fn() },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (plugin as any).configureServer(mockServer);

        listeners.change("uno.config.ts");
        vi.advanceTimersByTime(60);

        expect(mockRestart).toHaveBeenCalledTimes(1);
        vi.useRealTimers();
    });

    test("should trigger HMR reload on component preview file addition", async () => {
        vi.useFakeTimers();
        const plugin = devReloadPlugin({ debounceMs: 50 });
        const mockReloadModule = vi.fn().mockResolvedValue(undefined);
        const listeners: Record<string, (file: string) => void> = {};
        const mockTargetModule = { id: "ComponentsView.svelte" };

        const mockServer = {
            config: { logger: { info: vi.fn(), error: vi.fn() } },
            watcher: {
                on: (event: string, fn: (file: string) => void) => {
                    listeners[event] = fn;
                },
            },
            restart: vi.fn().mockResolvedValue(undefined),
            reloadModule: mockReloadModule,
            ws: { send: vi.fn() },
            moduleGraph: {
                getModuleById: vi.fn().mockReturnValue(mockTargetModule),
            },
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (plugin as any).configureServer(mockServer);

        listeners.add("src/lib/previews/components/NewPreview.svelte");
        vi.advanceTimersByTime(60);

        expect(mockReloadModule).toHaveBeenCalledWith(mockTargetModule);
        vi.useRealTimers();
    });
});
