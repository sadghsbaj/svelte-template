<script lang="ts">
    import { layerAttach } from "$core/_system/layout/app-layer/layer.svelte";
    import { computeTargetBox } from "./focus.geometry.js";
    import { drawFocusRing, clearCanvas, resolveAccentColor } from "./focus.renderer.js";
    import { FocusAnimationController } from "./focus.animation.js";
    import { focusOverridesMap } from "./focus.attach.js";
    import type { FocusBox, ClipBox, FocusOverrides, FocusPaintState } from "./focus.types.js";

    let isVisible = $state(false);
    let canvas: HTMLCanvasElement | undefined = $state();
    let ctx: CanvasRenderingContext2D | null = null;

    let targetBox: FocusBox = { x: 0, y: 0, w: 0, h: 0, r: 0 };
    let currentBox: FocusBox = { x: 0, y: 0, w: 0, h: 0, r: 0 };

    let targetClip: ClipBox = { x: 0, y: 0, w: 0, h: 0 };
    let currentClip: ClipBox = { x: 0, y: 0, w: 0, h: 0 };

    let activeElement: HTMLElement | null = null;
    let elementObserver: ResizeObserver | null = null;
    let overrides: FocusOverrides | undefined;

    const animController = new FocusAnimationController();
    const OFFSET = 4;

    $effect(() => {
        if (!canvas) return;
        ctx = canvas.getContext("2d");

        handleResize();

        const viewportObserver = new ResizeObserver(() => {
            handleResize();
        });
        viewportObserver.observe(document.documentElement);

        window.addEventListener("scroll", handleScroll, { capture: true, passive: true });

        return () => {
            viewportObserver.disconnect();
            window.removeEventListener("scroll", handleScroll, { capture: true });
            elementObserver?.disconnect();
            animController.stop();
        };
    });

    function getOverridesFor(el: HTMLElement): FocusOverrides | undefined {
        let current: HTMLElement | null = el;
        while (current && current !== document.body) {
            if (focusOverridesMap.has(current)) {
                return focusOverridesMap.get(current);
            }
            current = current.parentElement;
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
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (isVisible && activeElement && doUpdateTargetBox(activeElement)) {
            currentBox = { ...targetBox };
            currentClip = { ...targetClip };
            draw();
        }
    }

    function handleFocusIn(e: FocusEvent) {
        const target = (document.activeElement as HTMLElement) ?? (e.target as HTMLElement);
        if (!target || typeof target.matches !== "function") return;

        const isTextInput =
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable;

        const isFocusVisible = target.matches(":focus-visible") || isTextInput;
        const isNoCanvas = !!target.closest?.("[data-no-canvas-focus]");

        if (!isFocusVisible || isNoCanvas) {
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

        const isInitialFocus = activeElement === null || activeElement === target;
        isVisible = true;

        overrides = getOverridesFor(target);

        if (!elementObserver) {
            elementObserver = new ResizeObserver(() => {
                const el = activeElement;
                if (!isVisible || !el) return;

                const prevW = targetBox.w;
                const prevH = targetBox.h;

                const ok = doUpdateTargetBox(el);
                if (!ok) return;

                // Ignore the initial ResizeObserver notification when observing a new element
                if (Math.abs(targetBox.w - prevW) < 1 && Math.abs(targetBox.h - prevH) < 1) {
                    return;
                }

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

        if (!doUpdateTargetBox(target)) return;

        const prevActiveElement = activeElement;
        activeElement = target;

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
        if (e.relatedTarget) {
            return;
        }

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
    }

    function handleScroll() {
        if (!(isVisible && activeElement)) return;

        if (doUpdateTargetBox(activeElement)) {
            currentBox = { ...targetBox };
            currentClip = { ...targetClip };
            draw();
        }
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
