/**
 * Selective DOM Background & Universal Black Text/Icon Blueprint (Idee 1).
 * Supports dynamic DOM updates (e.g. Svelte tab switches / route navigation).
 * - Backgrounds: ONLY elements with a non-transparent background turn solid white (#ffffff).
 * - Text/Icons/SVGs/Paths: ALL webpage elements and SVG paths (except performance overlays & inspector panels) turn jet black (#000000).
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

const modifiedElements = new Map<Element, RestorableStyle>();

function isPerformanceElement(el: Element): boolean {
    return (
        el.id === "dev-perf-overlay" ||
        el.id === "dev-dom-heatmap" ||
        el.id === "dev-dom-inspector" ||
        el.id === "dev-dom-inspector-hover" ||
        el.id === "dev-inspector-parent-highlight" ||
        Boolean(el.closest("#dev-perf-overlay")) ||
        Boolean(el.closest("#dev-dom-heatmap")) ||
        Boolean(el.closest("#dev-dom-inspector")) ||
        Boolean(el.closest("#dev-dom-inspector-hover")) ||
        Boolean(el.closest("#dev-inspector-parent-highlight"))
    );
}

function storeOriginalStyle(node: Element): void {
    if (modifiedElements.has(node)) return;
    if (!(node instanceof HTMLElement || node instanceof SVGElement)) return;

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
}

function blackenSvgChildren(svgNode: Element): void {
    const children = svgNode.querySelectorAll(
        "path, circle, rect, line, polyline, polygon, g, use"
    );
    for (const child of children) {
        if (!(child instanceof HTMLElement || child instanceof SVGElement)) {
            continue;
        }

        storeOriginalStyle(child);
        child.style.setProperty("color", "#000000", "important");
        child.style.setProperty("stroke", "#000000", "important");
    }
}

export function applySelectiveBlueprint(active: boolean): void {
    if (typeof document === "undefined") return;

    let overrideStyle = document.getElementById("dev-blueprint-overrides");

    if (!active) {
        // Remove style override tag
        overrideStyle?.remove();

        // Restore exact original inline styles
        for (const [el, style] of modifiedElements) {
            if (!(el instanceof HTMLElement || el instanceof SVGElement)) {
                continue;
            }

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

    // Inject high-specificity CSS rules for SVG icons & native sliders
    if (!overrideStyle) {
        overrideStyle = document.createElement("style");
        overrideStyle.id = "dev-blueprint-overrides";
        overrideStyle.textContent = `
            *:not(#dev-perf-overlay):not(#dev-perf-overlay *):not(#dev-dom-heatmap):not(#dev-dom-heatmap *):not(#dev-dom-inspector):not(#dev-dom-inspector *):not(#dev-dom-inspector-hover):not(#dev-inspector-parent-highlight) {
                accent-color: #000000 !important;
                caret-color: #000000 !important;
            }
            svg:not(#dev-perf-overlay *):not(#dev-dom-inspector *), 
            svg:not(#dev-perf-overlay *):not(#dev-dom-inspector *) * {
                color: #000000 !important;
                fill: currentColor !important;
                stroke: currentColor !important;
            }
            svg[fill]:not([fill="none"]):not(#dev-perf-overlay *):not(#dev-dom-inspector *) {
                fill: #000000 !important;
            }
        `;
        document.head.append(overrideStyle);
    }

    const allElements = document.body.querySelectorAll("*");

    for (const node of allElements) {
        if (!(node instanceof HTMLElement || node instanceof SVGElement)) continue;
        if (isPerformanceElement(node)) continue;
        if (modifiedElements.has(node)) continue; // Skip already processed nodes

        const computed = window.getComputedStyle(node);
        if (computed.display === "none" || computed.visibility === "hidden") continue;

        const bg = computed.backgroundColor;
        const hasVisibleBg =
            bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)" && bg !== "rgba(0,0,0,0)";

        // Store original inline style properties
        storeOriginalStyle(node);

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
