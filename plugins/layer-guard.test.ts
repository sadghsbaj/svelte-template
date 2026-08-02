import { describe, expect, test } from "vitest";

import { layerGuardPlugin } from "./layer-guard.ts";

describe("layerGuardPlugin", () => {
    const plugin = layerGuardPlugin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transform = plugin.transform as any;

    test("should pass for code without AppLayer", () => {
        const code = `import { Button } from "$components/Button.svelte";`;
        const context = {
            error(msg: string) {
                throw new Error(msg);
            },
        };
        expect(transform.call(context, code, "src/App.svelte")).toBeNull();
    });

    test("should ignore excluded files", () => {
        const code = `<AppLayer><MyComp /></AppLayer>`;
        const context = {
            error(msg: string) {
                throw new Error(msg);
            },
        };
        expect(transform.call(context, code, "node_modules/SomeComp.svelte")).toBeNull();
    });

    test("should pass when rendered child component includes layerAttach directive", () => {
        const code = `
            import PerformanceHost from "$core/_system/performance/PerformanceHost.svelte";
            <AppLayer layer="perf" z="top-layer">
                <PerformanceHost />
            </AppLayer>
        `;
        const context = {
            error(msg: string) {
                throw new Error(msg);
            },
        };
        expect(transform.call(context, code, "src/App.svelte")).toBeNull();
    });

    test("should throw error for invalid z-index numeric range", () => {
        const code = `
            import PerformanceHost from "$core/_system/performance/PerformanceHost.svelte";
            <AppLayer layer="perf" z={15000}>
                <PerformanceHost />
            </AppLayer>
        `;
        const context = {
            error(msg: string) {
                throw new Error(msg);
            },
        };
        expect(() => transform.call(context, code, "src/App.svelte")).toThrow(
            "Invalid z-index (15000)"
        );
    });

    test("should throw error for invalid z-index string value", () => {
        const code = `
            import PerformanceHost from "$core/_system/performance/PerformanceHost.svelte";
            <AppLayer layer="perf" z="super-top">
                <PerformanceHost />
            </AppLayer>
        `;
        const context = {
            error(msg: string) {
                throw new Error(msg);
            },
        };
        expect(() => transform.call(context, code, "src/App.svelte")).toThrow(
            "Invalid z-index (super-top)"
        );
    });
});
