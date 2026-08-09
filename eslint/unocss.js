import unocss from "@unocss/eslint-config/flat";

export const unocssConfig = [
    unocss,
    {
        rules: {
            "unocss/order": "off",
            "unocss/order-attributify": "off",
            "unocss/blocklist": "error",
        },
    },
];
