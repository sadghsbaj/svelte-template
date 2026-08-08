# State Migration: Classes to Data Attributes

This temporary document lists all state/modifier markers in the codebase and maps them to their updated, consistent data attribute formats.

## Migration Mapping

| Feature | Target Element | Current State / Selector | Proposed State / Selector | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Theme Mode** | `html` | `.dark` | `[data-theme="dark"]` | Completed |
| **Theme Switching** | `html` | `.theme-switching` | `[data-theme-switching]` | Completed |
| **Motion Reduction** | `html` | `.ui-reduce-motion` | `[data-reduce-motion]` | Completed |
| **Preload State** | `body` | `.preload` | `[data-preload]` | Completed |
| **Loading Visibility** | `#app-loading` | `.visible` | `[data-visible]` | Completed |
| **Loading Fade-out** | `#app-loading` | `.fade-out` | `[data-fade-out]` | Completed |
| **Focus System** | `html` | `[data-canvas-focus]` | `[data-canvas-focus]` | Already Data Attribute |
| **Focus Element Bypass** | Element | `[data-no-canvas-focus]` | `[data-no-canvas-focus]` | Already Data Attribute |
| **Accent Selection** | Element | `[data-selection-on-accent]` | `[data-selection-on-accent]` | Already Data Attribute |
| **Motion Override** | Element | `[data-force-animate]` | `[data-force-animate]` | Already Data Attribute |
