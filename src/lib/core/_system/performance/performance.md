# Performance Engine (`PerformanceHost.svelte`)

A real-time developer performance overlay and metrics observer utility built with Svelte 5 runes (`$state`, `$derived`) and native browser APIs. It monitors rendering health, DOM complexity, Web Vitals, and JS memory consumption without impacting application runtime.

---

## 📊 Monitored Metrics & Threshold Boundaries

### 1. DOM Health

Monitors DOM node count and maximum nesting tree depth. The overlay container (`#dev-perf-overlay`) and its internal elements are automatically excluded from analysis to avoid self-inflation.

| Metric             | Target / Good | Warning       | Critical   | Description                         |
| :----------------- | :------------ | :------------ | :--------- | :---------------------------------- |
| **Total Elements** | `< 800`       | `800 - 1499`  | `≥ 1500`   | Total rendered DOM element count.   |
| **Max Nesting**    | `< 15 lvl`    | `15 - 24 lvl` | `≥ 25 lvl` | Maximum element nesting tree depth. |

- **Overall DOM Health Badge**: Computed dynamically from both metrics. If either `Total Elements ≥ 1500` or `Max Nesting ≥ 25 lvl`, the overall badge switches to **Critical**. If either threshold is in Warning range, the overall badge switches to **Warning**.

---

### 2. Core Metrics & Event Loop

| Metric       | Target / Good | Description                                                        |
| :----------- | :------------ | :----------------------------------------------------------------- |
| **Live FPS** | `60 FPS`      | Current live frame rate calculated over 1-second render intervals. |
| **Min FPS**  | `≥ 50 FPS`    | Rolling 60-second minimum frame rate to capture render dips.       |
| **Avg FPS**  | `≥ 55 FPS`    | Rolling 60-second average frame rate.                              |
| **Loop Lag** | `< 1.0 ms`    | Main-thread blocking lag beyond ideal ~16.67ms frame intervals.    |

---

### 3. Memory Heap Tiers (5-Step Spectrum Scale)

Monitors V8 JavaScript heap memory (`performance.memory`). A 5-step segmented spectrum scale pill bar visualizes memory tiers:

| Tier Level | Heap Size Range  | Status Label | Color Indicator              |
| :--------: | :--------------- | :----------- | :--------------------------- |
|   **1**    | `0 - 35 MB`      | **Optimal**  | 🟢 Emerald (`#10b981`)       |
|   **2**    | `35.1 - 75 MB`   | **Good**     | 🟢 Light Emerald (`#34d399`) |
|   **3**    | `75.1 - 150 MB`  | **Moderate** | 🟡 Amber (`#fbbf24`)         |
|   **4**    | `150.1 - 300 MB` | **High**     | 🟠 Orange (`#f97316`)        |
|   **5**    | `> 300 MB`       | **Critical** | 🔴 Red (`#ef4444`)           |

---

### 4. Web Vitals (`PerformanceObserver`)

| Metric  | Target / Good | Description                                                                      |
| :------ | :------------ | :------------------------------------------------------------------------------- |
| **CLS** | `< 0.10`      | **Cumulative Layout Shift:** Measures visual stability and layout movement.      |
| **LCP** | `< 2500 ms`   | **Largest Contentful Paint:** Measures perceived loading speed of main content.  |
| **INP** | `< 200 ms`    | **Interaction to Next Paint:** Measures overall UI responsiveness to user input. |

---

## 🏗️ Architecture & Modules

- **`PerformanceHost.svelte`**: Dev-only glassmorphic floating UI container featuring pointer drag-and-drop, viewport clamping, `localStorage` position persistence, and Svelte 5 `{#snippet}` blocks.
- **`performanceState.svelte.ts`**: Reactive Svelte 5 class managing active metric state and handling observer lifecycles (`start()`, `stop()`).
- **`dom-observer.ts`**: Efficient DOM tree walker calculating total nodes and maximum depth while filtering out `#dev-perf-overlay`.
- **`metrics-observer.ts`**: Browser performance observer utilities for Web Vitals, Memory, FPS (with 60s min/avg history), and Event Loop Lag.

---

## 🧪 Testing

Comprehensive unit and integration test coverage is provided:

- `performance.node.test.ts`: SSR safety and non-browser Node environment fallbacks.
- `performance.svelte.test.ts`: Browser DOM tree walking algorithms and `PerformanceState` Svelte 5 rune reactivity.
