<script module lang="ts">
    import type { HTMLAttributes } from "svelte/elements";
    import type { MeterFillStyleProps, MeterTrackStyleProps } from "./meter.styles";

    export type MeterSize = NonNullable<MeterTrackStyleProps["size"]>;
    export type MeterColor = NonNullable<MeterFillStyleProps["color"]>;

    export interface MeterProps extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
        value?: number;
        min?: number;
        max?: number;
        size?: MeterSize;
        color?: MeterColor;
        class?: string;
        fillClass?: string;
        element?: HTMLDivElement | null;
    }
</script>

<script lang="ts">
    import {
        meterFillStyles,
        meterTrackStyles,
    } from "./meter.styles";

    let {
        value = 0,
        min = 0,
        max = 100,
        size = "md",
        color = "accent",
        class: className = "",
        fillClass = "",
        element = $bindable(null),
        ...restProps
    }: MeterProps = $props();

    const percentage = $derived.by(() => {
        if (max <= min) return 0;
        const raw = ((value - min) / (max - min)) * 100;
        return Math.min(100, Math.max(0, raw));
    });

    const trackClass = $derived(
        meterTrackStyles({
            size,
            class: className,
        })
    );

    const fillComputedClass = $derived(
        meterFillStyles({
            color,
            class: fillClass,
        })
    );
</script>

<div
    bind:this={element}
    role="meter"
    aria-valuenow={value}
    aria-valuemin={min}
    aria-valuemax={max}
    class={trackClass}
    {...restProps}
>
    <div
        class="{fillComputedClass} meter-fill"
        style:width="{percentage}%"
    ></div>
</div>
