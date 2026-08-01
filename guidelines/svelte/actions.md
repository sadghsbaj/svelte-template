# Deprecation Policy for Legacy Actions (`use:action`)

## Internal Deprecation Policy

While Svelte 5 maintains backward compatibility for `use:action` directives, **our codebase treats `use:action` as fully deprecated and strictly forbidden**.

> [!WARNING]
> Do NOT create new action functions or use `<div use:myAction>`. All element behaviors must use `{@attach ...}`.

---

## Enforced Restrictions

1. **Template Directives**: Writing `<div use:action>` triggers ESLint error `SvelteDirective[kind='Action']`.
2. **Type Imports**: Importing `Action` or `ActionReturn` from `'svelte/action'` is blocked by ESLint (`no-restricted-imports`).

---

## Migration Guide

### Legacy Action (`use:action`) - ❌ Forbidden

```ts
// Legacy Action definition
function legacyTooltip(node: HTMLElement, text: string) {
    node.setAttribute("title", text);
    return {
        destroy() {
            node.removeAttribute("title");
        },
    };
}
```

```svelte
<!-- Legacy usage -->
<button use:legacyTooltip={"Click me"}>Button</button>
```

### Modern Attachment (`{@attach ...}`) - ✅ Required

```ts
import type { Attachment } from "svelte/attachments";

function tooltip(text: string): Attachment {
    return (node) => {
        const el = node as HTMLElement;
        el.setAttribute("title", text);
        return () => {
            el.removeAttribute("title");
        };
    };
}
```

```svelte
<!-- Modern usage -->
<button {@attach tooltip("Click me")}>Button</button>
```
