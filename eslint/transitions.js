export const forbiddenTransitionsConfig = {
    rules: {
        "no-restricted-syntax": [
            "error",
            {
                selector:
                    String.raw`Literal[value=/\btransition-(all|colors|opacity|shadow|transform)\b/], ` +
                    String.raw`TemplateElement[value.raw=/\btransition-(all|colors|opacity|shadow|transform)\b/]`,
                message:
                    "Forbidden legacy transition utility detected. Please use explicit t-... or t:(...) syntax instead.",
            },
        ],
    },
};
