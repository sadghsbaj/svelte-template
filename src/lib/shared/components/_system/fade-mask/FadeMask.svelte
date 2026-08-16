<script lang="ts">
    import type { Snippet } from "svelte";
    import { cn } from "$utils";

    interface Props {
        type?: "radial" | "top" | "bottom" | "left" | "right" | "block" | "inline";
        strength?: "sm" | "md" | "lg";
        class?: string;
        children?: Snippet;
    }

    let {
        type = "radial",
        strength = "md",
        class: className,
        children,
        ...restProps
    }: Props = $props();

    const STRENGTH_MAP = {
        sm: { start: "60%", end: "100%", edge: "15%" },
        md: { start: "30%", end: "90%", edge: "25%" },
        lg: { start: "0%", end: "75%", edge: "35%" },
    };

    let active = $derived(STRENGTH_MAP[strength]);

    let gradientValue = $derived.by(() => {
        switch (type) {
            case "radial": {
                return `radial-gradient(ellipse in oklch, black ${active.start}, transparent ${active.end})`;
            }
            case "bottom": {
                return `linear-gradient(in oklch to bottom, black ${active.start}, transparent ${active.end})`;
            }
            case "top": {
                return `linear-gradient(in oklch to top, black ${active.start}, transparent ${active.end})`;
            }
            case "left": {
                return `linear-gradient(in oklch to left, black ${active.start}, transparent ${active.end})`;
            }
            case "right": {
                return `linear-gradient(in oklch to right, black ${active.start}, transparent ${active.end})`;
            }
            case "block": {
                return `linear-gradient(in oklch to bottom, transparent 0%, black ${active.edge}, black calc(100% -
                        ${active.edge}), transparent 100%)`;
            }
            case "inline": {
                return `linear-gradient(in oklch to right, transparent 0%, black ${active.edge}, black calc(100% -
                        ${active.edge}), transparent 100%)`;
            }
        }
    });
</script>

<div
    class={cn("fade-mask", className)}
    style:mask-image={gradientValue}
    style:-webkit-mask-image={gradientValue}
    aria-hidden="true"
    {...restProps}
>
    {@render children?.()}
</div>

<style>
    :global(:has(> .fade-mask)) {
        contain: layout;
    }

    .fade-mask {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        border-radius: inherit;
        pointer-events: none;
    }

    .fade-mask > :global(*) {
        width: 100%;
        height: 100%;
    }
</style>
