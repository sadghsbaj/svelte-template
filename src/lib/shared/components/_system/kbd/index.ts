export { default as Kbd } from "./Kbd.svelte";
export { KBD_ICON_SIZES, kbdSeparatorStyles, kbdStyles, type KbdStyleProps } from "./kbd.styles";
export type { KbdPlatform, KbdProps, KeyItem, KeyItemType } from "./kbd.types";
export { isMacPlatform, resolveKeyItem, resolveKeys, splitComboString } from "./kbd.utils";
