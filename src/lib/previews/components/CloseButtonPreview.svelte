<script module lang="ts">
    import { X } from "@lucide/svelte";

    export const icon = X;
</script>

<script lang="ts">
    import { CloseButton } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

<PreviewPage>
    <PreviewHeader
        title="Close Button"
        description="Layer-agnostic dismiss action with built-in accessibility, micro-sizing, and touch hit area expansion."
        icon={X}
    />

    <!-- Variants & Sizes -->
    <PreviewSection
        title="Variants & Sizes"
        description="Solid subtle fill and transparent ghost across sm, md, and lg dimensions."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Solid" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-6">
                    <CloseButton variant="solid" size="sm" />
                    <CloseButton variant="solid" size="md" />
                    <CloseButton variant="solid" size="lg" />
                </div>
            </PreviewCard>

            <PreviewCard label="Ghost" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-6">
                    <CloseButton variant="ghost" size="sm" />
                    <CloseButton variant="ghost" size="md" />
                    <CloseButton variant="ghost" size="lg" />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Hit Area Control -->
    <PreviewSection
        title="Touch Hit Area"
        description="Automatic touch target expansion, configurable or disableable for dense layouts."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Auto (44px Target)" bg="elevation-1" class="h-32">
                <CloseButton size="md" />
            </PreviewCard>

            <PreviewCard label="Custom Large (48px Target)" bg="elevation-1" class="h-32">
                <CloseButton size="sm" hitArea="lg" />
            </PreviewCard>

            <PreviewCard label="Disabled (No Expansion)" bg="elevation-1" class="h-32">
                <CloseButton size="md" hitArea={false} />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Interactive & Disabled States -->
    <PreviewSection
        title="States"
        description="Interactive vs. WAI-ARIA disabled state with pointer event capture interception."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Interactive" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-4">
                    <CloseButton variant="solid" />
                    <CloseButton variant="ghost" />
                </div>
            </PreviewCard>

            <PreviewCard label="Disabled" bg="elevation-1" class="h-32">
                <div class="flex items-center gap-4">
                    <CloseButton variant="solid" disabled />
                    <CloseButton variant="ghost" disabled />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Elevation Contexts -->
    <PreviewSection
        title="Elevation Layers"
        description="Layer-agnostic neutral fill adapting smoothly across all background elevation levels."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Elevation 0" bg="elevation-0" class="h-32">
                <CloseButton variant="solid" />
            </PreviewCard>

            <PreviewCard label="Elevation 1" bg="elevation-1" class="h-32">
                <CloseButton variant="solid" />
            </PreviewCard>

            <PreviewCard label="Elevation 2" bg="elevation-2" class="h-32">
                <CloseButton variant="solid" />
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
