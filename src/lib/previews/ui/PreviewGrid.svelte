<script lang="ts">
    import type { Snippet } from "svelte";

    interface Props {
        cols?: 1 | 2 | 3 | 4 | "auto";
        children?: Snippet;
        class?: string;
    }

    let { cols = 3, children, class: className = "" }: Props = $props();

    const colClasses: Record<number | string, string> = {
        1: "grid-cols-1",
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
        auto: "grid-cols-[repeat(auto-fit,minmax(220px,1fr))]",
    };
</script>

<div class="grid {colClasses[cols] ?? colClasses[3]} gap-4 md:gap-5 w-full {className}">
    {#if children}
        {@render children()}
    {/if}
</div>
