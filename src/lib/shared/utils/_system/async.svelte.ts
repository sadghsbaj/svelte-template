/**
 * @file Optimized and robust asynchronous utility functions for TypeScript applications.
 *
 * Includes promise-based delay, promise timeout wrapper, retry with exponential
 * backoff & jitter, concurrency-limited map (mapLimit), and deferred promises.
 * All functions are AbortSignal-aware and clean up resources to prevent memory leaks.
 */

/**
 * Creates a promise that resolves after a specified delay.
 * Fully compatible with AbortSignal and cleans up listeners to avoid memory leaks.
 */
export function delay(ms: number, options?: { signal?: AbortSignal }): Promise<void> {
    const signal = options?.signal;
    if (signal?.aborted) {
        return Promise.reject(new DOMException("The operation was aborted.", "AbortError"));
    }

    return new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            if (signal) {
                signal.removeEventListener("abort", onAbort);
            }
            resolve();
        }, ms);

        const onAbort = () => {
            clearTimeout(timeoutId);
            reject(new DOMException("The operation was aborted.", "AbortError"));
        };

        if (signal) {
            signal.addEventListener("abort", onAbort);
        }
    });
}

/**
 * Wraps a promise to reject with a TimeoutError if it does not resolve within the specified limit.
 * Cleans up internal timers and supports optional AbortSignal aborts.
 */
export async function timeout<T>(
    promise: Promise<T>,
    ms: number,
    options?: { signal?: AbortSignal; message?: string }
): Promise<T> {
    const signal = options?.signal;
    if (signal?.aborted) {
        throw new DOMException("The operation was aborted.", "AbortError");
    }

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
            reject(new DOMException(options?.message || "The operation timed out.", "TimeoutError"));
        }, ms);
    });

    let onAbort: (() => void) | undefined;
    const abortPromise = signal
        ? new Promise<never>((_, reject) => {
              onAbort = () => reject(new DOMException("The operation was aborted.", "AbortError"));
              signal.addEventListener("abort", onAbort, { once: true });
          })
        : null;

    try {
        const promises: Promise<T>[] = [promise, timeoutPromise];
        if (abortPromise) promises.push(abortPromise);
        return await Promise.race(promises);
    } finally {
        if (timeoutId) clearTimeout(timeoutId);
        if (signal && onAbort) {
            signal.removeEventListener("abort", onAbort);
        }
    }
}

export interface RetryOptions {
    /** Maximum number of retry attempts (default: 3). */
    retries?: number;
    /** Base delay between retries in milliseconds (default: 1000). */
    delay?: number;
    /** Whether to use exponential backoff, doubling the delay each attempt (default: true). */
    exponential?: boolean;
    /** Upper bound for retry delay in milliseconds (default: Infinity). */
    maxDelay?: number;
    /** Whether to apply random jitter (±15%) to prevent thundering herds (default: true). */
    jitter?: boolean;
    /** Optional signal to cancel the retry chain. */
    signal?: AbortSignal;
    /** Callback triggered on each failed attempt. */
    onRetry?: (error: unknown, attempt: number) => void;
}

/**
 * Retries a failed asynchronous operation with configurable backoff, jitter, and cancellation.
 */
export async function retry<T>(fn: () => Promise<T>, options?: RetryOptions): Promise<T> {
    const retries = options?.retries ?? 3;
    const baseDelay = options?.delay ?? 1000;
    const exponential = options?.exponential ?? true;
    const maxDelay = options?.maxDelay ?? Infinity;
    const jitter = options?.jitter ?? true;
    const signal = options?.signal;

    let attempt = 0;

    while (true) {
        if (signal?.aborted) {
            throw new DOMException("The operation was aborted.", "AbortError");
        }

        try {
            return await fn();
        } catch (error) {
            attempt++;
            if (attempt > retries) {
                throw error;
            }

            if (signal?.aborted) {
                throw new DOMException("The operation was aborted.", "AbortError");
            }

            if (options?.onRetry) {
                options.onRetry(error, attempt);
            }

            let delayMs = exponential ? baseDelay * Math.pow(2, attempt - 1) : baseDelay;
            if (delayMs > maxDelay) {
                delayMs = maxDelay;
            }

            if (jitter) {
                const jitterRange = delayMs * 0.15;
                const jitterValue = Math.random() * jitterRange * 2 - jitterRange;
                delayMs = Math.max(0, delayMs + jitterValue);
            }

            await delay(delayMs, { signal });
        }
    }
}

