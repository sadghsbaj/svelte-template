export { default as Kbd } from "./Kbd.svelte";
export {
    kbdSeparatorStyles,
    kbdSequenceSeparatorStyles,
    kbdStyles,
    type KbdStyleProps,
} from "./kbd.styles";
export type {
    KbdFormat,
    KbdPlatform,
    KbdProps,
    KeyItem,
    KeyItemType,
    ResolvedShortcut,
} from "./kbd.types";
export {
    getShortcutAriaLabel,
    getShortcutTitle,
    isMacPlatform,
    resolveKeyItem,
    resolveKeys,
    resolveShortcut,
    splitComboString,
    splitShortcutSteps,
} from "./kbd.utils";
