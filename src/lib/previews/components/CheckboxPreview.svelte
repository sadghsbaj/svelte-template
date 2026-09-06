<script module lang="ts">
    import { CircleCheck } from "@lucide/svelte";

    export const icon = CircleCheck;
</script>

<script lang="ts">
    import { Checkbox } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let accentOff = $state(false);
    let accentOn = $state(true);
    let baseOff = $state(false);
    let baseOn = $state(true);
    let invalidOff = $state(false);
    let invalidOn = $state(true);

    let small = $state(false);
    let medium = $state(true);
    let large = $state(false);

    let enabled = $state(false);
    let disabledOff = $state(false);
    let disabledOn = $state(true);

    let elevation0 = $state(false);
    let elevation1 = $state(true);
    let elevation2 = $state(false);
</script>

<PreviewPage>
    <PreviewHeader
        title="Checkbox"
        description="Compact binary control with semantic colors and responsive sizing."
        icon={CircleCheck}
    />

    <PreviewSection title="Colors">
        <PreviewGrid cols={3}>
            <PreviewCard label="Accent" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-6">
                    <Checkbox bind:checked={accentOff} color="accent" aria-label="Accent off" />
                    <Checkbox bind:checked={accentOn} color="accent" aria-label="Accent on" />
                </div>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-6">
                    <Checkbox bind:checked={baseOff} color="base" aria-label="Base off" />
                    <Checkbox bind:checked={baseOn} color="base" aria-label="Base on" />
                </div>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-6">
                    <Checkbox bind:checked={invalidOff} color="invalid" aria-label="Base off" />
                    <Checkbox bind:checked={invalidOn} color="invalid" aria-label="Base on" />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Sizes">
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-32">
                <Checkbox bind:checked={small} size="sm" aria-label="Small checkbox" />
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-1" class="h-32">
                <Checkbox bind:checked={medium} size="md" aria-label="Medium checkbox" />
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-1" class="h-32">
                <Checkbox bind:checked={large} size="lg" aria-label="Large checkbox" />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="States">
        <PreviewGrid cols={2}>
            <PreviewCard label="Interactive" bg="elevation-1" class="h-32">
                <Checkbox bind:checked={enabled} aria-label="Interactive checkbox" />
            </PreviewCard>

            <PreviewCard label="Disabled" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-6">
                    <Checkbox
                        bind:checked={disabledOff}
                        disabled
                        aria-label="Disabled checkbox off"
                    />
                    <Checkbox
                        bind:checked={disabledOn}
                        disabled
                        aria-label="Disabled checkbox on"
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Elevation Layers">
        <PreviewGrid cols={3}>
            <PreviewCard label="Elevation 0" bg="elevation-0" class="h-32">
                <Checkbox bind:checked={elevation0} size="md" aria-label="Medium checkbox" />
            </PreviewCard>

            <PreviewCard label="Elevation 1" bg="elevation-1" class="h-32">
                <Checkbox bind:checked={elevation1} size="md" aria-label="Medium checkbox" />
            </PreviewCard>

            <PreviewCard label="Elevation 2" bg="elevation-2" class="h-32">
                <Checkbox bind:checked={elevation2} size="md" aria-label="Medium checkbox" />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
