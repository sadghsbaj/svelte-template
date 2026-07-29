export const baseRulesConfig = {
    rules: {
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "prefer-const": "warn",

        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],

        "unocss/order": "warn",
    },
};
