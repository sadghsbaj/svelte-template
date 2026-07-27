export type ShortcutPriorityPreset = "overlay" | "subview" | "root";

export type ShortcutPriority = ShortcutPriorityPreset | number;

export type ShortcutTriggerMode = "press" | "hold" | "release";

export type ShortcutAttachTrigger = "mount" | "focus" | "hover";

export interface ModifierState {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    cmd: boolean;
}

export interface ParsedComboStep {
    mainKey: string;
    wantCmd: boolean;
    wantCtrl: boolean;
    wantAlt: boolean;
    wantShift: boolean;
}

export interface ShortcutDescriptor {
    combo: string;
    action: (event: KeyboardEvent) => void;
    options?: ShortcutRegisterOptions;
}

export interface AppShortcutConfig {
    /** Whether the shortcut system is active (default: true) */
    enabled?: boolean;

    /** Whether to allow shortcuts inside input/textarea elements globally (default: false) */
    allowInInput?: boolean;

    /** Allowed priority presets or numeric values (default: all allowed) */
    allowedPriorities?: (ShortcutPriorityPreset | number)[];

    /** Active modal keybind mode (e.g. 'normal', 'visual', or null for standard mode) */
    activeMode?: string | null;

    /** Default sequence timeout in milliseconds (default: 1000) */
    sequenceTimeout?: number;
}

export interface ShortcutRegisterOptions {
    id?: string;
    priority?: ShortcutPriority;
    scope?: string;
    /** Modal keybind mode(s) in which this shortcut is active (e.g. 'normal' or ['normal', 'visual']) */
    mode?: string | string[];
    /** Allow shortcut execution when focused inside an input/textarea (default: false) */
    allowInInput?: boolean;
    /** Prevent default browser behavior e.g. e.preventDefault() (default: true) */
    preventDefault?: boolean;
    /** Time in milliseconds allowed between steps of a key sequence e.g. "g i" (default: 1000) */
    timeout?: number;
    /** Minimum duration in ms key must be held down before firing (e.g. 500 ms) */
    hold?: number;
    /** When to trigger shortcut: 'press' (keydown, default), 'hold' (after hold ms), or 'release' (keyup) */
    triggerOn?: ShortcutTriggerMode;
    /** Svelte 5 attachment trigger condition: 'mount' (default), 'focus' (on focus/blur), or 'hover' (on pointerenter/leave) */
    attachOn?: ShortcutAttachTrigger;
    /** Allow repeated execution when key is held down e.g. event.repeat = true (default: false) */
    repeat?: boolean;
    /** Match physical key location e.g. event.code ('KeyW', 'Slash') instead of logical event.key (default: false) */
    useCode?: boolean;
}

export interface ShortcutEntry {
    id: string;
    combo: string;
    sequenceSteps: string[];
    parsedSequenceSteps: ParsedComboStep[];
    action: (event: KeyboardEvent) => void;
    priority: number;
    scope: string;
    mode: string[] | null;
    allowInInput: boolean;
    preventDefault: boolean;
    timeout: number;
    hold?: number;
    triggerOn: ShortcutTriggerMode;
    attachOn?: ShortcutAttachTrigger;
    repeat: boolean;
    useCode: boolean;
    createdAt: number;
}

export const SHORTCUT_PRIORITY_MAP: Record<ShortcutPriorityPreset, number> = {
    overlay: 100,
    subview: 50,
    root: 10,
};
