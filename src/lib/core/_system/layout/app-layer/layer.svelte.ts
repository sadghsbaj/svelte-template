/**
 * @file layer.svelte.ts
 * @description State management utilities for layers, handling application-level
 * inertness and scroll blocking for modal overlays.
 */

import { onDestroy } from "svelte";
import type { Attachment } from "svelte/attachments";

import { getLayerContext } from "./layer.context";

export {
    getLayerContext,
    setLayerContext,
    LAYER_CONTEXT_KEY,
    type LayerContext,
} from "./layer.context";

let blockCounter = 0;
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

    let currentlyActive = false;

    $effect(() => {
        const active = isActive();
        if (active !== currentlyActive) {
            layer.setContextActive(active);
            currentlyActive = active;
        }
    });

    onDestroy(() => {
        if (!currentlyActive) return;

        layer.setContextActive(false);
        currentlyActive = false;
    });
}

/**
 * Svelte 5 Attachment registering active layer state on element DOM mount
 * and automatically cleaning up on element DOM unmount.
 */
export const layerAttach: Attachment = () => {
    const layer = getLayerContext();
    if (!layer) return;

    let isAttached = false;

    queueMicrotask(() => {
        layer.setContextActive(true);
        isAttached = true;
    });

    return () => {
        if (!isAttached) return;

        layer.setContextActive(false);
        isAttached = false;
    };
};
