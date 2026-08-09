<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { performanceState } from "./performanceState.svelte";

    let hoverBoxRect = $state<DOMRect | null>(null);

    function isIgnoredElement(el: Element): boolean {
        return (
            el.id === "dev-perf-overlay" ||
            el.id === "dev-dom-heatmap" ||
            el.id === "dev-dom-inspector" ||
            Boolean(el.closest("#dev-perf-overlay")) ||
            Boolean(el.closest("#dev-dom-heatmap")) ||
            Boolean(el.closest("#dev-dom-inspector"))
        );
    }

    function handlePointerMove(e: PointerEvent): void {
        if (!performanceState.isInspectorActive) return;

        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target || isIgnoredElement(target)) {
            hoverBoxRect = null;
            return;
        }

        hoverBoxRect = target.getBoundingClientRect();
    }

    function handleClick(e: MouseEvent): void {
        if (!performanceState.isInspectorActive) return;

        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (!target || isIgnoredElement(target)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        performanceState.selectElement(target as HTMLElement);
    }

    onMount(() => {
        window.addEventListener("pointermove", handlePointerMove, { passive: true });
        window.addEventListener("click", handleClick, { capture: true });

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("click", handleClick, { capture: true });
        };
    });

    onDestroy(() => {
        hoverBoxRect = null;
    });
</script>

{#if performanceState.isInspectorActive && hoverBoxRect}
    <div
        id="dev-dom-inspector-hover"
        class="border-2 border-cyan-500/80 rounded bg-cyan-500/10 pointer-events-none shadow-sm fixed z-9 t-75-sine-out dark:border-cyan-400/80 dark:bg-cyan-400/10"
        style="left: {hoverBoxRect.left}px; top: {hoverBoxRect.top}px; width: {hoverBoxRect.width}px; height: {hoverBoxRect.height}px;"
    ></div>
{/if}
