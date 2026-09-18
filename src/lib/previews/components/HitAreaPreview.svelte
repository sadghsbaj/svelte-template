<script module lang="ts">
    import { Target } from "@lucide/svelte";

    export const icon = Target;
</script>

<script lang="ts">
    import { Eye, EyeOff, MoreHorizontal, Plus, X } from "@lucide/svelte";
    import { Button, HitArea, ToggleButton } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewControlCard from "$lib/previews/ui/PreviewControlCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let showBounds = $state(true);
</script>

{#snippet boundsIcon()}
    {#if showBounds}
        <EyeOff />
    {:else}
        <Eye />
    {/if}
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Hit Area"
        description="Zero-layout-shift touch target expander for micro-elements like icons, close buttons, and toggles."
        icon={Target}
    />

    <!-- Interactive Controls -->
    <PreviewControlCard
        description="Toggle touch target boundaries visualization across all examples."
    >
        <ToggleButton bind:pressed={showBounds} size="md" iconLeft={boundsIcon}>
            Touch Bounds
        </ToggleButton>
    </PreviewControlCard>

    <!-- Size Presets -->
    <PreviewSection
        title="Size Presets"
        description="Standard WCAG & Apple HIG touch targets on micro-buttons."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Compact" bg="elevation-1" class="h-36">
                <Button variant="soft" color="base" size="sm" iconOnly aria-label="Close">
                    <HitArea
                        size="sm"
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-xl"
                            : ""}
                    />
                    <X size={14} />
                </Button>
            </PreviewCard>

            <PreviewCard label="Standard" bg="elevation-1" class="h-36">
                <Button variant="soft" color="base" size="sm" iconOnly aria-label="Add">
                    <HitArea
                        size="md"
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-xl"
                            : ""}
                    />
                    <Plus size={14} />
                </Button>
            </PreviewCard>

            <PreviewCard label="Material" bg="elevation-1" class="h-36">
                <Button variant="soft" color="base" size="sm" iconOnly aria-label="More options">
                    <HitArea
                        size="lg"
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-xl"
                            : ""}
                    />
                    <MoreHorizontal size={14} />
                </Button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Wide Element Behavior -->
    <PreviewSection
        title="Wide Elements & Custom Dimensions"
        description="min-width: 100% ensures wide pills and custom numeric sizes expand vertically without truncating width."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Pill Badge" bg="elevation-1" class="h-40">
                <button
                    class="px-3 h-6 rounded-full bg-accent-500/15 hover:bg-accent-500/25 text-accent-500 text-xs font-600 flex items-center gap-1.5 t-colors cursor-pointer"
                >
                    <HitArea
                        size="md"
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-full"
                            : ""}
                    />
                    <span>Active Tag</span>
                    <X size={12} />
                </button>
            </PreviewCard>

            <PreviewCard label="Custom" bg="elevation-1" class="h-40">
                <Button variant="soft" color="base" size="sm" iconOnly aria-label="Custom target">
                    <HitArea
                        size={56}
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-2xl"
                            : ""}
                    />
                    <Target size={16} />
                </Button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
