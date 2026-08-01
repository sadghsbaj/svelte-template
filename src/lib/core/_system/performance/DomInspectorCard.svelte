<script lang="ts">
    import { backOut, expoIn } from "svelte/easing";
    import { ChevronRight, Layers, MousePointerClick, X } from "@lucide/svelte";

    import { fly } from "$core/_system/motion";

    import { performanceState } from "./performanceState.svelte";

    interface Props {
        onClose: () => void;
    }

    let { onClose }: Props = $props();

    let overlayEl = $state<HTMLDivElement | null>(null);

    // Draggable State
    let isDragging = $state(false);
    let position = $state<{ x: number; y: number } | null>(null);
    let dragOffset = { x: 0, y: 0 };

    // Hovered Ancestor Highlight State
    let hoveredAncestorRect = $state<DOMRect | null>(null);

    interface AncestorNode {
        el: HTMLElement;
        depth: number;
        tagName: string;
        id: string;
        classes: string;
    }

    // Build hierarchy stack from document.body down to selectedElement
    let ancestryStack = $derived.by<AncestorNode[]>(() => {
        const target = performanceState.selectedElement;
        if (!target || typeof document === "undefined") return [];

        const chain: HTMLElement[] = [];
        let curr: HTMLElement | null = target;

        while (curr && curr !== document.documentElement) {
            chain.push(curr);
            curr = curr.parentElement;
        }

        chain.reverse();

        // Ensure chain starts at body (depth 1)
        const bodyIndex = chain.indexOf(document.body);
        const validChain = bodyIndex !== -1 ? chain.slice(bodyIndex) : chain;

        return validChain.map((node, index) => {
            const idStr = node.id ? `#${node.id}` : "";
            const classList = [...node.classList].slice(0, 2).join(".");
            const classStr = classList ? `.${classList}` : "";

            return {
                el: node,
                depth: index + 1, // body = 1
                tagName: node.tagName.toLowerCase(),
                id: idStr,
                classes: classStr,
            };
        });
    });

    let selectedNodeInfo = $derived.by(() => {
        if (ancestryStack.length === 0) return null;
        return ancestryStack.at(-1) ?? null;
    });

    // Pointer Drag handlers
    function handlePointerDown(e: PointerEvent) {
        if ((e.target as HTMLElement).closest("button")) return;

        isDragging = true;
        const rect = overlayEl?.getBoundingClientRect();

        if (rect) {
            dragOffset = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            };
        }

        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: PointerEvent) {
        if (!isDragging) return;

        position = {
            x: Math.max(
                10,
                Math.min(
                    window.innerWidth - (overlayEl?.offsetWidth || 380) - 10,
                    e.clientX - dragOffset.x
                )
            ),
            y: Math.max(
                10,
                Math.min(
                    window.innerHeight - (overlayEl?.offsetHeight || 300) - 10,
                    e.clientY - dragOffset.y
                )
            ),
        };
    }

    function handlePointerUp(e: PointerEvent) {
        if (!isDragging) return;
        isDragging = false;
        try {
            (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
            // ignore
        }
    }
</script>

<div
    id="dev-dom-inspector"
    bind:this={overlayEl}
    in:fly={{ y: -20, duration: 260, easing: backOut }}
    out:fly={{ y: -16, duration: 150, easing: expoIn }}
    style={position ? `left: ${position.x}px; top: ${position.y}px; right: auto;` : ""}
    class="text-strong font-sans p-4 border border-base-200/80 rounded-2xl w-[380px] pointer-events-auto select-none shadow-2xl left-4 top-4 fixed z-10 squircle-smooth dark:border-base-800/80 {performanceState.isHeatmapActive
        ? 'bg-elevation-1 backdrop-blur-none'
        : 'bg-elevation-1/90 backdrop-blur-xl'} {isDragging
        ? '!transition-none'
        : 'transition-colors duration-150'}"
