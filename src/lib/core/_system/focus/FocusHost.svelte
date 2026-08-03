<script lang="ts">
    import { layerAttach } from "$core/_system/layout/app-layer/layer.svelte";

    let isVisible = $state(false);
    let canvas: HTMLCanvasElement | undefined = $state();
    let ctx: CanvasRenderingContext2D | null = null;

    let targetBox = { x: 0, y: 0, w: 0, h: 0, r: 0 };
    let currentBox = { x: 0, y: 0, w: 0, h: 0, r: 0 };

    let targetClip = { x: 0, y: 0, w: 0, h: 0 };
    let currentClip = { x: 0, y: 0, w: 0, h: 0 };

    const OFFSET = 4;

    let activeElement: HTMLElement | null = null;
    let animFrame: number;
    let elementObserver: ResizeObserver | null = null;

    const lerp = (start: number, end: number, factor = 0.25) => start + (end - start) * factor;

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
            // EDGE CASE FIX: Animation stoppen, wenn Komponente zerstört wird
            cancelAnimationFrame(animFrame);
        };
    });

    function handleResize() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        if (isVisible && activeElement) {
            updateTargetBox(activeElement);
            currentBox = { ...targetBox };
            currentClip = { ...targetClip };
            draw();
        }
    }

    function clearCanvas() {
        if (!canvas) return;
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    function getClipBox(el: HTMLElement) {
        let top = 0;
        let left = 0;
        let bottom = window.innerHeight;
        let right = window.innerWidth;

        let parent = el.parentElement;

        while (parent && parent !== document.body && parent !== document.documentElement) {
            const style = window.getComputedStyle(parent);
            const overflow = style.overflow + style.overflowX + style.overflowY;

            if (/(auto|scroll|hidden)/.test(overflow)) {
                const rect = parent.getBoundingClientRect();
                top = Math.max(top, rect.top);
                left = Math.max(left, rect.left);
                bottom = Math.min(bottom, rect.bottom);
                right = Math.min(right, rect.right);
            }
            parent = parent.parentElement;
        }

        return {
            x: left,
            y: top,
            w: Math.max(0, right - left),
            h: Math.max(0, bottom - top),
        };
    }

    function updateTargetBox(el: HTMLElement) {
        const rect = el.getBoundingClientRect();

        // EDGE CASE FIX: Element hat keine Größe mehr (z.B. display: none)
        if (rect.width === 0 && rect.height === 0) {
            isVisible = false;
            clearCanvas();
            return;
        }

        const computedStyle = window.getComputedStyle(el);
        // eslint-disable-next-line unicorn/prefer-number-coercion
        let borderRadius = Number.parseFloat(computedStyle.borderRadius) || 0;

        // EDGE CASE FIX: Verhindern, dass %-Werte oder extreme Radien das Canvas sprengen
        const maxRadius = Math.min(rect.width, rect.height) / 2;
        borderRadius = Math.min(borderRadius, maxRadius);

        targetBox = {
            x: rect.x - OFFSET,
            y: rect.y - OFFSET,
            w: rect.width + OFFSET * 2,
            h: rect.height + OFFSET * 2,
            r: borderRadius + OFFSET / 2,
        };

        targetClip = getClipBox(el);

        startLoop();
    }

    function startLoop() {
        if (!isVisible) return;

        currentBox.x = lerp(currentBox.x, targetBox.x);
        currentBox.y = lerp(currentBox.y, targetBox.y);
        currentBox.w = lerp(currentBox.w, targetBox.w);
        currentBox.h = lerp(currentBox.h, targetBox.h);
        currentBox.r = lerp(currentBox.r, targetBox.r);

        currentClip.x = lerp(currentClip.x, targetClip.x);
        currentClip.y = lerp(currentClip.y, targetClip.y);
        currentClip.w = lerp(currentClip.w, targetClip.w);
        currentClip.h = lerp(currentClip.h, targetClip.h);

        draw();

        const diffX = Math.abs(currentBox.x - targetBox.x);
        const diffY = Math.abs(currentBox.y - targetBox.y);
        const diffW = Math.abs(currentBox.w - targetBox.w);

        if (diffX > 0.5 || diffY > 0.5 || diffW > 0.5) {
            animFrame = requestAnimationFrame(startLoop);
        } else {
            currentBox = { ...targetBox };
            currentClip = { ...targetClip };
            draw();
            cancelAnimationFrame(animFrame);
        }
    }

    function handleFocusIn(e: FocusEvent) {
        const target = e.target as HTMLElement;

        // NEU: Die :focus-visible Magie!
        // Wenn das Element den Browser-Heuristiken für :focus-visible nicht entspricht,
        // oder explizit opt-out hat, brechen wir ab.
        if (!target.matches(":focus-visible") || target.closest?.("[data-no-canvas-focus]")) {
            isVisible = false;
            activeElement = null;
            clearCanvas();
            return;
        }

        const wasVisible = isVisible;
        isVisible = true;
        activeElement = target;

        if (!elementObserver) {
            elementObserver = new ResizeObserver(() => {
                if (isVisible && activeElement) updateTargetBox(activeElement);
            });
        }
        elementObserver.disconnect();
        elementObserver.observe(target);

        updateTargetBox(target);

        if (!wasVisible) {
            currentBox = { ...targetBox };
            currentClip = { ...targetClip };
            draw();
        }
    }

    function handleFocusOut(e: FocusEvent) {
        if (e.relatedTarget) {
            return;
        }

        isVisible = false;
        activeElement = null;
        elementObserver?.disconnect();
        cancelAnimationFrame(animFrame);
        clearCanvas();
    }

    function handleScroll() {
        if (!(isVisible && activeElement)) return;

        updateTargetBox(activeElement);
        currentBox = { ...targetBox };
        currentClip = { ...targetClip };
        draw();
    }

    function draw() {
        if (!ctx || !canvas || !isVisible) return;

        clearCanvas();

        ctx.save();

        ctx.beginPath();
        ctx.rect(currentClip.x, currentClip.y, currentClip.w, currentClip.h);
        ctx.clip();

        ctx.beginPath();
        ctx.roundRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h, currentBox.r);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
</script>

<svelte:window onfocusin={handleFocusIn} onfocusout={handleFocusOut} />

<canvas
    bind:this={canvas}
    class="h-full w-full pointer-events-none inset-0 fixed"
    {@attach layerAttach}
></canvas>
