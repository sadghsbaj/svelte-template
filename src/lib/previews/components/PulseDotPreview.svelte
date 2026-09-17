<script module lang="ts">
    import { Radio } from "@lucide/svelte";

    export const icon = Radio;
</script>

<script lang="ts">
    import { PulseDot, Switch } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let isPulsing = $state<boolean>(true);
    let hasGlow = $state<boolean>(true);
</script>

<PreviewPage>
    <PreviewHeader
        title="Pulse Dot"
        description="A GPU-accelerated status dot with a gentle breathing ping-wave, ambient LED glow, and semantic color palette."
        icon={Radio}
    />

    <!-- Controls -->
    <PreviewSection
        title="Interactive Controls"
        description="Toggle pulse animations and ambient glow halo."
    >
        <div class="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-elevation-1 shadow-sm w-fit mb-6">
            <label class="flex items-center gap-3 cursor-pointer select-none">
                <Switch bind:checked={isPulsing} size="sm" />
                <span class="text-sm text-main font-500">Pulsing Wave</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer select-none">
                <Switch bind:checked={hasGlow} size="sm" />
                <span class="text-sm text-main font-500">Ambient Glow</span>
            </label>
        </div>
    </PreviewSection>

    <!-- Semantic Colors Grid -->
    <PreviewSection
        title="Semantic Colors"
        description="Every color token uses design system scales with automatic dark-mode handling."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Success" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot
                        color="success"
                        pulsing={isPulsing}
                        glow={hasGlow}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Danger" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot
                        color="danger"
                        pulsing={isPulsing}
                        glow={hasGlow}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Warning" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot
                        color="warning"
                        pulsing={isPulsing}
                        glow={hasGlow}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Accent" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot
                        color="accent"
                        pulsing={isPulsing}
                        glow={hasGlow}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Info" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot color="info" pulsing={isPulsing} glow={hasGlow} />
                </div>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot color="base" pulsing={isPulsing} glow={hasGlow} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Sizes Comparison -->
    <PreviewSection
        title="Size Scale"
        description="Three precise sizes: small, medium, and large."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot size="sm" color="accent" pulsing={isPulsing} glow={hasGlow} />
                </div>
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot size="md" color="accent" pulsing={isPulsing} glow={hasGlow} />
                </div>
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot size="lg" color="accent" pulsing={isPulsing} glow={hasGlow} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
