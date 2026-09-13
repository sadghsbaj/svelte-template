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

export { default as Kbd } from "./kbd/Kbd.svelte";
export {
    kbdSeparatorStyles,
    kbdSequenceSeparatorStyles,
    kbdStyles,
    type KbdStyleProps,
} from "./kbd/kbd.styles";
export type {
    KbdFormat,
    KbdPlatform,
    KbdProps,
    KeyItem,
    KeyItemType,
    ResolvedShortcut,
} from "./kbd/kbd.types";
export {
    getShortcutAriaLabel,
    getShortcutTitle,
    isMacPlatform,
    resolveKeyItem,
    resolveKeys,
    resolveShortcut,
    splitComboString,
    splitShortcutSteps,
} from "./kbd/kbd.utils";

export { default as Dropdown } from "./dropdown/Dropdown.svelte";
export {
    dropdownContentStyles,
    dropdownItemStyles,
    dropdownSeparatorStyles,
    type DropdownItemStyleProps,
} from "./dropdown/dropdown.styles";
export type {
    DropdownAction,
    DropdownActionDetail,
    DropdownEntry,
    DropdownItem,
    DropdownProps,
    DropdownSection,
    DropdownSeparator,
    DropdownSize,
    DropdownSubmenu,
    DropdownTriggerContext,
} from "./dropdown/dropdown.types";

export { default as Switch } from "./switch/Switch.svelte";
export type { SwitchStyleProps } from "./switch/switch.styles";

export { default as Checkbox } from "./checkbox/Checkbox.svelte";
export type { CheckboxStyleProps } from "./checkbox/checkbox.styles";

export { default as Select } from "./select/Select.svelte";
export type { SelectStyleProps } from "./select/select.styles";
export type { SelectOption, SelectProps } from "./select/select.types";

export { default as Combobox } from "./combobox/Combobox.svelte";
export type { ComboboxFilter, ComboboxOption, ComboboxProps } from "./combobox/combobox.types";

export type { SelectionOption } from "./selection/selection.types";

export { default as TextInput } from "./text-input/TextInput.svelte";
export {
    textInputActionStyles,
    type TextInputActionStyleProps,
    type TextInputStyleProps,
} from "./text-input/text-input.styles";

export { default as Textarea, type TextareaAutoResizeOption } from "./textarea/Textarea.svelte";
export {
    textareaContainerStyles,
    textareaElementStyles,
    textareaFooterStyles,
    textareaIconStyles,
    type TextareaContainerStyleProps,
    type TextareaElementStyleProps,
    type TextareaFooterStyleProps,
    type TextareaIconStyleProps,
    type TextareaStyleProps,
} from "./textarea/textarea.styles";

export { default as Floating } from "./floating/Floating.svelte";
export type {
    FloatingAlignment,
    FloatingAnchor,
    FloatingAnchorValue,
    FloatingContext,
    FloatingDirection,
    FloatingOffset,
    FloatingPadding,
    FloatingPlacement,
    FloatingPositionResult,
    FloatingProps,
    FloatingRect,
    FloatingSide,
    PointAnchor,
    VirtualAnchor,
} from "./floating/floating.types";

export { default as Popover } from "./popover/Popover.svelte";
export type {
    PopoverAnimation,
    PopoverAnimationContext,
    PopoverChangeDetail,
    PopoverCloseReason,
    PopoverContentContext,
    PopoverContext,
    PopoverDismissDetail,
    PopoverDismissOptions,
    PopoverInitialFocus,
    PopoverMethods,
    PopoverOpenReason,
    PopoverPhase,
    PopoverProps,
    PopoverReason,
    PopoverRestoreFocus,
    PopoverRole,
    PopoverTriggerContext,
} from "./popover/popover.types";
