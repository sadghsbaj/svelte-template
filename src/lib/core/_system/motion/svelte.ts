/**
 * @file svelte.ts
 * Programmatic wrappers for Svelte's native transition, animate, and motion APIs.
 *
 * This module exports wrappers for all Svelte built-in animations that dynamically
 * intercept their configurations. When global motion preference is resolved to 'reduce',
 * these wrappers override durations to 0 (or set 'instant: true' for springs) to instantly
 * snap values, unless explicitly bypassed using the `forceAnimate` option.
 *
 * This maintains identical signatures and developer experience (DX) while ensuring
 * strict integration with our library's central motion logic.
 */

import { flip as svelte_flip, type AnimationConfig, type FlipParams } from "svelte/animate";
import {
    Spring as SvelteSpring,
    Tween as SvelteTween,
    type SpringOptions,
    type SpringUpdateOptions,
    type TweenOptions,
} from "svelte/motion";
import {
    blur as svelte_blur,
    crossfade as svelte_crossfade,
    draw as svelte_draw,
    fade as svelte_fade,
    fly as svelte_fly,
    scale as svelte_scale,
    slide as svelte_slide,
    type BlurParams,
    type DrawParams,
    type FadeParams,
    type FlyParams,
    type ScaleParams,
    type SlideParams,
    type TransitionConfig,
} from "svelte/transition";

import { MotionManager, motionPreference } from "./motion.svelte";

export type { AnimationConfig, FlipParams } from "svelte/animate";
export type { SpringOptions, SpringUpdateOptions, TweenOptions, Updater } from "svelte/motion";
export type {
    BlurParams,
    CrossfadeParams,
    DrawParams,
    EasingFunction,
    FadeParams,
    FlyParams,
    ScaleParams,
    SlideParams,
    TransitionConfig,
} from "svelte/transition";

/**
 * Utility type extending Svelte transition/animation parameters with an optional forceAnimate override.
 */
export type MotionParams<T = Record<string, unknown>> = T & { forceAnimate?: boolean };

/**
 * Custom fade transition wrapper.
 */
export function fade(
    node: Element,
    params?: MotionParams<FadeParams>,
    manager?: MotionManager
): TransitionConfig {
    const { forceAnimate = false, ...restParams } = params || {};
    const config = svelte_fade(node, restParams);
    const activeManager = manager ?? motionPreference;
    if (!forceAnimate && activeManager.resolved === "reduce") {
        return { ...config, duration: 0 };
    }
    return config;
}

/**
 * Custom blur transition wrapper.
 */
export function blur(
    node: Element,
    params?: MotionParams<BlurParams>,
    manager?: MotionManager
): TransitionConfig {
    const { forceAnimate = false, ...restParams } = params || {};
    const config = svelte_blur(node, restParams);
    const activeManager = manager ?? motionPreference;
    if (!forceAnimate && activeManager.resolved === "reduce") {
        return { ...config, duration: 0 };
    }
    return config;
}

/**
 * Custom fly transition wrapper.
 */
export function fly(
    node: Element,
    params?: MotionParams<FlyParams>,
    manager?: MotionManager
): TransitionConfig {
    const { forceAnimate = false, ...restParams } = params || {};
    const config = svelte_fly(node, restParams);
    const activeManager = manager ?? motionPreference;
    if (!forceAnimate && activeManager.resolved === "reduce") {
        return { ...config, duration: 0 };
    }
    return config;
}

/**
 * Custom slide transition wrapper.
 */
export function slide(
    node: Element,
    params?: MotionParams<SlideParams>,
    manager?: MotionManager
): TransitionConfig {
    const { forceAnimate = false, ...restParams } = params || {};
    const config = svelte_slide(node, restParams);
    const activeManager = manager ?? motionPreference;
    if (!forceAnimate && activeManager.resolved === "reduce") {
        return { ...config, duration: 0 };
    }
    return config;
}

/**
 * Custom scale transition wrapper.
 */
export function scale(
    node: Element,
    params?: MotionParams<ScaleParams>,
    manager?: MotionManager
): TransitionConfig {
    const { forceAnimate = false, ...restParams } = params || {};
    const config = svelte_scale(node, restParams);
    const activeManager = manager ?? motionPreference;
    if (!forceAnimate && activeManager.resolved === "reduce") {
        return { ...config, duration: 0 };
    }
    return config;
}

/**
 * Custom draw transition wrapper.
 */
export function draw(
    node: SVGElement & { getTotalLength(): number },
    params?: MotionParams<DrawParams>,
    manager?: MotionManager
): TransitionConfig {
    const { forceAnimate = false, ...restParams } = params || {};
    const config = svelte_draw(node, restParams);
    const activeManager = manager ?? motionPreference;
    if (!forceAnimate && activeManager.resolved === "reduce") {
        return { ...config, duration: 0 };
    }
    return config;
}

export type CrossfadeFn = <P extends { key: unknown }>(
    node: Element,
    params: MotionParams<P>
) => () => TransitionConfig;

export type CrossfadeResult = [CrossfadeFn, CrossfadeFn];

/**
 * Custom crossfade transition wrapper.
 */
export function crossfade(
    params: MotionParams<Parameters<typeof svelte_crossfade>[0]>,
    manager?: MotionManager
): CrossfadeResult {
    const { forceAnimate = false, ...restParams } = params || {};
    const [send, receive] = svelte_crossfade(restParams);

    const wrap = (transitionFn: ReturnType<typeof svelte_crossfade>[number]): CrossfadeFn => {
        return ((node: Element, p: MotionParams<{ key: unknown }>) => {
            const configFn = transitionFn(node, p);
            const activeManager = manager ?? motionPreference;
            const shouldReduce =
                !p?.forceAnimate && !forceAnimate && activeManager.resolved === "reduce";
            if (shouldReduce) {
                return () => {
                    const config = configFn?.();
                    return config ? { ...config, duration: 0 } : { duration: 0 };
                };
            }
            return configFn;
        }) as CrossfadeFn;
    };

    return [wrap(send), wrap(receive)];
}

