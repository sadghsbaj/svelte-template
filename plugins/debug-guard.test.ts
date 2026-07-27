import fs from "node:fs";
import { afterEach, describe, expect, test, vi } from "vitest";

import { debugGuardPlugin } from "./debug-guard.ts";

describe("debugGuardPlugin", () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    test("should ignore virtual modules and queries", () => {
        const plugin = debugGuardPlugin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transform = plugin.transform as any;

        expect(transform.call({}, "", "\0virtual:module")).toBeNull();
        expect(transform.call({}, "", "src/App.svelte?svelte&type=style")).toBeNull();
    });

    test("should ignore default excluded files", () => {
        const plugin = debugGuardPlugin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transform = plugin.transform as any;

        expect(transform.call({}, "", "node_modules/some-lib/index.js")).toBeNull();
        expect(transform.call({}, "", "uno.config.ts")).toBeNull();
        expect(transform.call({}, "", "plugins/debug-guard.ts")).toBeNull();
        expect(transform.call({}, "", "plugins/debug-guard.test.ts")).toBeNull();
    });

    test("should ignore custom excluded files", () => {
        const plugin = debugGuardPlugin({ exclude: ["src/ignored.ts"] });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transform = plugin.transform as any;

        expect(transform.call({}, "", "src/ignored.ts")).toBeNull();
    });

    test("should detect debug-border in scanned files and collect warnings", () => {
        const plugin = debugGuardPlugin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transform = plugin.transform as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const closeBundle = plugin.closeBundle as any;

        vi.spyOn(fs, "readFileSync").mockReturnValue(`<div class="debug-border"></div>`);

        expect(transform.call({}, "", "src/components/Test.svelte")).toBeNull();

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        closeBundle.call({});

        expect(warnSpy).toHaveBeenCalled();
        expect(warnSpy.mock.calls[0][0]).toContain("debug-border");
    });

    test("should detect numbered debug-border variant in scanned files", () => {
        const plugin = debugGuardPlugin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transform = plugin.transform as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const closeBundle = plugin.closeBundle as any;

        vi.spyOn(fs, "readFileSync").mockReturnValue(`<div class="debug-border-2"></div>`);

        expect(transform.call({}, "", "src/components/Test.svelte")).toBeNull();

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        closeBundle.call({});

        expect(warnSpy).toHaveBeenCalled();
        expect(warnSpy.mock.calls[0][0]).toContain("debug-border-2");
    });

    test("should not emit warnings if no debug classes were detected", () => {
        const plugin = debugGuardPlugin();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const transform = plugin.transform as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const closeBundle = plugin.closeBundle as any;

        vi.spyOn(fs, "readFileSync").mockReturnValue(`<div class="flex flex-col"></div>`);

        transform.call({}, "", "src/components/Clean.svelte");

        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
        closeBundle.call({});

        expect(warnSpy).not.toHaveBeenCalled();
    });
});
