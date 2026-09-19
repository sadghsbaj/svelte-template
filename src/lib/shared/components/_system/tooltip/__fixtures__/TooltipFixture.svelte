<script lang="ts">
    import TooltipHost from "$components/_system/tooltip/TooltipHost.svelte";
    import { tooltip } from "$components/_system/tooltip/tooltip.attach";
    import type { TooltipInput } from "$components/_system/tooltip/tooltip.types";

    interface Props {
        input?: TooltipInput;
    }

    let {
        input = {
            content: "Fixture tooltip",
            openDelay: 0,
            closeDelay: 0,
            animation: "none",
        },
    }: Props = $props();
</script>

{#snippet secondLeading()}
    <svg data-leading viewBox="0 0 14 14" aria-hidden="true"></svg>
{/snippet}

{#snippet secondTrailing()}
    <span data-trailing>⌘K</span>
{/snippet}

<button id="tooltip-trigger" aria-describedby="existing-description" {@attach tooltip(input)}>
    Trigger
</button>
<button
    id="tooltip-trigger-second"
    {@attach tooltip({
        title: "Second tooltip",
        description: "Second description",
        leading: secondLeading,
        trailing: secondTrailing,
        openDelay: 0,
        closeDelay: 0,
        animation: "none",
    })}
>
    Second trigger
</button>
<span id="existing-description">Existing description</span>
<TooltipHost />
