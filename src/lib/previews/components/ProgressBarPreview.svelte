<script module lang="ts">
    import { Loader } from "@lucide/svelte";

    export const icon = Loader;
</script>

<script lang="ts">
    import { Button, ProgressBar, Switch } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let progressValue = $state<number>(65);
    let isIndeterminate = $state<boolean>(false);

    const presets = [0, 25, 50, 75, 100];
</script>

<PreviewPage>
    <PreviewHeader
        title="Progress Bar"
        description="A lightweight, accessible progress indicator supporting determinate updates and buttery-smooth, GPU-accelerated indeterminate animations."
        icon={Loader}
    />

    <!-- Interactive Controls -->
    <PreviewSection
        title="Interactive Controls"
        description="Adjust the progress value, choose presets, or switch to indeterminate loading mode."
    >
        <div class="flex flex-wrap items-center gap-5 p-4 rounded-2xl bg-elevation-1 shadow-sm w-fit mb-6">
            <label class="flex items-center gap-3 cursor-pointer select-none">
                <Switch bind:checked={isIndeterminate} size="sm" />
                <span class="text-sm font-500 text-main">Indeterminate</span>
            </label>

            <div class="h-5 w-1px bg-base-soft-2 hidden sm:block"></div>

            <div class="flex items-center gap-3" class:opacity-40={isIndeterminate}>
                <span class="text-sm font-500 text-main select-none">Value</span>
                <input
                    type="range"
                    min="0"
                    max="100"
                    bind:value={progressValue}
                    disabled={isIndeterminate}
                    class="w-40 h-2 bg-base-soft-2 rounded-lg appearance-none cursor-pointer accent-accent-solid-1 disabled:cursor-not-allowed"
                />
                <span class="tabular-nums font-600 text-xs px-2.5 py-1 rounded-full bg-base-soft-1 text-main select-none">
                    {isIndeterminate ? "Active" : `${progressValue}%`}
                </span>
            </div>

            <div class="h-5 w-1px bg-base-soft-2 hidden sm:block"></div>

            <div class="flex items-center gap-1.5" class:opacity-40={isIndeterminate}>
                {#each presets as preset (preset)}
                    <Button
                        size="sm"
                        variant={progressValue === preset && !isIndeterminate ? "solid" : "soft"}
                        color={progressValue === preset && !isIndeterminate ? "accent" : "base"}
                        disabled={isIndeterminate}
                        onclick={() => (progressValue = preset)}
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
                    <ProgressBar
                        color="accent"
                        value={progressValue}
                        indeterminate={isIndeterminate}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Success" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar
                        color="success"
                        value={progressValue}
                        indeterminate={isIndeterminate}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Warning" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar
                        color="warning"
                        value={progressValue}
                        indeterminate={isIndeterminate}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Danger" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar
                        color="danger"
                        value={progressValue}
                        indeterminate={isIndeterminate}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Info" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar
                        color="info"
                        value={progressValue}
                        indeterminate={isIndeterminate}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar
                        color="base"
                        value={progressValue}
                        indeterminate={isIndeterminate}
                    />
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
                    <ProgressBar
                        size="sm"
                        color="accent"
                        value={progressValue}
                        indeterminate={isIndeterminate}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar
                        size="md"
                        color="accent"
                        value={progressValue}
                        indeterminate={isIndeterminate}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-1" class="h-32">
                <div class="flex-center w-full px-6">
                    <ProgressBar
                        size="lg"
                        color="accent"
                        value={progressValue}
                        indeterminate={isIndeterminate}
                    />
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
