import type { UserShortcuts } from "unocss";
import { dotShortcuts } from "./dots.ts";
import { typographyShortcuts } from "./typography.ts";

export const shortcutsConfig: UserShortcuts = [
    typographyShortcuts,
    dotShortcuts,
    {
        "flex-center": "flex justify-center items-center",
        "absolute-center": "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    },
];
