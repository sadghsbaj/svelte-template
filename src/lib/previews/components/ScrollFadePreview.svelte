<script module lang="ts">
    import { UnfoldVertical } from "@lucide/svelte";

    export const icon = UnfoldVertical;
</script>

<script lang="ts">
    import { scrollFade } from "$attachments";
    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    const verticalItems = [
        "Dashboard Overview",
        "Analytics & Metrics",
        "User Management",
        "Billing & Invoices",
        "Security Settings",
        "API Integrations",
        "Audit Log Records",
        "System Notifications",
        "Data Export Hub",
        "Backup Configurations",
    ];

    const horizontalTags = [
        "All Items",
        "Components",
        "Attachments",
        "Utilities",
        "Design Tokens",
        "Typography",
        "Animations",
        "Layout Primitives",
        "Navigation",
        "Forms & Inputs",
        "Data Visualization",
    ];
</script>

<PreviewPage>
    <PreviewHeader
        title="Scroll Fade"
        description="Dynamic hardware-accelerated alpha fade masks that smoothly blend content at container scroll boundaries."
        icon={UnfoldVertical}
    />

    <!-- Directions -->
    <PreviewSection
        title="Directions"
        description="Supports vertical lists, horizontal carousels, and 2D scroll containers."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Vertical (Default)" bg="elevation-1" class="h-64">
                <div
                    class="w-full h-full overflow-y-auto flex flex-col gap-2 p-3"
                    {@attach scrollFade({ size: "md" })}
                >
                    {#each verticalItems as item (item)}
                        <div
                            class="px-3.5 py-2.5 rounded-xl bg-elevation-2/70 text-xs font-500 text-strong shrink-0 shadow-2xs"
                        >
                            {item}
                        </div>
                    {/each}
                </div>
            </PreviewCard>

            <PreviewCard label="Horizontal" bg="elevation-1" class="h-64">
                <div class="w-full h-full flex flex-col justify-center gap-3">
                    <span class="text-[11px] text-weak px-3">Scroll horizontally:</span>
                    <div
                        class="w-full overflow-x-auto flex gap-2 p-3"
                        {@attach scrollFade({ direction: "horizontal", size: "md" })}
                    >
                        {#each horizontalTags as tag (tag)}
                            <div
                                class="px-3.5 py-2 rounded-xl bg-elevation-2/70 text-xs font-500 text-strong shrink-0 shadow-2xs whitespace-nowrap"
                            >
                                {tag}
                            </div>
                        {/each}
                    </div>
                </div>
            </PreviewCard>

            <PreviewCard label="Both Axes (2D)" bg="elevation-1" class="h-64">
                <div
                    class="w-full h-full overflow-auto p-3"
                    {@attach scrollFade({ direction: "both", size: "md" })}
                >
                    <div class="grid grid-cols-4 gap-2 w-[340px]">
                        {#each Array.from({ length: 20 }) as _, i (i)}
                            <div
                                class="h-14 rounded-xl bg-elevation-2/70 text-xs font-500 text-weak flex-center shadow-2xs"
                            >
                                #{i + 1}
                            </div>
                        {/each}
                    </div>
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Size Presets -->
    <PreviewSection
        title="Size Presets"
        description="Choose semantic presets (sm: 24px, md: 40px, lg: 64px) or custom pixel numbers."
    >
        <PreviewGrid cols={3}>
            <PreviewCard label="Compact (sm: 24px)" bg="elevation-1" class="h-56">
                <div
                    class="w-full h-full overflow-y-auto flex flex-col gap-1.5 p-3"
                    {@attach scrollFade({ size: "sm" })}
                >
                    {#each verticalItems.slice(0, 7) as item (item)}
                        <div
                            class="px-3 py-2 rounded-lg bg-elevation-2/70 text-xs font-500 text-strong shrink-0"
                        >
                            {item}
                        </div>
                    {/each}
                </div>
            </PreviewCard>

            <PreviewCard label="Standard (md: 40px)" bg="elevation-1" class="h-56">
                <div
                    class="w-full h-full overflow-y-auto flex flex-col gap-1.5 p-3"
                    {@attach scrollFade({ size: "md" })}
                >
                    {#each verticalItems.slice(0, 7) as item (item)}
                        <div
                            class="px-3 py-2 rounded-lg bg-elevation-2/70 text-xs font-500 text-strong shrink-0"
                        >
                            {item}
                        </div>
                    {/each}
                </div>
            </PreviewCard>

            <PreviewCard label="Prominent (lg: 64px)" bg="elevation-1" class="h-56">
                <div
                    class="w-full h-full overflow-y-auto flex flex-col gap-1.5 p-3"
                    {@attach scrollFade({ size: "lg" })}
                >
                    {#each verticalItems.slice(0, 7) as item (item)}
                        <div
                            class="px-3 py-2 rounded-lg bg-elevation-2/70 text-xs font-500 text-strong shrink-0"
                        >
                            {item}
                        </div>
                    {/each}
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>

    <!-- Edge Targeting -->
    <PreviewSection
        title="Edge Targeting"
        description="Filter which edges fade as content is scrolled."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="Start Edge Only" bg="elevation-1" class="h-56">
                <div
                    class="w-full h-full overflow-y-auto flex flex-col gap-2 p-3"
                    {@attach scrollFade({ edges: "start", size: "md" })}
                >
                    {#each verticalItems as item (item)}
                        <div
                            class="px-3.5 py-2.5 rounded-xl bg-elevation-2/70 text-xs font-500 text-strong shrink-0"
                        >
                            {item}
                        </div>
                    {/each}
                </div>
            </PreviewCard>

            <PreviewCard label="End Edge Only" bg="elevation-1" class="h-56">
                <div
                    class="w-full h-full overflow-y-auto flex flex-col gap-2 p-3"
                    {@attach scrollFade({ edges: "end", size: "md" })}
                >
                    {#each verticalItems as item (item)}
                        <div
                            class="px-3.5 py-2.5 rounded-xl bg-elevation-2/70 text-xs font-500 text-strong shrink-0"
                        >
                            {item}
                        </div>
                    {/each}
                </div>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
