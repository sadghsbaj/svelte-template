<script module lang="ts">
    export interface VariantContext {
        spaceX: number;
        spaceY: number;
        size: number;
        crossLength: number;
    }

    export type PatternVariant = "dots" | "grid" | "crosses" | "lines" | "hexagons" | "topography";

    export const OFFSET_VARIANTS = new Set<PatternVariant>([
        "grid",
        "crosses",
        "hexagons",
        "topography",
    ]);

    export { dots, grid, crosses, lines, hexagons, topography };
</script>

{#snippet dots({ spaceX, spaceY, size }: VariantContext)}
    <circle cx={spaceX / 2} cy={spaceY / 2} r={size / 2} fill="var(--bp-final-color)" />
{/snippet}

{#snippet grid({ spaceX, spaceY, size }: VariantContext)}
    <path
        d={`M ${spaceX} 0 L 0 0 0 ${spaceY}`}
        fill="none"
        stroke="var(--bp-final-color)"
        stroke-width={size}
    />
{/snippet}

{#snippet crosses({ spaceX, spaceY, size, crossLength }: VariantContext)}
    <path
        d={`M ${spaceX / 2 - crossLength / 2} ${spaceY / 2} H ${spaceX / 2 + crossLength / 2} M ${spaceX / 2} ${spaceY / 2 - crossLength / 2} V ${spaceY / 2 + crossLength / 2}`}
        fill="none"
        stroke="var(--bp-final-color)"
        stroke-width={size}
    />
{/snippet}

{#snippet lines({ spaceX, spaceY, size }: VariantContext)}
    <path
        d={`M 0 ${spaceY / 2} L ${spaceX} ${spaceY / 2}`}
        fill="none"
        stroke="var(--bp-final-color)"
        stroke-width={size}
    />
{/snippet}

{#snippet hexagons({ spaceX, spaceY, size }: VariantContext)}
    <path
        d={`M ${spaceX / 2} 0
            L ${spaceX} ${spaceY / 6}
            V ${spaceY / 2}
            L ${spaceX / 2} ${(spaceY * 2) / 3}
            L 0 ${spaceY / 2}
            V ${spaceY / 6}
            Z
            M ${spaceX / 2} ${(spaceY * 2) / 3}
            V ${spaceY}`}
        fill="none"
        stroke="var(--bp-final-color)"
        stroke-width={size}
    />
{/snippet}

{#snippet topography({ spaceX, spaceY, size }: VariantContext)}
    <path
        d={`M 0 ${spaceY * 0.15} C ${spaceX * 0.3} ${spaceY * 0.02}, ${spaceX * 0.6} ${spaceY * 0.28}, ${spaceX} ${spaceY * 0.15}
            M 0 ${spaceY * 0.4} C ${spaceX * 0.35} ${spaceY * 0.22}, ${spaceX * 0.65} ${spaceY * 0.58}, ${spaceX} ${spaceY * 0.4}
            M 0 ${spaceY * 0.65} C ${spaceX * 0.3} ${spaceY * 0.48}, ${spaceX * 0.7} ${spaceY * 0.82}, ${spaceX} ${spaceY * 0.65}
            M 0 ${spaceY * 0.9} C ${spaceX * 0.35} ${spaceY * 0.78}, ${spaceX * 0.6} ${spaceY * 1.02}, ${spaceX} ${spaceY * 0.9}`}
        fill="none"
        stroke="var(--bp-final-color)"
        stroke-width={size}
    />
{/snippet}
