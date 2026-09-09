# viewState.svelte.ts

A Svelte 5 Rune-based view hierarchy and state manager coordinating active view transitions, scroll state restoration, root-level tabs, and back-stack integration.

## API Reference

### Classes

#### `ViewState<T extends string>`

Exposes reactive properties and methods to control view navigation, direction, hierarchy, and transitions.

```typescript
class ViewState<T extends string> {
    constructor(config: ViewsConfig<T>);

    // Reactive Properties
    readonly activeView: T;
    readonly fromView: T | null;
    readonly activeConfig: ViewConfig<T>;
    readonly activeLabel: string;
    readonly views: readonly ViewConfig<T>[];
    readonly rootViews: ViewConfig<T>[];
    readonly currentIndex: number;
    readonly firstView: T;
    readonly lastView: T;
    readonly prevView: T | null;
    readonly nextView: T | null;
    readonly direction: Direction; // 'forward' | 'backward' | 'none'

    // Hierarchy Methods
    getParent(view?: T): "root" | T;
    getRootView(view?: T): T;
    getChildren(parent?: "root" | T, includeDisabled?: boolean): ViewConfig<T>[];
    getViewPath(view?: T): ViewConfig<T>[];

    // Navigation Methods
    setView(targetView: T): boolean;
    next(): boolean;
    previous(): boolean;
    isCurrent(view: T): boolean;
    isDisabled(view: T): boolean;

    // Transition & Scroll Facades
    getInTransition(view?: T): ViewTransitionFn;
    getOutTransition(view?: T): ViewTransitionFn;
    measureAndSave(el: HTMLElement | null, view?: T): void;
    restoreScroll(el: HTMLElement | null, view?: T): void;
    savePosition(view: T, state: StoredScrollState): void;
}
```

### Configuration Options

```typescript
type ViewTransitionMode = "waapi" | "svelte" | "none";

interface ViewTransitionObject {
    mode?: ViewTransitionMode;
    in?: ViewTransitionFn;
    out?: ViewTransitionFn;
}

type ViewTransitionOption = ViewTransitionMode | ViewTransitionFn | ViewTransitionObject;

interface ViewConfig<T extends string> {
    view: T;
    label?: string;
    parent: "root" | T;
    scroll?: false | ScrollConfig;
    transition?: ViewTransitionOption;
    disabled?: boolean;
    stack?: boolean; // Enable/disable back-stack registration for this view (default: true)
}

interface ViewsConfig<T extends string> {
    persistKey?: string;
    scroll?: ScrollConfig;
    views: readonly ViewConfig<T>[];
    transition?: ViewTransitionOption; // Default: 'waapi'
    stack?: boolean; // Enable/disable back-stack registration globally (default: true)
}
```

### Functions

#### `createViewState<T extends string>`

Helper function to instantiate a typed `ViewState` manager.

```typescript
function createViewState<T extends string>(config: ViewsConfig<T>): ViewState<T>;
```

---

## Important Technical Details

- **Declared Hierarchy (`parent: "root" | T`):** Views explicitly define their parent via `parent: "root" | T`. Level 1 root views specify `"root"`, while subviews reference their direct parent view string. `getParent(view)` retrieves the direct parent, and `getRootView(view)` recursively resolves the primary root tab.
- **Automatic Back-Stack Integration:** `ViewState` seamlessly synchronizes with `appStack`. Upon initialization and every `setView(targetView)` invocation, `ViewState` updates `appStack.setScope(rootView)`. For subviews (`parent !== "root"`), `ViewState` automatically registers a subview rollback action (`priority: "subview"`, `scope: root`) to return to the parent view upon back gesture or `appStack.pop()`.
- **Back-Stack Opt-Out (`stack: false`):** Auto-registration can be disabled globally by setting `stack: false` in `ViewsConfig`, or for individual subviews by setting `stack: false` in `ViewConfig`.
- **WAAPI High-Performance Transitions (`transition: "waapi"`):** By default, views utilize GPU-accelerated Web Animations API transitions (`viewWaapiIn` / `viewWaapiOut`) running on the browser compositor thread. Can be configured globally or per-view to `"svelte"`, `"none"`, or custom transition functions.
- **Scroll State Restoration:** Coordinates scroll position measurement and restoration per view via `ViewScrollManager`, supporting both session storage and local storage persistence based on view-level scroll rules.
- **LocalStorage State Persistence:** If `persistKey` is provided in `ViewsConfig`, `ViewState` restores the initial view from `localStorage` during initialization and persists active view changes.
