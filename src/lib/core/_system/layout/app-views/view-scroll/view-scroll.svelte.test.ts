import { beforeEach, describe, expect, test } from "vitest";

import type { ViewsConfig } from "$core/_system/layout/app-views/types";

import { ViewScrollManager } from "./view-scroll";

describe("ViewScrollManager (Browser Client)", () => {
    type TestView = "home" | "stats" | "settings";

    let mockConfig: ViewsConfig<TestView>;

    beforeEach(() => {
        localStorage.clear();
        mockConfig = {
            persistKey: "test-app-views",
            scroll: {
                session: false,
                persist: false,
            },
            views: [
                { view: "home", label: "Home", parent: "root" },
                { view: "stats", label: "Stats", parent: "root" },
                { view: "settings", label: "Settings", parent: "root" },
            ],
        };
    });

    describe("Config Resolution (getResolvedScrollConfig)", () => {
        test("should return default false for session and persist when unconfigured", () => {
            const manager = new ViewScrollManager(
                (v) => mockConfig.views.find((x) => x.view === v),
                () => mockConfig
            );
            const resolved = manager.getResolvedScrollConfig("home");
            expect(resolved).toEqual({ session: false, persist: false });
        });

        test("should inherit global scroll configuration", () => {
            mockConfig.scroll = { session: true, persist: true };
            const manager = new ViewScrollManager(
                (v) => mockConfig.views.find((x) => x.view === v),
                () => mockConfig
            );
            const resolved = manager.getResolvedScrollConfig("home");
            expect(resolved).toEqual({ session: true, persist: true });
        });

        test("should allow per-view scroll override", () => {
            mockConfig.scroll = { session: true, persist: true };
            mockConfig.views = [
                { view: "home", parent: "root", scroll: { session: false } },
                { view: "stats", parent: "root", scroll: false },
                { view: "settings", parent: "root" },
            ];

            const manager = new ViewScrollManager(
                (v) => mockConfig.views.find((x) => x.view === v),
                () => mockConfig
            );

            expect(manager.getResolvedScrollConfig("home")).toEqual({
                session: false,
                persist: true,
            });
            expect(manager.getResolvedScrollConfig("stats")).toEqual({
                session: false,
                persist: false,
            });
            expect(manager.getResolvedScrollConfig("settings")).toEqual({
                session: true,
                persist: true,
            });
        });

        test("should disable persist if no persistKey is defined", () => {
            delete mockConfig.persistKey;
            mockConfig.scroll = { session: true, persist: true };

            const manager = new ViewScrollManager(
                (v) => mockConfig.views.find((x) => x.view === v),
                () => mockConfig
            );

            expect(manager.getResolvedScrollConfig("home")).toEqual({
                session: true,
                persist: false,
            });
        });
    });

    describe("Measuring, Saving & Restoring Scroll Position", () => {
        test("should not save when both session and persist are false", () => {
            const manager = new ViewScrollManager(
                (v) => mockConfig.views.find((x) => x.view === v),
                () => mockConfig
            );

            const mockEl = { scrollTop: 350, scrollHeight: 1200 } as HTMLElement;
            manager.measureAndSave(mockEl, "home");

            const restoreEl = { scrollTop: 0, scrollHeight: 1200 } as HTMLElement;
            manager.restoreScroll(restoreEl, "home");
            expect(restoreEl.scrollTop).toBe(0);
        });

        test("should save and restore position in session map", () => {
            mockConfig.scroll = { session: true };
            const manager = new ViewScrollManager(
                (v) => mockConfig.views.find((x) => x.view === v),
                () => mockConfig
            );

            const saveEl = { scrollTop: 450, scrollHeight: 1500 } as HTMLElement;
            manager.measureAndSave(saveEl, "home");

            const restoreEl = { scrollTop: 0, scrollHeight: 1500 } as HTMLElement;
            manager.restoreScroll(restoreEl, "home");
            expect(restoreEl.scrollTop).toBe(450);
        });

        test("should save and restore position via localStorage when persist is true", () => {
            mockConfig.scroll = { persist: true };
            const manager = new ViewScrollManager(
                (v) => mockConfig.views.find((x) => x.view === v),
                () => mockConfig
            );

            manager.savePosition("stats", { pos: 280, height: 900 });

            // Verify raw localStorage entry
            const rawStored = localStorage.getItem("test-app-views_scroll_state");
            expect(rawStored).toBeTruthy();
            expect(JSON.parse(rawStored ?? "{}")).toEqual({ stats: { pos: 280, height: 900 } });

            const restoreEl = { scrollTop: 0, scrollHeight: 900 } as HTMLElement;
            manager.restoreScroll(restoreEl, "stats");
            expect(restoreEl.scrollTop).toBe(280);
        });

        test("should respect height tolerance rule (Math.abs(current - saved) <= 3)", () => {
            mockConfig.scroll = { session: true };
            const manager = new ViewScrollManager(
                (v) => mockConfig.views.find((x) => x.view === v),
                () => mockConfig
            );

            manager.savePosition("home", { pos: 500, height: 1000 });

            // Within 3px tolerance (1002px vs 1000px): should restore
            const restoreElValid = { scrollTop: 0, scrollHeight: 1002 } as HTMLElement;
            manager.restoreScroll(restoreElValid, "home");
            expect(restoreElValid.scrollTop).toBe(500);

            // Exceeding 3px tolerance (1010px vs 1000px): should NOT restore
            const restoreElInvalid = { scrollTop: 0, scrollHeight: 1010 } as HTMLElement;
            manager.restoreScroll(restoreElInvalid, "home");
            expect(restoreElInvalid.scrollTop).toBe(0);
        });

        test("should handle null element gracefully", () => {
            mockConfig.scroll = { session: true };
            const manager = new ViewScrollManager(
                (v) => mockConfig.views.find((x) => x.view === v),
                () => mockConfig
            );

            expect(() => manager.measureAndSave(null, "home")).not.toThrow();
            expect(() => manager.restoreScroll(null, "home")).not.toThrow();
        });

        test("should handle primitive or non-object localStorage values gracefully without crashing", () => {
            mockConfig.scroll = { persist: true };
            const manager = new ViewScrollManager(
                (v) => mockConfig.views.find((x) => x.view === v),
                () => mockConfig
            );

            // Corrupt storage with primitive JSON payloads
            localStorage.setItem("test-app-views_scroll_state", "123");
            expect(() => manager.savePosition("stats", { pos: 100, height: 500 })).not.toThrow();

            localStorage.setItem("test-app-views_scroll_state", "true");
            expect(() => manager.savePosition("stats", { pos: 100, height: 500 })).not.toThrow();

            localStorage.setItem("test-app-views_scroll_state", '"invalid-string"');
            expect(() => manager.savePosition("stats", { pos: 100, height: 500 })).not.toThrow();
        });
    });
});
