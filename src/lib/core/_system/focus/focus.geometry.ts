import type { ClipBox, CornerRadii, CornerShape, FocusBox } from "./focus.types.js";

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

export function focusBoxChanged(a: FocusBox, b: FocusBox, epsilon = 0.1): boolean {
    const exponentA = a.cornerShape?.type === "squircle" ? a.cornerShape.exponent : 1;
    const exponentB = b.cornerShape?.type === "squircle" ? b.cornerShape.exponent : 1;
    return (
        Math.abs(a.x - b.x) > epsilon ||
        Math.abs(a.y - b.y) > epsilon ||
        Math.abs(a.w - b.w) > epsilon ||
        Math.abs(a.h - b.h) > epsilon ||
        Math.abs(a.radii.topLeft - b.radii.topLeft) > epsilon ||
        Math.abs(a.radii.topRight - b.radii.topRight) > epsilon ||
        Math.abs(a.radii.bottomRight - b.radii.bottomRight) > epsilon ||
        Math.abs(a.radii.bottomLeft - b.radii.bottomLeft) > epsilon ||
        Math.abs(exponentA - exponentB) > epsilon
    );
}

export function focusClipChanged(a: ClipBox, b: ClipBox, epsilon = 0.1): boolean {
    return (
        Math.abs(a.x - b.x) > epsilon ||
        Math.abs(a.y - b.y) > epsilon ||
        Math.abs(a.w - b.w) > epsilon ||
        Math.abs(a.h - b.h) > epsilon
    );
}

/** Scales circular corner radii together using the CSS border-radius overlap algorithm. */
export function normalizeCornerRadii(
    radii: CornerRadii,
    width: number,
    height: number
): CornerRadii {
    const topLeft = Math.max(0, radii.topLeft);
    const topRight = Math.max(0, radii.topRight);
    const bottomRight = Math.max(0, radii.bottomRight);
    const bottomLeft = Math.max(0, radii.bottomLeft);
    const safeWidth = Math.max(0, width);
    const safeHeight = Math.max(0, height);
    let scale = 1;

    const top = topLeft + topRight;
    const bottom = bottomLeft + bottomRight;
    const left = topLeft + bottomLeft;
    const right = topRight + bottomRight;

    if (top > safeWidth) scale = Math.min(scale, safeWidth / top);
    if (bottom > safeWidth) scale = Math.min(scale, safeWidth / bottom);
    if (left > safeHeight) scale = Math.min(scale, safeHeight / left);
    if (right > safeHeight) scale = Math.min(scale, safeHeight / right);

    if (
        scale === 1 &&
        topLeft === radii.topLeft &&
        topRight === radii.topRight &&
        bottomRight === radii.bottomRight &&
        bottomLeft === radii.bottomLeft
    ) {
        return radii;
    }

    return {
        topLeft: topLeft * scale,
        topRight: topRight * scale,
        bottomRight: bottomRight * scale,
        bottomLeft: bottomLeft * scale,
    };
}

export function getParentElement(el: Element): HTMLElement | null {
    if (el.parentElement) return el.parentElement as HTMLElement;
    const root = el.getRootNode?.();
    if (root && "host" in root && root.host) {
        return root.host as HTMLElement;
    }
    return null;
}

export function getFocusLayerRoot(el: HTMLElement): HTMLElement {
    let root = el;
    let parent = getParentElement(root);

    while (parent && parent !== document.body) {
        root = parent;
        parent = getParentElement(root);
    }

    return root;
}

/**
 * Resolves the app-layer z-index that contains an element.
 *
 * App layers are teleported to direct children of body, so their root z-index takes priority
 * over local stacking contexts. The regular #app root has no z-index of its own, therefore
 * the first explicit z-index below it is used so the canvas also stays above positioned app
 * content while remaining below higher app layers.
 */
