# Performance Engine (`PerformanceHost.svelte`)

A real-time developer performance overlay and metrics observer utility built with Svelte 5 runes (`$state`, `$derived`) and native browser APIs. It monitors rendering health, DOM complexity, Web Vitals, JS memory consumption, and network activity without impacting application runtime.

---

## 📊 Monitored Metrics & Threshold Boundaries

### 1. DOM Health

Monitors DOM node count and maximum nesting tree depth. The overlay container (`#dev-perf-overlay`) and its internal elements are automatically excluded from analysis to avoid self-inflation.

| Metric             | Description                                             | Status / Thresholds                                                                                             |
| :----------------- | :------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------- |
| **Total Elements** | Count of rendered DOM elements (excluding dev overlay). | 🟢 **Optimal:** `< 800` elements<br>🟡 **Warning:** `800 - 1499` elements<br>🔴 **Critical:** `≥ 1500` elements |
| **Max Nesting**    | Deepest element hierarchy depth (e.g. `12 lvl`).        | Informational tree nesting level indicator.                                                                     |

---

### 2. Core Metrics & Event Loop

| Metric       | Target / Good | Description                                                          |
| :----------- | :------------ | :------------------------------------------------------------------- |
| **FPS**      | `60 FPS`      | Target frame rate computed via `requestAnimationFrame` delta timing. |
| **Loop Lag** | `< 1.0 ms`    | Main-thread blocking lag beyond ideal ~16.67ms frame intervals.      |

---

### 3. Web Vitals (`PerformanceObserver`)

| Metric  | Target / Good | Description                                                                      |
| :------ | :------------ | :------------------------------------------------------------------------------- |
| **CLS** | `< 0.10`      | **Cumulative Layout Shift:** Measures visual stability and layout movement.      |
| **LCP** | `< 2500 ms`   | **Largest Contentful Paint:** Measures perceived loading speed of main content.  |
| **INP** | `< 200 ms`    | **Interaction to Next Paint:** Measures overall UI responsiveness to user input. |

---

### 4. Memory & Network

| Metric          | Description                                                                                               |
| :-------------- | :-------------------------------------------------------------------------------------------------------- |
| **Heap Memory** | `usedJSHeapSize` / `jsHeapSizeLimit` (MB) retrieved via `performance.memory` with safe fallback handling. |
| **Requests**    | Active resource HTTP request entries count retrieved via `performance.getEntriesByType('resource')`.      |
| **Assets**      | Total accumulated downloaded asset payload size in KB.                                                    |

---

## 🏗️ Architecture & Modules

- **`PerformanceHost.svelte`**: Dev-only glassmorphic floating UI container featuring pointer drag-and-drop, viewport clamping, `localStorage` position persistence, and Svelte 5 `{#snippet}` blocks.
- **`performanceState.svelte.ts`**: Reactive Svelte 5 class managing active metric state and handling observer lifecycles (`start()`, `stop()`).
- **`dom-observer.ts`**: Efficient DOM tree walker calculating total nodes and maximum depth while filtering out `#dev-perf-overlay`.
- **`metrics-observer.ts`**: Browser performance observer utilities for Web Vitals, Memory, Network, FPS, and Event Loop Lag.

---

## 🧪 Testing

Comprehensive unit and integration test coverage is provided:

- `performance.node.test.ts`: SSR safety and non-browser Node environment fallbacks.
- `performance.svelte.test.ts`: Browser DOM tree walking algorithms and `PerformanceState` Svelte 5 rune reactivity.
