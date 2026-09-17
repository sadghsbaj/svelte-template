<script lang="ts">
    import { disableInteraction } from "$attachments";
    import { resolveHitArea, resolveHitAreaPx } from "$components";
    import { uuid } from "$utils";

    import { focusAttach } from "$core/_system/focus/focus.attach";

    import {
        sliderContainerStyles,
        sliderFillStyles,
        sliderThumbStyles,
        sliderTrackStyles,
    } from "./slider.styles";
    import type { SliderProps, SliderSize, SliderThumbShape } from "./slider.types";

    const THUMB_DIMENSIONS: Record<
        SliderThumbShape,
        Record<SliderSize, { axis: number; cross: number }>
    > = {
        circle: {
            sm: { axis: 16, cross: 16 },
            md: { axis: 20, cross: 20 },
            lg: { axis: 24, cross: 24 },
        },
        bar: {
            sm: { axis: 6, cross: 18 },
            md: { axis: 8, cross: 24 },
            lg: { axis: 10, cross: 28 },
        },
        pill: {
            sm: { axis: 24, cross: 16 },
            md: { axis: 28, cross: 20 },
            lg: { axis: 34, cross: 24 },
        },
    };

    let {
        id,
        value = $bindable(0),
        min = 0,
        max = 100,
        step = 1,
        size = "md",
        color = "accent",
        orientation = "horizontal",
        origin = "start",
        thumbShape = "circle",
        disabled = false,
        hitArea = true,
        class: className = "",
        trackClass = "",
        fillClass = "",
        thumbClass = "",
        name,
        ariaLabel,
        ariaLabelMin,
        ariaLabelMax,
        ariaDescribedby,
        element = $bindable(null),
        ...restProps
    }: SliderProps = $props();

    const isRange = $derived(Array.isArray(value));

    let valMin = $state(0);
    let valMax = $state(0);
    let activeInput = $state<"min" | "max">("min");

    let isMinHovered = $state(false);
    let isMaxHovered = $state(false);
    let isMinActive = $state(false);
    let isMaxActive = $state(false);

    const instanceId = uuid();
    const thumbIdMin = `slider-thumb-min-${instanceId}`;
    const thumbIdMax = `slider-thumb-max-${instanceId}`;

    $effect(() => {
        if (Array.isArray(value)) {
            valMin = value[0];
            valMax = value[1];
        } else {
            valMin = value;
        }
    });

    function updateValue(): void {
        value = Array.isArray(value) ? [valMin, valMax] : valMin;
    }

    const thumbConfig = $derived(THUMB_DIMENSIONS[thumbShape][size]);
    const thumbAxisPx = $derived(thumbConfig.axis);
    const thumbCrossPx = $derived(thumbConfig.cross);
    const thumbWidthPx = $derived(orientation === "horizontal" ? thumbAxisPx : thumbCrossPx);
    const thumbHeightPx = $derived(orientation === "horizontal" ? thumbCrossPx : thumbAxisPx);
    const resolvedHitAreaSize = $derived(resolveHitArea(hitArea, size));
    const touchTargetPx = $derived(
        resolvedHitAreaSize === false
            ? Math.max(thumbAxisPx, thumbCrossPx)
            : resolveHitAreaPx(resolvedHitAreaSize)
    );
    const targetWidthPx = $derived(
        resolvedHitAreaSize === false ? thumbWidthPx : Math.max(touchTargetPx, thumbWidthPx)
    );
    const targetHeightPx = $derived(
        resolvedHitAreaSize === false ? thumbHeightPx : Math.max(touchTargetPx, thumbHeightPx)
    );
    const containerCrossPx = $derived(THUMB_DIMENSIONS.circle[size].cross);
    const interactionCrossPx = $derived(
        orientation === "horizontal" ? targetHeightPx : targetWidthPx
    );
    const interactionMarginPx = $derived((containerCrossPx - interactionCrossPx) / 2);

    const pctMin = $derived(
        max > min ? Math.min(100, Math.max(0, ((valMin - min) / (max - min)) * 100)) : 0
    );
    const pctMax = $derived(
        max > min ? Math.min(100, Math.max(0, ((valMax - min) / (max - min)) * 100)) : 0
    );

    const midpoint = $derived(isRange ? (pctMin + pctMax) / 2 : 50);

    const posMin = $derived(`calc(${pctMin}% + (0.5 - ${pctMin / 100}) * ${thumbAxisPx}px)`);
    const posMax = $derived(`calc(${pctMax}% + (0.5 - ${pctMax / 100}) * ${thumbAxisPx}px)`);

    const rangeStyle = $derived.by(() => {
        if (orientation === "horizontal") {
            if (isRange) {
                return `left: ${posMin}; width: calc(${posMax} - ${posMin}); top: 0; bottom: 0;`;
            }
            if (origin === "center") {
                return pctMin >= 50
                    ? `left: 50%; width: calc(${posMin} - 50%); top: 0; bottom: 0;`
                    : `left: ${posMin}; width: calc(50% - ${posMin}); top: 0; bottom: 0;`;
            }
            return `left: 0; width: ${posMin}; top: 0; bottom: 0;`;
        }

        // Vertical
        if (isRange) {
            return `bottom: ${posMin}; height: calc(${posMax} - ${posMin}); left: 0; right: 0;`;
        }
        if (origin === "center") {
            return pctMin >= 50
                ? `bottom: 50%; height: calc(${posMin} - 50%); left: 0; right: 0;`
                : `bottom: ${posMin}; height: calc(50% - ${posMin}); left: 0; right: 0;`;
        }
        return `bottom: 0; height: ${posMin}; left: 0; right: 0;`;
    });

    const targetMinStyle = $derived(
        orientation === "horizontal"
            ? `left: calc(${posMin} - ${targetWidthPx / 2}px); top: 50%; translate: 0 -50%;`
            : `bottom: calc(${posMin} - ${targetHeightPx / 2}px); left: 50%; translate: -50% 0;`
    );

    const targetMaxStyle = $derived(
        orientation === "horizontal"
            ? `left: calc(${posMax} - ${targetWidthPx / 2}px); top: 50%; translate: 0 -50%;`
            : `bottom: calc(${posMax} - ${targetHeightPx / 2}px); left: 50%; translate: -50% 0;`
    );

    const containerComputedClass = $derived(
        sliderContainerStyles({
            orientation,
            size,
            class: className,
        })
    );

    const trackComputedClass = $derived(
        sliderTrackStyles({
            orientation,
            size,
            class: trackClass,
        })
    );

    const fillComputedClass = $derived(
        sliderFillStyles({
            color,
            class: fillClass,
        })
    );

    const thumbComputedClass = $derived(
        sliderThumbStyles({
            shape: thumbShape,
            size,
            orientation,
            color,
            class: thumbClass,
        })
    );

    function roundToStep(val: number): number {
        const stepDecimals = (step.toString().split(".", 2)[1] || "").length;
        const factor = Math.pow(10, stepDecimals);
        return Math.round(val * factor) / factor;
    }

    function decrement(target: "min" | "max", delta: number): void {
        if (target === "min") {
            const next = roundToStep(Math.max(min, valMin - delta));
            valMin = isRange ? Math.min(next, valMax) : next;
        } else {
            const next = roundToStep(Math.max(min, valMax - delta));
            valMax = Math.max(valMin, next);
        }
        updateValue();
    }

    function increment(target: "min" | "max", delta: number): void {
        if (target === "min") {
            const next = roundToStep(Math.min(max, valMin + delta));
            valMin = isRange ? Math.min(next, valMax) : next;
        } else {
            const next = roundToStep(Math.min(max, valMax + delta));
            valMax = Math.min(max, Math.max(valMin, next));
        }
        updateValue();
    }

    function setValue(target: "min" | "max", val: number): void {
        if (target === "min") {
            valMin = isRange ? Math.min(val, valMax) : val;
        } else {
            valMax = Math.max(valMin, val);
        }
        updateValue();
    }

    function handleKeyDown(e: KeyboardEvent, target: "min" | "max"): void {
        if (disabled) return;

        if (orientation === "vertical") {
            switch (e.key) {
                case "ArrowDown":
                case "ArrowLeft": {
                    e.preventDefault();
                    decrement(target, step);
                    break;
                }
                case "ArrowUp":
                case "ArrowRight": {
                    e.preventDefault();
                    increment(target, step);
                    break;
                }
                case "PageDown": {
                    e.preventDefault();
                    decrement(target, step * 10);
                    break;
                }
                case "PageUp": {
                    e.preventDefault();
                    increment(target, step * 10);
                    break;
                }
                case "Home": {
                    e.preventDefault();
                    setValue(target, min);
                    break;
                }
                case "End": {
                    e.preventDefault();
                    setValue(target, max);
                    break;
                }
            }
        }
    }

    let isDragging = $state(false);
    let dragStartValue = 0;
    let dragStartPos = 0;
    let dragCaptureElement: HTMLElement | null = null;

    function handlePointerDown(e: PointerEvent): void {
        if (disabled || e.button !== 0 || !element) return;

        e.preventDefault();

        updateActiveInput(e.clientX, e.clientY);

        const targetEl = e.target as HTMLElement | null;
        const thumbTarget = targetEl?.closest<HTMLElement>("[data-slider-thumb]") ?? null;
        const hitMinThumb = thumbTarget?.dataset.sliderThumb === "min";
        const hitMaxThumb = isRange && thumbTarget?.dataset.sliderThumb === "max";

        if (isRange) {
            if (hitMaxThumb || isMaxHovered) {
                activeInput = "max";
            } else if (hitMinThumb || isMinHovered) {
                activeInput = "min";
            } else {
                const rect = element.getBoundingClientRect();
                const pct =
                    orientation === "horizontal"
                        ? (e.clientX - rect.left) / rect.width
                        : (rect.bottom - e.clientY) / rect.height;
                const clickVal = min + Math.min(1, Math.max(0, pct)) * (max - min);
                activeInput =
                    Math.abs(clickVal - valMin) <= Math.abs(clickVal - valMax) ? "min" : "max";
            }
        } else {
            activeInput = "min";
        }

        isMinActive = activeInput === "min";
        isMaxActive = activeInput === "max";
        isDragging = true;

        const isHoveringThumb =
            hitMinThumb ||
            hitMaxThumb ||
            (isRange && activeInput === "max" ? isMaxHovered : isMinHovered);

        const rect = element.getBoundingClientRect();
        const totalPx = orientation === "horizontal" ? rect.width : rect.height;

        if (!isHoveringThumb) {
            const offset =
                orientation === "horizontal" ? e.clientX - rect.left : rect.bottom - e.clientY;
            const pct = offset / totalPx;
            const clampedPct = Math.min(1, Math.max(0, pct));
            const jumpedValue = roundToStep(min + clampedPct * (max - min));
            setValue(activeInput, jumpedValue);
            dragStartValue = jumpedValue;
        } else {
            dragStartValue = activeInput === "min" ? valMin : valMax;
        }

        dragStartPos = orientation === "horizontal" ? e.clientX : e.clientY;

        dragCaptureElement = thumbTarget ?? element;
        try {
            dragCaptureElement.setPointerCapture(e.pointerId);
        } catch {
            // ignore in environments without pointer capture
        }

        const handleWindowPointerUp = (upEvent: PointerEvent): void => {
            if (upEvent.pointerId !== e.pointerId) return;
            handlePointerUp(upEvent);
            window.removeEventListener("pointerup", handleWindowPointerUp);
            window.removeEventListener("pointercancel", handleWindowPointerUp);
        };
        window.addEventListener("pointerup", handleWindowPointerUp);
        window.addEventListener("pointercancel", handleWindowPointerUp);
    }

    function handlePointerUp(e: PointerEvent): void {
        if (!isDragging) return;

        isDragging = false;
        isMinActive = false;
        isMaxActive = false;

        if (dragCaptureElement?.hasPointerCapture(e.pointerId)) {
            try {
                dragCaptureElement.releasePointerCapture(e.pointerId);
            } catch {
                // ignore
            }
        }
        dragCaptureElement = null;

        updateActiveInput(e.clientX, e.clientY);
    }

    function updateActiveInput(clientX: number, clientY: number): void {
        if (!element || disabled) return;

        const rect = element.getBoundingClientRect();
        const pct =
            (orientation === "horizontal"
                ? (clientX - rect.left) / rect.width
                : (rect.bottom - clientY) / rect.height) * 100;

        const hoverValue = min + (pct / 100) * (max - min);
        const totalPx = orientation === "horizontal" ? rect.width : rect.height;
        const valRange = max - min || 1;

        const distMinPx = Math.abs(hoverValue - valMin) * (totalPx / valRange);
        const distMaxPx = isRange ? Math.abs(hoverValue - valMax) * (totalPx / valRange) : Infinity;

        const hoverRadiusPx = touchTargetPx / 2;
        isMinHovered = distMinPx <= hoverRadiusPx;
        isMaxHovered = isRange && distMaxPx <= hoverRadiusPx;

        if (isRange && !isMinActive && !isMaxActive) {
            const distMin = Math.abs(hoverValue - valMin);
            const distMax = Math.abs(hoverValue - valMax);
            activeInput = distMin < distMax ? "min" : "max";
        }
    }

    function handlePointerMove(e: PointerEvent): void {
        if (isDragging && element) {
            const rect = element.getBoundingClientRect();
            const totalPx = (orientation === "horizontal" ? rect.width : rect.height) || 1;
            const currentPos = orientation === "horizontal" ? e.clientX : e.clientY;
            const deltaPx =
                orientation === "horizontal"
                    ? currentPos - dragStartPos
                    : dragStartPos - currentPos;
            const deltaValue = (deltaPx / totalPx) * (max - min);
            const nextValue = Math.min(
                max,
                Math.max(min, roundToStep(dragStartValue + deltaValue))
            );
            setValue(activeInput, nextValue);
        }
        updateActiveInput(e.clientX, e.clientY);
    }

    function handlePointerLeave(): void {
        if (isDragging) return;
        isMinHovered = false;
        isMaxHovered = false;
    }
