<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import {
        badgeStyles,
        type BadgeStyleProps,
    } from "./badge.styles";

    export type BadgeVariant = "soft" | "solid";
    export type BadgeColor =
        | "accent"
        | "danger"
        | "success"
        | "warning"
        | "info"
        | "base";
    export type BadgeSize = "xs" | "sm" | "md" | "lg" | "xl";

    export interface BadgeProps
        extends Omit<HTMLAttributes<HTMLSpanElement>, "color">,
            BadgeStyleProps {
        iconLeft?: Snippet;
        iconRight?: Snippet;
        class?: string;
        children?: Snippet;
        element?: HTMLSpanElement | null;
    }

    let {
        variant = "soft",
        color = "base",
        size = "md",
        square = false,
        iconLeft,
        iconRight,
        class: className = "",
        children,
        element = $bindable(null),
        ...restProps
    }: BadgeProps = $props();

    const computedClass = $derived(
        badgeStyles({
            variant,
            color,
            size,
            square,
            class: className,
        })
    );
</script>

<span bind:this={element} class={computedClass} {...restProps}>
    {#if iconLeft}
        {@render iconLeft()}
    {/if}

    {#if children}
        {#if square}
            {@render children()}
        {:else}
            <span class="text-trim-truncate">
                {@render children()}
            </span>
        {/if}
    {/if}

    {#if iconRight}
        {@render iconRight()}
    {/if}
</span>
