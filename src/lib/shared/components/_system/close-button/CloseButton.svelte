<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLButtonAttributes } from "svelte/elements";
    import { X } from "@lucide/svelte";
    import { disableInteraction } from "$attachments";
    import { HitArea, resolveHitArea, type HitAreaConfig } from "$components";

    import { closeButtonStyles, type CloseButtonStyleProps } from "./close-button.styles";

    const ICON_SIZES = {
        sm: 12,
        md: 16,
        lg: 24,
    } as const;

    interface Props extends HTMLButtonAttributes, CloseButtonStyleProps {
        hitArea?: HitAreaConfig;
        disabled?: boolean;
        class?: string;
        children?: Snippet;
    }

    let {
        variant,
        size,
        hitArea = true,
        disabled = false,
        class: className = "",
        children,
        ...restProps
    }: Props = $props();

    const iconSize = $derived(ICON_SIZES[size ?? "md"]);

    const resolvedHitAreaSize = $derived(resolveHitArea(hitArea, size ?? "md"));

    const computedClass = $derived(
        closeButtonStyles({
            variant,
            size,
            class: className,
        })
    );
</script>

<!-- aria-label acts as overridable default; type="button" is strictly enforced -->
<button
    aria-label="Close"
    {...restProps}
    type="button"
    class={computedClass}
    {@attach disableInteraction({ enabled: disabled })}
>
    <X size={iconSize} strokeWidth={2.5} aria-hidden="true" />

    {#if resolvedHitAreaSize !== false}
        <HitArea size={resolvedHitAreaSize} />
    {/if}

    {@render children?.()}
</button>
