import { motionPreference } from "$core/_system/motion/motion.svelte.js";
import type { ClipBox, FocusBox, FocusPaintState } from "./focus.types.js";
import { boxDistance, lerp } from "./focus.geometry.js";

/** Distance threshold (in px). Short distance (< 120px) morph glides. Long distance (>= 120px) teleports with Houdini pulse. */
const TELEPORT_THRESHOLD = 120;

/**
 * FocusAnimationController:
 *
 * 1. Initial Focus Appearance (`startPulseIn`): Smooth 200ms scale-down pulse (opacity 0->1, scale 1.08->1.0, lineWidth 0.5px->2px).
 * 2. Focus Disappearance (`startPulseOut`): Smooth ~100ms dissolve-out (opacity 1->0, scale 1.0->0.94).
 * 3. Same Element Resize (`isSameElement = true`): Pure smooth lerp without teleport or pulse.
 * 4. Short Distance (< 120px): Buttery smooth morph glide (factor 0.22, ~150ms) between adjacent items.
 * 5. Long Distance (>= 120px): Houdini Dissolve & Pulse:
 *    - Phase 1 (Dissolve-Out at Origin): Ring dissolves & shrinks at old element (~80ms).
 *    - Phase 2 (Pulse-In at Target): Ring appears at new element, scaling down (1.08 -> 1.0) and fading in (~180ms).
 */
export class FocusAnimationController {
    private animFrame: number = 0;
    private phase: 1 | 2 = 1;

    /**
     * Animates an initial focus appearance pulse-in at targetBox (when no focus ring was previously active).
     */
    startPulseIn(
        targetBox: FocusBox,
        targetClip: ClipBox,
        onFrame: (curBox: FocusBox, curClip: ClipBox, paint: FocusPaintState) => void,
        onDone?: () => void,
        targetLineWidth = 2
    ): void {
        this.stop();

        const prefersReduced = motionPreference.resolved === "reduce";
        if (prefersReduced) {
            onFrame(targetBox, targetClip, { opacity: 1, offsetDelta: 0, scale: 1 });
            onDone?.();
            return;
        }

        let opacity = 0;
        let scale = 1.08;
        let lineWidthOverride = 0.5;

        const cur = { ...targetBox };
        const curClip = { ...targetClip };

        // Synchronous frame 0 render to initialize zero opacity
        onFrame(cur, curClip, { opacity: 0, scale: 1.08, lineWidthOverride: 0.5 });

        const loop = () => {
            opacity = lerp(opacity, 1, 0.16);
            scale = lerp(scale, 1, 0.16);
            lineWidthOverride = lerp(lineWidthOverride, targetLineWidth, 0.16);

            onFrame(cur, curClip, {
                opacity: Math.min(1, opacity),
                scale,
                lineWidthOverride,
            });

            if (opacity > 0.95 && Math.abs(scale - 1) < 0.005) {
                onFrame(targetBox, targetClip, { opacity: 1, offsetDelta: 0, scale: 1 });
                onDone?.();
                return;
            }

            this.animFrame = requestAnimationFrame(loop);
        };

        this.animFrame = requestAnimationFrame(loop);
    }

    /**
     * Animates a smooth dissolve-out when focus is lost (clicking outside on blank space).
     */
    startPulseOut(
        currentBox: FocusBox,
        currentClip: ClipBox,
        onFrame: (curBox: FocusBox, curClip: ClipBox, paint: FocusPaintState) => void,
        onDone?: () => void,
        targetLineWidth = 2
    ): void {
        this.stop();

        const prefersReduced = motionPreference.resolved === "reduce";
        if (prefersReduced) {
            onFrame(currentBox, currentClip, { opacity: 0 });
            onDone?.();
            return;
        }

        let opacity = 1;
        let scale = 1;
        let lineWidthOverride = targetLineWidth;

        const cur = { ...currentBox };
        const curClip = { ...currentClip };

        const loop = () => {
            opacity = lerp(opacity, 0, 0.22);
            scale = lerp(scale, 0.94, 0.22);
            lineWidthOverride = lerp(lineWidthOverride, 0.5, 0.22);

            onFrame(cur, curClip, {
                opacity,
                scale,
                lineWidthOverride,
            });

            if (opacity <= 0.05) {
                onFrame(currentBox, currentClip, { opacity: 0, scale: 1 });
                onDone?.();
                return;
            }

            this.animFrame = requestAnimationFrame(loop);
        };

        this.animFrame = requestAnimationFrame(loop);
    }

    /**
     * Starts animation toward targetBox from initialBox.
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
            onFrame(targetBox, targetClip, { opacity: 1, offsetDelta: 0, scale: 1 });
            onDone?.();
            return;
        }

        // Same element resize OR short distance (< 120px): smooth lerp without teleport
        if (isSameElement || dist < TELEPORT_THRESHOLD) {
            const cur = { ...initialBox };
            const curClip = { ...initialClip };

            const loop = () => {
                cur.x = lerp(cur.x, targetBox.x, 0.22);
                cur.y = lerp(cur.y, targetBox.y, 0.22);
                cur.w = lerp(cur.w, targetBox.w, 0.22);
                cur.h = lerp(cur.h, targetBox.h, 0.22);
                cur.r = lerp(cur.r, targetBox.r, 0.22);

                curClip.x = lerp(curClip.x, targetClip.x, 0.22);
                curClip.y = lerp(curClip.y, targetClip.y, 0.22);
                curClip.w = lerp(curClip.w, targetClip.w, 0.22);
                curClip.h = lerp(curClip.h, targetClip.h, 0.22);

                onFrame(cur, curClip, { opacity: 1, offsetDelta: 0, scale: 1 });

                if (
                    Math.abs(cur.x - targetBox.x) > 0.5 ||
                    Math.abs(cur.y - targetBox.y) > 0.5 ||
                    Math.abs(cur.w - targetBox.w) > 0.5
                ) {
                    this.animFrame = requestAnimationFrame(loop);
                } else {
                    onFrame(targetBox, targetClip, { opacity: 1, offsetDelta: 0, scale: 1 });
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
        let scale = 1;
        let lineWidthOverride = targetLineWidth;

        const loop = () => {
            if (this.phase === 1) {
                // Phase 1: Dissolve Out at Origin (collapse scale & thin line, stay at initial position)
                opacity = lerp(opacity, 0, 0.22);
                scale = lerp(scale, 0.94, 0.22);
                lineWidthOverride = lerp(lineWidthOverride, 0.5, 0.22);

                onFrame(cur, curClip, { opacity, scale, lineWidthOverride });

                if (opacity <= 0.08) {
                    // Switch to target position immediately
                    this.phase = 2;
                    cur = { ...targetBox };
                    curClip = { ...targetClip };
                    opacity = 0;
                    scale = 1.08;
                    lineWidthOverride = 0.5;
                }
                this.animFrame = requestAnimationFrame(loop);
                return;
            }

            // Phase 2: Pulse In at Target (scale down from 1.08 -> 1.0 & grow line width to target)
            opacity = lerp(opacity, 1, 0.16);
            scale = lerp(scale, 1, 0.16);
            lineWidthOverride = lerp(lineWidthOverride, targetLineWidth, 0.16);

            onFrame(cur, curClip, {
                opacity: Math.min(1, opacity),
                scale,
                lineWidthOverride,
            });

            if (opacity > 0.95 && Math.abs(scale - 1) < 0.005) {
                onFrame(targetBox, targetClip, { opacity: 1, offsetDelta: 0, scale: 1 });
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
