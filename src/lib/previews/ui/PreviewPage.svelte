<script lang="ts">
    import type { Snippet } from "svelte";
    import { cn } from "$utils";

    interface Props {
        children?: Snippet;
        class?: string;
    }

    let { children, class: className }: Props = $props();
</script>

<div class={cn("scrollbar-lg h-full w-full overflow-y-auto px-6 pt-6 pb-40 md:px-8 md:pt-8 md:pb-40 scroll-pb-40", className)}>
    <div class="max-w-5xl mx-auto w-full flex flex-col gap-8">
        {@render children?.()}
    </div>
</div>
