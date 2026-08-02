<script lang="ts">
    import { layerAttach } from "$core/_system/layout/app-layer/layer.svelte";

    let isVisible = $state(false);
    let canvas: HTMLCanvasElement | undefined = $state();
    let ctx: CanvasRenderingContext2D | null = null;

    let targetBox = { x: 0, y: 0, w: 0, h: 0, r: 0 };
    let currentBox = { x: 0, y: 0, w: 0, h: 0, r: 0 };
    const OFFSET = 4;

    $effect(() => {
        if (!canvas) return;
        ctx = canvas.getContext("2d");
        resizeCanvas();
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

    function handleFocusIn(e: FocusEvent) {
        const target = e.target as HTMLElement;

        if (target.closest?.("[data-no-canvas-focus]")) {
            isVisible = false;
            clearCanvas();
        }

        isVisible = true;

        const rect = target.getBoundingClientRect();
        const computedStyle = window.getComputedStyle(target);
        const borderRadius = Number(computedStyle.borderRadius) || 0;

        targetBox = {
            x: rect.x - OFFSET,
            y: rect.y - OFFSET,
            w: rect.width + OFFSET * 2,
            h: rect.height + OFFSET * 2,
            r: borderRadius + OFFSET / 2,
        };

        currentBox = { ...targetBox };
        draw();
    }

    function handleFocusOut(e: FocusEvent) {
        if (!e.relatedTarget) {
            isVisible = false;
        }
    }

    function handleScroll() {}

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

<canvas bind:this={canvas} class="inset-0 fixed" {@attach layerAttach}> test </canvas>
