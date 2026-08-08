import { defineConfig, presetWind4 } from "unocss";

import { postprocessConfig } from "./uno/postprocess.ts";
import { preflightsConfig } from "./uno/preflights.ts";
import { rulesConfig } from "./uno/rules.ts";
import { shortcutsConfig } from "./uno/shortcuts.ts";
import { themeConfig } from "./uno/theme.ts";
import { variantsConfig } from "./uno/variants.ts";

export default defineConfig({
    presets: [
        presetWind4({
            dark: {
                dark: '[data-theme="dark"]'
            }
        }),
    ],

    shortcuts: shortcutsConfig,

    theme: themeConfig,

    rules: rulesConfig,

    postprocess: postprocessConfig,

    preflights: preflightsConfig,

    variants: variantsConfig,
});
