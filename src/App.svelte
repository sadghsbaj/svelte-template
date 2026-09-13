<script lang="ts">
    import { onMount } from "svelte";

    import { initPreload } from "$core/_system";
    import FocusHost from "$core/_system/focus/FocusHost.svelte";
    import AppLayer from "$core/_system/layout/app-layer/AppLayer.svelte";
    import AppLayerHost from "$core/_system/layout/app-layer/AppLayerHost.svelte";
    import AppView from "$core/_system/layout/app-views/AppView.svelte";
    import AppViews from "$core/_system/layout/app-views/AppViews.svelte";
    import PerformanceHost from "$core/_system/performance/PerformanceHost.svelte";
    import { viewState } from "$views/view.svelte";

    // @template-remove-start
    import ComponentsView from "$lib/previews/ComponentsView.svelte";
    import FloatingNavbar from "$lib/previews/FloatingNavbar.svelte";
    import PlaygroundView from "$lib/previews/PlaygroundView.svelte";
    import SettingsView from "$lib/previews/SettingsView.svelte";

    // @template-remove-end

    onMount(() => {
        return initPreload();
    });
</script>

<AppViews {viewState}>
    <!-- @template-remove-start -->
    <AppView view="components">
        <ComponentsView />
    </AppView>
    <AppView view="playground">
        <PlaygroundView />
    </AppView>
    <AppView view="settings">
        <SettingsView />
    </AppView>
    <!-- @template-remove-end -->
</AppViews>

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

<!-- Keep permanent hosts last so dynamic utility layers remain later in body paint order. -->
<AppLayer z={1000} layer="floating">
    <AppLayerHost />
</AppLayer>
<!-- /AppLayers -->
