# appShortcut.svelte.ts

A Svelte 5 Rune-based reactive keyboard shortcut manager handling single key combinations, multi-step key sequences (Leader Keys like `"g i"` or `"Ctrl+K Ctrl+C"`), Hold-to-Act / Long Press interactions (`hold: ms`), KeyUp triggers, physical hardware key code matching (`useCode: true` for `Cmd+/`, WASD canvas navigation, and non-US QWERTZ/AZERTY layouts), reactive modifier key state tracking (`appShortcut.modifiers.shift`, `ctrl`, `alt`, `cmd`), arbitrary held key tracking (`appShortcut.isPressed("g")`), auto-repeat suppression (`repeat: false` by default to prevent multiple form submits on long press), reactive sequence status tracking, priority resolution, self-cleaning Scope Stacking (`pushScope("modal")` and `popScope()`), hierarchical scope prefix matching (`"home:editor:modal"`), Vim-style modal keybind modes, and Svelte 5 element attachments with multi-shortcut arrays and trigger modes (`mount`, `focus`, `hover`).

## API Reference

### Classes

#### `AppShortcutManager`

Exposes reactive properties and methods to register, handle, and manage single shortcuts, key sequences, reactive modifier states, and hold-to-act actions.

```typescript
class AppShortcutManager {
    constructor()

    // Reactive Properties
    readonly entries: ShortcutEntry[];
    readonly scopeStack: string[];
    readonly activeScope: string;
    readonly activeMode: string | null;
    readonly pendingSequence: string | null; // Svelte 5 Rune string e.g. "g..." or "Ctrl+K..."
    readonly modifiers: ModifierState; // Svelte 5 Rune object { shift, ctrl, alt, cmd }
    readonly pressedKeys: SvelteSet<string>;
    readonly size: number;
    readonly config: AppShortcutConfig;

    // Methods
    configure(newConfig: Partial<AppShortcutConfig>): void;
    setScope(scope: string): void;
    pushScope(scope: string): () => void; // Appends scope and returns cleanup pop function
    popScope(targetScope?: string): boolean;
    setMode(mode: string | null): void;
    resetSequence(): void;
    updateModifiers(event: KeyboardEvent): void;
    resetModifiers(): void;
    isPressed(key: string): boolean;
    register(
        combo: string,
        action: (event: KeyboardEvent) => void,
        options?: ShortcutRegisterOptions
    ): () => void;
    unregister(idOrAction: string | ((event: KeyboardEvent) => void)): boolean;
    clear(scope?: string): void;
    handleKeyDown(event: KeyboardEvent): boolean;
    handleKeyUp(event: KeyboardEvent): boolean;
}
```

### Configuration & Registration Options

```typescript
type ShortcutTriggerMode = "press" | "hold" | "release";
type ShortcutAttachTrigger = "mount" | "focus" | "hover";

interface ModifierState {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    cmd: boolean;
}

interface ShortcutDescriptor {
    combo: string;
    action: (event: KeyboardEvent) => void;
    options?: ShortcutRegisterOptions;
}

interface AppShortcutConfig {
    /** Whether the shortcut system is active (default: true) */
    enabled?: boolean;

    /** Whether to allow shortcuts inside input/textarea elements globally (default: false) */
    allowInInput?: boolean;

    /** Allowed priority presets or numeric values (default: all allowed) */
    allowedPriorities?: (ShortcutPriorityPreset | number)[];

    /** Active modal keybind mode (e.g. 'normal', 'visual', or null for standard mode) */
    activeMode?: string | null;

    /** Default sequence timeout in milliseconds (default: 1000) */
    sequenceTimeout?: number;
}

interface ShortcutRegisterOptions {
    id?: string;
    priority?: ShortcutPriority;
    scope?: string;
    /** Modal keybind mode(s) in which this shortcut is active (e.g. 'normal' or ['normal', 'visual']) */
    mode?: string | string[];
    /** Allow shortcut execution when focused inside an input/textarea (default: false) */
    allowInInput?: boolean;
    /** Prevent default browser behavior e.g. e.preventDefault() (default: true) */
    preventDefault?: boolean;
    /** Time in milliseconds allowed between steps of a key sequence e.g. "g i" (default: 1000) */
    timeout?: number;
    /** Minimum duration in ms key must be held down before firing (e.g. 500 ms) */
    hold?: number;
    /** When to trigger shortcut: 'press' (keydown, default), 'hold' (after hold ms), or 'release' (keyup) */
    triggerOn?: ShortcutTriggerMode;
    /** Svelte 5 attachment trigger condition: 'mount' (default), 'focus' (on focus/blur), or 'hover' (on pointerenter/leave) */
    attachOn?: ShortcutAttachTrigger;
    /** Allow repeated execution when key is held down e.g. event.repeat = true (default: false) */
    repeat?: boolean;
    /** Match physical key location e.g. event.code ('KeyW', 'Slash') instead of logical event.key (default: false) */
    useCode?: boolean;
}
```

