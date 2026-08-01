import { describe, expect, test } from "vitest";

import { initPreload } from "./preload";

describe("initPreload (Node SSR)", () => {
    test("should execute safely on server without crashing", () => {
        expect(typeof window).toBe("undefined");
        expect(typeof document).toBe("undefined");
        expect(() => initPreload()).not.toThrow();
    });
});
