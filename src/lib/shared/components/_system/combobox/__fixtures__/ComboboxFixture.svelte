<script lang="ts">
    import Combobox from "$components/_system/combobox/Combobox.svelte";
    import type {
        ComboboxFilter,
        ComboboxOption,
    } from "$components/_system/combobox/combobox.types";

    interface Props {
        initialOptions: readonly ComboboxOption[];
        initialValue?: string;
        initialInputValue?: string;
        disabled?: boolean;
        invalid?: boolean;
        required?: boolean;
        name?: string;
        size?: "sm" | "md" | "lg";
        variant?: "soft" | "elevated";
        withForm?: boolean;
        filter?: ComboboxFilter;
        onValueChange?: (value: string | undefined) => void;
        onInputValueChange?: (value: string) => void;
        onOpenChange?: (open: boolean) => void;
    }

    let {
        initialOptions,
        initialValue,
        initialInputValue,
        disabled = false,
        invalid = false,
        required = false,
        name,
        size = "md",
        variant = "soft",
        withForm = false,
        filter,
        onValueChange,
        onInputValueChange,
        onOpenChange,
    }: Props = $props();

    // svelte-ignore state_referenced_locally
    let options = $state(initialOptions);
    // svelte-ignore state_referenced_locally
    let value = $state(initialValue);
    // svelte-ignore state_referenced_locally
    let inputValue = $state(initialInputValue);

    export const getValue = (): string | undefined => value;
    export const getInputValue = (): string | undefined => inputValue;
    export const setValue = (next: string | undefined): void => {
        value = next;
    };
    export const setInputValue = (next: string | undefined): void => {
        inputValue = next;
    };
    export const setOptions = (next: readonly ComboboxOption[]): void => {
        options = next;
    };
</script>

{#snippet control()}
    <Combobox
        bind:value
        bind:inputValue
        {options}
        {disabled}
        {invalid}
        {required}
        {name}
        {size}
        {variant}
        {filter}
        {onValueChange}
        {onInputValueChange}
        {onOpenChange}
        placeholder="Choose fruit"
        emptyText="Nothing here"
        aria-label="Fruit"
        data-consumer="forwarded"
        class="fixture-surface"
        inputClass="fixture-input"
        contentClass="fixture-content"
    />
{/snippet}

{#if withForm}
    <form>
        {@render control()}
        <button type="submit">Submit</button>
        <button type="reset">Reset</button>
    </form>
{:else}
    {@render control()}
{/if}

<button type="button" data-following>Following</button>
