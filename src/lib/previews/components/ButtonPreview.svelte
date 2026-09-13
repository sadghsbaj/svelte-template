<script module lang="ts">
    import { SquareMousePointer } from "@lucide/svelte";

    export const icon = SquareMousePointer;
</script>

<script lang="ts">
    import { ArrowRight, Plus, Sparkles, Trash2 } from "@lucide/svelte";
    import { Button } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

{#snippet plusIcon()}
    <Plus />
{/snippet}

{#snippet arrowIcon()}
    <ArrowRight class="group-hover:translate-x-0.5 t:(translate-200-quad-out)" />
{/snippet}

{#snippet sparklesIcon()}
    <Sparkles />
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Button"
        description="Interactive action trigger supporting polymorphic elements, seven surface variants, semantic color palettes, and embedded loading halos."
        icon={SquareMousePointer}
    />

    <!-- Variants & Colors -->
    <PreviewSection
        title="Variants & Colors"
        description="Seven core visual variants across accent, base, and danger palettes."
    >
        <PreviewGrid cols={3}>
            <!-- Solid -->
            <PreviewCard label="Solid" bg="elevation-1" class="h-36">
                <div class="flex flex-wrap items-center gap-3">
                    <Button variant="solid" color="accent">Accent</Button>
                    <Button variant="solid" color="base">Base</Button>
                    <Button variant="solid" color="danger">Danger</Button>
                </div>
            </PreviewCard>

            <!-- Soft-Outline -->
            <PreviewCard label="Soft-Outline" bg="elevation-1" class="h-36">
                <div class="flex flex-wrap items-center gap-3">
                    <Button variant="soft-outline" color="accent">Accent</Button>
                    <Button variant="soft-outline" color="base">Base</Button>
                    <Button variant="soft-outline" color="danger">Danger</Button>
                </div>
            </PreviewCard>

            <!-- Soft -->
            <PreviewCard label="Soft" bg="elevation-1" class="h-36">
                <div class="flex flex-wrap items-center gap-3">
                    <Button variant="soft" color="accent">Accent</Button>
                    <Button variant="soft" color="base">Base</Button>
                    <Button variant="soft" color="danger">Danger</Button>
                </div>
            </PreviewCard>

            <!-- Outline -->
            <PreviewCard label="Outline" bg="elevation-1" class="h-36">
                <div class="flex flex-wrap items-center gap-3">
                    <Button variant="outline" color="accent">Accent</Button>
                    <Button variant="outline" color="base">Base</Button>
                    <Button variant="outline" color="danger">Danger</Button>
                </div>
            </PreviewCard>

            <!-- Ghost -->
            <PreviewCard label="Ghost" bg="elevation-1" class="h-36">
                <div class="flex flex-wrap items-center gap-3">
                    <Button variant="ghost" color="accent">Accent</Button>
                    <Button variant="ghost" color="base">Base</Button>
                    <Button variant="ghost" color="danger">Danger</Button>
                </div>
            </PreviewCard>

            <!-- Plain -->
            <PreviewCard label="Plain" bg="elevation-1" class="h-36">
                <div class="flex flex-wrap items-center gap-4">
                    <Button variant="plain" color="accent">Accent</Button>
                    <Button variant="plain" color="base">Base</Button>
                    <Button variant="plain" color="danger">Danger</Button>
                </div>
            </PreviewCard>

            <!-- Elevated -->
            <PreviewCard label="Elevated" bg="elevation-0" class="h-36">
                <div class="flex flex-wrap items-center gap-3">
                    <Button variant="elevated" color="accent">Accent</Button>
                    <Button variant="elevated" color="base">Base</Button>
                    <Button variant="elevated" color="danger">Danger</Button>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Sizes -->
    <PreviewSection
        title="Sizes"
        description="Proportional dimensions across sm, md, and lg with harmonized typographic metrics."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Small (sm)" bg="elevation-1" class="h-32">
                <Button size="sm">Small Action</Button>
            </PreviewCard>

            <PreviewCard label="Medium (md)" bg="elevation-1" class="h-32">
                <Button size="md">Medium Action</Button>
            </PreviewCard>

            <PreviewCard label="Large (lg)" bg="elevation-1" class="h-32">
                <Button size="lg">Large Action</Button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Icons & Placement -->
    <PreviewSection
        title="Icons & Placement"
        description="Left, right, and isolated icon configurations with automatic size alignment."
    >
        <PreviewGrid cols={4}>
            <PreviewCard label="Icon Left" bg="elevation-1" class="h-32">
                <Button iconLeft={plusIcon}>New Item</Button>
            </PreviewCard>

            <PreviewCard label="Icon Right" bg="elevation-1" class="h-32">
                <Button variant="soft" iconRight={arrowIcon} class="group">Continue</Button>
            </PreviewCard>

            <PreviewCard label="Icon Only" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-2.5">
                    <Button iconOnly size="sm" aria-label="Delete">
                        <Trash2 />
                    </Button>
                    <Button iconOnly size="md" aria-label="Delete">
                        <Trash2 />
                    </Button>
                    <Button iconOnly size="lg" aria-label="Delete">
                        <Trash2 />
                    </Button>
                </div>
            </PreviewCard>

            <PreviewCard label="Icon Only (Variants)" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-2.5">
                    <Button iconOnly variant="soft" aria-label="Magic">
                        <Sparkles />
                    </Button>
                    <Button iconOnly variant="outline" aria-label="Magic">
                        <Sparkles />
                    </Button>
                    <Button iconOnly variant="ghost" aria-label="Magic">
                        <Sparkles />
                    </Button>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Full Width -->
    <PreviewSection
        title="Full Width"
        description="Expands to occupy the full container breadth with centered content."
    >
        <PreviewCard label="Block Action" bg="elevation-1" class="h-32">
            <div class="w-full max-w-sm">
                <Button fullWidth iconLeft={sparklesIcon}>Get Started</Button>
            </div>
        </PreviewCard>
    </PreviewSection>

    <!-- Alignment -->
    <PreviewSection title="Alignment">
        <PreviewGrid cols={4}>
            <PreviewCard label="Start" bg="elevation-1" class="h-32">
                <div class="w-full max-w-200px">
                    <Button fullWidth align="start" iconLeft={plusIcon} variant="soft" color="base">
                        Start
                    </Button>
                </div>
            </PreviewCard>

            <PreviewCard label="Center" bg="elevation-1" class="h-32">
                <div class="w-full max-w-200px">
                    <Button fullWidth align="center" iconLeft={plusIcon} variant="soft" color="base">
                        Center
                    </Button>
                </div>
            </PreviewCard>

            <PreviewCard label="End" bg="elevation-1" class="h-32">
                <div class="w-full max-w-200px">
                    <Button fullWidth align="end" iconRight={arrowIcon} variant="soft" color="base">
                        End
                    </Button>
                </div>
            </PreviewCard>

            <PreviewCard label="Between" bg="elevation-1" class="h-32">
                <div class="w-full max-w-200px">
                    <Button fullWidth align="between" iconLeft={plusIcon} iconRight={arrowIcon} variant="soft" color="base">
                        Between
                    </Button>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Interactive States -->
    <PreviewSection
        title="States"
        description="Interactive, async loading with glowing pulse ring, and disabled states."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Interactive" bg="elevation-1" class="h-32">
                <Button>Active Button</Button>
            </PreviewCard>

            <PreviewCard label="Loading (Pending)" bg="elevation-1" class="h-32">
                <Button loading>Saving Changes</Button>
            </PreviewCard>

            <PreviewCard label="Disabled" bg="elevation-1" class="h-32">
                <Button disabled>Disabled Action</Button>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
