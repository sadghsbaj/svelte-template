import { createGenerator } from "unocss";
import { describe, expect, test } from "vitest";

// eslint-disable-next-line no-restricted-imports
import unoConfig from "../uno.config.ts";

describe("Uno scrollbar size generation", () => {
    test("emits WebKit dimensions and Firefox width presets", async () => {
        const uno = await createGenerator(unoConfig);
        const { css } = await uno.generate("scrollbar-sm scrollbar-md scrollbar-lg");

        expect(css).toContain(".scrollbar-sm");
        expect(css).toContain("scrollbar-width: thin;");
        expect(css).toContain(".scrollbar-sm::-webkit-scrollbar");
        expect(css).toContain("width: 8px;");
        expect(css).toContain("height: 8px;");

        expect(css).toContain(".scrollbar-md");
        expect(css).toContain("scrollbar-width: auto;");
        expect(css).toContain(".scrollbar-md::-webkit-scrollbar");
        expect(css).toContain("width: 10px;");
        expect(css).toContain("height: 10px;");

        expect(css).toContain(".scrollbar-lg");
        expect(css).toContain("scrollbar-width: auto;");
        expect(css).toContain(".scrollbar-lg::-webkit-scrollbar");
        expect(css).toContain("width: 12px;");
        expect(css).toContain("height: 12px;");
    });
});
