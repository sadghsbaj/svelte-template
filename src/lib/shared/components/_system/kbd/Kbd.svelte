<script lang="ts">
    import { KBD_ICON_SIZES, kbdSeparatorStyles, kbdStyles } from "./kbd.styles";
    import type { KbdProps } from "./kbd.types";
    import { resolveKeys } from "./kbd.utils";

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
        children,
        ...restProps
    }: KbdProps = $props();

    const resolvedKeys = $derived(resolveKeys({ combo, keys, key, format }, platform));
    const hasStructuredKeys = $derived(resolvedKeys.length > 0);
    const isSingle = $derived(
        hasStructuredKeys &&
            resolvedKeys.length === 1 &&
            (resolvedKeys[0].type === "icon" || resolvedKeys[0].label.length === 1)
    );
    const iconSize = $derived(KBD_ICON_SIZES[size ?? "md"]);
    const separatorText = $derived(typeof separator === "string" ? separator : "+");
    const resolvedAriaLabel = $derived(
        ariaHidden === true || ariaHidden === "true"
            ? undefined
            : (ariaLabel ??
                  (hasStructuredKeys
                      ? resolvedKeys.map((item) => item.ariaLabel ?? item.label).join(" plus ")
                      : undefined))
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
</script>

<kbd class={computedClass} aria-label={resolvedAriaLabel} aria-hidden={ariaHidden} {...restProps}>
    {#if hasStructuredKeys}
        {#each resolvedKeys as keyItem, index (index)}
            {#if index > 0 && separator}
                <span class={sepClass} aria-hidden="true">{separatorText}</span>
            {/if}
            {#if keyItem.type === "icon" && keyItem.icon}
                {const IconComponent = keyItem.icon}
                <IconComponent size={iconSize} strokeWidth={2.25} aria-hidden="true" />
            {:else}
                <span aria-hidden="true">{keyItem.label}</span>
            {/if}
        {/each}
    {:else if children}
        {@render children()}
    {/if}
</kbd>
