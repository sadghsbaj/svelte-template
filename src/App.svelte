<script lang="ts">
    import { onMount } from "svelte";

    import { initPreload } from "$core/_system";
    import AppLayer from "$core/_system/layout/app-layer/AppLayer.svelte";
    import AppView from "$core/_system/layout/app-views/AppView.svelte";
    import AppViews from "$core/_system/layout/app-views/AppViews.svelte";
    import PerformanceHost from "$core/_system/performance/PerformanceHost.svelte";
    import { viewState } from "$views/view.svelte";

    import HomeView from "$lib/previews/HomeView.svelte";
    import SettingsView from "$lib/previews/SettingsView.svelte";
    import StatsView from "$lib/previews/StatsView.svelte";

    onMount(() => {
        return initPreload();
    });
</script>

<AppViews {viewState}>
    <AppView view="home">
        <HomeView />
    </AppView>
    <AppView view="stats">
        <StatsView />
    </AppView>
    <AppView view="settings">
        <SettingsView />
    </AppView>
</AppViews>

<!-- AppLayers -->
{#if import.meta.env.DEV}
    <AppLayer z="top-layer" layer="performance">
        <PerformanceHost />
    </AppLayer>
{/if}
<!-- /AppLayers -->
