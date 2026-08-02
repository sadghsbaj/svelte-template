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
let isAppInertState = $state(false);
let savedPaddingRight = "";
let savedOverflow = "";

/**
 * Global reactive state manager for coordinating background inertness and body scroll locks
 * when modal overlays or dialog layers are active.
 */
export const appInertState = {
    get isAppInert() {
        return isAppInertState;
    },
    block() {
        blockCounter++;

        if (blockCounter === 1 && typeof window !== "undefined") {
            isAppInertState = true;

            const appMount = document.getElementById("app");
            if (appMount) appMount.inert = true;

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
            isAppInertState = false;

            const appMount = document.getElementById("app");
            if (appMount) appMount.inert = false;

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
 * Svelte 5 Attachment that teleports the element to directly after #app (i.e. a
 * direct child of <body> outside the app root), sets its z-index from the parent
 * AppLayer context, and keeps the layer's active state in sync.
 *
 * This is the single canonical layerAttach — import only from this file.
 */
export const layerAttach: Attachment = (element) => {
    const layer = getLayerContext();
    if (!layer) return;

    const node = element as HTMLElement;
    node.style.zIndex = String(layer.zIndex);

    const appMount = document.getElementById("app");
    if (appMount) {
        appMount.after(node);
    } else {
        document.body.append(node);
    }

    layer.setContextActive(true);

    return () => {
        layer.setContextActive(false);
        node.remove();
    };
};
