# DOM State & Modifier Guidelines

## Core Rule

All global application and element-level states (such as active themes, motion preferences, layout phase preloads, focus states, and specific style overrides) must be managed using native HTML `data-` attributes on the DOM (accessed via the JS `.dataset` API) instead of custom CSS classes.

---

## Why Use Data Attributes for State?

1. **Clear Separation of Concerns:** CSS classes (`.btn`, `.card`) are reserved for static styling. Data attributes (`[data-theme]`, `[data-preload]`) represent dynamic state.
2. **Selector Semantics:** Native selector matching in CSS is cleaner: `html[data-theme="dark"]` rather than `html.dark`.
3. **Linter & Type-Safety Integration:** The codebase enforces the ESLint rule `unicorn/dom-node-dataset`, requiring the use of the `.dataset` API instead of `.classList` or `getAttribute` / `setAttribute`, leading to cleaner JS/TS code.
4. **Consistency:** Binary attributes (e.g., `data-preload`) and value-based attributes (e.g., `data-theme="dark"`) are handled uniformly.

---

## Code Examples

### 1. Global Theme Configuration (Value-Based Attribute)
Manage active themes using the `data-theme` attribute on the `<html>` element.

**JavaScript/TypeScript (Setting State):**
```typescript
// ✅ Good: Use dataset property
document.documentElement.dataset.theme = isDark ? "dark" : "light";

// ❌ Bad: Avoid classList or setAttribute
document.documentElement.classList.toggle("dark", isDark);
document.documentElement.setAttribute("data-theme", "dark");
```

**CSS (Styling):**
```css
/* ✅ Good: Select attribute value */
[data-theme="dark"] {
    --color-app: var(--color-base-950);
}
```

---

### 2. Motion Reduction & Accessibility Flags (Binary Attribute)
Track motion preference using the binary `data-reduce-motion` attribute.

**JavaScript/TypeScript (Setting & Checking State):**
```typescript
// ✅ Good: Set binary flag using empty string
document.documentElement.dataset.reduceMotion = "";

// ✅ Good: Remove binary flag using delete operator
delete document.documentElement.dataset.reduceMotion;

// ✅ Good: Check binary flag existence
const hasReduceMotion = Object.hasOwn(document.documentElement.dataset, "reduceMotion");
```

**CSS (Styling):**
```css
/* ✅ Good: Selector matches if attribute is present */
[data-reduce-motion] {
    scroll-behavior: auto !important;
}
```

---

### 3. Transition Suspension & Switching (Switching States)
Use a temporary transition lock attribute `data-theme-switching` while swapping states to prevent flashing.

**JavaScript/TypeScript:**
```typescript
// Start transition
document.documentElement.dataset.themeSwitching = "";

// End transition
delete document.documentElement.dataset.themeSwitching;
```

**CSS:**
```css
/* Lock transitions when preload or theme-switching is active */
:is([data-preload], [data-theme-switching]) * {
    transition: none !important;
    animation: none !important;
}
```

---

### 4. Custom Element Modifiers (e.g., Selection Accent Override)
Override default selection behavior on specific containers using local data attributes.

**HTML / Svelte:**
```svelte
<div data-selection-on-accent>
    <p>Selected text here will receive the custom accent styling.</p>
</div>
```

**CSS:**
```css
[data-selection-on-accent] ::selection {
    color: var(--color-accent-500);
    background-color: white;
}
```
