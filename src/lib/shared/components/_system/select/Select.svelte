<script lang="ts">
    import { Check, ChevronDown } from "@lucide/svelte";
    import { disableInteraction, rovingFocus } from "$attachments";

    import Popover from "$components/_system/popover/Popover.svelte";

    import { selectContentStyles, selectOptionStyles, selectTriggerStyles } from "./select.styles";
    import type { SelectOption, SelectProps } from "./select.types";

    let {
        options,
        value = $bindable<string | undefined>(),
        placeholder = "Select an option",
        size = "md",
        disabled = false,
        name,
        required = false,
        form,
        class: className = "",
        contentClass = "",
        onValueChange,
        onclick,
        onkeydown,
        ...restProps
    }: SelectProps = $props();

    const instanceId = $props.id();
    const labelId = `select-${instanceId}-label`;
    const optionId = (index: number): string => `select-${instanceId}-option-${index}`;
    const initialValue = value;

    let open = $state(false);
    let anchorElement = $state<HTMLSpanElement>();
    let triggerElement = $state<HTMLButtonElement>();
    let contentElement = $state<HTMLDivElement>();
    let proxyElement = $state<HTMLSelectElement>();
    let focusIntent = $state<number | "first" | "last" | null>(null);

    const selectedIndex = $derived(options.findIndex((option) => option.value === value));
    const selectedOption = $derived<SelectOption | undefined>(options[selectedIndex]);
    const triggerClass = $derived(selectTriggerStyles({ size, class: className }));
    const contentClassName = $derived(selectContentStyles({ class: contentClass }));

    const isPrintableKey = (event: KeyboardEvent): boolean =>
        event.key.length === 1 &&
        event.key.trim().length > 0 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey &&
        !event.isComposing;

    const availableIndexes = (): number[] =>
        options.flatMap((option, index) => (option.disabled ? [] : [index]));

    const selectedOrFirst = (): number | "first" =>
        selectedIndex >= 0 && !options[selectedIndex]?.disabled ? selectedIndex : "first";

    const findTypeaheadIndex = (key: string): number | undefined => {
        const query = key.toLocaleLowerCase();
        return availableIndexes().find((index) =>
            options[index]?.label.trim().toLocaleLowerCase().startsWith(query)
        );
    };

    const focusTarget = (
        container: HTMLElement,
        items: readonly HTMLElement[]
    ): HTMLElement | null => {
        if (items.length === 0) return null;
        if (typeof focusIntent === "number") {
            return container.querySelector<HTMLElement>(`#${optionId(focusIntent)}`);
        }
        if (focusIntent === "last")
            return items.findLast((item) => item.ariaDisabled !== "true") ?? null;
        if (focusIntent === "first")
            return items.find((item) => item.ariaDisabled !== "true") ?? null;
        if (selectedIndex >= 0 && !options[selectedIndex]?.disabled) {
            return container.querySelector<HTMLElement>(`#${optionId(selectedIndex)}`);
        }
        return items.find((item) => item.ariaDisabled !== "true") ?? null;
    };

    const rovingAttachment = $derived(
        rovingFocus({
            selector: '[role="option"]',
            orientation: "vertical",
            loop: true,
            initialItem: focusTarget,
            typeahead: true,
        })
    );

    const selectOption = (
        option: SelectOption,
        event: Event,
        close: (reason?: "programmatic", event?: Event) => void
    ): void => {
        if (option.disabled) return;
        const changed = value !== option.value;
        close("programmatic", event);
        if (changed) {
            queueMicrotask(() => {
                value = option.value;
                onValueChange?.(option.value);
            });
        }
    };

    const handleTriggerKeydown = (
        event: KeyboardEvent,
        openPopover: (reason?: "trigger", event?: Event) => void
    ): void => {
        onkeydown?.(event as Parameters<NonNullable<SelectProps["onkeydown"]>>[0]);
        if (event.defaultPrevented || disabled || open) return;

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            focusIntent =
                event.key === "ArrowDown"
                    ? selectedOrFirst()
                    : selectedIndex >= 0 && !options[selectedIndex]?.disabled
                      ? selectedIndex
                      : "last";
            openPopover("trigger", event);
        } else if (["Enter", " ", "Spacebar"].includes(event.key)) {
            focusIntent = selectedOrFirst();
        } else if (isPrintableKey(event)) {
            const match = findTypeaheadIndex(event.key);
            if (match === undefined) return;
            event.preventDefault();
            focusIntent = match;
            openPopover("trigger", event);
        }
    };

    const handleInvalid = (event: Event): void => {
        event.preventDefault();
        triggerElement?.focus({ preventScroll: true, focusVisible: true });
    };

    const resetForm = (): void => {
        queueMicrotask(() => {
            value =
                initialValue !== undefined &&
                options.some((option) => option.value === initialValue)
                    ? initialValue
                    : undefined;
        });
    };

    $effect(() => {
        if (options.length > 0 && value !== undefined && selectedIndex < 0) value = undefined;
    });

    $effect(() => {
        if (!open || focusIntent === null || !contentElement) return;
        const content = contentElement;
        const frame = requestAnimationFrame(() => {
            const indexes = availableIndexes();
            const index =
                typeof focusIntent === "number"
                    ? focusIntent
                    : focusIntent === "last"
                      ? indexes.at(-1)
                      : indexes.at(0);
            if (index === undefined) return;
            content
                .querySelector<HTMLElement>(`#${optionId(index)}`)
                ?.focus({ preventScroll: true, focusVisible: true });
        });
        return () => cancelAnimationFrame(frame);
    });

    $effect(() => {
        if (!proxyElement) return;
        if (value === undefined) proxyElement.selectedIndex = -1;
        else proxyElement.value = value;
    });

    $effect(() => {
        const form = proxyElement?.form;
        if (!form) return;
        form.addEventListener("reset", resetForm);
        return () => form.removeEventListener("reset", resetForm);
    });
