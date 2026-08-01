<script lang="ts">
    import { onMount } from "svelte";

    let isVisible = $state(false);

    onMount(() => {
        if (!import.meta.env.DEV) return;

        let cleanup: (() => void) | undefined;

        (async () => {
            const { appShortcut } = await import("$modules/shortcut");

            cleanup = appShortcut.register("Alt+P", () => {
                isVisible = !isVisible;
            });
        })();

        return () => {
            cleanup?.();
        };
    });
</script>

{#if isVisible}
    <div>Test</div>
{/if}
