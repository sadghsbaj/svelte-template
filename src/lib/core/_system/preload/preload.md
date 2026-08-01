# preload.ts

A utility that manages body transition unlocking during initial page load to prevent Flash of Unstyled Content (FOUC) or Flash of Animated Motion (FOAM) glitches.

## API Reference

### Functions

#### `initPreload`

Initializes the preload removal sequence. Returns a cleanup function to cancel any pending animation frame callbacks, fallback timers, or event listeners.

```typescript
function initPreload(): () => void;
```

---

## Important Technical Details

- **Cooperation with `index.html`:** To prevent animation flashes on page load, `document.body` in the root template (`index.html`) is initialized with the `.preload` class (which disables all CSS transitions globally).
- **Double Frame Delay & Fallback:** `initPreload` waits for the document to be ready and deferentially removes the `.preload` class after **two** consecutive `requestAnimationFrame` render cycles (with fallback timer protection for background tabs):
    ```typescript
    const cleanup = initPreload();
    ```
    This guarantees that the browser has fully calculated layouts and paint calculations _before_ CSS transitions are unlocked, avoiding visual jumping on initial page load.
- **Explicit Invocation:** `initPreload()` is explicitly invoked at application startup (e.g. in `main.ts`).
