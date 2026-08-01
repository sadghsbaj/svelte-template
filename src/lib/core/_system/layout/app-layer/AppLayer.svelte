<script lang="ts">
    import type { Snippet } from "svelte";

    import { setLayerContext } from "./layer.context";
    import { appInertState } from "./layer.svelte";

    export interface AppLayerProps {
        layer: string;
        z?: number | "top-layer";
        inertApp?: boolean;
        children?: Snippet;
    }

    let { layer, z = 0, inertApp = false, children }: AppLayerProps = $props();

    let activeCount = $state(0);

    const TOP_LAYER_Z = 10_000;
    const computedZ = $derived(z === "top-layer" ? TOP_LAYER_Z : (z ?? 0));

    setLayerContext({
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

<div data-layout="app-layer" data-layer={layer} style:z-index={computedZ}>
    {@render children?.()}
</div>
