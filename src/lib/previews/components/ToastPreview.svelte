<script module lang="ts">
    import { MessageSquareText } from "@lucide/svelte";

    export const icon = MessageSquareText;
</script>

<script lang="ts">
    import { onDestroy } from "svelte";
    import { MapPin, Save, Undo2 } from "@lucide/svelte";
    import { Button, Toast, toast, type ToastPosition, type ToastStatus } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    const positions: readonly ToastPosition[] = [
        "top-start",
        "top-center",
        "top-end",
        "bottom-start",
        "bottom-center",
        "bottom-end",
    ];
    const statuses: readonly ToastStatus[] = [
        "base",
        "accent",
        "info",
        "success",
        "warning",
        "danger",
    ];

    function showPosition(position: ToastPosition): void {
        toast.show({
            position,
            status: "accent",
            title: position,
            description: "Swipe or middle-click the free surface to dismiss.",
        });
    }

    function showSaved(): void {
        toast.success("Changes saved", {
            description: "The toast defaults to bottom-end.",
            trailing: undoAction,
        });
    }

    onDestroy(() => toast.reset());
</script>

{#snippet saveIcon()}
    <Save />
{/snippet}

{#snippet persistentIcon()}
    <Undo2 />
{/snippet}

{#snippet positionIcon()}
    <MapPin />
{/snippet}

{#snippet laterAction()}
    <Button size="sm" variant="soft" color="base">Later</Button>
{/snippet}

{#snippet undoAction()}
    <Button
        size="sm"
        variant="plain"
        color="base"
        onclick={() => toast.info("Changes restored")}
    >
        Undo
    </Button>
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Toast"
        description="Compact global feedback with six edge placements, bottom-end by default, responsive stacking, and gesture dismissal."
        icon={MessageSquareText}
    />

    <PreviewSection title="Surfaces" description="Status affects the icon and title while body text remains deliberately quiet.">
        <PreviewGrid cols={2}>
            <PreviewCard label="Single line" bg="elevation-0" class="min-h-28">
                <Toast status="success" title="Project synchronized" />
            </PreviewCard>
            <PreviewCard label="With trailing" bg="elevation-0" class="min-h-36">
                <Toast
                    status="info"
                    title="Update available"
                    description="Restart when it is convenient."
                    trailing={laterAction}
                />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection
        title="Default Behavior"
        description="The default toast appears at bottom-end for four seconds. Interaction pauses the countdown."
    >
        <div class="flex flex-wrap gap-3">
            <Button variant="soft" color="accent" iconLeft={saveIcon} onclick={showSaved}>
                Show default toast
            </Button>
            <Button
                variant="soft"
                color="base"
                iconLeft={persistentIcon}
                onclick={() =>
                    toast.warning("Persistent reminder", {
                        duration: null,
                        description: "This toast only leaves through manual dismissal.",
                    })}
            >
                Show persistent toast
            </Button>
            <Button variant="ghost" color="base" onclick={() => toast.clear()}>Clear toasts</Button>
        </div>
    </PreviewSection>

    <PreviewSection
        title="Positions"
        description="On narrow screens the three top and three bottom positions merge into responsive edge stacks."
    >
        <PreviewGrid cols={3}>
            {#each positions as position (position)}
                <Button
                    fullWidth
                    size="sm"
                    variant="soft"
                    color="base"
                    iconLeft={positionIcon}
                    onclick={() => showPosition(position)}
                >
                    {position}
                </Button>
            {/each}
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Status Queue" description="Fire multiple items to inspect enter, exit, and FLIP reordering.">
        <div class="flex flex-wrap gap-3">
            {#each statuses as status (status)}
                <Button
                    size="sm"
                    variant="ghost"
                    color={status === "danger" ? "danger" : status === "accent" ? "accent" : "base"}
                    onclick={() =>
                        toast.show({ status, title: `${status} toast`, description: "Queued feedback item" })}
                >
                    {status}
                </Button>
            {/each}
        </div>
    </PreviewSection>
</PreviewPage>
