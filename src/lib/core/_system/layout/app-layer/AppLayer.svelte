<script lang="ts">
    import type { Snippet } from "svelte";

    import { setLayerContext } from "./layer.context";
    import { appInertState } from "./layer.svelte";

    export interface AppLayerProps {
        layer: string;
        z?: number | "top-layer";
        inertApp?: boolean;
        children?: Snippet;
    }

    let { layer, z = 0, inertApp = false, children }: AppLayerProps = $props();

    const TOP_LAYER_Z = 10_000;
    const MAX_NUMERIC_Z = 9999;

    let activeCount = $state(0);
    const computedZ = $derived(z === "top-layer" ? TOP_LAYER_Z : (z ?? 0));

    setLayerContext({
        get layer() {
            return layer;
        },
        get zIndex() {
            return computedZ;
        },
        setContextActive: (active: boolean) => {
            queueMicrotask(() => {
                if (active) {
                    activeCount++;
                } else {
                    activeCount = Math.max(0, activeCount - 1);
                }
            });
        },
    });

    // DEV-Guard: Validates that layers with inertApp=true
    // have at least one child attached via {@attach layerAttach}
    function layerAttachDevGuard() {
        if (!import.meta.env.DEV || !inertApp) return;

        queueMicrotask(() => {
            if (activeCount <= 0) {
                console.warn(
                    `[AppLayer DevGuard] Layer "${layer}" has inertApp=true, but no child component registered {@attach layerAttach}.`
                );
            }
        });
    }

    // DEV-Guard: Validates z-index range (0 to 9999 or "top-layer")
    function zIndexDevGuard() {
        if (!import.meta.env.DEV) return;

        if (typeof z === "number") {
            if (z < 0 || z > MAX_NUMERIC_Z || !Number.isSafeInteger(z)) {
                console.error(
                    `[AppLayer DevGuard] Invalid numeric z-index (${z}) on layer "${layer}". ` +
                        `Numeric z must be an integer between 0 and 9999. Use z="top-layer" for ${TOP_LAYER_Z}.`
                );
            }
        } else if (z !== "top-layer") {
            console.error(
                `[AppLayer DevGuard] Invalid z value ("${z}") on layer "${layer}". ` +
                    `Expected an integer between 0 and 9999, or "top-layer".`
            );
        }
    }

    $effect(() => {
        layerAttachDevGuard();
        zIndexDevGuard();

        if (!inertApp || activeCount <= 0) return;

        appInertState.block();
        return () => appInertState.unblock();
    });
</script>

{@render children?.()}
