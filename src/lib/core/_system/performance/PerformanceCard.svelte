<script lang="ts">
    import { onMount } from "svelte";
    import { backOut, expoIn } from "svelte/easing";
    import {
        Activity,
        Flame,
        HardDrive,
        Hash,
        Layers,
        Maximize,
        MousePointerClick,
        X,
    } from "@lucide/svelte";

    import { fly } from "$core/_system/motion";

    import { performanceState } from "./performanceState.svelte";

    interface Props {
        isHeatmapActive?: boolean;
        isInspectorActive?: boolean;
        onToggleHeatmap?: () => void;
        onToggleInspector?: () => void;
        onClose?: () => void;
    }

    let {
        isHeatmapActive = false,
        isInspectorActive = false,
        onToggleHeatmap,
        onToggleInspector,
        onClose,
    }: Props = $props();

    const STORAGE_KEY = "dev_perf_overlay_pos";

    let position = $state<{ x: number; y: number } | null>(null);
    let isDragging = $state(false);
    let dragOffset = { x: 0, y: 0 };
    let overlayEl = $state<HTMLElement | null>(null);

    // Derived metric data lists for clean iteration
    const summaryItems = $derived([
        { label: "FPS", value: performanceState.fps },
        { label: "DOM NODES", value: performanceState.domCount },
        { label: "LOOP LAG", value: performanceState.eventLoopLag, suffix: "ms" },
    ]);

    const vitalItems = $derived([
        { label: "CLS", value: performanceState.cls },
        { label: "LCP", value: performanceState.lcp, suffix: "ms" },
        { label: "INP", value: performanceState.inp, suffix: "ms" },
    ]);

    // Memory Heap Tier calculation
    const memoryTier = $derived.by(() => {
        const used = performanceState.heapUsed;
        if (used <= 35) {
            return {
                level: 1,
                label: "Optimal",
                color: "text-emerald-600 dark:text-emerald-400",
                bg: "bg-emerald-500",
            };
        }
        if (used <= 75) {
            return {
                level: 2,
                label: "Good",
                color: "text-emerald-500 dark:text-emerald-400",
                bg: "bg-emerald-400",
            };
        }
        if (used <= 150) {
            return {
                level: 3,
                label: "Moderate",
                color: "text-amber-600 dark:text-amber-400",
                bg: "bg-amber-400",
            };
        }
        if (used <= 300) {
            return {
                level: 4,
                label: "High",
                color: "text-orange-600 dark:text-orange-400",
                bg: "bg-orange-500",
            };
        }
        return {
            level: 5,
            label: "Critical",
            color: "text-red-600 dark:text-red-400",
            bg: "bg-red-500",
        };
    });

    // DOM Health overall status incorporating both total element count and max nesting depth
    const domHealthRating = $derived.by(() => {
        const count = performanceState.domCount;
        const depth = performanceState.domDepth;

        if (count >= 1500 || depth >= 25) {
            return {
                status: "Critical",
                textClass: "text-red-600 dark:text-red-400",
                borderClass: "border-red-500/40 bg-red-500/15",
            };
        }
        if (count >= 800 || depth >= 15) {
            return {
                status: "Warning",
                textClass: "text-amber-600 dark:text-amber-400",
                borderClass: "border-amber-500/40 bg-amber-500/15",
            };
        }
        return {
            status: "Optimal",
            textClass: "text-emerald-600 dark:text-emerald-400",
            borderClass: "border-emerald-500/40 bg-emerald-500/15",
        };
    });

    function clampPosition(x: number, y: number): { x: number; y: number } {
        const overlayWidth = 375;
        const overlayHeight = 360;
        const margin = 12;

        const maxX = Math.max(margin, window.innerWidth - overlayWidth - margin);
        const maxY = Math.max(margin, window.innerHeight - overlayHeight - margin);

        return {
            x: Math.min(Math.max(margin, x), maxX),
            y: Math.min(Math.max(margin, y), maxY),
        };
    }

    function handleResize() {
        if (position) {
            position = clampPosition(position.x, position.y);
        }
    }

    function handlePointerDown(e: PointerEvent) {
        if ((e.target as HTMLElement).closest("button")) return;
        if (!overlayEl) return;

        const rect = overlayEl.getBoundingClientRect();
        dragOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };

        isDragging = true;
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    function handlePointerMove(e: PointerEvent) {
        if (!isDragging) return;

        const rawX = e.clientX - dragOffset.x;
        const rawY = e.clientY - dragOffset.y;

        position = clampPosition(rawX, rawY);
    }

    function handlePointerUp(_e: PointerEvent) {
        if (!isDragging) return;
        isDragging = false;

        if (position) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
            } catch {
                // ignore
            }
        }
    }

    onMount(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (typeof parsed.x === "number" && typeof parsed.y === "number") {
                    position = clampPosition(parsed.x, parsed.y);
                }
            }
        } catch {
            // ignore
        }

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    });
</script>

