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

    const TOP_LAYER_Z = 10_000;

    let activeCount = $state(0);
    const computedZ = $derived(z === "top-layer" ? TOP_LAYER_Z : (z ?? 0));

    setLayerContext({
        get layer() {
            return layer;
        },
        get zIndex() {
            return computedZ;
        },
        setContextActive: (active: boolean) => {
            queueMicrotask(() => {
                if (active) {
                    activeCount++;
                } else {
                    activeCount = Math.max(0, activeCount - 1);
                }
            });
        },
    });

    $effect(() => {
        if (!inertApp || activeCount <= 0) return;

        appInertState.block();
        return () => appInertState.unblock();
    });
</script>

{@render children?.()}
