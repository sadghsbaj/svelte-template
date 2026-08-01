<script lang="ts">
    import { onMount } from "svelte";
    import { Activity, HardDrive, Hash, Layers, Maximize, X } from "@lucide/svelte";

    let isVisible = $state(true);

    // Mock data for UI finalization
    const metrics = $state({
        fps: 60,
        eventLoopLag: 0.4,
        domCount: 482,
        domDepth: 12,
        cls: 0.002,
        lcp: 240,
        inp: 14,
        heapUsed: 24.5,
        heapTotal: 48,
        requests: 18,
        totalSizeKb: 420,
    });

    // Soft Ampel Badge Styles
    function getStatusBadge(
        value: number,
        thresholdYellow: number,
        thresholdRed: number
    ): { text: string; class: string } {
        if (value >= thresholdRed) {
            return {
                text: "Critical",
                class: "bg-danger-500/10 text-danger-600 dark:text-danger-400 border-danger-500/20",
            };
        }
        if (value >= thresholdYellow) {
            return {
                text: "Warning",
                class: "bg-warning-500/10 text-warning-600 dark:text-warning-400 border-warning-500/20",
            };
        }
        return {
            text: "Optimal",
            class: "bg-success-500/10 text-success-600 dark:text-success-400 border-success-500/20",
        };
    }

    const domStatus = $derived(getStatusBadge(metrics.domCount, 800, 1500));

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
    <div
        id="dev-perf-overlay"
        class="pointer-events-auto fixed top-4 right-4 z-[99999] w-[350px] select-none rounded-2xl border border-base-200/80 dark:border-base-800/80 bg-surface-1/90 p-3.5 text-strong shadow-2xl backdrop-blur-xl transition-all duration-200 font-sans"
    >
        <!-- Header Bar -->
        <div
            class="flex items-center justify-between border-b border-base-200/60 dark:border-base-800/60 pb-2.5"
        >
            <div class="flex items-center gap-2">
                <div class="relative flex h-2.5 w-2.5 items-center justify-center">
                    <span
                        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-400 opacity-75"
                    ></span>
                    <span class="relative inline-flex h-2.5 w-2.5 rounded-full bg-success-500"
                    ></span>
                </div>
                <span class="font-semibold text-xs text-strong tracking-wide">
                    Performance Engine
                </span>
            </div>

            <button
                onclick={() => (isVisible = false)}
                class="rounded-lg p-1 text-weak hover:bg-surface-2 hover:text-strong transition-colors"
                title="Close Overlay (Alt+P to reopen)"
            >
                <X class="h-4 w-4" />
            </button>
        </div>

        <!-- Quick Summary Bar -->
        <div class="grid grid-cols-3 gap-2 pt-3">
            <!-- FPS -->
            <div
                class="flex flex-col items-center justify-center rounded-xl border border-base-200/50 dark:border-base-800/50 bg-surface-2/50 p-2 text-center"
            >
                <span class="text-[10px] font-medium text-weak uppercase tracking-wider">FPS</span>
                <span class="font-mono text-sm font-bold text-success-600 dark:text-success-400"
                    >{metrics.fps}</span
                >
            </div>

            <!-- DOM Count -->
            <div
                class="flex flex-col items-center justify-center rounded-xl border border-base-200/50 dark:border-base-800/50 bg-surface-2/50 p-2 text-center"
            >
                <span class="text-[10px] font-medium text-weak uppercase tracking-wider"
                    >DOM NODES</span
                >
                <span class="font-mono text-sm font-bold text-success-600 dark:text-success-400"
                    >{metrics.domCount}</span
                >
            </div>

            <!-- Event Loop Lag -->
            <div
                class="flex flex-col items-center justify-center rounded-xl border border-base-200/50 dark:border-base-800/50 bg-surface-2/50 p-2 text-center"
            >
                <span class="text-[10px] font-medium text-weak uppercase tracking-wider"
                    >LOOP LAG</span
                >
                <span class="font-mono text-sm font-bold text-success-600 dark:text-success-400"
                    >{metrics.eventLoopLag} ms</span
                >
            </div>
        </div>

        <!-- Detailed Cards Stack -->
        <div
            class="mt-3 flex flex-col gap-2.5 border-t border-base-200/60 dark:border-base-800/60 pt-3"
        >
            <!-- DOM Health Card -->
            <div
                class="flex flex-col gap-2 rounded-xl border border-base-200/50 dark:border-base-800/50 bg-surface-2/30 p-2.5"
            >
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1.5 font-medium text-main">
                        <Layers class="h-3.5 w-3.5 text-accent-500" />
                        <span>DOM Health</span>
                    </div>
                    <span
                        class="rounded-full border px-2 py-0.5 font-mono text-[10px] font-semibold {domStatus.class}"
                    >
                        {domStatus.text}
                    </span>
                </div>

                <div class="grid grid-cols-2 gap-2 mt-0.5">
                    <div
                        class="flex items-center gap-2 rounded-lg border border-base-200/40 dark:border-base-800/40 bg-surface-1/60 p-2"
                    >
                        <Hash class="h-3.5 w-3.5 text-weak" />
                        <div class="flex flex-col">
                            <span class="text-[9px] text-weaker">Total Elements</span>
                            <span class="font-mono text-xs font-semibold text-strong"
                                >{metrics.domCount}</span
                            >
                        </div>
                    </div>
                    <div
                        class="flex items-center gap-2 rounded-lg border border-base-200/40 dark:border-base-800/40 bg-surface-1/60 p-2"
                    >
                        <Maximize class="h-3.5 w-3.5 text-weak" />
                        <div class="flex flex-col">
                            <span class="text-[9px] text-weaker">Max Nesting</span>
                            <span class="font-mono text-xs font-semibold text-strong"
                                >{metrics.domDepth} lvl</span
                            >
                        </div>
                    </div>
                </div>
            </div>

            <!-- Web Vitals Card -->
            <div
                class="flex flex-col gap-2 rounded-xl border border-base-200/50 dark:border-base-800/50 bg-surface-2/30 p-2.5"
            >
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1.5 font-medium text-main">
                        <Activity class="h-3.5 w-3.5 text-warning-500" />
                        <span>Web Vitals</span>
                    </div>
                    <span
                        class="rounded-full border border-success-500/20 bg-success-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-success-600 dark:text-success-400"
                    >
                        Good
                    </span>
                </div>

                <div class="grid grid-cols-3 gap-1.5 text-center mt-0.5">
                    <div
                        class="rounded-lg border border-base-200/40 dark:border-base-800/40 bg-surface-1/60 p-1.5"
                    >
                        <span class="block text-[9px] text-weaker">CLS</span>
                        <span class="font-mono text-xs font-semibold text-strong"
                            >{metrics.cls}</span
                        >
                    </div>
                    <div
                        class="rounded-lg border border-base-200/40 dark:border-base-800/40 bg-surface-1/60 p-1.5"
                    >
                        <span class="block text-[9px] text-weaker">LCP</span>
                        <span class="font-mono text-xs font-semibold text-strong"
                            >{metrics.lcp}ms</span
                        >
                    </div>
                    <div
                        class="rounded-lg border border-base-200/40 dark:border-base-800/40 bg-surface-1/60 p-1.5"
                    >
                        <span class="block text-[9px] text-weaker">INP</span>
                        <span class="font-mono text-xs font-semibold text-strong"
                            >{metrics.inp}ms</span
                        >
                    </div>
                </div>
            </div>

            <!-- Memory & Network Card -->
            <div
                class="flex flex-col gap-2 rounded-xl border border-base-200/50 dark:border-base-800/50 bg-surface-2/30 p-2.5"
            >
                <div class="flex items-center justify-between text-xs">
                    <div class="flex items-center gap-1.5 font-medium text-main">
                        <HardDrive class="h-3.5 w-3.5 text-info-500" />
                        <span>Memory & Network</span>
                    </div>
                    <span class="font-mono text-[10px] text-weak">
                        {metrics.heapUsed} / {metrics.heapTotal} MB
                    </span>
                </div>

                <!-- Memory Bar -->
                <div
                    class="h-1.5 w-full overflow-hidden rounded-full bg-base-200 dark:bg-base-800 mt-0.5"
                >
                    <div
                        class="h-full rounded-full bg-accent-500 transition-all duration-300"
                        style="width: {(metrics.heapUsed / metrics.heapTotal) * 100}%"
                    ></div>
                </div>

                <div class="flex justify-between items-center text-[11px] text-weak mt-0.5">
                    <span
                        >Requests: <strong class="font-mono font-semibold text-strong"
                            >{metrics.requests}</strong
                        ></span
                    >
                    <span
                        >Assets: <strong class="font-mono font-semibold text-strong"
                            >{metrics.totalSizeKb} KB</strong
                        ></span
                    >
                </div>
            </div>
        </div>
    </div>
{/if}
