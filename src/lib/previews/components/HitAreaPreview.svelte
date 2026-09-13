<script module lang="ts">
    import { Target } from "@lucide/svelte";

    export const icon = Target;
</script>

<script lang="ts">
    import { Bell, Eye, EyeOff, Heart, MoreHorizontal, Plus, Trash2, X } from "@lucide/svelte";
    import { HitArea } from "$components";
    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let showBounds = $state(true);
</script>

<PreviewPage>
    <PreviewHeader
        title="Hit Area"
        description="Zero-layout-shift touch target expander for micro-elements like icons, close buttons, and toggles."
        icon={Target}
    >
        <button
            class="px-3 py-1.5 rounded-xl bg-elevation-2 hover:bg-elevation-3 text-xs font-500 text-strong flex items-center gap-2 t-colors active:scale-98"
            onclick={() => (showBounds = !showBounds)}
        >
            {#if showBounds}
                <EyeOff size={14} />
                <span>Hide Bounds</span>
            {:else}
                <Eye size={14} />
                <span>Show Bounds</span>
            {/if}
        </button>
    </PreviewHeader>

    <!-- Size Presets -->
    <PreviewSection
        title="Size Presets"
        description="Standard WCAG & Apple HIG touch targets on micro-buttons."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Compact" bg="elevation-1" class="h-36">
                <button
                    class="w-6 h-6 rounded-lg bg-elevation-2 hover:bg-elevation-3 text-weak hover:text-strong flex-center t-colors shadow-2xs cursor-pointer"
                >
                    <HitArea
                        size="sm"
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-xl"
                            : ""}
                    />
                    <X size={14} />
                </button>
            </PreviewCard>

            <PreviewCard label="Standard" bg="elevation-1" class="h-36">
                <button
                    class="w-6 h-6 rounded-lg bg-elevation-2 hover:bg-elevation-3 text-weak hover:text-strong flex-center t-colors shadow-2xs cursor-pointer"
                >
                    <HitArea
                        size="md"
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-xl"
                            : ""}
                    />
                    <Plus size={14} />
                </button>
            </PreviewCard>

            <PreviewCard label="Material" bg="elevation-1" class="h-36">
                <button
                    class="w-6 h-6 rounded-lg bg-elevation-2 hover:bg-elevation-3 text-weak hover:text-strong flex-center t-colors shadow-2xs cursor-pointer"
                >
                    <HitArea
                        size="lg"
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-xl"
                            : ""}
                    />
                    <MoreHorizontal size={14} />
                </button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Component Composition -->
    <PreviewSection
        title="Micro-Button Row"
        description="Multiple adjacent actions without layout collisions or negative margins."
    >
        <PreviewCard label="Action Toolbar" bg="elevation-1" class="h-40">
            <div class="flex items-center gap-6 p-4 rounded-2xl bg-elevation-2/60">
                <button
                    class="w-7 h-7 rounded-lg bg-elevation-1 hover:bg-elevation-3 text-weak hover:text-strong flex-center t-colors shadow-xs cursor-pointer"
                >
                    <HitArea
                        size="md"
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-xl"
                            : ""}
                    />
                    <Heart size={15} />
                </button>

                <button
                    class="w-7 h-7 rounded-lg bg-elevation-1 hover:bg-elevation-3 text-weak hover:text-strong flex-center t-colors shadow-xs cursor-pointer"
                >
                    <HitArea
                        size="md"
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-xl"
                            : ""}
                    />
                    <Bell size={15} />
                </button>

                <button
                    class="w-7 h-7 rounded-lg bg-elevation-1 hover:bg-elevation-3 text-weak hover:text-strong flex-center t-colors shadow-xs cursor-pointer"
                >
                    <HitArea
                        size="md"
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-xl"
                            : ""}
                    />
                    <Trash2 size={15} />
                </button>
            </div>
        </PreviewCard>
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
                <button
                    class="w-8 h-8 rounded-xl bg-elevation-2 hover:bg-elevation-3 text-strong flex-center t-colors shadow-xs cursor-pointer"
                >
                    <HitArea
                        size={56}
                        class={showBounds
                            ? "!border !border-dashed !border-accent-500/60 !bg-accent-500/10 rounded-2xl"
                            : ""}
                    />
                    <Target size={16} />
                </button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
