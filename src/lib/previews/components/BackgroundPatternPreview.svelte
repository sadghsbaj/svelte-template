<script module lang="ts">
    import { Grid3x3 } from "@lucide/svelte";

    export const icon = Grid3x3;
</script>

<script lang="ts">
    import { fadeMask } from "$attachments";
    import { BackgroundPattern } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

<PreviewPage>
    <PreviewHeader
        title="Background Pattern"
        description="Procedural SVG background patterns with dynamic edge fitting, theme blending, and alpha fade masks."
        icon={Grid3x3}
    />

    <!-- Variants -->
    <PreviewSection title="Variants" description="All available procedural pattern styles.">
        <PreviewGrid cols={3}>
            <PreviewCard label="Dots" bg="elevation-1" padless class="h-36">
                <BackgroundPattern variant="dots" />
            </PreviewCard>
            <PreviewCard label="Grid" bg="elevation-1" padless class="h-36">
                <BackgroundPattern variant="grid" />
            </PreviewCard>
            <PreviewCard label="Crosses" bg="elevation-1" padless class="h-36">
                <BackgroundPattern variant="crosses" />
            </PreviewCard>
            <PreviewCard label="Lines" bg="elevation-1" padless class="h-36">
                <BackgroundPattern variant="lines" />
            </PreviewCard>
            <PreviewCard label="Hexagons" bg="elevation-1" padless class="h-36">
                <BackgroundPattern variant="hexagons" />
            </PreviewCard>
            <PreviewCard label="Topography" bg="elevation-1" padless class="h-36">
                <BackgroundPattern variant="topography" />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Fade Masks -->
    <PreviewSection
        title="Fade Masks"
        description="Composing patterns with the fadeMask element attachment."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Radial Vignette" bg="elevation-1" padless class="h-36">
                <BackgroundPattern
                    variant="grid"
                    {@attach fadeMask({ type: "radial", strength: "lg" })}
                />
            </PreviewCard>
            <PreviewCard label="Block Edges" bg="elevation-1" padless class="h-36">
                <BackgroundPattern
                    variant="hexagons"
                    {@attach fadeMask({ type: "block", strength: "md" })}
                />
            </PreviewCard>
            <PreviewCard label="Bottom Fade" bg="elevation-1" padless class="h-36">
                <BackgroundPattern
                    variant="crosses"
                    {@attach fadeMask({ type: "bottom", strength: "lg" })}
                />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Custom Styling -->
    <PreviewSection
        title="Custom Theming & Spacing"
        description="Adjusting color accents, opacity, and grid tile density."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Accent Tinted" bg="elevation-1" padless class="h-36">
                <BackgroundPattern
                    variant="dots"
                    color="var(--color-accent-500)"
                    opacity={35}
                    darkColor="var(--color-accent-400)"
                    darkOpacity={45}
                />
            </PreviewCard>
            <PreviewCard label="Dense Spacing (16px)" bg="elevation-1" padless class="h-36">
                <BackgroundPattern variant="grid" spacing={16} size={1} />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
