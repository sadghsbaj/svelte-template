<script lang="ts">
    import { Box, Layers, Search } from "@lucide/svelte";

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
        class="p-4 rounded-3xl bg-elevation-1 flex shrink-0 flex-col gap-4 shadow-md w-64 md:w-72 squircle-smooth overflow-hidden"
    >
        <!-- Sidebar Header -->
        <div class="px-2 pt-1 flex items-center justify-between">
            <div class="flex items-center gap-2 text-strong font-bold">
                <Layers size={18} class="text-accent-500" />
                <span>Components</span>
            </div>
            <span
                class="text-xs text-accent-500 font-semibold px-2 py-0.5 rounded-full bg-accent-500/10"
            >
                {mockComponents.length}
            </span>
        </div>

        <!-- Search Bar Container with Focus Target Redirect -->
        <label
            id="component-search-container"
            class="px-3.5 py-2.5 rounded-2xl bg-elevation-2 flex items-center gap-2.5 squircle-smooth cursor-text"
        >
            <Search size={15} class="text-weak shrink-0 pointer-events-none" />
            <input
                type="text"
                bind:value={searchQuery}
                placeholder="Filter components..."
                class="text-xs text-strong placeholder:text-weak bg-transparent border-none w-full focus:outline-none"
                {@attach focusAttach({ focusTarget: "#component-search-container" })}
            />
        </label>

        <!-- Component List -->
        <nav class="flex flex-col gap-1 overflow-y-auto no-scrollbar">
            {#each filteredComponents as item (item.id)}
                <button
                    type="button"
                    onclick={() => (selectedId = item.id)}
                    class="p-3 rounded-2xl flex items-center justify-between text-left select-none t:(bg-180-quad-out text-180-quad-out scale-180-quad-out) active:scale-97 {selectedId ===
                    item.id
                        ? 'text-strong bg-elevation-2 font-semibold'
                        : 'text-weak hover:text-strong hover:bg-elevation-2/50'}"
                >
                    <div class="flex items-center gap-2.5">
                        <Box
                            size={16}
                            class="t:(text-180-quad-out) {selectedId === item.id
                                ? 'text-accent-500'
                                : 'text-weak/60'}"
                        />
                        <span class="text-sm font-medium">{item.name}</span>
                    </div>
                    <span class="text-[10px] text-weak/70 font-mono">{item.category}</span>
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
