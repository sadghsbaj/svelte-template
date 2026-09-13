<script lang="ts">
    import { portalToLayer } from "$core/_system/layout/app-layer/layer.svelte";

    import { autoUpdateFloating } from "./floating.auto-update";
    import {
        computeFloatingPosition,
        normalizeFloatingRect,
        pointToFloatingRect,
    } from "./floating.geometry";
    import type {
        FloatingAnchorValue,
        FloatingContext,
        FloatingDirection,
        FloatingPositionResult,
        FloatingProps,
        FloatingRect,
        PointAnchor,
        VirtualAnchor,
    } from "./floating.types";

    let {
        anchor,
        placement = "bottom",
        offset = 0,
        padding = 8,
        flip = true,
        shift = true,
        boundary = "viewport",
        direction = "auto",
        trackPosition = false,
        hideUntilPositioned = true,
        element = $bindable(),
        onPositionChange,
        onPositionError,
        children,
        class: className = "",
        style = "",
        ...restProps
    }: FloatingProps = $props();

    const EMPTY_RECT: FloatingRect = {
        x: 0,
        y: 0,
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 0,
        height: 0,
    };

    let result = $state<FloatingPositionResult>({
        x: 0,
        y: 0,
        placement: "bottom",
        side: "bottom",
        alignment: "center",
        availableWidth: 0,
        availableHeight: 0,
        anchorRect: EMPTY_RECT,
        floatingRect: EMPTY_RECT,
        boundaryRect: EMPTY_RECT,
    });
    let positioned = $state(false);
    let requestUpdate = (): void => {};

    const floatingLayerAttach = portalToLayer("floating");
    const context = $derived<FloatingContext>({
        ...result,
        positioned,
        update: (): void => {
            requestUpdate();
        },
    });
    const geometryVariables = $derived(
        positioned
            ? `--floating-anchor-width:${result.anchorRect.width}px;` +
                  `--floating-anchor-height:${result.anchorRect.height}px;` +
                  `--floating-available-width:${result.availableWidth}px;` +
                  `--floating-available-height:${result.availableHeight}px;` +
                  `--floating-x:${result.x}px;--floating-y:${result.y}px;`
            : ""
    );
    const internalStyle = $derived(
        `${style ? `${style};` : ""}position:fixed;left:${result.x}px;top:${result.y}px;` +
            `pointer-events:auto;visibility:${hideUntilPositioned && !positioned ? "hidden" : "visible"};` +
            geometryVariables
    );

    const resolveAnchor = (): FloatingAnchorValue | null => {
        const value = typeof anchor === "function" ? anchor() : anchor;
        return value ?? null;
    };

    const isVirtualAnchor = (value: FloatingAnchorValue): value is VirtualAnchor =>
        "getBoundingClientRect" in value;

    const isElementAnchor = (value: FloatingAnchorValue): value is HTMLElement =>
        typeof HTMLElement !== "undefined" && value instanceof HTMLElement;

    const readAnchorRect = (value: FloatingAnchorValue): FloatingRect =>
        isVirtualAnchor(value)
            ? normalizeFloatingRect(value.getBoundingClientRect())
            : pointToFloatingRect(value as PointAnchor);

    const getContextElement = (value: FloatingAnchorValue): Element | null =>
        isElementAnchor(value) ? value : (value.contextElement ?? null);

    const resolveDirection = (
        value: FloatingAnchorValue,
        requestedDirection: FloatingDirection
    ): "ltr" | "rtl" => {
        if (requestedDirection !== "auto") return requestedDirection;
        const contextElement = getContextElement(value);
        const resolved = getComputedStyle(contextElement ?? document.documentElement).direction;
        return resolved === "rtl" ? "rtl" : "ltr";
    };

    const readBoundaryRect = (target: "viewport" | HTMLElement): FloatingRect => {
        if (target !== "viewport") {
            const rect = target.getBoundingClientRect();
            return normalizeFloatingRect({
                x: rect.left + target.clientLeft,
                y: rect.top + target.clientTop,
                width: target.clientWidth,
                height: target.clientHeight,
            });
        }
        const viewport = window.visualViewport;
        return normalizeFloatingRect({
            x: viewport?.offsetLeft ?? 0,
            y: viewport?.offsetTop ?? 0,
            width: viewport?.width ?? window.innerWidth,
            height: viewport?.height ?? window.innerHeight,
        });
    };

    const sameResult = (left: FloatingPositionResult, right: FloatingPositionResult): boolean =>
        left.x === right.x &&
        left.y === right.y &&
        left.placement === right.placement &&
        left.availableWidth === right.availableWidth &&
        left.availableHeight === right.availableHeight &&
        left.anchorRect.x === right.anchorRect.x &&
        left.anchorRect.y === right.anchorRect.y &&
        left.anchorRect.width === right.anchorRect.width &&
        left.anchorRect.height === right.anchorRect.height &&
        left.floatingRect.width === right.floatingRect.width &&
        left.floatingRect.height === right.floatingRect.height &&
        left.boundaryRect.x === right.boundaryRect.x &&
        left.boundaryRect.y === right.boundaryRect.y &&
        left.boundaryRect.width === right.boundaryRect.width &&
        left.boundaryRect.height === right.boundaryRect.height;

    $effect(() => {
        const floatingElement = element;
        const anchorValue = resolveAnchor();
        if (!floatingElement || !anchorValue) {
            positioned = false;
            requestUpdate = (): void => {};
            return;
        }

        const currentPlacement = placement;
        const currentOffset = offset;
        const currentPadding = padding;
        const shouldFlip = flip;
        const shouldShift = shift;
        const currentBoundary = boundary;
        const currentDirection = direction;
        const shouldTrackPosition = trackPosition;
        const positionChange = onPositionChange;
        const positionError = onPositionError;
        let active = true;
        const update = (): void => {
            if (!active) return;
            try {
                const next = computeFloatingPosition({
                    anchorRect: readAnchorRect(anchorValue),
                    floatingRect: normalizeFloatingRect(floatingElement.getBoundingClientRect()),
                    boundaryRect: readBoundaryRect(currentBoundary),
                    placement: currentPlacement,
                    offset: currentOffset,
                    padding: currentPadding,
                    flip: shouldFlip,
                    shift: shouldShift,
                    direction: resolveDirection(anchorValue, currentDirection),
                    devicePixelRatio: window.devicePixelRatio || 1,
                });
                const changed = !positioned || !sameResult(result, next);
                positioned = true;
                if (changed) {
                    result = next;
                    positionChange?.(next);
                }
            } catch (error) {
                positioned = false;
                positionError?.(error instanceof Error ? error : new Error(String(error)));
            }
        };

        requestUpdate = update;
        const contextElement = getContextElement(anchorValue);
        const cleanup = autoUpdateFloating({
            anchorElement: isElementAnchor(anchorValue) ? anchorValue : null,
            contextElement,
            floatingElement,
            update,
            trackPosition: shouldTrackPosition,
            readAnchorRect: () => {
                const rect = readAnchorRect(anchorValue);
                return new DOMRect(rect.x, rect.y, rect.width, rect.height);
            },
        });

        return () => {
            active = false;
            cleanup();
            if (requestUpdate === update) requestUpdate = (): void => {};
        };
    });
</script>

<div
    {...restProps}
    bind:this={element}
    class={["pointer-events-auto", className]}
    style={internalStyle}
    data-placement={result.placement}
    data-positioned={positioned ? "" : undefined}
    {@attach floatingLayerAttach}
>
    {@render children?.(context)}
</div>
