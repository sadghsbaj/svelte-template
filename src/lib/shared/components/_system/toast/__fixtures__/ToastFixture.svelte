<script lang="ts">
    import Badge from "$components/_system/badge/Badge.svelte";
    import Button from "$components/_system/button/Button.svelte";
    import Toast from "$components/_system/toast/Toast.svelte";

    let {
        trailing = "none",
        description = true,
    }: {
        trailing?: "none" | "badge" | "button";
        description?: boolean;
    } = $props();
</script>

{#snippet badgeTrailing()}
    <Badge size="sm" color="base">Now</Badge>
{/snippet}

{#snippet buttonTrailing()}
    <Button size="sm" variant="soft" color="base">Later</Button>
{/snippet}

<Toast
    status="info"
    title="Update available"
    description={description
        ? "Restart when it is convenient because this intentionally long line must truncate."
        : undefined}
    trailing={trailing === "badge"
        ? badgeTrailing
        : trailing === "button"
          ? buttonTrailing
          : undefined}
/>
