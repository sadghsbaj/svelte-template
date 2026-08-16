import type { Attachment } from "svelte/attachments";

export interface FadeMaskOptions {
    type?: "radial" | "top" | "bottom" | "left" | "right" | "block" | "inline";
    strength?: "sm" | "md" | "lg";
}

const STRENGTH_MAP = {
    sm: { start: "60%", end: "100%", edge: "15%" },
    md: { start: "30%", end: "90%", edge: "25%" },
    lg: { start: "0%", end: "75%", edge: "35%" },
};

function resolveGradient(
    type: FadeMaskOptions["type"] = "radial",
    strength: FadeMaskOptions["strength"] = "md"
): string {
    const active = STRENGTH_MAP[strength];

    const GRADIENT_MAP: Record<NonNullable<FadeMaskOptions["type"]>, string> = {
        radial: `radial-gradient(in oklch, black ${active.start}, transparent ${active.end})`,
        bottom: `linear-gradient(to bottom in oklch, black ${active.start}, transparent ${active.end})`,
        top: `linear-gradient(to top in oklch, black ${active.start}, transparent ${active.end})`,
        left: `linear-gradient(to left in oklch, black ${active.start}, transparent ${active.end})`,
        right: `linear-gradient(to right in oklch, black ${active.start}, transparent ${active.end})`,
        block: `linear-gradient(to bottom in oklch, transparent 0%, black ${active.edge}, black calc(100% - ${active.edge}), transparent 100%)`,
        inline: `linear-gradient(to right in oklch, transparent 0%, black ${active.edge}, black calc(100% - ${active.edge}), transparent 100%)`,
    };

    return GRADIENT_MAP[type];
}

export const fadeMask = (options: FadeMaskOptions = {}): Attachment => {
    return (node: Element) => {
        const el = node as HTMLElement;
        const gradient = resolveGradient(options.type, options.strength);

        el.style.maskImage = gradient;
        el.style.webkitMaskImage = gradient;
        el.style.maskRepeat = "no-repeat";
        el.style.webkitMaskRepeat = "no-repeat";
        el.style.maskSize = "100% 100%";
        el.style.webkitMaskSize = "100% 100%";

        // Cleanup beim Unmount
        return () => {
            el.style.removeProperty("mask-image");
            el.style.removeProperty("-webkit-mask-image");
            el.style.removeProperty("mask-repeat");
            el.style.removeProperty("-webkit-mask-repeat");
            el.style.removeProperty("mask-size");
            el.style.removeProperty("-webkit-mask-size");
        };
    };
};
