<script lang="ts">
    import { Check, ChevronDown } from "@lucide/svelte";
    import { disableInteraction } from "$attachments";

    import Popover from "$components/_system/popover/Popover.svelte";
    import {
        defaultSelectionFilter,
        getEnabledIndexes,
        getNextEnabledIndex,
        getSelectedIndex,
        groupSelectionEntries,
        normalizeStaleValue,
    } from "$components/_system/selection/selection.helpers";
    import {
        selectionContentStyles,
        selectionOptionStyles,
        selectionSectionLabelStyles,
        selectionSectionStyles,
    } from "$components/_system/selection/selection.styles";
    import TextInput from "$components/_system/text-input/TextInput.svelte";

    import type { ComboboxOption, ComboboxProps } from "./combobox.types";

    let {
        options,
        value = $bindable<string | undefined>(),
        inputValue = $bindable<string | undefined>(),
        placeholder = "Select an option",
        size = "md",
        variant = "soft",
        disabled = false,
        invalid = false,
        filter = defaultSelectionFilter,
        emptyText = "No options found",
        name,
        required = false,
        form,
        class: className = "",
        inputClass = "",
        contentClass = "",
        onValueChange,
        onInputValueChange,
        onOpenChange,
        onclick,
        oninput,
        onkeydown,
        oncompositionstart,
        oncompositionend,
        ...restProps
    }: ComboboxProps = $props();

    const instanceId = $props.id();
    const optionId = (index: number): string => `combobox-${instanceId}-option-${index}`;
    const sectionId = (index: number): string => `combobox-${instanceId}-section-${index}`;
    const initialValue = value;
    const initialInputWasExplicit = inputValue !== undefined;
    // svelte-ignore state_referenced_locally
    const initialOption = options[getSelectedIndex(options, value)];
    inputValue ??= initialOption?.label ?? "";
    const initialEditing = initialInputWasExplicit && inputValue !== (initialOption?.label ?? "");

    let open = $state(false);
    let composing = $state(false);
    let editing = $state(initialEditing);
    let popupQuery = $state(initialEditing ? (inputValue ?? "") : "");
    let activeIndex = $state<number>();
    let inputElement = $state<HTMLInputElement>();
    let surfaceElement = $state<HTMLDivElement>();
    let contentElement = $state<HTMLDivElement>();
    let proxyElement = $state<HTMLSelectElement>();
    let observedValue = value;
    let observedInputValue: string | undefined = inputValue;
    let observedSelectedLabel: string | undefined = initialOption?.label;

    const selectedIndex = $derived(getSelectedIndex(options, value));
    const selectedOption = $derived<ComboboxOption | undefined>(options[selectedIndex]);
    const filteredEntries = $derived(
        options.flatMap((option, index) => (filter(option, popupQuery) ? [{ option, index }] : []))
    );
    const filteredOptions = $derived(filteredEntries.map((entry) => entry.option));
    const filteredGroups = $derived(groupSelectionEntries(filteredEntries));
    const enabledFilteredIndexes = $derived(
        getEnabledIndexes(filteredOptions).map((index) => filteredEntries[index]?.index as number)
    );
    const activeOption = $derived(activeIndex === undefined ? undefined : options[activeIndex]);
    const activeDescendant = $derived(
        open &&
            activeOption &&
            !activeOption.disabled &&
            filteredEntries.some((item) => item.index === activeIndex)
            ? optionId(activeIndex as number)
            : undefined
    );
    const contentClassName = $derived(selectionContentStyles({ class: contentClass }));

    const setInputValue = (next: string, notify = true): void => {
        if (inputValue === next) return;
        observedInputValue = next;
        inputValue = next;
        if (notify) onInputValueChange?.(next);
    };

    const setCommittedValue = (next: string | undefined): void => {
        if (value === next) return;
        observedValue = next;
        value = next;
        onValueChange?.(next);
    };

    const rollbackInput = (): void => {
        editing = false;
        setInputValue(selectedOption?.label ?? "");
    };

    const chooseInitialActive = (direction: 1 | -1): void => {
        activeIndex =
            selectedIndex >= 0 && enabledFilteredIndexes.includes(selectedIndex)
                ? selectedIndex
                : direction === 1
                  ? enabledFilteredIndexes[0]
                  : enabledFilteredIndexes.at(-1);
    };

    const openWithDirection = (direction: 1 | -1): void => {
        if (!open) {
            popupQuery = editing ? (inputValue ?? "") : "";
            chooseInitialActive(direction);
            open = true;
            return;
        }
        activeIndex = getNextEnabledIndex(enabledFilteredIndexes, activeIndex, direction);
    };

    const commitOption = (option: ComboboxOption, index: number): void => {
        if (option.disabled) return;
        editing = false;
        activeIndex = index;
        setCommittedValue(option.value);
        setInputValue(option.label);
        open = false;
        inputElement?.focus({ preventScroll: true });
    };

    const handleInput = (event: Event): void => {
        oninput?.(event as Parameters<NonNullable<ComboboxProps["oninput"]>>[0]);
        if (event.defaultPrevented || composing || disabled) return;
        const next = (event.currentTarget as HTMLInputElement).value;
        editing = true;
        popupQuery = next;
        setInputValue(next);
        if (selectedOption?.label !== next) setCommittedValue(undefined);
        open = true;
        activeIndex = enabledFilteredIndexes[0];
    };

    const handleKeydown = (event: KeyboardEvent): void => {
        onkeydown?.(event as Parameters<NonNullable<ComboboxProps["onkeydown"]>>[0]);
        if (event.defaultPrevented || disabled || composing || event.isComposing) return;

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            openWithDirection(event.key === "ArrowDown" ? 1 : -1);
            return;
        }
        if (event.key === "Enter" && open && activeIndex !== undefined) {
            const option = options[activeIndex];
            if (!option || option.disabled) return;
            event.preventDefault();
            commitOption(option, activeIndex);
            return;
        }
        if (event.key === "Escape" && open) {
            event.preventDefault();
            rollbackInput();
            open = false;
            return;
        }
        if (event.key === "Tab" && open) {
            rollbackInput();
            open = false;
        }
    };

    const handleCompositionEnd = (event: CompositionEvent): void => {
        composing = false;
        oncompositionend?.(event as Parameters<NonNullable<ComboboxProps["oncompositionend"]>>[0]);
        if (event.defaultPrevented || disabled) return;
        const next = (event.currentTarget as HTMLInputElement).value;
        editing = true;
        popupQuery = next;
        setInputValue(next);
        if (selectedOption?.label !== next) setCommittedValue(undefined);
        open = true;
        activeIndex = enabledFilteredIndexes[0];
    };

    const handleInvalid = (event: Event): void => {
        event.preventDefault();
        inputElement?.focus({ preventScroll: true, focusVisible: true });
    };

    const handleSurfaceClick = (event: MouseEvent): void => {
        if (event.defaultPrevented || disabled || event.target === inputElement) return;
        if (!open) {
            popupQuery = editing ? (inputValue ?? "") : "";
            chooseInitialActive(1);
            open = true;
        }
    };

    const resetForm = (): void => {
        queueMicrotask(() => {
            const next = normalizeStaleValue(options, initialValue);
            observedValue = next;
            value = next;
            editing = false;
            setInputValue(options[getSelectedIndex(options, next)]?.label ?? "", false);
            open = false;
        });
    };

    $effect(() => {
        const normalized = normalizeStaleValue(options, value);
        if (normalized !== value) {
            observedValue = normalized;
            value = normalized;
            if (!editing) setInputValue("", false);
        } else if (value !== observedValue) {
            observedValue = value;
            if (!editing)
                setInputValue(options[getSelectedIndex(options, value)]?.label ?? "", false);
        }
    });

    $effect(() => {
        if (inputValue === observedInputValue) return;
        observedInputValue = inputValue;
        editing = (inputValue ?? "") !== (selectedOption?.label ?? "");
        if (open) {
            popupQuery = inputValue ?? "";
            activeIndex = enabledFilteredIndexes[0];
        }
    });

    $effect(() => {
        const label = selectedOption?.label;
        if (label === observedSelectedLabel) return;
        observedSelectedLabel = label;
        if (!editing) setInputValue(label ?? "", false);
    });

    $effect(() => {
        if (activeIndex !== undefined && !enabledFilteredIndexes.includes(activeIndex)) {
            activeIndex = enabledFilteredIndexes[0];
        }
    });

    $effect(() => {
        if (!open || activeIndex === undefined || !contentElement) return;
        const frame = requestAnimationFrame(() => {
            contentElement
                ?.querySelector<HTMLElement>(`#${optionId(activeIndex as number)}`)
                ?.scrollIntoView({ block: "nearest" });
        });
        return () => cancelAnimationFrame(frame);
    });

    $effect(() => {
        if (!proxyElement) return;
        if (value === undefined) proxyElement.selectedIndex = -1;
        else proxyElement.value = value;
    });

    $effect(() => {
        const ownerForm = proxyElement?.form;
        if (!ownerForm) return;
        ownerForm.addEventListener("reset", resetForm);
        return () => ownerForm.removeEventListener("reset", resetForm);
    });

    $effect(() => {
        const surface = surfaceElement;
        if (!surface) return;

        surface.addEventListener("click", handleSurfaceClick);
        return () => surface.removeEventListener("click", handleSurfaceClick);
    });
