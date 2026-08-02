<script lang="ts">
    import { layerAttach } from "$core/_system/layout/app-layer/layer.svelte";

    let isVisible = $state(false);
    let canvas: HTMLCanvasElement | undefined = $state();
    let ctx: CanvasRenderingContext2D | null = null;

    let targetBox = { x: 0, y: 0, w: 0, h: 0, r: 0 };
    let currentBox = { x: 0, y: 0, w: 0, h: 0, r: 0 };
    const OFFSET = 4;

    let activeElement: HTMLElement | null = null;
    let animFrame: number;

    const lerp = (start: number, end: number, factor = 0.25) => start + (end - start) * factor;

    $effect(() => {
        if (!canvas) return;
        ctx = canvas.getContext("2d");

        resizeCanvas();

        if (isVisible && activeElement) updateTargetBox(activeElement);
    });

    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (isVisible) draw();
    }

    function clearCanvas() {
        if (!canvas) return;
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }

    function updateTargetBox(el: HTMLElement) {
        const rect = el.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(el);

        // eslint-disable-next-line unicorn/prefer-number-coercion
        const borderRadius = Number.parseFloat(computedStyle.borderRadius) || 0;

        targetBox = {
            x: rect.x - OFFSET,
            y: rect.y - OFFSET,
            w: rect.width + OFFSET * 2,
            h: rect.height + OFFSET * 2,
            r: borderRadius + OFFSET / 2,
        };

        startLoop();
    }

    function startLoop() {
        if (!isVisible) return;

        currentBox.x = lerp(currentBox.x, targetBox.x);
        currentBox.y = lerp(currentBox.y, targetBox.y);
        currentBox.w = lerp(currentBox.w, targetBox.w);
        currentBox.h = lerp(currentBox.h, targetBox.h);
        currentBox.r = lerp(currentBox.r, targetBox.r);

        draw();

        const diffX = Math.abs(currentBox.x - targetBox.x);
        const diffY = Math.abs(currentBox.y - targetBox.y);
        const diffW = Math.abs(currentBox.w - targetBox.w);

        if (diffX > 0.5 || diffY > 0.5 || diffW > 0.5) {
            animFrame = requestAnimationFrame(startLoop);
        } else {
            currentBox = { ...targetBox };
            draw();
            cancelAnimationFrame(animFrame);
        }
    }

    function handleFocusIn(e: FocusEvent) {
        const target = e.target as HTMLElement;

        if (target.closest?.("[data-no-canvas-focus]")) {
            isVisible = false;
            activeElement = null;
            clearCanvas();
            return;
        }

        const wasVisible = isVisible;
        isVisible = true;
        activeElement = target;

        updateTargetBox(target);

        if (!wasVisible) {
            currentBox = { ...targetBox };
            draw();
        }
    }

    function handleFocusOut(e: FocusEvent) {
        if (e.relatedTarget) {
            return;
        }

        isVisible = false;
        activeElement = null;
        cancelAnimationFrame(animFrame);
        clearCanvas();
    }

    function handleScroll() {
        if (isVisible && activeElement) {
            updateTargetBox(activeElement);
        }
    }

    function draw() {
        if (!ctx || !canvas || !isVisible) return;

        clearCanvas();
        ctx.beginPath();
        ctx.roundRect(currentBox.x, currentBox.y, currentBox.w, currentBox.h, currentBox.r);
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.stroke();
    }
</script>

<svelte:window
    onfocusin={handleFocusIn}
    onfocusout={handleFocusOut}
    onscroll={handleScroll}
    onresize={resizeCanvas}
/>

<canvas bind:this={canvas} class="h-full w-full inset-0 fixed" {@attach layerAttach}> test </canvas>
