/**
 * @file Miscellaneous utility functions and Svelte 5 reactive status helpers.
 *
 * Includes browser engine detection, OS detection, touch capability checking,
 * clipboard read/write wrappers, and Svelte 5 reactive online status tracking.
 */

export type BrowserEngine = "blink" | "gecko" | "webkit" | "unknown";
export type OS = "ios" | "android" | "macos" | "windows" | "linux" | "unknown";

/**
 * Detects the current browser engine (Blink, Gecko, WebKit, or unknown)
 * using feature detection and vendor flags for high accuracy.
 */
export function getBrowserEngine(): BrowserEngine {
    if (typeof window === "undefined" || typeof document === "undefined") {
        return "unknown";
    }

    const win = window as unknown as Record<string, unknown>;

    // Gecko (Firefox)
    if (win.InstallTrigger !== undefined || "MozAppearance" in document.documentElement.style) {
        return "gecko";
    }

    // Blink (Chrome, Opera, Edge, Brave, HeadlessChrome)
    const isBlink =
        (win.chrome !== undefined && win.chrome !== null) ||
        "chrome" in window ||
        /chrome|chromium|headlesschrome/i.test(navigator.userAgent || "");

    if (isBlink) {
        return "blink";
    }

    // WebKit (Safari, iOS Browsers)
    const isSafari = /Apple/.test(navigator.vendor);
    if (!isBlink && (isSafari || "WebkitAppearance" in document.documentElement.style)) {
        return "webkit";
    }

    return "unknown";
}

/**
 * Identifies the client Operating System based on user agent and platform flags.
 * Safely distinguishes modern iPads spoofing as macOS.
 */
export function getOS(): OS {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return "unknown";
    }

    const userAgent = navigator.userAgent || "";
    const platform = navigator.platform || "";

    // iOS (iPhone, iPad, iPod) - including modern iPads spoofing as macOS
    if (
        /iPad|iPhone|iPod/.test(userAgent) ||
        (platform === "MacIntel" && navigator.maxTouchPoints > 1)
    ) {
        return "ios";
    }

    // Android
    if (/Android/i.test(userAgent)) {
        return "android";
    }

    // macOS
    if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
        return "macos";
    }

    // Windows
    if (/Windows|Win32|Win64|Windows NT|WinCE/.test(userAgent)) {
        return "windows";
    }

    // Linux (excluding Android)
    if (/Linux/.test(platform) || /Linux/.test(userAgent)) {
        return "linux";
    }

    return "unknown";
}

/**
 * Checks if the current client is a touch-capable device.
 */
export function isTouchDevice(): boolean {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return false;
    }
    return (
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        // @ts-expect-error - legacy IE touch check
        (navigator.msMaxTouchPoints && navigator.msMaxTouchPoints > 0) ||
        window.matchMedia("(pointer: coarse)").matches
    );
}

/**
 * Copies the specified text to the clipboard.
 * Tries the modern navigator.clipboard API first, falling back to legacy textarea selection on failure.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    if (typeof window === "undefined") return false;

    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {
            // Fall back to legacy execCommand
        }
    }

    try {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        textArea.style.pointerEvents = "none";

        document.body.append(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        textArea.remove();
        return successful;
    } catch {
        return false;
    }
}

/**
 * Reads text from the clipboard.
 * Returns null if not supported, rejected, or in insecure contexts.
 */
export async function readFromClipboard(): Promise<string | null> {
    if (
        typeof window === "undefined" ||
        !navigator.clipboard ||
        typeof navigator.clipboard.readText !== "function"
    ) {
        return null;
    }

    try {
        return await navigator.clipboard.readText();
    } catch {
        return null;
    }
}

/**
 * Performs a lightweight HEAD request with a cache buster and a timeout to check if the user
 * actually has internet access (beyond just being connected to a local router).
 */
async function checkRealInternet(): Promise<boolean> {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
        return false;
    }
    if (!navigator.onLine) {
        return false;
    }

    // In automated test environments, return navigator.onLine directly to prevent fetching Vite root during tests
    if (import.meta !== undefined && import.meta.env?.MODE === "test") {
        return navigator.onLine;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        // Fetch origin root with cache-buster. Any response (even error status codes)
        // means we successfully reached the server, confirming active internet.
        await fetch(`/?_cb=${Date.now()}`, {
            method: "HEAD",
            cache: "no-store",
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        return true;
    } catch {
        return false;
    }
}

/**
 * Subscribes to internet status changes.
 * Listens to online/offline window events and runs periodic ping checks to catch silent drops.
 * Returns an unsubscribe cleanup function.
 */
export function listenOnlineStatus(callback: (online: boolean) => void): () => void {
    if (typeof window === "undefined") {
        callback(false);
        return () => {};
    }

    const handler = async (): Promise<void> => {
        if (!navigator.onLine) {
            callback(false);
            return;
        }
        const reallyOnline = await checkRealInternet();
        callback(reallyOnline);
    };

    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);

    // Run initial check
    handler();

    // Periodically ping to detect network dropouts
    const intervalId = setInterval(handler, 30_000);

    return () => {
        window.removeEventListener("online", handler);
        window.removeEventListener("offline", handler);
        clearInterval(intervalId);
    };
}

/**
 * Svelte 5 Rune-based reactive online status singleton.
 * Can be used reactively inside Svelte components via onlineStatus.value.
 */
class OnlineStatusTracker {
    #online = $state(typeof navigator !== "undefined" ? navigator.onLine : true);

    constructor() {
        if (typeof window === "undefined") return;

        listenOnlineStatus((status) => {
            this.#online = status;
        });
    }

    get value(): boolean {
        return this.#online;
    }
}

export const onlineStatus = new OnlineStatusTracker();
