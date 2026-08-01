import { describe, expect, it } from "vitest";

import { analyzeDomStructure } from "./dom-observer";
import { PerformanceState } from "./performanceState.svelte";

describe("dom-observer (browser)", () => {
    it("calculates DOM count and max nesting depth accurately", () => {
        const root = document.createElement("div");
        const child1 = document.createElement("section");
        const child2 = document.createElement("p");
        const subChild = document.createElement("span");

        child1.appendChild(subChild);
        root.appendChild(child1);
        root.appendChild(child2);

        // Root (1) -> child1 (2) -> subChild (3)
        //          -> child2 (2)
        const metrics = analyzeDomStructure(root);
        expect(metrics.count).toBe(4);
        expect(metrics.depth).toBe(3);
    });

    it("ignores elements inside #dev-perf-overlay container", () => {
        const root = document.createElement("div");

        const normalChild = document.createElement("div");
        root.appendChild(normalChild);

        const overlay = document.createElement("div");
        overlay.id = "dev-perf-overlay";
        const overlayChild = document.createElement("span");
        overlay.appendChild(overlayChild);
        root.appendChild(overlay);

        document.body.appendChild(root);

        try {
            const metrics = analyzeDomStructure(root);
            // Root (1) + normalChild (1) = 2. Overlay & overlayChild are ignored.
            expect(metrics.count).toBe(2);
        } finally {
            document.body.removeChild(root);
        }
    });
});

describe("PerformanceState", () => {
    it("initializes with default metric state", () => {
        const state = new PerformanceState();
        expect(state.fps).toBe(60);
        expect(state.eventLoopLag).toBe(0);
        expect(state.domCount).toBe(0);
        expect(state.domDepth).toBe(0);
    });

    it("starts and stops sampling cleanly", () => {
        const state = new PerformanceState();
        state.start();
        expect(state.domCount).toBeGreaterThanOrEqual(0);

        // Stop cleanup
        state.stop();
        expect(() => state.stop()).not.toThrow();
    });
});
