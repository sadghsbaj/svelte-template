<script lang="ts">
    import type { Snippet } from "svelte";
    import { cn } from "$utils";

    interface Props {
        children?: Snippet;
        class?: string;
    }

    let { children, class: className }: Props = $props();
</script>

<div class={cn("h-full w-full overflow-y-auto p-6 md:p-8 pb-28", className)}>
    <div class="max-w-5xl mx-auto w-full flex flex-col gap-8">
        {@render children?.()}
    </div>
</div>
