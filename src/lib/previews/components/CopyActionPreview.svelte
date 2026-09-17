<script module lang="ts">
    import { Copy } from "@lucide/svelte";

    export const icon = Copy;
</script>

<script lang="ts">
    import { CopyAction } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

<PreviewPage>
    <PreviewHeader
        title="Copy Action"
        description="A lightweight interactive copy indicator with an energetic checkmark pop, failure fallback, and celebration micro-sparkles."
        icon={Copy}
    />

    <PreviewSection
        title="Variants"
        description="Click any card to preview the spring checkmark, failure fallback, and celebration sparkles."
    >
        <PreviewGrid cols={4}>
            <PreviewCard label="Success" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <CopyAction />
                </div>
            </PreviewCard>

            <PreviewCard label="Error" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <CopyAction
                        onclick={async () => {
                            throw new Error("Failed");
                        }}
                    />
                </div>
            </PreviewCard>

            <PreviewCard label="Custom Size" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <CopyAction class="size-22px" strokeWidth={2.25} />
                </div>
            </PreviewCard>

            <PreviewCard label="Muted Tone" bg="elevation-1" class="h-32">
                <div class="flex-center size-full">
                    <CopyAction class="text-weak hover:text-main" />
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
