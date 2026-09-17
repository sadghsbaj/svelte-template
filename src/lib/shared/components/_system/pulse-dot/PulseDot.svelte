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
        <span class="{pingClass} pulse-dot-ping" aria-hidden="true"></span>
    {/if}
    <span class={coreClass} aria-hidden="true"></span>
</span>

<style>
    .pulse-dot-ping {
        position: absolute;
        inset: 0;
        border-radius: 9999px;
        background-color: currentColor;
        pointer-events: none;
        will-change: transform;
        transform: translateZ(0);
        animation: pulse-dot-ping-kf 2.2s var(--ease-quart-out) infinite;
    }

    :global(.pulse-dot-glow) {
        box-shadow:
            0 0 6px 1px currentColor,
            0 0 12px 2px color-mix(in srgb, currentColor 35%, transparent);
    }

    @keyframes pulse-dot-ping-kf {
        0% {
            opacity: 0.75;
            transform: scale(1);
        }
        50% {
            opacity: 0;
            transform: scale(2.4);
        }
        100% {
            opacity: 0;
            transform: scale(2.4);
        }
    }
</style>
