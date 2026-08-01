/**
 * @file performanceState.svelte.ts
 * Svelte 5 Rune-based performance state manager.
 */

export class PerformanceState {
    fps = $state(60);
    domCount = $state(0);
    eventLoopLag = $state(0);
}

export const performanceState = new PerformanceState();