/**
 * Custom flip animation wrapper.
 */
export function flip(
    node: Element,
    animation: { from: DOMRect; to: DOMRect },
    params?: MotionParams<FlipParams>,
    manager?: MotionManager
): AnimationConfig {
    const { forceAnimate = false, ...restParams } = params || {};
    const config = svelte_flip(node, animation, restParams);
    const activeManager = manager ?? motionPreference;
    if (!forceAnimate && activeManager.resolved === "reduce") {
        return { ...config, duration: 0 };
    }
    return config;
}

/**
 * Reactive Tween wrapper.
 * Intercepts value settings and target modifications to disable animation
 * when the central motion preference is resolved to 'reduce'.
 */
export class Tween<T> {
    #underlying: SvelteTween<T>;
    #forceAnimate: boolean;
    #manager?: MotionManager;

    constructor(
        value: T,
        options?: TweenOptions<T> & { forceAnimate?: boolean; manager?: MotionManager }
    ) {
        const { forceAnimate = false, manager, ...restOptions } = options || {};
        this.#underlying = new SvelteTween(value, restOptions);
        this.#forceAnimate = forceAnimate;
        this.#manager = manager;
    }

    set(value: T, options?: TweenOptions<T> & { forceAnimate?: boolean }): Promise<void> {
        const { forceAnimate = this.#forceAnimate, ...restOptions } = options || {};
        const activeManager = this.#manager ?? motionPreference;
        if (!forceAnimate && activeManager.resolved === "reduce") {
            return this.#underlying.set(value, { ...restOptions, duration: 0 });
        }
        return this.#underlying.set(value, restOptions);
    }

    set target(value: T) {
        const activeManager = this.#manager ?? motionPreference;
        if (!this.#forceAnimate && activeManager.resolved === "reduce") {
            // eslint-disable-next-line unicorn/prefer-await
            this.set(value, { duration: 0 }).catch(() => {});
        } else {
            this.#underlying.target = value;
        }
    }

    get target(): T {
        return this.#underlying.target;
    }

    get current(): T {
        return this.#underlying.current;
    }

    static of<U>(
        fn: () => U,
        options?: TweenOptions<U> & { forceAnimate?: boolean; manager?: MotionManager }
    ): Tween<U> {
        let tween: Tween<U> | undefined;
        let isInitial = true;
        try {
            $effect(() => {
                const val = fn();
                if (isInitial) {
                    isInitial = false;
                    tween = new Tween(val, options);
                } else if (tween) {
                    tween.target = val;
                }
            });
        } catch {
            // Called outside active Svelte effect/component lifecycle root
        }
        if (!tween) {
            tween = new Tween(fn(), options);
        }
        return tween;
    }
}

/**
 * Reactive Spring wrapper.
 * Intercepts value settings and target modifications to disable animation
 * when the central motion preference is resolved to 'reduce'.
 */
export class Spring<T> {
    #underlying: SvelteSpring<T>;
    #forceAnimate: boolean;
    #manager?: MotionManager;

    constructor(
        value: T,
        options?: SpringOptions & { forceAnimate?: boolean; manager?: MotionManager }
    ) {
        const { forceAnimate = false, manager, ...restOptions } = options || {};
        this.#underlying = new SvelteSpring(value, restOptions);
        this.#forceAnimate = forceAnimate;
        this.#manager = manager;
    }

    set(value: T, options?: SpringUpdateOptions & { forceAnimate?: boolean }): Promise<void> {
        const { forceAnimate = this.#forceAnimate, ...restOptions } = options || {};
        const activeManager = this.#manager ?? motionPreference;
        if (!forceAnimate && activeManager.resolved === "reduce") {
            return this.#underlying.set(value, { ...restOptions, instant: true });
        }
        return this.#underlying.set(value, restOptions);
    }

    set target(value: T) {
        const activeManager = this.#manager ?? motionPreference;
        if (!this.#forceAnimate && activeManager.resolved === "reduce") {
            // eslint-disable-next-line unicorn/prefer-await
            this.set(value, { instant: true }).catch(() => {});
        } else {
            this.#underlying.target = value;
        }
    }

    get target(): T {
        return this.#underlying.target;
    }

    get current(): T {
        return this.#underlying.current;
    }

    get stiffness(): number {
        return this.#underlying.stiffness;
    }
    set stiffness(v: number) {
        this.#underlying.stiffness = v;
    }

    get damping(): number {
        return this.#underlying.damping;
    }
    set damping(v: number) {
        this.#underlying.damping = v;
    }

    get precision(): number {
        return this.#underlying.precision;
    }
    set precision(v: number) {
        this.#underlying.precision = v;
    }

    static of<U>(
        fn: () => U,
        options?: SpringOptions & { forceAnimate?: boolean; manager?: MotionManager }
    ): Spring<U> {
        let springInstance: Spring<U> | undefined;
        let isInitial = true;
        try {
            $effect(() => {
                const val = fn();
                if (isInitial) {
                    isInitial = false;
                    springInstance = new Spring(val, options);
                } else if (springInstance) {
                    springInstance.target = val;
                }
            });
        } catch {
            // Called outside active Svelte effect/component lifecycle root
        }
        if (!springInstance) {
            springInstance = new Spring(fn(), options);
        }
        return springInstance;
    }
}
