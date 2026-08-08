import { motionPreference } from "$core/_system/motion/motion.svelte.js";
import type { ClipBox, FocusBox, FocusPaintState } from "./focus.types.js";
import { boxDistance, lerp } from "./focus.geometry.js";

/** Distance threshold (in px). Short distance (< 240px) morph glides. Long distance (>= 240px) teleports with dissolve & pulse. */
const TELEPORT_THRESHOLD = 240;

/** Rapid-tab window (ms). If focus changes faster than this, always morph — never teleport. Keeps the ring visible during fast tabbing. */
const RAPID_TAB_MS = 150;

/** Duration of the initial focus appearance pulse-in (ms). */
const PULSE_IN_MS = 160;
/** Duration of the focus-lost dissolve-out (ms). */
const PULSE_OUT_MS = 90;
/** Teleport: dissolve-out duration at the origin (ms). */
const TELEPORT_OUT_MS = 70;
/** Teleport: pulse-in duration at the target (ms). Starts immediately after the out phase (zero gap). */
const TELEPORT_IN_MS = 150;

/** Minimum line width during pulses, as a fraction of the target line width (avoids the harsh "double thinning" of opacity + hairline). */
const LINE_WIDTH_MIN = 0.6;
/** Scale the ring shrinks to while dissolving out. */
const SCALE_OUT = 0.96;
/** Scale the ring settles from while pulsing in. */
const SCALE_IN = 1.05;

/** Ease-in cubic: gentle start, accelerates — correct energy profile for exits. */
const cubicIn = (t: number): number => t * t * t;
/** Ease-out cubic: fast start, gentle settle — correct energy profile for entrances. */
const cubicOut = (t: number): number => 1 - (1 - t) ** 3;

/**
 * FocusAnimationController — time-based (refresh-rate independent) focus ring animations.
 *
 * 1. Initial Focus Appearance (`startPulseIn`): 160ms cubic-out pulse (opacity 0->1, scale 1.05->1).
 * 2. Focus Disappearance (`startPulseOut`): 90ms cubic-in dissolve (opacity ->0, scale ->0.96).
 * 3. Same Element Resize (`isSameElement = true`): pure smooth lerp without teleport or pulse.
 * 4. Short Distance (< 240px) or rapid tabbing (< 150ms between focus changes):
 *    buttery smooth morph glide (frame lerp, factor 0.22) between adjacent items.
 * 5. Long Distance (>= 240px) with deliberate focus change: single-timeline Dissolve & Pulse with zero gap:
 *    - 0..70ms   Dissolve-Out at origin (cubic-in: starts gentle, accelerates away).
 *    - 70..220ms Pulse-In at target (cubic-out: appears fast, settles gently), tracking the
 *      live target box each frame so scrollIntoView during the animation cannot end-snap.
 *    Skipped entirely during rapid tabbing — morph is used instead to keep the ring visible.
 *
 * Every animation takes over from the last painted state (`lastPaint`), so rapid focus
 * changes mid-flight never jump back to full opacity (no flicker while fast-tabbing).
 */
