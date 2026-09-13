import { motionPreference } from "$core/_system/motion/motion.svelte.js";

import { boxDistance, lerp } from "./focus.geometry.js";
import type { ClipBox, FocusBox, FocusPaintState } from "./focus.types.js";

/** Distance threshold (in px). Short distance (< 240px) morph glides. Long distance (>= 240px) teleports with reveal. */
const TELEPORT_THRESHOLD = 240;

/** Rapid-tab window (ms). If focus changes faster than this, always morph — never teleport. Keeps the ring visible during fast tabbing. */
const RAPID_TAB_MS = 150;

/** Duration of the initial focus appearance reveal (ms). */
const PULSE_IN_MS = 160;
/** Duration of the focus-lost exit (ms). */
const PULSE_OUT_MS = 90;
/** Teleport: exit duration at the origin (ms). */
const TELEPORT_OUT_MS = 70;
/** Teleport: reveal duration at the target (ms). Starts immediately after the out phase (zero gap). */
const TELEPORT_IN_MS = 150;

/**
 * Uniform px the ring is inset at the start of a reveal (and retracts to on an exit).
 *
 * Mirrors the CSS model `outline-offset: -3.85px -> 0px` + `outline-width: 0 -> 3.5px`:
 * the ring *grows outward out of the element edge* and never shrinks. Because this is a
 * flat px value rather than a scale factor, the reveal feels identical on a 40px icon
 * button and a 900px card.
 */
const REVEAL_INSET = 4;
/**
 * Quad-out: leaves immediately, then eases.
 *
 * Used for reveals and exits so the ring immediately responds on initial frame
 * and smoothly dissolves or arrives.
 */
const quadOut = (t: number): number => t * (2 - t);

const clamp01 = (t: number): number => Math.min(1, Math.max(0, t));

/** Resting paint state. Fresh object per call so callers can never alias `lastPaint`. */
const steadyPaint = (): FocusPaintState => ({ opacity: 1, offsetDelta: 0 });

/**
 * Paint state for a reveal at progress `t`.
 *
 * Offset grows `-REVEAL_INSET -> 0`, stroke `0 -> targetLineWidth`, alpha `0 -> 1` — all on
 * the *same* curve, so "thin" always coincides with "transparent". That is why no explicit
 * minimum line width is needed: a sub-pixel stroke is only ever drawn while it is invisible,
 * so the mushy antialiased hairline can never be seen.
 */
function revealPaint(t: number, targetLineWidth: number): FocusPaintState {
    const e = quadOut(clamp01(t));
    return {
        opacity: e,
        offsetDelta: -REVEAL_INSET * (1 - e),
        lineWidthOverride: targetLineWidth * e,
    };
}

/**
 * Paint state for an exit at progress `t` — the mirror of {@link revealPaint}: the ring
 * retracts inward to `-REVEAL_INSET` while stroke and alpha fall to 0.
 *
 * Takes over from `from` (the last painted state) so an interrupted reveal never jumps back
 * to full opacity mid-flight.
 */
function exitPaint(t: number, from: FocusPaintState, targetLineWidth: number): FocusPaintState {
    const e = quadOut(clamp01(t));
    const fromOffset = from.offsetDelta ?? 0;
    const fromLineWidth = from.lineWidthOverride ?? targetLineWidth;
    return {
        opacity: from.opacity * (1 - e),
        offsetDelta: fromOffset + (-REVEAL_INSET - fromOffset) * e,
        lineWidthOverride: fromLineWidth * (1 - e),
    };
}

/**
 * FocusAnimationController — focus ring animations.
 *
 * Reveals and exits are time-based (refresh-rate independent). The morph glide is a
 * per-frame lerp and therefore *is* refresh-rate dependent — intentionally left as-is,
 * its feel is tuned.
 *
 * The reveal/exit visual language is a canvas port of the CSS `outline-offset` +
 * `outline-width` model: the ring grows outward out of the element edge and retracts back
 * into it. Uniform px, monotonic, no scale, no direction reversal.
 *
 * 1. Initial Focus Appearance (`startPulseIn`): 160ms quad-out reveal.
 * 2. Focus Disappearance (`startPulseOut`): 90ms quad-out exit.
 * 3. Same Element Resize (`isSameElement = true`): pure smooth lerp without teleport or reveal.
 * 4. Short Distance (< 240px) or rapid tabbing (< 150ms between focus changes):
 *    buttery smooth morph glide (frame lerp, factor 0.22) between adjacent items.
 * 5. Long Distance (>= 240px) with deliberate focus change: single-timeline exit + reveal
 *    with zero gap:
 *    - 0..70ms   Exit at origin (retracts into the element).
 *    - 70..220ms Reveal at target (grows out of the element), tracking the live target box
 *      each frame so scrollIntoView during the animation cannot end-snap.
 *    Skipped entirely during rapid tabbing — morph is used instead to keep the ring visible.
 *
 * Every animation takes over from the last painted state (`lastPaint`), so rapid focus
 * changes mid-flight never jump back to full opacity (no flicker while fast-tabbing).
 */
