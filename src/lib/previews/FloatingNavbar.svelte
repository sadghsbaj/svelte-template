<script lang="ts">
    import { BarChart3, Home, Settings } from "@lucide/svelte";

    import { viewState } from "$views/view.svelte";

    const navItems = [
        { id: "home", label: "Home", icon: Home },
        { id: "stats", label: "Stats", icon: BarChart3 },
        { id: "settings", label: "Settings", icon: Settings },
    ] as const;
</script>

<nav
    class="p-1.5 rounded-2xl bg-elevation-1/90 flex gap-1 shadow-xl transition-all duration-300 items-center bottom-6 left-1/2 fixed z-40 backdrop-blur-md -translate-x-1/2"
>
    {#each navItems as item (item.id)}
        {const IconComponent = item.icon}
        <button
            type="button"
            onclick={() => viewState.setView(item.id)}
            class="text-sm font-medium px-4 py-2.5 rounded-xl flex gap-2 transition-all duration-200 items-center {viewState.activeView ===
            item.id
                ? 'text-strong bg-elevation-2 shadow-xs'
                : 'text-weak hover:text-strong'}"
        >
            <IconComponent
                size={16}
                class={viewState.activeView === item.id ? "text-accent-500" : ""}
            />
            <span>{item.label}</span>
        </button>
    {/each}
</nav>
