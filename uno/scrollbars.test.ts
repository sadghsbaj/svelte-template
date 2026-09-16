import { createGenerator } from "unocss";
import { describe, expect, test } from "vitest";

// eslint-disable-next-line no-restricted-imports
import unoConfig from "../uno.config.ts";

describe("Uno scrollbar size generation", () => {
    test("emits WebKit dimensions and Firefox width presets as custom properties", async () => {
        const uno = await createGenerator(unoConfig);
        const { css } = await uno.generate("scrollbar-sm scrollbar-md scrollbar-lg");

        expect(css).toContain(
            ".scrollbar-sm{--scrollbar-size:8px;--scrollbar-thumb-border:2px;--scrollbar-firefox-width:thin;}"
        );
        expect(css).toContain(
            ".scrollbar-md{--scrollbar-size:10px;--scrollbar-thumb-border:2px;--scrollbar-firefox-width:auto;}"
        );
        expect(css).toContain(
            ".scrollbar-lg{--scrollbar-size:12px;--scrollbar-thumb-border:2px;--scrollbar-firefox-width:auto;}"
        );
    });
});