<div
    id="dev-perf-overlay"
    bind:this={overlayEl}
    in:fly={{ y: -20, duration: 260, easing: backOut }}
    out:fly={{ y: -16, duration: 150, easing: expoIn }}
    style={position ? `left: ${position.x}px; top: ${position.y}px; right: auto;` : ""}
    class="text-strong font-sans p-4 border border-base-200/80 rounded-2xl w-[375px] pointer-events-auto select-none shadow-2xl right-4 top-4 fixed z-10 squircle-smooth dark:border-base-800/80 {isHeatmapActive
        ? 'bg-elevation-1 backdrop-blur-none'
        : 'bg-elevation-1/90 backdrop-blur-xl'} {isDragging
        ? '!transition-none'
        : 'transition-colors duration-150'}"
>
    {@render header()}
    {@render summaryBar()}

    <div
        class="mt-3.5 pt-3.5 border-t border-base-200/60 flex flex-col gap-3 dark:border-base-800/60"
    >
        {@render domHealthCard()}
        {@render webVitalsCard()}
        {@render memoryCard()}
    </div>
</div>

<!-- ========================================================================= -->
<!-- REUSABLE ATOMIC SNIPPETS -->
<!-- ========================================================================= -->

{#snippet summaryTile(label: string, value: string | number, suffix = "")}
    <div
        class="p-2.5 text-center rounded-xl bg-elevation-2 flex flex-col items-center justify-center squircle-smooth"
    >
        <span class="text-xs text-weak tracking-wider font-medium uppercase">{label}</span>
        <span class="text-base text-emerald-600 font-bold font-mono dark:text-emerald-400">
            {value}{suffix ? ` ${suffix}` : ""}
        </span>
    </div>
{/snippet}

{#snippet subCard(
    label: string,
    value: string | number,
    Icon?: typeof Hash,
    suffix = "",
    statusColorClass = ""
)}
    <div
        class="p-2.5 rounded-xl bg-elevation-1 flex gap-2.5 items-center squircle-smooth dark:bg-elevation-1/60"
    >
        {#if Icon}
            <Icon class="text-weak h-4 w-4" />
        {/if}
        <div class="flex flex-col">
            <span class="text-[10px] text-weaker font-medium uppercase">{label}</span>
            <span class="text-sm font-mono font-semibold {statusColorClass || 'text-strong'}">
                {value}{suffix ? ` ${suffix}` : ""}
            </span>
        </div>
    </div>
{/snippet}

{#snippet vitalTile(label: string, value: string | number, suffix = "")}
    <div class="p-2 rounded-xl bg-elevation-1 squircle-smooth dark:bg-elevation-1/60">
        <span class="text-[10px] text-weaker font-medium block">{label}</span>
        <span class="text-xs text-strong font-mono font-semibold">{value}{suffix}</span>
    </div>
{/snippet}

<!-- ========================================================================= -->
<!-- COMPONENT SECTION SNIPPETS -->
<!-- ========================================================================= -->

{#snippet header()}
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        onpointerdown={handlePointerDown}
        onpointermove={handlePointerMove}
        onpointerup={handlePointerUp}
        onpointercancel={handlePointerUp}
        class="pb-3 border-b border-base-200/60 flex cursor-grab select-none items-center justify-between dark:border-base-800/60 active:cursor-grabbing"
    >
        <div class="flex gap-2.5 items-center">
            <div class="flex h-2.5 w-2.5 items-center justify-center relative">
                <span
                    class="rounded-full bg-emerald-400 opacity-75 inline-flex h-full w-full absolute animate-ping"
                ></span>
                <span class="rounded-full bg-emerald-500 inline-flex h-2.5 w-2.5 relative"></span>
            </div>
            <span class="text-sm text-strong tracking-wide font-semibold">
                Performance Engine
            </span>
        </div>

        <button
            onclick={onClose}
            class="text-weak p-1 rounded-lg transition-colors squircle-smooth hover:text-strong hover:bg-elevation-2"
            title="Close Overlay (Alt+P to reopen)"
        >
            <X class="h-4.5 w-4.5" />
        </button>
    </div>
{/snippet}

{#snippet summaryBar()}
    <div class="pt-3.5 gap-2.5 grid grid-cols-3">
        {#each summaryItems as item (item.label)}
            {@render summaryTile(item.label, item.value, item.suffix)}
        {/each}
    </div>
{/snippet}

{#snippet domHealthCard()}
    <div class="p-3 rounded-xl bg-elevation-2 flex flex-col gap-2.5 squircle-smooth">
        <div class="text-sm flex items-center justify-between">
            <div class="text-main font-medium flex gap-2 items-center">
                <Layers class="text-accent-500 h-4 w-4" />
                <span>DOM Health</span>
            </div>

            <div class="flex gap-2 items-center">
                <!-- Heatmap Toggle Button -->
                <button
                    onclick={onToggleHeatmap}
                    class="p-1 rounded-lg flex transition-colors items-center justify-center squircle-smooth {isHeatmapActive
                        ? 'text-orange-500 border border-orange-500/30 bg-orange-500/15 dark:text-orange-400'
                        : 'text-weak hover:text-strong hover:bg-elevation-1'}"
                    title={isHeatmapActive
                        ? "Disable DOM Heatmap (Alt+H)"
                        : "Enable DOM Heatmap Canvas Overlay (Alt+H)"}
                >
                    <Flame class="h-3.5 w-3.5" />
                </button>

                <!-- Inspector Toggle Button -->
                <button
                    onclick={onToggleInspector}
                    class="p-1 rounded-lg flex transition-colors items-center justify-center squircle-smooth {isInspectorActive
                        ? 'text-cyan-500 border border-cyan-500/30 bg-cyan-500/15 dark:text-cyan-400'
                        : 'text-weak hover:text-strong hover:bg-elevation-1'}"
                    title={isInspectorActive
                        ? "Disable DOM Inspector (Alt+I)"
                        : "Inspect DOM Element Hierarchy (Alt+I)"}
                >
                    <MousePointerClick class="h-3.5 w-3.5" />
                </button>

                {#if domHealthRating.status === "Critical"}
                    <span
                        class="text-xs text-red-600 font-mono font-semibold px-2.5 py-0.5 border border-red-500/40 rounded-full bg-red-500/15 dark:text-red-400 dark:border-red-500/40"
                    >
                        Critical
                    </span>
                {:else if domHealthRating.status === "Warning"}
                    <span
                        class="text-xs text-amber-600 font-mono font-semibold px-2.5 py-0.5 border border-amber-500/40 rounded-full bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/40"
                    >
                        Warning
                    </span>
                {:else}
                    <span
                        class="text-xs text-emerald-600 font-mono font-semibold px-2.5 py-0.5 border border-emerald-500/40 rounded-full bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/40"
                    >
                        Optimal
                    </span>
                {/if}
            </div>
        </div>

        <div class="mt-0.5 gap-2 grid grid-cols-2">
            {@render subCard(
                "Total Elements",
                performanceState.domCount,
                Hash,
                "",
                performanceState.domCount >= 1500
                    ? "text-red-600 dark:text-red-400"
                    : performanceState.domCount >= 800
                      ? "text-amber-600 dark:text-amber-400"
                      : ""
            )}
            {@render subCard(
                "Max Nesting",
                performanceState.domDepth,
                Maximize,
                "lvl",
                performanceState.domDepth >= 25
                    ? "text-red-600 dark:text-red-400"
                    : performanceState.domDepth >= 15
                      ? "text-amber-600 dark:text-amber-400"
                      : ""
            )}
        </div>
    </div>
{/snippet}

{#snippet webVitalsCard()}
    <div class="p-3 rounded-xl bg-elevation-2 flex flex-col gap-2.5 squircle-smooth">
        <div class="text-sm flex items-center justify-between">
            <div class="text-main font-medium flex gap-2 items-center">
                <Activity class="text-amber-500 h-4 w-4" />
                <span>Web Vitals</span>
            </div>
            <span
                class="text-xs text-emerald-600 font-mono font-semibold px-2.5 py-0.5 border border-emerald-500/40 rounded-full bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/40"
            >
                Good
            </span>
        </div>

        <div class="mt-0.5 text-center gap-2 grid grid-cols-3">
            {#each vitalItems as item (item.label)}
                {@render vitalTile(item.label, item.value, item.suffix)}
            {/each}
        </div>

        <div class="gap-2 grid grid-cols-2">
            {@render subCard("60s Min FPS", performanceState.minFps, Activity, "fps")}
            {@render subCard("60s Avg FPS", performanceState.avgFps, Activity, "fps")}
        </div>
    </div>
{/snippet}

{#snippet memoryCard()}
    <div class="p-3 rounded-xl bg-elevation-2 flex flex-col gap-2.5 squircle-smooth">
        <div class="text-sm flex items-center justify-between">
            <div class="text-main font-medium flex gap-2 items-center">
                <HardDrive class="text-sky-500 h-4 w-4" />
                <span>Memory</span>
            </div>
            <span class="text-xs text-weak font-mono">
                {performanceState.heapUsed} / {performanceState.heapTotal} MB
            </span>
        </div>

        <!-- Framed Progress Bar Track with High Contrast -->
        <div
            class="mt-0.5 p-0.5 border border-base-200/80 rounded-full bg-elevation-1 h-3 w-full overflow-hidden dark:border-base-800/80 dark:bg-elevation-1"
        >
            <div
                class="rounded-full bg-accent-500 h-full shadow-sm transition-all duration-300"
                style="width: {performanceState.heapTotal > 0
                    ? (performanceState.heapUsed / performanceState.heapTotal) * 100
                    : 0}%"
            ></div>
        </div>

        <!-- Stepped Rating Scale (5 Pills Spectrum) -->
        <div class="mt-1 flex flex-col gap-1.5">
            <div class="gap-1.5 grid grid-cols-5">
                {#each [1, 2, 3, 4, 5] as step (step)}
                    <div
                        class="rounded-full h-1.5 transition-all duration-200 {step <=
                        memoryTier.level
                            ? memoryTier.bg
                            : 'bg-base-200 opacity-40 dark:bg-base-800'}"
                    ></div>
                {/each}
            </div>
            <div class="text-[10px] font-mono flex items-center justify-between">
                <span class="text-weaker font-medium uppercase">Heap Tier</span>
                <span class="{memoryTier.color} font-semibold">{memoryTier.label}</span>
            </div>
        </div>
    </div>
{/snippet}
