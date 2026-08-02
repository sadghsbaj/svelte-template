<script lang="ts">
    import { onMount } from "svelte";

    import { initPreload } from "$core/_system";
    import FocusHost from "$core/_system/focus/FocusHost.svelte";
    import AppLayer from "$core/_system/layout/app-layer/AppLayer.svelte";
    import AppView from "$core/_system/layout/app-views/AppView.svelte";
    import AppViews from "$core/_system/layout/app-views/AppViews.svelte";
    import PerformanceHost from "$core/_system/performance/PerformanceHost.svelte";
    import { viewState } from "$views/view.svelte";

    // @template-remove-start
    import FloatingNavbar from "$lib/previews/FloatingNavbar.svelte";
    import HomeView from "$lib/previews/HomeView.svelte";
    import SettingsView from "$lib/previews/SettingsView.svelte";
    import Sidebar from "$lib/previews/Sidebar.svelte";
    import StatsView from "$lib/previews/StatsView.svelte";

    // @template-remove-end

    onMount(() => {
        return initPreload();
    });
</script>

<div class="flex h-screen w-screen overflow-hidden">
    <!-- @template-remove-start -->
    <Sidebar />
    <!-- @template-remove-end -->

    <main class="flex-1 h-full min-w-0 relative">
        <AppViews {viewState}>
            <!-- @template-remove-start -->
            <AppView view="home">
                <HomeView />
            </AppView>
            <AppView view="stats">
                <StatsView />
            </AppView>
            <AppView view="settings">
                <SettingsView />
            </AppView>
            <!-- @template-remove-end -->
        </AppViews>
    </main>
</div>

<!-- AppLayers -->
<AppLayer z="top-layer" layer="focus">
    <FocusHost />
</AppLayer>

{#if import.meta.env.DEV}
    <AppLayer z={9000} layer="performance">
        <PerformanceHost />
    </AppLayer>
{/if}

<!-- @template-remove-start -->
<AppLayer z={100} layer="floating-bar">
    <FloatingNavbar />
</AppLayer>
<!-- @template-remove-end -->
<!-- /AppLayers -->
