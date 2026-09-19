<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { disableInteraction } from "$attachments";

    import { getSegmentedControlContext } from "./segmented-control.context";
    import { segmentedControlItemStyles } from "./segmented-control.styles";

    export interface SegmentedControlItemProps extends Omit<
        HTMLButtonAttributes,
        "aria-checked" | "class" | "disabled" | "role" | "type" | "value"
    > {
        value: string;
        disabled?: boolean;
        iconLeft?: Snippet;
        iconRight?: Snippet;
        children?: Snippet;
        class?: string;
        element?: HTMLButtonElement | null;
    }

    let {
        value,
        disabled = false,
        iconLeft,
        iconRight,
        children,
        class: className = "",
        element = $bindable(),
        onclick,
        ...restProps
    }: SegmentedControlItemProps = $props();

    const group = getSegmentedControlContext();
    const selected = $derived(group.isSelected(value));
    const layout = $derived(group.layout());
    const computedClass = $derived(
        segmentedControlItemStyles({ layout, selected, class: className })
    );

    function handleClick(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
    ): void {
        onclick?.(event);
        if (event.defaultPrevented || disabled || group.isDisabled()) return;
        group.select(value);
    }
</script>

<button
    bind:this={element}
    {...restProps}
    type="button"
    role="radio"
    aria-checked={selected}
    data-slot="segmented-control-item"
    data-state={selected ? "active" : "inactive"}
    data-value={value}
    class={computedClass}
    onclick={handleClick}
    {@attach disableInteraction({ enabled: disabled })}
>
    {#if iconLeft}
        {@render iconLeft()}
    {/if}

    {#if children}
        <span class="text-trim-truncate">{@render children()}</span>
    {/if}

    {#if iconRight}
        {@render iconRight()}
    {/if}
</button>
