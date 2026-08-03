// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { computeTargetBox } from './focus.geometry.js';
import { resolveAccentColor, clearCanvas, drawFocusRing } from './focus.renderer.js';
import { focusAttach, focusOverridesMap } from './focus.attach.js';
import { FocusAnimationController } from './focus.animation.js';
import { motionPreference } from '$core/_system/motion/motion.svelte.js';
import type { FocusBox, ClipBox } from './focus.types.js';

describe('focus.renderer', () => {
    it('resolveAccentColor returns a non-empty string', () => {
        const color = resolveAccentColor();
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
    });

    it('clearCanvas calls clearRect', () => {
        const ctx = { clearRect: vi.fn() } as unknown as CanvasRenderingContext2D;
        const canvas = { width: 100, height: 100 } as HTMLCanvasElement;
        clearCanvas(ctx, canvas);
        expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 100, 100);
    });

    it('drawFocusRing does not throw', () => {
        const ctx = {
            save: vi.fn(),
            beginPath: vi.fn(),
            rect: vi.fn(),
            clip: vi.fn(),
            roundRect: vi.fn(),
            stroke: vi.fn(),
            restore: vi.fn(),
        } as unknown as CanvasRenderingContext2D;
        const canvas = {} as HTMLCanvasElement;
        const currentBox: FocusBox = { x: 0, y: 0, w: 10, h: 10, r: 0 };
        const currentClip: ClipBox = { x: 0, y: 0, w: 10, h: 10 };
        
        expect(() => drawFocusRing(ctx, canvas, currentBox, currentClip)).not.toThrow();
    });
});

describe('focus.geometry DOM functions', () => {
    it('computeTargetBox returns null when element has zero width/height', () => {
        const el = document.createElement('div');
        vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
            width: 0, height: 0, x: 0, y: 0, top: 0, left: 0, bottom: 0, right: 0, toJSON: () => {}
        } as DOMRect);
        
        expect(computeTargetBox(el, 4)).toBeNull();
    });

    it('computeTargetBox returns a valid box when element has size', () => {
        const el = document.createElement('div');
        vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
            width: 100, height: 100, x: 10, y: 10, top: 10, left: 10, bottom: 110, right: 110, toJSON: () => {}
        } as DOMRect);
        
        const result = computeTargetBox(el, 4);
        expect(result).not.toBeNull();
        expect(result?.box.w).toBe(108);
        expect(result?.box.h).toBe(108);
    });
});

describe('focus.attach', () => {
    it('stores and removes overrides from WeakMap', () => {
        const el = document.createElement('div');
        const overrides = { color: 'red' };
        
        const attachFn = focusAttach(overrides);
        const destroy = attachFn(el);
        
        expect(focusOverridesMap.get(el)).toBe(overrides);
        
        if (typeof destroy === 'function') {
            destroy();
        }
        expect(focusOverridesMap.has(el)).toBe(false);
    });
});

describe('FocusAnimationController', () => {
    let controller: FocusAnimationController;
    const targetBox: FocusBox = { x: 100, y: 100, w: 50, h: 50, r: 5 };
    const targetClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };
    
    beforeEach(() => {
        controller = new FocusAnimationController();
        vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => setTimeout(() => cb(performance.now()), 0));
        vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
    });

    it('calling start() with reduced motion calls onDone immediately', () => {
        vi.spyOn(motionPreference, 'resolved', 'get').mockReturnValue('reduce');
        
        const onFrame = vi.fn();
        const onDone = vi.fn();
        
        const initialBox: FocusBox = { x: 0, y: 0, w: 10, h: 10, r: 0 };
        const initialClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };
        
        controller.start(targetBox, targetClip, initialBox, initialClip, onFrame, onDone);
        
        expect(onFrame).toHaveBeenCalledWith(targetBox, targetClip);
        expect(onDone).toHaveBeenCalled();
    });

    it('calling stop() before onDone cancels animation', () => {
        vi.spyOn(motionPreference, 'resolved', 'get').mockReturnValue('no-preference');
        const onFrame = vi.fn();
        const onDone = vi.fn();
        
        const initialBox: FocusBox = { x: 0, y: 0, w: 10, h: 10, r: 0 };
        const initialClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };
        
        controller.start(targetBox, targetClip, initialBox, initialClip, onFrame, onDone);
        controller.stop();
        
        expect(onDone).not.toHaveBeenCalled();
    });

    it('short distance (< 150px) with no reduced motion runs lerp and eventually calls onDone', async () => {
        vi.spyOn(motionPreference, 'resolved', 'get').mockReturnValue('no-preference');
        const onFrame = vi.fn();
        const onDone = vi.fn();
        
        const initialBox: FocusBox = { x: 90, y: 90, w: 40, h: 40, r: 4 }; // Close enough to targetBox
        const initialClip: ClipBox = { x: 0, y: 0, w: 1000, h: 1000 };
        
        controller.start(targetBox, targetClip, initialBox, initialClip, onFrame, onDone);
        
        await new Promise(r => setTimeout(r, 200)); 
        
        expect(onFrame).toHaveBeenCalled();
        expect(onDone).toHaveBeenCalled();
    });
});
