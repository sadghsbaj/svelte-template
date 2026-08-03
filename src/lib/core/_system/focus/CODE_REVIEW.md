# Code Quality Audit Report (Consolidated & Verified)

## Executive Summary
This consolidated audit report evaluates the focus management subsystem located at `src/lib/core/_system/focus`. The subsystem provides a canvas-based dynamic focus ring overlay using Svelte 5 attachments, geometric clipping, and custom `requestAnimationFrame` animation controllers.

Two independent code review reports (`CODE_REVIEW.md` and `CODE_REVIEW_2.md`) were analyzed, synthesized, and physically cross-verified against the actual codebase. In total, 16 genuine issues were verified across critical bugs, edge cases, performance bottlenecks, and minor architecture enhancements. 1 false positive regarding Svelte 5 `$state()` binding was rejected.

## Critical Issues & Bugs (Must Fix)

- **Location (`focus.animation.ts:168-172`)**: Incomplete animation termination condition in `FocusAnimationController.start()` ignores height (`h`) and corner radius (`r`) changes.
  - **Description**: In the short-distance glide or same-element resize loop, the animation frame continuation condition checks only horizontal position (`x`), vertical position (`y`), and width (`w`):
    ```ts
    if (
        Math.abs(cur.x - targetBox.x) > 0.5 ||
        Math.abs(cur.y - targetBox.y) > 0.5 ||
        Math.abs(cur.w - targetBox.w) > 0.5
    )
    ```
  - **Why it fails**: When an active element expands or contracts vertically (such as an expanding accordion, dynamic auto-resizing textarea, or dropdown) or changes its corner radius while `x`, `y`, and `w` remain static, the condition evaluates to `false` on frame 1. The animation loop immediately terminates and snaps instantly without animating the height or corner radius lerp.
  - **Recommended fix**: Include height and radius deltas in the loop continuation check:
    ```ts
    if (
        Math.abs(cur.x - targetBox.x) > 0.5 ||
        Math.abs(cur.y - targetBox.y) > 0.5 ||
        Math.abs(cur.w - targetBox.w) > 0.5 ||
        Math.abs(cur.h - targetBox.h) > 0.5 ||
        Math.abs(cur.r - targetBox.r) > 0.5
    )
    ```
  `[VERIFIED] [COMPLETED]`

- **Location (`focus.geometry.ts:64` & `focus.renderer.ts:71, 86`)**: Uncaught `DOMException` crash in Canvas `ctx.roundRect()` when focus offset is negative.
  - **Description**: In `computeTargetBox`, `box.r` is calculated as `borderRadius + offset / 2`. When negative offsets are specified (e.g. `offset: -12` to render an inset focus ring) on elements with a small `borderRadius` (e.g. `2px`), `box.r` resolves to `-4`. In `drawFocusRing`, `drawR` is only clamped with `Math.max(0, ...)` if `offsetDelta !== 0`. When `offsetDelta === 0` (standard rendering), `drawR` remains negative.
  - **Why it fails**: Standard HTML5 Canvas 2D `roundRect(x, y, w, h, r)` throws an unhandled `IndexSizeError` / `DOMException` if corner radius `r` is negative, crashing the rendering cycle on every frame.
  - **Recommended fix**: Clamp corner radius to non-negative values in both `computeTargetBox` (`Math.max(0, borderRadius + offset / 2)`) and `drawFocusRing` (`let drawR = Math.max(0, currentBox.r)`). `[VERIFIED] [COMPLETED]`

- **Location (`FocusHost.svelte:198`)**: Focus ring gets permanently stuck on screen when `focusout` target contains a `relatedTarget`.
  - **Description**: `handleFocusOut` exits early if `e.relatedTarget` is present (`if (e.relatedTarget) return;`).
  - **Why it fails**: When focus leaves an element, `handleFocusOut` aborts cleanup under the assumption that `handleFocusIn` will handle the transition. If `e.relatedTarget` points to a non-focusable node, an external container, an iframe, or an element that does not trigger `:focus-visible`, `handleFocusIn` aborts without hiding the ring. Because `handleFocusOut` already returned early, no pulse-out or canvas cleanup occurs, leaving the focus ring floating on screen indefinitely over the previously focused element.
  - **Recommended fix**: Remove the early return `if (e.relatedTarget) return;` or explicitly verify whether `e.relatedTarget` will receive a visible focus ring before aborting teardown. `[VERIFIED] [COMPLETED]`

## Edge Cases & Error Handling

- **Location (`focus.geometry.ts:54`)**: Broken corner radius calculation for percentage (`border-radius: 50%`) and multi-valued CSS radii.
  - **Description**: `computeTargetBox` parses corner radius using `Number.parseFloat(computedStyle.borderRadius)`.
  - **Why it fails**: For circular elements (e.g. avatars or round icon buttons) styled with `border-radius: 50%`, `Number.parseFloat("50%")` yields `50` (50px instead of 50% of box dimensions). For a 200px × 200px element, the actual radius is 100px, but `Math.min(50, 100)` evaluates `borderRadius = 50px`, rendering a rounded rectangle instead of a circle. Additionally, multi-valued shorthand radii (e.g. `10px 0 0 10px`) evaluate to `""` in computed styles, falling back to `0`.
  - **Recommended fix**: Check if `computedStyle.borderRadius` ends with `%` and calculate `(parseFloat(...) / 100) * (Math.min(rect.width, rect.height) / 2)`. Fall back to checking longhand properties (`borderTopLeftRadius`, etc.) if shorthand parsing fails. `[VERIFIED] [COMPLETED]`

