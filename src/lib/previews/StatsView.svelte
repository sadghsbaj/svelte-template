<script lang="ts">
    import { Activity, BarChart3, Globe, Layers, Maximize2, PieChart, Share2, Zap } from "@lucide/svelte";

    let selectedRange = $state("30T");
    let isExpanded = $state(false);

    const ranges = ["7T", "30T", "90T", "1J"];

    const chartBars = [
        { label: "Mo", value: 45, height: "h-28" },
        { label: "Di", value: 68, height: "h-40" },
        { label: "Mi", value: 82, height: "h-52" },
        { label: "Do", value: 55, height: "h-32" },
        { label: "Fr", value: 94, height: "h-60" },
        { label: "Sa", value: 70, height: "h-44" },
        { label: "So", value: 88, height: "h-56" },
    ];

    const trafficSources = [
        { name: "Direkter Aufruf", percentage: 48, icon: Globe, color: "bg-accent-500" },
        { name: "Suchmaschinen (SEO)", percentage: 32, icon: Layers, color: "bg-success-500" },
        { name: "Social Media", percentage: 14, icon: Share2, color: "bg-warning-500" },
        { name: "Empfehlungen", percentage: 6, icon: Zap, color: "bg-info-500" },
    ];
</script>

<div class="mx-auto p-6 pb-28 flex flex-col gap-8 max-w-6xl md:p-10 md:pb-28">
    <!-- Header Bar -->
    <header class="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
        <div>
            <div class="mb-1 flex gap-2 items-center">
                <span
                    class="text-xs text-success-600 font-semibold px-2.5 py-0.5 rounded-full bg-success-500/15 dark:text-success-400"
                >
                    Realtime Analytics
                </span>
                <span class="text-xs text-weak">• Performance Hub</span>
            </div>
            <h1 class="text-3xl text-strong tracking-tight font-bold">Statistiken & Analysen</h1>
        </div>
    </header>

    <!-- Main Chart Section -->
    <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-6 squircle md:p-8">
        <div class="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
            <div>
                <h2 class="text-xl text-strong font-bold flex gap-2 items-center">
                    <BarChart3 size={20} class="text-accent-500" />
                    <span>Besucheraktivität</span>
                </h2>
                <p class="text-xs text-weak mt-1">Verteilung der täglichen Interaktionen</p>
            </div>

            <!-- Time Range Pills -->
            <div
                class="p-1 rounded-xl bg-elevation-2 flex gap-1 items-center self-start sm:self-auto"
            >
                {#each ranges as range (range)}
                    <button
                        type="button"
                        onclick={() => (selectedRange = range)}
                        class="text-xs font-semibold px-3 py-1.5 rounded-lg {selectedRange === range
                            ? 'text-strong bg-elevation-1 shadow-xs'
                            : 'text-weak hover:text-strong'}"
                    >
                        {range}
                    </button>
                {/each}
            </div>
        </div>

        <!-- Custom Visual Bar Chart -->
        <div
            class="p-6 pt-12 rounded-2xl bg-elevation-2 flex gap-2 min-h-[260px] items-end justify-between md:gap-6"
        >
            {#each chartBars as bar (bar.label)}
                <div class="group flex flex-1 flex-col gap-3 items-center">
                    <div class="flex w-full items-end justify-center">
                        <div
                            class="rounded-2xl flex max-w-[48px] w-full justify-center relative bg-accent-500/80 group-hover:bg-accent-500 {bar.height}"
                        >
                            <span
                                class="text-xs text-strong font-bold px-2 py-0.5 rounded-md bg-elevation-1 opacity-0 shadow-xs absolute group-hover:opacity-100 -top-8"
                            >
                                {bar.value}%
                            </span>
                        </div>
                    </div>
                    <span class="text-xs text-weak font-medium group-hover:text-strong"
                        >{bar.label}</span
                    >
                </div>
            {/each}
        </div>
    </section>

    <!-- Two Column Breakdown -->
    <div class="gap-6 grid grid-cols-1 lg:grid-cols-2">
        <!-- Traffic Sources -->
        <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-5 squircle">
            <div class="flex items-center justify-between">
                <h3 class="text-lg text-strong font-bold flex gap-2 items-center">
                    <PieChart size={18} class="text-info-500" />
                    <span>Traffic-Quellen</span>
                </h3>
                <span class="text-xs text-weak font-medium">Letzter Monat</span>
            </div>

            <div class="flex flex-col gap-3">
                {#each trafficSources as source (source.name)}
                    {const SourceIcon = source.icon}
                    <div class="p-4 rounded-2xl bg-elevation-2 flex flex-col gap-2.5">
                        <div class="text-xs flex items-center justify-between">
                            <div class="flex gap-2.5 items-center">
                                <div class="text-strong p-2 rounded-lg bg-elevation-1">
                                    <SourceIcon size={16} />
                                </div>
                                <span class="text-strong font-semibold">{source.name}</span>
                            </div>
                            <span class="text-strong font-bold">{source.percentage}%</span>
                        </div>
                        <div class="rounded-full bg-elevation-1 h-2 w-full overflow-hidden">
                            <div
                                class="rounded-full h-full {source.color}"
                                style="width: {source.percentage}%"
                            ></div>
                        </div>
                    </div>
                {/each}
            </div>
        </section>

        <!-- System Load & Performance -->
        <section
            class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-5 justify-between squircle"
        >
            <div class="flex items-center justify-between">
                <h3 class="text-lg text-strong font-bold flex gap-2 items-center">
                    <Activity size={18} class="text-success-500" />
                    <span>Infrastruktur Performance</span>
                </h3>
                <span
                    class="text-xs text-success-600 font-semibold px-2.5 py-0.5 rounded-full bg-success-500/15 dark:text-success-400"
                >
                    Gesund
                </span>
            </div>

            <div class="gap-4 grid grid-cols-1 sm:grid-cols-2">
                <div class="p-4 rounded-2xl bg-elevation-2 flex flex-col gap-1">
                    <span class="text-xs text-weak font-medium">Durchschnittliche Antwortzeit</span>
                    <span class="text-2xl text-strong font-bold">18 ms</span>
                    <span class="text-xs text-success-600 font-semibold mt-1 dark:text-success-400">
                        -4 ms im Vergleich zur Vorwoche
                    </span>
                </div>

                <div class="p-4 rounded-2xl bg-elevation-2 flex flex-col gap-1">
                    <span class="text-xs text-weak font-medium">Uptime Monat</span>
                    <span class="text-2xl text-strong font-bold">99.98%</span>
                    <span class="text-xs text-success-600 font-semibold mt-1 dark:text-success-400">
                        SLA eingehalten
                    </span>
                </div>
            </div>

            <div class="p-4 rounded-2xl bg-elevation-2 flex gap-4 items-center justify-between">
                <div class="flex gap-3 items-center">
                    <div
                        class="text-accent-600 p-2.5 rounded-xl bg-accent-500/15 dark:text-accent-400"
                    >
                        <Zap size={20} />
                    </div>
                    <div>
                        <h4 class="text-sm text-strong font-bold">Cache Hit Ratio</h4>
                        <p class="text-xs text-weak">CDN Edge Caching optimiert</p>
                    </div>
                </div>
                <span class="text-lg text-accent-500 font-bold">94.2%</span>
            </div>
        </section>
    </div>

    <!-- Focus Test Suite -->
    <div class="gap-6 grid grid-cols-1 lg:grid-cols-2">
        <!-- Test 1: Dynamic Resizable Focusable Element -->
        <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-4 squircle">
            <div class="flex items-center justify-between">
                <h3 class="text-base text-strong font-bold flex gap-2 items-center">
                    <Maximize2 size={18} class="text-accent-500" />
                    <span>Focus Test: Größendynamisches Element</span>
                </h3>
                <span class="text-xs text-weak font-medium">Resize on Focus / Click</span>
            </div>

            <p class="text-xs text-weak">
                Dieses fokussierbare Element verändert seine Dimensionen dynamisch bei Interaktion/Fokus.
            </p>

            <button
                type="button"
                tabindex="0"
                onclick={() => (isExpanded = !isExpanded)}
                class="text-white font-medium p-4 rounded-2xl bg-accent-500 flex flex-col cursor-pointer shadow-md items-center justify-center focus:outline-none focus:ring-4 focus:ring-accent-500/50 {isExpanded
                    ? 'bg-accent-600 h-48 w-full shadow-xl'
                    : 'h-16 w-64'}"
            >
                <span class="text-sm font-bold">
                    {isExpanded ? 'Großer Zustand (100% × 192px)' : 'Kompakter Zustand (256px × 64px)'}
                </span>
                <span class="text-xs mt-1 opacity-80">
                    Klicken / Enter drücken zum Umschalten
                </span>
            </button>
        </section>

        <!-- Test 2: Scroll Container with Top & Bottom Focusable Targets -->
        <section class="p-6 rounded-3xl bg-elevation-1 flex flex-col gap-4 squircle">
            <div class="flex items-center justify-between">
                <h3 class="text-base text-strong font-bold flex gap-2 items-center">
                    <Layers size={18} class="text-info-500" />
                    <span>Focus Test: Scroll-Container</span>
                </h3>
                <span class="text-xs text-weak font-medium">Top & Bottom Targets</span>
            </div>

            <div
                class="border-elevation-3 p-4 border rounded-2xl bg-elevation-2 flex flex-col h-64 justify-between overflow-y-auto focus-within:ring-2 focus-within:ring-info-500/30"
            >
                <!-- TOP Focus Target -->
                <div class="p-3 rounded-xl bg-elevation-1 flex shadow-xs items-center justify-between">
                    <span class="text-xs text-strong font-semibold">Ganz oben im Scroll-Bereich</span>
                    <button
                        type="button"
                        tabindex="0"
                        class="text-xs text-white font-bold px-3.5 py-1.5 rounded-lg bg-info-500 focus:outline-none hover:bg-info-600 focus:ring-2 focus:ring-info-400 focus:ring-offset-2"
                    >
                        [Focus Oben]
                    </button>
                </div>

                <!-- Scroll Spacer Content -->
                <div class="border-elevation-3 text-xs text-weak my-24 p-6 text-center border rounded-xl border-dashed">
                    <p class="text-main font-semibold mb-1">↑ Scroll-Inhalt (Abstand) ↓</p>
                    <p>Scrolle nach unten für das untere fokussierbare Element.</p>
                </div>

                <!-- BOTTOM Focus Target -->
                <div class="p-3 rounded-xl bg-elevation-1 flex shadow-xs items-center justify-between">
                    <span class="text-xs text-strong font-semibold">Ganz unten im Scroll-Bereich</span>
                    <button
                        type="button"
                        tabindex="0"
                        class="text-xs text-white font-bold px-3.5 py-1.5 rounded-lg bg-success-500 focus:outline-none hover:bg-success-600 focus:ring-2 focus:ring-success-400 focus:ring-offset-2"
                    >
                        [Focus Unten]
                    </button>
                </div>
            </div>
        </section>
    </div>

</div>

