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

interface LayerHostRegistration {
    element: HTMLElement;
    setContextActive: (active: boolean) => void;
}

type LayerHostListener = (host: LayerHostRegistration | null) => void;

// These registries use explicit subscriptions; Svelte reactivity would add unused tracking.
// eslint-disable-next-line svelte/prefer-svelte-reactivity
const layerHosts = new Map<string, LayerHostRegistration>();
// eslint-disable-next-line svelte/prefer-svelte-reactivity
const layerHostListeners = new Map<string, Set<LayerHostListener>>();

function notifyLayerHostListeners(layer: string): void {
    const host = layerHosts.get(layer) ?? null;
    const listeners = layerHostListeners.get(layer);
    if (!listeners) return;
    for (const listener of listeners) listener(host);
}

function subscribeToLayerHost(layer: string, listener: LayerHostListener): () => void {
    // eslint-disable-next-line svelte/prefer-svelte-reactivity
    const listeners = layerHostListeners.get(layer) ?? new Set<LayerHostListener>();
    listeners.add(listener);
    layerHostListeners.set(layer, listeners);
    listener(layerHosts.get(layer) ?? null);

    return () => {
        listeners.delete(listener);
        if (listeners.size === 0) layerHostListeners.delete(layer);
    };
}

function moveToBodyLayer(node: HTMLElement): void {
    const appMount = document.getElementById("app");
    if (appMount) appMount.after(node);
    else document.body.append(node);
}

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
export function syncLayerState(isActive: () => boolean): void {
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

    let assignedPosition = false;
    if (typeof window !== "undefined" && window.getComputedStyle(node).position === "static") {
        node.style.position = "relative";
        assignedPosition = true;
    }

    moveToBodyLayer(node);

    layer.setContextActive(true);

    return () => {
        layer.setContextActive(false);
        if (assignedPosition) {
            node.style.position = "";
        }
        node.remove();
    };
};

/** Registers a permanent, named portal destination for an AppLayer. */
export const layerHostAttach: Attachment = (element) => {
    const layer = getLayerContext();
    if (!layer) return;

    const node = element as HTMLElement;
    const registration: LayerHostRegistration = {
        element: node,
        setContextActive: layer.setContextActive,
    };

    node.style.zIndex = String(layer.zIndex);
    moveToBodyLayer(node);
    layerHosts.set(layer.layer, registration);
    notifyLayerHostListeners(layer.layer);

    return () => {
        if (layerHosts.get(layer.layer) === registration) {
            layerHosts.delete(layer.layer);
            notifyLayerHostListeners(layer.layer);
        }
        node.remove();
    };
};

/** Portals an element into the currently registered host for a named AppLayer. */
export function portalToLayer(layer: string): Attachment {
    return (element) => {
        const node = element as HTMLElement;
        let currentHost: LayerHostRegistration | null = null;
        let initialized = false;

        const move = (nextHost: LayerHostRegistration | null): void => {
            if (initialized && nextHost === currentHost) return;
            initialized = true;
            currentHost?.setContextActive(false);
            currentHost = nextHost;

            if (currentHost) {
                currentHost.element.append(node);
                currentHost.setContextActive(true);
            } else {
                node.remove();
            }
        };

        const unsubscribe = subscribeToLayerHost(layer, move);

        return () => {
            unsubscribe();
            currentHost?.setContextActive(false);
            currentHost = null;
            node.remove();
        };
    };
}
