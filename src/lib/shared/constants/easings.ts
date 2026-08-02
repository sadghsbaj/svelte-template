/**
 * @file easings.ts
 * Central cubic-bezier easing curve definitions for WAAPI and JavaScript animations.
 */

export const easings = {
    sineIn: "cubic-bezier(0.12, 0, 0.39, 0)",
    sineOut: "cubic-bezier(0.61, 1, 0.88, 1)",
    sineInOut: "cubic-bezier(0.37, 0, 0.63, 1)",
    quadIn: "cubic-bezier(0.11, 0, 0.5, 0)",
    quadOut: "cubic-bezier(0.5, 1, 0.89, 1)",
    quadInOut: "cubic-bezier(0.45, 0, 0.55, 1)",
    cubicIn: "cubic-bezier(0.32, 0, 0.67, 0)",
    cubicOut: "cubic-bezier(0.33, 1, 0.68, 1)",
    cubicInOut: "cubic-bezier(0.65, 0, 0.35, 1)",
    quartIn: "cubic-bezier(0.5, 0, 0.75, 0)",
    quartOut: "cubic-bezier(0.25, 1, 0.5, 1)",
    quartInOut: "cubic-bezier(0.76, 0, 0.24, 1)",
    quintIn: "cubic-bezier(0.64, 0, 0.78, 0)",
    quintOut: "cubic-bezier(0.22, 1, 0.36, 1)",
    quintInOut: "cubic-bezier(0.83, 0, 0.17, 1)",
    expoIn: "cubic-bezier(0.7, 0, 0.84, 0)",
    expoOut: "cubic-bezier(0.16, 1, 0.3, 1)",
    expoInOut: "cubic-bezier(0.87, 0, 0.13, 1)",
    circIn: "cubic-bezier(0.55, 0, 1, 0.45)",
    circOut: "cubic-bezier(0, 0.55, 0.45, 1)",
    circInOut: "cubic-bezier(0.85, 0, 0.15, 1)",
    backIn: "cubic-bezier(0.36, 0, 0.66, -0.56)",
    backOut: "cubic-bezier(0.34, 1.56, 0.64, 1)",
    backInOut: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
} as const;

/** Alias for `easings` for concise access (e.g. `ease.quintOut`) */
export const ease = easings;
