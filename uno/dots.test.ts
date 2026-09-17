import { createGenerator } from "unocss";
import { describe, expect, test } from "vitest";

// eslint-disable-next-line no-restricted-imports
import unoConfig from "../uno.config.ts";

describe("Uno dot shortcuts generation", () => {
    test("generates dot-sm and dot with 3px dimensions and centered styles", async () => {
        const uno = await createGenerator(unoConfig);
        const { css } = await uno.generate("dot-sm dot", { preflights: false });

        expect(css).toContain("width:3px;height:3px;");
        expect(css).toContain("border-radius:calc(infinity * 1px);");
        expect(css).toContain("background-color:currentColor;");
        expect(css).toContain("opacity:40%;");
        expect(css).toContain("vertical-align:middle;");
        expect(css).toContain("display:inline-block;");
        expect(css).toContain("flex-shrink:0;");
    });

    test("generates dot-md with 4px dimensions", async () => {
        const uno = await createGenerator(unoConfig);
        const { css } = await uno.generate("dot-md", { preflights: false });

        expect(css).toContain("width:4px;height:4px;");
    });

    test("generates dot-lg with 5px dimensions", async () => {
        const uno = await createGenerator(unoConfig);
        const { css } = await uno.generate("dot-lg", { preflights: false });

        expect(css).toContain("width:5px;height:5px;");
    });
});
