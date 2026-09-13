import type {
    FloatingAlignment,
    FloatingOffset,
    FloatingPadding,
    FloatingPlacement,
    FloatingPositionResult,
    FloatingRect,
    FloatingSide,
} from "./floating.types";

export interface ComputeFloatingPositionOptions {
    anchorRect: FloatingRect | DOMRect | DOMRectReadOnly;
    floatingRect: FloatingRect | DOMRect | DOMRectReadOnly;
    boundaryRect: FloatingRect | DOMRect | DOMRectReadOnly;
    placement?: FloatingPlacement;
    offset?: number | FloatingOffset;
    padding?: number | FloatingPadding;
    flip?: boolean;
    shift?: boolean;
    direction?: "ltr" | "rtl";
    devicePixelRatio?: number;
}

const SIDES = new Set<FloatingSide>(["top", "right", "bottom", "left"]);
const ALIGNMENTS = new Set<FloatingAlignment>(["start", "center", "end"]);

const finite = (value: number, name: string): number => {
    if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite`);
    return value;
};

export function normalizeFloatingRect(
    rect: Partial<FloatingRect> & { width: number; height: number }
): FloatingRect {
    const rawX = rect.x ?? rect.left;
    const rawY = rect.y ?? rect.top;
    if (rawX === undefined || rawY === undefined) {
        throw new TypeError("Rect must contain x/y or left/top");
    }

    const x = finite(rawX, "rect.x");
    const y = finite(rawY, "rect.y");
    const width = finite(rect.width, "rect.width");
    const height = finite(rect.height, "rect.height");
    const left = Math.min(x, x + width);
    const top = Math.min(y, y + height);
    const normalizedWidth = Math.abs(width);
    const normalizedHeight = Math.abs(height);

    return {
        x: left,
        y: top,
        top,
        right: left + normalizedWidth,
        bottom: top + normalizedHeight,
        left,
        width: normalizedWidth,
        height: normalizedHeight,
    };
}

export function pointToFloatingRect(point: {
    x: number;
    y: number;
    width?: number;
    height?: number;
}): FloatingRect {
    return normalizeFloatingRect({
        x: point.x,
        y: point.y,
        width: point.width ?? 0,
        height: point.height ?? 0,
    });
}

const parsePlacement = (
    placement: FloatingPlacement
): { side: FloatingSide; alignment: FloatingAlignment } => {
    const [side, rawAlignment] = placement.split("-") as [FloatingSide, FloatingAlignment?];
    const alignment = rawAlignment ?? "center";
    if (!SIDES.has(side) || !ALIGNMENTS.has(alignment)) {
        throw new TypeError(`Invalid floating placement: ${placement}`);
    }
    return { side, alignment };
};

const placementName = (side: FloatingSide, alignment: FloatingAlignment): FloatingPlacement =>
    alignment === "center" ? side : `${side}-${alignment}`;

const oppositeSide = (side: FloatingSide): FloatingSide =>
    ({ top: "bottom", right: "left", bottom: "top", left: "right" })[side] as FloatingSide;

const coordinates = (
    anchor: FloatingRect,
    floating: FloatingRect,
    side: FloatingSide,
    alignment: FloatingAlignment,
    direction: "ltr" | "rtl",
    mainAxis: number,
    crossAxis: number
): { x: number; y: number } => {
    const verticalSide = side === "top" || side === "bottom";
    let x = anchor.left + (anchor.width - floating.width) / 2;
    let y = anchor.top + (anchor.height - floating.height) / 2;

    if (verticalSide) {
        y = side === "top" ? anchor.top - floating.height - mainAxis : anchor.bottom + mainAxis;
        const logicalAlignment =
            direction === "rtl" && alignment !== "center"
                ? alignment === "start"
                    ? "end"
                    : "start"
                : alignment;
        if (logicalAlignment === "start") x = anchor.left;
        else if (logicalAlignment === "end") x = anchor.right - floating.width;
        x += crossAxis;
    } else {
        x = side === "left" ? anchor.left - floating.width - mainAxis : anchor.right + mainAxis;
        if (alignment === "start") y = anchor.top;
        else if (alignment === "end") y = anchor.bottom - floating.height;
        y += crossAxis;
    }
    return { x, y };
};

const mainOverflow = (
    side: FloatingSide,
    position: { x: number; y: number },
    floating: FloatingRect,
    bounds: FloatingRect
): number => {
    if (side === "top") return Math.max(0, bounds.top - position.y);
    if (side === "bottom") return Math.max(0, position.y + floating.height - bounds.bottom);
    if (side === "left") return Math.max(0, bounds.left - position.x);
    return Math.max(0, position.x + floating.width - bounds.right);
};

const roundByDpr = (value: number, dpr: number): number => Math.round(value * dpr) / dpr;

export function computeFloatingPosition({
    anchorRect: rawAnchor,
    floatingRect: rawFloating,
    boundaryRect: rawBoundary,
    placement = "bottom",
    offset = 0,
    padding = 8,
    flip = true,
    shift = true,
    direction = "ltr",
    devicePixelRatio = 1,
}: ComputeFloatingPositionOptions): FloatingPositionResult {
    const anchorRect = normalizeFloatingRect(rawAnchor);
    const floatingRect = normalizeFloatingRect(rawFloating);
    const boundaryRect = normalizeFloatingRect(rawBoundary);
    const parsed = parsePlacement(placement);
    const resolvedOffset =
        typeof offset === "number"
            ? { mainAxis: offset, crossAxis: 0 }
            : { mainAxis: offset.mainAxis ?? 0, crossAxis: offset.crossAxis ?? 0 };
    const resolvedPadding =
        typeof padding === "number"
            ? { top: padding, right: padding, bottom: padding, left: padding }
            : {
                  top: padding.top ?? 0,
                  right: padding.right ?? 0,
                  bottom: padding.bottom ?? 0,
                  left: padding.left ?? 0,
              };

    const numericOptions = Object.entries({ ...resolvedOffset, ...resolvedPadding });
    for (const [name, value] of numericOptions) {
        finite(value, name);
    }
    if (Object.values(resolvedPadding).some((value) => value < 0)) {
        throw new RangeError("Floating padding cannot be negative");
    }
    if (direction !== "ltr" && direction !== "rtl") throw new TypeError("Invalid direction");
    const dpr = finite(devicePixelRatio, "devicePixelRatio");
    if (dpr <= 0) throw new RangeError("devicePixelRatio must be greater than zero");

    const bounds = normalizeFloatingRect({
        x: boundaryRect.left + resolvedPadding.left,
        y: boundaryRect.top + resolvedPadding.top,
        width: Math.max(0, boundaryRect.width - resolvedPadding.left - resolvedPadding.right),
        height: Math.max(0, boundaryRect.height - resolvedPadding.top - resolvedPadding.bottom),
    });

    let side = parsed.side;
    let position = coordinates(
        anchorRect,
        floatingRect,
        side,
        parsed.alignment,
        direction,
        resolvedOffset.mainAxis,
        resolvedOffset.crossAxis
    );
    if (flip) {
        const opposite = oppositeSide(side);
        const oppositePosition = coordinates(
            anchorRect,
            floatingRect,
            opposite,
            parsed.alignment,
            direction,
            resolvedOffset.mainAxis,
            resolvedOffset.crossAxis
        );
        const currentOverflow = mainOverflow(side, position, floatingRect, bounds);
        const oppositeOverflow = mainOverflow(opposite, oppositePosition, floatingRect, bounds);
        if (currentOverflow > 0 && oppositeOverflow < currentOverflow) {
            side = opposite;
            position = oppositePosition;
        }
    }

    if (shift) {
        const maxX = bounds.right - floatingRect.width;
        const maxY = bounds.bottom - floatingRect.height;
        position.x =
            floatingRect.width > bounds.width
                ? bounds.left
                : Math.min(Math.max(position.x, bounds.left), maxX);
        position.y =
            floatingRect.height > bounds.height
                ? bounds.top
                : Math.min(Math.max(position.y, bounds.top), maxY);
    }

    const verticalSide = side === "top" || side === "bottom";
    let mainAvailable: number;
    switch (side) {
        case "top": {
            mainAvailable = anchorRect.top - bounds.top;
            break;
        }
        case "bottom": {
            mainAvailable = bounds.bottom - anchorRect.bottom;
            break;
        }
        case "left": {
            mainAvailable = anchorRect.left - bounds.left;
            break;
        }
        case "right": {
            mainAvailable = bounds.right - anchorRect.right;
            break;
        }
    }
    mainAvailable = Math.max(0, mainAvailable - resolvedOffset.mainAxis);

    return {
        x: roundByDpr(position.x, dpr),
        y: roundByDpr(position.y, dpr),
        placement: placementName(side, parsed.alignment),
        side,
        alignment: parsed.alignment,
        availableWidth: verticalSide ? bounds.width : mainAvailable,
        availableHeight: verticalSide ? mainAvailable : bounds.height,
        anchorRect,
        floatingRect,
        boundaryRect,
    };
}