>
    <!-- Header -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        onpointerdown={handlePointerDown}
        onpointermove={handlePointerMove}
        onpointerup={handlePointerUp}
        onpointercancel={handlePointerUp}
        class="pb-3 border-b border-base-200/60 flex cursor-grab select-none items-center justify-between dark:border-base-800/60 active:cursor-grabbing"
    >
        <div class="flex gap-2.5 items-center">
            <div class="text-cyan-600 p-1 rounded-lg bg-cyan-500/15 dark:text-cyan-400">
                <MousePointerClick class="h-4 w-4" />
            </div>
            <span class="text-sm text-strong tracking-wide font-semibold"> DOM Inspector </span>
        </div>

        <button
            onclick={onClose}
            class="text-weak p-1 rounded-lg transition-colors squircle-smooth hover:text-strong hover:bg-elevation-2"
            title="Close Inspector"
        >
            <X class="h-4.5 w-4.5" />
        </button>
    </div>

    <!-- Active Status / Selected Element Info -->
    {#if selectedNodeInfo}
        <div class="mt-2.5 p-2.5 rounded-xl bg-elevation-2 flex flex-col gap-1.5 squircle-smooth">
            <div class="flex items-center justify-between">
                <div class="text-[10px] text-weaker tracking-wider font-medium uppercase">
                    Selected Element
                </div>
                {#if selectedNodeInfo.depth >= 25}
                    <span
                        class="text-[11px] text-red-600 font-mono font-semibold px-2.5 py-0.5 border border-red-500/40 rounded-full bg-red-500/15 dark:text-red-400 dark:border-red-500/40"
                    >
                        Level {selectedNodeInfo.depth}
                    </span>
                {:else if selectedNodeInfo.depth >= 15}
                    <span
                        class="text-[11px] text-amber-600 font-mono font-semibold px-2.5 py-0.5 border border-amber-500/40 rounded-full bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/40"
                    >
                        Level {selectedNodeInfo.depth}
                    </span>
                {:else}
                    <span
                        class="text-[11px] text-emerald-600 font-mono font-semibold px-2.5 py-0.5 border border-emerald-500/40 rounded-full bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/40"
                    >
                        Level {selectedNodeInfo.depth}
                    </span>
                {/if}
            </div>

            <div class="text-xs text-strong font-bold font-mono truncate">
                &lt;{selectedNodeInfo.tagName}&gt;<span class="text-amber-500 font-normal"
                    >{selectedNodeInfo.id}</span
                ><span class="text-weak font-normal">{selectedNodeInfo.classes}</span>
            </div>
        </div>
    {:else}
        <div class="mt-2.5 p-2.5 text-center rounded-xl bg-elevation-2 squircle-smooth">
            <span class="text-xs text-weak font-medium">
                Click any element on the webpage to inspect its hierarchy tree
            </span>
        </div>
    {/if}

    <!-- Hierarchy Stack List -->
    {#if ancestryStack.length > 0}
        <div
            class="mt-2.5 pt-2.5 border-t border-base-200/60 flex flex-col gap-1 dark:border-base-800/60"
        >
            <div
                class="text-[10px] text-weaker tracking-wider font-medium mb-0.5 flex gap-1.5 uppercase items-center"
            >
                <Layers class="h-3 w-3" />
                <span>Ancestry Tree (Root &rarr; Target)</span>
            </div>

            <div class="scrollbar-thin pr-1 flex flex-col gap-1 max-h-[300px] overflow-y-auto">
                {#each ancestryStack as item (item.depth)}
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <div
                        onmouseenter={() => {
                            hoveredAncestorRect = item.el.getBoundingClientRect();
                        }}
                        onmouseleave={() => {
                            hoveredAncestorRect = null;
                        }}
                        onclick={() => {
                            performanceState.selectElement(item.el);
                        }}
                        class="text-xs font-mono p-1.5 px-2 rounded-lg flex cursor-pointer transition-colors items-center justify-between squircle-smooth {item.el ===
                        performanceState.selectedElement
                            ? 'text-cyan-700 border border-cyan-500/30 bg-cyan-500/15 dark:text-cyan-300'
                            : 'text-strong bg-elevation-1 dark:bg-elevation-1/60 hover:bg-elevation-2'}"
                    >
                        <div class="flex gap-2 truncate items-center">
                            {#if item.depth >= 25}
                                <span
                                    class="text-[10px] text-red-600 font-bold shrink-0 w-6 dark:text-red-400"
                                    >L{item.depth}</span
                                >
                            {:else if item.depth >= 15}
                                <span
                                    class="text-[10px] text-amber-600 font-bold shrink-0 w-6 dark:text-amber-400"
                                    >L{item.depth}</span
                                >
                            {:else}
                                <span
                                    class="text-[10px] text-emerald-600 font-bold shrink-0 w-6 dark:text-emerald-400"
                                    >L{item.depth}</span
                                >
                            {/if}

                            <span class="text-emerald-600 font-bold dark:text-emerald-400"
                                >&lt;{item.tagName}&gt;</span
                            >
                            <span class="text-amber-500 truncate">{item.id}</span>
                            <span class="text-weaker truncate">{item.classes}</span>
                        </div>

                        <ChevronRight class="text-weaker shrink-0 h-3 w-3" />
                    </div>
                {/each}
            </div>
        </div>
    {/if}
</div>

<!-- Highlight parent element when hovering an ancestor item in the tree list -->
{#if hoveredAncestorRect}
    <div
        id="dev-inspector-parent-highlight"
        class="border-2 border-amber-500/80 rounded bg-amber-500/15 pointer-events-none shadow-sm transition-all duration-75 fixed z-9 dark:border-amber-400/80 dark:bg-amber-400/15"
        style="left: {hoveredAncestorRect.left}px; top: {hoveredAncestorRect.top}px; width: {hoveredAncestorRect.width}px; height: {hoveredAncestorRect.height}px;"
    ></div>
{/if}
