<script module lang="ts">
    import { Columns3 } from "@lucide/svelte";

    export const icon = Columns3;
</script>

<script lang="ts">
    import {
        AlignCenter,
        AlignLeft,
        AlignRight,
        ChevronDown,
        ChevronUp,
        Minus,
        Plus,
        RotateCcw,
    } from "@lucide/svelte";
    import { Button, ButtonGroup } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

<PreviewPage>
    <PreviewHeader
        title="Button Group"
        description="Groups related buttons into a shared horizontal or vertical shape."
        icon={Columns3}
    />

    <PreviewSection title="Orientation">
        <PreviewGrid cols={2}>
            <PreviewCard label="Horizontal" bg="elevation-1" class="h-32">
                <ButtonGroup aria-label="Text alignment">
                    <Button variant="soft" color="base">Left</Button>
                    <Button variant="soft" color="base">Center</Button>
                    <Button variant="soft" color="base">Right</Button>
                </ButtonGroup>
            </PreviewCard>

            <PreviewCard label="Vertical" bg="elevation-1" class="h-48">
                <ButtonGroup orientation="vertical" separators aria-label="Item order">
                    <Button variant="outline" color="base" iconOnly aria-label="Move up">
                        <ChevronUp />
                    </Button>
                    <Button variant="outline" color="base" iconOnly aria-label="Reset order">
                        <RotateCcw />
                    </Button>
                    <Button variant="outline" color="base" iconOnly aria-label="Move down">
                        <ChevronDown />
                    </Button>
                </ButtonGroup>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection title="Combinations">
        <PreviewGrid cols={3}>
            <PreviewCard label="Solid + Separators" bg="elevation-1" class="h-32">
                <ButtonGroup separators aria-label="Document actions">
                    <Button variant="solid" color="accent">Create</Button>
                    <Button variant="solid" color="accent">Copy</Button>
                    <Button variant="solid" color="accent">Share</Button>
                </ButtonGroup>
            </PreviewCard>

            <PreviewCard label="Soft-Outline" bg="elevation-1" class="h-32">
                <ButtonGroup aria-label="Publishing status">
                    <Button variant="soft-outline" color="base">Draft</Button>
                    <Button variant="soft-outline" color="base">Review</Button>
                    <Button variant="soft-outline" color="accent">Publish</Button>
                </ButtonGroup>
            </PreviewCard>

            <PreviewCard label="Outline" bg="elevation-1" class="h-32">
                <ButtonGroup aria-label="History actions">
                    <Button variant="outline" color="base">Undo</Button>
                    <Button variant="outline" color="base">Redo</Button>
                    <Button variant="outline" color="danger">Clear</Button>
                </ButtonGroup>
            </PreviewCard>

            <PreviewCard label="Icon Only" bg="elevation-1" class="h-32">
                <ButtonGroup aria-label="Zoom controls">
                    <Button variant="soft" color="base" iconOnly aria-label="Zoom out">
                        <Minus />
                    </Button>
                    <Button variant="soft" color="base" iconOnly aria-label="Reset zoom">
                        <RotateCcw />
                    </Button>
                    <Button variant="soft" color="base" iconOnly aria-label="Zoom in">
                        <Plus />
                    </Button>
                </ButtonGroup>
            </PreviewCard>

            <PreviewCard label="Elevated" bg="elevation-0" class="h-32">
                <ButtonGroup aria-label="Calendar range">
                    <Button variant="elevated" color="base">Day</Button>
                    <Button variant="elevated" color="base">Week</Button>
                    <Button variant="elevated" color="base">Month</Button>
                </ButtonGroup>
            </PreviewCard>

            <PreviewCard label="Soft Colors" bg="elevation-1" class="h-32">
                <ButtonGroup aria-label="Alignment options">
                    <Button variant="soft" color="accent" iconOnly aria-label="Align left">
                        <AlignLeft />
                    </Button>
                    <Button variant="soft" color="base" iconOnly aria-label="Align center">
                        <AlignCenter />
                    </Button>
                    <Button variant="soft" color="danger" iconOnly aria-label="Align right">
                        <AlignRight />
                    </Button>
                </ButtonGroup>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
