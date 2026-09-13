<script module lang="ts">
    import { PanelTopOpen } from "@lucide/svelte";

    export const icon = PanelTopOpen;
</script>

<script lang="ts">
    import {
        Popover,
        type PopoverAnimation,
        type PopoverChangeDetail,
        type PopoverContentContext,
    } from "$components";

    import PreviewCard from "$lib/previews/ui/PreviewCard.svelte";
    import PreviewGrid from "$lib/previews/ui/PreviewGrid.svelte";
    import PreviewHeader from "$lib/previews/ui/PreviewHeader.svelte";
    import PreviewPage from "$lib/previews/ui/PreviewPage.svelte";
    import PreviewSection from "$lib/previews/ui/PreviewSection.svelte";

    const triggerClass =
        "border border-base-300 bg-elevation-0 text-strong px-3 py-2 rounded-xl text-xs font-600 cursor-pointer hover:bg-elevation-2 t:(bg-160-quad-out scale-160-quad-out) active:scale-97";
    const surfaceClass =
        "border border-base-300 bg-elevation-0 text-strong rounded-2xl shadow-xl p-4 w-64";
    const placements = ["top", "right", "bottom", "left"] as const;

    let controlledOpen = $state(false);
    let controlledAnchor = $state<HTMLButtonElement>();
    let controlledReason = $state("none");
    let modalOpen = $state(false);
    let parentOpen = $state(false);
    let childOpen = $state(false);

    const revealAnimation: PopoverAnimation = (element, context) => {
        if (context.reducedMotion) return null;
        const entering = context.phase === "enter";
        const closedFrame = {
            opacity: 0,
            clipPath: "inset(0 0 88% 0 round 16px)",
            transform: "translateY(-3px) scale(.985)",
        };
        const openFrame = {
            opacity: 1,
            clipPath: "inset(0 0 0 0 round 16px)",
            transform: "translateY(0) scale(1)",
        };

        return element.animate(entering ? [closedFrame, openFrame] : [openFrame, closedFrame], {
            duration: entering ? 240 : 150,
            easing: entering ? "cubic-bezier(.16, 1, .3, 1)" : "cubic-bezier(.4, 0, 1, 1)",
            fill: "both",
        });
    };

    function recordControlledChange(open: boolean, detail: PopoverChangeDetail): void {
        controlledOpen = open;
        controlledReason = detail.reason;
    }
</script>

