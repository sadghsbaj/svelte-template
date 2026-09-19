<script module lang="ts">
    import { PanelsTopLeft } from "@lucide/svelte";

    export const icon = PanelsTopLeft;
</script>

<script lang="ts">
    import { CalendarDays, ChartNoAxesColumn, Grid2X2, List, Rows3 } from "@lucide/svelte";
    import { SegmentedControl, SegmentedControlItem } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    let range = $state("week");
    let view = $state("grid");
    let density = $state("comfortable");
    let report = $state("overview");
</script>

{#snippet calendarIcon()}
    <CalendarDays />
{/snippet}

{#snippet chartIcon()}
    <ChartNoAxesColumn />
{/snippet}

{#snippet listIcon()}
    <List />
{/snippet}

{#snippet gridIcon()}
    <Grid2X2 />
{/snippet}

{#snippet rowsIcon()}
    <Rows3 />
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Segmented Control"
        description="Single-selection controls with a moving indicator, roving focus, and compact overflow handling."
        icon={PanelsTopLeft}
    />

    <PreviewSection title="Selection">
        <PreviewGrid cols={2}>
            <PreviewCard label="Equal Width" bg="elevation-1" class="h-32">
                <div class="w-full max-w-md">
                    <SegmentedControl bind:value={range} aria-label="Date range">
                        <SegmentedControlItem value="day">Day</SegmentedControlItem>
                        <SegmentedControlItem value="week">Week</SegmentedControlItem>
                        <SegmentedControlItem value="month">Month</SegmentedControlItem>
                    </SegmentedControl>
                </div>
            </PreviewCard>

            <PreviewCard label="Icons" bg="elevation-1" class="h-32">
                <div class="w-full max-w-md">
                    <SegmentedControl bind:value={view} aria-label="View mode">
                        <SegmentedControlItem
                            value="list"
                            iconLeft={listIcon}
                            aria-label="List view"
                        />
                        <SegmentedControlItem
                            value="grid"
                            iconLeft={gridIcon}
                            aria-label="Grid view"
                        />
                        <SegmentedControlItem
                            value="rows"
                            iconLeft={rowsIcon}
                            aria-label="Row view"
                        />
                    </SegmentedControl>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Details">
        <PreviewGrid cols={2}>
            <PreviewCard label="Separators + Disabled" bg="elevation-1" class="h-32">
                <div class="w-full max-w-md">
                    <SegmentedControl bind:value={density} separators aria-label="Layout density">
                        <SegmentedControlItem value="compact">Compact</SegmentedControlItem>
                        <SegmentedControlItem value="comfortable">Comfortable</SegmentedControlItem>
                        <SegmentedControlItem value="spacious" disabled
                            >Spacious</SegmentedControlItem
                        >
                    </SegmentedControl>
                </div>
            </PreviewCard>

            <PreviewCard label="Icon + Text" bg="elevation-1" class="h-32">
                <div class="w-full max-w-md">
                    <SegmentedControl bind:value={report} aria-label="Report view">
                        <SegmentedControlItem value="overview" iconLeft={calendarIcon}
                            >Overview</SegmentedControlItem
                        >
                        <SegmentedControlItem value="analytics" iconLeft={chartIcon}
                            >Analytics</SegmentedControlItem
                        >
                    </SegmentedControl>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Overflow">
        <PreviewCard label="Auto Width + Scroll Controls" bg="elevation-1" class="h-32">
            <div class="w-72 max-w-full">
                <SegmentedControl
                    bind:value={report}
                    layout="auto"
                    scrollButtons
                    aria-label="Report section"
                >
                    <SegmentedControlItem value="overview">Overview</SegmentedControlItem>
                    <SegmentedControlItem value="analytics">Analytics</SegmentedControlItem>
                    <SegmentedControlItem value="performance">Performance</SegmentedControlItem>
                    <SegmentedControlItem value="audience">Audience</SegmentedControlItem>
                    <SegmentedControlItem value="acquisition">Acquisition</SegmentedControlItem>
                </SegmentedControl>
            </div>
        </PreviewCard>
    </PreviewSection>
</PreviewPage>
