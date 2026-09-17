/**
 * Standardized separator dot utility shortcuts for inline dividers and visual separators.
 *
 * Characteristics:
 * - Geometric circle (rounded-full)
 * - Inherits surrounding text color (bg-current)
 * - Muted opacity for subtle separation (opacity-40)
 * - Vertically centered with text x-height (align-middle inline-block)
 * - Non-collapsible and non-selectable (shrink-0 select-none)
 *
 * Scale:
 * - dot-sm : 3px (ideal for badges, captions, and compact metadata)
 * - dot-md : 4px (ideal for standard body text, buttons, and subheadings)
 * - dot-lg : 5px (ideal for prominent headings and hero tags)
 * - dot    : default alias to dot-sm
 */
export const dotShortcuts: Record<string, string> = {
    "dot-sm":
        "inline-block align-middle size-3px rounded-full bg-current opacity-40 shrink-0 select-none",
    "dot-md":
        "inline-block align-middle size-4px rounded-full bg-current opacity-40 shrink-0 select-none",
    "dot-lg":
        "inline-block align-middle size-5px rounded-full bg-current opacity-40 shrink-0 select-none",
    dot: "inline-block align-middle size-3px rounded-full bg-current opacity-40 shrink-0 select-none",
};
