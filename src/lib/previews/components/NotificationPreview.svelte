<script module lang="ts">
    import { Bell } from "@lucide/svelte";

    export const icon = Bell;
</script>

<script lang="ts">
    import { onDestroy } from "svelte";
    import { BellRing, CloudUpload, Sparkles } from "@lucide/svelte";
    import { Badge, Button, Notification, notification, type NotificationStatus } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    const statuses: readonly NotificationStatus[] = [
        "base",
        "accent",
        "info",
        "success",
        "warning",
        "danger",
    ];
    let persistentNotificationId = $state<string | null>(null);

    function showNotification(status: NotificationStatus): void {
        notification.withStatus(
            status,
            `${status[0]?.toUpperCase()}${status.slice(1)} notification`,
            {
                description:
                    status === "danger"
                        ? ["The upload could not be completed.", "Your local changes are safe."]
                        : "This notification is rendered in the global feedback layer.",
            }
        );
    }

    function showPersistent(): void {
        persistentNotificationId = notification.show({
            title: "Draft ready for review",
            status: "accent",
            description: "This notification stays visible until it is dismissed.",
            duration: null,
            trailing: reviewAction,
        });
    }

    function handleReview(): void {
        if (!persistentNotificationId) return;
        notification.update(persistentNotificationId, {
            title: "Review opened",
            status: "success",
        });
    }

    onDestroy(() => notification.reset());
</script>

{#snippet customLeading()}
    <Sparkles />
{/snippet}

{#snippet customTrailing()}
    <Badge size="sm" color="base">Now</Badge>
{/snippet}

{#snippet bellIcon()}
    <BellRing />
{/snippet}

{#snippet uploadIcon()}
    <CloudUpload />
{/snippet}

{#snippet reviewAction()}
    <Button size="sm" variant="plain" color="base" onclick={handleReview}>Review</Button>
{/snippet}

{#snippet accentAction()}
    <Button size="sm" variant="solid" color="accent">Open details</Button>
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Notification"
        description="Centered global feedback with richer content, semantic status styling, flexible trailing content, queues, and pause-aware dismissal."
        icon={Bell}
    />

    <PreviewSection
        title="Surfaces"
        description="The standalone component supports compact messages, descriptions, lists, and custom leading or trailing content."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Compact" bg="elevation-0" class="min-h-32">
                <Notification
                    status="success"
                    title="Changes published"
                    class="max-w-480px"
                />
            </PreviewCard>

            <PreviewCard label="Structured" bg="elevation-0" class="min-h-44">
                <Notification
                    status="accent"
                    title="Workspace updated"
                    description={[
                        "Three collaborators were notified.",
                        "The previous version remains available.",
                    ]}
                    leading={customLeading}
                    trailing={customTrailing}
                    class="max-w-480px"
                />
            </PreviewCard>

            <PreviewCard label="Description + list + action" bg="elevation-0" class="min-h-48">
                <Notification
                    status="accent"
                    title="Workspace migration ready"
                    description="Review the migration summary before continuing."
                    items={[
                        "Three projects are ready to move.",
                        "Existing links will remain valid.",
                        "You can revert the migration for 30 days.",
                    ]}
                    trailing={accentAction}
                    class="max-w-520px"
                />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection
        title="Global Layer"
        description="Use the buttons to enqueue real notifications. Hover, focus, or hold a notification to pause its remaining lifetime."
    >
        <div class="flex flex-wrap gap-3">
            {#each statuses as status (status)}
                <Button
                    size="sm"
                    variant="soft"
                    iconLeft={bellIcon}
                    color={status === "danger" ? "danger" : status === "accent" ? "accent" : "base"}
                    onclick={() => showNotification(status)}
                >
                    {status}
                </Button>
            {/each}
        </div>
    </PreviewSection>

    <PreviewSection
        title="Persistent & Trailing"
        description="Persistent items can expose custom trailing content while swipe, middle click, and the state API handle dismissal."
    >
        <div class="flex flex-wrap gap-3">
            <Button variant="soft" color="accent" iconLeft={uploadIcon} onclick={showPersistent}>
                Show persistent notification
            </Button>
            <Button variant="ghost" color="base" onclick={() => notification.clear()}>
                Clear notifications
            </Button>
        </div>
    </PreviewSection>
</PreviewPage>
