<script module lang="ts">
    import { Gauge } from "@lucide/svelte";

    export const icon = Gauge;
</script>

<script lang="ts">
    import { untrack } from "svelte";
    import { Badge, Meter, Separator, Slider, ToggleButton, ToggleButtonGroup } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewControlCard from "$lib/previews/ui/PreviewControlCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let meterValue = $state<number>(65);

    const presets = [0, 25, 50, 75, 100];

    let selectedPreset = $state<string | undefined>();

    $effect(() => {
        const match = presets.includes(meterValue) ? String(meterValue) : undefined;
        untrack(() => {
            if (selectedPreset !== match) {
                selectedPreset = match;
            }
        });
    });

    $effect(() => {
        if (selectedPreset === undefined) {
            const match = presets.includes(meterValue) ? String(meterValue) : undefined;
            if (match !== undefined) {
                selectedPreset = match;
            }
            return;
        }

        const num = Number(selectedPreset);
        untrack(() => {
            if (meterValue !== num) {
                meterValue = num;
            }
        });
    });
</script>

<PreviewPage>
    <PreviewHeader
        title="Meter"
        description="A minimalist, headless-ready visual meter bar with semantic states, fluid width, and smooth GPU-accelerated transitions."
        icon={Gauge}
    />

    <!-- Interactive Controls -->
    <PreviewControlCard
        description="Adjust the meter value or select presets to preview smooth width transitions across all components."
    >
        <div class="flex items-center gap-3">
            <span class="label-md">Value</span>
            <div class="w-40">
                <Slider
                    bind:value={meterValue}
                    min={0}
                    max={100}
                    ariaLabel="Meter value slider"
                />
            </div>
            <Badge variant="soft" color="base" class="tabular-nums min-w-60px">
                {meterValue}%
            </Badge>
        </div>

        <Separator orientation="vertical" class="h-5! my-auto self-center! hidden sm:block" />

        <ToggleButtonGroup
            type="single"
            bind:value={selectedPreset}
            separators
            aria-label="Preset percentages"
        >
            {#each presets as preset (preset)}
                <ToggleButton
                    value={String(preset)}
                    size="sm"
                    onclick={() => {
                        meterValue = preset;
                    }}
                >
                    {preset}%
                </ToggleButton>
            {/each}
        </ToggleButtonGroup>
    </PreviewControlCard>

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
