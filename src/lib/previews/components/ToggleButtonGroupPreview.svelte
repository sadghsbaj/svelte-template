<script module lang="ts">
    import { ListChecks } from "@lucide/svelte";

    export const icon = ListChecks;
</script>

<script lang="ts">
    import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, Underline } from "@lucide/svelte";
    import { ToggleButton, ToggleButtonGroup } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let alignment = $state<string | undefined>("center");
    let formatting = $state<string[]>(["bold"]);
    let vertical = $state<string[]>(["first", "third"]);
    let range = $state<string | undefined>("week");
    let nativeTab = $state<string[]>(["one"]);
</script>

<PreviewPage>
    <PreviewHeader
        title="Toggle Button Group"
        description="Connected toggle controls with single or multiple selection."
        icon={ListChecks}
    />

    <PreviewSection title="Selection">
        <PreviewGrid cols={2}>
            <PreviewCard label="Single" bg="elevation-1" class="h-32">
                <ToggleButtonGroup type="single" bind:value={alignment} aria-label="Text alignment">
                    <ToggleButton value="left" iconOnly aria-label="Align left">
                        <AlignLeft />
                    </ToggleButton>
                    <ToggleButton value="center" iconOnly aria-label="Align center">
                        <AlignCenter />
                    </ToggleButton>
                    <ToggleButton value="right" iconOnly aria-label="Align right">
                        <AlignRight />
                    </ToggleButton>
                </ToggleButtonGroup>
            </PreviewCard>

            <PreviewCard label="Multiple" bg="elevation-1" class="h-32">
                <ToggleButtonGroup
                    type="multiple"
                    bind:value={formatting}
                    separators
                    aria-label="Text formatting"
                >
                    <ToggleButton value="bold" iconOnly aria-label="Bold"><Bold /></ToggleButton>
                    <ToggleButton value="italic" iconOnly aria-label="Italic"
                        ><Italic /></ToggleButton
                    >
                    <ToggleButton value="underline" iconOnly aria-label="Underline">
                        <Underline />
                    </ToggleButton>
                </ToggleButtonGroup>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Layout">
        <PreviewGrid cols={2}>
            <PreviewCard label="Vertical" bg="elevation-1" class="h-52">
                <ToggleButtonGroup
                    type="multiple"
                    bind:value={vertical}
                    orientation="vertical"
                    separators
                    aria-label="Vertical options"
                >
                    <ToggleButton value="first">First</ToggleButton>
                    <ToggleButton value="second">Second</ToggleButton>
                    <ToggleButton value="third">Third</ToggleButton>
                </ToggleButtonGroup>
            </PreviewCard>

            <PreviewCard label="Full Width" bg="elevation-1" class="h-52">
                <div class="w-full max-w-md">
                    <ToggleButtonGroup
                        type="single"
                        bind:value={range}
                        fullWidth
                        separators
                        aria-label="Date range"
                    >
                        <ToggleButton value="day">Day</ToggleButton>
                        <ToggleButton value="week">Week</ToggleButton>
                        <ToggleButton value="month">Month</ToggleButton>
                    </ToggleButtonGroup>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Navigation">
        <PreviewCard label="Native Tab Order" bg="elevation-1" class="h-32">
            <ToggleButtonGroup
                type="multiple"
                bind:value={nativeTab}
                rovingFocus={false}
                aria-label="Native tab options"
            >
                <ToggleButton value="one">One</ToggleButton>
                <ToggleButton value="two">Two</ToggleButton>
                <ToggleButton value="three">Three</ToggleButton>
            </ToggleButtonGroup>
        </PreviewCard>
    </PreviewSection>
</PreviewPage>
