import type { ClipBox, CornerShape, FocusBox } from "./focus.types.js";

export function lerp(start: number, end: number, factor = 0.25): number {
    return start + (end - start) * factor;
}

export function boxDistance(a: FocusBox, b: FocusBox): number {
    const cxA = a.x + a.w / 2;
    const cyA = a.y + a.h / 2;
    const cxB = b.x + b.w / 2;
    const cyB = b.y + b.h / 2;
    const dx = cxA - cxB;
    const dy = cyA - cyB;
    return Math.hypot(dx, dy);
}

export function getParentElement(el: Element): HTMLElement | null {
    if (el.parentElement) return el.parentElement as HTMLElement;
    const root = el.getRootNode?.();
    if (root && "host" in root && root.host) {
        return root.host as HTMLElement;
    }
    return null;
}

export function parseCornerShape(computedStyle: CSSStyleDeclaration): CornerShape {
    const rawVal =
        typeof computedStyle.getPropertyValue === "function"
            ? computedStyle.getPropertyValue("corner-shape") ||
              computedStyle.getPropertyValue("-webkit-corner-shape")
            : (computedStyle as unknown as Record<string, string | undefined>)["corner-shape"] ||
              (computedStyle as unknown as Record<string, string | undefined>)["cornerShape"] ||
              "";

    const raw = (rawVal || "").trim();

    if (!raw || raw === "round") {
        return { type: "round" };
    }

    if (raw === "squircle") {
        return { type: "squircle", exponent: 2 };
    }

    const match = /^superellipse\(\s*([\d.]+)\s*\)$/i.exec(raw);
    if (match) {
        // eslint-disable-next-line unicorn/prefer-number-coercion
        const exp = Number.parseFloat(match[1]) || 2;
        return { type: "squircle", exponent: exp };
    }

    return { type: "round" };
}

function parseBorderRadius(
    computedStyle: CSSStyleDeclaration,
    rectWidth: number,
    rectHeight: number
): number {
    const raw = (computedStyle.borderRadius || computedStyle.borderTopLeftRadius || "").trim();
    if (!raw) return 0;

    const token = raw.split(/\s+/, 1)[0];
    if (token.endsWith("%")) {
        // eslint-disable-next-line unicorn/prefer-number-coercion
        const pct = Number.parseFloat(token) || 0;
        return (pct / 100) * Math.min(rectWidth, rectHeight);
    }

    // eslint-disable-next-line unicorn/prefer-number-coercion
    return Number.parseFloat(token) || 0;
}

/**
 * Resolves a focus redirect: if the element has a focusTarget selector
 * (via focusAttach override or raw data-focus-target attribute), returns
 * the resolved element. Falls back to the element itself if not found.
 */
export function resolveFocusTarget(el: HTMLElement, overrideTarget?: string): HTMLElement {
    const selector = overrideTarget ?? el.dataset.focusTarget;
    if (!selector) return el;

    const resolved = document.querySelector<HTMLElement>(selector);
    return resolved ?? el;
}

// ── Geometry Caching ─────────────────────────────────────────────────────────

interface StaticParams {
    borderRadius: number;
    cornerShape: CornerShape;
}

/** Cache for borderRadius + cornerShape per element (avoids repeated getComputedStyle). */
const staticParamsCache = new WeakMap<HTMLElement, StaticParams>();

/** Cache for scrollable parent list per element (avoids repeated getComputedStyle on ancestors). */
const scrollableParentsCache = new WeakMap<HTMLElement, HTMLElement[]>();

/**
 * Invalidates all geometry caches for a given element.
 * Call when element styles may have changed (resize, class change, etc.).
 */
export function invalidateGeometryCache(el: HTMLElement): void {
    staticParamsCache.delete(el);
    scrollableParentsCache.delete(el);
}

/** Returns cached static params (borderRadius, cornerShape) or computes them once. */
function getStaticParams(el: HTMLElement, rectWidth: number, rectHeight: number): StaticParams {
    const cached = staticParamsCache.get(el);
    if (cached) return cached;

    const computedStyle = window.getComputedStyle(el);
    let borderRadius = parseBorderRadius(computedStyle, rectWidth, rectHeight);
    const maxRadius = Math.min(rectWidth, rectHeight) / 2;
    borderRadius = Math.min(borderRadius, maxRadius);
    const cornerShape = parseCornerShape(computedStyle);

    const params: StaticParams = { borderRadius, cornerShape };
    staticParamsCache.set(el, params);
    return params;
}

/** Returns cached scrollable parents for the element or computes them once via DOM walk. */
function getScrollableParents(el: HTMLElement): HTMLElement[] {
    const cached = scrollableParentsCache.get(el);
    if (cached) return cached;

    const parents: HTMLElement[] = [];
    let parent = getParentElement(el);

    while (parent && parent !== document.documentElement) {
        const style = window.getComputedStyle(parent);
        const overflow = style.overflow + style.overflowX + style.overflowY;

        if (/(auto|scroll|hidden|clip)/.test(overflow)) {
            parents.push(parent);
        }

        if (style.position === "fixed") {
            break;
        }

        parent = getParentElement(parent);
    }

    scrollableParentsCache.set(el, parents);
    return parents;
}

export function getClipBox(el: HTMLElement): ClipBox {
    let top = 0;
    let left = 0;
    let bottom = window.innerHeight;
    let right = window.innerWidth;

    const parents = getScrollableParents(el);

    for (const parent of parents) {
        const rect = parent.getBoundingClientRect();
        top = Math.max(top, rect.top);
        left = Math.max(left, rect.left);
        bottom = Math.min(bottom, rect.bottom);
        right = Math.min(right, rect.right);
    }

    return {
        x: left,
        y: top,
        w: Math.max(0, right - left),
        h: Math.max(0, bottom - top),
    };
}

export function computeTargetBox(
    el: HTMLElement,
    offset: number
): { box: FocusBox; clip: ClipBox } | null {
    const rect = el.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
        return null;
    }

    const { borderRadius, cornerShape } = getStaticParams(el, rect.width, rect.height);

    const box: FocusBox = {
        x: rect.x - offset,
        y: rect.y - offset,
        w: rect.width + offset * 2,
        h: rect.height + offset * 2,
        r: Math.max(0, borderRadius + offset),
        cornerShape,
    };

    const clip = getClipBox(el);

    return { box, clip };
}
