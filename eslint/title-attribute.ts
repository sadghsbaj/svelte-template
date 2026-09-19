/**
 * @file title-attribute.ts
 * ESLint selector forbidding the native 'title' attribute on HTML elements in Svelte templates.
 *
 * Use the 'tooltip' attachment or 'aria-label' instead.
 * Accessible 'iframe' elements are intentionally permitted per WCAG guidelines.
 */

export const forbiddenTitleAttributeSelector = {
    selector:
        "SvelteElement[kind='html']:not([name.name='iframe']) > SvelteStartTag > :matches(SvelteAttribute, SvelteShorthandAttribute)[key.name='title']",
    message:
        "The native 'title' attribute is forbidden on HTML elements. Use the 'tooltip' attachment or 'aria-label' instead.",
};