{#snippet phaseLabel(context: PopoverContentContext)}
    <div class="text-[11px] text-weak mt-2">
        {context.phase} / {context.placement}
    </div>
{/snippet}

<PreviewPage>
    <PreviewHeader
        title="Popover"
        description="Interactive floating overlays with trigger ARIA, dismissal, focus lifecycle, nesting, and placement-aware motion."
        icon={PanelTopOpen}
    />

    <PreviewSection
        title="Default Behavior"
        description="Click the trigger, press Escape, or click outside. Keyboard opening moves focus into the panel and restores it on close."
    >
        <PreviewCard label="Trigger + dismissal" bg="elevation-1" class="h-64">
            <Popover placement="bottom" offset={8} aria-label="Default popover">
                {#snippet trigger(context)}
                    <button type="button" class={triggerClass} {@attach context.attachment}>
                        Open popover
                    </button>
                {/snippet}

                {#snippet children(context)}
                    <div class={surfaceClass}>
                        <div class="text-sm font-700">Default popover</div>
                        <p class="text-xs text-weak mt-1">
                            Outside pointer and Escape are enabled. The trigger owns the ARIA state.
                        </p>
                        <div class="flex gap-2 mt-3">
                            <button type="button" class={triggerClass}>Focusable action</button>
                            <button
                                type="button"
                                class={triggerClass}
                                onclick={() => context.close("programmatic")}>Close</button
                            >
                        </div>
                        {@render phaseLabel(context)}
                    </div>
                {/snippet}
            </Popover>
        </PreviewCard>
    </PreviewSection>

    <PreviewSection
        title="Placement-Aware Motion"
        description="The default translation and transform origin follow the resolved side, including automatic flips."
    >
        <PreviewGrid cols={4}>
            {#each placements as placement (placement)}
                <PreviewCard label={placement} bg="elevation-1" class="h-44">
                    <Popover {placement} offset={8} aria-label={`${placement} popover`}>
                        {#snippet trigger(context)}
                            <button type="button" class={triggerClass} {@attach context.attachment}>
                                {placement}
                            </button>
                        {/snippet}
                        {#snippet children(context)}
                            <div
                                class="border border-accent-500 bg-elevation-0 text-strong p-3 w-44"
                            >
                                <div class="text-xs font-700">Requested: {placement}</div>
                                <div class="text-[11px] text-weak">
                                    Resolved: {context.placement}
                                </div>
                            </div>
                        {/snippet}
                    </Popover>
                </PreviewCard>
            {/each}
        </PreviewGrid>
    </PreviewSection>

    <PreviewSection
        title="Controlled State"
        description="A Popover may use an external anchor and bindable state without rendering a trigger snippet."
    >
        <PreviewCard label="Programmatic anchor" bg="elevation-1" class="h-56">
            <div class="flex flex-col items-center gap-3">
                <button
                    type="button"
                    bind:this={controlledAnchor}
                    class={triggerClass}
                    onclick={() => (controlledOpen = !controlledOpen)}
                >
                    {controlledOpen ? "Close externally" : "Open externally"}
                </button>
                <span class="text-[11px] text-weak">last reason: {controlledReason}</span>
            </div>

            <Popover
                bind:open={controlledOpen}
                anchor={controlledAnchor}
                placement="right"
                offset={8}
                onOpenChange={recordControlledChange}
                aria-label="Controlled popover"
            >
                {#snippet children(context)}
                    <div class={surfaceClass}>
                        <div class="text-sm font-700">Externally controlled</div>
                        <p class="text-xs text-weak mt-1">
                            This instance has no automatic trigger attachment.
                        </p>
                        <button
                            type="button"
                            class={`${triggerClass} mt-3`}
                            onclick={() => context.close("programmatic")}>Close from context</button
                        >
                    </div>
                {/snippet}
            </Popover>
        </PreviewCard>
    </PreviewSection>

    <PreviewSection
        title="Modal Focus"
        description="Modal mode traps focus, marks the application inert, blocks scrolling, and restores focus after closing."
    >
        <PreviewCard label="Modal popover" bg="elevation-1" class="h-56">
            <Popover
                bind:open={modalOpen}
                modal
                placement="bottom"
                initialFocus="#preview-modal-name"
                aria-label="Modal settings"
            >
                {#snippet trigger(context)}
                    <button type="button" class={triggerClass} {@attach context.attachment}>
                        Open modal popover
                    </button>
                {/snippet}
                {#snippet children(context)}
                    <div class={`${surfaceClass} w-72`}>
                        <label class="text-xs font-600" for="preview-modal-name">Display name</label
                        >
                        <input
                            id="preview-modal-name"
                            class="border border-base-300 bg-elevation-1 text-strong px-3 py-2 w-full mt-1"
                            value="Popover user"
                        />
                        <div class="flex justify-end mt-3">
                            <button
                                type="button"
                                class={triggerClass}
                                onclick={() => context.close("programmatic")}>Done</button
                            >
                        </div>
                    </div>
                {/snippet}
            </Popover>
        </PreviewCard>
    </PreviewSection>

    <PreviewSection
        title="Nested Stack"
        description="The child is logically attached to its parent despite both panels living in the shared floating portal."
    >
        <PreviewCard label="Parent + child" bg="elevation-1" class="h-56">
            <Popover bind:open={parentOpen} placement="right" aria-label="Parent popover">
                {#snippet trigger(context)}
                    <button type="button" class={triggerClass} {@attach context.attachment}>
                        Open parent
                    </button>
                {/snippet}
                {#snippet children(parentContext)}
                    <div class={surfaceClass}>
                        <div class="text-sm font-700">Parent layer</div>
                        <p class="text-xs text-weak mt-1">
                            Opening the child keeps this branch active.
                        </p>

                        <Popover
                            bind:open={childOpen}
                            placement="right-start"
                            aria-label="Child popover"
                        >
                            {#snippet trigger(context)}
                                <button
                                    type="button"
                                    class={`${triggerClass} mt-3`}
                                    {@attach context.attachment}>Open child</button
                                >
                            {/snippet}
                            {#snippet children(context)}
                                <div
                                    class="border border-accent-500 bg-elevation-0 text-strong p-3 w-48"
                                >
                                    <div class="text-xs font-700">Nested child</div>
                                    <p class="text-[11px] text-weak mt-1">
                                        Escape closes this child before the parent.
                                    </p>
                                    <button
                                        type="button"
                                        class={`${triggerClass} mt-3`}
                                        onclick={() => context.close("programmatic")}
                                        >Close child</button
                                    >
                                </div>
                            {/snippet}
                        </Popover>

                        <button
                            type="button"
                            class={`${triggerClass} mt-2`}
                            onclick={() => parentContext.close("programmatic")}>Close parent</button
                        >
                    </div>
                {/snippet}
            </Popover>
        </PreviewCard>
    </PreviewSection>

    <PreviewSection
        title="Custom WAAPI"
        description="The default motion can be disabled or replaced by one typed runner while Popover still owns presence and cleanup."
    >
        <PreviewGrid cols={2}>
            <PreviewCard label="No animation" bg="elevation-1" class="h-48">
                <Popover animation="none" aria-label="Instant popover">
                    {#snippet trigger(context)}
                        <button type="button" class={triggerClass} {@attach context.attachment}>
                            Instant
                        </button>
                    {/snippet}
                    {#snippet children(context)}
                        <div class="border border-base-300 bg-elevation-0 text-strong p-3 w-44">
                            <div class="text-xs font-700">No animation</div>
                            {@render phaseLabel(context)}
                        </div>
                    {/snippet}
                </Popover>
            </PreviewCard>

            <PreviewCard label="Clip reveal runner" bg="elevation-1" class="h-48">
                <Popover animation={revealAnimation} aria-label="Custom animated popover">
                    {#snippet trigger(context)}
                        <button type="button" class={triggerClass} {@attach context.attachment}>
                            Custom reveal
                        </button>
                    {/snippet}
                    {#snippet children(context)}
                        <div class="border border-accent-500 bg-elevation-0 text-strong p-3 w-48">
                            <div class="text-xs font-700">Custom WAAPI</div>
                            <p class="text-[11px] text-weak mt-1">
                                A specialized clip reveal supplied by the consumer.
                            </p>
                            {@render phaseLabel(context)}
                        </div>
                    {/snippet}
                </Popover>
            </PreviewCard>
        </PreviewGrid>
    </PreviewSection>
</PreviewPage>
