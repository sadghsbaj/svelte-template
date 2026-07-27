import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { MotionManager, motionPreference } from "./motion.svelte";
import { blur, crossfade, draw, fade, flip, fly, scale, slide, Spring, Tween } from "./svelte";

describe("Svelte Motion/Transition Wrappers", () => {
    const dummyNode = document.createElement("div");

    beforeEach(() => {
        motionPreference.set("no-preference");
    });

    afterEach(() => {
        motionPreference.set("system");
    });

    describe("Transitions & Animations", () => {
        test("fade transition returns normal configuration when motion is enabled", () => {
            const config = fade(dummyNode, { duration: 300 });
            expect(config.duration).toBe(300);
        });

        test("fade transition overrides duration to 0 when motion is reduced", () => {
            motionPreference.set("reduce");
            const config = fade(dummyNode, { duration: 300 });
            expect(config.duration).toBe(0);
        });

        test("fade transition respects forceAnimate when motion is reduced", () => {
            motionPreference.set("reduce");
            const config = fade(dummyNode, { duration: 300, forceAnimate: true });
            expect(config.duration).toBe(300);
        });

        test("fade transition respects custom MotionManager instance", () => {
            const customManager = new MotionManager();
            customManager.set("reduce");

            const config = fade(dummyNode, { duration: 300 }, customManager);
            expect(config.duration).toBe(0);

            customManager.destroy();
        });

        test("blur transition overrides duration to 0 when motion is reduced", () => {
            motionPreference.set("reduce");
            const config = blur(dummyNode, { duration: 300 });
            expect(config.duration).toBe(0);
        });

        test("fly transition overrides duration to 0 when motion is reduced", () => {
            motionPreference.set("reduce");
            const config = fly(dummyNode, { duration: 300 });
            expect(config.duration).toBe(0);
        });

        test("slide transition overrides duration to 0 when motion is reduced", () => {
            motionPreference.set("reduce");
            const config = slide(dummyNode, { duration: 300 });
            expect(config.duration).toBe(0);
        });

        test("scale transition overrides duration to 0 when motion is reduced", () => {
            motionPreference.set("reduce");
            const config = scale(dummyNode, { duration: 300 });
            expect(config.duration).toBe(0);
        });

        test("draw transition overrides duration to 0 when motion is reduced", () => {
            motionPreference.set("reduce");
            const dummySvgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
            // Mock getTotalLength since it's an SVGElement
            dummySvgPath.getTotalLength = () => 100;
            const config = draw(dummySvgPath, { duration: 300 });
            expect(config.duration).toBe(0);
        });

        test("flip animation overrides duration to 0 when motion is reduced", () => {
            motionPreference.set("reduce");
            const config = flip(dummyNode, { from: {} as DOMRect, to: {} as DOMRect }, { duration: 300 });
            expect(config.duration).toBe(0);
        });

        test("crossfade transition wrapper overrides duration to 0 when motion is reduced", () => {
            motionPreference.set("reduce");
            const [send, receive] = crossfade({ duration: 300 });
            const sendConfig = send(dummyNode, { key: "test" })();
            const receiveConfig = receive(dummyNode, { key: "test" })();
            expect(sendConfig.duration).toBe(0);
            expect(receiveConfig.duration).toBe(0);
        });

        test("crossfade transition respects per-invocation forceAnimate flag", () => {
            motionPreference.set("reduce");
            const nodeA = document.createElement("div");
            const nodeB = document.createElement("div");
            const [send, receive] = crossfade({ duration: 300, forceAnimate: false });
            send(nodeA, { key: "test", forceAnimate: true });
            const receiveConfig = receive(nodeB, { key: "test", forceAnimate: true })();
            expect(receiveConfig.duration).toBe(300);
        });
    });

    describe("Tween Class", () => {
        test("Tween animates normally when motion is enabled", () => {
            const tween = new Tween(0, { duration: 300 });
            expect(tween.target).toBe(0);
            expect(tween.current).toBe(0);
        });

        test("Tween set overrides duration to 0 when motion is reduced", async () => {
            motionPreference.set("reduce");
            const tween = new Tween(0, { duration: 300 });

            await tween.set(100);
            expect(tween.target).toBe(100);
            expect(tween.current).toBe(100);
        });

        test("Tween target assignment overrides duration to 0 when motion is reduced", () => {
            motionPreference.set("reduce");
            const tween = new Tween(0, { duration: 300 });

            tween.target = 100;
            expect(tween.target).toBe(100);
            expect(tween.current).toBe(100);
        });

        test("Tween respects forceAnimate option on set()", async () => {
            motionPreference.set("reduce");
            const tween = new Tween(0, { duration: 300 });

            const promise = tween.set(100, { forceAnimate: true });
            expect(tween.target).toBe(100);
            expect(tween.current).toBeLessThan(100); // Animating, not snapped
            await promise;
            expect(tween.current).toBe(100);
        });

        test("Tween.of() instantiates safely without orphan effect exception and evaluates fn once", () => {
            const getter = vi.fn(() => 42);
            const tween = Tween.of(getter);
            expect(tween.target).toBe(42);
            expect(getter).toHaveBeenCalledTimes(1);
        });

        test("Tween respects custom MotionManager instance", async () => {
            const customManager = new MotionManager();
            customManager.set("reduce");

            const tween = new Tween(0, { duration: 300, manager: customManager });
            await tween.set(100);
            expect(tween.current).toBe(100);

            customManager.destroy();
        });
    });

    describe("Spring Class", () => {
        test("Spring set overrides instant to true when motion is reduced", async () => {
            motionPreference.set("reduce");
            const spring = new Spring(0);

            await spring.set(100);
            expect(spring.target).toBe(100);
            expect(spring.current).toBe(100); // Snaps instantly
        });

        test("Spring target assignment overrides instant to true when motion is reduced", () => {
            motionPreference.set("reduce");
            const spring = new Spring(0);

            spring.target = 100;
            expect(spring.target).toBe(100);
            expect(spring.current).toBe(100); // Snaps instantly
        });

        test("Spring.of() instantiates safely without orphan effect exception and evaluates fn once", () => {
            const getter = vi.fn(() => 10);
            const spring = Spring.of(getter);
            expect(spring.target).toBe(10);
            expect(getter).toHaveBeenCalledTimes(1);
        });

        test("Spring getters and setters for properties work properly", () => {
            const spring = new Spring(0);
            spring.stiffness = 0.5;
            spring.damping = 0.8;
            spring.precision = 0.001;

            expect(spring.stiffness).toBe(0.5);
            expect(spring.damping).toBe(0.8);
            expect(spring.precision).toBe(0.001);
        });
    });
});

