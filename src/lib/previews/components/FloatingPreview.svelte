<script module lang="ts">
    import { Move } from "@lucide/svelte";

    export const icon = Move;
</script>

<script lang="ts">
    import { Button, Floating, type FloatingPlacement, type PointAnchor } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    const placements: FloatingPlacement[] = [
        "top",
        "top-start",
        "right",
        "bottom",
        "bottom-end",
        "left",
    ];

    let placementAnchor = $state<HTMLSpanElement>();
    let placement: FloatingPlacement = $state("bottom");
    let placementOpen = $state(false);

    let scrollAnchor = $state<HTMLSpanElement>();
    let scrollOpen = $state(false);

    let boundaryElement = $state<HTMLDivElement>();
    let boundaryAnchor = $state<HTMLSpanElement>();
    let boundaryOpen = $state(false);

    let pointArea = $state<HTMLButtonElement>();
    let pointAnchor = $state<PointAnchor | null>(null);

    let resizeAnchor = $state<HTMLSpanElement>();
    let resizeOpen = $state(false);
    let expanded = $state(false);

    function placeAtPointer(event: MouseEvent): void {
        event.preventDefault();
        pointAnchor = {
            x: event.clientX,
            y: event.clientY,
            contextElement: pointArea,
        };
    }
</script>

