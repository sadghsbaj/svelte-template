<script lang="ts">
    import { setContext, type Snippet } from "svelte";

    import { appInertState, type LayerContext } from "./layer.svelte";

    interface Props {
        layer: string;
        z: number;
        inertApp?: boolean;
        children?: Snippet;
    }

    const { layer, z, inertApp = false, children }: Props = $props();

    let hasActiveContent = $state(false);

    setContext<LayerContext>("layer", {
        setContextActive: (active: boolean) => {
            hasActiveContent = active;
        },
    });

    $effect(() => {
        if (inertApp && hasActiveContent) {
            appInertState.block();
            return () => appInertState.unblock();
        }
    });
</script>

<div data-layout="app-layer" data-layer={layer} style="z-index: {z};">
    {@render children?.()}
</div>
