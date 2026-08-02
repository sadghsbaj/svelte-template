<script lang="ts" generics="T extends string">
    import type { Snippet } from "svelte";

    import { setViewStateContext } from "./view.context";
    import type { ViewState } from "./view-state/viewState.svelte";

    let { viewState, children }: { viewState: ViewState<T>; children?: Snippet } = $props();

    setViewStateContext(() => viewState as unknown as ViewState<string>);
</script>

<div class="app-views">
    {@render children?.()}
</div>
