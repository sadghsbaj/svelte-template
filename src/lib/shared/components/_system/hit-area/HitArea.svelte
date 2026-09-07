<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$utils";

    import type { HitAreaSize } from "./hit-area";

    interface Props extends HTMLAttributes<HTMLSpanElement> {
        size?: HitAreaSize;
        class?: string;
    }

    let { size = "md", class: className, ...restProps }: Props = $props();

    const PRESETS: Record<"sm" | "md" | "lg", number> = {
        sm: 40,
        md: 44,
        lg: 48,
    };

    let resolvedSize = $derived(typeof size === "number" ? size : (PRESETS[size] ?? 44));
</script>

<span
    aria-hidden="true"
    class={cn("hit-area", className)}
    style:width="{resolvedSize}px"
    style:height="{resolvedSize}px"
    {...restProps}
></span>

<style>
    :global(:has(> .hit-area)) {
        contain: layout;
    }

    .hit-area {
        -webkit-tap-highlight-color: transparent;
        position: absolute;
        top: 50%;
        left: 50%;
        min-width: 100%;
        min-height: 100%;
        transform: translate(-50%, -50%);
        contain: strict;
        cursor: inherit;
        pointer-events: auto;
        user-select: none;
    }
</style>
