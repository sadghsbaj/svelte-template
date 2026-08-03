import { describe, it, expect } from 'vitest';
import { lerp, boxDistance } from './focus.geometry.js';
import type { FocusBox } from './focus.types.js';

describe('focus.geometry pure functions', () => {
    it('lerp(0, 100, 0.25) === 25', () => {
        expect(lerp(0, 100, 0.25)).toBe(25);
    });

    it('lerp(100, 0, 0.5) === 50', () => {
        expect(lerp(100, 0, 0.5)).toBe(50);
    });

    it('boxDistance between two identical boxes = 0', () => {
        const box1: FocusBox = { x: 10, y: 10, w: 20, h: 20, r: 0 };
        const box2: FocusBox = { x: 10, y: 10, w: 20, h: 20, r: 0 };
        expect(boxDistance(box1, box2)).toBe(0);
    });

    it('boxDistance between distant boxes > 150', () => {
        const box1: FocusBox = { x: 0, y: 0, w: 10, h: 10, r: 0 }; // center (5,5)
        const box2: FocusBox = { x: 200, y: 0, w: 10, h: 10, r: 0 }; // center (205,5)
        expect(boxDistance(box1, box2)).toBeGreaterThan(150);
    });
});
