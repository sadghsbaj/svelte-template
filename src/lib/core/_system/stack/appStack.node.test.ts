import { describe, expect, test } from "vitest";

import { AppStackManager } from "./appStack.svelte";

describe("AppStackManager (Node SSR Environment)", () => {
    test("should instantiate safely on server without window", () => {
        expect(typeof window).toBe("undefined");
        const manager = new AppStackManager();
        expect(manager.size).toBe(0);
        expect(manager.canGoBack).toBe(false);
    });

    test("should register and unregister actions safely in SSR", () => {
        const manager = new AppStackManager();
        let executed = false;

        const unregister = manager.register(() => {
            executed = true;
        });

        expect(manager.size).toBe(1);
        expect(manager.canGoBack).toBe(true);

        const popped = manager.pop();
        expect(popped).toBe(true);
        expect(executed).toBe(true);
        expect(manager.size).toBe(0);

        unregister();
    });
});
