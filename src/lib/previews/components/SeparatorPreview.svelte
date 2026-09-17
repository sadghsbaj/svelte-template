<script module lang="ts">
    import { SeparatorHorizontal } from "@lucide/svelte";

    export const icon = SeparatorHorizontal;
</script>

<script lang="ts">
    import { Separator } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

<PreviewPage>
    <PreviewHeader
        title="Separator"
        description="A visual divider supporting horizontal and vertical orientations, thickness scaling, and partial lengths."
        icon={SeparatorHorizontal}
    />

    <!-- Orientation Section -->
    <PreviewSection
        title="Orientations"
        description="Horizontal full-width section breaks and vertical inline dividers."
    >
        <PreviewGrid cols={2}>
            <!-- Horizontal -->
            <PreviewCard label="Horizontal" bg="elevation-1" class="h-44">
                <div class="flex-center flex-col gap-4 w-full max-w-xs px-4">
                    <span class="label-sm text-weak">Upper item</span>
                    <Separator />
                    <span class="label-sm text-weak">Lower item</span>
                </div>
            </PreviewCard>

            <!-- Vertical -->
            <PreviewCard label="Vertical" bg="elevation-1" class="h-44">
                <div class="flex items-center gap-4 h-8">
                    <span class="label-sm text-weak">Left item</span>
                    <Separator orientation="vertical" />
                    <span class="label-sm text-weak">Right item</span>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Thickness Section -->
    <PreviewSection
        title="Thickness Presets"
        description="Standard calibrated stroke weights from subtle 1px hairline to bold 4px block."
    >
        <div class="p-6 rounded-3xl squircle-smooth bg-elevation-1 shadow-sm flex flex-col gap-6 max-w-xl">
            <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                    <span class="label-sm">Small</span>
                    <span class="description-xs font-mono">1px</span>
                </div>
                <Separator thickness="sm" />
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                    <span class="label-sm">Medium</span>
                    <span class="description-xs font-mono">2px</span>
                </div>
                <Separator thickness="md" />
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                    <span class="label-sm">Large</span>
                    <span class="description-xs font-mono">4px</span>
                </div>
                <Separator thickness="lg" />
            </div>
        </div>
    </PreviewSection>

    <!-- Length Spans Section -->
    <PreviewSection
        title="Partial Lengths"
        description="Centered partial spans for refined card sections and decorative dividers."
    >
        <div class="p-6 rounded-3xl squircle-smooth bg-elevation-1 shadow-sm flex flex-col gap-6 max-w-xl">
            <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                    <span class="label-sm">100%</span>
                    <span class="description-xs font-mono">w-full</span>
                </div>
                <Separator length={100} thickness="md" />
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                    <span class="label-sm">75%</span>
                    <span class="description-xs font-mono">mx-auto</span>
                </div>
                <Separator length={75} thickness="md" />
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                    <span class="label-sm">50%</span>
                    <span class="description-xs font-mono">mx-auto</span>
                </div>
                <Separator length={50} thickness="md" />
            </div>

            <div class="flex flex-col gap-2">
                <div class="flex justify-between items-center">
                    <span class="label-sm">25%</span>
                    <span class="description-xs font-mono">mx-auto</span>
                </div>
                <Separator length={25} thickness="md" />
            </div>
        </div>
    </PreviewSection>

    <!-- Colors Section -->
    <PreviewSection
        title="Colors"
        description="Subtle base soft neutral tone or brand-tinted accent color."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div class="w-full max-w-xs px-4">
                    <Separator color="base" thickness="md" />
                </div>
            </PreviewCard>

            <PreviewCard label="Accent" bg="elevation-1" class="h-32">
                <div class="w-full max-w-xs px-4">
                    <Separator color="accent" thickness="md" />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
