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
        const id = notification.show({
            title: "Draft ready for review",
            status: "accent",
            description: "This notification stays visible until it is dismissed.",
            duration: null,
            action: {
                label: "Review",
                onSelect: () =>
                    notification.update(id, { title: "Review opened", status: "success" }),
            },
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

<PreviewPage>
    <PreviewHeader
        title="Notification"
        description="Centered global feedback with richer content, semantic status styling, actions, queues, and pause-aware dismissal."
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
                    dismissible={false}
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
                    dismissible={false}
                    class="max-w-480px"
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
        title="Persistent & Actionable"
        description="Auto-dismiss and manual dismissal are independent. Persistent items can still expose an action and a close button."
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
