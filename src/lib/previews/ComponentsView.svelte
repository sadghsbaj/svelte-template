<script lang="ts">
    import { Component } from "@lucide/svelte";
</script>

<div class="mx-auto p-6 pb-28 flex flex-col gap-8 max-w-6xl md:p-10 md:pb-28">
    <header class="flex flex-col gap-4 justify-between sm:flex-row sm:items-center">
        <div>
            <div class="mb-1 flex gap-2 items-center">
                <span
                    class="text-xs text-accent-600 font-semibold px-2.5 py-0.5 rounded-full bg-accent-500/15 dark:text-accent-400"
                >
                    Design System
                </span>
                <span class="text-xs text-weak">• Playground</span>
            </div>
            <h1 class="text-3xl text-strong tracking-tight font-bold">Komponenten</h1>
        </div>
    </header>

    <div
        class="p-12 rounded-3xl bg-elevation-1 flex flex-col gap-4 items-center justify-center border border-dashed border-base-300 dark:border-base-700 squircle text-center"
    >
        <div
            class="text-accent-500 p-4 rounded-2xl bg-accent-500/10 flex items-center justify-center"
        >
            <Component size={32} />
        </div>
        <div class="flex flex-col gap-1">
            <h2 class="text-lg text-strong font-bold">Komponenten-Vorschau</h2>
            <p class="text-sm text-weak max-w-md">
                Hier werden zukünftig Komponenten aus <code class="text-accent-500 font-mono"
                    >src/lib/previews/components/</code
                > angezeigt.
            </p>
        </div>
    </div>
</div>
