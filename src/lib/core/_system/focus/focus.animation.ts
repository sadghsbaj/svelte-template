import { motionPreference } from "$core/_system/motion/motion.svelte.js";
import type { ClipBox, FocusBox, FocusPaintState } from "./focus.types.js";
import { boxDistance, lerp } from "./focus.geometry.js";

/** Distance threshold (in px). Short distance (< 120px) morph glides. Long distance (>= 120px) teleports with Houdini pulse. */
const TELEPORT_THRESHOLD = 120;

/** Houdini-style offset collapse shift in px. */
const HOUDINI_OFFSET_COLLAPSE = -3.85;

/**
 * FocusAnimationController:
 *
 * 1. Same Element Resize (`isSameElement = true`): Pure smooth lerp without teleport or pulse.
 * 2. Short Distance (< 120px): Snappy morph glide (factor 0.35) between adjacent items.
 * 3. Long Distance (>= 120px): Houdini Dissolve & Pulse:
 *    - Phase 1 (Dissolve-Out at Origin): Ring dissolves out at old element (~40ms). No flying/sliding across screen.
 *    - Phase 2 (Pulse-In at Target): Ring appears at new element, expanding outward from inside border (-3.85px -> 0px) and fading in (~100ms).
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
        onDone?: () => void,
        isSameElement = false,
        targetLineWidth = 2
    ): void {
        this.stop();

        const dist = boxDistance(initialBox, targetBox);
        const prefersReduced = motionPreference.resolved === "reduce";

        // Reduced motion: instant snap
        if (prefersReduced) {
            onFrame(targetBox, targetClip, { opacity: 1, offsetDelta: 0 });
            onDone?.();
            return;
        }

        // Same element resize OR short distance (< 120px): fast smooth lerp without teleport
        if (isSameElement || dist < TELEPORT_THRESHOLD) {
            const cur = { ...initialBox };
            const curClip = { ...initialClip };

            const loop = () => {
                cur.x = lerp(cur.x, targetBox.x, 0.35);
                cur.y = lerp(cur.y, targetBox.y, 0.35);
                cur.w = lerp(cur.w, targetBox.w, 0.35);
                cur.h = lerp(cur.h, targetBox.h, 0.35);
                cur.r = lerp(cur.r, targetBox.r, 0.35);

                curClip.x = lerp(curClip.x, targetClip.x, 0.35);
                curClip.y = lerp(curClip.y, targetClip.y, 0.35);
                curClip.w = lerp(curClip.w, targetClip.w, 0.35);
                curClip.h = lerp(curClip.h, targetClip.h, 0.35);

                onFrame(cur, curClip, { opacity: 1, offsetDelta: 0 });

                if (
                    Math.abs(cur.x - targetBox.x) > 0.5 ||
                    Math.abs(cur.y - targetBox.y) > 0.5 ||
                    Math.abs(cur.w - targetBox.w) > 0.5
                ) {
                    this.animFrame = requestAnimationFrame(loop);
                } else {
                    onFrame(targetBox, targetClip, { opacity: 1, offsetDelta: 0 });
                    onDone?.();
                }
            };
            this.animFrame = requestAnimationFrame(loop);
            return;
        }

        // Long distance (>= 120px): Houdini Dissolve-Out at Origin -> Pulse-In at Target
        this.phase = 1;
        let cur = { ...initialBox };
        let curClip = { ...initialClip };

        let opacity = 1;
        let offsetDelta = 0;
        let lineWidthOverride = targetLineWidth;

        const loop = () => {
            if (this.phase === 1) {
                // Phase 1: Dissolve Out at Origin (collapse offset & thin line, stay at initial position)
                opacity = lerp(opacity, 0, 0.5);
                offsetDelta = lerp(offsetDelta, HOUDINI_OFFSET_COLLAPSE, 0.5);
                lineWidthOverride = lerp(lineWidthOverride, 0.5, 0.5);

                onFrame(cur, curClip, { opacity, offsetDelta, lineWidthOverride });

                if (opacity <= 0.08) {
                    // Switch to target position immediately
                    this.phase = 2;
                    cur = { ...targetBox };
                    curClip = { ...targetClip };
                    opacity = 0;
                    offsetDelta = HOUDINI_OFFSET_COLLAPSE;
                    lineWidthOverride = 0.5;
                }
                this.animFrame = requestAnimationFrame(loop);
                return;
            }

            // Phase 2: Pulse In at Target (expand offset to 0 & grow line width to target)
            opacity = lerp(opacity, 1, 0.35);
            offsetDelta = lerp(offsetDelta, 0, 0.35);
            lineWidthOverride = lerp(lineWidthOverride, targetLineWidth, 0.35);

            onFrame(cur, curClip, {
                opacity: Math.min(1, opacity),
                offsetDelta,
                lineWidthOverride,
            });

            if (opacity > 0.96 && Math.abs(offsetDelta) < 0.05) {
                onFrame(targetBox, targetClip, { opacity: 1, offsetDelta: 0 });
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
