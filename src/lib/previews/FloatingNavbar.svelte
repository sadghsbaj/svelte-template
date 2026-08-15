<script lang="ts">
    import { Component, FlaskConical, Settings } from "@lucide/svelte";

    import { layerAttach } from "$core/_system/layout/app-layer/layer.svelte";
    import { viewState } from "$views/view.svelte";

    const navItems = [
        { id: "components", label: "Components", icon: Component },
        { id: "playground", label: "Playground", icon: FlaskConical },
        { id: "settings", label: "Settings", icon: Settings },
    ] as const;
</script>

<nav
    class="p-2 rounded-2xl bg-elevation-1 flex gap-1.5 pointer-events-auto shadow-2xl items-center bottom-7 left-1/2 fixed z-40 -translate-x-1/2"
    {@attach layerAttach}
>
    {#each navItems as item (item.id)}
        {const IconComponent = item.icon}
        <button
            type="button"
            onclick={() => viewState.setView(item.id)}
            class="cursor-pointer text-sm font-500 h-10 px-4 rounded-xl flex-center gap-2.5 w-36 select-none active:scale-96 t:(bg-180-quad-out text-180-quad-out scale-180-quad-out){viewState.activeView ===
            item.id
                ? 'text-strong bg-elevation-2 font-600'
                : 'text-weak hover:text-strong hover:bg-elevation-2/50'}"
        >
            <IconComponent
                size={17}
                class="t:(text-180-quad-out scale-180-quad-out) {viewState.activeView === item.id
                    ? 'text-accent-500 scale-110'
                    : 'text-weak/70'}"
            />
            <span>{item.label}</span>
        </button>
    {/each}
</nav>
