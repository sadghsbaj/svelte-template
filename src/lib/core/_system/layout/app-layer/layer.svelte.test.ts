import { beforeEach, describe, expect, test } from "vitest";

import { appInertState } from "./layer.svelte";

describe("Layer State Utilities", () => {
    beforeEach(() => {
        if (typeof document !== "undefined") {
            document.body.style.overflow = "";
        }

        while (appInertState.isAppInert) {
            appInertState.unblock();
        }
    });

    describe("appInertState", () => {
        test("should initialize as not inert with normal scroll", () => {
            expect(appInertState.isAppInert).toBe(false);
            expect(document.body.style.overflow).toBe("");
        });

        test("should lock body scroll and set inert on first block", () => {
            appInertState.block();
            expect(appInertState.isAppInert).toBe(true);
            expect(document.body.style.overflow).toBe("hidden");
        });

        test("should remain blocked for nested calls and release only on final unblock", () => {
            appInertState.block();
            appInertState.block();
            expect(appInertState.isAppInert).toBe(true);
            expect(document.body.style.overflow).toBe("hidden");

            appInertState.unblock();
            expect(appInertState.isAppInert).toBe(true);
            expect(document.body.style.overflow).toBe("hidden");

            appInertState.unblock();
            expect(appInertState.isAppInert).toBe(false);
            expect(document.body.style.overflow).toBe("");
        });
    });
});
