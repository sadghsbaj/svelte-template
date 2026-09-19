import { beforeEach, describe, expect, test, vi } from "vitest";

import { FeedbackState } from "./feedbackState.svelte";

describe("FeedbackState", () => {
    let state: FeedbackState<"top" | "bottom">;

    beforeEach(() => {
        state = new FeedbackState({ defaultDuration: 4000, defaultPosition: "bottom", limit: 2 });
    });

    test("uses defaults and promotes only the configured number per position", () => {
        const first = state.show({ title: "First" });
        const second = state.show({ title: "Second", status: "success" });
        const third = state.show({ title: "Third" });

        expect(state.records.map(({ id, phase }) => ({ id, phase }))).toEqual([
            { id: first, phase: "entering" },
            { id: second, phase: "entering" },
            { id: third, phase: "queued" },
        ]);
        expect(state.records[0]).toMatchObject({
            position: "bottom",
            duration: 4000,
            dismissible: true,
        });
    });

    test("promotes the next queued item after exit completes", () => {
        const first = state.show({ title: "First" });
        state.show({ title: "Second" });
        const third = state.show({ title: "Third" });

        state.requestDismiss(first, "programmatic");
        expect(state.records[0]?.phase).toBe("exiting");
        expect(state.records.find((item) => item.id === third)?.phase).toBe("queued");

        state.completeDismiss(first);
        expect(state.records.find((item) => item.id === third)?.phase).toBe("entering");
    });

    test("keeps position limits independent", () => {
        state.show({ title: "Bottom one" });
        state.show({ title: "Bottom two" });
        state.show({ title: "Bottom queued" });
        const top = state.show({ title: "Top", position: "top" });

        expect(state.records.find((item) => item.id === top)?.phase).toBe("entering");
    });

    test("honors manual dismissal and emits a single detail", () => {
        const onDismiss = vi.fn();
        const id = state.show({ title: "Locked", dismissible: false, onDismiss });

        state.requestDismiss(id, "middle-click", true);
        expect(state.records[0]?.phase).toBe("entering");

        state.dismiss(id);
        state.dismiss(id);
        expect(state.records[0]?.phase).toBe("exiting");
        expect(onDismiss).toHaveBeenCalledOnce();
        expect(onDismiss).toHaveBeenCalledWith({ id, reason: "programmatic" });
    });

    test("uses assertive announcements only for danger by default", () => {
        state.show({ title: "Saved", status: "success", description: "Ready" });
        expect(state.announcement).toMatchObject({ priority: "polite", text: "Saved. Ready" });

        state.show({ title: "Failed", status: "danger", position: "top" });
        expect(state.announcement).toMatchObject({ priority: "assertive", text: "Failed" });
    });
});
