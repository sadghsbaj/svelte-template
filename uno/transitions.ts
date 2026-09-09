import type { Rule } from "unocss";

const PROP_MAP: Record<string, { prop: string; varName: string }> = {
    bg: { prop: "background-color", varName: "--t-bg" },
    text: { prop: "color", varName: "--t-text" },
    color: { prop: "color", varName: "--t-text" },
    border: { prop: "border-color", varName: "--t-border" },
    shadow: { prop: "box-shadow", varName: "--t-shadow" },
};

export const TRANSITION_SLOT_DEFAULTS: Record<string, string> = {
    "--t-bg": "background-color 0s",
    "--t-text": "color 0s",
    "--t-border": "border-color 0s",
    "--t-opacity": "opacity 0s",
    "--t-transform": "transform 0s",
    "--t-translate": "translate 0s",
    "--t-scale": "scale 0s",
    "--t-shadow": "box-shadow 0s",
    "--t-width": "width 0s",
    "--t-height": "height 0s",
    "--t-left": "left 0s",
    "--t-top": "top 0s",
    "--t-filter": "filter 0s",
    "--t-backdrop-filter": "backdrop-filter 0s",
    "--t-outline": "outline-color 0s",
    "--t-fill": "fill 0s",
    "--t-stroke": "stroke 0s",
    "--t-all": "clip-path 0s",
};

export const TRANSITION_VAR_NAMES = Object.keys(TRANSITION_SLOT_DEFAULTS);

const MASTER_TRANSITION_VARS = TRANSITION_VAR_NAMES.map(
    (name) => `var(${name}, ${TRANSITION_SLOT_DEFAULTS[name]})`
);

export const transitionRules: Rule[] = [
    [
        /^t[-:](.+)$/,
        ([_, raw]) => {
            if (!raw || raw.startsWith("views") || raw.startsWith("view")) return;

            const tokens = raw.split("-");
            if (tokens.length === 0) return;

            const firstToken = tokens[0].toLowerCase();
            const isFirstTokenDuration = /^\d+(?:ms|s)?$/.test(firstToken);

            const propKey = isFirstTokenDuration ? "all" : firstToken;
            const remainingTokens = isFirstTokenDuration ? tokens : tokens.slice(1);

            const propInfo = PROP_MAP[propKey] ?? {
                prop: propKey,
                varName: `--t-${propKey}`,
            };

            let duration = "150ms";
            let delay = "";
            let durationSet = false;
            const easingTokenParts: string[] = [];

            for (const token of remainingTokens) {
                if (/^\d+(?:ms|s)?$/.test(token)) {
                    const formattedNum = /^\d+$/.test(token) ? `${token}ms` : token;
                    if (!durationSet) {
                        duration = formattedNum;
                        durationSet = true;
                    } else if (!delay) {
                        delay = formattedNum;
                    }
                } else {
                    easingTokenParts.push(token);
                }
            }

            const rawEasing = easingTokenParts.join("-").toLowerCase();
            const easingName = rawEasing.startsWith("ease-") ? rawEasing.slice(5) : rawEasing;
            const easingValue = easingName ? `var(--ease-${easingName})` : "var(--ease-sine-out)";

            const transitionValue = `${propInfo.prop} ${duration} ${easingValue}${delay ? ` ${delay}` : ""}`;

            const masterList = [...MASTER_TRANSITION_VARS];
            const slotDefault =
                TRANSITION_SLOT_DEFAULTS[propInfo.varName] ?? `${propInfo.prop} 0s`;
            const currentVarEntry = `var(${propInfo.varName}, ${slotDefault})`;
            if (!masterList.includes(currentVarEntry)) {
                masterList.push(currentVarEntry);
            }

            return {
                [propInfo.varName]: transitionValue,
                transition: masterList.join(", "),
            };
        },
        {
            autocomplete:
                "t-(bg|text|border|opacity|transform|shadow|all|width|height)-(100|150|200|300|500)-(expo-out|sine-in|sine-out|back-out|cubic-out)",
        },
    ],
];
