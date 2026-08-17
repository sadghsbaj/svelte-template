import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { fadeMask, type FadeMaskOptions } from "./fade-mask.attach";

describe("fadeMask Svelte 5 Element Attachment", () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement("div");
        document.body.append(container);
    });

    afterEach(() => {
        container.remove();
        vi.restoreAllMocks();
    });

    describe("Default Options & Initialization", () => {
        test("should apply radial gradient and md strength by default", () => {
            const div = document.createElement("div");
            container.append(div);

            const attach = fadeMask();
            const cleanup = attach(div);

            expect(div.style.maskImage).toContain("radial-gradient(in oklch, black 30%, transparent 90%)");
            expect(div.style.maskRepeat).toBe("no-repeat");
            expect(div.style.maskSize).toBe("100% 100%");

            cleanup?.();
        });

        test("should do nothing when enabled is false", () => {
            const div = document.createElement("div");
            container.append(div);

            const attach = fadeMask({ enabled: false });
            const cleanup = attach(div);

            expect(div.style.maskImage).toBe("");
            expect(div.style.maskRepeat).toBe("");

            cleanup?.();
        });
    });

    describe("Gradient Type & Direction Resolving", () => {
        test("should resolve directional linear gradients", () => {
            const directions: Array<NonNullable<FadeMaskOptions["type"]>> = [
                "top",
                "bottom",
                "left",
                "right",
            ];

            for (const direction of directions) {
                const el = document.createElement("div");
                container.append(el);

                const attach = fadeMask({ type: direction, strength: "md" });
                const cleanup = attach(el);

                expect(el.style.maskImage).toContain("in oklch");
                expect(el.style.maskImage).toContain("black 30%, transparent 90%");

                cleanup?.();
            }
        });

        test("should resolve multi-stop symmetrical gradients for block and inline", () => {
            const blockEl = document.createElement("div");
            container.append(blockEl);

            const attachBlock = fadeMask({ type: "block", strength: "md" });
            const cleanupBlock = attachBlock(blockEl);

            expect(blockEl.style.maskImage).toContain("in oklch");
            expect(blockEl.style.maskImage).toContain("transparent 0%, black 25%");
            cleanupBlock?.();

            const inlineEl = document.createElement("div");
            container.append(inlineEl);

            const attachInline = fadeMask({ type: "inline", strength: "md" });
            const cleanupInline = attachInline(inlineEl);

            expect(inlineEl.style.maskImage).toContain("to right in oklch");
            expect(inlineEl.style.maskImage).toContain("transparent 0%, black 25%");
            cleanupInline?.();
        });
    });

    describe("Strength Presets", () => {
        test("should apply sm strength stops", () => {
            const el = document.createElement("div");
            container.append(el);

            const attach = fadeMask({ type: "radial", strength: "sm" });
            const cleanup = attach(el);

            expect(el.style.maskImage).toBe(
                "radial-gradient(in oklch, black 60%, transparent 100%)"
            );
            cleanup?.();
        });

        test("should apply lg strength stops", () => {
            const el = document.createElement("div");
            container.append(el);

            const attach = fadeMask({ type: "radial", strength: "lg" });
            const cleanup = attach(el);

            expect(el.style.maskImage).toBe(
                "radial-gradient(in oklch, black 0%, transparent 75%)"
            );
            cleanup?.();
        });
    });

    describe("HTML & SVG Element Compatibility", () => {
        test("should apply masking styles to an SVG element", () => {
            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            container.append(svg);

            const attach = fadeMask({ type: "radial" });
            const cleanup = attach(svg);

            expect(svg.style.maskImage).toBe(
                "radial-gradient(in oklch, black 30%, transparent 90%)"
            );
            expect(svg.style.maskRepeat).toBe("no-repeat");
            expect(svg.style.maskSize).toBe("100% 100%");

            cleanup?.();
        });
    });

    describe("Teardown & Cleanup Lifecycle", () => {
        test("should remove applied mask properties upon teardown", () => {
            const div = document.createElement("div");
            container.append(div);

            const attach = fadeMask();
            const cleanup = attach(div);

            expect(div.style.maskImage).not.toBe("");
            expect(div.style.maskRepeat).not.toBe("");
            expect(div.style.maskSize).not.toBe("");

            cleanup?.();

            expect(div.style.maskImage).toBe("");
            expect(div.style.webkitMaskImage).toBe("");
            expect(div.style.maskRepeat).toBe("");
            expect(div.style.webkitMaskRepeat).toBe("");
            expect(div.style.maskSize).toBe("");
            expect(div.style.webkitMaskSize).toBe("");
        });

        test("should preserve unrelated existing inline styles upon cleanup", () => {
            const div = document.createElement("div");
            div.style.opacity = "0.5";
            div.style.color = "red";
            container.append(div);

            const attach = fadeMask();
            const cleanup = attach(div);

            cleanup?.();

            expect(div.style.opacity).toBe("0.5");
            expect(div.style.color).toBe("red");
        });
    });
});
