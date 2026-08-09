<script lang="ts">
    import type { Component } from "svelte";
    import { Box, Layers, PanelLeftClose, PanelLeftOpen, Search } from "@lucide/svelte";

    import { focusAttach } from "$core/_system/focus/focus.attach";

    type PreviewModule = {
        default: Component;
    };

    // Automatically discover all *Preview.svelte components relative to this file
    const previewModules = import.meta.glob<PreviewModule>(
        "./components/*Preview.svelte",
        { eager: true }
    );

    type ComponentPreviewItem = {
        id: string;
        name: string;
        component: Component;
    };

    const previews: ComponentPreviewItem[] = Object.entries(previewModules).map(
        ([path, mod]) => {
            const filename = path.split("/").pop() ?? "";
            const rawName = filename.replace(/Preview\.svelte$/, "");
            const formattedName = rawName.replaceAll(/([a-z])([A-Z])/g, "$1 $2");

            return {
                id: rawName.toLowerCase(),
                name: formattedName,
                component: mod.default,
            };
        }
    );

    let selectedId = $state<string>(previews[0]?.id ?? "");
    let searchQuery = $state<string>("");
    let isCollapsed = $state<boolean>(false);
    let openButtonEl = $state<HTMLButtonElement | null>(null);

    $effect(() => {
        if (isCollapsed && openButtonEl) {
            openButtonEl.focus();
        }
    });

    const filteredPreviews = $derived(
        searchQuery.trim()
            ? previews.filter((item) =>
                  item.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : previews
    );

    const activePreview = $derived(previews.find((p) => p.id === selectedId));
</script>

<div class="p-6 md:p-8 pb-28 flex h-full w-full overflow-hidden relative">
    <!-- Floating Open Button (Appears seamlessly top-left when sidebar is collapsed) -->
    {#if isCollapsed}
        <button
            bind:this={openButtonEl}
            type="button"
            onclick={() => (isCollapsed = false)}
            class="p-2.5 rounded-2xl bg-elevation-1 text-weak shadow-md hover:text-strong hover:bg-elevation-2 select-none active:scale-95 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out opacity-200-quad-out) squircle-smooth absolute top-1 md:top-2 left-1 md:left-2 z-40"
            title="Open sidebar"
        >
            <PanelLeftOpen size={18} />
        </button>
    {/if}

    <!-- Rectangular Edge-Aligned Sidebar -->
    <aside
        class="p-4 bg-elevation-1 flex shrink-0 flex-col gap-4 shadow-xl w-64 md:w-72 h-full select-none absolute left-0 top-0 bottom-0 z-30 t-all-300-quad-out {isCollapsed
            ? '-translate-x-[calc(100%+4rem)] opacity-0 pointer-events-none'
            : 'translate-x-0 opacity-100'}"
    >
        <!-- Sidebar Header with integrated Close Button -->
        <div class="px-2 pt-1 flex items-center justify-between">
            <div class="flex items-center gap-2 text-strong font-700">
                <Layers size={18} class="text-accent-500" />
                <span>Components</span>
            </div>
            <div class="flex items-center gap-2">
                <span
                    class="text-xs text-accent-500 font-600 px-2 py-0.5 rounded-full bg-accent-500/10"
                >
                    {previews.length}
                </span>
                <button
                    type="button"
                    onclick={() => (isCollapsed = true)}
                    class="p-1.5 rounded-xl text-weak hover:text-strong hover:bg-elevation-2 select-none active:scale-95 t:(bg-180-quad-out text-180-quad-out)"
                    title="Close sidebar"
                >
                    <PanelLeftClose size={17} />
                </button>
            </div>
        </div>

        <!-- Search Bar Container -->
        <label
            id="component-search-container"
            class="px-3.5 py-2.5 rounded-2xl bg-elevation-2 flex items-center gap-2.5 squircle-smooth cursor-text"
        >
            <Search size={16} class="text-weak shrink-0 pointer-events-none" />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Filter components..."
                class="text-sm font-500 text-strong placeholder:text-weak bg-transparent border-none w-full focus:outline-none"
                {@attach focusAttach({ focusTarget: "#component-search-container", offset: 0 })}
            />
        </label>

        <!-- Component List without no-scrollbar class -->
        <nav class="flex flex-col gap-1 flex-1 min-h-0 w-full overflow-y-auto no-scrollbar">
            {#each filteredPreviews as item (item.id)}
                <button
                    type="button"
                    onclick={() => (selectedId = item.id)}
                    class="w-full p-3 rounded-2xl flex items-center justify-between text-left select-none active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) {selectedId ===
                    item.id
                        ? 'text-strong bg-elevation-2 font-600'
                        : 'text-weak hover:text-strong hover:bg-elevation-2/50'}"
                >
                    <div class="flex items-center gap-2.5">
                        <Box
                            size={16}
                            class="t:(text-180-quad-out) {selectedId === item.id
                                ? 'text-accent-500'
                                : 'text-weak/60'}"
                        />
                        <span class="text-sm font-500">{item.name}</span>
                    </div>
                </button>
            {/each}
        </nav>
    </aside>

    <!-- Main Component Stage -->
    <main
        class="p-8 flex flex-1 flex-col items-center justify-center relative overflow-hidden h-full w-full t-all-300-quad-out {isCollapsed
            ? 'pl-0'
            : 'pl-72 md:pl-80'}"
    >
        {#if activePreview}
            {const ActiveComponent = activePreview.component}
            <ActiveComponent />
        {:else}
            <div class="flex flex-col items-center gap-3 text-center">
                <div class="p-4 rounded-2xl bg-elevation-1 text-accent-500 squircle-smooth">
                    <Box size={28} />
                </div>
                <h2 class="text-xl text-strong font-700">No Components Found</h2>
                <p class="text-xs text-weak max-w-sm">
                    Add preview components matching <code class="text-accent-500 font-mono">[Name]Preview.svelte</code> inside <code class="text-accent-500 font-mono">src/lib/previews/components/</code>.
                </p>
            </div>
        {/if}
    </main>
</div>
