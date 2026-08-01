import { describe, expect, it } from "vitest";

import { analyzeDomStructure } from "./dom-observer";
import { PerformanceState } from "./performanceState.svelte";
import { applySelectiveBlueprint } from "./selective-blueprint";

describe("dom-observer (browser)", () => {
    it("calculates DOM count and max nesting depth accurately", () => {
        const root = document.createElement("div");
        const child1 = document.createElement("section");
        const child2 = document.createElement("p");
        const subChild = document.createElement("span");

        child1.append(subChild);
        root.append(child1);
        root.append(child2);

        // Root (1) -> child1 (2) -> subChild (3)
        //          -> child2 (2)
        const metrics = analyzeDomStructure(root);
        expect(metrics.count).toBe(4);
        expect(metrics.depth).toBe(3);
    });

    it("ignores elements inside #dev-perf-overlay container", () => {
        const root = document.createElement("div");

        const normalChild = document.createElement("div");
        root.append(normalChild);

        const overlay = document.createElement("div");
        overlay.id = "dev-perf-overlay";
        const overlayChild = document.createElement("span");
        overlay.append(overlayChild);
        root.append(overlay);

        document.body.append(root);

        try {
            const metrics = analyzeDomStructure(root);
            // Root (1) + normalChild (1) = 2. Overlay & overlayChild are ignored.
            expect(metrics.count).toBe(2);
        } finally {
            root.remove();
        }
    });
});

describe("PerformanceState Heatmap state", () => {
    it("initializes with heatmap inactive", () => {
        const state = new PerformanceState();
        expect(state.isHeatmapActive).toBe(false);
    });

    it("toggles and stops heatmap state cleanly", () => {
        const state = new PerformanceState();

        state.toggleHeatmap();
        expect(state.isHeatmapActive).toBe(true);

        state.toggleHeatmap();
        expect(state.isHeatmapActive).toBe(false);

        state.toggleHeatmap();
        expect(state.isHeatmapActive).toBe(true);

        state.stopHeatmap();
        expect(state.isHeatmapActive).toBe(false);
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

describe("selective-blueprint (DOM transformation)", () => {
    it("transforms colored elements to white background and black text, ignoring #dev-perf-overlay", () => {
        const container = document.createElement("div");

        // Normal element with solid background
        const coloredCard = document.createElement("div");
        coloredCard.style.backgroundColor = "rgb(59, 130, 246)"; // bg-blue-500
        coloredCard.style.color = "rgb(255, 255, 255)";

        const textSpan = document.createElement("span");
        textSpan.textContent = "Test Text";
        coloredCard.append(textSpan);

        // SVG Icon
        const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        svgIcon.append(svgPath);
        coloredCard.append(svgIcon);

        // Perf overlay element (must be strictly ignored)
        const overlay = document.createElement("div");
        overlay.id = "dev-perf-overlay";
        overlay.style.backgroundColor = "rgb(24, 24, 27)"; // dark background
        overlay.style.color = "rgb(255, 255, 255)";

        const overlayText = document.createElement("span");
        overlayText.textContent = "Overlay Content";
        overlayText.style.color = "rgb(255, 255, 255)";
        overlay.append(overlayText);

        container.append(coloredCard);
        container.append(overlay);
        document.body.append(container);

        try {
            // Apply Blueprint mode
            applySelectiveBlueprint(true);

            // Colored card should have white background and black text (normalized by browser)
            expect(coloredCard.style.getPropertyValue("background-color")).toMatch(
                /rgb\(255, 255, 255\)|#ffffff/
            );
            expect(coloredCard.style.getPropertyValue("color")).toMatch(/rgb\(0, 0, 0\)|#000000/);

            // SVG icon & path should be blackened
            expect(svgIcon.style.getPropertyValue("color")).toMatch(/rgb\(0, 0, 0\)|#000000/);
            expect(svgPath.style.getPropertyValue("color")).toMatch(/rgb\(0, 0, 0\)|#000000/);

            // Performance overlay container MUST remain untouched
            expect(overlay.style.getPropertyValue("background-color")).toBe("rgb(24, 24, 27)");
            expect(overlay.style.getPropertyValue("color")).toBe("rgb(255, 255, 255)");
            expect(overlayText.style.getPropertyValue("color")).toBe("rgb(255, 255, 255)");

            // Deactivate Blueprint mode
            applySelectiveBlueprint(false);

            // Original styles should be restored
            expect(coloredCard.style.getPropertyValue("background-color")).toBe(
                "rgb(59, 130, 246)"
            );
            expect(coloredCard.style.getPropertyValue("color")).toBe("rgb(255, 255, 255)");
        } finally {
            container.remove();
            applySelectiveBlueprint(false);
        }
    });
});
