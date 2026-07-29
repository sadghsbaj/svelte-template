import { mount, unmount } from "svelte";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import AppLayer from "./AppLayer.svelte";
import AppLayers from "./AppLayers.svelte";
import { appInertState, LAYER_CONTEXT_KEY } from "./layer.svelte";

describe("Layer State Utilities & Components", () => {
    let mountedApps: ReturnType<typeof mount>[] = [];

    beforeEach(() => {
        if (typeof document !== "undefined") {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
        }

        while (appInertState.isAppInert) {
            appInertState.unblock();
        }
    });

    afterEach(() => {
        mountedApps.forEach((app) => {
            try {
                unmount(app);
            } catch {
                // Ignore if already unmounted
            }
        });
        mountedApps = [];
        vi.restoreAllMocks();
    });

    describe("appInertState", () => {
        test("should initialize as not inert with normal scroll", () => {
            expect(appInertState.isAppInert).toBe(false);
            expect(document.body.style.overflow).toBe("");
            expect(document.body.style.paddingRight).toBe("");
        });

        test("should lock body scroll and set inert on first block", () => {
            appInertState.block();
            expect(appInertState.isAppInert).toBe(true);
            expect(document.body.style.overflow).toBe("hidden");
        });

        test("should remain blocked for nested calls and release only on final unblock", () => {
            appInertState.block();
            appInertState.block();
            expect(appInertState.isAppInert).toBe(true);
            expect(document.body.style.overflow).toBe("hidden");

            appInertState.unblock();
            expect(appInertState.isAppInert).toBe(true);
            expect(document.body.style.overflow).toBe("hidden");

            appInertState.unblock();
            expect(appInertState.isAppInert).toBe(false);
            expect(document.body.style.overflow).toBe("");
        });

        test("should prevent state corruption from underflow when unblock is called on zero blockCounter", () => {
            expect(appInertState.isAppInert).toBe(false);
            appInertState.unblock();
            appInertState.unblock();

            expect(appInertState.isAppInert).toBe(false);

            appInertState.block();
            expect(appInertState.isAppInert).toBe(true);
            expect(document.body.style.overflow).toBe("hidden");

            appInertState.unblock();
            expect(appInertState.isAppInert).toBe(false);
            expect(document.body.style.overflow).toBe("");
        });

        test("should cache pre-existing inline body styles and restore them upon release", () => {
            document.body.style.paddingRight = "15px";
            document.body.style.overflow = "scroll";

            appInertState.block();
            expect(appInertState.isAppInert).toBe(true);
            expect(document.body.style.overflow).toBe("hidden");

            appInertState.unblock();
            expect(appInertState.isAppInert).toBe(false);
            expect(document.body.style.paddingRight).toBe("15px");
            expect(document.body.style.overflow).toBe("scroll");
        });
    });

    describe("LAYER_CONTEXT_KEY", () => {
        test("LAYER_CONTEXT_KEY should be a unique symbol", () => {
            expect(typeof LAYER_CONTEXT_KEY).toBe("symbol");
            expect(LAYER_CONTEXT_KEY.description).toBe("layer");
        });
    });

    describe("AppLayer Component Integration", () => {
        test("should mount AppLayer and render element with z-index style", () => {
            const target = document.createElement("div");
            document.body.appendChild(target);

            const app = mount(AppLayer, {
                target,
                props: {
                    layer: "modal-layer",
                    z: 50,
                },
            });
            mountedApps.push(app);

            const layerEl = target.querySelector('[data-layout="app-layer"]');
            expect(layerEl).not.toBeNull();
            expect((layerEl as HTMLElement)?.dataset.layer).toBe("modal-layer");
            expect((layerEl as HTMLElement)?.style.zIndex).toBe("50");
        });

        test("should default z-index to 0 when z prop is omitted", () => {
            const target = document.createElement("div");
            document.body.appendChild(target);

            const app = mount(AppLayer, {
                target,
                props: {
                    layer: "default-layer",
                },
            });
            mountedApps.push(app);

            const layerEl = target.querySelector('[data-layout="app-layer"]');
            expect(layerEl).not.toBeNull();
            expect((layerEl as HTMLElement)?.style.zIndex).toBe("0");
        });
    });

    describe("AppLayers Component Integration", () => {
        test("should mount AppLayers container", () => {
            const target = document.createElement("div");
            document.body.appendChild(target);

            const app = mount(AppLayers, {
                target,
            });
            mountedApps.push(app);

            const container = target.querySelector('[data-layout="app-layers"]');
            expect(container).not.toBeNull();
        });
    });
});
