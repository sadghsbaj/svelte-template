import { describe, expect, test } from "vitest";

import { MotionManager } from "./motion.svelte";

describe("MotionManager (Node SSR)", () => {
    test("should instantiate safely on server without crashing", () => {
        expect(typeof window).toBe("undefined");
        const manager = new MotionManager();
        expect(manager.preference).toBe("system");
        expect(manager.resolved).toBe("no-preference");

        manager.set("reduce");
        expect(manager.preference).toBe("system");

        expect(() => manager.destroy()).not.toThrow();
    });
});
