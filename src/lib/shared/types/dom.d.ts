/**
 * Extends `FocusOptions` with `focusVisible` (WHATWG HTML standard for `element.focus()`).
 * Prevents type errors in editors and LSPs (e.g., Zed) whose bundled TypeScript versions
 * do not yet include this modern DOM property in `lib.dom.d.ts`.
 */
declare global {
    interface FocusOptions {
        focusVisible?: boolean;
    }
}

export {};