</script>

<div
    bind:this={element}
    class={containerComputedClass}
    class:cursor-grab={(isMinHovered || isMaxHovered) && !isMinActive && !isMaxActive}
    class:cursor-grabbing={isMinActive || isMaxActive}
    class:cursor-not-allowed={disabled}
    style:cursor={disabled
        ? "not-allowed"
        : isMinActive || isMaxActive
          ? "grabbing"
          : isMinHovered || isMaxHovered
            ? "grab"
            : undefined}
    onpointerdown={handlePointerDown}
    onpointermove={handlePointerMove}
    onpointerup={handlePointerUp}
    onpointercancel={handlePointerUp}
    onpointerleave={handlePointerLeave}
    {@attach disableInteraction({ enabled: disabled })}
    style:width={orientation === "vertical" ? `${interactionCrossPx}px` : undefined}
    style:height={orientation === "horizontal" ? `${interactionCrossPx}px` : undefined}
    style:margin-inline={orientation === "vertical" ? `${interactionMarginPx}px` : undefined}
    style:margin-block={orientation === "horizontal" ? `${interactionMarginPx}px` : undefined}
    style:--slider-touch-size="{touchTargetPx}px"
    style:--slider-thumb-width="{thumbWidthPx}px"
    style:--slider-thumb-height="{thumbHeightPx}px"
    {...restProps}
