export type HitAreaSize = "sm" | "md" | "lg" | number;
export type HitAreaConfig = boolean | HitAreaSize;

export function resolveHitArea(
    hitArea: HitAreaConfig,
    fallbackSize: HitAreaSize
): HitAreaSize | false {
    if (hitArea === false) return false;
    if (hitArea === true) return fallbackSize;
    return hitArea;
}
