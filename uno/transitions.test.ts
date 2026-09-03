import { createGenerator } from "unocss";
import { describe, expect, test } from "vitest";

import unoConfig from "../uno.config.ts";

describe("Uno transition CSS generation", () => {
    test("emits non-inheriting slots and independent transition values", async () => {
        const uno = await createGenerator(unoConfig);
        const { css } = await uno.generate(
            "t-all-300-quad-out t-shadow-200-quad-out t-scale-20000-quad-out t-bg-700-quad-out",
            { preflights: true }
        );

        expect(css).toContain('@property --t-all { syntax: "*"; inherits: false;');
        expect(css).toContain('@property --t-scale { syntax: "*"; inherits: false;');
        expect(css).toContain("--t-all:all 300ms var(--ease-quad-out)");
        expect(css).toContain("--t-shadow:box-shadow 200ms var(--ease-quad-out)");
        expect(css).toContain("--t-scale:scale 20000ms var(--ease-quad-out)");
        expect(css).toContain("--t-bg:background-color 700ms var(--ease-quad-out)");
    });
});
