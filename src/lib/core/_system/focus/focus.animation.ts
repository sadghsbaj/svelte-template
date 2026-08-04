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
    private currentTargetBox: FocusBox | null = null;
    private currentTargetClip: ClipBox | null = null;

    public isAnimating(): boolean {
        return this.animFrame !== 0;
    }

    public updateTarget(newTargetBox: FocusBox, newTargetClip: ClipBox): void {
        if (this.currentTargetBox) {
            Object.assign(this.currentTargetBox, newTargetBox);
        }
        if (this.currentTargetClip) {
            Object.assign(this.currentTargetClip, newTargetClip);
        }
    }

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

        this.currentTargetBox = { ...targetBox };
        this.currentTargetClip = { ...targetClip };

        const prefersReduced = motionPreference.resolved === "reduce";
        if (prefersReduced) {
            this.animFrame = 0;
            onFrame(targetBox, targetClip, { opacity: 1, scale: 1 });
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

            const tBox = this.currentTargetBox || targetBox;
            const tClip = this.currentTargetClip || targetClip;

            onFrame(cur, tClip, {
                opacity: Math.min(1, opacity),
                scale,
                lineWidthOverride,
            });

            if (opacity > 0.95 && Math.abs(scale - 1) < 0.005) {
                this.animFrame = 0;
                onFrame(tBox, tClip, { opacity: 1, scale: 1 });
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
            this.animFrame = 0;
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
                this.animFrame = 0;
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

        this.currentTargetBox = { ...targetBox };
        this.currentTargetClip = { ...targetClip };

        const dist = boxDistance(initialBox, targetBox);
        const prefersReduced = motionPreference.resolved === "reduce";

        // Reduced motion: instant snap
        if (prefersReduced) {
            this.animFrame = 0;
            onFrame(targetBox, targetClip, { opacity: 1, scale: 1 });
            onDone?.();
            return;
        }

        // Same element resize OR short distance (< 120px): smooth lerp without teleport
        if (isSameElement || dist < TELEPORT_THRESHOLD) {
            const cur = { ...initialBox };
            const curClip = { ...initialClip };

            const loop = () => {
                const tBox = this.currentTargetBox || targetBox;
                const tClip = this.currentTargetClip || targetClip;

                cur.x = lerp(cur.x, tBox.x, 0.22);
                cur.y = lerp(cur.y, tBox.y, 0.22);
                cur.w = lerp(cur.w, tBox.w, 0.22);
                cur.h = lerp(cur.h, tBox.h, 0.22);
                cur.r = lerp(cur.r, tBox.r, 0.22);

                const curExp = cur.cornerShape?.type === "squircle" ? cur.cornerShape.exponent : 1;
                const targetExp = tBox.cornerShape?.type === "squircle" ? tBox.cornerShape.exponent : 1;
                if (Math.abs(curExp - targetExp) > 0.01) {
                    const nextExp = lerp(curExp, targetExp, 0.22);
                    cur.cornerShape = { type: "squircle", exponent: nextExp };
                } else {
                    cur.cornerShape = tBox.cornerShape;
                }

                curClip.x = lerp(curClip.x, tClip.x, 0.22);
                curClip.y = lerp(curClip.y, tClip.y, 0.22);
                curClip.w = lerp(curClip.w, tClip.w, 0.22);
                curClip.h = lerp(curClip.h, tClip.h, 0.22);

                onFrame(cur, curClip, { opacity: 1, scale: 1 });

                if (
                    Math.abs(cur.x - tBox.x) > 0.5 ||
                    Math.abs(cur.y - tBox.y) > 0.5 ||
                    Math.abs(cur.w - tBox.w) > 0.5 ||
                    Math.abs(cur.h - tBox.h) > 0.5 ||
                    Math.abs(cur.r - tBox.r) > 0.5
                ) {
                    this.animFrame = requestAnimationFrame(loop);
                } else {
                    this.animFrame = 0;
                    onFrame(tBox, tClip, { opacity: 1, scale: 1 });
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
            const tBox = this.currentTargetBox || targetBox;
            const tClip = this.currentTargetClip || targetClip;

            if (this.phase === 1) {
                // Phase 1: Dissolve Out at Origin (collapse scale & thin line, stay at initial position)
                opacity = lerp(opacity, 0, 0.22);
                scale = lerp(scale, 0.94, 0.22);
                lineWidthOverride = lerp(lineWidthOverride, 0.5, 0.22);

                onFrame(cur, curClip, { opacity, scale, lineWidthOverride });

                if (opacity <= 0.08) {
                    // Switch to target position immediately
                    this.phase = 2;
                    cur = { ...tBox };
                    curClip = { ...tClip };
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

            onFrame(cur, tClip, {
                opacity: Math.min(1, opacity),
                scale,
                lineWidthOverride,
            });

            if (opacity > 0.95 && Math.abs(scale - 1) < 0.005) {
                this.animFrame = 0;
                onFrame(tBox, tClip, { opacity: 1, scale: 1 });
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
        this.currentTargetBox = null;
        this.currentTargetClip = null;
    }
}

