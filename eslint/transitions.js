export const forbiddenTransitionSelector = {
    selector:
        String.raw`Literal[value=/\btransition-(all|colors|opacity|shadow|transform)\b/], ` +
        String.raw`SvelteLiteral[value=/\btransition-(all|colors|opacity|shadow|transform)\b/], ` +
        String.raw`TemplateElement[value.raw=/\btransition-(all|colors|opacity|shadow|transform)\b/]`,
    message:
        "Forbidden legacy transition utility detected. Please use explicit t-... or t:(...) syntax instead.",
};

export const forbiddenTransitionsConfig = {
    rules: {
        "no-restricted-syntax": ["error", forbiddenTransitionSelector],
    },
};
