/**
 * @file layer.svelte.ts
 * @description State management utilities for layers, handling application-level
 * inertness and scroll blocking for modal overlays.
 */

import { getContext } from "svelte";

/**
 * Context interface provided by a Layer component to track active child content.
 */
export interface LayerContext {
    setContextActive: (active: boolean) => void;
}

let blockCounter = $state(0);

/**
 * Global reactive state manager for coordinating background inertness and body scroll locks
 * when modal overlays or dialog layers are active.
 */
export const appInertState = {
    get isAppInert() {
        return blockCounter > 0;
    },
    block() {
        blockCounter++;

        if (blockCounter === 1 && typeof window !== "undefined") {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }

            document.body.style.overflow = "hidden";
        }
    },
    unblock() {
        blockCounter--;

        if (blockCounter === 0 && typeof window !== "undefined") {
            document.body.style.paddingRight = "";
            document.body.style.overflow = "";
        }
    },
};

/**
 * Synchronizes the active state of an overlay component with its parent Layer context.
 *
 * @param isActive - A getter function returning the active state of the component.
 */
export function syncLayerState(isActive: () => boolean) {
    const layer = getContext<LayerContext>("layer");
    if (!layer) return;

    $effect(() => {
        layer.setContextActive(isActive());
    });
}
