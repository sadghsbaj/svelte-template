import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { AppStackManager, stackAttach } from "./appStack.svelte";

describe("AppStackManager (Browser Client)", () => {
    let manager: AppStackManager;

    beforeEach(() => {
        manager = new AppStackManager();
    });

    afterEach(() => {
        manager.destroy();
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

        test("should resolve synchronous ties deterministically using monotonic sequence counter", () => {
            const executionOrder: number[] = [];

            manager.register(() => executionOrder.push(1), { priority: "overlay" });
            manager.register(() => executionOrder.push(2), { priority: "overlay" });
            manager.register(() => executionOrder.push(3), { priority: "overlay" });

            manager.pop();
            manager.pop();
            manager.pop();

            expect(executionOrder).toEqual([3, 2, 1]);
        });

        test("should unregister action using returned cleanup function", () => {
            const unregister = manager.register(() => {}, { priority: "overlay" });
            expect(manager.size).toBe(1);

            unregister();
            expect(manager.size).toBe(0);
        });

        test("should unregister by function reference using LIFO order for duplicate actions", () => {
            const action = () => {};
            manager.register(action, { id: "first", priority: "overlay" });
            manager.register(action, { id: "second", priority: "overlay" });

            expect(manager.size).toBe(2);

            // Unregistering by function reference should remove the most recent entry ("second")
            const removed = manager.unregister(action);
            expect(removed).toBe(true);
            expect(manager.size).toBe(1);
            expect(manager.entries[0].id).toBe("first");
        });

        test("should prevent empty string ID by falling back to auto-generated UUID", () => {
            const unregister = manager.register(() => {}, { id: "" });
            expect(manager.entries[0].id).not.toBe("");
            expect(manager.entries[0].id.length).toBeGreaterThan(0);
            unregister();
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

        test("should report accurate scopeSize for specific and active scopes", () => {
            manager.register(() => {}, { scope: "global" });
            manager.register(() => {}, { scope: "home" });
            manager.register(() => {}, { scope: "settings" });

            manager.setScope("home");
            expect(manager.size).toBe(3);
            expect(manager.scopeSize()).toBe(2);
            expect(manager.scopeSize("settings")).toBe(2);
        });

        test("should trigger custom onRootPop callback when stack is empty", () => {
            const rootPopSpy = vi.fn();
            manager.onRootPop = rootPopSpy;

            const result = manager.pop();
            expect(result).toBe(false);
            expect(rootPopSpy).toHaveBeenCalledTimes(1);
        });

        test("should clear all entries or scoped entries", () => {
            manager.register(() => {}, { scope: "home" });
            manager.register(() => {}, { scope: "settings" });
            manager.register(() => {}, { scope: "home" });

            expect(manager.size).toBe(3);
            manager.clear("home");
            expect(manager.size).toBe(1);
            expect(manager.entries[0].scope).toBe("settings");

            manager.clear();
            expect(manager.size).toBe(0);
        });
    });

    describe("Exception Resilience & Event Cleanup", () => {
        test("should catch action execution errors without crashing manager", () => {
            const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

            manager.register(() => {
                throw new Error("Action failure test");
            });

            expect(manager.size).toBe(1);
            const popped = manager.pop();

            expect(popped).toBe(true);
            expect(manager.size).toBe(0);
            expect(consoleErrorSpy).toHaveBeenCalledWith("Error executing stack action:", expect.any(Error));

            consoleErrorSpy.mockRestore();
        });

        test("should unbind popstate listener cleanly on destroy", () => {
            const removeListenerSpy = vi.spyOn(window, "removeEventListener");

            const tempManager = new AppStackManager();
            tempManager.destroy();

            expect(removeListenerSpy).toHaveBeenCalledWith("popstate", expect.any(Function));
            removeListenerSpy.mockRestore();
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

        test("should support updating action reference without stale closure", () => {
            let value = 1;
            const attachFn = stackAttach(() => (value = 10), { priority: "overlay" }, manager);

            const dummyElement = document.createElement("div");
            const cleanup = attachFn(dummyElement);

            // Update actionclosure
            cleanup.update(() => (value = 20));

            manager.pop();
            expect(value).toBe(20);

            cleanup();
        });
    });
});

