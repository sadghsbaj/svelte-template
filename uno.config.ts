import { defineConfig, presetWind4 } from "unocss";

const colorScale = (name: string) =>
    Object.fromEntries(
        [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950].map((n) => [
            n,
            `var(--color-${name}-${n})`,
        ])
    );

export default defineConfig({
    presets: [presetWind4()],

    shortcuts: [
        {
            "flex-center": "flex justify-center items-center",
            "absolute-center": "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",

            "app-views":
                "flex-1 grid min-h-0 w-full [grid-template-areas:'app-view'] overflow-hidden",
            "app-view":
                "w-full h-full [grid-area:app-view] overflow-y-[var(--app-view-overflow,auto)]",
        },
    ],

    theme: {
        colors: {
            app: "var(--color-app)",
            elevation: {
                DEFAULT: "var(--color-elevation-0)",
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
    },

    rules: [
        [
            "no-scrollbar",
            {
                "-ms-overflow-style": "none",
                "scrollbar-width": "none",
            },
        ],
        [
            /^squircle(?:-(smooth|soft))?$/,
            ([_, type], { symbols }) => {
                const SHAPE_MAP: Record<string, string> = {
                    smooth: "superellipse(1.6)",
                    soft: "superellipse(1.2)",
                };

                const shapeValue = SHAPE_MAP[type] ?? "squircle";

                return {
                    [symbols.parent]: "@supports (corner-shape: squircle)",
                    "corner-shape": shapeValue,
                };
            },
            { autocomplete: ["squircle", "squircle-smooth", "squircle-soft"] },
        ],
        [
            /^debug-border(?:-([0-9]))?$/,
            ([_, num]) => {
                // 10 highly visible, distinct colors for debugging
                const colors = [
                    "red", // debug-border or debug-border-0
                    "blue", // debug-border-1
                    "green", // debug-border-2
                    "orange", // debug-border-3
                    "magenta", // debug-border-4
                    "cyan", // debug-border-5
                    "yellow", // debug-border-6
                    "lime", // debug-border-7
                    "hotpink", // debug-border-8
                    "blueviolet", // debug-border-9
                ];

                const colorIndex = num ? Number(num) : 0;

                return {
                    border: `1px dashed ${colors[colorIndex]} !important`,
                };
            },
            { autocomplete: "debug-border-(1|2|3|4|5|6|7|8|9)" },
        ],
    ],

    postprocess: [
        (util) => {
            if (util.selector.includes("no-scrollbar")) {
                util.entries.push(["display", "none"]);
            }
        },
    ],

    preflights: [
        {
            getCSS: () => `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none !important;
                    }
                `,
        },
    ],

    variants: [
        (matcher) => {
            if (!matcher.startsWith("hover:")) return matcher;
            return {
                matcher: matcher.slice(6),
                parent: "@media (hover: hover)",
                selector: (s) => `${s}:hover`,
            };
        },
    ],
});
