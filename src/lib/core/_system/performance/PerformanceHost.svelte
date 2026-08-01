<script lang="ts">
    import { onMount } from "svelte";

    import DomHeatmap from "./DomHeatmap.svelte";
    import DomInspector from "./DomInspector.svelte";
    import DomInspectorCard from "./DomInspectorCard.svelte";
    import PerformanceCard from "./PerformanceCard.svelte";
    import { performanceState } from "./performanceState.svelte";

    let isVisible = $state(false);

    onMount(() => {
        if (!import.meta.env.DEV) return;

        performanceState.start();

        const cleanups: (() => void)[] = [];

        (async () => {
            const { appShortcut } = await import("$modules/shortcut");

            cleanups.push(
                appShortcut.register("Alt+P", () => {
                    isVisible = !isVisible;
                }),
                appShortcut.register("Alt+H", () => {
                    if (isVisible) {
                        performanceState.toggleHeatmap();
                    }
                }),
                appShortcut.register("Alt+I", () => {
                    if (isVisible) {
                        performanceState.toggleInspector();
                    }
                })
            );
        })();

        return () => {
            performanceState.stop();
            for (const cleanup of cleanups) {
                cleanup();
            }
        };
    });
</script>

{#if isVisible}
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
{/if}
