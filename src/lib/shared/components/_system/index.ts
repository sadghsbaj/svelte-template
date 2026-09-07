export { default as BackgroundPattern } from "./background-pattern/BackgroundPattern.svelte";
export type {
    PatternVariant,
    VariantContext,
} from "./background-pattern/pattern-variants.snippets.svelte";

export { default as HitArea } from "./hit-area/HitArea.svelte";
export { resolveHitArea, type HitAreaConfig, type HitAreaSize } from "./hit-area/hit-area";

export { default as Button } from "./button/Button.svelte";
export type { ButtonStyleProps } from "./button/button.styles";

export { default as CloseButton } from "./close-button/CloseButton.svelte";
export type { CloseButtonStyleProps } from "./close-button/close-button.styles";

export { default as Switch } from "./switch/Switch.svelte";
export type { SwitchStyleProps } from "./switch/switch.styles";

export { default as Checkbox } from "./checkbox/Checkbox.svelte";
export type { CheckboxStyleProps } from "./checkbox/checkbox.styles";
