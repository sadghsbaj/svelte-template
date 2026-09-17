<script module lang="ts">
    import { BadgeCheck } from "@lucide/svelte";

    export const icon = BadgeCheck;
</script>

<script lang="ts">
    import { Check, Sparkles, ArrowRight } from "@lucide/svelte";
    import { Badge } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

{#snippet sparklesIcon()}
    <Sparkles />
{/snippet}

{#snippet arrowRightIcon()}
    <ArrowRight />
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Badge"
        description="Compact capsule badges for status indicators, counts, and category tags across soft and solid variants."
        icon={BadgeCheck}
    />

    <!-- Soft Colors -->
    <PreviewSection
        title="Soft Colors"
        description="Low-contrast tinted backgrounds paired with solid saturated text for status and tags."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Accent" bg="elevation-1" class="h-28">
                <Badge color="accent" variant="soft">Accent</Badge>
            </PreviewCard>

            <PreviewCard label="Success" bg="elevation-1" class="h-28">
                <Badge color="success" variant="soft">Success</Badge>
            </PreviewCard>

            <PreviewCard label="Danger" bg="elevation-1" class="h-28">
                <Badge color="danger" variant="soft">Danger</Badge>
            </PreviewCard>

            <PreviewCard label="Warning" bg="elevation-1" class="h-28">
                <Badge color="warning" variant="soft">Warning</Badge>
            </PreviewCard>

            <PreviewCard label="Info" bg="elevation-1" class="h-28">
                <Badge color="info" variant="soft">Info</Badge>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-28">
                <Badge color="base" variant="soft">Base</Badge>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Solid Colors -->
    <PreviewSection
        title="Solid Colors"
        description="High-contrast solid backgrounds for urgent indicators, critical alerts, and prominent counts."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Accent" bg="elevation-1" class="h-28">
                <Badge color="accent" variant="solid">Accent</Badge>
            </PreviewCard>

            <PreviewCard label="Success" bg="elevation-1" class="h-28">
                <Badge color="success" variant="solid">Success</Badge>
            </PreviewCard>

            <PreviewCard label="Danger" bg="elevation-1" class="h-28">
                <Badge color="danger" variant="solid">Danger</Badge>
            </PreviewCard>

            <PreviewCard label="Warning" bg="elevation-1" class="h-28">
                <Badge color="warning" variant="solid">Warning</Badge>
            </PreviewCard>

            <PreviewCard label="Info" bg="elevation-1" class="h-28">
                <Badge color="info" variant="solid">Info</Badge>
            </PreviewCard>

            <PreviewCard label="Base" bg="elevation-1" class="h-28">
                <Badge color="base" variant="solid">Base</Badge>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Sizes -->
    <PreviewSection
        title="Sizes"
        description="Five calibrated scale steps from micro inline badges to hero tags."
    >
        <PreviewGrid cols={5}>
            <PreviewCard label="Extra Small" bg="elevation-1" class="h-28">
                <Badge size="xs" color="accent">Extra Small</Badge>
            </PreviewCard>

            <PreviewCard label="Small" bg="elevation-1" class="h-28">
                <Badge size="sm" color="accent">Small</Badge>
            </PreviewCard>

            <PreviewCard label="Medium" bg="elevation-1" class="h-28">
                <Badge size="md" color="accent">Medium</Badge>
            </PreviewCard>

            <PreviewCard label="Large" bg="elevation-1" class="h-28">
                <Badge size="lg" color="accent">Large</Badge>
            </PreviewCard>

            <PreviewCard label="Extra Large" bg="elevation-1" class="h-28">
                <Badge size="xl" color="accent">Extra Large</Badge>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Square Modifier -->
    <PreviewSection
        title="Square Modifier"
        description="Circular 1-to-1 aspect ratio for notification badges, counts, and icon pills."
    >
        <PreviewGrid cols={4}>
            <PreviewCard label="Unread Count" bg="elevation-1" class="h-32">
                <Badge color="danger" variant="solid" square size="md">
                    3
                </Badge>
            </PreviewCard>

            <PreviewCard label="Micro Dot" bg="elevation-1" class="h-32">
                <Badge color="success" variant="solid" square size="xs">
                    <Check />
                </Badge>
            </PreviewCard>

            <PreviewCard label="Check Status" bg="elevation-1" class="h-32">
                <Badge color="success" variant="soft" square size="md">
                    <Check />
                </Badge>
            </PreviewCard>

            <PreviewCard label="Large Count" bg="elevation-1" class="h-32">
                <Badge color="accent" variant="solid" square size="lg">
                    9
                </Badge>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Icons -->
    <PreviewSection
        title="Icons"
        description="Inline icons on the left or right with automatic optical scaling to match badge dimensions."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Icon Left" bg="elevation-1" class="h-32">
                <Badge color="accent" variant="soft" size="md" iconLeft={sparklesIcon}>
                    Featured
                </Badge>
            </PreviewCard>

            <PreviewCard label="Icon Right" bg="elevation-1" class="h-32">
                <Badge color="base" variant="soft" size="md" iconRight={arrowRightIcon}>
                    Explore
                </Badge>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