</script>

<TextInput
    {...restProps}
    value={inputValue ?? ""}
    {placeholder}
    {size}
    {variant}
    {disabled}
    {invalid}
    class={className}
    {inputClass}
    bind:element={inputElement}
    bind:containerElement={surfaceElement}
    role="combobox"
    aria-autocomplete="list"
    aria-expanded={open}
    aria-required={required ? "true" : undefined}
    aria-controls={contentElement?.id}
    aria-activedescendant={activeDescendant}
    autocomplete={restProps.autocomplete ?? "off"}
    onclick={(event) => {
        onclick?.(event as Parameters<NonNullable<ComboboxProps["onclick"]>>[0]);
        if (!event.defaultPrevented && !disabled) {
            if (!open) {
                popupQuery = editing ? (inputValue ?? "") : "";
                chooseInitialActive(1);
            }
            open = true;
        }
    }}
    oninput={handleInput}
    onkeydown={handleKeydown}
    oncompositionstart={(event) => {
        composing = true;
        oncompositionstart?.(
            event as Parameters<NonNullable<ComboboxProps["oncompositionstart"]>>[0]
        );
    }}
    oncompositionend={handleCompositionEnd}
>
    {#snippet iconRight()}
        <ChevronDown
            aria-hidden="true"
            class="pointer-events-none t-rotate-200-cubic-out {open ? 'rotate-180' : ''}"
        />
    {/snippet}
</TextInput>

<Popover
    bind:open
    bind:element={contentElement}
    triggerElement={surfaceElement}
    anchor={surfaceElement}
    {disabled}
    placement="bottom-start"
    offset={6}
    modal={false}
    dismiss={{ outsidePointer: true, escape: true, focusOutside: true, anchorDetached: true }}
    initialFocus={false}
    restoreFocus={false}
    role="listbox"
    animation="default"
    aria-label={restProps["aria-label"] ?? (restProps["aria-labelledby"] ? undefined : placeholder)}
    aria-labelledby={restProps["aria-labelledby"]}
    class={contentClassName}
    onOpenChange={(nextOpen) => {
        if (!nextOpen && editing) rollbackInput();
        onOpenChange?.(nextOpen);
    }}
>
    {#if filteredEntries.length === 0}
        <div class="px-10px py-8px text-sm text-weak select-none">{emptyText}</div>
    {:else}
        {#each filteredGroups as group, groupIndex (groupIndex)}
            <div
                role={group.section ? "group" : undefined}
                aria-labelledby={group.section ? sectionId(groupIndex) : undefined}
                class={selectionSectionStyles({ separated: groupIndex > 0 })}
            >
                {#if group.section}
                    <div id={sectionId(groupIndex)} class={selectionSectionLabelStyles({ size })}>
                        {group.section}
                    </div>
                {/if}
                {#each group.entries as entry (entry.index)}
                    <!-- Keyboard interaction remains on the combobox input by design. -->
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <div
                        id={optionId(entry.index)}
                        role="option"
                        tabindex="-1"
                        aria-selected={selectedIndex === entry.index}
                        aria-disabled={entry.option.disabled ? "true" : undefined}
                        class={selectionOptionStyles({
                            size,
                            selected: selectedIndex === entry.index,
                            active: activeIndex === entry.index,
                            described: Boolean(entry.option.description),
                        })}
                        onpointerdown={(event) => event.preventDefault()}
                        onpointermove={() => {
                            if (!entry.option.disabled) activeIndex = entry.index;
                        }}
                        onmousedown={(event) => event.preventDefault()}
                        onclick={() => commitOption(entry.option, entry.index)}
                        {@attach disableInteraction({ enabled: entry.option.disabled === true })}
                    >
                        {#if entry.option.icon}
                            {const OptionIcon = entry.option.icon}
                            <OptionIcon aria-hidden="true" class="shrink-0 text-weak" />
                        {/if}
                        <span class="flex min-w-0 flex-1 flex-col">
                            <span class="truncate leading-normal">{entry.option.label}</span>
                            {#if entry.option.description}
                                <span class="truncate text-xs font-400 leading-normal text-weak">
                                    {entry.option.description}
                                </span>
                            {/if}
                        </span>
                        {#if selectedIndex === entry.index}
                            <Check
                                aria-hidden="true"
                                class="text-accent-solid-1 shrink-0 opacity-80"
                            />
                        {/if}
                    </div>
                {/each}
            </div>
        {/each}
    {/if}
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
