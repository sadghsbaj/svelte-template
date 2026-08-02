import type { Rule } from "unocss";

export const rulesConfig: Rule[] = [
    [
        "app-views",
        {
            display: "grid",
            flex: "1 1 0%",
            "min-height": "0",
            width: "100%",
            "grid-template-areas": "'app-view'",
            overflow: "hidden",
        },
    ],
    [
        "app-view",
        {
            width: "100%",
            height: "100%",
            "grid-area": "app-view",
            "overflow-y": "var(--app-view-overflow, auto)",
        },
    ],
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
];
