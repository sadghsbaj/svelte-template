<script lang="ts">
    import { onMount } from "svelte";

    import { initPreload } from "$core/_system";
    import AppLayer from "$core/_system/layout/app-layer/AppLayer.svelte";
    import AppView from "$core/_system/layout/app-views/AppView.svelte";
    import AppViews from "$core/_system/layout/app-views/AppViews.svelte";
    import PerformanceHost from "$core/_system/performance/PerformanceHost.svelte";
    import { viewState } from "$views/view.svelte";

    onMount(() => {
        return initPreload();
    });
</script>

<AppViews {viewState}>
    <AppView view="home">
        <main class="text-center flex-center flex-col gap-2 h-full">
            <h1 class="text-2xl text-neutral-100 tracking-tight font-semibold">Svelte 5 App</h1>
            <p class="text-sm text-neutral-400">Clean starter canvas</p>
        </main>
    </AppView>
</AppViews>

<!-- AppLayers -->
{#if import.meta.env.DEV}
    <AppLayer z="top-layer" layer="performance">
        <PerformanceHost />
    </AppLayer>
{/if}
<!-- /AppLayers -->
