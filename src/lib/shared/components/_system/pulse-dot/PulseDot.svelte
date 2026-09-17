<script lang="ts">
    import type { HTMLAttributes } from "svelte/elements";

    import {
        pulseDotCoreStyles,
        pulseDotPingStyles,
        pulseDotStyles,
        type PulseDotStyleProps,
    } from "./pulse-dot.styles";

    interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, "color">, PulseDotStyleProps {
        pulsing?: boolean;
        glow?: boolean;
        class?: string;
        element?: HTMLSpanElement | null;
    }

    let {
        color = "success",
        size = "md",
        pulsing = true,
        glow = true,
        class: className = "",
        element = $bindable(null),
        ...restProps
    }: Props = $props();

    const containerClass = $derived(
        pulseDotStyles({
            color,
            size,
            class: className,
        })
    );

    const coreClass = $derived(
        pulseDotCoreStyles({
            glow,
        })
    );

    const pingClass = $derived(pulseDotPingStyles());
</script>

<span bind:this={element} class={containerClass} {...restProps}>
    {#if pulsing}
        <span class={pingClass} aria-hidden="true"></span>
    {/if}
    <span class={coreClass} aria-hidden="true"></span>
</span>
