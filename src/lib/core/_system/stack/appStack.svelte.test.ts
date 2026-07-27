import { beforeEach, describe, expect, test, vi } from "vitest";

import { AppStackManager, stackAttach } from "./appStack.svelte";

describe("AppStackManager (Browser Client)", () => {
    let manager: AppStackManager;

    beforeEach(() => {
        manager = new AppStackManager();
    });

    describe("Registration & Priority Resolution", () => {
        test("should register actions with priority presets", () => {
            let overlayExecuted = false;
            let subviewExecuted = false;

            manager.register(() => (subviewExecuted = true), { priority: "subview", scope: "home" });
            manager.register(() => (overlayExecuted = true), { priority: "overlay", scope: "home" });

            manager.setScope("home");
            expect(manager.canGoBack).toBe(true);

            // Overlay (prio 100) should pop before Subview (prio 50)
            manager.pop();
            expect(overlayExecuted).toBe(true);
            expect(subviewExecuted).toBe(false);

            manager.pop();
            expect(subviewExecuted).toBe(true);
            expect(manager.canGoBack).toBe(false);
        });

        test("should respect custom numeric priorities", () => {
            let lowExecuted = false;
            let highExecuted = false;

            manager.register(() => (lowExecuted = true), { priority: 10 });
            manager.register(() => (highExecuted = true), { priority: 150 });

            manager.pop();
            expect(highExecuted).toBe(true);
            expect(lowExecuted).toBe(false);
        });

        test("should resolve ties using LIFO (newest created entry first)", async () => {
            let firstExecuted = false;
            let secondExecuted = false;

            manager.register(() => (firstExecuted = true), { priority: "overlay" });
            // Small delay to ensure distinct createdAt timestamp
            await new Promise((resolve) => setTimeout(resolve, 5));
            manager.register(() => (secondExecuted = true), { priority: "overlay" });

            manager.pop();
            expect(secondExecuted).toBe(true);
            expect(firstExecuted).toBe(false);
        });

        test("should unregister action using returned cleanup function", () => {
            const unregister = manager.register(() => {}, { priority: "overlay" });
            expect(manager.size).toBe(1);

            unregister();
            expect(manager.size).toBe(0);
        });
    });

    describe("Configuration System (configure)", () => {
        test("should disable pop and canGoBack when enabled is false", () => {
            let executed = false;
            manager.register(() => (executed = true), { priority: "overlay" });

            expect(manager.canGoBack).toBe(true);
            manager.configure({ enabled: false });

            expect(manager.canGoBack).toBe(false);
            const popped = manager.pop();
            expect(popped).toBe(false);
            expect(executed).toBe(false);
        });

        test("should filter pop actions by allowedPriorities", () => {
            let overlayExecuted = false;
            let subviewExecuted = false;

            manager.register(() => (subviewExecuted = true), { priority: "subview" });
            manager.register(() => (overlayExecuted = true), { priority: "overlay" });

            // Allow only 'overlay' priority
            manager.configure({ allowedPriorities: ["overlay"] });

            manager.pop();
            expect(overlayExecuted).toBe(true);
            expect(subviewExecuted).toBe(false);

            // Subview priority is not allowed -> pop returns false
            expect(manager.canGoBack).toBe(false);
            expect(manager.pop()).toBe(false);
            expect(subviewExecuted).toBe(false);
        });
    });

    describe("Scope & Root Pop Handling", () => {
        test("should filter pops by active scope and global entries", () => {
            let homeExecuted = false;
            let statsExecuted = false;
            let globalExecuted = false;

            manager.register(() => (homeExecuted = true), { scope: "home" });
            manager.register(() => (statsExecuted = true), { scope: "stats" });
            manager.register(() => (globalExecuted = true), { priority: 120, scope: "global" });

            // Active scope is 'home'
            manager.setScope("home");

            // Global has highest priority (120) -> pops first
            manager.pop();
            expect(globalExecuted).toBe(true);

            // Next pop in 'home' scope pops home action, leaving stats untouched
            manager.pop();
            expect(homeExecuted).toBe(true);
            expect(statsExecuted).toBe(false);

            // Stack is empty for 'home' scope now
            expect(manager.canGoBack).toBe(false);

            // Switch to 'stats' scope -> stats action remains available
            manager.setScope("stats");
            expect(manager.canGoBack).toBe(true);
            manager.pop();
            expect(statsExecuted).toBe(true);
        });

        test("should trigger custom onRootPop callback when stack is empty", () => {
            const rootPopSpy = vi.fn();
            manager.onRootPop = rootPopSpy;

            const result = manager.pop();
            expect(result).toBe(false);
            expect(rootPopSpy).toHaveBeenCalledTimes(1);
        });
    });

    describe("Attachment Helper (stackAttach)", () => {
        test("should register on attachment invocation and unregister on cleanup", () => {
            let actionExecuted = false;
            const attachFn = stackAttach(() => (actionExecuted = true), { priority: "overlay" }, manager);

            // Simulate element mounting
            const dummyElement = document.createElement("div");
            const cleanup = attachFn(dummyElement);

            // Verify action registered via attachment
            const popped = manager.pop();
            expect(popped).toBe(true);
            expect(actionExecuted).toBe(true);

            // Simulate element unmounting
            cleanup();
        });
    });
});
