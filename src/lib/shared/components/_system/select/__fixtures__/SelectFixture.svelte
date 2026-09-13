<script lang="ts">
    import Select from "$components/_system/select/Select.svelte";
    import type { SelectOption } from "$components/_system/select/select.types";

    interface Props {
        initialOptions: readonly SelectOption[];
        initialValue?: string;
        disabled?: boolean;
        required?: boolean;
        name?: string;
        size?: "sm" | "md" | "lg";
        variant?: "soft" | "elevated";
        placeholder?: string;
        emptyText?: string;
        withForm?: boolean;
        onValueChange?: (value: string) => void;
    }

    let {
        initialOptions,
        initialValue,
        disabled = false,
        required = false,
        name,
        size = "md",
        variant = "soft",
        placeholder,
        emptyText,
        withForm = false,
        onValueChange,
    }: Props = $props();

    // svelte-ignore state_referenced_locally
    let options = $state(initialOptions);
    // svelte-ignore state_referenced_locally
    let value = $state(initialValue);

    export const getValue = (): string | undefined => value;
    export const setValue = (next: string | undefined): void => {
        value = next;
    };
    export const setOptions = (next: readonly SelectOption[]): void => {
        options = next;
    };
</script>

{#snippet control()}
    <Select
        bind:value
        {options}
        {disabled}
        {required}
        {name}
        {size}
        {variant}
        {placeholder}
        {emptyText}
        {onValueChange}
        aria-label="Fruit"
        data-consumer="forwarded"
        class="fixture-trigger"
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
