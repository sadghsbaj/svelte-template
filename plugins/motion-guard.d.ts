/**
 * @file motion-guard.ts
 * Vite plugin to enforce the use of custom motion wrappers instead of native Svelte ones.
 *
 * This compiler-level guard intercepts files during the Vite development and build phases.
 * It raises structured compiler errors if it detects direct imports from "svelte/transition",
 * "svelte/animate", or "svelte/motion". This prevents developers from accidentally bypassing
 * the library's reduced-motion preference coordination.
 */
import type { Plugin } from "vite";
export interface MotionGuardOptions {
    /**
     * Custom paths or regex patterns to exclude from the check.
     */
    exclude?: (string | RegExp)[];
}
export declare function motionGuardPlugin(options?: MotionGuardOptions): Plugin;
