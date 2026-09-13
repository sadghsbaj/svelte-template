<script lang="ts">
    import type { FloatingAnchor } from "$components/_system/floating/floating.types";
    import Popover from "$components/_system/popover/Popover.svelte";
    import type {
        PopoverAnimation,
        PopoverChangeDetail,
        PopoverDismissDetail,
        PopoverDismissOptions,
        PopoverInitialFocus,
        PopoverRestoreFocus,
        PopoverRole,
    } from "$components/_system/popover/popover.types";

    interface Props {
        initialOpen?: boolean;
        initialDisabled?: boolean;
        anchor?: FloatingAnchor;
        dismiss?: boolean | PopoverDismissOptions;
        modal?: boolean;
        initialFocus?: PopoverInitialFocus;
        restoreFocus?: PopoverRestoreFocus;
        role?: PopoverRole;
        animation?: "default" | "none" | PopoverAnimation;
        preventTriggerClick?: boolean;
        onOpenChange?: (open: boolean, detail: PopoverChangeDetail) => void;
        onDismiss?: (detail: PopoverDismissDetail) => boolean | void;
    }

    let {
        initialOpen = false,
        initialDisabled = false,
        anchor,
        dismiss,
        modal = false,
        initialFocus,
        restoreFocus,
        role,
        animation = "none",
        preventTriggerClick = false,
        onOpenChange,
        onDismiss,
    }: Props = $props();

    // svelte-ignore state_referenced_locally
    let open = $state(initialOpen);
    // svelte-ignore state_referenced_locally
    let disabled = $state(initialDisabled);
    let contentElement = $state<HTMLDivElement>();
    let triggerElement = $state<HTMLElement>();

    export const setOpen = (value: boolean): void => {
        open = value;
    };
    export const setDisabled = (value: boolean): void => {
        disabled = value;
    };
    export const getOpen = (): boolean => open;
    export const getContent = (): HTMLDivElement | undefined => contentElement;
    export const getTrigger = (): HTMLElement | undefined => triggerElement;
</script>

<Popover
    bind:open
    bind:element={contentElement}
    bind:triggerElement
    {disabled}
    {anchor}
    {dismiss}
    {modal}
    {initialFocus}
    {restoreFocus}
    {role}
    {animation}
    {onOpenChange}
    {onDismiss}
    aria-label="Fixture popover"
    class="consumer-content"
>
    {#snippet trigger(context)}
        <button
            id="consumer-trigger"
            aria-expanded="true"
            onclick={(event) => {
                if (preventTriggerClick) event.preventDefault();
            }}
            {@attach context.attachment}>Toggle</button
        >
    {/snippet}
    {#snippet children(context)}
        <span data-phase>{context.phase}</span>
        <button id="first-focus">First</button>
        <button id="last-focus">Last</button>
        <button onclick={() => context.close("programmatic")}>Close</button>
    {/snippet}
</Popover>
