import type { Postprocessor } from "unocss";

export const postprocessConfig: Postprocessor[] = [
    (util) => {
        if (util.selector.includes("no-scrollbar")) {
            util.entries.push(["display", "none"]);
        }
    },
];
