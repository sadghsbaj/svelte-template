<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { disableInteraction } from "$attachments";

    import { getOptionalToggleButtonGroupContext } from "$components/_system/toggle-button-group/toggle-button-group.context";

    import { toggleButtonStyles, type ToggleButtonStyleProps } from "./toggle-button.styles";

    export type ToggleButtonProps = ToggleButtonStyleProps &
        Omit<
            HTMLButtonAttributes,
            "aria-pressed" | "class" | "color" | "disabled" | "size" | "type" | "value"
        > & {
            pressed?: boolean;
            value?: string;
            disabled?: boolean;
            iconLeft?: Snippet;
            iconRight?: Snippet;
            class?: string;
            children?: Snippet;
            element?: HTMLButtonElement | null;
        };

    let {
        pressed = $bindable(false),
        value,
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

    const group = getOptionalToggleButtonGroupContext();

    function validateGroupValue(): void {
        if (group && value === undefined) {
            throw new Error("ToggleButton requires a value inside ToggleButtonGroup");
        }
    }
    validateGroupValue();

    function resolvePressed(): boolean {
        return group && value !== undefined ? group.isPressed(value) : pressed;
    }

    const effectivePressed = $derived(resolvePressed());

    const computedClass = $derived(
        toggleButtonStyles({
            variant,
            size,
            align,
            pressed: effectivePressed,
            fullWidth,
            iconOnly,
            class: className,
        })
    );

    function handleClick(
        event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }
    ): void {
        onclick?.(event);
        if (event.defaultPrevented) return;
        if (group && value !== undefined) {
            group.toggle(value);
        } else {
            pressed = !pressed;
        }
    }
</script>

<button
    bind:this={element}
    {...restProps}
    type="button"
    {value}
    aria-pressed={effectivePressed}
    data-slot="toggle-button"
    data-state={effectivePressed ? "on" : "off"}
    class={computedClass}
    onclick={handleClick}
    {@attach disableInteraction({ enabled: disabled })}
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
