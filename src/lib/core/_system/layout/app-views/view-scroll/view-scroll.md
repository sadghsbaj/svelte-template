# viewScroll.ts

An isolated scroll state and position persistence manager for Svelte 5 views, maintaining scroll coordinates across view transitions, session reloads, and local storage sessions.

## API Reference

### Classes

#### `ViewScrollManager<T extends string>`

Manages scroll measurements, restoration, and storage for views.

```typescript
class ViewScrollManager<T extends string> {
    constructor(
        getConfig: (view: T) => ViewConfig<T> | undefined,
        getGlobalConfig: () => ViewsConfig<T>
    );

    // Methods
    measureAndSave(el: HTMLElement | null, view: T): void;
    restoreScroll(el: HTMLElement | null, view: T): void;
    savePosition(view: T, state: StoredScrollState): void;
}
```

---

## Important Technical Details

- **Scroll Rule Resolution:** Determines whether scroll saving and restoration are enabled for a given view by merging view-specific `scroll` configurations with global `ViewsConfig.scroll` rules using `deepMerge`.
- **Session & LocalStorage Persistence:** If `persist: true` or `session: true` is configured, scroll coordinates are saved into `sessionStorage` or `localStorage` keyed by `viewState.config.persistKey`.
- **Container Measurement:** `measureAndSave` measures the `scrollTop` and `scrollHeight` of the scrollable container element before navigating away, ensuring smooth and exact position restoration when returning to the view.
- **SSR Safety:** Storage operations safely no-op when `typeof window === "undefined"`.
