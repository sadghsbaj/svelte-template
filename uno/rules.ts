import type { Rule } from "unocss";

import { transitionRules } from "./transitions.ts";

const PROPERTY_MAP: Record<string, string> = {
    bg: "background-color",
    text: "color",
    border: "border-color",
    outline: "outline-color",
    ring: "--un-ring-color",
    fill: "fill",
    stroke: "stroke",
};

export const rulesConfig: Rule[] = [
    ...transitionRules,
    [
        "app-views",
        {
            display: "grid",
            height: "100%",
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

    // Color scales opacity modifier (e.g. bg-accent-600/10, text-accent-900/60, border-danger-500/20)
    [
        /^(bg|text|border|outline|fill|stroke)-(accent|success|warning|danger|info|base)-(50|100|200|300|400|500|600|700|800|900|950)\/([0-9]+)$/,
        ([_, prop, family, shade, opacity]) => {
            const cssProperty = PROPERTY_MAP[prop];
            if (!cssProperty) return;
            return {
                [cssProperty]: `color-mix(in srgb, var(--color-${family}-${shade}) ${opacity}%, transparent)`,
            };
        },
        {
            autocomplete:
                "(bg|text|border)-(accent|success|warning|danger|info|base)-(50|100|200|300|400|500|600|700|800|900|950)/(10|15|20|30|40|50|60|70|80|90)",
        },
    ],

    // Semantic text colors opacity modifier (e.g. text-strong/80, text-weak/50)
    [
        /^(bg|text|border)-(strong|main|weak|weaker)\/([0-9]+)$/,
        ([_, prop, type, opacity]) => {
            const cssProperty = PROPERTY_MAP[prop];
            if (!cssProperty) return;
            return {
                [cssProperty]: `color-mix(in srgb, var(--color-text-${type}) ${opacity}%, transparent)`,
            };
        },
        { autocomplete: "(text|bg)-(strong|main|weak|weaker)/(10|20|30|40|50|60|70|80|90)" },
    ],

    // Elevation & App background opacity modifier (e.g. bg-elevation-1/80, bg-app/80)
    [
        /^(bg|border)-elevation(?:-([0-2]))?\/([0-9]+)$/,
        ([_, prop, level = "0", opacity]) => {
            const cssProperty = PROPERTY_MAP[prop];
            if (!cssProperty) return;
            return {
                [cssProperty]: `color-mix(in srgb, var(--color-elevation-${level}) ${opacity}%, transparent)`,
            };
        },
        { autocomplete: "bg-elevation-(0|1|2)/(10|20|30|40|50|60|70|80|90)" },
    ],
    [
        /^(bg|border)-app\/([0-9]+)$/,
        ([_, prop, opacity]) => {
            const cssProperty = PROPERTY_MAP[prop];
            if (!cssProperty) return;
            return {
                [cssProperty]: `color-mix(in srgb, var(--color-app) ${opacity}%, transparent)`,
            };
        },
        { autocomplete: "bg-app/(10|20|30|40|50|60|70|80|90)" },
    ],
];
