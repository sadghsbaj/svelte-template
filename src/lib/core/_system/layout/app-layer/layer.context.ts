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
    if (!ctx) return;

    node.style.zIndex = String(ctx.zIndex);

    const appMount = document.getElementById("app");
    if (appMount) {
        appMount.after(node);
    } else {
        document.body.append(node);
    }

    ctx.setContextActive(true);

    return () => {
        ctx.setContextActive(false);
        node.remove();
    };
}
