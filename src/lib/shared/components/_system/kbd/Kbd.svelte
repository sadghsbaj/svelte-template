<script lang="ts">
    import { kbdSeparatorStyles, kbdSequenceSeparatorStyles, kbdStyles } from "./kbd.styles";
    import type { KbdProps } from "./kbd.types";
    import { getShortcutAriaLabel, getShortcutTitle, resolveShortcut } from "./kbd.utils";

    let {
        combo,
        keys,
        key,
        platform = "auto",
        format = "symbols",
        size = "md",
        variant = "soft",
        separator = false,
        class: className = "",
        "aria-label": ariaLabel,
        "aria-hidden": ariaHidden,
        title,
        children,
        ...restProps
    }: KbdProps = $props();

    const shortcut = $derived(resolveShortcut({ combo, keys, key, format }, platform));
    const hasStructuredKeys = $derived(shortcut.steps.some((step) => step.length > 0));
    const isSingle = $derived(
        hasStructuredKeys &&
            shortcut.steps.length === 1 &&
            shortcut.steps[0]?.length === 1 &&
            (shortcut.steps[0][0]?.type === "icon" || shortcut.steps[0][0]?.value.length === 1)
    );
    const separatorText = $derived(typeof separator === "string" ? separator : "+");
    const resolvedTitle = $derived(
        title ?? (hasStructuredKeys ? getShortcutTitle(shortcut) : undefined)
    );
    const resolvedAriaLabel = $derived(
        ariaHidden === true || ariaHidden === "true"
            ? undefined
            : (ariaLabel ?? (hasStructuredKeys ? getShortcutAriaLabel(shortcut) : undefined))
    );

    const computedClass = $derived(
        kbdStyles({
            variant,
            size,
            single: isSingle,
            class: className,
        })
    );

    const sepClass = $derived(
        kbdSeparatorStyles({
            size,
        })
    );
    const sequenceSepClass = $derived(kbdSequenceSeparatorStyles({ size }));
</script>

<kbd
    class={computedClass}
    aria-label={resolvedAriaLabel}
    aria-hidden={ariaHidden}
    title={resolvedTitle}
    {...restProps}
>
    {#if hasStructuredKeys}
        {#each shortcut.steps as step, stepIndex (stepIndex)}
            {#if stepIndex > 0}
                <span class={sequenceSepClass} aria-hidden="true">›</span>
            {/if}
            {#each step as keyItem, keyIndex (keyIndex)}
                {#if keyIndex > 0 && separator}
                    <span class={sepClass} aria-hidden="true">{separatorText}</span>
                {/if}
                {#if keyItem.type === "icon" && keyItem.icon}
                    {const KeyIcon = keyItem.icon}
                    <span
                        class="inline-flex items-center justify-center"
                        data-kbd-key={keyItem.type}
                        data-kbd-value={keyItem.value}
                        aria-hidden="true"
                    >
                        <KeyIcon class="shrink-0" aria-hidden="true" />
                    </span>
                {:else}
                    <span
                        class="inline-flex items-center justify-center"
                        data-kbd-key={keyItem.type}
                        data-kbd-value={keyItem.value}
                        aria-hidden="true"
                    >
                        {keyItem.value}
                    </span>
                {/if}
            {/each}
        {/each}
    {:else if children}
        {@render children()}
    {/if}
</kbd>
