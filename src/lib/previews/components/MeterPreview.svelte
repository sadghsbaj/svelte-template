<script module lang="ts">
    import { Gauge } from "@lucide/svelte";

    export const icon = Gauge;
</script>

<script lang="ts">
    import { Button, Meter, Slider } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let meterValue = $state<number>(65);

    const presets = [0, 25, 50, 75, 100];
</script>

<PreviewPage>
    <PreviewHeader
        title="Meter"
        description="A minimalist, headless-ready visual meter bar with semantic states, fluid width, and smooth GPU-accelerated transitions."
        icon={Gauge}
    />

    <!-- Interactive Controls -->
    <PreviewSection
        title="Interactive Controls"
        description="Adjust the meter value or select presets to preview smooth width transitions across all components."
    >
        <div class="flex flex-wrap items-center gap-5 p-4 rounded-2xl bg-elevation-1 shadow-sm w-fit mb-6">
            <div class="flex items-center gap-3">
                <span class="text-sm font-500 text-main select-none">Value</span>
                <div class="w-40">
                    <Slider bind:value={meterValue} min={0} max={100} ariaLabel="Meter value slider" />
                </div>
                <span class="tabular-nums font-600 text-xs px-2.5 py-1 rounded-full bg-base-soft-1 text-main select-none">
                    {meterValue}%
                </span>
            </div>

            <div class="h-5 w-1px bg-base-soft-2 hidden sm:block"></div>

            <div class="flex items-center gap-1.5">
                {#each presets as preset (preset)}
                    <Button
                        size="sm"
                        variant={meterValue === preset ? "solid" : "soft"}
                        color={meterValue === preset ? "accent" : "base"}
                        onclick={() => (meterValue = preset)}
                        class="h-7! px-2.5! text-xs font-500 rounded-lg!"
                    >
                        {preset}%
                    </Button>
                {/each}
            </div>
        </div>
    </PreviewSection>

    <!-- Semantic Colors -->
    <PreviewSection
        title="Semantic Colors"
        description="Six semantic palettes matching design system tokens with automatic dark-mode handling."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Accent" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <Meter color="accent" value={meterValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Success" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <Meter color="success" value={meterValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Warning" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <Meter color="warning" value={meterValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Danger" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <Meter color="danger" value={meterValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Info" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <Meter color="info" value={meterValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <Meter color="base" value={meterValue} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Size Scale -->
    <PreviewSection
        title="Size Scale"
        description="Three standard track heights designed for subtle indicators, standard meters, and prominent gauges."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <Meter size="sm" color="accent" value={meterValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <Meter size="md" color="accent" value={meterValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <Meter size="lg" color="accent" value={meterValue} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
