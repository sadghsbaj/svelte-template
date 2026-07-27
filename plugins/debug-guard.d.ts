/**
 * @file debug-guard.ts
 * Vite plugin to warn developers when debug CSS classes are left in the codebase.
 *
 * This plugin scans raw source files from disk during the build phase for the
 * presence of "debug-border" utility classes. It emits a non-fatal console warning
 * at the very end of the build to ensure it isn't cleared by Vite's logger.
 */
import type { Plugin } from "vite";
export interface DebugGuardOptions {
    /** Custom paths or regex patterns to exclude from the check. */
    exclude?: (string | RegExp)[];
}
export declare function debugGuardPlugin(options?: DebugGuardOptions): Plugin;
