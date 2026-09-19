<script module lang="ts">
    import { MessageSquareText } from "@lucide/svelte";

    export const icon = MessageSquareText;
</script>

<script lang="ts">
    import { BadgeInfo, Bell, CircleAlert, Cloud, Search, Settings, Wifi, X } from "@lucide/svelte";
    import { Button, Kbd, PulseDot, tooltip, type FloatingPlacement } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    const placements: FloatingPlacement[] = ["top", "right", "bottom", "left"];
</script>

{#snippet infoIcon()}
    <BadgeInfo class="text-accent-500" />
{/snippet}

{#snippet warningIcon()}
    <CircleAlert class="text-danger-500" />
{/snippet}

{#snippet liveDot()}
    <PulseDot color="success" size="sm" />
{/snippet}

{#snippet commandShortcut()}
    <Kbd combo="Mod+K" size="sm" variant="soft" title="" class="text-inherit! bg-current/8!" />
{/snippet}

{#snippet escapeShortcut()}
    <Kbd key="Escape" size="sm" variant="soft" title="" class="text-inherit! bg-current/8!" />
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Tooltip"
        description="A centralized attachment-first tooltip with accessible hover and focus behavior, collision-aware placement, and compact WAAPI motion."
        icon={MessageSquareText}
    />

    <PreviewSection
        title="Content & Timing"
        description="The default pointer delay prevents accidental flashes. Keyboard focus is always immediate."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Default delay" bg="elevation-1" class="h-40">
                <Button
                    color="base"
                    variant="soft"
                    {@attach tooltip("Opens after 450 milliseconds")}
                >
                    Hover or focus
                </Button>
            </PreviewCard>

            <PreviewCard label="No delay" bg="elevation-1" class="h-40">
                <Button
                    color="accent"
                    variant="soft"
                    {@attach tooltip({ content: "Appears immediately", openDelay: 0 })}
                >
                    Instant tooltip
                </Button>
            </PreviewCard>

            <PreviewCard label="Title + description" bg="elevation-1" class="h-40">
                <Button
                    color="base"
                    variant="soft"
                    {@attach tooltip({
                        title: "Notification settings",
                        description: "Choose which events may interrupt you.",
                        leading: infoIcon,
                    })}
                >
                    Structured content
                </Button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection
        title="Leading Content"
        description="The leading snippet accepts a regular icon, a status glyph, or another compact component such as PulseDot."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Lucide icon" bg="elevation-1" class="h-36">
                <Button
                    iconOnly
                    color="base"
                    variant="soft"
                    aria-label="Cloud status"
                    {@attach tooltip({
                        content: "Stored in the cloud",
                        leading: infoIcon,
                        openDelay: 0,
                    })}
                >
                    <Cloud />
                </Button>
            </PreviewCard>

            <PreviewCard label="Pulse dot" bg="elevation-1" class="h-36">
                <Button
                    iconOnly
                    color="base"
                    variant="soft"
                    aria-label="Connection status"
                    {@attach tooltip({
                        title: "Connected",
                        description: "All changes are synchronized.",
                        leading: liveDot,
                        openDelay: 0,
                    })}
                >
                    <Wifi />
                </Button>
            </PreviewCard>

            <PreviewCard label="Status icon" bg="elevation-1" class="h-36">
                <Button
                    iconOnly
                    color="danger"
                    variant="soft"
                    aria-label="Attention required"
                    {@attach tooltip({
                        content: "Action required",
                        leading: warningIcon,
                        openDelay: 0,
                    })}
                >
                    <Bell />
                </Button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection
        title="Placement & Offset"
        description="Floating resolves collisions automatically; every requested side and the anchor gap remain configurable."
    >
        <PreviewGrid cols={4}>
            {#each placements as placement (placement)}
                <PreviewCard label={placement} bg="elevation-1" class="h-36">
                    <Button
                        iconOnly
                        color="base"
                        variant="soft"
                        aria-label={`${placement} placement`}
                        {@attach tooltip({
                            content: `${placement}, 12 pixel offset`,
                            placement,
                            offset: 12,
                            openDelay: 0,
                        })}
                    >
                        <Settings />
                    </Button>
                </PreviewCard>
            {/each}
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection
        title="Keyboard Shortcuts"
        description="A flexible trailing slot keeps compact Kbd hints aligned with the title while descriptions remain in their own row."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Trailing shortcut" bg="elevation-1" class="h-36">
                <Button
                    iconOnly
                    color="base"
                    variant="soft"
                    aria-label="Open command palette"
                    {@attach tooltip({
                        content: "Open command palette",
                        trailing: commandShortcut,
                        openDelay: 0,
                    })}
                >
                    <Search />
                </Button>
            </PreviewCard>

            <PreviewCard label="Leading + trailing" bg="elevation-1" class="h-36">
                <Button
                    iconOnly
                    color="base"
                    variant="soft"
                    aria-label="Close current panel"
                    {@attach tooltip({
                        title: "Close panel",
                        description: "Returns to the previous workspace.",
                        leading: infoIcon,
                        trailing: escapeShortcut,
                        openDelay: 0,
                    })}
                >
                    <X />
                </Button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
