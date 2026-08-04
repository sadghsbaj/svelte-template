# preload.ts

A utility that manages body transition unlocking during initial page load to prevent Flash of Unstyled Content (FOUC) or Flash of Animated Motion (FOAM) glitches, and orchestrates initial loading screen dismissal.

## API Reference

### Functions

#### `initPreload`

Initializes the preload removal sequence. Removes `.preload` from body after initial paint frames and triggers `dismissLoadingScreen()`. Returns a cleanup function to cancel any pending animation frame callbacks, fallback timers, or event listeners.

```typescript
function initPreload(): () => void;
```

#### `dismissLoadingScreen`

Dismisses the initial application loading screen (`#app-loading`) by applying the `.fade-out` CSS class and removing the element from the DOM after transition completion. If the app loads under `showDelay` (default 200ms) and `#app-loading` hasn't been shown, it is removed immediately without transition. If it has been shown, a minimum display duration `minShowDuration` (default 500ms) is enforced before fading out.

```typescript
function dismissLoadingScreen(
    targetId?: string,
    scriptId?: string,
    minShowDuration?: number,
    showDelay?: number
): void;
```

---

## Important Technical Details

- **Cooperation with `index.html`:** To prevent animation flashes on page load, `document.body` in the root template (`index.html`) is initialized with the `.preload` class (which disables all CSS transitions globally). Additionally, an initial `#app-loading` element is rendered immediately via inline CSS.
- **Double Frame Delay & Fallback:** `initPreload` waits for the document to be ready and deferentially removes the `.preload` class after **two** consecutive `requestAnimationFrame` render cycles (with fallback timer protection for background tabs), then dismisses `#app-loading`.
- **Explicit Invocation:** `initPreload()` is explicitly invoked at application startup in `main.ts`.
