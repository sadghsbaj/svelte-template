import { analyzeDomStructure } from "./dom-observer";
import { createFpsObserver, createWebVitalsObserver, getMemoryUsage } from "./metrics-observer";

export class PerformanceState {
    fps = $state(60);
    minFps = $state(60);
    avgFps = $state(60);
    eventLoopLag = $state(0);
    domCount = $state(0);
    domDepth = $state(0);
    cls = $state(0);
    lcp = $state(0);
    inp = $state(0);
    heapUsed = $state(0);
    heapTotal = $state(0);
    isHeatmapActive = $state(false);

    // Inspector State
    isInspectorActive = $state(false);
    selectedElement = $state<HTMLElement | null>(null);

    #isRunning = false;
    #cleanups: (() => void)[] = [];
    #intervalId: ReturnType<typeof setInterval> | null = null;

    toggleHeatmap(): void {
        this.isHeatmapActive = !this.isHeatmapActive;
    }

    stopHeatmap(): void {
        this.isHeatmapActive = false;
    }

    toggleInspector(): void {
        this.isInspectorActive = !this.isInspectorActive;
        if (!this.isInspectorActive) {
            this.selectedElement = null;
        }
    }

    stopInspector(): void {
        this.isInspectorActive = false;
        this.selectedElement = null;
    }

    selectElement(el: HTMLElement | null): void {
        this.selectedElement = el;
    }

    /**
     * Starts performance sampling and observers.
     */
    start(): void {
        if (this.#isRunning || typeof window === "undefined") return;
        this.#isRunning = true;

        // 1. FPS & Lag Observer (with 60s min & avg FPS tracking)
        const stopFps = createFpsObserver(({ fps, minFps, avgFps, lagMs }) => {
            this.fps = fps;
            this.minFps = minFps;
            this.avgFps = avgFps;
            this.eventLoopLag = lagMs;
        });
        this.#cleanups.push(stopFps);

        // 2. Web Vitals Observer
        const stopVitals = createWebVitalsObserver((vitals) => {
            if (vitals.cls !== undefined) this.cls = vitals.cls;
            if (vitals.lcp !== undefined) this.lcp = vitals.lcp;
            if (vitals.inp !== undefined) this.inp = vitals.inp;
        });
        this.#cleanups.push(stopVitals);

        // 3. Periodic DOM and Memory Sampling (every 1.5s)
        const updatePeriodicMetrics = (): void => {
            // DOM Metrics
            const dom = analyzeDomStructure();
            this.domCount = dom.count;
            this.domDepth = dom.depth;

            // Memory Metrics
            const mem = getMemoryUsage();
            this.heapUsed = mem.usedMb;
            this.heapTotal = mem.totalMb;
        };

        updatePeriodicMetrics();
        this.#intervalId = setInterval(updatePeriodicMetrics, 1500);
    }

    /**
     * Stops all performance observers and sampling intervals.
     */
    stop(): void {
        if (!this.#isRunning) return;
        this.#isRunning = false;
        this.isHeatmapActive = false;
        this.isInspectorActive = false;
        this.selectedElement = null;

        if (this.#intervalId !== null) {
            clearInterval(this.#intervalId);
            this.#intervalId = null;
        }

        for (const cleanup of this.#cleanups) {
            try {
                cleanup();
            } catch {
                // ignore
            }
        }
        this.#cleanups = [];
    }
}

export const performanceState = new PerformanceState();
