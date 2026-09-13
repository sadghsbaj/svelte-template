<script lang="ts">
    import Popover from "$components/_system/popover/Popover.svelte";

    let parentOpen = $state(true);
    let childOpen = $state(false);

    export const isParentOpen = (): boolean => parentOpen;
    export const isChildOpen = (): boolean => childOpen;
</script>

<Popover bind:open={parentOpen} animation="none">
    {#snippet trigger(context)}
        <button data-nested="parent-trigger" {@attach context.attachment}>Parent</button>
    {/snippet}
    {#snippet children(context)}
        <button data-nested="parent-inside" data-parent-open={context.open}>Parent content</button>
        <Popover bind:open={childOpen} animation="none">
            {#snippet trigger(context)}
                <button data-nested="child-trigger" {@attach context.attachment}>Child</button>
            {/snippet}
            {#snippet children(context)}
                <button data-nested="child-inside" data-child-open={context.open}
                    >Child content</button
                >
            {/snippet}
        </Popover>
    {/snippet}
</Popover>
