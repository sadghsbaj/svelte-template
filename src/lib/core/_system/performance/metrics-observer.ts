/**
 * @file metrics-observer.ts
 * FPS, Event Loop lag, Web Vitals, Memory, and Network observer utilities.
 */

export interface WebVitalsMetrics {
    cls: number;
    lcp: number;
    inp: number;
}

export interface MemoryMetrics {
    usedMb: number;
    totalMb: number;
}

export interface NetworkMetrics {
    requests: number;
    totalSizeKb: number;
}

/**
 * Retrieves current JavaScript heap memory usage safely.
 */
export function getMemoryUsage(): MemoryMetrics {
    if (typeof performance === "undefined") {
        return { usedMb: 0, totalMb: 0 };
    }

    const perfMemory = (
        performance as {
            memory?: {
                usedJSHeapSize?: number;
                jsHeapSizeLimit?: number;
                totalJSHeapSize?: number;
            };
        }
    ).memory;

    if (!perfMemory) {
        return { usedMb: 0, totalMb: 0 };
    }

    const usedBytes = perfMemory.usedJSHeapSize ?? 0;
    const totalBytes = perfMemory.jsHeapSizeLimit ?? perfMemory.totalJSHeapSize ?? 0;

    return {
        usedMb: Math.round((usedBytes / (1024 * 1024)) * 10) / 10,
        totalMb: Math.round((totalBytes / (1024 * 1024)) * 10) / 10,
    };
}

/**
 * Retrieves network resource request counts and total downloaded asset size.
 */
export function getNetworkMetrics(): NetworkMetrics {
    if (typeof performance === "undefined" || typeof performance.getEntriesByType !== "function") {
        return { requests: 0, totalSizeKb: 0 };
    }

    const resources = performance.getEntriesByType("resource") as PerformanceResourceTiming[];
    let totalBytes = 0;

    for (const res of resources) {
        totalBytes += res.transferSize || res.encodedBodySize || 0;
    }

    return {
        requests: resources.length,
        totalSizeKb: Math.round(totalBytes / 1024),
    };
}

/**
 * Starts Web Vitals observers (CLS, LCP, INP) using PerformanceObserver if supported.
 * Returns a cleanup function.
 */
export function createWebVitalsObserver(
    onUpdate: (vitals: Partial<WebVitalsMetrics>) => void
): () => void {
    if (typeof PerformanceObserver === "undefined") {
        return () => {};
    }

    const observers: PerformanceObserver[] = [];

    // CLS (Cumulative Layout Shift)
    try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                const shiftEntry = entry as PerformanceEntry & {
                    hadRecentInput?: boolean;
                    value?: number;
                };
                if (!shiftEntry.hadRecentInput && typeof shiftEntry.value === "number") {
                    clsValue += shiftEntry.value;
                    onUpdate({ cls: Math.round(clsValue * 1000) / 1000 });
                }
            }
        });
        clsObserver.observe({ type: "layout-shift", buffered: true });
        observers.push(clsObserver);
    } catch {
        // Observer type not supported
    }

    // LCP (Largest Contentful Paint)
    try {
        const lcpObserver = new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries.at(-1);
            if (lastEntry) {
                onUpdate({ lcp: Math.round(lastEntry.startTime) });
            }
        });
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
        observers.push(lcpObserver);
    } catch {
        // Observer type not supported
    }

    // INP (Interaction to Next Paint) / Event Timing
    try {
        const inpObserver = new PerformanceObserver((entryList) => {
            let maxDuration = 0;
            for (const entry of entryList.getEntries()) {
                const eventEntry = entry as PerformanceEntry & { duration?: number };
                if (typeof eventEntry.duration === "number" && eventEntry.duration > maxDuration) {
                    maxDuration = eventEntry.duration;
                }
            }
            if (maxDuration > 0) {
                onUpdate({ inp: Math.round(maxDuration) });
            }
        });
        inpObserver.observe({ type: "event", buffered: true });
        observers.push(inpObserver);
    } catch {
        // Observer type not supported
    }

    return () => {
        for (const obs of observers) {
            try {
                obs.disconnect();
            } catch {
                // ignore
            }
        }
    };
}

/**
 * Measures FPS and Event Loop Lag using requestAnimationFrame and delta timing.
 * Returns a cleanup function.
 */
export function createFpsObserver(
    onUpdate: (metrics: { fps: number; lagMs: number }) => void
): () => void {
    if (typeof requestAnimationFrame === "undefined" || typeof performance === "undefined") {
        return () => {};
    }

    let animId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let lastSecond = performance.now();

    function loop(now: number) {
        const delta = now - lastTime;
        lastTime = now;
        frameCount++;

        // Ideal frame duration at 60fps is ~16.67ms
        const expectedDelta = 1000 / 60;
        const lagMs = Math.max(0, Math.round((delta - expectedDelta) * 10) / 10);

        if (now - lastSecond >= 1000) {
            const calculatedFps = Math.min(
                60,
                Math.round((frameCount * 1000) / (now - lastSecond))
            );
            onUpdate({ fps: calculatedFps, lagMs });
            frameCount = 0;
            lastSecond = now;
        }

        animId = requestAnimationFrame(loop);
    }

    animId = requestAnimationFrame(loop);

    return () => {
        if (typeof cancelAnimationFrame === "function") {
            cancelAnimationFrame(animId);
        }
    };
}
