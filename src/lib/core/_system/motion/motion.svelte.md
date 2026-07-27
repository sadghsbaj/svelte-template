---
verified_commit: "e5ab6d8"
---

# motion.svelte.ts

A Svelte 5 Rune-based reactive motion preference manager coordinating user reduced-motion overrides with document animation classes, OS preferences, and local storage.

## API Reference

### Classes

#### `MotionManager`
Exposes reactive properties and methods to configure motion settings.
```typescript
class MotionManager {
    constructor()
    
    // Reactive Properties
    readonly preference: MotionPreference; // 'system' | 'no-preference' | 'reduce'
    readonly resolved: "no-preference" | "reduce";

    // Methods
    set(newPreference: MotionPreference): void;
    apply(): void;
    destroy(): void;
}
```

### Constants

#### `motionPreference`
Default reactive singleton instance of `MotionManager`.
```typescript
const motionPreference: MotionManager;
```

---

## Important Technical Details

- **FOAM Prevention (app.html Inline Script):** Cooperates with the pre-existing inline script in `src/app.html`. That script runs immediately inside `<head>` before page paint to add the `.ui-reduce-motion` class if a reduced motion preference is saved. During initialization, the client-side `MotionManager` immediately reads `.ui-reduce-motion` from the DOM to inherit this resolved state, ensuring a seamless hydration transition without visual layout jumps or unintended startup animations. Refer to `src/app.html` to inspect the inline script implementation.
- **Global CSS Integration:** Adding `.ui-reduce-motion` to `<html>` should hook into global stylesheets to immediately disable transitions and animations (e.g. `* { transition: none !important; animation: none !important; }`).
- **Isomorphic Request Isolation (SSR):** Mutative methods immediately no-op on the server. If absolute request isolation is required under SSR, instantiate `MotionManager` in Svelte Context rather than calling the global `motionPreference` singleton.
