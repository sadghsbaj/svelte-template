<script lang="ts" generics="T extends string">
    import type { Snippet } from "svelte";

    import type { ViewState } from "./view-state/viewState.svelte";
    import { setViewStateContext } from "./view.context";

    let { viewState, children }: { viewState: ViewState<T>; children?: Snippet } = $props();

    setViewStateContext(() => viewState as unknown as ViewState<string>);
</script>

<div class="app-views">
    {@render children?.()}
</div>