/**
 * Concurrently maps an array of items with a limit on concurrent active promises.
 * Fail-fast: rejects immediately if any worker fails, and halts new task spawns.
 */
export async function mapLimit<T, R>(
    items: T[],
    limit: number,
    fn: (item: T, index: number) => Promise<R>,
    options?: { signal?: AbortSignal }
): Promise<R[]> {
    const signal = options?.signal;
    if (signal?.aborted) {
        throw new DOMException("The operation was aborted.", "AbortError");
    }

    if (items.length === 0) {
        return [];
    }

    const concurrency = Math.min(limit, items.length);
    const results: R[] = Array.from({ length: items.length });
    let nextIndex = 0;
    let failed = false;
    let failureError: unknown = null;

    const worker = async () => {
        while (nextIndex < items.length && !failed) {
            if (signal?.aborted) {
                failed = true;
                failureError = new DOMException("The operation was aborted.", "AbortError");
                break;
            }

            const currentIndex = nextIndex++;
            const item = items[currentIndex];

            try {
                results[currentIndex] = await fn(item, currentIndex);
            } catch (error) {
                failed = true;
                failureError = error;
                break;
            }
        }
    };

    const pool: Promise<void>[] = [];
    for (let i = 0; i < concurrency; i++) {
        pool.push(worker());
    }

    await Promise.all(pool);

    if (failed) {
        throw failureError;
    }

    return results;
}

export interface Deferred<T> {
    promise: Promise<T>;
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: unknown) => void;
}

/**
 * Creates a deferred promise wrapper, exposing resolve and reject handles.
 * Uses native ES2024 Promise.withResolvers().
 */
export function defer<T>(): Deferred<T> {
    return Promise.withResolvers<T>();
}

export interface AsyncStateOptions<T> {
    /** Initial data value before any execution. */
    initialData?: T;
    /** Callback triggered when execution completes successfully. */
    onSuccess?: (data: T) => void;
    /** Callback triggered when execution fails. */
    onError?: (error: Error) => void;
}

/**
 * Svelte 5 Rune-based asynchronous state manager.
 * Exposes reactive loading, error, and data states, and handles
 * automatic race-condition resolution by aborting prior executions.
 */
export class AsyncState<T, Args extends unknown[] = []> {
    #loading = $state(false);
    #error = $state<Error | null>(null);
    #data = $state<T | undefined>(undefined);
    #abortController: AbortController | null = null;
    #fn: (...args: Args) => Promise<T>;
    #options?: AsyncStateOptions<T>;

    constructor(fn: (...args: Args) => Promise<T>, options?: AsyncStateOptions<T>) {
        this.#fn = fn;
        this.#options = options;
        this.#data = options?.initialData;
    }

    get loading(): boolean {
        return this.#loading;
    }

    get error(): Error | null {
        return this.#error;
    }

    get data(): T | undefined {
        return this.#data;
    }

    async execute(...args: Args): Promise<T> {
        // Abort previous execution if it is still running
        if (this.#abortController) {
            this.#abortController.abort();
        }

        this.#abortController = new AbortController();
        const signal = this.#abortController.signal;

        this.#loading = true;
        this.#error = null;

        try {
            const result = await this.#fn(...args);

            if (signal.aborted) {
                throw new DOMException("The operation was aborted.", "AbortError");
            }

            this.#data = result;
            this.#loading = false;

            if (this.#options?.onSuccess) {
                this.#options.onSuccess(result);
            }

            return result;
        } catch (error) {
            if (signal.aborted) {
                throw new DOMException("The operation was aborted.", "AbortError");
            }

            const errorInstance = error instanceof Error ? error : new Error(String(error));
            this.#error = errorInstance;
            this.#loading = false;

            if (this.#options?.onError) {
                this.#options.onError(errorInstance);
            }

            throw errorInstance;
        } finally {
            if (this.#abortController?.signal === signal) {
                this.#abortController = null;
            }
        }
    }

    abort(): void {
        if (!this.#abortController) return;

        this.#abortController.abort();
        this.#abortController = null;
        this.#loading = false;
    }
}
