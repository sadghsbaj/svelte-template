<script lang="ts">
    import { onDestroy } from "svelte";

    import Floating from "$components/_system/floating/Floating.svelte";
    import type {
        FloatingContext,
        FloatingPositionResult,
    } from "$components/_system/floating/floating.types";

    import { runTooltipAnimation, waitForTooltipAnimation } from "./tooltip.animation";
    import { TOOLTIP_CONTENT_ID, tooltipState } from "./tooltip.svelte";
    import {
        tooltipLeadingStyles,
        tooltipStyles,
        tooltipTrailingStyles,
    } from "./tooltip.styles";
    import type { ActiveTooltip, TooltipPhase } from "./tooltip.types";

    let phase = $state<TooltipPhase>("closed");
    let motionElement = $state<HTMLDivElement>();
    let latestFloating: FloatingContext | null = null;
    let renderedToken = 0;
    let lifecycle = 0;
    let activeAnimation: Animation | null = null;

    const active = $derived(tooltipState.active);
    const leadingClass = tooltipLeadingStyles();
    const trailingClass = tooltipTrailingStyles();

    function cancelAnimation(): void {
        activeAnimation?.cancel();
        activeAnimation = null;
        if (motionElement) {
            motionElement.style.transformOrigin = "";
            motionElement.style.willChange = "";
        }
    }

    async function enter(token: number, floating: FloatingContext): Promise<void> {
        const current = tooltipState.active;
        if (!current || current.token !== token || !tooltipState.open || phase !== "positioning") {
            return;
        }
        const lifecycleToken = ++lifecycle;
        cancelAnimation();
        phase = "entering";
        try {
            if (motionElement) {
                activeAnimation = runTooltipAnimation(
                    motionElement,
                    "enter",
                    current.reason,
                    floating,
                    current.options.animation
                );
            }
        } catch {
            activeAnimation = null;
        }
        await waitForTooltipAnimation(activeAnimation);
        if (
            lifecycleToken !== lifecycle ||
            tooltipState.active?.token !== token ||
            !tooltipState.open
        ) {
            return;
        }
        cancelAnimation();
        phase = "open";
    }

    async function exit(token: number): Promise<void> {
        const current = tooltipState.active;
        if (!current || current.token !== token || phase === "exiting") return;
        const lifecycleToken = ++lifecycle;
        cancelAnimation();
        phase = "exiting";
        try {
            if (motionElement && latestFloating) {
                activeAnimation = runTooltipAnimation(
                    motionElement,
                    "exit",
                    current.reason,
                    latestFloating,
                    current.options.animation
                );
            }
        } catch {
            activeAnimation = null;
        }
        await waitForTooltipAnimation(activeAnimation);
        if (lifecycleToken !== lifecycle || tooltipState.active?.token !== token || tooltipState.open) {
            return;
        }
        cancelAnimation();
        phase = "closed";
        latestFloating = null;
        tooltipState.completeClose(token);
    }

    function captureFloating(floating: FloatingContext): ActiveTooltip {
        latestFloating = floating;
        const current = tooltipState.active;
        if (!current) throw new Error("Tooltip content rendered without an active tooltip");
        return current;
    }

    function handlePositionChange(result: FloatingPositionResult): void {
        const current = tooltipState.active;
        if (!current) return;
        const floating: FloatingContext = {
            ...result,
            positioned: true,
            update: latestFloating?.update ?? (() => {}),
        };
        latestFloating = floating;
        if (phase === "positioning") queueMicrotask(() => void enter(current.token, floating));
    }

    function handlePointerEnter(): void {
        if (active) tooltipState.keepOpen(active.trigger);
    }

    function handlePointerLeave(): void {
        if (active) tooltipState.requestCloseFromContent(active.trigger);
    }

    function handleWindowKeydown(event: KeyboardEvent): void {
        if (event.key === "Escape" && active) {
            tooltipState.requestClose(active.trigger, "escape", true);
        }
    }

    $effect(() => {
        const current = tooltipState.active;
        if (!current) {
            renderedToken = 0;
            phase = "closed";
            return;
        }
        const shouldOpen = tooltipState.open;

        if (renderedToken !== current.token) {
            ++lifecycle;
            cancelAnimation();
            renderedToken = current.token;
            latestFloating = null;
            phase = shouldOpen ? "positioning" : "closed";
            return;
        }

        if (!shouldOpen) {
            void exit(current.token);
        } else if (phase === "exiting" || phase === "closed") {
            ++lifecycle;
            cancelAnimation();
            phase = "positioning";
            if (latestFloating?.positioned) {
                queueMicrotask(() => void enter(current.token, latestFloating as FloatingContext));
            }
        }
    });

    onDestroy(() => {
        cancelAnimation();
        tooltipState.reset();
    });
</script>

<svelte:window onkeydown={handleWindowKeydown} />

{#if active}
    {#key active.token}
        <Floating
            anchor={active.trigger}
            placement={active.options.placement}
            offset={active.options.offset}
            padding={active.options.padding}
            flip={active.options.flip}
            shift={active.options.shift}
            onPositionChange={handlePositionChange}
        >
            {#snippet children(floating)}
                {const current = captureFloating(floating)}
                <div bind:this={motionElement}>
                    <div
                        id={TOOLTIP_CONTENT_ID}
                        role="tooltip"
                        class={tooltipStyles({
                            hasLeading: !!current.options.leading,
                            hasTrailing: !!current.options.trailing,
                        })}
                        data-tooltip-phase={phase}
                        data-placement={floating.placement}
                        onpointerenter={handlePointerEnter}
                        onpointerleave={handlePointerLeave}
                        style={!tooltipState.open ? "pointer-events:none" : ""}
                    >
                        {#if current.options.leading}
                            <span class={leadingClass} aria-hidden="true">
                                {@render current.options.leading()}
                            </span>
                        {/if}
                        <span
                            class="row-start-1 self-center font-500 text-trim {current.options
                                .leading
                                ? 'col-start-2'
                                : 'col-start-1'}"
                        >
                            {current.options.title}
                        </span>
                        {#if current.options.description}
                            <span
                                class="row-start-2 mt-3px min-w-0 font-400 opacity-75 text-pretty {current
                                    .options.leading
                                    ? 'col-start-2'
                                    : 'col-start-1'}"
                            >
                                {current.options.description}
                            </span>
                        {/if}
                        {#if current.options.trailing}
                            <span
                                class="{trailingClass} {current.options.leading
                                    ? 'col-start-3'
                                    : 'col-start-2'}"
                            >
                                {@render current.options.trailing()}
                            </span>
                        {/if}
                    </div>
                </div>
            {/snippet}
        </Floating>
    {/key}
{/if}
