<script lang="ts">
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { cn } from "$utils";
    import { separatorStyles } from "./separator.styles";

    export type SeparatorOrientation = "horizontal" | "vertical";
    export type SeparatorThickness = "sm" | "md" | "lg" | number | string;
    export type SeparatorColor = "base" | "accent";

    export interface SeparatorProps
        extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
        orientation?: SeparatorOrientation;
        thickness?: SeparatorThickness;
        length?: number | string;
        color?: SeparatorColor;
        rounded?: boolean;
        decorative?: boolean;
        children?: Snippet;
        class?: string;
        element?: HTMLDivElement | null;
    }

    let {
        orientation = "horizontal",
        thickness = "sm",
        length = "100%",
        color = "base",
        rounded = true,
        decorative = true,
        children,
        class: className = "",
        element = $bindable(null),
        ...restProps
    }: SeparatorProps = $props();

    const isPresetThickness = $derived(
        typeof thickness === "string" &&
            ["sm", "md", "lg"].includes(thickness)
    );

    const presetThicknessKey = $derived(
        isPresetThickness ? (thickness as "sm" | "md" | "lg") : "custom"
    );

    const customThicknessStyle = $derived.by(() => {
        if (isPresetThickness) return "";
        const val = typeof thickness === "number" ? `${thickness}px` : thickness;
        return orientation === "horizontal" ? `height: ${val};` : `width: ${val};`;
    });

    const isPartialLength = $derived(
        length !== "100%" && length !== "full" && length !== 100
    );

    const resolvedLength = $derived.by(() => {
        if (typeof length === "number") {
            return length <= 100 ? `${length}%` : `${length}px`;
        }
        return length === "full" ? "100%" : length;
    });

    const lengthStyle = $derived.by(() => {
        if (!isPartialLength) return "";
        return orientation === "horizontal"
            ? `width: ${resolvedLength};`
            : `height: ${resolvedLength};`;
    });

    const baseLineClasses = $derived(
        separatorStyles({
            orientation,
            color,
            thickness: presetThicknessKey,
            rounded,
        })
    );

    const role = $derived(decorative ? "none" : "separator");
    const ariaOrientation = $derived(orientation);

    const combinedSingleStyle = $derived(
        [
            customThicknessStyle,
            lengthStyle,
            (restProps as { style?: string }).style,
        ]
            .filter(Boolean)
            .join(" ") || undefined
    );

    const combinedWrapperStyle = $derived(
        [lengthStyle, (restProps as { style?: string }).style]
            .filter(Boolean)
            .join(" ") || undefined
    );
</script>

{#if children}
    {#if orientation === "horizontal"}
        <div
            bind:this={element}
            {role}
            aria-orientation={ariaOrientation}
            class={cn(
                "flex items-center gap-3 w-full",
                isPartialLength && "mx-auto",
                className
            )}
            style={combinedWrapperStyle}
            {...restProps}
        >
            <div
                class={cn(baseLineClasses, "flex-1 min-w-0")}
                style={customThicknessStyle || undefined}
                aria-hidden="true"
            ></div>
            <div class="shrink-0 flex items-center">
                {@render children()}
            </div>
            <div
                class={cn(baseLineClasses, "flex-1 min-w-0")}
                style={customThicknessStyle || undefined}
                aria-hidden="true"
            ></div>
        </div>
    {:else}
        <div
            bind:this={element}
            {role}
            aria-orientation={ariaOrientation}
            class={cn(
                "flex flex-col items-center gap-3 h-full self-stretch",
                isPartialLength && "my-auto",
                className
            )}
            style={combinedWrapperStyle}
            {...restProps}
        >
            <div
                class={cn(baseLineClasses, "flex-1 min-h-0")}
                style={customThicknessStyle || undefined}
                aria-hidden="true"
            ></div>
            <div class="shrink-0 flex items-center">
                {@render children()}
            </div>
            <div
                class={cn(baseLineClasses, "flex-1 min-h-0")}
                style={customThicknessStyle || undefined}
                aria-hidden="true"
            ></div>
        </div>
    {/if}
{:else}
    <div
        bind:this={element}
        {role}
        aria-orientation={ariaOrientation}
        class={cn(
            baseLineClasses,
            isPartialLength && (orientation === "horizontal" ? "mx-auto" : "my-auto"),
            className
        )}
        style={combinedSingleStyle}
        {...restProps}
    ></div>
{/if}
