<script lang="ts">
    import Floating from "$components/_system/floating/Floating.svelte";
    import type {
        FloatingAnchor,
        FloatingContext,
        FloatingPlacement,
        FloatingPositionResult,
    } from "$components/_system/floating/floating.types";

    interface Props {
        anchor: FloatingAnchor;
        placement?: FloatingPlacement;
        onPositionChange?: (result: FloatingPositionResult) => void;
        trackPosition?: boolean;
    }

    let {
        anchor: initialAnchor,
        placement: initialPlacement = "bottom",
        onPositionChange,
        trackPosition = false,
    }: Props = $props();

    // svelte-ignore state_referenced_locally
    let anchor = $state(initialAnchor);
    // svelte-ignore state_referenced_locally
    let placement = $state(initialPlacement);
    let floatingElement = $state<HTMLDivElement>();

    export const setAnchor = (next: FloatingAnchor): void => {
        anchor = next;
    };
    export const setPlacement = (next: FloatingPlacement): void => {
        placement = next;
    };
    export const getElement = (): HTMLDivElement | undefined => floatingElement;
</script>

<Floating
    {anchor}
    {placement}
    {trackPosition}
    {onPositionChange}
    bind:element={floatingElement}
    id="fixture-floating"
    class="consumer-class"
    style="color: red; transform: scale(1)"
>
    {#snippet children(context: FloatingContext)}
        <span data-context>{context.placement}:{context.positioned}</span>
    {/snippet}
</Floating>