export class FocusAnimationController {
    private animFrame: number = 0;
    private currentTargetBox: FocusBox | null = null;
    private currentTargetClip: ClipBox | null = null;
    /** Live geometry of the element the ring is leaving. Only populated during a teleport. */
    private currentOriginBox: FocusBox | null = null;
    private currentOriginClip: ClipBox | null = null;
    /** The most recently painted state. Steady state is `{ opacity: 1, offsetDelta: 0 }`. */
    private lastPaint: FocusPaintState = steadyPaint();
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
     * Updates the live geometry of the element the ring is animating *away from*.
     *
     * Only the teleport exit phase consumes this. All boxes are viewport coordinates, so
     * without it the exiting ring stays pinned to a stale snapshot and visibly detaches from
     * its element whenever the scroll container moves mid-animation (which happens on every
     * tab to an off-screen element once `scroll-behavior: smooth` is in play).
     *
     * A no-op during morphs and reveals, which have no frozen origin to correct.
     */
    public updateOrigin(newOriginBox: FocusBox, newOriginClip: ClipBox): void {
        if (this.currentOriginBox) {
            Object.assign(this.currentOriginBox, newOriginBox);
        }
        if (this.currentOriginClip) {
            Object.assign(this.currentOriginClip, newOriginClip);
        }
    }

    /**
     * Animates an initial focus appearance reveal at targetBox (when no focus ring was previously active).
     * Time-based: 160ms quad-out (offset -4px->0, lineWidth 0->target, opacity 0->1).
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
            this.lastPaint = steadyPaint();
            onFrame(targetBox, targetClip, steadyPaint());
            onDone?.();
            return;
        }

        const cur = { ...targetBox };
        const curClip = { ...targetClip };

        // Synchronous frame 0 render: clears any stale ring before the reveal begins
        this.lastPaint = revealPaint(0, targetLineWidth);
        onFrame(cur, curClip, this.lastPaint);

        const startTime = performance.now();

        const loop = (): void => {
            // Live target tracking: follow scroll / layout shifts during the reveal
            Object.assign(cur, this.currentTargetBox || targetBox);
            Object.assign(curClip, this.currentTargetClip || targetClip);

            const t = (performance.now() - startTime) / PULSE_IN_MS;

            if (t >= 1) {
                this.animFrame = 0;
                this.lastPaint = steadyPaint();
                onFrame(cur, curClip, this.lastPaint);
                onDone?.();
                return;
            }

            this.lastPaint = revealPaint(t, targetLineWidth);
            onFrame(cur, curClip, this.lastPaint);

            this.animFrame = requestAnimationFrame(loop);
        };

        this.animFrame = requestAnimationFrame(loop);
    }

    /**
     * Animates a smooth exit when focus is lost (clicking outside on blank space).
     * Time-based: 90ms quad-out (leaves immediately, then eases), taking over from the
     * last painted state so an interrupted reveal never jumps back to full opacity.
     */
    startPulseOut(
        currentBox: FocusBox,
        currentClip: ClipBox,
        onFrame: (curBox: FocusBox, curClip: ClipBox, paint: FocusPaintState) => void,
        onDone?: () => void,
        targetLineWidth = 2
    ): void {
        const from: FocusPaintState = {
            opacity: Math.min(1, this.lastPaint.opacity),
            offsetDelta: this.lastPaint.offsetDelta ?? 0,
            lineWidthOverride: this.lastPaint.lineWidthOverride ?? targetLineWidth,
        };

        this.stop();

        const prefersReduced = motionPreference.resolved === "reduce";
        if (prefersReduced) {
            this.animFrame = 0;
            this.lastPaint = { opacity: 0, offsetDelta: 0 };
            onFrame(currentBox, currentClip, { opacity: 0 });
            onDone?.();
            return;
        }

        const cur = { ...currentBox };
        const curClip = { ...currentClip };
        const startTime = performance.now();

        const loop = (): void => {
            const t = (performance.now() - startTime) / PULSE_OUT_MS;

            if (t >= 1) {
                this.animFrame = 0;
                this.lastPaint = { opacity: 0, offsetDelta: 0 };
                onFrame(cur, curClip, this.lastPaint);
                onDone?.();
                return;
            }

            this.lastPaint = exitPaint(t, from, targetLineWidth);
            onFrame(cur, curClip, this.lastPaint);

            this.animFrame = requestAnimationFrame(loop);
        };

        this.animFrame = requestAnimationFrame(loop);
    }

