<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLInputAttributes } from "svelte/elements";
    import { disableInteraction } from "$attachments";
    import { uuid } from "$utils";

    import { focusAttach } from "$core/_system/focus/focus.attach";

    import {
        textInputContainerStyles,
        textInputIconStyles,
        textInputInputStyles,
        type TextInputStyleProps,
    } from "./text-input.styles";

    type Props = TextInputStyleProps &
        Omit<HTMLInputAttributes, "class" | "disabled" | "size"> & {
            value?: string;
            label?: string;
            invalid?: boolean;
            disabled?: boolean;
            iconLeft?: Snippet;
            iconRight?: Snippet;
            class?: string;
            inputClass?: string;
            element?: HTMLInputElement;
        };

    let {
        value = $bindable(""),
        label,
        variant = "soft",
        size = "md",
        invalid = false,
        disabled = false,
        iconLeft,
        iconRight,
        id,
        class: className = "",
        inputClass = "",
        element = $bindable(),
        type = "text",
        placeholder = "",
        ...restProps
    }: Props = $props();

    const defaultId = `text-input-${uuid()}`;
    const inputId = $derived(id ?? defaultId);
    const containerId = $derived(`${inputId}-container`);

    const containerClass = $derived(
        textInputContainerStyles({
            variant,
            size,
            invalid,
            class: className,
        })
    );

    const inputComputedClass = $derived(
        textInputInputStyles({
            size,
            invalid,
            class: inputClass,
        })
    );

    const iconLeftClass = $derived(
        textInputIconStyles({
            size,
            invalid,
        })
    );

    const focusColor = $derived(invalid ? "var(--color-danger-500)" : undefined);

    function handleContainerClick(event: MouseEvent): void {
        const target = event.target as HTMLElement | null;
        if (target?.closest("button, a, [role='button']")) {
            return;
        }
        element?.focus();
    }
</script>

{#snippet field()}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <div
        id={containerId}
        role="group"
        class={containerClass}
        onclick={handleContainerClick}
        {@attach disableInteraction({ enabled: disabled })}
    >
        {#if iconLeft}
            <span class="{iconLeftClass} [&>svg]:size-full [&>svg]:stroke-[2.25px]">
                {@render iconLeft()}
            </span>
        {/if}

        <input
            {...restProps}
            bind:this={element}
            bind:value
            id={inputId}
            {type}
            {placeholder}
            {disabled}
            aria-invalid={invalid ? "true" : undefined}
            class={inputComputedClass}
            {@attach focusAttach({ focusTarget: `#${containerId}`, color: focusColor })}
        />

        {#if iconRight}
            <span
                class="shrink-0 flex-center {invalid
                    ? 'text-danger-solid-1'
                    : 'text-weak'} [&>svg]:pointer-events-none"
            >
                {@render iconRight()}
            </span>
        {/if}
    </div>
{/snippet}

{#if label}
    <div class="flex flex-col gap-1.5 w-full">
        <label for={inputId} class="text-xs font-600 text-weak select-none">
            {label}
        </label>
        {@render field()}
    </div>
{:else}
    {@render field()}
{/if}
