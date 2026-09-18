<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    import { buttonGroupStyles } from "./button-group.styles";

    export type ButtonGroupOrientation = "horizontal" | "vertical";

    export interface ButtonGroupProps extends HTMLAttributes<HTMLDivElement> {
        orientation?: ButtonGroupOrientation;
        separators?: boolean;
        fullWidth?: boolean;
        children?: Snippet;
        class?: string;
        element?: HTMLDivElement | null;
    }

    let {
        orientation = "horizontal",
        separators = false,
        fullWidth = false,
        role = "group",
        children,
        class: className = "",
        element = $bindable(),
        ...restProps
    }: ButtonGroupProps = $props();

    const computedClass = $derived(
        buttonGroupStyles({
            orientation,
            fullWidth,
            class: className,
        })
    );
</script>

<div
    bind:this={element}
    {...restProps}
    {role}
    data-slot="button-group"
    data-orientation={orientation}
    data-separators={separators ? "" : undefined}
    data-full-width={fullWidth ? "" : undefined}
    class={computedClass}
>
    {@render children?.()}
</div>

<style>
    :global([data-slot="button-group"] > [data-slot="button"]) {
        --squircle-shape: var(--squircle-smooth);

        isolation: auto !important;

        position: relative;
        border-radius: 0 !important;
        transform: none !important;
        backface-visibility: visible !important;
        will-change: auto !important;
    }

    :global([data-slot="button-group"] > [data-slot="button"]:active) {
        scale: 1 !important;
    }

    :global([data-slot="button-group"] > [data-slot="button"]:hover) {
        z-index: 1;
    }

    :global([data-slot="button-group"] > [data-slot="button"]:focus-visible) {
        z-index: 2;
    }

    :global(
        [data-slot="button-group"][data-orientation="horizontal"][data-full-width]
            > [data-slot="button"]
    ) {
        flex: 1 1 0% !important;
        width: 0 !important;
        min-width: 0;
    }

    :global(
        [data-slot="button-group"][data-orientation="horizontal"][data-separators]
            > [data-slot="button"]
            + [data-slot="button"]::before
    ) {
        content: "";
        position: absolute;
        inset-block-start: 25%;
        inset-inline-start: 0;
        width: 1px;
        height: 50%;
        background: light-dark(rgb(0 0 0 / 10%), rgb(255 255 255 / 12%));
        border-radius: 9999px;
        translate: -50% 0;
        pointer-events: none;
    }

    :global(
        [data-slot="button-group"][data-orientation="horizontal"] > [data-slot="button"]:first-child
    ) {
        border-start-start-radius: 9999px !important;
        border-end-start-radius: 9999px !important;
    }

    :global(
        [data-slot="button-group"][data-orientation="horizontal"] > [data-slot="button"]:last-child
    ) {
        border-start-end-radius: 9999px !important;
        border-end-end-radius: 9999px !important;
    }

    :global(
        [data-slot="button-group"][data-orientation="horizontal"]
            > [data-button-bordered]
            + [data-button-bordered]
    ) {
        border-inline-start-width: 0 !important;
    }

    :global(
        [data-slot="button-group"][data-orientation="horizontal"]
            > [data-button-bordered]:has(+ [data-button-bordered])
    ) {
        border-inline-end-width: 0 !important;
    }

    :global([data-slot="button-group"][data-orientation="vertical"] > [data-slot="button"]) {
        width: 100% !important;
    }

    :global(
        [data-slot="button-group"][data-orientation="vertical"][data-separators]
            > [data-slot="button"]
            + [data-slot="button"]::before
    ) {
        content: "";
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 25%;
        width: 50%;
        height: 1px;
        background: light-dark(rgb(0 0 0 / 10%), rgb(255 255 255 / 12%));
        border-radius: 9999px;
        translate: 0 -50%;
        pointer-events: none;
    }

    :global(
        [data-slot="button-group"][data-orientation="vertical"] > [data-slot="button"]:first-child
    ) {
        border-start-start-radius: 9999px !important;
        border-start-end-radius: 9999px !important;
    }

    :global(
        [data-slot="button-group"][data-orientation="vertical"] > [data-slot="button"]:last-child
    ) {
        border-end-start-radius: 9999px !important;
        border-end-end-radius: 9999px !important;
    }

    :global(
        [data-slot="button-group"][data-orientation="vertical"]
            > [data-button-bordered]
            + [data-button-bordered]
    ) {
        border-block-start-width: 0 !important;
    }

    :global(
        [data-slot="button-group"][data-orientation="vertical"]
            > [data-button-bordered]:has(+ [data-button-bordered])
    ) {
        border-block-end-width: 0 !important;
    }

    :global(
        [data-slot="button-group"]:has(> [data-button-variant="elevated"]):not(
                :has(> [data-slot="button"]:not([data-button-variant="elevated"]))
            )
    ) {
        border-radius: 9999px;
        box-shadow: var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 5%));
    }

    :global(
        [data-slot="button-group"]:has(> [data-button-variant="elevated"]):not(
                :has(> [data-slot="button"]:not([data-button-variant="elevated"]))
            )
            > [data-button-variant="elevated"]:not([aria-busy="true"])
    ) {
        box-shadow: none !important;
    }
</style>