export class FocusAnimationController {
    private animFrame: number = 0;
    private currentTargetBox: FocusBox | null = null;
    private currentTargetClip: ClipBox | null = null;
    /** The most recently painted state. Steady state is `{ opacity: 1, scale: 1 }`. */
    private lastPaint: FocusPaintState = { opacity: 1, scale: 1 };
    /** Timestamp of the last start() call — used to detect rapid tabbing. */
    private lastStartTime: number = 0;

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
     * Time-based: 160ms cubic-out (opacity 0->1, scale 1.05->1, lineWidth 60%->100%).
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
            this.lastPaint = { opacity: 1, scale: 1 };
            onFrame(targetBox, targetClip, { opacity: 1, scale: 1 });
            onDone?.();
            return;
        }

        const cur = { ...targetBox };
        const curClip = { ...targetClip };

        // Synchronous frame 0 render: clears any stale ring before the fade begins
        this.lastPaint = { opacity: 0, scale: SCALE_IN, lineWidthOverride: targetLineWidth * LINE_WIDTH_MIN };
        onFrame(cur, curClip, this.lastPaint);

        const startTime = performance.now();

        const loop = () => {
            // Live target tracking: follow scroll / layout shifts during the pulse
            Object.assign(cur, this.currentTargetBox || targetBox);
            Object.assign(curClip, this.currentTargetClip || targetClip);

            const t = Math.min(1, (performance.now() - startTime) / PULSE_IN_MS);
            const e = cubicOut(t);

            if (t >= 1) {
                this.animFrame = 0;
                this.lastPaint = { opacity: 1, scale: 1 };
                onFrame(cur, curClip, this.lastPaint);
                onDone?.();
                return;
            }

            const paint: FocusPaintState = {
                opacity: e,
                scale: SCALE_IN - (SCALE_IN - 1) * e,
                lineWidthOverride: targetLineWidth * (LINE_WIDTH_MIN + (1 - LINE_WIDTH_MIN) * e),
            };
            this.lastPaint = paint;
            onFrame(cur, curClip, paint);

            this.animFrame = requestAnimationFrame(loop);
        };

        this.animFrame = requestAnimationFrame(loop);
    }

    /**
     * Animates a smooth dissolve-out when focus is lost (clicking outside on blank space).
     * Time-based: 90ms cubic-in (starts gentle, accelerates away), taking over from the
     * last painted opacity so an interrupted pulse-in never jumps back to full opacity.
     */
    startPulseOut(
        currentBox: FocusBox,
        currentClip: ClipBox,
        onFrame: (curBox: FocusBox, curClip: ClipBox, paint: FocusPaintState) => void,
        onDone?: () => void,
        targetLineWidth = 2
    ): void {
        const fromOpacity = Math.min(1, this.lastPaint.opacity);
        const fromScale = this.lastPaint.scale ?? 1;
        const fromLineWidth = this.lastPaint.lineWidthOverride ?? targetLineWidth;

        this.stop();

        const prefersReduced = motionPreference.resolved === "reduce";
        if (prefersReduced) {
            this.animFrame = 0;
            this.lastPaint = { opacity: 0, scale: 1 };
            onFrame(currentBox, currentClip, { opacity: 0 });
            onDone?.();
            return;
        }

        const cur = { ...currentBox };
        const curClip = { ...currentClip };
        const startTime = performance.now();

        const loop = () => {
            const t = Math.min(1, (performance.now() - startTime) / PULSE_OUT_MS);
            const e = cubicIn(t);

            if (t >= 1) {
                this.animFrame = 0;
                this.lastPaint = { opacity: 0, scale: 1 };
                onFrame(cur, curClip, this.lastPaint);
                onDone?.();
                return;
            }

            const paint: FocusPaintState = {
                opacity: fromOpacity * (1 - e),
                scale: fromScale + (SCALE_OUT - fromScale) * e,
                lineWidthOverride: fromLineWidth - (fromLineWidth - targetLineWidth * LINE_WIDTH_MIN) * e,
            };
            this.lastPaint = paint;
            onFrame(cur, curClip, paint);

            this.animFrame = requestAnimationFrame(loop);
        };

        this.animFrame = requestAnimationFrame(loop);
    }

    /**
     * Starts animation toward targetBox from initialBox.
     *
     * - Same element / short distance: morph glide (frame lerp — feel intentionally unchanged).
     * - Long distance: single-timeline teleport (dissolve-out at origin, pulse-in at target).
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
        const fromOpacity = Math.min(1, this.lastPaint.opacity);
        const fromScale = this.lastPaint.scale ?? 1;
        const fromLineWidth = this.lastPaint.lineWidthOverride ?? targetLineWidth;

        this.stop();

        this.currentTargetBox = { ...targetBox };
        this.currentTargetClip = { ...targetClip };

        const dist = boxDistance(initialBox, targetBox);
        const prefersReduced = motionPreference.resolved === "reduce";

        // Reduced motion: instant snap
        if (prefersReduced) {
            this.animFrame = 0;
            this.lastPaint = { opacity: 1, scale: 1 };
            onFrame(targetBox, targetClip, { opacity: 1, scale: 1 });
            onDone?.();
            return;
        }

        // Rapid-tab detection: if focus changes faster than RAPID_TAB_MS,
        // always morph — never teleport. Keeps the ring visible during fast tabbing.
        const now = performance.now();
        const isRapidTab = now - this.lastStartTime < RAPID_TAB_MS;
        this.lastStartTime = now;

        // Same element resize, short distance, or rapid tab: smooth lerp without teleport.
        // opacity/scale/lineWidth only recover toward steady state when a previous animation
        // was interrupted mid-flight; in steady state they stay at 1 / 1 / target (no-op).
        if (isSameElement || dist < TELEPORT_THRESHOLD || isRapidTab) {
            const cur = { ...initialBox };
            const curClip = { ...initialClip };

            let opacity = fromOpacity;
            let scale = fromScale;
            let lineWidth = fromLineWidth;

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

                opacity = Math.min(1, lerp(opacity, 1, 0.22));
                scale = lerp(scale, 1, 0.22);
                lineWidth = lerp(lineWidth, targetLineWidth, 0.22);

                const paint: FocusPaintState = { opacity, scale, lineWidthOverride: lineWidth };
                this.lastPaint = paint;
                onFrame(cur, curClip, paint);

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
                    Object.assign(cur, tBox);
                    Object.assign(curClip, tClip);
                    this.lastPaint = { opacity: 1, scale: 1 };
                    onFrame(cur, curClip, this.lastPaint);
                    onDone?.();
                }
            };
            this.animFrame = requestAnimationFrame(loop);
            return;
        }

        // Long distance (>= 240px) with deliberate (non-rapid) focus change:
        // single timeline — Dissolve-Out at origin, Pulse-In at target
        const cur = { ...initialBox };
        const curClip = { ...initialClip };
        const startTime = performance.now();

        const loop = () => {
            const elapsed = performance.now() - startTime;

            // Phase 1 (0..TELEPORT_OUT_MS): dissolve out at the origin (cubic-in exit)
            if (elapsed < TELEPORT_OUT_MS) {
                const e = cubicIn(elapsed / TELEPORT_OUT_MS);

                const paint: FocusPaintState = {
                    opacity: fromOpacity * (1 - e),
                    scale: fromScale + (SCALE_OUT - fromScale) * e,
                    lineWidthOverride: fromLineWidth - (fromLineWidth - targetLineWidth * LINE_WIDTH_MIN) * e,
                };
                this.lastPaint = paint;
                onFrame(cur, curClip, paint);

                this.animFrame = requestAnimationFrame(loop);
                return;
            }

            // Phase 2 (..TELEPORT_IN_MS): pulse in at the live target (cubic-out entrance)
            Object.assign(cur, this.currentTargetBox || targetBox);
            Object.assign(curClip, this.currentTargetClip || targetClip);

            const t = Math.min(1, (elapsed - TELEPORT_OUT_MS) / TELEPORT_IN_MS);
            const e = cubicOut(t);

            if (t >= 1) {
                this.animFrame = 0;
                this.lastPaint = { opacity: 1, scale: 1 };
                onFrame(cur, curClip, this.lastPaint);
                onDone?.();
                return;
            }

            const paint: FocusPaintState = {
                opacity: e,
                scale: SCALE_IN - (SCALE_IN - 1) * e,
                lineWidthOverride: targetLineWidth * (LINE_WIDTH_MIN + (1 - LINE_WIDTH_MIN) * e),
            };
            this.lastPaint = paint;
            onFrame(cur, curClip, paint);

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
