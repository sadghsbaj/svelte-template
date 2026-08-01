import { describe, expect, it } from "vitest";

import { analyzeDomStructure } from "./dom-observer";
import { getMemoryUsage, getNetworkMetrics } from "./metrics-observer";

describe("dom-observer (node environment)", () => {
    it("returns zero metrics safely in non-browser Node environment", () => {
        const result = analyzeDomStructure();
        expect(result).toEqual({ count: 0, depth: 0 });
    });
});

describe("metrics-observer (node environment)", () => {
    it("handles memory metrics safely when performance.memory is missing or in Node", () => {
        const memory = getMemoryUsage();
        expect(memory).toEqual({ usedMb: 0, totalMb: 0 });
    });

    it("handles network metrics safely when performance API is empty in Node", () => {
        const network = getNetworkMetrics();
        expect(network.requests).toBeGreaterThanOrEqual(0);
        expect(network.totalSizeKb).toBeGreaterThanOrEqual(0);
    });
});
