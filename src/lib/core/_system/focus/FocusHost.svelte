<script lang="ts">
    import { untrack } from "svelte";

    import { layerAttach } from "$core/_system/layout/app-layer/layer.svelte";

    import { FocusAnimationController } from "./focus.animation.js";
    import { focusOverridesMap } from "./focus.attach.js";
    import {
        computeTargetBox,
        getParentElement,
        invalidateGeometryCache,
        resolveFocusTarget,
    } from "./focus.geometry.js";
    import {
        clearCanvas,
        drawFocusRing,
        invalidateAccentColorCache,
        resolveAccentColor,
    } from "./focus.renderer.js";
    import type { ClipBox, FocusBox, FocusOverrides, FocusPaintState } from "./focus.types.js";

    // NOTE: Must be a plain variable, NOT $state. It is only read imperatively (never in
    // the template), and the setup $effect below calls handleResize() which reads it.
    // As $state it became a tracked dependency of that effect: the very first focusin
    // (isVisible false -> true) re-ran the effect, whose cleanup called animController.stop()
    // (killing the just-started pulse-in) and whose body re-drew synchronously at full
    // opacity - producing a hard, unanimated ring on every initial focus.
    let isVisible = false;
    let canvas: HTMLCanvasElement | undefined = $state();
    let ctx: CanvasRenderingContext2D | null = null;

    let targetBox: FocusBox = { x: 0, y: 0, w: 0, h: 0, r: 0 };
    let currentBox: FocusBox = { x: 0, y: 0, w: 0, h: 0, r: 0 };

    let targetClip: ClipBox = { x: 0, y: 0, w: 0, h: 0 };
    let currentClip: ClipBox = { x: 0, y: 0, w: 0, h: 0 };

    let activeElement: HTMLElement | null = null;
    let focusedElement: HTMLElement | null = null;
    let elementObserver: ResizeObserver | null = null;
    let overrides: FocusOverrides | undefined;

    let lastObservedW = 0;
    let lastObservedH = 0;
    let scrollTicking = false;
    let pendingFocusOutTimer: number | null = null;
    let pendingProxyScrollFrame: number | null = null;

    // The element the ring is animating away from, kept together with the offset/lineWidth it
    // was painted with. Needed so the teleport exit phase can re-measure it on scroll without
    // inheriting the *new* element's overrides, which would make the exiting ring jump.
    let exitingElement: HTMLElement | null = null;
    let exitingOffset = 2;
    let exitingLineWidth = 2;

    const animController = new FocusAnimationController();
    const OFFSET = 2;

    $effect(() => {
        if (!canvas) return;
        ctx = canvas.getContext("2d");

        document.documentElement.dataset.canvasFocus = "";

        // This setup effect must only depend on `canvas`. untrack() guards against any
        // reactive reads inside handleResize()/draw() accidentally re-running the effect
        // (its cleanup would stop() running focus animations mid-flight).
        untrack(() => handleResize());

        const viewportObserver = new ResizeObserver(() => {
            handleResize();
        });
        viewportObserver.observe(document.documentElement);

        window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

        return () => {
            delete document.documentElement.dataset.canvasFocus;

            viewportObserver.disconnect();
            window.removeEventListener("scroll", handleScroll, { capture: true });
            elementObserver?.disconnect();
            if (pendingProxyScrollFrame !== null) {
                cancelAnimationFrame(pendingProxyScrollFrame);
                pendingProxyScrollFrame = null;
            }
            exitingElement = null;
            animController.stop();
        };
    });

    function getOverridesFor(el: HTMLElement): FocusOverrides | undefined {
        let current: HTMLElement | null = el;
        while (current && current !== document.documentElement) {
            if (focusOverridesMap.has(current)) {
                return focusOverridesMap.get(current);
            }
            current = getParentElement(current);
        }
        return undefined;
    }

    function doUpdateTargetBox(el: HTMLElement): boolean {
        const result = computeTargetBox(el, overrides?.offset ?? OFFSET, overrides?.lineWidth ?? 2);
        if (!result) {
            isVisible = false;
            if (ctx && canvas) clearCanvas(ctx, canvas);
            return false;
        }
        targetBox = result.box;
        targetClip = result.clip;
        return true;
    }

    function handleResize(): void {
        if (!canvas || !ctx) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(dpr, dpr);

        invalidateAccentColorCache();
        if (activeElement) invalidateGeometryCache(activeElement);

        if (isVisible && activeElement && doUpdateTargetBox(activeElement)) {
            currentBox = { ...targetBox };
            currentClip = { ...targetClip };
            draw();
        }
    }

    function isTargetFocusVisible(el: HTMLElement | null): boolean {
        if (!el || typeof el.matches !== "function") return false;
        const isTextInput =
            el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable;
        const isNoCanvas = !!el.closest?.("[data-no-canvas-focus]");
        return (el.matches(":focus-visible") || isTextInput) && !isNoCanvas;
    }

    function handleFocusIn(e: FocusEvent): void {
        if (pendingFocusOutTimer !== null) {
            cancelAnimationFrame(pendingFocusOutTimer);
            pendingFocusOutTimer = null;
        }

        if (pendingProxyScrollFrame !== null) {
            cancelAnimationFrame(pendingProxyScrollFrame);
            pendingProxyScrollFrame = null;
        }

        const target = (document.activeElement as HTMLElement) ?? (e.target as HTMLElement);
        if (!target || typeof target.matches !== "function") return;

        const isFocusVisible = isTargetFocusVisible(target);

        if (!isFocusVisible) {
            if (isVisible) {
                animController.startPulseOut(
                    currentBox,
                    currentClip,
                    (cBox, cClip, paint) => {
                        currentBox = cBox;
                        currentClip = cClip;
                        draw(paint);
                    },
                    () => {
                        isVisible = false;
                        activeElement = null;
                        focusedElement = null;
                        exitingElement = null;
                        elementObserver?.disconnect();
                        if (ctx && canvas) clearCanvas(ctx, canvas);
                    },
                    overrides?.lineWidth ?? 2
                );
            } else {
                isVisible = false;
                activeElement = null;
                focusedElement = null;
                exitingElement = null;
                if (ctx && canvas) clearCanvas(ctx, canvas);
            }
            return;
        }

        invalidateAccentColorCache();

        const isInitialFocus = focusedElement === null || focusedElement === target;
        isVisible = true;

        // Capture the outgoing element BEFORE `overrides` is reassigned, so its geometry can
        // keep being re-measured during the exit phase with the offset/lineWidth it was
        // actually painted with.
        exitingElement = activeElement;
        exitingOffset = overrides?.offset ?? OFFSET;
        exitingLineWidth = overrides?.lineWidth ?? 2;

        overrides = getOverridesFor(target);

        // Resolve focus redirect: if the focused element has a focusTarget override
        // (or a raw data-focus-target attribute), draw the ring on the resolved element instead.
        const ringElement = resolveFocusTarget(target, overrides?.focusTarget);

        if (!doUpdateTargetBox(ringElement)) return;

        const prevActiveElement = activeElement;
        activeElement = ringElement;
        focusedElement = target;

        if (prevActiveElement && prevActiveElement !== ringElement) {
            invalidateGeometryCache(prevActiveElement);
        }

        lastObservedW = targetBox.w;
        lastObservedH = targetBox.h;

        if (!elementObserver) {
            elementObserver = new ResizeObserver(() => {
                const el = activeElement;
                if (!isVisible || !el) return;

                const ok = doUpdateTargetBox(el);
                if (!ok) return;

                if (
                    Math.abs(targetBox.w - lastObservedW) < 1 &&
                    Math.abs(targetBox.h - lastObservedH) < 1
                ) {
                    return;
                }

                lastObservedW = targetBox.w;
                lastObservedH = targetBox.h;

                animController.start(
                    targetBox,
                    targetClip,
                    currentBox,
                    currentClip,
                    (cBox, cClip, paint) => {
                        currentBox = cBox;
                        currentClip = cClip;
                        draw(paint);
                    },
                    undefined,
                    true,
                    overrides?.lineWidth ?? 2
                );
            });
        }
        elementObserver.disconnect();
        elementObserver.observe(activeElement);

        if (isInitialFocus || !prevActiveElement) {
            currentBox = { ...targetBox };
            currentClip = { ...targetClip };
            animController.startPulseIn(
                targetBox,
                targetClip,
                (cBox, cClip, paint) => {
                    currentBox = cBox;
                    currentClip = cClip;
                    draw(paint);
                },
                undefined,
                overrides?.lineWidth ?? 2
            );
        } else {
            animController.start(
                targetBox,
                targetClip,
                currentBox,
                currentClip,
                (cBox, cClip, paint) => {
                    currentBox = cBox;
                    currentClip = cClip;
                    draw(paint);
                },
                undefined,
                false,
                overrides?.lineWidth ?? 2
            );
        }

        // Scroll redirect. The browser can only ever scroll the *real* focused element into
        // view, but with a focusTarget redirect that element is typically an invisible proxy
        // (e.g. an sr-only input) whose position is unrelated to what the user sees — so the
        // visual target can stay off-screen. Only done when a redirect actually happened;
        // otherwise we would hijack the browser's native focus scrolling, which is better than
        // anything we would do here.
        if (ringElement !== target) {
            // Deferred one frame so we do not fight the browser's own focus scroll, which is
            // still settling around focusin. `nearest` mirrors native behaviour: scroll only
            // when needed, and by the minimum amount. `behavior` is intentionally omitted so
            // the CSS `scroll-behavior` applies (and reduced motion makes it instant).
            pendingProxyScrollFrame = requestAnimationFrame(() => {
                pendingProxyScrollFrame = null;
                // Focus may have moved on during the deferred frame.
                if (activeElement !== ringElement) return;
                ringElement.scrollIntoView({ block: "nearest", inline: "nearest" });
            });
        }
    }

    function handleFocusOut(e: FocusEvent): void {
        const target = e.target as HTMLElement | null;
        if (!target || target !== focusedElement) return;

        if (pendingFocusOutTimer !== null) {
            cancelAnimationFrame(pendingFocusOutTimer);
        }

        pendingFocusOutTimer = requestAnimationFrame(() => {
            pendingFocusOutTimer = null;
            if (focusedElement !== target) return;

            activeElement = null;
            focusedElement = null;
            exitingElement = null;

            animController.startPulseOut(
                currentBox,
                currentClip,
                (cBox, cClip, paint) => {
                    currentBox = cBox;
                    currentClip = cClip;
                    draw(paint);
                },
                () => {
                    isVisible = false;
                    elementObserver?.disconnect();
                    if (ctx && canvas) clearCanvas(ctx, canvas);
                },
                overrides?.lineWidth ?? 2
            );
        });
    }

    function handleScroll(): void {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            scrollTicking = false;
            if (!(isVisible && activeElement)) return;

            if (doUpdateTargetBox(activeElement)) {
                if (animController.isAnimating()) {
                    animController.updateTarget(targetBox, targetClip);

                    // Also re-measure the element being animated away from, so a teleport's
                    // exit phase does not stay pinned to a stale viewport position while the
                    // scroll container moves under it. A no-op for morphs and reveals.
                    if (exitingElement && exitingElement !== activeElement) {
                        const origin = computeTargetBox(
                            exitingElement,
                            exitingOffset,
                            exitingLineWidth
                        );
                        if (origin) animController.updateOrigin(origin.box, origin.clip);
                    }
                } else {
                    currentBox = { ...targetBox };
                    currentClip = { ...targetClip };
                    draw();
                }
            }
        });
    }

    function draw(paint?: FocusPaintState): void {
        if (!ctx || !canvas || !isVisible) return;

        const resolvedColor = resolveAccentColor();
        clearCanvas(ctx, canvas);
        drawFocusRing(
            ctx,
            canvas,
            currentBox,
            currentClip,
            overrides,
            resolvedColor,
            paint ?? { opacity: 1 }
        );
    }
</script>

<svelte:window onfocusin={handleFocusIn} onfocusout={handleFocusOut} />

<canvas
    bind:this={canvas}
    class="h-full w-full pointer-events-none inset-0 fixed"
    {@attach layerAttach}
></canvas>
