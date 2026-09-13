<script lang="ts">
    import type { Component } from "svelte";
    import { Box, Component as ComponentIcon, PanelLeftClose, PanelLeftOpen, Search } from "@lucide/svelte";
    import { Button, TextInput } from "$components";

    import { fade } from "$core/_system/motion/svelte";

    const STORAGE_KEY = "template_dev_preview_active_component_id";
    const SIDEBAR_COLLAPSED_KEY = "template_dev_preview_sidebar_collapsed";

    type PreviewIcon = Component<{ size?: number; class?: string }>;

    type PreviewModule = {
        default: Component;
        icon?: PreviewIcon;
    };

    // Automatically discover all *Preview.svelte components relative to this file
    const previewModules = import.meta.glob<PreviewModule>("./components/*Preview.svelte", {
        eager: true,
    });

    type ComponentPreviewItem = {
        id: string;
        name: string;
        component: Component;
        icon?: PreviewIcon;
    };

    const previews: ComponentPreviewItem[] = Object.entries(previewModules).map(([path, mod]) => {
        const filename = path.split("/").pop() ?? "";
        const rawName = filename.replace(/Preview\.svelte$/, "");
        const formattedName = rawName.replaceAll(/([a-z])([A-Z])/g, "$1 $2");

        return {
            id: rawName.toLowerCase(),
            name: formattedName,
            component: mod.default,
            icon: mod.icon,
        };
    });

    function getInitialSelectedId(): string {
        if (typeof window === "undefined") return previews[0]?.id ?? "";
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved && previews.some((p) => p.id === saved)) {
            return saved;
        }
        return previews[0]?.id ?? "";
    }

    function getInitialSidebarCollapsed(): boolean {
        if (typeof window === "undefined") return false;
        return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
    }

    let selectedId = $state<string>(getInitialSelectedId());
    let searchQuery = $state<string>("");
    let isCollapsed = $state<boolean>(getInitialSidebarCollapsed());
    let openButtonEl = $state<HTMLElement | null>(null);

    $effect(() => {
        if (typeof window !== "undefined" && selectedId) {
            localStorage.setItem(STORAGE_KEY, selectedId);
        }
    });

    $effect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
        }
    });

    $effect(() => {
        if (isCollapsed && openButtonEl) {
            openButtonEl.focus();
        }
    });

    const filteredPreviews = $derived(
        searchQuery.trim()
            ? previews.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : previews
    );

    const activePreview = $derived(previews.find((p) => p.id === selectedId));
</script>

<div class="p-6 md:p-8 pb-28 flex h-full w-full overflow-hidden relative">
    <!-- Floating Open Button (Appears seamlessly top-left when sidebar is collapsed) -->
    {#if isCollapsed}
        <Button
            bind:element={openButtonEl}
            variant="elevated"
            color="base"
            size="md"
            iconOnly
            onclick={() => (isCollapsed = false)}
            class="absolute top-1 md:top-2 left-1 md:left-2 z-40"
            title="Open sidebar"
            aria-label="Open sidebar"
        >
            <PanelLeftOpen />
        </Button>
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
                <ComponentIcon size={18} class="text-accent-500" />
                <span>Components</span>
            </div>
            <Button
                variant="ghost"
                color="base"
                size="md"
                iconOnly
                onclick={() => (isCollapsed = true)}
                class="size-8! -mr-1"
                title="Close sidebar"
                aria-label="Close sidebar"
            >
                <PanelLeftClose />
            </Button>
        </div>

        <!-- Search Bar -->
        {#snippet searchIcon()}
            <Search />
        {/snippet}
        <TextInput
            bind:value={searchQuery}
            placeholder="Filter components..."
            variant="soft"
            size="md"
            iconLeft={searchIcon}
            class="w-full"
        />

        <!-- Component List without no-scrollbar class -->
        <nav class="flex flex-col gap-1 flex-1 min-h-0 w-full overflow-y-auto no-scrollbar">
            {#each filteredPreviews as item (item.id)}
                <button
                    type="button"
                    onclick={() => (selectedId = item.id)}
                    class="cursor-pointer w-full p-3 rounded-2xl flex items-center justify-between text-left select-none active:scale-97 squircle-smooth t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) {selectedId ===
                    item.id
                        ? 'text-strong bg-elevation-2 font-600'
                        : 'text-weak hover:text-strong hover:bg-elevation-2/50'}"
                >
                    <div class="flex items-center gap-2.5">
                        {#if item.icon}
                            {const ItemIcon = item.icon}
                            <ItemIcon
                                size={16}
                                class="t:(text-180-quad-out) {selectedId === item.id
                                    ? 'text-accent-500'
                                    : 'text-weak/60'}"
                            />
                        {:else}
                            <Box
                                size={16}
                                class="t:(text-180-quad-out) {selectedId === item.id
                                    ? 'text-accent-500'
                                    : 'text-weak/60'}"
                            />
                        {/if}
                        <span class="text-sm font-500 text-trim">{item.name}</span>
                    </div>
                </button>
            {/each}
        </nav>
    </aside>

    <!-- Main Component Stage -->
    <main
        class="flex flex-1 flex-col relative overflow-hidden h-full w-full t-all-300-quad-out {isCollapsed
            ? 'pl-0'
            : 'pl-72 md:pl-80'}"
    >
        {#if activePreview}
            {#key activePreview.id}
                <div in:fade={{ duration: 150 }} class="h-full w-full">
                    {const ActiveComponent = activePreview.component}
                    <ActiveComponent />
                </div>
            {/key}
        {:else}
            <div class="flex-center flex-col h-full w-full p-8 text-center">
                <div class="p-4 rounded-2xl bg-elevation-1 text-accent-500 squircle-smooth">
                    <Box size={28} />
                </div>
                <h2 class="mt-3 text-xl text-strong font-700">No Components Found</h2>
                <p class="mt-1 text-xs text-weak max-w-sm">
                    Add preview components matching <code class="text-accent-500 font-mono"
                        >[Name]Preview.svelte</code
                    >
                    inside
                    <code class="text-accent-500 font-mono">src/lib/previews/components/</code>.
                </p>
            </div>
        {/if}
    </main>
</div>
