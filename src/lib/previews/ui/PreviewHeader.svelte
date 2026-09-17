<script lang="ts">
    import type { Component, Snippet } from "svelte";
    import { cn } from "$utils";

    interface Props {
        title: string;
        description?: string;
        icon?: Component<{ size?: number; class?: string }>;
        children?: Snippet;
        class?: string;
    }

    let { title, description, icon: Icon, children, class: className }: Props = $props();
</script>

<header class={cn("flex flex-col gap-2.5 select-none", className)}>
    <div class="flex items-center gap-3">
        {#if Icon}
            <div
                class="p-2.5 rounded-2xl bg-elevation-1 text-accent-500 shadow-xs squircle-smooth flex-center shrink-0"
            >
                <Icon size={22} />
            </div>
        {/if}

        <h1 class="title-2xl md:title-3xl">
            {title}
        </h1>
    </div>

    {#if description}
        <p class="subtitle-md max-w-2xl">
            {description}
        </p>
    {/if}

    {#if children}
        <div class="mt-1 flex items-center gap-2">
            {@render children()}
        </div>
    {/if}
</header>
