export type HitAreaSize = "sm" | "md" | "lg" | number;
export type HitAreaConfig = boolean | HitAreaSize;

export const HIT_AREA_SIZES: Record<"sm" | "md" | "lg", number> = {
    sm: 40,
    md: 44,
    lg: 48,
};

export function resolveHitArea(
    hitArea: HitAreaConfig,
    fallbackSize: HitAreaSize
): HitAreaSize | false {
    if (hitArea === false) return false;
    if (hitArea === true) return fallbackSize;
    return hitArea;
}

export function resolveHitAreaPx(size: HitAreaSize): number {
    return typeof size === "number" ? size : (HIT_AREA_SIZES[size] ?? 44);
}
