<script module lang="ts">
    import { Sliders } from "@lucide/svelte";

    export const icon = Sliders;
</script>

<script lang="ts">
    import { Slider } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let singleValue = $state<number>(50);
    let rangeValue = $state<[number, number]>([25, 75]);
    let centerValue = $state<number>(65);

    let accentValue = $state<number>(60);
    let baseValue = $state<number>(45);
    let invalidValue = $state<number>(75);

    let sizeSmValue = $state<number>(40);
    let sizeMdValue = $state<number>(55);
    let sizeLgValue = $state<number>(70);

    let noHitAreaValue = $state<number>(60);

    let vertSingleValue = $state<number>(60);
    let vertRangeValue = $state<[number, number]>([30, 80]);
    let vertCenterValue = $state<number>(70);
</script>

<PreviewPage>
    <PreviewHeader
        title="Slider"
        description="A minimalist, accessible slider component supporting single values, dual-thumb ranges, center origins, and seamless canvas focus."
        icon={Sliders}
    />

    <!-- Variants -->
    <PreviewSection
        title="Slider Variants"
        description="Single thumb, dual-thumb range, and bidirectional center origin configurations."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Single" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider bind:value={singleValue} ariaLabel="Single slider" />
                </div>
            </PreviewCard>

            <PreviewCard label="Range" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider bind:value={rangeValue} ariaLabel="Range slider" />
                </div>
            </PreviewCard>

            <PreviewCard label="Center Origin" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider origin="center" bind:value={centerValue} ariaLabel="Center origin slider" />
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
                    <Slider color="accent" bind:value={accentValue} ariaLabel="Accent slider" />
                </div>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider color="base" bind:value={baseValue} ariaLabel="Base slider" />
                </div>
            </PreviewCard>

            <PreviewCard label="Invalid" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider color="invalid" bind:value={invalidValue} ariaLabel="Invalid slider" />
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
                    <Slider size="sm" color="accent" bind:value={sizeSmValue} ariaLabel="Small slider" />
                </div>
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider size="md" color="accent" bind:value={sizeMdValue} ariaLabel="Medium slider" />
                </div>
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider size="lg" color="accent" bind:value={sizeLgValue} ariaLabel="Large slider" />
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
                    <Slider value={35} disabled ariaLabel="Disabled slider" />
                </div>
            </PreviewCard>

            <PreviewCard label="HitArea Off" bg="elevation-1" class="h-32">
                <div class="w-full px-6">
                    <Slider bind:value={noHitAreaValue} hitArea={false} ariaLabel="Slider with hit area disabled" />
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
                        orientation="vertical"
                        bind:value={vertSingleValue}
                        ariaLabel="Vertical single slider"
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Vertical Range" bg="elevation-1" class="h-52">
                <div class="flex-center h-36">
                    <Slider
                        orientation="vertical"
                        bind:value={vertRangeValue}
                        ariaLabel="Vertical range slider"
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Vertical Center" bg="elevation-1" class="h-52">
                <div class="flex-center h-36">
                    <Slider
                        orientation="vertical"
                        origin="center"
                        bind:value={vertCenterValue}
                        ariaLabel="Vertical center slider"
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
