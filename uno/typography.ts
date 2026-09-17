/**
 * Standardized typography utility shortcuts for consistent text hierarchy across the application.
 *
 * Roles:
 * - title-*       : High-contrast headings and section titles (text-strong, font-600/700, tight tracking)
 * - subtitle-*    : Contextual subheadings beneath titles (text-weak, font-400, relaxed leading)
 * - label-*       : Compact, non-selectable labels for form controls (text-strong/main, font-500, leading-none)
 * - description-* : Descriptive hint text below form controls or settings rows (text-weak/weaker, font-400)
 * - body-*        : General body copy (text-main, font-400)
 */
export const typographyShortcuts: Record<string, string> = {
    // --- Titles ---
    "title-xs": "text-xs font-600 leading-snug tracking-tight text-strong",
    "title-sm": "text-sm font-600 leading-snug tracking-tight text-strong",
    "title-md": "text-base font-600 leading-snug tracking-tight text-strong",
    "title-lg": "text-lg font-700 leading-tight tracking-tight text-strong",
    "title-xl": "text-xl font-700 leading-tight tracking-tight text-strong",
    "title-2xl": "text-2xl font-700 leading-tight tracking-tight text-strong",
    "title-3xl": "text-3xl font-700 leading-none tracking-tight text-strong",

    // --- Subtitles ---
    "subtitle-xs": "text-[11px] font-400 leading-normal text-weaker",
    "subtitle-sm": "text-xs font-400 leading-normal text-weak",
    "subtitle-md": "text-sm font-400 leading-normal text-weak",
    "subtitle-lg": "text-base font-400 leading-relaxed text-weak",
    "subtitle-xl": "text-lg font-400 leading-relaxed text-weak",

    // --- Labels (Form Controls, Interactive Elements) ---
    "label-xs": "text-[11px] font-500 leading-none select-none text-main",
    "label-sm": "text-xs font-500 leading-none select-none text-strong",
    "label-md": "text-sm font-500 leading-none select-none text-strong",
    "label-lg": "text-base font-500 leading-none select-none text-strong",

    // --- Descriptions / Hints ---
    "description-xs": "text-[11px] font-400 leading-normal text-weaker",
    "description-sm": "text-xs font-400 leading-normal text-weak",
    "description-md": "text-sm font-400 leading-relaxed text-weak",
    "description-lg": "text-base font-400 leading-relaxed text-weak",

    // --- Body Copy ---
    "body-xs": "text-xs font-400 leading-normal text-main",
    "body-sm": "text-sm font-400 leading-relaxed text-main",
    "body-md": "text-base font-400 leading-relaxed text-main",
    "body-lg": "text-lg font-400 leading-relaxed text-main",
};
