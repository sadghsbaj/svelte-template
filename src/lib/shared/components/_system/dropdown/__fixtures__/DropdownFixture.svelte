<script lang="ts">
    import { Button, Dropdown, type DropdownEntry } from "$components";

    interface Props {
        items: readonly DropdownEntry[];
        initialOpen?: boolean;
        disabled?: boolean;
        direction?: "auto" | "ltr" | "rtl";
        hoverOpenDelay?: number;
        hoverCloseDelay?: number;
        submenuMode?: "auto" | "floating" | "drilldown";
    }

    let {
        items,
        initialOpen = false,
        disabled = false,
        direction = "auto",
        hoverOpenDelay = 0,
        hoverCloseDelay = 0,
        submenuMode = "floating",
    }: Props = $props();

    // svelte-ignore state_referenced_locally
    let open = $state(initialOpen);

    export const getOpen = (): boolean => open;
</script>

<Dropdown
    {items}
    bind:open
    {disabled}
    {direction}
    {hoverOpenDelay}
    {hoverCloseDelay}
    {submenuMode}
    aria-label="File actions"
>
    {#snippet trigger(context)}
        <Button variant="elevated" color="base" data-dropdown-trigger {@attach context.attachment}>
            Actions
        </Button>
    {/snippet}
</Dropdown>

<button type="button" data-following>Following</button>
