import type { Preflight } from "unocss";

import { TRANSITION_SLOT_DEFAULTS, TRANSITION_VAR_NAMES } from "./transitions.ts";

export const preflightsConfig: Preflight[] = [
    {
        getCSS: () =>
            TRANSITION_VAR_NAMES.map(
                (name) =>
                    `@property ${name} { syntax: "*"; inherits: false; initial-value: ${TRANSITION_SLOT_DEFAULTS[name]}; }`
            ).join("\n"),
    },
    {
        getCSS: () => `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none !important;
                    }
                `,
    },
];
