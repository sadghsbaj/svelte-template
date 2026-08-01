<script lang="ts" generics="T extends keyof SvelteHTMLElements = 'div'">
    import type { Snippet } from "svelte";
    import type { SvelteHTMLElements } from "svelte/elements";

    import { appInertState } from "$core/_system/layout/app-layer/layer.svelte";

    type Props = SvelteHTMLElements[T] & {
        children?: Snippet;
        as?: T;
    };

    let { children, as = "div" as T, class: className = "", ...restProps }: Props = $props();
</script>

<svelte:element
    this={as}
    data-layout="app-stage"
    class={className || undefined}
    {...restProps}
    inert={appInertState.isAppInert}
>
    {@render children?.()}
</svelte:element>

<style>
    [data-layout="app-stage"] {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        overflow: hidden;
        color: var(--color-text-strong);
        background-color: var(--color-elevation-0);
    }
</style>
