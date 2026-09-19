import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { FeedbackState } from "./feedbackState.svelte";

describe("FeedbackState timers", () => {
    let state: FeedbackState<"default">;

    beforeEach(() => {
        vi.useFakeTimers();
        state = new FeedbackState({
            defaultDuration: 1000,
            defaultPosition: "default",
            limit: 4,
        });
    });

    afterEach(() => {
        state.reset();
        vi.useRealTimers();
    });

    test("starts auto-dismiss only after the enter lifecycle completes", () => {
        const id = state.show({ title: "Saved" });

        vi.advanceTimersByTime(2000);
        expect(state.records[0]?.phase).toBe("entering");

        state.markEntered(id);
        vi.advanceTimersByTime(999);
        expect(state.records[0]?.phase).toBe("visible");

        vi.advanceTimersByTime(1);
        expect(state.records[0]?.phase).toBe("exiting");
        expect(state.records[0]?.dismissReason).toBe("timeout");
    });

    test("preserves remaining time across overlapping pause reasons", () => {
        const id = state.show({ title: "Readable" });
        state.markEntered(id);
        vi.advanceTimersByTime(400);

        state.pause(id, "hover");
        state.pause(id, "focus");
        vi.advanceTimersByTime(2000);
        expect(state.records[0]?.phase).toBe("visible");

        state.resume(id, "hover");
        vi.advanceTimersByTime(1000);
        expect(state.records[0]?.phase).toBe("visible");

        state.resume(id, "focus");
        vi.advanceTimersByTime(599);
        expect(state.records[0]?.phase).toBe("visible");
        vi.advanceTimersByTime(1);
        expect(state.records[0]?.phase).toBe("exiting");
    });

    test("keeps persistent records visible", () => {
        const id = state.show({ title: "Persistent", duration: null });
        state.markEntered(id);
        vi.advanceTimersByTime(60_000);
        expect(state.records[0]?.phase).toBe("visible");
    });
});
