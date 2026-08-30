<script lang="ts">
    import { onMount } from "svelte";

    import { layerAttach } from "$core/_system/layout/app-layer/layer.svelte";
    import { appShortcut } from "$modules/shortcut";

    import DomHeatmap from "./DomHeatmap.svelte";
    import DomInspector from "./DomInspector.svelte";
    import DomInspectorCard from "./DomInspectorCard.svelte";
    import PerformanceCard from "./PerformanceCard.svelte";
    import { performanceState } from "./performanceState.svelte";

    let isVisible = $state(false);

    onMount(() => {
        if (!import.meta.env.DEV) return;

        performanceState.start();

        const unregisterP = appShortcut.register(
            "Alt+P",
            () => {
                isVisible = !isVisible;
            },
            { allowInInput: true }
        );

        const unregisterH = appShortcut.register(
            "Alt+H",
            () => {
                if (isVisible) {
                    performanceState.toggleHeatmap();
                }
            },
            { allowInInput: true }
        );

        const unregisterI = appShortcut.register(
            "Alt+I",
            () => {
                if (isVisible) {
                    performanceState.toggleInspector();
                }
            },
            { allowInInput: true }
        );

        return () => {
            performanceState.stop();
            unregisterP();
            unregisterH();
            unregisterI();
        };
    });
</script>

{#if isVisible}
    <div {@attach layerAttach}>
        {#if performanceState.isHeatmapActive}
            <DomHeatmap active={true} />
        {/if}

        {#if performanceState.isInspectorActive}
            <DomInspector />
        {/if}

        {#if performanceState.isInspectorActive || performanceState.selectedElement}
            <DomInspectorCard onClose={() => performanceState.stopInspector()} />
        {/if}

        <PerformanceCard
            isHeatmapActive={performanceState.isHeatmapActive}
            isInspectorActive={performanceState.isInspectorActive}
            onToggleHeatmap={() => performanceState.toggleHeatmap()}
            onToggleInspector={() => performanceState.toggleInspector()}
            onClose={() => {
                performanceState.stopHeatmap();
                performanceState.stopInspector();
                isVisible = false;
            }}
        />
    </div>
{/if}
