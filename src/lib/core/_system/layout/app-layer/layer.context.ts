import { createContext } from "svelte";

export interface LayerContext {
    readonly layer: string;
    readonly zIndex: number;
    setContextActive: (active: boolean) => void;
}

export const LAYER_CONTEXT_KEY = Symbol("layer");

export const [getLayerContext, setLayerContext] = createContext<LayerContext>();

export function layerAttach(node: HTMLElement) {
    const ctx = getLayerContext();

    node.style.pointerEvents = "none";
    node.style.zIndex = String(ctx.zIndex);

    ctx.setContextActive(true);

    return () => {
        ctx.setContextActive(false);
    };
}
