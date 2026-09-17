<script module lang="ts">
    import { Radio } from "@lucide/svelte";

    export const icon = Radio;
</script>

<script lang="ts">
    import { Button, PulseDot, Switch } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let isPulsing = $state<boolean>(true);
    let hasGlow = $state<boolean>(true);
    let selectedSize = $state<"sm" | "md" | "lg">("md");

    const SIZES = ["sm", "md", "lg"] as const;
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
        <div class="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-elevation-1 w-fit mb-6">
            <label class="flex items-center gap-3 cursor-pointer select-none">
                <Switch bind:checked={isPulsing} size="sm" />
                <span class="text-sm text-main font-500">Pulsing Wave</span>
            </label>

            <label class="flex items-center gap-3 cursor-pointer select-none">
                <Switch bind:checked={hasGlow} size="sm" />
                <span class="text-sm text-main font-500">Ambient Glow</span>
            </label>

            <div class="flex items-center gap-2 pl-2">
                <span class="text-xs text-weak font-500 mr-1">Size:</span>
                {#each SIZES as s (s)}
                    <Button
                        variant={selectedSize === s ? "solid" : "soft"}
                        color={selectedSize === s ? "accent" : "base"}
                        size="sm"
                        onclick={() => (selectedSize = s)}
                        class="text-xs font-500"
                    >
                        {s.toUpperCase()}
                    </Button>
                {/each}
            </div>
        </div>
    </PreviewSection>

    <!-- Semantic Colors Grid -->
    <PreviewSection
        title="Semantic Colors"
        description="Every color token uses design system scales with automatic dark-mode handling."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Success (Online / Ready)" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot
                        color="success"
                        size={selectedSize}
                        pulsing={isPulsing}
                        glow={hasGlow}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Danger (Recording / Error)" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot
                        color="danger"
                        size={selectedSize}
                        pulsing={isPulsing}
                        glow={hasGlow}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Warning (Idle / Degraded)" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot
                        color="warning"
                        size={selectedSize}
                        pulsing={isPulsing}
                        glow={hasGlow}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Accent (Active / Live)" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot
                        color="accent"
                        size={selectedSize}
                        pulsing={isPulsing}
                        glow={hasGlow}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Info (Syncing / Updating)" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot
                        color="info"
                        size={selectedSize}
                        pulsing={isPulsing}
                        glow={hasGlow}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Base (Muted / Paused)" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot
                        color="base"
                        size={selectedSize}
                        pulsing={isPulsing}
                        glow={hasGlow}
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Sizes Comparison -->
    <PreviewSection
        title="Size Scale"
        description="Three precise pixel sizes: 6px, 8px, and 10px."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Small (6px)" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot size="sm" color="accent" pulsing={isPulsing} glow={hasGlow} />
                </div>
            </PreviewCard>

            <PreviewCard label="Medium (8px)" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot size="md" color="accent" pulsing={isPulsing} glow={hasGlow} />
                </div>
            </PreviewCard>

            <PreviewCard label="Large (10px)" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <PulseDot size="lg" color="accent" pulsing={isPulsing} glow={hasGlow} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
