/**
 * Selective DOM Background & Universal Black Text/Icon Blueprint (Idee 1).
 * - Backgrounds: ONLY elements with a non-transparent background turn solid white (#ffffff).
 * - Text/Icons/SVGs/Paths: ALL webpage elements and SVG paths (except #dev-perf-overlay) turn jet black (#000000).
 * - Sliders/Checkboxes: accent-color set to #000000.
 */

interface RestorableStyle {
    bg: string;
    bgPriority: string;
    color: string;
    colorPriority: string;
    borderColor: string;
    borderColorPriority: string;
    fill: string;
    fillPriority: string;
    stroke: string;
    strokePriority: string;
    accentColor: string;
    accentPriority: string;
}

const modifiedElements = new Map<HTMLElement, RestorableStyle>();

function isPerformanceElement(el: Element): boolean {
    return (
        el.id === "dev-perf-overlay" ||
        el.id === "dev-dom-heatmap" ||
        Boolean(el.closest("#dev-perf-overlay")) ||
        Boolean(el.closest("#dev-dom-heatmap"))
    );
}

function blackenSvgChildren(svgNode: HTMLElement) {
    const children = svgNode.querySelectorAll(
        "path, circle, rect, line, polyline, polygon, g, use"
    );
    for (const child of children) {
        if (!(child instanceof HTMLElement || child instanceof SVGElement)) {
            continue;
        }

        child.style.setProperty("color", "#000000", "important");
        child.style.setProperty("stroke", "#000000", "important");
    }
}

export function applySelectiveBlueprint(active: boolean) {
    if (typeof document === "undefined") return;

    let overrideStyle = document.getElementById("dev-blueprint-overrides");

    if (!active) {
        // Remove style override tag
        overrideStyle?.remove();

        // Restore exact original inline styles
        for (const [el, style] of modifiedElements) {
            el.style.setProperty("background-color", style.bg, style.bgPriority);
            el.style.setProperty("color", style.color, style.colorPriority);
            el.style.setProperty("border-color", style.borderColor, style.borderColorPriority);
            el.style.setProperty("fill", style.fill, style.fillPriority);
            el.style.setProperty("stroke", style.stroke, style.strokePriority);
            el.style.setProperty("accent-color", style.accentColor, style.accentPriority);
        }
        modifiedElements.clear();
        return;
    }

    if (modifiedElements.size > 0) return; // Already applied

    // Inject high-specificity CSS rules for SVG icons & native sliders
    if (!overrideStyle) {
        overrideStyle = document.createElement("style");
        overrideStyle.id = "dev-blueprint-overrides";
        overrideStyle.textContent = `
            *:not(#dev-perf-overlay):not(#dev-perf-overlay *):not(#dev-dom-heatmap):not(#dev-dom-heatmap *) {
                accent-color: #000000 !important;
                caret-color: #000000 !important;
            }
            svg:not(#dev-perf-overlay *), 
            svg:not(#dev-perf-overlay *) * {
                color: #000000 !important;
                fill: currentColor !important;
                stroke: currentColor !important;
            }
            svg[fill]:not([fill="none"]):not(#dev-perf-overlay *) {
                fill: #000000 !important;
            }
        `;
        document.head.append(overrideStyle);
    }

    const allElements = document.body.querySelectorAll("*");

    for (const node of allElements) {
        if (!(node instanceof HTMLElement)) continue;
        if (isPerformanceElement(node)) continue;

        const computed = window.getComputedStyle(node);
        if (computed.display === "none" || computed.visibility === "hidden") continue;

        const bg = computed.backgroundColor;
        const hasVisibleBg =
            bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)" && bg !== "rgba(0,0,0,0)";

        // Store original inline style properties
        modifiedElements.set(node, {
            bg: node.style.getPropertyValue("background-color"),
            bgPriority: node.style.getPropertyPriority("background-color"),
            color: node.style.getPropertyValue("color"),
            colorPriority: node.style.getPropertyPriority("color"),
            borderColor: node.style.getPropertyValue("border-color"),
            borderColorPriority: node.style.getPropertyPriority("border-color"),
            fill: node.style.getPropertyValue("fill"),
            fillPriority: node.style.getPropertyPriority("fill"),
            stroke: node.style.getPropertyValue("stroke"),
            strokePriority: node.style.getPropertyPriority("stroke"),
            accentColor: node.style.getPropertyValue("accent-color"),
            accentPriority: node.style.getPropertyPriority("accent-color"),
        });

        // 1. Selective background whitening (only for elements that HAD a background)
        if (hasVisibleBg) {
            node.style.setProperty("background-color", "#ffffff", "important");
        }

        // 2. Universal blackening of ALL text, icons, SVGs, sliders, and borders
        node.style.setProperty("color", "#000000", "important");
        node.style.setProperty("fill", "#000000", "important");
        node.style.setProperty("stroke", "#000000", "important");
        node.style.setProperty("border-color", "#d4d4d8", "important");
        node.style.setProperty("accent-color", "#000000", "important");

        // 3. Target SVG child elements directly
        if (node.tagName.toLowerCase() === "svg") {
            blackenSvgChildren(node);
        }
    }
}