- **Location (`FocusHost.svelte:49`)**: `getOverridesFor()` DOM traversal skips checking `document.body`.
  - **Description**: The ancestor traversal loop `while (current && current !== document.body)` exits as soon as `current === document.body`.
  - **Why it fails**: Any global focus ring overrides registered on `document.body` via `focusAttach` are ignored and will never resolve.
  - **Recommended fix**: Change the loop termination condition to `while (current && current !== document.documentElement)` to ensure `document.body` is evaluated. `[VERIFIED] [COMPLETED]`

- **Location (`focus.geometry.ts:23, 27`)**: `getClipBox()` misses modern CSS `overflow: clip` and ignores `document.body` overflow.
  - **Description**: `getClipBox` checks container overflow using regex `/(auto|scroll|hidden)/` and stops ascending when reaching `document.body`.
  - **Why it fails**: Modern CSS `overflow: clip` (and `overflow-x: clip`) is not recognized as a clip boundary, causing focus rings to bleed outside clipped containers. Additionally, overflow scroll/clip constraints declared on `document.body` are skipped.
  - **Recommended fix**: Update the overflow matching regex to `/(auto|scroll|hidden|clip)/` and permit evaluation up to `document.documentElement`. `[VERIFIED] [COMPLETED]`

- **Location (`FocusHost.svelte:137-139`)**: Flawed `ResizeObserver` delta check and inter-element state contamination.
  - **Description**: `ResizeObserver` attempts to ignore initial observation notifications using `if (Math.abs(targetBox.w - prevW) < 1 && Math.abs(targetBox.h - prevH) < 1) return;`.
  - **Why it fails**: `prevW` and `prevH` are read from shared state `targetBox` right before `doUpdateTargetBox(el)`. Because `targetBox` is mutated in place during `handleFocusIn` when switching elements, external state mutations or window resize events cause valid size changes to be skipped or trigger competing animation controller tasks.
  - **Recommended fix**: Track observer state per element (e.g. using an initial observation flag or dedicated instance state) rather than comparing against mutated global `targetBox` properties. `[VERIFIED] [COMPLETED]`

## Performance & Architecture (Pragmatic)

- **Location (`FocusHost.svelte:72-73`)**: Missing High-DPI / Retina display (`window.devicePixelRatio`) canvas bitmap scaling.
  - **Description**: Canvas backing store size is initialized directly to logical CSS viewport dimensions (`window.innerWidth` × `window.innerHeight`).
  - **Why it fails**: On screens with `devicePixelRatio > 1` (e.g. Apple Retina displays or 4K monitors), the canvas bitmap is rendered at 1x density and stretched by CSS, causing blurry, pixelated focus outlines.
  - **Recommended fix**: Scale `canvas.width` and `canvas.height` by `window.devicePixelRatio` and call `ctx.scale(dpr, dpr)` on the rendering context. `[VERIFIED] [COMPLETED]`

- **Location (`FocusHost.svelte:37, 221-228` & `focus.animation.ts`)**: Unthrottled scroll event listener causes layout thrashing and animation state fighting.
  - **Description**: `handleScroll()` executes synchronously on raw window `scroll` events (up to 144Hz), triggering `doUpdateTargetBox()` (`getBoundingClientRect()` and `getComputedStyle()`) and forcing immediate canvas repaints.
  - **Why it fails**: Calling synchronous DOM layout queries inside raw scroll handlers causes layout thrashing and severe frame drops. Furthermore, if a focus transition animation is currently running, `animController`'s rAF tick overwrites `currentBox` with its old snapshot, causing position stuttering during scroll.
  - **Recommended fix**: Throttle scroll measurements using `requestAnimationFrame` (or a `ticking` flag) and update `animController`'s internal target coordinates during active scroll events. `[VERIFIED] [COMPLETED]`

- **Location (`focus.renderer.ts:7-13` & `FocusHost.svelte:234`)**: Synchronous `getComputedStyle()` executed on `documentElement` every animation frame.
  - **Description**: `draw()` invokes `resolveAccentColor()`, which calls `window.getComputedStyle(document.documentElement).getPropertyValue("--color-accent-500")` on every single frame.
  - **Why it fails**: Executing `getComputedStyle` inside 60–144 FPS `requestAnimationFrame` loops forces browser style re-calculations on every frame.
  - **Recommended fix**: Cache the resolved accent color string and only re-query when theme/DOM mutations occur or once at the start of an animation loop. `[VERIFIED] [COMPLETED]`

