<script lang="ts">
    import { onDestroy, onMount } from "svelte";

    import { applySelectiveBlueprint } from "./selective-blueprint";

    interface Props {
        active?: boolean;
    }

    let { active = true }: Props = $props();

    let canvasEl = $state<HTMLCanvasElement | null>(null);
    let animFrameId: number | null = null;
    let mutationObs: MutationObserver | null = null;

    interface ElementBound {
        rect: DOMRect;
        depth: number;
    }

    function collectElements(node: Element, currentDepth: number, results: ElementBound[]): void {
        if (
            node.id === "dev-perf-overlay" ||
            node.id === "dev-dom-heatmap" ||
            Boolean(node.closest("#dev-perf-overlay")) ||
            Boolean(node.closest("#dev-dom-heatmap"))
        ) {
            return;
        }

        const htmlNode = node as HTMLElement;
        if (htmlNode.offsetWidth === 0 && htmlNode.offsetHeight === 0) {
            return;
        }

        const style = window.getComputedStyle(node);
        if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
            return;
        }

        const rect = node.getBoundingClientRect();
        results.push({ rect, depth: currentDepth });

        for (const child of node.children) {
            collectElements(child, currentDepth + 1, results);
        }
    }

    /**
     * Maps element depth strictly to rich, vibrant Green (<15), Orange (15-24), and Red (>=25).
     */
    function getDepthColor(depth: number): string {
        if (depth >= 25) return "#dc2626"; // Rich Vivid Red (Critical)
        if (depth >= 15) return "#ff6b00"; // Rich Electric Orange (Warning)
        return "#10b981"; // Rich Emerald Green (Optimal)
    }

    function renderHeatmap(): void {
        if (!canvasEl || !active || typeof window === "undefined") return;

        // Ensure newly rendered DOM nodes (e.g. Tab switches) are converted to blueprint
        applySelectiveBlueprint(true);

        const ctx = canvasEl.getContext("2d");
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        const pixelWidth = Math.round(width * dpr);
        const pixelHeight = Math.round(height * dpr);

        if (canvasEl.width !== pixelWidth || canvasEl.height !== pixelHeight) {
            canvasEl.width = pixelWidth;
            canvasEl.height = pixelHeight;
        }

        ctx.clearRect(0, 0, pixelWidth, pixelHeight);

        const elements: ElementBound[] = [];
        if (document.body) {
            for (const child of document.body.children) {
                collectElements(child, 2, elements);
            }
        }

        // Viewport frustum culling
        const visibleElements = elements.filter(
            ({ rect }) =>
                rect.right >= 0 &&
                rect.left <= width &&
                rect.bottom >= 0 &&
                rect.top <= height &&
                rect.width > 0 &&
                rect.height > 0
        );

        // Sort SHALLOWEST depth FIRST (ascending order so deeper elements overwrite shallow parents)
        visibleElements.sort((a, b) => a.depth - b.depth);

        // Create an offscreen buffer for solid, pixel-exact depth color mapping
        const offCanvas = document.createElement("canvas");
        offCanvas.width = pixelWidth;
        offCanvas.height = pixelHeight;
        const offCtx = offCanvas.getContext("2d");
        if (!offCtx) return;

        offCtx.scale(dpr, dpr);
        offCtx.globalAlpha = 1;
        offCtx.globalCompositeOperation = "source-over";

        // Draw Solid Fills (deeper children completely overwrite shallow parents cleanly)
        for (const { rect, depth } of visibleElements) {
            offCtx.fillStyle = getDepthColor(depth);
            offCtx.fillRect(rect.left, rect.top, rect.width, rect.height);
        }

        // Render offscreen depth map to main canvas with multiply blend mode (rich vibrant colors over white blueprint)
        ctx.globalAlpha = 0.58;
        ctx.drawImage(offCanvas, 0, 0);
    }

    function scheduleRender(): void {
        if (animFrameId !== null) return;
        animFrameId = requestAnimationFrame(() => {
            animFrameId = null;
            renderHeatmap();
        });
    }

    function cleanup(): void {
        applySelectiveBlueprint(false);
        if (animFrameId !== null) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }
        mutationObs?.disconnect();
        mutationObs = null;
    }

    $effect(() => {
        applySelectiveBlueprint(active);

        if (active) {
            scheduleRender();
        } else if (canvasEl) {
            const ctx = canvasEl.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
            }
        }

        return cleanup;
    });

    function handleScrollOrResize(): void {
        if (active) scheduleRender();
    }

    onMount(() => {
        window.addEventListener("scroll", handleScrollOrResize, { capture: true, passive: true });
        window.addEventListener("resize", handleScrollOrResize, { passive: true });

        if (typeof MutationObserver !== "undefined" && document.body) {
            mutationObs = new MutationObserver(() => {
                if (active) scheduleRender();
            });
            mutationObs.observe(document.body, {
                childList: true,
                subtree: true,
                attributes: true,
            });
        }

        return () => {
            window.removeEventListener("scroll", handleScrollOrResize, { capture: true });
            window.removeEventListener("resize", handleScrollOrResize);
            cleanup();
        };
    });

    onDestroy(cleanup);
</script>

{#if active}
    <canvas
        id="dev-dom-heatmap"
        bind:this={canvasEl}
        class="h-full w-full pointer-events-none inset-0 fixed z-1 mix-blend-multiply"
    ></canvas>
{/if}
