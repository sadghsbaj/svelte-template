import type { Rule } from "unocss";

const PROP_MAP: Record<string, { prop: string; varName: string }> = {
    bg: { prop: "background-color", varName: "--t-bg" },
    text: { prop: "color", varName: "--t-text" },
    color: { prop: "color", varName: "--t-text" },
    border: { prop: "border-color", varName: "--t-border" },
    shadow: { prop: "box-shadow", varName: "--t-shadow" },
};

const MASTER_TRANSITION_VARS = [
    "var(--t-bg, opacity 0s)",
    "var(--t-text, opacity 0s)",
    "var(--t-border, opacity 0s)",
    "var(--t-opacity, opacity 0s)",
    "var(--t-transform, opacity 0s)",
    "var(--t-scale, opacity 0s)",
    "var(--t-shadow, opacity 0s)",
    "var(--t-width, opacity 0s)",
    "var(--t-height, opacity 0s)",
    "var(--t-left, opacity 0s)",
    "var(--t-top, opacity 0s)",
    "var(--t-filter, opacity 0s)",
    "var(--t-backdrop-filter, opacity 0s)",
    "var(--t-outline, opacity 0s)",
    "var(--t-fill, opacity 0s)",
    "var(--t-stroke, opacity 0s)",
    "var(--t-all, opacity 0s)",
];

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
            const currentVarEntry = `var(${propInfo.varName}, opacity 0s)`;
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
