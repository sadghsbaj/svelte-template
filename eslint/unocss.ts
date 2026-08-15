import unocss from "@unocss/eslint-config/flat";
import type { Linter } from "eslint";

export const unocssConfig: Linter.Config[] = [
    unocss,
    {
        rules: {
            "unocss/order": "off",
            "unocss/order-attributify": "off",
            "unocss/blocklist": "error",
        },
    },
];