{#snippet floatingSurface(title: string, detail: string)}
    <div class="border border-accent-500 bg-elevation-0 text-strong px-3 py-2 min-w-36">
        <div class="text-xs font-700">{title}</div>
        <div class="text-[11px] text-weak mt-0.5">{detail}</div>
    </div>
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Floating"
        description="Unstyled anchored positioning with portals, collision handling, virtual coordinates, and automatic layout updates."
        icon={Move}
    />

    <PreviewSection
        title="Placement"
        description="Attach to a real element and switch physical sides or logical alignments."
    >
        <PreviewCard label="HTMLElement anchor" bg="elevation-1" class="h-64">
            <div class="flex flex-col items-center gap-4">
                <label class="flex items-center gap-2 text-xs text-weak">
                    Placement
                    <select
                        bind:value={placement}
                        class="border border-base-300 bg-elevation-0 text-strong px-2 py-1"
                    >
                        {#each placements as option (option)}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </label>

                <span bind:this={placementAnchor} class="inline-flex">
                    <Button onclick={() => (placementOpen = !placementOpen)}>
                        {placementOpen ? "Hide floating" : "Show floating"}
                    </Button>
                </span>
            </div>
        </PreviewCard>

        {#if placementOpen}
            <Floating anchor={placementAnchor} {placement} offset={8}>
                {#snippet children(context)}
                    {@render floatingSurface("Real anchor", `resolved: ${context.placement}`)}
                {/snippet}
            </Floating>
        {/if}
    </PreviewSection>

    <PreviewSection
        title="Scroll & Overflow"
        description="The surface escapes the clipped scroll container and follows its anchor while scrolling."
    >
        <PreviewCard label="Portal through overflow" bg="elevation-1" class="h-72" padless>
            <div class="w-full h-full overflow-auto">
                <div class="h-[520px] relative p-4">
                    <div class="absolute top-64 left-1/2 -translate-x-1/2">
                        <span bind:this={scrollAnchor} class="inline-flex">
                            <Button onclick={() => (scrollOpen = !scrollOpen)}>
                                {scrollOpen ? "Close follower" : "Open follower"}
                            </Button>
                        </span>
                    </div>
                    <p class="text-xs text-weak absolute bottom-4 left-4">End of scroll area</p>
                </div>
            </div>
        </PreviewCard>

        {#if scrollOpen}
            <Floating anchor={scrollAnchor} placement="right" offset={8}>
                {#snippet children(context)}
                    {@render floatingSurface("Scroll follower", context.placement)}
                {/snippet}
            </Floating>
        {/if}
    </PreviewSection>

    <PreviewSection
        title="Flip & Shift"
        description="A small custom boundary forces the requested bottom-end placement to fit or flip."
    >
        <PreviewCard label="Custom boundary" bg="elevation-1" class="h-64">
            <div
                bind:this={boundaryElement}
                class=" bg-elevation-0/40 w-full max-w-xl h-40 relative"
            >
                <span class="text-[11px] text-weak absolute top-2 left-2">position boundary</span>
                <div class="absolute right-2 bottom-2">
                    <span bind:this={boundaryAnchor} class="inline-flex">
                        <Button size="sm" onclick={() => (boundaryOpen = !boundaryOpen)}>
                            Bottom edge
                        </Button>
                    </span>
                </div>
            </div>
        </PreviewCard>

        {#if boundaryOpen}
            <Floating
                anchor={boundaryAnchor}
                boundary={boundaryElement}
                placement="bottom-end"
                padding={8}
                offset={6}
            >
                {#snippet children(context)}
                    {@render floatingSurface(
                        "Collision result",
                        `requested: bottom-end / resolved: ${context.placement}`
                    )}
                {/snippet}
            </Floating>
        {/if}
    </PreviewSection>

    <PreviewSection
        title="Virtual Coordinates"
        description="Click or open the browser context menu anywhere in the field to create a point anchor."
    >
        <PreviewCard label="Pointer anchor" bg="elevation-1" class="h-64" padless>
            <button
                type="button"
                bind:this={pointArea}
                class="w-full h-full flex-center text-xs text-weak select-none cursor-crosshair"
                onclick={placeAtPointer}
                oncontextmenu={placeAtPointer}
            >
                Click or right-click here
            </button>
        </PreviewCard>

        {#if pointAnchor}
            {const activePoint = pointAnchor}
            <Floating anchor={activePoint} placement="right-start" offset={6}>
                {#snippet children(context)}
                    <div class="border border-accent-500 bg-elevation-0 text-strong px-3 py-2">
                        <div class="text-xs font-700">Point anchor</div>
                        <div class="text-[11px] text-weak">
                            {Math.round(activePoint.x)}, {Math.round(activePoint.y)} / {context.placement}
                        </div>
                        <button
                            type="button"
                            class="border border-base-300 px-2 py-1 text-[11px] mt-2 cursor-pointer"
                            onclick={() => (pointAnchor = null)}
                        >
                            Clear
                        </button>
                    </div>
                {/snippet}
            </Floating>
        {/if}
    </PreviewSection>

    <PreviewSection
        title="Content Resize"
        description="ResizeObserver measures changing floating content and keeps it aligned automatically."
    >
        <PreviewGrid cols={1}>
            <PreviewCard label="Dynamic surface" bg="elevation-1" class="h-56">
                <span bind:this={resizeAnchor} class="inline-flex">
                    <Button onclick={() => (resizeOpen = !resizeOpen)}>
                        {resizeOpen ? "Close dynamic floating" : "Open dynamic floating"}
                    </Button>
                </span>
            </PreviewCard>
        </PreviewGrid>

        {#if resizeOpen}
            <Floating anchor={resizeAnchor} placement="top" offset={8}>
                {#snippet children(context)}
                    <div
                        class="border border-accent-500 bg-elevation-0 text-strong px-3 py-2 {expanded
                            ? 'w-72'
                            : 'w-44'}"
                    >
                        <div class="text-xs font-700">Dynamic content</div>
                        {#if expanded}
                            <p class="text-[11px] text-weak mt-1">
                                This wider content changes the measured surface without changing the
                                anchor.
                            </p>
                        {/if}
                        <div class="text-[11px] text-weak mt-1">resolved: {context.placement}</div>
                        <button
                            type="button"
                            class="border border-base-300 px-2 py-1 text-[11px] mt-2 cursor-pointer"
                            onclick={() => (expanded = !expanded)}
                        >
                            {expanded ? "Compact" : "Expand"}
                        </button>
                    </div>
                {/snippet}
            </Floating>
        {/if}
    </PreviewSection>
</PreviewPage>
