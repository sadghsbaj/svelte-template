<script lang="ts">
    import { flip } from "$core/_system/motion";

    import FeedbackItem from "$components/_system/feedback/FeedbackItem.svelte";

    import Toast from "./Toast.svelte";
    import { toast } from "./toastState.svelte";
    import type { ToastPosition } from "./toast.types";

    let {
        positions,
        limit = 4,
    }: {
        positions: readonly ToastPosition[];
        limit?: number;
    } = $props();

    const items = $derived(
        toast.records.filter(
            (item) => item.phase !== "queued" && positions.includes(item.position)
        )
    );
    const edge = $derived(positions[0]?.startsWith("top") ? "top" : "bottom");
    $effect(() => {
        toast.setLimit(limit);
    });
</script>

{#if items.length > 0}
    <div data-slot="toast-stack" data-edge={edge} class="flex w-full flex-col gap-8px">
        {#each items as item (item.id)}
            <div animate:flip={{ duration: 220 }} class="w-full">
                <FeedbackItem
                    phase={item.phase}
                    dismissReason={item.dismissReason}
                    {edge}
                    dismissible={item.dismissible}
                    pauseOnInteraction={item.pauseOnInteraction}
                    onEntered={() => toast.markEntered(item.id)}
                    onExited={() => toast.completeDismiss(item.id)}
                    onDismiss={(reason) => toast.requestDismiss(item.id, reason, true)}
                    onPause={(reason) => toast.pause(item.id, reason)}
                    onResume={(reason) => toast.resume(item.id, reason)}
                >
                    <Toast
                        status={item.status}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        action={item.action}
                        dismissible={item.dismissible}
                        closeButton={item.closeButton}
                        onDismiss={() => toast.requestDismiss(item.id, "close-button", true)}
                        onAction={() => void toast.runAction(item.id)}
                    />
                </FeedbackItem>
            </div>
        {/each}
    </div>
{/if}
