<script lang="ts">
    import { disableInteraction } from "$attachments";
    import { HitArea, resolveHitArea } from "$components";
    import { uuid } from "$utils";

    import { focusAttach } from "$core/_system/focus/focus.attach";

    import {
        sliderContainerStyles,
        sliderFillStyles,
        sliderInputStyles,
        sliderThumbStyles,
        sliderTrackStyles,
    } from "./slider.styles";
    import type { SliderProps, SliderSize } from "./slider.types";

    const THUMB_SIZES: Record<SliderSize, number> = {
        sm: 16,
        md: 20,
        lg: 24,
    };

    const HIT_AREA_SIZES: Record<SliderSize, number> = {
        sm: 40,
        md: 44,
        lg: 48,
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

    const thumbSizePx = $derived(THUMB_SIZES[size]);
    const resolvedHitAreaSize = $derived(resolveHitArea(hitArea, size));
    const touchTargetPx = $derived(
        resolvedHitAreaSize === false
            ? thumbSizePx
            : typeof resolvedHitAreaSize === "number"
              ? resolvedHitAreaSize
              : HIT_AREA_SIZES[resolvedHitAreaSize]
    );

    const pctMin = $derived(max > min ? Math.min(100, Math.max(0, ((valMin - min) / (max - min)) * 100)) : 0);
    const pctMax = $derived(max > min ? Math.min(100, Math.max(0, ((valMax - min) / (max - min)) * 100)) : 0);

    const midpoint = $derived(isRange ? (pctMin + pctMax) / 2 : 50);

    const posMin = $derived(`calc(${pctMin}% + (0.5 - ${pctMin / 100}) * ${thumbSizePx}px)`);
    const posMax = $derived(`calc(${pctMax}% + (0.5 - ${pctMax / 100}) * ${thumbSizePx}px)`);

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

    const thumbMinStyle = $derived(
        orientation === "horizontal"
            ? `left: calc(${posMin} - ${thumbSizePx / 2}px); top: 50%; translate: 0 -50%;`
            : `bottom: calc(${posMin} - ${thumbSizePx / 2}px); left: 50%; translate: -50% 0;`
    );

    const thumbMaxStyle = $derived(
        orientation === "horizontal"
            ? `left: calc(${posMax} - ${thumbSizePx / 2}px); top: 50%; translate: 0 -50%;`
            : `bottom: calc(${posMax} - ${thumbSizePx / 2}px); left: 50%; translate: -50% 0;`
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
            size,
            color,
            class: thumbClass,
        })
    );

    const inputComputedClass = $derived(
        sliderInputStyles({
            orientation,
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

    function handlePointerDown(target: "min" | "max"): void {
        if (disabled) return;
        if (target === "min") {
            isMinActive = true;
            activeInput = "min";
        } else {
            isMaxActive = true;
            activeInput = "max";
        }

        const handlePointerUp = (): void => {
            isMinActive = false;
            isMaxActive = false;
            window.removeEventListener("pointerup", handlePointerUp);
            window.removeEventListener("pointercancel", handlePointerUp);
        };

        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
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
        updateActiveInput(e.clientX, e.clientY);
    }

    function handlePointerLeave(): void {
        isMinHovered = false;
        isMaxHovered = false;
    }
</script>

<div
    bind:this={element}
    class={containerComputedClass}
    class:cursor-grabbing={isMinActive || isMaxActive}
    class:cursor-not-allowed={disabled}
    style:cursor={disabled ? "not-allowed" : (isMinActive || isMaxActive) ? "grabbing" : undefined}
    onpointermove={handlePointerMove}
    onpointerleave={handlePointerLeave}
    {@attach disableInteraction({ enabled: disabled })}
    style:--slider-touch-size="{touchTargetPx}px"
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
            onpointerdown={() => handlePointerDown("min")}
            oninput={() => {
                if (isRange) {
                    valMin = Math.min(valMin, valMax);
                }
                updateValue();
            }}
            class="{inputComputedClass} slider-input-min"
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
            onpointerdown={() => handlePointerDown("max")}
            oninput={() => {
                valMax = Math.max(valMin, valMax);
                updateValue();
            }}
            class="{inputComputedClass} slider-input-max"
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

    <!-- Visual Thumbs -->
    <div
        id={thumbIdMin}
        class={thumbComputedClass}
        style={thumbMinStyle}
        style:scale={isMinActive ? "1.15" : isMinHovered ? "1.08" : "1"}
    >
        {#if resolvedHitAreaSize !== false}
            <HitArea size={resolvedHitAreaSize} class="pointer-events-none" />
        {/if}
    </div>

    {#if isRange}
        <div
            id={thumbIdMax}
            class={thumbComputedClass}
            style={thumbMaxStyle}
            style:scale={isMaxActive ? "1.15" : isMaxHovered ? "1.08" : "1"}
        >
            {#if resolvedHitAreaSize !== false}
                <HitArea size={resolvedHitAreaSize} class="pointer-events-none" />
            {/if}
        </div>
    {/if}
</div>
