<script lang="ts">
    import type { Snippet } from "svelte";
    import type { Attachment } from "svelte/attachments";
    import type { HTMLAttributes } from "svelte/elements";
    import { ChevronLeft, ChevronRight } from "@lucide/svelte";
    import {
        disableInteraction,
        rovingFocus,
        scrollFade,
        type RovingFocusActiveChangeDetail,
        type ScrollFadeDetail,
    } from "$attachments";

    import { setSegmentedControlContext } from "./segmented-control.context";
    import {
        segmentedControlStyles,
        segmentedControlTrackStyles,
        segmentedControlViewportStyles,
    } from "./segmented-control.styles";

    export type SegmentedControlLayout = "equal" | "auto";

    export interface SegmentedControlProps extends Omit<HTMLAttributes<HTMLDivElement>, "value"> {
        value: string;
        layout?: SegmentedControlLayout;
        disabled?: boolean;
        separators?: boolean;
        scrollButtons?: boolean;
        loop?: boolean;
        children?: Snippet;
        class?: string;
        element?: HTMLDivElement | null;
    }

    let {
        value = $bindable(),
        layout = "equal",
        disabled = false,
        separators = false,
        scrollButtons = false,
        loop = true,
        children,
        class: className = "",
        element = $bindable(),
        "aria-label": ariaLabel,
        "aria-labelledby": ariaLabelledby,
        "aria-describedby": ariaDescribedby,
        ...restProps
    }: SegmentedControlProps = $props();

    let viewport: HTMLDivElement | undefined = $state();
    let track: HTMLDivElement | undefined = $state();
    let indicatorX = $state(0);
    let indicatorWidth = $state(0);
    let indicatorReady = $state(false);
    let indicatorDisabled = $state(false);
    let canScrollStart = $state(false);
    let canScrollEnd = $state(false);
    let indicatorFrame: number | null = null;
    let indicatorReadyFrame: number | null = null;

    const computedClass = $derived(segmentedControlStyles({ layout, class: className }));
    const viewportClass = $derived(segmentedControlViewportStyles({ layout }));
    const trackClass = $derived(segmentedControlTrackStyles({ layout }));

    function getItems(): HTMLButtonElement[] {
        if (!track) return [];
        return [
            ...track.querySelectorAll<HTMLButtonElement>('[data-slot="segmented-control-item"]'),
        ];
    }

    function getSelectedItem(): HTMLButtonElement | undefined {
        return getItems().find((item) => item.dataset.value === value);
    }

    function updateIndicator(item: HTMLElement): void {
        if (!track) return;

        const trackRect = track.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();
        indicatorX = itemRect.left - trackRect.left;
        indicatorWidth = itemRect.width;
        indicatorDisabled = item.getAttribute("aria-disabled") === "true";

        if (!indicatorReady && indicatorReadyFrame === null) {
            indicatorReadyFrame = requestAnimationFrame(() => {
                indicatorReadyFrame = null;
                indicatorReady = true;
            });
        }
    }

    function scheduleIndicatorUpdate(_value = value, _layout = layout): void {
        if (indicatorFrame !== null) return;

        indicatorFrame = requestAnimationFrame(() => {
            indicatorFrame = null;
            if (!track) return;
            const selectedItem = getSelectedItem();
            if (!selectedItem) {
                indicatorReady = false;
                indicatorWidth = 0;
                return;
            }

            updateIndicator(selectedItem);
        });
    }

    function select(nextValue: string): void {
        if (disabled || nextValue === value) return;
        value = nextValue;
    }

    setSegmentedControlContext({
        isDisabled: () => disabled,
        isSelected: (itemValue) => value === itemValue,
        layout: () => layout,
        select,
    });

    function handleActiveChange(detail: RovingFocusActiveChangeDetail): void {
        if (detail.reason !== "keyboard") return;
        const nextValue = detail.item.dataset.value;
        if (nextValue === undefined) return;
        select(nextValue);
        updateIndicator(detail.item);
        scrollItemIntoView(detail.item);
    }

    function scrollItemIntoView(item: HTMLElement): void {
        if (!viewport) {
            item.scrollIntoView({ block: "nearest", inline: "nearest" });
            return;
        }

        const items = getItems();
        const itemIndex = items.indexOf(item as HTMLButtonElement);
        if (itemIndex === 0) {
            viewport.scrollTo({ left: 0 });
            return;
        }
        if (itemIndex === items.length - 1) {
            viewport.scrollTo({ left: Math.max(0, viewport.scrollWidth - viewport.clientWidth) });
            return;
        }

        item.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    const focusAttachment: Attachment<HTMLDivElement> = $derived.by(() => {
        const selectedValue = value;
        return rovingFocus<HTMLDivElement>({
            selector: '[data-slot="segmented-control-item"]',
            orientation: "horizontal",
            loop,
            initialItem: (_container, items) =>
                items.find((item) => item.dataset.value === selectedValue) ?? null,
            onActiveChange: handleActiveChange,
        });
    });

    function handleFadeChange(detail: ScrollFadeDetail): void {
        canScrollStart = detail.horizontal.canScrollStart;
        canScrollEnd = detail.horizontal.canScrollEnd;
    }

    const fadeAttachment = $derived(
        scrollFade({
            enabled: layout === "auto",
            direction: "horizontal",
            size: "md",
            onFadeChange: handleFadeChange,
        })
    );

    function scrollPage(direction: "start" | "end"): void {
        if (!viewport) return;
        const viewportRect = viewport.getBoundingClientRect();
        const visibleItems = getItems().filter((item) => {
            const rect = item.getBoundingClientRect();
            return rect.right > viewportRect.left && rect.left < viewportRect.right;
        });
        const edgeItem = direction === "start" ? visibleItems.at(0) : visibleItems.at(-1);
        if (!edgeItem) return;

        const edgeRect = edgeItem.getBoundingClientRect();
        const delta =
            direction === "start"
                ? edgeRect.left + edgeRect.width / 2 - viewportRect.right
                : edgeRect.left + edgeRect.width / 2 - viewportRect.left;
        const maxScrollLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
        const nextScrollLeft = Math.max(0, Math.min(viewport.scrollLeft + delta, maxScrollLeft));

        viewport.scrollTo({ left: nextScrollLeft });
    }

    $effect(() => {
        scheduleIndicatorUpdate(value, layout);
    });

    $effect(() => {
        if (!track || !viewport) return;

        const resizeObserver = new ResizeObserver(() => scheduleIndicatorUpdate());
        resizeObserver.observe(track);
        resizeObserver.observe(viewport);

        const mutationObserver = new MutationObserver(() => scheduleIndicatorUpdate());
        mutationObserver.observe(track, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: true,
            attributeFilter: ["aria-disabled", "data-state"],
        });

        return () => {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
            if (indicatorFrame !== null) cancelAnimationFrame(indicatorFrame);
            if (indicatorReadyFrame !== null) cancelAnimationFrame(indicatorReadyFrame);
            indicatorFrame = null;
            indicatorReadyFrame = null;
        };
    });
