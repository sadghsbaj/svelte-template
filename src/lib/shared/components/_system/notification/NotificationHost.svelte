<script lang="ts">
    import { flip } from "$core/_system/motion";

    import FeedbackItem from "$components/_system/feedback/FeedbackItem.svelte";

    import Notification from "./Notification.svelte";
    import { notification } from "./notificationState.svelte";

    let { limit = 4 }: { limit?: number } = $props();

    const items = $derived(notification.records.filter((item) => item.phase !== "queued"));
    const announcement = $derived(notification.announcement);

    $effect(() => {
        notification.setLimit(limit);
    });
</script>

{#if items.length > 0}
    <div data-slot="notification-stack" class="flex w-full flex-col gap-10px">
        {#each items as item (item.id)}
            <div animate:flip={{ duration: 220 }} class="w-full">
                <FeedbackItem
                    phase={item.phase}
                    dismissReason={item.dismissReason}
                    edge="top"
                    dismissible={item.dismissible}
                    pauseOnInteraction={item.pauseOnInteraction}
                    onEntered={() => notification.markEntered(item.id)}
                    onExited={() => notification.completeDismiss(item.id)}
                    onDismiss={(reason) => notification.requestDismiss(item.id, reason, true)}
                    onPause={(reason) => notification.pause(item.id, reason)}
                    onResume={(reason) => notification.resume(item.id, reason)}
                >
                    <Notification
                        status={item.status}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                        action={item.action}
                        dismissible={item.dismissible}
                        closeButton={item.closeButton}
                        onDismiss={() =>
                            notification.requestDismiss(item.id, "close-button", true)}
                        onAction={() => void notification.runAction(item.id)}
                    />
                </FeedbackItem>
            </div>
        {/each}
    </div>
{/if}

<div class="sr-only" aria-live="polite" aria-atomic="true">
    {#if announcement?.priority === "polite"}
        {#key announcement.token}{announcement.text}{/key}
    {/if}
</div>
<div class="sr-only" aria-live="assertive" aria-atomic="true">
    {#if announcement?.priority === "assertive"}
        {#key announcement.token}{announcement.text}{/key}
    {/if}
</div>
