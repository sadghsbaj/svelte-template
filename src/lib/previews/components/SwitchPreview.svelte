<script module lang="ts">
    import { ToggleRight } from "@lucide/svelte";

    export const icon = ToggleRight;
</script>

<script lang="ts">
    import { Switch } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let accentOff = $state(false);
    let accentOn = $state(true);
    let baseOff = $state(false);
    let baseOn = $state(true);

    let small = $state(false);
    let medium = $state(true);
    let large = $state(false);

    let enabled = $state(false);
    let disabledOff = $state(false);
    let disabledOn = $state(true);
</script>

<PreviewPage>
    <PreviewHeader
        title="Switch"
        description="Compact binary control with semantic colors and responsive sizing."
        icon={ToggleRight}
    />

    <PreviewSection title="Colors">
        <PreviewGrid cols={2}>
            <PreviewCard label="Accent" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-6">
                    <Switch bind:checked={accentOff} color="accent" aria-label="Accent off" />
                    <Switch bind:checked={accentOn} color="accent" aria-label="Accent on" />
                </div>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-6">
                    <Switch bind:checked={baseOff} color="base" aria-label="Base off" />
                    <Switch bind:checked={baseOn} color="base" aria-label="Base on" />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Sizes">
        <PreviewGrid cols={3}>
            <PreviewCard label="Small" bg="elevation-1" class="h-32">
                <Switch bind:checked={small} size="sm" aria-label="Small switch" />
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-1" class="h-32">
                <Switch bind:checked={medium} size="md" aria-label="Medium switch" />
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-1" class="h-32">
                <Switch bind:checked={large} size="lg" aria-label="Large switch" />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="States">
        <PreviewGrid cols={2}>
            <PreviewCard label="Interactive" bg="elevation-1" class="h-32">
                <Switch bind:checked={enabled} aria-label="Interactive switch" />
            </PreviewCard>

            <PreviewCard label="Disabled" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-6">
                    <Switch bind:checked={disabledOff} disabled aria-label="Disabled switch off" />
                    <Switch
                        bind:checked={disabledOn}
                        color="base"
                        disabled
                        aria-label="Disabled switch on"
                    />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
