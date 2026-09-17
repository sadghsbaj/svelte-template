<script module lang="ts">
    import { Type } from "@lucide/svelte";

    export const icon = Type;
</script>

<script lang="ts">
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";
</script>

<PreviewPage>
    <PreviewHeader
        title="Typography"
        description="Standardized utility shortcuts for titles, subtitles, labels, and descriptions to ensure a clean, consistent hierarchy across all UI layers."
        icon={Type}
    />

    <!-- Titles Section -->
    <PreviewSection
        title="Titles"
        description="High-contrast headings with tight tracking and calibrated weights for headers, cards, and modal dialogs."
    >
        <div class="p-6 rounded-3xl squircle-smooth bg-elevation-1 shadow-sm flex flex-col gap-5">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">title-3xl</span>
                <span class="title-3xl flex-1">Display Title</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">30px · 700</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">title-2xl</span>
                <span class="title-2xl flex-1">Page Title</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">24px · 700</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">title-xl</span>
                <span class="title-xl flex-1">Section Header</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">20px · 700</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">title-lg</span>
                <span class="title-lg flex-1">Group Heading</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">18px · 700</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">title-md</span>
                <span class="title-md flex-1">Card Title</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">16px · 600</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">title-sm</span>
                <span class="title-sm flex-1">Sub-card Heading</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">14px · 600</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">title-xs</span>
                <span class="title-xs flex-1">Micro Heading</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">12px · 600</span>
            </div>
        </div>
    </PreviewSection>

    <!-- Subtitles Section -->
    <PreviewSection
        title="Subtitles"
        description="Secondary contextual text beneath titles and headings for orientation and guidance."
    >
        <div class="p-6 rounded-3xl squircle-smooth bg-elevation-1 shadow-sm flex flex-col gap-5">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">subtitle-xl</span>
                <span class="subtitle-xl flex-1">Hero context line and lead paragraph</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">18px · 400</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">subtitle-lg</span>
                <span class="subtitle-lg flex-1">Standard section subtitle with comfortable reading flow</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">16px · 400</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">subtitle-md</span>
                <span class="subtitle-md flex-1">Card context note and dialog explanation</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">14px · 400</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">subtitle-sm</span>
                <span class="subtitle-sm flex-1">Compact metadata and secondary contextual hint</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">12px · 400</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">subtitle-xs</span>
                <span class="subtitle-xs flex-1">Micro caption, timestamp, or subtle metadata</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">11px · 400</span>
            </div>
        </div>
    </PreviewSection>

    <!-- Labels Section -->
    <PreviewSection
        title="Labels"
        description="Compact, non-selectable labels calibrated for direct pairing with interactive form controls."
    >
        <div class="p-6 rounded-3xl squircle-smooth bg-elevation-1 shadow-sm flex flex-col gap-5">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">label-lg</span>
                <span class="label-lg flex-1">Form Control Label Large</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">16px · 500</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">label-md</span>
                <span class="label-md flex-1">Form Control Label Medium</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">14px · 500</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">label-sm</span>
                <span class="label-sm flex-1">Form Control Label Small</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">12px · 500</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">label-xs</span>
                <span class="label-xs flex-1">Micro Label & Badge Text</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">11px · 500</span>
            </div>
        </div>
    </PreviewSection>

    <!-- Descriptions Section -->
    <PreviewSection
        title="Descriptions"
        description="Tertiary guidance and hint text placed below form controls or settings rows."
    >
        <div class="p-6 rounded-3xl squircle-smooth bg-elevation-1 shadow-sm flex flex-col gap-5">
            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">description-lg</span>
                <span class="description-lg flex-1">Extended guidance text and multi-line feature explanations.</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">16px · 400</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">description-md</span>
                <span class="description-md flex-1">Settings row explanations and input field helper text.</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">14px · 400</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-base-soft-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">description-sm</span>
                <span class="description-sm flex-1">Standard form field instructions and compact hints.</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">12px · 400</span>
            </div>

            <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                <span class="text-xs font-mono text-weak sm:w-32 shrink-0">description-xs</span>
                <span class="description-xs flex-1">Footnotes, fine print, and subtle status hints.</span>
                <span class="text-xs text-weaker font-mono shrink-0 sm:text-right">11px · 400</span>
            </div>
        </div>
    </PreviewSection>
</PreviewPage>