export function resolveFocusLayerZIndex(el: HTMLElement): number {
    const ancestry: HTMLElement[] = [];
    let current: HTMLElement | null = el;

    while (current && current !== document.body) {
        ancestry.push(current);
        current = getParentElement(current);
    }

    ancestry.reverse();

    for (const element of ancestry) {
        const rawZIndex =
            element.style.zIndex.trim() || window.getComputedStyle(element).zIndex?.trim() || "";
        if (!rawZIndex || rawZIndex === "auto") continue;

        const zIndex = Number(rawZIndex);
        if (Number.isFinite(zIndex)) return zIndex;
    }

    return 0;
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

function parseRadiusComponent(value: string, percentageBasis: number): number {
    if (!value.endsWith("%")) {
        // eslint-disable-next-line unicorn/prefer-number-coercion
        return Number.parseFloat(value) || 0;
    }

    // eslint-disable-next-line unicorn/prefer-number-coercion
    const percentage = Number.parseFloat(value) || 0;
    return (percentage / 100) * percentageBasis;
}

function parseRadiusToken(token: string, rectWidth: number, rectHeight: number): number {
    const [horizontalToken = "0", verticalToken = horizontalToken] = token.trim().split(/\s+/, 2);

    return Math.min(
        parseRadiusComponent(horizontalToken, rectWidth),
        parseRadiusComponent(verticalToken, rectHeight)
    );
}

function expandRadiusShorthand(raw: string): [string, string, string, string] {
    const tokens = raw.split("/", 1)[0].trim().split(/\s+/).filter(Boolean);
    const first = tokens[0] ?? "0";
    const second = tokens[1] ?? first;
    const third = tokens[2] ?? first;
    const fourth = tokens[3] ?? second;

    return [first, second, third, fourth];
}

function parseBorderRadii(
    computedStyle: CSSStyleDeclaration,
    rectWidth: number,
    rectHeight: number
): CornerRadii {
    const individual = [
        computedStyle.borderTopLeftRadius,
        computedStyle.borderTopRightRadius,
        computedStyle.borderBottomRightRadius,
        computedStyle.borderBottomLeftRadius,
    ].map((value) => value?.trim() ?? "");

    const tokens = individual.some(Boolean)
        ? individual.map((value) => value || "0")
        : expandRadiusShorthand(computedStyle.borderRadius?.trim() ?? "");

    return normalizeCornerRadii(
        {
            topLeft: parseRadiusToken(tokens[0], rectWidth, rectHeight),
            topRight: parseRadiusToken(tokens[1], rectWidth, rectHeight),
            bottomRight: parseRadiusToken(tokens[2], rectWidth, rectHeight),
            bottomLeft: parseRadiusToken(tokens[3], rectWidth, rectHeight),
        },
        rectWidth,
        rectHeight
    );
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
    borderRadii: CornerRadii;
    cornerShape: CornerShape;
}

/** Cache for border radii + corner shape per element (avoids repeated getComputedStyle). */
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

/** Returns cached static params (border radii, corner shape) or computes them once. */
function getStaticParams(el: HTMLElement, rectWidth: number, rectHeight: number): StaticParams {
    const cached = staticParamsCache.get(el);
    if (cached) return cached;

    const computedStyle = window.getComputedStyle(el);
    const borderRadii = parseBorderRadii(computedStyle, rectWidth, rectHeight);
    const cornerShape = parseCornerShape(computedStyle);

    const params: StaticParams = { borderRadii, cornerShape };
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

/**
 * How far the drawn ring reaches beyond the element's own rect, in px.
 *
 * The FocusBox is already outset by `offset` from the element rect (see `computeTargetBox`),
 * and the canvas stroke is centred on that path, so it reaches a further `lineWidth / 2`
 * outward. The extra `+1` absorbs devicePixelRatio rounding.
 *
 * Derived rather than hardcoded so a per-element `focusAttach({ offset, lineWidth })`
 * override cannot silently reintroduce a shaved ring.
 */
function ringOverhang(offset: number, lineWidth: number): number {
    return offset + lineWidth / 2 + 1;
}

/**
 * Computes the clip region for the focus ring: the intersection of the viewport and every
 * overflow ancestor's box.
 *
 * `padding` grows each *ancestor* rect outward. Without it, an element sitting flush against
 * its overflow container's edge loses the part of the ring drawn outside that edge — and this
 * happens even when the container is not visually clipping anything, because
 * `getScrollableParents` only inspects the computed overflow value, not whether content
 * actually overflows.
 *
 * The padding is deliberately small (a few px). It cannot defeat the purpose of the clip: an
 * element scrolled out of its scrollport is clipped by tens or hundreds of px, so a few px of
 * tolerance is irrelevant there, while the flush-edge case is exactly a few px. The tradeoff
 * is that an element straddling the scrollport boundary may show up to `padding` px of ring
 * outside the container.
 *
 * The viewport bounds are NOT padded — the ring must never bleed off-screen.
 */
export function getClipBox(el: HTMLElement, padding = 0): ClipBox {
    let top = 0;
    let left = 0;
    let bottom = window.innerHeight;
    let right = window.innerWidth;

    const parents = getScrollableParents(el);

    for (const parent of parents) {
        const rect = parent.getBoundingClientRect();
        top = Math.max(top, rect.top - padding);
        left = Math.max(left, rect.left - padding);
        bottom = Math.min(bottom, rect.bottom + padding);
        right = Math.min(right, rect.right + padding);
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
    offset: number,
    lineWidth = 2
): { box: FocusBox; clip: ClipBox } | null {
    const rect = el.getBoundingClientRect();

    if (rect.width === 0 || rect.height === 0) {
        return null;
    }

    const { borderRadii, cornerShape } = getStaticParams(el, rect.width, rect.height);

    const width = rect.width + offset * 2;
    const height = rect.height + offset * 2;
    const radii = normalizeCornerRadii(
        {
            topLeft: borderRadii.topLeft + offset,
            topRight: borderRadii.topRight + offset,
            bottomRight: borderRadii.bottomRight + offset,
            bottomLeft: borderRadii.bottomLeft + offset,
        },
        width,
        height
    );

    const box: FocusBox = {
        x: rect.x - offset,
        y: rect.y - offset,
        w: width,
        h: height,
        radii,
        cornerShape,
    };

    const clip = getClipBox(el, ringOverhang(offset, lineWidth));

    return { box, clip };
}
