import type { Rule } from "unocss";

const PROP_MAP: Record<string, { prop: string; varName: string }> = {
    bg: { prop: "background-color", varName: "--t-bg" },
    text: { prop: "color", varName: "--t-text" },
    color: { prop: "color", varName: "--t-text" },
    border: { prop: "border-color", varName: "--t-border" },
    opacity: { prop: "opacity", varName: "--t-opacity" },
    transform: { prop: "transform", varName: "--t-transform" },
    shadow: { prop: "box-shadow", varName: "--t-shadow" },
    all: { prop: "all", varName: "--t-all" },
};

const MASTER_TRANSITION_VARS = [
    "var(--t-bg, opacity 0s)",
    "var(--t-text, opacity 0s)",
    "var(--t-border, opacity 0s)",
    "var(--t-opacity, opacity 0s)",
    "var(--t-transform, opacity 0s)",
    "var(--t-shadow, opacity 0s)",
    "var(--t-all, opacity 0s)",
];

export const transitionRules: Rule[] = [
    [
        /^t-(.+)$/,
        ([_, raw]) => {
            if (!raw || raw.startsWith("views") || raw.startsWith("view")) return;

            const tokens = raw.split("-");
            if (tokens.length === 0) return;

            let propKey = "all";
            let remainingTokens = tokens;

            const firstToken = tokens[0].toLowerCase();
            const isFirstTokenDuration = /^\d+(?:ms|s)?$/.test(firstToken);

            if (!isFirstTokenDuration) {
                propKey = firstToken;
                remainingTokens = tokens.slice(1);
            }

            const propInfo = PROP_MAP[propKey] ?? {
                prop: propKey,
                varName: `--t-${propKey}`,
            };

            let duration = "150ms";
            let delay = "";
            const easingTokenParts: string[] = [];

            for (const token of remainingTokens) {
                if (/^\d+(?:ms|s)?$/.test(token)) {
                    const formattedNum = /^\d+$/.test(token) ? `${token}ms` : token;
                    if (duration === "150ms" && remainingTokens.indexOf(token) === 0) {
                        duration = formattedNum;
                    } else if (!delay) {
                        delay = formattedNum;
                    }
                } else {
                    easingTokenParts.push(token);
                }
            }

            let easingName = easingTokenParts.join("-").toLowerCase();
            if (easingName.startsWith("ease-")) {
                easingName = easingName.slice(5);
            }

            const standardEasings = ["linear", "ease", "ease-in", "ease-out", "ease-in-out"];
            let easingValue = "var(--ease-sine-out)";

            if (easingName) {
                if (standardEasings.includes(easingName)) {
                    easingValue = easingName;
                } else {
                    easingValue = `var(--ease-${easingName})`;
                }
            }

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
                "t-(bg|text|border|opacity|transform|shadow|all)-(100|150|200|300|500)-(expo-out|sine-in|sine-out|back-out|cubic-out)",
        },
    ],
];
