<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        children?: Snippet;
    }

    let { children }: Props = $props();
</script>

<div data-layout="app-layers">
    {@render children?.()}
</div>

<style>
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
