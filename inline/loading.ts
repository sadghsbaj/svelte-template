/**
 * Record initial load start timestamp immediately at document parse time.
 */
export function markStartTime(): void {
    // eslint-disable-next-line unicorn/no-global-object-property-assignment
    (window as unknown as { __appLoadingStartTime?: number }).__appLoadingStartTime =
        performance.now();
}

/**
 * Initialize and render the app loading canvas animation.
 */
export function initCanvas(): void {
    /* eslint-disable unicorn/prefer-path2d, unicorn/consistent-function-scoping */
    const canvas = document.getElementById("app-loading") as HTMLCanvasElement | null;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number | null = null;

    const resize = (): void => {
        const dpr = window.devicePixelRatio || 1;
        const clientWidth = canvas.clientWidth || window.innerWidth;
        const clientHeight = canvas.clientHeight || window.innerHeight;
        canvas.width = clientWidth * dpr;
        canvas.height = clientHeight * dpr;
    };
    resize();
    // eslint-disable-next-line unicorn/prefer-observer-apis
    window.addEventListener("resize", resize);

    const win = window as unknown as {
        __appLoadingStartTime?: number;
        __appLoadingShowTimer?: ReturnType<typeof setTimeout>;
    };

    const startTime = win.__appLoadingStartTime || performance.now();
    win.__appLoadingStartTime = startTime;
    win.__appLoadingShowTimer = setTimeout(() => {
        canvas.dataset.visible = "";
    }, 200);

    const getSmoothPerimeterPoint = (
        d: number,
        w: number,
        h: number,
        pad: number,
        r: number
    ): [number, number] => {
        const rx = w - 2 * pad;
        const ry = h - 2 * pad;
        const arcLen = 0.5 * Math.PI * r;
        const topSeg = rx - 2 * r;
        const rightSeg = ry - 2 * r;
        const botSeg = topSeg;
        const leftSeg = rightSeg;

        const totalP = 2 * topSeg + 2 * rightSeg + 4 * arcLen;
        let dist = ((d % totalP) + totalP) % totalP;

        if (dist < topSeg) return [pad + r + dist, pad];
        dist -= topSeg;

        if (dist < arcLen) {
            const a1 = -Math.PI / 2 + (dist / arcLen) * (Math.PI / 2);
            return [pad + rx - r + Math.cos(a1) * r, pad + r + Math.sin(a1) * r];
        }
        dist -= arcLen;

        if (dist < rightSeg) return [pad + rx, pad + r + dist];
        dist -= rightSeg;

        if (dist < arcLen) {
            const a2 = (dist / arcLen) * (Math.PI / 2);
            return [pad + rx - r + Math.cos(a2) * r, pad + ry - r + Math.sin(a2) * r];
        }
        dist -= arcLen;

        if (dist < botSeg) return [pad + rx - r - dist, pad + ry];
        dist -= botSeg;

        if (dist < arcLen) {
            const a3 = Math.PI / 2 + (dist / arcLen) * (Math.PI / 2);
            return [pad + r + Math.cos(a3) * r, pad + ry - r + Math.sin(a3) * r];
        }
        dist -= arcLen;

        if (dist < leftSeg) return [pad, pad + ry - r - dist];
        dist -= leftSeg;

        const a4 = Math.PI + (dist / arcLen) * (Math.PI / 2);
        return [pad + r + Math.cos(a4) * r, pad + r + Math.sin(a4) * r];
    };

    const render = (now: number): void => {
        if (!canvas.isConnected) {
            if (animId !== null) cancelAnimationFrame(animId);
            window.removeEventListener("resize", resize);
            return;
        }

        const isDark = document.documentElement.dataset.theme === "dark";
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width;
        const h = canvas.height;

        const bg =
            getComputedStyle(document.documentElement)
                .getPropertyValue("--color-app")
                .trim() || (isDark ? "oklch(14.1% 0.005 285.823)" : "oklch(98.5% 0 0)");
        const accentRgb = isDark ? [96, 165, 250] : [37, 99, 235];

        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        const elapsed = (now - startTime) / 1000;
        const pad = 12 * dpr;
        const cornerR = 20 * dpr;
        const rx = w - 2 * pad;
        const ry = h - 2 * pad;
        const topSeg = rx - 2 * cornerR;
        const rightSeg = ry - 2 * cornerR;
        const arcLen = 0.5 * Math.PI * cornerR;
        const totalPerimeter = 2 * topSeg + 2 * rightSeg + 4 * arcLen;

        const speed = totalPerimeter * 0.22;
        const headDist = (elapsed * speed) % totalPerimeter;
        const tailLength = totalPerimeter * 0.13;
        const segments = 60;
        const strokeWidth = 3.5 * dpr;

        ctx.save();
        ctx.lineWidth = strokeWidth;
        ctx.lineJoin = "round";
        ctx.shadowColor = `rgba(${accentRgb.join(",")}, 0.65)`;
        ctx.shadowBlur = 14 * dpr;

        for (let i = 0; i < segments; i++) {
            const frac1 = i / segments;
            const frac2 = (i + 1) / segments;

            const d1 = headDist - tailLength * (1 - frac1);
            const d2 = headDist - tailLength * (1 - frac2);

            const pt1 = getSmoothPerimeterPoint(d1, w, h, pad, cornerR);
            const pt2 = getSmoothPerimeterPoint(d2, w, h, pad, cornerR);

            const alpha = Math.pow(frac2, 1.8) * (isDark ? 0.95 : 0.85);
            ctx.strokeStyle = `rgba(${accentRgb.join(",")}, ${alpha})`;
            ctx.lineCap = i === segments - 1 ? "round" : "butt";

            ctx.beginPath();
            ctx.moveTo(pt1[0], pt1[1]);
            ctx.lineTo(pt2[0], pt2[1]);
            ctx.stroke();
        }
        ctx.restore();

        animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
}
