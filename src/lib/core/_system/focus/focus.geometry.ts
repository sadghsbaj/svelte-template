import type { FocusBox, ClipBox } from "./focus.types.js";

export function lerp(start: number, end: number, factor = 0.25): number {
    return start + (end - start) * factor;
}

export function boxDistance(a: FocusBox, b: FocusBox): number {
    const cxA = a.x + a.w / 2;
    const cyA = a.y + a.h / 2;
    const cxB = b.x + b.w / 2;
    const cyB = b.y + b.h / 2;
    return Math.sqrt(Math.pow(cxA - cxB, 2) + Math.pow(cyA - cyB, 2));
}

export function getClipBox(el: HTMLElement): ClipBox {
    let top = 0;
    let left = 0;
    let bottom = window.innerHeight;
    let right = window.innerWidth;

    let parent = el.parentElement;

    while (parent && parent !== document.body && parent !== document.documentElement) {
        const style = window.getComputedStyle(parent);
        const overflow = style.overflow + style.overflowX + style.overflowY;

        if (/(auto|scroll|hidden)/.test(overflow)) {
            const rect = parent.getBoundingClientRect();
            top = Math.max(top, rect.top);
            left = Math.max(left, rect.left);
            bottom = Math.min(bottom, rect.bottom);
            right = Math.min(right, rect.right);
        }
        parent = parent.parentElement;
    }

    return {
        x: left,
        y: top,
        w: Math.max(0, right - left),
        h: Math.max(0, bottom - top),
    };
}

export function computeTargetBox(el: HTMLElement, offset: number): { box: FocusBox; clip: ClipBox } | null {
    const rect = el.getBoundingClientRect();

    if (rect.width === 0 && rect.height === 0) {
        return null;
    }

    const computedStyle = window.getComputedStyle(el);
    let borderRadius = Number(computedStyle.borderRadius) || 0;

    const maxRadius = Math.min(rect.width, rect.height) / 2;
    borderRadius = Math.min(borderRadius, maxRadius);

    const box: FocusBox = {
        x: rect.x - offset,
        y: rect.y - offset,
        w: rect.width + offset * 2,
        h: rect.height + offset * 2,
        r: borderRadius + offset / 2,
    };

    const clip = getClipBox(el);

    return { box, clip };
}