### Constants & Functions

#### `appShortcut`

Default reactive singleton instance of `AppShortcutManager`.

```typescript
const appShortcut: AppShortcutManager;
```

#### `shortcutAttach`

Svelte 5 Attachment helper registering single or multiple keyboard shortcuts on element mount, focus/blur, or pointer hover/leave.

```typescript
// Single shortcut registration
function shortcutAttach(
    combo: string,
    action: (event: KeyboardEvent) => void,
    options?: ShortcutRegisterOptions,
    targetShortcut?: AppShortcutManager
): (_node: Element) => () => void;

// Array of shortcut descriptors registration
function shortcutAttach(
    descriptors: ShortcutDescriptor[],
    options?: ShortcutRegisterOptions,
    targetShortcut?: AppShortcutManager
): (_node: Element) => () => void;
```

---

## Important Technical Details

- **Self-Cleaning Scope Stacking (`pushScope` / `popScope`):** `appShortcut.pushScope("modal")` appends `"modal"` to the current scope stack (creating `"home:modal"`) and returns a cleanup function `() => popScope("modal")`. Perfect for Svelte 5 `$effect(() => appShortcut.pushScope("modal"))` where closing a modal or form automatically restores the exact previous scope.
- **Physical Key Code Matching (`useCode: true`):** Matches hardware key location (`event.code` e.g. `"Slash"`, `"KeyW"`, `"KeyA"`, `"KeyS"`, `"KeyD"`) rather than logical characters (`event.key`). Critical for non-US layouts (QWERTZ, AZERTY) for shortcuts like `Cmd+/` or gaming/canvas `WASD` navigation.
- **Auto-Repeat Protection (`repeat: false` by default):** By default, `appShortcut` automatically suppresses repeated `keydown` events (`event.repeat === true`) triggered when a key is held down. This prevents accidental multiple submissions (e.g. `Cmd+Enter` sending 20 emails). For continuous actions (e.g. Vim `j`/`k` line navigation), pass `{ repeat: true }`.
- **Arbitrary Key Press Tracking (`appShortcut.isPressed(key)`):** `appShortcut.isPressed("g")` returns a reactive boolean indicating whether any specific key (e.g. `"g"`, `"v"`, `"Space"`) is currently held down. Perfect for interactive canvas snap modes or custom drag behaviors!
- **Reactive Modifier Key State (`appShortcut.modifiers`):** Exposes `appShortcut.modifiers.shift`, `ctrl`, `alt`, and `cmd` as reactive Svelte 5 `$state` booleans.
- **Attachment Trigger Modes (`attachOn`):**
  - `"mount"` (default): Registers shortcuts when element mounts into DOM, unregisters on unmount.
  - `"focus"`: Registers shortcuts when element receives `focus`, unregisters when it loses focus (`blur`).
  - `"hover"`: Registers shortcuts when pointer enters element (`pointerenter`), unregisters when pointer leaves (`pointerleave`).
- **Multi-Shortcut Array Attachments:** Supports passing an array of `ShortcutDescriptor` objects (`[{ combo: "Cmd+S", action: saveFn }, { combo: "Escape", action: cancelFn }]`).
- **Hierarchical Prefix Scope Matching:** When `activeScope` is set to `"home:editor"`, shortcuts registered with `scope: "home"` remain active alongside shortcuts registered with `scope: "home:editor"`.
- **Automatic ViewState Scope Sync:** `ViewState.setView()` automatically synchronizes `appShortcut.setScope(rootView)`.
- **Hold-to-Act / Long Press (`hold: ms`):** Passing `{ hold: 500 }` requires holding key combination for 500 ms before action fires.
- **Multi-Step Key Sequences & Leader Keys:** Supports key sequences separated by spaces (e.g. `appShortcut.register("g i", goToInbox)`).
- **Reactive UI Sequence Status (`pendingSequence`):** While a key sequence is partially matched (e.g. after pressing `g`), `appShortcut.pendingSequence` reactively holds `"g..."`.
- **Input Guarding (`allowInInput`):** By default (`allowInInput: false`), shortcuts are safely suppressed when typing inside `<input>`, `<textarea>`, `<select>`, `contenteditable`, Shadow DOM inputs, or ARIA `role="textbox"` elements.
