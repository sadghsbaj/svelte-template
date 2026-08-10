<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        label?: string;
        bg?: "elevation-0" | "elevation-1" | "elevation-2" | "transparent";
        checkerboard?: boolean;
        children?: Snippet;
        class?: string;
    }

    let {
        label,
        bg = "elevation-1",
        checkerboard = false,
        children,
        class: className = "",
    }: Props = $props();

    const bgClasses: Record<string, string> = {
        "elevation-0": "bg-elevation-0",
        "elevation-1": "bg-elevation-1",
        "elevation-2": "bg-elevation-2",
        transparent: "bg-transparent",
    };
</script>

<div
    class="p-6 {bgClasses[bg] ??
        'bg-elevation-1'} shadow-sm rounded-3xl squircle-smooth flex flex-col items-center justify-center relative min-h-[120px] overflow-hidden {label
        ? 'pt-9'
        : ''} {checkerboard ? 'bg-checkerboard' : ''} {className}"
>
    {#if label}
        <span
            class="px-2.5 py-1 rounded-xl bg-elevation-2/80 text-weak text-[11px] font-600 tracking-wide uppercase absolute top-3 left-3 select-none pointer-events-none"
        >
            {label}
        </span>
    {/if}

    {#if children}
        <div class="flex items-center justify-center w-full h-full">
            {@render children()}
        </div>
    {/if}
</div>

<style>
    .bg-checkerboard {
        background-image: radial-gradient(var(--color-elevation-2) 1.5px, transparent 1.5px);
        background-size: 14px 14px;
    }
</style>
