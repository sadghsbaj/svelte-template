import { createContext } from "svelte";

export interface LayerContext {
    readonly layer: string;
    readonly zIndex: number;
    setContextActive: (active: boolean) => void;
}

export const LAYER_CONTEXT_KEY = Symbol("layer");

const [getRequiredLayerContext, setLayerContext] = createContext<LayerContext>();

export { setLayerContext };

export function getLayerContext(): LayerContext | undefined {
    try {
        return getRequiredLayerContext();
    } catch {
        return undefined;
    }
}
