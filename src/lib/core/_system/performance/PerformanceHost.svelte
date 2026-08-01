<script lang="ts">
    import { onMount } from "svelte";

    import PerformanceCard from "./PerformanceCard.svelte";
    import { performanceState } from "./performanceState.svelte";

    let isVisible = $state(true);
    let isHeatmapActive = $state(false);

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
    <PerformanceCard
        {isHeatmapActive}
        onToggleHeatmap={() => (isHeatmapActive = !isHeatmapActive)}
        onClose={() => (isVisible = false)}
    />
{/if}
