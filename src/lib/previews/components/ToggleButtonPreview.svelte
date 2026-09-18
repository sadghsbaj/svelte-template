<script module lang="ts">
    import { ToggleRight } from "@lucide/svelte";

    export const icon = ToggleRight;
</script>

<script lang="ts">
    import { Bell, Bold, Bookmark, Eye, Sparkles } from "@lucide/svelte";
    import { ToggleButton } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let softOff = $state(false);
    let softOn = $state(true);
    let ghostOff = $state(false);
    let ghostOn = $state(true);
    let small = $state(false);
    let medium = $state(true);
    let large = $state(false);
    let bookmarked = $state(true);
    let visible = $state(false);
    let bold = $state(false);
    let fullWidth = $state(true);
</script>

{#snippet bellIcon()}
    <Bell />
{/snippet}

{#snippet sparklesIcon()}
    <Sparkles />
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Toggle Button"
        description="Persistent button controls with soft and ghost surfaces."
        icon={ToggleRight}
    />

    <PreviewSection title="Variants">
        <PreviewGrid cols={2}>
            <PreviewCard label="Soft" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-3">
                    <ToggleButton bind:pressed={softOff}>Unpressed</ToggleButton>
                    <ToggleButton bind:pressed={softOn}>Pressed</ToggleButton>
                </div>
            </PreviewCard>

            <PreviewCard label="Ghost" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-3">
                    <ToggleButton bind:pressed={ghostOff} variant="ghost">Unpressed</ToggleButton>
                    <ToggleButton bind:pressed={ghostOn} variant="ghost">Pressed</ToggleButton>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Sizes">
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-32">
                <ToggleButton bind:pressed={small} size="sm">Small</ToggleButton>
            </PreviewCard>
            <PreviewCard label="Medium" bg="elevation-1" class="h-32">
                <ToggleButton bind:pressed={medium}>Medium</ToggleButton>
            </PreviewCard>
            <PreviewCard label="Large" bg="elevation-1" class="h-32">
                <ToggleButton bind:pressed={large} size="lg">Large</ToggleButton>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Icons & States">
        <PreviewGrid cols={3}>
            <PreviewCard label="Icon Placement" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-3">
                    <ToggleButton bind:pressed={bookmarked} iconLeft={bellIcon}>Alerts</ToggleButton
                    >
                    <ToggleButton bind:pressed={visible} variant="ghost" iconRight={sparklesIcon}>
                        Effects
                    </ToggleButton>
                </div>
            </PreviewCard>

            <PreviewCard label="Icon Only" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-2.5">
                    <ToggleButton bind:pressed={bold} iconOnly size="sm" aria-label="Bold">
                        <Bold />
                    </ToggleButton>
                    <ToggleButton bind:pressed={bookmarked} iconOnly aria-label="Bookmark">
                        <Bookmark />
                    </ToggleButton>
                    <ToggleButton bind:pressed={visible} iconOnly size="lg" aria-label="Visibility">
                        <Eye />
                    </ToggleButton>
                </div>
            </PreviewCard>

            <PreviewCard label="Disabled" bg="elevation-1" class="h-32">
                <ToggleButton pressed disabled>Unavailable</ToggleButton>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Full Width">
        <PreviewCard label="Block Toggle" bg="elevation-1" class="h-32">
            <div class="w-full max-w-sm">
                <ToggleButton bind:pressed={fullWidth} fullWidth iconLeft={sparklesIcon}>
                    Enhanced mode
                </ToggleButton>
            </div>
        </PreviewCard>
    </PreviewSection>
</PreviewPage>
