<script lang="ts">
    import { Box, Layers, PanelLeftClose, PanelLeftOpen, Search } from "@lucide/svelte";

    import { focusAttach } from "$core/_system/focus/focus.attach";

    type MockComponentItem = {
        id: string;
        name: string;
        category: string;
    };

    const mockComponents: MockComponentItem[] = [
        { id: "button", name: "Button", category: "General" },
        { id: "card", name: "Card", category: "Data Display" },
        { id: "badge", name: "Badge", category: "Data Display" },
        { id: "input", name: "Input", category: "Form" },
        { id: "switch", name: "Switch", category: "Form" },
        { id: "dialog", name: "Dialog", category: "Feedback" },
        { id: "tooltip", name: "Tooltip", category: "Feedback" },
        { id: "avatar", name: "Avatar", category: "Data Display" },
    ];

    let selectedId = $state<string>("button");
    let searchQuery = $state<string>("");
    let isCollapsed = $state<boolean>(false);

    const filteredComponents = $derived(
        mockComponents.filter(
            (item) =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.category.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
</script>

<div class="p-6 md:p-8 pb-28 flex gap-6 h-full w-full overflow-hidden">
    <!-- Floating Sidebar -->
    <aside
        class="p-4 rounded-3xl bg-elevation-1 flex shrink-0 flex-col gap-4 shadow-md squircle-smooth overflow-hidden select-none t:(width-200-quad-out padding-200-quad-out) {isCollapsed
            ? 'w-20 px-3'
            : 'w-64 md:w-72'}"
    >
        <!-- Sidebar Header -->
        <div class="px-1 pt-1 flex items-center justify-between min-h-[32px]">
            {#if !isCollapsed}
                <div class="flex items-center gap-2 text-strong font-bold whitespace-nowrap overflow-hidden">
                    <Layers size={18} class="text-accent-500 shrink-0" />
                    <span>Components</span>
                    <span
                        class="text-xs text-accent-500 font-semibold px-2 py-0.5 rounded-full bg-accent-500/10 ml-1"
                    >
                        {mockComponents.length}
                    </span>
                </div>
            {:else}
                <div class="w-full flex justify-center">
                    <Layers size={20} class="text-accent-500 shrink-0" />
                </div>
            {/if}

            <button
                type="button"
                onclick={() => (isCollapsed = !isCollapsed)}
                class="p-1.5 rounded-xl text-weak hover:text-strong hover:bg-elevation-2 select-none t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) active:scale-95 shrink-0"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {#if isCollapsed}
                    <PanelLeftOpen size={18} />
                {:else}
                    <PanelLeftClose size={18} />
                {/if}
            </button>
        </div>

        <!-- Search Bar Container -->
        <label
            id="component-search-container"
            class="rounded-2xl bg-elevation-2 flex items-center squircle-smooth cursor-text t:(padding-180-quad-out) {isCollapsed
                ? 'p-3 justify-center'
                : 'px-3.5 py-2.5 gap-2.5'}"
        >
            <Search size={16} class="text-weak shrink-0 pointer-events-none" />
            {#if !isCollapsed}
                <input
                    type="text"
                    bind:value={searchQuery}
                    placeholder="Filter components..."
                    class="text-sm font-medium text-strong placeholder:text-weak bg-transparent border-none w-full focus:outline-none"
                    {@attach focusAttach({ focusTarget: "#component-search-container", offset: 0 })}
                />
            {/if}
        </label>

        <!-- Component List -->
        <nav class="flex flex-col gap-1 overflow-y-auto no-scrollbar">
            {#each filteredComponents as item (item.id)}
                <button
                    type="button"
                    onclick={() => (selectedId = item.id)}
                    title={isCollapsed ? item.name : undefined}
                    class="rounded-2xl flex items-center text-left select-none active:scale-97 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) {isCollapsed
                        ? 'p-3 justify-center'
                        : 'p-3 justify-between'} {selectedId === item.id
                        ? 'text-strong bg-elevation-2 font-semibold'
                        : 'text-weak hover:text-strong hover:bg-elevation-2/50'}"
                >
                    <div class="flex items-center gap-2.5 overflow-hidden whitespace-nowrap">
                        <Box
                            size={16}
                            class="shrink-0 t:(text-180-quad-out) {selectedId === item.id
                                ? 'text-accent-500'
                                : 'text-weak/60'}"
                        />
                        {#if !isCollapsed}
                            <span class="text-sm font-medium truncate">{item.name}</span>
                        {/if}
                    </div>

                    {#if !isCollapsed}
                        <span class="text-[10px] text-weak/70 font-mono shrink-0 ml-2">{item.category}</span>
                    {/if}
                </button>
            {/each}
        </nav>
    </aside>

    <!-- Main Component Stage (Flat without shadow) -->
    <main
        class="p-8 flex flex-1 flex-col items-center justify-center relative overflow-hidden"
    >
        <div class="flex flex-col items-center gap-3 text-center">
            <div class="p-4 rounded-2xl bg-elevation-1 text-accent-500 squircle-smooth">
                <Box size={28} />
            </div>
            <h2 class="text-xl text-strong font-bold capitalize">{selectedId}</h2>
            <p class="text-xs text-weak max-w-sm">
                Component playground stage. Selected component will mount here automatically.
            </p>
        </div>
    </main>
</div>
