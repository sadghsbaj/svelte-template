<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";
    import { disableInteraction } from "$attachments";
    import { HitArea, resolveHitArea, type HitAreaConfig } from "$components";
    import { uuid } from "$utils";

    import { focusAttach } from "$core/_system/focus/focus.attach";

    import { switchThumbStyles, switchTrackStyles, type SwitchStyleProps } from "./switch.styles";

    type Props = SwitchStyleProps &
        Omit<HTMLInputAttributes, "checked" | "class" | "color" | "disabled" | "size" | "type"> & {
            checked?: boolean;
            hitArea?: HitAreaConfig;
            disabled?: boolean;
            class?: string;
        };

    let {
        checked = $bindable(false),
        color = "accent",
        size = "md",
        hitArea = true,
        disabled = false,
        class: className = "",
        ...restProps
    }: Props = $props();

    const trackId = `switch-${uuid()}`;
    const resolvedHitAreaSize = $derived(resolveHitArea(hitArea, size));

    const trackClass = $derived(switchTrackStyles({ color, size, checked, class: className }));
    const thumbClass = $derived(switchThumbStyles({ color, size, checked }));
    const focusColor = $derived(
        checked && color === "accent" ? "var(--color-accent-300)" : undefined
    );
</script>

<label id={trackId} class={trackClass} {@attach disableInteraction({ enabled: disabled })}>
    <input
        {...restProps}
        {disabled}
        type="checkbox"
        class="sr-only"
        bind:checked
        {@attach focusAttach({ focusTarget: `#${trackId}`, color: focusColor })}
    />

    <span class={thumbClass}></span>

    {#if resolvedHitAreaSize !== false}
        <HitArea size={resolvedHitAreaSize} />
    {/if}
</label>
