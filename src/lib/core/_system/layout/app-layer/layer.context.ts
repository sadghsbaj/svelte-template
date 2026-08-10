import { createContext } from "svelte";

export interface LayerContext {
    readonly layer: string;
    readonly zIndex: number;
    setContextActive: (active: boolean) => void;
}

export const LAYER_CONTEXT_KEY = Symbol("layer");

export const [getLayerContext, setLayerContext] = createContext<LayerContext>();
