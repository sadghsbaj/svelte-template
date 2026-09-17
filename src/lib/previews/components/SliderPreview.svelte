<script module lang="ts">
    import { Sliders } from "@lucide/svelte";

    export const icon = Sliders;
</script>

<script lang="ts">
    import { Button, Slider, type SliderThumbShape } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    const shapes: { value: SliderThumbShape; label: string }[] = [
        { value: "circle", label: "Circle" },
        { value: "bar", label: "Bar" },
        { value: "pill", label: "Pill" },
    ];
    let selectedShape = $state<SliderThumbShape>("circle");

    let singleValue = $state<number>(50);
    let rangeValue = $state<[number, number]>([25, 75]);
    let centerValue = $state<number>(65);

    let accentValue = $state<number>(60);
    let baseValue = $state<number>(45);
    let invalidValue = $state<number>(75);

    let sizeSmValue = $state<number>(40);
    let sizeMdValue = $state<number>(55);
    let sizeLgValue = $state<number>(70);

    let vertSingleValue = $state<number>(60);
    let vertRangeValue = $state<[number, number]>([30, 80]);
    let vertCenterValue = $state<number>(70);

    let noHitAreaValue = $state<number>(60);
</script>

<PreviewPage>
    <PreviewHeader
        title="Slider"
        description="A minimalist, accessible slider component supporting single values, dual-thumb ranges, center origins, and seamless canvas focus."
        icon={Sliders}
    />

    <!-- Interactive Controls -->
    <PreviewSection
        title="Interactive Controls"
        description="Switch the thumb shape to dynamically see circular, mixer bar, and tactile pill profiles across all configurations."
    >
        <div class="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-elevation-1 shadow-sm w-fit mb-6">
            <span class="text-sm font-500 text-main select-none">Thumb Shape</span>
            <div class="flex items-center gap-1.5">
                {#each shapes as s (s.value)}
                    <Button
                        size="sm"
                        variant={selectedShape === s.value ? "solid" : "soft"}
                        color={selectedShape === s.value ? "accent" : "base"}
                        onclick={() => (selectedShape = s.value)}
                        class="h-7! px-3! text-xs font-500 rounded-lg!"
                    >
                        {s.label}
                    </Button>
                {/each}
            </div>
        </div>
    </PreviewSection>

    <!-- Variants -->
    <PreviewSection
        title="Slider Variants"
        description="Single thumb, dual-thumb range, and bidirectional center origin configurations."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Single" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider thumbShape={selectedShape} bind:value={singleValue} ariaLabel="Single slider" />
                </div>
            </PreviewCard>

            <PreviewCard label="Range" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider thumbShape={selectedShape} bind:value={rangeValue} ariaLabel="Range slider" />
                </div>
            </PreviewCard>

            <PreviewCard label="Center Origin" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider
                        thumbShape={selectedShape}
                        origin="center"
                        bind:value={centerValue}
                        ariaLabel="Center origin slider"
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Semantic Colors -->
    <PreviewSection
        title="Semantic Colors"
        description="Three semantic palettes matching design system tokens with automatic dark-mode handling."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Accent" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider
                        thumbShape={selectedShape}
                        color="accent"
                        bind:value={accentValue}
                        ariaLabel="Accent slider"
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider
                        thumbShape={selectedShape}
                        color="base"
                        bind:value={baseValue}
                        ariaLabel="Base slider"
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Invalid" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider
                        thumbShape={selectedShape}
                        color="invalid"
                        bind:value={invalidValue}
                        ariaLabel="Invalid slider"
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Size Scale -->
    <PreviewSection
        title="Size Scale"
        description="Three refined heights: small (4px track), medium (6px track), and large (8px track)."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider
                        thumbShape={selectedShape}
                        size="sm"
                        color="accent"
                        bind:value={sizeSmValue}
                        ariaLabel="Small slider"
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider
                        thumbShape={selectedShape}
                        size="md"
                        color="accent"
                        bind:value={sizeMdValue}
                        ariaLabel="Medium slider"
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider
                        thumbShape={selectedShape}
                        size="lg"
                        color="accent"
                        bind:value={sizeLgValue}
                        ariaLabel="Large slider"
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Vertical Orientation -->
    <PreviewSection
        title="Vertical Orientation"
        description="Full support for vertical slider layouts with single, dual-thumb range, and center origin."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Vertical Single" bg="elevation-1" class="h-52">
                <div class="flex-center h-36">
                    <Slider
                        thumbShape={selectedShape}
                        orientation="vertical"
                        bind:value={vertSingleValue}
                        ariaLabel="Vertical single slider"
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Vertical Range" bg="elevation-1" class="h-52">
                <div class="flex-center h-36">
                    <Slider
                        thumbShape={selectedShape}
                        orientation="vertical"
                        bind:value={vertRangeValue}
                        ariaLabel="Vertical range slider"
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Vertical Center" bg="elevation-1" class="h-52">
                <div class="flex-center h-36">
                    <Slider
                        thumbShape={selectedShape}
                        orientation="vertical"
                        origin="center"
                        bind:value={vertCenterValue}
                        ariaLabel="Vertical center slider"
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- States & Configurations -->
    <PreviewSection
        title="States & Configurations"
        description="Permanently disabled interaction and precision touch target options."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Disabled" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider thumbShape={selectedShape} value={35} disabled ariaLabel="Disabled slider" />
                </div>
            </PreviewCard>

            <PreviewCard label="HitArea Off" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider
                        thumbShape={selectedShape}
                        bind:value={noHitAreaValue}
                        hitArea={false}
                        ariaLabel="Slider with hit area disabled"
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
