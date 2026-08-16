<script lang="ts">
    import type { Snippet } from "svelte";
    import { cn } from "$utils";

    interface Props {
        title?: string;
        description?: string;
        children?: Snippet;
        class?: string;
    }

    let { title, description, children, class: className }: Props = $props();
</script>

<section class={cn("flex flex-col gap-3.5", className)}>
    {#if title || description}
        <div class="flex flex-col gap-0.5 select-none">
            {#if title}
                <h2 class="text-base font-600 text-strong tracking-tight">
                    {title}
                </h2>
            {/if}
            {#if description}
                <p class="text-xs text-weak font-400">
                    {description}
                </p>
            {/if}
        </div>
    {/if}

    {#if children}
        {@render children()}
    {/if}
</section>
