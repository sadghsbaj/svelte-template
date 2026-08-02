import type { Preflight } from "unocss";

export const preflightsConfig: Preflight[] = [
    {
        getCSS: () => `
                    .no-scrollbar::-webkit-scrollbar {
                        display: none !important;
                    }
                `,
    },
];
