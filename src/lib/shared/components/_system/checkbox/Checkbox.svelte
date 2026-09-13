<script lang="ts">
    import { cubicOut, sineInOut } from "svelte/easing";
    import type { HTMLInputAttributes } from "svelte/elements";
    import { disableInteraction } from "$attachments";
    import { HitArea, resolveHitArea, type HitAreaConfig } from "$components";
    import { uuid } from "$utils";

    import { draw, fade, type TransitionConfig } from "$core/_system";
    import { focusAttach } from "$core/_system/focus/focus.attach";

    import { checkboxIconStyles, checkboxStyles, type CheckboxStyleProps } from "./checkbox.styles";

    type Props = CheckboxStyleProps &
        Omit<HTMLInputAttributes, "checked" | "class" | "color" | "disabled" | "size" | "type"> & {
            checked?: boolean;
            indeterminate?: boolean;
            hitArea?: HitAreaConfig;
            disabled?: boolean;
            class?: string;
        };

    let {
        checked = $bindable(false),
        indeterminate = $bindable(false),
        variant = "soft",
        color = "accent",
        size = "md",
        hitArea = true,
        disabled = false,
        class: className = "",
        ...restProps
    }: Props = $props();

    const checkboxId = `checkbox-${uuid()}`;
    const resolvedHitAreaSize = $derived(resolveHitArea(hitArea, size));

    const checkboxClass = $derived(
        checkboxStyles({ variant, color, size, checked, class: className })
    );
    const checkboxIconClass = $derived(
        checkboxIconStyles({ color, size, checked, class: className })
    );

    const focusColor = $derived(
        checked && color === "accent" ? "var(--color-accent-300)" : undefined
    );

    let wasActive = false;

    $effect(() => {
        wasActive = checked || indeterminate;
    });

    const iconIn = (node: SVGPathElement): TransitionConfig => {
        const isCrossfade = wasActive && (checked || indeterminate);
        if (isCrossfade) {
            return fade(node, { duration: 180 });
        }
        return draw(node, { duration: 200, easing: sineInOut });
    };
</script>

<label id={checkboxId} class={checkboxClass} {@attach disableInteraction({ enabled: disabled })}>
    <input
        {...restProps}
        {disabled}
        type="checkbox"
        class="sr-only"
        bind:checked
        {@attach focusAttach({ focusTarget: `#${checkboxId}`, color: focusColor })}
    />

    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
        class={checkboxIconClass}
    >
        {#if indeterminate}
            <path
                d="M12 12H5"
                stroke="currentColor"
                stroke-width="4"
                in:iconIn
                out:fade={{ duration: 180, easing: cubicOut }}
            />
            <path
                d="M12 12H19"
                stroke="currentColor"
                stroke-width="4"
                in:iconIn
                out:fade={{ duration: 180, easing: cubicOut }}
            />
        {:else if checked}
            <path
                d="M4 12 l5 5 L20 6"
                stroke="currentColor"
                stroke-width="4"
                in:iconIn
                out:fade={{ duration: 180, easing: cubicOut }}
            />
        {/if}
    </svg>

    {#if resolvedHitAreaSize !== false}
        <HitArea size={resolvedHitAreaSize} />
    {/if}
</label>
