import { motionPreference } from "$core/_system/motion/motion.svelte.js";
import type { FocusBox, ClipBox } from "./focus.types.js";
import { lerp, boxDistance } from "./focus.geometry.js";

export class FocusAnimationController {
    private animFrame: number = 0;
    private phase: 1 | 2 | 3 = 1;

    start(
        targetBox: FocusBox,
        targetClip: ClipBox,
        initialBox: FocusBox,
        initialClip: ClipBox,
        onFrame: (curBox: FocusBox, curClip: ClipBox) => void,
        onDone?: () => void
    ): void {
        this.stop();

        const dist = boxDistance(initialBox, targetBox);
        const prefersReduced = motionPreference.resolved === "reduce";

        if (prefersReduced || dist < 150) {
            if (prefersReduced) {
                onFrame(targetBox, targetClip);
                onDone?.();
                return;
            }

            const currentBox = { ...initialBox };
            const currentClip = { ...initialClip };

            const loop = () => {
                currentBox.x = lerp(currentBox.x, targetBox.x, 0.25);
                currentBox.y = lerp(currentBox.y, targetBox.y, 0.25);
                currentBox.w = lerp(currentBox.w, targetBox.w, 0.25);
                currentBox.h = lerp(currentBox.h, targetBox.h, 0.25);
                currentBox.r = lerp(currentBox.r, targetBox.r, 0.25);

                currentClip.x = lerp(currentClip.x, targetClip.x, 0.25);
                currentClip.y = lerp(currentClip.y, targetClip.y, 0.25);
                currentClip.w = lerp(currentClip.w, targetClip.w, 0.25);
                currentClip.h = lerp(currentClip.h, targetClip.h, 0.25);

                onFrame(currentBox, currentClip);

                const diffX = Math.abs(currentBox.x - targetBox.x);
                const diffY = Math.abs(currentBox.y - targetBox.y);
                const diffW = Math.abs(currentBox.w - targetBox.w);

                if (diffX > 0.5 || diffY > 0.5 || diffW > 0.5) {
                    this.animFrame = requestAnimationFrame(loop);
                } else {
                    onFrame(targetBox, targetClip);
                    onDone?.();
                }
            };
            // eslint-disable-next-line unicorn/prefer-hoisting-branch-code
            this.animFrame = requestAnimationFrame(loop);
        } else {
            this.phase = 1;
            const currentBox = { ...initialBox };
            const currentClip = { ...initialClip };

            const loop = () => {
                currentClip.x = lerp(currentClip.x, targetClip.x, 0.25);
                currentClip.y = lerp(currentClip.y, targetClip.y, 0.25);
                currentClip.w = lerp(currentClip.w, targetClip.w, 0.25);
                currentClip.h = lerp(currentClip.h, targetClip.h, 0.25);

                switch (this.phase) {
                    case 1: {
                        const targetW = 0;
                        const targetH = 0;
                        const cx = currentBox.x + currentBox.w / 2;
                        const cy = currentBox.y + currentBox.h / 2;
                        
                        currentBox.w = lerp(currentBox.w, targetW, 0.3);
                        currentBox.h = lerp(currentBox.h, targetH, 0.3);
                        currentBox.x = cx - currentBox.w / 2;
                        currentBox.y = cy - currentBox.h / 2;

                        if (currentBox.w < 2 && currentBox.h < 2) {
                            this.phase = 2;
                        }
                        break;
                    }
                    case 2: {
                        const cx = currentBox.x + currentBox.w / 2;
                        const cy = currentBox.y + currentBox.h / 2;
                        const tcx = targetBox.x + targetBox.w / 2;
                        const tcy = targetBox.y + targetBox.h / 2;

                        const newCx = lerp(cx, tcx, 0.25);
                        const newCy = lerp(cy, tcy, 0.25);

                        currentBox.x = newCx - currentBox.w / 2;
                        currentBox.y = newCy - currentBox.h / 2;

                        const dist = Math.sqrt(Math.pow(newCx - tcx, 2) + Math.pow(newCy - tcy, 2));
                        if (dist < 5) {
                            this.phase = 3;
                        }
                        break;
                    }
                    case 3: {
                        currentBox.x = lerp(currentBox.x, targetBox.x, 0.2);
                        currentBox.y = lerp(currentBox.y, targetBox.y, 0.2);
                        currentBox.w = lerp(currentBox.w, targetBox.w, 0.2);
                        currentBox.h = lerp(currentBox.h, targetBox.h, 0.2);
                        currentBox.r = lerp(currentBox.r, targetBox.r, 0.2);
                        break;
                    }
                }

                onFrame(currentBox, currentClip);

                if (this.phase !== 3) {
                    this.animFrame = requestAnimationFrame(loop);
                    return;
                }

                const diffX = Math.abs(currentBox.x - targetBox.x);
                const diffY = Math.abs(currentBox.y - targetBox.y);
                const diffW = Math.abs(currentBox.w - targetBox.w);

                if (diffX > 0.5 || diffY > 0.5 || diffW > 0.5) {
                    this.animFrame = requestAnimationFrame(loop);
                    return;
                }

                onFrame(targetBox, targetClip);
                onDone?.();
            };
            this.animFrame = requestAnimationFrame(loop);
        }
    }

    stop(): void {
        if (!this.animFrame) return;

        cancelAnimationFrame(this.animFrame);
        this.animFrame = 0;
    }
}
