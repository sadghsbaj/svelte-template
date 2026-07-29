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

        "@typescript-eslint/member-ordering": [
            "error",
            {
                default: [
                    // 1. Static Fields
                    "public-static-field",
                    "protected-static-field",
                    "private-static-field",

                    // 2. Instance Fields (public, protected, private #fields)
                    "public-instance-field",
                    "protected-instance-field",
                    "private-instance-field",

                    // 3. Constructor
                    "constructor",

                    // 4. Getters & Setters
                    "public-get",
                    "public-set",
                    "protected-get",
                    "protected-set",
                    "private-get",
                    "private-set",

                    // 5. Public Methods
                    "public-instance-method",

                    // 6. Protected & Private Methods
                    "protected-instance-method",
                    "private-instance-method",
                ],
            },
        ],
    },
};
