<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { disableInteraction } from "$attachments";

    import { focusAttach } from "$core/_system/focus/focus.attach";

    import { toggleButtonStyles, type ToggleButtonStyleProps } from "./toggle-button.styles";

    export type ToggleButtonProps = ToggleButtonStyleProps &
        Omit<
            HTMLButtonAttributes,
            "aria-pressed" | "class" | "color" | "disabled" | "size" | "type"
        > & {
            pressed?: boolean;
            disabled?: boolean;
            iconLeft?: Snippet;
            iconRight?: Snippet;
            class?: string;
            children?: Snippet;
            element?: HTMLButtonElement | null;
        };

    let {
        pressed = $bindable(false),
        variant = "soft",
        size = "md",
        align = "center",
        fullWidth,
        iconOnly,
        disabled = false,
        iconLeft,
        iconRight,
        class: className = "",
        children,
        element = $bindable(),
        onclick,
        ...restProps
    }: ToggleButtonProps = $props();

    const computedClass = $derived(
        toggleButtonStyles({
            variant,
            size,
            align,
            pressed,
            fullWidth,
            iconOnly,
            class: className,
        })
    );

    const focusColor = $derived(pressed ? "var(--color-accent-300)" : undefined);

    function handleClick(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
    ): void {
        onclick?.(event);
        if (!event.defaultPrevented) pressed = !pressed;
    }
</script>

<button
    bind:this={element}
    {...restProps}
    type="button"
    aria-pressed={pressed}
    data-slot="toggle-button"
    data-state={pressed ? "on" : "off"}
    class={computedClass}
    onclick={handleClick}
    {@attach disableInteraction({ enabled: disabled })}
    {@attach focusAttach({ color: focusColor })}
>
    {#if iconLeft}
        {@render iconLeft()}
    {/if}

    <span class="text-trim-truncate">
        {@render children?.()}
    </span>

    {#if iconRight}
        {@render iconRight()}
    {/if}
</button>
