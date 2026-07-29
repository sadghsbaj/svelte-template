import { createContext } from "svelte";

/**
 * Context key symbol for layer state management (re-exported for backward compatibility in tests).
 */
export const LAYER_CONTEXT_KEY = Symbol("layer");

/**
 * Context interface provided by a Layer component to track active child content.
 */
export interface LayerContext {
    setContextActive: (active: boolean) => void;
}

/**
 * Type-safe Svelte 5 context getter and setter pair for layer state management.
 */
export const [getLayerContext, setLayerContext] = createContext<LayerContext>();
