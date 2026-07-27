# misc.svelte.ts

A collection of browser feature detection utilities, clipboard wrappers, and Svelte 5 reactive network connection trackers.

## API Reference

### Types

```typescript
type BrowserEngine = "blink" | "gecko" | "webkit" | "unknown";
type OS = "ios" | "android" | "macos" | "windows" | "linux" | "unknown";
```

---

### Functions

#### `getBrowserEngine`

Detects the current browser layout engine.

```typescript
function getBrowserEngine(): BrowserEngine;
```

#### `getOS`

Identifies the client Operating System, safely handles iPads spoofing as macOS.

```typescript
function getOS(): OS;
```

#### `isTouchDevice`

Checks if the client device supports touch inputs.

```typescript
function isTouchDevice(): boolean;
```

#### `copyToClipboard`

Copies text to clipboard. Uses the modern `navigator.clipboard` API first, falling back to legacy textarea execution on failure.

```typescript
async function copyToClipboard(text: string): Promise<boolean>;
```

#### `readFromClipboard`

Reads plain text from clipboard. Returns `null` if rejected or unsupported.

```typescript
async function readFromClipboard(): Promise<string | null>;
```

#### `listenOnlineStatus`

Subscribes to internet status changes, executing a lightweight HEAD request with a cache-buster every 30 seconds to catch silent drops (e.g. connected to router but no internet).

```typescript
function listenOnlineStatus(callback: (online: boolean) => void): () => void;
```

- **Returns:** An unsubscribe callback function to clean up listeners and intervals.

---

### Constants / Classes

#### `onlineStatus`

A Svelte 5 rune-based reactive online status singleton.

- **Usage:** Access in components reactively using `onlineStatus.value`.

```typescript
const onlineStatus: {
    readonly value: boolean;
};
```

---

## Important Technical Details

- **iPad Spoofing Resolution:** `getOS()` checks if the platform is `MacIntel` but `navigator.maxTouchPoints > 1` to correctly identify modern iPads that default to spoofing as macOS desktops.
- **Silent Drop Detection:** Standard `navigator.onLine` only checks local router connectivity. `listenOnlineStatus` solves this by performing real `HEAD` requests to `/?_cb=[timestamp]` periodically.
- **Isomorphic Safety:** All window/document accesses are guarded with `typeof window !== "undefined"` checks, making this library safe for Server-Side Rendering (SSR).
