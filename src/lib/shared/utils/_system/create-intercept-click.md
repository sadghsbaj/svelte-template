# create-intercept-click.ts

A utility factory function that wraps click event handlers to block propagation and default behavior when an element is in an inactive/disabled state.

## API Reference

### Functions

#### `createInterceptClick`

Creates a conditional click handler that intercepts event chains before execution.

```typescript
function createInterceptClick(
    isDisabled: () => boolean,
    onclick: ((e: MouseEvent) => void) | undefined
): (e: MouseEvent) => void;
```

---

## Important Technical Details

- **Event Mitigation:** When `isDisabled()` returns `true`, the returned handler intercepts the event:
    - Calls `e.preventDefault()` to cancel browser default behaviors (such as form submission or link routing).
    - Calls `e.stopPropagation()` to stop the click from bubbling up to parent event listeners.
    - Exits early without calling the original `onclick` callback.
- **Reactive Getter Pattern:** Accepting `isDisabled` as a getter function (`() => boolean`) rather than a static boolean guarantees the returned click handler always reads the latest reactive state (e.g. Svelte 5 derived runes) rather than a stale closure snapshot.