    /**
     * Starts animation toward targetBox from initialBox.
     *
     * - Same element / short distance: morph glide (frame lerp — feel intentionally unchanged).
     * - Long distance: single-timeline teleport (exit at origin, reveal at target).
     * - Forced teleport: same timeline regardless of distance or rapid tabbing, allowing callers
     *   to move the renderer between stacking layers while the ring is invisible.
     */
    start(
        targetBox: FocusBox,
        targetClip: ClipBox,
        initialBox: FocusBox,
        initialClip: ClipBox,
        onFrame: (curBox: FocusBox, curClip: ClipBox, paint: FocusPaintState) => void,
        onDone?: () => void,
        isSameElement = false,
        targetLineWidth = 2,
        forceTeleport = false,
        onTeleport?: () => void
    ): void {
        const from: FocusPaintState = {
            opacity: Math.min(1, this.lastPaint.opacity),
            offsetDelta: this.lastPaint.offsetDelta ?? 0,
            lineWidthOverride: this.lastPaint.lineWidthOverride ?? targetLineWidth,
        };

        this.stop();

        this.currentTargetBox = { ...targetBox };
        this.currentTargetClip = { ...targetClip };

        const dist = boxDistance(initialBox, targetBox);
        const prefersReduced = motionPreference.resolved === "reduce";

        // Reduced motion: instant snap
        if (prefersReduced) {
            this.animFrame = 0;
            this.lastPaint = steadyPaint();
            onTeleport?.();
            onFrame(targetBox, targetClip, steadyPaint());
            onDone?.();
            return;
        }

        // Rapid-tab detection: if focus changes faster than RAPID_TAB_MS,
        // always morph — never teleport. Keeps the ring visible during fast tabbing.
        const now = performance.now();
        const isRapidTab = now - this.lastStartTime < RAPID_TAB_MS;
        this.lastStartTime = now;

        // Same element resize, short distance, or rapid tab: smooth lerp without teleport.
        // opacity/offsetDelta/lineWidth only recover toward steady state when a previous
        // animation was interrupted mid-flight; in steady state they stay at 1 / 0 / target
        // (no-op), so the glide itself is driven purely by the box lerp below.
        if (!forceTeleport && (isSameElement || dist < TELEPORT_THRESHOLD || isRapidTab)) {
            const cur = { ...initialBox };
            const curClip = { ...initialClip };

            let opacity = from.opacity;
            let offsetDelta = from.offsetDelta ?? 0;
            let lineWidth = from.lineWidthOverride ?? targetLineWidth;

            const loop = (): void => {
                const tBox = this.currentTargetBox || targetBox;
                const tClip = this.currentTargetClip || targetClip;

                cur.x = lerp(cur.x, tBox.x, 0.22);
                cur.y = lerp(cur.y, tBox.y, 0.22);
                cur.w = lerp(cur.w, tBox.w, 0.22);
                cur.h = lerp(cur.h, tBox.h, 0.22);
                cur.r = lerp(cur.r, tBox.r, 0.22);

                const curExp = cur.cornerShape?.type === "squircle" ? cur.cornerShape.exponent : 1;
                const targetExp =
                    tBox.cornerShape?.type === "squircle" ? tBox.cornerShape.exponent : 1;
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
                offsetDelta = lerp(offsetDelta, 0, 0.22);
                lineWidth = lerp(lineWidth, targetLineWidth, 0.22);

                const paint: FocusPaintState = {
                    opacity,
                    offsetDelta,
                    lineWidthOverride: lineWidth,
                };
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
                    this.lastPaint = steadyPaint();
                    onFrame(cur, curClip, this.lastPaint);
                    onDone?.();
                }
            };
            this.animFrame = requestAnimationFrame(loop);
            return;
        }

        // Long distance (>= 240px) with deliberate (non-rapid) focus change:
        // single timeline — the ring retracts into the origin element, then grows out of the target
        const cur = { ...initialBox };
        const curClip = { ...initialClip };
        const startTime = performance.now();

        // Opt into live origin tracking for the exit phase (see updateOrigin). Only set here,
        // so updateOrigin() stays a no-op for every other animation kind.
        this.currentOriginBox = { ...initialBox };
        this.currentOriginClip = { ...initialClip };
        let hasTeleported = false;

        const loop = (): void => {
            const elapsed = performance.now() - startTime;

            // Phase 1 (0..TELEPORT_OUT_MS): exit at the live origin (retracts inward)
            if (elapsed < TELEPORT_OUT_MS) {
                Object.assign(cur, this.currentOriginBox || initialBox);
                Object.assign(curClip, this.currentOriginClip || initialClip);

                this.lastPaint = exitPaint(elapsed / TELEPORT_OUT_MS, from, targetLineWidth);
                onFrame(cur, curClip, this.lastPaint);

                this.animFrame = requestAnimationFrame(loop);
                return;
            }

            // Phase 2 (..TELEPORT_IN_MS): reveal at the live target (grows outward)
            if (!hasTeleported) {
                hasTeleported = true;
                onTeleport?.();
            }
            Object.assign(cur, this.currentTargetBox || targetBox);
            Object.assign(curClip, this.currentTargetClip || targetClip);

            const t = (elapsed - TELEPORT_OUT_MS) / TELEPORT_IN_MS;

            if (t >= 1) {
                this.animFrame = 0;
                this.lastPaint = steadyPaint();
                onFrame(cur, curClip, this.lastPaint);
                onDone?.();
                return;
            }

            this.lastPaint = revealPaint(t, targetLineWidth);
            onFrame(cur, curClip, this.lastPaint);

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
        this.currentOriginBox = null;
        this.currentOriginClip = null;
    }
}
