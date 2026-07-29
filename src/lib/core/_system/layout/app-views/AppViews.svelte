<script lang="ts" generics="T extends string">
    import type { Snippet } from "svelte";

    import { setViewStateContext } from "./view.context";
    import type { ViewState } from "./viewState.svelte";

    let { viewState, children }: { viewState: ViewState<T>; children?: Snippet } = $props();

    setViewStateContext(() => viewState as unknown as ViewState<string>);
</script>

<div data-layout="app-views">
    {@render children?.()}
</div>

<style>
    [data-layout="app-views"] {
        display: grid;
        flex: 1;
        grid-template-areas: "app-view";
        width: 100%;
        min-height: 0;
        overflow: hidden;

        /* App Views: */
        > :global([data-layout="app-view"]) {
            grid-area: app-view;
            width: 100%;
            height: 100%;
            overflow-y: var(--app-view-overflow, auto);
        }
    }
</style>
