# Direct DOM Query Anti-Pattern in Components

## Core Rule

Direct DOM query methods (`document.querySelector`, `document.querySelectorAll`, `document.getElementById`, `getElementsByClassName`, `getElementsByTagName`) are **strictly forbidden** inside `.svelte` component files.

> [!IMPORTANT]
> Global DOM element lookups inside `.svelte` components trigger an ESLint error (`no-restricted-syntax`).

---

## Why Is Direct DOM Querying an Anti-Pattern?

1. **Breaks Encapsulation**: Component styles and DOM elements should be scoped to their component instance. Querying global IDs or selectors can leak across component boundaries or select unintended elements when multiple component instances exist on screen.
2. **Lifecycle Race Conditions**: Direct DOM queries executed outside Svelte's lifecycle can run before elements are mounted or after they are destroyed.
3. **Violates Svelte Reactivity**: Component logic should interact with elements declaratively via bindings or element attachment parameters.

---

## Preferred Alternatives

### 1. Element Bindings (`bind:this`)

To get a direct reference to a DOM node created within the component:

```svelte
<script lang="ts">
    let containerEl = $state<HTMLDivElement | null>(null);

    function scrollToTop() {
        containerEl?.scrollTo({ top: 0, behavior: "smooth" });
    }
</script>

<div bind:this={containerEl} class="scrollable">
    <!-- content -->
</div>
```

---

### 2. Element Attachments (`{@attach ...}`)

To perform DOM manipulations, attach event listeners, or integrate third-party libraries on an element:

```svelte
<script lang="ts">
    import type { Attachment } from "svelte/attachments";

    const autoFocus: Attachment = (node) => {
        (node as HTMLElement).focus();
    };
</script>

<input type="text" {@attach autoFocus} />
```

---

### 3. Allowed `document` Usage

Note that global document property access and global event listeners (such as theme updates or keyboard listeners) remain allowed when necessary:

```ts
document.addEventListener("keydown", handleKey); // ✅ Allowed for global listeners
document.documentElement.dataset.theme = isDark ? "dark" : "light"; // ✅ Allowed for global document root styling
```
