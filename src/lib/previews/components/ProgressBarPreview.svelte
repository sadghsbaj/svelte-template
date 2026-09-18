<script module lang="ts">
    import { Loader } from "@lucide/svelte";

    export const icon = Loader;
</script>

<script lang="ts">
    import { untrack } from "svelte";
    import { Badge, ProgressBar, Separator, Slider, ToggleButton, ToggleButtonGroup } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewControlCard from "$lib/previews/ui/PreviewControlCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let progressValue = $state<number>(65);

    const presets = [0, 25, 50, 75, 100];

    let selectedPreset = $state<string | undefined>();

    $effect(() => {
        const match = presets.includes(progressValue) ? String(progressValue) : undefined;
        untrack(() => {
            if (selectedPreset !== match) {
                selectedPreset = match;
            }
        });
    });

    $effect(() => {
        if (selectedPreset === undefined) {
            const match = presets.includes(progressValue) ? String(progressValue) : undefined;
            if (match !== undefined) {
                selectedPreset = match;
            }
            return;
        }

        const num = Number(selectedPreset);
        untrack(() => {
            if (progressValue !== num) {
                progressValue = num;
            }
        });
    });
</script>

<PreviewPage>
    <PreviewHeader
        title="Progress Bar"
        description="A lightweight, accessible progress indicator supporting determinate updates and buttery-smooth, GPU-accelerated indeterminate animations."
        icon={Loader}
    />

    <!-- Interactive Controls -->
    <PreviewControlCard
        description="Adjust the progress value or choose presets to preview progress animations."
    >
        <div class="flex items-center gap-3">
            <span class="label-md">Value</span>
            <div class="w-40">
                <Slider
                    bind:value={progressValue}
                    min={0}
                    max={100}
                    ariaLabel="Progress value slider"
                />
            </div>
            <Badge variant="soft" color="base" class="tabular-nums min-w-60px">
                {progressValue}%
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
                        progressValue = preset;
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
                    <ProgressBar color="accent" value={progressValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Success" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar color="success" value={progressValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Warning" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar color="warning" value={progressValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Danger" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar color="danger" value={progressValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Info" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar color="info" value={progressValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar color="base" value={progressValue} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Size Scale -->
    <PreviewSection
        title="Size Scale"
        description="Three standard track heights designed for subtle indicators, standard progress bars, and prominent loaders."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar size="sm" color="accent" value={progressValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar size="md" color="accent" value={progressValue} />
                </div>
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar size="lg" color="accent" value={progressValue} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Indeterminate Showcase -->
    <PreviewSection
        title="Indeterminate State"
        description="Continuous GPU-accelerated motion with physics-based velocity curves for pending asynchronous tasks."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Subtle Loader" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar size="sm" color="accent" indeterminate={true} />
                </div>
            </PreviewCard>

            <PreviewCard label="Standard Runner" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar size="md" color="accent" indeterminate={true} />
                </div>
            </PreviewCard>

            <PreviewCard label="Prominent Track" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar size="lg" color="accent" indeterminate={true} />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
