import { describe, expect, test } from "vitest";

import type { ViewsConfig } from "./types";
import { ViewState } from "./viewState.svelte";

describe("ViewState (Node SSR Environment)", () => {
    type TestView = "home" | "stats" | "statsDetails";

    const mockConfig: ViewsConfig<TestView> = {
        persistKey: "ssr-test-key",
        views: [
            { view: "home", label: "Home", parent: "root" },
            { view: "stats", label: "Stats", parent: "root" },
            { view: "statsDetails", label: "Stats Details", parent: "stats" },
        ],
    };

    test("should instantiate safely on server without crashing", () => {
        expect(typeof window).toBe("undefined");
        const state = new ViewState(mockConfig);
        expect(state.activeView).toBe("home");
        expect(state.activeLabel).toBe("Home");
    });

    test("should handle navigation safely in SSR", () => {
        const state = new ViewState(mockConfig);
        expect(state.setView("stats")).toBe(true);
        expect(state.activeView).toBe("stats");
        expect(state.direction).toBe("forward");
    });

    test("should handle getParent and getRootView safely in SSR", () => {
        const state = new ViewState(mockConfig);
        expect(state.getParent("home")).toBe("root");
        expect(state.getParent("statsDetails")).toBe("stats");
        expect(state.getRootView("statsDetails")).toBe("stats");
    });

    test("should handle scroll calls safely without crashing in SSR", () => {
        const state = new ViewState(mockConfig);
        expect(() => state.measureAndSave(null, "home")).not.toThrow();
        expect(() => state.restoreScroll(null, "home")).not.toThrow();
    });
});
