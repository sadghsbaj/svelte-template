<script lang="ts">
    import type { Snippet } from "svelte";
    import type {
        HTMLAnchorAttributes,
        HTMLButtonAttributes,
        HTMLLabelAttributes,
    } from "svelte/elements";
    import { disableInteraction, pending } from "$attachments";

    import { focusAttach } from "$core/_system/focus/focus.attach";

    import { buttonStyles, type ButtonStyleProps } from "./button.styles";

    type Props = ButtonStyleProps &
        Omit<HTMLButtonAttributes, "color" | "size"> &
        Omit<HTMLAnchorAttributes, "color" | "size"> &
        Omit<HTMLLabelAttributes, "color" | "size"> & {
            iconLeft?: Snippet;
            iconRight?: Snippet;
            as?: "button" | "a" | "label";
            disabled?: boolean;
            loading?: boolean;
            class?: string;
            children?: Snippet;
            element?: HTMLElement | null;
        };

    let {
        variant = "solid",
        color = "accent",
        size = "md",
        align = "center",
        fullWidth,
        iconOnly,
        iconLeft,
        iconRight,
        as = "button",
        disabled = false,
        loading = false,
        class: className = "",
        children,
        element = $bindable(),
        ...restProps
    }: Props = $props();

    const computedClass = $derived(
        buttonStyles({
            variant,
            color,
            size,
            align,
            fullWidth,
            iconOnly,
            class: className,
        })
    );

    const focusColor = $derived(
        variant === "solid" && color === "accent" ? "var(--color-accent-300)" : undefined
    );
</script>

<svelte:element
    this={as}
    bind:this={element}
    type={as === "button" ? "button" : undefined}
    {...restProps}
    class={computedClass}
    {@attach disableInteraction({ enabled: disabled })}
    {@attach pending({ active: loading })}
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
</svelte:element>
