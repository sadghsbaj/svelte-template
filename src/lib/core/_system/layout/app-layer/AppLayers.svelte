<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
    }

    // eslint-disable-next-line prefer-const
    let { children }: Props = $props();
</script>

<div data-layout="app-layers">
    {@render children?.()}
</div>

<style>
    /*
     * AppLayers container and AppLayer wrapper elements set pointer-events: none
     * to prevent empty layer wrappers from blocking interactions with lower DOM elements.
     * Interactive children rendered inside AppLayer must explicitly set `pointer-events: auto`.
     */
    [data-layout="app-layers"] {
        pointer-events: none;

        /* App layers: */
        > :global([data-layout="app-layer"]) {
            position: fixed;
            inset: 0;
            pointer-events: none;
        }
    }
</style>
