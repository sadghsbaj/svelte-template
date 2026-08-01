# Svelte 5 Element Attachments (`{@attach ...}`)

## Core Rule

Element behaviors, event listeners, and DOM-side effects MUST be implemented using Svelte 5 attachments (`{@attach ...}`) instead of legacy actions (`use:action`).

> [!IMPORTANT]
> The `use:action` directive is strictly forbidden and enforced by ESLint (`SvelteDirective[kind='Action']`).

---

## Why Attachments?

1. **Full Reactivity**: Attachments integrate natively with Svelte 5 Runes (`$state`, `$derived`, `$effect`).
2. **Simplified Lifecycle**: An attachment is a simple function `(node: Element) => () => void` that receives the DOM element on mount and returns a cleanup function on unmount.
3. **Type Safety**: Type definitions are imported directly from `'svelte/attachments'`.

---

## Pattern & Implementation Example

```svelte
<script lang="ts">
    import type { Attachment } from "svelte/attachments";

    interface ScrollRestoreOptions {
        viewId: string;
    }

    // Attachment definition
    const scrollRestore: Attachment = (node) => {
        const el = node as HTMLElement;

        const handleScroll = () => {
            console.log("Scroll position:", el.scrollTop);
        };

        el.addEventListener("scroll", handleScroll, { passive: true });

        // Cleanup callback executed on element unmount
        return () => {
            el.removeEventListener("scroll", handleScroll);
        };
    };
</script>

<!-- Attachment usage -->
<div class="scroll-container" {@attach scrollRestore}>
    <slot />
</div>
```

---

## Documentation Link

For further details, consult the official [Svelte 5 @attach Documentation](https://svelte.dev/docs/svelte/@attach).