</script>

<Popover
    bind:open
    bind:element={contentElement}
    anchor={anchorElement}
    {disabled}
    placement="bottom-start"
    offset={6}
    modal={false}
    dismiss={{ outsidePointer: true, escape: true, focusOutside: true, anchorDetached: true }}
    initialFocus={false}
    restoreFocus="auto"
    role="listbox"
    animation="default"
    aria-label={restProps["aria-label"]}
    aria-labelledby={restProps["aria-labelledby"] ??
        (restProps["aria-label"] ? undefined : labelId)}
    aria-required={required ? "true" : undefined}
    class={contentClassName}
>
    {#snippet trigger(context)}
        <span bind:this={anchorElement} class="inline-flex max-w-full">
            <button
                {...restProps}
                bind:this={triggerElement}
                type="button"
                {form}
                class={triggerClass}
                onclick={(event) => {
                    onclick?.(event);
                    if (!event.defaultPrevented && event.detail > 0) focusIntent = null;
                }}
                onkeydown={(event) => handleTriggerKeydown(event, context.openPopover)}
                {@attach context.attachment}
                {@attach disableInteraction({ enabled: disabled })}
            >
                <span id={labelId} class="flex items-center gap-inherit min-w-0">
                    {#if selectedOption?.icon}
                        {const SelectedIcon = selectedOption.icon}
                        <SelectedIcon aria-hidden="true" />
                    {/if}
                    <span class={selectedOption ? "truncate" : "truncate text-weak"}>
                        {selectedOption?.label ?? placeholder}
                    </span>
                </span>
                <ChevronDown
                    aria-hidden="true"
                    class="text-weak shrink-0 t-rotate-200-cubic-out {context.open
                        ? 'rotate-180'
                        : ''}"
                />
            </button>
        </span>
    {/snippet}

    {#snippet children(context)}
        <div {@attach rovingAttachment}>
            {#each options as option, index (index)}
                <div
                    id={optionId(index)}
                    role="option"
                    tabindex="-1"
                    aria-selected={selectedIndex === index}
                    aria-disabled={option.disabled ? "true" : undefined}
                    class={selectOptionStyles({
                        size,
                        selected: selectedIndex === index,
                    })}
                    onclick={(event) => selectOption(option, event, context.close)}
                    onkeydown={(event) => {
                        if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar")
                            return;
                        event.preventDefault();
                        selectOption(option, event, context.close);
                    }}
                    {@attach disableInteraction({ enabled: option.disabled === true })}
                >
                    {#if option.icon}
                        {const OptionIcon = option.icon}
                        <OptionIcon aria-hidden="true" class="shrink-0" />
                    {/if}
                    <span class="truncate flex-1">{option.label}</span>
                    {#if selectedIndex === index}
                        <Check aria-hidden="true" class="text-accent-solid-1 shrink-0 opacity-80" />
                    {/if}
                </div>
            {/each}
        </div>
    {/snippet}
</Popover>

{#if name || required}
    <select
        bind:this={proxyElement}
        {name}
        {required}
        {form}
        {disabled}
        tabindex="-1"
        class="sr-only"
        aria-hidden="true"
        aria-label={restProps["aria-label"] ?? placeholder}
        oninvalid={handleInvalid}
    >
        {#each options as option, index (index)}
            <option value={option.value} disabled={option.disabled}>{option.label}</option>
        {/each}
    </select>
{/if}
