<script lang="ts">
    import { setContext, type Snippet } from "svelte";

    import { appInertState, LAYER_CONTEXT_KEY, type LayerContext } from "./layer.svelte";

    export interface AppLayerProps {
        layer: string;
        z?: number;
        inertApp?: boolean;
        children?: Snippet;
    }

    let { layer, z = 0, inertApp = false, children }: AppLayerProps = $props();

    let activeCount = $state(0);

    setContext<LayerContext>(LAYER_CONTEXT_KEY, {
        setContextActive: (active: boolean) => {
            if (active) {
                activeCount++;
            } else {
                activeCount = Math.max(0, activeCount - 1);
            }
        },
    });

    $effect(() => {
        if (!inertApp || activeCount <= 0) return;

        appInertState.block();
        return () => appInertState.unblock();
    });
</script>

<div data-layout="app-layer" data-layer={layer} style:z-index={z}>
    {@render children?.()}
</div>
