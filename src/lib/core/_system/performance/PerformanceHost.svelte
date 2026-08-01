<script lang="ts">
    import { onMount } from "svelte";

    import DomHeatmap from "./DomHeatmap.svelte";
    import PerformanceCard from "./PerformanceCard.svelte";
    import { performanceState } from "./performanceState.svelte";

    let isVisible = $state(true);

    onMount(() => {
        if (!import.meta.env.DEV) return;

        performanceState.start();

        let cleanupShortcut: (() => void) | undefined;

        (async () => {
            const { appShortcut } = await import("$modules/shortcut");

            cleanupShortcut = appShortcut.register("Alt+P", () => {
                isVisible = !isVisible;
            });
        })();

        return () => {
            performanceState.stop();
            cleanupShortcut?.();
        };
    });
</script>

{#if isVisible}
    {#if performanceState.isHeatmapActive}
        <DomHeatmap active={true} />
    {/if}

    <PerformanceCard
        isHeatmapActive={performanceState.isHeatmapActive}
        onToggleHeatmap={() => performanceState.toggleHeatmap()}
        onClose={() => {
            performanceState.stopHeatmap();
            isVisible = false;
        }}
    />
{/if}
