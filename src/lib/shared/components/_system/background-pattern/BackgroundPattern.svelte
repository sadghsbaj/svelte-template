<script lang="ts">
    import type { SVGAttributes } from "svelte/elements";
    import { cn, randomString } from "$utils";

    import * as variants from "./pattern-variants.snippets.svelte";
    import {
        OFFSET_VARIANTS,
        type PatternVariant,
        type VariantContext,
    } from "./pattern-variants.snippets.svelte";

    interface Props extends SVGAttributes<SVGSVGElement> {
        variant?: PatternVariant;
        spacing?: number;
        size?: number;
        color?: string;
        opacity?: number;
        darkColor?: string;
        darkOpacity?: number;
        class?: string;
    }

    // Perceptually balanced default sizes per variant (fallback is 1)
    const DEFAULT_VARIANT_SIZES: Partial<Record<PatternVariant, number>> = {
        dots: 2,
    };

    let {
        variant = "dots",
        spacing = 24,
        size,
        color,
        opacity,
        darkColor,
        darkOpacity,
        class: className,
        ...restProps
    }: Props = $props();

    // Resolves optical stroke or radius size with fallback map
    let resolvedSize = $derived(size ?? DEFAULT_VARIANT_SIZES[variant] ?? 1);

    // Generates a unique ID per instance so multiple patterns don't collide in the DOM
    const patternId = `background-pattern-${randomString(7)}`;

    // Live dimensions of the SVG container container to calculate perfect sub-pixel edge fitting
    let containerWidth = $state(0);
    let containerHeight = $state(0);

    /*
       DYNAMIC SPACE RESOLVERS (EMULATING CSS 'ROUND' REPEAT):
       Divides the container's actual pixel size by an adjusted integer count of tiles.
       FIX: For hexagons, we lock the vertical axis to the exact mathematical square root of 3 (1.7320508).
       This guarantees that the hexagons interlock perfectly like gears without distorting.
    */
    let perfectSpaceX = $derived(
        containerWidth > 0 ? containerWidth / (Math.round(containerWidth / spacing) || 1) : spacing
    );
    let perfectSpaceY = $derived(
        variant === "hexagons"
            ? perfectSpaceX * 1.7320508
            : containerHeight > 0
              ? containerHeight / (Math.round(containerHeight / spacing) || 1)
              : spacing
    );

    // Guarantees the cross length is always at least 2.5x the line thickness (size),
    // preventing crosshairs from collapsing into solid squares.
    let crossLength = $derived(
        Math.max(resolvedSize * 2.5, Math.min(spacing * 0.25, spacing - resolvedSize))
    );

    // Offsets
    let isOffset = $derived(OFFSET_VARIANTS.has(variant));
    let offsetX = $derived(isOffset ? perfectSpaceX / 2 : 0);
    let offsetY = $derived(isOffset ? perfectSpaceY / 2 : 0);

    // Bundles all values in a type-safe manner for the rendered snippet
    let variantContext = $derived<VariantContext>({
        spaceX: perfectSpaceX,
        spaceY: perfectSpaceY,
        size: resolvedSize,
        crossLength,
    });
</script>

<svg
    bind:clientWidth={containerWidth}
    bind:clientHeight={containerHeight}
    class={cn("background-pattern", className)}
    style:--bp-space={spacing !== undefined ? `${spacing}px` : undefined}
    style:--bp-size={`${resolvedSize}px`}
    style:--bp-color={color !== undefined ? color : undefined}
    style:--bp-opacity={opacity !== undefined ? `${opacity}%` : undefined}
    style:--bp-dark-color={darkColor !== undefined ? darkColor : undefined}
    style:--bp-dark-opacity={darkOpacity !== undefined ? `${darkOpacity}%` : undefined}
    aria-hidden="true"
    {...restProps}
>
    <defs>
        <pattern
            id={patternId}
            width={perfectSpaceX}
            height={perfectSpaceY}
            patternUnits="userSpaceOnUse"
            x={offsetX}
            y={offsetY}
        >
            {@render variants[variant](variantContext)}
        </pattern>
    </defs>

    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
</svg>

<style>
    /*
        ===========================================================================
        PARENT LAYOUT CONTAINMENT
        ===========================================================================
        Enforces layout containment on the immediate parent element containing the pattern.
        Using `contain: layout` acts as a modern positioning anchor, bypassing the need
        to manually force `position: relative` (which is highly error-prone, annoying to maintain,
        and potentially destructive if the parent relies on flex, grid, or strict layouts).
    */
    :global(:has(> .background-pattern)) {
        contain: layout;
    }

    /*
        ===========================================================================
        BASE PATTERN LAYER & LIGHT MODE BLENDING ENGINE
        ===========================================================================
        Sets up the absolute spatial boundaries and orchestrates the multi-tier
        cascading theme and fallback logic for Light Mode.
    */
    .background-pattern {
        --bp-theme-color: black;
        --bp-fallback-opacity: 7%;
        --bp-final-color: color-mix(
            in srgb,
            var(--bp-color, var(--bp-theme-color)) var(--bp-opacity, var(--bp-fallback-opacity)),
            transparent
        );

        position: absolute;
        inset: var(--bp-layout-inset, 0px);
        z-index: -1;

        /* Ensures the SVG canvas behaves as a block and spans properly */
        display: block;
        width: 100%;
        height: 100%;
        border-radius: inherit;
        pointer-events: none;
    }

    /*
        ===========================================================================
        DARK MODE CONFIGURATION OVERRIDES
        ===========================================================================
        Swaps core tokens and re-evaluates the resolution chains with native
        Dark Mode defaults and separate multi-tier dark props.
    */
    :global([data-theme="dark"]) .background-pattern {
        --bp-theme-color: white;
        --bp-fallback-opacity: 4%;
        --bp-final-color: color-mix(
            in srgb,
            var(--bp-dark-color, var(--bp-color, var(--bp-theme-color)))
                var(--bp-dark-opacity, var(--bp-opacity, var(--bp-fallback-opacity))),
            transparent
        );
    }
</style>
