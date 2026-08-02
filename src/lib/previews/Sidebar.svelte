<script lang="ts">
    import { BarChart3, Home, Settings } from "@lucide/svelte";

    import { viewState } from "$views/view.svelte";

    const navItems = [
        { id: "home", label: "Home", icon: Home },
        { id: "stats", label: "Stats", icon: BarChart3 },
        { id: "settings", label: "Settings", icon: Settings },
    ] as const;
</script>

<aside
    class="p-4 border-r bg-elevation-1 flex shrink-0 flex-col h-full min-w-[256px] w-64 select-none justify-between border-base-200/80 dark:border-base-800/80"
>
    <div class="flex flex-col gap-6">
        <div class="px-2 py-1 flex gap-3 items-center">
            <div
                class="text-sm text-accent-500 font-bold rounded-xl flex h-8 w-8 items-center justify-center squircle bg-accent-500/20"
            >
                ST
            </div>
            <div class="flex flex-col">
                <span class="text-sm text-strong leading-none font-bold">Template</span>
                <span class="text-[11px] text-weak">App Layout</span>
            </div>
        </div>

        <nav class="flex flex-col gap-1">
            {#each navItems as item (item.id)}
                {const IconComponent = item.icon}
                <button
                    type="button"
                    onclick={() => viewState.setView(item.id)}
                    class="text-sm font-medium px-3 py-2.5 rounded-xl flex gap-3 t-bg-150-sine-out t-text-150-sine-out items-center {viewState.activeView ===
                    item.id
                        ? 'text-strong bg-elevation-2 shadow-xs'
                        : 'text-weak hover:text-strong hover:bg-elevation-2/50'}"
                >
                    <IconComponent
                        size={18}
                        class={viewState.activeView === item.id ? "text-accent-500" : ""}
                    />
                    <span>{item.label}</span>
                </button>
            {/each}
        </nav>
    </div>

    <div
        class="p-3 border rounded-xl flex flex-col gap-1 border-base-200/60 bg-elevation-2/60 dark:border-base-800/60"
    >
        <span class="text-xs text-strong font-semibold">Active View</span>
        <span class="text-[11px] text-accent-500 font-medium font-mono capitalize"
            >{viewState.activeView}</span
        >
    </div>
</aside>
