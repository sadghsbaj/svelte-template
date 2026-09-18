<script lang="ts">
    import type { Snippet } from "svelte";
    import { cn } from "$utils";
    import PreviewSection from "./PreviewSection.svelte";

    interface Props {
        title?: string;
        description?: string;
        children?: Snippet;
        class?: string;
        containerClass?: string;
    }

    let {
        title = "Interactive Controls",
        description,
        children,
        class: className,
        containerClass,
    }: Props = $props();
</script>

<PreviewSection {title} {description} class={className}>
    <div
        class={cn(
            "flex flex-wrap items-center gap-5 p-4 rounded-2xl bg-elevation-1 shadow-sm w-fit mb-6",
            containerClass
        )}
    >
        {#if children}
            {@render children()}
        {/if}
    </div>
</PreviewSection>
