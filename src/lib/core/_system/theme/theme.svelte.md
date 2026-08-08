# theme.svelte.ts

A Svelte 5 Rune-based reactive theme preference manager coordinating light, dark, and system preferences with document styling, local storage, and browser View Transitions.

## API Reference

### Classes

#### `ThemeManager`

Exposes reactive properties and methods to configure color themes.

```typescript
class ThemeManager {
    constructor();

    // Reactive Properties
    readonly mode: ThemeMode; // 'light' | 'dark' | 'system'
    readonly resolved: "light" | "dark";

    // Methods
    set(newMode: ThemeMode): void;
    toggle(): void;
    apply(): void;
    destroy(): void;
}
```

### Constants

#### `theme`

Default reactive singleton instance of `ThemeManager`.

```typescript
const theme: ThemeManager;
```

---

## Important Technical Details

- **FOUC Prevention (index.html Inline Script):** Cooperates with the pre-existing inline script in `index.html`. That script runs immediately inside `<head>` before page paint to add the `data-theme="dark"` attribute if a dark theme preference is saved. During initialization, the client-side `ThemeManager` immediately inspects `document.documentElement.getAttribute("data-theme") === "dark"` to inherit this resolved state, ensuring a seamless hydration transition without visual glitches. Refer to `index.html` to inspect the inline script implementation.
- **View Transitions API:** Morphing the theme utilizes the browser's native `document.startViewTransition()` API.
    - If `prefers-reduced-motion` is active (indicated by `data-reduce-motion` on `<html>`), transitions are bypassed.
    - During the snapshot swap, `data-theme-switching` is added to `<html>` to temporarily disable standard CSS animations globally on all elements, preventing layout shifts from running concurrently.
- **Isomorphic Request Isolation (SSR):** In SSR, module scope is shared. To prevent cross-request leakage, all mutative methods on `theme` immediately no-op on the server. For absolute safety, instantiate `ThemeManager` inside Svelte's Context (`setContext` / `getContext`) instead of using the global `theme` singleton.
