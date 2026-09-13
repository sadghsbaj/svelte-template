import {
    getActiveElement,
    getFocusableElements,
    isElementDisabledOrInert,
    isElementVisible,
} from "$attachments/_system/focus.utils";

import type {
    PopoverCloseReason,
    PopoverDismissDetail,
    PopoverInitialFocus,
    PopoverRestoreFocus,
} from "./popover.types";

export function resolveInitialFocus(
    content: HTMLElement,
    policy: PopoverInitialFocus,
    modal: boolean,
    keyboardOpen: boolean
): HTMLElement | null {
    if (policy === false) return null;
    let resolvedPolicy = policy;
    if (policy === "auto") {
        if (!modal && !keyboardOpen) return null;
        resolvedPolicy = "first-focusable";
    }
    if (resolvedPolicy instanceof HTMLElement) return resolvedPolicy;
    if (typeof resolvedPolicy === "function") return resolvedPolicy(content);
    if (resolvedPolicy === "self") return content;
    if (resolvedPolicy === "first-focusable") return getFocusableElements(content).at(0) ?? content;
    if (resolvedPolicy === "last-focusable") return getFocusableElements(content).at(-1) ?? content;
    try {
        return content.querySelector<HTMLElement>(resolvedPolicy) ?? content;
    } catch {
        return content;
    }
}

export function focusPopoverTarget(content: HTMLElement, target: HTMLElement | null): boolean {
    if (
        !target ||
        !target.isConnected ||
        isElementDisabledOrInert(target) ||
        !isElementVisible(target)
    ) {
        return false;
    }
    if (target === content && !content.hasAttribute("tabindex"))
        content.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    return getActiveElement() === target;
}

export function shouldRestoreFocus(
    policy: PopoverRestoreFocus,
    reason: PopoverCloseReason,
    focusWasMoved: boolean,
    focusInsideBranch: boolean
): boolean {
    if (policy === false) return false;
    if (policy !== "auto") return true;
    if (["outside-pointer", "focus-out", "anchor-detached"].includes(reason)) {
        return false;
    }
    if (reason === "escape" || reason === "trigger") return true;
    return focusWasMoved || focusInsideBranch;
}

export function resolveRestoreTarget(
    policy: PopoverRestoreFocus,
    detail: PopoverDismissDetail,
    opener: HTMLElement | null
): HTMLElement | null {
    if (policy instanceof HTMLElement) return policy;
    if (typeof policy === "function") return policy(detail);
    return opener;
}

export function isValidFocusTarget(target: HTMLElement | null): target is HTMLElement {
    return Boolean(
        target?.isConnected &&
        !isElementDisabledOrInert(target) &&
        isElementVisible(target) &&
        !target.matches(":disabled")
    );
}
