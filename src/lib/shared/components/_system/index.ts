export { default as BackgroundPattern } from "./background-pattern/BackgroundPattern.svelte";
export type {
    PatternVariant,
    VariantContext,
} from "./background-pattern/pattern-variants.snippets.svelte";

export { default as HitArea } from "./hit-area/HitArea.svelte";
export {
    HIT_AREA_SIZES,
    resolveHitArea,
    resolveHitAreaPx,
    type HitAreaConfig,
    type HitAreaSize,
} from "./hit-area/hit-area";

export { default as Button } from "./button/Button.svelte";
export type { ButtonStyleProps } from "./button/button.styles";

export {
    default as ToggleButton,
    type ToggleButtonProps,
} from "./toggle-button/ToggleButton.svelte";
export type { ToggleButtonStyleProps } from "./toggle-button/toggle-button.styles";

export {
    default as ToggleButtonGroup,
    type ToggleButtonGroupOrientation,
    type ToggleButtonGroupProps,
    type ToggleButtonGroupType,
    type ToggleButtonGroupValue,
} from "./toggle-button-group/ToggleButtonGroup.svelte";
export type { ToggleButtonGroupStyleProps } from "./toggle-button-group/toggle-button-group.styles";

export {
    default as SegmentedControl,
    type SegmentedControlLayout,
    type SegmentedControlProps,
} from "./segmented-control/SegmentedControl.svelte";
export {
    default as SegmentedControlItem,
    type SegmentedControlItemProps,
} from "./segmented-control/SegmentedControlItem.svelte";
export type {
    SegmentedControlItemStyleProps,
    SegmentedControlStyleProps,
} from "./segmented-control/segmented-control.styles";

export { default as BottomNavbar } from "./bottom-navbar/BottomNavbar.svelte";
export type {
    BottomNavbarAnimation,
    BottomNavbarAnimationContext,
    BottomNavbarItem,
    BottomNavbarLabels,
    BottomNavbarMode,
    BottomNavbarOrientation,
    BottomNavbarPosition,
    BottomNavbarProps,
    BottomNavbarSelectDetail,
    BottomNavbarSize,
} from "./bottom-navbar/bottom-navbar.types";
export type {
    BottomNavbarItemStyleProps,
    BottomNavbarStyleProps,
} from "./bottom-navbar/bottom-navbar.styles";

export {
    default as ButtonGroup,
    type ButtonGroupOrientation,
    type ButtonGroupProps,
} from "./button-group/ButtonGroup.svelte";
export type { ButtonGroupStyleProps } from "./button-group/button-group.styles";

export { default as CloseButton } from "./close-button/CloseButton.svelte";
export type { CloseButtonStyleProps } from "./close-button/close-button.styles";

export { default as FeedbackHost } from "./feedback/FeedbackHost.svelte";
export type { FeedbackHostProps } from "./feedback/FeedbackHost.svelte";
export type {
    FeedbackAction,
    FeedbackDescription,
    FeedbackDismissDetail,
    FeedbackDismissReason,
    FeedbackIcon,
    FeedbackPauseReason,
    FeedbackPhase,
    FeedbackPriority,
    FeedbackStatus,
} from "./feedback/feedback.types";

export { default as Notification } from "./notification/Notification.svelte";
export { notification } from "./notification/notificationState.svelte";
export {
    notificationIconStyles,
    notificationStyles,
    notificationTitleStyles,
    type NotificationStyleProps,
} from "./notification/notification.styles";
export type {
    NotificationDescription,
    NotificationDismissDetail,
    NotificationIcon,
    NotificationInput,
    NotificationPriority,
    NotificationProps,
    NotificationStatus,
} from "./notification/notification.types";

export { default as Toast } from "./toast/Toast.svelte";
export { toast } from "./toast/toastState.svelte";
export type {
    ToastAction,
    ToastDescription,
    ToastDismissDetail,
    ToastIcon,
    ToastInput,
    ToastPosition,
    ToastPriority,
    ToastProps,
    ToastStatus,
} from "./toast/toast.types";

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
    DropdownSubmenuMode,
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

export { default as TooltipHost } from "./tooltip/TooltipHost.svelte";
export { tooltip } from "./tooltip/tooltip.attach";
export {
    tooltipLeadingStyles,
    tooltipStyles,
    tooltipTrailingStyles,
    type TooltipStyleProps,
} from "./tooltip/tooltip.styles";
export type {
    TooltipAnimation,
    TooltipAnimationContext,
    TooltipCloseReason,
    TooltipInput,
    TooltipOpenReason,
    TooltipOptions,
    TooltipPhase,
    TooltipReason,
} from "./tooltip/tooltip.types";

export { default as PulseDot } from "./pulse-dot/PulseDot.svelte";
export {
    pulseDotCoreStyles,
    pulseDotPingStyles,
    pulseDotStyles,
    type PulseDotStyleProps,
} from "./pulse-dot/pulse-dot.styles";

export { default as CopyAction, type CopyActionStatus } from "./copy-action/CopyAction.svelte";
export { copyActionStyles, type CopyActionStyleProps } from "./copy-action/copy-action.styles";

export {
    default as Meter,
    type MeterColor,
    type MeterProps,
    type MeterSize,
} from "./meter/Meter.svelte";
export {
    meterFillStyles,
    meterTrackStyles,
    type MeterFillStyleProps,
    type MeterTrackStyleProps,
} from "./meter/meter.styles";

export {
    default as ProgressBar,
    type ProgressBarColor,
    type ProgressBarProps,
    type ProgressBarSize,
} from "./progress-bar/ProgressBar.svelte";
export {
    progressBarFillStyles,
    progressBarTrackStyles,
    type ProgressBarFillStyleProps,
    type ProgressBarTrackStyleProps,
} from "./progress-bar/progress-bar.styles";

export { default as Slider } from "./slider/Slider.svelte";
export type {
    SliderColor,
    SliderOrientation,
    SliderOrigin,
    SliderProps,
    SliderSize,
    SliderThumbShape,
    SliderValue,
} from "./slider/slider.types";
export {
    sliderContainerStyles,
    sliderFillStyles,
    sliderThumbStyles,
    sliderTrackStyles,
    type SliderContainerStyleProps,
    type SliderFillStyleProps,
    type SliderThumbStyleProps,
    type SliderTrackStyleProps,
} from "./slider/slider.styles";

export { default as Separator } from "./separator/Separator.svelte";
export type {
    SeparatorColor,
    SeparatorOrientation,
    SeparatorProps,
    SeparatorThickness,
} from "./separator/Separator.svelte";
export {
    separatorStyles,
    type SeparatorStyleProps,
} from "./separator/separator.styles";

export { default as Badge } from "./badge/Badge.svelte";
export type {
    BadgeColor,
    BadgeProps,
    BadgeSize,
    BadgeVariant,
} from "./badge/Badge.svelte";
export {
    badgeStyles,
    type BadgeStyleProps,
} from "./badge/badge.styles";
