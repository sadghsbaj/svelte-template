<script lang="ts">
    import type { Snippet } from "svelte";
    import type {
        HTMLAnchorAttributes,
        HTMLButtonAttributes,
        HTMLLabelAttributes,
    } from "svelte/elements";
    import { disableInteraction, pending } from "$attachments";
    import { cn } from "$utils";

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
        };

    let {
        variant,
        color,
        size,
        fullWidth,
        iconOnly,
        iconLeft,
        iconRight,
        as = "button",
        disabled = false,
        loading = false,
        class: className = "",
        children,
        ...restProps
    }: Props = $props();

    const computedClass = $derived(
        buttonStyles({
            variant,
            color,
            size,
            fullWidth,
            iconOnly,
            class: className,
        })
    );
</script>

<svelte:element
    this={as}
    type={as === "button" ? "button" : undefined}
    {...restProps}
    class={computedClass}
    {@attach disableInteraction({ enabled: disabled })}
    {@attach pending({ active: loading })}
>
    {#if iconLeft}
        {@render iconLeft()}
    {/if}

    {@render children?.()}

    {#if iconRight}
        {@render iconRight()}
    {/if}
</svelte:element>
