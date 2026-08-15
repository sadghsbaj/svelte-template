export const FOCUSABLE_SELECTOR =
    'button, [href], input:not([type="hidden"]), select, textarea, [tabindex], [contenteditable]:not([contenteditable="false"]), summary, iframe, audio[controls], video[controls]';

/**
 * Returns the currently active element, traversing through Shadow DOM boundaries if necessary.
 */
export function getActiveElement(root: Document | ShadowRoot = document): HTMLElement | null {
    if (typeof document === "undefined") {
        return null;
    }

    let active = root.activeElement as HTMLElement | null;
    while (active?.shadowRoot?.activeElement) {
        active = active.shadowRoot.activeElement as HTMLElement | null;
    }
    return active;
}

/**
 * Checks if an element is disabled or located inside an inert/disabled subtree.
 */
export function isElementDisabledOrInert(element: Element): boolean {
    return Boolean(element.closest(':disabled, [aria-disabled="true"], [inert]'));
}

/**
 * Verifies if an element is visible and capable of receiving focus in the DOM layout.
 */
export function isElementVisible(element: HTMLElement): boolean {
    if (element.hidden || element.getAttribute("aria-hidden") === "true") {
        return false;
    }

    if (typeof element.checkVisibility === "function") {
        return element.checkVisibility({
            checkOpacity: false,
            checkVisibilityCSS: true,
        });
    }

    if (element.style.display === "none" || element.style.visibility === "hidden") {
        return false;
    }

    return Boolean(
        element.offsetWidth ||
            element.offsetHeight ||
            element.getClientRects().length > 0 ||
            element.parentElement
    );
}

/**
 * Checks whether an element is inherently focusable or has a non-negative tabindex.
 */
export function isNativelyFocusable(element: HTMLElement): boolean {
    if (element.hasAttribute("tabindex")) {
        const tabIndexAttr = element.getAttribute("tabindex");
        if (tabIndexAttr === null) {
            return false;
        }
        const tabIndex = Number(tabIndexAttr);
        return !Number.isNaN(tabIndex) && tabIndex >= 0;
    }

    return element.matches(
        'button, [href], input:not([type="hidden"]), select, textarea, [contenteditable]:not([contenteditable="false"]), summary, iframe, audio[controls], video[controls]'
    );
}

export interface FocusableOptions {
    /**
     * When true, includes elements with tabindex="-1" (which are programmatically focusable).
     * When false (default), excludes elements with tabindex="-1" as they are not in the keyboard tab sequence.
     */
    includeNegativeTabIndex?: boolean;
}

/**
 * Determines whether a candidate element can receive focus.
 */
export function isCandidateFocusable(
    element: Element,
    options: FocusableOptions = {}
): element is HTMLElement {
    if (!(element instanceof HTMLElement)) {
        return false;
    }

    if (isElementDisabledOrInert(element)) {
        return false;
    }

    const { includeNegativeTabIndex = false } = options;

    if (!includeNegativeTabIndex) {
        const tabIndexAttr = element.getAttribute("tabindex");
        if (tabIndexAttr !== null) {
            const tabIndex = Number(tabIndexAttr);
            if (Number.isNaN(tabIndex) || tabIndex < 0) {
                return false;
            }
        }
    }

    if (!isNativelyFocusable(element) && !includeNegativeTabIndex) {
        return false;
    }

    return isElementVisible(element);
}

/**
 * Sorts focusable elements by positive tabindex according to HTML standard,
 * followed by standard tabindex="0" / natural DOM order.
 */
export function sortElementsByTabOrder(elements: HTMLElement[]): HTMLElement[] {
    const positiveElements: { element: HTMLElement; tabIndex: number; index: number }[] = [];
    const standardElements: HTMLElement[] = [];

    for (const [index, element] of elements.entries()) {
        const tabIndexAttr = element.getAttribute("tabindex");
        const tabIndex = tabIndexAttr !== null ? Number(tabIndexAttr) : 0;

        if (!Number.isNaN(tabIndex) && tabIndex > 0) {
            positiveElements.push({ element, tabIndex, index });
        } else {
            standardElements.push(element);
        }
    }

    positiveElements.sort((a, b) => {
        if (a.tabIndex !== b.tabIndex) {
            return a.tabIndex - b.tabIndex;
        }
        return a.index - b.index;
    });

    return [...positiveElements.map((item) => item.element), ...standardElements];
}

/**
 * Returns all candidate focusable elements within a container, ordered by tab navigation sequence.
 */
export function getFocusableElements(
    container: HTMLElement,
    options: FocusableOptions = {}
): HTMLElement[] {
    const candidates = [...container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
        (element) => isCandidateFocusable(element, options)
    );

    if (options.includeNegativeTabIndex) {
        return candidates;
    }

    return sortElementsByTabOrder(candidates);
}