>
    {#snippet minInput()}
        <input
            id={isRange && id ? `${id}-min` : id}
            type="range"
            {min}
            {max}
            {step}
            {disabled}
            bind:value={valMin}
            onkeydown={(e) => handleKeyDown(e, "min")}
            oninput={() => {
                if (isRange) {
                    valMin = Math.min(valMin, valMax);
                }
                updateValue();
            }}
            class="slider-input slider-input-min"
            class:is-vertical={orientation === "vertical"}
            class:cursor-grab={(isMinHovered || isMaxHovered) && !isMinActive && !isMaxActive}
            class:cursor-grabbing={isMinActive || isMaxActive}
            class:pointer-events-none={disabled}
            style:cursor={disabled ? "not-allowed" : undefined}
            style:z-index={activeInput === "min" ? 12 : 11}
            style:clip-path={isRange
                ? orientation === "horizontal"
                    ? `inset(0 calc(100% - ${midpoint}%) 0 0)`
                    : `inset(0 0 calc(100% - ${midpoint}%) 0)`
                : undefined}
            name={isRange && name ? `${name}-min` : name}
            aria-label={isRange
                ? ariaLabelMin || (ariaLabel ? `${ariaLabel} (Minimum)` : "Minimum value")
                : (ariaLabel ?? "Slider")}
            aria-describedby={ariaDescribedby}
            {@attach focusAttach({ focusTarget: `#${thumbIdMin}` })}
        />
    {/snippet}

    {#snippet maxInput()}
        <input
            id={id ? `${id}-max` : undefined}
            type="range"
            {min}
            {max}
            {step}
            {disabled}
            bind:value={valMax}
            onkeydown={(e) => handleKeyDown(e, "max")}
            oninput={() => {
                valMax = Math.max(valMin, valMax);
                updateValue();
            }}
            class="slider-input slider-input-max"
            class:is-vertical={orientation === "vertical"}
            class:cursor-grab={(isMinHovered || isMaxHovered) && !isMinActive && !isMaxActive}
            class:cursor-grabbing={isMinActive || isMaxActive}
            class:pointer-events-none={disabled}
            style:cursor={disabled ? "not-allowed" : undefined}
            style:z-index={activeInput === "max" ? 12 : 11}
            style:clip-path={orientation === "horizontal"
                ? `inset(0 0 0 ${midpoint}%)`
                : `inset(${midpoint}% 0 0 0)`}
            name={name ? `${name}-max` : undefined}
            aria-label={ariaLabelMax || (ariaLabel ? `${ariaLabel} (Maximum)` : "Maximum value")}
            aria-describedby={ariaDescribedby}
            {@attach focusAttach({ focusTarget: `#${thumbIdMax}` })}
        />
    {/snippet}

    <!-- Native Inputs rendered in layout order for intuitive Tab keyboard navigation -->
    {#if isRange}
        {#if orientation === "vertical"}
            {@render maxInput()}
            {@render minInput()}
        {:else}
            {@render minInput()}
            {@render maxInput()}
        {/if}
    {:else}
        {@render minInput()}
    {/if}

    <!-- Visual Track and Range Fill -->
    <div class={trackComputedClass}>
        <div class={fillComputedClass} style={rangeStyle}></div>
    </div>

    <!-- Interactive thumb targets with centered visual thumbs -->
    <div
        class="slider-thumb-target slider-thumb-target-min"
        data-slider-thumb="min"
        style={targetMinStyle}
        style:width="{targetWidthPx}px"
        style:height="{targetHeightPx}px"
        style:z-index={activeInput === "min" ? 21 : 20}
    >
        <div
            id={thumbIdMin}
            class="{thumbComputedClass} slider-thumb slider-thumb-min"
            style:scale={isMinActive ? "1.15" : isMinHovered ? "1.08" : "1"}
        ></div>
    </div>

    {#if isRange}
        <div
            class="slider-thumb-target slider-thumb-target-max"
            data-slider-thumb="max"
            style={targetMaxStyle}
            style:width="{targetWidthPx}px"
            style:height="{targetHeightPx}px"
            style:z-index={activeInput === "max" ? 21 : 20}
        >
            <div
                id={thumbIdMax}
                class="{thumbComputedClass} slider-thumb slider-thumb-max"
                style:scale={isMaxActive ? "1.15" : isMaxHovered ? "1.08" : "1"}
            ></div>
        </div>
    {/if}
</div>

<style>
    .slider-thumb-target {
        position: absolute;
        touch-action: none;
    }

    .slider-thumb {
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        pointer-events: none;
    }

    .slider-input {
        position: absolute;
        inset: 0;
        margin: 0;
        width: 100%;
        height: 100%;
        padding: 0;
        appearance: none;
        -webkit-appearance: none;
        background: transparent;
        border: none;
        outline: none;
        box-shadow: none;
        cursor: pointer;
        touch-action: none;
        user-select: none;
    }

    .slider-input.cursor-grab,
    .slider-input.cursor-grab::-webkit-slider-runnable-track,
    .slider-input.cursor-grab::-webkit-slider-thumb,
    .slider-input.cursor-grab::-moz-range-track,
    .slider-input.cursor-grab::-moz-range-thumb {
        cursor: grab !important;
    }

    .slider-input.cursor-grabbing,
    .slider-input.cursor-grabbing::-webkit-slider-runnable-track,
    .slider-input.cursor-grabbing::-webkit-slider-thumb,
    .slider-input.cursor-grabbing::-moz-range-track,
    .slider-input.cursor-grabbing::-moz-range-thumb {
        cursor: grabbing !important;
    }

    .slider-input:disabled {
        cursor: not-allowed;
    }

    .slider-input.is-vertical {
        writing-mode: vertical-lr;
        transform: rotate(180deg);
    }

    .slider-input::-webkit-slider-runnable-track {
        background: transparent;
        border: none;
        cursor: pointer;
    }

    .slider-input::-moz-range-track {
        background: transparent;
        border: none;
        cursor: pointer;
    }

    .slider-input::-webkit-slider-thumb {
        width: var(--slider-thumb-width);
        height: var(--slider-thumb-height);
        appearance: none;
        -webkit-appearance: none;
        background: transparent;
        border: none;
        cursor: grab;
    }

    .slider-input:active:not(:disabled)::-webkit-slider-thumb,
    .slider-input.cursor-grabbing::-webkit-slider-thumb {
        cursor: grabbing;
    }

    .slider-input::-moz-range-thumb {
        width: var(--slider-thumb-width);
        height: var(--slider-thumb-height);
        appearance: none;
        background: transparent;
        border: none;
        cursor: grab;
    }

    .slider-input:active:not(:disabled)::-moz-range-thumb,
    .slider-input.cursor-grabbing::-moz-range-thumb {
        cursor: grabbing;
    }

    .slider-input:disabled::-webkit-slider-runnable-track,
    .slider-input:disabled::-webkit-slider-thumb {
        cursor: not-allowed;
    }

    .slider-input:disabled::-moz-range-track,
    .slider-input:disabled::-moz-range-thumb {
        cursor: not-allowed;
    }
</style>
