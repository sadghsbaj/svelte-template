# svelte.ts

Programmatic wrappers for Svelte's native transition, animate, and motion APIs that dynamically intercept animation configuration based on the user's reduced motion preferences.

## API Reference

### Transition Wrappers

Wraps Svelte's native transition functions, forcing `duration: 0` if `motionPreference.resolved === 'reduce'`, unless overridden by setting `forceAnimate: true` in the parameter object.

```typescript
function fade(node: Element, params?: FadeParams & { forceAnimate?: boolean }): TransitionConfig;
function blur(node: Element, params?: BlurParams & { forceAnimate?: boolean }): TransitionConfig;
function fly(node: Element, params?: FlyParams & { forceAnimate?: boolean }): TransitionConfig;
function slide(node: Element, params?: SlideParams & { forceAnimate?: boolean }): TransitionConfig;
function scale(node: Element, params?: ScaleParams & { forceAnimate?: boolean }): TransitionConfig;
function draw(node: SVGElement, params?: DrawParams & { forceAnimate?: boolean }): TransitionConfig;
function crossfade(
    params: Parameters<typeof svelte_crossfade>[0] & { forceAnimate?: boolean }
): [Transition, Transition];
```

### Animation Wrappers

```typescript
function flip(
    node: Element,
    animation: { from: DOMRect; to: DOMRect },
    params?: FlipParams & { forceAnimate?: boolean }
): AnimationConfig;
```

### Motion Classes

#### `Tween`

A wrapper class around Svelte's native `Tween` to dynamically reduce animation speed to 0.

```typescript
class Tween<T> {
    constructor(value: T, options?: TweenOptions<T> & { forceAnimate?: boolean });

    set(value: T, options?: TweenOptions<T> & { forceAnimate?: boolean }): Promise<void>;
    target: T; // setter sets value instantly if reduced motion is active
    readonly current: T;

    static of<U>(fn: () => U, options?: TweenOptions<U> & { forceAnimate?: boolean }): Tween<U>;
}
```

#### `Spring`

A wrapper class around Svelte's native `Spring` to dynamically execute updates instantly.

```typescript
class Spring<T> {
    constructor(value: T, options?: SpringOptions & { forceAnimate?: boolean });

    set(value: T, options?: SpringUpdateOptions & { forceAnimate?: boolean }): Promise<void>;
    target: T; // setter updates instantly if reduced motion is active
    readonly current: T;
    stiffness: number;
    damping: number;
    precision: number;

    static of<U>(fn: () => U, options?: SpringOptions & { forceAnimate?: boolean }): Spring<U>;
}
```

---

## Important Technical Details

- **Signatures & DX Integration:** All functions and classes match Svelte's native API shapes and signatures exactly, making them drop-in replacements.
- **Spring instant override:** While `Tween` sets `duration: 0` to snap values, Svelte `Spring` updates use `instant: true` to bypass spring calculations.
- **Force Override (`forceAnimate`):** If a specific UI element strictly requires animation (e.g. game animations, specialized page loading bars), pass `forceAnimate: true` to bypass the reduced-motion checks and run standard Svelte animation calculations.
