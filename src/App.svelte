<script lang="ts">
    import AppLayer from "$core/_system/layout/app-layer/AppLayer.svelte";
    import AppLayers from "$core/_system/layout/app-layer/AppLayers.svelte";
    import AppStage from "$core/_system/layout/app-stage/AppStage.svelte";
    import AppView from "$core/_system/layout/app-views/AppView.svelte";
    import AppViews from "$core/_system/layout/app-views/AppViews.svelte";
    import { viewState } from "$views/view.svelte";

    // @template-remove-start
    import DemoView from "$lib/previews/DemoView.svelte";

    // @template-remove-end
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

<AppLayers>
    <!-- Example usage: -->
    <AppLayer z={0} layer="">
        <!-- ...Host.svelte -->
    </AppLayer>
</AppLayers>
