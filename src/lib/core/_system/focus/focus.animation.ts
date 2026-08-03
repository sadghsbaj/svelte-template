import { motionPreference } from "$core/_system/motion/motion.svelte.js";
import type { ClipBox, FocusBox, FocusPaintState } from "./focus.types.js";
import { boxDistance, lerp } from "./focus.geometry.js";

/** Distance threshold (in px) above which Dissolve + Teleport Pulse activates instead of lerp glide. */
const TELEPORT_THRESHOLD = 120;

/**
 * FocusAnimationController with 2 distinct distance-based modes:
 *
 * 1. Short distance (< 120px): Fast, snappy morph glide (factor 0.32) between adjacent items.
 * 2. Long distance (>= 120px): Native OS-style Teleport & Pulse:
 *    - Phase 1 (Dissolve-Out): Origin ring scales slightly up (1 -> 1.05) & fades out (1 -> 0).
 *    - Phase 2 (Pulse-In): Target ring immediately appears at target, starting slightly enlarged (scale 1.08, opacity 0)
 *      and gracefully scales down (1.08 -> 1) while fading in (0 -> 1).
 */
export class FocusAnimationController {
    private animFrame: number = 0;
    private phase: 1 | 2 = 1;

    /**
     * Starts animation toward targetBox.
     */
    start(
        targetBox: FocusBox,
        targetClip: ClipBox,
        initialBox: FocusBox,
        initialClip: ClipBox,
        onFrame: (curBox: FocusBox, curClip: ClipBox, paint: FocusPaintState) => void,
        onDone?: () => void
    ): void {
        this.stop();

        const dist = boxDistance(initialBox, targetBox);
        const prefersReduced = motionPreference.resolved === "reduce";

        // Reduced motion: instant snap
        if (prefersReduced) {
            onFrame(targetBox, targetClip, { opacity: 1, scale: 1 });
            onDone?.();
            return;
        }

        // Short distance: fast, snappy morph glide
        if (dist < TELEPORT_THRESHOLD) {
            const cur = { ...initialBox };
            const curClip = { ...initialClip };

            const loop = () => {
                cur.x = lerp(cur.x, targetBox.x, 0.32);
                cur.y = lerp(cur.y, targetBox.y, 0.32);
                cur.w = lerp(cur.w, targetBox.w, 0.32);
                cur.h = lerp(cur.h, targetBox.h, 0.32);
                cur.r = lerp(cur.r, targetBox.r, 0.32);

                curClip.x = lerp(curClip.x, targetClip.x, 0.32);
                curClip.y = lerp(curClip.y, targetClip.y, 0.32);
                curClip.w = lerp(curClip.w, targetClip.w, 0.32);
                curClip.h = lerp(curClip.h, targetClip.h, 0.32);

                onFrame(cur, curClip, { opacity: 1, scale: 1 });

                if (
                    Math.abs(cur.x - targetBox.x) > 0.5 ||
                    Math.abs(cur.y - targetBox.y) > 0.5 ||
                    Math.abs(cur.w - targetBox.w) > 0.5
                ) {
                    this.animFrame = requestAnimationFrame(loop);
                } else {
                    onFrame(targetBox, targetClip, { opacity: 1, scale: 1 });
                    onDone?.();
                }
            };
            this.animFrame = requestAnimationFrame(loop);
            return;
        }

        // Long distance: Dissolve-Out at Origin -> Pulse-In at Target
        this.phase = 1;
        let cur = { ...initialBox };
        let curClip = { ...initialClip };

        let opacity = 1;
        let scale = 1;

        const loop = () => {
            if (this.phase === 1) {
                // Phase 1: Dissolve Out at Origin
                opacity = lerp(opacity, 0, 0.35);
                scale = lerp(scale, 1.06, 0.35);

                onFrame(cur, curClip, { opacity, scale });

                if (opacity <= 0.05) {
                    // Switch to target immediately
                    this.phase = 2;
                    cur = { ...targetBox };
                    curClip = { ...targetClip };
                    opacity = 0;
                    scale = 1.08;
                }
                this.animFrame = requestAnimationFrame(loop);
                return;
            }

            // Phase 2: Pulse In at Target
            opacity = lerp(opacity, 1, 0.28);
            scale = lerp(scale, 1, 0.28);

            curClip.x = lerp(curClip.x, targetClip.x, 0.35);
            curClip.y = lerp(curClip.y, targetClip.y, 0.35);
            curClip.w = lerp(curClip.w, targetClip.w, 0.35);
            curClip.h = lerp(curClip.h, targetClip.h, 0.35);

            onFrame(cur, curClip, { opacity: Math.min(1, opacity), scale });

            if (opacity > 0.96 && Math.abs(scale - 1) < 0.005) {
                onFrame(targetBox, targetClip, { opacity: 1, scale: 1 });
                onDone?.();
                return;
            }

            this.animFrame = requestAnimationFrame(loop);
        };

        this.animFrame = requestAnimationFrame(loop);
    }

    /** Cancels any active animation frame. */
    stop(): void {
        if (!this.animFrame) return;
        cancelAnimationFrame(this.animFrame);
        this.animFrame = 0;
    }
}
