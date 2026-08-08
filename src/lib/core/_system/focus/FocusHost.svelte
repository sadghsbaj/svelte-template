<script lang="ts">
    import { untrack } from "svelte";

    import { layerAttach } from "$core/_system/layout/app-layer/layer.svelte";

    import { FocusAnimationController } from "./focus.animation.js";
    import { focusOverridesMap } from "./focus.attach.js";
    import { computeTargetBox, getParentElement } from "./focus.geometry.js";
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
    let elementObserver: ResizeObserver | null = null;
    let overrides: FocusOverrides | undefined;

    let lastObservedW = 0;
    let lastObservedH = 0;
    let scrollTicking = false;
    let pendingFocusOutTimer: number | null = null;

    const animController = new FocusAnimationController();
    const OFFSET = 4;

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

    function doUpdateTargetBox(el: HTMLElement) {
        const result = computeTargetBox(el, overrides?.offset ?? OFFSET);
        if (!result) {
            isVisible = false;
            if (ctx && canvas) clearCanvas(ctx, canvas);
            return false;
        }
        targetBox = result.box;
        targetClip = result.clip;
        return true;
    }

    function handleResize() {
        if (!canvas || !ctx) return;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
        ctx.scale(dpr, dpr);

        invalidateAccentColorCache();

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

    function handleFocusIn(e: FocusEvent) {
        if (pendingFocusOutTimer !== null) {
            cancelAnimationFrame(pendingFocusOutTimer);
            pendingFocusOutTimer = null;
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
                        elementObserver?.disconnect();
                        if (ctx && canvas) clearCanvas(ctx, canvas);
                    },
                    overrides?.lineWidth ?? 2
                );
            } else {
                isVisible = false;
                activeElement = null;
                if (ctx && canvas) clearCanvas(ctx, canvas);
            }
            return;
        }

        invalidateAccentColorCache();

        const isInitialFocus = activeElement === null || activeElement === target;
        isVisible = true;

        overrides = getOverridesFor(target);

        if (!doUpdateTargetBox(target)) return;

        const prevActiveElement = activeElement;
        activeElement = target;

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
        elementObserver.observe(target);

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
    }

    function handleFocusOut(e: FocusEvent) {
        const target = e.target as HTMLElement | null;
        if (!target || target !== activeElement) return;

        if (pendingFocusOutTimer !== null) {
            cancelAnimationFrame(pendingFocusOutTimer);
        }

        pendingFocusOutTimer = requestAnimationFrame(() => {
            pendingFocusOutTimer = null;
            if (activeElement !== target) return;

            activeElement = null;

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

    function handleScroll() {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(() => {
            scrollTicking = false;
            if (!(isVisible && activeElement)) return;

            if (doUpdateTargetBox(activeElement)) {
                if (animController.isAnimating()) {
                    animController.updateTarget(targetBox, targetClip);
                } else {
                    currentBox = { ...targetBox };
                    currentClip = { ...targetClip };
                    draw();
                }
            }
        });
    }

    function draw(paint?: FocusPaintState) {
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
