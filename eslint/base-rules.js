export const baseRulesConfig = {
    rules: {
        "@typescript-eslint/no-non-null-assertion": "error",
        "no-console": ["warn", { allow: ["warn", "error"] }],
        "prefer-const": "warn",
        "@typescript-eslint/explicit-function-return-type": [
            "error",
            {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
                allowHigherOrderFunctions: true,
                allowDirectConstAssertionInArrowFunctions: true,
            },
        ],

        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],

        "unocss/order": "warn",

        "@typescript-eslint/member-ordering": [
            "error",
            {
                default: ["signature", "field", "constructor", ["get", "set", "method"]],
            },
        ],
    },
};
