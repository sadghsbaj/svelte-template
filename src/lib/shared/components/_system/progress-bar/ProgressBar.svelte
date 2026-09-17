<!--
  ProgressBar
  A minimalist, headless-ready visual progress indicator supporting both determinate
  progress updates and buttery-smooth, GPU-accelerated indeterminate animations.
  Shares track and fill styling primitives with Meter (see meter.styles.ts).
-->
<script module lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import type {
        ProgressBarFillStyleProps,
        ProgressBarTrackStyleProps,
    } from "./progress-bar.styles";

    export type ProgressBarSize = NonNullable<ProgressBarTrackStyleProps["size"]>;
    export type ProgressBarColor = NonNullable<ProgressBarFillStyleProps["color"]>;

    export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
        value?: number | null;
        min?: number;
        max?: number;
        indeterminate?: boolean;
        size?: ProgressBarSize;
        color?: ProgressBarColor;
        class?: string;
        fillClass?: string;
        element?: HTMLDivElement | null;
    }
</script>

<script lang="ts">
    import {
        progressBarFillStyles,
        progressBarTrackStyles,
    } from "./progress-bar.styles";

    let {
        value,
        min = 0,
        max = 100,
        indeterminate = false,
        size = "md",
        color = "accent",
        class: className = "",
        fillClass = "",
        element = $bindable(null),
        ...restProps
    }: ProgressBarProps = $props();

    const isIndeterminate = $derived(
        indeterminate || value === undefined || value === null
    );

    const percentage = $derived.by(() => {
        if (isIndeterminate || value === undefined || value === null) return 0;
        if (max <= min) return 0;
        const raw = ((value - min) / (max - min)) * 100;
        return Math.min(100, Math.max(0, raw));
    });

    const trackClass = $derived(
        progressBarTrackStyles({
            size,
            class: className,
        })
    );

    const fillComputedClass = $derived(
        progressBarFillStyles({
            color,
            class: fillClass,
        })
    );
</script>

<div
    bind:this={element}
    role="progressbar"
    aria-valuenow={isIndeterminate ? undefined : (value ?? undefined)}
    aria-valuemin={isIndeterminate ? undefined : min}
    aria-valuemax={isIndeterminate ? undefined : max}
    aria-busy={isIndeterminate ? "true" : undefined}
    class={trackClass}
    {...restProps}
>
    {#if isIndeterminate}
        <div
            class="{fillComputedClass} progress-indeterminate-runner"
            data-indeterminate="true"
        ></div>
    {:else}
        <div
            class="{fillComputedClass} progress-fill"
            style:width="{percentage}%"
            data-percentage={percentage}
        ></div>
    {/if}
</div>

<style>
    .progress-indeterminate-runner {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        width: 35%;
        will-change: transform;
        animation: progress-indeterminate 1.4s cubic-bezier(0.65, 0, 0.35, 1) infinite;
    }

    @keyframes progress-indeterminate {
        0% {
            transform: translateX(-100%) scaleX(0.8);
        }
        50% {
            transform: translateX(110%) scaleX(1.15);
        }
        100% {
            transform: translateX(320%) scaleX(0.8);
        }
    }
</style>
