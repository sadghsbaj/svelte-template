<script lang="ts">
    import { onMount } from "svelte";

    import { initPreload } from "$core/_system";
    import AppLayer from "$core/_system/layout/app-layer/AppLayer.svelte";
    import AppStage from "$core/_system/layout/app-stage/AppStage.svelte";
    import AppView from "$core/_system/layout/app-views/AppView.svelte";
    import AppViews from "$core/_system/layout/app-views/AppViews.svelte";
    import PerformanceHost from "$core/_system/performance/PerformanceHost.svelte";
    import { viewState } from "$views/view.svelte";

    // @template-remove-start
    import DemoView from "$lib/previews/DemoView.svelte";

    // @template-remove-end

    onMount(() => {
        return initPreload();
    });
</script>

<AppStage>
    <AppViews {viewState}>
        <!-- @template-remove-start -->
        <AppView view="demo">
            <DemoView />
        </AppView>
        <!-- @template-remove-end -->
    </AppViews>
</AppStage>

<!-- AppLayers -->
{#if import.meta.env.DEV}
    <AppLayer z="top-layer" layer="performance">
        <PerformanceHost />
    </AppLayer>
{/if}
<!-- /AppLayers -->
