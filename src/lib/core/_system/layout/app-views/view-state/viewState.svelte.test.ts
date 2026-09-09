import { appShortcut } from "$modules/shortcut/appShortcut.svelte";
import { beforeEach, describe, expect, test } from "vitest";

import type { ViewsConfig } from "$core/_system/layout/app-views/types";
import { appStack } from "$core/_system/stack/appStack.svelte";

import { ViewState } from "./viewState.svelte";

function mockCustomFn(): { duration: number } {
    return { duration: 420 };
}
function mockCustomIn(): { duration: number } {
    return { duration: 500 };
}
function mockCustomOut(): { duration: number } {
    return { duration: 250 };
}

describe("ViewState (Browser Client)", () => {
    type TestView = "home" | "stats" | "statsDetails" | "statsSubDetails" | "settings";

    let mockConfig: ViewsConfig<TestView>;

    beforeEach(() => {
        localStorage.clear();
        appStack.clear();
        mockConfig = {
            persistKey: "test-viewstate-key",
            scroll: { session: true, persist: true },
            views: [
                { view: "home", label: "Startseite", parent: "root" },
                { view: "stats", label: "Statistiken", parent: "root" },
                { view: "statsDetails", label: "Statistik Details", parent: "stats" },
                {
                    view: "statsSubDetails",
                    label: "Unter-Statistik Details",
                    parent: "statsDetails",
                },
                { view: "settings", label: "Einstellungen", parent: "root", disabled: true },
            ],
        };
    });

    describe("Initialization & Persistence", () => {
        test("should default to the first view when no localStorage key exists", () => {
            const state = new ViewState(mockConfig);
            expect(state.activeView).toBe("home");
            expect(state.activeLabel).toBe("Startseite");
        });

        test("should restore activeView from localStorage if present and valid", () => {
            localStorage.setItem("test-viewstate-key", "stats");
            const state = new ViewState(mockConfig);
            expect(state.activeView).toBe("stats");
            expect(state.activeLabel).toBe("Statistiken");
        });

        test("should fallback to first view if persisted value is invalid", () => {
            localStorage.setItem("test-viewstate-key", "non-existent-view");
            const state = new ViewState(mockConfig);
            expect(state.activeView).toBe("home");
        });
    });

    describe("Hierarchy Helpers (getParent & getRootView)", () => {
        test("should return 'root' for root level views using getParent", () => {
            const state = new ViewState(mockConfig);
            expect(state.getParent("home")).toBe("root");
            expect(state.getParent("stats")).toBe("root");
            expect(state.getParent("settings")).toBe("root");
        });

        test("should return direct parent for subviews using getParent", () => {
            const state = new ViewState(mockConfig);
            expect(state.getParent("statsDetails")).toBe("stats");
            expect(state.getParent("statsSubDetails")).toBe("statsDetails");
        });

        test("should recursively resolve main root view for deep subviews using getRootView", () => {
            const state = new ViewState(mockConfig);
            expect(state.getRootView("home")).toBe("home");
            expect(state.getRootView("stats")).toBe("stats");
            expect(state.getRootView("statsDetails")).toBe("stats");
            expect(state.getRootView("statsSubDetails")).toBe("stats");
        });

        test("should expose all views via views getter", () => {
            const state = new ViewState(mockConfig);
            expect(state.views).toEqual(mockConfig.views);
        });

        test("should return only active non-disabled root views via rootViews", () => {
            const state = new ViewState(mockConfig);
            const roots = state.rootViews;
            expect(roots.map((r) => r.view)).toEqual(["home", "stats"]);
        });

        test("should filter children by parent correctly with getChildren", () => {
            const state = new ViewState(mockConfig);
            expect(state.getChildren("stats").map((c) => c.view)).toEqual(["statsDetails"]);
            expect(state.getChildren("statsDetails").map((c) => c.view)).toEqual(["statsSubDetails"]);
            expect(state.getChildren("home")).toEqual([]);

            // Including disabled views
            expect(state.getChildren("root", false).map((c) => c.view)).toEqual(["home", "stats"]);
            expect(state.getChildren("root", true).map((c) => c.view)).toEqual([
                "home",
                "stats",
                "settings",
            ]);
        });

        test("should return hierarchy path from root to target view using getViewPath", () => {
            const state = new ViewState(mockConfig);
            const homePath = state.getViewPath("home");
            expect(homePath.map((p) => p.view)).toEqual(["home"]);

            const subPath = state.getViewPath("statsSubDetails");
            expect(subPath.map((p) => p.view)).toEqual(["stats", "statsDetails", "statsSubDetails"]);

            // Default to active view
            expect(state.getViewPath().map((p) => p.view)).toEqual(["home"]);
        });
    });

    describe("Navigation & Direction", () => {
        test("should change view and set direction correctly when setView is called", () => {
            const state = new ViewState(mockConfig);
            expect(state.direction).toBe("none");

            const success = state.setView("stats");
            expect(success).toBe(true);
            expect(state.activeView).toBe("stats");
            expect(state.fromView).toBe("home");
            expect(state.direction).toBe("forward");

            state.setView("home");
            expect(state.activeView).toBe("home");
            expect(state.fromView).toBe("stats");
            expect(state.direction).toBe("backward");
        });

        test("should prevent navigating to the current view", () => {
            const state = new ViewState(mockConfig);
            expect(state.setView("home")).toBe(false);
        });

        test("should prevent navigating to disabled views", () => {
            const state = new ViewState(mockConfig);
            expect(state.isDisabled("settings")).toBe(true);
            expect(state.setView("settings")).toBe(false);
            expect(state.activeView).toBe("home");
        });

        test("should handle next() and previous() navigation helpers", () => {
            const state = new ViewState(mockConfig);
            expect(state.nextView).toBe("stats");
            expect(state.prevView).toBe(null);

            state.next();
            expect(state.activeView).toBe("stats");

            state.next();
            expect(state.activeView).toBe("statsDetails");

            state.previous();
            expect(state.activeView).toBe("stats");
        });

        test("should persist activeView to localStorage on setView", () => {
            const state = new ViewState(mockConfig);
            state.setView("stats");
            expect(localStorage.getItem("test-viewstate-key")).toBe("stats");
        });
    });

    describe("Back-Stack & Shortcut Auto Integration", () => {
        test("should automatically update appStack and appShortcut scopes and register subview back action", () => {
            const state = new ViewState(mockConfig);
            expect(appStack.activeScope).toBe("home");
            expect(appShortcut.activeScope).toBe("home");
            expect(appStack.canGoBack).toBe(false);

            // Navigate to subview 'statsDetails' (parent: 'stats')
            state.setView("statsDetails");
            expect(appStack.activeScope).toBe("stats");
            expect(appShortcut.activeScope).toBe("stats");
            expect(appStack.canGoBack).toBe(true);

            // Popping appStack should navigate back to parent view 'stats'
            const popped = appStack.pop();
            expect(popped).toBe(true);
            expect(state.activeView).toBe("stats");
            expect(appStack.canGoBack).toBe(false);
        });

        test("should respect stack: false at global config level", () => {
            mockConfig.stack = false;
            const state = new ViewState(mockConfig);

            state.setView("statsDetails");
            expect(appStack.activeScope).toBe("stats");
            // Auto subview back registration disabled via global config
            expect(appStack.canGoBack).toBe(false);
        });

        test("should respect stack: false at individual view config level", () => {
            mockConfig.views = [
                { view: "home", label: "Startseite", parent: "root" },
                { view: "stats", label: "Statistiken", parent: "root" },
                { view: "statsDetails", label: "Statistik Details", parent: "stats", stack: false },
                { view: "settings", label: "Einstellungen", parent: "root" },
            ];
            const state = new ViewState(mockConfig);

            state.setView("statsDetails");
            expect(appStack.activeScope).toBe("stats");
            // Auto subview back registration disabled for this specific view
            expect(appStack.canGoBack).toBe(false);
        });
    });

    describe("Transition Resolution & Modes", () => {
        test("should default to WAAPI transition functions when no option is specified", () => {
            const state = new ViewState(mockConfig);
            const inFn = state.getInTransition("home");
            const outFn = state.getOutTransition("home");
            expect(typeof inFn).toBe("function");
            expect(typeof outFn).toBe("function");

            const mockElem = { animate: () => {} } as unknown as Element;
            expect(inFn(mockElem)).toHaveProperty("duration");
            expect(outFn(mockElem)).toHaveProperty("duration");
        });

        test("should respect transition: 'none' at global or view level", () => {
            mockConfig.transition = "none";
            const stateNone = new ViewState(mockConfig);
            expect(stateNone.getInTransition("home")({} as Element)).toEqual({ duration: 0 });

            mockConfig.transition = "waapi";
            mockConfig.views = [
                { view: "home", parent: "root", transition: "none" },
                { view: "stats", parent: "root" },
                { view: "statsDetails", parent: "stats" },
                { view: "statsSubDetails", parent: "statsDetails" },
                { view: "settings", parent: "root", disabled: true },
            ];
            const stateViewNone = new ViewState(mockConfig);
            expect(stateViewNone.getInTransition("home")({} as Element)).toEqual({ duration: 0 });
            expect(
                stateViewNone.getInTransition("stats")({ animate: () => {} } as unknown as Element)
                    .duration
            ).toBeGreaterThan(0);
        });

        test("should respect transition: 'svelte' mode", () => {
            mockConfig.transition = "svelte";
            const stateSvelte = new ViewState(mockConfig);
            const inFn = stateSvelte.getInTransition("home");
            const res = inFn({} as Element);
            expect(res).toHaveProperty("duration");
            expect(res).toHaveProperty("css");
        });

        test("should handle custom transition objects with mode overrides", () => {
            mockConfig.transition = { mode: "svelte" };
            const stateObj = new ViewState(mockConfig);
            const res = stateObj.getInTransition("home")({} as Element);
            expect(res).toHaveProperty("css");
        });

        test("should support custom transition functions directly", () => {
            mockConfig.transition = mockCustomFn;
            const stateCustom = new ViewState(mockConfig);
            expect(stateCustom.getInTransition("home")({} as Element)).toEqual({ duration: 420 });
            expect(stateCustom.getOutTransition("home")({} as Element)).toEqual({ duration: 420 });
        });

        test("should support custom in and out transition functions in an object", () => {
            mockConfig.transition = { in: mockCustomIn, out: mockCustomOut };
            const stateObj = new ViewState(mockConfig);
            expect(stateObj.getInTransition("home")({} as Element)).toEqual({ duration: 500 });
            expect(stateObj.getOutTransition("home")({} as Element)).toEqual({ duration: 250 });
        });
    });

    describe("Scroll Facade Delegations", () => {
        test("should delegate measureAndSave, savePosition, and restoreScroll to scrollManager", () => {
            const state = new ViewState(mockConfig);

            state.savePosition("home", { pos: 320, height: 1100 });

            const restoreEl = { scrollTop: 0, scrollHeight: 1100 } as HTMLElement;
            state.restoreScroll(restoreEl, "home");
            expect(restoreEl.scrollTop).toBe(320);

            const measureEl = { scrollTop: 450, scrollHeight: 1100 } as HTMLElement;
            state.measureAndSave(measureEl, "home");

            const restoreEl2 = { scrollTop: 0, scrollHeight: 1100 } as HTMLElement;
            state.restoreScroll(restoreEl2, "home");
            expect(restoreEl2.scrollTop).toBe(450);
        });
    });

    describe("Verified Fixes & Edge Cases", () => {
        test("should throw Error on empty views array", () => {
            expect(() => new ViewState({ views: [] } as unknown as ViewsConfig<string>)).toThrow(
                "ViewsConfig must contain at least one view definition"
            );
        });

        test("should prevent infinite recursion on cyclic parent configurations", () => {
            type CyclicView = "viewA" | "viewB";
            const cyclicConfig: ViewsConfig<CyclicView> = {
                views: [
                    { view: "viewA", parent: "viewB" },
                    { view: "viewB", parent: "viewA" },
                ],
            };
            const state = new ViewState(cyclicConfig);
            expect(() => state.getRootView("viewA")).not.toThrow();
            expect(state.getRootView("viewA")).toBe("viewA");
        });

        test("should clean up appStack listener when destroy() is called", () => {
            const state = new ViewState(mockConfig);
            state.setView("statsDetails");
            expect(appStack.canGoBack).toBe(true);

            state.destroy();
            // Should unregister subview back handler safely
            expect(() => state.destroy()).not.toThrow();
        });

        test("should skip disabled views when scanning nextView and prevView", () => {
            type StepView = "v1" | "v2" | "v3";
            const stepConfig: ViewsConfig<StepView> = {
                views: [
                    { view: "v1", parent: "root" },
                    { view: "v2", parent: "root", disabled: true },
                    { view: "v3", parent: "root" },
                ],
            };
            const state = new ViewState(stepConfig);
            expect(state.nextView).toBe("v3");

            state.setView("v3");
            expect(state.prevView).toBe("v1");
        });

        test("should ignore disabled view restored from localStorage on initial load", () => {
            localStorage.setItem("test-viewstate-key", "settings"); // settings is disabled in mockConfig
            const state = new ViewState(mockConfig);
            expect(state.activeView).toBe("home"); // fallbacks to first enabled view
        });

        test("should return direction 'none' when current index equals from index", () => {
            const state = new ViewState(mockConfig);
            state.setView("stats");
            expect(state.direction).toBe("forward");
            state.fromView = "stats";
            expect(state.direction).toBe("none");
        });
    });
});