</script>

<div
    bind:this={element}
    {...restProps}
    data-slot="segmented-control"
    data-layout={layout}
    data-separators={separators ? "" : undefined}
    data-scroll-buttons={scrollButtons ? "" : undefined}
    class={computedClass}
    {@attach disableInteraction({ enabled: disabled })}
>
    {#if layout === "auto" && scrollButtons && canScrollStart}
        <button
            type="button"
            class="segmented-scroll-button segmented-scroll-start"
            aria-label="Show previous options"
            onclick={() => scrollPage("start")}
        >
            <ChevronLeft aria-hidden="true" />
        </button>
    {/if}

    <div
        bind:this={viewport}
        data-slot="segmented-control-viewport"
        data-layout={layout}
        class={viewportClass}
        {@attach fadeAttachment}
    >
        <div
            bind:this={track}
            role="radiogroup"
            aria-orientation="horizontal"
            aria-label={ariaLabel}
            aria-labelledby={ariaLabelledby}
            aria-describedby={ariaDescribedby}
            data-slot="segmented-control-track"
            class={trackClass}
            {@attach focusAttachment}
        >
            <span
                aria-hidden="true"
                data-slot="segmented-control-indicator"
                class="squircle-smooth"
                data-ready={indicatorReady ? "" : undefined}
                data-disabled={indicatorDisabled ? "" : undefined}
                style:transform={`translate3d(${indicatorX}px, 0, 0)`}
                style:width={`${indicatorWidth}px`}
            ></span>

            {@render children?.()}
        </div>
    </div>

    {#if layout === "auto" && scrollButtons && canScrollEnd}
        <button
            type="button"
            class="segmented-scroll-button segmented-scroll-end"
            aria-label="Show more options"
            onclick={() => scrollPage("end")}
        >
            <ChevronRight aria-hidden="true" />
        </button>
    {/if}
</div>

<style>
    [data-slot="segmented-control-viewport"][data-layout="equal"] {
        overflow: hidden;
    }

    [data-slot="segmented-control-viewport"][data-layout="auto"] {
        overflow-x: auto;
        overflow-y: hidden;
    }

    [data-slot="segmented-control-indicator"] {
        position: absolute;
        inset-block: 2px;
        inset-inline-start: 0;
        z-index: 0;
        background: light-dark(white, var(--color-base-700));
        border-radius: 9999px;
        box-shadow: var(--shadow-sm);
        opacity: 0;
        pointer-events: none;
    }

    [data-slot="segmented-control-indicator"][data-ready] {
        opacity: 1;
        transition:
            transform 200ms var(--ease-cubic-out),
            width 200ms var(--ease-cubic-out);
    }

    [data-slot="segmented-control-indicator"][data-disabled] {
        opacity: 0.5;
    }

    :global(
        [data-slot="segmented-control"][data-separators]
            [data-slot="segmented-control-item"]:not(:first-of-type)::before
    ) {
        content: "";
        position: absolute;
        inset-block-start: 25%;
        inset-inline-start: 0;
        width: 1px;
        height: 50%;
        background: light-dark(rgb(0 0 0 / 10%), rgb(255 255 255 / 12%));
        border-radius: 9999px;
        translate: -50% 0;
        pointer-events: none;
    }

    :global(
        [data-slot="segmented-control"][data-separators]
            [data-slot="segmented-control-item"][data-state="active"]::before
    ),
    :global(
        [data-slot="segmented-control"][data-separators]
            [data-slot="segmented-control-item"][data-state="active"]
            + [data-slot="segmented-control-item"]::before
    ) {
        opacity: 0;
    }

    .segmented-scroll-button {
        position: absolute;
        inset-block-start: 50%;
        z-index: 3;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 28px;
        color: var(--color-text-main);
        background: transparent;
        translate: 0 -50%;
        transition: color 160ms var(--ease-cubic-out);
        cursor: pointer;
    }

    .segmented-scroll-button:hover {
        color: var(--color-text-strong);
    }

    .segmented-scroll-button :global(svg) {
        width: 16px;
        height: 16px;
        stroke-width: 2.25;
    }

    .segmented-scroll-start {
        inset-inline-start: 0;
    }

    .segmented-scroll-end {
        inset-inline-end: 0;
    }
</style>
