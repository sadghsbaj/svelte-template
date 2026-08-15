<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { Loader2 } from "@lucide/svelte";
    import { cn } from "$utils";

    import { buttonStyles, type ButtonStyleProps } from "./button.styles";

    type Props = HTMLButtonAttributes &
        ButtonStyleProps & {
            loading?: boolean;
            icon?: Snippet;
            children?: Snippet;
        };

    let {
        variant,
        color,
        size,
        fullWidth,
        pill,
        square,
        loading = false,
        disabled = false,
        class: className,
        icon,
        children,
        ...rest
    }: Props = $props();

    const computedClass = $derived(
        cn(
            buttonStyles({
                variant,
                color,
                size,
                fullWidth,
                pill,
                square,
                loading,
            }),
            className
        )
    );
</script>

<button
    disabled={disabled || loading}
    data-variant={variant}
    data-color={color}
    data-size={size}
    data-loading={loading || undefined}
    class={computedClass}
    {...rest}
>
    {#if loading}
        <Loader2 size={16} class="animate-spin shrink-0" />
    {:else if icon}
        {@render icon()}
    {/if}
    {@render children?.()}
</button>
