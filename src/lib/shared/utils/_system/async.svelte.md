# async.svelte.ts

A collection of AbortSignal-aware, memory-safe asynchronous utility helpers, including a reactive Svelte 5 state manager.

## API Reference

### Functions

#### `delay`

Creates a promise that resolves after a specified delay.

```typescript
function delay(ms: number, options?: { signal?: AbortSignal }): Promise<void>;
```

#### `timeout`

Wraps a promise to reject with a `TimeoutError` if it does not resolve within the specified limit.

```typescript
function timeout<T>(
    promise: Promise<T>,
    ms: number,
    options?: { signal?: AbortSignal; message?: string }
): Promise<T>;
```

#### `retry`

Retries a failed asynchronous operation with configurable backoff, jitter, and cancellation.

```typescript
async function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T>;
```

- **RetryOptions:**
    - `retries?: number` (Default: `3`)
    - `delay?: number` (Default: `1000`)
    - `exponential?: boolean` (Default: `true`)
    - `maxDelay?: number` (Default: `Infinity`)
    - `jitter?: boolean` (Default: `true` — adds ±15% variance)
    - `signal?: AbortSignal`
    - `onRetry?: (error: unknown, attempt: number) => void`

#### `mapLimit`

Concurrently maps an array of items with a limit on concurrent active promises. Fail-fast: rejects immediately if any worker fails, and halts spawning new tasks.

```typescript
async function mapLimit<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>,
    options?: { signal?: AbortSignal }
): Promise<R[]>;
```

#### `defer`

Creates a deferred promise wrapper, exposing `resolve` and `reject` handles. Leverages native ES2024 `Promise.withResolvers()`.

```typescript
function defer<T>(): Deferred<T>;
```

---

### Classes

#### `AsyncState`

A Svelte 5 Rune-based asynchronous state manager. Exposes reactive states (`loading`, `error`, `data`) and automatically handles race-condition resolution by aborting prior active executions when `execute()` is called again.

```typescript
class AsyncState<T, Args extends unknown[] = []> {
    constructor(fn: (...args: Args) => Promise<T>, options?: AsyncStateOptions<T>);

    // Reactive Properties
    readonly loading: boolean;
    readonly error: Error | null;
    readonly data: T | undefined;

    // Methods
    execute(...args: Args): Promise<T>;
    abort(): void;
}
```

---

## Important Technical Details

- **Memory Leak Protection:** All functions registered to an `AbortSignal` automatically call `removeEventListener` when they complete or abort to prevent leaks.
- **Race Condition Prevention:** The `AsyncState` class automatically calls `.abort()` on its internal `AbortController` before triggering a new execution block. If an execution is aborted, its resolved/rejected payload is swallowed, preventing old promises from overwriting newer states.
