# appStack.svelte.ts

A Svelte 5 Rune-based priority action back-stack manager handling overlay dismissals, subview hierarchy rollbacks, and browser history/gesture events.

## API Reference

### Classes

#### `AppStackManager`

Exposes reactive properties and methods to register, pop, configure, and manage priority back-stack actions.

```typescript
class AppStackManager {
    constructor();

    // Reactive Properties
    readonly entries: StackEntry[];
    readonly activeScope: string;
    readonly size: number; // Total raw entries across all scopes
    readonly canGoBack: boolean; // Svelte 5 Rune-derived boolean for active scope
    readonly config: AppStackConfig;

    // Methods
    configure(newConfig: Partial<AppStackConfig>): void;
    register(action: () => void, options?: StackRegisterOptions): () => void;
    unregister(idOrAction: string | (() => void)): boolean;
    pop(targetScope?: string): boolean;
    clear(scope?: string): void;
    setScope(scope: string): void;
    scopeSize(scope?: string): number; // Filtered entry count for given/active scope
    unbindGlobalEvents(): void;
    destroy(): void;
}
```

### Configuration Interface

```typescript
interface AppStackConfig {
    /** Whether the back-stack system is active (default: true) */
    enabled?: boolean;

    /** Whether browser popstate (back button / gestures) are intercepted (default: true) */
    interceptBrowserBack?: boolean;

    /** Allowed priority presets or numeric values (default: all allowed) */
    allowedPriorities?: (StackPriorityPreset | number)[];
}
```

### Constants & Functions

#### `appStack`

Default reactive singleton instance of `AppStackManager`.

```typescript
const appStack: AppStackManager;
```

#### `stackAttach`

Svelte 5 Attachment helper registering an action on element mount and automatically unregistering it on unmount.

```typescript
function stackAttach(
    action: () => void,
    options?: StackRegisterOptions,
    targetStack?: AppStackManager
): (_node: Element) => () => void;
```

---

## Important Technical Details

- **Global Configuration (`configure`):** `appStack.configure({ enabled: false })` disables back-stack popping globally. `interceptBrowserBack: false` stops browser `popstate` gesture interception while leaving manual `appStack.pop()` calls intact. `allowedPriorities` filters allowed pop levels (e.g. `allowedPriorities: ["overlay"]` only allows closing modals, ignoring subviews). Allowed priorities are cached on configuration for $O(1)$ zero-allocation checks.
- **Priority Presets & Deterministic Tie-Breaking:** Stack entries are resolved numerically by priority. High-priority entries (`"overlay"` = 100) pop before subviews (`"subview"` = 50) and root views (`"root"` = 10). If multiple entries share the exact same priority, the stack resolves ties using Last-In, First-Out (LIFO) backed by a monotonic internal sequence counter (`sequence`), guaranteeing strict insertion order even across synchronous single-tick registrations.
- **Scope Size Querying (`scopeSize` vs `size`):** `size` returns the total raw number of entries in the stack across all scopes. `scopeSize(scope?)` returns the count of entries active for the specified or current active scope (`global` + target scope) matching configured `allowedPriorities`.
- **Automatic ViewState Integration:** `ViewState` automatically synchronizes `appStack` scope via `setScope(rootView)`. When navigating to a subview (`parent !== "root"`), `ViewState` automatically registers a subview rollback action (`priority: "subview"`, `scope: root`). This can be disabled globally (`stack: false` in `ViewsConfig`) or per-view (`stack: false` in `ViewConfig`).
- **Svelte 5 Attachments (`stackAttach`):** Overlays and modals can use `{@attach stackAttach(closeFn)}` directly on HTML elements. The attachment callback registers the action upon mounting into the DOM and cleans up automatically via `unregister()` upon unmounting or conditional removal. Action updates update the closure dynamically to prevent stale state retention.
- **Browser Event Interception (`popstate`):** In browser environments (`typeof window !== "undefined"`), `AppStackManager` listens to global `popstate` events via a bound listener. Browser back actions trigger stack popping without non-functional `preventDefault()` calls, and root pop exit handlers are guarded against double history navigation. Listeners can be detached via `unbindGlobalEvents()` or `destroy()`.
- **Isomorphic Safety (SSR):** Window listeners and browser history pop operations automatically no-op on the server during SSR rendering.