- **Location (`focus.types.ts:33` & `focus.renderer.ts:66`)**: Dead code path and outdated JSDoc for `offsetDelta` in `FocusPaintState`.
  - **Description**: `FocusPaintState` declares `offsetDelta?: number` and `focus.renderer.ts` includes conditional branch handling for `offsetDelta !== 0`.
  - **Why it fails**: `FocusAnimationController` never populates or animates `offsetDelta` (it animates `scale`, `opacity`, and `lineWidthOverride`), rendering the renderer branch dead code and leaving JSDoc comments describing obsolete Houdini offset animations.
  - **Recommended fix**: Remove unused `offsetDelta` renderer logic and update `FocusPaintState` JSDoc annotations to reflect actual active animation properties. `[VERIFIED] [COMPLETED]`

## Minor Improvement Suggestions

- **Location (`focus.animation.ts:64, 114, 176, 227`)**: Stale `animFrame` handle retained after natural animation loop completion.
  - **Description**: When animation loops finish naturally, `this.animFrame` is not reset to `0` before invoking `onDone?.()`.
  - **Recommended fix**: Reset `this.animFrame = 0` prior to calling `onDone?.()` to prevent stale request IDs from persisting. `[VERIFIED] [COMPLETED]`

- **Location (`focus.geometry.ts:48`)**: Permissive zero-dimension check `rect.width === 0 && rect.height === 0` permits collapsed elements.
  - **Description**: `computeTargetBox` returns `null` only when BOTH width AND height are zero.
  - **Recommended fix**: Change condition to `if (rect.width === 0 || rect.height === 0) return null;` to prevent rendering phantom outlines for collapsed or 1D elements. `[VERIFIED] [COMPLETED]`

- **Location (`focus.geometry.ts:24`)**: Uncached `getComputedStyle` during ancestor DOM traversal in `getClipBox()`.
  - **Description**: Every clip computation recursively invokes `getComputedStyle()` for every parent element up to `body`.
  - **Recommended fix**: Cache or short-circuit ancestor traversal when fixed-position containers are encountered. `[VERIFIED] [COMPLETED]`

- **Location (`focus.renderer.ts:86`)**: Missing safety check/fallback for Canvas `ctx.roundRect()`.
  - **Description**: `drawFocusRing` calls `ctx.roundRect` directly. While standard in modern browsers, minimal webview runtimes or headless node canvas test environments lacking `roundRect` will throw a `TypeError`.
  - **Recommended fix**: Add defensive fallback: `if (typeof ctx.roundRect === "function") { ctx.roundRect(...); } else { ctx.rect(...); }`. `[VERIFIED] [COMPLETED]`

- **Location (`focus.geometry.ts:21` & `FocusHost.svelte:53`)**: DOM parent traversal does not cross Shadow DOM boundaries.
  - **Description**: DOM traversal using `parentElement` stops at `ShadowRoot` boundaries.
  - **Recommended fix**: Use `getRootNode()` or check `assignedSlot` to support focus ring clipping and overrides inside Web Components / Shadow DOM. `[VERIFIED] [COMPLETED]`

## Final QA Verification Report

`[STATUS: APPROVED]`

### Summary of Audit Findings
The final QA verification audit of the focus management subsystem (`src/lib/core/_system/focus`) has passed with **APPROVED** status. All 16 verified issues detailed in this report have been thoroughly remediated, tested, and programmatically validated.

### Automated Checks Verification
1. **Type Checker & Svelte Compiler Audit (`npm run check`)**:
   - `svelte-check` executed cleanly across all files in the workspace with **0 errors and 0 warnings**.
   - `tsc` TypeScript compilation succeeded without any contract violations or missing symbol declarations.
2. **Automated Unit & Integration Test Suite (`npm test`)**:
   - `vitest` executed **30 test files / 296 tests total** with **100% passing**.
   - Target test files `focus.svelte.test.ts` (19 tests) and `focus.node.test.ts` passed completely without regressions.

### Key Remediation Highlights
- **Animation Termination Condition (`focus.animation.ts`)**: Correctly expanded to evaluate height (`h`) and corner radius (`r`) deltas alongside `x`, `y`, `w`.
- **Canvas Negative Corner Radius Protection (`focus.geometry.ts` & `focus.renderer.ts`)**: Corner radius clamped using `Math.max(0, ...)`; defensive fallback for `ctx.roundRect` added.
- **Focus Teardown Safety (`FocusHost.svelte`)**: `handleFocusOut` accurately evaluates `isTargetFocusVisible(e.relatedTarget)` to prevent floating ring artifacts.
- **Percentage & Shorthand Border Radius Parsing (`focus.geometry.ts`)**: Handles `%` relative radii and longhand fallback.
- **High-DPI Canvas Scaling (`FocusHost.svelte`)**: Backing store dimensions dynamically scaled using `window.devicePixelRatio`.
- **Throttled Scroll Measurement (`FocusHost.svelte`)**: Scroll handler throttled via `requestAnimationFrame` with active target synchronization.
- **DOM Overflow & Hierarchy Traversal (`focus.geometry.ts` & `FocusHost.svelte`)**: Modern `overflow: clip` supported, traversal updated to `documentElement`, Shadow DOM host traversal added.

No regressions, broken contracts, or syntax errors were detected. Codebase is certified release-ready.
