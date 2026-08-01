import { describe, expect, test } from "vitest";

import { motionGuardPlugin } from "./motion-guard.ts";

describe("motionGuardPlugin", () => {
    const plugin = motionGuardPlugin();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transform = plugin.transform as any;

    test("should allow safe imports", () => {
        const code = `import { Button } from "svelte-lib";`;
        const context = {
            error(msg: string) {
                throw new Error(msg);
            },
        };
        expect(transform.call(context, code, "src/components/Comp.svelte")).toBeNull();
    });

    test("should throw error for blocked svelte/transition import", () => {
        const code = `import { fade } from "svelte/transition";`;
        const context = {
            error(msg: string) {
                throw new Error(msg);
            },
        };
        expect(() => transform.call(context, code, "src/components/Comp.svelte")).toThrow(
            'Forbidden direct import from "svelte/transition" detected'
        );
    });

    test("should throw error for blocked svelte/animate import", () => {
        const code = `import { flip } from "svelte/animate";`;
        const context = {
            error(msg: string) {
                throw new Error(msg);
            },
        };
        expect(() => transform.call(context, code, "src/components/Comp.svelte")).toThrow(
            'Forbidden direct import from "svelte/animate" detected'
        );
    });

    test("should throw error for blocked svelte/motion import", () => {
        const code = `import { Spring } from "svelte/motion";`;
        const context = {
            error(msg: string) {
                throw new Error(msg);
            },
        };
        expect(() => transform.call(context, code, "src/components/Comp.svelte")).toThrow(
            'Forbidden direct import from "svelte/motion" detected'
        );
    });

    test("should exclude our own wrapper file path from the check", () => {
        const code = `import { fade } from "svelte/transition";`;
        const context = {
            error(msg: string) {
                throw new Error(msg);
            },
        };
        expect(
            transform.call(context, code, "src/lib/foundation/logic/motion/svelte.ts")
        ).toBeNull();
    });
});
