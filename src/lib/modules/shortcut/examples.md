# AppShortcut Examples

Quick code references demonstrating the key capabilities of `appShortcut`.

---

## 1. Basic Single Shortcut

Register a simple keyboard combination.

```ts
import { appShortcut } from "$modules/shortcut/appShortcut.svelte";

// Register Cmd+S or Ctrl+S to save
const unregister = appShortcut.registerShortcut("Cmd+S", () => {
    console.log("Document saved!");
});
```

---

## 2. Multi-Step Key Sequences (Leader Keys)

Register multi-key sequences like Vim or VS Code leader key combinations.

```ts
// Leader key sequence: press 'g' then 'i' to go to inbox
appShortcut.registerShortcut("g i", () => {
    console.log("Navigating to Inbox...");
});

// Chording sequence: press Ctrl+K then Ctrl+C
appShortcut.registerShortcut("Ctrl+K Ctrl+C", () => {
    console.log("Comment code block");
});
```

---

## 3. Hold-to-Act (Long Press)

Trigger actions only after holding a shortcut for a specified duration in milliseconds.

```ts
// Requires holding Delete for 1000ms to purge data
appShortcut.registerShortcut("Delete", () => {
    console.log("Permanent delete confirmed!");
}, { hold: 1000 });
```

---

## 4. Physical Hardware Key Code Matching (`useCode: true`)

Match physical key position regardless of keyboard layout (QWERTY, QWERTZ, AZERTY).

```ts
// Match WASD physical keys for canvas movement
appShortcut.registerShortcut("w", () => moveUp(), { useCode: true });
appShortcut.registerShortcut("a", () => moveLeft(), { useCode: true });
appShortcut.registerShortcut("s", () => moveDown(), { useCode: true });
appShortcut.registerShortcut("d", () => moveRight(), { useCode: true });

// Cmd+/ comment toggle working on all non-US layouts
appShortcut.registerShortcut("Cmd+Slash", () => toggleComment(), { useCode: true });
```

---

## 5. Scope Stacking & Hierarchical Scoping

Isolate shortcuts using scope stacks and hierarchical prefix matching.

```ts
// Register shortcuts in specific scopes
appShortcut.registerShortcut("Escape", () => closeEditor(), { scope: "editor" });
appShortcut.registerShortcut("Escape", () => closeModal(), { scope: "editor:modal" });

// Push modal scope onto the stack
appShortcut.pushScope("editor:modal");

// Pop scope when modal closes
appShortcut.popScope();
```

---

## 6. Modal Keybind Modes (Vim-Style Modes)

Filter active shortcuts based on the active modal keybind mode.

```ts
// Set active mode
appShortcut.activeMode = "normal";

// Active only in 'normal' mode
appShortcut.registerShortcut("i", () => {
    appShortcut.activeMode = "insert";
}, { activeMode: "normal" });

// Active in multiple modes
appShortcut.registerShortcut("Escape", () => {
    appShortcut.activeMode = "normal";
}, { activeMode: ["insert", "visual"] });
```

---

## 7. Element Attachment Directive (`shortcutAttach`)

Attach keyboard shortcuts directly to HTML elements with automatic lifecycle cleanup and trigger modes (`mount`, `focus`, `hover`).

```svelte
<script lang="ts">
    import { shortcutAttach } from "$modules/shortcut/appShortcut.svelte";
</script>

<!-- Trigger on mount -->
<button {@attach shortcutAttach("Cmd+Enter", handleSubmit)}>
    Submit
</button>

<!-- Trigger only when focused -->
<input 
    type="text" 
    placeholder="Search..." 
    {@attach shortcutAttach("Escape", clearSearch, { attachOn: "focus" })} 
/>

<!-- Array of multiple shortcuts -->
<div {@attach shortcutAttach([
    { combination: "j", handler: nextItem },
    { combination: "k", handler: prevItem }
], { attachOn: "hover" })}>
    Interactive Panel
</div>
```

---

## 8. Reactive Modifiers & Held Key State

Inspect modifier keys and arbitrary held keys reactively in template or script.

```svelte
<script lang="ts">
    import { appShortcut } from "$modules/shortcut/appShortcut.svelte";
</script>

<!-- Inspect active modifiers -->
{#if appShortcut.modifiers.cmd || appShortcut.modifiers.ctrl}
    <p>Command / Control key is currently held down!</p>
{/if}

<!-- Query arbitrary held keys -->
{#if appShortcut.isPressed("Shift")}
    <span class="badge">Precision Mode</span>
{/if}
```
