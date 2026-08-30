const colorScale = (name: string): Record<string, unknown> => ({
    ...Object.fromEntries(
        [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [
            n,
            `var(--color-${name}-${n})`,
        ])
    ),
    soft: {
        1: `var(--color-${name}-soft-1)`,
        2: `var(--color-${name}-soft-2)`,
    },
    solid: {
        1: `var(--color-${name}-solid-1)`,
        2: `var(--color-${name}-solid-2)`,
    },
});

export const themeConfig = {
    colors: {
        app: "var(--color-app)",
        elevation: {
            DEFAULT: "var(--color-elevation-0)",
            0: "var(--color-elevation-0)",
            1: "var(--color-elevation-1)",
            2: "var(--color-elevation-2)",
        },

        strong: "var(--color-text-strong)",
        main: "var(--color-text-main)",
        weak: "var(--color-text-weak)",
        weaker: "var(--color-text-weaker)",

        accent: colorScale("accent"),
        success: colorScale("success"),
        warning: colorScale("warning"),
        danger: colorScale("danger"),
        info: colorScale("info"),
        base: colorScale("base"),
    },

    font: {
        sans: "var(--font-sans)",
        mono: "var(--font-mono)",
    },

    ease: {
        "sine-in": "var(--ease-sine-in)",
        "sine-out": "var(--ease-sine-out)",
        "sine-in-out": "var(--ease-sine-in-out)",
        "quad-in": "var(--ease-quad-in)",
        "quad-out": "var(--ease-quad-out)",
        "quad-in-out": "var(--ease-quad-in-out)",
        "cubic-in": "var(--ease-cubic-in)",
        "cubic-out": "var(--ease-cubic-out)",
        "cubic-in-out": "var(--ease-cubic-in-out)",
        "quart-in": "var(--ease-quart-in)",
        "quart-out": "var(--ease-quart-out)",
        "quart-in-out": "var(--ease-quart-in-out)",
        "quint-in": "var(--ease-quint-in)",
        "quint-out": "var(--ease-quint-out)",
        "quint-in-out": "var(--ease-quint-in-out)",
        "expo-in": "var(--ease-expo-in)",
        "expo-out": "var(--ease-expo-out)",
        "expo-in-out": "var(--ease-expo-in-out)",
        "circ-in": "var(--ease-circ-in)",
        "circ-out": "var(--ease-circ-out)",
        "circ-in-out": "var(--ease-circ-in-out)",
        "back-in": "var(--ease-back-in)",
        "back-out": "var(--ease-back-out)",
        "back-in-out": "var(--ease-back-in-out)",
    },
};
