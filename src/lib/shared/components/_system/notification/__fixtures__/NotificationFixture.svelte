<script lang="ts">
    import Badge from "$components/_system/badge/Badge.svelte";
    import Button from "$components/_system/button/Button.svelte";

    import Notification from "$components/_system/notification/Notification.svelte";

    let {
        trailing = "none",
        body = true,
    }: {
        trailing?: "none" | "badge" | "button";
        body?: boolean;
    } = $props();
</script>

{#snippet badgeTrailing()}
    <Badge size="sm" color="base">Now</Badge>
{/snippet}

{#snippet buttonTrailing()}
    <Button size="sm" variant="soft" color="base">Review</Button>
{/snippet}

<Notification
    status="accent"
    title="Workspace updated"
    description={body ? "Three collaborators were notified." : undefined}
    trailing={trailing === "badge"
        ? badgeTrailing
        : trailing === "button"
          ? buttonTrailing
          : undefined}
/>
