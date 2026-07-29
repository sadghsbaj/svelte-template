import { describe, expect, test, vi } from "vitest";

import { AsyncState, defer, delay, mapLimit, retry, timeout } from "./async.svelte";

describe("Async Utilities", () => {
    describe("delay", () => {
        test("should resolve after specified duration", async () => {
            const start = Date.now();
            await delay(15);
            const duration = Date.now() - start;
            expect(duration).toBeGreaterThanOrEqual(10); // buffer for timer precision
        });

        test("should reject immediately if signal is already aborted", async () => {
            const controller = new AbortController();
            controller.abort();

            await expect(delay(100, { signal: controller.signal })).rejects.toThrow(/aborted/i);
        });

        test("should abort delay when signal is triggered", async () => {
            const controller = new AbortController();
            const promise = delay(1000, { signal: controller.signal });

            setTimeout(() => controller.abort(), 10);

            await expect(promise).rejects.toThrow(/aborted/i);
        });
    });

    describe("timeout", () => {
        test("should resolve if promise resolves before timeout", async () => {
            const fastPromise = (async () => {
                await delay(10);
                return "success";
            })();
            const result = await timeout(fastPromise, 50);
            expect(result).toBe("success");
        });

        test("should reject if promise rejects before timeout", async () => {
            const failingPromise = (async () => {
                await delay(10);
                throw new Error("failed");
            })();
            await expect(timeout(failingPromise, 50)).rejects.toThrow("failed");
        });

        test("should reject with TimeoutError if promise takes too long", async () => {
            const slowPromise = (async () => {
                await delay(100);
                return "slow";
            })();
            const resultPromise = timeout(slowPromise, 15, { message: "Custom timeout message" });

            await expect(resultPromise).rejects.toThrow("Custom timeout message");
            await expect(resultPromise).rejects.toBeInstanceOf(DOMException);
        });

        test("should respect AbortSignal", async () => {
            const controller = new AbortController();
            const promise = (async () => {
                await delay(100);
                return "done";
            })();
            const timedPromise = timeout(promise, 50, { signal: controller.signal });

            setTimeout(() => controller.abort(), 10);

            await expect(timedPromise).rejects.toThrow(/aborted/i);
        });
    });

    describe("retry", () => {
        test("should succeed immediately on first successful attempt", async () => {
            const fn = vi.fn().mockResolvedValue("success");
            const result = await retry(fn, { retries: 2, delay: 1 });
            expect(result).toBe("success");
            expect(fn).toHaveBeenCalledTimes(1);
        });

        test("should retry and resolve if it succeeds eventually", async () => {
            let attempts = 0;
            const fn = vi.fn(async () => {
                attempts++;
                if (attempts < 3) throw new Error("temp failure");
                return "resolved";
            });

            const result = await retry(fn, { retries: 3, delay: 1, exponential: false, jitter: false });
            expect(result).toBe("resolved");
            expect(fn).toHaveBeenCalledTimes(3);
        });

        test("should throw the final error if all retries fail", async () => {
            const fn = vi.fn().mockRejectedValue(new Error("fatal error"));

            await expect(retry(fn, { retries: 2, delay: 1, exponential: false, jitter: false })).rejects.toThrow(
                "fatal error"
            );
            expect(fn).toHaveBeenCalledTimes(3); // Initial try + 2 retries
        });

        test("should abort retry loop if signal is triggered", async () => {
            const controller = new AbortController();
            const fn = vi.fn().mockRejectedValue(new Error("failure"));

            const promise = retry(fn, {
                retries: 5,
                delay: 200,
                exponential: false,
                jitter: false,
                signal: controller.signal,
            });

            // Abort after first attempt starts waiting
            setTimeout(() => controller.abort(), 50);

            await expect(promise).rejects.toThrow(/aborted/i);
            expect(fn).toHaveBeenCalledTimes(1);
        });
    });

    describe("mapLimit", () => {
        test("should map all elements correctly", async () => {
            const items = [1, 2, 3, 4, 5];
            const result = await mapLimit(items, 2, async (x) => x * 2);
            expect(result).toEqual([2, 4, 6, 8, 10]);
        });

        test("should limit concurrency to the specified value", async () => {
            const items = [1, 2, 3, 4];
            let activeTasks = 0;
            let maxActiveTasks = 0;

            const fn = async (x: number) => {
                activeTasks++;
                maxActiveTasks = Math.max(maxActiveTasks, activeTasks);
                await delay(10);
                activeTasks--;
                return x;
            };

            await mapLimit(items, 2, fn);
            expect(maxActiveTasks).toBeLessThanOrEqual(2);
        });

        test("should stop spawning tasks and fail fast on error", async () => {
            const items = [1, 2, 3, 4, 5];
            const fn = vi.fn(async (x) => {
                if (x === 2) throw new Error("crash");
                await delay(10);
                return x;
            });

            await expect(mapLimit(items, 1, fn)).rejects.toThrow("crash");
            // Since limit is 1 and it crashes at item 2, items 3, 4, 5 should never be processed
            expect(fn).toHaveBeenCalledTimes(2);
        });

        test("should respect AbortSignal", async () => {
            const controller = new AbortController();
            const items = [1, 2, 3, 4, 5];

            const promise = mapLimit(
                items,
                1,
                async (x) => {
                    if (x === 2) controller.abort();
                    await delay(5);
                    return x;
                },
                { signal: controller.signal }
            );

            await expect(promise).rejects.toThrow(/aborted/i);
        });
    });

    describe("defer", () => {
        test("should resolve deferred promise", async () => {
            const deferred = defer<string>();

            setTimeout(() => deferred.resolve("resolved value"), 10);

            const result = await deferred.promise;
            expect(result).toBe("resolved value");
        });

        test("should reject deferred promise", async () => {
            const deferred = defer<number>();

            setTimeout(() => deferred.reject(new Error("rejected value")), 10);

            await expect(deferred.promise).rejects.toThrow("rejected value");
        });
    });

    describe("AsyncState", () => {
        test("should track loading, success data, and trigger onSuccess", async () => {
            const successSpy = vi.fn();
            const task = new AsyncState(
                async (val: string) => {
                    await delay(10);
                    return `result: ${val}`;
                },
                {
                    onSuccess: successSpy,
                    initialData: "initial",
                }
            );

            expect(task.loading).toBe(false);
            expect(task.error).toBeNull();
            expect(task.data).toBe("initial");

            const promise = task.execute("hello");
            expect(task.loading).toBe(true);

            const res = await promise;
            expect(res).toBe("result: hello");
            expect(task.loading).toBe(false);
            expect(task.data).toBe("result: hello");
            expect(task.error).toBeNull();
            expect(successSpy).toHaveBeenCalledWith("result: hello");
        });

        test("should track loading, error, and trigger onError", async () => {
            const errorSpy = vi.fn();
            const task = new AsyncState(
                async () => {
                    await delay(10);
                    throw new Error("failed task");
                },
                {
                    onError: errorSpy,
                }
            );

            const promise = task.execute();
            expect(task.loading).toBe(true);

            await expect(promise).rejects.toThrow("failed task");
            expect(task.loading).toBe(false);
            expect(task.error?.message).toBe("failed task");
            expect(task.data).toBeUndefined();
            expect(errorSpy).toHaveBeenCalledWith(expect.any(Error));
        });

        test("should auto-abort previous executions on re-entrance to prevent race conditions", async () => {
            const successSpy = vi.fn();
            const task = new AsyncState(
                async (time: number) => {
                    await delay(time);
                    return `done ${time}`;
                },
                {
                    onSuccess: successSpy,
                }
            );

            let finallyExecuted = false;
            const p1 = (async () => {
                try {
                    return await task.execute(30);
                } finally {
                    finallyExecuted = true;
                }
            })();

            const p2 = task.execute(10);

            await expect(p1).rejects.toThrow(/aborted/i);
            expect(finallyExecuted).toBe(true);

            const r2 = await p2;
            expect(r2).toBe("done 10");

            // task data should be the result of the second execution (newer task)
            expect(task.data).toBe("done 10");
            expect(successSpy).toHaveBeenCalledTimes(1);
            expect(successSpy).toHaveBeenCalledWith("done 10");
        });

        test("should support manual abort and unblock caller with AbortError", async () => {
            const task = new AsyncState(async () => {
                await delay(50);
                return "never resolved";
            });

            let finallyExecuted = false;
            const promise = (async () => {
                try {
                    return await task.execute();
                } finally {
                    finallyExecuted = true;
                }
            })();

            expect(task.loading).toBe(true);

            task.abort();
            expect(task.loading).toBe(false);
            expect(task.data).toBeUndefined();

            await expect(promise).rejects.toThrow(/aborted/i);
            expect(finallyExecuted).toBe(true);
        });
    });
});
