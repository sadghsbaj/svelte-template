/**
 * @file layer.svelte.ts
 * @description State management utilities for layers, handling application-level
 * inertness and scroll blocking for modal overlays.
 */

import { getLayerContext } from "./layer.context";

export {
    getLayerContext,
    setLayerContext,
    LAYER_CONTEXT_KEY,
    type LayerContext,
} from "./layer.context";

let blockCounter = $state(0);
let savedPaddingRight = "";
let savedOverflow = "";

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
            savedPaddingRight = document.body.style.paddingRight;
            savedOverflow = document.body.style.overflow;

            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }

            document.body.style.overflow = "hidden";
        }
    },
    unblock() {
        if (blockCounter === 0) return;

        blockCounter--;

        if (blockCounter === 0 && typeof window !== "undefined") {
            document.body.style.paddingRight = savedPaddingRight;
            document.body.style.overflow = savedOverflow;
            savedPaddingRight = "";
            savedOverflow = "";
        }
    },
};

/**
 * Synchronizes the active state of an overlay component with its parent Layer context.
 *
 * @param isActive - A getter function returning the active state of the component.
 */
export function syncLayerState(isActive: () => boolean) {
    const layer = getLayerContext();
    if (!layer) return;

    $effect(() => {
        const active = isActive();
        layer.setContextActive(active);
        return () => {
            if (active) layer.setContextActive(false);
        };
    });
}
