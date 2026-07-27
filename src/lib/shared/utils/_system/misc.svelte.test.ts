import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

import {
    copyToClipboard,
    getBrowserEngine,
    getOS,
    isTouchDevice,
    listenOnlineStatus,
    onlineStatus,
    readFromClipboard,
} from "./misc.svelte";

describe("Misc Utilities", () => {
    describe("getBrowserEngine", () => {
        test("should return blink in the test chromium browser", () => {
            const engine = getBrowserEngine();
            // Since tests run in Chromium browser, it should identify as blink
            expect(engine).toBe("blink");
        });
    });

    describe("getOS", () => {
        test("should return linux or ios/macos depending on test host runner", () => {
            const os = getOS();
            expect(["linux", "macos", "windows", "ios", "android", "unknown"]).toContain(os);
        });
    });

    describe("isTouchDevice", () => {
        test("should return boolean value", () => {
            expect(typeof isTouchDevice()).toBe("boolean");
        });

        test("should return true if ontouchstart exists in window", () => {
            const originalOntouchstart = window.ontouchstart;
            window.ontouchstart = () => {};

            expect(isTouchDevice()).toBe(true);

            // Restore
            if (originalOntouchstart === undefined) {
                delete (window as unknown as Record<string, unknown>).ontouchstart;
            } else {
                window.ontouchstart = originalOntouchstart;
            }
        });
    });

    describe("Clipboard Actions", () => {
        const originalClipboard = navigator.clipboard;

        beforeAll(() => {
            // Mock navigator.clipboard since headless browsers might have permissions locked
            let clipboardText = "";
            const mockClipboard = {
                writeText: vi.fn(async (text: string) => {
                    clipboardText = text;
                }),
                readText: vi.fn(async () => {
                    return clipboardText;
                }),
            };
            Object.defineProperty(navigator, "clipboard", {
                value: mockClipboard,
                writable: true,
                configurable: true,
            });
        });

        afterAll(() => {
            // Restore navigator.clipboard
            Object.defineProperty(navigator, "clipboard", {
                value: originalClipboard,
                writable: true,
                configurable: true,
            });
        });

        test("should copy to clipboard and read back successfully", async () => {
            const testText = "hello clipboard!";
            const copySuccess = await copyToClipboard(testText);
            expect(copySuccess).toBe(true);
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testText);

            const readText = await readFromClipboard();
            expect(readText).toBe(testText);
            expect(navigator.clipboard.readText).toHaveBeenCalled();
        });

        test("should fall back to textarea copy if navigator.clipboard is not available", async () => {
            // Temporarily remove clipboard API
            Object.defineProperty(navigator, "clipboard", {
                value: undefined,
                configurable: true,
            });

            // Mock document.execCommand
            const originalExecCommand = document.execCommand;
            document.execCommand = vi.fn().mockReturnValue(true);

            const success = await copyToClipboard("fallback text");
            expect(success).toBe(true);
            expect(document.execCommand).toHaveBeenCalledWith("copy");

            // Restore
            document.execCommand = originalExecCommand;
        });
    });

    describe("Online Status", () => {
        test("should subscribe to online changes and run checks", async () => {
            // Mock fetch to simulate internet access check
            const originalFetch = window.fetch;
            window.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200,
            });

            const statusUpdates: boolean[] = [];
            const unsubscribe = listenOnlineStatus((online) => {
                statusUpdates.push(online);
            });

            // Wait a small bit for async fetch ping
            await new Promise((resolve) => setTimeout(resolve, 50));

            // Mock navigator.onLine as false for the offline test
            const originalOnLine = navigator.onLine;
            Object.defineProperty(navigator, "onLine", {
                value: false,
                configurable: true,
            });

            // Trigger offline event
            window.dispatchEvent(new Event("offline"));

            // Restore navigator.onLine
            Object.defineProperty(navigator, "onLine", {
                value: originalOnLine,
                configurable: true,
            });

            // Trigger online event
            window.dispatchEvent(new Event("online"));
            await new Promise((resolve) => setTimeout(resolve, 50));

            unsubscribe();
            window.fetch = originalFetch;

            expect(statusUpdates.length).toBeGreaterThanOrEqual(2);
            // First item (initial) or subsequent items should reflect states
            expect(statusUpdates).toContain(false); // since offline event was fired
        });

        test("should expose Svelte 5 rune status value", () => {
            expect(typeof onlineStatus.value).toBe("boolean");
        });
    });
});
